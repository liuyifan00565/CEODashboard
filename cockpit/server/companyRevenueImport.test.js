/*
 更新时间: 2026-07-14 15:35:00 CST
 更新内容: 回归覆盖公司级月度业绩工作簿的总额、渠道、来源、退款、目标与差异对账。
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { parseCompanyRevenueWorkbook } from './companyRevenueImport.js';

const workbookPath = process.env.COMPANY_REVENUE_TEST_XLSX;

test('parses company revenue workbook without duplicating overlapping April and May summary rows', { skip: !workbookPath }, () => {
  const parsed = parseCompanyRevenueWorkbook(fs.readFileSync(workbookPath), 'company.xlsx');
  assert.deepEqual(parsed.summary.months, ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']);
  assert.equal(parsed.summary.totalRows, 6);
  assert.equal(parsed.summary.monthlyTargetRows, 9);
  assert.equal(parsed.annualTarget.target_amount_yuan, 60000000);
  assert.equal(parsed.summary.netAmountYuan, 16387244.5);
  assert.equal(parsed.summary.refundAmountYuan, 170306.5);
  assert.equal(parsed.summary.adjustmentAmountYuan, 39800);

  const aprilTotal = parsed.facts.find((row) => row.year_month === '2026-04' && row.record_level === 'total');
  assert.equal(aprilTotal.gross_amount_yuan, 2295804);
  assert.equal(aprilTotal.refund_amount_yuan, 32106.5);
  const juneSources = parsed.facts.filter((row) => row.year_month === '2026-06' && row.record_level === 'source');
  assert.deepEqual(juneSources.map((row) => row.source_name_raw), ['直营', '代理：犀牛', '代理：云栖', '代理：其他', '线下华南', '线下华东', '南棠渠道']);
});
