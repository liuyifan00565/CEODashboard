/*
 Update time: 2026-07-03 11:11:24 CST
 Update content: Add regression coverage for clearly separating editable and readonly target maintenance values.
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const maintenancePageSource = readFileSync(new URL('./components/MaintenancePage.jsx', import.meta.url), 'utf8');
const maintenancePageCss = readFileSync(new URL('./components/MaintenancePage.css', import.meta.url), 'utf8');

function cssRuleBody(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\n\\}`))?.groups.body ?? '';
}

test('marks target period cells as editable or readonly and keeps readonly values out of inputs', () => {
  assert.match(
    maintenancePageSource,
    /<td className=\{`mnt-period-cell \$\{editable \? 'mnt-period-cell--editable' : 'mnt-period-cell--readonly'\}`\}>/
  );
  assert.match(maintenancePageSource, /<div className="mnt-target-input-wrap">/);
  assert.match(maintenancePageSource, /<span className="mnt-target-input-unit">万<\/span>/);
  assert.match(maintenancePageSource, /<div className="mnt-target-readonly-value">/);
  assert.match(maintenancePageSource, /<strong>\{formatWan\(period\.target\)\}<\/strong>/);
  assert.match(maintenancePageSource, /: \(\s*<div className="mnt-target-readonly-value">\s*<strong>\{formatWan\(period\.target\)\}<\/strong>\s*<\/div>\s*\)/);
  assert.doesNotMatch(maintenancePageSource, /className="mnt-target-readonly-value"[\s\S]{0,200}<input/);
});

test('styles editable target values as glass inputs and readonly target values as plain data', () => {
  const editableCellBlock = cssRuleBody(maintenancePageCss, '.mnt-period-cell--editable');
  const readonlyCellBlock = cssRuleBody(maintenancePageCss, '.mnt-period-cell--readonly');
  const inputWrapBlock = cssRuleBody(maintenancePageCss, '.mnt-target-input-wrap');
  const inputWrapHoverBlock = cssRuleBody(maintenancePageCss, '.mnt-target-input-wrap:hover');
  const inputWrapFocusBlock = cssRuleBody(maintenancePageCss, '.mnt-target-input-wrap:focus-within');
  const inputUnitBlock = cssRuleBody(maintenancePageCss, '.mnt-target-input-unit');
  const readonlyValueBlock = cssRuleBody(maintenancePageCss, '.mnt-target-readonly-value');
  const progressBlock = cssRuleBody(maintenancePageCss, '.mnt-progress');

  assert.match(editableCellBlock, /vertical-align:\s*top;/);
  assert.match(readonlyCellBlock, /vertical-align:\s*top;/);
  assert.match(inputWrapBlock, /display:\s*grid;/);
  assert.match(inputWrapBlock, /grid-template-columns:\s*minmax\(0,\s*1fr\) auto;/);
  assert.match(inputWrapBlock, /border:\s*1px solid var\(--line-2\);/);
  assert.match(inputWrapBlock, /background:\s*color-mix\(in srgb, var\(--glass-cell-hover\) 54%, transparent\);/);
  assert.match(inputWrapBlock, /box-shadow:[\s\S]*inset 0 0 0 1px rgba\(255,\s*255,\s*255,\s*\.1\)/);
  assert.match(inputWrapHoverBlock, /border-color:\s*color-mix\(in srgb, var\(--txt\) 42%, var\(--line-2\)\);/);
  assert.match(inputWrapFocusBlock, /box-shadow:[\s\S]*0 0 0 3px var\(--focus-outline\)/);
  assert.match(inputUnitBlock, /color:\s*var\(--muted\);/);
  assert.match(readonlyValueBlock, /background:\s*transparent;/);
  assert.match(readonlyValueBlock, /border:\s*0;/);
  assert.match(readonlyValueBlock, /color:\s*var\(--muted\);/);
  assert.doesNotMatch(progressBlock, /mnt-period-cell--editable|mnt-period-cell--readonly/);
  assert.doesNotMatch(inputWrapBlock, /var\(--good\)|var\(--warn\)|rgba\(190,\s*64,\s*255/);
  assert.doesNotMatch(readonlyValueBlock, /var\(--good\)|var\(--warn\)|rgba\(190,\s*64,\s*255/);
});
