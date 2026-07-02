/*
 Update time: 2026-07-02 17:12:00 CST
 Update content: Replace neon KPI status colors with calmer system-style red, blue, and green.
*/
/*
 更新时间: 2026-06-25 22:53:50
 更新内容: 完成率中档颜色支持由主题传入，避免白色主题下 60-80 完成率文字不可读。
*/
export const COLOR = {
  up: '#FF375F',
  down: '#64D2FF',
  good: '#30D158',
  warn: '#FF375F',
  txt: '#F5F5F7',
  muted: '#A1A1A6',
  line: 'rgba(245,245,247,.10)',
  axis: 'rgba(245,245,247,.28)',
};

// Keep deltas readable without using the former neon palette.
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
