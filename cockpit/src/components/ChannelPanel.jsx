/* 更新时间: 2026-07-05 19:10:30 CST  更新内容: 渠道完成情况改为本月与年度信息同屏展示，分段切换仅控制进度条主视角。 */
/* 更新时间: 2026-07-05 18:32:00 CST  更新内容: 渠道进度条首屏直接显示真实宽度，避免加载截图或快速查看时停留在动画起点。 */
/* 更新时间: 2026-07-05 18:20:00 CST  更新内容: 渠道完成情况改为单一列表并增加本月/年度切换与年度贡献列。 */
/* 更新时间: 2026-07-05 16:12:00 CST  更新内容: 移除年度风险预测变体，回款侧栏统一回到渠道完成情况。 */
/* 更新时间: 2026-07-03 17:51:36 CST  更新内容: 四区域渠道进度条统一紫色时同步移除 warning fill class，避免低于 80% 残留红色外发光。 */
/* 更新时间: 2026-07-03 17:50:36 CST  更新内容: 四区域渠道完成进度条回退为统一主题紫色渐变，不再按饼图分色或低于 80% 切红。 */
/* 更新时间: 2026-07-03 16:57:57 CST  更新内容: 四区域渠道完成进度条达标时改用半环图渠道色，低于 80% 时改用红色预警渐变。 */
/* 更新时间: 2026-07-03 13:05:00 CST  更新内容: 渠道面板进度条 fill 改用 progressGradient 返回的低饱和冷色线性渐变，匹配全局冰蓝/粉紫主题。 */
/* 更新时间: 2026-07-02 16:52:00 CST  更新内容: 渠道面板行箭头和弹窗关闭按钮改用统一 AppIcon 线性图标。 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import AppIcon from './AppIcon';
import Segmented from './Segmented';
import { getChannelCompletionRows, getSalesMemberRows } from '../data/mock';
import { fmtPct, fmtWan, progressGradient } from '../lib/format';
import { channelCompletionBarBackground, shouldUseChannelCompletionWarnFill } from '../lib/channelCompletionBar';
import { useThemeTokens } from '../lib/theme';
import './ChannelPanel.css';

const CHANNEL_PERIOD_OPTIONS = [
  { value: 'month', label: '本月' },
  { value: 'year', label: '年度' },
];

function formatChannelAmount(value) {
  return Number(value).toLocaleString('zh-CN');
}

export default function ChannelPanel({ channelKey = 'all', title = '渠道完成情况', showPeriodSwitch = false }) {
  const tokens = useThemeTokens();
  const [period, setPeriod] = useState('month');
  const [openKey, setOpenKey] = useState(null);
  const rows = getChannelCompletionRows(period, channelKey);
  const openRow = rows.find((row) => row.key === openKey);
  const members = openKey ? getSalesMemberRows(openKey) : [];

  return (
    <section className="ch-panel">
      <header className="ch-head">
        <div className="ch-head-copy">
          <span className="ch-title">{title}</span>
          <span className="ch-head-sub">单位：万元</span>
        </div>
        {showPeriodSwitch && <Segmented options={CHANNEL_PERIOD_OPTIONS} value={period} onChange={setPeriod} />}
      </header>

      <div className="ch-table-head" aria-hidden="true">
        <span>渠道</span>
        <span>进度</span>
        <span>本月完成</span>
        <span>月完成率</span>
        <span>年度累计</span>
        <span>年度贡献</span>
        <span>状态</span>
      </div>

      <div className="ch-list">
        {rows.map((c, i) => {
          const pct = period === 'year' ? c.yearCompletion : c.monthCompletion;
          const barW = `${Math.min(pct, 100)}%`;
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
                  {c.status === '需关注' && <span className="ch-tag">需关注</span>}
                </div>
              </div>

              <div className="ch-bar-row">
                <div className="ch-bar">
                  <div
                    className={`ch-bar-fill${shouldUseChannelCompletionWarnFill(c) ? ' ch-bar-fill--warn' : ''}`}
                    style={{
                      width: barW,
                      transitionDelay: `${i * 80}ms`,
                      background: channelCompletionBarBackground(c, tokens.progressMid),
                    }}
                  />
                </div>
                <span className="ch-pct">{fmtPct(pct)}</span>
              </div>
              <span className="ch-amount">
                <b>{formatChannelAmount(c.monthRecovered)}</b>
                <span className="ch-sep">/</span>
                {formatChannelAmount(c.monthTarget)}
              </span>
              <span className="ch-month-rate">{fmtPct(c.monthCompletion)}</span>
              <span className="ch-year-amount">
                <b>{formatChannelAmount(c.yearRecovered)}</b>
                <span className="ch-sep">/</span>
                {formatChannelAmount(c.yearTarget)}
              </span>
              <span className="ch-contribution">{fmtPct(c.annualContribution)}</span>
              <span className={`ch-status${c.status === '需关注' ? ' ch-status--warn' : ''}`}>{c.status}</span>
              <AppIcon name="chevronRight" className="ch-row-arrow" size={13} />
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
              <button type="button" className="ch-modal-close" aria-label="关闭" onClick={() => setOpenKey(null)}>
                <AppIcon name="close" size={17} />
              </button>
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
                            background: progressGradient(pct, tokens.progressMid),
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
