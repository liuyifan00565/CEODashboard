/* 更新时间: 2026-07-06 00:00:13 CST  更新内容: 版本情况半环与色点中的金色改为高级哑金。 */
/* 更新时间: 2026-07-04 01:03:12 CST  更新内容: 版本情况补充经营洞察文案，并让环比列使用独立数字对齐内层。 */
/* 更新时间: 2026-07-04 00:21:24 CST  更新内容: 版本情况控制器移至右上，半环仅标前两项并降低光晕，表格增加版本色点。 */
/* 更新时间: 2026-07-03 23:48:36 CST  更新内容: 版本情况右侧由四张展示卡改为六列表格，并保留行点击打开版本二级弹窗。 */
/* 更新时间: 2026-07-03 18:19:59 CST  更新内容: 版本情况半环同步黑曜石月光紫色板，加入冷蓝、青玉、香槟层级。 */
/* 更新时间: 2026-07-03 15:39:00 CST  更新内容: 版本情况半环图表改为低饱和冷紫品牌渐变，去除旧青蓝/薄荷混色。 */
/* 更新时间: 2026-07-03 11:28:32 CST  更新内容: 精准调整版本情况半环图水平中心，使图形对称轴对齐数量/金额切换按钮。 */
/* 更新时间: 2026-07-03 11:17:34 CST  更新内容: 版本情况半环图右移，使图形对称轴靠近数量/金额切换按钮。 */
/* 更新时间: 2026-07-02 16:52:00 CST  更新内容: 版本二级弹窗关闭按钮改用统一 AppIcon 线性图标。 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as echarts from 'echarts';
import gsap from 'gsap';

import AppIcon from './AppIcon';
import EChart from './EChart';
import MultiSegmented from './MultiSegmented';
import Segmented from './Segmented';
import { getChannelRows, getVersionRows, MONTHLY_TREND } from '../data/mock';
import { fmtDelta, deltaColor, fmtMoney } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './KpiModal.css';
import './VersionFinancePanel.css';

const VERSION_DISPLAY_KEYS = ['qihang', 'zhuoyue', 'zhizun', 'custom'];
const VERSION_MODES = [
  { value: 'count', label: '数量', field: 'units', unit: '套' },
  { value: 'amount', label: '金额', field: 'recovered', unit: '万' },
];
const VERSION_DETAIL_MODES = [
  { value: 'amount', label: '金额', field: 'recovered', unit: '万' },
  { value: 'count', label: '套数', field: 'units', unit: '套' },
];
const VERSION_RING_COLORS = [
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#8B7CFF' }, { offset: 1, color: '#D8D4FF' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#74A7FF' }, { offset: 1, color: '#C8D9FF' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#6DD6D2' }, { offset: 1, color: '#BFEDEC' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#B7A06C' }, { offset: 1, color: '#D6C49A' }] },
];
const VERSION_DOT_COLORS = ['#8B7CFF', '#74A7FF', '#6DD6D2', '#B7A06C'];
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
const DIM_TITLE = { year: '年度', month: '本月', day: '本日' };
const DIM_FOOTER = {
  year: '2026-01-01 至 2026-06-30 年度累计',
  month: '2026-06-01 至 2026-06-30 月度',
  day: '2026-06-30 当日',
};
const DAY_WEIGHTS = [62, 70, 55, 81, 74, 90, 68, 77, 84, 96];

function getModeMeta(mode) {
  return VERSION_MODES.find((item) => item.value === mode) ?? VERSION_MODES[0];
}

function getDisplayVersions(versions) {
  const byKey = new Map(versions.map((version) => [version.key, version]));
  return VERSION_DISPLAY_KEYS.map((key) => byKey.get(key)).filter(Boolean);
}

function normalizeSalesKeys(salesKeys) {
  const validKeys = new Set(SALES_FILTER_OPTS.map((item) => item.value));
  const selected = Array.isArray(salesKeys) ? salesKeys.filter((key) => validKeys.has(key)) : [];
  return selected.length ? selected : SALES_FILTER_OPTS.map((item) => item.value);
}

function initialSalesKeys(channelKey) {
  return channelKey === 'all' ? SALES_FILTER_OPTS.map((item) => item.value) : [channelKey];
}

function aggregateVersionTotals(salesKeys, versionKey) {
  const safeKeys = normalizeSalesKeys(salesKeys);
  const rows = safeKeys.length === SALES_FILTER_OPTS.length
    ? getDisplayVersions(getVersionRows('all'))
    : safeKeys.flatMap((key) => getDisplayVersions(getVersionRows(key)));
  const scopedRows = versionKey ? rows.filter((version) => version.key === versionKey) : rows;

  return scopedRows.reduce(
    (acc, version) => ({
      units: acc.units + (Number(version.units) || 0),
      recovered: acc.recovered + (Number(version.recovered) || 0),
    }),
    { units: 0, recovered: 0 }
  );
}

function versionDetailModeMeta(mode) {
  return VERSION_DETAIL_MODES.find((item) => item.value === mode) ?? VERSION_DETAIL_MODES[0];
}

function withPreviousValues(points) {
  return points.map((point, index, list) => ({
    ...point,
    prev: index === 0 ? Math.max(1, Math.round(point.value * 0.9)) : list[index - 1].value,
  }));
}

function buildVersionDetailSeries({ salesKeys, mode, dim, versionKey }) {
  const modeMeta = versionDetailModeMeta(mode);
  const totals = aggregateVersionTotals(salesKeys, versionKey);
  const currentTotal = Number(totals[modeMeta.field]) || 0;

  if (dim === 'year') {
    return withPreviousValues(['2023', '2024', '2025', '2026'].map((label, index) => ({
      label,
      value: Math.max(1, Math.round(currentTotal * [3.6, 4.5, 5.35, 6.4][index])),
    })));
  }

  if (dim === 'day') {
    const weightTotal = DAY_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
    return withPreviousValues(DAY_WEIGHTS.map((weight, index) => ({
      label: `06-${String(index * 3 + 1).padStart(2, '0')}`,
      value: Math.max(1, Math.round(currentTotal * (weight / weightTotal))),
    })));
  }

  const latestRecovered = MONTHLY_TREND.at(-1)?.recovered || 1;
  return withPreviousValues(MONTHLY_TREND.map((month) => ({
    label: month.month,
    value: Math.max(1, Math.round(currentTotal * (month.recovered / latestRecovered))),
  })));
}

function formatModeValue(value, modeMeta) {
  const number = Number(value) || 0;
  return `${number.toLocaleString('zh-CN')}${modeMeta.unit}`;
}

function versionShare(version, totalUnits) {
  const units = Number(version.units) || 0;
  return totalUnits ? +(units / totalUnits * 100).toFixed(2) : 0;
}

function versionDotColor(index) {
  return VERSION_DOT_COLORS[index] ?? VERSION_DOT_COLORS[0];
}

function versionHalfRingOption(versions, mode, tokens) {
  const modeMeta = getModeMeta(mode);
  const total = versions.reduce((sum, version) => sum + (Number(version[modeMeta.field]) || 0), 0);

  return {
    color: VERSION_RING_COLORS,
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      textStyle: {
        color: tokens.chartText,
        fontSize: 12,
        lineHeight: 16,
      },
      formatter: (params) => {
        const value = Number(params.data?.rawValue ?? params.value) || 0;
        const percent = total ? +(value / total * 100).toFixed(1) : 0;

        return `
          <div class="vf-ring-tooltip" aria-label="${params.name}${modeMeta.label}${formatModeValue(value, modeMeta)}">
            <div class="vf-ring-tooltip__name">版本情况 · ${params.name}</div>
            <div class="vf-ring-tooltip__value">${modeMeta.label} <strong>${formatModeValue(value, modeMeta)}</strong></div>
            <div class="vf-ring-tooltip__meta">四个主版本占比 <strong>${percent}%</strong></div>
          </div>
        `;
      },
      extraCssText: 'padding:0;border:0;background:transparent;box-shadow:none;pointer-events:none;',
    },
    animationDuration: 900,
    animationEasing: 'cubicOut',
    series: [
      {
        type: 'pie',
        name: `版本${modeMeta.label}`,
        radius: ['45%', '76%'],
        center: ['49.5%', '68%'],
        startAngle: 180,
        endAngle: 360,
        minShowLabelAngle: 1,
        padAngle: 3,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(255, 255, 255, .11)',
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(167, 156, 255, .08)',
        },
        label: {
          show: false,
          position: 'outside',
          formatter: (params) => `{name|${params.name}}\n{percent|${params.percent}%}`,
          bleedMargin: 0,
          distanceToLabelLine: 0,
          color: tokens.chartText,
          rich: {
            name: {
              color: tokens.chartText,
              fontSize: 13,
              fontWeight: 850,
              lineHeight: 17,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.36)',
              textShadowBlur: 7,
            },
            percent: {
              color: tokens.chartText,
              fontSize: 12,
              fontWeight: 850,
              lineHeight: 15,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.38)',
              textShadowBlur: 7,
            },
          },
        },
        labelLine: {
          show: false,
          lineStyle: {
            color: tokens.chartText,
            opacity: 0.58,
            width: 1.5,
          },
          smooth: 0.18,
          length: 10,
          length2: 16,
        },
        data: versions.map((version, index) => {
          const value = Math.max(Number(version[modeMeta.field]) || 0, 0.01);
          const isMajorLabel = index < 2;
          return {
            value,
            rawValue: Number(version[modeMeta.field]) || 0,
            name: version.name,
            itemStyle: { color: VERSION_RING_COLORS[index] },
            label: {
              show: isMajorLabel,
            },
            labelLine: {
              show: isMajorLabel,
            },
          };
        }),
      },
    ],
  };
}

function VersionDetailModal({ channelKey, versionKey, onClose }) {
  const tokens = useThemeTokens();
  const [salesKeys, setSalesKeys] = useState(() => initialSalesKeys(channelKey));
  const [detailMode, setDetailMode] = useState('amount');
  const [dim, setDim] = useState('month');
  const versionName = getDisplayVersions(getVersionRows('all')).find((version) => version.key === versionKey)?.name ?? '版本';
  const series = useMemo(
    () => buildVersionDetailSeries({ salesKeys, mode: detailMode, dim, versionKey }),
    [detailMode, dim, salesKeys, versionKey]
  );
  const [selIndex, setSelIndex] = useState(Math.max(series.length - 1, 0));
  const cardRef = useRef(null);
  const maskRef = useRef(null);
  const chartElRef = useRef(null);
  const chartRef = useRef(null);
  const closingRef = useRef(false);
  const modeMeta = versionDetailModeMeta(detailMode);

  useEffect(() => {
    setSelIndex(Math.max(series.length - 1, 0));
  }, [series.length, detailMode, dim, salesKeys]);

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

  useEffect(() => {
    if (!chartElRef.current) return undefined;
    chartRef.current = echarts.init(chartElRef.current, null, { renderer: 'canvas' });
    const onResize = () => chartRef.current?.resize();
    const handler = (params) => setSelIndex(params.dataIndex);
    window.addEventListener('resize', onResize);
    chartRef.current.on('click', handler);
    return () => {
      window.removeEventListener('resize', onResize);
      chartRef.current?.off('click', handler);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setOption({
      grid: { left: 8, right: 12, top: 18, bottom: 8, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: tokens.chartTooltipBg,
        borderColor: tokens.chartTooltipBorder,
        textStyle: { color: tokens.chartText, fontSize: 14 },
        axisPointer: { type: 'shadow', shadowStyle: { color: tokens.chartPointer } },
        valueFormatter: (value) => `${value}${modeMeta.unit}`,
      },
      xAxis: {
        type: 'category',
        data: series.map((item) => item.label),
        axisLine: { lineStyle: { color: tokens.chartAxis } },
        axisTick: { show: false },
        axisLabel: { color: tokens.chartMuted, fontSize: 14 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: tokens.chartMuted, fontSize: 14 },
        splitLine: { lineStyle: { color: tokens.chartGrid } },
      },
      series: [
        {
          name: modeMeta.label,
          type: 'bar',
          barMaxWidth: 38,
          data: series.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: index === selIndex ? tokens.chartBar : tokens.chartBarMuted,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          emphasis: { itemStyle: { color: tokens.chartText } },
        },
      ],
    }, true);
  }, [modeMeta, selIndex, series, tokens]);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(cardRef.current, { autoAlpha: 0, scale: 0.82, rotateY: 24, transformPerspective: 1000, duration: 0.36, ease: 'power2.in' });
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.26, ease: 'power2.in' }, '-=0.2');
  };

  const selected = series[selIndex] ?? series.at(-1) ?? { label: '', value: 0, prev: 0 };
  const mom = selected.prev ? +(((selected.value - selected.prev) / selected.prev) * 100).toFixed(1) : 0;

  const modal = (
    <div className="km-overlay vf-detail-overlay" role="dialog" aria-modal="true">
      <div className="km-mask vf-detail-mask" ref={maskRef} onClick={handleClose} />
      <div className="km-card vf-detail-card" ref={cardRef}>
        <div className="km-head">
          <h3 className="km-title">{DIM_TITLE[dim]}{versionName}{modeMeta.label}</h3>
          <button type="button" className="km-close" aria-label="关闭" onClick={handleClose}>
            <AppIcon name="close" size={17} />
          </button>
        </div>

        <div className="km-controls">
          <MultiSegmented options={SALES_FILTER_OPTS} value={salesKeys} onChange={setSalesKeys} />
          <Segmented options={VERSION_DETAIL_MODES} value={detailMode} onChange={setDetailMode} />
          <Segmented options={DIM_OPTS} value={dim} onChange={setDim} />
        </div>

        <div className="km-headline">
          <span className="km-hl-label">{selected.label}</span>
          <span className="km-hl-value">
            {Number(selected.value || 0).toLocaleString('zh-CN')}
            <span className="km-hl-unit">{modeMeta.unit}</span>
          </span>
          <span className="km-hl-mom">
            <span className="km-hl-mom-name">{DIM_TITLE[dim]}环比</span>
            <span className="km-hl-mom-val" style={{ color: deltaColor(mom) }}>{fmtDelta(mom)}</span>
          </span>
        </div>

        <div className="km-chart" ref={chartElRef} />
        <div className="km-sub">{DIM_FOOTER[dim]} · {versionName}{modeMeta.label}合计</div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default function VersionFinancePanel({ channelKey = 'all' }) {
  const [mode, setMode] = useState('count');
  const [detailVersionKey, setDetailVersionKey] = useState(null);
  const tokens = useThemeTokens();
  const versions = getDisplayVersions(getVersionRows(channelKey));
  const countTotal = versions.reduce((sum, version) => sum + (Number(version.units) || 0), 0);
  const amountTotal = versions.reduce((sum, version) => sum + (Number(version.recovered) || 0), 0);
  const tableRows = versions.map((version, index) => ({
    ...version,
    share: versionShare(version, countTotal),
    dotColor: versionDotColor(index),
  }));
  const channelName = channelKey === 'all' ? '' : getChannelRows(channelKey)[0]?.name;

  return (
    <section className="vf-panel">
      <header className="vf-head">
        <div>
          <h3 className="vf-title">版本情况</h3>
          <div className="vf-total-stack" aria-label="版本情况合计">
            <span>
              <em>合计数量</em>
              <b>{countTotal.toLocaleString('zh-CN')}</b>
              <i>套</i>
            </span>
            <span>
              <em>合计金额</em>
              <b>{amountTotal.toLocaleString('zh-CN')}</b>
              <i>万</i>
            </span>
          </div>
          {channelName && <span className="vf-head-sub">{channelName} · 四个主版本</span>}
        </div>
        <div className="vf-metric-switch" role="tablist" aria-label="版本情况统计口径">
          <span
            className="vf-metric-switch__thumb"
            style={{ transform: `translateX(${mode === 'amount' ? '100%' : '0'})` }}
            aria-hidden="true"
          />
          {VERSION_MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={mode === item.value}
              className={`vf-metric-switch__btn${mode === item.value ? ' vf-metric-switch__btn--active' : ''}`}
              onClick={() => setMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="vf-overview">
        <div className="vf-ring-pane">
          <div className="vf-ring">
            <EChart option={versionHalfRingOption(versions, mode, tokens)} className="vf-ring-chart" style={{ height: 326 }} />
          </div>
        </div>

        <div className="vf-card-zone">
          <div className="vf-version-table-wrap">
            <table className="vf-version-table">
              <thead>
                <tr>
                  <th scope="col">版本</th>
                  <th scope="col">单价</th>
                  <th scope="col">套数</th>
                  <th scope="col">占比</th>
                  <th scope="col">回款</th>
                  <th scope="col">环比</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr
                    className="vf-version-table__row"
                    key={row.key}
                    role="button"
                    tabIndex={0}
                    aria-label={`查看${row.name}版本二级数据`}
                    onClick={() => setDetailVersionKey(row.key)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setDetailVersionKey(row.key);
                      }
                    }}
                  >
                    <th scope="row" className="vf-version-table__name">
                      <span className="vf-version-table__name-inner">
                        <span className="vf-version-table__dot" style={{ background: row.dotColor }} aria-hidden="true" />
                        <span>{row.name}</span>
                      </span>
                    </th>
                    <td className="vf-version-table__price">{fmtMoney(row.price)}</td>
                    <td className="vf-version-table__units">{row.units.toLocaleString('zh-CN')}</td>
                    <td className="vf-version-table__share">{row.share}%</td>
                    <td className="vf-version-table__recovered">{row.recovered}万</td>
                    <td>
                      <span className="vf-version-table__mom" style={{ color: deltaColor(row.mom) }}>{fmtDelta(row.mom)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="vf-insight">启航版贡献主要销量，卓越版贡献最高回款，定制版保持高客单补充。</p>

      {detailVersionKey && (
        <VersionDetailModal
          channelKey={channelKey}
          versionKey={detailVersionKey}
          onClose={() => setDetailVersionKey(null)}
        />
      )}
    </section>
  );
}
