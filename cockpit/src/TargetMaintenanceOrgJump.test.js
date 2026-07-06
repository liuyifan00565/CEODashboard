/*
 更新时间: 2026-07-06 11:15:05 CST
 更新内容: 将目标维护左侧组织点击后的行为改为过滤右侧年度目标行。
*/
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const maintenancePageSource = readFileSync(new URL('./components/MaintenancePage.jsx', import.meta.url), 'utf8');

test('filters the annual target table to the selected organization branch from the side nav', () => {
  assert.match(maintenancePageSource, /function collectTargetOrgIds\(node, selectedId\) \{/);
  assert.match(maintenancePageSource, /collectTargetOrgBranch\(node, ids\)/);
  assert.match(maintenancePageSource, /function filterTargetRowsByOrg\(rows, orgIds, selectedOrg, rootId\) \{/);
  assert.match(maintenancePageSource, /if \(selectedOrg === rootId \|\| orgIds\.size === 0\) return rows;/);
  assert.match(maintenancePageSource, /row\.type === 'department'\s*\?\s*orgIds\.has\(row\.id\)\s*:\s*orgIds\.has\(row\.deptId\)/);
  assert.match(maintenancePageSource, /const targetOrgIds = useMemo\(\(\) => collectTargetOrgIds\(targetOrgTree, selectedOrg\), \[selectedOrg, targetOrgTree\]\);/);
  assert.match(maintenancePageSource, /const visibleTargetRows = useMemo\(\(\) => filterTargetRowsByOrg\(targetRows, targetOrgIds, selectedOrg, orgTree\?\.id\), \[orgTree\?\.id, selectedOrg, targetOrgIds, targetRows\]\);/);
  assert.match(maintenancePageSource, /function handleTargetOrgSelect\(orgId\) \{/);
  assert.match(maintenancePageSource, /setSelectedOrg\(orgId\);/);
  assert.match(maintenancePageSource, /<MaintenanceSideNav nodes=\{\[targetOrgTree\]\} activeId=\{selectedOrg\} onSelect=\{handleTargetOrgSelect\} \/>/);
  assert.match(maintenancePageSource, /\{visibleTargetRows\.map\(\(row\) => \(/);
  assert.doesNotMatch(maintenancePageSource, /function scrollTargetRowIntoView/);
  assert.doesNotMatch(maintenancePageSource, /targetMatrixWrapRef/);
});
