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
  up: '#F472B6',
  down: '#6EA8FF',
  good: '#6EA8FF',
  warn: '#F472B6',
  txt: '#ffffff',
  muted: '#ffffff',
  line: 'rgba(255,255,255,.10)',
  axis: 'rgba(255,255,255,.45)',
  // 进度条低饱和冷色线性渐变：达标用冰蓝→青蓝，落后用粉紫→粉橙
  goodGradient: 'linear-gradient(90deg,#6EA8FF,#8EEAFF)',
  warnGradient: 'linear-gradient(90deg,#F472B6,#FDA4AF)',
};

// 环比涨跌颜色：>=0 粉紫，<0 冰蓝
export const deltaColor = (v) => (v >= 0 ? COLOR.up : COLOR.down);
export const deltaArrow = (v) => (v >= 0 ? '▲' : '▼');
export const fmtDelta = (v) => `${deltaArrow(v)} ${v >= 0 ? '+' : ''}${v}%`;
// progressColor 返回纯色，供 ECharts itemStyle/label.color 和文字 color 使用：达标档冰蓝，落后档粉紫，60-80 中档保持中性色。
export const progressColor = (pct, midColor = COLOR.txt) => {
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
