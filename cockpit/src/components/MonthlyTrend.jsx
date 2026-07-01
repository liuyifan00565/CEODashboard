/* 更新时间: 2026-06-29 10:45:53  更新内容: 月度经营趋势图例改为静态说明，并将目标与回款柱重叠展示。 */
import EChart from './EChart';
import { getChannelTrend } from '../data/mock';
import { COLOR, progressColor } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './MonthlyTrend.css';

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
        lineStyle: { color: COLOR.good, width: 2 },
        itemStyle: { color: ({ value }) => progressColor(value, tokens.progressMid), borderColor: tokens.chartPointBorder, borderWidth: 1.5 },
        label: {
          show: true,
          position: 'top',
          color: ({ value }) => progressColor(value, tokens.progressMid),
          fontSize: 14,
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
