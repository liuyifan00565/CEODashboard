/*
 更新时间: 2026-07-01 16:29:11 CST
 更新内容: 回归测试补充算力趋势按年/月/日倒序展示，月/日维度提供超过 30 项用于拖动窗口。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHANNELS,
  DELIVERY_TARGET_COUNT,
  MENU,
  SALES_GROUPS,
  VERSIONS,
  getComputeCustomerRows,
  getComputeOverview,
  getComputeResourceHealth,
  getComputeUsageDistribution,
  getComputeUsageTrend,
  getComputeVersionConsumption,
  getChannelRows,
  getChannelTrend,
  getDashboardChannelKey,
  getDeliveryRows,
  getDeliverySummary,
  getKpiSeries,
  getSalesCompletionRows,
  getSalesMemberRows,
  getVersionRows,
} from './mock.js';
import { getFilteredKpiCards } from '../lib/filterKpiCards.js';

function byKey(rows, key) {
  return rows.find((row) => row.key === key);
}

test('defines CEO overview, channel analysis, and compute usage menu entries', () => {
  assert.deepEqual(
    MENU.map((item) => item.name),
    ['经营总览', '线上销售分析', '华南线下销售分析', '华东线下销售分析', '代理销售分析', '算力用量分析']
  );
  assert.deepEqual(
    MENU.map((item) => getDashboardChannelKey(item.key)),
    ['all', 'online', 'south', 'east', 'agent', 'all']
  );
});

test('returns compute dashboard metrics, trend, pie slices, and customer rows from the reference dashboard', () => {
  const overview = getComputeOverview();
  const trend = getComputeUsageTrend();
  const versions = getComputeVersionConsumption();
  const distribution = getComputeUsageDistribution();
  const customers = getComputeCustomerRows();

  assert.deepEqual(
    {
      totalCapacity: overview.totalCapacity,
      addedCapacity: overview.addedCapacity,
      consumedCapacity: overview.consumedCapacity,
      customerCount: overview.customerCount,
      customerUsage: overview.customerUsage,
      averageReplyRate: overview.averageReplyRate,
    },
    {
      totalCapacity: 2650773741,
      addedCapacity: 449249887,
      consumedCapacity: 139751667,
      customerCount: 5558,
      customerUsage: 34186157,
      averageReplyRate: 70,
    }
  );

  assert.equal(trend.length, 29);
  assert.deepEqual(trend[0], { day: '06-02', usage: 468, addOn: 16, capacity: 2360 });
  assert.deepEqual(trend.at(-1), { day: '06-30', usage: 536, addOn: 18, capacity: 2600 });
  assert.deepEqual(versions.map((item) => item.name), ['试用版', '企业版', '旗舰版', '免费版', '卓越版', '创世版', '至尊版ultra', '启航版']);
  assert.equal(versions.reduce((sum, item) => sum + item.value, 0), 110);
  assert.equal(distribution[0].name, '算力用量=0');
  assert.equal(distribution.at(-1).name, '算力用量>10000');
  assert.equal(customers[0].phone, '150****1491');
  assert.equal(customers[0].usage, 2010190);
  assert.ok(customers.every((customer, index, list) => index === 0 || list[index - 1].usage >= customer.usage));
});

test('returns compute resource utilization rows for every visible usage scene', () => {
  const rows = getComputeResourceHealth();

  assert.deepEqual(
    rows.map((row) => row.name),
    ['自动回复', '商品同步', '会眼智宝', '视频识别', '后置回复拦截', '对话测试']
  );
  assert.ok(rows.every((row) => row.usage > 0));
  assert.ok(rows.every((row) => row.color && row.tone));
});

test('returns compute usage trend by 7-day, 30-day, and half-year periods', () => {
  const sevenDays = getComputeUsageTrend('7d');
  const thirtyDays = getComputeUsageTrend('30d');
  const halfYear = getComputeUsageTrend('half-year');

  assert.equal(sevenDays.length, 7);
  assert.equal(sevenDays[0].day, '06-24');
  assert.equal(sevenDays.at(-1).day, '06-30');
  assert.equal(thirtyDays.length, 29);
  assert.equal(thirtyDays[0].day, '06-02');
  assert.equal(thirtyDays.at(-1).day, '06-30');
  assert.deepEqual(halfYear.map((point) => point.day), ['1月', '2月', '3月', '4月', '5月', '6月']);
  assert.ok(halfYear.every((point) => point.target > point.usage));
});

test('links compute usage trend to year month day filters and selected date range', () => {
  const dayRows = getComputeUsageTrend({ dim: 'day', dateRange: ['2026-06-01', '2026-06-30'] });
  const monthRows = getComputeUsageTrend({ dim: 'month', dateRange: ['2026-06-10', '2026-06-18'] });
  const yearRows = getComputeUsageTrend({ dim: 'year', dateRange: ['2026-06-01', '2026-06-30'] });
  const crossYearDayRows = getComputeUsageTrend({ dim: 'day', dateRange: ['2025-12-29', '2026-01-03'] });

  assert.equal(dayRows.length, 30);
  assert.equal(dayRows[0].day, '06-30');
  assert.equal(dayRows.at(-1).day, '06-01');
  assert.equal(dayRows[0].range, '2026-06-30');
  assert.ok(monthRows.length > 30);
  assert.deepEqual(monthRows.slice(0, 4).map((point) => point.day), ['2026.06', '2026.05', '2026.04', '2026.03']);
  assert.deepEqual(yearRows.map((point) => point.day), ['2026年', '2025年', '2024年', '2023年', '2022年']);
  assert.deepEqual(crossYearDayRows.map((point) => point.day), ['01-03', '01-02', '01-01', '2025-12-31', '2025-12-30', '2025-12-29']);
});

test('filters KPI cards to the selected channel while overview keeps all-channel totals', () => {
  const overviewCards = getFilteredKpiCards({ dim: 'month', channel: 'all' });
  const onlineCards = getFilteredKpiCards({ dim: 'month', channel: 'online' });
  const eastCards = getFilteredKpiCards({ dim: 'month', channel: 'east' });
  const online = byKey(CHANNELS, 'online');

  assert.equal(byKey(overviewCards, 'month').value, 486);
  assert.equal(byKey(onlineCards, 'month').value, online.recovered);
  assert.equal(byKey(onlineCards, 'month').progress, online.completion);
  assert.match(byKey(onlineCards, 'cost').sub, /销售投入 74 万/);
  assert.notEqual(byKey(eastCards, 'year').value, byKey(overviewCards, 'year').value);
  assert.equal(byKey(eastCards, 'year').value, Math.round(3120 * (84 / 486)));
});

test('returns channel-scoped trend, channel completion, and version rows', () => {
  const allChannelRows = getChannelRows('all');
  const eastChannelRows = getChannelRows('east');
  const eastTrend = getChannelTrend('east');
  const eastVersions = getVersionRows('east');

  assert.equal(allChannelRows.length, 4);
  assert.deepEqual(eastChannelRows.map((row) => row.key), ['east']);
  assert.equal(eastTrend.at(-1).recovered, byKey(CHANNELS, 'east').recovered);
  assert.equal(eastTrend.at(-1).target, byKey(CHANNELS, 'east').target);
  assert.equal(eastVersions.length, VERSIONS.length);
  assert.ok(eastVersions.every((version) => version.recovered <= byKey(VERSIONS, version.key).recovered));
});

test('returns sales completion rows grouped as online south offline east offline and agent', () => {
  assert.deepEqual(SALES_GROUPS.map((item) => item.name), ['线上', '线下华南', '线下华东', '代理']);

  const rows = getSalesCompletionRows();
  assert.deepEqual([...rows.map((row) => row.name)].sort(), ['代理', '线上', '线下华东', '线下华南']);
  assert.ok(rows.some((row) => row.key === 'agent'));
  assert.ok(rows.every((row) => !row.name.includes('渠道')));
  assert.ok(rows.every((row, index, list) => index === 0 || list[index - 1].completion >= row.completion));
});

test('returns sorted sales member rows with personal targets and progress', () => {
  const onlineMembers = getSalesMemberRows('online');

  assert.equal(onlineMembers.length, 10);
  assert.ok(onlineMembers.every((member) => member.name && member.target > 0 && member.recovered >= 0));
  assert.ok(onlineMembers.every((member, index, list) => index === 0 || list[index - 1].completion >= member.completion));
  assert.deepEqual(
    Object.keys(onlineMembers[0]).sort(),
    ['completion', 'key', 'name', 'recovered', 'target'].sort()
  );
});

test('combines selected sales keys and order type in KPI series', () => {
  const allNew = getKpiSeries('recovered', { dim: 'month', salesKeys: ['online', 'south', 'east', 'agent'], orderType: 'new' });
  const withoutEast = getKpiSeries('recovered', { dim: 'month', salesKeys: ['online', 'south', 'agent'], orderType: 'new' });
  const allRenewal = getKpiSeries('recovered', { dim: 'month', salesKeys: ['online', 'south', 'east', 'agent'], orderType: 'renewal' });

  assert.equal(allNew.length, 6);
  assert.ok(allNew.at(-1).value > withoutEast.at(-1).value);
  assert.notEqual(allNew.at(-1).value, allRenewal.at(-1).value);
  assert.ok(allNew.every((point) => typeof point.prev === 'number'));
});

test('returns delivery rows and summary against the 15 order monthly target', () => {
  const rows = getDeliveryRows();
  const summary = getDeliverySummary();

  assert.equal(DELIVERY_TARGET_COUNT, 15);
  assert.ok(rows.every((row) => row.targetCount === DELIVERY_TARGET_COUNT));
  assert.ok(rows.every((row) => row.averageOrderPrice > 0 && row.valuePerPerson > 0));
  assert.ok(rows.some((row) => row.completion < 80));
  assert.equal(summary.targetCount, DELIVERY_TARGET_COUNT);
  assert.equal(summary.people, rows.length);
  assert.ok(summary.averageValuePerPerson > 0);
});
