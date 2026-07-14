/*
 更新时间: 2026-07-14 14:04:11 CST
 更新内容: 新增成交来源排行面板，在趋势图旁展示真实来源净回款、成交数、客户数与贡献占比。
*/
import { CHANNEL_SOURCE_BREAKDOWN } from '../data/mock';
import { buildChannelSourceBreakdown, channelSourcePeriodLabel } from '../lib/channelSourceBreakdown';
import './ChannelSourcePanel.css';

function formatWan(value) {
  return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

export default function ChannelSourcePanel({ channelKey = 'all' }) {
  const rows = buildChannelSourceBreakdown(CHANNEL_SOURCE_BREAKDOWN, channelKey);
  const unmarked = rows.find((row) => row.name === '未标注');
  const namedRows = rows.filter((row) => row.name !== '未标注');
  const visibleRows = (namedRows.length ? namedRows : rows).slice(0, 8);

  return (
    <section className="channel-source-panel" aria-label="成交来源分析">
      <header className="channel-source-panel__head">
        <div>
          <h2>成交来源</h2>
          <p>{channelSourcePeriodLabel(rows)} · 净回款口径</p>
        </div>
        <div className="channel-source-panel__summary">
          <span>{rows.length} 个来源</span>
          {unmarked && <small>未标注 {formatWan(unmarked.recovered)} 万</small>}
        </div>
      </header>

      {visibleRows.length ? (
        <div className="channel-source-panel__list">
          {visibleRows.map((row, index) => (
            <article className="channel-source-row" key={`${row.key}-${row.name}`}>
              <div className="channel-source-row__rank">{String(index + 1).padStart(2, '0')}</div>
              <div className="channel-source-row__body">
                <div className="channel-source-row__topline">
                  <strong title={row.name}>{row.name}</strong>
                  <span>{formatWan(row.recovered)} 万</span>
                </div>
                <div className="channel-source-row__track" aria-hidden="true">
                  <span style={{ width: `${Math.max(2, row.share)}%` }} />
                </div>
                <div className="channel-source-row__meta">
                  <span>{row.dealCount} 笔成交</span>
                  <span>{row.customerCount} 个客户</span>
                  <b>{row.share.toFixed(1)}%</b>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="channel-source-panel__empty">当前渠道暂无来源数据</div>
      )}
    </section>
  );
}
