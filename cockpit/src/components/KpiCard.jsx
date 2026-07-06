/* 更新时间: 2026-07-06 12:09:17 CST  更新内容: 回款半环参照 ECharts 官方半环示例恢复自然折线说明，并保留异常数值保护。 */
/* 更新时间: 2026-07-06 15:09:00 CST  更新内容: 年度回款半环标签按扇区顺序排布，避免数据库占比变化后引导线交叉。 */
/* 更新时间: 2026-07-06 14:57:00 CST  更新内容: 回款半环渠道占比改为优先读取 MySQL 聚合渠道数据。 */
/* 更新时间: 2026-07-03 11:05:35 CST  更新内容: 主页回款卡月度/年度目标拆成名称和金额两行展示。 */
/* Update time: 2026-07-03 10:24:55 CST  Update content: Remove target and completed subtitle text from the recovery half-donut header. */
/* Update time: 2026-07-02 18:03:34 CST  Update content: Place recovery card target subtitles beside the large KPI value on desktop. */
/* Update time: 2026-07-02 17:50:46 CST  Update content: Add a scoped progress chart class so recovery cards can tone down accent saturation. */
/* Update time: 2026-07-02 17:09:15 CST  Update content: Soften the unfinished recovery slice for the refined neon palette. */
/* 更新时间: 2026-06-30 19:08:00  更新内容: 回款 KPI 半环扇区增加间隙。 */
import NumberRoll from './NumberRoll';
import EChart from './EChart';
import { getDashboardChannels } from '../data/mock';
import { fmtDelta, deltaColor, progressColor } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './KpiCard.css';

const CHANNEL_PIE_COLORS = ['#e6fbff', '#9eeeff', '#6ea8ff', '#b8ffd9'];
const CHANNEL_PERCENT_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#ffffff'];
const CHANNEL_PIE_LABELS = { south: '线下华南', east: '线下华东' };
const INCOMPLETE_PIE_COLOR = 'rgba(230, 251, 255, .12)';
const INCOMPLETE_PERCENT_COLOR = '#ffffff';
const RECOVERY_PIE_MAX_CHANNELS = 4;

function channelPieName(channel) {
  return CHANNEL_PIE_LABELS[channel.key] ?? channel.name;
}

function safeRecoveryNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
}

function formatRecoveryWan(value) {
  const safeValue = safeRecoveryNumber(value);
  if (safeValue > 0 && safeValue < 1) return '<1 万';
  return `${Math.round(safeValue).toLocaleString('zh-CN')} 万`;
}

function formatRecoveryPercent(value, total) {
  const safeValue = safeRecoveryNumber(value);
  const safeTotal = safeRecoveryNumber(total);
  if (!safeTotal) return '0%';
  const percent = (safeValue / safeTotal) * 100;
  if (percent > 0 && percent < 0.1) return '<0.1%';
  return `${(Math.round(percent * 10) / 10).toFixed(1)}%`;
}

function normalizeRecoveryChannels(channels) {
  const safeChannels = (Array.isArray(channels) ? channels : []).map((channel, index) => ({
    key: channel.key ?? `channel-${index + 1}`,
    name: channelPieName(channel),
    recovered: safeRecoveryNumber(channel.recovered),
    color: CHANNEL_PIE_COLORS[index % CHANNEL_PIE_COLORS.length],
    percentColor: CHANNEL_PERCENT_COLORS[index % CHANNEL_PERCENT_COLORS.length],
  }));

  if (safeChannels.length <= RECOVERY_PIE_MAX_CHANNELS) return safeChannels;

  const visibleChannels = safeChannels.slice(0, RECOVERY_PIE_MAX_CHANNELS - 1);
  const otherRecovered = safeChannels
    .slice(RECOVERY_PIE_MAX_CHANNELS - 1)
    .reduce((sum, channel) => sum + channel.recovered, 0);

  return [
    ...visibleChannels,
    {
      key: 'other',
      name: '其他',
      recovered: otherRecovered,
      color: CHANNEL_PIE_COLORS[(RECOVERY_PIE_MAX_CHANNELS - 1) % CHANNEL_PIE_COLORS.length],
      percentColor: CHANNEL_PERCENT_COLORS[(RECOVERY_PIE_MAX_CHANNELS - 1) % CHANNEL_PERCENT_COLORS.length],
    },
  ];
}

function recoveryCompletedValue(card) {
  return safeRecoveryNumber(card.value);
}

function recoveryTargetValue(card) {
  const completed = recoveryCompletedValue(card);
  return Math.max(completed + safeRecoveryNumber(card.gap), completed);
}

function recoveryPieHeading(card) {
  return card.key === 'year' ? '本年目标完成情况' : '本月目标完成情况';
}

function splitRecoveryTargetSub(card) {
  if (!['month', 'year'].includes(card?.key) || typeof card?.sub !== 'string') return null;
  const match = card.sub.match(/^(\S+目标)\s+(.+)$/);
  return match ? { label: match[1], value: match[2] } : null;
}

function recoveryPieLabelFormatter(params) {
  return `{name|${params.name}}\n{${recoveryPiePercentRichKey(params)}|${params.data?.displayPercent ?? `${params.percent}%`}}`;
}

function recoveryPiePercentRichKey(params) {
  const name = String(params.name ?? params.data?.name ?? '');
  if (name.includes('华东')) return 'percentEast';
  if (name.includes('华南')) return 'percentSouth';
  if (name.includes('代理')) return 'percentAgent';
  if (name.includes('未完成')) return 'percentIncomplete';
  return 'percentOnline';
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
  const channels = normalizeRecoveryChannels(getDashboardChannels());
  const channelTotal = channels.reduce((sum, channel) => sum + channel.recovered, 0);
  const cardTotal = recoveryCompletedValue(card);
  const targetValue = recoveryTargetValue(card);
  const incompleteValue = Math.max(0, targetValue - cardTotal);
  const scale = channelTotal ? cardTotal / channelTotal : 0;

  if (!targetValue && !cardTotal && !channelTotal) {
    return [{
      key: 'empty',
      value: 1,
      rawValue: 0,
      displayValue: 0,
      valueText: '0 万',
      displayPercent: '0%',
      targetValue: 0,
      name: '暂无数据',
      isEmpty: true,
      percentColor: INCOMPLETE_PERCENT_COLOR,
      itemStyle: {
        color: INCOMPLETE_PIE_COLOR,
        opacity: .3,
        borderColor: 'rgba(230, 251, 255, .14)',
        shadowBlur: 0,
      },
    }];
  }

  if (cardTotal > 0 && !channelTotal) {
    return [{
      key: 'recovered',
      value: cardTotal,
      rawValue: Math.round(cardTotal),
      displayValue: cardTotal,
      valueText: formatRecoveryWan(cardTotal),
      displayPercent: formatRecoveryPercent(cardTotal, targetValue),
      targetValue,
      name: '已回款',
      percentColor: CHANNEL_PERCENT_COLORS[0],
      itemStyle: { color: CHANNEL_PIE_COLORS[0] },
    }];
  }

  const channelData = channels.map((channel, index) => {
    const value = channel.recovered * scale;

    return {
      key: channel.key,
      value,
      rawValue: Math.round(value),
      displayValue: value,
      valueText: formatRecoveryWan(value),
      displayPercent: formatRecoveryPercent(value, targetValue),
      targetValue,
      name: channel.name,
      percentColor: channel.percentColor,
      itemStyle: { color: channel.color ?? CHANNEL_PIE_COLORS[index % CHANNEL_PIE_COLORS.length] },
    };
  });

  const incompleteSlice = {
    key: 'incomplete',
    value: incompleteValue,
    rawValue: Math.round(incompleteValue),
    displayValue: incompleteValue,
    valueText: formatRecoveryWan(incompleteValue),
    displayPercent: formatRecoveryPercent(incompleteValue, targetValue),
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
    ...channelData
      .filter((item) => item.value > 0)
      .sort((a, b) => a.value - b.value),
    incompleteSlice,
  ].filter((item) => item.value > 0);
}

function recoveryPieOption(card, tokens, accentColor, sourceData = recoveryPieData(card)) {
  const pieData = sourceData.map((item, index) => ({
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
        const valueText = params.data?.valueText ?? `${params.data?.rawValue ?? params.value} 万`;
        const isIncomplete = params.data?.isIncomplete;
        const valueLabel = `${isIncomplete ? '缺口' : '回款'} ${valueText}`;

        return `
          <div class="kpi-pie-tooltip" aria-label="${valueLabel}">
            <div class="kpi-pie-tooltip__name">${params.seriesName} · ${params.name}</div>
            <div class="kpi-pie-tooltip__value">${isIncomplete ? '缺口' : '回款'} <strong>${valueText}</strong></div>
            <div class="kpi-pie-tooltip__meta">目标 ${formatRecoveryWan(params.data?.targetValue)} · 完成率 ${card.progress ?? params.percent}%</div>
            <div class="kpi-pie-tooltip__meta">目标占比 <strong>${params.data?.displayPercent ?? `${params.percent}%`}</strong></div>
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
        minShowLabelAngle: 0,
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
          formatter: recoveryPieLabelFormatter,
          position: 'outside',
          color: 'rgba(239,251,255,.96)',
          alignTo: 'none',
          bleedMargin: 6,
          distanceToLabelLine: 4,
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
          smooth: false,
          length: 12,
          length2: 12,
          maxSurfaceAngle: 80,
        },
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
  const recoveryPieSlices = isRecoveryCard ? recoveryPieData(card) : [];
  const displayValue = card.displayValue ?? card.value;
  const displayUnit = card.displayUnit ?? card.unit;
  const displayDecimals = card.displayDecimals ?? card.decimals;
  const isX = displayUnit === 'x';
  const suffix = displayUnit === '%' || isX ? displayUnit : ' ' + (displayUnit || '');
  const decimals = displayDecimals ?? (isX ? 2 : 0);
  const hasProgress = card.progress != null;
  const recoveryAccent = hasProgress ? progressColor(card.progress, tokens.progressMid) : tokens.chartBar;
  const recoveryTargetSub = splitRecoveryTargetSub(card);

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
            </div>
            <EChart option={recoveryPieOption(card, tokens, recoveryAccent, recoveryPieSlices)} className="kpi-card__pie-chart" style={{ height: 326 }} />
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
