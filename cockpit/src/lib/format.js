/*
 Update time: 2026-07-03 18:50:43 CST
 Update content: Treat any remaining KPI target gap as a downward risk delta so gap chips never show an upward arrow.
*/
/*
 Update time: 2026-07-03 18:19:59 CST
 Update content: Rebase dashboard semantic colors on obsidian violet/champagne and make sub-80 completion, gaps, and falling deltas use risk styling.
*/
/*
 Update time: 2026-07-03 16:51:07 CST
 Update content: Deepen KPI warning completion colors from light pink to bright rose red.
*/
/*
 Update time: 2026-07-03 16:46:50 CST
 Update content: Brighten KPI completion progress good and warning colors again after visual review.
*/
/*
 Update time: 2026-07-03 16:38:48 CST
 Update content: Raise KPI completion progress brightness one step while retaining the cold-purple balance.
*/
/*
 Update time: 2026-07-03 16:32:08 CST
 Update content: Darken KPI completion progress good and warning colors while keeping the cold-purple palette.
*/
/*
 Update time: 2026-07-03 15:33:00 CST
 Update content: Update KPI semantic colors and progress gradients to the cold-purple Apple/Vision Pro brand palette.
*/
/*
 Update time: 2026-07-03 13:05:00 CST
 Update content: COLOR 语义色从荧光黄绿+霓虹粉改为冰蓝+粉紫；progressColor 在 ≥80 与 <60 档返回低饱和冷色线性渐变字符串以驱动进度条。
*/
/*
 Update time: 2026-07-03 11:35:31 CST
 Update content: Revert completion progress color split and restore the original 80 plus fluorescent yellow rule.
*/
/*
 Update time: 2026-07-02 18:16:13 CST
 Update content: Restore KPI semantic color constants to neon pink and fluorescent lime.
*/
/*
 Update time: 2026-07-02 17:09:15 CST
 Update content: Align KPI color constants with the refined softer cyber neon palette.
*/
/*
 更新时间: 2026-06-25 22:53:50
 更新内容: 完成率中档颜色支持由主题传入，避免白色主题下 60-80 完成率文字不可读。
*/
export const COLOR = {
  up: '#AFA6FF',
  down: '#E85D75',
  good: '#8B7CFF',
  warn: '#E85D75',
  txt: '#F7F8FC',
  muted: '#B9C2D4',
  line: 'rgba(218,226,255,.10)',
  axis: 'rgba(218,226,255,.34)',
  // 进度条统一语义：80% 及以上用品牌月光紫，80% 以下一律进入风险玫红。
  goodGradient: 'linear-gradient(90deg,#8B7CFF 0%,#AFA6FF 54%,#D8D4FF 82%,#8BD7FF 100%)',
  warnGradient: 'linear-gradient(90deg,#B8334B 0%,#E85D75 58%,#FF8A9A 100%)',
};

export const isRiskCompletion = (pct) => (Number(pct) || 0) < 80;

// 环比涨跌颜色：上涨用品牌月光紫，下降统一进入风险色。
export const deltaColor = (v) => (v >= 0 ? COLOR.up : COLOR.warn);
export const deltaArrow = (v) => (v >= 0 ? '↑' : '↓');
export const fmtDelta = (v) => `${deltaArrow(v)}${Math.abs(Number(v) || 0)}%`;
export const riskAdjustedDelta = ({ progress, gap, delta } = {}) => {
  if (delta == null) return null;
  void progress;
  const value = Number(delta) || 0;
  return Number(gap) > 0 ? -Math.abs(value) : value;
};

// progressColor 返回纯色，供 ECharts label.color 和文字 color 使用：80% 以下一律风险色。
export const progressColor = (pct, midColor = '#E7E2FF') => {
  void midColor;
  const value = Number(pct) || 0;
  if (value >= 80) return COLOR.good;
  return COLOR.warn;
};
// progressGradient 返回 CSS background 可直接使用的渐变字符串，仅供进度条 fill 元素使用。
export const progressGradient = (pct, midColor = COLOR.txt) => {
  void midColor;
  const value = Number(pct) || 0;
  if (value >= 80) return COLOR.goodGradient;
  return COLOR.warnGradient;
};

export const fmtWan = (v) => `${Number(v).toLocaleString('zh-CN')} 万`;
export const fmtMoney = (v) => `¥${Number(v).toLocaleString('zh-CN')}`;
export const fmtPct = (v) => `${v}%`;
