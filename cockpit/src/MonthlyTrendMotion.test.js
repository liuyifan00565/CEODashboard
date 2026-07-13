/*
 更新时间: 2026-07-13 11:25:44 CST
 更新内容: 月度完成率趋势线稳定性守卫允许 6px 轻外发光，同时锁定关闭动画与固定 option 引用，避免恢复闪烁。
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
  assert.match(monthlyTrendSource, /import \{ useMemo \} from 'react';/);
  assert.match(
    monthlyTrendSource,
    /const option = useMemo\(\(\) => buildMonthlyTrendOption\(channelKey, tokens\), \[channelKey, tokens\]\);/,
  );
  assert.match(monthlyTrendSource, /const option = \{[\s\S]*?animation:\s*false,/);
});

test('renders the completion-rate line with a restrained stable glow', () => {
  const completionSeries = monthlyTrendSource.match(/name:\s*'完成率',[\s\S]*?data:\s*completion\.map/);
  assert.ok(completionSeries, 'completion-rate series should exist');
  assert.match(completionSeries[0], /shadowBlur:\s*6/);
  assert.match(completionSeries[0], /shadowColor:\s*'rgba\(185, 182, 232, 0\.36\)'/);
});
