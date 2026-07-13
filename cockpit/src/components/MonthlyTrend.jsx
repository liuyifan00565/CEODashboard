/* 更新时间: 2026-07-13 19:20:00 CST  更新内容: 日视图并入统一的 buildBarTrendOption，与月/年共用同一套图表外壳
   （图例、双 Y 轴、柱线组合、悬浮框样式），不再是单独的迷你柱状图；因 biz_target_monthly 无日粒度目标，
   日视图的目标柱和完成率线数据为 null（不渲染），悬浮框按数值是否为 null 过滤对应行，避免出现空目标提示。
   X 轴标签按类目数量自适应抽稀间隔，日视图类目多时不再全部铺满。完成率折线的 symbolSize/itemStyle.color/
   label.color/label.fontWeight 回调补上 `= {}` 默认参数——ECharts 给 null 数据点回调时传的是 undefined
   而非 {value:null}，之前的 `({value}) =>` 解构会直接抛 TypeError 把整个页面崩白屏。 */
/* 更新时间: 2026-07-13 17:10:00 CST  更新内容: 新增年/月/日切换（Segmented）。月/年视图共用回款+目标+完成率柱线组合，
   日视图读取 getDailyRevenueTrend() 展示本月每日回款柱状图；因 biz_target_monthly 无日粒度目标，日视图不展示
   目标柱和完成率线，只保留实际回款单一系列。 */
/* 更新时间: 2026-07-10 10:49:21 CST  更新内容: 固定月度趋势配置引用并关闭画布动画与折线模糊光晕，消除无交互时反复闪烁。 */
/* 更新时间: 2026-07-07 16:50:00 CST  更新内容: 柱状图悬浮框对齐 GlassSelect 面板同体系——银紫描边 + 24px 毛玻璃 + 紫光投影 + 16px 圆角，杜绝与下拉框质感割裂。 */
/* 更新时间: 2026-07-07 14:40:00 CST  更新内容: 月度经营趋势重构数据语义——目标改为背景宽柱(淡灰紫)、回款改为前景窄柱(银紫玫瑰渐变)，完成率细线+圆点且 y 轴超 100% 自动扩展并加 100% 基准线，图例颜色与序列对齐，移除 6 月高亮，未发生月份用虚线占位。 */
/* 更新时间: 2026-07-06 10:48:16 CST  更新内容: 月度趋势按高级果味规则重排图表权重，回款用银紫渐变，目标后退，风险点保留玫瑰红。 */
/* 更新时间: 2026-07-04 01:03:12 CST  更新内容: 月度经营趋势仅突出当前 6 月柱形和轴标，其余月份继续保持低饱和。 */
/* 更新时间: 2026-07-03 23:48:36 CST  更新内容: 月度趋势回款柱统一低饱和紫色，低完成率仅在完成率点位和标签使用风险色。 */
/* 更新时间: 2026-07-03 18:54:17 CST  更新内容: 月度趋势回款柱与完成率标签按 80 以下红色、80-99 紫色、100 及以上金色三档分色。 */
/* 更新时间: 2026-07-03 18:19:59 CST  更新内容: 月度经营趋势回款柱按完成率 80% 风险线分色，危险月份直接使用风险色。 */
/* 更新时间: 2026-06-29 10:45:53  更新内容: 月度经营趋势图例改为静态说明，并将目标与回款柱重叠展示。 */
import { useMemo, useState } from 'react';
import EChart from './EChart';
import Segmented from './Segmented';
import { getChannelTrend, getDailyRevenueTrend, getYearlyTrend } from '../data/mock';
import { isRiskCompletion } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './MonthlyTrend.css';

const DIM_OPTS = [
  { value: 'year', label: '年' },
  { value: 'month', label: '月' },
  { value: 'day', label: '日' },
];

const DIM_HEADING = {
  day: { title: '每日经营趋势', sub: '本月每日回款' },
  month: { title: '月度经营趋势', sub: '回款 vs 目标 · 完成率' },
  year: { title: '年度经营趋势', sub: '回款 vs 目标 · 完成率' },
};

function completionPointColor(value, tokens) {
  return isRiskCompletion(value) ? tokens.chartRiskPoint : Number(value) >= 100 ? tokens.semanticGoal : tokens.chartRateLine;
}

// 银紫玫瑰纵向渐变：银(淡薰) → 紫 → 玫瑰
function actualBarColor(tokens) {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: tokens.accentLine },
      { offset: 0.55, color: tokens.chartActualBarBottom },
      { offset: 1, color: tokens.accentEnd },
    ],
  };
}

// 目标柱：淡灰紫（低透明），作为背景宽柱后退
function targetBarColor(tokens) {
  return tokens.chartActualBarBottom;
}

function isPlaceholderMonth(item) {
  return item == null || item.recovered == null || Number.isNaN(Number(item.recovered));
}

function buildBarTrendOption({ trend, labelKey, tokens }) {
  const months = trend.map(m => m[labelKey]);
  const target = trend.map(m => m.target);
  const recovered = trend.map(m => m.recovered);
  const completion = trend.map(m => m.completion);

  const txt = tokens.chartText;
  const muted = tokens.chartMuted;
  const faint = tokens.chartMuted;
  const line = tokens.chartGrid;

  // 完成率 y 轴：超过 100% 时按 10% 步进扩展到 110/120...，避免高点被截断
  const completionValues = completion.map(c => Number(c) || 0);
  const maxCompletion = completionValues.length ? Math.max(...completionValues) : 100;
  const rateAxisMax = Math.max(100, Math.ceil(maxCompletion / 10) * 10);

  const targetOpacity = 0.22;

  const option = {
    animation: false,
    backgroundColor: 'transparent',
    textStyle: { color: muted, fontFamily: 'inherit' },
    legend: {
      top: 0,
      left: 'center',
      selectedMode: false,
      itemWidth: 14,
      itemHeight: 10,
      itemGap: 22,
      textStyle: { color: faint, fontSize: 13 },
      data: [
        { name: '目标', icon: 'roundRect', itemStyle: { color: targetBarColor(tokens), opacity: targetOpacity } },
        { name: '回款', icon: 'roundRect', itemStyle: { color: tokens.accentEnd } },
        { name: '完成率', icon: 'circle', itemStyle: { color: tokens.chartRateLine } },
      ],
    },
    grid: { top: 40, left: 8, right: 8, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: tokens.chartTooltipBg,
      borderColor: 'rgba(190, 175, 255, 0.24)',
      borderWidth: 1,
      extraCssText: 'border-radius:16px; backdrop-filter:blur(24px) saturate(145%); -webkit-backdrop-filter:blur(24px) saturate(145%); box-shadow:0 18px 60px rgba(0,0,0,.45), 0 0 36px rgba(142,134,255,.18); padding:10px 12px;',
      textStyle: { color: txt, fontSize: 14 },
      valueFormatter: null,
      formatter: (params) => {
        const head = `<div style="color:${faint};margin-bottom:4px">${params[0].axisValue}</div>`;
        const rows = params.filter((p) => p.value != null).map((p) => {
          const v = p.seriesName === '完成率' ? `${p.value}%` : `${p.value} 万`;
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
        color: faint,
        fontSize: 13,
        fontWeight: 520,
        interval: Math.max(0, Math.ceil(months.length / 10) - 1),
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '万元',
        nameTextStyle: { color: faint, fontSize: 13, padding: [0, 0, 0, 8] },
        axisLabel: { color: faint, fontSize: 13 },
        splitLine: { lineStyle: { color: line } },
        axisLine: { show: false },
      },
      {
        type: 'value',
        name: '%',
        min: 0,
        max: rateAxisMax,
        nameTextStyle: { color: faint, fontSize: 13 },
        axisLabel: { color: faint, fontSize: 13, formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: '目标',
        type: 'bar',
        barWidth: 24,
        barCategoryGap: '42%',
        itemStyle: {
          color: targetBarColor(tokens),
          opacity: targetOpacity,
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: { disabled: true },
        data: target,
      },
      {
        name: '回款',
        type: 'bar',
        barWidth: 12,
        barGap: '-100%',
        barCategoryGap: '42%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: actualBarColor(tokens),
        },
        emphasis: { itemStyle: { color: actualBarColor(tokens) } },
        data: recovered.map((value, index) => {
          if (isPlaceholderMonth(trend[index])) {
            return {
              value: target[index],
              itemStyle: {
                color: 'transparent',
                borderColor: targetBarColor(tokens),
                borderType: 'dashed',
                borderWidth: 1,
                opacity: 0.5,
                borderRadius: [3, 3, 0, 0],
              },
            };
          }
          return { value, itemStyle: { color: actualBarColor(tokens), borderRadius: [3, 3, 0, 0] } };
        }),
      },
      {
        name: '完成率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: ({ value } = {}) => (isRiskCompletion(value) ? 8 : 5),
        lineStyle: { color: tokens.chartRateLine, width: 1.5, opacity: 0.72 },
        itemStyle: { color: ({ value } = {}) => completionPointColor(value, tokens), borderColor: tokens.chartPointBorder, borderWidth: 1.5 },
        label: {
          show: true,
          position: 'top',
          color: ({ value } = {}) => completionPointColor(value, tokens),
          fontSize: 13,
          fontWeight: ({ value } = {}) => (isRiskCompletion(value) ? 850 : 650),
          formatter: '{c}%',
        },
        markLine: {
          symbol: 'none',
          silent: true,
          label: { show: false },
          lineStyle: { color: tokens.chartRateLine, type: 'dashed', width: 1, opacity: 0.35 },
          data: [{ yAxis: 100 }],
        },
        data: completion.map((value, index) => (isPlaceholderMonth(trend[index]) ? null : value)),
      },
    ],
  };

  return option;
}

// 日视图：biz_target_monthly 没有日粒度目标，把每日回款映射成与月/年相同的 {day,target,recovered,completion}
// 形状（target/completion 置 null）后交给统一的 buildBarTrendOption，目标柱和完成率线因数据为 null 而不渲染，
// 但图例、双 Y 轴、柱状与悬浮框外壳都与月/年视图完全一致。
function buildDayTrend() {
  return getDailyRevenueTrend().map((row) => ({
    day: row.day,
    target: null,
    recovered: row.recovered,
    completion: null,
  }));
}

export default function MonthlyTrend({ channelKey = 'all' }) {
  const tokens = useThemeTokens();
  const [dim, setDim] = useState('month');

  const option = useMemo(() => {
    if (dim === 'day') return buildBarTrendOption({ trend: buildDayTrend(), labelKey: 'day', tokens });
    if (dim === 'year') return buildBarTrendOption({ trend: getYearlyTrend(), labelKey: 'year', tokens });
    return buildBarTrendOption({ trend: getChannelTrend(channelKey), labelKey: 'month', tokens });
  }, [dim, channelKey, tokens]);

  const heading = DIM_HEADING[dim] ?? DIM_HEADING.month;

  return (
    <section className="mt-panel">
      <header className="mt-head">
        <div className="mt-head-text">
          <h3 className="mt-title">{heading.title}</h3>
          <span className="mt-sub">{heading.sub}</span>
        </div>
        <Segmented options={DIM_OPTS} value={dim} onChange={setDim} />
      </header>
      <div className="mt-chart">
        <EChart option={option} style={{ height: '100%' }} />
      </div>
    </section>
  );
}
