/* Update time: 2026-07-02 17:50:46 CST  Update content: Add a scoped progress chart class so recovery cards can tone down accent saturation. */
/* Update time: 2026-07-02 17:09:15 CST  Update content: Soften the unfinished recovery slice for the refined neon palette. */
/* 更新时间: 2026-06-30 19:08:00  更新内容: 回款 KPI 半环扇区增加间隙。 */
import NumberRoll from './NumberRoll';
import EChart from './EChart';
import { CHANNELS } from '../data/mock';
import { fmtDelta, deltaColor, progressColor } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './KpiCard.css';

const CHANNEL_PIE_COLORS = ['#e6fbff', '#9eeeff', '#6ea8ff', '#b8ffd9'];
const CHANNEL_PERCENT_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#ffffff'];
const CHANNEL_PIE_LABELS = { south: '线下华南', east: '线下华东' };
const INCOMPLETE_PIE_COLOR = 'rgba(230, 251, 255, .12)';
const INCOMPLETE_PERCENT_COLOR = '#ffffff';
const RECOVERY_YEAR_LABEL_SLOTS = {
  '线上': { y: 78 },
  '代理': { y: 118 },
  '线下华南': { y: 158 },
  '线下华东': { y: 198 },
  '未完成': { y: 156 },
};

function channelPieName(channel) {
  return CHANNEL_PIE_LABELS[channel.key] ?? channel.name;
}

function recoveryCompletedValue(card) {
  return Math.max(Number(card.value) || 0, 0);
}

function recoveryTargetValue(card) {
  return recoveryCompletedValue(card) + (Number(card.gap) || 0);
}

function recoveryPieHeading(card) {
  return card.key === 'year' ? '本年目标完成情况' : '本月目标完成情况';
}

function recoveryTargetLabel(card) {
  return card.key === 'year' ? '年目标' : '月目标';
}

function recoveryCompletedLabel(card) {
  return card.key === 'year' ? '年完成' : '月完成';
}

function recoveryPieLabelFormatter(params) {
  return `{name|${params.name}}\n{${recoveryPiePercentRichKey(params)}|${params.percent}%}`;
}

function recoveryPiePercentRichKey(params) {
  const name = String(params.name ?? params.data?.name ?? '');
  if (name.includes('华东')) return 'percentEast';
  if (name.includes('华南')) return 'percentSouth';
  if (name.includes('代理')) return 'percentAgent';
  if (name.includes('未完成')) return 'percentIncomplete';
  return 'percentOnline';
}

function recoveryPieLabelSlot(params) {
  const text = String(params.name ?? params.data?.name ?? params.text ?? '');
  if (text.includes('华东')) return RECOVERY_YEAR_LABEL_SLOTS['线下华东'];
  if (text.includes('华南')) return RECOVERY_YEAR_LABEL_SLOTS['线下华南'];
  if (text.includes('代理')) return RECOVERY_YEAR_LABEL_SLOTS['代理'];
  if (text.includes('未完成')) return RECOVERY_YEAR_LABEL_SLOTS['未完成'];
  if (text.includes('线上')) return RECOVERY_YEAR_LABEL_SLOTS['线上'];
  return null;
}

function recoveryPieLabelLayout(params, cardKey) {
  if (cardKey !== 'year') return undefined;

  const slot = recoveryPieLabelSlot(params);
  if (!slot) return undefined;

  return {
    y: slot.y,
    hideOverlap: false,
  };
}

function recoveryPieTooltipPosition(point, params, dom, rect, size) {
  const gap = 14;
  const contentWidth = size.contentSize[0];
  const contentHeight = size.contentSize[1];
  const viewWidth = size.viewSize[0];
  const viewHeight = size.viewSize[1];
  let left = point[0] + gap;
  let top = point[1] + gap;

  if (left + contentWidth + gap > viewWidth) {
    left = point[0] - contentWidth - gap;
  }

  if (top + contentHeight + gap > viewHeight) {
    top = point[1] - contentHeight - gap;
  }

  left = Math.max(gap, Math.min(left, viewWidth - contentWidth - gap));
  top = Math.max(gap, Math.min(top, viewHeight - contentHeight - gap));

  void params;
  void dom;
  void rect;

  return [left, top];
}

function progressOption(pct, tokens) {
  const color = progressColor(pct, tokens.progressMid);
  return {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'value', min: 0, max: 100, show: false },
    yAxis: { type: 'category', data: [''], show: false },
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    series: [{
      type: 'bar',
      data: [Math.min(pct, 100)],
      barWidth: 9,
      showBackground: true,
      backgroundStyle: { color: tokens.chartBarFaint, borderRadius: 5 },
      itemStyle: { color, borderRadius: 5 },
      label: { show: false },
      silent: true,
    }],
  };
}

function recoveryPieData(card) {
  const channelTotal = CHANNELS.reduce((sum, channel) => sum + channel.recovered, 0);
  const cardTotal = recoveryCompletedValue(card);
  const targetValue = recoveryTargetValue(card);
  const incompleteValue = Math.max(0, targetValue - cardTotal);
  const scale = channelTotal ? cardTotal / channelTotal : 1;

  const channelData = CHANNELS.map((channel, index) => {
    const value = Math.max(0.01, Math.round(channel.recovered * scale));

    return {
      value,
      rawValue: value,
      targetValue,
      name: channelPieName(channel),
      percentColor: CHANNEL_PERCENT_COLORS[index],
      itemStyle: { color: CHANNEL_PIE_COLORS[index] },
    };
  });

  const incompleteSlice = {
    value: incompleteValue,
    rawValue: incompleteValue,
    targetValue,
    name: '未完成',
    isIncomplete: true,
    percentColor: INCOMPLETE_PERCENT_COLOR,
    itemStyle: {
      color: INCOMPLETE_PIE_COLOR,
      opacity: .38,
      borderColor: 'rgba(230, 251, 255, .2)',
      shadowBlur: 0,
    },
  };

  return [
    ...channelData.sort((a, b) => a.value - b.value),
    incompleteSlice,
  ];
}

function recoveryPieOption(card, tokens, accentColor) {
  const pieData = recoveryPieData(card).map((item, index) => ({
    ...item,
    itemStyle: {
      ...item.itemStyle,
      color: item.itemStyle.color ?? accentColor ?? CHANNEL_PIE_COLORS[index],
    },
  }));

  return {
    color: CHANNEL_PIE_COLORS,
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      position: recoveryPieTooltipPosition,
      textStyle: {
        color: tokens.chartText,
        fontSize: 11,
        lineHeight: 16,
      },
      formatter: (params) => {
        const value = params.data?.rawValue ?? params.value;
        const isIncomplete = params.data?.isIncomplete;
        const valueLabel = `${isIncomplete ? '缺口' : '回款'} ${value} 万`;

        return `
          <div class="kpi-pie-tooltip" aria-label="${valueLabel}">
            <div class="kpi-pie-tooltip__name">${params.seriesName} · ${params.name}</div>
            <div class="kpi-pie-tooltip__value">${isIncomplete ? '缺口' : '回款'} <strong>${value}</strong> 万</div>
            <div class="kpi-pie-tooltip__meta">目标 ${params.data?.targetValue ?? '-'} 万 · 完成率 ${card.progress ?? params.percent}%</div>
            <div class="kpi-pie-tooltip__meta">占比 <strong>${params.percent}%</strong></div>
          </div>
        `;
      },
      extraCssText: 'padding:0;border:0;background:transparent;box-shadow:none;pointer-events:none;',
    },
    legend: {
      top: '5%',
      left: 'center',
      show: false,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: tokens.chartMuted,
        fontSize: 11,
      },
    },
    animationDuration: 1000,
    animationEasing: 'elasticOut',
    series: [
      {
        type: 'pie',
        name: card.title,
        radius: ['40%', '70%'],
        center: ['46%', '70%'],
        startAngle: 180,
        endAngle: 360,
        minShowLabelAngle: 1,
        padAngle: 3,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(255, 255, 255, .12)',
          borderWidth: 2,
          shadowBlur: 22,
          shadowColor: 'rgba(0, 0, 0, .32)',
        },
        label: {
          show: true,
          formatter: recoveryPieLabelFormatter,
          position: 'outside',
          color: 'rgba(239,251,255,.96)',
          bleedMargin: 0,
          distanceToLabelLine: 0,
          rich: {
            name: {
              color: 'rgba(239,251,255,.96)',
              fontSize: 15,
              fontWeight: 900,
              lineHeight: 19,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.38)',
              textShadowBlur: 10,
            },
            percentOnline: {
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 900,
              lineHeight: 16,
              align: 'center',
            },
            percentSouth: {
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 900,
              lineHeight: 16,
              align: 'center',
            },
            percentEast: {
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 900,
              lineHeight: 16,
              align: 'center',
            },
            percentAgent: {
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 900,
              lineHeight: 16,
              align: 'center',
            },
            percentIncomplete: {
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 900,
              lineHeight: 16,
              align: 'center',
            },
          },
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: 'rgba(239,251,255,.74)',
            width: 2,
          },
          smooth: 0.18,
          length: 12,
          length2: 20,
        },
        labelLayout: (params) => recoveryPieLabelLayout(params, card.key),
        animationType: 'scale',
        animationDelay: (idx) => idx * 45,
        data: pieData,
      },
    ],
  };
}

export default function KpiCard({ card, onOpen, sidePanel }) {
  const tokens = useThemeTokens();

  if (!card) return null;
  const isRecoveryCard = card.key === 'month' || card.key === 'year';
  const displayValue = card.displayValue ?? card.value;
  const displayUnit = card.displayUnit ?? card.unit;
  const displayDecimals = card.displayDecimals ?? card.decimals;
  const isX = displayUnit === 'x';
  const suffix = displayUnit === '%' || isX ? displayUnit : ' ' + (displayUnit || '');
  const decimals = displayDecimals ?? (isX ? 2 : 0);
  const hasProgress = card.progress != null;
  const recoveryAccent = hasProgress ? progressColor(card.progress, tokens.progressMid) : tokens.chartBar;

  const cardContent = (
    <>
      <div className="kpi-card__title">{card.title}</div>

      <div className="kpi-card__value">
        <NumberRoll value={displayValue} suffix={suffix} decimals={decimals} />
      </div>

      {card.sub != null && <div className="kpi-card__sub">{card.sub}</div>}

      {hasProgress && (
        <div className="kpi-card__progress">
          <div className="kpi-card__progress-head">
            <span>{card.progressLabel || '目标完成率'}</span>
            <span className="kpi-card__progress-pct" style={{ color: progressColor(card.progress, tokens.progressMid) }}>
              {card.progress}%
            </span>
          </div>
          <EChart option={progressOption(card.progress, tokens)} className="kpi-card__progress-chart" style={{ height: 12 }} />
        </div>
      )}

      <div className="kpi-card__meta">
        {card.delta != null && (
          <span
            className="kpi-card__chip"
            style={{ color: deltaColor(card.delta), borderColor: deltaColor(card.delta) }}
          >
            {fmtDelta(card.delta)}
          </span>
        )}
        {card.gap != null && (
          <span className="kpi-card__gap">缺口 {card.gap} 万</span>
        )}
      </div>

      <div className="kpi-card__hint">点击展开二级 ▸</div>
    </>
  );

  return (
    <div
      className={`kpi-card${isRecoveryCard ? ' kpi-card--recovery' : ''}${sidePanel ? ' kpi-card--with-side' : ''}`}
      style={isRecoveryCard ? { '--kpi-accent': recoveryAccent } : undefined}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (onOpen) onOpen(card);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onOpen) onOpen(card);
        }
      }}
    >
      {isRecoveryCard ? (
        <>
          <div className="kpi-card__pie" aria-hidden="true">
            <div className="kpi-card__pie-head">
              <div className="kpi-card__pie-title">{recoveryPieHeading(card)}</div>
              <div className="kpi-card__pie-sub">
                {recoveryTargetLabel(card)} <span className="kpi-card__pie-sub-value">{recoveryTargetValue(card)}</span> 万 · {recoveryCompletedLabel(card)} <span className="kpi-card__pie-sub-value">{recoveryCompletedValue(card)}</span> 万
              </div>
            </div>
          <EChart option={recoveryPieOption(card, tokens, recoveryAccent)} className="kpi-card__pie-chart" style={{ height: 326 }} />
          </div>
          <div className="kpi-card__body">{cardContent}</div>
          {sidePanel && (
            <div
              className="kpi-card__side-panel"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {sidePanel}
            </div>
          )}
        </>
      ) : (
        cardContent
      )}
    </div>
  );
}
