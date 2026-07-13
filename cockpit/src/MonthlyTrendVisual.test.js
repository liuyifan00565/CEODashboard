/*
 更新时间: 2026-07-13 11:25:44 CST
 更新内容: 新增月度完成率趋势线视觉契约，锁定清晰银紫主线、克制平滑度、分级点位，并确保 94.5% 正常值不进入红色风险态。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { isRiskCompletion } from './lib/format.js';

const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');

test('keeps the completion-rate line clear while reducing wave amplitude', () => {
  assert.match(monthlyTrendSource, /smooth:\s*0\.25/);
  assert.match(monthlyTrendSource, /symbolSize:\s*value => \(isRiskCompletion\(value\) \? 9 : 7\)/);
  assert.match(
    monthlyTrendSource,
    /lineStyle:\s*\{[\s\S]*?color: tokens\.chartRateLine,[\s\S]*?width: 2\.8,[\s\S]*?opacity: 0\.9,[\s\S]*?shadowBlur: 6/,
  );
});

test('keeps ordinary completion values out of the red risk state', () => {
  assert.equal(isRiskCompletion(94.5), false);
  assert.equal(isRiskCompletion(79.9), true);
  assert.match(
    monthlyTrendSource,
    /return isRiskCompletion\(value\) \? tokens\.chartRiskPoint : Number\(value\) >= 100 \? tokens\.semanticGoal : tokens\.chartRateLine;/,
  );
  assert.match(monthlyTrendSource, /const pointColor = completionPointColor\(value, tokens\);/);
  assert.match(monthlyTrendSource, /label: \{ color: pointColor, fontWeight: risk \? 850 : 650 \}/);
});
