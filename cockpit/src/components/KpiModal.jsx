/* 更新时间: 2026-07-14 13:18:00 CST  更新内容: 自营收入下钻表展示 Excel 全字段，并区分销售业绩、退款与净回款。 */
/* 更新时间: 2026-07-13 16:48:56 CST  更新内容: 总投入构成文案改为运营成本 / 人力成本。 */
/* 更新时间: 2026-07-08 18:22:00 CST  更新内容: 总投入费比二级弹窗改为投入趋势与环比，补齐当前筛选、主结论和全渠道广告/人力构成口径。 */
/* 更新时间: 2026-07-06 10:48:16 CST  更新内容: KPI 二级弹窗柱形高亮改为银紫玫瑰，未选中柱回退为低透明银紫。 */
/* 更新时间: 2026-07-06 10:00:00 CST  更新内容: KPI 二级弹窗升级为高级果味玻璃明细页母版，补充副标题、主指标、图表 tooltip 和摘要条。 */
/* 更新时间: 2026-07-05 19:10:30 CST  更新内容: KPI 二级弹窗按本月/年度入口默认切换维度，并将回款弹窗标题改为月度/年度明细。 */
/* 更新时间: 2026-07-02 16:52:00 CST  更新内容: KPI 二级弹窗关闭按钮改用统一 AppIcon 线性图标。 */
import { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import gsap from 'gsap';
import AppIcon from './AppIcon';
import MultiSegmented from './MultiSegmented';
import Segmented from './Segmented';
import { KPI, META, getKpiSeries, getRenewalModalData, getRevenueOrderRows, VERSIONS } from '../data/mock';
import { deltaColor, fmtDelta, progressGradient } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './KpiModal.css';

const SALES_FILTER_OPTS = [
  { value: 'online', label: '线上' },
  { value: 'south', label: '华南线下' },
  { value: 'east', label: '华东线下' },
  { value: 'agent', label: '代理' },
];
const DIM_OPTS = [
  { value: 'year', label: '年' },
  { value: 'month', label: '月' },
  { value: 'day', label: '日' },
];
const COST_DIM_OPTS = [
  { value: 'month', label: '月' },
];
const MOM_LABEL = { year: '年度环比', month: '月度环比', day: '日度环比' };
const DIM_COPY = { year: '年度', month: '月度', day: '日度' };

function versionOptions() {
  return [
    { value: 'all', label: '全部版本' },
    ...VERSIONS.map((version) => ({ value: version.key, label: version.name })),
  ];
}

function metricNoun(card, isRenewal = false) {
  if (isRenewal) return '续费率';
  if (card.metric === 'recovered') return '回款金额';
  if (card.metric === 'cost') return '投入金额';
  if (card.metric === 'todayOpenings' || card.metric === 'monthOpenings') return '开户数量';
  return card.title ?? '指标';
}

function isCostCard(card) {
  return card.metric === 'cost';
}

function modalSubtitle(card, dim, isRenewal) {
  if (isCostCard(card)) return '按月度成本表查看当前筛选投入、环比和全渠道构成';
  return `按${DIM_COPY[dim] ?? '月度'}维度查看${metricNoun(card, isRenewal)}变化趋势`;
}

function metricLabel(card, dim, isRenewal) {
  if (isRenewal) return `${DIM_COPY[dim] ?? '当前'}续费率`;
  if (card.metric === 'recovered') return `${DIM_COPY[dim] ?? '当前'}回款金额`;
  if (card.metric === 'cost') return '当前筛选投入';
  if (card.metric === 'todayOpenings' || card.metric === 'monthOpenings') {
    return dim === 'day' ? '当日开户数' : dim === 'year' ? '当年开户总数' : '当月开户总数';
  }
  return card.title ?? '当前指标';
}

function initialSalesKeys(channelKey) {
  return channelKey && channelKey !== 'all'
    ? [channelKey]
    : SALES_FILTER_OPTS.map((opt) => opt.value);
}

function salesSelectionLabel(salesKeys) {
  const labels = SALES_FILTER_OPTS
    .filter((option) => salesKeys.includes(option.value))
    .map((option) => option.label);
  return labels.length === SALES_FILTER_OPTS.length ? '全渠道' : labels.join(' + ');
}

function selectedPeriodLabel(label, dim) {
  const year = String(META.monthLabel || '2026年').match(/^\d{4}/)?.[0] ?? '2026';
  if (dim === 'year') return label;
  if (dim === 'day') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return label;
    return /^\d{2}-\d{2}$/.test(label) ? `${year}-${label}` : label;
  }
  const month = String(label || '').match(/^(\d+)月$/)?.[1];
  return month ? `${year}年${Number(month)}月` : label;
}

function scopeText({ salesKeys, dim, selectedLabel, extra = [] }) {
  return [
    salesSelectionLabel(salesKeys),
    ...extra,
    DIM_COPY[dim] ?? '月度',
    selectedPeriodLabel(selectedLabel, dim),
  ].filter(Boolean).join(' · ');
}

function formatMetricNumber(value, unit, decimals = 0) {
  const number = Number(value) || 0;
  if (unit === '%') return number.toFixed(decimals ?? 1);
  return Number.isInteger(number)
    ? number.toLocaleString('zh-CN')
    : number.toLocaleString('zh-CN', { maximumFractionDigits: 1 });
}

function formatMetricWithUnit(value, unit, decimals = 0) {
  return `${formatMetricNumber(value, unit, decimals)} ${unit}`;
}

function compactText(value, fallback = '-') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function formatWanCell(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function trendDescription(series, selIndex, sel, cardUnit) {
  const prevPoint = series[selIndex - 1];
  const prevLabel = prevPoint?.label ?? '上期';
  const previous = Number(sel.prev ?? prevPoint?.value ?? 0) || 0;
  const change = Number(sel.value ?? 0) - previous;
  const direction = change >= 0 ? '增加' : '减少';
  return `较 ${prevLabel} ${direction} ${formatMetricWithUnit(Math.abs(change), cardUnit, cardUnit === '%' ? 1 : 0)}`;
}

function trendInsight(trendText, mom, isRenewal = false) {
  const direction = mom >= 0 ? '环比上涨' : '环比下降';
  const suffix = isRenewal ? '个百分点' : '%';
  return `${trendText}，${direction} ${Math.abs(Number(mom) || 0).toFixed(1)}${suffix}`;
}

function modalDeltaColor(value) {
  return value >= 0 ? deltaColor(value) : '#D86C87';
}

function signedMetricWithUnit(value, unit, decimals = 0) {
  const number = Number(value) || 0;
  const prefix = number > 0 ? '+' : number < 0 ? '-' : '';
  return `${prefix}${formatMetricWithUnit(Math.abs(number), unit, decimals)}`;
}

function targetLabelForCard(card) {
  if (card.key === 'year') return '年度目标';
  if (card.metric === 'todayOpenings' || card.metric === 'monthOpenings') return '月度目标';
  return '月度目标';
}

function buildGoalSummary(card, sel, cardUnit) {
  if (card.progress != null && card.gap != null) {
    const completed = Number(card.value ?? sel.value ?? 0) || 0;
    const gap = Math.max(Number(card.gap) || 0, 0);
    const target = completed + gap;
    const rate = Number(card.progress) || 0;
    return {
      targetLabel: targetLabelForCard(card),
      targetValue: formatMetricWithUnit(target, cardUnit),
      completedLabel: '已完成',
      completedValue: formatMetricWithUnit(completed, cardUnit, card.decimals ?? 0),
      rateLabel: card.progressLabel ?? '完成率',
      rate,
      rateValue: `${rate.toFixed(1)}%`,
      gapLabel: '目标差距',
      gapValue: formatMetricWithUnit(gap, cardUnit),
      gapTone: gap > 0 ? 'risk' : 'good',
    };
  }

  const current = Number(sel.value ?? 0) || 0;
  const previous = Number(sel.prev ?? 0) || 0;
  const changePct = previous ? +(((current - previous) / previous) * 100).toFixed(1) : 0;
  return {
    targetLabel: '当前口径',
    targetValue: formatMetricWithUnit(current, cardUnit, card.decimals ?? 0),
    completedLabel: '上期',
    completedValue: formatMetricWithUnit(previous, cardUnit, card.decimals ?? 0),
    rateLabel: '变化幅度',
    rate: Math.min(Math.abs(changePct), 100),
    rateValue: fmtDelta(changePct),
    gapLabel: '数据说明',
    gapValue: card.sub ?? '已按筛选更新',
    gapTone: 'neutral',
  };
}

function buildCostSummary(sel, cardUnit) {
  const current = Number(sel.value ?? 0) || 0;
  const previous = Number(sel.prev ?? 0) || 0;
  const diff = current - previous;
  return [
    { label: '当前口径', value: formatMetricWithUnit(current, cardUnit) },
    { label: '上期', value: formatMetricWithUnit(previous, cardUnit) },
    {
      label: '差额',
      value: signedMetricWithUnit(diff, cardUnit),
      tone: diff < 0 ? 'risk' : 'positive',
    },
    {
      label: '全渠道构成',
      value: `全渠道总投入 ${KPI.totalCost} 万 · 运营 ${KPI.operationsCost ?? KPI.adCost} 万 / 人力 ${KPI.laborCost} 万`,
      tone: 'neutral',
    },
  ];
}

function modalBarColor(active) {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, active
    ? [
        { offset: 0, color: '#B89CFF' },
        { offset: 1, color: '#8E86FF' },
      ]
    : [
        { offset: 0, color: 'rgba(184,156,255,0.22)' },
        { offset: 1, color: 'rgba(142,134,255,0.12)' },
      ]);
}

export default function KpiModal({ card, onClose }) {
  const tokens = useThemeTokens();
  const isCost = isCostCard(card);
  const [salesKeys, setSalesKeys] = useState(() => initialSalesKeys(card.channelKey));
  const [version, setVersion] = useState('all');
  const initialDim = isCost ? 'month' : card.key === 'year' ? 'year' : 'month';
  const [dim, setDim] = useState(initialDim);
  const isRenewal = card.metric === 'renewalRate';
  const dimForSeries = isCost ? 'month' : dim;
  const modalTitle = isCost ? '投入趋势与环比' : card.key === 'year' ? '年度回款明细' : card.key === 'month' ? '月度回款明细' : card.title;
  const renewalData = useMemo(
    () => (isRenewal ? getRenewalModalData(version, dimForSeries, salesKeys) : null),
    [isRenewal, version, dimForSeries, salesKeys]
  );
  const currentVersionOptions = versionOptions();
  const series = useMemo(() => {
    if (isRenewal) {
      return (renewalData?.breakdown ?? []).map((item) => ({
        label: item.name,
        value: item.rate,
        prev: item.prevRate,
        due: item.due,
        renewed: item.renewed,
        revenue: item.revenue,
        delta: item.delta,
      }));
    }
    return getKpiSeries(card.metric, { salesKeys, dim: dimForSeries });
  }, [card.metric, dimForSeries, isRenewal, renewalData, salesKeys]);
  const [selIndex, setSelIndex] = useState(series.length - 1);

  const cardRef = useRef(null);
  const maskRef = useRef(null);
  const chartElRef = useRef(null);
  const chartRef = useRef(null);
  const closingRef = useRef(false);

  // 筛选变化时默认选中最后一根；续费率柱状图为销售维度对比，普通 KPI 为时间序列。
  useEffect(() => { setSelIndex(Math.max(series.length - 1, 0)); }, [series.length]);

  // GSAP 开场动画
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(maskRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: 'power3.out' });
    tl.fromTo(
      cardRef.current,
      { autoAlpha: 0, scale: 0.975, y: 10 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.22, ease: 'power3.out' },
      '-=0.12'
    );
    return () => tl.kill();
  }, []);

  // 关闭：先反向动画，再调 onClose
  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(cardRef.current, { autoAlpha: 0, scale: 0.975, y: 8, duration: 0.18, ease: 'power2.in' });
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.18, ease: 'power2.in' }, '-=0.1');
  };

  // ECharts 初始化
  useEffect(() => {
    if (!chartElRef.current) return;
    chartRef.current = echarts.init(chartElRef.current, null, { renderer: 'canvas' });
    const onResize = () => chartRef.current?.resize();
    window.addEventListener('resize', onResize);
    const handler = (p) => setSelIndex(p.dataIndex);
    chartRef.current.on('click', handler);
    return () => {
      window.removeEventListener('resize', onResize);
      chartRef.current?.off('click', handler);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  // ECharts 渲染/更新
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const option = {
      grid: { left: 10, right: 12, top: 18, bottom: 6, containLabel: true },
      tooltip: {
        trigger: 'axis',
        confine: true,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        textStyle: { color: tokens.chartText, fontSize: 12, lineHeight: 16 },
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(169,155,255,0.05)' } },
        formatter: (params) => {
          const point = params[0] ?? {};
          const value = point.data?.value ?? point.value ?? 0;
          return `
            <div class="km-chart-tooltip" aria-label="${params[0]?.axisValue ?? ''}${formatMetricWithUnit(value, card.unit, card.decimals ?? 0)}">
              <div class="km-chart-tooltip__title">${params[0]?.axisValue ?? ''}</div>
              <div class="km-chart-tooltip__row"><span></span><strong>${formatMetricWithUnit(value, card.unit, card.decimals ?? 0)}</strong></div>
            </div>
          `;
        },
        extraCssText: 'padding:0;border:0;background:transparent;box-shadow:none;pointer-events:none;',
      },
      xAxis: {
        type: 'category',
        data: series.map((d) => d.label),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisTick: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.30)', fontSize: 11, margin: 10 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.30)', fontSize: 11, formatter: isRenewal ? '{value}%' : undefined },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.028)' } },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 38,
          data: series.map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: modalBarColor(i === selIndex),
              borderRadius: [8, 8, 3, 3],
              opacity: i === selIndex ? 1 : 0.48,
              shadowBlur: i === selIndex ? 16 : 0,
              shadowColor: i === selIndex ? 'rgba(184,156,255,0.22)' : 'transparent',
            },
          })),
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: modalBarColor(true),
              opacity: 1,
            },
          },
          animationDuration: 520,
          animationDelay: (index) => index * 24,
          animationEasing: 'cubicOut',
        },
      ],
    };
    chart.setOption(option, true);
  }, [series, selIndex, isRenewal, tokens, card.unit, card.decimals]);

  // headline 取数
  const sel = series[selIndex] ?? series[series.length - 1] ?? { label: '', value: 0, prev: 0 };
  const mom = isRenewal
    ? +(sel.value - (sel.prev ?? 0)).toFixed(1)
    : (sel.prev ? +(((sel.value - sel.prev) / sel.prev) * 100).toFixed(1) : 0);
  const headlineValue = card.unit === '%' ? Number(sel.value ?? 0).toFixed(card.decimals ?? 1) : sel.value;
  const renewalOverview = renewalData?.overview;
  const goalSummary = buildGoalSummary(card, sel, card.unit);
  const costSummary = isCost ? buildCostSummary(sel, card.unit) : [];
  const trendText = trendDescription(series, selIndex, sel, card.unit);
  const scope = scopeText({
    salesKeys,
    dim: dimForSeries,
    selectedLabel: sel.label,
    extra: isRenewal && version !== 'all'
      ? [currentVersionOptions.find((option) => option.value === version)?.label]
      : [],
  });
  const insight = trendInsight(trendText, mom, isRenewal);
  const orderRows = useMemo(() => (
    card.metric === 'recovered'
      ? getRevenueOrderRows({ salesKeys, dim: dimForSeries, selectedLabel: sel.label })
      : []
  ), [card.metric, dimForSeries, salesKeys, sel.label]);

  return (
    <div className="km-overlay" role="dialog" aria-modal="true">
      <div className="km-mask" ref={maskRef} onClick={handleClose} />
      <div className="km-card" ref={cardRef}>
        <div className="km-head">
          <div className="km-title-wrap">
            <h3 className="km-title">{modalTitle}</h3>
            <p className="km-subtitle">{modalSubtitle(card, dimForSeries, isRenewal)}</p>
          </div>
          <button type="button" className="km-close" aria-label="关闭" onClick={handleClose}>
            <AppIcon name="close" size={17} />
          </button>
        </div>

        <div className="km-controls">
          {isRenewal ? (
            <div className="km-filter-group">
              <span className="km-filter-label">版本</span>
              <Segmented options={currentVersionOptions} value={version} onChange={setVersion} />
            </div>
          ) : null}
          <div className="km-filter-group">
            <span className="km-filter-label">渠道</span>
            <MultiSegmented options={SALES_FILTER_OPTS} value={salesKeys} onChange={setSalesKeys} />
          </div>
          <div className="km-filter-group">
            <span className="km-filter-label">粒度</span>
            <Segmented options={isCost ? COST_DIM_OPTS : DIM_OPTS} value={dim} onChange={setDim} />
          </div>
        </div>

        <div className="km-metric-section">
          <div className="km-metric-main">
            <span className="km-time-tag">{sel.label}</span>
            <div className="km-metric-copy">
              <span className="km-hl-value">
                {formatMetricNumber(headlineValue, card.unit, card.decimals ?? 0)}
                <span className="km-hl-unit">{card.unit}</span>
              </span>
              <span className="km-hl-label">{metricLabel(card, dimForSeries, isRenewal)}</span>
              <span className="km-scope-line">当前筛选：{scope}</span>
              <span className="km-hl-insight">{insight}</span>
            </div>
          </div>
          <div className="km-trend-card">
            <span className="km-trend-label">{isRenewal ? '较上期' : MOM_LABEL[dimForSeries]}</span>
            <span className="km-trend-value" style={{ color: modalDeltaColor(mom) }}>{fmtDelta(mom)}</span>
            <span className="km-trend-desc">{trendText}</span>
          </div>
        </div>

        <div className={`km-chart${isRenewal ? ' km-chart--renewal' : ''}`} ref={chartElRef} />

        {isCost ? (
          <div className="km-summary km-summary--plain">
            {costSummary.map((item) => (
              <div className={`km-summary-cell${item.tone ? ` km-summary-cell--${item.tone}` : ''}`} key={item.label}>
                <span className="km-summary-label">{item.label}</span>
                <b className="km-summary-value">{item.value}</b>
              </div>
            ))}
          </div>
        ) : (
          <div className="km-summary">
            <div className="km-summary-cell">
              <span className="km-summary-label">{goalSummary.targetLabel}</span>
              <b className="km-summary-value">{goalSummary.targetValue}</b>
            </div>
            <div className="km-summary-cell km-summary-cell--progress">
              <span className="km-summary-label">{goalSummary.completedLabel}</span>
              <b className="km-summary-value">
                {goalSummary.completedValue}
                <em>{goalSummary.rateValue}</em>
              </b>
              <span className="km-summary-progress" aria-label={`${goalSummary.rateLabel} ${goalSummary.rateValue}`}>
                <span
                  className="km-summary-progress-fill"
                  style={{
                    width: `${Math.min(Number(goalSummary.rate) || 0, 100)}%`,
                    background: progressGradient(goalSummary.rate),
                  }}
                />
              </span>
            </div>
            <div className={`km-summary-cell km-summary-cell--${goalSummary.gapTone}`}>
              <span className="km-summary-label">{goalSummary.gapLabel}</span>
              <b className="km-summary-value">{goalSummary.gapValue}</b>
            </div>
          </div>
        )}

        {isRenewal && (
          <>
            <div className="km-renewal-list" aria-label="销售续费率明细">
              {series.map((item, index) => (
                <button
                  type="button"
                  className={`km-renewal-row${index === selIndex ? ' km-renewal-row--active' : ''}`}
                  onClick={() => setSelIndex(index)}
                  key={item.label}
                >
                  <span className="km-renewal-row-name">{item.label}</span>
                  <b>{Number(item.value ?? 0).toFixed(1)}%</b>
                  <span>到期 {item.due ?? 0} 单</span>
                  <span>已续 {item.renewed ?? 0} 单</span>
                  <span>续费 {item.revenue ?? 0} 万</span>
                </button>
              ))}
            </div>

            <div className="km-renewal">
              <div className="km-renewal-cell">
                <span>当前筛选总续费率</span>
                <b>{Number(renewalOverview?.rate ?? 0).toFixed(1)}%</b>
              </div>
              <div className="km-renewal-cell">
                <span>{sel.label}到期客户</span>
                <b>{sel.due ?? 0}<i>单</i></b>
              </div>
              <div className="km-renewal-cell">
                <span>{sel.label}已续客户</span>
                <b>{sel.renewed ?? 0}<i>单</i></b>
              </div>
              <div className="km-renewal-cell">
                <span>{sel.label}未续客户</span>
                <b>{Math.max((sel.due ?? 0) - (sel.renewed ?? 0), 0)}<i>单</i></b>
              </div>
              <div className="km-renewal-cell">
                <span>{sel.label}续费金额</span>
                <b>{sel.revenue ?? 0}<i>万</i></b>
              </div>
            </div>
          </>
        )}

        {card.metric === 'recovered' && orderRows.length > 0 && (
          <div className="km-order-detail" aria-label="自营收入订单明细">
            <div className="km-order-detail__head">
              <span>自营收入明细</span>
              <b>{orderRows.length} 条</b>
            </div>
            <div className="km-order-detail__scroll">
              <table className="km-order-detail__table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>销售</th>
                    <th>客户</th>
                    <th>企微群</th>
                    <th>福客负责人</th>
                    <th>版本</th>
                    <th>订单号</th>
                    <th>销售业绩(万)</th>
                    <th>价格(万)</th>
                    <th>退款(万)</th>
                    <th>净回款(万)</th>
                    <th>线索来源</th>
                    <th>其他说明</th>
                    <th>备注</th>
                    <th>来源行</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((row, index) => (
                    <tr key={`${row.orderNo || 'order'}-${row.date || row.yearMonth}-${index}`}>
                      <td>{compactText(row.date)}</td>
                      <td>{compactText(row.salesName)}</td>
                      <td title={compactText(row.customerName)}>{compactText(row.customerName)}</td>
                      <td title={compactText(row.groupName)}>{compactText(row.groupName)}</td>
                      <td title={compactText(row.systemOwnerName)}>{compactText(row.systemOwnerName)}</td>
                      <td>{compactText(row.versionName)}</td>
                      <td title={compactText(row.orderNo)}>{compactText(row.orderNo)}</td>
                      <td>{formatWanCell(row.salesAmount)}</td>
                      <td>{formatWanCell(row.price)}</td>
                      <td>{formatWanCell(row.refund)}</td>
                      <td>{formatWanCell(row.value)}</td>
                      <td>{compactText(row.channelName)}</td>
                      <td title={compactText(row.otherNote)}>{compactText(row.otherNote)}</td>
                      <td title={compactText(row.remark)}>{compactText(row.remark)}</td>
                      <td>{row.sourceSheet && row.sourceRowNo ? `${row.sourceSheet}!${row.sourceRowNo}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
