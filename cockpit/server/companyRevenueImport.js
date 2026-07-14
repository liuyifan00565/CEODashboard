/*
 更新时间: 2026-07-14 17:50:49 CST
 更新内容: 月度大数将南棠并入代理、特殊渠道用于半环；按权威工作表替换旧事实并清理订单明细。
*/
import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

import { nextId, queryRows } from './db.js';

const DETAIL_SHEET = '福客2026年4-6月业绩';
const CHANNELS = {
  online: '线上',
  agent: '代理',
  south: '华南线下',
  east: '华东线下',
};

function numberValue(value) {
  if (value == null || value === '' || value === '/') return 0;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function excelDate(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000).toISOString().slice(0, 10);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function yearMonth(value) {
  return excelDate(value)?.slice(0, 7) ?? null;
}

function matrix(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`工作簿缺少工作表：${sheetName}`);
  return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: null, raw: true });
}

function hashRow(row) {
  return createHash('sha256').update(JSON.stringify([
    row.year_month,
    row.record_level,
    row.channel_key,
    row.source_name_raw,
    row.gross_amount_yuan,
    row.refund_amount_yuan,
    row.source_sheet,
    row.source_row_no,
  ])).digest('hex');
}

function fact({ month, level, channelKey = null, sourceName = null, gross = 0, refund = 0, fileName, sheet, row }) {
  const parsed = {
    year_month: month,
    record_level: level,
    channel_key: channelKey,
    source_name_raw: sourceName,
    gross_amount_yuan: numberValue(gross),
    refund_amount_yuan: Math.abs(numberValue(refund)),
    source_workbook: fileName,
    source_sheet: sheet,
    source_row_no: row,
  };
  parsed.source_row_hash = hashRow(parsed);
  return parsed;
}

function addChannelFact(rows, args) {
  const gross = numberValue(args.gross);
  const refund = Math.abs(numberValue(args.refund));
  if (!gross && !refund) return;
  rows.push(fact({ ...args, level: 'channel', gross, refund }));
}

function detailedMonthFacts(row, rowIndex, fileName) {
  const month = yearMonth(row[0]);
  if (!month || !numberValue(row[14])) return [];
  const rows = [fact({
    month,
    level: 'total',
    gross: row[1],
    refund: Math.abs(numberValue(row[12])) + Math.abs(numberValue(row[13])),
    fileName,
    sheet: DETAIL_SHEET,
    row: rowIndex + 1,
  })];
  const common = { month, fileName, sheet: DETAIL_SHEET, row: rowIndex + 1 };
  addChannelFact(rows, { ...common, channelKey: 'online', sourceName: '直营', gross: row[2], refund: row[12] });
  addChannelFact(rows, {
    ...common,
    channelKey: 'agent',
    sourceName: '代理（含南棠）',
    gross: numberValue(row[3]) + numberValue(row[10]),
    refund: row[13],
  });
  addChannelFact(rows, { ...common, channelKey: 'south', sourceName: '其中线下：华南', gross: row[8] });
  addChannelFact(rows, { ...common, channelKey: 'east', sourceName: '其中线下：华东', gross: row[9] });
  if (numberValue(row[11])) {
    rows.push(fact({
      ...common,
      level: 'structure',
      sourceName: '特殊渠道',
      gross: row[11],
    }));
  }
  return rows;
}

export function parseCompanyRevenueWorkbook(buffer, fileName = 'company-revenue.xlsx') {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false, cellFormula: true });
  const detailed = matrix(workbook, DETAIL_SHEET);
  const facts = detailed.slice(2).flatMap((row, index) => detailedMonthFacts(row, index + 2, fileName));
  const totalRows = facts.filter((row) => row.record_level === 'total');
  return {
    facts,
    summary: {
      months: totalRows.map((row) => row.year_month).sort(),
      totalRows: totalRows.length,
      factRows: facts.length,
      netAmountYuan: totalRows.reduce((sum, row) => sum + row.gross_amount_yuan - row.refund_amount_yuan, 0),
      refundAmountYuan: totalRows.reduce((sum, row) => sum + row.refund_amount_yuan, 0),
    },
  };
}

async function ensureChannel(connection, key, name) {
  const existing = await queryRows(connection, 'SELECT channel_id FROM dim_channel WHERE channel_key = ? LIMIT 1', [key]);
  if (existing[0]) return existing[0].channel_id;
  const channelId = await nextId(connection, 'dim_channel', 'channel_id');
  await connection.execute('INSERT INTO dim_channel (channel_id, channel_key, channel_name, parent_id, is_enabled) VALUES (?, ?, ?, NULL, 1)', [channelId, key, name]);
  return channelId;
}

async function tableExists(connection, tableName) {
  const rows = await queryRows(connection, 'SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1', [tableName]);
  return rows.length > 0;
}

export async function persistCompanyRevenue(connection, parsed, { replaceWorkbook = true, clearOrderDetails = true } = {}) {
  const channelMap = new Map();
  await connection.beginTransaction();
  try {
    for (const [key, name] of Object.entries(CHANNELS)) {
      channelMap.set(key, await ensureChannel(connection, key, name));
    }
    const batchId = await nextId(connection, 'import_batch', 'batch_id');
    const workbookName = parsed.facts[0]?.source_workbook ?? 'unknown.xlsx';
    if (replaceWorkbook) {
      await connection.execute('DELETE FROM fact_revenue_channel_monthly WHERE source_sheet = ?', [DETAIL_SHEET]);
    }
    if (clearOrderDetails && await tableExists(connection, 'fact_revenue_order')) {
      await connection.execute('DELETE FROM fact_revenue_order');
      await connection.execute("DELETE FROM import_batch WHERE module = 'self-operated-revenue'");
    }
    await connection.execute("DELETE FROM biz_target_monthly WHERE target_amount_yuan = 0 AND target_opening_count = 0 AND target_order_count = 0");
    await connection.execute('INSERT INTO import_batch (batch_id, module, file_name, total_rows, success_rows, failed_rows, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())', [batchId, 'company-revenue-monthly', workbookName, parsed.facts.length, parsed.facts.length]);
    for (const row of parsed.facts) {
      await connection.execute(`
        INSERT INTO fact_revenue_channel_monthly (
          \`year_month\`, record_level, channel_id, source_name_raw, gross_amount_yuan,
          refund_amount_yuan, source_workbook, source_sheet, source_row_no, import_batch_id, source_row_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          channel_id = VALUES(channel_id), gross_amount_yuan = VALUES(gross_amount_yuan),
          refund_amount_yuan = VALUES(refund_amount_yuan), import_batch_id = VALUES(import_batch_id)
      `, [
        row.year_month, row.record_level, channelMap.get(row.channel_key) ?? null,
        row.source_name_raw, row.gross_amount_yuan, row.refund_amount_yuan,
        row.source_workbook, row.source_sheet, row.source_row_no, String(batchId), row.source_row_hash,
      ]);
    }
    await connection.commit();
    return { batchId, importedRows: parsed.facts.length, ...parsed.summary };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
