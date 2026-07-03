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
  up: '#A79CFF',
  down: '#9EDCFF',
  good: '#8173FF',
  warn: '#FF5F88',
  txt: '#F8F7FF',
  muted: '#E7E2FF',
  line: 'rgba(255,255,255,.10)',
  axis: 'rgba(255,255,255,.45)',
  // 进度条低饱和冷紫线性渐变：达标用品牌紫→薰衣草→少量冰蓝，落后用柔和粉紫。
  goodGradient: 'linear-gradient(90deg,#8173FF 0%,#AAA0FF 56%,#D4CEFF 88%,#A8E4FF 100%)',
  warnGradient: 'linear-gradient(90deg,#E7436D 0%,#FF5F88 58%,#FF86A4 100%)',
};

// 环比涨跌颜色：>=0 粉紫，<0 冰蓝
export const deltaColor = (v) => (v >= 0 ? COLOR.up : COLOR.down);
export const deltaArrow = (v) => (v >= 0 ? '▲' : '▼');
export const fmtDelta = (v) => `${deltaArrow(v)} ${v >= 0 ? '+' : ''}${v}%`;
// progressColor 返回纯色，供 ECharts label.color 和文字 color 使用：达标档品牌紫，落后档柔和粉紫，60-80 中档保持冷白紫。
export const progressColor = (pct, midColor = '#E7E2FF') => {
  const value = Number(pct) || 0;
  if (value >= 80) return COLOR.good;
  if (value >= 60) return midColor;
  return COLOR.warn;
};
// progressGradient 返回 CSS background 可直接使用的渐变字符串，仅供进度条 fill 元素使用：达标档冰蓝渐变，落后档粉紫渐变，60-80 中档保持中性色。
export const progressGradient = (pct, midColor = COLOR.txt) => {
  const value = Number(pct) || 0;
  if (value >= 80) return COLOR.goodGradient;
  if (value >= 60) return midColor;
  return COLOR.warnGradient;
};

export const fmtWan = (v) => `${Number(v).toLocaleString('zh-CN')} 万`;
export const fmtMoney = (v) => `¥${Number(v).toLocaleString('zh-CN')}`;
export const fmtPct = (v) => `${v}%`;
