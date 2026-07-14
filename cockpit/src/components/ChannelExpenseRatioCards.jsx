/*
 更新时间: 2026-07-14 17:57:29 CST
 更新内容: 新增渠道费比小卡——线上按"投流费用 + 工资支出 vs 回款"统计整体盘子投入产出比，线下三个渠道
          （华南/华东/代理）不做付费投流，只按"人力成本 vs 业绩回款"计算，逻辑更简单直接。
*/
import { CHANNEL_EXPENSE_RATIO } from '../data/mock';
import { matchesSearchTerm } from '../lib/searchMatch';
import SearchResultBorder from './SearchResultBorder';
import './ChannelExpenseRatioCards.css';

function formatWan(value) {
  return Number(value).toLocaleString('zh-CN');
}

function costBreakdown(row) {
  return row.basis === 'adLabor'
    ? `投流 ${formatWan(row.adCost)}万 + 人力 ${formatWan(row.laborCost)}万`
    : `人力 ${formatWan(row.laborCost)}万`;
}

function cardKeywords(row) {
  return [row.name, `${row.name}费比`, '费比', '投入产出比', 'ROI', '渠道费比', '各渠道费比', row.basis === 'adLabor' ? '投流' : '人力成本'];
}

export default function ChannelExpenseRatioCards({ searchTerm = '' }) {
  return (
    <section className="channel-cost-section" aria-label="各渠道费比">
      <div className="channel-cost-head">
        <h2>各渠道费比</h2>
        <span>线上 = 投流 + 人力 ÷ 回款；线下 = 人力 ÷ 回款</span>
      </div>
      <div className="channel-cost-cards">
        {CHANNEL_EXPENSE_RATIO.map((row) => (
          <SearchResultBorder active={matchesSearchTerm(cardKeywords(row), searchTerm)} key={row.key}>
            <div className={`channel-cost-card${row.warn ? ' channel-cost-card--warn' : ''}`}>
              <div className="channel-cost-card__title">{row.name}费比</div>
              <div className="channel-cost-card__main">
                <span className="channel-cost-card__value">{row.costRatio}</span>
                <span className="channel-cost-card__unit">%</span>
              </div>
              <div className="channel-cost-card__meta">
                <span>{costBreakdown(row)}</span>
                <span>回款 {formatWan(row.recovered)}万</span>
              </div>
              <div className="channel-cost-card__roi">
                投入产出比 <b>{row.roi}</b>x
              </div>
            </div>
          </SearchResultBorder>
        ))}
      </div>
    </section>
  );
}
