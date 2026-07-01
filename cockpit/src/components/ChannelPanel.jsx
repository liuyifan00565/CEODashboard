/* 更新时间: 2026-06-30 17:20:08  更新内容: 渠道完成面板支持按回款卡片传入本月/本年标题。 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSalesCompletionRows, getSalesMemberRows } from '../data/mock';
import { fmtPct, fmtWan, progressColor } from '../lib/format';
import { useThemeTokens } from '../lib/theme';
import './ChannelPanel.css';

export default function ChannelPanel({ channelKey = 'all', title = '本月渠道完成情况' }) {
  // 挂载后再写入进度条宽度，触发 CSS width 过渡填充动画
  const tokens = useThemeTokens();
  const [filled, setFilled] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  const rows = getSalesCompletionRows(channelKey);
  const openRow = rows.find((row) => row.key === openKey);
  const members = openKey ? getSalesMemberRows(openKey) : [];

  useEffect(() => {
    setFilled(false);
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, [channelKey]);

  return (
    <section className="ch-panel">
      <header className="ch-head">
        <span className="ch-title">{title}</span>
        <span className="ch-head-sub">单位：万元</span>
      </header>

      <div className="ch-list">
        {rows.map((c, i) => {
          const pct = c.completion;
          const barW = filled ? `${Math.min(pct, 100)}%` : '0%';
          return (
            <button
              type="button"
              key={c.key}
              className={`ch-row${c.warn ? ' ch-row--warn' : ''}`}
              onClick={() => setOpenKey(c.key)}
            >
              <div className="ch-row-top">
                <div className="ch-name-wrap">
                  <span className="ch-name">{c.name}</span>
                  {c.warn && <span className="ch-tag">落后预警</span>}
                </div>
                <span className="ch-amount">
                  <b>{fmtWan(c.recovered)}</b>
                  <span className="ch-sep">/</span>
                  目标 {fmtWan(c.target)}
                </span>
              </div>

              <div className="ch-bar-row">
                <div className="ch-bar">
                  <div
                    className={`ch-bar-fill${c.warn ? ' ch-bar-fill--warn' : ''}`}
                    style={{
                      width: barW,
                      transitionDelay: `${i * 80}ms`,
                      background: progressColor(pct, tokens.progressMid),
                    }}
                  />
                </div>
                <span className="ch-pct">{fmtPct(pct)}</span>
              </div>
              <span className="ch-row-arrow" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {openRow && createPortal(
        <div className="ch-modal" role="dialog" aria-modal="true" aria-label={`${openRow.name}人员完成明细`}>
          <button type="button" className="ch-modal-mask" aria-label="关闭" onClick={() => setOpenKey(null)} />
          <div className="ch-modal-card">
            <div className="ch-modal-head">
              <div>
                <h3>{openRow.name}人员完成明细</h3>
                <span>数据权限允许时展开 · 按完成率降序排列</span>
              </div>
              <button type="button" className="ch-modal-close" aria-label="关闭" onClick={() => setOpenKey(null)}>×</button>
            </div>

            <div className="ch-member-list">
              {members.map((member) => {
                const pct = member.completion;
                return (
                  <div className={`ch-member-row${pct < 80 ? ' ch-member-row--warn' : ''}`} key={member.key}>
                    <div className="ch-member-main">
                      <span className="ch-member-name">{member.name}</span>
                      <span className="ch-member-money">
                        {fmtWan(member.recovered)} / 目标 {fmtWan(member.target)}
                      </span>
                    </div>
                    <div className="ch-member-progress">
                      <div className="ch-member-bar">
                        <span
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: progressColor(pct, tokens.progressMid),
                          }}
                        />
                      </div>
                      <b>{fmtPct(pct)}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
