/*
 更新时间: 2026-07-13 16:48:56 CST
 更新内容: 总投入费比卡片文案回归改为运营/人力成本构成。
*/
/*
 更新时间: 2026-07-10 14:50:00 CST
 更新内容: 默认日期范围回归改为运行时当前自然月，不再要求 2026 年 6 月整月。
*/
/*
 更新时间: 2026-07-09 13:14:23 CST
 更新内容: 搜索关键词回归同步点击查看入口和半环未完成占位。
*/
/*
 更新时间: 2026-07-09 12:19:47 CST
 更新内容: 搜索关键词回归同步年度回款总览卡和底部年度目标进度 footer 文案。
*/
/*
 更新时间: 2026-07-09 12:02:57 CST
 更新内容: 搜索关键词回归同步删除独立风险渠道卡片词，保留行内风险标签命中。
*/
/*
 更新时间: 2026-07-09 11:58:00 CST
 更新内容: 搜索关键词回归移除时间进度和月目标进度条词，匹配收窄后的月度回款主卡。
*/
/*
 更新时间: 2026-07-09 11:43:19 CST
 更新内容: 搜索关键词回归同步月度回款主卡，要求本月回款结构和实际/目标词命中且旧渠道结构词移除。
*/
/*
 更新时间: 2026-07-09 10:52:02 CST
 更新内容: 搜索关键词回归同步渠道目标完成结构新标题，避免继续命中旧渠道表格名称。
*/
/*
 更新时间: 2026-07-08 18:22:00 CST
 更新内容: 总投入费比搜索与卡片文案回归同步当前渠道投入、全渠道总投入和广告/人力构成口径。
*/
/*
 更新时间: 2026-07-08 17:23:00 CST
 更新内容: 默认日期范围回归到 2026 年 6 月整月，并保留经营进度搜索关键词跟随运行时月份的回归测试。
*/
/*
 更新时间: 2026-07-07 15:25:00 CST
 更新内容: 移除"影响月度缺口 36万"搜索关键词断言，该关键词随经营摘要一并删除。
*/
/*
 更新时间: 2026-07-06 17:29:34 CST
 更新内容: 搜索关键词测试同步年度进度胶囊条，覆盖完成率、剩余率和下半年月均。
*/
/*
 更新时间: 2026-07-05 22:59:45 CST
 更新内容: 搜索关键词同步年度节奏最终版，保留辅助说明并移除不可见节奏偏差和年度贡献。
*/
/*
 更新时间: 2026-07-05 21:24:15 CST
 更新内容: 搜索关键词测试同步经营进度顶部精简文案，覆盖查看近期明细、领先节奏和风险完成率。
*/
/*
 更新时间: 2026-07-05 19:10:30 CST
 更新内容: 搜索关键词回归测试补充经营节奏、预计影响缺口、剩余月均和年度贡献等高密度看板词。
*/
/*
 更新时间: 2026-07-05 18:20:00 CST
 更新内容: 搜索关键词回归测试改为经营进度总览、年度节奏和唯一渠道完成情况。
*/
/*
 更新时间: 2026-07-05 16:12:00 CST
 更新内容: KPI 搜索关键词回归测试移除年度风险预测旧文案并保留渠道完成情况。
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

import { META } from '../data/mock.js';
import { DEFAULT_FILTER_RANGE, getFilteredKpiCards, formatDateRangeLabel } from './filterKpiCards.js';

function byKey(cards, key) {
  return cards.find((card) => card.key === key);
}

function expectNoMainCardDateRange(cards) {
  for (const card of cards) {
    assert.doesNotMatch(String(card.sub ?? ''), /\d{4}-\d{2}-\d{2} 至 \d{4}-\d{2}-\d{2}/);
  }
}

function currentMonthRange(date = new Date()) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const month = String(monthIndex + 1).padStart(2, '0');
  const lastDay = String(new Date(year, monthIndex + 1, 0).getDate()).padStart(2, '0');
  return [`${year}-${month}-01`, `${year}-${month}-${lastDay}`];
}

test('keeps full-month filters aligned with the existing mock KPI values', () => {
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
  assert.match(cost.sub, /全渠道总投入 156 万/);
  assert.match(cost.sub, /运营 96 万 \+ 人力 60 万/);
});

test('marks channel cost cards as current channel investment with all-channel total context', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'], channel: 'online' });
  const cost = byKey(cards, 'cost');

  assert.equal(cost.value, 48);
  assert.match(cost.sub, /当前渠道投入 48 万/);
  assert.match(cost.sub, /全渠道总投入 156 万/);
});

test('adds visible card text to KPI search keywords so total investment can be located', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const cost = byKey(cards, 'cost');

  assert.ok(cost.keywords.some((keyword) => String(keyword).includes('总投入')));
  assert.ok(cost.keywords.some((keyword) => String(keyword).includes('全渠道总投入 156 万')));
});

test('adds fused operating overview section text to KPI search keywords', () => {
  const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
  const month = byKey(cards, 'month');
  const annual = byKey(cards, 'year');

  assert.ok(month.keywords.includes(`${META.monthLabel}经营进度`));
  assert.ok(month.keywords.includes('点击查看近期明细'));
  assert.ok(month.keywords.includes('风险'));
  assert.ok(month.keywords.includes('未完成'));
  assert.ok(!month.keywords.includes('查看近期明细'));
  assert.ok(!month.keywords.includes('风险渠道'));
  assert.ok(month.keywords.includes('完成率 70%'));
  assert.ok(month.keywords.includes('本月回款结构'));
  assert.ok(month.keywords.includes('经营情况'));
  assert.ok(month.keywords.includes('实际回款'));
  assert.ok(month.keywords.includes('目标回款'));
  assert.ok(month.keywords.includes('超额完成'));
  assert.ok(!month.keywords.includes('时间进度'));
  assert.ok(!month.keywords.includes('月目标进度'));
  assert.ok(!month.keywords.includes('领先 7.1%'));
  assert.ok(!month.keywords.includes('本月目标完成情况'));
  assert.ok(annual.keywords.includes('年度回款总览'));
  assert.ok(annual.keywords.includes('年度累计回款'));
  assert.ok(annual.keywords.includes('年度回款结构'));
  assert.ok(annual.keywords.includes('年度完成率'));
  assert.ok(annual.keywords.includes('年目标完成率'));
  assert.ok(annual.keywords.includes('剩余目标'));
  assert.ok(annual.keywords.includes('点击查看年度拆解'));
  assert.ok(annual.keywords.includes('年度目标进度'));
  assert.ok(annual.keywords.includes('未完成'));
  assert.ok(!annual.keywords.includes('查看年度拆解'));
  assert.ok(annual.keywords.includes('时间进度 50.0%'));
  assert.ok(annual.keywords.includes('高于线性进度 3.8pp'));
  assert.ok(annual.keywords.includes('后续月均需完成 447万'));
  assert.ok(annual.keywords.includes('经营情况'));
  assert.ok(annual.keywords.includes('年度回款'));
  assert.ok(annual.keywords.includes('风险'));
  assert.ok(!annual.keywords.includes('年度节奏'));
  assert.ok(!annual.keywords.includes('已完成 53.8%'));
  assert.ok(!annual.keywords.includes('剩余 46.2%'));
  assert.ok(!annual.keywords.includes('下半年月均需完成 447 万'));
  assert.ok(!annual.keywords.includes('节奏偏差 +3.8%'));
  assert.ok(!annual.keywords.includes('月均仍需完成'));
  assert.ok(!month.keywords.includes('渠道目标完成结构'));
  assert.ok(!annual.keywords.includes('渠道目标完成结构'));
  assert.ok(!annual.keywords.includes('本月回款结构'));
  assert.ok(!annual.keywords.includes('渠道完成情况'));
  assert.ok(!annual.keywords.includes('年度贡献'));
  assert.ok(!annual.keywords.includes('本年目标完成情况'));
  assert.ok(!annual.keywords.includes('年度风险预测'));
});

test('uses runtime month label in operating overview search keywords', () => {
  const previousMonthLabel = META.monthLabel;
  META.monthLabel = '2026年7月';
  try {
    const cards = getFilteredKpiCards({ dim: 'month', dateRange: ['2026-06-01', '2026-06-30'] });
    const month = byKey(cards, 'month');

    assert.ok(month.keywords.includes('2026年7月经营进度'));
    assert.ok(!month.keywords.includes('2026年6月经营进度'));
  } finally {
    META.monthLabel = previousMonthLabel;
  }
});

test('uses the current calendar month as the default filter range', () => {
  assert.deepEqual(DEFAULT_FILTER_RANGE, currentMonthRange());
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
  assert.equal(formatDateRangeLabel([]), `${DEFAULT_FILTER_RANGE[0]} 至 ${DEFAULT_FILTER_RANGE[1]}`);
  assert.equal(formatDateRangeLabel(['2026-06-08']), '2026-06-08');
});
