/*
 更新时间: 2026-07-13 11:25:44 CST
 更新内容: 月度完成率趋势线配色与视觉权重断言同步为 #B9B6E8、2.8px、90% 透明度及 6px 轻外发光。
*/
/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: 新增高级果味银紫玫瑰全站配色契约测试，锁定高亮面积、用途 token 与业务语义隔离。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { COLOR, progressColor, progressGradient } from './lib/format.js';

const indexCss = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const themeSource = readFileSync(new URL('./lib/theme.js', import.meta.url), 'utf8');
const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');
const computeSource = readFileSync(new URL('./components/ComputeUsagePage.jsx', import.meta.url), 'utf8');
const maintenanceCss = readFileSync(new URL('./components/MaintenancePage.css', import.meta.url), 'utf8');
const kpiCardSource = readFileSync(new URL('./components/KpiCard.jsx', import.meta.url), 'utf8');
const versionSource = readFileSync(new URL('./components/VersionFinancePanel.jsx', import.meta.url), 'utf8');
const aiSource = readFileSync(new URL('./components/AIAnalysisWidget.jsx', import.meta.url), 'utf8');

function darkThemeBlock() {
  const match = indexCss.match(/:root,\s*:root\[data-theme="dark"\]\{(?<body>[\s\S]*?)\n\}/);
  assert.ok(match?.groups?.body, 'dark theme block should exist');
  return match.groups.body;
}

test('defines high-fruit palette tokens by usage instead of raw color names', () => {
  const block = darkThemeBlock();

  assert.match(block, /--accent-start:#8E86FF;/);
  assert.match(block, /--accent-mid:#B89CFF;/);
  assert.match(block, /--accent-end:#E4B8D7;/);
  assert.match(block, /--accent-line:#D9D1FF;/);
  assert.match(block, /--accent-gradient-x:linear-gradient\(90deg,#8E86FF 0%,#B89CFF 46%,#E4B8D7 100%\);/);
  assert.match(block, /--accent-gradient-y:linear-gradient\(180deg,#B89CFF 0%,#8E86FF 100%\);/);
  assert.match(block, /--semantic-risk:#F06A8B;/);
  assert.match(block, /--semantic-goal:#C9A96B;/);
  assert.match(block, /--semantic-capacity:#7EA7FF;/);
  assert.match(block, /--semantic-success-muted:#A6C878;/);
  assert.match(block, /--chart-actual-bar-top:#B89CFF;/);
  assert.match(block, /--chart-actual-bar-bottom:#8E86FF;/);
  assert.match(block, /--chart-target-bar:rgba\(255,255,255,0\.13\);/);
  assert.match(block, /--chart-rate-line:#B9B6E8;/);
  assert.match(block, /--chart-risk-point:#F06A8B;/);
  assert.match(block, /--chart-goal-line:#C9A96B;/);
  assert.match(block, /--chart-grid:rgba\(247,243,255,0\.08\);/);
  assert.match(block, /--control-solid:#8E86FF;/);
});

test('keeps progress colors restrained to silver-purple rose, rose risk, and champagne goal', () => {
  assert.equal(COLOR.good, '#8E86FF');
  assert.equal(COLOR.up, '#B89CFF');
  assert.equal(COLOR.warn, '#F06A8B');
  assert.equal(COLOR.gold, '#C9A96B');
  assert.equal(progressColor(70, '#8E86FF', '#C9A96B'), '#F06A8B');
  assert.equal(progressColor(80, '#8E86FF', '#C9A96B'), '#8E86FF');
  assert.equal(progressColor(100, '#8E86FF', '#C9A96B'), '#C9A96B');
  assert.equal(progressGradient(88, '#D9D1FF'), 'linear-gradient(90deg,#8E86FF 0%,#B89CFF 46%,#E4B8D7 100%)');
  assert.equal(progressGradient(72, '#D9D1FF'), 'linear-gradient(90deg,#B84E68 0%,#F06A8B 58%,#FF9EB4 100%)');
  assert.equal(progressGradient(108, '#D9D1FF'), 'linear-gradient(90deg,#8E7040 0%,#C9A96B 58%,#E3D2A4 100%)');
});

test('exposes chart and semantic tokens through the theme reader', () => {
  assert.match(themeSource, /accentStart:\s*'#8E86FF'/);
  assert.match(themeSource, /accentMid:\s*'#B89CFF'/);
  assert.match(themeSource, /accentEnd:\s*'#E4B8D7'/);
  assert.match(themeSource, /semanticRisk:\s*'#F06A8B'/);
  assert.match(themeSource, /semanticGoal:\s*'#C9A96B'/);
  assert.match(themeSource, /semanticCapacity:\s*'#7EA7FF'/);
  assert.match(themeSource, /chartActualBarTop:\s*'#B89CFF'/);
  assert.match(themeSource, /chartTargetBar:\s*'rgba\(255,255,255,0\.13\)'/);
  assert.match(themeSource, /chartRateLine:\s*'#B9B6E8'/);
});

test('monthly trend gives actual values the highest weight and pushes references back', () => {
  assert.match(monthlyTrendSource, /actualBarColor\(tokens\)/);
  assert.match(monthlyTrendSource, /targetBarColor\(tokens\)/);
  assert.match(monthlyTrendSource, /lineStyle:\s*\{[\s\S]*?color: tokens\.chartRateLine,[\s\S]*?width: 2\.8,[\s\S]*?opacity: 0\.9,[\s\S]*?shadowBlur: 6,[\s\S]*?shadowColor: 'rgba\(185, 182, 232, 0\.36\)'/);
  assert.match(monthlyTrendSource, /isRiskCompletion\(value\) \? tokens\.chartRiskPoint/);
  assert.doesNotMatch(monthlyTrendSource, /COLOR\.warn/);
  assert.doesNotMatch(monthlyTrendSource, /tokens\.chartBarMuted/);
});

test('keeps capacity blue only in compute capacity semantics and removes teal as a main visual color', () => {
  assert.match(computeSource, /const capacityColor = tokens\.semanticCapacity;/);
  assert.doesNotMatch(computeSource, /#6DD6D2/);
  assert.doesNotMatch(computeSource, /#74A7FF/);
  assert.doesNotMatch(kpiCardSource, /#6FB7D5|#50B8AA|#72D7C9|#C2F0E9/);
  assert.doesNotMatch(versionSource, /#6DD6D2|#74A7FF/);
  assert.doesNotMatch(aiSource, /'#74A7FF'/);
});

test('maintenance selected and focus states stay glassy without pure violet overlays', () => {
  assert.match(maintenanceCss, /--glass-cell-hover:\s*rgba\(184,\s*156,\s*255,\s*\.12\);/);
  assert.match(maintenanceCss, /--mnt-selected-bg:\s*rgba\(184,\s*156,\s*255,\s*\.10\);/);
  assert.match(maintenanceCss, /--mnt-selected-border:\s*rgba\(228,\s*184,\s*215,\s*\.24\);/);
  assert.doesNotMatch(maintenanceCss, /rgba\(96,\s*0,\s*255/);
});
