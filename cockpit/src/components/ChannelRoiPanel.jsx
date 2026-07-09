/*
 更新时间: 2026-07-09 16:30:00 CST
 更新内容: 标签从底部独立行改为标题旁的短标签（投入产出优秀/偏低 -> 优秀/偏低），空出的高度让卡片内边距和图表更宽松。
*/
/*
 更新时间: 2026-07-09 15:50:00 CST
 更新内容: 新增渠道 ROI 分析面板，展示各渠道回款/投入产出比，对应需求文档 10.3 节里此前未落地的"渠道 ROI 分析"模块。
*/
import { CHANNEL_ROI } from '../data/mock';
import './ChannelRoiPanel.css';

function formatRoi(value) {
  return `${Number(value).toFixed(2)}x`;
}

export default function ChannelRoiPanel() {
  const maxRoi = Math.max(...CHANNEL_ROI.map((channel) => channel.roi), 0.01);

  return (
    <section className="mt-panel roi-panel">
      <header className="mt-head">
        <h3 className="mt-title">渠道 ROI 分析</h3>
        <span className="mt-sub">渠道回款 / 渠道投入</span>
      </header>

      <div className="roi-list">
        {CHANNEL_ROI.map((channel) => (
          <div
            className={`roi-row${channel.warn ? ' roi-row--warn' : ''}${channel.strong ? ' roi-row--strong' : ''}`}
            key={channel.key}
          >
            <div className="roi-row-title">
              <span className="roi-row-name">{channel.name}</span>
              {channel.warn && <span className="roi-row-tag roi-row-tag--warn">偏低</span>}
              {channel.strong && <span className="roi-row-tag roi-row-tag--strong">优秀</span>}
            </div>
            <span className="roi-row-value">{formatRoi(channel.roi)}</span>
            <div className="roi-row-track">
              <span
                className="roi-row-fill"
                style={{ width: `${Math.min(100, Math.max(4, (channel.roi / maxRoi) * 100))}%` }}
              />
            </div>
            <div className="roi-row-meta">
              <span>回款 {channel.recovered}万</span>
              <span>投入 {channel.investment}万</span>
              <span>费比 {channel.costRatio}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
