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
  up: '#ff4fd8',
  down: '#dfff00',
  good: '#dfff00',
  warn: '#ff4fd8',
  txt: '#ffffff',
  muted: '#ffffff',
  line: 'rgba(255,255,255,.10)',
  axis: 'rgba(255,255,255,.45)',
};

// 环比涨跌颜色：>=0 荧光粉，<0 荧光绿
export const deltaColor = (v) => (v >= 0 ? COLOR.up : COLOR.down);
export const deltaArrow = (v) => (v >= 0 ? '▲' : '▼');
export const fmtDelta = (v) => `${deltaArrow(v)} ${v >= 0 ? '+' : ''}${v}%`;
export const progressColor = (pct, midColor = COLOR.txt) => {
  const value = Number(pct) || 0;
  if (value >= 80) return COLOR.good;
  if (value >= 60) return midColor;
  return COLOR.up;
};

export const fmtWan = (v) => `${Number(v).toLocaleString('zh-CN')} 万`;
export const fmtMoney = (v) => `¥${Number(v).toLocaleString('zh-CN')}`;
export const fmtPct = (v) => `${v}%`;
