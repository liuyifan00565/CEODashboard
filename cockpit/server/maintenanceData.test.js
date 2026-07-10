/*
 Update time: 2026-07-10 17:09:42 CST
 Update content: 增加目标维护读接口旧库兼容回归，防止 fact_revenue_daily 缺列时维护页接口 500。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./maintenanceData.js', import.meta.url), 'utf8');

test('target maintenance reads old fact_revenue_daily schemas without missing-column SQL', () => {
  assert.match(source, /async function tableHasColumn/);
  assert.match(source, /tableHasColumn\(connection, 'fact_revenue_daily', 'department_id'\)/);
  assert.match(source, /tableHasColumn\(connection, 'fact_revenue_daily', 'actual_opening_count'\)/);
  assert.match(source, /'COALESCE\(r\.department_id, s\.department_id\)'/);
  assert.match(source, /: 's\.department_id';/);
  assert.match(source, /: '0';/);
  assert.match(source, /LEFT JOIN dim_staff s ON s\.staff_id = r\.staff_id/);
});
