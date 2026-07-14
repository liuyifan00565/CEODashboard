/*
 更新时间: 2026-07-14 15:35:00 CST
 更新内容: 新增公司级 2026 年业绩汇总解析与事务导入，按总额、渠道、来源三层保存并同步年度/月度目标。
*/
import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

import { nextId, queryRows } from './db.js';

const SUMMARY_SHEET = 'Sheet1';
const DETAIL_SHEET = '福客2026年4-6月业绩';
const CHANNELS = {
  online: '线上',
  agent: '代理',
  south: '华南线下',
  east: '华东线下',
  nantang: '南棠渠道',
  special: '特殊渠道',
  xicheng: '玺承',
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

function addSourceFact(rows, args) {
  const gross = numberValue(args.gross);
  const refund = Math.abs(numberValue(args.refund));
  if (!gross && !refund) return;
  rows.push(fact({ ...args, level: 'source', gross, refund }));
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
  addChannelFact(rows, { ...common, channelKey: 'agent', sourceName: '代理', gross: row[3], refund: row[13] });
  addChannelFact(rows, { ...common, channelKey: 'south', sourceName: '线下华南', gross: row[8] });
  addChannelFact(rows, { ...common, channelKey: 'east', sourceName: '线下华东', gross: row[9] });
  addChannelFact(rows, { ...common, channelKey: 'nantang', sourceName: '南棠渠道', gross: row[10] });
  addChannelFact(rows, { ...common, channelKey: 'special', sourceName: '特殊渠道', gross: row[11] });

  addSourceFact(rows, { ...common, channelKey: 'online', sourceName: '直营', gross: row[2], refund: row[12] });
  const agentSources = [
    ['代理：犀牛', row[4]],
    ['代理：云栖', row[5]],
    ['代理：其他', row[6]],
  ];
  if (agentSources.some(([, value]) => numberValue(value))) {
    agentSources.forEach(([sourceName, gross]) => addSourceFact(rows, { ...common, channelKey: 'agent', sourceName, gross }));
  } else {
    addSourceFact(rows, { ...common, channelKey: 'agent', sourceName: '代理', gross: row[3], refund: row[13] });
  }
  addSourceFact(rows, { ...common, channelKey: 'south', sourceName: '线下华南', gross: row[8] });
  addSourceFact(rows, { ...common, channelKey: 'east', sourceName: '线下华东', gross: row[9] });
  addSourceFact(rows, { ...common, channelKey: 'nantang', sourceName: '南棠渠道', gross: row[10] });
  addSourceFact(rows, { ...common, channelKey: 'special', sourceName: '特殊渠道', gross: row[11] });

  const channelNet = rows
    .filter((item) => item.record_level === 'channel')
    .reduce((sum, item) => sum + item.gross_amount_yuan - item.refund_amount_yuan, 0);
  const totalNet = numberValue(row[14]);
  if (Math.abs(totalNet - channelNet) >= 0.01) {
    rows.push(fact({ ...common, level: 'adjustment', sourceName: '未分配差异', gross: totalNet - channelNet }));
  }
  return rows;
}

export function parseCompanyRevenueWorkbook(buffer, fileName = 'company-revenue.xlsx') {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false, cellFormula: true });
  const summary = matrix(workbook, SUMMARY_SHEET);
  const detailed = matrix(workbook, DETAIL_SHEET);
  const detailFacts = detailed.slice(2).flatMap((row, index) => detailedMonthFacts(row, index + 2, fileName));
  const detailedMonths = new Set(detailFacts.filter((row) => row.record_level === 'total').map((row) => row.year_month));
  const facts = [];

  summary.slice(3, 15).forEach((row, index) => {
    const month = yearMonth(row[0]);
    const actual = numberValue(row[2]);
    if (!month || !actual || detailedMonths.has(month)) return;
    const common = { month, fileName, sheet: SUMMARY_SHEET, row: index + 4 };
    facts.push(fact({ ...common, level: 'total', gross: actual }));
    addChannelFact(facts, { ...common, channelKey: 'xicheng', sourceName: '玺承', gross: row[4] });
    addChannelFact(facts, { ...common, channelKey: 'online', sourceName: '直营', gross: row[5] });
    addChannelFact(facts, { ...common, channelKey: 'agent', sourceName: '代理', gross: row[6] });
    addChannelFact(facts, { ...common, channelKey: 'south', sourceName: '线下直营', gross: row[7] });
    addChannelFact(facts, { ...common, channelKey: 'nantang', sourceName: '南棠渠道', gross: row[8] });
    addChannelFact(facts, { ...common, channelKey: 'special', sourceName: '特殊渠道', gross: row[9] });
    const channelNet = facts
      .filter((item) => item.year_month === month && item.record_level === 'channel')
      .reduce((sum, item) => sum + item.gross_amount_yuan - item.refund_amount_yuan, 0);
    if (Math.abs(actual - channelNet) >= 0.01) {
      facts.push(fact({ ...common, level: 'adjustment', sourceName: '未分配差异', gross: actual - channelNet }));
    }
  });
  facts.push(...detailFacts);

  const monthlyTargets = summary.slice(3, 15).map((row, index) => ({
    year_month: yearMonth(row[0]),
    target_amount_yuan: numberValue(row[1]),
    source_sheet: SUMMARY_SHEET,
    source_row_no: index + 4,
  })).filter((row) => row.year_month && row.target_amount_yuan > 0);
  const totalRows = facts.filter((row) => row.record_level === 'total');
  return {
    facts,
    monthlyTargets,
    annualTarget: {
      target_year: '2026',
      target_amount_yuan: numberValue(summary[1]?.[1]),
      source_sheet: SUMMARY_SHEET,
      source_cell: 'B2',
    },
    summary: {
      months: totalRows.map((row) => row.year_month).sort(),
      totalRows: totalRows.length,
      factRows: facts.length,
      monthlyTargetRows: monthlyTargets.length,
      netAmountYuan: totalRows.reduce((sum, row) => sum + row.gross_amount_yuan - row.refund_amount_yuan, 0),
      refundAmountYuan: totalRows.reduce((sum, row) => sum + row.refund_amount_yuan, 0),
      adjustmentAmountYuan: facts.filter((row) => row.record_level === 'adjustment').reduce((sum, row) => sum + row.gross_amount_yuan, 0),
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

export async function persistCompanyRevenue(connection, parsed, { replaceWorkbook = true } = {}) {
  const channelMap = new Map();
  await connection.beginTransaction();
  try {
    for (const [key, name] of Object.entries(CHANNELS)) {
      channelMap.set(key, await ensureChannel(connection, key, name));
    }
    const batchId = await nextId(connection, 'import_batch', 'batch_id');
    const workbookName = parsed.facts[0]?.source_workbook ?? 'unknown.xlsx';
    if (replaceWorkbook) {
      await connection.execute('DELETE FROM fact_revenue_channel_monthly WHERE source_workbook = ?', [workbookName]);
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
    const headquarters = await queryRows(connection, "SELECT department_id FROM dim_department WHERE department_code = 'headquarters' LIMIT 1");
    const departmentId = headquarters[0]?.department_id ?? null;
    for (const target of parsed.monthlyTargets) {
      const existing = await queryRows(connection, 'SELECT target_id FROM biz_target_monthly WHERE `year_month` = ? AND department_id <=> ? AND staff_id IS NULL AND channel_id IS NULL AND version_id IS NULL LIMIT 1', [target.year_month, departmentId]);
      if (existing[0]) {
        await connection.execute('UPDATE biz_target_monthly SET target_amount_yuan = ? WHERE target_id = ?', [target.target_amount_yuan, existing[0].target_id]);
      } else {
        const targetId = await nextId(connection, 'biz_target_monthly', 'target_id');
        await connection.execute('INSERT INTO biz_target_monthly (target_id, `year_month`, department_id, staff_id, channel_id, version_id, target_amount_yuan, target_opening_count, target_order_count) VALUES (?, ?, ?, NULL, NULL, NULL, ?, 0, 0)', [targetId, target.year_month, departmentId, target.target_amount_yuan]);
      }
    }
    await connection.execute(`
      INSERT INTO biz_target_annual (target_year, target_amount_yuan, source_workbook, source_sheet, source_cell)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE target_amount_yuan = VALUES(target_amount_yuan), source_workbook = VALUES(source_workbook), source_sheet = VALUES(source_sheet), source_cell = VALUES(source_cell)
    `, [parsed.annualTarget.target_year, parsed.annualTarget.target_amount_yuan, workbookName, parsed.annualTarget.source_sheet, parsed.annualTarget.source_cell]);
    await connection.commit();
    return { batchId, importedRows: parsed.facts.length, ...parsed.summary, annualTargetYuan: parsed.annualTarget.target_amount_yuan };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
