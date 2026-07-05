/*
 更新时间: 2026-07-05 18:20:00 CST
 更新内容: 增加经营总览渠道完成本月/年度行和年度节奏点位回归测试。
*/
/*
 更新时间: 2026-07-03 18:54:17 CST
 更新内容: 将维护页目标完成率状态断言调整为 80 以下 danger、80-99 warning、100 及以上 good。
*/
/*
 更新时间: 2026-07-03 10:25:18 CST
 更新内容: 增加维护页目标完成率超过 80% 才变色的回归测试。
*/
/*
 更新时间: 2026-07-02 18:27:24 CST
 更新内容: 增加数据维护导航栏四个业务图标名称的回归测试。
*/
/*
 更新时间: 2026-07-02 16:25:57 CST
 更新内容: 增加数据维护模式四个新界面的数据结构回归测试。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHANNELS,
  CHANNEL_MAINTENANCE_GROUPS,
  CHANNEL_MAINTENANCE_SOURCES,
  COST_MAINTENANCE_CHANNELS,
  COST_MAINTENANCE_ROWS,
  DELIVERY_TARGET_COUNT,
  LABOR_COST_MAINTENANCE_ROWS,
  MAINTENANCE_MENU,
  MAINTENANCE_PERIOD_COLUMNS,
  MENU,
  ORG_MAINTENANCE_DEPARTMENTS,
  ORG_MAINTENANCE_USERS,
  SALES_GROUPS,
  TARGET_MAINTENANCE_ORG_TREE,
  TARGET_MAINTENANCE_ROWS,
  VERSIONS,
  getComputeCustomerRows,
  getComputeOverview,
  getComputeResourceHealth,
  getComputeUsageDistribution,
  getComputeUsageTrend,
  getComputeVersionConsumption,
  getChannelRows,
  getChannelTrend,
  getChannelCompletionRows,
  getAnnualRhythmPoints,
  getDashboardChannelKey,
  getDeliveryRows,
  getDeliverySummary,
  getKpiSeries,
  getMaintenancePageMeta,
  getSalesCompletionRows,
  getSalesMemberRows,
  getVersionRows,
} from './mock.js';
import { getFilteredKpiCards } from '../lib/filterKpiCards.js';

function byKey(rows, key) {
  return rows.find((row) => row.key === key);
}

test('defines only overview and compute usage menu entries in the sidebar', () => {
  assert.deepEqual(
    MENU.map((item) => item.name),
    ['经营总览', '算力用量分析']
  );
  assert.deepEqual(
    MENU.map((item) => getDashboardChannelKey(item.key)),
    ['all', 'all']
  );
});

test('defines the four data maintenance sidebar entries separately from the main dashboard menu', () => {
  assert.deepEqual(
    MAINTENANCE_MENU.map((item) => item.name),
    ['目标维护', '成本维护', '组织维护', '渠道维护']
  );
  assert.deepEqual(
    MAINTENANCE_MENU.map((item) => item.key),
    ['target-maintenance', 'cost-maintenance', 'org-maintenance', 'channel-maintenance']
  );
  assert.deepEqual(
    MAINTENANCE_MENU.map((item) => item.icon),
    ['target', 'cost', 'organization', 'channel']
  );
  assert.deepEqual(
    MENU.map((item) => item.name),
    ['经营总览', '算力用量分析']
  );
});

test('defines maintenance period columns matching the reference yearly matrix', () => {
  assert.deepEqual(
    MAINTENANCE_PERIOD_COLUMNS.map((column) => column.label),
    ['全年', '第一季度', '1月', '2月', '3月', '第二季度', '4月', '5月', '6月', '第三季度', '7月', '8月', '9月', '第四季度', '10月', '11月', '12月']
  );
  assert.deepEqual(
    MAINTENANCE_PERIOD_COLUMNS.filter((column) => column.month).map((column) => column.key),
    ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12']
  );
});

test('returns page metadata for all four maintenance screens', () => {
  assert.deepEqual(
    MAINTENANCE_MENU.map((item) => getMaintenancePageMeta(item.key).title),
    ['目标维护', '成本维护', '组织维护', '渠道维护']
  );
  assert.equal(getMaintenancePageMeta('target-maintenance').scope, '所有部门');
  assert.equal(getMaintenancePageMeta('cost-maintenance').scope, '全部渠道');
  assert.equal(getMaintenancePageMeta('org-maintenance').scope, 'BI销售 21 人 / 卫瓴人员 28 人');
  assert.equal(getMaintenancePageMeta('channel-maintenance').scope, '卫瓴线索来源字典');
  assert.equal(getMaintenancePageMeta('unknown').title, '目标维护');
});

test('provides target maintenance organization tree and editable user rows', () => {
  assert.equal(TARGET_MAINTENANCE_ORG_TREE.name, '成都福客人工智能');
  assert.ok(TARGET_MAINTENANCE_ORG_TREE.children.length >= 3);
  assert.ok(TARGET_MAINTENANCE_ROWS.some((row) => row.type === 'department'));
  assert.ok(TARGET_MAINTENANCE_ROWS.some((row) => row.type === 'user'));
  assert.ok(TARGET_MAINTENANCE_ROWS.every((row) => row.periods.year.target >= row.periods.q1.target));
  assert.ok(TARGET_MAINTENANCE_ROWS.filter((row) => row.type === 'user').every((row) => row.periods.m06.actual >= 0));
});

test('classifies target maintenance progress as red, purple, or gold by completion tier', () => {
  const onlineSales = TARGET_MAINTENANCE_ROWS.find((row) => row.id === 'online-sales');
  const allDepartments = TARGET_MAINTENANCE_ROWS.find((row) => row.id === 'summary-all');

  assert.equal(onlineSales.periods.m01.pct, 80);
  assert.equal(onlineSales.periods.m01.status, 'warning');
  assert.equal(onlineSales.periods.m05.pct, 85.1);
  assert.equal(onlineSales.periods.m05.status, 'warning');
  assert.equal(allDepartments.periods.m05.pct, 77.1);
  assert.equal(allDepartments.periods.m05.status, 'danger');
  assert.equal(allDepartments.periods.m06.pct, 83.8);
  assert.equal(allDepartments.periods.m06.status, 'warning');
});

test('provides cost maintenance channel rows and labor cost rows', () => {
  assert.ok(COST_MAINTENANCE_CHANNELS.some((channel) => channel.name === '全部渠道'));
  assert.ok(COST_MAINTENANCE_CHANNELS.some((channel) => channel.kind === '大类'));
  assert.ok(COST_MAINTENANCE_ROWS.every((row) => row.periods.m06.cost >= 0));
  assert.ok(COST_MAINTENANCE_ROWS.every((row) => row.periods.m06.actual >= 0));
  assert.deepEqual(
    LABOR_COST_MAINTENANCE_ROWS.map((row) => row.name),
    ['销售部人力成本', '市场部人力成本']
  );
  assert.ok(LABOR_COST_MAINTENANCE_ROWS.every((row) => row.periods.year.cost > row.periods.m06.cost));
});

test('provides organization maintenance departments and BI users', () => {
  assert.ok(ORG_MAINTENANCE_DEPARTMENTS.some((dept) => dept.name === '线上销售部'));
  assert.ok(ORG_MAINTENANCE_DEPARTMENTS.some((dept) => dept.parentId));
  assert.ok(ORG_MAINTENANCE_USERS.every((user) => user.name && user.sourceUserId));
  assert.ok(ORG_MAINTENANCE_USERS.some((user) => user.isSales && user.enabled));
  assert.ok(ORG_MAINTENANCE_USERS.some((user) => !user.enabled));
});

test('provides channel maintenance groups and source mappings', () => {
  assert.ok(CHANNEL_MAINTENANCE_GROUPS.some((group) => group.name === '付费流量'));
  assert.ok(CHANNEL_MAINTENANCE_GROUPS.some((group) => group.parentId));
  assert.ok(CHANNEL_MAINTENANCE_SOURCES.every((source) => source.code && source.name));
  assert.ok(CHANNEL_MAINTENANCE_SOURCES.some((source) => source.groupId === 'group_paid_flow'));
  assert.ok(CHANNEL_MAINTENANCE_SOURCES.some((source) => source.excluded));
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

test('returns operating overview channel rows for monthly and annual period switches', () => {
  const monthRows = getChannelCompletionRows('month');
  const yearRows = getChannelCompletionRows('year');

  assert.deepEqual(monthRows.map((row) => row.name), ['线上', '线下华南', '代理', '线下华东']);
  assert.equal(monthRows.find((row) => row.key === 'online').recovered, 210);
  assert.equal(monthRows.find((row) => row.key === 'online').target, 240);
  assert.equal(monthRows.find((row) => row.key === 'east').completion, 70);
  assert.equal(monthRows.find((row) => row.key === 'east').status, '需关注');
  assert.ok(monthRows.filter((row) => row.status === '需关注').every((row) => row.key === 'east'));
  assert.equal(monthRows.reduce((sum, row) => sum + row.recovered, 0), 486);
  assert.ok(monthRows.find((row) => row.key === 'online').annualContribution > 43);

  assert.equal(yearRows.find((row) => row.key === 'online').recovered, Math.round(3120 * (210 / 486)));
  assert.equal(yearRows.find((row) => row.key === 'online').target, 2400);
  assert.equal(yearRows.find((row) => row.key === 'east').status, '需关注');
  assert.ok(yearRows.every((row) => row.period === 'year'));
});

test('returns lightweight annual rhythm points anchored to the annual KPI values', () => {
  const points = getAnnualRhythmPoints();

  assert.deepEqual(points.map((point) => point.label), ['1月', '6月', '12月目标']);
  assert.equal(points.find((point) => point.label === '6月').value, 3120);
  assert.equal(points.find((point) => point.label === '12月目标').value, 5800);
  assert.equal(points.find((point) => point.label === '6月').tone, 'current');
  assert.equal(points.find((point) => point.label === '12月目标').tone, 'target');
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
