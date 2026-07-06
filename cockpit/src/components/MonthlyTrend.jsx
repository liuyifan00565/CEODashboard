/* 更新时间: 2026-07-06 14:41:51 CST  更新内容: 月度经营趋势完成率蓝色读数横向偏移最终改为 13px，纵向保持上移 2px。 */
/* 更新时间: 2026-07-06 14:41:51 CST  更新内容: 月度经营趋势完成率蓝色读数横向偏移改为 12，并整体上移 2px。 */
/* 更新时间: 2026-07-06 14:41:51 CST  更新内容: 月度经营趋势完成率蓝色读数整体向左移动。 */
/* 更新时间: 2026-07-06 14:31:30 CST  更新内容: 月度经营趋势完成率读数下移避开折线并增加轻微文字阴影。 */
/* 更新时间: 2026-07-06 16:26:12 CST  更新内容: 月度经营趋势完成率读数继续上移，贴近折线下方标注位置。 */
/* 更新时间: 2026-07-06 16:07:18 CST  更新内容: 月度经营趋势完成率读数上移到贴近折线下方的位置。 */
/* 更新时间: 2026-07-06 15:44:36 CST  更新内容: 月度经营趋势完成率读数移到折线下方并向柱子右侧偏移，避免压在柱状图上。 */
/* 更新时间: 2026-07-06 14:44:12 CST  更新内容: 月度经营趋势完成率折线、圆点和读数改为图二青蓝色。 */
/* 更新时间: 2026-07-06 14:30:24 CST  更新内容: 月度经营趋势完成率读数下移贴近折线原点上方。 */
/* 更新时间: 2026-07-06 14:18:47 CST  更新内容: 月度经营趋势完成率读数取消黑色贴片，改为折线上方荧光黄文字。 */
/* 更新时间: 2026-07-06 14:03:06 CST  更新内容: 月度经营趋势完成率读数固定上移，避免数据显示在折线上。 */
/* 更新时间: 2026-07-06 13:37:20 CST  更新内容: 月度经营趋势完成率读数增加贴片底色和顶部余量，提升高低波动数据的清晰度。 */
/* 更新时间: 2026-07-06 12:25:08 CST  更新内容: 月度经营趋势完成率折线新增动态轴、错位标签和异常数据保护。 */
/* 更新时间: 2026-06-29 10:45:53  更新内容: 月度经营趋势图例改为静态说明，并将目标与回款柱重叠展示。 */
import EChart from './EChart';
import { getChannelTrend } from '../data/mock';
import { useThemeTokens } from '../lib/theme';
import './MonthlyTrend.css';

const COMPLETION_LABEL_OFFSET = [13, 0];
const COMPLETION_LINE_COLOR = '#43eaff';

function safeTrendNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(number, 0) : 0;
}

function normalizeTrendRows(trend) {
  return (Array.isArray(trend) ? trend : []).map((row, index) => {
    const recovered = safeTrendNumber(row.recovered);
    const target = safeTrendNumber(row.target);
    const completion = row.completion == null
      ? (target ? (recovered / target) * 100 : 0)
      : safeTrendNumber(row.completion);

    return {
      month: row.month ?? `${index + 1}月`,
      recovered: Math.round(recovered * 10) / 10,
      target: Math.round(target * 10) / 10,
      completion: Math.round(completion * 10) / 10,
    };
  });
}

function completionAxisMax(values) {
  const maxValue = Math.max(100, ...values.map(safeTrendNumber));
  const headroom = Math.max(24, maxValue * 0.18);
  return Math.ceil((maxValue + headroom) / 20) * 20;
}

function completionLabelLayout(params) {
  const labelY = Number(params.labelRect?.y ?? 8);
  return {
    y: Math.max(8, labelY + 4),
    hide: false,
    moveOverlap: 'shiftX',
  };
}

export default function MonthlyTrend({ channelKey = 'all' }) {
  const tokens = useThemeTokens();
  const normalizedTrend = normalizeTrendRows(getChannelTrend(channelKey));
  const months = normalizedTrend.map(m => m.month);
  const recovered = normalizedTrend.map(m => m.recovered);
  const target = normalizedTrend.map(m => m.target);
  const completion = normalizedTrend.map(m => m.completion);
  const completionAxisLimit = completionAxisMax(completion);

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
    grid: { top: 68, left: 8, right: 24, bottom: 12, containLabel: true },
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
          const value = safeTrendNumber(p.value);
          const v = p.seriesName === '完成率%' ? `${value.toFixed(1)}%` : `${value} 万`;
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
      axisLabel: { color: faint, fontSize: 14 },
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
        max: completionAxisLimit,
        scale: true,
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
          color: tokens.chartBarFaint,
          borderColor: tokens.chartAxis,
          borderWidth: 1,
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { disabled: true },
        data: target,
      },
      {
        name: '回款',
        type: 'bar',
        barWidth: 22,
        barGap: '-100%',
        barCategoryGap: '42%',
        itemStyle: {
          color: tokens.chartBar,
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { itemStyle: { color: tokens.chartText } },
        data: recovered,
      },
      {
        name: '完成率%',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showAllSymbol: true,
        clip: false,
        lineStyle: { color: COMPLETION_LINE_COLOR, width: 2 },
        itemStyle: { color: COMPLETION_LINE_COLOR, borderColor: '#c8fbff', borderWidth: 2 },
        z: 8,
        label: {
          show: true,
          position: 'bottom',
          offset: COMPLETION_LABEL_OFFSET,
          color: COMPLETION_LINE_COLOR,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 17,
          textShadowColor: 'rgba(0, 0, 0, .72)',
          textShadowBlur: 5,
          align: 'left',
          distance: 2,
          formatter: ({ value }) => `${Number(value).toFixed(1)}%`,
        },
        labelLayout: completionLabelLayout,
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
