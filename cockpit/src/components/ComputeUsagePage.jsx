/*
 更新时间: 2026-07-10 15:58:00 CST
 更新内容: 移除页面挂载后才启动的客户分页同步，改为接收 App 后台同步状态；
          算力页只展示客户列表和同步进度，避免未进入页面时客户不加载。
*/
/*
 更新时间: 2026-07-09 23:10:00 CST
 更新内容: 清理：客户后台分页同步不再调用 getComputeCustomerRows()（拷贝+排序整个数组）只为读取行数，
          改用 appendComputeCustomerRows 的返回值；customerSyncState 去掉冗余的 loaded 字段，同步进度
          展示直接读渲染期已算好的 customers.length；buildCustomerTableRows 去掉对已排序输入的重复排序；
          骨架屏 shimmer 动画与 dashboard.css 的经营总览骨架屏合并为同一套 CSS，不再各自定义一份。
*/
/*
 更新时间: 2026-07-09 21:15:00 CST
 更新内容: 新增后台分页同步全量客户列表（loadComputeCustomerPage + appendComputeCustomerRows），
          客户表工具栏显示同步进度，不再受首屏 20 条采样限制，也不阻塞页面其它区块渲染。
*/
/*
 更新时间: 2026-07-09 20:08:00 CST
 更新内容: token 同步状态条仅在同步进行中显示，完成或失败后不再占位。
*/
/*
 更新时间: 2026-07-09 19:32:00 CST
 更新内容: 算力页接收按需加载状态，进入页面时提示 token 数据正在同步或同步失败。
*/
/*
 更新时间: 2026-07-09 18:18:00 CST
 更新内容: 算力页新增组件级消耗构成面板，使用外部 API 的 OCR/VOC/视频/拦截/测试消耗字段。
*/
/*
 更新时间: 2026-07-08 18:51:50 CST
 更新内容: 算力页升级为经营健康驾驶舱，新增利用率、风险客户、供需关系、版本效率洞察与客户动作标签。
*/
/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: 算力页图表色板收敛为银紫玫瑰用量、香槟峰值与冷蓝容量语义，移除青绿色和硬蓝主视觉。
*/
/*
 更新时间: 2026-07-06 00:00:13 CST
 更新内容: 算力页图表金色强调改为灰金/高级哑金并降低高光透明度。
*/
/*
 更新时间: 2026-07-03 18:19:59 CST
 更新内容: 算力页图表色板收敛到月光紫、冷蓝、青玉、香槟金与风险玫红，移除强霓虹青/洋红。
*/
/*
 更新时间: 2026-07-03 17:53:00 CST
 更新内容: 算力环图色板同步为首页半环图统一紫蓝色阶，保持同类图表视觉语言一致。
*/
/*
 Update time: 2026-07-03 15:40:00 CST
 Update content: Align compute pie and donut palettes with the cold-purple Apple/Vision Pro dashboard theme.
*/
/*
 Update time: 2026-07-02 17:18:50 CST
 Update content: Mark compute KPI cards and panels as searchable matches for top search navigation.
*/
/*
 更新时间: 2026-07-02 16:52:00 CST
 更新内容: 算力用量表格筛选、排序、分页和下拉控制改用统一 AppIcon 线性图标。
*/
import { useMemo, useState } from 'react';

import AppIcon from './AppIcon';
import EChart from './EChart';
import {
  getComputeCustomerRows,
  getComputeResourceHealth,
  getComputeOverview,
  getComputeUsageDistribution,
  getComputeUsageTrend,
  getComputeVersionConsumption,
} from '../data/mock';
import { useThemeTokens } from '../lib/theme';
import './ComputeUsagePage.css';

const SEARCH_KEYWORDS = {
  overview: ['算力', '总容量', '新增', '消耗', '客户', '回复率', '余额', '利用率', '风险客户', '经营判断'],
  trend: ['趋势', '年', '月', '日', '日期', '自动回复', '商品同步', '容量', '供需', '利用率', '峰值'],
  version: ['版本', '试用版', '企业版', '旗舰版', '卓越版', '创世版', '启航版', '版本效率'],
  distribution: ['分布', '用量', '客户占比', '高消耗', '零用量', '激活'],
  health: ['构成', 'OCR', 'VOC', '视频', '拦截', '对话测试', '组件消耗'],
  customer: ['客户', '排行', '手机号', '负责人', '平均回复率', '风险', '建议动作', '低余额', '高消耗'],
};

const DIM_TREND_LABELS = {
  day: '日度',
  month: '月度',
  year: '年度',
};
const MIN_VISIBLE_TREND_BARS = 3;
const MAX_VISIBLE_TREND_BARS = 15;
const CUSTOMER_SORT_FIELDS = [
  { key: 'usage', label: '算力用量', getValue: (row) => row.usage },
  { key: 'balance', label: '算力余额', getValue: (row) => row.balance },
  { key: 'reply', label: '平均回复率', getValue: (row) => row.averageReplyRate },
];
const CUSTOMER_SORT_DIRECTIONS = { asc: '升序', desc: '降序' };
const CUSTOMER_COLUMN_FILTER_ALL = 'all';
const CUSTOMER_COLUMN_FILTERS = [
  { key: 'accountType', label: '账号类型' },
  { key: 'salesOwner', label: '销售负责人' },
  { key: 'successOwner', label: '客成负责人' },
];
const CUSTOMER_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500];
const DEFAULT_CUSTOMER_PAGE_SIZE = 20;
const COMPUTE_RING_COLORS = [
  '#8E86FF',
  '#B89CFF',
  '#E4B8D7',
  '#C9A96B',
  'rgba(148, 163, 184, .18)',
  '#D9D1FF',
  '#A6C878',
  '#F06A8B',
];
const COMPUTE_VERSION_RIGHT_LABEL_SLOTS = {
  '试用版': -82,
  '企业版': -42,
  '旗舰版': -2,
  '免费版': 38,
  '卓越版': 86,
};
const COMPUTE_STACKED_PIE_LABELS = new Set(['卓越版']);
const LOW_REPLY_RATE = 60;
const LOW_BALANCE_POINTS = 1000000;
const HIGH_USAGE_POINTS = 400000;
const BALANCE_COVERAGE_RISK = 3;

function formatInt(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatSignedInt(value) {
  const numericValue = Number(value) || 0;
  return `${numericValue > 0 ? '+' : ''}${formatInt(numericValue)}`;
}

function formatWan(value) {
  return `${Number(value).toLocaleString('zh-CN')}万`;
}

function formatPct(value) {
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}%`;
}

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function percentOf(numerator, denominator) {
  const base = Number(denominator) || 0;
  if (!base) return 0;
  return round1((Number(numerator) || 0) / base * 100);
}

function formatPieLabelName(name) {
  const text = String(name || '');
  const rangeMatch = text.match(/^(\d+)<算力用量<=([\d]+)$/);
  if (rangeMatch) return `${rangeMatch[1]}-${rangeMatch[2]}`;
  if (text.startsWith('算力用量>')) return text.replace('算力用量', '');
  if (text.startsWith('算力用量=')) return text.replace('算力用量', '');
  return text;
}

function normalizeTerm(term) {
  return String(term || '').trim().toLowerCase();
}

function matchesTerm(keywords, term) {
  const normalized = normalizeTerm(term);
  if (!normalized) return false;
  return keywords.some((keyword) => String(keyword).toLowerCase().includes(normalized));
}

function clampCustomerPage(page, pageCount) {
  const numericPage = Number(page);
  if (!Number.isFinite(numericPage)) return 1;
  return Math.min(pageCount, Math.max(1, Math.round(numericPage)));
}

function getCustomerPageNumbers(currentPage, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis-end', pageCount];
  if (currentPage >= pageCount - 3) {
    return [1, 'ellipsis-start', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', pageCount];
}

function buildCustomerRiskProfile(row) {
  const usage = Number(row.usage) || 0;
  const balance = Number(row.balance) || 0;
  const replyRate = Number(row.averageReplyRate) || 0;
  const lowBalance = balance <= LOW_BALANCE_POINTS || (usage > 0 && balance / usage <= BALANCE_COVERAGE_RISK);
  const highUsage = usage >= HIGH_USAGE_POINTS;
  const lowReply = replyRate > 0 && replyRate < LOW_REPLY_RATE;
  const zeroUsage = usage <= 0;
  const riskTags = [];

  if (zeroUsage) riskTags.push({ label: '零用量', tone: 'idle' });
  if (highUsage) riskTags.push({ label: '高消耗', tone: 'warn' });
  if (lowBalance) riskTags.push({ label: '低余额', tone: 'risk' });
  if (lowReply) riskTags.push({ label: '低回复', tone: 'warn' });

  const riskScore = [zeroUsage, highUsage, lowBalance, lowReply].filter(Boolean).length;
  const riskTone = riskScore >= 2 || (highUsage && lowBalance) ? 'risk' : riskScore === 1 ? 'warn' : 'stable';
  let action = '保持观察';

  if (zeroUsage) {
    action = '客成激活';
  } else if (highUsage && lowBalance) {
    action = '销售提醒充值';
  } else if (lowReply) {
    action = '客成排查配置';
  } else if (highUsage) {
    action = '复盘高价值场景';
  } else if (lowBalance) {
    action = '余额预警跟进';
  }

  return {
    riskTags: riskTags.length ? riskTags : [{ label: '健康使用', tone: 'stable' }],
    riskTone,
    action,
    isHighRisk: riskTone === 'risk',
    isLowBalance: lowBalance,
    isLowReply: lowReply,
    isHighUsage: highUsage,
  };
}

function decorateCustomerRow(row, index) {
  return {
    ...row,
    rowKey: row.rowKey ?? `${row.phone}-${index}`,
    ...buildCustomerRiskProfile(row),
  };
}

// rows must already be sorted by usage desc — its only caller passes
// getComputeCustomerRows(), which sorts on the same key.
function buildCustomerTableRows(rows) {
  if (!rows.length) return [];

  return rows.map((row, index) => decorateCustomerRow(row, index));
}

function buildInitialCustomerColumnFilters() {
  return CUSTOMER_COLUMN_FILTERS.reduce((filters, field) => ({
    ...filters,
    [field.key]: CUSTOMER_COLUMN_FILTER_ALL,
  }), {});
}

function buildCustomerColumnFilterOptions(rows, field) {
  const values = [...new Set(rows.map((row) => row[field]).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), 'zh-CN'));

  return [
    { value: CUSTOMER_COLUMN_FILTER_ALL, label: '全部' },
    ...values.map((value) => ({ value, label: value })),
  ];
}

function filterCustomerRowsByColumnFilters(rows, filters) {
  return rows.filter((row) => CUSTOMER_COLUMN_FILTERS.every((field) => {
    const selectedValue = filters[field.key] ?? CUSTOMER_COLUMN_FILTER_ALL;
    return selectedValue === CUSTOMER_COLUMN_FILTER_ALL || row[field.key] === selectedValue;
  }));
}

function sortCustomerRows(rows, sortKey = 'usage-desc') {
  const { sortField, sortDirection } = getCustomerSortState(sortKey);
  const sortMultiplier = sortDirection === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    const primaryDiff = sortField.getValue(a) - sortField.getValue(b);
    if (primaryDiff !== 0) return primaryDiff * sortMultiplier;

    const usageDiff = b.usage - a.usage;
    if (usageDiff !== 0) return usageDiff;
    return String(a.owner).localeCompare(String(b.owner), 'zh-CN');
  });
}

function getCustomerSortState(sortKey = 'usage-desc') {
  const [sortFieldKey, sortDirectionKey] = String(sortKey).split('-');
  const sortField = CUSTOMER_SORT_FIELDS.find((field) => field.key === sortFieldKey) ?? CUSTOMER_SORT_FIELDS[0];
  const sortDirection = CUSTOMER_SORT_DIRECTIONS[sortDirectionKey] ? sortDirectionKey : 'desc';

  return {
    sortField,
    sortDirection,
    sortValue: `${sortField.key}-${sortDirection}`,
  };
}

function getDistributionValue(distribution, matcher) {
  return distribution.find((item) => matcher(String(item.name || '')))?.value ?? 0;
}

function buildVersionInsight(data) {
  if (!data.length) return '暂无版本消耗数据';

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const top = sorted[0];
  const second = sorted[1];
  const topValue = Number(top?.value) || 0;
  const secondValue = Number(second?.value) || 0;
  const topShare = percentOf(topValue, total);
  const pairShare = percentOf(topValue + secondValue, total);

  return `${top.name}贡献 ${formatPct(topShare)}，前两版本合计 ${formatPct(pairShare)}，优先看高版本客户的回复效率与余额覆盖。`;
}

function buildDistributionInsight(distribution) {
  const zeroUsage = getDistributionValue(distribution, (name) => name.includes('=0'));
  const highUsage = getDistributionValue(distribution, (name) => name.includes('>10000'));

  return `零用量 ${formatInt(zeroUsage)} 档、高用量 ${formatInt(highUsage)} 档；建议把沉默客户激活和超高消耗客户预警拆成两条运营清单。`;
}

function buildResourceHealthInsight(resourceHealth) {
  if (!resourceHealth.length) return '暂无组件级消耗数据';

  const sorted = [...resourceHealth].sort((a, b) => b.usage - a.usage);
  const top = sorted[0];
  const activeCount = sorted.filter((row) => Number(row.value || row.usage) > 0).length;
  return `${top.name}占组件消耗最高，为 ${formatPct(top.usage)}；当前有 ${formatInt(activeCount)} 个组件产生 token 消耗。`;
}

function buildExecutiveSnapshot({ overview, trend, distribution, customerRows }) {
  const latest = trend[0] ?? { usage: 0, capacity: 0, addOn: 0 };
  const previous = trend[1] ?? latest;
  const utilizationRate = percentOf(overview.consumedCapacity, overview.totalCapacity);
  const netCapacity = (Number(overview.addedCapacity) || 0) - (Number(overview.consumedCapacity) || 0);
  const highRiskCount = customerRows.filter((row) => row.isHighRisk).length;
  const lowBalanceCount = customerRows.filter((row) => row.isLowBalance).length;
  const lowReplyCount = customerRows.filter((row) => row.isLowReply).length;
  const highUsageCount = customerRows.filter((row) => row.isHighUsage).length;
  const zeroUsage = getDistributionValue(distribution, (name) => name.includes('=0'));
  const usageDelta = (Number(latest.usage) || 0) - (Number(previous.usage) || 0);
  const usageDeltaRate = percentOf(usageDelta, previous.usage || latest.usage);
  const averageCustomerUsage = Math.round((Number(overview.customerUsage) || 0) / Math.max(Number(overview.customerCount) || 1, 1));

  let status = '健康';
  let tone = 'healthy';
  let cause = `容量消耗率 ${formatPct(utilizationRate)}，当前容量池仍有余量。`;
  let action = '继续观察新增算力与消耗峰值是否同步抬升。';

  if (utilizationRate >= 75 || highRiskCount >= 20) {
    status = '偏紧';
    tone = 'risk';
    cause = `高风险客户 ${formatInt(highRiskCount)} 个，低余额 ${formatInt(lowBalanceCount)} 个，容量消耗需要前置管控。`;
    action = '先处理低余额高消耗客户，再评估是否追加容量池。';
  } else if (zeroUsage >= 50 || lowReplyCount >= 10) {
    status = '低效待激活';
    tone = 'warn';
    cause = `零用量分布 ${formatInt(zeroUsage)} 档，低回复客户 ${formatInt(lowReplyCount)} 个，消耗质量仍有提升空间。`;
    action = '客成优先激活沉默客户，并排查低回复账号配置。';
  }

  return {
    status,
    tone,
    cause,
    action,
    utilizationRate,
    netCapacity,
    highRiskCount,
    lowBalanceCount,
    lowReplyCount,
    highUsageCount,
    zeroUsage,
    peakUsage: Math.max(...trend.map((point) => Number(point.usage) || 0), 0),
    averageCustomerUsage,
    usageDeltaLabel: `${usageDelta >= 0 ? '较前期 +' : '较前期 '}${formatPct(usageDeltaRate)}`,
    metrics: [
      { label: '供需差', value: formatSignedInt(netCapacity) },
      { label: '日峰值', value: formatWan(Math.max(...trend.map((point) => Number(point.usage) || 0), 0)) },
      { label: '高消耗客户', value: formatInt(highUsageCount) },
      { label: '零用量分布', value: formatInt(zeroUsage) },
    ],
  };
}

function tooltipExtraCss() {
  return [
    'border-radius:8px',
    'background:rgba(0,0,0,.72)',
    'backdrop-filter:blur(22px) saturate(155%)',
    '-webkit-backdrop-filter:blur(22px) saturate(155%)',
    'box-shadow:0 24px 80px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.18)',
    'padding:12px 14px',
  ].join(';');
}

function tooltipHeader(label) {
  return `<div style="color:rgba(239,251,255,.72);font-size:12px;font-weight:750;margin-bottom:8px">${label}</div>`;
}

function tooltipGlowColor(color) {
  return String(color).startsWith('#') ? `${color}66` : 'rgba(230,251,255,.36)';
}

function tooltipRow({ color, label, value }) {
  return `<div style="display:flex;align-items:center;gap:8px;line-height:1.7;min-width:190px">
    <span style="width:8px;height:8px;border-radius:2px;background:${color};box-shadow:0 0 10px ${tooltipGlowColor(color)}"></span>
    <span style="color:rgba(239,251,255,.68);font-size:12px">${label}</span>
    <strong style="color:#fff;margin-left:auto;font-size:14px;font-variant-numeric:tabular-nums">${value}</strong>
  </div>`;
}

function applyComputeRingPalette(data) {
  const rankMap = new Map(
    [...data]
      .sort((a, b) => b.value - a.value)
      .map((item, index) => [item.name, index])
  );

  return data.map((item, index) => ({
    ...item,
    color: COMPUTE_RING_COLORS[(rankMap.get(item.name) ?? index) % COMPUTE_RING_COLORS.length],
  }));
}

function computePieLabelLayout(params) {
  if (!params.rect || !params.labelRect) return { moveOverlap: 'shiftY' };

  const name = String(params.name ?? params.data?.name ?? '');
  const yOffset = COMPUTE_VERSION_RIGHT_LABEL_SLOTS[name];
  const isRightLabel = params.labelRect.x > params.rect.x + params.rect.width / 2;

  if (yOffset == null || !isRightLabel) return { moveOverlap: 'shiftY' };

  return {
    y: params.rect.y + params.rect.height / 2 + yOffset,
    align: 'left',
    verticalAlign: 'middle',
    hideOverlap: false,
  };
}

function formatComputePieLabel(params) {
  const name = formatPieLabelName(params.name);
  if (COMPUTE_STACKED_PIE_LABELS.has(String(params.name))) {
    return `{name|${name}}\n{value|${params.percent}%}`;
  }
  return `{name|${name}} {value|${params.percent}%}`;
}

function buildTrendPoints(trend) {
  return trend.map((point) => ({
    label: point.day,
    range: point.range ?? point.day,
    capacity: point.capacity ?? 0,
    usage: point.usage,
  }));
}

function buildChronologicalTrendPoints(trend) {
  return buildTrendPoints(trend).reverse();
}

function getTrendZoomRange(pointCount) {
  const lastIndex = Math.max(0, pointCount - 1);
  const maxValueSpan = Math.min(MAX_VISIBLE_TREND_BARS - 1, lastIndex);
  const sliderStartValue = Math.max(0, lastIndex - maxValueSpan);
  const sliderEndValue = lastIndex;
  return {
    sliderStartValue,
    sliderEndValue,
    minValueSpan: Math.min(MIN_VISIBLE_TREND_BARS - 1, maxValueSpan),
    maxValueSpan,
  };
}

function buildTrendOption({ trend, tokens }) {
  const buckets = buildChronologicalTrendPoints(trend);
  const days = buckets.map((point) => point.label);
  const usage = buckets.map((point) => point.usage);
  const showSlider = days.length > MAX_VISIBLE_TREND_BARS;
  const { sliderStartValue, sliderEndValue, minValueSpan, maxValueSpan } = getTrendZoomRange(days.length);
  const txt = tokens.chartText;
  const faint = tokens.chartMuted;
  const line = tokens.chartGrid;
  const usageColor = tokens.chartActualBarBottom;
  const usageBarColor = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: tokens.chartActualBarTop },
      { offset: 1, color: tokens.chartActualBarBottom },
    ],
  };
  const usagePeakLineColor = tokens.semanticGoal;
  const usagePeakLabelColor = '#F7F8FC';
  const maxUsage = Math.max(...usage);
  const usagePeakLineData = usage.map((value) => ({
    value,
    symbolSize: value === maxUsage ? 9 : 7,
    label: {
      show: true,
      position: 'top',
      color: usagePeakLabelColor,
      fontSize: 12,
      fontWeight: 780,
      formatter: (params) => formatWan(params.value),
      textBorderColor: 'rgba(13,0,22,.82)',
      textBorderWidth: 2,
      textShadowColor: 'rgba(0,0,0,.82)',
      textShadowBlur: 6,
    },
  }));

  return {
    backgroundColor: 'transparent',
    textStyle: { color: faint, fontFamily: 'inherit' },
    legend: {
      top: 0,
      left: 'center',
      selectedMode: false,
      itemWidth: 18,
      itemHeight: 12,
      itemGap: 22,
      textStyle: {
        color: txt,
        fontSize: 18,
        fontWeight: 850,
        textShadowColor: 'rgba(0,0,0,.55)',
        textShadowBlur: 8,
      },
      data: ['算力用量'],
    },
    grid: { top: 42, left: 10, right: 12, bottom: showSlider ? 44 : 8, containLabel: true },
    dataZoom: showSlider ? [
      {
        type: 'inside',
        xAxisIndex: 0,
        startValue: sliderStartValue,
        endValue: sliderEndValue,
        minValueSpan,
        maxValueSpan,
        zoomLock: false,
        realtime: true,
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 18,
        bottom: 8,
        startValue: sliderStartValue,
        endValue: sliderEndValue,
        minValueSpan,
        maxValueSpan,
        zoomLock: false,
        realtime: true,
        borderColor: 'rgba(184,156,255,.30)',
        backgroundColor: 'rgba(255,255,255,.045)',
        fillerColor: 'rgba(201,169,107,.16)',
        handleStyle: {
          color: 'rgba(227,210,164,.86)',
          borderColor: 'rgba(201,169,107,.62)',
          shadowBlur: 16,
          shadowColor: 'rgba(201,169,107,.28)',
        },
        dataBackground: {
          lineStyle: { color: 'rgba(255,255,255,.16)' },
          areaStyle: { color: 'rgba(255,255,255,.04)' },
        },
        selectedDataBackground: {
          lineStyle: { color: 'rgba(201,169,107,.30)' },
          areaStyle: { color: 'rgba(184,156,255,.08)' },
        },
        showDetail: false,
        brushSelect: false,
      },
    ] : [],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: tokens.chartPointer } },
      appendToBody: true,
      confine: true,
      backgroundColor: 'rgba(0,0,0,.72)',
      borderColor: tokens.chartTooltipBorder,
      borderWidth: 1,
      extraCssText: tooltipExtraCss(),
      textStyle: { color: txt, fontSize: 13 },
      formatter: (params) => {
        const bucket = buckets[params[0]?.dataIndex] ?? null;
        return [
          tooltipHeader(`${bucket?.range || params[0]?.axisValue || ''} 算力用量`),
          tooltipRow({ color: usageColor, label: '算力用量', value: formatWan(params.find((item) => item.seriesName === '算力用量')?.value || 0) }),
        ].join('');
      },
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: line } },
      axisTick: { show: false },
      axisLabel: { color: faint, fontSize: 12, interval: 0, hideOverlap: false, margin: 12 },
    },
    yAxis: {
      type: 'value',
      name: '万点',
      nameTextStyle: { color: faint, fontSize: 12, padding: [0, 0, 0, 8] },
      axisLabel: { color: faint, fontSize: 12 },
      splitLine: { lineStyle: { color: line } },
      axisLine: { show: false },
    },
    series: [
      {
        name: '算力用量',
        type: 'bar',
        barWidth: 22,
        barCategoryGap: '42%',
        itemStyle: {
          color: usageBarColor,
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: { itemStyle: { color: '#ffffff' } },
        data: usage,
      },
      {
        name: '算力用量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: true,
        z: 4,
        lineStyle: { color: usagePeakLineColor, width: 2.4, shadowBlur: 14, shadowColor: 'rgba(201,169,107,.26)' },
        itemStyle: {
          color: usagePeakLineColor,
          borderColor: '#ffffff',
          borderWidth: 2,
          shadowBlur: 12,
          shadowColor: 'rgba(201,169,107,.26)',
        },
        emphasis: {
          scale: true,
          itemStyle: {
            color: usagePeakLineColor,
            borderColor: '#ffffff',
            borderWidth: 2.5,
          },
        },
        data: usagePeakLineData,
      },
    ],
    media: [
      {
        query: { maxWidth: 620 },
        option: {
          grid: { top: 48, left: 4, right: 4, bottom: showSlider ? 38 : 4, containLabel: true },
          legend: { left: 0, itemGap: 10, textStyle: { fontSize: 11 } },
          xAxis: { axisLabel: { interval: 0, hideOverlap: false, fontSize: 11 } },
        },
      },
    ],
  };
}

function buildCapacityTrendOption({ trend, tokens, totalCapacity }) {
  const buckets = buildChronologicalTrendPoints(trend);
  const days = buckets.map((point) => point.label);
  const latestTrendPoint = buildTrendPoints(trend)[0];
  const latestCapacityBase = latestTrendPoint?.capacity || 1;
  const capacityScale = totalCapacity / latestCapacityBase;
  const capacity = buckets.map((point) => Math.round(point.capacity * capacityScale / 10000));
  const usage = buckets.map((point) => Number(point.usage) || 0);
  const utilization = buckets.map((point, index) => percentOf(usage[index], capacity[index]));
  const showSlider = days.length > MAX_VISIBLE_TREND_BARS;
  const { sliderStartValue, sliderEndValue, minValueSpan, maxValueSpan } = getTrendZoomRange(days.length);
  const txt = tokens.chartText;
  const faint = tokens.chartMuted;
  const line = tokens.chartGrid;
  const capacityColor = tokens.semanticCapacity;
  const usageColor = tokens.chartActualBarBottom;
  const utilizationColor = tokens.semanticGoal;
  const usageBarColor = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: tokens.chartActualBarTop },
      { offset: 1, color: tokens.chartActualBarBottom },
    ],
  };

  return {
    backgroundColor: 'transparent',
    textStyle: { color: faint, fontFamily: 'inherit' },
    legend: {
      top: 0,
      left: 'center',
      selectedMode: false,
      itemWidth: 18,
      itemHeight: 12,
      itemGap: 22,
      textStyle: {
        color: txt,
        fontSize: 18,
        fontWeight: 850,
        textShadowColor: 'rgba(0,0,0,.55)',
        textShadowBlur: 8,
      },
      data: ['算力总容量', '算力用量', '利用率'],
    },
    grid: { top: 42, left: 10, right: 12, bottom: showSlider ? 44 : 8, containLabel: true },
    dataZoom: showSlider ? [
      {
        type: 'inside',
        xAxisIndex: 0,
        startValue: sliderStartValue,
        endValue: sliderEndValue,
        minValueSpan,
        maxValueSpan,
        zoomLock: false,
        realtime: true,
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 18,
        bottom: 8,
        startValue: sliderStartValue,
        endValue: sliderEndValue,
        minValueSpan,
        maxValueSpan,
        zoomLock: false,
        realtime: true,
        borderColor: 'rgba(126,167,255,.34)',
        backgroundColor: 'rgba(255,255,255,.045)',
        fillerColor: 'rgba(126,167,255,.22)',
        handleStyle: {
          color: 'rgba(200,217,255,.9)',
          borderColor: 'rgba(126,167,255,.82)',
          shadowBlur: 16,
          shadowColor: 'rgba(126,167,255,.42)',
        },
        dataBackground: {
          lineStyle: { color: 'rgba(255,255,255,.16)' },
          areaStyle: { color: 'rgba(255,255,255,.04)' },
        },
        selectedDataBackground: {
          lineStyle: { color: 'rgba(126,167,255,.45)' },
          areaStyle: { color: 'rgba(126,167,255,.08)' },
        },
        showDetail: false,
        brushSelect: false,
      },
    ] : [],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(126,167,255,.34)', width: 1 } },
      appendToBody: true,
      confine: true,
      backgroundColor: 'rgba(0,0,0,.72)',
      borderColor: tokens.chartTooltipBorder,
      borderWidth: 1,
      extraCssText: tooltipExtraCss(),
      textStyle: { color: txt, fontSize: 13 },
      formatter: (params) => {
        const bucket = buckets[params[0]?.dataIndex] ?? null;
        const capacityValue = params.find((item) => item.seriesName === '算力总容量')?.value || 0;
        const usageValue = params.find((item) => item.seriesName === '算力用量')?.value || 0;
        const utilizationValue = params.find((item) => item.seriesName === '利用率')?.value || 0;
        return [
          tooltipHeader(`${bucket?.range || params[0]?.axisValue || ''} 算力供需`),
          tooltipRow({ color: capacityColor, label: '算力总容量', value: formatWan(capacityValue) }),
          tooltipRow({ color: usageColor, label: '算力用量', value: formatWan(usageValue) }),
          tooltipRow({ color: utilizationColor, label: '利用率', value: formatPct(utilizationValue) }),
        ].join('');
      },
    },
    xAxis: {
      type: 'category',
      data: days,
      boundaryGap: false,
      axisLine: { lineStyle: { color: line } },
      axisTick: { show: false },
      axisLabel: { color: faint, fontSize: 12, interval: 0, hideOverlap: false, margin: 12 },
    },
    yAxis: [
      {
        type: 'value',
        name: '万点',
        scale: true,
        nameTextStyle: { color: faint, fontSize: 12, padding: [0, 0, 0, 8] },
        axisLabel: { color: faint, fontSize: 12 },
        splitLine: { lineStyle: { color: line } },
        axisLine: { show: false },
      },
      {
        type: 'value',
        name: '利用率%',
        min: 0,
        max: (value) => Math.max(12, Math.ceil(value.max + 4)),
        nameTextStyle: { color: faint, fontSize: 12, padding: [0, 8, 0, 0] },
        axisLabel: { color: faint, fontSize: 12, formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: '算力总容量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: capacityColor, width: 2.4, shadowBlur: 10, shadowColor: 'rgba(126,167,255,.34)' },
        itemStyle: { color: capacityColor, borderColor: 'rgba(239,251,255,.88)', borderWidth: 1.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(126,167,255,.30)' },
              { offset: .55, color: 'rgba(126,167,255,.11)' },
              { offset: 1, color: 'rgba(126,167,255,.015)' },
            ],
          },
        },
        emphasis: { focus: 'series' },
        data: capacity,
      },
      {
        name: '算力用量',
        type: 'bar',
        barWidth: 18,
        itemStyle: {
          color: usageBarColor,
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: { itemStyle: { color: '#ffffff' } },
        data: usage,
      },
      {
        name: '利用率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: utilizationColor, width: 2.2, shadowBlur: 12, shadowColor: 'rgba(201,169,107,.24)' },
        itemStyle: { color: utilizationColor, borderColor: 'rgba(255,255,255,.92)', borderWidth: 1.5 },
        emphasis: { focus: 'series' },
        data: utilization,
      },
    ],
    media: [
      {
        query: { maxWidth: 620 },
        option: {
          grid: { top: 48, left: 4, right: 4, bottom: showSlider ? 38 : 4, containLabel: true },
          legend: { left: 0, itemGap: 10, textStyle: { fontSize: 12 } },
          xAxis: { axisLabel: { interval: 0, hideOverlap: false, fontSize: 11 } },
        },
      },
    ],
  };
}

function buildPieOption({ data, tokens, unitLabel, naturalLabelLayout = false }) {
  const colors = data.map((item) => item.color);

  return {
    backgroundColor: 'transparent',
    color: colors,
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      confine: true,
      backgroundColor: 'rgba(0,0,0,.72)',
      borderColor: tokens.chartTooltipBorder,
      borderWidth: 1,
      extraCssText: tooltipExtraCss(),
      textStyle: { color: '#fff', fontSize: 13 },
      formatter: (params) => [
        tooltipHeader(params.name),
        tooltipRow({ color: params.color, label: unitLabel, value: `${params.value}` }),
        tooltipRow({ color: params.color, label: '图表占比', value: `${params.percent}%` }),
      ].join(''),
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '92%'],
        center: ['55%', '52%'],
        avoidLabelOverlap: true,
        minShowLabelAngle: 1,
        padAngle: 1,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(255, 255, 255, .12)',
          borderWidth: 2,
          shadowBlur: 22,
          shadowColor: 'rgba(0, 0, 0, .32)',
        },
        label: {
          show: true,
          position: 'outer',
          color: tokens.chartText,
          fontSize: 14,
          lineHeight: 18,
          formatter: formatComputePieLabel,
          rich: {
            name: {
              color: tokens.chartText,
              fontSize: 14,
              fontWeight: 820,
              lineHeight: 18,
              textShadowColor: 'rgba(0,0,0,.52)',
              textShadowBlur: 8,
            },
            value: {
              color: tokens.chartText,
              fontSize: 13,
              fontWeight: 780,
              lineHeight: 18,
              textShadowColor: 'rgba(0,0,0,.52)',
              textShadowBlur: 8,
            },
          },
        },
        labelLine: {
          show: true,
          lineStyle: { color: tokens.chartAxis, width: 1, opacity: .72 },
        },
        ...(naturalLabelLayout ? {} : { labelLayout: computePieLabelLayout }),
        emphasis: {
          scale: true,
          scaleSize: 3,
          itemStyle: {
            shadowBlur: 18,
            shadowColor: 'rgba(255,255,255,.18)',
          },
        },
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
      },
    ],
    media: [
      {
        query: { maxWidth: 620 },
        option: {
          series: [
            {
              radius: ['50%', '80%'],
              center: ['54%', '48%'],
              label: { fontSize: 12 },
              labelLine: { show: true },
            },
          ],
        },
      },
    ],
  };
}

function KpiCard({ label, value, sub, meta, tone, active }) {
  return (
    <div className="cpu-kpi-slot" data-anim data-search-match={active ? 'true' : undefined}>
      <article className={`cpu-kpi cpu-kpi--${tone}${active ? ' cpu-kpi--match' : ''}`}>
        <span className="cpu-kpi__label">{label}</span>
        <strong className="cpu-kpi__value">{value}</strong>
        <span className="cpu-kpi__sub">{sub}</span>
        <span className="cpu-kpi__meta">{meta}</span>
      </article>
    </div>
  );
}

function Panel({ className = '', title, sub, active, children }) {
  return (
    <section
      className={`cpu-panel ${className}${active ? ' cpu-panel--match' : ''}`}
      data-anim
      data-search-match={active ? 'true' : undefined}
    >
      <header className="cpu-panel__head">
        <div>
          <h3>{title}</h3>
          {sub && <span>{sub}</span>}
        </div>
      </header>
      {children}
    </section>
  );
}

function CustomerColumnHeader({
  label,
  filterKey,
  activeValue,
  options,
  openFilter,
  setOpenFilter,
  onChange,
}) {
  const isOpen = openFilter === filterKey;
  const isFiltered = activeValue !== CUSTOMER_COLUMN_FILTER_ALL;

  return (
    <th>
      <div className="cpu-th-filter">
        <span>{label}</span>
        <div
          className={`cpu-column-filter${isOpen ? ' cpu-column-filter--open' : ''}${isFiltered ? ' cpu-column-filter--active' : ''}`}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setOpenFilter(null);
            }
          }}
        >
          <button
            type="button"
            className="cpu-column-filter__trigger"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label={`${label}筛选${isFiltered ? `，当前${activeValue}` : '，当前全部'}`}
            onClick={() => setOpenFilter(isOpen ? null : filterKey)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpenFilter(null);
            }}
          >
            <AppIcon name="filter" className="cpu-column-filter__icon" size={13} />
          </button>
          {isOpen && (
            <div className="cpu-column-filter__menu" role="listbox" aria-label={`${label}筛选`}>
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === activeValue}
                  className={`cpu-column-filter__option${option.value === activeValue ? ' cpu-column-filter__option--active' : ''}`}
                  onClick={() => onChange(filterKey, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </th>
  );
}

function CustomerSortableHeader({
  label,
  sortFieldKey,
  activeSortField,
  activeSortDirection,
  onSortChange,
}) {
  const isActive = activeSortField.key === sortFieldKey;
  const directionLabel = isActive ? CUSTOMER_SORT_DIRECTIONS[activeSortDirection] : '未排序';
  const nextDirectionLabel = isActive && activeSortDirection === 'desc' ? '升序' : '降序';

  return (
    <th>
      <span className="cpu-sort-header">
        <button
          type="button"
          className={`cpu-sort-header__button${isActive ? ' cpu-sort-header__button--active' : ''}`}
          aria-pressed={isActive}
          aria-label={`${label}排序，当前${directionLabel}，点击切换为${nextDirectionLabel}`}
          title={`${label} · ${isActive ? directionLabel : '点击按降序排序'}`}
          onClick={() => onSortChange(sortFieldKey)}
        >
          <span className="cpu-sort-header__label">{label}</span>
          <span className="cpu-sort-header__arrows" aria-hidden="true">
            <AppIcon name="sortAsc" className={`cpu-sort-header__arrow cpu-sort-header__arrow--up${isActive && activeSortDirection === 'asc' ? ' cpu-sort-header__arrow--active' : ''}`} size={9} strokeWidth={2.2} />
            <AppIcon name="sortDesc" className={`cpu-sort-header__arrow cpu-sort-header__arrow--down${isActive && activeSortDirection === 'desc' ? ' cpu-sort-header__arrow--active' : ''}`} size={9} strokeWidth={2.2} />
          </span>
        </button>
      </span>
    </th>
  );
}

export default function ComputeUsagePage({
  searchTerm = '',
  dim = 'month',
  dateRange = [],
  computeDataState = { status: 'ready', error: '' },
  customerSyncState = { status: 'idle', total: 0 },
}) {
  const tokens = useThemeTokens();
  const [customerSort, setCustomerSort] = useState('usage-desc');
  const [customerColumnFilters, setCustomerColumnFilters] = useState(() => buildInitialCustomerColumnFilters());
  const [openCustomerColumnFilter, setOpenCustomerColumnFilter] = useState(null);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(DEFAULT_CUSTOMER_PAGE_SIZE);
  const [customerPageSizeMenuOpen, setCustomerPageSizeMenuOpen] = useState(false);
  const [customerJumpPage, setCustomerJumpPage] = useState('');
  const periodLabel = DIM_TREND_LABELS[dim] ?? DIM_TREND_LABELS.month;
  const overview = getComputeOverview();
  const trend = getComputeUsageTrend({ dim, dateRange });
  const versions = getComputeVersionConsumption();
  const distribution = getComputeUsageDistribution();
  const resourceHealth = getComputeResourceHealth();
  const customers = getComputeCustomerRows();
  const customerRows = useMemo(
    () => buildCustomerTableRows(customers),
    [customers]
  );
  const executive = useMemo(
    () => buildExecutiveSnapshot({ overview, trend, distribution, customerRows }),
    [overview, trend, distribution, customerRows]
  );

  const kpis = [
    {
      label: '可用算力池',
      value: formatInt(overview.totalCapacity),
      sub: '当前可调度总容量',
      meta: `净增 ${formatSignedInt(executive.netCapacity)}`,
      tone: 'capacity',
      keywords: ['可用算力池', '算力总容量', '容量', '余额'],
    },
    {
      label: '本期消耗算力',
      value: formatInt(overview.consumedCapacity),
      sub: `${periodLabel}累计消耗`,
      meta: `峰值 ${formatWan(executive.peakUsage)} · ${executive.usageDeltaLabel}`,
      tone: 'burn',
      keywords: ['本期消耗算力', '消耗算力', '用量', '趋势'],
    },
    {
      label: '算力利用率',
      value: formatPct(executive.utilizationRate),
      sub: '消耗 / 总容量',
      meta: `客户均用 ${formatInt(executive.averageCustomerUsage)} 点`,
      tone: 'reply',
      keywords: ['算力利用率', '利用率', '供需', '效率'],
    },
    {
      label: '高风险客户',
      value: formatInt(executive.highRiskCount),
      sub: '低余额 / 低回复 / 高消耗',
      meta: `低余额 ${formatInt(executive.lowBalanceCount)} · 低回复 ${formatInt(executive.lowReplyCount)}`,
      tone: 'add',
      keywords: ['高风险客户', '风险客户', '低余额', '低回复', '高消耗'],
    },
  ];

  const trendOption = useMemo(() => buildTrendOption({ trend, tokens }), [trend, tokens]);
  const capacityTrendOption = useMemo(
    () => buildCapacityTrendOption({ trend, tokens, totalCapacity: overview.totalCapacity }),
    [trend, tokens, overview.totalCapacity]
  );
  const versionPieData = useMemo(
    () => applyComputeRingPalette(versions),
    [versions]
  );
  const distributionPieData = useMemo(
    () => applyComputeRingPalette(distribution),
    [distribution]
  );
  const versionPieOption = useMemo(
    () => buildPieOption({ data: versionPieData, tokens, unitLabel: '消耗权重', naturalLabelLayout: true }),
    [versionPieData, tokens]
  );
  const distributionPieOption = useMemo(
    () => buildPieOption({ data: distributionPieData, tokens, unitLabel: '客户占比权重' }),
    [distributionPieData, tokens]
  );
  const versionInsight = useMemo(() => buildVersionInsight(versionPieData), [versionPieData]);
  const distributionInsight = useMemo(() => buildDistributionInsight(distributionPieData), [distributionPieData]);
  const resourceHealthInsight = useMemo(() => buildResourceHealthInsight(resourceHealth), [resourceHealth]);
  const customerColumnFilterOptions = useMemo(
    () => CUSTOMER_COLUMN_FILTERS.reduce((options, field) => ({
      ...options,
      [field.key]: buildCustomerColumnFilterOptions(customerRows, field.key),
    }), {}),
    [customerRows]
  );
  const filteredCustomers = useMemo(
    () => filterCustomerRowsByColumnFilters(customerRows, customerColumnFilters),
    [customerRows, customerColumnFilters]
  );
  const sortedCustomers = useMemo(
    () => sortCustomerRows(filteredCustomers, customerSort),
    [filteredCustomers, customerSort]
  );
  const activeCustomerSort = getCustomerSortState(customerSort);
  const activeSortField = activeCustomerSort.sortField;
  const activeSortDirection = activeCustomerSort.sortDirection;
  const customerTotal = sortedCustomers.length;
  const selectedSortLabel = `${activeSortField.label} · ${CUSTOMER_SORT_DIRECTIONS[activeSortDirection]}`;
  const customerPageCount = Math.max(1, Math.ceil(customerTotal / customerPageSize));
  const safeCustomerPage = clampCustomerPage(customerPage, customerPageCount);
  const customerStartIndex = customerTotal ? (safeCustomerPage - 1) * customerPageSize : 0;
  const customerEndIndex = Math.min(customerTotal, customerStartIndex + customerPageSize);
  const customerRangeStart = customerTotal ? customerStartIndex + 1 : 0;
  const customerPageRows = sortedCustomers.slice(customerStartIndex, customerEndIndex);
  const customerPageNumbers = getCustomerPageNumbers(safeCustomerPage, customerPageCount);

  function resetCustomerPage() {
    setCustomerPage(1);
    setCustomerJumpPage('');
  }

  function updateCustomerSort(nextSortFieldKey) {
    const nextDirection = activeSortField.key === nextSortFieldKey && activeSortDirection === 'desc' ? 'asc' : 'desc';
    setCustomerSort(`${nextSortFieldKey}-${nextDirection}`);
    setOpenCustomerColumnFilter(null);
    resetCustomerPage();
  }

  function updateCustomerColumnFilter(filterKey, nextValue) {
    setCustomerColumnFilters((filters) => ({
      ...filters,
      [filterKey]: nextValue,
    }));
    setOpenCustomerColumnFilter(null);
    resetCustomerPage();
  }

  function updateCustomerPage(nextPage) {
    setCustomerPage(clampCustomerPage(nextPage, customerPageCount));
    setCustomerJumpPage('');
    setCustomerPageSizeMenuOpen(false);
  }

  function updateCustomerPageSize(nextSize) {
    setCustomerPageSize(nextSize);
    setCustomerPage(1);
    setCustomerJumpPage('');
    setCustomerPageSizeMenuOpen(false);
  }

  function submitCustomerJumpPage() {
    if (!customerJumpPage) return;
    updateCustomerPage(customerJumpPage);
  }

  if (computeDataState.status === 'idle' || computeDataState.status === 'loading') {
    return (
      <div className="cpu-page">
        <div className="cpu-sync cpu-sync--loading" role="status">
          <span>正在同步 token 用量数据</span>
          <b>加载完成后自动显示，不使用本地示例数据。</b>
        </div>
        <div className="cpu-skeleton-grid" aria-hidden="true">
          <div className="cpu-skeleton-card" />
          <div className="cpu-skeleton-card" />
          <div className="cpu-skeleton-card" />
          <div className="cpu-skeleton-card" />
        </div>
        <div className="cpu-skeleton-panel cpu-skeleton-panel--tall" />
        <div className="cpu-skeleton-panel" />
      </div>
    );
  }

  return (
    <div className="cpu-page">
      <div className="cpu-kpi-grid">
        {kpis.map((item) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            sub={item.sub}
            meta={item.meta}
            tone={item.tone}
            active={matchesTerm(item.keywords, searchTerm)}
          />
        ))}
      </div>

      <section
        className={`cpu-command cpu-command--${executive.tone}`}
        data-anim
        data-search-match={matchesTerm(SEARCH_KEYWORDS.overview, searchTerm) ? 'true' : undefined}
      >
        <div className="cpu-command__copy">
          <span className="cpu-command__eyebrow">经营判断 · {periodLabel}口径</span>
          <strong className="cpu-command__status">{executive.status}</strong>
          <span className="cpu-command__text">{executive.cause}</span>
          <span className="cpu-command__action">{executive.action}</span>
        </div>
        <div className="cpu-command__metrics" aria-label="算力经营判断指标">
          {executive.metrics.map((metric) => (
            <span className="cpu-command__metric" key={metric.label}>
              <b>{metric.value}</b>
              <em>{metric.label}</em>
            </span>
          ))}
        </div>
      </section>

      <div className="cpu-grid">
        <Panel
          className="cpu-panel--trend"
          title={`${periodLabel}算力用量趋势`}
          sub="算力用量"
          active={matchesTerm(SEARCH_KEYWORDS.trend, searchTerm)}
        >
          <div className="cpu-trend-chart">
            <EChart className="cpu-trend-echart" option={trendOption} style={{ height: '100%' }} />
          </div>
        </Panel>

        <Panel
          className="cpu-panel--capacity-trend"
          title={`${periodLabel}算力供需关系`}
          sub="容量池 · 消耗 · 利用率"
          active={matchesTerm(SEARCH_KEYWORDS.trend, searchTerm)}
        >
          <div className="cpu-capacity-chart">
            <EChart className="cpu-capacity-echart" option={capacityTrendOption} style={{ height: '100%' }} />
          </div>
        </Panel>

        <Panel
          className="cpu-panel--health"
          title="算力消耗构成"
          sub="OCR · VOC · 视频 · 回复拦截 · 对话测试"
          active={matchesTerm(SEARCH_KEYWORDS.health, searchTerm)}
        >
          <div className="cpu-health" aria-label="算力消耗构成">
            {resourceHealth.map((row) => (
              <div className="cpu-health-row" key={row.key}>
                <span className="cpu-health-row__name">{row.name}</span>
                <span className="cpu-health-row__bar" aria-hidden="true">
                  <i style={{ width: `${Math.min(100, Math.max(0, Number(row.usage) || 0))}%`, background: row.color }} />
                </span>
                <span className="cpu-health-row__value">{formatPct(row.usage)}</span>
                <span className="cpu-health-row__state">{row.trend || row.state}</span>
              </div>
            ))}
          </div>
          <div className="cpu-panel-insight">{resourceHealthInsight}</div>
        </Panel>

        <Panel
          className="cpu-panel--pie cpu-panel--version-pie"
          title="各版本算力消耗"
          active={matchesTerm(SEARCH_KEYWORDS.version, searchTerm)}
        >
          <div className="cpu-pie-wrap">
            <EChart option={versionPieOption} style={{ height: '100%' }} />
          </div>
          <div className="cpu-panel-insight">{versionInsight}</div>
        </Panel>

        <Panel
          className="cpu-panel--pie cpu-panel--usage-pie"
          title="算力用量分布"
          active={matchesTerm(SEARCH_KEYWORDS.distribution, searchTerm)}
        >
          <div className="cpu-pie-wrap">
            <EChart option={distributionPieOption} style={{ height: '100%' }} />
          </div>
          <div className="cpu-panel-insight">{distributionInsight}</div>
        </Panel>
      </div>

      <Panel
        className="cpu-panel--customers"
        title="客户算力明细排行"
        sub={`${formatInt(customerTotal)} 条客户记录 · ${selectedSortLabel}`}
        active={matchesTerm(SEARCH_KEYWORDS.customer, searchTerm)}
      >
        <div className="cpu-customer-toolbar">
          {customerSyncState.status === 'loading' && (
            <span className="cpu-customer-sync" role="status">
              客户数据同步中 {formatInt(customers.length)}/{formatInt(customerSyncState.total)}
            </span>
          )}
          <span className="cpu-customer-range">
            {formatInt(customerRangeStart)}-{formatInt(customerEndIndex)} / {formatInt(customerTotal)}
          </span>
        </div>

        <div className="cpu-table-wrap">
          <table className="cpu-table">
            <thead>
              <tr>
                <th>手机号</th>
                <th>负责人</th>
                <CustomerColumnHeader
                  label="账号类型"
                  filterKey="accountType"
                  activeValue={customerColumnFilters.accountType}
                  options={customerColumnFilterOptions.accountType}
                  openFilter={openCustomerColumnFilter}
                  setOpenFilter={setOpenCustomerColumnFilter}
                  onChange={updateCustomerColumnFilter}
                />
                <CustomerColumnHeader
                  label="销售负责人"
                  filterKey="salesOwner"
                  activeValue={customerColumnFilters.salesOwner}
                  options={customerColumnFilterOptions.salesOwner}
                  openFilter={openCustomerColumnFilter}
                  setOpenFilter={setOpenCustomerColumnFilter}
                  onChange={updateCustomerColumnFilter}
                />
                <CustomerColumnHeader
                  label="客成负责人"
                  filterKey="successOwner"
                  activeValue={customerColumnFilters.successOwner}
                  options={customerColumnFilterOptions.successOwner}
                  openFilter={openCustomerColumnFilter}
                  setOpenFilter={setOpenCustomerColumnFilter}
                  onChange={updateCustomerColumnFilter}
                />
                <CustomerSortableHeader
                  label="算力用量"
                  sortFieldKey="usage"
                  activeSortField={activeSortField}
                  activeSortDirection={activeSortDirection}
                  onSortChange={updateCustomerSort}
                />
                <CustomerSortableHeader
                  label="算力余额"
                  sortFieldKey="balance"
                  activeSortField={activeSortField}
                  activeSortDirection={activeSortDirection}
                  onSortChange={updateCustomerSort}
                />
                <CustomerSortableHeader
                  label="平均回复率"
                  sortFieldKey="reply"
                  activeSortField={activeSortField}
                  activeSortDirection={activeSortDirection}
                  onSortChange={updateCustomerSort}
                />
                <th>风险标签</th>
                <th>建议动作</th>
              </tr>
            </thead>
            <tbody>
              {customerPageRows.map((customer) => (
                <tr key={customer.rowKey} className={`cpu-table-row cpu-table-row--${customer.riskTone}`}>
                  <td>{customer.phone}</td>
                  <td className="cpu-table__owner">{customer.owner}</td>
                  <td>{customer.accountType}</td>
                  <td>{customer.salesOwner}</td>
                  <td>{customer.successOwner}</td>
                  <td>{formatInt(customer.usage)}</td>
                  <td>{formatInt(customer.balance)}</td>
                  <td>{formatPct(customer.averageReplyRate)}</td>
                  <td>
                    <span className="cpu-risk-tags">
                      {customer.riskTags.map((tag) => (
                        <span className={`cpu-risk-tag cpu-risk-tag--${tag.tone}`} key={tag.label}>{tag.label}</span>
                      ))}
                    </span>
                  </td>
                  <td className="cpu-table__action">{customer.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <nav className="cpu-pagination" aria-label="客户明细分页">
          <span className="cpu-pagination__total">共 {formatInt(customerTotal)} 条</span>
          <button
            type="button"
            className="cpu-page-button"
            aria-label="上一页"
            disabled={safeCustomerPage === 1}
            onClick={() => updateCustomerPage(safeCustomerPage - 1)}
          >
            <AppIcon name="chevronLeft" size={14} />
          </button>
          {customerPageNumbers.map((item) => (
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                className={`cpu-page-button${item === safeCustomerPage ? ' cpu-page-button--active' : ''}`}
                onClick={() => updateCustomerPage(item)}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="cpu-page-ellipsis">...</span>
            )
          ))}
          <button
            type="button"
            className="cpu-page-button"
            aria-label="下一页"
            disabled={safeCustomerPage === customerPageCount}
            onClick={() => updateCustomerPage(safeCustomerPage + 1)}
          >
            <AppIcon name="chevronRight" size={14} />
          </button>
          <div
            className={`cpu-page-size${customerPageSizeMenuOpen ? ' cpu-page-size--open' : ''}`}
            aria-label="每页条数"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setCustomerPageSizeMenuOpen(false);
              }
            }}
          >
            {customerPageSizeMenuOpen && (
              <div className="cpu-page-size-menu" role="listbox" aria-label="每页条数">
                {CUSTOMER_PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    role="option"
                    aria-selected={size === customerPageSize}
                    className={`cpu-page-size-option${size === customerPageSize ? ' cpu-page-size-option--active' : ''}`}
                    onClick={() => updateCustomerPageSize(size)}
                  >
                    {size}条/页
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className={`cpu-page-size-select${customerPageSizeMenuOpen ? ' cpu-page-size-select--open' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={customerPageSizeMenuOpen}
              onClick={() => setCustomerPageSizeMenuOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setCustomerPageSizeMenuOpen(false);
              }}
            >
              <span>{customerPageSize}条/页</span>
              <AppIcon name="chevronDown" className="cpu-page-size-select__chevron" size={14} />
            </button>
          </div>
          <label className="cpu-page-jump">
            <span>前往</span>
            <input
              type="number"
              min="1"
              max={customerPageCount}
              value={customerJumpPage}
              onChange={(event) => setCustomerJumpPage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitCustomerJumpPage();
              }}
            />
            <span>页</span>
          </label>
          <button type="button" className="cpu-page-go" onClick={submitCustomerJumpPage}>确定</button>
        </nav>
      </Panel>
    </div>
  );
}
