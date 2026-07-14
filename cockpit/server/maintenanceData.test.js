/*
 更新时间: 2026-07-14 18:12:08 CST
 更新内容: 回归锁定成本维护以全键合并成本表与统一退款视图，并保留人力成本 NULL 的未配置语义。
*/
/*
 更新时间: 2026-07-14 17:09:11 CST
 更新内容: 回归锁定目标与成本维护只读取统一回款视图，不再由销售月表覆盖日报事实。
*/
/*
 Update time: 2026-07-10 17:09:42 CST
 Update content: 增加目标维护读接口旧库兼容回归，防止 fact_revenue_daily 缺列时维护页接口 500。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./maintenanceData.js', import.meta.url), 'utf8');

test('target and cost maintenance read only the canonical gross revenue view', () => {
  assert.equal((source.match(/FROM v_revenue_gross_canonical/g) ?? []).length, 2);
  assert.doesNotMatch(source, /FROM fact_revenue_daily/);
  assert.doesNotMatch(source, /FROM fact_sales_member_monthly/);
  assert.doesNotMatch(source, /async function tableHasColumn/);
});

test('cost maintenance full-key merges canonical refunds without coalescing labor configuration', () => {
  assert.match(source, /FROM v_revenue_refund_canonical/);
  assert.match(source, /cost_refund_keys AS \([\s\S]*?FROM biz_channel_cost_monthly[\s\S]*?UNION[\s\S]*?FROM refund_by_channel/);
  assert.match(source, /c\.labor_amount_yuan/);
  assert.match(source, /c\.channel_id <=> k\.channel_id/);
  assert.match(source, /r\.channel_id <=> k\.channel_id/);
  assert.doesNotMatch(source, /COALESCE\(c\.labor_amount_yuan/);
  assert.doesNotMatch(source, /operations_amount_yuan, labor_amount_yuan, refund_amount_yuan FROM biz_channel_cost_monthly/);
});
