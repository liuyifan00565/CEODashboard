/*
 更新时间: 2026-07-07 15:50:00 CST
 更新内容: 月度趋势风险语义测试同步新结构——目标背景宽柱(淡灰紫低透明)、回款前景窄柱(银紫玫瑰渐变)、完成率细线+圆点且 y 轴超 100% 自动扩展并加 100% 基准线，移除 6 月高亮相关断言。
*/
/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: 风险语义测试同步银紫玫瑰主高亮、玫瑰风险、香槟目标与月度趋势图表专用 token。
*/
/*
 更新时间: 2026-07-06 00:06:58 CST
 更新内容: 超额交付行金色背景与边框守卫改为更淡的哑金比例。
*/
/*
 更新时间: 2026-07-06 00:00:13 CST
 更新内容: 风险语义测试同步完成态高级哑金主色。
*/
/*
 更新时间: 2026-07-05 15:29:01 CST
 更新内容: 风险与背景回归测试切换到柔和深灰蓝玻璃主题和低饱和玫瑰风险色。
*/
/*
 更新时间: 2026-07-04 01:03:12 CST
 更新内容: 月度趋势风险语义允许 6 月用同一紫色体系高亮，风险色仍只用于完成率点位和标签。
*/
/*
 更新时间: 2026-07-03 23:48:36 CST
 更新内容: 月度趋势风险语义改为回款柱统一低饱和紫色，低完成率仅在点位和标签使用风险色。
*/
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

test('uses the softened graphite glass palette with silver-rose usage tokens', () => {
  assert.match(indexCss, /--bg:#0B1020;/);
  assert.match(indexCss, /--bg-base-1:#0D1324;/);
  assert.match(indexCss, /--bg-base-2:#0B1020;/);
  assert.match(indexCss, /--bg-base-3:#070B14;/);
  assert.match(indexCss, /--dashboard-card-bg:rgba\(255,\s*255,\s*255,\s*0\.052\);/);
  assert.match(indexCss, /--dashboard-card-border:rgba\(255,\s*255,\s*255,\s*0\.10\);/);
  assert.match(indexCss, /--dashboard-card-shadow:0 24px 80px rgba\(0,\s*0,\s*0,\s*0\.28\), inset 0 1px 0 rgba\(255,255,255,\.06\);/);
  assert.match(indexCss, /--accent-start:#8E86FF;/);
  assert.match(indexCss, /--accent-mid:#B89CFF;/);
  assert.match(indexCss, /--accent-end:#E4B8D7;/);
  assert.match(indexCss, /--accent-line:#D9D1FF;/);
  assert.match(indexCss, /--semantic-risk:#F06A8B;/);
  assert.match(indexCss, /--semantic-goal:#C9A96B;/);
  assert.match(indexCss, /--semantic-capacity:#7EA7FF;/);
  assert.match(indexCss, /--chart-actual-bar-top:#B89CFF;/);
  assert.match(indexCss, /--chart-target-bar:rgba\(255,255,255,0\.13\);/);
  assert.match(indexCss, /--brand-purple:#8E86FF;/);
  assert.match(indexCss, /--brand-purple-2:#B89CFF;/);
  assert.match(indexCss, /--brand-lavender:#D9D1FF;/);
  assert.match(indexCss, /--control-solid:#8E86FF;/);
  assert.match(indexCss, /--warn:#F06A8B;/);
  assert.match(indexCss, /--warn-rgb:240,106,139;/);
});

test('uses rose risk below 80, silver rose from 80 to 99, and champagne at 100 percent or above', () => {
  assert.equal(format.progressColor(79.9, format.COLOR.good, format.COLOR.gold), format.COLOR.warn);
  assert.equal(format.progressColor(60, format.COLOR.good, format.COLOR.gold), format.COLOR.warn);
  assert.equal(format.progressColor(53.8, format.COLOR.good, format.COLOR.gold), format.COLOR.warn);
  assert.equal(format.progressGradient(79.9, '#E4B8D7'), format.COLOR.warnGradient);
  assert.equal(format.progressGradient(70, '#E4B8D7'), format.COLOR.warnGradient);
  assert.equal(format.progressColor(80, format.COLOR.good, format.COLOR.gold), format.COLOR.good);
  assert.equal(format.progressColor(99.9, format.COLOR.good, format.COLOR.gold), format.COLOR.good);
  assert.equal(format.progressGradient(80, '#E4B8D7'), format.COLOR.goodGradient);
  assert.equal(format.progressGradient(99.9, '#E4B8D7'), format.COLOR.goodGradient);
  assert.equal(format.progressColor(100, format.COLOR.good, format.COLOR.gold), format.COLOR.gold);
  assert.equal(format.progressColor(118, format.COLOR.good, format.COLOR.gold), format.COLOR.gold);
  assert.equal(format.progressGradient(100, '#E4B8D7'), format.COLOR.goldGradient);
  assert.equal(format.progressGradient(118, '#E4B8D7'), format.COLOR.goldGradient);
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

test('layers target behind recovered and avoids current-month highlight in the monthly trend', () => {
  assert.match(monthlyTrendSource, /import \{ isRiskCompletion \} from '\.\.\/lib\/format';/);
  assert.doesNotMatch(monthlyTrendSource, /function recoveredBarColor/);
  assert.doesNotMatch(monthlyTrendSource, /function isCurrentTrendMonth/);
  assert.doesNotMatch(monthlyTrendSource, /function currentMonthBarColor/);
  assert.doesNotMatch(monthlyTrendSource, /value === '6月' \? tokens\.chartText/);
  assert.match(monthlyTrendSource, /function actualBarColor\(tokens\)/);
  assert.match(monthlyTrendSource, /function targetBarColor\(tokens\)/);
  // 目标：背景宽柱，淡灰紫低透明，后退
  assert.match(monthlyTrendSource, /return tokens\.chartActualBarBottom;/);
  assert.match(monthlyTrendSource, /name: '目标',[\s\S]*?type: 'bar'[\s\S]*?barWidth: 24,[\s\S]*?color: targetBarColor\(tokens\),[\s\S]*?opacity: targetOpacity/);
  // 回款：前景窄柱，银紫玫瑰渐变，与目标重叠
  assert.match(monthlyTrendSource, /name: '回款',[\s\S]*?type: 'bar'[\s\S]*?barWidth: 12,[\s\S]*?barGap: '-100%'[\s\S]*?color: actualBarColor\(tokens\)/);
  assert.doesNotMatch(monthlyTrendSource, /name:\s*'回款'[\s\S]*?COLOR\.warn/);
  // 完成率：细线+圆点，y 轴超 100% 自动扩展，100% 基准线
  assert.match(monthlyTrendSource, /max: rateAxisMax/);
  assert.match(monthlyTrendSource, /Math\.ceil\(maxCompletion \/ 10\) \* 10/);
  assert.match(monthlyTrendSource, /data: \[\{ yAxis: 100 \}\]/);
  // 点位保留风险/目标/常规三态语义
  assert.match(monthlyTrendSource, /function completionPointColor\(value, tokens\)/);
  assert.match(monthlyTrendSource, /isRiskCompletion\(value\) \? tokens\.chartRiskPoint/);
  assert.match(monthlyTrendSource, /Number\(value\) >= 100 \? tokens\.semanticGoal : tokens\.chartRateLine/);
  assert.match(monthlyTrendSource, /itemStyle:\s*\{ color: \(\{ value \}\) => completionPointColor\(value, tokens\)/);
  assert.match(monthlyTrendSource, /label:\s*\{[\s\S]*?color: \(\{ value \}\) => completionPointColor\(value, tokens\)/);
});

test('keeps channel and delivery progress bars on the same risk rule', () => {
  assert.equal(
    channelCompletionBarBackground({ key: 'east', completion: 70 }, '#E4B8D7'),
    format.COLOR.warnGradient
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'agent', completion: 79.9 }, '#E4B8D7'),
    format.COLOR.warnGradient
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'online', completion: 100 }, '#E4B8D7'),
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
  assert.match(deliveryCss, /\.dlv-row--over\s*\{[\s\S]*?color-mix\(in srgb, var\(--accent-gold\) 7%, transparent\)[\s\S]*?color-mix\(in srgb, var\(--accent-gold\) 3%, var\(--glass-cell\)\)[\s\S]*?border-color:\s*color-mix\(in srgb, var\(--accent-gold\) 18%, var\(--line\)\);[\s\S]*?box-shadow:\s*inset 0 1px 0 color-mix\(in srgb, var\(--accent-gold-soft\) 8%, transparent\);/);
  assert.match(deliveryCss, /\.dlv-tag--over\s*\{[\s\S]*?color:\s*var\(--accent-gold-soft\);[\s\S]*?\}/);
  assert.match(deliveryCss, /\.dlv-progress-pct--over\s*\{[\s\S]*?color:\s*var\(--accent-gold-soft\);[\s\S]*?\}/);
});

test('uses shared delta formatting in opening-account cards instead of a hardcoded up arrow', () => {
  assert.match(openingMetricSource, /import \{ deltaColor, fmtDelta \} from '\.\.\/lib\/format';/);
  assert.match(openingMetricSource, /\{fmtDelta\(metric\.delta\)\}/);
  assert.doesNotMatch(openingMetricSource, /▲ \{formatDelta\(metric\.delta\)\}/);
});
