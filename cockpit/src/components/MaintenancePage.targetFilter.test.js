/*
 更新时间: 2026-07-08 12:09:25 CST
 更新内容: 增加目标维护页组织架构点击后过滤年度目标行的专项回归测试。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const maintenancePageSource = readFileSync(new URL('./MaintenancePage.jsx', import.meta.url), 'utf8');

test('target maintenance organization tree filters the yearly target rows', () => {
  assert.match(maintenancePageSource, /function getNestedDescendantIds\(rootNode, selectedId\) \{/);
  assert.match(maintenancePageSource, /function targetRowBelongsToOrg\(row, selectedOrgIds\) \{/);
  assert.match(maintenancePageSource, /rowId\.startsWith\(summaryPrefix\) && selectedOrgIds\.has\(rowId\.slice\(summaryPrefix\.length\)\)/);
  assert.match(maintenancePageSource, /const visibleTargetRows = useMemo\(\(\) => \{/);
  assert.match(maintenancePageSource, /return rowList\.filter\(\(row\) => targetRowBelongsToOrg\(row, selectedOrgIds\)\);/);
  assert.match(maintenancePageSource, /meta=\{`\$\{visibleTargetUserCount\} 人`\}/);
  assert.match(maintenancePageSource, /\{visibleTargetRows\.map\(\(row\) => \(/);
});
