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
const formatSource = readFileSync(new URL('./lib/format.js', import.meta.url), 'utf8');
const themeSource = readFileSync(new URL('./lib/theme.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const kpiCss = readFileSync(new URL('./components/KpiCard.css', import.meta.url), 'utf8');
const kpiSource = readFileSync(new URL('./components/KpiCard.jsx', import.meta.url), 'utf8');
const channelCss = readFileSync(new URL('./components/ChannelPanel.css', import.meta.url), 'utf8');

function darkThemeBlock() {
  const match = indexCss.match(/:root,\s*:root\[data-theme="dark"\]\{(?<body>[\s\S]*?)\n\}/);
  assert.ok(match?.groups?.body, 'dark theme block should exist');
  return match.groups.body;
}

test('uses the ice blue and pink purple semantic accents', () => {
  const block = darkThemeBlock();

  assert.match(block, /--up:#F472B6;/);
  assert.match(block, /--down:#6EA8FF;/);
  assert.match(block, /--good:#6EA8FF;/);
  assert.match(block, /--warn:#F472B6;/);
  assert.match(block, /--up-rgb:244,114,182;/);
  assert.match(block, /--down-rgb:110,168,255;/);
  assert.match(block, /--good-rgb:110,168,255;/);
  assert.match(block, /--warn-rgb:244,114,182;/);

  assert.equal(COLOR.up, '#F472B6');
  assert.equal(COLOR.down, '#6EA8FF');
  assert.equal(COLOR.good, '#6EA8FF');
  assert.equal(COLOR.warn, '#F472B6');
});

test('keeps 70 percent warning progress neutral rather than blue', () => {
  const block = darkThemeBlock();

  assert.match(block, /--progress-mid:rgba\(255,255,255,\.92\);/);
  assert.match(themeSource, /progressMid:\s*'rgba\(255,255,255,\.92\)'/);
  assert.equal(progressColor(70, 'rgba(255,255,255,.92)'), 'rgba(255,255,255,.92)');
  assert.match(kpiSource, /const color = progressColor\(pct, tokens\.progressMid\);[\s\S]*?itemStyle:\s*\{ color, borderRadius: 5 \}/);
});

test('uses a deep blue-black glassmorphism background without dot field', () => {
  // 不再使用 DotField 点阵：App.jsx 不导入、index.css 不写 .dot-field-container 规则
  assert.doesNotMatch(appSource, /import DotField/);
  assert.doesNotMatch(appSource, /<DotField/);
  assert.doesNotMatch(indexCss, /\.bg \.dot-field-container/);

  // 深海蓝黑渐变底
  assert.match(darkThemeBlock(), /--bg-base-1:#0b1020;/);
  assert.match(darkThemeBlock(), /--bg-base-2:#080b16;/);
  assert.match(darkThemeBlock(), /--bg-base-3:#050711;/);

  // 多层冰蓝/青蓝/淡紫径向环境光
  assert.match(darkThemeBlock(), /--bg-radial-a:rgba\(110,168,255,\.22\);/);
  assert.match(darkThemeBlock(), /--bg-radial-b:rgba\(142,234,255,\.11\);/);
  assert.match(darkThemeBlock(), /--bg-radial-c:rgba\(139,124,255,\.13\);/);
  assert.match(darkThemeBlock(), /--bg-radial-d:rgba\(110,168,255,\.10\);/);

  // SVG 噪点叠加层
  assert.match(indexCss, /\.bg::after\{[\s\S]*?feTurbulence[\s\S]*?fractalNoise/);
  assert.match(darkThemeBlock(), /--bg-noise-opacity:\.035;/);

  // FluidGlass 材质层保留
  assert.match(indexCss, /\.fluid-glass-layer\{[\s\S]*?opacity:\s*\.32;[\s\S]*?mix-blend-mode:\s*screen;/);
});

test('keeps warning rows translucent instead of becoming saturated candy blocks', () => {
  assert.match(channelCss, /\.ch-row--warn\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.07\);[\s\S]*?border-color:\s*rgba\(var\(--warn-rgb\), 0\.2\);/);
  assert.match(channelCss, /\.ch-tag\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.11\);[\s\S]*?border:\s*1px solid rgba\(var\(--warn-rgb\), 0\.28\);[\s\S]*?box-shadow:\s*0 0 12px rgba\(var\(--warn-rgb\), 0\.1\);/);
});
