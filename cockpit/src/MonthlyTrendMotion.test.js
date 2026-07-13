/*
 更新时间: 2026-07-13 19:20:00 CST
 更新内容: 同步日视图并入统一 buildBarTrendOption 后的静态渲染守卫断言——不再单独校验 buildDayTrendOption，
          改为校验日视图通过 buildDayTrend() 映射数据后仍复用同一个 buildBarTrendOption（关闭画布动画）。
*/
/*
 更新时间: 2026-07-13 17:10:00 CST
 更新内容: 同步年/月/日切换重构后的静态渲染守卫断言——option 改为按 dim 分支选取 buildDayTrendOption/
          buildBarTrendOption 并通过 useMemo 依赖 [dim, channelKey, tokens] 缓存，仍要求两个 option 构造函数
          都关闭画布动画，防止无交互时反复重绘并闪烁。
*/
/*
 更新时间: 2026-07-10 10:49:21 CST
 更新内容: 增加月度经营趋势静态渲染守卫，防止完成率曲线在无交互时反复重绘并闪烁。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');

test('keeps the monthly trend canvas stable when dashboard state changes', () => {
  assert.match(monthlyTrendSource, /import \{ useMemo, useState \} from 'react';/);
  assert.match(
    monthlyTrendSource,
    /}, \[dim, channelKey, tokens\]\);/,
  );
  assert.match(monthlyTrendSource, /function buildBarTrendOption\(\{ trend, labelKey, tokens \}\) \{[\s\S]*?animation:\s*false,/);
  assert.match(monthlyTrendSource, /function buildDayTrend\(\) \{/);
  assert.match(
    monthlyTrendSource,
    /if \(dim === 'day'\) return buildBarTrendOption\(\{ trend: buildDayTrend\(\), labelKey: 'day', tokens \}\);/,
  );
});

test('renders the completion-rate line without a blinking canvas glow', () => {
  const completionSeries = monthlyTrendSource.match(/name:\s*'完成率',[\s\S]*?data:\s*completion\.map/);
  assert.ok(completionSeries, 'completion-rate series should exist');
  assert.doesNotMatch(completionSeries[0], /shadowBlur|shadowColor/);
});
