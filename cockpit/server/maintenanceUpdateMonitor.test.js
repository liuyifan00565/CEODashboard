/*
 更新时间: 2026-07-14 10:25:00 CST
 更新内容: 新增数据更新看板后端快照测试，覆盖按业务日期/月判断每日到数状态。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildUpdateMonitorSnapshot } from './maintenanceUpdateMonitor.js';

function makeConnection(responsesByTable = {}) {
  const calls = [];
  return {
    calls,
    async execute(sql, params = []) {
      const tableMatch = String(sql).match(/FROM\s+`?([a-zA-Z0-9_]+)`?/i);
      const table = tableMatch?.[1] || '';
      calls.push({ sql: String(sql), params, table });
      const response = responsesByTable[table];
      if (response instanceof Error) throw response;
      return [[response ?? { latest_value: null, row_count: 0 }]];
    },
  };
}

test('buildUpdateMonitorSnapshot maps daily, monthly, empty and error groups', async () => {
  const connection = makeConnection({
    fact_revenue_daily: { latest_value: '2026-08-14', row_count: 12 },
    biz_target_monthly: { latest_value: '2026-08', row_count: 4 },
    fact_opening_account_daily: { latest_value: '2026-07-12', row_count: 8 },
    fact_delivery_order: { latest_value: null, row_count: 0 },
    fact_renewal_daily: Object.assign(new Error('table missing'), { code: 'ER_NO_SUCH_TABLE' }),
  });

  const snapshot = await buildUpdateMonitorSnapshot(connection, {
    year: 2026,
    now: new Date('2026-07-14T02:00:00Z'),
  });

  assert.equal(snapshot.today, '2026-07-14');
  assert.equal(snapshot.currentMonth, '2026-07');
  assert.equal(snapshot.groups.find((group) => group.key === 'revenue').lagDays, 0);
  assert.equal(snapshot.groups.find((group) => group.key === 'target').lagDays, 0);
  assert.equal(snapshot.groups.find((group) => group.key === 'revenue').status, 'updated');
  assert.equal(snapshot.groups.find((group) => group.key === 'target').status, 'current_month');
  assert.equal(snapshot.groups.find((group) => group.key === 'opening').status, 'stale');
  assert.equal(snapshot.groups.find((group) => group.key === 'delivery').status, 'empty');
  assert.equal(snapshot.groups.find((group) => group.key === 'renewal').status, 'error');
  assert.equal(snapshot.summary.updated, 1);
  assert.equal(snapshot.summary.currentMonth, 1);
  assert.equal(snapshot.summary.stale, 1);
  assert.equal(snapshot.summary.empty, 6);
  assert.equal(snapshot.summary.error, 1);
});

test('buildUpdateMonitorSnapshot scopes row counts to the selected year', async () => {
  const connection = makeConnection({
    fact_revenue_daily: { latest_value: '2026-07-14', row_count: 12 },
  });

  await buildUpdateMonitorSnapshot(connection, {
    year: 2026,
    now: new Date('2026-07-14T02:00:00Z'),
  });

  const revenueCall = connection.calls.find((call) => call.table === 'fact_revenue_daily');
  assert.deepEqual(revenueCall.params, ['2026-01-01', '2027-01-01']);
});
