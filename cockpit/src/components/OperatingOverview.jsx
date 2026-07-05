/* 更新时间: 2026-07-05 18:32:00 CST  更新内容: 本月回款主数字改为静态权威值，避免截图或首屏加载时显示滚动中间态。 */
/* 更新时间: 2026-07-05 18:20:00 CST  更新内容: 新增经营总览三段融合布局，本月为主视角、年度为节奏背景、渠道为原因拆解。 */
import EChart from './EChart';
import SearchResultBorder from './SearchResultBorder';
import ChannelPanel from './ChannelPanel';
import { KPI, KPI_DERIVED, getAnnualRhythmPoints } from '../data/mock';
import { matchesSearchTerm } from '../lib/searchMatch';
import { useThemeTokens } from '../lib/theme';
import './OperatingOverview.css';

const PROGRESS_KEYWORDS = ['经营进度总览', '2026年6月经营进度', '本月回款', '月度完成率', '缺口', '风险渠道', '线下华东'];
const ANNUAL_KEYWORDS = ['年度节奏', '年度累计', '年度目标', '年度完成率', '年度缺口', '理想节奏', '线下华东回款恢复'];
const CHANNEL_KEYWORDS = ['渠道完成情况', '本月', '年度', '线上', '线下华南', '线下华东', '代理', '年度贡献', '需关注'];

function formatWan(value) {
  return Number(value).toLocaleString('zh-CN');
}

function annualRhythmOption(points, tokens) {
  return {
    backgroundColor: 'transparent',
    grid: { left: 8, right: 18, top: 18, bottom: 18, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tokens.chartTooltipBg,
      borderColor: tokens.chartTooltipBorder,
      borderWidth: 1,
      textStyle: { color: tokens.chartText, fontSize: 12 },
      formatter: (params) => {
        const item = params[0];
        return `<div style="display:grid;gap:4px">
          <span style="color:${tokens.chartMuted}">${item.axisValue}</span>
          <strong style="color:${tokens.chartText};font-size:15px">${formatWan(item.value)} 万</strong>
        </div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: points.map((point) => point.label),
      axisLine: { lineStyle: { color: tokens.chartGrid } },
      axisTick: { show: false },
      axisLabel: {
        color: ({ value }) => (value === '6月' ? tokens.chartText : tokens.chartMuted),
        fontSize: 12,
        fontWeight: ({ value }) => (value === '6月' ? 760 : 560),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: tokens.chartMuted, fontSize: 11, formatter: (value) => `${Math.round(value / 1000)}k` },
      splitLine: { lineStyle: { color: tokens.chartGrid } },
      axisLine: { show: false },
    },
    series: [{
      name: '年度节奏',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: (value, params) => (points[params.dataIndex]?.tone === 'target' ? 8 : 7),
      lineStyle: { width: 2, color: tokens.chartBarCurrent, shadowBlur: 8, shadowColor: 'rgba(139,124,255,.16)' },
      itemStyle: {
        color: (params) => (points[params.dataIndex]?.tone === 'target' ? tokens.progressGold : tokens.chartBarCurrent),
        borderColor: tokens.chartPointBorder,
        borderWidth: 1.5,
      },
      areaStyle: { color: 'rgba(139,124,255,.055)' },
      label: {
        show: true,
        position: 'top',
        color: ({ dataIndex }) => (points[dataIndex]?.tone === 'target' ? tokens.progressGold : tokens.chartText),
        fontSize: 12,
        fontWeight: 720,
        formatter: ({ value }) => `${formatWan(value)}万`,
      },
      data: points.map((point) => point.value),
    }],
  };
}

export default function OperatingOverview({ searchTerm = '' }) {
  const tokens = useThemeTokens();
  const annualPoints = getAnnualRhythmPoints();
  const annualOption = annualRhythmOption(annualPoints, tokens);
  const progressWidth = `${Math.min(KPI_DERIVED.monthCompletion, 100)}%`;

  return (
    <div className="op-overview">
      <SearchResultBorder active={matchesSearchTerm(PROGRESS_KEYWORDS, searchTerm)}>
        <section className="op-panel op-panel--progress" data-anim>
          <div className="op-progress-copy">
            <span className="op-eyebrow">经营进度总览</span>
            <h1>2026年6月经营进度</h1>
            <div className="op-hero-number">
              {formatWan(KPI.monthRecovered)}万
            </div>
            <span className="op-hero-label">本月回款</span>
            <span className="op-subtle">月度目标 {formatWan(KPI.monthTarget)}万</span>
          </div>

          <div className="op-progress-rate">
            <div className="op-rate-head">
              <span>月目标完成率</span>
              <b>{KPI_DERIVED.monthCompletion}%</b>
            </div>
            <div className="op-progress-track" aria-label={`月度完成率 ${KPI_DERIVED.monthCompletion}%`}>
              <span style={{ width: progressWidth }} />
            </div>
          </div>

          <div className="op-risk-stack">
            <div className="op-risk-card">
              <span>缺口</span>
              <b>{formatWan(KPI_DERIVED.monthGap)}万</b>
            </div>
            <div className="op-risk-card op-risk-card--warn">
              <span>风险渠道</span>
              <b>线下华东 <em>70%</em></b>
            </div>
          </div>
        </section>
      </SearchResultBorder>

      <SearchResultBorder active={matchesSearchTerm(ANNUAL_KEYWORDS, searchTerm)}>
        <section className="op-panel op-panel--annual" data-anim>
          <header className="op-section-head">
            <div>
              <span className="op-eyebrow">年度节奏</span>
              <h2>年度节奏</h2>
            </div>
            <span className="op-section-meta">1月 → 6月 → 12月目标</span>
          </header>

          <div className="op-annual-grid">
            <div className="op-metric">
              <span>年度累计回款</span>
              <b>{formatWan(KPI.yearRecovered)}万</b>
            </div>
            <div className="op-metric">
              <span>年度目标</span>
              <b>{formatWan(KPI.yearTarget)}万</b>
            </div>
            <div className="op-metric">
              <span>年度完成率</span>
              <b>{KPI_DERIVED.yearCompletion}%</b>
            </div>
            <div className="op-metric">
              <span>年度缺口</span>
              <b>{formatWan(KPI_DERIVED.yearGap)}万</b>
            </div>
          </div>

          <div className="op-annual-chart" aria-label="年度节奏轻量趋势线">
            <EChart option={annualOption} style={{ height: 170 }} />
          </div>

          <p className="op-judgement">当前年度进度低于理想节奏，需重点关注线下华东回款恢复。</p>
        </section>
      </SearchResultBorder>

      <SearchResultBorder active={matchesSearchTerm(CHANNEL_KEYWORDS, searchTerm)}>
        <div className="op-channel-wrap" data-anim>
          <ChannelPanel title="渠道完成情况" showPeriodSwitch />
        </div>
      </SearchResultBorder>
    </div>
  );
}
