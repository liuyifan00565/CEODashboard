/*
 更新时间: 2026-07-03 23:32:47 CST
 更新内容: 增加交付看板超额行背景、标签和百分比必须使用金色完成态的回归测试。
*/
/*
 更新时间: 2026-07-03 23:27:28 CST
 更新内容: 调整交付看板超额完成语义，要求保留金色完成态并显示超额交付标签。
*/
/*
 更新时间: 2026-07-03 23:21:43 CST
 更新内容: 增加交付看板超额完成时复用红色预警视觉并显示超额交付标签的回归测试。
*/
/*
 更新时间: 2026-07-03 18:54:17 CST
 更新内容: 将完成率颜色回归测试调整为 80 以下红色、80-99 紫色、100 及以上金色三档。
*/
/*
 更新时间: 2026-07-03 18:50:43 CST
 更新内容: 增加目标缺口仍存在时趋势箭头必须按缺口下降语义展示的回归测试。
*/
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

test('uses red below 80, purple from 80 to 99, and gold at 100 percent or above', () => {
  assert.equal(format.progressColor(79.9, format.COLOR.good, format.COLOR.gold), format.COLOR.warn);
  assert.equal(format.progressColor(60, format.COLOR.good, format.COLOR.gold), format.COLOR.warn);
  assert.equal(format.progressColor(53.8, format.COLOR.good, format.COLOR.gold), format.COLOR.warn);
  assert.equal(format.progressGradient(79.9, '#D8D4FF'), format.COLOR.warnGradient);
  assert.equal(format.progressGradient(70, '#D8D4FF'), format.COLOR.warnGradient);
  assert.equal(format.progressColor(80, format.COLOR.good, format.COLOR.gold), format.COLOR.good);
  assert.equal(format.progressColor(99.9, format.COLOR.good, format.COLOR.gold), format.COLOR.good);
  assert.equal(format.progressGradient(80, '#D8D4FF'), format.COLOR.goodGradient);
  assert.equal(format.progressGradient(99.9, '#D8D4FF'), format.COLOR.goodGradient);
  assert.equal(format.progressColor(100, format.COLOR.good, format.COLOR.gold), format.COLOR.gold);
  assert.equal(format.progressColor(118, format.COLOR.good, format.COLOR.gold), format.COLOR.gold);
  assert.equal(format.progressGradient(100, '#D8D4FF'), format.COLOR.goldGradient);
  assert.equal(format.progressGradient(118, '#D8D4FF'), format.COLOR.goldGradient);
});

test('formats falling values and under-target gaps as risk deltas', () => {
  assert.equal(format.deltaColor(-13), format.COLOR.warn);
  assert.equal(format.fmtDelta(-13), '↓13%');
  assert.equal(format.fmtDelta(12.5), '↑12.5%');
  assert.equal(typeof format.riskAdjustedDelta, 'function');
  assert.equal(format.riskAdjustedDelta({ progress: 53.8, gap: 2680, delta: 13 }), -13);
  assert.equal(format.riskAdjustedDelta({ progress: 83.8, gap: 94, delta: 12.5 }), -12.5);
  assert.equal(format.riskAdjustedDelta({ progress: 100, gap: 0, delta: 12.5 }), 12.5);
});

test('renders recovery gap chip and its left trend chip with risk semantics', () => {
  assert.match(kpiCardSource, /import \{ fmtDelta, deltaColor, progressColor, riskAdjustedDelta, isRiskCompletion \} from '\.\.\/lib\/format';/);
  assert.match(kpiCardSource, /const metaDelta = riskAdjustedDelta\(card\);/);
  assert.match(kpiCardSource, /style=\{\{ color: deltaColor\(metaDelta\), borderColor: deltaColor\(metaDelta\) \}\}/);
  assert.match(kpiCardSource, /\{fmtDelta\(metaDelta\)\}/);
  assert.match(kpiCardSource, /className=\{`kpi-card__gap\$\{isRiskCompletion\(card\.progress\) \? ' kpi-card__gap--risk' : ''\}`\}/);
});

test('colors monthly trend recovered bars by completion tier', () => {
  assert.match(monthlyTrendSource, /import \{ COLOR, progressColor \} from '\.\.\/lib\/format';/);
  assert.match(monthlyTrendSource, /function recoveredBarColor\(completionValue, tokens\)/);
  assert.match(monthlyTrendSource, /return progressColor\(completionValue, tokens\.progressMid, tokens\.progressGold\);/);
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
  assert.equal(
    channelCompletionBarBackground({ key: 'online', completion: 100 }, '#D8D4FF'),
    format.COLOR.goldGradient
  );
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'east', completion: 70, warn: true }), true);
  assert.match(deliverySource, /const isUnderDelivery = row\.warn;/);
  assert.match(deliverySource, /const isRiskDelivery = isUnderDelivery;/);
  assert.match(deliverySource, /const deliveryProgressPctClassName = `dlv-progress-pct\$\{isRiskDelivery \? ' dlv-progress-pct--warn' : ''\}\$\{isOverDelivery \? ' dlv-progress-pct--over' : ''\}`;/);
  assert.match(deliveryCss, /\.dlv-progress-pct--warn\s*\{[\s\S]*?color:\s*var\(--warn\);/);
});

test('keeps over-target delivery rows gold and labels them as excess delivery', () => {
  assert.match(deliverySource, /import \{ progressGradient \} from '\.\.\/lib\/format';/);
  assert.match(deliverySource, /const isOverDelivery = pct > 100;/);
  assert.match(deliverySource, /const deliveryTag = isOverDelivery \? '超额交付' : isUnderDelivery \? '交付预警' : null;/);
  assert.match(deliverySource, /const deliveryRowClassName = `dlv-row\$\{isRiskDelivery \? ' dlv-row--warn' : ''\}\$\{isOverDelivery \? ' dlv-row--over' : ''\}`;/);
  assert.match(deliverySource, /const deliveryTagClassName = `dlv-tag\$\{isOverDelivery \? ' dlv-tag--over' : ''\}`;/);
  assert.match(deliverySource, /const deliveryProgressPctClassName = `dlv-progress-pct\$\{isRiskDelivery \? ' dlv-progress-pct--warn' : ''\}\$\{isOverDelivery \? ' dlv-progress-pct--over' : ''\}`;/);
  assert.match(deliverySource, /const deliveryProgressBackground = progressGradient\(pct, tokens\.progressMid\);/);
  assert.match(deliverySource, /\{deliveryTag && <span className=\{deliveryTagClassName\}>\{deliveryTag\}<\/span>\}/);
  assert.doesNotMatch(deliverySource, /COLOR\.warnGradient/);
  assert.match(deliveryCss, /\.dlv-row--over\s*\{[\s\S]*?var\(--accent-gold\)[\s\S]*?\}/);
  assert.match(deliveryCss, /\.dlv-tag--over\s*\{[\s\S]*?color:\s*var\(--accent-gold-soft\);[\s\S]*?\}/);
  assert.match(deliveryCss, /\.dlv-progress-pct--over\s*\{[\s\S]*?color:\s*var\(--accent-gold-soft\);[\s\S]*?\}/);
});

test('uses shared delta formatting in opening-account cards instead of a hardcoded up arrow', () => {
  assert.match(openingMetricSource, /import \{ deltaColor, fmtDelta \} from '\.\.\/lib\/format';/);
  assert.match(openingMetricSource, /\{fmtDelta\(metric\.delta\)\}/);
  assert.doesNotMatch(openingMetricSource, /▲ \{formatDelta\(metric\.delta\)\}/);
});
