/* 更新时间: 2026-07-10 17:20:00 CST  更新内容: 交付看板目标改为运行时真实目标展示，目标未配置时不再显示写死 15 单或 0% 完成率。 */
/* 更新时间: 2026-07-08 17:06:01 CST  更新内容: 交付看板超额交付恢复为 120% 及以上才显示金色和标签，100%-119.9% 保持普通完成态。 */
/* 更新时间: 2026-07-03 23:33:15 CST  更新内容: 交付看板超额完成行新增金色背景、标签与百分比状态类。 */
/* 更新时间: 2026-07-03 23:27:50 CST  更新内容: 交付看板超额完成行保留金色完成态，并显示超额交付标签。 */
/* 更新时间: 2026-07-03 23:22:16 CST  更新内容: 交付看板超额完成行复用红色预警视觉，并显示超额交付标签。 */
/* 更新时间: 2026-07-03 18:19:59 CST  更新内容: 交付看板完成率 80% 以下时进度条、百分比和预警态统一使用风险色。 */
/* 更新时间: 2026-07-03 13:05:00  更新内容: 交付看板进度条 fill 改用 progressGradient 返回的低饱和冷色线性渐变。 */
/* 更新时间: 2026-06-29 10:45:53  更新内容: 新增交付看板，展示实施工程师交付人效、单价、金额价值和目标完成情况。 */
import { getDeliveryRows, getDeliverySummary } from '../data/mock';
import { progressGradient } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './DeliveryPanel.css';

function deliveryTargetCopy(summary) {
  if (!summary.people) return '暂无交付人员';
  if (!summary.configuredTargetPeople) return '目标未配置';
  const target = Number(summary.targetCount) || 0;
  const targetText = Number.isInteger(target) ? target : target.toFixed(1);
  return summary.allTargetsConfigured
    ? `${targetText} 单/月目标`
    : `部分目标未配置 · ${targetText} 单/月均目标`;
}

export default function DeliveryPanel() {
  const tokens = useThemeTokens();
  const rows = getDeliveryRows();
  const summary = getDeliverySummary();

  return (
    <section className="dlv-panel">
      <header className="dlv-head">
        <div>
          <h3 className="dlv-title">交付看板</h3>
          <span className="dlv-sub">实施工程师 · 知识库配置 · {deliveryTargetCopy(summary)}</span>
        </div>
      </header>

      <div className="dlv-summary">
        <div className="dlv-summary-cell">
          <span>交付人员</span>
          <b>{summary.people}<i>人</i></b>
        </div>
        <div className="dlv-summary-cell">
          <span>人均交付单数</span>
          <b>{summary.averageCountPerPerson}<i>单</i></b>
        </div>
        <div className="dlv-summary-cell">
          <span>人均金额价值</span>
          <b>{summary.averageValuePerPerson}<i>万</i></b>
        </div>
      </div>

      <div className="dlv-list">
        {rows.map((row) => {
          const hasTarget = Number(row.targetCount) > 0;
          const pct = hasTarget ? Number(row.completion) || 0 : 0;
          const deliveryProgressPct = Number(pct) || 0;
          const isUnderDelivery = row.warn;
          const isOverDelivery = deliveryProgressPct >= 120;
          const isRiskDelivery = isUnderDelivery;
          const deliveryTag = isOverDelivery ? '超额交付' : isUnderDelivery ? '交付预警' : null;
          const deliveryRowClassName = `dlv-row${isRiskDelivery ? ' dlv-row--warn' : ''}${isOverDelivery ? ' dlv-row--over' : ''}`;
          const deliveryTagClassName = `dlv-tag${isOverDelivery ? ' dlv-tag--over' : ''}`;
          const deliveryProgressPctClassName = `dlv-progress-pct${isRiskDelivery ? ' dlv-progress-pct--warn' : ''}${isOverDelivery ? ' dlv-progress-pct--over' : ''}`;
          const deliveryVisualPct = isOverDelivery ? deliveryProgressPct : Math.min(deliveryProgressPct, 99.9);
          const deliveryProgressBackground = progressGradient(deliveryVisualPct, tokens.progressMid);

          return (
            <div className={deliveryRowClassName} key={row.key}>
              <div className="dlv-row-main">
                <div>
                  <span className="dlv-name">{row.name}</span>
                  {deliveryTag && <span className={deliveryTagClassName}>{deliveryTag}</span>}
                </div>
                <span className="dlv-count">
                  {row.deliveredCount} 单 {hasTarget ? `/ 目标 ${row.targetCount} 单` : '/ 目标未配置'}
                </span>
              </div>

              <div className="dlv-metrics">
                <span>客户均价 <b>{row.averageOrderPrice} 万</b></span>
                <span>金额价值 <b>{row.valuePerPerson} 万</b></span>
              </div>

              <div className="dlv-progress">
                <div className="dlv-bar">
                  <span
                    style={{
                      width: hasTarget ? `${Math.min(pct, 100)}%` : '0%',
                      background: deliveryProgressBackground,
                    }}
                  />
                </div>
                <b className={deliveryProgressPctClassName}>{hasTarget ? `${pct}%` : '未配置'}</b>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
