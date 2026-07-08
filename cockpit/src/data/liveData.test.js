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
  KPI,
  KPI_CARDS,
  KPI_DERIVED,
  MONTHLY_TREND,
  OPERATING_OVERVIEW_METRICS,
  applyDashboardDataSnapshot,
  getChannelCompletionRows,
  getSalesMemberRows,
} from './mock.js';

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
    ],
    channelRoi: [
      { key: 'online', name: '线上', recovered: 244, investment: 31, roi: 7.87, costRatio: 12.7, warn: false, strong: true },
      { key: 'east', name: '华东线下', recovered: 86, investment: 18, roi: 4.78, costRatio: 20.9, warn: false, strong: true },
    ],
    monthlyTrend: [
      { month: '5月', target: 362, recovered: 0, completion: 0 },
      { month: '6月', target: 580, recovered: 520, completion: 89.7 },
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
  assert.equal(KPI_CARDS.find((card) => card.key === 'month').value, 520);
  assert.equal(KPI_CARDS.find((card) => card.key === 'year').sub, '年度目标 4874 万');
  assert.equal(getChannelCompletionRows('month').find((row) => row.key === 'east').monthGap, 34);
  assert.equal(getSalesMemberRows('east', 'month')[0].target, 120);
  assert.equal(getSalesMemberRows('east', 'year')[0].target, 720);
  assert.equal(getSalesMemberRows('east', 'year')[0].recovered, 430);
});
