/* 更新时间: 2026-07-06 10:48:16 CST  更新内容: 月度趋势按高级果味规则重排图表权重，回款用银紫渐变，目标后退，风险点保留玫瑰红。 */
/* 更新时间: 2026-07-04 01:03:12 CST  更新内容: 月度经营趋势仅突出当前 6 月柱形和轴标，其余月份继续保持低饱和。 */
/* 更新时间: 2026-07-03 23:48:36 CST  更新内容: 月度趋势回款柱统一低饱和紫色，低完成率仅在完成率点位和标签使用风险色。 */
/* 更新时间: 2026-07-03 18:54:17 CST  更新内容: 月度趋势回款柱与完成率标签按 80 以下红色、80-99 紫色、100 及以上金色三档分色。 */
/* 更新时间: 2026-07-03 18:19:59 CST  更新内容: 月度经营趋势回款柱按完成率 80% 风险线分色，危险月份直接使用风险色。 */
/* 更新时间: 2026-06-29 10:45:53  更新内容: 月度经营趋势图例改为静态说明，并将目标与回款柱重叠展示。 */
import EChart from './EChart';
import { getChannelTrend } from '../data/mock';
import { isRiskCompletion } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './MonthlyTrend.css';

const CURRENT_TREND_MONTH = '6月';

function completionPointColor(value, tokens) {
  return isRiskCompletion(value) ? tokens.chartRiskPoint : Number(value) >= 100 ? tokens.semanticGoal : tokens.chartRateLine;
}

function isCurrentTrendMonth(item) {
  return item?.month === CURRENT_TREND_MONTH;
}

function actualBarColor(tokens) {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: tokens.chartActualBarTop },
      { offset: 1, color: tokens.chartActualBarBottom },
    ],
  };
}

function targetBarColor(tokens) {
  return tokens.chartTargetBar;
}

function currentMonthBarColor(item, tokens) {
  return isCurrentTrendMonth(item) ? actualBarColor(tokens) : {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: 'rgba(184,156,255,.28)' },
      { offset: 1, color: 'rgba(142,134,255,.18)' },
    ],
  };
}

export default function MonthlyTrend({ channelKey = 'all' }) {
  const tokens = useThemeTokens();
  const trend = getChannelTrend(channelKey);
  const months = trend.map(m => m.month);
  const recovered = trend.map(m => m.recovered);
  const target = trend.map(m => m.target);
  const completion = trend.map(m => m.completion);

  const txt = tokens.chartText;
  const muted = tokens.chartMuted;
  const faint = tokens.chartMuted;
  const line = tokens.chartGrid;

  const option = {
    backgroundColor: 'transparent',
    textStyle: { color: muted, fontFamily: 'inherit' },
    legend: {
      top: 0,
      left: 'center',
      selectedMode: false,
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 18,
      textStyle: { color: faint, fontSize: 14 },
      data: ['回款', '目标', '完成率%'],
    },
    grid: { top: 40, left: 8, right: 8, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: tokens.chartTooltipBg,
      borderColor: tokens.chartTooltipBorder,
      borderWidth: 1,
      textStyle: { color: txt, fontSize: 14 },
      valueFormatter: null,
      formatter: (params) => {
        const head = `<div style="color:${faint};margin-bottom:4px">${params[0].axisValue}</div>`;
        const rows = params.map((p) => {
          const v = p.seriesName === '完成率%' ? `${p.value}%` : `${p.value} 万`;
          return `<div style="display:flex;align-items:center;gap:6px;line-height:1.7">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color}"></span>
            <span style="color:${muted}">${p.seriesName}</span>
            <span style="color:${txt};margin-left:auto;font-weight:600">${v}</span>
          </div>`;
        }).join('');
        return head + rows;
      },
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: line } },
      axisTick: { show: false },
      axisLabel: {
        color: ({ value }) => (value === '6月' ? tokens.chartText : faint),
        fontSize: 14,
        fontWeight: ({ value }) => (value === '6月' ? 760 : 520),
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: faint, fontSize: 14, padding: [0, 0, 0, 8] },
        axisLabel: { color: faint, fontSize: 14 },
        splitLine: { lineStyle: { color: line } },
        axisLine: { show: false },
      },
      {
        type: 'value',
        name: '%',
        min: 0,
        max: 100,
        nameTextStyle: { color: faint, fontSize: 14 },
        axisLabel: { color: faint, fontSize: 14, formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: '目标',
        type: 'bar',
        barWidth: 22,
        barCategoryGap: '42%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { disabled: true },
        data: target.map((value) => ({
          value,
          itemStyle: {
            color: targetBarColor(tokens),
            borderRadius: [3, 3, 0, 0],
          },
        })),
      },
      {
        name: '回款',
        type: 'bar',
        barWidth: 22,
        barGap: '-100%',
        barCategoryGap: '42%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { itemStyle: { color: actualBarColor(tokens) } },
        data: recovered.map((value, index) => ({
          value,
          itemStyle: {
            color: currentMonthBarColor(trend[index], tokens),
            borderRadius: [3, 3, 0, 0],
          },
        })),
      },
      {
        name: '完成率%',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: ({ value }) => (isRiskCompletion(value) ? 8 : 5),
        lineStyle: { color: tokens.chartRateLine, width: 1.5, opacity: 0.72, shadowBlur: 8, shadowColor: 'rgba(184,156,255,.24)' },
        itemStyle: { color: ({ value }) => completionPointColor(value, tokens), borderColor: tokens.chartPointBorder, borderWidth: 1.5 },
        label: {
          show: true,
          position: 'top',
          color: ({ value }) => completionPointColor(value, tokens),
          fontSize: 14,
          fontWeight: ({ value }) => (isRiskCompletion(value) ? 850 : 650),
          formatter: '{c}%',
        },
        data: completion,
      },
    ],
  };

  return (
    <section className="mt-panel">
      <header className="mt-head">
        <h3 className="mt-title">月度经营趋势</h3>
        <span className="mt-sub">回款 vs 目标 · 完成率</span>
      </header>
      <div className="mt-chart">
        <EChart option={option} style={{ height: '100%' }} />
      </div>
    </section>
  );
}
