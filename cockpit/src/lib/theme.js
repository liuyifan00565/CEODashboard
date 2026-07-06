/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: 扩展主题读取层，暴露银紫玫瑰高亮、业务语义色与图表专用 token。
*/
/*
 更新时间: 2026-07-06 00:00:13 CST
 更新内容: 主题 fallback 的完成态金色同步为高级哑金。
*/
/*
 更新时间: 2026-07-05 15:29:01 CST
 更新内容: 主题 fallback 同步深灰蓝玻璃改版后的图表与提示色。
*/
/*
 Update time: 2026-07-04 01:03:12 CST
 Update content: Add restrained current-month chart tokens for the CEO dashboard trend highlight.
*/
/*
 Update time: 2026-07-03 18:54:17 CST
 Update content: Expose progressGold theme token and restore progressMid to the purple completion tier.
*/
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
  chartGrid: 'rgba(226,234,255,.070)',
  chartAxis: 'rgba(226,234,255,.28)',
  chartBar: '#8E86FF',
  chartBarCurrent: '#8E86FF',
  chartBarMuted: 'rgba(184,156,255,.22)',
  chartBarFaint: 'rgba(148,163,184,.18)',
  chartBarFaintCurrent: 'rgba(184,156,255,.16)',
  chartTooltipBg: 'rgba(9,14,28,.88)',
  chartTooltipBorder: 'rgba(255,255,255,.12)',
  chartPointer: 'rgba(184,156,255,.07)',
  chartPointBorder: '#060914',
  progressMid: '#8E86FF',
  progressGold: '#C9A96B',
  accentStart: '#8E86FF',
  accentMid: '#B89CFF',
  accentEnd: '#E4B8D7',
  accentLine: '#D9D1FF',
  accentGradientX: 'linear-gradient(90deg,#8E86FF 0%,#B89CFF 46%,#E4B8D7 100%)',
  accentGradientY: 'linear-gradient(180deg,#B89CFF 0%,#8E86FF 100%)',
  semanticRisk: '#F06A8B',
  semanticGoal: '#C9A96B',
  semanticCapacity: '#7EA7FF',
  semanticSuccessMuted: '#A6C878',
  chartActualBarTop: '#B89CFF',
  chartActualBarBottom: '#8E86FF',
  chartTargetBar: 'rgba(255,255,255,0.13)',
  chartRateLine: '#D9D1FF',
  chartRiskPoint: '#F06A8B',
  chartGoalLine: '#C9A96B',
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
    chartBarCurrent: cssVar(styles, '--chart-bar-current', FALLBACK_TOKENS.chartBarCurrent),
    chartBarMuted: cssVar(styles, '--chart-bar-muted', FALLBACK_TOKENS.chartBarMuted),
    chartBarFaint: cssVar(styles, '--chart-bar-faint', FALLBACK_TOKENS.chartBarFaint),
    chartBarFaintCurrent: cssVar(styles, '--chart-bar-faint-current', FALLBACK_TOKENS.chartBarFaintCurrent),
    chartTooltipBg: cssVar(styles, '--chart-tooltip-bg', FALLBACK_TOKENS.chartTooltipBg),
    chartTooltipBorder: cssVar(styles, '--chart-tooltip-border', FALLBACK_TOKENS.chartTooltipBorder),
    chartPointer: cssVar(styles, '--chart-pointer', FALLBACK_TOKENS.chartPointer),
    chartPointBorder: cssVar(styles, '--chart-point-border', FALLBACK_TOKENS.chartPointBorder),
    progressMid: cssVar(styles, '--progress-mid', FALLBACK_TOKENS.progressMid),
    progressGold: cssVar(styles, '--progress-gold', FALLBACK_TOKENS.progressGold),
    accentStart: cssVar(styles, '--accent-start', FALLBACK_TOKENS.accentStart),
    accentMid: cssVar(styles, '--accent-mid', FALLBACK_TOKENS.accentMid),
    accentEnd: cssVar(styles, '--accent-end', FALLBACK_TOKENS.accentEnd),
    accentLine: cssVar(styles, '--accent-line', FALLBACK_TOKENS.accentLine),
    accentGradientX: cssVar(styles, '--accent-gradient-x', FALLBACK_TOKENS.accentGradientX),
    accentGradientY: cssVar(styles, '--accent-gradient-y', FALLBACK_TOKENS.accentGradientY),
    semanticRisk: cssVar(styles, '--semantic-risk', FALLBACK_TOKENS.semanticRisk),
    semanticGoal: cssVar(styles, '--semantic-goal', FALLBACK_TOKENS.semanticGoal),
    semanticCapacity: cssVar(styles, '--semantic-capacity', FALLBACK_TOKENS.semanticCapacity),
    semanticSuccessMuted: cssVar(styles, '--semantic-success-muted', FALLBACK_TOKENS.semanticSuccessMuted),
    chartActualBarTop: cssVar(styles, '--chart-actual-bar-top', FALLBACK_TOKENS.chartActualBarTop),
    chartActualBarBottom: cssVar(styles, '--chart-actual-bar-bottom', FALLBACK_TOKENS.chartActualBarBottom),
    chartTargetBar: cssVar(styles, '--chart-target-bar', FALLBACK_TOKENS.chartTargetBar),
    chartRateLine: cssVar(styles, '--chart-rate-line', FALLBACK_TOKENS.chartRateLine),
    chartRiskPoint: cssVar(styles, '--chart-risk-point', FALLBACK_TOKENS.chartRiskPoint),
    chartGoalLine: cssVar(styles, '--chart-goal-line', FALLBACK_TOKENS.chartGoalLine),
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
