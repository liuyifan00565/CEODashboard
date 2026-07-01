/* 更新时间: 2026-07-01 15:19:39 CST  更新内容: 版本情况合计数量/金额移至标题下方左上角，并优化右侧四卡片上下均衡布局。 */
import { useState } from 'react';

import EChart from './EChart';
import { getChannelRows, getVersionRows } from '../data/mock';
import { fmtDelta, deltaColor, fmtMoney } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './VersionFinancePanel.css';

const VERSION_DISPLAY_KEYS = ['qihang', 'zhuoyue', 'zhizun', 'custom'];
const VERSION_MODES = [
  { value: 'count', label: '数量', field: 'units', unit: '套' },
  { value: 'amount', label: '金额', field: 'recovered', unit: '万' },
];
const VERSION_RING_COLORS = ['#e6fbff', '#9eeeff', '#6ea8ff', '#b8ffd9'];

function VersionMetric({ label, value }) {
  return (
    <span className="vf-metric">
      <span className="vf-metric-label">{label}</span>
      <b className="vf-metric-value">{value}</b>
    </span>
  );
}

function getModeMeta(mode) {
  return VERSION_MODES.find((item) => item.value === mode) ?? VERSION_MODES[0];
}

function getDisplayVersions(versions) {
  const byKey = new Map(versions.map((version) => [version.key, version]));
  return VERSION_DISPLAY_KEYS.map((key) => byKey.get(key)).filter(Boolean);
}

function formatModeValue(value, modeMeta) {
  const number = Number(value) || 0;
  return `${number.toLocaleString('zh-CN')}${modeMeta.unit}`;
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
        center: ['50%', '74%'],
        startAngle: 180,
        endAngle: 360,
        minShowLabelAngle: 1,
        padAngle: 3,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(255, 255, 255, .12)',
          borderWidth: 2,
          shadowBlur: 22,
          shadowColor: 'rgba(0, 0, 0, .32)',
        },
        label: {
          show: true,
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
              textShadowColor: 'rgba(0,0,0,.44)',
              textShadowBlur: 10,
            },
            percent: {
              color: tokens.chartText,
              fontSize: 12,
              fontWeight: 850,
              lineHeight: 15,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.48)',
              textShadowBlur: 10,
            },
          },
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: tokens.chartText,
            opacity: 0.72,
            width: 2,
          },
          smooth: 0.18,
          length: 10,
          length2: 16,
        },
        data: versions.map((version, index) => {
          const value = Math.max(Number(version[modeMeta.field]) || 0, 0.01);
          return {
            value,
            rawValue: Number(version[modeMeta.field]) || 0,
            name: version.name,
            itemStyle: { color: VERSION_RING_COLORS[index] },
          };
        }),
      },
    ],
  };
}

export default function VersionFinancePanel({ channelKey = 'all' }) {
  const [mode, setMode] = useState('count');
  const tokens = useThemeTokens();
  const versions = getDisplayVersions(getVersionRows(channelKey));
  const countTotal = versions.reduce((sum, version) => sum + (Number(version.units) || 0), 0);
  const amountTotal = versions.reduce((sum, version) => sum + (Number(version.recovered) || 0), 0);
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
      </header>

      <div className="vf-overview">
        <div className="vf-ring-pane">
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

          <div className="vf-ring">
            <EChart option={versionHalfRingOption(versions, mode, tokens)} className="vf-ring-chart" style={{ height: 232 }} />
          </div>
        </div>

        <div className="vf-card-grid">
          {versions.map((v) => (
            <div className="vf-version-card" key={v.key}>
              <div className="vf-version-top">
                <div>
                  <h4 className="vf-version-name">{v.name}</h4>
                  <span className="vf-version-price">{fmtMoney(v.price)}</span>
                </div>
                <span className="vf-version-mom" style={{ color: deltaColor(v.mom) }}>{fmtDelta(v.mom)}</span>
              </div>

              <div className="vf-version-basic">
                <VersionMetric label="套数" value={v.units} />
                <VersionMetric label="回款" value={`${v.recovered}万`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
