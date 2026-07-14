/*
 更新时间: 2026-07-14 12:35:00 CST
 更新内容: 增加 EChart 可选 onEvents 绑定与同名处理函数解绑的回归测试，防止售前试用环图重复监听。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./EChart.jsx', import.meta.url), 'utf8');

test('binds optional chart events and removes the same handlers on change or unmount', () => {
  assert.match(source, /export default function EChart\(\{ option, style, className, onEvents = null \}\)/);
  assert.match(source, /const chart = chartRef\.current;[\s\S]*?if \(!chart \|\| !onEvents\) return undefined;/);
  assert.match(source, /const entries = Object\.entries\(onEvents\)\.filter\(\(\[, handler\]\) => typeof handler === 'function'\);/);
  assert.match(source, /entries\.forEach\(\(\[eventName, handler\]\) => chart\.on\(eventName, handler\)\);/);
  assert.match(source, /return \(\) => \{\s*entries\.forEach\(\(\[eventName, handler\]\) => chart\.off\(eventName, handler\)\);\s*\};/);
  assert.match(source, /\}, \[onEvents\]\);/);
});

test('keeps chart disposal separate from event cleanup', () => {
  assert.match(source, /chartRef\.current\?\.dispose\(\);\s*chartRef\.current = null;/);
  assert.match(source, /chartRef\.current\?\.setOption\(option, true\);/);
});
