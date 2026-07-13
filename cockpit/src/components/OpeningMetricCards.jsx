/*
 更新时间: 2026-07-13 21:30:00 CST
 更新内容: sparkline 从固定 96px 贴右下角改为撑满卡片整行——此前卡片补上 width:100% 后变宽，
          但 sparkline 仍卡在 grid-template-columns 的 auto 窄列里，看起来又小又偏右下；viewBox 同步
          从 96 拓宽到 200 并加 preserveAspectRatio="none"，撑满时不再需要大幅非等比拉伸。
*/
/*
 更新时间: 2026-07-03 23:48:36 CST
 更新内容: 本月开户数与今日开户数卡片增加复用现有日维度数据的近 7 日 sparkline。
*/
/*
 更新时间: 2026-07-03 18:19:59 CST
 更新内容: 开户数趋势接入共享涨跌格式，下降时自动显示向下箭头和风险色。
*/
/*
 更新时间: 2026-07-03 10:59:56 CST
 更新内容: 开户数卡片接入顶部搜索命中定位，复用原搜索边框效果。
*/
/*
 更新时间: 2026-07-01 18:32:30 CST
 更新内容: 首页开户数小卡片点击时传入自身指标，打开对应开户数二级数据。
*/
import { getKpiSeries, OPENING_ACCOUNT_METRICS } from '../data/mock';
import { deltaColor, fmtDelta } from '../lib/format';
import { matchesSearchTerm } from '../lib/searchMatch';
import SearchResultBorder from './SearchResultBorder';
import './OpeningMetricCards.css';

function formatNumber(value) {
  return Number(value).toLocaleString('zh-CN');
}

function getSparklinePoints(metric) {
  return getKpiSeries(metric.metric, { dim: 'day' }).slice(-7);
}

function sparklinePath(points, width = 200, height = 32, padding = 3) {
  if (!points.length) return '';
  const values = points.map((point) => Number(point.value) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return values.map((value, index) => {
    const x = padding + (points.length === 1 ? innerWidth : (innerWidth / (points.length - 1)) * index);
    const y = padding + innerHeight - ((value - min) / span) * innerHeight;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

function Sparkline({ metric }) {
  const points = getSparklinePoints(metric);
  const path = sparklinePath(points);

  return (
    <svg
      className="opening-metric-card__sparkline"
      viewBox="0 0 200 32"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${metric.title}近 7 日开户趋势`}
      focusable="false"
    >
      <path className="opening-metric-card__sparkline-base" d={path} />
      <path className="opening-metric-card__sparkline-path" d={path} />
    </svg>
  );
}

export default function OpeningMetricCards({ searchTerm = '', onOpenSecondary }) {
  return (
    <section className="opening-metric-cards" aria-label="开户数趋势" data-anim>
      {OPENING_ACCOUNT_METRICS.map((metric) => (
        <SearchResultBorder active={matchesSearchTerm(metric.keywords, searchTerm)} key={metric.key}>
          <button
            className="opening-metric-card"
            type="button"
            onClick={() => onOpenSecondary?.(metric)}
            aria-label={`${metric.title}，点击展开二级`}
          >
            <div className="opening-metric-card__title">{metric.title}</div>
            <div className="opening-metric-card__main">
              <span className="opening-metric-card__value">{formatNumber(metric.value)}</span>
              <span className="opening-metric-card__unit">{metric.unit}</span>
            </div>
            <div className="opening-metric-card__trend">
              <span className="opening-metric-card__compare">{metric.compareLabel}</span>
              <span className="opening-metric-card__delta" style={{ color: deltaColor(metric.delta) }}>
                {fmtDelta(metric.delta)}
              </span>
            </div>
            <Sparkline metric={metric} />
            <div className="opening-metric-card__hint">点击展开二级 ▸</div>
          </button>
        </SearchResultBorder>
      ))}
    </section>
  );
}
