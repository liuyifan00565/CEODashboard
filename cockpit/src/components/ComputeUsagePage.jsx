/*
 更新时间: 2026-07-01 16:58:56 CST
 更新内容: 将算力趋势荧光动效限制到底部拖动条本身，保留顶部 KPI BorderGlow，并让算力圆环图外拉标签百分比换行显示。
*/
import { useMemo, useState } from 'react';

import BorderGlow from './BorderGlow/BorderGlow';
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
const MAX_VISIBLE_TREND_BARS = 15;
const CUSTOMER_FILTER_ALL = 'all';
const CUSTOMER_SORT_OPTIONS = [
  { value: 'usage-desc', label: '算力用量 / 全部' },
  { value: 'balance-desc', label: '算力余额 / 全部' },
  { value: 'reply-desc', label: '平均回复率 / 全部' },
];
const CUSTOMER_PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_CUSTOMER_PAGE_SIZE = 20;

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

function buildCustomerFilterOptions(rows, field) {
  const values = [...new Set(rows.map((row) => row[field]).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), 'zh-CN'));
  return [
    { value: CUSTOMER_FILTER_ALL, label: '全部' },
    ...values.map((value) => ({ value, label: value })),
  ];
}

function filterCustomerRows(rows, { versionFilter, salesFilter }) {
  return rows.filter((row) => {
    const matchesVersion = versionFilter === CUSTOMER_FILTER_ALL || row.accountType === versionFilter;
    const matchesSales = salesFilter === CUSTOMER_FILTER_ALL || row.salesOwner === salesFilter;
    return matchesVersion && matchesSales;
  });
}

function sortCustomerRows(rows, sortKey = 'usage-desc') {
  const normalizedSortKey = CUSTOMER_SORT_OPTIONS.some((option) => option.value === sortKey)
    ? sortKey
    : 'usage-desc';
  if (normalizedSortKey === 'balance-desc') {
    return [...rows].sort((a, b) => b.balance - a.balance);
  }
  if (normalizedSortKey === 'reply-desc') {
    return [...rows].sort((a, b) => b.averageReplyRate - a.averageReplyRate);
  }
  return [...rows].sort((a, b) => b.usage - a.usage);
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

function tooltipRow({ color, label, value }) {
  return `<div style="display:flex;align-items:center;gap:8px;line-height:1.7;min-width:190px">
    <span style="width:8px;height:8px;border-radius:2px;background:${color};box-shadow:0 0 10px ${color}66"></span>
    <span style="color:rgba(239,251,255,.68);font-size:12px">${label}</span>
    <strong style="color:#fff;margin-left:auto;font-size:14px;font-variant-numeric:tabular-nums">${value}</strong>
  </div>`;
}

function buildTrendPoints(trend) {
  return trend.map((point) => {
    const usage = point.usage;
    const target = point.target ?? Math.max(usage + 36, usage + (point.addOn ?? 0) + 34);

    return {
      label: point.day,
      range: point.range ?? point.day,
      usage,
      target,
      completion: target ? +((usage / target) * 100).toFixed(1) : 0,
    };
  });
}

function buildTrendOption({ trend, tokens }) {
  const buckets = buildTrendPoints(trend);
  const days = buckets.map((point) => point.label);
  const usage = buckets.map((point) => point.usage);
  const target = buckets.map((point) => point.target);
  const completion = buckets.map((point) => point.completion);
  const showSlider = days.length > MAX_VISIBLE_TREND_BARS;
  const sliderEndValue = Math.min(MAX_VISIBLE_TREND_BARS - 1, days.length - 1);
  const sliderWindowSpan = sliderEndValue;
  const txt = tokens.chartText;
  const faint = tokens.chartMuted;
  const line = tokens.chartGrid;
  const usageColor = tokens.chartBar;
  const targetColor = tokens.chartBarFaint;
  const completionColor = '#dfff00';

  return {
    backgroundColor: 'transparent',
    textStyle: { color: faint, fontFamily: 'inherit' },
    legend: {
      top: 0,
      left: 'center',
      selectedMode: false,
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 18,
      textStyle: { color: faint, fontSize: 13 },
      data: ['算力用量', '目标用量', '完成率%'],
    },
    grid: { top: 42, left: 10, right: 12, bottom: showSlider ? 44 : 8, containLabel: true },
    dataZoom: showSlider ? [
      {
        type: 'inside',
        xAxisIndex: 0,
        startValue: 0,
        endValue: sliderEndValue,
        minValueSpan: sliderWindowSpan,
        maxValueSpan: sliderWindowSpan,
        zoomLock: true,
        realtime: true,
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 18,
        bottom: 8,
        startValue: 0,
        endValue: sliderEndValue,
        minValueSpan: sliderWindowSpan,
        maxValueSpan: sliderWindowSpan,
        zoomLock: true,
        realtime: true,
        borderColor: 'rgba(255,255,255,.12)',
        backgroundColor: 'rgba(255,255,255,.04)',
        fillerColor: 'rgba(223,255,0,.16)',
        handleStyle: { color: 'rgba(239,251,255,.68)', borderColor: 'rgba(255,255,255,.34)' },
        dataBackground: {
          lineStyle: { color: 'rgba(255,255,255,.16)' },
          areaStyle: { color: 'rgba(255,255,255,.04)' },
        },
        selectedDataBackground: {
          lineStyle: { color: 'rgba(223,255,0,.46)' },
          areaStyle: { color: 'rgba(223,255,0,.08)' },
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

function buildPieOption({ data, tokens, unitLabel }) {
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
          alignTo: 'labelLine',
          edgeDistance: 12,
          distanceToLabelLine: 0,
          bleedMargin: 12,
          minMargin: 12,
          color: tokens.chartText,
          fontSize: 12,
          lineHeight: 15,
          formatter: (params) => `{name|${formatPieLabelName(params.name)}} {value|${params.percent}%}`,
          rich: {
            name: { color: tokens.chartText, fontSize: 12, fontWeight: 700, lineHeight: 15 },
            value: { color: tokens.chartMuted, fontSize: 11, fontWeight: 650, lineHeight: 15 },
          },
        },
        labelLine: {
          show: true,
          length: 18,
          length2: 18,
          lineStyle: { color: tokens.chartAxis, width: 1, opacity: .72 },
        },
        labelLayout: (params) => ({
          align: params.labelRect.x < params.rect.x ? 'right' : 'left',
          moveOverlap: 'shiftY',
        }),
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
              label: { edgeDistance: 6, distanceToLabelLine: 0, fontSize: 10 },
              labelLine: { length: 12, length2: 12 },
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
      <BorderGlow
        className={`cpu-kpi-glow cpu-kpi-glow--${tone} sweep-active${active ? ' cpu-kpi-glow--match' : ''}`}
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="var(--ai-card-bg)"
        borderRadius={16}
        glowRadius={34}
        glowIntensity={2.2}
        coneSpread={25}
        colors={['#c084fc', '#f472b6', '#38bdf8']}
        fillOpacity={0.42}
      >
        <article className={`cpu-kpi cpu-kpi--${tone}${active ? ' cpu-kpi--match' : ''}`}>
          <span className="cpu-kpi__label">{label}</span>
          <strong className="cpu-kpi__value">{value}</strong>
          <span className="cpu-kpi__sub">{sub}</span>
          <span className="cpu-kpi__meta">{meta}</span>
        </article>
      </BorderGlow>
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

export default function ComputeUsagePage({ searchTerm = '', dim = 'month', dateRange = [] }) {
  const tokens = useThemeTokens();
  const [customerSort, setCustomerSort] = useState('usage-desc');
  const [customerVersionFilter, setCustomerVersionFilter] = useState(CUSTOMER_FILTER_ALL);
  const [customerSalesFilter, setCustomerSalesFilter] = useState(CUSTOMER_FILTER_ALL);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(DEFAULT_CUSTOMER_PAGE_SIZE);
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
  const versionPieOption = useMemo(
    () => buildPieOption({ data: versions, tokens, unitLabel: '消耗权重' }),
    [versions, tokens]
  );
  const distributionPieOption = useMemo(
    () => buildPieOption({ data: distribution, tokens, unitLabel: '客户占比权重' }),
    [distribution, tokens]
  );
  const customerRows = useMemo(
    () => buildCustomerTableRows(customers, overview.totalCustomers),
    [customers, overview.totalCustomers]
  );
  const customerVersionOptions = useMemo(
    () => buildCustomerFilterOptions(customerRows, 'accountType'),
    [customerRows]
  );
  const customerSalesOptions = useMemo(
    () => buildCustomerFilterOptions(customerRows, 'salesOwner'),
    [customerRows]
  );
  const filteredCustomers = useMemo(
    () => filterCustomerRows(customerRows, {
      versionFilter: customerVersionFilter,
      salesFilter: customerSalesFilter,
    }),
    [customerRows, customerVersionFilter, customerSalesFilter]
  );
  const sortedCustomers = useMemo(
    () => sortCustomerRows(filteredCustomers, customerSort),
    [filteredCustomers, customerSort]
  );
  const customerTotal = sortedCustomers.length;
  const selectedSortLabel = CUSTOMER_SORT_OPTIONS.find((option) => option.value === customerSort)?.label
    ?? CUSTOMER_SORT_OPTIONS[0].label;
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

  function updateCustomerSort(nextSort) {
    setCustomerSort(nextSort);
    resetCustomerPage();
  }

  function updateCustomerVersionFilter(nextVersion) {
    setCustomerVersionFilter(nextVersion);
    resetCustomerPage();
  }

  function updateCustomerSalesFilter(nextSales) {
    setCustomerSalesFilter(nextSales);
    resetCustomerPage();
  }

  function updateCustomerPage(nextPage) {
    setCustomerPage(clampCustomerPage(nextPage, customerPageCount));
    setCustomerJumpPage('');
  }

  function updateCustomerPageSize(nextSize) {
    setCustomerPageSize(nextSize);
    setCustomerPage(1);
    setCustomerJumpPage('');
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
          sub="基础消耗 + 高峰增量 · 同步观察总容量"
          active={matchesTerm(SEARCH_KEYWORDS.trend, searchTerm)}
        >
          <div className="cpu-trend-chart">
            <EChart option={trendOption} style={{ height: '100%' }} />
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
          <div className="cpu-customer-filters" aria-label="客户明细筛选">
            <label className="cpu-select-field">
              <span className="cpu-control-label">排序:</span>
              <span className="cpu-select-shell">
                <select
                  className="cpu-select-control"
                  value={customerSort}
                  onChange={(event) => updateCustomerSort(event.target.value)}
                >
                  {CUSTOMER_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </span>
            </label>
            <label className="cpu-select-field">
              <span className="cpu-control-label">使用版本:</span>
              <span className="cpu-select-shell">
                <select
                  className="cpu-select-control"
                  value={customerVersionFilter}
                  onChange={(event) => updateCustomerVersionFilter(event.target.value)}
                >
                  {customerVersionOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </span>
            </label>
            <label className="cpu-select-field">
              <span className="cpu-select-shell">
                <select
                  className="cpu-select-control"
                  aria-label="销售负责人"
                  value={customerSalesFilter}
                  onChange={(event) => updateCustomerSalesFilter(event.target.value)}
                >
                  <option value={CUSTOMER_FILTER_ALL}>销售负责人</option>
                  {customerSalesOptions
                    .filter((option) => option.value !== CUSTOMER_FILTER_ALL)
                    .map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
              </span>
            </label>
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
                <th>账号类型</th>
                <th>销售负责人</th>
                <th>客成负责人</th>
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
          <div className="cpu-page-size" aria-label={`${customerPageSize} 条/页`}>
            {CUSTOMER_PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                className={`cpu-page-size__button${size === customerPageSize ? ' cpu-page-size__button--active' : ''}`}
                onClick={() => updateCustomerPageSize(size)}
              >
                {size} 条/页
              </button>
            ))}
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
