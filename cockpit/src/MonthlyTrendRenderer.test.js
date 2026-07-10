/*
 更新时间: 2026-07-10 11:15:13 CST
 更新内容: 新增月度经营趋势 SVG 渲染回归测试，防止恢复为静止时可能闪烁的 Canvas。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const chartSource = readFileSync(new URL('./components/EChart.jsx', import.meta.url), 'utf8');
const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');

test('allows a chart to select its renderer while keeping canvas as the default', () => {
  assert.match(chartSource, /renderer = 'canvas'/);
  assert.match(chartSource, /echarts\.init\(ref\.current, null, \{ renderer \}\)/);
  assert.match(chartSource, /\}, \[renderer\]\);/);
});

test('renders the monthly operating trend with SVG to avoid idle canvas flicker', () => {
  assert.match(monthlyTrendSource, /<EChart option=\{option\} renderer="svg" style=\{\{ height: '100%' \}\} \/>/);
});
