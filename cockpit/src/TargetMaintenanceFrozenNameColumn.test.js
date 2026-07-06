/*
 Update time: 2026-07-06 10:16:26 CST
 Update content: Require a narrower target maintenance department/person column.
*/
/*
 Update time: 2026-07-03 11:49:32 CST
 Update content: Require a soft glass gradient at the target maintenance frozen-name edge.
*/
/*
 Update time: 2026-07-03 11:22:11 CST
 Update content: Add regression coverage preventing target maintenance department/person column bleed-through.
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

test('keeps the target maintenance name column outside the horizontal period scroller', () => {
  const targetWrapBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix-wrap--target');
  const targetMatrixBlock = cssRuleBody(maintenancePageCss, '.mnt-target-matrix');
  const targetNamePaneBlock = cssRuleBody(maintenancePageCss, '.mnt-target-name-pane');
  const targetNameFadeBlock = cssRuleBody(maintenancePageCss, '.mnt-target-name-pane::after');
  const targetNameTableBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix--target-name');
  const targetScrollPaneBlock = cssRuleBody(maintenancePageCss, '.mnt-target-scroll-pane');
  const targetPeriodTableBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix--target');

  assert.match(maintenancePageSource, /const TARGET_PERIOD_COLUMNS = buildTargetPeriodColumns\(MAINTENANCE_PERIOD_COLUMNS, META\.monthLabel\);/);
  assert.doesNotMatch(maintenancePageSource, /TARGET_FIXED_PERIOD_COLUMNS|TARGET_SCROLL_PERIOD_COLUMNS|targetPinned/);
  assert.match(maintenancePageSource, /<div className="mnt-target-name-pane">[\s\S]*?<table className="mnt-matrix mnt-matrix--target-name">[\s\S]*?<th>部门\/人员<\/th>/);
  assert.match(maintenancePageSource, /<div className="mnt-target-scroll-pane" ref=\{targetScrollPaneRef\}>[\s\S]*?<table className="mnt-matrix mnt-matrix--target">/);
  assert.doesNotMatch(maintenancePageSource, /<table className="mnt-matrix mnt-matrix--target">[\s\S]*?<th>部门\/人员<\/th>/);

  assert.match(targetWrapBlock, /--mnt-target-name-width:\s*148px;/);
  assert.match(targetMatrixBlock, /grid-template-columns:\s*var\(--mnt-target-name-width\) minmax\(0,\s*1fr\);/);
  assert.match(targetNamePaneBlock, /position:\s*sticky;/);
  assert.match(targetNamePaneBlock, /left:\s*0;/);
  assert.match(targetNamePaneBlock, /z-index:\s*4;/);
  assert.match(targetNamePaneBlock, /background:\s*transparent;/);
  assert.match(targetNameFadeBlock, /content:\s*'';/);
  assert.match(targetNameFadeBlock, /right:\s*-28px;/);
  assert.match(targetNameFadeBlock, /width:\s*28px;/);
  assert.match(targetNameFadeBlock, /pointer-events:\s*none;/);
  assert.match(targetNameFadeBlock, /linear-gradient\(90deg,\s*rgba\(0,\s*0,\s*0,\s*\.22\)\s*0%,\s*rgba\(0,\s*0,\s*0,\s*\.1\)\s*48%,\s*rgba\(0,\s*0,\s*0,\s*0\)\s*100%\)/);
  assert.match(targetNameTableBlock, /width:\s*var\(--mnt-target-name-width\);/);
  assert.match(targetScrollPaneBlock, /overflow-x:\s*auto;/);
  assert.match(targetScrollPaneBlock, /overflow-y:\s*hidden;/);
  assert.match(targetPeriodTableBlock, /min-width:\s*calc\(var\(--mnt-target-period-width\) \* 17\);/);
});
