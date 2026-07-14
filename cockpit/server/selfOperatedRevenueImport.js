/*
 更新时间: 2026-07-14 13:18:00 CST
 更新内容: 新增自营收入 Excel 解析与事务导入，保留四个月原始字段并映射人员、版本、线索来源及导入审计。
*/
import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

import { nextId, queryRows } from './db.js';

const MONTH_SHEETS = ['1月', '2月', '3月', '4月'];
const COMBINED_SHEET = '1-4月';
const ONLINE_DEPARTMENT_CODE = 'online-sales';
const ONLINE_CHANNEL_KEY = 'online';

const DEMO_DATA_TABLES = [
  'fact_revenue_daily',
  'fact_sales_member_monthly',
  'fact_version_sales_daily',
  'fact_renewal_daily',
  'fact_opening_account_daily',
  'fact_compute_customer_daily',
  'fact_compute_resource_health_daily',
  'fact_compute_usage_daily',
  'fact_compute_usage_distribution_daily',
  'fact_compute_version_consumption_daily',
  'fact_delivery_order',
  'biz_target_monthly',
  'biz_channel_cost_monthly',
  'biz_labor_cost_monthly',
  'biz_compute_target_monthly',
  'biz_delivery_target_monthly',
];

const VERSION_RULES = [
  { test: /试用/, name: '试用版', key: 'trial', price: 299, type: '试用', trial: 1 },
  { test: /创世/, name: '创世版', key: 'chuangshi', price: 99800, type: '主版本', trial: 0 },
  { test: /至尊/, name: '至尊版', key: 'zhizun', price: 50000, type: '主版本', trial: 0 },
  { test: /卓越/, name: '卓越版', key: 'zhuoyue', price: 39800, type: '主版本', trial: 0 },
  { test: /启航/, name: '启航版', key: 'qihang', price: 16800, type: '主版本', trial: 0 },
  { test: /旗舰/, name: '旗舰版', key: 'qijian', price: 0, type: '主版本', trial: 0 },
  { test: /充值|算力/, name: '增购包', key: 'addon', price: 0, type: '增购包', trial: 0 },
  { test: /定制/, name: '定制版', key: 'custom', price: 0, type: '主版本', trial: 0 },
];

function normalizeText(value) {
  const text = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  return !text || text === '#N/A' || text === '#NAME?' ? null : text;
}

function normalizeSource(value) {
  const text = normalizeText(value);
  return text === '0' ? null : text;
}

function numericValue(value) {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function excelDate(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000);
    const year = date.getUTCFullYear();
    if (year >= 2000 && year <= 2100) return date.toISOString().slice(0, 10);
  }
  const text = normalizeText(value);
  if (!text) return null;
  const match = text.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (!match) return null;
  return `${match[1]}-${String(Number(match[2])).padStart(2, '0')}-${String(Number(match[3])).padStart(2, '0')}`;
}

function matrix(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`工作簿缺少工作表：${sheetName}`);
  return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: null, raw: true });
}

function usableNote(value) {
  const text = normalizeText(value);
  return text?.startsWith('=DISPIMG(') ? null : text;
}

function orderType(versionName, salesAmount, refundAmount) {
  if (refundAmount > 0 && salesAmount <= 0) return 'refund';
  if (/试用/.test(versionName ?? '')) return 'trial';
  if (/充值|算力/.test(versionName ?? '')) return 'recharge';
  return 'self_operated';
}

function rowHash(row) {
  return createHash('sha256').update(JSON.stringify([
    row.source_sheet,
    row.source_row_no,
    row.stat_date,
    row.sales_name_raw,
    row.order_no,
    row.sales_amount_yuan,
    row.refund_amount_yuan,
  ])).digest('hex');
}

function monthlyRow(sheetName, row, combinedRow, rowIndex, fileName) {
  const february = sheetName === '2月';
  const indexes = february
    ? { sales: 0, date: 1, customer: 2, group: 3, owner: 4, version: 5, order: 6, salesAmount: 7, price: 8, refund: 9, remark: 10, other: 11 }
    : { date: 0, sales: 1, customer: -1, group: 2, owner: 3, version: 4, order: 5, salesAmount: 6, price: 7, refund: 8, remark: 9, other: sheetName === '4月' ? -1 : 10 };
  const salesAmount = numericValue(row[indexes.salesAmount]);
  const refundAmount = numericValue(row[indexes.refund]);
  const versionName = normalizeText(row[indexes.version]);
  const parsed = {
    stat_date: excelDate(row[indexes.date]),
    sales_name_raw: normalizeText(row[indexes.sales]),
    channel_name_raw: normalizeSource(combinedRow?.[11]),
    version_name_raw: versionName,
    order_no: normalizeText(row[indexes.order]),
    customer_name: indexes.customer >= 0 ? normalizeText(row[indexes.customer]) : null,
    wechat_group_name: normalizeText(row[indexes.group]),
    system_owner_name: normalizeText(row[indexes.owner]),
    sales_amount_yuan: salesAmount,
    price_amount_yuan: numericValue(row[indexes.price]),
    refund_amount_yuan: refundAmount,
    order_type: orderType(versionName, salesAmount, refundAmount),
    remark: usableNote(row[indexes.remark]),
    other_note: indexes.other >= 0 ? usableNote(row[indexes.other]) : null,
    source_workbook: fileName,
    source_sheet: sheetName,
    source_row_no: rowIndex + 2,
  };
  parsed.source_row_hash = rowHash(parsed);
  return parsed;
}

export function parseSelfOperatedRevenueWorkbook(buffer, fileName = 'self-operated-revenue.xlsx') {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false, cellFormula: true });
  const combinedRows = matrix(workbook, COMBINED_SHEET).slice(1);
  const rows = [];
  let combinedOffset = 0;

  for (const sheetName of MONTH_SHEETS) {
    const sheetRows = matrix(workbook, sheetName).slice(1);
    sheetRows.forEach((row, index) => {
      rows.push(monthlyRow(sheetName, row, combinedRows[combinedOffset + index], index, fileName));
    });
    combinedOffset += sheetRows.length;
  }

  if (combinedOffset !== combinedRows.length) {
    throw new Error(`月度工作表共 ${combinedOffset} 行，但汇总表有 ${combinedRows.length} 行，无法安全对齐渠道字段`);
  }

  const datedRows = rows.filter((row) => row.stat_date);
  return {
    rows,
    summary: {
      totalRows: rows.length,
      datedRows: datedRows.length,
      undatedRows: rows.length - datedRows.length,
      salesAmountYuan: rows.reduce((sum, row) => sum + row.sales_amount_yuan, 0),
      refundAmountYuan: rows.reduce((sum, row) => sum + row.refund_amount_yuan, 0),
      netAmountYuan: rows.reduce((sum, row) => sum + row.sales_amount_yuan - row.refund_amount_yuan, 0),
      staffNames: [...new Set(rows.map((row) => row.sales_name_raw).filter(Boolean))].sort(),
      sourceNames: [...new Set(rows.map((row) => row.channel_name_raw).filter(Boolean))].sort(),
    },
  };
}

async function tableExists(connection, tableName) {
  const rows = await queryRows(connection, 'SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1', [tableName]);
  return rows.length > 0;
}

async function ensureImportColumns(connection) {
  const columns = await queryRows(connection, "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_order'");
  const names = new Set(columns.map((row) => row.COLUMN_NAME));
  if (!names.size) throw new Error('fact_revenue_order 不存在，请先执行 scripts/create_self_operated_revenue_tables.sql');
  await connection.execute('ALTER TABLE fact_revenue_order MODIFY COLUMN stat_date DATE NULL');
  if (!names.has('channel_source_id')) await connection.execute('ALTER TABLE fact_revenue_order ADD COLUMN channel_source_id BIGINT NULL AFTER channel_id');
  if (!names.has('net_amount_yuan')) await connection.execute('ALTER TABLE fact_revenue_order ADD COLUMN net_amount_yuan DECIMAL(18,2) GENERATED ALWAYS AS (sales_amount_yuan - refund_amount_yuan) STORED AFTER refund_amount_yuan');
  if (!names.has('other_note')) await connection.execute('ALTER TABLE fact_revenue_order ADD COLUMN other_note TEXT NULL AFTER remark');
  if (!names.has('source_row_hash')) await connection.execute('ALTER TABLE fact_revenue_order ADD COLUMN source_row_hash CHAR(64) NULL AFTER import_batch_id');
  const indexes = await queryRows(connection, "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_order'");
  const indexNames = new Set(indexes.map((row) => row.INDEX_NAME));
  if (!indexNames.has('idx_revenue_order_channel_source')) await connection.execute('ALTER TABLE fact_revenue_order ADD KEY idx_revenue_order_channel_source (channel_source_id)');
  if (!indexNames.has('uk_revenue_order_source_row_hash')) await connection.execute('ALTER TABLE fact_revenue_order ADD UNIQUE KEY uk_revenue_order_source_row_hash (source_row_hash)');
}

async function clearDemoData(connection) {
  const cleared = [];
  for (const table of DEMO_DATA_TABLES) {
    if (!(await tableExists(connection, table))) continue;
    const [result] = await connection.execute(`DELETE FROM \`${table}\``);
    cleared.push({ table, rows: result.affectedRows });
  }
  return cleared;
}

async function ensureStaff(connection, names) {
  const departmentRows = await queryRows(connection, 'SELECT department_id FROM dim_department WHERE department_code = ? LIMIT 1', [ONLINE_DEPARTMENT_CODE]);
  const departmentId = departmentRows[0]?.department_id ?? null;
  const mapping = new Map();
  for (const name of names) {
    const existing = await queryRows(connection, 'SELECT staff_id FROM dim_staff WHERE staff_name = ? LIMIT 1', [name]);
    if (existing[0]) {
      await connection.execute('UPDATE dim_staff SET department_id = COALESCE(department_id, ?), channel_key = ?, is_sales = 1, is_enabled = 1 WHERE staff_id = ?', [departmentId, ONLINE_CHANNEL_KEY, existing[0].staff_id]);
      mapping.set(name, existing[0].staff_id);
      continue;
    }
    const staffId = await nextId(connection, 'dim_staff', 'staff_id');
    const staffCode = `self-${createHash('sha1').update(name).digest('hex').slice(0, 12)}`;
    await connection.execute('INSERT INTO dim_staff (staff_id, staff_code, staff_name, department_id, channel_key, is_sales, is_enabled) VALUES (?, ?, ?, ?, ?, 1, 1)', [staffId, staffCode, name, departmentId, ONLINE_CHANNEL_KEY]);
    mapping.set(name, staffId);
  }
  return mapping;
}

async function ensureSources(connection, names, channelId) {
  const mapping = new Map();
  for (const name of names) {
    const existing = await queryRows(connection, 'SELECT source_id FROM dim_channel_source WHERE source_name = ? LIMIT 1', [name]);
    if (existing[0]) {
      await connection.execute('UPDATE dim_channel_source SET channel_id = ?, is_excluded = 0 WHERE source_id = ?', [channelId, existing[0].source_id]);
      mapping.set(name, existing[0].source_id);
      continue;
    }
    const sourceId = await nextId(connection, 'dim_channel_source', 'source_id');
    const sourceCode = `self-${createHash('sha1').update(name).digest('hex').slice(0, 12)}`;
    await connection.execute('INSERT INTO dim_channel_source (source_id, source_code, source_name, channel_id, is_excluded) VALUES (?, ?, ?, ?, 0)', [sourceId, sourceCode, name, channelId]);
    mapping.set(name, sourceId);
  }
  return mapping;
}

function canonicalVersion(rawName) {
  return VERSION_RULES.find((rule) => rule.test.test(rawName ?? '')) ?? null;
}

async function ensureVersions(connection, rawNames) {
  const mapping = new Map();
  for (const rawName of rawNames) {
    const canonical = canonicalVersion(rawName);
    if (!canonical) continue;
    let existing = await queryRows(connection, 'SELECT version_id FROM dim_product_version WHERE version_key = ? OR version_name = ? LIMIT 1', [canonical.key, canonical.name]);
    if (!existing[0]) {
      const versionId = await nextId(connection, 'dim_product_version', 'version_id');
      await connection.execute('INSERT INTO dim_product_version (version_id, version_key, version_name, standard_price_yuan, version_type, sort_order, is_trial, is_enabled) VALUES (?, ?, ?, ?, ?, 99, ?, 1)', [versionId, canonical.key, canonical.name, canonical.price, canonical.type, canonical.trial]);
      existing = [{ version_id: versionId }];
    }
    mapping.set(rawName, existing[0].version_id);
  }
  return mapping;
}

export async function persistSelfOperatedRevenue(connection, parsed, { replaceExisting = true, replaceDemoData = false } = {}) {
  await ensureImportColumns(connection);
  await connection.beginTransaction();
  try {
    const clearedDemoTables = replaceDemoData ? await clearDemoData(connection) : [];
    if (replaceExisting) await connection.execute('DELETE FROM fact_revenue_order');

    const channelRows = await queryRows(connection, 'SELECT channel_id FROM dim_channel WHERE channel_key = ? AND is_enabled = 1 LIMIT 1', [ONLINE_CHANNEL_KEY]);
    const channelId = channelRows[0]?.channel_id ?? null;
    await connection.execute("DELETE FROM dim_channel_source WHERE source_name IN ('0', '#N/A') AND source_code LIKE 'self-%'");
    const staffMap = await ensureStaff(connection, parsed.summary.staffNames);
    const sourceMap = await ensureSources(connection, parsed.summary.sourceNames, channelId);
    const versionMap = await ensureVersions(connection, [...new Set(parsed.rows.map((row) => row.version_name_raw).filter(Boolean))]);
    const batchId = await nextId(connection, 'import_batch', 'batch_id');

    await connection.execute('INSERT INTO import_batch (batch_id, module, file_name, total_rows, success_rows, failed_rows, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())', [batchId, 'self-operated-revenue', parsed.rows[0]?.source_workbook ?? 'unknown.xlsx', parsed.rows.length, parsed.rows.length]);

    for (const row of parsed.rows) {
      await connection.execute(`
        INSERT INTO fact_revenue_order (
          stat_date, staff_id, sales_name_raw, channel_id, channel_source_id, channel_name_raw,
          version_id, version_name_raw, order_no, customer_name, wechat_group_name, system_owner_name,
          sales_amount_yuan, price_amount_yuan, refund_amount_yuan, order_type, remark, other_note,
          source_workbook, source_sheet, source_row_no, import_batch_id, source_row_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          stat_date = VALUES(stat_date), staff_id = VALUES(staff_id), channel_id = VALUES(channel_id),
          channel_source_id = VALUES(channel_source_id), version_id = VALUES(version_id),
          customer_name = VALUES(customer_name), wechat_group_name = VALUES(wechat_group_name),
          system_owner_name = VALUES(system_owner_name), sales_amount_yuan = VALUES(sales_amount_yuan),
          price_amount_yuan = VALUES(price_amount_yuan), refund_amount_yuan = VALUES(refund_amount_yuan),
          order_type = VALUES(order_type), remark = VALUES(remark), other_note = VALUES(other_note),
          import_batch_id = VALUES(import_batch_id)
      `, [
        row.stat_date, staffMap.get(row.sales_name_raw) ?? null, row.sales_name_raw, channelId,
        sourceMap.get(row.channel_name_raw) ?? null, row.channel_name_raw,
        versionMap.get(row.version_name_raw) ?? null, row.version_name_raw, row.order_no,
        row.customer_name, row.wechat_group_name, row.system_owner_name,
        row.sales_amount_yuan, row.price_amount_yuan, row.refund_amount_yuan, row.order_type,
        row.remark, row.other_note, row.source_workbook, row.source_sheet, row.source_row_no,
        String(batchId), row.source_row_hash,
      ]);
    }

    await connection.commit();
    return { batchId, importedRows: parsed.rows.length, clearedDemoTables, ...parsed.summary };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
