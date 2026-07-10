/*
 更新时间: 2026-07-10 10:49:21 CST
 更新内容: 增加月度经营趋势静态渲染守卫，防止完成率曲线在无交互时反复重绘并闪烁。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');

test('keeps the monthly trend canvas stable when dashboard state changes', () => {
  assert.match(monthlyTrendSource, /import \{ useMemo \} from 'react';/);
  assert.match(
    monthlyTrendSource,
    /const option = useMemo\(\(\) => buildMonthlyTrendOption\(channelKey, tokens\), \[channelKey, tokens\]\);/,
  );
  assert.match(monthlyTrendSource, /const option = \{[\s\S]*?animation:\s*false,/);
});

test('renders the completion-rate line without a blinking canvas glow', () => {
  const completionSeries = monthlyTrendSource.match(/name:\s*'完成率',[\s\S]*?data:\s*completion\.map/);
  assert.ok(completionSeries, 'completion-rate series should exist');
  assert.doesNotMatch(completionSeries[0], /shadowBlur|shadowColor/);
});
