/*
 更新时间: 2026-07-13 14:58:00 CST
 更新内容: 增加开户数直接字段优先与算力全量客户快照差分兜底的接口聚合测试。
*/
/*
 更新时间: 2026-07-06 14:57:00 CST
 更新内容: 增加驾驶舱 MySQL 聚合接口的经营总览与算力数据构造回归测试。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildComputePayload, buildOverviewPayload } from './dashboardApi.js';

test('builds overview KPI, channel, trend and version data from MySQL-shaped rows', () => {
  const payload = buildOverviewPayload({
    year: 2026,
    month: 6,
    channels: [
      { channel_id: 3001, channel_key: 'online', channel_name: '线上' },
      { channel_id: 3002, channel_key: 'south', channel_name: '华南线下' },
    ],
    revenueRows: [
      { year_month: '2026-05', channel_id: 3001, recovered_yuan: 800000, order_count: 8 },
      { year_month: '2026-06', channel_id: 3001, recovered_yuan: 1200000, order_count: 12 },
      { year_month: '2026-06', channel_id: 3002, recovered_yuan: 600000, order_count: 6 },
    ],
    targetRows: [
      { year_month: '2026-05', channel_id: 3001, target_yuan: 1000000 },
      { year_month: '2026-06', channel_id: 3001, target_yuan: 1500000 },
      { year_month: '2026-06', channel_id: 3002, target_yuan: 750000 },
    ],
    costRows: [
      { year_month: '2026-06', channel_id: 3001, cost_yuan: 300000 },
      { year_month: '2026-06', channel_id: 3002, cost_yuan: 150000 },
    ],
    laborRows: [
      { year_month: '2026-06', cost_type: 'sales', amount_yuan: 200000 },
      { year_month: '2026-06', cost_type: 'marketing', amount_yuan: 100000 },
    ],
    versionRows: [
      { version_key: 'qihang', version_name: '启航版', standard_price_yuan: 16800, units: 10, recovered_yuan: 168000, mom_rate: 6.5 },
    ],
    renewalRows: [
      { channel_id: 3001, channel_key: 'online', channel_name: '线上', version_key: 'qihang', due_count: 10, renewed_count: 8, renewal_yuan: 128000 },
    ],
    openingRows: [
      { metric: 'monthOpenings', current_count: 18, previous_count: 15 },
      { metric: 'todayOpenings', current_count: 3, previous_count: 2 },
    ],
    salesMemberRows: [
      { staff_id: 2001, staff_name: '王丽英', channel_id: 3001, channel_key: 'online', channel_name: '线上', target_yuan: 1500000, recovered_yuan: 1200000 },
    ],
    deliveryRows: [
      { engineer_id: 2101, engineer_name: '廖玉琼', delivered_count: 3, order_price_yuan: 168000 },
    ],
    deliveryTargetRows: [
      { engineer_id: 2101, target_count: 5 },
    ],
  });

  assert.equal(payload.kpi.monthRecovered, 180);
  assert.equal(payload.kpi.monthTarget, 225);
  assert.equal(payload.kpi.lastMonthRecovered, 80);
  assert.equal(payload.kpi.totalCost, 75);
  assert.equal(payload.channels[0].completion, 80);
  assert.equal(payload.monthlyTrend.at(-1).recovered, 180);
  assert.equal(payload.versions[0].recovered, 17);
  assert.equal(payload.renewalRows[0].periods.month.revenue, 13);
  assert.equal(payload.openingAccountMetrics[0].value, 18);
  assert.equal(payload.openingAccountMetrics[0].source, 'opening_account');
  assert.equal(payload.salesMemberRows[0].recovered, 120);
  assert.equal(payload.deliveryRows[0].deliveredCount, 3);
  assert.equal(payload.deliveryRows[0].targetCount, 5);
  assert.equal(payload.deliverySummary.people, 1);
});

test('derives opening metrics from full compute customer snapshots when direct rows are empty', () => {
  const payload = buildOverviewPayload({
    year: 2026,
    month: 6,
    computeCustomerSnapshotRows: [
      { stat_date: '2026-04-30', customer_count: 80 },
      { stat_date: '2026-05-31', customer_count: 100 },
      { stat_date: '2026-06-28', customer_count: 115 },
      { stat_date: '2026-06-29', customer_count: 118 },
      { stat_date: '2026-06-30', customer_count: 126 },
    ],
  });

  const monthOpenings = payload.openingAccountMetrics.find((metric) => metric.metric === 'monthOpenings');
  const todayOpenings = payload.openingAccountMetrics.find((metric) => metric.metric === 'todayOpenings');

  assert.equal(monthOpenings.value, 26);
  assert.equal(monthOpenings.delta, 30);
  assert.equal(monthOpenings.source, 'compute_customer_snapshot');
  assert.equal(todayOpenings.value, 8);
  assert.equal(todayOpenings.delta, 166.7);
  assert.equal(todayOpenings.source, 'compute_customer_snapshot');
});

test('clamps negative compute snapshot opening differences to zero', () => {
  const payload = buildOverviewPayload({
    year: 2026,
    month: 6,
    computeCustomerSnapshotRows: [
      { stat_date: '2026-04-30', customer_count: 100 },
      { stat_date: '2026-05-31', customer_count: 98 },
      { stat_date: '2026-06-29', customer_count: 96 },
      { stat_date: '2026-06-30', customer_count: 95 },
    ],
  });

  assert.equal(payload.openingAccountMetrics[0].value, 0);
  assert.equal(payload.openingAccountMetrics[0].source, 'compute_customer_snapshot');
  assert.equal(payload.openingAccountMetrics[1].value, 0);
  assert.equal(payload.openingAccountMetrics[1].source, 'compute_customer_snapshot');
});

test('builds compute overview, trend, pies and customer rows from MySQL-shaped rows', () => {
  const payload = buildComputePayload({
    usageRows: [
      { stat_date: '2026-06-29', usage_points: 4000000, added_points: 200000, capacity_points: 2400000000, target_points: 5000000 },
      { stat_date: '2026-06-30', usage_points: 5000000, added_points: 300000, capacity_points: 2500000000, target_points: 6000000 },
    ],
    customerRows: [
      {
        customer_phone_masked: '150****1491',
        customer_name: '一本官方旗舰店',
        account_type: '至尊版pro',
        sales_owner_name: '雪姐',
        success_owner_name: '龙涛',
        usage_points: 2010190,
        balance_points: 7783896,
        average_reply_rate: 81,
      },
    ],
    versionRows: [
      { version_name: '启航版', consumption_weight: 31 },
    ],
    distributionRows: [
      { bucket_name: '算力用量=0', customer_weight: 75 },
    ],
    resourceRows: [
      { resource_key: 'reply', resource_name: '自动回复', resource_color: '#8e2de2', usage_rate: 57.4, trend_text: '+6.8%', state_text: '高频稳定', tone: 'good' },
    ],
  });

  assert.equal(payload.overview.totalCapacity, 2500000000);
  assert.equal(payload.overview.consumedCapacity, 9000000);
  assert.equal(payload.overview.addedCapacity, 500000);
  assert.equal(payload.overview.customerCount, 1);
  assert.equal(payload.usageTrend.at(-1).usage, 500);
  assert.equal(payload.versionConsumption[0].name, '启航版');
  assert.equal(payload.usageDistribution[0].value, 75);
  assert.equal(payload.customerRows[0].owner, '一本官方旗舰店');
  assert.equal(payload.resourceHealth[0].name, '自动回复');
});
