/*
 更新时间: 2026-07-13 18:10:00 CST
 更新内容: 新增广告ROI小卡，视觉复用开户数小卡（同一套 .opening-metric-card 样式），放在首页总投入旁；
          点击复用总投入卡的成本二级弹窗，因为广告ROI 没有独立的日粒度趋势数据源。
*/
import { getAdRoiMetric } from '../data/mock';
import { deltaColor, fmtDelta } from '../lib/format';
import { matchesSearchTerm } from '../lib/searchMatch';
import SearchResultBorder from './SearchResultBorder';
import './OpeningMetricCards.css';

function formatRoiValue(value) {
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdRoiCard({ searchTerm = '', onOpen, costCard }) {
  const metric = getAdRoiMetric();

  return (
    <SearchResultBorder active={matchesSearchTerm(metric.keywords, searchTerm)}>
      <button
        className="opening-metric-card opening-metric-card--roi"
        type="button"
        onClick={() => onOpen?.(costCard)}
        aria-label={`${metric.title}，点击查看投入明细`}
      >
        <div className="opening-metric-card__title">{metric.title}</div>
        <div className="opening-metric-card__main">
          <span className="opening-metric-card__value">{formatRoiValue(metric.value)}</span>
        </div>
        <div className="opening-metric-card__trend">
          <span className="opening-metric-card__compare">{metric.compareLabel}</span>
          <span className="opening-metric-card__delta" style={{ color: deltaColor(metric.delta) }}>
            {fmtDelta(metric.delta)}
          </span>
        </div>
        <div className="opening-metric-card__hint">点击查看投入明细 ▸</div>
      </button>
    </SearchResultBorder>
  );
}
