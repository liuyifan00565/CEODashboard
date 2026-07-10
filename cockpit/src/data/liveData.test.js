/*
 更新时间: 2026-07-10 15:25:00 CST
 更新内容: 增加真实 detailRows 聚合回归，并把算力缺失日期回归改为不再前端补点。
*/
/*
 更新时间: 2026-07-09 21:15:00 CST
 更新内容: 增加 loadComputeCustomerPage 分页请求回归测试。
*/
/*
 更新时间: 2026-07-09 19:52:00 CST
 更新内容: 文案同步为 compute-data 由 App 后台同步调用，loadDashboardData 不再兜底加载算力接口。
*/
/*
 更新时间: 2026-07-09 19:32:00 CST
 更新内容: 前端真实数据测试改为 dashboard-data 与 compute-data 分离加载，算力数据由 loadComputeData 显式同步。
*/
/*
 更新时间: 2026-07-09 19:05:00 CST
 更新内容: 真实数据加载测试改为 dashboard-data 成功即完成，compute-data 只作为失败兜底；算力趋势补充缺失日期回填验证。
*/
/*
 更新时间: 2026-07-09 18:18:00 CST
 更新内容: 增加外部算力快照覆盖后不再生成假客户/假月年趋势的回归测试。
*/
/*
 更新时间: 2026-07-09 17:45:00 CST
 更新内容: 增加全量 dashboard 成功后继续读取 compute-only 接口的回归，确保 token 数据优先用外部真实快照。
*/
/*
 更新时间: 2026-07-08 18:22:00 CST
 更新内容: 增加真实快照 costTrend 覆盖回归，确保前端成本二级下钻使用 MySQL 成本趋势。
*/
/*
 更新时间: 2026-07-08 16:37:08 CST
 更新内容: 增加真实快照覆盖后渠道人员明细按本月/年度取不同字段的回归测试。
*/
/*
 更新时间: 2026-07-07 15:25:00 CST
 更新内容: 快照 fixture 移除 monthJudgement / annualJudgement，该摘要字段已随经营摘要删除。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 增加前端真实数据库快照覆盖测试，要求 KPI、渠道、趋势和卡片元信息不再停留在 mock 数字。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CHANNELS,
  COST_TREND,
  COMPUTE_OVERVIEW,
  KPI,
  KPI_CARDS,
  KPI_DERIVED,
  MONTHLY_TREND,
  OPERATING_OVERVIEW_METRICS,
  appendComputeCustomerRows,
  applyDashboardDataSnapshot,
  getChannelCompletionRows,
  getComputeCustomerRows,
  getComputeResourceHealth,
  getComputeUsageTrend,
  getKpiSeries,
  getSalesMemberRows,
  getVersionDetailSeries,
} from './mock.js';
import { loadComputeCustomerPage, loadComputeData, loadDashboardData } from './liveData.js';

test('applies mysql dashboard snapshot to mutable dashboard data exports', () => {
  applyDashboardDataSnapshot({
    source: 'mysql',
    meta: { monthLabel: '2026年6月', annualTarget: 4874 },
    kpi: {
      monthRecovered: 520,
      monthTarget: 580,
      lastMonthRecovered: 0,
      yearRecovered: 520,
      yearTarget: 4874,
      lastYearSameRecovered: 0,
      totalCost: 159,
      adCost: 77,
      laborCost: 82,
      received: 520,
      receivable: 60,
    },
    kpiDerived: {
      monthCompletion: 89.7,
      monthGap: 60,
      monthMoM: 0,
      yearCompletion: 10.7,
      yearGap: 4354,
      yearYoY: 0,
      costRatio: 30.6,
      channelRoi: 3.27,
      roi: 6.75,
    },
    operatingOverviewMetrics: {
      monthTimeProgress: 100,
      monthPaceDelta: -10.3,
      riskImpactGap: 34,
      annualTimeProgress: 50,
      annualPaceDelta: -39.3,
      annualRemainingRate: 89.3,
      remainingMonths: 6,
      remainingMonthlyRequired: 726,
    },
    channels: [
      { key: 'online', name: '线上', recovered: 244, target: 240, warn: false },
      { key: 'east', name: '华东线下', recovered: 86, target: 120, warn: true },
      { key: 'channel_3005', name: '新增渠道', recovered: 0, target: 0, warn: true },
    ],
    channelRoi: [
      { key: 'online', name: '线上', recovered: 244, investment: 31, roi: 7.87, costRatio: 12.7, warn: false, strong: true },
      { key: 'east', name: '华东线下', recovered: 86, investment: 18, roi: 4.78, costRatio: 20.9, warn: false, strong: true },
    ],
    monthlyTrend: [
      { month: '5月', target: 362, recovered: 0, completion: 0 },
      { month: '6月', target: 580, recovered: 520, completion: 89.7 },
    ],
    costTrend: [
      { yearMonth: '2026-05', label: '5月', adCost: 49, laborCost: 76, totalCost: 125, channels: { online: 30, east: 19 } },
      { yearMonth: '2026-06', label: '6月', adCost: 77, laborCost: 82, totalCost: 159, channels: { online: 31, east: 18 } },
    ],
    salesMemberRows: [
      { key: 'staff-2004', group: 'east', name: '马骏', target: 120, recovered: 86, monthTarget: 120, monthRecovered: 86, yearTarget: 720, yearRecovered: 430 },
    ],
    detailRows: {
      revenue: [
        { date: '2026-06-10', yearMonth: '2026-06', year: '2026', channelKey: 'online', orderType: 'new', value: 244 },
        { date: '2026-06-11', yearMonth: '2026-06', year: '2026', channelKey: 'east', orderType: 'renewal', value: 86 },
      ],
      openings: [
        { date: '2026-06-10', yearMonth: '2026-06', year: '2026', channelKey: 'online', value: 11 },
        { date: '2026-06-11', yearMonth: '2026-06', year: '2026', channelKey: 'east', value: 9 },
      ],
      versions: [
        { date: '2026-06-10', yearMonth: '2026-06', year: '2026', channelKey: 'online', versionKey: 'qihang', units: 2, recovered: 34 },
      ],
    },
  });

  assert.equal(KPI.monthRecovered, 520);
  assert.equal(KPI_DERIVED.yearCompletion, 10.7);
  assert.equal(OPERATING_OVERVIEW_METRICS.remainingMonthlyRequired, 726);
  assert.equal(CHANNELS.find((channel) => channel.key === 'east').completion, 71.7);
  assert.equal(MONTHLY_TREND.at(-1).recovered, 520);
  assert.equal(COST_TREND.at(-1).totalCost, 159);
  assert.equal(COST_TREND.at(-1).channels.online, 31);
  assert.equal(getKpiSeries('cost', { salesKeys: ['online', 'east'] }).at(-1).value, 159);
  assert.equal(getKpiSeries('cost', { salesKeys: ['online'] }).at(-1).value, 31);
  assert.equal(getKpiSeries('recovered', { salesKeys: ['online'], orderType: 'new', dim: 'month' }).at(-1).value, 244);
  assert.equal(getKpiSeries('monthOpenings', { salesKeys: ['online', 'east'], dim: 'day' }).at(-1).value, 9);
  assert.equal(getVersionDetailSeries({ salesKeys: ['online'], mode: 'amount', dim: 'month', versionKey: 'qihang' }).at(-1).value, 34);
  assert.equal(KPI_CARDS.find((card) => card.key === 'month').value, 520);
  assert.equal(KPI_CARDS.find((card) => card.key === 'year').sub, '年度目标 4874 万');
  assert.equal(getChannelCompletionRows('month').find((row) => row.key === 'east').monthGap, 34);
  assert.equal(getSalesMemberRows('east', 'month')[0].target, 120);
  assert.equal(getSalesMemberRows('east', 'year')[0].target, 720);
  assert.equal(getSalesMemberRows('east', 'year')[0].recovered, 430);
});

test('loads compute-only api through explicit token data sync', async () => {
  const calls = [];
  const payload = await loadComputeData({
    fetchImpl: async (url) => {
      calls.push(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          source: 'mysql',
          computeOverview: {
            totalCapacity: 123456,
          },
        }),
      };
    },
  });

  assert.deepEqual(calls, ['/api/compute-data']);
  assert.equal(payload.computeOverview.totalCapacity, 123456);
  assert.equal(COMPUTE_OVERVIEW.totalCapacity, 123456);
});

test('requests a specific customer page for background pagination', async () => {
  const calls = [];
  const payload = await loadComputeCustomerPage({
    page: 3,
    pageSize: 150,
    fetchImpl: async (url) => {
      calls.push(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({ source: 'mysql', rows: [{ phone: '9' }], total: 500, page: 3, pageSize: 150 }),
      };
    },
  });

  assert.deepEqual(calls, ['/api/compute-customers?page=3&pageSize=150']);
  assert.equal(payload.total, 500);
  assert.deepEqual(payload.rows, [{ phone: '9' }]);
});

test('does not request compute-only api when full dashboard data loads', async () => {
  const calls = [];
  const payload = await loadDashboardData({
    fetchImpl: async (url) => {
      calls.push(url);
      if (url === '/api/dashboard-data') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            source: 'mysql',
            computeOverview: {
              totalCapacity: 111,
            },
          }),
        };
      }

      throw new Error(`unexpected request ${url}`);
    },
  });

  assert.deepEqual(calls, ['/api/dashboard-data']);
  assert.equal(payload.computeOverview.totalCapacity, 111);
  assert.equal(COMPUTE_OVERVIEW.totalCapacity, 111);
});

test('uses only real external compute rows for customers and trend ranges', () => {
  applyDashboardDataSnapshot({
    source: 'mysql',
    computeOverview: {
      totalCustomers: 2,
    },
    computeUsageTrend: [
      { day: '07-08', range: '2026-07-08', usage: 592, addOn: 0, capacity: 267237 },
      { day: '07-07', range: '2026-07-07', usage: 600, addOn: 0, capacity: 266101 },
      { day: '06-30', range: '2026-06-30', usage: 521, addOn: 0, capacity: 259356 },
    ],
    computeCustomerRows: [
      { phone: '1', owner: '一号', accountType: '卓越版', salesOwner: '雪姐', successOwner: '龙涛', usage: 20, balance: 200, averageReplyRate: 80 },
      { phone: '2', owner: '二号', accountType: '创世版', salesOwner: '李莉', successOwner: '灵灵', usage: 10, balance: 100, averageReplyRate: 70 },
    ],
    computeResourceHealth: [
      { key: 'voc', name: 'VOC分析', usage: 1.5, value: 1200, trend: '1,200 点', state: '低频消耗', tone: 'neutral' },
    ],
  });

  assert.deepEqual(getComputeCustomerRows().map((row) => row.phone), ['1', '2']);
  const dayRows = getComputeUsageTrend({ dim: 'day', dateRange: ['2026-07-06', '2026-07-08'] });
  assert.deepEqual(dayRows.map((row) => row.range), ['2026-07-08', '2026-07-07']);
  assert.equal(dayRows.some((row) => row.range === '2026-07-06'), false);
  assert.deepEqual(getComputeUsageTrend({ dim: 'month', dateRange: ['2026-06-01', '2026-07-31'] }).map((row) => row.range), ['2026-07', '2026-06']);
  assert.deepEqual(getComputeUsageTrend({ dim: 'year', dateRange: ['2026-01-01', '2026-12-31'] }).map((row) => row.range), ['2026']);
  assert.equal(getComputeResourceHealth()[0].name, 'VOC分析');
});

test('merges background customer pages by phone instead of replacing the whole list', () => {
  applyDashboardDataSnapshot({
    source: 'mysql',
    computeCustomerRows: [
      { phone: '1', owner: '一号', usage: 20, balance: 200 },
      { phone: '2', owner: '二号', usage: 10, balance: 100 },
    ],
  });

  appendComputeCustomerRows([
    { phone: '2', owner: '二号（更新）', usage: 15, balance: 90 },
    { phone: '3', owner: '三号', usage: 5, balance: 50 },
  ]);

  assert.deepEqual(getComputeCustomerRows().map((row) => row.phone).sort(), ['1', '2', '3']);
  assert.equal(getComputeCustomerRows().find((row) => row.phone === '2').owner, '二号（更新）');
  assert.equal(getComputeCustomerRows().find((row) => row.phone === '1').owner, '一号');
});
