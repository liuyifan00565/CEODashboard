/*
 更新时间: 2026-07-15 10:42:00 CST
 更新内容: 移除费比大卡左侧可见“点击展开二级”文字但保留点击能力；右侧渠道百分比改为与渠道标题同排展示。
*/
/*
 更新时间: 2026-07-15 10:28:00 CST
 更新内容: 渠道费比改为一张左右分栏的大卡片，左侧展示总投入费比，右侧展示四个渠道费比，中间用竖线分隔。
*/
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

function formatMainValue(card) {
  const value = Number(card?.displayValue ?? card?.value ?? 0);
  const decimals = card?.displayDecimals ?? 0;
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatMainUnit(card) {
  const unit = card?.displayUnit ?? card?.unit ?? '';
  return unit === '%' || unit === 'x' ? unit : ` ${unit}`;
}

export default function ChannelExpenseRatioCards({ searchTerm = '', costCard, onOpen }) {
  const keywords = [
    ...(costCard?.keywords ?? []),
    ...CHANNEL_EXPENSE_RATIO.flatMap((row) => cardKeywords(row)),
  ];

  return (
    <SearchResultBorder active={matchesSearchTerm(keywords, searchTerm)}>
      <section className="channel-cost-section" aria-label="各渠道费比">
        <div className="channel-cost-card channel-cost-card--combined">
          <button
            className="channel-cost-summary"
            type="button"
            onClick={() => onOpen?.(costCard)}
            aria-label={`${costCard?.title ?? '总投入 · 费比'}，点击展开二级`}
          >
            <div className="channel-cost-card__title">{costCard?.title ?? '总投入 · 费比'}</div>
            <div className="channel-cost-card__main">
              <span className="channel-cost-card__value">{formatMainValue(costCard)}</span>
              <span className="channel-cost-card__unit">{formatMainUnit(costCard)}</span>
            </div>
            {costCard?.sub && <div className="channel-cost-summary__sub">{costCard.sub}</div>}
          </button>

          <div className="channel-cost-divider" aria-hidden="true" />

          <div className="channel-cost-channel-grid" aria-label="四个渠道费比">
            {CHANNEL_EXPENSE_RATIO.map((row) => (
              <div className={`channel-cost-channel${row.warn ? ' channel-cost-channel--warn' : ''}`} key={row.key}>
                <div className="channel-cost-channel__head">
                  <span className="channel-cost-card__title">{row.name}费比</span>
                  <span className="channel-cost-channel__ratio">
                    <span className="channel-cost-card__value">{row.costRatio}</span>
                    <span className="channel-cost-card__unit">%</span>
                  </span>
                </div>
                <div className="channel-cost-card__meta">
                  <span>{costBreakdown(row)}</span>
                <span>回款 {formatWan(row.recovered)}万</span>
              </div>
              <div className="channel-cost-card__roi">
                投入产出比 <b>{row.roi}</b>x
              </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SearchResultBorder>
  );
}
