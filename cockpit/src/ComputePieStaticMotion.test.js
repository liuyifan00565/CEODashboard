/*
 更新时间: 2026-07-14 16:35:00 CST
 更新内容: 增加算力页两张饼图保持初始尺寸、不启用动画、状态过渡、悬浮放大和面板上浮的回归测试。
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
  assert.match(styles, /\.cpu-panel--pie:hover,\s*\.cpu-panel--pie:focus-within \{\s*transform: none;\s*\}/);
});
