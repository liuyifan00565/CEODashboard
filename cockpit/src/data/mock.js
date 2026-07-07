/*
 更新时间: 2026-07-07 15:25:00 CST
 更新内容: 移除经营总览 monthJudgement / annualJudgement 摘要字段，页面不再显示模板拼接的摘要句。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 支持真实 MySQL dashboard 快照覆盖运行时数据，页面加载后不再固定使用 mock 数字。
*/
/*
 更新时间: 2026-07-06 17:29:34 CST
 更新内容: 年度节奏数据移除折线序列，仅保留胶囊条所需节奏点和剩余率。
*/
/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: 模拟数据展示色收敛为银紫玫瑰、香槟目标、玫瑰风险与柔和辅助色，移除硬蓝和青绿主视觉。
*/
/*
 更新时间: 2026-07-06 00:00:13 CST
 更新内容: 模拟数据中的金色图表色同步为高级哑金与灰金高光。
*/
/*
 更新时间: 2026-07-05 22:59:45 CST
 更新内容: 年度节奏辅助说明补充剩余月份字段，支持最终版单行说明。
*/
/*
 更新时间: 2026-07-05 21:45:08 CST
 更新内容: 渠道完成行补充本月缺口和年度缺口，支持本月/年度表格按维度展示。
*/
/*
 更新时间: 2026-07-05 19:10:30 CST
 更新内容: 增加经营总览节奏判断指标、年度实线/目标虚线序列和渠道本月年度融合行字段。
*/
/*
 更新时间: 2026-07-05 18:20:00 CST
 更新内容: 增加经营总览融合页的渠道完成本月/年度行和年度节奏轻量点位数据。
*/
/*
 更新时间: 2026-07-05 15:29:01 CST
 更新内容: 演示图表风险色同步低饱和玫瑰色，减少红色报错感。
*/
/*
 更新时间: 2026-07-03 18:54:17 CST
 更新内容: 维护页目标完成率状态改为 80 以下 danger、80-99 warning、100 及以上 good。
*/
/*
 更新时间: 2026-07-03 18:19:59 CST
 更新内容: 将算力与资源 mock 图表色同步为黑曜石月光紫高级配色，移除旧黄橙红蓝散色。
*/
/*
 更新时间: 2026-07-03 15:41:00 CST
 更新内容: 算力用量图例演示色值同步为冷紫/薰衣草品牌体系。
*/
/*
 更新时间: 2026-07-03 11:09:47 CST
 更新内容: 修正开户数搜索关键词，避免“今日”误命中本月开户数。
*/
/*
 更新时间: 2026-07-03 10:25:18 CST
 更新内容: 将维护页目标完成率进度条变色阈值调整为超过 80% 才高亮。
*/
/*
 更新时间: 2026-07-02 18:27:24 CST
 更新内容: 为数据维护导航栏四个入口补充统一 AppIcon 业务图标名称。
*/
/*
 更新时间: 2026-07-02 18:10:27 CST
 更新内容: 合并 GitHub 数据维护演示数据与本地菜单、月份格式改动。
*/
/*
 更新时间: 2026-07-02 17:13:39 CST
 更新内容: 将顶部品牌副标题月份格式改为 2026年6月，匹配 CEO 视角标题。
*/
/*
 更新时间: 2026-07-02 10:18:00 CST
 更新内容: 侧边导航移除销售分析入口，仅保留经营总览和算力用量分析。
*/
/*
 更新时间: 2026-07-02 16:25:57 CST
 更新内容: 新增数据维护四个界面的前端演示数据结构。
*/
import { calculateRenewalOverview, getRenewalChannelBreakdown } from '../lib/renewal.js';

export const META = {
  title: 'AI 客服销售经营驾驶舱',
  company: '成都福客人工智能',
  monthLabel: '2026年6月',
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

export const OPERATING_OVERVIEW_METRICS = {
  monthTimeProgress: 76.7,
  monthPaceDelta: 7.1,
  riskImpactGap: 36,
  annualTimeProgress: 50.0,
  annualPaceDelta: 3.8,
  annualRemainingRate: +(100 - KPI_DERIVED.yearCompletion).toFixed(1),
  remainingMonths: 6,
  remainingMonthlyRequired: Math.round(KPI_DERIVED.yearGap / 6),
};

// ===== 开户数趋势（经营总览，单位：户）=====
export const OPENING_ACCOUNT_METRICS = [
  { key: 'month-openings', title: '本月开户数', metric: 'monthOpenings', value: 126, unit: '户', delta: 8.2, compareLabel: '较上月', keywords: ['开户', '本月开户数'] },
  { key: 'today-openings', title: '今日开户数', metric: 'todayOpenings', value: 9, unit: '户', delta: 12.5, compareLabel: '较昨日', keywords: ['开户', '今日开户数'] },
];

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

export function getChannelCompletionRows(period = 'month', channelKey = 'all') {
  const safePeriod = period === 'year' ? 'year' : 'month';
  const selectedChannel = findChannel(channelKey);
  const sourceGroups = selectedChannel
    ? SALES_GROUPS.filter((group) => group.salesKeys.includes(selectedChannel.key))
    : SALES_GROUPS;
  const monthRecoveredTotal = KPI.monthRecovered || 1;
  const monthTargetTotal = KPI.monthTarget || 1;

  const rows = sourceGroups.map((group) => {
    const monthRecovered = group.salesKeys.reduce((sum, key) => sum + (findChannel(key)?.recovered ?? 0), 0);
    const monthTarget = group.salesKeys.reduce((sum, key) => sum + (findChannel(key)?.target ?? 0), 0);
    const monthCompletion = monthTarget ? +((monthRecovered / monthTarget) * 100).toFixed(1) : 0;
    const yearRecovered = Math.round(KPI.yearRecovered * (monthRecovered / monthRecoveredTotal));
    const yearTarget = Math.round(KPI.yearTarget * (monthTarget / monthTargetTotal));
    const yearCompletion = yearTarget ? +((yearRecovered / yearTarget) * 100).toFixed(1) : 0;
    const monthGap = Math.max(0, monthTarget - monthRecovered);
    const yearGap = Math.max(0, yearTarget - yearRecovered);
    const recovered = safePeriod === 'year' ? yearRecovered : monthRecovered;
    const target = safePeriod === 'year' ? yearTarget : monthTarget;
    const warn = group.salesKeys.some((key) => Boolean(findChannel(key)?.warn));

    return withCompletion({
      key: group.key,
      name: group.name,
      period: safePeriod,
      target,
      recovered,
      monthRecovered,
      monthTarget,
      monthCompletion,
      monthGap,
      yearRecovered,
      yearTarget,
      yearCompletion,
      yearGap,
      annualContribution: KPI.yearRecovered ? +((yearRecovered / KPI.yearRecovered) * 100).toFixed(1) : 0,
      status: warn ? '需关注' : '正常',
      warn,
    });
  });

  const normalRows = rows.filter((row) => !row.warn).sort((a, b) => b.completion - a.completion);
  const warnRows = rows.filter((row) => row.warn).sort((a, b) => b.completion - a.completion);

  return [...normalRows, ...warnRows];
}

export function getOperatingOverviewMetrics() {
  return { ...OPERATING_OVERVIEW_METRICS };
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

// ===== 算力用量分析（参考原算力看板，算力单位为点，趋势单位为万点）=====
export const COMPUTE_OVERVIEW = {
  totalCapacity: 2650773741,
  addedCapacity: 449249887,
  consumedCapacity: 139751667,
  customerCount: 5558,
  customerUsage: 34186157,
  customerBalance: 2650773741,
  newCustomers: 52,
  newStores: 1174,
  averageReplyRate: 70,
  totalCustomers: 4905,
};

const COMPUTE_DAYS = Array.from({ length: 29 }, (_, index) => `06-${String(index + 2).padStart(2, '0')}`);
const COMPUTE_USAGE = [468, 462, 459, 442, 435, 444, 452, 438, 458, 453, 429, 423, 456, 486, 492, 487, 504, 423, 441, 468, 482, 477, 471, 455, 466, 486, 496, 512, 536];
const COMPUTE_ADD_ON = [16, 14, 13, 11, 10, 12, 11, 9, 14, 12, 10, 8, 12, 18, 16, 15, 17, 8, 10, 13, 14, 13, 12, 10, 12, 14, 15, 16, 18];
const COMPUTE_CAPACITY = [2360, 2380, 2376, 2382, 2392, 2388, 2394, 2401, 2410, 2408, 2417, 2440, 2438, 2434, 2441, 2480, 2501, 2512, 2510, 2515, 2512, 2522, 2534, 2540, 2552, 2570, 2582, 2578, 2600];
const COMPUTE_DEFAULT_RANGE = ['2026-06-01', '2026-06-30'];
const COMPUTE_YEAR = '2026';
const COMPUTE_YEAR_NUMBER = Number(COMPUTE_YEAR);
const COMPUTE_LOOKBACK_YEARS = 5;
const COMPUTE_LOOKBACK_MONTHS = 36;

export const COMPUTE_USAGE_TREND = COMPUTE_DAYS.map((day, index) => ({
  day,
  usage: COMPUTE_USAGE[index],
  addOn: COMPUTE_ADD_ON[index],
  capacity: COMPUTE_CAPACITY[index],
}));
const COMPUTE_USAGE_TREND_BY_DATE = new Map(COMPUTE_USAGE_TREND.map((row) => [computeTrendDateKey(row.day), row]));
export const COMPUTE_HALF_YEAR_TREND = [
  { day: '1月', usage: 2380, addOn: 82, capacity: 19860, target: 2860 },
  { day: '2月', usage: 2515, addOn: 88, capacity: 20940, target: 2920 },
  { day: '3月', usage: 2660, addOn: 94, capacity: 22180, target: 3060 },
  { day: '4月', usage: 2810, addOn: 101, capacity: 23620, target: 3240 },
  { day: '5月', usage: 2590, addOn: 78, capacity: 24740, target: 3040 },
  { day: '6月', usage: 3010, addOn: 112, capacity: 26000, target: 3420 },
];

export const COMPUTE_VERSION_CONSUMPTION = [
  { name: '试用版', value: 2, color: '#94A3B8' },
  { name: '企业版', value: 3, color: '#C9A96B' },
  { name: '旗舰版', value: 5, color: '#E3D2A4' },
  { name: '免费版', value: 3, color: '#F06A8B' },
  { name: '卓越版', value: 37, color: '#8E86FF' },
  { name: '创世版', value: 28, color: '#B89CFF' },
  { name: '至尊版ultra', value: 1, color: '#E4B8D7' },
  { name: '启航版', value: 31, color: '#D9D1FF' },
];

export const COMPUTE_USAGE_DISTRIBUTION = [
  { name: '算力用量=0', value: 75, color: '#94A3B8' },
  { name: '0<算力用量<=100', value: 3, color: '#C9A96B' },
  { name: '100<算力用量<=1000', value: 5, color: '#F06A8B' },
  { name: '1000<算力用量<=5000', value: 7, color: '#E4B8D7' },
  { name: '5000<算力用量<=10000', value: 5, color: '#B89CFF' },
  { name: '算力用量>10000', value: 10, color: '#8E86FF' },
];

export const COMPUTE_CUSTOMER_ROWS = [
  { phone: '150****1491', owner: '一本官方旗舰店-开心图书-周维', accountType: '至尊版pro', salesOwner: '雪姐', successOwner: '龙涛', usage: 2010190, balance: 7783896, averageReplyRate: 81 },
  { phone: '187****8478', owner: 'XNDSFK-主账号', accountType: '定制尊享版', salesOwner: '雪姐虾米', successOwner: '小管家灵灵', usage: 656964, balance: 64577177, averageReplyRate: 61 },
  { phone: '158****7950', owner: '春雨牧童旗舰店-斗半匠', accountType: '至尊版', salesOwner: '雪姐', successOwner: '小管家昭昭', usage: 589933, balance: 1108058, averageReplyRate: 86 },
  { phone: '188****0298', owner: '上海弘智科技发展有限公司-孟秀英', accountType: '至尊版pro', salesOwner: '李莉', successOwner: '小管家灵灵', usage: 556213, balance: 8224138, averageReplyRate: 56 },
  { phone: '137****5114', owner: '美的总部', accountType: '定制尊享版', salesOwner: '黄俊伟', successOwner: '陈敬丰', usage: 491937, balance: 36143629, averageReplyRate: 63 },
  { phone: '173****3531', owner: '宁波塔塔-波咯咯母婴旗舰店-方奕敏', accountType: '至尊版', salesOwner: '李莉', successOwner: '小管家昭昭', usage: 480535, balance: 4291374, averageReplyRate: 54 },
  { phone: '189****4175', owner: '玺承福客ai-李浩创世版对接群', accountType: '至尊版pro', salesOwner: '糖宝', successOwner: '小管家灵灵', usage: 417875, balance: 5738763, averageReplyRate: 74 },
  { phone: '153****5080', owner: 'kocotree旗舰店-章珍珍-kk', accountType: '至尊版pro', salesOwner: '雪姐', successOwner: '小管家灵灵', usage: 412499, balance: 10188917, averageReplyRate: 82 },
  { phone: '139****5342', owner: '猫人家纺旗舰店', accountType: '至尊版', salesOwner: '李莉', successOwner: '陈映全', usage: 396419, balance: 790946, averageReplyRate: 80 },
  { phone: '187****6226', owner: '多方达-叶旭挺', accountType: '至尊版pro', salesOwner: '雪姐', successOwner: '小管家灵灵', usage: 389098, balance: 2552717, averageReplyRate: 75 },
];

export const COMPUTE_RESOURCE_HEALTH = [
  { key: 'reply', name: '自动回复', usage: 57.4, trend: '+6.8%', state: '高频稳定', tone: 'good', color: '#8E86FF' },
  { key: 'sync', name: '商品同步', usage: 18.9, trend: '+2.1%', state: '增长可控', tone: 'neutral', color: '#B89CFF' },
  { key: 'smart-eye', name: '会眼智宝', usage: 10.8, trend: '+1.6%', state: '稳态调用', tone: 'neutral', color: '#D9D1FF' },
  { key: 'vision', name: '视频识别', usage: 9.6, trend: '-1.4%', state: '低峰运行', tone: 'neutral', color: '#E4B8D7' },
  { key: 'guard', name: '后置回复拦截', usage: 6.8, trend: '+0.9%', state: '需关注', tone: 'warn', color: '#F06A8B' },
  { key: 'dialog-test', name: '对话测试', usage: 5.2, trend: '+0.4%', state: '轻量验证', tone: 'neutral', color: '#C9A96B' },
];

export function getComputeOverview() {
  return COMPUTE_OVERVIEW;
}

function computeTrendDateKey(day) {
  return `${COMPUTE_YEAR}-${day}`;
}

function parseDateKey(key) {
  const [year, month, day] = String(key).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function computeMonthIndex(dateKey) {
  const [year, month] = String(dateKey).split('-').map(Number);
  return year * 12 + month - 1;
}

function computeMonthFromIndex(index) {
  return {
    year: Math.floor(index / 12),
    month: index % 12 + 1,
  };
}

function formatComputeDayLabel(dateKey) {
  return dateKey.startsWith(`${COMPUTE_YEAR}-`) ? dateKey.slice(5) : dateKey;
}

function formatComputeMonthLabel(year, month) {
  return `${year}.${String(month).padStart(2, '0')}`;
}

function normalizeComputeDateKey(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${value.getFullYear()}-${month}-${day}`;
  }

  if (typeof value === 'string') {
    const matched = value.match(/\d{4}-\d{2}-\d{2}/);
    if (matched) return matched[0];
  }

  return null;
}

function normalizeComputeDateRange(dateRange) {
  const keys = (Array.isArray(dateRange) ? dateRange : [])
    .map(normalizeComputeDateKey)
    .filter(Boolean)
    .sort();

  if (!keys.length) return [...COMPUTE_DEFAULT_RANGE];
  if (keys.length === 1) return [keys[0], keys[0]];
  return [keys[0], keys.at(-1)];
}

function makeSyntheticDayPoint(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const yearLift = (year - 2023) * 38;
  const monthLift = month * 5;
  const wave = (year + month * 13 + day * 7) % 46;
  const usage = Math.max(260, Math.round(340 + yearLift + monthLift + wave));
  const addOn = 8 + ((month + day) % 11);
  const capacity = Math.max(1800, Math.round(2100 + yearLift * 6 + month * 28 + day * 3));

  return {
    day: formatComputeDayLabel(dateKey),
    range: dateKey,
    usage,
    addOn,
    capacity,
  };
}

function makeComputeDayPoint(dateKey) {
  const existing = COMPUTE_USAGE_TREND_BY_DATE.get(dateKey);
  if (existing) {
    return {
      ...existing,
      day: formatComputeDayLabel(dateKey),
      range: dateKey,
    };
  }

  return makeSyntheticDayPoint(dateKey);
}

function makeComputeMonthPoint(index) {
  const { year, month } = computeMonthFromIndex(index);
  const label = formatComputeMonthLabel(year, month);
  const base = year === COMPUTE_YEAR_NUMBER ? COMPUTE_HALF_YEAR_TREND[month - 1] : null;

  if (base) {
    return { ...base, day: label, range: label };
  }

  const offset = (COMPUTE_YEAR_NUMBER - year) * 12 + (6 - month);
  const usage = Math.max(960, Math.round(2780 - offset * 42 + ((year + month * 31) % 96)));
  const addOn = Math.max(32, Math.round(86 - offset * 1.4 + (month % 4) * 5));
  const target = Math.max(usage + 260, Math.round(usage * 1.14));
  const capacity = Math.max(13800, Math.round(24800 - offset * 410 + month * 32));

  return { day: label, range: label, usage, addOn, capacity, target };
}

function makeComputeYearPoint(year) {
  const offset = COMPUTE_YEAR_NUMBER - year;
  const usage = Math.max(6400, Math.round(16320 - offset * 1720));
  const addOn = Math.max(180, Math.round(610 - offset * 58));
  const target = Math.max(usage + 1100, Math.round(usage * 1.15));
  const capacity = Math.max(62000, Math.round(145000 - offset * 11800));

  return { day: `${year}年`, range: `${year}年`, usage, addOn, capacity, target };
}

function getComputeDayRows(dateRange) {
  const [start, end] = normalizeComputeDateRange(dateRange);
  const rows = [];
  for (let current = parseDateKey(end); formatDateKey(current) >= start; current = addDays(current, -1)) {
    rows.push(makeComputeDayPoint(formatDateKey(current)));
  }

  return rows.length ? rows : COMPUTE_USAGE_TREND;
}

function getComputeMonthRows(dateRange) {
  const [start, end] = normalizeComputeDateRange(dateRange);
  const startIndex = computeMonthIndex(start);
  const endIndex = computeMonthIndex(end);
  const lowerIndex = Math.min(startIndex, endIndex - COMPUTE_LOOKBACK_MONTHS + 1);
  const rows = [];

  for (let index = endIndex; index >= lowerIndex; index -= 1) {
    rows.push(makeComputeMonthPoint(index));
  }

  return rows;
}

function getComputeYearRows(dateRange) {
  const [start, end] = normalizeComputeDateRange(dateRange);
  const startYear = Number(start.slice(0, 4));
  const endYear = Number(end.slice(0, 4));
  const lowerYear = Math.min(startYear, endYear - COMPUTE_LOOKBACK_YEARS + 1);
  const rows = [];

  for (let year = endYear; year >= lowerYear; year -= 1) {
    rows.push(makeComputeYearPoint(year));
  }

  return rows;
}

export function getComputeUsageTrend(request = '30d') {
  if (request && typeof request === 'object') {
    if (request.dim === 'year') return getComputeYearRows(request.dateRange);
    if (request.dim === 'day') return getComputeDayRows(request.dateRange);
    return getComputeMonthRows(request.dateRange);
  }

  if (request === '7d') return COMPUTE_USAGE_TREND.slice(-7);
  if (request === 'half-year') return COMPUTE_HALF_YEAR_TREND;
  return COMPUTE_USAGE_TREND;
}

export function getComputeVersionConsumption() {
  return COMPUTE_VERSION_CONSUMPTION;
}

export function getComputeUsageDistribution() {
  return COMPUTE_USAGE_DISTRIBUTION;
}

export function getComputeCustomerRows() {
  return [...COMPUTE_CUSTOMER_ROWS].sort((a, b) => b.usage - a.usage);
}

export function getComputeResourceHealth() {
  return COMPUTE_RESOURCE_HEALTH.filter((row) => row.usage > 0);
}

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

const OPENING_ACCOUNT_TRENDS = {
  monthOpenings: {
    month: {
      online: [34, 38, 42, 46, 44, 48],
      south: [18, 20, 22, 25, 24, 26],
      east: [16, 18, 20, 22, 21, 22],
      agent: [20, 22, 24, 27, 27, 30],
    },
    day: {
      online: [8, 10, 9, 12, 11, 13, 10, 12, 14, 15],
      south: [4, 5, 5, 6, 5, 7, 6, 6, 7, 8],
      east: [3, 4, 4, 5, 5, 6, 5, 5, 6, 6],
      agent: [4, 5, 5, 6, 6, 7, 6, 7, 8, 9],
    },
    year: {
      online: [360, 420, 510, 548],
      south: [180, 220, 270, 292],
      east: [160, 200, 235, 252],
      agent: [200, 240, 285, 328],
    },
  },
  todayOpenings: {
    month: {
      online: [3, 3, 4, 4, 4, 4],
      south: [1, 1, 1, 2, 1, 2],
      east: [1, 1, 1, 1, 1, 1],
      agent: [1, 2, 1, 1, 2, 2],
    },
    day: {
      online: [3, 3, 4, 3, 4, 4, 5, 4, 4, 4],
      south: [1, 1, 1, 2, 1, 2, 2, 1, 2, 2],
      east: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      agent: [1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
    },
    year: {
      online: [3, 3, 4, 4],
      south: [1, 1, 2, 2],
      east: [1, 1, 1, 1],
      agent: [1, 2, 1, 2],
    },
  },
};

function normalizeSalesKeys(salesKeys) {
  const salesKeySet = new Set(CHANNELS.map((channel) => channel.key));
  const selected = Array.isArray(salesKeys)
    ? salesKeys.filter((key) => salesKeySet.has(key))
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
  if (OPENING_ACCOUNT_TRENDS[metric]) {
    return getOpeningAccountSeries({ metric, salesKeys, dim });
  }

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

function getOpeningAccountSeries({ metric, salesKeys, dim = 'month' }) {
  const safeKeys = normalizeSalesKeys(salesKeys);
  const source = OPENING_ACCOUNT_TRENDS[metric] ?? OPENING_ACCOUNT_TRENDS.monthOpenings;
  const safeDim = source[dim] ? dim : 'month';
  const labels = safeDim === 'year'
    ? ['2023', '2024', '2025', '2026']
    : safeDim === 'day'
      ? DAY_BASE.map((_, index) => `06-${String(index * 3 + 1).padStart(2, '0')}`)
      : MONTHLY_TREND.map((month) => month.month);
  const values = labels.map((_, index) => safeKeys.reduce((sum, key) => sum + (source[safeDim][key]?.[index] ?? 0), 0));

  return values.map((value, index) => {
    const prev = index === 0 ? Math.round(value * 0.9) : values[index - 1];
    return {
      label: labels[index],
      value,
      prev: metric === 'monthOpenings' && safeDim === 'month' && index === values.length - 1
        ? +(value / 1.082).toFixed(1)
        : prev,
    };
  });
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

export function getAnnualRhythmPoints() {
  const firstMonth = MONTHLY_TREND[0];
  const rawCurrent = MONTHLY_TREND.reduce((sum, row) => sum + row.recovered, 0);
  const scale = rawCurrent ? KPI.yearRecovered / rawCurrent : 1;

  return [
    { label: firstMonth?.month ?? '1月', value: Math.round((firstMonth?.recovered ?? 0) * scale), tone: 'actual' },
    { label: META.monthLabel.replace(/^2026年/, ''), value: KPI.yearRecovered, tone: 'current' },
    { label: '12月目标', value: KPI.yearTarget, tone: 'target' },
  ];
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
  if (OPENING_ACCOUNT_TRENDS[metric]) {
    return getOpeningAccountSeries({ metric, salesKeys: channel === 'all' ? undefined : [channel], dim });
  }

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

let LIVE_DELIVERY_ROWS = null;

function roundMoney(value) {
  return Math.round(value * 10) / 10;
}

export function getDeliveryRows() {
  if (Array.isArray(LIVE_DELIVERY_ROWS)) {
    return [...LIVE_DELIVERY_ROWS].sort((a, b) => b.completion - a.completion);
  }

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
  { key: 'compute', name: '算力用量分析', channelKey: 'all' },
];

export const MAINTENANCE_MENU = [
  { key: 'target-maintenance', name: '目标维护', icon: 'target' },
  { key: 'cost-maintenance', name: '成本维护', icon: 'cost' },
  { key: 'org-maintenance', name: '组织维护', icon: 'organization' },
  { key: 'channel-maintenance', name: '渠道维护', icon: 'channel' },
];

const MAINTENANCE_MONTH_KEYS = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12'];
const MAINTENANCE_QUARTERS = {
  q1: ['m01', 'm02', 'm03'],
  q2: ['m04', 'm05', 'm06'],
  q3: ['m07', 'm08', 'm09'],
  q4: ['m10', 'm11', 'm12'],
};

export const MAINTENANCE_PERIOD_COLUMNS = [
  { key: 'year', label: '全年' },
  { key: 'q1', label: '第一季度' },
  { key: 'm01', label: '1月', month: 1 },
  { key: 'm02', label: '2月', month: 2 },
  { key: 'm03', label: '3月', month: 3 },
  { key: 'q2', label: '第二季度' },
  { key: 'm04', label: '4月', month: 4 },
  { key: 'm05', label: '5月', month: 5 },
  { key: 'm06', label: '6月', month: 6 },
  { key: 'q3', label: '第三季度' },
  { key: 'm07', label: '7月', month: 7 },
  { key: 'm08', label: '8月', month: 8 },
  { key: 'm09', label: '9月', month: 9 },
  { key: 'q4', label: '第四季度' },
  { key: 'm10', label: '10月', month: 10 },
  { key: 'm11', label: '11月', month: 11 },
  { key: 'm12', label: '12月', month: 12 },
];

function maintenanceStatus(pct) {
  if (pct >= 100) return 'good';
  if (pct >= 80) return 'warning';
  return 'danger';
}

function targetPeriod(target, actual) {
  const safeTarget = Math.max(0, Math.round(Number(target || 0)));
  const safeActual = Math.max(0, Math.round(Number(actual || 0)));
  const pct = safeTarget ? +((safeActual / safeTarget) * 100).toFixed(1) : 0;
  return { target: safeTarget, actual: safeActual, pct, status: safeTarget ? maintenanceStatus(pct) : 'unset' };
}

function costPeriod(cost, actual, deals = 0) {
  const safeCost = Math.max(0, Math.round(Number(cost || 0)));
  const safeActual = Math.max(0, Math.round(Number(actual || 0)));
  const safeDeals = Math.max(0, Math.round(Number(deals || 0)));
  const roi = safeCost ? +((safeActual - safeCost) / safeCost).toFixed(2) : 0;
  return { cost: safeCost, actual: safeActual, deals: safeDeals, roi };
}

function laborPeriod(cost) {
  return { cost: Math.max(0, Math.round(Number(cost || 0))) };
}

function sumValues(keys, periods, field) {
  return keys.reduce((sum, key) => sum + Number(periods[key]?.[field] || 0), 0);
}

function createTargetPeriods(monthTargets, monthActuals) {
  const periods = {};
  MAINTENANCE_MONTH_KEYS.forEach((key, index) => {
    const target = monthTargets[index] ?? 0;
    const actual = monthActuals[index] ?? Math.round(target * 0.82);
    periods[key] = targetPeriod(target, actual);
  });
  Object.entries(MAINTENANCE_QUARTERS).forEach(([key, months]) => {
    periods[key] = targetPeriod(sumValues(months, periods, 'target'), sumValues(months, periods, 'actual'));
  });
  periods.year = targetPeriod(sumValues(MAINTENANCE_MONTH_KEYS, periods, 'target'), sumValues(MAINTENANCE_MONTH_KEYS, periods, 'actual'));
  return periods;
}

function createCostPeriods(monthCosts, monthActuals, monthDeals) {
  const periods = {};
  MAINTENANCE_MONTH_KEYS.forEach((key, index) => {
    periods[key] = costPeriod(monthCosts[index] ?? 0, monthActuals[index] ?? 0, monthDeals[index] ?? 0);
  });
  Object.entries(MAINTENANCE_QUARTERS).forEach(([key, months]) => {
    periods[key] = costPeriod(
      sumValues(months, periods, 'cost'),
      sumValues(months, periods, 'actual'),
      sumValues(months, periods, 'deals')
    );
  });
  periods.year = costPeriod(
    sumValues(MAINTENANCE_MONTH_KEYS, periods, 'cost'),
    sumValues(MAINTENANCE_MONTH_KEYS, periods, 'actual'),
    sumValues(MAINTENANCE_MONTH_KEYS, periods, 'deals')
  );
  return periods;
}

function createLaborPeriods(monthCosts) {
  const periods = {};
  MAINTENANCE_MONTH_KEYS.forEach((key, index) => {
    periods[key] = laborPeriod(monthCosts[index] ?? 0);
  });
  Object.entries(MAINTENANCE_QUARTERS).forEach(([key, months]) => {
    periods[key] = laborPeriod(sumValues(months, periods, 'cost'));
  });
  periods.year = laborPeriod(sumValues(MAINTENANCE_MONTH_KEYS, periods, 'cost'));
  return periods;
}

export const TARGET_MAINTENANCE_ORG_TREE = {
  id: 'all',
  name: '成都福客人工智能',
  userCount: 21,
  children: [
    { id: 'online-sales', name: '线上销售部', userCount: 10, children: [] },
    {
      id: 'offline-sales',
      name: '线下销售部',
      userCount: 8,
      children: [
        { id: 'south-sales', name: '华南战区', userCount: 4, children: [] },
        { id: 'east-sales', name: '华东战区', userCount: 4, children: [] },
      ],
    },
    { id: 'agent-sales', name: '代理渠道部', userCount: 5, children: [] },
  ],
};

export const TARGET_MAINTENANCE_ROWS = [
  { id: 'summary-all', type: 'department', name: '所有部门', role: '组织合计', periods: createTargetPeriods([480, 480, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700], [372, 410, 455, 498, 432, 486, 0, 0, 0, 0, 0, 0]) },
  { id: 'online-sales', type: 'department', name: '线上销售部', role: '组织合计', periods: createTargetPeriods([210, 210, 228, 236, 242, 240, 250, 258, 266, 272, 280, 288], [168, 180, 198, 214, 206, 210, 0, 0, 0, 0, 0, 0]) },
  { id: 'user-online-01', type: 'user', name: '王丽英', role: '人员', deptId: 'online-sales', periods: createTargetPeriods([26, 26, 28, 29, 30, 30, 31, 32, 33, 34, 35, 36], [22, 24, 26, 27, 29, 29, 0, 0, 0, 0, 0, 0]) },
  { id: 'user-online-02', type: 'user', name: '李思雨', role: '人员', deptId: 'online-sales', periods: createTargetPeriods([24, 25, 26, 27, 28, 28, 29, 30, 31, 32, 33, 34], [20, 21, 24, 25, 26, 26, 0, 0, 0, 0, 0, 0]) },
  { id: 'user-south-01', type: 'user', name: '杨磊', role: '人员', deptId: 'south-sales', periods: createTargetPeriods([32, 32, 34, 35, 36, 36, 38, 39, 40, 41, 42, 43], [25, 27, 30, 31, 30, 32, 0, 0, 0, 0, 0, 0]) },
  { id: 'user-east-01', type: 'user', name: '马骏', role: '人员', deptId: 'east-sales', periods: createTargetPeriods([30, 31, 32, 33, 34, 34, 35, 36, 37, 38, 39, 40], [21, 22, 24, 25, 24, 26, 0, 0, 0, 0, 0, 0]) },
  { id: 'user-agent-01', type: 'user', name: '南唐代理', role: '人员', deptId: 'agent-sales', periods: createTargetPeriods([22, 22, 24, 25, 26, 26, 27, 28, 29, 30, 31, 32], [18, 20, 21, 23, 24, 25, 0, 0, 0, 0, 0, 0]) },
];

export const COST_MAINTENANCE_CHANNELS = [
  { id: 'all', name: '全部渠道', kind: '全部', parentId: '' },
  { id: 'group_paid_flow', name: '付费流量', kind: '大类', parentId: '' },
  { id: 'online_ads', name: '线上广告', kind: '明细', parentId: 'group_paid_flow' },
  { id: 'group_offline', name: '线下获客', kind: '大类', parentId: '' },
  { id: 'south_events', name: '华南会销', kind: '明细', parentId: 'group_offline' },
  { id: 'east_events', name: '华东会销', kind: '明细', parentId: 'group_offline' },
  { id: 'group_agent', name: '代理渠道', kind: '大类', parentId: '' },
  { id: 'agent_rebate', name: '代理返点', kind: '明细', parentId: 'group_agent' },
];

export const COST_MAINTENANCE_ROWS = [
  { id: 'group_paid_flow', type: 'group', name: '付费流量', periods: createCostPeriods([58, 62, 66, 70, 74, 74, 78, 80, 82, 84, 86, 88], [172, 184, 196, 205, 188, 210, 0, 0, 0, 0, 0, 0], [18, 20, 21, 23, 20, 24, 0, 0, 0, 0, 0, 0]) },
  { id: 'online_ads', type: 'channel', name: '线上广告', parentId: 'group_paid_flow', periods: createCostPeriods([58, 62, 66, 70, 74, 74, 78, 80, 82, 84, 86, 88], [172, 184, 196, 205, 188, 210, 0, 0, 0, 0, 0, 0], [18, 20, 21, 23, 20, 24, 0, 0, 0, 0, 0, 0]) },
  { id: 'south_events', type: 'channel', name: '华南会销', parentId: 'group_offline', periods: createCostPeriods([22, 24, 26, 28, 28, 28, 30, 31, 32, 33, 34, 35], [72, 78, 88, 92, 84, 96, 0, 0, 0, 0, 0, 0], [7, 8, 9, 10, 8, 10, 0, 0, 0, 0, 0, 0]) },
  { id: 'east_events', type: 'channel', name: '华东会销', parentId: 'group_offline', periods: createCostPeriods([30, 32, 34, 36, 38, 38, 40, 42, 44, 45, 46, 48], [70, 74, 82, 86, 76, 84, 0, 0, 0, 0, 0, 0], [6, 7, 8, 8, 7, 8, 0, 0, 0, 0, 0, 0]) },
  { id: 'agent_rebate', type: 'channel', name: '代理返点', parentId: 'group_agent', periods: createCostPeriods([12, 13, 14, 15, 16, 16, 17, 18, 19, 20, 21, 22], [62, 68, 74, 82, 88, 96, 0, 0, 0, 0, 0, 0], [6, 7, 8, 8, 9, 10, 0, 0, 0, 0, 0, 0]) },
];

export const LABOR_COST_MAINTENANCE_ROWS = [
  { id: 'labor-sales', name: '销售部人力成本', periods: createLaborPeriods([48, 50, 52, 54, 58, 60, 62, 64, 66, 68, 70, 72]) },
  { id: 'labor-marketing', name: '市场部人力成本', periods: createLaborPeriods([28, 30, 31, 32, 34, 36, 37, 38, 39, 40, 41, 42]) },
];

export const ORG_MAINTENANCE_DEPARTMENTS = [
  { id: 'headquarters', name: '成都福客人工智能', parentId: '', enabled: true },
  { id: 'online-sales', name: '线上销售部', parentId: 'headquarters', enabled: true },
  { id: 'offline-sales', name: '线下销售部', parentId: 'headquarters', enabled: true },
  { id: 'south-sales', name: '华南战区', parentId: 'offline-sales', enabled: true },
  { id: 'east-sales', name: '华东战区', parentId: 'offline-sales', enabled: true },
  { id: 'agent-sales', name: '代理渠道部', parentId: 'headquarters', enabled: true },
  { id: 'paused-team', name: '历史停用团队', parentId: 'headquarters', enabled: false },
];

export const ORG_MAINTENANCE_USERS = [
  { id: 'u-online-01', name: '王丽英', sourceName: 'BI 销售', deptId: 'online-sales', isSales: true, enabled: true, sourceUserId: 'wl_10086' },
  { id: 'u-online-02', name: '李思雨', sourceName: 'BI 销售', deptId: 'online-sales', isSales: true, enabled: true, sourceUserId: 'wl_10087' },
  { id: 'u-south-01', name: '杨磊', sourceName: 'BI 销售', deptId: 'south-sales', isSales: true, enabled: true, sourceUserId: 'wl_10091' },
  { id: 'u-east-01', name: '马骏', sourceName: 'BI 销售', deptId: 'east-sales', isSales: true, enabled: true, sourceUserId: 'wl_10095' },
  { id: 'u-agent-01', name: '南唐代理', sourceName: '渠道伙伴', deptId: 'agent-sales', isSales: true, enabled: true, sourceUserId: 'wl_partner_01' },
  { id: 'u-paused-01', name: '旧账号样本', sourceName: '历史人员', deptId: 'paused-team', isSales: false, enabled: false, sourceUserId: 'wl_archived_01' },
];

export const CHANNEL_MAINTENANCE_GROUPS = [
  { id: 'group_paid_flow', name: '付费流量', parentId: '', enabled: true },
  { id: 'group_offline', name: '线下获客', parentId: '', enabled: true },
  { id: 'group_private_domain', name: '私域转介绍', parentId: '', enabled: true },
  { id: 'group_agent', name: '代理渠道', parentId: '', enabled: true },
  { id: 'group_paid_search', name: '搜索投放', parentId: 'group_paid_flow', enabled: true },
  { id: 'group_unattributed', name: '未归因', parentId: '', enabled: false },
];

export const CHANNEL_MAINTENANCE_SOURCES = [
  { code: '1001', name: '百度搜索', groupId: 'group_paid_flow', enabled: true, excluded: false },
  { code: '1002', name: '巨量广告', groupId: 'group_paid_flow', enabled: true, excluded: false },
  { code: '2001', name: '广州会销', groupId: 'group_offline', enabled: true, excluded: false },
  { code: '2002', name: '杭州会销', groupId: 'group_offline', enabled: true, excluded: false },
  { code: '3001', name: '老客转介绍', groupId: 'group_private_domain', enabled: true, excluded: false },
  { code: '4001', name: '代理商报备', groupId: 'group_agent', enabled: true, excluded: false },
  { code: '9999', name: '测试来源', groupId: '', enabled: false, excluded: true },
];

export function getMaintenancePageMeta(pageKey = 'target-maintenance') {
  const meta = {
    'target-maintenance': { title: '目标维护', scope: '所有部门', saveText: '保存目标' },
    'cost-maintenance': { title: '成本维护', scope: '全部渠道', saveText: '保存成本' },
    'org-maintenance': { title: '组织维护', scope: 'BI销售 21 人 / 卫瓴人员 28 人', saveText: '保存组织' },
    'channel-maintenance': { title: '渠道维护', scope: '卫瓴线索来源字典', saveText: '保存渠道' },
  };
  return meta[pageKey] ?? meta['target-maintenance'];
}

export function getDashboardChannelKey(menuKey = 'overview') {
  return MENU.find((item) => item.key === menuKey)?.channelKey ?? 'all';
}

export function getDashboardMenuLabel(menuKey = 'overview') {
  return MENU.find((item) => item.key === menuKey)?.name ?? MENU[0].name;
}

function round0(value) {
  return Math.round(Number(value) || 0);
}

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function replaceArray(target, source = []) {
  target.splice(0, target.length, ...source);
}

function assignObject(target, source = {}) {
  Object.keys(target).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  });
}

function withRuntimeCompletion(channel) {
  const recovered = round0(channel.recovered);
  const target = round0(channel.target);
  return {
    ...channel,
    recovered,
    target,
    completion: target ? round1((recovered / target) * 100) : 0,
  };
}

function updateKpiCardsFromRuntimeData() {
  const renewalOverview = calculateRenewalOverview(RENEWAL_ROWS, { version: 'all', period: 'month' });
  const updates = {
    month: {
      value: KPI.monthRecovered,
      sub: `本月目标 ${KPI.monthTarget} 万`,
      progress: KPI_DERIVED.monthCompletion,
      gap: KPI_DERIVED.monthGap,
      delta: KPI_DERIVED.monthMoM,
    },
    year: {
      value: KPI.yearRecovered,
      sub: `年度目标 ${KPI.yearTarget} 万`,
      progress: KPI_DERIVED.yearCompletion,
      gap: KPI_DERIVED.yearGap,
      delta: KPI_DERIVED.yearYoY,
    },
    cost: {
      value: KPI.totalCost,
      sub: `广告 ${KPI.adCost} 万 + 人力 ${KPI.laborCost} 万 · 费比 ${KPI_DERIVED.costRatio}%`,
    },
    renewal: {
      value: renewalOverview.rate,
      sub: `到期 ${renewalOverview.due} 单 · 已续 ${renewalOverview.renewed} 单 · 续费 ${renewalOverview.revenue} 万`,
      progress: renewalOverview.rate,
      delta: renewalOverview.delta,
    },
  };

  KPI_CARDS.forEach((card) => {
    Object.assign(card, updates[card.key] ?? {});
  });
}

function mergeColors(nextRows, existingRows, key = 'name') {
  const colorByKey = new Map(existingRows.map((row) => [row[key], row.color]));
  return nextRows.map((row, index) => ({
    ...row,
    color: row.color ?? colorByKey.get(row[key]) ?? ['#8E86FF', '#B89CFF', '#D9D1FF', '#E4B8D7', '#F06A8B', '#C9A96B'][index % 6],
  }));
}

export function applyDashboardDataSnapshot(snapshot) {
  if (!snapshot || snapshot.source !== 'mysql') {
    throw new Error('dashboard snapshot must come from mysql');
  }

  assignObject(META, snapshot.meta);
  assignObject(KPI, snapshot.kpi);
  assignObject(KPI_DERIVED, snapshot.kpiDerived);
  assignObject(OPERATING_OVERVIEW_METRICS, snapshot.operatingOverviewMetrics);

  if (Array.isArray(snapshot.channels)) {
    replaceArray(CHANNELS, snapshot.channels.map(withRuntimeCompletion));
  }

  if (Array.isArray(snapshot.channelRoi)) {
    replaceArray(CHANNEL_ROI, snapshot.channelRoi);
  }

  if (Array.isArray(snapshot.salesMemberRows)) {
    replaceArray(SALES_MEMBER_ROWS, snapshot.salesMemberRows);
  }

  if (Array.isArray(snapshot.monthlyTrend)) {
    replaceArray(MONTHLY_TREND, snapshot.monthlyTrend);
  }

  if (Array.isArray(snapshot.versions)) {
    replaceArray(VERSIONS, snapshot.versions.map((version) => ({
      ...version,
      currentRenewalRate: version.currentRenewalRate ?? (version.currentRenewalDue ? round1((version.currentRenewalPaid / version.currentRenewalDue) * 100) : 0),
    })));
  }

  if (Array.isArray(snapshot.renewalRows)) {
    replaceArray(RENEWAL_ROWS, snapshot.renewalRows);
  }

  if (Array.isArray(snapshot.openingAccountMetrics)) {
    replaceArray(OPENING_ACCOUNT_METRICS, snapshot.openingAccountMetrics);
  }

  if (snapshot.computeOverview) {
    assignObject(COMPUTE_OVERVIEW, snapshot.computeOverview);
  }

  if (Array.isArray(snapshot.computeUsageTrend)) {
    replaceArray(COMPUTE_USAGE_TREND, snapshot.computeUsageTrend);
    COMPUTE_USAGE_TREND_BY_DATE.clear();
    snapshot.computeUsageTrend.forEach((row) => {
      if (row.range) COMPUTE_USAGE_TREND_BY_DATE.set(row.range, row);
    });
  }

  if (Array.isArray(snapshot.computeVersionConsumption)) {
    replaceArray(COMPUTE_VERSION_CONSUMPTION, mergeColors(snapshot.computeVersionConsumption, COMPUTE_VERSION_CONSUMPTION));
  }

  if (Array.isArray(snapshot.computeUsageDistribution)) {
    replaceArray(COMPUTE_USAGE_DISTRIBUTION, mergeColors(snapshot.computeUsageDistribution, COMPUTE_USAGE_DISTRIBUTION));
  }

  if (Array.isArray(snapshot.computeCustomerRows)) {
    replaceArray(COMPUTE_CUSTOMER_ROWS, snapshot.computeCustomerRows);
  }

  if (Array.isArray(snapshot.computeResourceHealth)) {
    replaceArray(COMPUTE_RESOURCE_HEALTH, mergeColors(snapshot.computeResourceHealth, COMPUTE_RESOURCE_HEALTH, 'key'));
  }

  if (Array.isArray(snapshot.deliveryRows)) {
    LIVE_DELIVERY_ROWS = snapshot.deliveryRows;
  }

  updateKpiCardsFromRuntimeData();
}
