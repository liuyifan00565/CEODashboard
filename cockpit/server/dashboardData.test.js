/*
 更新时间: 2026-07-07 11:52:53 CST
 更新内容: 增加日级回款事实表优先级测试，防止导入完整数据库后年度累计仍只取销售人员月表。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 增加真实数据库 dashboard snapshot 映射测试，要求首页 KPI、渠道、成本和年度节奏来自 MySQL 行。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mapDashboardRowsToSnapshot } from './dashboardData.js';

test('maps mysql dashboard rows into strict live dashboard snapshot', () => {
  const snapshot = mapDashboardRowsToSnapshot({
    latestMonth: '2026-06',
    channels: [
      { channel_id: 3001, channel_key: 'online', channel_name: '线上' },
      { channel_id: 3002, channel_key: 'south', channel_name: '华南线下', zone_name: '华南战区' },
      { channel_id: 3003, channel_key: 'east', channel_name: '华东线下', zone_name: '华东战区' },
      { channel_id: 3004, channel_key: 'agent', channel_name: '代理' },
    ],
    salesMemberMonthly: [
      { year_month: '2026-06', staff_id: 2001, staff_name: '王丽英', channel_key: 'online', channel_name: '线上', recovered_wan: 136.8, target_wan: 128 },
      { year_month: '2026-06', staff_id: 2002, staff_name: '李思雨', channel_key: 'online', channel_name: '线上', recovered_wan: 107.2, target_wan: 112 },
      { year_month: '2026-06', staff_id: 2003, staff_name: '杨磊', channel_key: 'south', channel_name: '华南线下', recovered_wan: 98, target_wan: 110 },
      { year_month: '2026-06', staff_id: 2004, staff_name: '马骏', channel_key: 'east', channel_name: '华东线下', recovered_wan: 86, target_wan: 120 },
      { year_month: '2026-06', staff_id: 2005, staff_name: '南唐代理', channel_key: 'agent', channel_name: '代理', recovered_wan: 92, target_wan: 110 },
    ],
    monthlyTargets: [
      { year_month: '2026-01', target_wan: 315.7, opening_target: 24, order_target: 60 },
      { year_month: '2026-02', target_wan: 338.8, opening_target: 27, order_target: 66 },
      { year_month: '2026-03', target_wan: 369.6, opening_target: 29, order_target: 72 },
      { year_month: '2026-04', target_wan: 392.7, opening_target: 30, order_target: 76 },
      { year_month: '2026-05', target_wan: 361.9, opening_target: 28, order_target: 69 },
      { year_month: '2026-06', target_wan: 415.8, opening_target: 31, order_target: 80 },
      { year_month: '2026-07', target_wan: 431.2, opening_target: 33, order_target: 82 },
      { year_month: '2026-08', target_wan: 400.4, opening_target: 31, order_target: 77 },
      { year_month: '2026-09', target_wan: 423.5, opening_target: 32, order_target: 82 },
      { year_month: '2026-10', target_wan: 454.3, opening_target: 35, order_target: 87 },
      { year_month: '2026-11', target_wan: 469.7, opening_target: 35, order_target: 90 },
      { year_month: '2026-12', target_wan: 500.5, opening_target: 39, order_target: 97 },
    ],
    channelCosts: [
      { channel_key: 'online', investment_wan: 31.11 },
      { channel_key: 'south', investment_wan: 19.31 },
      { channel_key: 'east', investment_wan: 17.7 },
      { channel_key: 'agent', investment_wan: 9.12 },
    ],
    laborCosts: [
      { cost_type: 'sales', amount_wan: 54.41 },
      { cost_type: 'marketing', amount_wan: 27.21 },
    ],
    versionSales: [
      { version_key: 'qihang', version_name: '启航版', standard_price_yuan: 16800, units: 36, recovered_wan: 98, mom_rate: 8.2, channel_key: 'online' },
      { version_key: 'zhuoyue', version_name: '卓越版', standard_price_yuan: 39800, units: 27, recovered_wan: 136, mom_rate: 12.4, channel_key: 'south' },
    ],
    renewalRows: [
      { channel_key: 'online', channel_name: '线上', version_key: 'qihang', due_count: 20, renewed_count: 18, renewal_wan: 88, prev_due_count: 18, prev_renewed_count: 15 },
    ],
    openingRows: [
      { metric: 'monthOpenings', value: 325, previous: 200 },
      { metric: 'todayOpenings', value: 12, previous: 10 },
    ],
  });

  assert.equal(snapshot.source, 'mysql');
  assert.deepEqual(snapshot.meta, {
    monthLabel: '2026年6月',
    annualTarget: 4874,
  });
  assert.equal(snapshot.kpi.monthRecovered, 520);
  assert.equal(snapshot.kpi.monthTarget, 580);
  assert.equal(snapshot.kpi.yearRecovered, 520);
  assert.equal(snapshot.kpi.yearTarget, 4874);
  assert.equal(snapshot.kpi.totalCost, 159);
  assert.equal(snapshot.kpi.adCost, 77);
  assert.equal(snapshot.kpi.laborCost, 82);
  assert.equal(snapshot.kpiDerived.monthCompletion, 89.7);
  assert.equal(snapshot.kpiDerived.yearCompletion, 10.7);
  assert.equal(snapshot.operatingOverviewMetrics.remainingMonthlyRequired, 726);
  assert.deepEqual(
    snapshot.channels.map((channel) => [channel.key, channel.recovered, channel.target, channel.warn]),
    [['online', 244, 240, false], ['south', 98, 110, false], ['east', 86, 120, true], ['agent', 92, 110, false]]
  );
  assert.equal(snapshot.monthlyTrend.at(-1).recovered, 520);
  assert.equal(snapshot.channelRoi.find((row) => row.key === 'online').investment, 31);
  assert.equal(snapshot.salesMemberRows.find((row) => row.key === 'staff-2004').group, 'east');
});

test('prefers daily revenue facts over sales member monthly rows for recovered metrics', () => {
  const snapshot = mapDashboardRowsToSnapshot({
    latestMonth: '2026-06',
    channels: [
      { channel_id: 3001, channel_key: 'online', channel_name: '线上' },
      { channel_id: 3002, channel_key: 'south', channel_name: '华南线下' },
    ],
    salesMemberMonthly: [
      { year_month: '2026-06', staff_id: 2001, staff_name: '王丽英', channel_key: 'online', channel_name: '线上', recovered_wan: 300, target_wan: 240 },
      { year_month: '2026-06', staff_id: 2002, staff_name: '李思雨', channel_key: 'south', channel_name: '华南线下', recovered_wan: 220, target_wan: 110 },
    ],
    revenueDaily: [
      { year_month: '2026-01', channel_key: 'online', recovered_wan: 100 },
      { year_month: '2026-05', channel_key: 'online', recovered_wan: 120 },
      { year_month: '2026-06', channel_key: 'online', recovered_wan: 170.95 },
      { year_month: '2026-06', channel_key: 'south', recovered_wan: 118.75 },
    ],
    monthlyTargets: [
      { year_month: '2026-01', target_wan: 315.7 },
      { year_month: '2026-02', target_wan: 338.8 },
      { year_month: '2026-03', target_wan: 369.6 },
      { year_month: '2026-04', target_wan: 392.7 },
      { year_month: '2026-05', target_wan: 361.9 },
      { year_month: '2026-06', target_wan: 415.8 },
    ],
  });

  assert.equal(snapshot.kpi.monthRecovered, 290);
  assert.equal(snapshot.kpi.lastMonthRecovered, 120);
  assert.equal(snapshot.kpi.yearRecovered, 510);
  assert.deepEqual(
    snapshot.channels.map((channel) => [channel.key, channel.recovered, channel.target]),
    [['online', 171, 240], ['south', 119, 110]]
  );
  assert.deepEqual(
    snapshot.monthlyTrend.map((row) => [row.month, row.recovered]),
    [['1月', 100], ['2月', 0], ['3月', 0], ['4月', 0], ['5月', 120], ['6月', 290]]
  );
});
