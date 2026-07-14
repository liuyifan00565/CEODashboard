/*
 更新时间: 2026-07-14 14:04:11 CST
 更新内容: 覆盖成交来源按渠道筛选、同名合并、贡献占比排序与数据期标签。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildChannelSourceBreakdown, channelSourcePeriodLabel } from './channelSourceBreakdown.js';

const rows = [
  { sourceKey: 'rednote', sourceName: '小红书', channelKey: 'online', recovered: 12, dealCount: 3, customerCount: 2, periodStart: '2026-01-05', periodEnd: '2026-04-09' },
  { sourceKey: 'rednote', sourceName: '小红书', channelKey: 'east', recovered: 8, dealCount: 2, customerCount: 2, periodStart: '2026-02-03', periodEnd: '2026-03-21' },
  { sourceKey: 'douyin', sourceName: '抖音', channelKey: 'online', recovered: 30, dealCount: 5, customerCount: 4, periodStart: '2026-01-12', periodEnd: '2026-04-18' },
];

test('builds ranked source performance for all channels', () => {
  const result = buildChannelSourceBreakdown(rows);
  assert.equal(result[0].name, '抖音');
  assert.equal(result[0].share, 60);
  assert.equal(result[1].recovered, 20);
  assert.equal(result[1].dealCount, 5);
  assert.equal(channelSourcePeriodLabel(result), '2026年1月-4月');
});

test('filters source performance by dashboard channel', () => {
  const result = buildChannelSourceBreakdown(rows, 'east');
  assert.deepEqual(result.map((row) => [row.name, row.recovered, row.share]), [['小红书', 8, 100]]);
});
