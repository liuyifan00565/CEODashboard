/*
 Update time: 2026-07-03 17:05:00 CST
 Update content: Add regression coverage for selected target-maintenance row buttons that scroll the period table left and right.
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

test('adds selected-row buttons that scroll the target maintenance period table', () => {
  const targetMatrixBlock = cssRuleBody(maintenancePageCss, '.mnt-target-matrix');
  const rowControlsBlock = cssRuleBody(maintenancePageCss, '.mnt-row-scroll-controls');
  const rowButtonBlock = cssRuleBody(maintenancePageCss, '.mnt-row-scroll-btn');
  const rowButtonHoverBlock = cssRuleBody(maintenancePageCss, '.mnt-row-scroll-btn:hover');
  const rowButtonLeftBlock = cssRuleBody(maintenancePageCss, '.mnt-row-scroll-btn--left');
  const rowButtonRightBlock = cssRuleBody(maintenancePageCss, '.mnt-row-scroll-btn--right');

  assert.match(maintenancePageSource, /function scrollTargetPeriods\(scrollPaneRef, direction\) \{/);
  assert.match(maintenancePageSource, /const scrollDistance = Math\.max\(172, Math\.round\(scrollPane\.clientWidth \* 0\.72\)\);/);
  assert.match(maintenancePageSource, /scrollPane\.scrollBy\(\{\s*left: direction === 'left' \? -scrollDistance : scrollDistance,\s*behavior: 'smooth',\s*\}\);/);
  assert.match(maintenancePageSource, /function TargetRowScrollButton\(\{ direction, scrollPaneRef \}\) \{/);
  assert.match(maintenancePageSource, /event\.stopPropagation\(\);[\s\S]*?scrollTargetPeriods\(scrollPaneRef, direction\);/);
  assert.match(maintenancePageSource, /const selectedTargetRowIndex = rows\.findIndex\(\(row\) => `target:\$\{row\.id\}` === selectedTargetRow\);/);
  assert.match(maintenancePageSource, /selectedTargetRowIndex >= 0 && \([\s\S]*?<div\s+className="mnt-row-scroll-controls"\s+style=\{\{ '--mnt-selected-row-index': selectedTargetRowIndex \}\}[\s\S]*?<TargetRowScrollButton direction="left" scrollPaneRef=\{targetScrollPaneRef\} \/>[\s\S]*?<TargetRowScrollButton direction="right" scrollPaneRef=\{targetScrollPaneRef\} \/>/);

  assert.match(targetMatrixBlock, /position:\s*relative;/);
  assert.match(rowControlsBlock, /position:\s*absolute;/);
  assert.match(rowControlsBlock, /top:\s*calc\(54px \+ var\(--mnt-selected-row-index\) \* 100px \+ 50px\);/);
  assert.match(rowControlsBlock, /pointer-events:\s*none;/);
  assert.match(rowButtonBlock, /pointer-events:\s*auto;/);
  assert.match(rowButtonBlock, /border:\s*1px solid var\(--line-2\);/);
  assert.match(rowButtonBlock, /background:\s*var\(--glass-cell\);/);
  assert.match(rowButtonBlock, /backdrop-filter:\s*var\(--glass-blur\);/);
  assert.match(rowButtonBlock, /box-shadow:\s*var\(--glass-shadow\);/);
  assert.match(rowButtonHoverBlock, /background:\s*var\(--glass-cell-hover\);/);
  assert.match(rowButtonLeftBlock, /left:\s*10px;/);
  assert.match(rowButtonRightBlock, /right:\s*10px;/);
});
