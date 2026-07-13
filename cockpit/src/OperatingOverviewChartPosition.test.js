/* 更新时间: 2026-07-13 14:26:21 CST  更新内容: 回归测试锁定本月与年度回款结构饼图使用相同的垂直位移，避免月度图再次下沉。 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const cssPath = fileURLToPath(new URL('./components/OperatingOverview.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');
const alignedChartTransform = String.raw`transform:\s*translate\(clamp\(-16px, -1vw, -10px\), clamp\(-34px, -2\.4vw, -24px\)\) scale\(1\.3\);`;

test('aligns the monthly recovery chart vertically with the annual chart', () => {
  assert.match(css, new RegExp(String.raw`\.op-month-grid \.op-channel-chart\s*\{[\s\S]*?${alignedChartTransform}`));
  assert.match(css, new RegExp(String.raw`\.op-annual-grid \.op-channel-chart\s*\{[\s\S]*?${alignedChartTransform}`));
});
