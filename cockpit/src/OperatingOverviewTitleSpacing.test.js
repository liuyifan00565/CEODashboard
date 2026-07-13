/*
 更新时间: 2026-07-13 14:50:10 CST
 更新内容: 回归测试锁定月度经营进度与年度回款总览卡片的顶部标题留白，避免主标题再次紧贴上边框。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('./components/OperatingOverview.css', import.meta.url), 'utf8');
const spaciousTopPadding = String.raw`padding-block:\s*clamp\(14px, 1vw, 16px\) clamp\(3px, \.35vw, 6px\);`;

test('keeps the monthly and annual overview titles clear of the top card border', () => {
  assert.match(css, new RegExp(String.raw`\.op-panel--progress\s*\{[\s\S]*?${spaciousTopPadding}`));
  assert.match(css, new RegExp(String.raw`\.op-panel--annual\s*\{[\s\S]*?${spaciousTopPadding}`));
  assert.match(css, /@media \(min-width: 1181px\) and \(max-height: 1071px\)\s*\{[\s\S]*?padding-block:\s*14px 4px;/);
});
