/* 更新时间: 2026-06-29 10:45:53  更新内容: 版本情况卡片继续按销售范围取数，配合销售分析菜单复用总览布局。 */
import { getChannelRows, getVersionRows } from '../data/mock';
import { fmtDelta, deltaColor, fmtMoney } from '../lib/format';
import './VersionFinancePanel.css';

function VersionMetric({ label, value, tone = '' }) {
  return (
    <span className={`vf-metric${tone ? ` vf-metric--${tone}` : ''}`}>
      <span className="vf-metric-label">{label}</span>
      <b className="vf-metric-value">{value}</b>
    </span>
  );
}

export default function VersionFinancePanel({ channelKey = 'all' }) {
  const versions = getVersionRows(channelKey);
  const channelName = channelKey === 'all' ? '' : getChannelRows(channelKey)[0]?.name;
  return (
    <section className="vf-panel">
      <header className="vf-head">
        <h3 className="vf-title">版本情况</h3>
        <span className="vf-head-sub">{channelName ? `${channelName} · ` : ''}{versions.length} 个版本 · 当期续费情况</span>
      </header>

      <div className="vf-versions">
        {versions.map((v) => (
          <div className="vf-version-card" key={v.key}>
            <div className="vf-version-top">
              <div>
                <h4 className="vf-version-name">{v.name}</h4>
                <span className="vf-version-price">{fmtMoney(v.price)}</span>
              </div>
              <span className="vf-version-mom" style={{ color: deltaColor(v.mom) }}>{fmtDelta(v.mom)}</span>
            </div>

            <div className="vf-version-basic">
              <VersionMetric label="套数" value={v.units} />
              <VersionMetric label="回款" value={`${v.recovered}万`} />
            </div>

            <div className="vf-renewal">
              <VersionMetric label="当期应续费金额" value={`${v.currentRenewalDue}万`} />
              <VersionMetric label="当期已续费金额" value={`${v.currentRenewalPaid}万`} tone="paid" />
              <VersionMetric label="当期续费率" value={`${v.currentRenewalRate}%`} tone={v.currentRenewalRate >= 75 ? 'good' : 'warn'} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
