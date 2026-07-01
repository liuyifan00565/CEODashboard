/*
 更新时间: 2026-06-29 11:34:00
 更新内容: 本月销售完成一级维度恢复为线上、线下华南、线下华东、代理，线下不再合并。
*/
import { calculateRenewalOverview, getRenewalChannelBreakdown } from '../lib/renewal.js';

export const META = {
  title: 'AI 客服销售经营驾驶舱',
  company: '成都福客人工智能',
  monthLabel: '2026 年 6 月',
  annualTarget: 5800, // 万元
};

// ===== 核心 KPI（经营总览，单位：万元）=====
export const KPI = {
  monthRecovered: 486,     // 本月回款
  monthTarget: 580,        // 本月目标
  lastMonthRecovered: 432, // 上月回款
  yearRecovered: 3120,     // 年度累计回款
  yearTarget: 5800,        // 年度目标
  lastYearSameRecovered: 2760, // 去年同期（年度环比用）
  totalCost: 156,          // 总投入费用（广告+人力）
  adCost: 96,              // 线上广告费
  laborCost: 60,           // 人力成本
  received: 486,           // 已回款
  receivable: 96,          // 应收/未回款
  // ROI = 赢单金额 / 广告费
};

export const KPI_DERIVED = {
  monthCompletion: +(KPI.monthRecovered / KPI.monthTarget * 100).toFixed(1), // 83.8
  monthGap: KPI.monthTarget - KPI.monthRecovered,                            // 94
  monthMoM: +((KPI.monthRecovered - KPI.lastMonthRecovered) / KPI.lastMonthRecovered * 100).toFixed(1), // +12.5
  yearCompletion: +(KPI.yearRecovered / KPI.yearTarget * 100).toFixed(1),    // 53.8
  yearGap: KPI.yearTarget - KPI.yearRecovered,                               // 2680
  yearYoY: +((KPI.yearRecovered - KPI.lastYearSameRecovered) / KPI.lastYearSameRecovered * 100).toFixed(1), // +13.0
  costRatio: +(KPI.totalCost / KPI.monthRecovered * 100).toFixed(1),         // 32.1 费比
  channelRoi: +(KPI.monthRecovered / KPI.totalCost).toFixed(2),              // 3.12 销售投入 ROI
  roi: +(KPI.monthRecovered / KPI.adCost).toFixed(2),                        // 5.06 ROI
};

// ===== 销售明细（4 个，单位：万元）=====
// 线下分华南/华东战区；城市仅作背景。
export const CHANNELS = [
  { key: 'online',  name: '线上',     recovered: 210, target: 240, warn: false },
  { key: 'south',   name: '华南线下', recovered: 96,  target: 110, warn: false, zone: '华南战区', cities: ['广州', '普宁'] },
  { key: 'east',    name: '华东线下', recovered: 84,  target: 120, warn: true,  zone: '华东战区', cities: ['杭州', '武汉'] },
  { key: 'agent',   name: '代理',     recovered: 96,  target: 110, warn: false },
].map(c => ({ ...c, completion: +(c.recovered / c.target * 100).toFixed(1) }));

export const CHANNEL_ROI = CHANNELS.map((channel) => {
  const investment = { online: 74, south: 28, east: 38, agent: 16 }[channel.key];
  const roi = +(channel.recovered / investment).toFixed(2);
  return {
    key: channel.key,
    name: channel.name,
    recovered: channel.recovered,
    investment,
    roi,
    costRatio: +(investment / channel.recovered * 100).toFixed(1),
    warn: roi < 2.5,
    strong: roi >= 4,
  };
}).sort((a, b) => b.roi - a.roi);

export const SALES_GROUPS = [
  { key: 'online', name: '线上', salesKeys: ['online'] },
  { key: 'south', name: '线下华南', salesKeys: ['south'] },
  { key: 'east', name: '线下华东', salesKeys: ['east'] },
  { key: 'agent', name: '代理', salesKeys: ['agent'] },
];

export const SALES_MEMBER_ROWS = [
  { key: 'online-01', group: 'online', name: '王丽英', target: 30, recovered: 29 },
  { key: 'online-02', group: 'online', name: '李思雨', target: 28, recovered: 26 },
  { key: 'online-03', group: 'online', name: '周明轩', target: 26, recovered: 24 },
  { key: 'online-04', group: 'online', name: '陈嘉禾', target: 25, recovered: 23 },
  { key: 'online-05', group: 'online', name: '赵一诺', target: 24, recovered: 22 },
  { key: 'online-06', group: 'online', name: '刘子昂', target: 23, recovered: 20 },
  { key: 'online-07', group: 'online', name: '林沐阳', target: 22, recovered: 18 },
  { key: 'online-08', group: 'online', name: '许清源', target: 21, recovered: 17 },
  { key: 'online-09', group: 'online', name: '何佳宁', target: 20, recovered: 16 },
  { key: 'online-10', group: 'online', name: '唐亦然', target: 21, recovered: 15 },
  { key: 'south-01', group: 'south', name: '杨磊', target: 36, recovered: 32 },
  { key: 'south-02', group: 'south', name: '郭嘉琪', target: 32, recovered: 27 },
  { key: 'south-03', group: 'south', name: '宋子涵', target: 24, recovered: 20 },
  { key: 'south-04', group: 'south', name: '秦若曦', target: 18, recovered: 17 },
  { key: 'east-01', group: 'east', name: '马骏', target: 34, recovered: 26 },
  { key: 'east-02', group: 'east', name: '朱雨桐', target: 30, recovered: 22 },
  { key: 'east-03', group: 'east', name: '罗一航', target: 28, recovered: 20 },
  { key: 'east-04', group: 'east', name: '沈知夏', target: 28, recovered: 16 },
  { key: 'agent-01', group: 'agent', name: '南唐代理', target: 26, recovered: 25 },
  { key: 'agent-02', group: 'agent', name: '蜀都伙伴', target: 24, recovered: 22 },
  { key: 'agent-03', group: 'agent', name: '华中伙伴', target: 22, recovered: 19 },
  { key: 'agent-04', group: 'agent', name: '西南伙伴', target: 20, recovered: 16 },
  { key: 'agent-05', group: 'agent', name: '华东伙伴', target: 18, recovered: 14 },
];

function withCompletion(row) {
  return {
    ...row,
    completion: row.target ? +((row.recovered / row.target) * 100).toFixed(1) : 0,
  };
}

function sortByCompletionDesc(rows) {
  return [...rows].sort((a, b) => b.completion - a.completion);
}

export function getSalesCompletionRows() {
  return sortByCompletionDesc(SALES_GROUPS.map((group) => {
    const target = group.salesKeys.reduce((sum, key) => sum + (findChannel(key)?.target ?? 0), 0);
    const recovered = group.salesKeys.reduce((sum, key) => sum + (findChannel(key)?.recovered ?? 0), 0);
    return withCompletion({
      key: group.key,
      name: group.name,
      target,
      recovered,
      warn: target ? recovered / target < 0.8 : false,
    });
  }));
}

export function getSalesMemberRows(groupKey = 'online') {
  return sortByCompletionDesc(SALES_MEMBER_ROWS
    .filter((row) => row.group === groupKey)
    .map((row) => withCompletion({
      key: row.key,
      name: row.name,
      target: row.target,
      recovered: row.recovered,
    })));
}

function findChannel(channelKey) {
  return CHANNELS.find((channel) => channel.key === channelKey) ?? null;
}

function ratioFor(channel, field, total) {
  return channel && total ? channel[field] / total : 1;
}

function scaledWhole(value, ratio) {
  return Math.max(0, Math.round(value * ratio));
}

function renewalRate(due, paid) {
  return due ? +((paid / due) * 100).toFixed(1) : 0;
}

export function getChannelRows(channelKey = 'all') {
  const channel = findChannel(channelKey);
  return channel ? [channel] : CHANNELS;
}

// ===== 产品版本（6 个，金额单位：万元）=====
export const VERSIONS = [
  { key: 'qihang', name: '启航版', price: 16800, units: 86, recovered: 144, mom: 8.2, currentRenewalDue: 156, currentRenewalPaid: 123 },
  { key: 'zhuoyue', name: '卓越版', price: 39800, units: 52, recovered: 207, mom: 15.4, currentRenewalDue: 232, currentRenewalPaid: 184 },
  { key: 'zhizun',  name: '至尊版', price: 99800, units: 14, recovered: 135, mom: -3.1, currentRenewalDue: 165, currentRenewalPaid: 130 },
  { key: 'custom', name: '定制版', price: 188000, units: 8, recovered: 150, mom: 11.6, currentRenewalDue: 72, currentRenewalPaid: 58 },
  { key: 'trial', name: '试用版', price: 0, units: 126, recovered: 18, mom: 26.4, currentRenewalDue: 18, currentRenewalPaid: 6 },
  { key: 'addon', name: '增购包', price: 6800, units: 64, recovered: 44, mom: 9.7, currentRenewalDue: 49, currentRenewalPaid: 42 },
].map((version) => ({
  ...version,
  currentRenewalRate: version.currentRenewalDue
    ? +(version.currentRenewalPaid / version.currentRenewalDue * 100).toFixed(1)
    : 0,
}));

export function getVersionRows(channelKey = 'all') {
  const channel = findChannel(channelKey);
  if (!channel) return VERSIONS;

  const recoveredRatio = ratioFor(channel, 'recovered', KPI.monthRecovered);
  return VERSIONS.map((version) => {
    const currentRenewalDue = scaledWhole(version.currentRenewalDue, recoveredRatio);
    const currentRenewalPaid = scaledWhole(version.currentRenewalPaid, recoveredRatio);
    return {
      ...version,
      units: scaledWhole(version.units, recoveredRatio),
      recovered: scaledWhole(version.recovered, recoveredRatio),
      currentRenewalDue,
      currentRenewalPaid,
      currentRenewalRate: renewalRate(currentRenewalDue, currentRenewalPaid),
    };
  });
}

function renewalPeriods(month) {
  const rate = month.due ? month.renewed / month.due : 0;
  const prevRate = month.prevDue ? month.prevRenewed / month.prevDue : 0;
  const yearDue = Math.round(month.due * 8.4);
  const yearPrevDue = Math.round(month.prevDue * 8.2);
  const dayDue = Math.max(1, Math.round(month.due / 6));
  const dayPrevDue = Math.max(1, Math.round(month.prevDue / 6));
  return {
    month,
    year: {
      due: yearDue,
      renewed: Math.round(yearDue * Math.min(rate + 0.025, 0.96)),
      revenue: Math.round(month.revenue * 8.1),
      prevDue: yearPrevDue,
      prevRenewed: Math.round(yearPrevDue * Math.max(prevRate - 0.01, 0)),
    },
    day: {
      due: dayDue,
      renewed: Math.round(dayDue * Math.max(rate - 0.045, 0)),
      revenue: Math.max(1, Math.round(month.revenue / 6)),
      prevDue: dayPrevDue,
      prevRenewed: Math.round(dayPrevDue * Math.max(prevRate - 0.03, 0)),
    },
  };
}

function renewalRow(channel, channelName, version, month) {
  return { channel, channelName, version, periods: renewalPeriods(month) };
}

// ===== 续费率（按销售明细 × 购买版本，金额单位：万元）=====
export const RENEWAL_ROWS = [
  renewalRow('online', '线上', 'qihang', { due: 38, renewed: 31, revenue: 52, prevDue: 36, prevRenewed: 29 }),
  renewalRow('online', '线上', 'zhuoyue', { due: 22, renewed: 18, revenue: 72, prevDue: 20, prevRenewed: 15 }),
  renewalRow('online', '线上', 'zhizun', { due: 6, renewed: 4, revenue: 40, prevDue: 7, prevRenewed: 5 }),
  renewalRow('south', '华南线下', 'qihang', { due: 19, renewed: 15, revenue: 25, prevDue: 18, prevRenewed: 13 }),
  renewalRow('south', '华南线下', 'zhuoyue', { due: 14, renewed: 11, revenue: 44, prevDue: 13, prevRenewed: 9 }),
  renewalRow('south', '华南线下', 'zhizun', { due: 4, renewed: 3, revenue: 30, prevDue: 4, prevRenewed: 3 }),
  renewalRow('east', '华东线下', 'qihang', { due: 21, renewed: 13, revenue: 22, prevDue: 20, prevRenewed: 15 }),
  renewalRow('east', '华东线下', 'zhuoyue', { due: 12, renewed: 7, revenue: 28, prevDue: 12, prevRenewed: 9 }),
  renewalRow('east', '华东线下', 'zhizun', { due: 3, renewed: 2, revenue: 20, prevDue: 3, prevRenewed: 2 }),
  renewalRow('agent', '代理', 'qihang', { due: 18, renewed: 14, revenue: 24, prevDue: 18, prevRenewed: 12 }),
  renewalRow('agent', '代理', 'zhuoyue', { due: 13, renewed: 10, revenue: 40, prevDue: 12, prevRenewed: 8 }),
  renewalRow('agent', '代理', 'zhizun', { due: 5, renewed: 4, revenue: 40, prevDue: 5, prevRenewed: 3 }),
];

export const RENEWAL_OVERVIEW = calculateRenewalOverview(RENEWAL_ROWS, { version: 'all', period: 'month' });

export function getRenewalModalData(version = 'all', period = 'month', channel = 'all') {
  return {
    overview: calculateRenewalOverview(RENEWAL_ROWS, { version, period, channel }),
    breakdown: getRenewalChannelBreakdown(RENEWAL_ROWS, { version, period, channel }),
  };
}

// ===== 月度经营趋势（近 6 个月，单位：万元）=====
export const MONTHLY_TREND = [
  { month: '1月', target: 480, recovered: 372 },
  { month: '2月', target: 480, recovered: 410 },
  { month: '3月', target: 520, recovered: 455 },
  { month: '4月', target: 540, recovered: 498 },
  { month: '5月', target: 560, recovered: 432 },
  { month: '6月', target: 580, recovered: 486 },
].map(m => ({ ...m, completion: +(m.recovered / m.target * 100).toFixed(1) }));

const ORDER_TYPE_TRENDS = {
  new: {
    online: [140, 152, 165, 180, 172, 150],
    south: [64, 70, 76, 82, 74, 66],
    east: [58, 62, 70, 76, 66, 56],
    agent: [60, 64, 70, 74, 66, 58],
  },
  renewal: {
    online: [38, 42, 45, 48, 50, 60],
    south: [22, 24, 26, 28, 30, 30],
    east: [20, 22, 24, 26, 28, 28],
    agent: [28, 30, 32, 34, 30, 38],
  },
};

const SALES_KEY_SET = new Set(CHANNELS.map((channel) => channel.key));

function normalizeSalesKeys(salesKeys) {
  const selected = Array.isArray(salesKeys)
    ? salesKeys.filter((key) => SALES_KEY_SET.has(key))
    : [];
  return selected.length ? selected : CHANNELS.map((channel) => channel.key);
}

function getOrderTypeMonthSeries({ salesKeys, orderType = 'new', metric = 'recovered' } = {}) {
  const safeKeys = normalizeSalesKeys(salesKeys);
  const source = ORDER_TYPE_TRENDS[orderType] ?? ORDER_TYPE_TRENDS.new;
  const costRatio = KPI.totalCost / KPI.monthRecovered;

  return MONTHLY_TREND.map((month, index) => {
    const recovered = safeKeys.reduce((sum, key) => sum + (source[key]?.[index] ?? 0), 0);
    const value = metric === 'cost' ? Math.round(recovered * costRatio) : recovered;
    return {
      label: month.month,
      value,
      prev: index === 0 ? Math.round(value * 0.9) : null,
    };
  }).map((point, index, list) => ({
    ...point,
    prev: point.prev ?? list[index - 1].value,
  }));
}

function getOrderTypeSeries({ metric, salesKeys, orderType, dim }) {
  const monthSeries = getOrderTypeMonthSeries({ metric, salesKeys, orderType });
  const latest = monthSeries.at(-1)?.value ?? 0;

  if (dim === 'year') {
    return ['2023', '2024', '2025', '2026'].map((label, index) => {
      const value = Math.round(latest * [6.8, 7.6, 8.3, 6.4][index]);
      return { label, value, prev: index === 0 ? Math.round(value * 0.86) : Math.round(latest * [6.8, 7.6, 8.3, 6.4][index - 1]) };
    });
  }

  if (dim === 'day') {
    const totalWeight = DAY_BASE.reduce((sum, value) => sum + value, 0);
    return DAY_BASE.map((weight, index) => {
      const value = Math.max(1, Math.round(latest * (weight / totalWeight)));
      return {
        label: `06-${String(index * 3 + 1).padStart(2, '0')}`,
        value,
        prev: Math.round(value * 0.9),
      };
    });
  }

  return monthSeries;
}

export function getChannelTrend(channelKey = 'all') {
  const channel = findChannel(channelKey);
  if (!channel) return MONTHLY_TREND;

  const recoveredRatio = ratioFor(channel, 'recovered', KPI.monthRecovered);
  const targetRatio = ratioFor(channel, 'target', KPI.monthTarget);
  return MONTHLY_TREND.map((month, index) => {
    const isLatest = index === MONTHLY_TREND.length - 1;
    const recovered = isLatest ? channel.recovered : scaledWhole(month.recovered, recoveredRatio);
    const target = isLatest ? channel.target : scaledWhole(month.target, targetRatio);
    return {
      ...month,
      recovered,
      target,
      completion: target ? +((recovered / target) * 100).toFixed(1) : 0,
    };
  });
}

// ===== KPI 二级卡片：按 销售维度 × 订单类型 × 年/月/日 的柱状数据 =====
// 兼容旧签名 getKpiSeries(metric, channel, dim)，新签名 getKpiSeries(metric, { salesKeys, orderType, dim })。
// 返回 {label, value, prev}[]，prev 用于环比。
const DAY_BASE = [62, 70, 55, 81, 74, 90, 68, 77, 84, 96];
export function getKpiSeries(metric, channelOrOptions = 'all', dim = 'month') {
  if (channelOrOptions && typeof channelOrOptions === 'object' && !Array.isArray(channelOrOptions)) {
    return getOrderTypeSeries({
      metric,
      salesKeys: channelOrOptions.salesKeys,
      orderType: channelOrOptions.orderType ?? 'new',
      dim: channelOrOptions.dim ?? dim,
    });
  }

  const channel = channelOrOptions;
  const channelRow = findChannel(channel);
  const chMul = channelRow ? ratioFor(channelRow, 'recovered', KPI.monthRecovered) : 1;
  if (dim === 'year') {
    return ['2023', '2024', '2025', '2026'].map((label, i) => ({
      label, value: Math.round([2180, 2760, 3380, 3120][i] * chMul),
      prev: Math.round([1800, 2180, 2760, 3380][i] * chMul),
    }));
  }
  if (dim === 'day') {
    return DAY_BASE.map((v, i) => ({
      label: `06-${String(i * 3 + 1).padStart(2, '0')}`,
      value: Math.round(v * chMul),
      prev: Math.round(v * 0.9 * chMul),
    }));
  }
  // month
  const trend = getChannelTrend(channel);
  return trend.map((m, i) => ({
    label: m.month,
    value: m.recovered,
    prev: i === 0 ? Math.round(m.recovered * 0.9) : trend[i - 1].recovered,
  }));
}

// KPI 卡片元信息（用于二级卡片标题/单位）
export const KPI_CARDS = [
  { key: 'month',  title: '本月回款', metric: 'recovered', unit: '万', value: KPI.monthRecovered, sub: `本月目标 ${KPI.monthTarget} 万`, progress: KPI_DERIVED.monthCompletion, progressLabel: '本月目标完成率', gap: KPI_DERIVED.monthGap, delta: KPI_DERIVED.monthMoM, keywords: ['本月回款', '回款', '目标', '完成率', '缺口'] },
  { key: 'year',   title: '年度累计回款', metric: 'recovered', unit: '万', value: KPI.yearRecovered, sub: `年度目标 ${KPI.yearTarget} 万`, progress: KPI_DERIVED.yearCompletion, progressLabel: '年度目标完成率', gap: KPI_DERIVED.yearGap, delta: KPI_DERIVED.yearYoY, keywords: ['年度累计', '年度', '年目标', '缺口'] },
  { key: 'cost',   title: '总投入 · 费比', metric: 'cost', unit: '万', value: KPI.totalCost, sub: `广告 ${KPI.adCost} 万 + 人力 ${KPI.laborCost} 万 · 费比 ${KPI_DERIVED.costRatio}%`, gap: null, delta: null, keywords: ['投入', '成本', '费比', '广告', '人力'] },
  { key: 'renewal', title: '续费率', metric: 'renewalRate', unit: '%', decimals: 1, value: RENEWAL_OVERVIEW.rate, sub: `到期 ${RENEWAL_OVERVIEW.due} 单 · 已续 ${RENEWAL_OVERVIEW.renewed} 单 · 续费 ${RENEWAL_OVERVIEW.revenue} 万`, progress: RENEWAL_OVERVIEW.rate, progressLabel: '当期续费率', gap: null, delta: RENEWAL_OVERVIEW.delta, keywords: ['续费率', '续费', '复购', '版本', '销售'] },
];

export const DELIVERY_TARGET_COUNT = 15;

const DELIVERY_ENGINEERS = [
  { key: 'delivery-01', name: '廖玉琼', orders: 18, prices: [9.98, 9.98, 3.98, 3.98, 1.68, 1.68, 3.98, 9.98, 3.98, 1.68, 3.98, 9.98, 1.68, 3.98, 1.68, 3.98, 9.98, 1.68] },
  { key: 'delivery-02', name: '张若溪', orders: 16, prices: [9.98, 3.98, 3.98, 1.68, 1.68, 3.98, 3.98, 9.98, 1.68, 3.98, 1.68, 3.98, 9.98, 3.98, 1.68, 3.98] },
  { key: 'delivery-03', name: '何书言', orders: 15, prices: [3.98, 3.98, 1.68, 1.68, 3.98, 3.98, 1.68, 3.98, 9.98, 1.68, 3.98, 1.68, 3.98, 3.98, 1.68] },
  { key: 'delivery-04', name: '苏明远', orders: 13, prices: [3.98, 1.68, 1.68, 3.98, 3.98, 1.68, 3.98, 1.68, 3.98, 1.68, 3.98, 1.68, 3.98] },
  { key: 'delivery-05', name: '周雨晴', orders: 11, prices: [1.68, 1.68, 3.98, 1.68, 3.98, 1.68, 1.68, 3.98, 1.68, 3.98, 1.68] },
];

function roundMoney(value) {
  return Math.round(value * 10) / 10;
}

export function getDeliveryRows() {
  return DELIVERY_ENGINEERS.map((row) => {
    const valuePerPerson = roundMoney(row.prices.reduce((sum, price) => sum + price, 0));
    const averageOrderPrice = roundMoney(valuePerPerson / row.orders);
    const completion = +((row.orders / DELIVERY_TARGET_COUNT) * 100).toFixed(1);
    return {
      key: row.key,
      name: row.name,
      deliveredCount: row.orders,
      targetCount: DELIVERY_TARGET_COUNT,
      averageOrderPrice,
      valuePerPerson,
      completion,
      warn: completion < 80,
    };
  }).sort((a, b) => b.completion - a.completion);
}

export function getDeliverySummary() {
  const rows = getDeliveryRows();
  const people = rows.length;
  const totalCount = rows.reduce((sum, row) => sum + row.deliveredCount, 0);
  const totalValue = rows.reduce((sum, row) => sum + row.valuePerPerson, 0);
  return {
    people,
    targetCount: DELIVERY_TARGET_COUNT,
    totalCount,
    averageCountPerPerson: people ? roundMoney(totalCount / people) : 0,
    averageValuePerPerson: people ? roundMoney(totalValue / people) : 0,
  };
}

// 侧边菜单
export const MENU = [
  { key: 'overview', name: '经营总览', channelKey: 'all' },
  { key: 'online', name: '线上销售分析', channelKey: 'online' },
  { key: 'south', name: '华南线下销售分析', channelKey: 'south' },
  { key: 'east', name: '华东线下销售分析', channelKey: 'east' },
  { key: 'agent', name: '代理销售分析', channelKey: 'agent' },
];

export function getDashboardChannelKey(menuKey = 'overview') {
  return MENU.find((item) => item.key === menuKey)?.channelKey ?? 'all';
}

export function getDashboardMenuLabel(menuKey = 'overview') {
  return MENU.find((item) => item.key === menuKey)?.name ?? MENU[0].name;
}
