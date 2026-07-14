/*
 更新时间: 2026-07-14 15:55:00 CST
 更新内容: 回归覆盖公司级月度事实优先、年度目标直读与退款不重复扣减。
*/
/*
 更新时间: 2026-07-14 14:29:30 CST
 更新内容: 回归锁定成交来源查询只读取最新业务月，不再返回年内累计来源结构。
*/
/*
 更新时间: 2026-07-14 14:04:11 CST
 更新内容: 回归覆盖真实成交来源快照字段与 fact_revenue_order 来源聚合 SQL。
*/
/*
 更新时间: 2026-07-14 13:18:00 CST
 更新内容: 增加最新真实月份、订单净回款和完整 Excel 下钻字段回归。
*/
/* 更新时间: 2026-07-13 18:53:01 CST  更新内容: 成本快照将四个渠道人力汇总为销售部人力，并额外计入独立市场部人力。 */
/* 更新时间: 2026-07-13 16:48:56 CST  更新内容: 成本快照回归改为运营成本 + 人力成本，并保留 adCost 兼容别名。 */
/*
 更新时间: 2026-07-10 17:02:12 CST
 更新内容: 增加 fact_revenue_daily 无 department_id 旧库兼容回归，防止 dashboard-data 启动后查询部门回款明细报 Unknown column。
*/
/*
 更新时间: 2026-07-10 15:40:59 CST
 更新内容: 增加续费快照补齐 day/month/year 空粒度回归，防止真实库部分粒度缺行导致二级页漏算。
*/
/*
 更新时间: 2026-07-10 14:50:00 CST
 更新内容: 业务月份回归改为默认跟随北京时间当前自然月，不再要求临时 2026-06 覆盖。
*/
/*
 更新时间: 2026-07-09 16:05:00 CST
 更新内容: 增加 dashboard 净回款回归，验证日级和销售月表回款都会扣减渠道月度退款并返回退款额。
*/
/*
 更新时间: 2026-07-08 18:22:00 CST
 更新内容: 增加 dashboard costTrend 快照映射回归，覆盖渠道投放成本、人力成本和全渠道总投入构成。
*/
/*
 更新时间: 2026-07-08 17:23:00 CST
 更新内容: 业务月份回归锁定临时 2026-06 覆盖，并保留其它原因处理完后的自动月份回退路径。
*/
/*
 更新时间: 2026-07-08 16:37:08 CST
 更新内容: 增加渠道人员明细口径回归，要求目标维护新增销售即使没有销售月表也能进入本月/年度下钻。
*/
/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 增加首页目标 SQL 口径回归，要求目标分母只统计启用销售且有部门的 staff 目标。
*/
/*
 更新时间: 2026-07-07 12:18:57 CST
 更新内容: 增加目标维护表口径和版本续费预聚合测试，防止真实库聚合被销售月表或续费 JOIN 放大。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 增加真实数据库 dashboard snapshot 映射测试，要求首页 KPI、渠道、成本和年度节奏来自 MySQL 行。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { mapDashboardRowsToSnapshot, chinaTodayYMD } from './dashboardData.js';

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
    channelTargets: [
      { channel_key: 'online', target_wan: 156.6 },
      { channel_key: 'south', target_wan: 105.84 },
      { channel_key: 'east', target_wan: 97.2 },
      { channel_key: 'agent', target_wan: 56.16 },
    ],
    yearChannelTargets: [
      { channel_key: 'online', target_wan: 1835.7 },
      { channel_key: 'south', target_wan: 1240.68 },
      { channel_key: 'east', target_wan: 1139.4 },
      { channel_key: 'agent', target_wan: 658.32 },
    ],
    channelCosts: [
      { channel_key: 'online', operations_wan: 31.11, labor_wan: 40 },
      { channel_key: 'south', operations_wan: 19.31, labor_wan: 20 },
      { channel_key: 'east', operations_wan: 17.7, labor_wan: 12 },
      { channel_key: 'agent', operations_wan: 9.12, labor_wan: 10 },
    ],
    laborCosts: [
      { cost_type: 'sales', amount_wan: 54.41 },
      { cost_type: 'marketing', amount_wan: 27.21 },
    ],
    channelCostTrend: [
      { year_month: '2026-05', channel_key: 'online', operations_wan: 35, labor_wan: 45 },
      { year_month: '2026-05', channel_key: 'south', operations_wan: 20, labor_wan: 27 },
      { year_month: '2026-06', channel_key: 'online', operations_wan: 31.11, labor_wan: 40 },
      { year_month: '2026-06', channel_key: 'south', operations_wan: 19.31, labor_wan: 20 },
      { year_month: '2026-06', channel_key: 'east', operations_wan: 17.7, labor_wan: 12 },
      { year_month: '2026-06', channel_key: 'agent', operations_wan: 9.12, labor_wan: 10 },
    ],
    laborCostTrend: [
      { year_month: '2026-05', cost_type: 'sales', amount_wan: 50 },
      { year_month: '2026-05', cost_type: 'marketing', amount_wan: 22 },
      { year_month: '2026-06', cost_type: 'sales', amount_wan: 54.41 },
      { year_month: '2026-06', cost_type: 'marketing', amount_wan: 27.21 },
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
  assert.equal(snapshot.kpi.monthTarget, 416);
  assert.equal(snapshot.kpi.yearRecovered, 520);
  assert.equal(snapshot.kpi.yearTarget, 4874);
  assert.equal(snapshot.kpi.monthRefund, 0);
  assert.equal(snapshot.kpi.yearRefund, 0);
  assert.equal(snapshot.kpi.totalCost, 186);
  assert.equal(snapshot.kpi.adCost, 77);
  assert.equal(snapshot.kpi.operationsCost, 77);
  assert.equal(snapshot.kpi.laborCost, 109);
  assert.equal(snapshot.kpiDerived.monthCompletion, 125);
  assert.equal(snapshot.kpiDerived.yearCompletion, 10.7);
  assert.equal(snapshot.operatingOverviewMetrics.remainingMonthlyRequired, 726);
  assert.deepEqual(
    snapshot.channels.map((channel) => [channel.key, channel.recovered, channel.target, channel.yearTarget, channel.warn]),
    [['online', 244, 157, 1836, false], ['south', 98, 106, 1241, false], ['east', 86, 97, 1139, false], ['agent', 92, 56, 658, false]]
  );
  assert.equal(snapshot.monthlyTrend.at(-1).recovered, 520);
  assert.equal(snapshot.channelRoi.find((row) => row.key === 'online').investment, 71);
  assert.deepEqual(snapshot.costTrend.map((row) => [row.yearMonth, row.adCost, row.laborCost, row.totalCost]), [
    ['2026-05', 55, 94, 149],
    ['2026-06', 77, 109, 186],
  ]);
  assert.deepEqual(snapshot.costTrend.map((row) => row.operationsCost), [55, 77]);
  assert.deepEqual(snapshot.costTrend.at(-1).channels, { online: 71, south: 39, east: 30, agent: 19 });
  assert.deepEqual(snapshot.renewalRows[0].periods.day, { due: 0, renewed: 0, revenue: 0, prevDue: 0, prevRenewed: 0 });
  assert.deepEqual(snapshot.renewalRows[0].periods.month, { due: 20, renewed: 18, revenue: 88, prevDue: 18, prevRenewed: 15 });
  assert.deepEqual(snapshot.renewalRows[0].periods.year, { due: 0, renewed: 0, revenue: 0, prevDue: 0, prevRenewed: 0 });
  assert.equal(snapshot.salesMemberRows.find((row) => row.key === 'staff-2004').group, 'east');
});

test('falls back to legacy sales plus marketing labor only when channel labor is wholly unconfigured', () => {
  const snapshot = mapDashboardRowsToSnapshot({
    latestMonth: '2026-06',
    channelCosts: [{ channel_key: 'east', operations_wan: 18, labor_wan: null }],
    laborCosts: [
      { cost_type: 'sales', amount_wan: 54 },
      { cost_type: 'marketing', amount_wan: 27 },
    ],
  });

  assert.equal(snapshot.kpi.operationsCost, 18);
  assert.equal(snapshot.kpi.laborCost, 81);
  assert.equal(snapshot.kpi.totalCost, 99);
  assert.equal(snapshot.costTrend[0].laborCost, 81);
});

test('chinaTodayYMD 在任意进程时区下都返回北京时间当地的今天', () => {
  // 容器默认跑 UTC，但业务在中国（UTC+8）。构造一个「北京时间月初凌晨」的时间戳：
  // 2026-09-01 00:30 北京时间 == 2026-08-31 16:30 UTC。直接 new Date() 在 UTC 进程里会算成 8 月 31，
  // chinaTodayYMD 必须仍给出 2026-09-01。
  const beijingMidnightEarlySep = Date.UTC(2026, 8, 1, 0, 30) - 8 * 3600 * 1000; // == 2026-08-31T16:30:00Z
  const realNow = Date.now;
  globalThis.Date.now = () => beijingMidnightEarlySep;
  try {
    const today = chinaTodayYMD();
    assert.equal(today.yearMonth, '2026-09');
    assert.equal(today.day, 1);
  } finally {
    globalThis.Date.now = realNow;
  }
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
    channelTargets: [
      { channel_key: 'online', target_wan: 156.6 },
      { channel_key: 'south', target_wan: 105.84 },
    ],
    yearChannelTargets: [
      { channel_key: 'online', target_wan: 1835.7 },
      { channel_key: 'south', target_wan: 1240.68 },
    ],
    refundRows: [
      { year_month: '2026-06', channel_key: 'online', refund_wan: 20 },
      { year_month: '2026-06', channel_key: 'south', refund_wan: 5 },
    ],
  });

  assert.equal(snapshot.kpi.monthRecovered, 265);
  assert.equal(snapshot.kpi.monthTarget, 416);
  assert.equal(snapshot.kpi.lastMonthRecovered, 120);
  assert.equal(snapshot.kpi.yearRecovered, 485);
  assert.equal(snapshot.kpi.monthRefund, 25);
  assert.equal(snapshot.kpi.yearRefund, 25);
  assert.deepEqual(
    snapshot.channels.map((channel) => [channel.key, channel.recovered, channel.target, channel.yearTarget]),
    [['online', 151, 157, 1836], ['south', 114, 106, 1241]]
  );
  assert.deepEqual(
    snapshot.monthlyTrend.map((row) => [row.month, row.target, row.recovered]),
    [['1月', 316, 100], ['2月', 339, 0], ['3月', 370, 0], ['4月', 393, 0], ['5月', 362, 120], ['6月', 416, 265]]
  );
});

test('deducts monthly channel refunds when falling back to sales member recovered rows', () => {
  const snapshot = mapDashboardRowsToSnapshot({
    latestMonth: '2026-06',
    previousMonth: '2026-05',
    channels: [
      { channel_id: 3001, channel_key: 'online', channel_name: '线上' },
      { channel_id: 3002, channel_key: 'south', channel_name: '华南线下' },
    ],
    salesMemberMonthly: [
      { year_month: '2026-05', staff_id: 2001, staff_name: '王丽英', channel_key: 'online', channel_name: '线上', recovered_wan: 120, target_wan: 150 },
      { year_month: '2026-06', staff_id: 2001, staff_name: '王丽英', channel_key: 'online', channel_name: '线上', recovered_wan: 200, target_wan: 160 },
      { year_month: '2026-06', staff_id: 2002, staff_name: '李思雨', channel_key: 'south', channel_name: '华南线下', recovered_wan: 100, target_wan: 120 },
    ],
    revenueDaily: [],
    previousMonthSales: [
      { year_month: '2026-05', channel_key: 'online', recovered_wan: 120 },
    ],
    monthlyTargets: [
      { year_month: '2026-05', target_wan: 150 },
      { year_month: '2026-06', target_wan: 280 },
    ],
    channelTargets: [
      { channel_key: 'online', target_wan: 160 },
      { channel_key: 'south', target_wan: 120 },
    ],
    yearChannelTargets: [
      { channel_key: 'online', target_wan: 310 },
      { channel_key: 'south', target_wan: 120 },
    ],
    refundRows: [
      { year_month: '2026-05', channel_key: 'online', refund_wan: 10 },
      { year_month: '2026-06', channel_key: 'online', refund_wan: 20 },
      { year_month: '2026-06', channel_key: 'south', refund_wan: 5 },
    ],
  });

  assert.equal(snapshot.kpi.monthRecovered, 275);
  assert.equal(snapshot.kpi.lastMonthRecovered, 110);
  assert.equal(snapshot.kpi.yearRecovered, 385);
  assert.equal(snapshot.kpi.monthRefund, 25);
  assert.equal(snapshot.kpi.yearRefund, 35);
  assert.deepEqual(
    snapshot.channels.map((channel) => [channel.key, channel.recovered, channel.yearRecovered]),
    [['online', 180, 290], ['south', 95, 95]]
  );
  assert.deepEqual(
    snapshot.monthlyTrend.map((row) => [row.month, row.recovered]),
    [['5月', 110], ['6月', 275]]
  );
});

test('includes maintained target departments in channel member details without sales monthly facts', () => {
  const snapshot = mapDashboardRowsToSnapshot({
    latestMonth: '2026-07',
    channels: [
      { channel_id: 3001, channel_key: 'online', channel_name: '线上' },
    ],
    salesMemberMonthly: [],
    revenueDaily: [
      { year_month: '2026-06', channel_key: 'online', recovered_wan: 12 },
      { year_month: '2026-07', channel_key: 'online', recovered_wan: 0 },
    ],
    monthlyTargets: [
      { year_month: '2026-07', target_wan: 100 },
      { year_month: '2026-12', target_wan: 80 },
    ],
    channelTargets: [
      { channel_key: 'online', target_wan: 100 },
    ],
    yearChannelTargets: [
      { channel_key: 'online', target_wan: 180 },
    ],
    memberTargets: [
      { year_month: '2026-07', department_id: 1010, department_name: '照样组', channel_key: 'online', target_wan: 100 },
      { year_month: '2026-12', department_id: 1010, department_name: '照样组', channel_key: 'online', target_wan: 80 },
    ],
    memberRecovered: [
      { year_month: '2026-06', department_id: 1010, department_name: '照样组', channel_key: 'online', recovered_wan: 12 },
    ],
  });

  const zhaoyang = snapshot.salesMemberRows.find((row) => row.name === '照样组');
  assert.ok(zhaoyang);
  assert.equal(zhaoyang.group, 'online');
  assert.equal(zhaoyang.target, 100);
  assert.equal(zhaoyang.recovered, 0);
  assert.equal(zhaoyang.yearTarget, 180);
  assert.equal(zhaoyang.yearRecovered, 12);
});

test('keeps person-level revenue tracking when sales monthly rows contain real staff revenue', () => {
  const snapshot = mapDashboardRowsToSnapshot({
    latestMonth: '2026-04',
    useRevenueOrders: true,
    channels: [
      { channel_id: 3001, channel_key: 'online', channel_name: '线上' },
      { channel_id: 3002, channel_key: 'south', channel_name: '华南线下' },
    ],
    salesMemberMonthly: [
      { year_month: '2026-01', staff_id: 8101, staff_name: '黄李莉', channel_key: 'online', channel_name: '线上', recovered_wan: 18.5, target_wan: 0 },
      { year_month: '2026-04', staff_id: 8101, staff_name: '黄李莉', channel_key: 'online', channel_name: '线上', recovered_wan: 32.2, target_wan: 40 },
      { year_month: '2026-04', staff_id: 8102, staff_name: '张栩鸿', channel_key: 'south', channel_name: '华南线下', recovered_wan: 12.8, target_wan: 30 },
    ],
    monthlyTargets: [
      { year_month: '2026-01', target_wan: 18.5 },
      { year_month: '2026-04', target_wan: 70 },
    ],
    channelTargets: [
      { channel_key: 'online', target_wan: 40 },
      { channel_key: 'south', target_wan: 30 },
    ],
    yearChannelTargets: [
      { channel_key: 'online', target_wan: 40 },
      { channel_key: 'south', target_wan: 30 },
    ],
    channelSourceBreakdown: [
      { sourceKey: '7101', sourceName: '小红书', channelKey: 'online', recovered: 19.8, dealCount: 6, customerCount: 5, periodStart: '2026-01-03', periodEnd: '2026-04-08' },
    ],
    revenueDetailRows: [
      {
        date: '2026-04-08',
        yearMonth: '2026-04',
        year: '2026',
        channelKey: 'online',
        value: 3.98,
        salesAmount: 4.28,
        salesName: '黄李莉',
        customerName: '杭州某客户',
        groupName: '企微A群',
        systemOwnerName: '李骥川',
        versionName: '卓越版',
        orderNo: 'SO-20260408-001',
        price: 3.98,
        refund: 0.3,
        channelName: '线上',
        remark: '客户潜力高',
        otherNote: '赠送插件',
        sourceSheet: '4月',
        sourceRowNo: 8,
      },
    ],
    refundRows: [{ year_month: '2026-04', channel_key: 'online', refund_wan: 0.3 }],
  });

  const huang = snapshot.salesMemberRows.find((row) => row.key === 'staff-8101');
  assert.ok(huang);
  assert.equal(huang.name, '黄李莉');
  assert.equal(huang.group, 'online');
  assert.equal(huang.monthTarget, 40);
  assert.equal(huang.monthRecovered, 32);
  assert.equal(huang.yearRecovered, 51);
  assert.equal(snapshot.detailRows.revenueOrders[0].customerName, '杭州某客户');
  assert.equal(snapshot.detailRows.revenueOrders[0].versionName, '卓越版');
  assert.equal(snapshot.kpi.monthRecovered, 45);
  assert.equal(snapshot.detailRows.revenueOrders[0].otherNote, '赠送插件');
  assert.equal(snapshot.channelSourceBreakdown[0].sourceName, '小红书');
  assert.equal(snapshot.channelSourceBreakdown[0].dealCount, 6);
});

test('uses authoritative monthly company facts without double-counting order rows or refunds', () => {
  const snapshot = mapDashboardRowsToSnapshot({
    latestMonth: '2026-06',
    useRevenueOrders: true,
    useRevenueMonthly: true,
    channels: [
      { channel_id: 3001, channel_key: 'online', channel_name: '线上' },
      { channel_id: 3004, channel_key: 'agent', channel_name: '代理' },
    ],
    salesMemberMonthly: [
      { year_month: '2026-04', staff_id: 8101, staff_name: '黄李莉', channel_key: 'online', recovered_wan: 109.88, target_wan: 0 },
    ],
    revenueDaily: [
      { year_month: '2026-05', channel_key: 'online', recovered_wan: 185.63 },
      { year_month: '2026-05', channel_key: 'agent', recovered_wan: 106.8 },
      { year_month: '2026-06', channel_key: 'online', recovered_wan: 119.24 },
      { year_month: '2026-06', channel_key: 'agent', recovered_wan: 101.25 },
    ],
    monthlyTargets: [
      { year_month: '2026-05', target_wan: 300 },
      { year_month: '2026-06', target_wan: 500 },
    ],
    yearlyTargets: [{ year: '2026', target_wan: 6000 }],
    refundRows: [
      { year_month: '2026-05', channel_key: 'online', refund_wan: 3.98 },
      { year_month: '2026-06', channel_key: 'online', refund_wan: 8.66 },
    ],
  });

  assert.equal(snapshot.kpi.monthRecovered, 220);
  assert.equal(snapshot.kpi.yearRecovered, 513);
  assert.equal(snapshot.kpi.monthRefund, 9);
  assert.equal(snapshot.kpi.yearRefund, 13);
  assert.equal(snapshot.kpi.yearTarget, 6000);
  assert.equal(snapshot.meta.annualTarget, 6000);
});

test('pre-aggregates renewal facts before joining version sales', () => {
  const source = readFileSync(new URL('./dashboardData.js', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /LEFT JOIN fact_renewal_daily r ON r\.version_id = f\.version_id/);
  assert.match(source, /FROM fact_renewal_daily[\s\S]*GROUP BY version_id/);
});

test('filters maintained targets to department-level dashboard rows', () => {
  const source = readFileSync(new URL('./dashboardData.js', import.meta.url), 'utf8');

  assert.match(source, /FROM biz_target_monthly t[\s\S]*AND t\.staff_id IS NULL/);
  assert.match(source, /JOIN dim_department d ON d\.department_id = t\.department_id/);
  assert.match(source, /LEFT JOIN dim_channel c ON c\.channel_id = t\.channel_id/);
  assert.ok(source.includes('GROUP BY t.\\`year_month\\`, d.department_id, d.department_name, c.channel_key'));
});

test('resolves department recovered detail from old or new fact_revenue_daily schema', () => {
  const source = readFileSync(new URL('./dashboardData.js', import.meta.url), 'utf8');

  assert.match(source, /async function tableHasColumn/);
  assert.match(source, /tableHasColumn\(connection, 'fact_revenue_daily', 'department_id'\)/);
  assert.match(source, /'COALESCE\(r\.department_id, s\.department_id\)'/);
  assert.match(source, /: 's\.department_id';/);
  assert.match(source, /LEFT JOIN dim_staff s ON s\.staff_id = r\.staff_id/);
  assert.match(source, /JOIN dim_department d ON d\.department_id = \$\{revenueDepartmentIdSql\}/);
});

test('selects dashboard business month from explicit override or the latest real fact month', () => {
  const source = readFileSync(new URL('./dashboardData.js', import.meta.url), 'utf8');

  assert.match(source, /const TEMP_DASHBOARD_MONTH_OVERRIDE = '';/);
  assert.match(source, /async function selectDashboardBusinessMonth/);
  assert.match(source, /process\.env\.DASHBOARD_MONTH_OVERRIDE \|\| TEMP_DASHBOARD_MONTH_OVERRIDE \|\| await loadLatestActualMonth\(connection\)/);
  assert.match(source, /async function loadLatestActualMonth/);
  assert.match(source, /DATE_FORMAT\(MAX\(stat_date\), '%Y-%m'\) AS actual_month[\s\S]*FROM fact_revenue_daily/);
  assert.match(source, /SELECT MAX\(\\`year_month\\`\) AS actual_month[\s\S]*FROM fact_sales_member_monthly/);
  assert.match(source, /FROM fact_revenue_order/);
  assert.match(source, /LEFT JOIN dim_channel_source cs ON cs\.source_id = o\.channel_source_id/);
  assert.match(source, /GROUP BY sourceKey, sourceName, channelKey[\s\S]*?\[`\$\{latestMonth\}-01`, nextMonthBoundary\]\) : Promise\.resolve\(\[\]\)/);
  assert.match(source, /const latestMonth = await selectDashboardBusinessMonth\(connection\);/);
  assert.doesNotMatch(source, /SELECT MAX\(`year_month`\) AS latestMonth FROM fact_sales_member_monthly/);
});

test('queries self-operated order revenue when the real Excel detail table is available', () => {
  const source = readFileSync(new URL('./dashboardData.js', import.meta.url), 'utf8');

  assert.match(source, /async function revenueOrderRowsExist/);
  assert.match(source, /tableExists\(connection, 'fact_revenue_order'\)/);
  assert.match(source, /const useRevenueOrders = await revenueOrderRowsExist\(connection, latestYear\);/);
  assert.match(source, /FROM fact_revenue_order o[\s\S]*COALESCE\(s\.staff_name, o\.sales_name_raw/);
  assert.match(source, /revenueOrders: rows\.revenueDetailRows \?\? \[\]/);
  assert.match(source, /salesName/);
  assert.match(source, /customerName/);
  assert.match(source, /systemOwnerName/);
  assert.match(source, /versionName/);
  assert.match(source, /orderNo/);
  assert.match(source, /SUM\(o\.net_amount_yuan\)/);
  assert.match(source, /salesAmount/);
  assert.match(source, /otherNote/);
  assert.match(source, /sourceRowNo/);
});
