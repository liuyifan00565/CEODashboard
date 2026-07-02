/*
 更新时间: 2026-07-01 18:32:30 CST
 更新内容: 首页开户数小卡片点击时传入自身指标，打开对应开户数二级数据。
*/
import { OPENING_ACCOUNT_METRICS } from '../data/mock';
import { deltaColor } from '../lib/format';
import './OpeningMetricCards.css';

function formatNumber(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatDelta(delta) {
  return `${delta >= 0 ? '+' : ''}${delta}%`;
}

export default function OpeningMetricCards({ onOpenSecondary }) {
  return (
    <section className="opening-metric-cards" aria-label="开户数趋势" data-anim>
      {OPENING_ACCOUNT_METRICS.map((metric) => (
        <button
          className="opening-metric-card"
          key={metric.key}
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
      ))}
    </section>
  );
}
