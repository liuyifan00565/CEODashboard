/*
 更新时间: 2026-07-06 11:02:15 CST
 更新内容: 要求四个维护页在状态徽标左侧显示同一条目标数据更新时间。
*/
/*
 更新时间: 2026-07-06 10:42:41 CST
 更新内容: 增加目标维护工具栏目标数据更新时间的回归测试。
*/
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const maintenancePageSource = readFileSync(new URL('./components/MaintenancePage.jsx', import.meta.url), 'utf8');
const maintenancePageCss = readFileSync(new URL('./components/MaintenancePage.css', import.meta.url), 'utf8');

function cssRuleBody(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test('shows a compact target data updated timestamp before the status badge on every maintenance page', () => {
  const targetUpdatedAtBlock = cssRuleBody(maintenancePageCss, '.mnt-target-updated-at');

  assert.match(maintenancePageSource, /const INITIAL_TARGET_UPDATED_AT = '2026\/7\/6 10:42:41';/);
  assert.match(maintenancePageSource, /function nowFullLabel\(\) \{/);
  assert.match(maintenancePageSource, /function TargetUpdatedAtBadge\(\{ updatedAt \}\) \{/);
  assert.match(maintenancePageSource, /目标数据已更新：\{updatedAt\}/);
  assert.match(maintenancePageSource, /function MaintenanceToolbar\(\{ activePage, year, status, targetUpdatedAt, onBack, onDirty, onSave, onYearChange \}\)/);
  assert.match(maintenancePageSource, /<button className="mnt-btn" type="button" onClick=\{onBack\}>返回看板<\/button>\s*<TargetUpdatedAtBadge updatedAt=\{targetUpdatedAt\} \/>\s*<SaveBadge status=\{status\} \/>/);
  assert.doesNotMatch(maintenancePageSource, /activePage === 'target-maintenance' && <TargetUpdatedAtBadge/);
  assert.match(maintenancePageSource, /const \[targetUpdatedAt, setTargetUpdatedAt\] = useState\(INITIAL_TARGET_UPDATED_AT\);/);
  assert.match(maintenancePageSource, /targetUpdatedAt=\{targetUpdatedAt\}/);
  assert.match(maintenancePageSource, /setTargetUpdatedAt\(nowFullLabel\(\)\);/);

  assert.match(targetUpdatedAtBlock, /min-height:\s*26px;/);
  assert.match(targetUpdatedAtBlock, /font-size:\s*12px;/);
  assert.match(targetUpdatedAtBlock, /color:\s*var\(--muted\);/);
  assert.match(targetUpdatedAtBlock, /white-space:\s*nowrap;/);
  assert.doesNotMatch(targetUpdatedAtBlock, /radial-gradient|var\(--glass-panel-bg\)|#[0-9a-fA-F]{3,6}/);
});
