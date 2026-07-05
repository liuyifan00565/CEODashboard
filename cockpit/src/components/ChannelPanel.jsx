/* 更新时间: 2026-07-05 23:42:14 CST  更新内容: 渠道完成率单元格内联进度条，避免最右独立进度列造成语义分裂。 */
/* 更新时间: 2026-07-05 22:45:24 CST  更新内容: 渠道完成表移除状态列，改为按当前维度完成率展示进度条，并配合表头数值列对齐。 */
/* 更新时间: 2026-07-05 21:45:08 CST  更新内容: 渠道完成情况改为本月/年度互斥列展示，完成率固定一位小数，并移除渠道名旁重复风险标签。 */
/* 更新时间: 2026-07-05 19:10:30 CST  更新内容: 渠道完成情况改为本月与年度信息同屏展示，分段切换仅控制进度条主视角。 */
/* 更新时间: 2026-07-05 18:32:00 CST  更新内容: 渠道进度条首屏直接显示真实宽度，避免加载截图或快速查看时停留在动画起点。 */
/* 更新时间: 2026-07-05 18:20:00 CST  更新内容: 渠道完成情况改为单一列表并增加本月/年度切换与年度字段列。 */
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
import { useThemeTokens } from '../lib/theme';
import './ChannelPanel.css';

const CHANNEL_PERIOD_OPTIONS = [
  { value: 'month', label: '本月' },
  { value: 'year', label: '年度' },
];

function formatChannelAmount(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatChannelPct(value) {
  return `${Number(value).toFixed(1)}%`;
}

const CHANNEL_TABLE_COLUMNS = {
  month: [
    { key: 'monthRecovered', label: '本月完成', render: (c) => `${formatChannelAmount(c.monthRecovered)}万` },
    { key: 'monthTarget', label: '月目标', render: (c) => `${formatChannelAmount(c.monthTarget)}万` },
    { key: 'completion', label: '完成率', render: (c) => formatChannelPct(c.monthCompletion) },
    { key: 'monthGap', label: '缺口', render: (c) => `${formatChannelAmount(c.monthGap)}万` },
  ],
  year: [
    { key: 'yearRecovered', label: '年度累计', render: (c) => `${formatChannelAmount(c.yearRecovered)}万` },
    { key: 'yearTarget', label: '年度目标', render: (c) => `${formatChannelAmount(c.yearTarget)}万` },
    { key: 'completion', label: '年度完成率', render: (c) => formatChannelPct(c.yearCompletion) },
    { key: 'yearGap', label: '年度缺口', render: (c) => `${formatChannelAmount(c.yearGap)}万` },
  ],
};

export default function ChannelPanel({ channelKey = 'all', title = '渠道完成情况', showPeriodSwitch = false }) {
  const tokens = useThemeTokens();
  const [period, setPeriod] = useState('month');
  const [openKey, setOpenKey] = useState(null);
  const rows = getChannelCompletionRows(period, channelKey);
  const tableColumns = CHANNEL_TABLE_COLUMNS[period];
  const panelTitle = showPeriodSwitch
    ? (period === 'year' ? '年度渠道完成情况' : `本月${title}`)
    : title;
  const openRow = rows.find((row) => row.key === openKey);
  const members = openKey ? getSalesMemberRows(openKey) : [];

  return (
    <section className="ch-panel">
      <header className="ch-head">
        <div className="ch-head-copy">
          <span className="ch-title">{panelTitle}</span>
          <span className="ch-head-sub">单位：万元</span>
        </div>
        {showPeriodSwitch && <Segmented options={CHANNEL_PERIOD_OPTIONS} value={period} onChange={setPeriod} />}
      </header>

      <div className="ch-table-head" aria-hidden="true">
        <span>渠道</span>
        {tableColumns.map((column) => (
          <span key={column.key}>{column.label}</span>
        ))}
      </div>

      <div className="ch-list">
        {rows.map((c) => {
          const pct = period === 'year' ? c.yearCompletion : c.monthCompletion;
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
                </div>
              </div>

              {tableColumns.map((column) => (
                <span className={`ch-cell ch-cell--${column.key}`} key={column.key}>
                  {column.key === 'completion' ? (
                    <span className="ch-completion-stack">
                      <span className="ch-completion-value">{formatChannelPct(pct)}</span>
                      <span className="ch-progress-cell" aria-label={`${c.name}完成进度 ${formatChannelPct(pct)}`}>
                        <span className="ch-progress">
                          <span
                            className="ch-progress-fill"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: progressGradient(pct, tokens.progressMid),
                            }}
                          />
                        </span>
                      </span>
                    </span>
                  ) : column.render(c)}
                </span>
              ))}
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
