/*
 更新时间: 2026-07-10 10:51:28 CST
 更新内容: 新增侧栏搜索形态回归，锁定紧凑高度、完整宽度和折叠态“搜索”标签。
*/
/*
 Update time: 2026-07-02 17:18:50 CST
 Update content: Add Word-style search counter and Enter-next navigation regression tests.
*/
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

test('accepts Word-style result counter props', () => {
  assert.match(componentSource, /currentIndex = 0/);
  assert.match(componentSource, /totalResults = 0/);
  assert.match(componentSource, /onNext/);
  assert.match(componentSource, /className="search-count"/);
  assert.match(componentSource, /\$\{displayIndex\}\/\$\{totalResults\}/);
});

test('uses Enter to jump to the next result without submitting the field', () => {
  assert.match(componentSource, /function handleKeyDown\(event\)/);
  assert.match(componentSource, /event\.key === 'Enter'/);
  assert.match(componentSource, /event\.preventDefault\(\)/);
  assert.match(componentSource, /onNext\?\.\(\)/);
  assert.match(componentSource, /onKeyDown=\{handleKeyDown\}/);
});

test('uses the concise keyword placeholder when search is expanded', () => {
  assert.match(componentSource, /placeholder="请输入关键词"/);
  assert.doesNotMatch(componentSource, /placeholder="搜索经营模块、渠道、版本…"/);
});

test('supports the compact sidebar placement without changing search behavior', () => {
  assert.match(componentSource, /placement = 'toolbar'/);
  assert.match(componentSource, /const isSidebar = placement === 'sidebar';/);
  assert.match(componentSource, /width=\{isSidebar \? '100%' : expanded \? 318 : 54\}/);
  assert.match(componentSource, /height=\{isSidebar \? 44 : 54\}/);
  assert.match(componentSource, /search-wrap--sidebar/);
  assert.match(componentSource, /<span className="search-label">搜索<\/span>/);
});
