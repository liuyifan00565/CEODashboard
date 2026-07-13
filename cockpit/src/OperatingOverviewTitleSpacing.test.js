/*
 更新时间: 2026-07-13 19:23:27 CST
 更新内容: 回归测试锁定月度卡标题留白及年度折叠条的紧凑对称内边距。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./components/OperatingOverview.css', import.meta.url), 'utf8');
const spaciousTopPadding = String.raw`padding-block:\s*clamp\(14px, 1vw, 16px\) clamp\(3px, \.35vw, 6px\);`;

test('keeps the monthly title clear and the annual summary strip compact', () => {
  assert.match(css, new RegExp(String.raw`\.op-panel--progress\s*\{[\s\S]*?${spaciousTopPadding}`));
  assert.match(css, /\.op-panel--annual\s*\{[\s\S]*?padding:\s*12px clamp\(16px, 1\.6vw, 22px\);/);
  assert.match(css, /@media \(min-width: 1181px\) and \(max-height: 1071px\)\s*\{[\s\S]*?\.op-panel--progress\s*\{[\s\S]*?padding-block:\s*14px 4px;/);
});
