/*
 更新时间: 2026-07-05 15:29:01 CST
 更新内容: KPI 搜索关键词回归测试同步年度风险预测与渠道完成情况新文案。
*/
/*
 更新时间: 2026-07-03 23:39:28 CST
 更新内容: 增加年度回款卡累计完成率文案必须显示“年度累计完成率”的回归测试。
*/
/*
 更新时间: 2026-07-03 11:28:32 CST
 更新内容: 增加“本年”可通过首页年度模块标题命中年度回款卡的回归测试。
*/
/*
 更新时间: 2026-07-03 11:09:47 CST
 更新内容: 增加“总投入”可通过主页可见卡片文本命中费比卡的回归测试。
*/
/*
 更新时间: 2026-07-02 17:38:31 CST
 更新内容: 增加主 KPI 卡副文案不显示日期区间的回归测试。
*/
/*
 更新时间: 2026-07-01 12:26:40
 更新内容: 增加回款 KPI 副文案目标标签与目标金额同行且移除日期分隔点的回归测试。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getFilteredKpiCards, formatDateRangeLabel } from './filterKpiCards.js';

function byKey(cards, key) {
  return cards.find((card) => card.key === key);
}

function expectNoMainCardDateRange(cards) {
  for (const card of cards) {
    assert.doesNotMatch(String(card.sub ?? ''), /\d{4}-\d{2}-\d{2} 至 \d{4}-\d{2}-\d{2}/);
  }
}

test('keeps the default June monthly filter aligned with the existing mock KPI values', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const recovered = byKey(cards, 'month');
  const renewal = byKey(cards, 'renewal');

  assert.equal(recovered.value, 486);
  assert.equal(recovered.progress, 83.8);
  assert.equal(recovered.delta, 12.5);
  expectNoMainCardDateRange(cards);
  assert.equal(renewal.value, 75.4);
});

test('places monthly and annual target labels on the same subtitle line as their amounts', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const recovered = byKey(cards, 'month');
  const annual = byKey(cards, 'year');

  assert.equal(recovered.sub, '月度目标 580 万');
  assert.equal(annual.sub, '年度目标 5800 万');
  assert.equal(annual.progressLabel, '年度累计完成率');
  assert.notEqual(annual.progressLabel, '月度累计完成率');
  assert.doesNotMatch(recovered.sub, / · /);
  assert.doesNotMatch(annual.sub, / · /);
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

test('adds visible card text to KPI search keywords so total investment can be located', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const cost = byKey(cards, 'cost');

  assert.ok(cost.keywords.some((keyword) => String(keyword).includes('总投入')));
  assert.ok(cost.keywords.some((keyword) => String(keyword).includes('总投入 156 万')));
});

test('adds homepage annual section text to KPI search keywords so current year can be located', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const annual = byKey(cards, 'year');

  assert.ok(annual.keywords.includes('本年'));
  assert.ok(annual.keywords.includes('本年目标完成情况'));
  assert.ok(annual.keywords.includes('年度风险预测'));
  assert.ok(!annual.keywords.includes('本年渠道完成情况'));
});

test('changes KPI card values when the calendar range changes', () => {
  const defaultCards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const shortRangeCards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-10'] });

  assert.notEqual(byKey(shortRangeCards, 'month').value, byKey(defaultCards, 'month').value);
  assert.notEqual(byKey(shortRangeCards, 'cost').sub, byKey(defaultCards, 'cost').sub);
  expectNoMainCardDateRange(shortRangeCards);
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
