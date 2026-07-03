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
  assert.match(block, /--accent-gold:#D7B56D;/);
  assert.match(block, /--up:#AFA6FF;/);
  assert.match(block, /--down:#E85D75;/);
  assert.match(block, /--good:#8B7CFF;/);
  assert.match(block, /--warn:#E85D75;/);
  assert.match(block, /--up-rgb:175,166,255;/);
  assert.match(block, /--down-rgb:232,93,117;/);
  assert.match(block, /--good-rgb:139,124,255;/);
  assert.match(block, /--warn-rgb:232,93,117;/);
  assert.match(block, /--bar-good:linear-gradient\(90deg,#8B7CFF 0%,#AFA6FF 54%,#D8D4FF 82%,#8BD7FF 100%\);/);
  assert.match(block, /--bar-warn:linear-gradient\(90deg,#B8334B 0%,#E85D75 58%,#FF8A9A 100%\);/);

  assert.equal(COLOR.up, '#AFA6FF');
  assert.equal(COLOR.down, '#E85D75');
  assert.equal(COLOR.good, '#8B7CFF');
  assert.equal(COLOR.warn, '#E85D75');
});

test('treats 70 percent progress as risk rose instead of mid-tone lavender', () => {
  const block = darkThemeBlock();

  assert.match(block, /--progress-mid:#E85D75;/);
  assert.match(themeSource, /progressMid:\s*'#E85D75'/);
  assert.equal(progressColor(70, '#E85D75'), '#E85D75');
  assert.match(kpiSource, /function progressBarColor\(pct, tokens\) \{[\s\S]*?new echarts\.graphic\.LinearGradient/);
  assert.match(kpiSource, /const labelColor = progressColor\(pct, tokens\.progressMid\);[\s\S]*?itemStyle:\s*\{ color: progressBarColor\(pct, tokens\), borderRadius: 5, shadowBlur: 6, shadowColor: labelColor \}/);
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
  assert.match(darkThemeBlock(), /--bg:#050812;/);
  assert.match(darkThemeBlock(), /--bg-base-1:#050812;/);
  assert.match(darkThemeBlock(), /--bg-base-2:#080D18;/);
  assert.match(darkThemeBlock(), /--bg-base-3:#0B1020;/);

  // 紫色只做远处环境光，透明度上限控制在 0.16 内。
  assert.match(darkThemeBlock(), /--bg-radial-a:rgba\(139,124,255,\.14\);/);
  assert.match(darkThemeBlock(), /--bg-radial-b:rgba\(127,212,246,\.08\);/);
  assert.match(darkThemeBlock(), /--bg-radial-c:rgba\(95,75,180,\.08\);/);
  assert.match(darkThemeBlock(), /--bg-radial-d:rgba\(139,124,255,\.10\);/);

  assert.match(indexCss, /\.bg\{[\s\S]*?linear-gradient\(135deg,var\(--bg-base-1\) 0%,var\(--bg-base-2\) 48%,var\(--bg-base-3\) 100%\);/);
  assert.match(indexCss, /\.bg::before\{[\s\S]*?linear-gradient\(var\(--bg-grid-line\) 1px,transparent 1px\)[\s\S]*?radial-gradient\(var\(--bg-dot\) 1px,transparent 1\.4px\)[\s\S]*?background-size:56px 56px,56px 56px,28px 28px;/);
  assert.match(indexCss, /\.bg::before\{[\s\S]*?mask-image:radial-gradient\(circle at center,#000 0%,transparent 78%\);/);
  assert.match(darkThemeBlock(), /--bg-grid-line:rgba\(255,255,255,\.035\);/);
  assert.match(darkThemeBlock(), /--bg-dot:rgba\(255,255,255,\.032\);/);
  assert.match(darkThemeBlock(), /--bg-noise-opacity:\.035;/);
  assert.match(indexCss, /\.bg::after\{[\s\S]*?feTurbulence[\s\S]*?fractalNoise[\s\S]*?mix-blend-mode:overlay;/);
});

test('keeps warning rows translucent instead of becoming saturated candy blocks', () => {
  assert.match(channelCss, /\.ch-row--warn\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.07\);[\s\S]*?border-color:\s*rgba\(var\(--warn-rgb\), 0\.2\);/);
  assert.match(channelCss, /\.ch-tag\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.11\);[\s\S]*?border:\s*1px solid rgba\(var\(--warn-rgb\), 0\.28\);[\s\S]*?box-shadow:\s*0 0 12px rgba\(var\(--warn-rgb\), 0\.1\);/);
});
