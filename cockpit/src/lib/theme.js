/*
 Update time: 2026-07-03 18:19:59 CST
 Update content: Align fallback chart tokens with the obsidian violet/champagne palette and risk color semantics.
*/
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
  text: '#F7F8FC',
  muted: '#B9C2D4',
  faint: 'rgba(185,194,212,.62)',
  chartText: '#F7F8FC',
  chartMuted: '#B9C2D4',
  chartGrid: 'rgba(218,226,255,.085)',
  chartAxis: 'rgba(218,226,255,.34)',
  chartBar: 'rgba(139,124,255,.88)',
  chartBarMuted: 'rgba(175,166,255,.38)',
  chartBarFaint: 'rgba(148,163,184,.18)',
  chartTooltipBg: 'rgba(6,9,20,.9)',
  chartTooltipBorder: 'rgba(218,226,255,.16)',
  chartPointer: 'rgba(139,124,255,.07)',
  chartPointBorder: '#060914',
  progressMid: '#E85D75',
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
