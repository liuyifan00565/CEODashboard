/*
 更新时间: 2026-07-07 17:00:00 CST
 更新内容: 新增 GlassSelect 回归测试——断言不使用原生 <option>、面板走 createPortal、
          具备 listbox/option 语义、键盘上下回车 Esc、外击关闭，以及银紫玻璃面板样式。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const selectSource = readFileSync(new URL('./components/GlassSelect.jsx', import.meta.url), 'utf8');
const selectCss = readFileSync(new URL('./components/GlassSelect.css', import.meta.url), 'utf8');

test('GlassSelect never falls back to a native <select> or <option>', () => {
  // no JSX select/option elements are rendered — only a trigger button + portalled listbox
  assert.doesNotMatch(selectSource, /return[\s\S]*?<select[\s>]/);
  assert.doesNotMatch(selectSource, /return[\s\S]*?<option[\s>]/);
  assert.match(selectSource, /export default function GlassSelect/);
});

test('GlassSelect renders a glass trigger button and a portalled listbox panel', () => {
  assert.match(selectSource, /import \{ createPortal \} from 'react-dom';/);
  assert.match(selectSource, /role="listbox"/);
  assert.match(selectSource, /role="option"/);
  assert.match(selectSource, /aria-haspopup="listbox"/);
  assert.match(selectSource, /aria-expanded=\{open\}/);
  assert.match(selectSource, /aria-selected=\{isSelected\}/);
  assert.match(selectSource, /createPortal\(/);
});

test('GlassSelect supports keyboard navigation and outside-click close', () => {
  assert.match(selectSource, /= 'ArrowDown'/);
  assert.match(selectSource, /= 'ArrowUp'/);
  assert.match(selectSource, /= 'Enter'/);
  assert.match(selectSource, /= 'Escape'/);
  assert.match(selectSource, /document\.addEventListener\('mousedown', handlePointerDown\)/);
});

test('GlassSelect marks the selected option with a check and stays in sync with value', () => {
  assert.match(selectSource, /\{isSelected \? '✓' : ''\}/);
  assert.match(selectSource, /opts\.find\(\(option\) => option\.value === value\)/);
});

test('GlassSelect panel uses the silver-purple glass system instead of white', () => {
  assert.match(selectCss, /\.glass-select__panel[\s\S]*?background:\s*linear-gradient\(180deg, rgba\(29, 34, 68, 0\.96\), rgba\(11, 15, 35, 0\.96\)\)/);
  assert.match(selectCss, /border: 1px solid rgba\(190, 175, 255, 0\.24\)/);
  assert.match(selectCss, /box-shadow:[\s\S]*?0 0 36px rgba\(142, 134, 255, 0\.18\)/);
  assert.match(selectCss, /\.is-selected[\s\S]*?background:\s*linear-gradient\(\s*90deg,\s*rgba\(142, 134, 255, 0\.24\),\s*rgba\(228, 184, 215, 0\.16\)\s*\)/);
  assert.doesNotMatch(selectCss, /background:\s*#fff|background:\s*white/);
});
