/*
 Update time: 2026-07-10 18:16:45 CST
 Update content: Ensure the target maintenance period table width no longer includes the separated frozen name column.
*/
/*
 更新时间: 2026-07-08 14:47:03 CST
 更新内容: 固定部门/人员列边缘测试改为要求银紫玫瑰轻渐隐和低存在感右边线，弱化与年月列之间的硬边界。
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
  const targetMatrixBlock = cssRuleBody(maintenancePageCss, '.mnt-target-matrix');
  const targetNamePaneBlock = cssRuleBody(maintenancePageCss, '.mnt-target-name-pane');
  const targetNameFadeBlock = cssRuleBody(maintenancePageCss, '.mnt-target-name-pane::after');
  const targetNameTableBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix--target-name');
  const targetScrollPaneBlock = cssRuleBody(maintenancePageCss, '.mnt-target-scroll-pane');
  const targetPeriodTableBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix--target');

  assert.match(maintenancePageSource, /const TARGET_PERIOD_COLUMNS = buildTargetPeriodColumns\(MAINTENANCE_PERIOD_COLUMNS, META\.monthLabel\);/);
  assert.doesNotMatch(maintenancePageSource, /TARGET_FIXED_PERIOD_COLUMNS|TARGET_SCROLL_PERIOD_COLUMNS|targetPinned/);
  assert.match(maintenancePageSource, /<div className="mnt-target-name-pane">[\s\S]*?<table className="mnt-matrix mnt-matrix--target-name">[\s\S]*?<th>部门<\/th>/);
  assert.match(maintenancePageSource, /<div className="mnt-target-scroll-pane" ref=\{targetScrollPaneRef\}>[\s\S]*?<table className="mnt-matrix mnt-matrix--target">/);
  assert.doesNotMatch(maintenancePageSource, /<table className="mnt-matrix mnt-matrix--target">[\s\S]*?<th>部门\/人员<\/th>/);

  assert.match(targetMatrixBlock, /grid-template-columns:\s*var\(--mnt-target-name-width\) minmax\(0,\s*1fr\);/);
  assert.match(targetNamePaneBlock, /position:\s*sticky;/);
  assert.match(targetNamePaneBlock, /left:\s*0;/);
  assert.match(targetNamePaneBlock, /z-index:\s*4;/);
  assert.match(targetNamePaneBlock, /background:\s*transparent;/);
  assert.match(targetNameFadeBlock, /content:\s*'';/);
  assert.match(targetNameFadeBlock, /right:\s*-40px;/);
  assert.match(targetNameFadeBlock, /bottom:\s*0;/);
  assert.match(targetNameFadeBlock, /width:\s*40px;/);
  assert.match(targetNameFadeBlock, /pointer-events:\s*none;/);
  assert.match(targetNameFadeBlock, /linear-gradient\(90deg,\s*rgba\(142,\s*134,\s*255,\s*\.055\)\s*0%,\s*rgba\(184,\s*156,\s*255,\s*\.034\)\s*42%,\s*rgba\(228,\s*184,\s*215,\s*\.018\)\s*72%,\s*rgba\(0,\s*0,\s*0,\s*0\)\s*100%\)/);
  assert.match(maintenancePageCss, /\.mnt-matrix--target-name th:last-child,\s*[\s\S]*?\.mnt-matrix--target-name td:last-child\s*\{[\s\S]*?border-right:\s*1px solid rgba\(217,\s*209,\s*255,\s*\.045\);/);
  assert.match(targetNameTableBlock, /width:\s*var\(--mnt-target-name-width\);/);
  assert.match(targetScrollPaneBlock, /overflow-x:\s*auto;/);
  assert.match(targetScrollPaneBlock, /overflow-y:\s*hidden;/);
  assert.match(targetPeriodTableBlock, /min-width:\s*calc\(var\(--mnt-target-period-width\) \* 17\);/);
  assert.doesNotMatch(targetPeriodTableBlock, /--mnt-target-name-width/);
});
