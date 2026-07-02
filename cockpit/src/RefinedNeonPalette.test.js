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

test('uses softened cyber neon semantic accents instead of the raw acid baseline', () => {
  const block = darkThemeBlock();

  assert.match(block, /--up:#f85bd6;/);
  assert.match(block, /--down:#d6f84a;/);
  assert.match(block, /--good:#d6f84a;/);
  assert.match(block, /--warn:#f85bd6;/);
  assert.match(block, /--up-rgb:248,91,214;/);
  assert.match(block, /--down-rgb:214,248,74;/);
  assert.match(block, /--good-rgb:214,248,74;/);
  assert.match(block, /--warn-rgb:248,91,214;/);

  assert.equal(COLOR.up, '#f85bd6');
  assert.equal(COLOR.down, '#d6f84a');
  assert.equal(COLOR.good, '#d6f84a');
  assert.equal(COLOR.warn, '#f85bd6');
});

test('keeps 70 percent warning progress neutral rather than blue', () => {
  const block = darkThemeBlock();

  assert.match(block, /--progress-mid:rgba\(255,255,255,\.92\);/);
  assert.match(themeSource, /progressMid:\s*'rgba\(255,255,255,\.92\)'/);
  assert.equal(progressColor(70, 'rgba(255,255,255,.92)'), 'rgba(255,255,255,.92)');
  assert.match(kpiSource, /const color = progressColor\(pct, tokens\.progressMid\);[\s\S]*?itemStyle:\s*\{ color, borderRadius: 5 \}/);
});

test('reduces ambient field and glass wash without flattening the cockpit', () => {
  assert.match(indexCss, /\.bg \.dot-field-container\{[\s\S]*?opacity:\s*\.72;[\s\S]*?filter:\s*contrast\(1\.04\) saturate\(\.82\)/);
  assert.match(indexCss, /\.fluid-glass-layer\{[\s\S]*?opacity:\s*\.32;[\s\S]*?mix-blend-mode:\s*screen;/);
  assert.match(darkThemeBlock(), /--bg-radial-a:rgba\(255,255,255,\.06\);/);
  assert.match(darkThemeBlock(), /--bg-radial-b:rgba\(255,255,255,\.045\);/);
});

test('keeps warning rows translucent instead of becoming saturated candy blocks', () => {
  assert.match(channelCss, /\.ch-row--warn\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.07\);[\s\S]*?border-color:\s*rgba\(var\(--warn-rgb\), 0\.2\);/);
  assert.match(channelCss, /\.ch-tag\s*\{[\s\S]*?background:\s*rgba\(var\(--warn-rgb\), 0\.11\);[\s\S]*?border:\s*1px solid rgba\(var\(--warn-rgb\), 0\.28\);[\s\S]*?box-shadow:\s*0 0 12px rgba\(var\(--warn-rgb\), 0\.1\);/);
});
