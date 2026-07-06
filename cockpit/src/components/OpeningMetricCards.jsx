/*
 更新时间: 2026-07-06 14:57:00 CST
 更新内容: 开户数小卡片改为优先读取 MySQL 聚合开户数据。
*/
/*
 更新时间: 2026-07-03 10:59:56 CST
 更新内容: 开户数卡片接入顶部搜索命中定位，复用原搜索边框效果。
*/
/*
 更新时间: 2026-07-01 18:32:30 CST
 更新内容: 首页开户数小卡片点击时传入自身指标，打开对应开户数二级数据。
*/
import { getOpeningAccountMetrics } from '../data/mock';
import { deltaColor } from '../lib/format';
import { matchesSearchTerm } from '../lib/searchMatch';
import SearchResultBorder from './SearchResultBorder';
import './OpeningMetricCards.css';

function formatNumber(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatDelta(delta) {
  return `${delta >= 0 ? '+' : ''}${delta}%`;
}

export default function OpeningMetricCards({ searchTerm = '', onOpenSecondary }) {
  const metrics = getOpeningAccountMetrics();

  return (
    <section className="opening-metric-cards" aria-label="开户数趋势" data-anim>
      {metrics.map((metric) => (
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
                ▲ {formatDelta(metric.delta)}
              </span>
            </div>
            <div className="opening-metric-card__hint">点击展开二级 ▸</div>
          </button>
        </SearchResultBorder>
      ))}
    </section>
  );
}
