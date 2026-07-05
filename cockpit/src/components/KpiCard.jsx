/* 更新时间: 2026-07-06 00:00:13 CST  更新内容: KPI 完成态金色进度与半环切片统一改为高级哑金渐变。 */
/* 更新时间: 2026-07-05 19:10:30 CST  更新内容: 回款半环标题改为月度/年度回款结构，适配经营总览顶部轻量下钻入口。 */
/* 更新时间: 2026-07-05 15:29:01 CST  更新内容: 回款半环图缩小并换为低饱和通道色，风险进度改为柔和玫瑰色。 */
/* 更新时间: 2026-07-03 23:39:28 CST  更新内容: 收敛回款半环图未完成扇区、标签与阴影，让主 KPI 数字更主导。 */
/* 更新时间: 2026-07-03 18:54:17 CST  更新内容: KPI 完成率颜色改为 80 以下红色、80-99 紫色、100 及以上金色三档。 */
/* 更新时间: 2026-07-03 18:19:59 CST  更新内容: 将 KPI 完成率 80% 以下、缺口与趋势芯片统一接入风险色语义，并同步高级紫蓝图表色板。 */
/* 更新时间: 2026-07-03 17:55:26 CST  更新内容: 回款半环图渠道色改为低饱和紫/蓝/灰蓝组合，避免四个扇区全部占用强紫视觉面积。 */
/* 更新时间: 2026-07-03 17:53:00 CST  更新内容: 回款半环图改为统一紫蓝色阶，通过明度和深浅区分四个渠道，去除跳脱青色和高饱和糖果紫。 */
/* Update time: 2026-07-03 16:51:07 CST  Update content: Deepen KPI warning ECharts progress bars from light pink to bright rose red. */
/* Update time: 2026-07-03 16:46:50 CST  Update content: Brighten KPI ECharts progress bars again for stronger visual contrast. */
/* Update time: 2026-07-03 16:38:48 CST  Update content: Raise KPI ECharts progress bar brightness one step after visual review. */
/* Update time: 2026-07-03 16:32:08 CST  Update content: Darken KPI ECharts progress bars for both strong completion and warning states. */
/* Update time: 2026-07-03 17:08:00 CST  Update content: Redesign recovery half-ring channel colors with higher distinction across online, south, east, and agent while staying in the premium cold-purple system. */
/* Update time: 2026-07-03 15:48:00 CST  Update content: Align the recovery half-ring chart geometry, gaps, rounded arcs, labels, and glow with the VersionFinancePanel semi-donut style. */
/* Update time: 2026-07-03 15:34:00 CST  Update content: Shift recovery half-ring slices and ECharts progress bars to the cold-purple Apple/Vision Pro brand palette. */
/* Update time: 2026-07-03 15:31:20 CST  Update content: Restore the recovery chart to the chunky rounded semi-donut pie style shown in the reference screenshot. */
/* Update time: 2026-07-03 11:42:00 CST  Update content: Redesign the recovery pie as an Apple Vision Pro style segmented semi-donut gauge — thinner ring, rounded caps, larger gaps, low-saturation cold glass gradients, muted incomplete slice, subtle glass highlight and soft outer glow that only intensifies on the hovered segment. */
/* 更新时间: 2026-07-03 11:05:35 CST  更新内容: 主页回款卡月度/年度目标拆成名称和金额两行展示。 */
/* Update time: 2026-07-03 10:24:55 CST  Update content: Remove target and completed subtitle text from the recovery half-donut header. */
/* Update time: 2026-07-02 18:03:34 CST  Update content: Place recovery card target subtitles beside the large KPI value on desktop. */
/* Update time: 2026-07-02 17:50:46 CST  Update content: Add a scoped progress chart class so recovery cards can tone down accent saturation. */
/* Update time: 2026-07-02 17:09:15 CST  Update content: Soften the unfinished recovery slice for the refined neon palette. */
/* 更新时间: 2026-06-30 19:08:00  更新内容: 回款 KPI 半环扇区增加间隙。 */
import * as echarts from 'echarts';
import NumberRoll from './NumberRoll';
import EChart from './EChart';
import { CHANNELS } from '../data/mock';
import { fmtDelta, deltaColor, progressColor, riskAdjustedDelta, isRiskCompletion } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './KpiCard.css';

// 分段半环仪表盘：保留低饱和品牌强调，避免四个渠道全部成为强紫色块。
const CHANNEL_PIE_GRADIENTS = [
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#7F6BE8' }, { offset: 0.55, color: '#9B86FF' }, { offset: 1, color: '#C8BFFF' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#6FB7D5' }, { offset: 0.58, color: '#9BD8F4' }, { offset: 1, color: '#D7F0FA' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#50B8AA' }, { offset: 0.58, color: '#72D7C9' }, { offset: 1, color: '#C2F0E9' }] },
  { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#947E55' }, { offset: 0.56, color: '#B7A06C' }, { offset: 1, color: '#D6C49A' }] },
];
const CHANNEL_PERCENT_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#ffffff'];
const CHANNEL_PIE_LABELS = { south: '线下华南', east: '线下华东' };
// 未完成段：半透明灰蓝双层，退到背景里
const INCOMPLETE_PIE_COLOR = {
  type: 'linear', x: 0, y: 0, x2: 1, y2: 1,
  colorStops: [
    { offset: 0, color: 'rgba(255, 255, 255, 0.035)' },
    { offset: 1, color: 'rgba(255, 255, 255, 0.02)' },
  ],
};
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
  return card.key === 'year' ? '年度回款结构' : '月度回款结构';
}

function splitRecoveryTargetSub(card) {
  if (!['month', 'year'].includes(card?.key) || typeof card?.sub !== 'string') return null;
  const match = card.sub.match(/^(\S+目标)\s+(.+)$/);
  return match ? { label: match[1], value: match[2] } : null;
}

function recoveryPieLabelFormatter(params) {
  return `{name|${params.name}}\n{percent|${params.percent}%}`;
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

function progressBarColor(pct, tokens) {
  void tokens;
  const value = Number(pct) || 0;
  if (value < 80) {
    return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
      { offset: 0, color: '#A94F62' },
      { offset: 0.58, color: '#D86A82' },
      { offset: 1, color: '#E7A0AE' },
    ]);
  }

  if (value >= 100) {
    return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
      { offset: 0, color: '#7E6B49' },
      { offset: 0.58, color: '#B7A06C' },
      { offset: 1, color: '#D6C49A' },
    ]);
  }

  return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#8B7CFF' },
    { offset: 0.56, color: '#AFA6FF' },
    { offset: 0.88, color: '#D8D4FF' },
    { offset: 1, color: '#8BD7FF' },
  ]);
}

function progressOption(pct, tokens) {
  const labelColor = progressColor(pct, tokens.progressMid, tokens.progressGold);
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
      itemStyle: { color: progressBarColor(pct, tokens), borderRadius: 5, shadowBlur: 6, shadowColor: labelColor },
      label: { show: false },
      silent: true,
      emphasis: { disabled: true },
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
      itemStyle: { color: CHANNEL_PIE_GRADIENTS[index] },
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
      opacity: .24,
      borderColor: 'rgba(255, 255, 255, .08)',
      borderWidth: 1,
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
      color: item.itemStyle.color ?? accentColor ?? CHANNEL_PIE_GRADIENTS[index],
    },
  }));

  return {
    color: CHANNEL_PIE_GRADIENTS,
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
        const percent = params.data?.percent ?? params.percent ?? 0;

        return `
          <div class="kpi-pie-tooltip" aria-label="${valueLabel}">
            <div class="kpi-pie-tooltip__name">${params.seriesName} · ${params.name}</div>
            <div class="kpi-pie-tooltip__value">${isIncomplete ? '缺口' : '回款'} <strong>${value}</strong> 万</div>
            <div class="kpi-pie-tooltip__meta">目标 ${params.data?.targetValue ?? '-'} 万 · 完成率 ${card.progress ?? percent}%</div>
            <div class="kpi-pie-tooltip__meta">占比 <strong>${percent}%</strong></div>
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
    animationDuration: 900,
    animationEasing: 'cubicOut',
    series: [
      {
        type: 'pie',
        name: card.title,
        radius: ['50%', '66%'],
        center: ['50%', '72%'],
        startAngle: 180,
        endAngle: 360,
        minShowLabelAngle: 1,
        padAngle: 3,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: 'rgba(255, 255, 255, .08)',
          borderWidth: 1,
          shadowBlur: 3,
          shadowColor: 'rgba(167, 156, 255, .08)',
        },
        emphasis: {
          scale: false,
          itemStyle: {
            shadowBlur: 6,
            shadowColor: 'rgba(167, 156, 255, .12)',
            borderColor: 'rgba(255, 255, 255, .12)',
          },
        },
        label: {
          show: true,
          formatter: recoveryPieLabelFormatter,
          position: 'outside',
          color: tokens.chartText,
          bleedMargin: 0,
          distanceToLabelLine: 4,
          rich: {
            name: {
              color: tokens.chartText,
              fontSize: 12,
              fontWeight: 760,
              lineHeight: 16,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.34)',
              textShadowBlur: 4,
            },
            percent: {
              color: tokens.chartText,
              fontSize: 11,
              fontWeight: 720,
              lineHeight: 14,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.34)',
              textShadowBlur: 4,
            },
          },
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: tokens.chartText,
            opacity: 0.28,
            width: 1,
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
  const recoveryAccent = hasProgress ? progressColor(card.progress, tokens.progressMid, tokens.progressGold) : tokens.chartBar;
  const recoveryTargetSub = splitRecoveryTargetSub(card);
  const metaDelta = riskAdjustedDelta(card);

  const cardContent = (
    <>
      <div className="kpi-card__title">{card.title}</div>

      <div className="kpi-card__value-row">
        <div className="kpi-card__value">
          <NumberRoll value={displayValue} suffix={suffix} decimals={decimals} />
        </div>

        {card.sub != null && (
          <div className={`kpi-card__sub${recoveryTargetSub ? ' kpi-card__sub--target' : ''}`}>
            {recoveryTargetSub ? (
              <>
                <span className="kpi-card__sub-label">{recoveryTargetSub.label}</span>
                <span className="kpi-card__sub-value">{recoveryTargetSub.value}</span>
              </>
            ) : card.sub}
          </div>
        )}
      </div>

      {hasProgress && (
        <div className="kpi-card__progress">
          <div className="kpi-card__progress-head">
            <span>{card.progressLabel || '目标完成率'}</span>
            <span className="kpi-card__progress-pct" style={{ color: progressColor(card.progress, tokens.progressMid, tokens.progressGold) }}>
              {card.progress}%
            </span>
          </div>
          <EChart option={progressOption(card.progress, tokens)} className="kpi-card__progress-chart" style={{ height: 10 }} />
        </div>
      )}

      <div className="kpi-card__meta">
        {metaDelta != null && (
          <span
            className="kpi-card__chip"
            style={{ color: deltaColor(metaDelta), borderColor: deltaColor(metaDelta) }}
          >
            {fmtDelta(metaDelta)}
          </span>
        )}
        {card.gap != null && (
          <span className={`kpi-card__gap${isRiskCompletion(card.progress) ? ' kpi-card__gap--risk' : ''}`}>缺口 {card.gap} 万</span>
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
            </div>
          <EChart option={recoveryPieOption(card, tokens, recoveryAccent)} className="kpi-card__pie-chart" style={{ height: 292 }} />
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
