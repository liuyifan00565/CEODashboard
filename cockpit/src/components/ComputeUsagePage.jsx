/*
 更新时间: 2026-07-01 15:51:08 CST
 更新内容: 压缩饼图右侧说明列并右移图心，长区间标签改用短名展示以避免左侧截断。
*/
import { useMemo } from 'react';

import EChart from './EChart';
import {
  getComputeCustomerRows,
  getComputeOverview,
  getComputeResourceHealth,
  getComputeUsageDistribution,
  getComputeUsageTrend,
  getComputeVersionConsumption,
} from '../data/mock';
import { useThemeTokens } from '../lib/theme';
import './ComputeUsagePage.css';

const SEARCH_KEYWORDS = {
  overview: ['算力', '总容量', '新增', '消耗', '客户', '回复率', '余额'],
  trend: ['趋势', '近7日', '近30日', '近半年', '自动回复', '商品同步', '容量'],
  version: ['版本', '试用版', '企业版', '旗舰版', '卓越版', '创世版', '启航版'],
  distribution: ['分布', '用量', '客户占比', '高消耗', '零用量'],
  health: ['资源', '利用率', '异常', '自动回复', '商品同步', '会眼智宝', '视频识别', '拦截', '对话测试'],
  customer: ['客户', '排行', '手机号', '负责人', '平均回复率'],
};

const PERIOD_LABELS = {
  '7d': '近7日',
  '30d': '近30日',
  'half-year': '近半年',
};

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

function buildTrendOption({ trend, tokens, period }) {
  const buckets = buildTrendPoints(trend);
  const days = buckets.map((point) => point.label);
  const usage = buckets.map((point) => point.usage);
  const target = buckets.map((point) => point.target);
  const completion = buckets.map((point) => point.completion);
  const canSlide = period === '30d' && days.length > 10;
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
    grid: { top: 42, left: 10, right: 12, bottom: canSlide ? 44 : 8, containLabel: true },
    dataZoom: canSlide ? [
      {
        type: 'inside',
        xAxisIndex: 0,
        startValue: 0,
        endValue: Math.min(9, days.length - 1),
        zoomLock: true,
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        height: 18,
        bottom: 8,
        startValue: 0,
        endValue: Math.min(9, days.length - 1),
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
          grid: { top: 48, left: 4, right: 4, bottom: canSlide ? 38 : 4, containLabel: true },
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
        radius: ['36%', '58%'],
        center: ['56%', '52%'],
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
          edgeDistance: 18,
          distanceToLabelLine: 8,
          bleedMargin: 12,
          minMargin: 12,
          width: 152,
          overflow: 'truncate',
          ellipsis: '…',
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
          length: 16,
          length2: 14,
          lineStyle: { color: tokens.chartAxis, width: 1, opacity: .72 },
        },
        labelLayout: {
          moveOverlap: 'shiftY',
        },
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
              radius: ['36%', '58%'],
              center: ['54%', '48%'],
              label: { width: 112, edgeDistance: 6, distanceToLabelLine: 6, fontSize: 10 },
              labelLine: { length: 10, length2: 8 },
            },
          ],
        },
      },
    ],
  };
}

function KpiCard({ label, value, sub, meta, tone, active }) {
  return (
    <article className={`cpu-kpi cpu-kpi--${tone}${active ? ' cpu-kpi--match' : ''}`} data-anim>
      <span className="cpu-kpi__label">{label}</span>
      <strong className="cpu-kpi__value">{value}</strong>
      <span className="cpu-kpi__sub">{sub}</span>
      <span className="cpu-kpi__meta">{meta}</span>
    </article>
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

function PieSummary({ data }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className="cpu-pie-summary" aria-label="图例说明">
      {data.map((item) => (
        <span className="cpu-pie-chip" key={item.name}>
          <i style={{ background: item.color }} />
          <b>{item.name}</b>
          <em>{item.value}</em>
          <small>{formatPct(total ? (Number(item.value) / total) * 100 : 0)}</small>
        </span>
      ))}
    </div>
  );
}

export default function ComputeUsagePage({ searchTerm = '', period = '30d' }) {
  const tokens = useThemeTokens();
  const periodLabel = PERIOD_LABELS[period] ?? PERIOD_LABELS['30d'];
  const overview = getComputeOverview();
  const trend = getComputeUsageTrend(period);
  const versions = getComputeVersionConsumption();
  const distribution = getComputeUsageDistribution();
  const customers = getComputeCustomerRows();
  const resourceHealth = getComputeResourceHealth();
  const latestTrend = trend.at(-1);
  const highUsageBucket = distribution.find((item) => item.name === '算力用量>10000');
  const zeroUsageBucket = distribution.find((item) => item.name === '算力用量=0');

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

  const trendOption = useMemo(() => buildTrendOption({ trend, tokens, period }), [trend, tokens, period]);
  const versionPieOption = useMemo(
    () => buildPieOption({ data: versions, tokens, unitLabel: '消耗权重' }),
    [versions, tokens]
  );
  const distributionPieOption = useMemo(
    () => buildPieOption({ data: distribution, tokens, unitLabel: '客户占比权重' }),
    [distribution, tokens]
  );

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
          className="cpu-panel--health"
          title="资源利用率"
          sub={`高消耗客户权重 ${highUsageBucket?.value ?? 0} · 零用量权重 ${zeroUsageBucket?.value ?? 0}`}
          active={matchesTerm(SEARCH_KEYWORDS.health, searchTerm)}
        >
          <div className="cpu-health-list">
            {resourceHealth.filter((item) => item.usage > 0).map((item) => (
              <div
                className={`cpu-health-row cpu-health-row--${item.tone}`}
                key={item.key}
                style={{ '--cpu-resource-color': item.color }}
              >
                <div className="cpu-health-row__top">
                  <strong>{item.name}</strong>
                  <span>{item.trend}</span>
                </div>
                <div className="cpu-health-row__bar">
                  <i style={{ width: `${item.usage}%`, '--cpu-resource-color': item.color }} />
                </div>
                <div className="cpu-health-row__foot">
                  <span>{formatPct(item.usage)}</span>
                  <em>{item.state}</em>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          className="cpu-panel--pie cpu-panel--version-pie"
          title="各版本算力消耗"
          sub="圆角环图 · 外拉标签"
          active={matchesTerm(SEARCH_KEYWORDS.version, searchTerm)}
        >
          <div className="cpu-pie-wrap">
            <EChart option={versionPieOption} style={{ height: '100%' }} />
          </div>
          <PieSummary data={[...versions].sort((a, b) => b.value - a.value)} />
        </Panel>

        <Panel
          className="cpu-panel--pie cpu-panel--usage-pie"
          title="算力用量分布"
          sub="客户用量区间 · 中心不堆数据"
          active={matchesTerm(SEARCH_KEYWORDS.distribution, searchTerm)}
        >
          <div className="cpu-pie-wrap">
            <EChart option={distributionPieOption} style={{ height: '100%' }} />
          </div>
          <PieSummary data={distribution} />
        </Panel>
      </div>

      <Panel
        className="cpu-panel--customers"
        title="客户算力明细排行"
        sub={`${formatInt(overview.totalCustomers)} 条客户记录 · 按算力用量降序`}
        active={matchesTerm(SEARCH_KEYWORDS.customer, searchTerm)}
      >
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
              {customers.map((customer) => (
                <tr key={`${customer.phone}-${customer.owner}`}>
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
      </Panel>
    </div>
  );
}
