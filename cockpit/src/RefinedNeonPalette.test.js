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

test('blocks the failed Apple-style system colors from core dashboard styling', () => {
  const coreSources = [indexCss, formatSource, themeSource, kpiCss, kpiSource, channelCss].join('\n');

  for (const color of ['#30D158', '#FF375F', '#64D2FF']) {
    assert.doesNotMatch(coreSources, new RegExp(color, 'i'));
  }
});

test('uses the original neon pink and fluorescent lime semantic accents', () => {
  const block = darkThemeBlock();

  assert.match(block, /--up:#ff4fd8;/);
  assert.match(block, /--down:#dfff00;/);
  assert.match(block, /--good:#dfff00;/);
  assert.match(block, /--warn:#ff4fd8;/);
  assert.match(block, /--up-rgb:255,79,216;/);
  assert.match(block, /--down-rgb:223,255,0;/);
  assert.match(block, /--good-rgb:223,255,0;/);
  assert.match(block, /--warn-rgb:255,79,216;/);

  assert.equal(COLOR.up, '#ff4fd8');
  assert.equal(COLOR.down, '#dfff00');
  assert.equal(COLOR.good, '#dfff00');
  assert.equal(COLOR.warn, '#ff4fd8');
});

test('keeps 70 percent warning progress neutral rather than blue', () => {
  const block = darkThemeBlock();

  assert.match(block, /--progress-mid:rgba\(255,255,255,\.92\);/);
  assert.match(themeSource, /progressMid:\s*'rgba\(255,255,255,\.92\)'/);
  assert.equal(progressColor(70, 'rgba(255,255,255,.92)'), 'rgba(255,255,255,.92)');
  assert.match(kpiSource, /const color = progressColor\(pct, tokens\.progressMid\);[\s\S]*?itemStyle:\s*\{ color, borderRadius: 5 \}/);
});

test('keeps the background dot field visibly purple', () => {
  assert.match(indexCss, /\.bg \.dot-field-container\{[\s\S]*?opacity:\s*\.9;[\s\S]*?filter:\s*contrast\(1\.08\) saturate\(1\.35\)/);
  assert.match(indexCss, /\.fluid-glass-layer\{[\s\S]*?opacity:\s*\.32;[\s\S]*?mix-blend-mode:\s*screen;/);
  assert.match(darkThemeBlock(), /--bg-radial-a:rgba\(96,0,255,\.16\);/);
  assert.match(darkThemeBlock(), /--bg-radial-b:rgba\(96,0,255,\.1\);/);
  assert.match(appSource, /<DotField[\s\S]*?gradientFrom="#6000FF"[\s\S]*?gradientTo="#6000FF"[\s\S]*?glowColor="#6000FF"/);
});

test('keeps warning rows translucent instead of becoming saturated candy blocks', () => {
  assert.match(channelCss, /\.ch-row--warn\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.07\);[\s\S]*?border-color:\s*rgba\(var\(--warn-rgb\), 0\.2\);/);
  assert.match(channelCss, /\.ch-tag\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.11\);[\s\S]*?border:\s*1px solid rgba\(var\(--warn-rgb\), 0\.28\);[\s\S]*?box-shadow:\s*0 0 12px rgba\(var\(--warn-rgb\), 0\.1\);/);
});
