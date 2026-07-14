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

import { parseSelfOperatedRevenueWorkbook } from './selfOperatedRevenueImport.js';

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
