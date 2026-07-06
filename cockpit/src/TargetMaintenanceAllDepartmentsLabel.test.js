/*
 更新时间: 2026-07-06 11:04:58 CST
 更新内容: 增加目标维护根组织在侧栏和表格中显示为所有部门的回归测试。
*/
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const maintenancePageSource = readFileSync(new URL('./components/MaintenancePage.jsx', import.meta.url), 'utf8');

test('shows the target maintenance root organization as all departments in side nav and table rows', () => {
  assert.match(maintenancePageSource, /const TARGET_ALL_DEPARTMENTS_LABEL = '所有部门';/);
  assert.match(maintenancePageSource, /function withTargetAllDepartmentsRoot\(orgTree\) \{/);
  assert.match(maintenancePageSource, /return \{ \.\.\.orgTree, name: TARGET_ALL_DEPARTMENTS_LABEL \};/);
  assert.match(maintenancePageSource, /function withTargetAllDepartmentsRow\(row, rootId\) \{/);
  assert.match(maintenancePageSource, /row\.id === rootId \? \{ \.\.\.row, name: TARGET_ALL_DEPARTMENTS_LABEL \} : row/);
  assert.match(maintenancePageSource, /const targetOrgTree = useMemo\(\(\) => withTargetAllDepartmentsRoot\(orgTree\), \[orgTree\]\);/);
  assert.match(maintenancePageSource, /const targetRows = useMemo\(\(\) => rows\.map\(\(row\) => withTargetAllDepartmentsRow\(row, orgTree\?\.id\)\), \[orgTree\?\.id, rows\]\);/);
  assert.match(maintenancePageSource, /<MaintenanceSideNav nodes=\{\[targetOrgTree\]\} activeId=\{selectedOrg\} onSelect=\{handleTargetOrgSelect\} \/>/);
  assert.match(maintenancePageSource, /\{visibleTargetRows\.map\(\(row\) => \(/);
  assert.doesNotMatch(maintenancePageSource, /departmentName:\s*TARGET_ALL_DEPARTMENTS_LABEL/);
});
