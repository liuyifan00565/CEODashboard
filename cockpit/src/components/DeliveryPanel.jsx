/* 更新时间: 2026-07-14 10:35:00 CST  更新内容: 交付页升级为交付与运营协同看板，新增流程、工单责任和权限成本控制区块。 */
/* 更新时间: 2026-07-10 17:20:00 CST  更新内容: 交付看板目标改为运行时真实目标展示，目标未配置时不再显示写死 15 单或 0% 完成率。 */
/* 更新时间: 2026-07-08 17:06:01 CST  更新内容: 交付看板超额交付恢复为 120% 及以上才显示金色和标签，100%-119.9% 保持普通完成态。 */
/* 更新时间: 2026-07-03 23:33:15 CST  更新内容: 交付看板超额完成行新增金色背景、标签与百分比状态类。 */
/* 更新时间: 2026-07-03 23:27:50 CST  更新内容: 交付看板超额完成行保留金色完成态，并显示超额交付标签。 */
/* 更新时间: 2026-07-03 23:22:16 CST  更新内容: 交付看板超额完成行复用红色预警视觉，并显示超额交付标签。 */
/* 更新时间: 2026-07-03 18:19:59 CST  更新内容: 交付看板完成率 80% 以下时进度条、百分比和预警态统一使用风险色。 */
/* 更新时间: 2026-07-03 13:05:00  更新内容: 交付看板进度条 fill 改用 progressGradient 返回的低饱和冷色线性渐变。 */
/* 更新时间: 2026-06-29 10:45:53  更新内容: 新增交付看板，展示实施工程师交付人效、单价、金额价值和目标完成情况。 */
import { getDeliveryRows, getDeliverySummary, getDeliveryCollaborationSummary } from '../data/mock';
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
  const collaboration = getDeliveryCollaborationSummary();
  const riskWorkOrderCount = collaboration.workOrders.find((item) => item.key === 'risk')?.value ?? 0;

  return (
    <section className="dlv-panel">
      <header className="dlv-head">
        <div>
          <h3 className="dlv-title">交付与运营协同</h3>
          <span className="dlv-sub">交付流程 · 工单责任 · 权限成本 · {deliveryTargetCopy(summary)}</span>
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
        <div className="dlv-summary-cell">
          <span>风险工单</span>
          <b>{riskWorkOrderCount}<i>单</i></b>
        </div>
      </div>

      <section className="dlv-section">
        <div className="dlv-section-head">
          <h4>交付流程可视化</h4>
          <span>按客户阶段统计，并拆分直营、渠道、代理来源</span>
        </div>
        <div className="dlv-flow-grid">
          {collaboration.flowStages.map((stage) => (
            <article className={`dlv-flow-card dlv-flow-card--${stage.key}`} key={stage.key}>
              <div className="dlv-flow-top">
                <span>{stage.name}</span>
                <b>{stage.count}<i>户</i></b>
              </div>
              <div className="dlv-source-split" aria-label={`${stage.name}客户来源`}>
                <span>直营 {stage.direct}</span>
                <span>渠道 {stage.channel}</span>
                <span>代理 {stage.agent}</span>
              </div>
              <em>{stage.note}</em>
            </article>
          ))}
        </div>
      </section>

      <div className="dlv-main-grid">
        <section className="dlv-section dlv-section--engineers">
          <div className="dlv-section-head">
            <h4>交付工程师人效</h4>
            <span>平均人单量与合同金额占比</span>
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
              const contractShare = collaboration.engineerStats.find((item) => item.key === row.key)?.contractShare ?? 0;

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
                    <span>合同金额占比 <b>{contractShare}%</b></span>
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

        <aside className="dlv-side-stack">
          <section className="dlv-section">
            <div className="dlv-section-head">
              <h4>工单与责任分配</h4>
              <span>回款后派单、问题登记、风险预警与闭环管理</span>
            </div>
            <div className="dlv-workorder-grid">
              {collaboration.workOrders.map((item) => (
                <div className={`dlv-workorder dlv-workorder--${item.tone}`} key={item.key}>
                  <span>{item.label}</span>
                  <b>{item.value}<i>单</i></b>
                </div>
              ))}
            </div>
            <div className="dlv-responsibility-list">
              {collaboration.responsibility.map((item) => (
                <div className="dlv-responsibility" key={item.key}>
                  <b>{item.label}</b>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="dlv-section dlv-control-panel">
            <div className="dlv-section-head">
              <h4>权限与成本控制</h4>
              <span>高成本账号（如{collaboration.controls.highCostAccountPrice}元/年）仅开放必要录入权限</span>
            </div>
            <div className="dlv-control-grid">
              <span>高成本账号 <b>{collaboration.controls.highCostAccounts}</b></span>
              <span>授权人员 <b>{collaboration.controls.authorizedPeople}</b></span>
              <span>非必要授权 <b>{collaboration.controls.unnecessaryPeople}</b></span>
              <span>建议迁移 <b>{collaboration.controls.migrationItems}</b></span>
            </div>
            <p>{collaboration.controls.suggestion}</p>
          </section>
        </aside>
      </div>
    </section>
  );
}
