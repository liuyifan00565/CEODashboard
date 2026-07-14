/*
 更新时间: 2026-07-14 18:21:07 CST
 更新内容: 回归锁定 total 退款按渠道退款/回款占比精确分摊，缺失渠道清零且不覆盖既有成本。
*/
/*
 更新时间: 2026-07-14 18:03:20 CST
 更新内容: 回归锁定公司月度回款导入使用渠道自然键与数据库自增主键，不再通过 MAX(id)+1 抢号。
*/
/*
 更新时间: 2026-07-14 16:20:00 CST
 更新内容: 回归锁定仅解析 4-6 月明细表总额及现有四渠道，线下使用华南/华东细分列。
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { parseCompanyRevenueWorkbook, persistCompanyRevenue } from './companyRevenueImport.js';

const workbookPath = process.env.COMPANY_REVENUE_TEST_XLSX;

test('parses only the April-June detail sheet and its primary channel columns', { skip: !workbookPath }, () => {
  const parsed = parseCompanyRevenueWorkbook(fs.readFileSync(workbookPath), 'company.xlsx');
  assert.deepEqual(parsed.summary.months, ['2026-04', '2026-05', '2026-06']);
  assert.equal(parsed.summary.totalRows, 3);
  assert.equal(parsed.summary.factRows, 12);
  assert.equal(parsed.summary.netAmountYuan, 9541407.5);
  assert.equal(parsed.summary.refundAmountYuan, 170306.5);

  const aprilTotal = parsed.facts.find((row) => row.year_month === '2026-04' && row.record_level === 'total');
  assert.equal(aprilTotal.gross_amount_yuan, 2295804);
  assert.equal(aprilTotal.refund_amount_yuan, 32106.5);
  const juneChannels = parsed.facts.filter((row) => row.year_month === '2026-06' && row.record_level === 'channel');
  assert.deepEqual(juneChannels.map((row) => row.channel_key), ['online', 'agent', 'south', 'east']);
  assert.equal(juneChannels.find((row) => row.channel_key === 'south').gross_amount_yuan, 478333);
  assert.equal(juneChannels.find((row) => row.channel_key === 'east').gross_amount_yuan, 136600);
  assert.ok(parsed.facts.every((row) => row.source_sheet === '福客2026年4-6月业绩'));
  assert.ok(parsed.facts.every((row) => !['source', 'adjustment'].includes(row.record_level)));
});

test('uses database auto-increment IDs for company revenue channels and import batches', async () => {
  const statements = [];
  let nextChannelId = 3101;
  const connection = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    execute: async (sql, params = []) => {
      const normalized = sql.replace(/\s+/g, ' ').trim();
      statements.push({ sql: normalized, params });
      if (normalized.startsWith('SELECT channel_id FROM dim_channel')) return [[]];
      if (normalized.startsWith('INSERT INTO dim_channel')) return [{ insertId: nextChannelId++ }];
      if (normalized.startsWith('INSERT INTO import_batch')) return [{ insertId: 9201 }];
      return [{ affectedRows: 1 }];
    },
  };
  const base = {
    year_month: '2026-04',
    source_workbook: 'company.xlsx',
    source_sheet: '福客2026年4-6月业绩',
    source_row_no: 3,
  };
  const parsed = {
    facts: [
      { ...base, record_level: 'total', channel_key: null, source_name_raw: null, gross_amount_yuan: 100000, refund_amount_yuan: 1000, source_row_hash: 'a'.repeat(64) },
      { ...base, record_level: 'channel', channel_key: 'online', source_name_raw: '直营', gross_amount_yuan: 100000, refund_amount_yuan: 1000, source_row_hash: 'b'.repeat(64) },
    ],
    summary: { months: ['2026-04'], totalRows: 1, factRows: 2, netAmountYuan: 99000, refundAmountYuan: 1000 },
  };

  const result = await persistCompanyRevenue(connection, parsed);

  assert.equal(result.batchId, '9201');
  assert.equal(result.importedRows, 2);
  assert.equal(statements.some((entry) => /nextId|COALESCE\(MAX/i.test(entry.sql)), false);
  const channelInsert = statements.find((entry) => entry.sql.startsWith('INSERT INTO dim_channel'));
  assert.doesNotMatch(channelInsert.sql, /\(channel_id,/);
  assert.match(channelInsert.sql, /LAST_INSERT_ID\(channel_id\)/);
  const batchInsert = statements.find((entry) => entry.sql.startsWith('INSERT INTO import_batch'));
  assert.doesNotMatch(batchInsert.sql, /\(batch_id,/);
  const channelFact = statements.filter((entry) => entry.sql.startsWith('INSERT INTO fact_revenue_channel_monthly'))[1];
  assert.equal(channelFact.params[2], '3101');
  assert.equal(channelFact.params[9], '9201');
  assert.match(channelFact.sql, /source_workbook = VALUES\(source_workbook\)/);
  assert.match(channelFact.sql, /source_row_hash = VALUES\(source_row_hash\)/);
  const refundUpserts = statements.filter((entry) => entry.sql.startsWith('INSERT INTO biz_channel_cost_monthly'));
  assert.equal(refundUpserts.length, 4);
  assert.deepEqual(refundUpserts.map((entry) => entry.params), [
    ['2026-04', '3101', 1000],
    ['2026-04', '3102', 0],
    ['2026-04', '3103', 0],
    ['2026-04', '3104', 0],
  ]);
  assert.ok(refundUpserts.every((entry) => /VALUES \(\?, \?, 0, NULL, \?\)/.test(entry.sql)));
  assert.ok(refundUpserts.every((entry) => /ON DUPLICATE KEY UPDATE refund_amount_yuan = VALUES\(refund_amount_yuan\)$/.test(entry.sql)));
  assert.ok(refundUpserts.every((entry) => !/UPDATE operations_amount_yuan/.test(entry.sql)));
});

test('allocates authoritative total refunds by channel refund, then gross, with final-cent reconciliation', async () => {
  const statements = [];
  const channelIds = [4101, 4102, 4103, 4104];
  const connection = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    execute: async (sql, params = []) => {
      const normalized = sql.replace(/\s+/g, ' ').trim();
      statements.push({ sql: normalized, params });
      if (normalized.startsWith('SELECT channel_id FROM dim_channel')) return [[{ channel_id: channelIds.shift() }]];
      if (normalized.startsWith('INSERT INTO import_batch')) return [{ insertId: 9301 }];
      return [{ affectedRows: 1 }];
    },
  };
  const facts = [];
  for (const [month, useRefundWeights] of [['2026-05', true], ['2026-06', false]]) {
    facts.push({ year_month: month, record_level: 'total', channel_key: null, refund_amount_yuan: 10.01, gross_amount_yuan: 100, source_workbook: 'company.xlsx' });
    ['online', 'agent', 'south', 'east'].forEach((channelKey, index) => facts.push({
      year_month: month,
      record_level: 'channel',
      channel_key: channelKey,
      refund_amount_yuan: useRefundWeights ? index + 1 : 0,
      gross_amount_yuan: index + 1,
      source_workbook: 'company.xlsx',
    }));
  }

  await persistCompanyRevenue(connection, {
    facts,
    summary: { months: ['2026-05', '2026-06'], totalRows: 2, factRows: facts.length, netAmountYuan: 0, refundAmountYuan: 20.02 },
  });

  const refundParams = statements
    .filter((entry) => entry.sql.startsWith('INSERT INTO biz_channel_cost_monthly'))
    .map((entry) => entry.params);
  assert.deepEqual(refundParams, [
    ['2026-05', 4101, 1],
    ['2026-05', 4102, 2],
    ['2026-05', 4103, 3],
    ['2026-05', 4104, 4.01],
    ['2026-06', 4101, 1],
    ['2026-06', 4102, 2],
    ['2026-06', 4103, 3],
    ['2026-06', 4104, 4.01],
  ]);
});
