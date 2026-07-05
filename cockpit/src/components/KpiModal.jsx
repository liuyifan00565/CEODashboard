/* 更新时间: 2026-07-05 19:10:30 CST  更新内容: KPI 二级弹窗按本月/年度入口默认切换维度，并将回款弹窗标题改为月度/年度明细。 */
/* 更新时间: 2026-07-02 16:52:00 CST  更新内容: KPI 二级弹窗关闭按钮改用统一 AppIcon 线性图标。 */
import { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import gsap from 'gsap';
import AppIcon from './AppIcon';
import MultiSegmented from './MultiSegmented';
import Segmented from './Segmented';
import { getKpiSeries, getRenewalModalData, VERSIONS } from '../data/mock';
import { deltaColor, fmtDelta } from '../lib/format';
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
const VERSION_OPTS = [
  { value: 'all', label: '全部版本' },
  ...VERSIONS.map((version) => ({ value: version.key, label: version.name })),
];
const MOM_LABEL = { year: '年度环比', month: '月度环比', day: '日度环比' };

export default function KpiModal({ card, onClose }) {
  const tokens = useThemeTokens();
  const [salesKeys, setSalesKeys] = useState(() => SALES_FILTER_OPTS.map((opt) => opt.value));
  const [version, setVersion] = useState('all');
  const initialDim = card.key === 'year' ? 'year' : 'month';
  const [dim, setDim] = useState(initialDim);
  const isRenewal = card.metric === 'renewalRate';
  const modalTitle = card.key === 'year' ? '年度回款明细' : card.key === 'month' ? '月度回款明细' : card.title;
  const renewalData = useMemo(
    () => (isRenewal ? getRenewalModalData(version, dim, salesKeys) : null),
    [isRenewal, version, dim, salesKeys]
  );
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
    return getKpiSeries(card.metric, { salesKeys, dim });
  }, [card.metric, dim, isRenewal, renewalData, salesKeys]);
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
    tl.fromTo(maskRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.32, ease: 'power2.out' });
    tl.fromTo(
      cardRef.current,
      { autoAlpha: 0, scale: 0.82, rotateY: -28, transformPerspective: 1000 },
      { autoAlpha: 1, scale: 1, rotateY: 0, duration: 0.55, ease: 'back.out(1.4)' },
      '-=0.18'
    );
    return () => tl.kill();
  }, []);

  // 关闭：先反向动画，再调 onClose
  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(cardRef.current, { autoAlpha: 0, scale: 0.82, rotateY: 24, transformPerspective: 1000, duration: 0.36, ease: 'power2.in' });
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.26, ease: 'power2.in' }, '-=0.2');
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
      grid: { left: 8, right: 12, top: 18, bottom: 8, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: tokens.chartTooltipBg,
        borderColor: tokens.chartTooltipBorder,
        textStyle: { color: tokens.chartText, fontSize: 14 },
        axisPointer: { type: 'shadow', shadowStyle: { color: tokens.chartPointer } },
      },
      xAxis: {
        type: 'category',
        data: series.map((d) => d.label),
        axisLine: { lineStyle: { color: tokens.chartAxis } },
        axisTick: { show: false },
        axisLabel: { color: tokens.chartMuted, fontSize: 14 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: tokens.chartMuted, fontSize: 14, formatter: isRenewal ? '{value}%' : undefined },
        splitLine: { lineStyle: { color: tokens.chartGrid } },
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 38,
          data: series.map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: i === selIndex ? tokens.chartBar : tokens.chartBarMuted,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          emphasis: { itemStyle: { color: tokens.chartText } },
        },
      ],
    };
    chart.setOption(option, true);
  }, [series, selIndex, isRenewal, tokens]);

  // headline 取数
  const sel = series[selIndex] ?? series[series.length - 1] ?? { label: '', value: 0, prev: 0 };
  const mom = isRenewal
    ? +(sel.value - (sel.prev ?? 0)).toFixed(1)
    : (sel.prev ? +(((sel.value - sel.prev) / sel.prev) * 100).toFixed(1) : 0);
  const headlineValue = card.unit === '%' ? Number(sel.value ?? 0).toFixed(card.decimals ?? 1) : sel.value;
  const renewalOverview = renewalData?.overview;

  return (
    <div className="km-overlay" role="dialog" aria-modal="true">
      <div className="km-mask" ref={maskRef} onClick={handleClose} />
      <div className="km-card" ref={cardRef}>
        <div className="km-head">
          <h3 className="km-title">{modalTitle}</h3>
          <button type="button" className="km-close" aria-label="关闭" onClick={handleClose}>
            <AppIcon name="close" size={17} />
          </button>
        </div>

        <div className="km-controls">
          {isRenewal ? (
            <Segmented options={VERSION_OPTS} value={version} onChange={setVersion} />
          ) : null}
          <MultiSegmented options={SALES_FILTER_OPTS} value={salesKeys} onChange={setSalesKeys} />
          <Segmented options={DIM_OPTS} value={dim} onChange={setDim} />
        </div>

        <div className="km-headline">
          <span className="km-hl-label">{sel.label}</span>
          <span className="km-hl-value">
            {headlineValue}
            <span className="km-hl-unit">{card.unit}</span>
          </span>
          <span className="km-hl-mom">
            <span className="km-hl-mom-name">{isRenewal ? '较上期' : MOM_LABEL[dim]}</span>
            <span className="km-hl-mom-val" style={{ color: deltaColor(mom) }}>{fmtDelta(mom)}</span>
          </span>
        </div>

        <div className={`km-chart${isRenewal ? ' km-chart--renewal' : ''}`} ref={chartElRef} />

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

        {card.sub && <div className="km-sub">{card.sub}</div>}
      </div>
    </div>
  );
}
