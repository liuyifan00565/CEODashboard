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
  applyDashboardDataSnapshot,
  getChannelCompletionRows,
  getKpiSeries,
  getSalesMemberRows,
} from './mock.js';
import { loadDashboardData } from './liveData.js';

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
  assert.equal(KPI_CARDS.find((card) => card.key === 'month').value, 520);
  assert.equal(KPI_CARDS.find((card) => card.key === 'year').sub, '年度目标 4874 万');
  assert.equal(getChannelCompletionRows('month').find((row) => row.key === 'east').monthGap, 34);
  assert.equal(getSalesMemberRows('east', 'month')[0].target, 120);
  assert.equal(getSalesMemberRows('east', 'year')[0].target, 720);
  assert.equal(getSalesMemberRows('east', 'year')[0].recovered, 430);
});

test('falls back to compute-only api when full dashboard data is unavailable', async () => {
  const calls = [];
  const payload = await loadDashboardData({
    fetchImpl: async (url) => {
      calls.push(url);
      if (url === '/api/dashboard-data') {
        return {
          ok: false,
          status: 500,
          json: async () => ({ error: 'MySQL unavailable' }),
        };
      }

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

  assert.deepEqual(calls, ['/api/dashboard-data', '/api/compute-data']);
  assert.equal(payload.computeOverview.totalCapacity, 123456);
  assert.equal(COMPUTE_OVERVIEW.totalCapacity, 123456);
});

test('overlays compute-only api after full dashboard data loads', async () => {
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

      return {
        ok: true,
        status: 200,
        json: async () => ({
          source: 'mysql',
          computeOverview: {
            totalCapacity: 999999,
          },
        }),
      };
    },
  });

  assert.deepEqual(calls, ['/api/dashboard-data', '/api/compute-data']);
  assert.equal(payload.computeOverview.totalCapacity, 999999);
  assert.equal(COMPUTE_OVERVIEW.totalCapacity, 999999);
});
