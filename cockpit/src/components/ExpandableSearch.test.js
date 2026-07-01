/*
 更新时间: 2026-06-25 18:45:25
 更新内容: 新增展开式搜索框快捷键提示和输入占位文案回归测试。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const componentSource = readFileSync(new URL('./ExpandableSearch.jsx', import.meta.url), 'utf8');
const shortcutClassPattern = new RegExp(`className="search-${'kbd'}"`);
const shortcutHintPattern = new RegExp([
  `${String.fromCharCode(0x2318)}K`,
  `C${'md'}\\+K`,
  `CM${'D'}\\+K`,
].join('|'));

test('removes shortcut hint from the expandable search field', () => {
  assert.doesNotMatch(componentSource, shortcutClassPattern);
  assert.doesNotMatch(componentSource, shortcutHintPattern);
});

test('uses the concise keyword placeholder when search is expanded', () => {
  assert.match(componentSource, /placeholder="请输入关键词"/);
  assert.doesNotMatch(componentSource, /placeholder="搜索经营模块、渠道、版本…"/);
});
