/*
 更新时间: 2026-07-14 16:49:00 CST
 更新内容: 增加算力页两张饼图禁用 hover/select/blur 和面板入场位移的回归测试，避免圆环仍然晃动。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./components/ComputeUsagePage.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./components/ComputeUsagePage.css', import.meta.url), 'utf8');

test('keeps compute pie charts static at their initial size', () => {
  assert.match(source, /function buildPieOption\(\{ data, tokens, unitLabel, naturalLabelLayout = false \}\) \{[\s\S]*?animation: false,/);
  assert.match(source, /animationDuration: 0,\s*animationDurationUpdate: 0,\s*stateAnimation: \{ duration: 0 \},/);
  assert.match(source, /emphasis: \{\s*disabled: true,\s*scale: false,\s*scaleSize: 0,/);
  assert.match(source, /silent: true,\s*selectedMode: false,\s*selectedOffset: 0,\s*legendHoverLink: false,\s*hoverAnimation: false,/);
  assert.match(source, /select: \{\s*disabled: true,\s*scale: false,\s*scaleSize: 0,/);
  assert.match(source, /blur: \{\s*disabled: true,/);
  assert.match(source, /function Panel\(\{ className = '', title, sub, active, animate = true, children \}\)/);
  assert.match(source, /data-anim=\{animate \? '' : undefined\}/);
  assert.match(source, /className="cpu-panel--pie cpu-panel--version-pie"[\s\S]*?animate=\{false\}/);
  assert.match(source, /className="cpu-panel--pie cpu-panel--usage-pie"[\s\S]*?animate=\{false\}/);
  assert.match(styles, /\.cpu-panel--pie:hover,\s*\.cpu-panel--pie:focus-within \{\s*transform: none;\s*\}/);
});
