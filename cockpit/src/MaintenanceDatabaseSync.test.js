/*
 更新时间: 2026-07-06 11:39:42 CST
 更新内容: 增加数据维护页 UI 与本地数据库双向同步的回归测试。
*/
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const maintenancePageSource = readFileSync(new URL('./components/MaintenancePage.jsx', import.meta.url), 'utf8');
const maintenanceApiSource = readFileSync(new URL('../server/maintenanceApi.js', import.meta.url), 'utf8');

test('keeps maintenance UI synchronized with the local database without overwriting unsaved edits', () => {
  assert.match(maintenancePageSource, /const MAINTENANCE_REFRESH_INTERVAL_MS = 5000;/);
  assert.match(maintenancePageSource, /const MAINTENANCE_BLOCKED_REFRESH_STATUSES = new Set\(\['有未保存修改', '保存中'\]\);/);
  assert.match(maintenancePageSource, /function isMaintenanceRefreshBlocked\(status\) \{/);
  assert.match(maintenancePageSource, /function mergeMaintenanceRefresh\(currentData, refreshedData, statusByPage\) \{/);
  assert.match(maintenancePageSource, /merged\[dataKey\] = currentData\?\.\[dataKey\] \?\? merged\[dataKey\];/);
  assert.match(maintenancePageSource, /const statusRef = useRef\(statusByPage\);/);
  assert.match(maintenancePageSource, /statusRef\.current = statusByPage;/);
  assert.match(maintenancePageSource, /fetch\(`\/api\/maintenance\/bootstrap\?year=\$\{encodeURIComponent\(year\)\}`,\s*\{\s*cache: 'no-store',\s*\}\)/);
  assert.match(maintenancePageSource, /setMaintenanceData\(\(current\) => mergeMaintenanceRefresh\(current, data, statusRef\.current\)\);/);
  assert.match(maintenancePageSource, /window\.setInterval\(\(\) => \{\s*loadMaintenanceData\(\{ announce: false \}\);\s*\}, MAINTENANCE_REFRESH_INTERVAL_MS\)/);
  assert.match(maintenancePageSource, /window\.clearInterval\(refreshTimer\);/);
  assert.match(maintenancePageSource, /fetch\(`\/api\/maintenance\/\$\{resource\}\?year=\$\{encodeURIComponent\(year\)\}`,\s*\{\s*method: 'PUT',\s*cache: 'no-store',/);

  assert.match(maintenanceApiSource, /'Cache-Control': 'no-store'/);
});
