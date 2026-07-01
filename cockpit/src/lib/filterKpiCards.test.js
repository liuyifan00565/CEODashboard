/*
 更新时间: 2026-06-26 11:30:50
 更新内容: 增加费比 KPI 卡片大字展示百分比、副文案保留投入金额的回归测试。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getFilteredKpiCards, formatDateRangeLabel } from './filterKpiCards.js';

function byKey(cards, key) {
  return cards.find((card) => card.key === key);
}

test('keeps the default June monthly filter aligned with the existing mock KPI values', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const recovered = byKey(cards, 'month');
  const renewal = byKey(cards, 'renewal');

  assert.equal(recovered.value, 486);
  assert.equal(recovered.progress, 83.8);
  assert.equal(recovered.delta, 12.5);
  assert.match(recovered.sub, /2026-06-01 至 2026-06-30/);
  assert.equal(renewal.value, 75.4);
});

test('shows the cost ratio percentage as the main value on the cost card', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const cost = byKey(cards, 'cost');

  assert.equal(cost.value, 156);
  assert.equal(cost.unit, '万');
  assert.equal(cost.displayValue, 32.1);
  assert.equal(cost.displayUnit, '%');
  assert.equal(cost.displayDecimals, 1);
  assert.match(cost.sub, /总投入 156 万/);
  assert.match(cost.sub, /广告 96 万 \+ 人力 60 万/);
});

test('changes KPI card values when the calendar range changes', () => {
  const defaultCards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const shortRangeCards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-10'] });

  assert.notEqual(byKey(shortRangeCards, 'month').value, byKey(defaultCards, 'month').value);
  assert.notEqual(byKey(shortRangeCards, 'cost').sub, byKey(defaultCards, 'cost').sub);
  assert.match(byKey(shortRangeCards, 'month').sub, /2026-06-01 至 2026-06-10/);
});

test('changes KPI card values when the year-month-day granularity changes', () => {
  const monthCards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const yearCards = getFilteredKpiCards({ dim: 'year', dateRange: ['2026-06-01', '2026-06-30'] });
  const dayCards = getFilteredKpiCards({ dim: 'day', dateRange: ['2026-06-01', '2026-06-30'] });

  assert.equal(byKey(yearCards, 'month').title, '年度回款');
  assert.equal(byKey(dayCards, 'month').title, '日度回款');
  assert.ok(byKey(yearCards, 'month').value > byKey(monthCards, 'month').value);
  assert.ok(byKey(dayCards, 'month').value < byKey(monthCards, 'month').value);
  assert.notEqual(byKey(yearCards, 'renewal').value, byKey(dayCards, 'renewal').value);
});

test('formats incomplete or empty calendar selections for card subtitles', () => {
  assert.equal(formatDateRangeLabel([]), '2026-06-01 至 2026-06-30');
  assert.equal(formatDateRangeLabel(['2026-06-08']), '2026-06-08');
});
