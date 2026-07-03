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
const colorBendsSource = readFileSync(new URL('./components/ColorBends/ColorBends.jsx', import.meta.url), 'utf8');

function darkThemeBlock() {
  const match = indexCss.match(/:root,\s*:root\[data-theme="dark"\]\{(?<body>[\s\S]*?)\n\}/);
  assert.ok(match?.groups?.body, 'dark theme block should exist');
  return match.groups.body;
}

test('uses the cold purple Apple Vision Pro semantic accents', () => {
  const block = darkThemeBlock();

  assert.match(block, /--brand-purple:#7C6CFF;/);
  assert.match(block, /--brand-purple-2:#8F86FF;/);
  assert.match(block, /--brand-purple-3:#A79CFF;/);
  assert.match(block, /--brand-lavender:#C9C2FF;/);
  assert.match(block, /--brand-mist:#E7E2FF;/);
  assert.match(block, /--brand-ice:#9EDCFF;/);
  assert.match(block, /--up:#A79CFF;/);
  assert.match(block, /--down:#9EDCFF;/);
  assert.match(block, /--good:#8173FF;/);
  assert.match(block, /--warn:#FF5F88;/);
  assert.match(block, /--up-rgb:167,156,255;/);
  assert.match(block, /--down-rgb:158,220,255;/);
  assert.match(block, /--good-rgb:129,115,255;/);
  assert.match(block, /--warn-rgb:255,95,136;/);
  assert.match(block, /--bar-good:linear-gradient\(90deg,#8173FF 0%,#AAA0FF 56%,#D4CEFF 88%,#A8E4FF 100%\);/);
  assert.match(block, /--bar-warn:linear-gradient\(90deg,#E7436D 0%,#FF5F88 58%,#FF86A4 100%\);/);

  assert.equal(COLOR.up, '#A79CFF');
  assert.equal(COLOR.down, '#9EDCFF');
  assert.equal(COLOR.good, '#8173FF');
  assert.equal(COLOR.warn, '#FF5F88');
});

test('keeps 70 percent progress as cool white lavender instead of saturated blue', () => {
  const block = darkThemeBlock();

  assert.match(block, /--progress-mid:#E7E2FF;/);
  assert.match(themeSource, /progressMid:\s*'#E7E2FF'/);
  assert.equal(progressColor(70, '#E7E2FF'), '#E7E2FF');
  assert.match(kpiSource, /function progressBarColor\(pct, tokens\) \{[\s\S]*?new echarts\.graphic\.LinearGradient/);
  assert.match(kpiSource, /const labelColor = progressColor\(pct, tokens\.progressMid\);[\s\S]*?itemStyle:\s*\{ color: progressBarColor\(pct, tokens\), borderRadius: 5, shadowBlur: 6, shadowColor: labelColor \}/);
});

test('keeps Color Bends as a restrained accent layer under the 15 percent purple rule', () => {
  // 不再使用 DotField 点阵：App.jsx 不导入、index.css 不写 .dot-field-container 规则
  assert.doesNotMatch(appSource, /import DotField/);
  assert.doesNotMatch(appSource, /<DotField/);
  assert.doesNotMatch(indexCss, /\.bg \.dot-field-container/);
  assert.doesNotMatch(appSource, /import Silk/);
  assert.doesNotMatch(appSource, /<Silk/);

  // 深黑蓝渐变底：#050B17 / #030712 / #071120
  assert.match(darkThemeBlock(), /--bg-base-1:#050B17;/);
  assert.match(darkThemeBlock(), /--bg-base-2:#030712;/);
  assert.match(darkThemeBlock(), /--bg-base-3:#071120;/);
  assert.match(darkThemeBlock(), /--purple-visual-area-max:\.15;/);

  // 大面积背景只保留深色基底，紫色环境光降到低透明辅助层
  assert.match(darkThemeBlock(), /--bg-radial-a:rgba\(124,108,255,\.06\);/);
  assert.match(darkThemeBlock(), /--bg-radial-b:rgba\(201,194,255,\.045\);/);
  assert.match(darkThemeBlock(), /--bg-radial-c:rgba\(143,134,255,\.05\);/);
  assert.match(darkThemeBlock(), /--bg-radial-d:rgba\(158,220,255,\.06\);/);

  // SVG 噪点叠加层
  assert.match(indexCss, /\.bg::after\{[\s\S]*?feTurbulence[\s\S]*?fractalNoise/);
  assert.match(darkThemeBlock(), /--bg-noise-opacity:\.018;/);

  // Color Bends 材质层：保留一点品牌识别，不再成为大面积紫色背景
  assert.match(appSource, /import ColorBends from '\.\/components\/ColorBends\/ColorBends';/);
  assert.match(appSource, /<ColorBends[\s\S]*?colors=\{\['#111827', '#263247', '#4E46A5'\]\}/);
  assert.match(appSource, /speed=\{0\.18\}/);
  assert.match(appSource, /transparent=\{true\}/);
  assert.match(appSource, /iterations=\{1\}/);
  assert.match(appSource, /intensity=\{0\.45\}/);
  assert.match(appSource, /bandWidth=\{2\.4\}/);
  assert.doesNotMatch(appSource, /'#3B1A8F', '#6D28D9', '#A855F7'/);
  assert.doesNotMatch(appSource, /bg-data-scrim/);
  assert.match(indexCss, /\.bg-shade\{[\s\S]*?z-index:2;[\s\S]*?rgba\(3,7,18,/);
  assert.doesNotMatch(indexCss, /\.bg-data-scrim/);
  assert.match(indexCss, /\.color-bends-layer\{[\s\S]*?z-index:1;[\s\S]*?opacity:\s*var\(--purple-visual-area-max\);[\s\S]*?filter:brightness\(\.44\) saturate\(\.7\);/);
  assert.doesNotMatch(indexCss, /opacity:\s*\.88;[\s\S]*?filter:brightness\(\.62\) saturate\(1\.35\);/);
  assert.match(colorBendsSource, /float weightSum = 0\.0;/);
  assert.match(colorBendsSource, /sumCol \/ max\(weightSum, 0\.0001\)\) \* cover/);
  assert.doesNotMatch(colorBendsSource, /col = clamp\(sumCol, 0\.0, 1\.0\);/);
});

test('keeps warning rows translucent instead of becoming saturated candy blocks', () => {
  assert.match(channelCss, /\.ch-row--warn\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.07\);[\s\S]*?border-color:\s*rgba\(var\(--warn-rgb\), 0\.2\);/);
  assert.match(channelCss, /\.ch-tag\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.11\);[\s\S]*?border:\s*1px solid rgba\(var\(--warn-rgb\), 0\.28\);[\s\S]*?box-shadow:\s*0 0 12px rgba\(var\(--warn-rgb\), 0\.1\);/);
});
