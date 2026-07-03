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
  assert.match(block, /--good:#7C6CFF;/);
  assert.match(block, /--warn:#F08AC3;/);
  assert.match(block, /--up-rgb:167,156,255;/);
  assert.match(block, /--down-rgb:158,220,255;/);
  assert.match(block, /--good-rgb:124,108,255;/);
  assert.match(block, /--warn-rgb:240,138,195;/);

  assert.equal(COLOR.up, '#A79CFF');
  assert.equal(COLOR.down, '#9EDCFF');
  assert.equal(COLOR.good, '#7C6CFF');
  assert.equal(COLOR.warn, '#F08AC3');
});

test('keeps 70 percent progress as cool white lavender instead of saturated blue', () => {
  const block = darkThemeBlock();

  assert.match(block, /--progress-mid:#E7E2FF;/);
  assert.match(themeSource, /progressMid:\s*'#E7E2FF'/);
  assert.equal(progressColor(70, '#E7E2FF'), '#E7E2FF');
  assert.match(kpiSource, /function progressBarColor\(pct, tokens\) \{[\s\S]*?new echarts\.graphic\.LinearGradient/);
  assert.match(kpiSource, /const labelColor = progressColor\(pct, tokens\.progressMid\);[\s\S]*?itemStyle:\s*\{ color: progressBarColor\(pct, tokens\), borderRadius: 5, shadowBlur: 6, shadowColor: labelColor \}/);
});

test('uses Color Bends as a low-opacity deep blue-black purple environment layer', () => {
  // 不再使用 DotField 点阵：App.jsx 不导入、index.css 不写 .dot-field-container 规则
  assert.doesNotMatch(appSource, /import DotField/);
  assert.doesNotMatch(appSource, /<DotField/);
  assert.doesNotMatch(indexCss, /\.bg \.dot-field-container/);
  assert.doesNotMatch(appSource, /import Silk/);
  assert.doesNotMatch(appSource, /<Silk/);

  // 深海蓝黑渐变底：#070A12 / #0B1020 / #121933
  assert.match(darkThemeBlock(), /--bg-base-1:#0B1020;/);
  assert.match(darkThemeBlock(), /--bg-base-2:#070A12;/);
  assert.match(darkThemeBlock(), /--bg-base-3:#121933;/);

  // 多层冷紫/薰衣草环境光，冰蓝只做少量边缘提亮
  assert.match(darkThemeBlock(), /--bg-radial-a:rgba\(124,108,255,\.20\);/);
  assert.match(darkThemeBlock(), /--bg-radial-b:rgba\(201,194,255,\.14\);/);
  assert.match(darkThemeBlock(), /--bg-radial-c:rgba\(143,134,255,\.16\);/);
  assert.match(darkThemeBlock(), /--bg-radial-d:rgba\(158,220,255,\.08\);/);

  // SVG 噪点叠加层
  assert.match(indexCss, /\.bg::after\{[\s\S]*?feTurbulence[\s\S]*?fractalNoise/);
  assert.match(darkThemeBlock(), /--bg-noise-opacity:\.025;/);

  // Color Bends 材质层 + 深色遮罩：App.jsx 渲染 ColorBends，index.css 提供遮罩与层叠
  assert.match(appSource, /import ColorBends from '\.\/components\/ColorBends\/ColorBends';/);
  assert.match(appSource, /<ColorBends[\s\S]*?colors=\{\['#3B3478', '#7C6CFF', '#A79CFF', '#C9C2FF'\]\}/);
  assert.match(indexCss, /\.bg-shade\{[\s\S]*?z-index:2;[\s\S]*?rgba\(7,10,18,/);
  assert.match(indexCss, /\.color-bends-layer\{[\s\S]*?z-index:1;[\s\S]*?opacity:\s*\.58;/);
});

test('keeps warning rows translucent instead of becoming saturated candy blocks', () => {
  assert.match(channelCss, /\.ch-row--warn\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.07\);[\s\S]*?border-color:\s*rgba\(var\(--warn-rgb\), 0\.2\);/);
  assert.match(channelCss, /\.ch-tag\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.11\);[\s\S]*?border:\s*1px solid rgba\(var\(--warn-rgb\), 0\.28\);[\s\S]*?box-shadow:\s*0 0 12px rgba\(var\(--warn-rgb\), 0\.1\);/);
});
