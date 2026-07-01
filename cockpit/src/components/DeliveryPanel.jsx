/* 更新时间: 2026-06-29 10:45:53  更新内容: 新增交付看板，展示实施工程师交付人效、单价、金额价值和目标完成情况。 */
import { getDeliveryRows, getDeliverySummary } from '../data/mock';
import { progressColor } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './DeliveryPanel.css';

export default function DeliveryPanel() {
  const tokens = useThemeTokens();
  const rows = getDeliveryRows();
  const summary = getDeliverySummary();

  return (
    <section className="dlv-panel">
      <header className="dlv-head">
        <div>
          <h3 className="dlv-title">交付看板</h3>
          <span className="dlv-sub">实施工程师 · 知识库配置 · 15 单/月目标</span>
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
          const pct = row.completion;
          return (
            <div className={`dlv-row${row.warn ? ' dlv-row--warn' : ''}`} key={row.key}>
              <div className="dlv-row-main">
                <div>
                  <span className="dlv-name">{row.name}</span>
                  {row.warn && <span className="dlv-tag">交付预警</span>}
                </div>
                <span className="dlv-count">
                  {row.deliveredCount} 单 / 目标 {row.targetCount} 单
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
                      width: `${Math.min(pct, 100)}%`,
                      background: progressColor(pct, tokens.progressMid),
                    }}
                  />
                </div>
                <b>{pct}%</b>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
