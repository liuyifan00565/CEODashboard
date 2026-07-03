/*
 Update time: 2026-07-03 15:33:00 CST
 Update content: Align fallback chart and progress colors with the cold-purple Apple/Vision Pro palette.
*/
/*
 Update time: 2026-07-02 17:09:15 CST
 Update content: Match fallback progress tokens to the refined dark cockpit palette.
*/
/*
 更新时间: 2026-06-25 22:53:50
 更新内容: 新增主题颜色读取 hook，供 ECharts 在黑白主题切换后同步更新画布颜色。
*/
import { useEffect, useState } from 'react';

const FALLBACK_TOKENS = {
  theme: 'dark',
  text: '#F8F7FF',
  muted: '#E7E2FF',
  faint: 'rgba(231,226,255,.66)',
  chartText: '#F8F7FF',
  chartMuted: '#E7E2FF',
  chartGrid: 'rgba(201,194,255,.09)',
  chartAxis: 'rgba(231,226,255,.38)',
  chartBar: 'rgba(201,194,255,.9)',
  chartBarMuted: 'rgba(167,156,255,.42)',
  chartBarFaint: 'rgba(160,170,210,.16)',
  chartTooltipBg: 'rgba(7,10,18,.88)',
  chartTooltipBorder: 'rgba(255,255,255,.14)',
  chartPointer: 'rgba(201,194,255,.055)',
  chartPointBorder: '#070A12',
  progressMid: '#E7E2FF',
};

function cssVar(styles, name, fallback) {
  return styles.getPropertyValue(name).trim() || fallback;
}

export function readThemeTokens() {
  if (typeof document === 'undefined') return FALLBACK_TOKENS;

  const root = document.documentElement;
  const styles = getComputedStyle(root);

  return {
    theme: root.dataset.theme === 'light' ? 'light' : 'dark',
    text: cssVar(styles, '--txt', FALLBACK_TOKENS.text),
    muted: cssVar(styles, '--muted', FALLBACK_TOKENS.muted),
    faint: cssVar(styles, '--faint', FALLBACK_TOKENS.faint),
    chartText: cssVar(styles, '--chart-text', FALLBACK_TOKENS.chartText),
    chartMuted: cssVar(styles, '--chart-muted', FALLBACK_TOKENS.chartMuted),
    chartGrid: cssVar(styles, '--chart-grid', FALLBACK_TOKENS.chartGrid),
    chartAxis: cssVar(styles, '--chart-axis', FALLBACK_TOKENS.chartAxis),
    chartBar: cssVar(styles, '--chart-bar', FALLBACK_TOKENS.chartBar),
    chartBarMuted: cssVar(styles, '--chart-bar-muted', FALLBACK_TOKENS.chartBarMuted),
    chartBarFaint: cssVar(styles, '--chart-bar-faint', FALLBACK_TOKENS.chartBarFaint),
    chartTooltipBg: cssVar(styles, '--chart-tooltip-bg', FALLBACK_TOKENS.chartTooltipBg),
    chartTooltipBorder: cssVar(styles, '--chart-tooltip-border', FALLBACK_TOKENS.chartTooltipBorder),
    chartPointer: cssVar(styles, '--chart-pointer', FALLBACK_TOKENS.chartPointer),
    chartPointBorder: cssVar(styles, '--chart-point-border', FALLBACK_TOKENS.chartPointBorder),
    progressMid: cssVar(styles, '--progress-mid', FALLBACK_TOKENS.progressMid),
  };
}

export function useThemeTokens() {
  const [tokens, setTokens] = useState(readThemeTokens);

  useEffect(() => {
    const update = () => setTokens(readThemeTokens());
    const observer = new MutationObserver(update);

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('storage', update);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', update);
    };
  }, []);

  return tokens;
}
