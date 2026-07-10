/*
 更新时间: 2026-07-10 15:25:00 CST
 更新内容: 增加缺失 period 不回退月度数据的真实粒度回归。
*/
/*
 更新时间: 2026-06-24 15:40:01
 更新内容: 新增续费率聚合测试，覆盖按版本筛选后的整体续费率和渠道拆分口径。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calculateRenewalOverview, getRenewalChannelBreakdown } from './renewal.js';

const rows = [
  {
    channel: 'online',
    channelName: '线上',
    version: 'qihang',
    periods: {
      month: { due: 10, renewed: 8, revenue: 12, prevDue: 10, prevRenewed: 7 },
    },
  },
  {
    channel: 'online',
    channelName: '线上',
    version: 'zhuoyue',
    periods: {
      month: { due: 5, renewed: 3, revenue: 12, prevDue: 5, prevRenewed: 4 },
    },
  },
  {
    channel: 'agent',
    channelName: '代理',
    version: 'qihang',
    periods: {
      month: { due: 5, renewed: 2, revenue: 3, prevDue: 4, prevRenewed: 2 },
    },
  },
];

test('calculates renewal overview for the selected version', () => {
  const overview = calculateRenewalOverview(rows, { version: 'qihang', period: 'month' });

  assert.deepEqual(overview, {
    due: 15,
    renewed: 10,
    revenue: 15,
    prevDue: 14,
    prevRenewed: 9,
    rate: 66.7,
    prevRate: 64.3,
    delta: 2.4,
  });
});

test('returns channel renewal rates with selected version filter applied', () => {
  const breakdown = getRenewalChannelBreakdown(rows, { version: 'qihang', period: 'month' });

  assert.deepEqual(breakdown, [
    {
      key: 'online',
      name: '线上',
      due: 10,
      renewed: 8,
      revenue: 12,
      prevDue: 10,
      prevRenewed: 7,
      rate: 80,
      prevRate: 70,
      delta: 10,
    },
    {
      key: 'agent',
      name: '代理',
      due: 5,
      renewed: 2,
      revenue: 3,
      prevDue: 4,
      prevRenewed: 2,
      rate: 40,
      prevRate: 50,
      delta: -10,
    },
  ]);
});

test('returns empty renewal summary when the requested period is absent', () => {
  assert.deepEqual(calculateRenewalOverview(rows, { version: 'qihang', period: 'year' }), {
    due: 0,
    renewed: 0,
    revenue: 0,
    prevDue: 0,
    prevRenewed: 0,
    rate: 0,
    prevRate: 0,
    delta: 0,
  });
});
