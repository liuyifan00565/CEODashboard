/*
 更新时间: 2026-07-14 16:30:00 CST
 更新内容: 成交来源恢复订单级净回款口径，不再将公司月度渠道汇总展示为成交来源。
*/
/*
 更新时间: 2026-07-14 14:36:00 CST
 更新内容: 修正福客官网与客户推荐标签位置，移除点击提示并让整张来源卡点击打开明细。
*/
/*
 更新时间: 2026-07-14 14:24:55 CST
 更新内容: 来源环图同步版本半环与算力用量环图的渐变色、58/92% 环宽、圆角分段、间隙、阴影和玻璃 tooltip。
*/
/*
 更新时间: 2026-07-14 14:17:05 CST
 更新内容: 首页成交来源改为紧凑环形图；点击图表打开原排行明细弹窗，完整展示来源回款、成交、客户与占比。
*/
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CHANNEL_SOURCE_BREAKDOWN } from '../data/mock';
import { buildChannelSourceBreakdown, channelSourcePeriodLabel } from '../lib/channelSourceBreakdown';
import EChart from './EChart';
import './ChannelSourcePanel.css';

const SOURCE_RING_COLORS = [
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#8E86FF' }, { offset: 1, color: '#E4B8D7' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#B89CFF' }, { offset: 1, color: '#D9D1FF' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#9B6FAD' }, { offset: 1, color: '#E4B8D7' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#C9A96B' }, { offset: 1, color: '#E3D2A4' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#7EA7FF' }, { offset: 1, color: '#D9D1FF' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#62C3CD' }, { offset: 1, color: '#B9DDE1' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#A6C878' }, { offset: 1, color: '#D6DEB5' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#68748A' }, { offset: 1, color: '#AAB2C0' }] },
];

function formatWan(value) {
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function buildDonutRows(rows) {
  if (rows.length <= 7) return rows;
  const primary = rows.slice(0, 7);
  const other = rows.slice(7).reduce((acc, row) => ({
    ...acc,
    recovered: acc.recovered + row.recovered,
    dealCount: acc.dealCount + row.dealCount,
    customerCount: acc.customerCount + row.customerCount,
  }), { key: 'other', name: '其他来源', recovered: 0, dealCount: 0, customerCount: 0 });
  return [...primary, other];
}

function SourceRanking({ rows }) {
  return (
    <div className="channel-source-panel__list">
      {rows.map((row, index) => (
        <article className="channel-source-row" key={`${row.key}-${row.name}`}>
          <div className="channel-source-row__rank">{String(index + 1).padStart(2, '0')}</div>
          <div className="channel-source-row__body">
            <div className="channel-source-row__topline">
              <strong title={row.name}>{row.name}</strong>
              <span>{formatWan(row.recovered)} 万</span>
            </div>
            <div className="channel-source-row__track" aria-hidden="true">
              <span style={{ width: `${Math.max(2, row.share)}%` }} />
            </div>
            <div className="channel-source-row__meta">
              <span>{row.dealCount} 笔成交</span>
              <span>{row.customerCount} 个客户</span>
              <b>{row.share.toFixed(1)}%</b>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ChannelSourcePanel({ channelKey = 'all' }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const rows = buildChannelSourceBreakdown(CHANNEL_SOURCE_BREAKDOWN, channelKey);
  const periodLabel = channelSourcePeriodLabel(rows);
  const totalRecovered = rows.reduce((sum, row) => sum + row.recovered, 0);
  const donutRows = buildDonutRows(rows);

  useEffect(() => {
    if (!detailOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDetailOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailOpen]);

  const option = useMemo(() => ({
    animationDuration: 650,
    color: SOURCE_RING_COLORS,
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      formatter: ({ name, value, percent, data }) => `
        <div class="source-ring-tooltip">
          <div class="source-ring-tooltip__name">成交来源 · ${name}</div>
          <div class="source-ring-tooltip__value">净回款 <strong>${formatWan(value)} 万</strong></div>
          <div class="source-ring-tooltip__meta">${data.dealCount} 笔成交 · 占比 <strong>${percent}%</strong></div>
        </div>
      `,
      extraCssText: 'padding:0;border:0;background:transparent;box-shadow:none;pointer-events:none;',
    },
    title: {
      text: formatWan(totalRecovered),
      subtext: '净回款（万）',
      left: '50%',
      top: '41%',
      textAlign: 'center',
      textStyle: { color: '#F7F8FC', fontSize: 22, fontWeight: 750 },
      subtextStyle: { color: 'rgba(185,194,212,.62)', fontSize: 11, lineHeight: 20 },
    },
    series: [{
      name: '成交来源',
      type: 'pie',
      radius: ['58%', '92%'],
      center: ['50%', '52%'],
      avoidLabelOverlap: true,
      minAngle: 2,
      padAngle: 1,
      itemStyle: {
        borderRadius: 8,
        borderColor: 'rgba(255,255,255,.12)',
        borderWidth: 2,
        shadowBlur: 22,
        shadowColor: 'rgba(0,0,0,.32)',
      },
      emphasis: { scaleSize: 4, itemStyle: { shadowBlur: 24, shadowColor: 'rgba(184,156,255,.20)' } },
      label: {
        show: true,
        position: 'outside',
        alignTo: 'edge',
        edgeDistance: 8,
        bleedMargin: 0,
        distanceToLabelLine: 2,
        formatter: ({ name, percent }) => `{name|${name}}\n{percent|${percent}%}`,
        rich: {
          name: { color: '#B9C2D4', fontSize: 11, fontWeight: 700, lineHeight: 15 },
          percent: { color: 'rgba(185,194,212,.62)', fontSize: 10, fontWeight: 650, lineHeight: 14 },
        },
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 8,
        smooth: 0.2,
        lineStyle: { color: 'rgba(217,209,255,.42)', width: 1 },
      },
      labelLayout: (params) => ({
        dy: params.dataIndex === 1 ? 10 : params.dataIndex === 5 ? -8 : 0,
        hideOverlap: true,
        moveOverlap: 'shiftY',
      }),
      data: donutRows.map((row) => ({
        name: row.name,
        value: row.recovered,
        dealCount: row.dealCount,
      })),
    }],
  }), [donutRows, totalRecovered]);

  const modal = detailOpen ? (
    <div className="source-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="source-detail-title">
      <button className="source-detail-mask" type="button" aria-label="关闭成交来源明细" onClick={() => setDetailOpen(false)} />
      <section className="source-detail-card">
        <header className="source-detail-head">
          <div>
            <h2 id="source-detail-title">成交来源明细</h2>
            <p>{periodLabel} · 净回款口径 · {rows.length} 个来源</p>
          </div>
          <button className="source-detail-close" type="button" aria-label="关闭" onClick={() => setDetailOpen(false)}>×</button>
        </header>
        {rows.length ? <SourceRanking rows={rows} /> : <div className="channel-source-panel__empty">当前渠道暂无来源数据</div>}
      </section>
    </div>
  ) : null;

  return (
    <>
      <section
        className="channel-source-panel"
        aria-label="打开成交来源明细"
        role="button"
        tabIndex={0}
        onClick={() => rows.length && setDetailOpen(true)}
        onKeyDown={(event) => {
          if (rows.length && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            setDetailOpen(true);
          }
        }}
      >
        <header className="channel-source-panel__head">
          <div>
            <h2>成交来源</h2>
            <p>{periodLabel} · 净回款口径</p>
          </div>
          <span>{rows.length} 个来源</span>
        </header>
        {rows.length ? (
          <div className="channel-source-panel__chart-button">
            <EChart option={option} className="channel-source-panel__chart" onEvents={{ click: () => setDetailOpen(true) }} />
          </div>
        ) : (
          <div className="channel-source-panel__empty">当前渠道暂无来源数据</div>
        )}
      </section>
      {modal && createPortal(modal, document.body)}
    </>
  );
}
