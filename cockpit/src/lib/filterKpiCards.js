/*
 更新时间: 2026-07-03 11:28:32 CST
 更新内容: 将首页本年目标和本年渠道模块标题加入 KPI 搜索关键词，支持按“本年”定位年度卡片。
*/
/*
 更新时间: 2026-07-03 11:09:47 CST
 更新内容: 将 KPI 卡片可见标题和副文案并入搜索关键词，支持按“总投入”等页面文本定位卡片。
*/
/*
 更新时间: 2026-07-02 17:39:16 CST
 更新内容: 主 KPI 卡副文案移除日期区间显示，保留日期范围对指标数值的筛选影响。
*/
/*
 更新时间: 2026-07-01 12:26:40
 更新内容: 回款 KPI 副文案目标标签与目标金额换到同一行，并移除日期后的分隔点。
*/
import { CHANNEL_ROI, CHANNELS, KPI, KPI_CARDS, KPI_DERIVED, getRenewalModalData } from '../data/mock.js';

export const DEFAULT_FILTER_RANGE = ['2026-06-01', '2026-06-30'];

const DAY_MS = 24 * 60 * 60 * 1000;
const DIM_CONFIG = {
  year: {
    label: '年度',
    recovered: KPI.yearRecovered,
    target: KPI.yearTarget,
    previous: KPI.lastYearSameRecovered,
    cost: Math.round(KPI.totalCost * (KPI.yearRecovered / KPI.monthRecovered)),
    adCost: Math.round(KPI.adCost * (KPI.yearRecovered / KPI.monthRecovered)),
    laborCost: Math.round(KPI.laborCost * (KPI.yearRecovered / KPI.monthRecovered)),
    renewalPeriod: 'year',
  },
  month: {
    label: '月度',
    recovered: KPI.monthRecovered,
    target: KPI.monthTarget,
    previous: KPI.lastMonthRecovered,
    cost: KPI.totalCost,
    adCost: KPI.adCost,
    laborCost: KPI.laborCost,
    renewalPeriod: 'month',
  },
  day: {
    label: '日度',
    recovered: Math.round(KPI.monthRecovered / 7),
    target: Math.round(KPI.monthTarget / 7),
    previous: Math.round(KPI.lastMonthRecovered / 7),
    cost: Math.round(KPI.totalCost / 7),
    adCost: Math.round(KPI.adCost / 7),
    laborCost: Math.round(KPI.laborCost / 7),
    renewalPeriod: 'day',
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round0(value) {
  return Math.round(value);
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDateKey(input) {
  if (!input) return null;
  if (input instanceof Date && !Number.isNaN(input.getTime())) return formatDateKey(input);
  if (typeof input === 'string') {
    const match = input.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  return null;
}

function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function normalizeDateRange(dateRange) {
  const keys = Array.isArray(dateRange)
    ? dateRange.map(toDateKey).filter(Boolean).slice(0, 2)
    : [];
  if (!keys.length) return [...DEFAULT_FILTER_RANGE];
  if (keys.length === 1) return [keys[0]];
  return [...keys].sort();
}

export function formatDateRangeLabel(dateRange) {
  const range = normalizeDateRange(dateRange);
  if (range.length === 1) return range[0];
  return `${range[0]} 至 ${range[1]}`;
}

function isDefaultRange(range) {
  return range.length === 2 && range[0] === DEFAULT_FILTER_RANGE[0] && range[1] === DEFAULT_FILTER_RANGE[1];
}

function getDateRangeFactor(dateRange) {
  const range = normalizeDateRange(dateRange);
  if (isDefaultRange(range)) return 1;

  const start = parseDateKey(range[0]);
  const end = parseDateKey(range[1] ?? range[0]);
  const days = Math.max(1, Math.round((end - start) / DAY_MS) + 1);
  const spanRatio = clamp(days / 30, 0.04, 1.25);
  const phase = ((start.getDate() % 6) - 2) * 0.015 + ((end.getDate() % 5) - 2) * 0.012;

  return round2(clamp(0.58 + spanRatio * 0.48 + phase, 0.28, 1.24));
}

function scaled(value, factor) {
  return Math.max(1, round0(value * factor));
}

function completion(recovered, target) {
  return target ? round1((recovered / target) * 100) : 0;
}

function delta(current, previous) {
  return previous ? round1(((current - previous) / previous) * 100) : 0;
}

function getChannelContext(channelKey) {
  const channel = CHANNELS.find((item) => item.key === channelKey);
  if (!channel) {
    return {
      channelKey: 'all',
      channel: null,
      recoveredRatio: 1,
      targetRatio: 1,
      investmentRatio: 1,
      investment: KPI.totalCost,
    };
  }

  const investment = CHANNEL_ROI.find((item) => item.key === channel.key)?.investment
    ?? Math.round(KPI.totalCost * (channel.recovered / KPI.monthRecovered));
  return {
    channelKey: channel.key,
    channel,
    recoveredRatio: channel.recovered / KPI.monthRecovered,
    targetRatio: channel.target / KPI.monthTarget,
    investmentRatio: investment / KPI.totalCost,
    investment,
  };
}

function getScopedDimConfig(dim, context) {
  const base = DIM_CONFIG[dim] ?? DIM_CONFIG.month;
  if (context.channelKey === 'all') return base;

  if (dim === 'month') {
    return {
      ...base,
      recovered: context.channel.recovered,
      target: context.channel.target,
      previous: scaled(KPI.lastMonthRecovered, context.recoveredRatio),
      cost: context.investment,
      adCost: context.investment,
      laborCost: 0,
    };
  }

  return {
    ...base,
    recovered: scaled(base.recovered, context.recoveredRatio),
    target: scaled(base.target, context.targetRatio),
    previous: scaled(base.previous, context.recoveredRatio),
    cost: scaled(base.cost, context.investmentRatio),
    adCost: scaled(base.adCost, context.investmentRatio),
    laborCost: scaled(base.laborCost, context.investmentRatio),
  };
}

function createRenewalCard(baseCard, dim, factor, channelKey) {
  const config = DIM_CONFIG[dim] ?? DIM_CONFIG.month;
  const overview = getRenewalModalData('all', config.renewalPeriod, channelKey).overview;
  const adjustedRate = round1(clamp(overview.rate + (factor - 1) * 8, 0, 99));
  const adjustedPrevRate = round1(clamp(overview.prevRate + (factor - 1) * 6, 0, 99));
  const due = scaled(overview.due, factor);
  const renewed = Math.min(due, round0(due * (adjustedRate / 100)));
  const revenue = scaled(overview.revenue, factor);

  return {
    ...baseCard,
    title: dim === 'month' ? baseCard.title : `${config.label}续费率`,
    value: adjustedRate,
    sub: `到期 ${due} 单 · 已续 ${renewed} 单 · 续费 ${revenue} 万`,
    progress: adjustedRate,
    delta: round1(adjustedRate - adjustedPrevRate),
    channelKey,
  };
}

function targetSub(targetLabel, target) {
  return `${targetLabel} ${target} 万`;
}

function withVisibleKeywords(baseKeywords, ...visibleTerms) {
  return Array.from(new Set([
    ...(baseKeywords ?? []),
    ...visibleTerms,
  ].filter((term) => String(term ?? '').trim()).map(String)));
}

function recoverySectionKeywords(cardKey) {
  if (cardKey === 'year') return ['本年', '本年目标完成情况', '本年渠道完成情况'];
  if (cardKey === 'month') return ['本月', '本月目标完成情况', '本月渠道完成情况'];
  return [];
}

export function getFilteredKpiCards({ dim = 'month', dateRange = DEFAULT_FILTER_RANGE, channel = 'all' } = {}) {
  const safeDim = DIM_CONFIG[dim] ? dim : 'month';
  const channelContext = getChannelContext(channel);
  const config = getScopedDimConfig(safeDim, channelContext);
  const factor = getDateRangeFactor(dateRange);

  const recovered = scaled(config.recovered, factor);
  const target = scaled(config.target, factor);
  const previous = scaled(config.previous, factor * (factor === 1 ? 1 : 0.96));
  const cumulativeBase = safeDim === 'month'
    ? round0(KPI.yearRecovered * channelContext.recoveredRatio)
    : config.recovered;
  const cumulativeTargetBase = safeDim === 'month'
    ? round0(KPI.yearTarget * channelContext.targetRatio)
    : config.target;
  const cumulativePrevBase = safeDim === 'month'
    ? round0(KPI.lastYearSameRecovered * channelContext.recoveredRatio)
    : config.previous;
  const cumulativeRecovered = scaled(cumulativeBase, factor);
  const cumulativeTarget = scaled(cumulativeTargetBase, factor);
  const cumulativePrevious = scaled(cumulativePrevBase, factor * (factor === 1 ? 1 : 0.96));
  const cost = scaled(config.cost, factor);
  const adCost = scaled(config.adCost, factor);
  const laborCost = scaled(config.laborCost, factor);
  const costRatio = recovered ? round1((cost / recovered) * 100) : KPI_DERIVED.costRatio;
  const costSub = channelContext.channelKey === 'all'
    ? `总投入 ${cost} 万 · 广告 ${adCost} 万 + 人力 ${laborCost} 万`
    : `销售投入 ${cost} 万 · 费比 ${costRatio}%`;

  const cardsByKey = new Map(KPI_CARDS.map((card) => [card.key, card]));
  const monthCard = cardsByKey.get('month');
  const yearCard = cardsByKey.get('year');
  const costCard = cardsByKey.get('cost');
  const renewalCard = cardsByKey.get('renewal');

  const monthTitle = safeDim === 'month' ? monthCard?.title : `${config.label}回款`;
  const monthSub = targetSub(`${config.label}目标`, target);
  const monthProgressLabel = `${config.label}目标完成率`;
  const yearTitle = safeDim === 'month' ? yearCard?.title : `${config.label}累计回款`;
  const yearSub = targetSub(safeDim === 'month' ? '年度目标' : `${config.label}目标`, cumulativeTarget);
  const yearProgressLabel = `${config.label}累计完成率`;
  const costTitle = safeDim === 'month' ? costCard?.title : `${config.label}投入 · 费比`;

  return [
    {
      ...monthCard,
      title: monthTitle,
      value: recovered,
      sub: monthSub,
      progress: completion(recovered, target),
      progressLabel: monthProgressLabel,
      gap: Math.max(target - recovered, 0),
      delta: delta(recovered, previous),
      channelKey: channelContext.channelKey,
      keywords: withVisibleKeywords(monthCard.keywords, ...recoverySectionKeywords('month'), monthTitle, monthSub, monthProgressLabel),
    },
    {
      ...yearCard,
      title: yearTitle,
      value: cumulativeRecovered,
      sub: yearSub,
      progress: completion(cumulativeRecovered, cumulativeTarget),
      progressLabel: yearProgressLabel,
      gap: Math.max(cumulativeTarget - cumulativeRecovered, 0),
      delta: delta(cumulativeRecovered, cumulativePrevious),
      channelKey: channelContext.channelKey,
      keywords: withVisibleKeywords(yearCard.keywords, ...recoverySectionKeywords('year'), yearTitle, yearSub, yearProgressLabel),
    },
    {
      ...costCard,
      title: costTitle,
      value: cost,
      unit: '万',
      displayValue: costRatio,
      displayUnit: '%',
      displayDecimals: 1,
      sub: costSub,
      channelKey: channelContext.channelKey,
      keywords: withVisibleKeywords(costCard.keywords, costTitle, costSub, `${cost} 万`, `${costRatio}%`),
    },
    createRenewalCard(renewalCard, safeDim, factor, channelContext.channelKey),
  ];
}
