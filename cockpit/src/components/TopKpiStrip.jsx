/*
 更新时间: 2026-07-09 15:10:00 CST
 更新内容: 移除本月/年度目标完成率两项，避免和下方月度主卡、年度进度条里已经展示的完成率重复。
*/
/*
 更新时间: 2026-07-09 14:20:00 CST
 更新内容: 新增经营总览顶部薄 KPI 速览条，一屏汇总月度/年度完成率、续费率、广告 ROI、费比和本月开户数，并补充此前隐藏的续费率与 ROI 指标。
*/
import { KPI_DERIVED, KPI_CARDS, OPENING_ACCOUNT_METRICS } from '../data/mock';
import { isRiskCompletion, fmtDelta, deltaColor } from '../lib/format';
import './TopKpiStrip.css';

function buildItems() {
  const renewalCard = KPI_CARDS.find((card) => card.key === 'renewal');
  const monthOpenings = OPENING_ACCOUNT_METRICS.find((item) => item.metric === 'monthOpenings');

  return [
    {
      key: 'renewal-rate',
      label: '续费率',
      value: renewalCard ? `${renewalCard.value}%` : '-',
      delta: renewalCard?.delta,
      deltaHint: '环比',
      risk: renewalCard ? isRiskCompletion(renewalCard.value) : false,
    },
    {
      key: 'ad-roi',
      label: '广告 ROI',
      value: `${KPI_DERIVED.roi}x`,
      risk: false,
    },
    {
      key: 'cost-ratio',
      label: '总投入费比',
      value: `${KPI_DERIVED.costRatio}%`,
      risk: false,
    },
    {
      key: 'month-openings',
      label: '本月开户数',
      value: `${monthOpenings?.value ?? '-'}户`,
      delta: monthOpenings?.delta,
      deltaHint: monthOpenings?.compareLabel,
      risk: false,
    },
  ];
}

export default function TopKpiStrip() {
  const items = buildItems();

  return (
    <div className="kpi-strip" data-anim>
      {items.map((item) => (
        <div className={`kpi-strip-item${item.risk ? ' kpi-strip-item--risk' : ''}`} key={item.key}>
          <span className="kpi-strip-label">{item.label}</span>
          <div className="kpi-strip-value">
            <b>{item.value}</b>
            {item.delta != null && (
              <span className="kpi-strip-delta" style={{ color: deltaColor(item.delta) }}>
                {item.deltaHint ? `${item.deltaHint} ` : ''}{fmtDelta(item.delta)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
