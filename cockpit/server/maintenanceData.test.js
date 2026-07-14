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
