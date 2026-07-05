/*
 更新时间: 2026-07-06 00:00:13 CST
 更新内容: 将完成态金色守卫测试改为低饱和高级哑金 token 与渐变。
*/
/*
 更新时间: 2026-07-05 21:45:08 CST
 更新内容: 渠道风险行回归测试改为保留低饱和行背景并移除重复风险标签。
*/
/*
 更新时间: 2026-07-05 15:29:01 CST
 更新内容: 守卫测试切换到提亮后的深灰蓝空间背景、轻玻璃卡片和低饱和风险色。
*/
/*
 Update time: 2026-07-04 01:03:12 CST
 Update content: Require the lower-left purple ambience to be dimmer and more diffused for the restrained CEO dashboard pass.
*/
/*
 Update time: 2026-07-03 18:54:17 CST
 Update content: Guard the red, purple, and gold completion color tiers.
*/
/*
 Update time: 2026-07-03 18:31:29 CST
 Update content: Align palette guardrails with the graphite violet champagne theme and the 80 percent risk-color rule.
*/
/*
 Update time: 2026-07-03 18:24:14 CST
 Update content: Require the dashboard background to use a restrained graphite grid/dot/noise system instead of Color Bends.
*/
/*
 Update time: 2026-07-03 17:54:24 CST
 Update content: Cap full-page purple visual area at 15% and require Color Bends to read as a muted accent layer.
*/
/*
 Update time: 2026-07-03 16:51:07 CST
 Update content: Require KPI warning completion progress accents to shift from light pink to deeper bright rose red.
*/
/*
 Update time: 2026-07-03 16:46:50 CST
 Update content: Require KPI completion progress accents to be brighter and more vivid after visual review.
*/
/*
 Update time: 2026-07-03 16:38:48 CST
 Update content: Raise KPI completion progress accent brightness one step while keeping the balanced purple-blue and rose tones.
*/
/*
 Update time: 2026-07-03 16:32:08 CST
 Update content: Require KPI completion progress accents to use deeper purple-blue and rose tones.
*/
/*
 Update time: 2026-07-03 16:58:00 CST
 Update content: Guard the slightly faster Color Bends flow and thinner purple ribbons.
*/
/*
 Update time: 2026-07-03 16:50:00 CST
 Update content: Guard Color Bends shader blending so overlapping purple ribbons do not clamp into white light.
*/
/*
 Update time: 2026-07-03 16:42:00 CST
 Update content: Guard ReactBits-like Color Bends ribbon geometry instead of a diffuse purple mist.
*/
/*
 Update time: 2026-07-03 16:30:00 CST
 Update content: Guard the revised Color Bends balance: page-wide penetration with reduced brightness and preserved purple saturation.
*/
/*
 Update time: 2026-07-03 16:18:00 CST
 Update content: Guard that visible Color Bends is kept behind a dashboard data readability scrim instead of washing through cards.
*/
/*
 Update time: 2026-07-03 16:02:00 CST
 Update content: Guard the visible high-presence Color Bends ribbon layer after the reference component feedback.
*/
/*
 Update time: 2026-07-03 15:24:00 CST
 Update content: Guard the confirmed cold-purple Apple/Vision Pro palette, Color Bends environment layer, and muted glass progress colors.
*/
/*
 Update time: 2026-07-03 13:42:00 CST
 Update content: 守卫测试改为断言深海蓝黑玻璃背景（无点阵、多层径向光、SVG 噪点）。
*/
/*
 Update time: 2026-07-03 13:05:00 CST
 Update content: 将守卫测试从荧光黄绿+霓虹粉改为冰蓝+粉紫新主题；移除对 Apple 系统蓝 #64D2FF 的封禁（新主题方向即 Apple 风格冰蓝）。
*/
/*
 Update time: 2026-07-03 11:35:31 CST
 Update content: Remove yellow-tier completion progress guardrail after restoring the original 80 plus fluorescent yellow rule.
*/
/*
 Update time: 2026-07-02 18:16:13 CST
 Update content: Restore palette guardrails to the original pink, fluorescent lime, and purple dot field.
*/
/*
 Update time: 2026-07-02 17:09:15 CST
 Update content: Add palette guardrails for the refined cyber neon dashboard pass.
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLOR, progressColor } from './lib/format.js';

const indexCss = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const themeSource = readFileSync(new URL('./lib/theme.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const kpiSource = readFileSync(new URL('./components/KpiCard.jsx', import.meta.url), 'utf8');
const channelCss = readFileSync(new URL('./components/ChannelPanel.css', import.meta.url), 'utf8');

function darkThemeBlock() {
  const match = indexCss.match(/:root,\s*:root\[data-theme="dark"\]\{(?<body>[\s\S]*?)\n\}/);
  assert.ok(match?.groups?.body, 'dark theme block should exist');
  return match.groups.body;
}

test('uses the graphite violet champagne semantic accents', () => {
  const block = darkThemeBlock();

  assert.match(block, /--brand-purple:#8B7CFF;/);
  assert.match(block, /--brand-purple-2:#AFA6FF;/);
  assert.match(block, /--brand-purple-3:#D8D4FF;/);
  assert.match(block, /--brand-lavender:#D8D4FF;/);
  assert.match(block, /--brand-mist:#F7F8FC;/);
  assert.match(block, /--brand-ice:#8BD7FF;/);
  assert.match(block, /--accent-gold:#B7A06C;/);
  assert.match(block, /--up:#AFA6FF;/);
  assert.match(block, /--down:#D86A82;/);
  assert.match(block, /--good:#8B7CFF;/);
  assert.match(block, /--warn:#D86A82;/);
  assert.match(block, /--up-rgb:175,166,255;/);
  assert.match(block, /--down-rgb:216,106,130;/);
  assert.match(block, /--good-rgb:139,124,255;/);
  assert.match(block, /--warn-rgb:216,106,130;/);
  assert.match(block, /--bar-good:linear-gradient\(90deg,#8B7CFF 0%,#AFA6FF 54%,#D8D4FF 82%,#8BD7FF 100%\);/);
  assert.match(block, /--bar-warn:linear-gradient\(90deg,#A94F62 0%,#D86A82 58%,#E7A0AE 100%\);/);
  assert.match(block, /--bar-gold:linear-gradient\(90deg,#7E6B49 0%,#B7A06C 58%,#D6C49A 100%\);/);

  assert.equal(COLOR.up, '#AFA6FF');
  assert.equal(COLOR.down, '#D86A82');
  assert.equal(COLOR.good, '#8B7CFF');
  assert.equal(COLOR.warn, '#D86A82');
  assert.equal(COLOR.gold, '#B7A06C');
});

test('maps completion progress to red below 80, purple through 99, and gold at target', () => {
  const block = darkThemeBlock();

  assert.match(block, /--progress-mid:#8B7CFF;/);
  assert.match(block, /--progress-gold:#B7A06C;/);
  assert.match(themeSource, /progressMid:\s*'#8B7CFF'/);
  assert.match(themeSource, /progressGold:\s*'#B7A06C'/);
  assert.equal(progressColor(70, '#8B7CFF', '#B7A06C'), '#D86A82');
  assert.equal(progressColor(80, '#8B7CFF', '#B7A06C'), '#8B7CFF');
  assert.equal(progressColor(99.9, '#8B7CFF', '#B7A06C'), '#8B7CFF');
  assert.equal(progressColor(100, '#8B7CFF', '#B7A06C'), '#B7A06C');
  assert.match(kpiSource, /function progressBarColor\(pct, tokens\) \{[\s\S]*?new echarts\.graphic\.LinearGradient/);
  assert.match(kpiSource, /const labelColor = progressColor\(pct, tokens\.progressMid, tokens\.progressGold\);[\s\S]*?itemStyle:\s*\{ color: progressBarColor\(pct, tokens\), borderRadius: 5, shadowBlur: 6, shadowColor: labelColor \}/);
});

test('uses a static graphite grid and dot background instead of Color Bends', () => {
  // 不再使用动态渐变背景：Color Bends/Aurora 退场，回到克制网格与点阵。
  assert.doesNotMatch(appSource, /import ColorBends/);
  assert.doesNotMatch(appSource, /<ColorBends/);
  assert.doesNotMatch(appSource, /className="color-bends-layer"/);
  assert.doesNotMatch(appSource, /className="bg-shade"/);
  assert.doesNotMatch(appSource, /import DotField/);
  assert.doesNotMatch(appSource, /<DotField/);
  assert.doesNotMatch(indexCss, /\.bg \.dot-field-container/);
  assert.doesNotMatch(appSource, /import Silk/);
  assert.doesNotMatch(appSource, /<Silk/);
  assert.doesNotMatch(indexCss, /\n\.color-bends-layer/);
  assert.doesNotMatch(indexCss, /\n\.bg-shade/);

  // 深石墨黑蓝底：不能是纯黑，也不能让紫色成为主视觉。
  assert.match(darkThemeBlock(), /--bg:#0B1020;/);
  assert.match(darkThemeBlock(), /--bg-base-1:#0D1324;/);
  assert.match(darkThemeBlock(), /--bg-base-2:#0B1020;/);
  assert.match(darkThemeBlock(), /--bg-base-3:#070B14;/);
  assert.match(darkThemeBlock(), /--dashboard-card-bg:rgba\(255,\s*255,\s*255,\s*0\.052\);/);
  assert.match(darkThemeBlock(), /--dashboard-card-border:rgba\(255,\s*255,\s*255,\s*0\.10\);/);

  // 紫色只做远处环境光，左下光晕更低透明、更大扩散，不能成为视觉主角。
  assert.match(darkThemeBlock(), /--bg-radial-a:rgba\(124,92,255,\.16\);/);
  assert.match(darkThemeBlock(), /--bg-radial-b:rgba\(88,166,255,\.10\);/);
  assert.match(darkThemeBlock(), /--bg-radial-c:rgba\(118,154,206,\.055\);/);
  assert.match(darkThemeBlock(), /--bg-radial-d:rgba\(139,124,255,\.045\);/);

  assert.match(indexCss, /\.bg\{[\s\S]*?linear-gradient\(180deg,var\(--bg-base-1\) 0%,var\(--bg-base-2\) 48%,var\(--bg-base-3\) 100%\);/);
  assert.match(indexCss, /\.bg::before\{[\s\S]*?linear-gradient\(var\(--bg-grid-line\) 1px,transparent 1px\)[\s\S]*?radial-gradient\(var\(--bg-dot\) 1px,transparent 1\.4px\)[\s\S]*?background-size:56px 56px,56px 56px,28px 28px;/);
  assert.match(indexCss, /\.bg::before\{[\s\S]*?mask-image:radial-gradient\(circle at center,#000 0%,transparent 78%\);/);
  assert.match(indexCss, /\.bg::after\{[\s\S]*?radial-gradient\(ellipse at 10% 78%,var\(--bg-radial-d\),transparent 34%\)/);
  assert.match(darkThemeBlock(), /--bg-grid-line:rgba\(255,255,255,\.030\);/);
  assert.match(darkThemeBlock(), /--bg-dot:rgba\(255,255,255,\.028\);/);
  assert.match(darkThemeBlock(), /--bg-noise-opacity:\.03;/);
  assert.match(indexCss, /\.bg::after\{[\s\S]*?feTurbulence[\s\S]*?fractalNoise[\s\S]*?mix-blend-mode:overlay;/);
});

test('keeps warning rows translucent instead of becoming saturated candy blocks', () => {
  assert.match(channelCss, /\.ch-row--warn\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.055\);[\s\S]*?border-color:\s*rgba\(var\(--warn-rgb\), 0\.18\);/);
  assert.doesNotMatch(channelCss, /\.ch-tag\s*\{/);
});
