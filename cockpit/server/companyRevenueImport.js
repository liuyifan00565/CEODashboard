/*
 更新时间: 2026-07-14 19:06:34 CST
 更新内容: 公司月度导入默认保留订单级事实和自营导入批次，统一视图负责年度选源，避免导入月度总额时误删跨年人员与成交来源下钻。
*/
/*
 更新时间: 2026-07-14 19:02:00 CST
 更新内容: 公司月度导入保留自增主键、total 退款分摊和审计刷新，并纳入南棠归并、特殊渠道结构项及权威工作表切换逻辑。
*/
import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

import { queryRows } from './db.js';

const DETAIL_SHEET = '福客2026年4-6月业绩';
const CHANNELS = {
  online: '线上',
  agent: '代理',
  south: '华南线下',
  east: '华东线下',
};
const CHANNEL_KEYS = Object.keys(CHANNELS);

function requiredInsertId(result, tableName) {
  const id = String(result?.insertId ?? '');
  if (!/^[1-9]\d*$/.test(id)) throw new Error(`${tableName} 未返回有效自增主键`);
  return id;
}

function toCents(value) {
  return Math.round(numberValue(value) * 100);
}

function allocateRefundCents(totalCents, weights) {
  const positiveWeights = weights.map((weight) => Math.max(0, numberValue(weight)));
  const totalWeight = positiveWeights.reduce((sum, weight) => sum + weight, 0);
  let allocated = 0;
  return positiveWeights.map((weight, index) => {
    if (index === positiveWeights.length - 1) return totalCents - allocated;
    const amount = totalWeight > 0 ? Math.round(totalCents * weight / totalWeight) : 0;
    allocated += amount;
    return amount;
  });
}

function companyRefundAllocations(facts) {
  const months = new Map();
  for (const row of facts) {
    if (!row?.year_month) continue;
    const month = months.get(row.year_month) ?? {
      totalRefundCents: 0,
      channels: new Map(CHANNEL_KEYS.map((key) => [key, { gross: 0, refund: 0 }])),
    };
    if (row.record_level === 'total') {
      month.totalRefundCents += Math.abs(toCents(row.refund_amount_yuan));
      months.set(row.year_month, month);
      continue;
    }
    if (row.record_level !== 'channel' || !month.channels.has(row.channel_key)) continue;
    const channel = month.channels.get(row.channel_key);
    channel.gross += Math.max(0, numberValue(row.gross_amount_yuan));
    channel.refund += Math.max(0, numberValue(row.refund_amount_yuan));
    months.set(row.year_month, month);
  }

  return [...months.entries()].sort(([left], [right]) => left.localeCompare(right)).flatMap(([yearMonth, month]) => {
    const channels = CHANNEL_KEYS.map((key) => month.channels.get(key));
    const refundTotal = channels.reduce((sum, channel) => sum + channel.refund, 0);
    const weights = channels.map((channel) => refundTotal > 0 ? channel.refund : channel.gross);
    const cents = allocateRefundCents(month.totalRefundCents, weights);
    return CHANNEL_KEYS.map((channelKey, index) => ({ yearMonth, channelKey, refundCents: cents[index] }));
  });
}

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
  const [result] = await connection.execute(
    `INSERT INTO dim_channel (channel_key, channel_name, parent_id, is_enabled)
     VALUES (?, ?, NULL, 1)
     ON DUPLICATE KEY UPDATE
       channel_id = LAST_INSERT_ID(channel_id),
       channel_name = VALUES(channel_name),
       is_enabled = 1`,
    [key, name],
  );
  return requiredInsertId(result, 'dim_channel');
}

async function tableExists(connection, tableName) {
  const rows = await queryRows(connection, 'SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1', [tableName]);
  return rows.length > 0;
}

export async function persistCompanyRevenue(connection, parsed, { replaceWorkbook = true, clearOrderDetails = false } = {}) {
  const channelMap = new Map();
  await connection.beginTransaction();
  try {
    for (const [key, name] of Object.entries(CHANNELS)) {
      channelMap.set(key, await ensureChannel(connection, key, name));
    }
    const workbookName = parsed.facts[0]?.source_workbook ?? 'unknown.xlsx';
    if (replaceWorkbook) {
      await connection.execute('DELETE FROM fact_revenue_channel_monthly WHERE source_sheet = ?', [DETAIL_SHEET]);
    }
    if (clearOrderDetails && await tableExists(connection, 'fact_revenue_order')) {
      await connection.execute('DELETE FROM fact_revenue_order');
      await connection.execute("DELETE FROM import_batch WHERE module = 'self-operated-revenue'");
    }
    await connection.execute("DELETE FROM biz_target_monthly WHERE target_amount_yuan = 0 AND target_opening_count = 0 AND target_order_count = 0");
    const [batchResult] = await connection.execute(
      'INSERT INTO import_batch (module, file_name, total_rows, success_rows, failed_rows, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
      ['company-revenue-monthly', workbookName, parsed.facts.length, parsed.facts.length],
    );
    const batchId = requiredInsertId(batchResult, 'import_batch');
    for (const row of parsed.facts) {
      await connection.execute(`
        INSERT INTO fact_revenue_channel_monthly (
          \`year_month\`, record_level, channel_id, source_name_raw, gross_amount_yuan,
          refund_amount_yuan, source_workbook, source_sheet, source_row_no, import_batch_id, source_row_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          channel_id = VALUES(channel_id), source_name_raw = VALUES(source_name_raw),
          gross_amount_yuan = VALUES(gross_amount_yuan), refund_amount_yuan = VALUES(refund_amount_yuan),
          source_workbook = VALUES(source_workbook), source_sheet = VALUES(source_sheet),
          source_row_no = VALUES(source_row_no), import_batch_id = VALUES(import_batch_id),
          source_row_hash = VALUES(source_row_hash)
      `, [
        row.year_month, row.record_level, channelMap.get(row.channel_key) ?? null,
        row.source_name_raw, row.gross_amount_yuan, row.refund_amount_yuan,
        row.source_workbook, row.source_sheet, row.source_row_no, String(batchId), row.source_row_hash,
      ]);
    }
    for (const row of companyRefundAllocations(parsed.facts)) {
      await connection.execute(
        `INSERT INTO biz_channel_cost_monthly (
           \`year_month\`, channel_id, operations_amount_yuan, labor_amount_yuan, refund_amount_yuan
         ) VALUES (?, ?, 0, NULL, ?)
         ON DUPLICATE KEY UPDATE refund_amount_yuan = VALUES(refund_amount_yuan)`,
        [row.yearMonth, channelMap.get(row.channelKey), row.refundCents / 100],
      );
    }
    await connection.commit();
    return { batchId, importedRows: parsed.facts.length, ...parsed.summary };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
