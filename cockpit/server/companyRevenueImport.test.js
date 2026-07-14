/*
 更新时间: 2026-07-14 16:20:00 CST
 更新内容: 回归锁定仅解析 4-6 月明细表总额及现有四渠道，线下使用华南/华东细分列。
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { parseCompanyRevenueWorkbook } from './companyRevenueImport.js';

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
