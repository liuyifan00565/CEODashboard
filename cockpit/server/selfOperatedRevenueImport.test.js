/*
 更新时间: 2026-07-14 18:21:07 CST
 更新内容: 回归锁定自营导入按库内有日期订单重算月退款，仅更新退款而不覆盖成本字段。
*/
/*
 更新时间: 2026-07-14 17:09:11 CST
 更新内容: 回归锁定自营收入导入使用 MySQL insertId，不再通过 MAX(id)+1 生成主键。
*/
/*
 更新时间: 2026-07-14 13:18:00 CST
 更新内容: 覆盖自营收入四个月工作表解析、汇总渠道补齐、缺失日期保留及净回款对账。
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { parseSelfOperatedRevenueWorkbook, persistSelfOperatedRevenue } from './selfOperatedRevenueImport.js';

const workbookPath = process.env.SELF_OPERATED_REVENUE_TEST_XLSX;

test('parses the supplied self-operated workbook without duplicating the combined sheet', { skip: !workbookPath }, () => {
  const parsed = parseSelfOperatedRevenueWorkbook(fs.readFileSync(workbookPath), 'revenue.xlsx');
  assert.equal(parsed.summary.totalRows, 565);
  assert.equal(parsed.summary.datedRows, 558);
  assert.equal(parsed.summary.undatedRows, 7);
  assert.equal(parsed.summary.salesAmountYuan, 4033103.5);
  assert.equal(parsed.summary.refundAmountYuan, 16904.5);
  assert.equal(parsed.summary.netAmountYuan, 4016199);
  assert.deepEqual(parsed.summary.staffNames, ['张栩鸿', '林宝庆', '蔡心如', '郑晓敏', '闫文文', '陈妙敏', '黄俊伟', '黄李莉']);
  assert.equal(parsed.rows.find((row) => row.source_sheet === '2月')?.channel_name_raw, '微信社群');
  assert.equal(parsed.rows.find((row) => row.source_sheet === '2月')?.customer_name, 'i');
  assert.equal(parsed.rows.find((row) => row.source_sheet === '4月')?.other_note, null);
  assert.equal(parsed.rows.at(-1).sales_amount_yuan, -15800);
});

test('uses database auto-increment IDs for imported dimensions and batches', () => {
  const source = fs.readFileSync(new URL('./selfOperatedRevenueImport.js', import.meta.url), 'utf8');
  assert.match(source, /requiredInsertId\(insertResult, 'dim_staff'\)/);
  assert.match(source, /requiredInsertId\(insertResult, 'dim_channel_source'\)/);
  assert.match(source, /requiredInsertId\(insertResult, 'dim_product_version'\)/);
  assert.match(source, /requiredInsertId\(batchResult, 'import_batch'\)/);
  assert.doesNotMatch(source, /nextId|COALESCE\(MAX/);
  assert.doesNotMatch(source, /INSERT INTO import_batch \(batch_id/);
});

test('recalculates dated online order refunds in the database without overwriting maintained costs', async () => {
  const statements = [];
  const events = [];
  const connection = {
    beginTransaction: async () => events.push('begin'),
    commit: async () => events.push('commit'),
    rollback: async () => events.push('rollback'),
    execute: async (sql, params = []) => {
      const normalized = sql.replace(/\s+/g, ' ').trim();
      statements.push({ sql: normalized, params });
      if (normalized.includes("TABLE_NAME = 'fact_revenue_order'") && normalized.includes('INFORMATION_SCHEMA.COLUMNS')) {
        return [[
          { COLUMN_NAME: 'channel_source_id' },
          { COLUMN_NAME: 'net_amount_yuan' },
          { COLUMN_NAME: 'other_note' },
          { COLUMN_NAME: 'source_row_hash' },
        ]];
      }
      if (normalized.includes("TABLE_NAME = 'fact_revenue_order'") && normalized.includes('INFORMATION_SCHEMA.STATISTICS')) {
        return [[
          { INDEX_NAME: 'idx_revenue_order_channel_source' },
          { INDEX_NAME: 'uk_revenue_order_source_row_hash' },
        ]];
      }
      if (normalized.startsWith('SELECT channel_id FROM dim_channel')) return [[{ channel_id: 3001 }]];
      if (normalized.startsWith('SELECT department_id FROM dim_department')) return [[{ department_id: 2001 }]];
      if (normalized.startsWith('INSERT INTO import_batch')) return [{ insertId: 9401 }];
      if (normalized.startsWith("SELECT DATE_FORMAT(stat_date, '%Y-%m')")) {
        return [[
          { year_month: '2026-01', channel_id: 3001, refund_amount_yuan: '12.34' },
          { year_month: '2027-02', channel_id: 3001, refund_amount_yuan: '56.78' },
        ]];
      }
      return [{ affectedRows: 1 }];
    },
  };
  const row = {
    stat_date: '2026-01-15',
    sales_name_raw: null,
    channel_name_raw: null,
    version_name_raw: null,
    order_no: 'SO-1',
    customer_name: null,
    wechat_group_name: null,
    system_owner_name: null,
    sales_amount_yuan: 100,
    price_amount_yuan: 100,
    refund_amount_yuan: 12.34,
    order_type: 'self_operated',
    remark: null,
    other_note: null,
    source_workbook: 'self.xlsx',
    source_sheet: '1月',
    source_row_no: 2,
    source_row_hash: 'a'.repeat(64),
  };
  const undatedRow = { ...row, stat_date: null, order_no: 'SO-2', source_row_no: 3, source_row_hash: 'b'.repeat(64) };
  const nextYearRow = { ...row, stat_date: '2027-02-01', order_no: 'SO-3', source_row_no: 4, source_row_hash: 'c'.repeat(64) };
  const parsed = {
    rows: [row, undatedRow, nextYearRow],
    summary: {
      totalRows: 3,
      datedRows: 2,
      undatedRows: 1,
      salesAmountYuan: 300,
      refundAmountYuan: 37.02,
      netAmountYuan: 262.98,
      staffNames: [],
      sourceNames: [],
    },
  };

  const result = await persistSelfOperatedRevenue(connection, parsed, { replaceExisting: false });

  assert.equal(result.batchId, '9401');
  assert.deepEqual(events, ['begin', 'commit']);
  assert.equal(statements.some((entry) => /nextId|COALESCE\(MAX/i.test(entry.sql)), false);
  const reset = statements.find((entry) => entry.sql.startsWith('UPDATE biz_channel_cost_monthly'));
  assert.deepEqual(reset.params, [3001, '2026', '2027']);
  assert.match(reset.sql, /SET refund_amount_yuan = 0/);
  const aggregate = statements.find((entry) => entry.sql.startsWith("SELECT DATE_FORMAT(stat_date, '%Y-%m')"));
  assert.deepEqual(aggregate.params, [3001, '2026', '2027']);
  assert.match(aggregate.sql, /stat_date IS NOT NULL/);
  assert.match(aggregate.sql, /GROUP BY DATE_FORMAT\(stat_date, '%Y-%m'\), channel_id/);
  const refundUpserts = statements.filter((entry) => entry.sql.startsWith('INSERT INTO biz_channel_cost_monthly'));
  assert.deepEqual(refundUpserts.map((entry) => entry.params), [
    ['2026-01', 3001, '12.34'],
    ['2027-02', 3001, '56.78'],
  ]);
  assert.ok(refundUpserts.every((entry) => /VALUES \(\?, \?, 0, NULL, \?\)/.test(entry.sql)));
  assert.ok(refundUpserts.every((entry) => /ON DUPLICATE KEY UPDATE refund_amount_yuan = VALUES\(refund_amount_yuan\)$/.test(entry.sql)));
  assert.ok(refundUpserts.every((entry) => !/UPDATE operations_amount_yuan/.test(entry.sql)));
});
