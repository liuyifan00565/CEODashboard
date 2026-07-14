/*
 更新时间: 2026-07-14 17:29:42 CST
 更新内容: 增加算力用量分布圆环图小扇区引导线对齐和右侧长标签换行显示的回归测试。
*/
/*
 更新时间: 2026-07-14 17:14:00 CST
 更新内容: 增加算力页两张饼图恢复原 ECharts 视觉但以静态图片展示、脱离可动 canvas 的回归测试。
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
  assert.match(source, /'算力用量>10000': \{ side: 'left', y: -72, align: 'right' \}/);
  assert.match(source, /'0<算力用量<=100': \{ side: 'right', y: -64, align: 'left' \}/);
  assert.match(source, /const COMPUTE_STACKED_PIE_LABELS = new Set\(\['卓越版', '100<算力用量<=1000'\]\);/);
  assert.match(source, /labelLinePoints\[lastIndex\]\[1\] = y;/);
  assert.match(source, /if \(lastIndex > 0\) labelLinePoints\[lastIndex - 1\]\[1\] = y;/);
  assert.match(source, /function StaticEChartImage\(\{ option, label \}\)/);
  assert.match(source, /<StaticEChartImage option=\{versionPieOption\} label="各版本算力消耗静态圆环图" \/>/);
  assert.match(source, /<StaticEChartImage option=\{distributionPieOption\} label="算力用量分布静态圆环图" \/>/);
  assert.doesNotMatch(source, /<EChart option=\{versionPieOption\}/);
  assert.doesNotMatch(source, /<EChart option=\{distributionPieOption\}/);
  assert.match(source, /className="cpu-panel--pie cpu-panel--version-pie"[\s\S]*?animate=\{false\}/);
  assert.match(source, /className="cpu-panel--pie cpu-panel--usage-pie"[\s\S]*?animate=\{false\}/);
  assert.match(styles, /\.cpu-static-echart\s*\{[\s\S]*?animation:\s*none;/);
  assert.match(styles, /\.cpu-static-echart__renderer\s*\{[\s\S]*?visibility:\s*hidden;/);
  assert.match(styles, /\.cpu-panel--pie:hover,\s*\.cpu-panel--pie:focus-within \{\s*transform: none;\s*\}/);
});
