/*
 更新时间: 2026-07-14 14:30:00 CST
 更新内容: 新增售前试用交付演示数据的合计、转化口径、环比、负载、未分配与渠道筛选回归测试。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_PRESALE_TRIAL_MONTH,
  DELIVERY_CAPACITY_LIMIT,
  PRESALE_TRIAL_MONTH_OPTIONS,
  buildComparisonRows,
  calculateConversionRate,
  filterConversionRows,
  formatComparisonChange,
  getStaffLoadState,
  loadPresaleTrialDashboard,
} from './presaleTrialDelivery.js';

function sum(rows, field) {
  return rows.reduce((total, row) => total + row[field], 0);
}

function byKey(rows, key) {
  return rows.find((row) => row.key === key);
}

test('exposes July as the default and only offers complete July and June snapshots', () => {
  assert.equal(DEFAULT_PRESALE_TRIAL_MONTH, '2026-07');
  assert.equal(DELIVERY_CAPACITY_LIMIT, 14);
  assert.deepEqual(PRESALE_TRIAL_MONTH_OPTIONS, [
    { value: '2026-07', label: '本月' },
    { value: '2026-06', label: '上月' },
  ]);
});

test('July distribution, stages and KPI cohort all reconcile to the locked business totals', async () => {
  const snapshot = await loadPresaleTrialDashboard();

  assert.equal(snapshot.monthKey, '2026-07');
  assert.equal(snapshot.previousMonthLabel, '2026年6月');
  assert.equal(snapshot.updatedAt, '2026-07-14 10:30');
  assert.equal(snapshot.kpis.currentTrials, 60);
  assert.equal(sum(snapshot.distribution, 'count'), 60);
  assert.equal(sum(snapshot.distribution, 'expectedAmountWan'), 82.4);
  assert.equal(sum(snapshot.stages, 'count'), 60);
  assert.equal(snapshot.kpis.convertedCustomers, 12);
  assert.equal(snapshot.kpis.conversionCohort, 26);
  assert.equal(snapshot.kpis.conversionRate, 46.2);
  assert.equal(calculateConversionRate(12, 26), 46.2);
});

test('July channel conversion rows use their own mature cohort and retain given values', async () => {
  const { conversion } = await loadPresaleTrialDashboard('2026-07');

  assert.deepEqual(
    conversion.channel.map(({ name, conversionRate }) => [name, conversionRate]),
    [['华东', 58.3], ['华南', 30], ['线上直营', 50], ['代理渠道', 16.7]],
  );
  assert.equal(sum(conversion.channel, 'currentTrials'), 60);
  assert.equal(sum(conversion.channel, 'cohortStarted'), 36);
  assert.equal(sum(conversion.channel, 'closedDeals'), 15);
  assert.equal(sum(conversion.channel, 'expectedAmountWan'), 82.4);
});

test('July comparison changes are calculated with percentage, percentage-point and day units', async () => {
  const { comparisonRows } = await loadPresaleTrialDashboard('2026-07');

  assert.deepEqual(
    comparisonRows.map(({ key, changeLabel, status, statusTone }) => ({ key, changeLabel, status, statusTone })),
    [
      { key: 'newTrials', changeLabel: '+20.0%', status: '增长', statusTone: 'good' },
      { key: 'convertedCustomers', changeLabel: '+33.3%', status: '增长', statusTone: 'good' },
      { key: 'conversionRate', changeLabel: '+7.1pp', status: '改善', statusTone: 'good' },
      { key: 'expectedAmountWan', changeLabel: '+20.1%', status: '增长', statusTone: 'good' },
      { key: 'urgentRisk', changeLabel: '-37.5%', status: '改善', statusTone: 'good' },
      { key: 'averageTrialDays', changeLabel: '-1.6天', status: '改善', statusTone: 'good' },
    ],
  );
  assert.equal(byKey(comparisonRows, 'conversionRate').currentLabel, '46.2%');
  assert.equal(byKey(comparisonRows, 'conversionRate').previousLabel, '39.1%');
});

test('June comparison is generated dynamically from the May-only baseline', async () => {
  const snapshot = await loadPresaleTrialDashboard('2026-06');

  assert.equal(snapshot.kpis.currentTrials, 52);
  assert.equal(snapshot.previousMonthLabel, '2026年5月');
  assert.equal(snapshot.updatedAt, '2026-07-14 10:30');
  assert.equal(sum(snapshot.distribution, 'count'), 52);
  assert.equal(sum(snapshot.distribution, 'expectedAmountWan'), 68.6);
  assert.equal(sum(snapshot.stages, 'count'), 52);
  assert.deepEqual(
    snapshot.comparisonRows.map((row) => row.changeLabel),
    ['+15.4%', '+28.6%', '+4.1pp', '+12.1%', '-20.0%', '-0.9天'],
  );
  assert.ok(snapshot.comparisonRows.every((row) => row.statusTone === 'good'));
});

test('comparison helpers judge direction by metric meaning rather than numeric sign alone', () => {
  assert.deepEqual(formatComparisonChange('urgentRisk', 5, 8), {
    changeLabel: '-37.5%',
    status: '改善',
    statusTone: 'good',
  });
  assert.deepEqual(formatComparisonChange('conversionRate', 39.1, 46.2), {
    changeLabel: '-7.1pp',
    status: '恶化',
    statusTone: 'risk',
  });

  const rows = buildComparisonRows(
    { newTrials: 10, convertedCustomers: 5, conversionRate: 40, expectedAmountWan: 20, urgentRisk: 3, averageTrialDays: 10 },
    { newTrials: 10, convertedCustomers: 5, conversionRate: 40, expectedAmountWan: 20, urgentRisk: 3, averageTrialDays: 10 },
  );
  assert.ok(rows.every((row) => row.status === '持平' && row.statusTone === 'neutral'));
});

test('staff load states are derived from the 14-customer capacity threshold', async () => {
  const snapshot = await loadPresaleTrialDashboard('2026-07');

  assert.deepEqual(
    snapshot.staffLoads.map(({ name, loadRatio, loadStatus, loadTone }) => ({ name, loadRatio, loadStatus, loadTone })),
    [
      { name: '陈晨', loadRatio: 78.6, loadStatus: '正常', loadTone: 'good' },
      { name: '赵晴', loadRatio: 92.9, loadStatus: '偏高', loadTone: 'warn' },
      { name: '韩宇', loadRatio: 107.1, loadStatus: '超负荷', loadTone: 'risk' },
      { name: '周宁', loadRatio: 71.4, loadStatus: '正常', loadTone: 'good' },
      { name: '秦佳', loadRatio: 64.3, loadStatus: '正常', loadTone: 'good' },
    ],
  );
  assert.deepEqual(getStaffLoadState(14), { loadRatio: 100, loadStatus: '偏高', loadTone: 'warn' });
  assert.deepEqual(getStaffLoadState(15), { loadRatio: 107.1, loadStatus: '超负荷', loadTone: 'risk' });
});

test('assigned staff plus unassigned owners reconcile to all current July trials', async () => {
  const snapshot = await loadPresaleTrialDashboard('2026-07');

  assert.equal(sum(snapshot.staffLoads, 'currentAssigned'), 58);
  assert.equal(snapshot.unassignedOwners, 2);
  assert.equal(sum(snapshot.staffLoads, 'currentAssigned') + snapshot.unassignedOwners, snapshot.kpis.currentTrials);
  assert.equal(sum(snapshot.staffLoads, 'converted'), 12);
  assert.equal(sum(snapshot.staffLoads, 'overdue'), 5);
});

test('channel filter applies to channel and team views without mutating source rows', async () => {
  const { conversion } = await loadPresaleTrialDashboard('2026-07');
  const allRows = filterConversionRows(conversion.channel, 'all');
  const eastChannel = filterConversionRows(conversion.channel, 'east');
  const eastTeam = filterConversionRows(conversion.team, 'east');

  assert.notEqual(allRows, conversion.channel);
  assert.deepEqual(allRows, conversion.channel);
  assert.deepEqual(eastChannel.map((row) => row.name), ['华东']);
  assert.deepEqual(eastTeam.map((row) => row.name), ['华东战区']);
  assert.deepEqual(filterConversionRows(conversion.channel, 'missing'), []);
});

test('loader returns isolated snapshots and exposes missing months as an empty state', async () => {
  const first = await loadPresaleTrialDashboard('2026-07');
  first.kpis.currentTrials = 999;
  first.distribution[0].count = 999;

  const second = await loadPresaleTrialDashboard('2026-07');
  assert.equal(second.kpis.currentTrials, 60);
  assert.equal(second.distribution[0].count, 18);
  assert.equal(await loadPresaleTrialDashboard('2026-05'), null);
});
