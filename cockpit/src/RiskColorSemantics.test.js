/*
 更新时间: 2026-07-03 18:19:59 CST
 更新内容: 增加整体高级配色与风险色语义回归测试，锁定 80% 以下、缺口与下降指标使用统一风险色。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as format from './lib/format.js';
import {
  channelCompletionBarBackground,
  shouldUseChannelCompletionWarnFill,
} from './lib/channelCompletionBar.js';

const indexCss = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const kpiCardSource = readFileSync(new URL('./components/KpiCard.jsx', import.meta.url), 'utf8');
const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');
const deliverySource = readFileSync(new URL('./components/DeliveryPanel.jsx', import.meta.url), 'utf8');
const deliveryCss = readFileSync(new URL('./components/DeliveryPanel.css', import.meta.url), 'utf8');
const openingMetricSource = readFileSync(new URL('./components/OpeningMetricCards.jsx', import.meta.url), 'utf8');

test('uses the obsidian graphite violet and champagne palette tokens', () => {
  assert.match(indexCss, /--bg:#050812;/);
  assert.match(indexCss, /--bg-base-1:#050812;/);
  assert.match(indexCss, /--bg-base-2:#080D18;/);
  assert.match(indexCss, /--bg-base-3:#0B1020;/);
  assert.match(indexCss, /--brand-purple:#8B7CFF;/);
  assert.match(indexCss, /--brand-purple-2:#AFA6FF;/);
  assert.match(indexCss, /--brand-lavender:#D8D4FF;/);
  assert.match(indexCss, /--control-solid:#D7B56D;/);
  assert.match(indexCss, /--warn:#E85D75;/);
  assert.match(indexCss, /--warn-rgb:232,93,117;/);
});

test('treats every completion below 80 percent as risk', () => {
  assert.equal(format.progressColor(79.9, '#D8D4FF'), format.COLOR.warn);
  assert.equal(format.progressColor(60, '#D8D4FF'), format.COLOR.warn);
  assert.equal(format.progressColor(53.8, '#D8D4FF'), format.COLOR.warn);
  assert.equal(format.progressGradient(79.9, '#D8D4FF'), format.COLOR.warnGradient);
  assert.equal(format.progressGradient(70, '#D8D4FF'), format.COLOR.warnGradient);
  assert.equal(format.progressColor(80, '#D8D4FF'), format.COLOR.good);
  assert.equal(format.progressGradient(80, '#D8D4FF'), format.COLOR.goodGradient);
});

test('formats falling values and under-target gaps as risk deltas', () => {
  assert.equal(format.deltaColor(-13), format.COLOR.warn);
  assert.equal(format.fmtDelta(-13), '↓13%');
  assert.equal(format.fmtDelta(12.5), '↑12.5%');
  assert.equal(typeof format.riskAdjustedDelta, 'function');
  assert.equal(format.riskAdjustedDelta({ progress: 53.8, gap: 2680, delta: 13 }), -13);
  assert.equal(format.riskAdjustedDelta({ progress: 83.8, gap: 94, delta: 12.5 }), 12.5);
});

test('renders recovery gap chip and its left trend chip with risk semantics', () => {
  assert.match(kpiCardSource, /import \{ fmtDelta, deltaColor, progressColor, riskAdjustedDelta, isRiskCompletion \} from '\.\.\/lib\/format';/);
  assert.match(kpiCardSource, /const metaDelta = riskAdjustedDelta\(card\);/);
  assert.match(kpiCardSource, /style=\{\{ color: deltaColor\(metaDelta\), borderColor: deltaColor\(metaDelta\) \}\}/);
  assert.match(kpiCardSource, /\{fmtDelta\(metaDelta\)\}/);
  assert.match(kpiCardSource, /className=\{`kpi-card__gap\$\{isRiskCompletion\(card\.progress\) \? ' kpi-card__gap--risk' : ''\}`\}/);
});

test('colors monthly trend recovered bars by completion risk', () => {
  assert.match(monthlyTrendSource, /import \{ COLOR, progressColor, isRiskCompletion \} from '\.\.\/lib\/format';/);
  assert.match(monthlyTrendSource, /function recoveredBarColor\(completionValue, tokens\)/);
  assert.match(monthlyTrendSource, /data:\s*recovered\.map\(\(value, index\) => \(\{[\s\S]*?value,[\s\S]*?itemStyle:\s*\{[\s\S]*?color:\s*recoveredBarColor\(completion\[index\], tokens\)/);
  assert.doesNotMatch(monthlyTrendSource, /data:\s*recovered,\s*\n\s*\}/);
});

test('keeps channel and delivery progress bars on the same risk rule', () => {
  assert.equal(
    channelCompletionBarBackground({ key: 'east', completion: 70 }, '#D8D4FF'),
    format.COLOR.warnGradient
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'agent', completion: 79.9 }, '#D8D4FF'),
    format.COLOR.warnGradient
  );
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'east', completion: 70, warn: true }), true);
  assert.match(deliverySource, /className=\{`dlv-progress-pct\$\{pct < 80 \? ' dlv-progress-pct--warn' : ''\}`\}/);
  assert.match(deliveryCss, /\.dlv-progress-pct--warn\s*\{[\s\S]*?color:\s*var\(--warn\);/);
});

test('uses shared delta formatting in opening-account cards instead of a hardcoded up arrow', () => {
  assert.match(openingMetricSource, /import \{ deltaColor, fmtDelta \} from '\.\.\/lib\/format';/);
  assert.match(openingMetricSource, /\{fmtDelta\(metric\.delta\)\}/);
  assert.doesNotMatch(openingMetricSource, /▲ \{formatDelta\(metric\.delta\)\}/);
});
