/*
 Update time: 2026-07-02 17:08:00 CST
 Update content: Add regression coverage for the calmer Apple-inspired dark dashboard palette.
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const indexCss = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const kpiCardCss = readFileSync(new URL('./components/KpiCard.css', import.meta.url), 'utf8');
const formatSource = readFileSync(new URL('./lib/format.js', import.meta.url), 'utf8');

function darkThemeBlock() {
  const match = indexCss.match(/:root,\s*:root\[data-theme="dark"\]\{(?<body>[\s\S]*?)\n\}/);
  assert.ok(match?.groups?.body, 'dark theme block should exist');
  return match.groups.body;
}

test('uses a calmer Apple-inspired dark palette instead of neon pink and acid green', () => {
  const block = darkThemeBlock();

  assert.match(block, /--bg:#08090D;/);
  assert.match(block, /--panel:rgba\(28,30,36,\.72\);/);
  assert.match(block, /--txt:#F5F5F7;/);
  assert.match(block, /--muted:#A1A1A6;/);
  assert.match(block, /--good:#30D158;/);
  assert.match(block, /--warn:#FF375F;/);
  assert.match(block, /--progress-mid:#64D2FF;/);
  assert.doesNotMatch(block, /#dfff00/i);
  assert.doesNotMatch(block, /#ff4fd8/i);
});

test('keeps progress and delta colors aligned to system-style green, blue, and red', () => {
  assert.match(formatSource, /good:\s*'#30D158'/);
  assert.match(formatSource, /warn:\s*'#FF375F'/);
  assert.match(formatSource, /down:\s*'#64D2FF'/);
  assert.doesNotMatch(formatSource, /#dfff00/i);
  assert.doesNotMatch(formatSource, /#ff4fd8/i);
});

test('tones down background noise and recovery-card glow', () => {
  assert.match(indexCss, /\.bg \.dot-field-container\{[\s\S]*?opacity:\.36;[\s\S]*?filter:contrast\(\.86\) saturate\(\.48\)/);
  assert.match(indexCss, /\.fluid-glass-layer\{[\s\S]*?opacity:\.22;/);
  assert.match(kpiCardCss, /var\(--kpi-accent\) 10%, transparent\)/);
  assert.match(kpiCardCss, /var\(--kpi-accent\) 12%, transparent\)/);
  assert.match(kpiCardCss, /drop-shadow\(0 0 14px color-mix\(in srgb, var\(--kpi-accent\) 18%, transparent\)\)/);
});
