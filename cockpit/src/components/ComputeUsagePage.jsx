/*
 更新时间: 2026-07-01 19:06:16 CST
 更新内容: 客户算力明细排行增加账号类型、销售负责人、客成负责人表头下拉筛选。
*/
import { useMemo, useState } from 'react';

import EChart from './EChart';
import {
  getComputeCustomerRows,
  getComputeOverview,
  getComputeUsageDistribution,
  getComputeUsageTrend,
  getComputeVersionConsumption,
} from '../data/mock';
import { useThemeTokens } from '../lib/theme';
import './ComputeUsagePage.css';

const SEARCH_KEYWORDS = {
  overview: ['算力', '总容量', '新增', '消耗', '客户', '回复率', '余额'],
  trend: ['趋势', '年', '月', '日', '日期', '自动回复', '商品同步', '容量'],
  version: ['版本', '试用版', '企业版', '旗舰版', '卓越版', '创世版', '启航版'],
  distribution: ['分布', '用量', '客户占比', '高消耗', '零用量'],
  customer: ['客户', '排行', '手机号', '负责人', '平均回复率'],
};

const DIM_TREND_LABELS = {
  day: '日度',
  month: '月度',
  year: '年度',
};
const MIN_VISIBLE_TREND_BARS = 3;
const MAX_VISIBLE_TREND_BARS = 15;
const CUSTOMER_SORT_FIELDS = [
  { key: 'usage', label: '算力用量 / 全部', getValue: (row) => row.usage },
  { key: 'balance', label: '算力余额 / 全部', getValue: (row) => row.balance },
  { key: 'reply', label: '平均回复率 / 全部', getValue: (row) => row.averageReplyRate },
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
  '#e6fbff',
  '#9eeeff',
  '#6ea8ff',
  '#b8ffd9',
  'rgba(230, 251, 255, .42)',
  '#ccf7ff',
  '#89dfff',
  '#d7ffe9',
];
const COMPUTE_VERSION_RIGHT_LABEL_SLOTS = {
  '试用版': -82,
  '企业版': -42,
  '旗舰版': -2,
  '免费版': 38,
  '卓越版': 86,
};
const COMPUTE_STACKED_PIE_LABELS = new Set(['卓越版']);

function formatInt(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatWan(value) {
  return `${Number(value).toLocaleString('zh-CN')}万`;
}

function formatPct(value) {
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}%`;
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

function buildCustomerTableRows(rows, totalCount) {
  const sortedRows = [...rows].sort((a, b) => b.usage - a.usage);
  if (!sortedRows.length) return [];

  const totalRows = Math.max(sortedRows.length, Number(totalCount) || sortedRows.length);
  const tailStartUsage = sortedRows[sortedRows.length - 1].usage;

  return Array.from({ length: totalRows }, (_, index) => {
    if (index < sortedRows.length) {
      return { ...sortedRows[index], rowKey: `${sortedRows[index].phone}-${index}` };
    }

    const source = sortedRows[index % sortedRows.length];
    const tailIndex = index - sortedRows.length + 1;
    const usage = Math.max(1200, tailStartUsage - tailIndex * 73);
    const balance = Math.max(0, source.balance + ((index % 13) - 6) * 24860 - tailIndex * 19);
    const averageReplyRate = Math.max(42, Math.min(96, source.averageReplyRate + ((index % 7) - 3)));

    return {
      ...source,
      usage,
      balance,
      averageReplyRate,
      rowKey: `${source.phone}-${index}`,
    };
  });
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
  return trend.map((point) => {
    const usage = point.usage;
    const target = point.target ?? Math.max(usage + 36, usage + (point.addOn ?? 0) + 34);

    return {
      label: point.day,
      range: point.range ?? point.day,
      capacity: point.capacity ?? 0,
      usage,
      target,
      completion: target ? +((usage / target) * 100).toFixed(1) : 0,
    };
  });
}

function getTrendZoomRange(pointCount) {
  const sliderEndValue = Math.min(MAX_VISIBLE_TREND_BARS - 1, pointCount - 1);
  return {
    sliderEndValue,
    minValueSpan: Math.min(MIN_VISIBLE_TREND_BARS - 1, sliderEndValue),
    maxValueSpan: sliderEndValue,
  };
}

function buildTrendOption({ trend, tokens }) {
  const buckets = buildTrendPoints(trend);
  const days = buckets.map((point) => point.label);
  const usage = buckets.map((point) => point.usage);
  const target = buckets.map((point) => point.target);
  const completion = buckets.map((point) => point.completion);
  const showSlider = days.length > MAX_VISIBLE_TREND_BARS;
  const { sliderEndValue, minValueSpan, maxValueSpan } = getTrendZoomRange(days.length);
  const txt = tokens.chartText;
  const faint = tokens.chartMuted;
  const line = tokens.chartGrid;
  const usageColor = tokens.chartBar;
  const targetColor = tokens.chartBarFaint;
  const completionColor = '#f472b6';

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
      data: ['算力用量', '目标用量', '完成率%'],
    },
    grid: { top: 42, left: 10, right: 12, bottom: showSlider ? 44 : 8, containLabel: true },
    dataZoom: showSlider ? [
      {
        type: 'inside',
        xAxisIndex: 0,
        startValue: 0,
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
        startValue: 0,
        endValue: sliderEndValue,
        minValueSpan,
        maxValueSpan,
        zoomLock: false,
        realtime: true,
        borderColor: 'rgba(192,132,252,.32)',
        backgroundColor: 'rgba(255,255,255,.045)',
        fillerColor: 'rgba(244,114,182,.26)',
        handleStyle: {
          color: 'rgba(252,231,243,.88)',
          borderColor: 'rgba(244,114,182,.8)',
          shadowBlur: 16,
          shadowColor: 'rgba(192,132,252,.56)',
        },
        dataBackground: {
          lineStyle: { color: 'rgba(255,255,255,.16)' },
          areaStyle: { color: 'rgba(255,255,255,.04)' },
        },
        selectedDataBackground: {
          lineStyle: { color: 'rgba(244,114,182,.46)' },
          areaStyle: { color: 'rgba(192,132,252,.1)' },
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
          tooltipRow({ color: targetColor, label: '目标用量', value: formatWan(params.find((item) => item.seriesName === '目标用量')?.value || 0) }),
          tooltipRow({ color: completionColor, label: '完成率', value: `${params.find((item) => item.seriesName === '完成率%')?.value || 0}%` }),
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
    yAxis: [
      {
        type: 'value',
        name: '万点',
        nameTextStyle: { color: faint, fontSize: 12, padding: [0, 0, 0, 8] },
        axisLabel: { color: faint, fontSize: 12 },
        splitLine: { lineStyle: { color: line } },
        axisLine: { show: false },
      },
      {
        type: 'value',
        name: '%',
        min: 0,
        max: 100,
        nameTextStyle: { color: faint, fontSize: 12 },
        axisLabel: { color: faint, fontSize: 12, formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: '目标用量',
        type: 'bar',
        barWidth: 22,
        barCategoryGap: '42%',
        itemStyle: {
          color: tokens.chartBarFaint,
          borderColor: tokens.chartAxis,
          borderWidth: 1,
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: { disabled: true },
        data: target,
      },
      {
        name: '算力用量',
        type: 'bar',
        barWidth: 22,
        barGap: '-100%',
        barCategoryGap: '42%',
        itemStyle: {
          color: tokens.chartBar,
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: { itemStyle: { color: '#ffffff' } },
        data: usage,
      },
      {
        name: '完成率%',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: completionColor, width: 2 },
        itemStyle: { color: completionColor, borderColor: tokens.chartPointBorder, borderWidth: 1.5 },
        label: {
          show: true,
          position: 'top',
          color: completionColor,
          fontSize: 12,
          fontWeight: 700,
          formatter: '{c}%',
        },
        data: completion,
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
  const buckets = buildTrendPoints(trend);
  const days = buckets.map((point) => point.label);
  const latestCapacityBase = buckets[0]?.capacity || 1;
  const capacityScale = totalCapacity / latestCapacityBase;
  const capacity = buckets.map((point) => Math.round(point.capacity * capacityScale));
  const showSlider = days.length > MAX_VISIBLE_TREND_BARS;
  const { sliderEndValue, minValueSpan, maxValueSpan } = getTrendZoomRange(days.length);
  const txt = tokens.chartText;
  const faint = tokens.chartMuted;
  const line = tokens.chartGrid;
  const capacityColor = '#38f5ff';

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
      data: ['算力总容量'],
    },
    grid: { top: 42, left: 10, right: 12, bottom: showSlider ? 44 : 8, containLabel: true },
    dataZoom: showSlider ? [
      {
        type: 'inside',
        xAxisIndex: 0,
        startValue: 0,
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
        startValue: 0,
        endValue: sliderEndValue,
        minValueSpan,
        maxValueSpan,
        zoomLock: false,
        realtime: true,
        borderColor: 'rgba(56,245,255,.34)',
        backgroundColor: 'rgba(255,255,255,.045)',
        fillerColor: 'rgba(56,245,255,.24)',
        handleStyle: {
          color: 'rgba(224,252,255,.9)',
          borderColor: 'rgba(56,245,255,.82)',
          shadowBlur: 16,
          shadowColor: 'rgba(56,245,255,.5)',
        },
        dataBackground: {
          lineStyle: { color: 'rgba(255,255,255,.16)' },
          areaStyle: { color: 'rgba(255,255,255,.04)' },
        },
        selectedDataBackground: {
          lineStyle: { color: 'rgba(56,245,255,.45)' },
          areaStyle: { color: 'rgba(56,245,255,.08)' },
        },
        showDetail: false,
        brushSelect: false,
      },
    ] : [],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(56,245,255,.34)', width: 1 } },
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
          tooltipHeader(`${bucket?.range || params[0]?.axisValue || ''} 算力总容量`),
          tooltipRow({ color: capacityColor, label: '算力总容量', value: formatInt(params[0]?.value || 0) }),
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
    yAxis: {
      type: 'value',
      name: '点',
      scale: true,
      nameTextStyle: { color: faint, fontSize: 12, padding: [0, 0, 0, 8] },
      axisLabel: { color: faint, fontSize: 12 },
      splitLine: { lineStyle: { color: line } },
      axisLine: { show: false },
    },
    series: [
      {
        name: '算力总容量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: capacityColor, width: 2.4, shadowBlur: 10, shadowColor: 'rgba(56,245,255,.36)' },
        itemStyle: { color: capacityColor, borderColor: 'rgba(239,251,255,.88)', borderWidth: 1.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(56,245,255,.32)' },
              { offset: .55, color: 'rgba(56,245,255,.12)' },
              { offset: 1, color: 'rgba(56,245,255,.015)' },
            ],
          },
        },
        emphasis: { focus: 'series' },
        data: capacity,
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
          borderColor: 'rgba(12,12,13,.72)',
          borderWidth: 2,
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
    <div className="cpu-kpi-slot" data-anim>
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
    <section className={`cpu-panel ${className}${active ? ' cpu-panel--match' : ''}`} data-anim>
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
            <span className="cpu-column-filter__chevron" aria-hidden="true" />
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

export default function ComputeUsagePage({ searchTerm = '', dim = 'month', dateRange = [] }) {
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
  const customers = getComputeCustomerRows();
  const latestTrend = trend[0] ?? { capacity: 0, usage: 0, addOn: 0 };

  const kpis = [
    {
      label: '算力总容量',
      value: formatInt(overview.totalCapacity),
      sub: '当前可调度容量池',
      meta: `${periodLabel}容量 ${formatWan(latestTrend.capacity)}`,
      tone: 'capacity',
      keywords: ['算力总容量', '容量', '余额'],
    },
    {
      label: '消耗算力',
      value: formatInt(overview.consumedCapacity),
      sub: `${periodLabel}累计消耗`,
      meta: `日峰值 ${formatWan(latestTrend.usage)}`,
      tone: 'burn',
      keywords: ['消耗算力', '用量', '趋势'],
    },
    {
      label: '新增算力',
      value: formatInt(overview.addedCapacity),
      sub: '充值与扩容入池',
      meta: `最近一日增量 ${formatWan(latestTrend.addOn)}`,
      tone: 'add',
      keywords: ['新增算力', '扩容', '充值'],
    },
    {
      label: '客户回复效率',
      value: formatPct(overview.averageReplyRate),
      sub: `${formatInt(overview.customerCount)} 个客户纳入统计`,
      meta: `新开客户 ${overview.newCustomers} · 店铺 ${overview.newStores}`,
      tone: 'reply',
      keywords: ['客户', '平均回复率', '店铺'],
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
  const customerRows = useMemo(
    () => buildCustomerTableRows(customers, overview.totalCustomers),
    [customers, overview.totalCustomers]
  );
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

      <div className="cpu-grid">
        <Panel
          className="cpu-panel--trend"
          title={`${periodLabel}算力用量趋势`}
          sub="基础消耗 + 目标用量 · 完成率"
          active={matchesTerm(SEARCH_KEYWORDS.trend, searchTerm)}
        >
          <div className="cpu-trend-chart">
            <EChart className="cpu-trend-echart" option={trendOption} style={{ height: '100%' }} />
          </div>
        </Panel>

        <Panel
          className="cpu-panel--capacity-trend"
          title={`${periodLabel}算力总容量趋势`}
          sub="容量池变化 · 可调度算力"
          active={matchesTerm(SEARCH_KEYWORDS.trend, searchTerm)}
        >
          <div className="cpu-capacity-chart">
            <EChart className="cpu-capacity-echart" option={capacityTrendOption} style={{ height: '100%' }} />
          </div>
        </Panel>

        <Panel
          className="cpu-panel--pie cpu-panel--version-pie"
          title="各版本算力消耗"
          active={matchesTerm(SEARCH_KEYWORDS.version, searchTerm)}
        >
          <div className="cpu-pie-wrap">
            <EChart option={versionPieOption} style={{ height: '100%' }} />
          </div>
        </Panel>

        <Panel
          className="cpu-panel--pie cpu-panel--usage-pie"
          title="算力用量分布"
          active={matchesTerm(SEARCH_KEYWORDS.distribution, searchTerm)}
        >
          <div className="cpu-pie-wrap">
            <EChart option={distributionPieOption} style={{ height: '100%' }} />
          </div>
        </Panel>
      </div>

      <Panel
        className="cpu-panel--customers"
        title="客户算力明细排行"
        sub={`${formatInt(customerTotal)} 条客户记录 · ${selectedSortLabel}`}
        active={matchesTerm(SEARCH_KEYWORDS.customer, searchTerm)}
      >
        <div className="cpu-customer-toolbar">
          <div className="cpu-customer-filters" aria-label="客户明细排序">
            {CUSTOMER_SORT_FIELDS.map((field) => {
              const isActive = activeSortField.key === field.key;
              const directionLabel = CUSTOMER_SORT_DIRECTIONS[activeSortDirection];

              return (
                <button
                  key={field.key}
                  type="button"
                  className={`cpu-sort-card${isActive ? ' cpu-sort-card--active' : ''}`}
                  aria-pressed={isActive}
                  aria-label={`${field.label}${isActive ? `，当前${directionLabel}` : '，点击按降序排序'}`}
                  title={`${field.label}${isActive ? ` · ${directionLabel}` : ' · 点击排序'}`}
                  onClick={() => updateCustomerSort(field.key)}
                >
                  <span className="cpu-sort-card__label">{field.label}</span>
                  <span className="cpu-sort-card__arrows" aria-hidden="true">
                    <span className={`cpu-sort-card__arrow cpu-sort-card__arrow--up${isActive && activeSortDirection === 'asc' ? ' cpu-sort-card__arrow--active' : ''}`} />
                    <span className={`cpu-sort-card__arrow cpu-sort-card__arrow--down${isActive && activeSortDirection === 'desc' ? ' cpu-sort-card__arrow--active' : ''}`} />
                  </span>
                </button>
              );
            })}
          </div>
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
                <th>算力用量</th>
                <th>算力余额</th>
                <th>平均回复率</th>
              </tr>
            </thead>
            <tbody>
              {customerPageRows.map((customer) => (
                <tr key={customer.rowKey}>
                  <td>{customer.phone}</td>
                  <td className="cpu-table__owner">{customer.owner}</td>
                  <td>{customer.accountType}</td>
                  <td>{customer.salesOwner}</td>
                  <td>{customer.successOwner}</td>
                  <td>{formatInt(customer.usage)}</td>
                  <td>{formatInt(customer.balance)}</td>
                  <td>{formatPct(customer.averageReplyRate)}</td>
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
            disabled={safeCustomerPage === 1}
            onClick={() => updateCustomerPage(safeCustomerPage - 1)}
          >
            ‹
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
            disabled={safeCustomerPage === customerPageCount}
            onClick={() => updateCustomerPage(safeCustomerPage + 1)}
          >
            ›
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
              <span className="cpu-page-size-select__chevron" aria-hidden="true" />
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
