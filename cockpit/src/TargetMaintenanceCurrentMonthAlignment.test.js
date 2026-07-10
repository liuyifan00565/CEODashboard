/*
 Update time: 2026-07-10 18:19:58 CST
 Update content: Add regression coverage for snapping target maintenance current-month auto alignment to full period columns.
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const maintenancePageSource = readFileSync(new URL('./components/MaintenancePage.jsx', import.meta.url), 'utf8');

test('snaps target maintenance current-month auto scroll to complete period columns', () => {
  assert.match(maintenancePageSource, /function useTargetCurrentMonthAlignment\(\) \{/);
  assert.match(maintenancePageSource, /const periodWidth = currentMonthHeader\.offsetWidth \|\| 172;/);
  assert.match(maintenancePageSource, /const targetScrollLeft = currentMonthHeader\.offsetLeft \+ currentMonthHeader\.offsetWidth - scrollPane\.clientWidth;/);
  assert.match(maintenancePageSource, /const snappedScrollLeft = Math\.ceil\(targetScrollLeft \/ periodWidth\) \* periodWidth;/);
  assert.match(maintenancePageSource, /scrollPane\.scrollLeft = Math\.max\(0, Math\.min\(snappedScrollLeft, maxScrollLeft\)\);/);
});
