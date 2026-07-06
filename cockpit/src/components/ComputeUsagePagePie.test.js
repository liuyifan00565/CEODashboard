/*
 更新时间: 2026-07-06 15:03:18 CST
 更新内容: 要求算力用量分布环图外拉标签换行，避免最右侧长区间被截断。
*/
/*
 更新时间: 2026-07-06 12:25:08 CST
 更新内容: 新增算力用量分布环图左移回归测试，避免右侧外拉标签被裁切。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./ComputeUsagePage.jsx', import.meta.url), 'utf8');

test('moves only the usage distribution donut left so right-side labels stay visible', () => {
  assert.match(source, /const COMPUTE_USAGE_DISTRIBUTION_UNIT_LABEL = '客户占比权重';/);
  assert.match(source, /const COMPUTE_DEFAULT_PIE_CENTER = \['55%', '52%'\];/);
  assert.match(source, /const COMPUTE_DEFAULT_PIE_RADIUS = \['58%', '92%'\];/);
  assert.match(source, /const COMPUTE_USAGE_DISTRIBUTION_PIE_CENTER = \['45%', '52%'\];/);
  assert.match(source, /const COMPUTE_USAGE_DISTRIBUTION_PIE_RADIUS = \['54%', '86%'\];/);
  assert.match(source, /const isUsageDistributionPie = unitLabel === COMPUTE_USAGE_DISTRIBUTION_UNIT_LABEL;/);
  assert.match(source, /const pieCenter = isUsageDistributionPie \? COMPUTE_USAGE_DISTRIBUTION_PIE_CENTER : COMPUTE_DEFAULT_PIE_CENTER;/);
  assert.match(source, /const pieRadius = isUsageDistributionPie \? COMPUTE_USAGE_DISTRIBUTION_PIE_RADIUS : COMPUTE_DEFAULT_PIE_RADIUS;/);
  assert.match(source, /if \(params\.data\?\.wrapLabel\) \{/);
  assert.match(source, /wrapLabel:\s*isUsageDistributionPie/);
  assert.match(source, /return `\{name\|\$\{name\}\}\\n\{value\|\$\{params\.percent\}%\}`;/);
  assert.match(source, /radius:\s*pieRadius/);
  assert.match(source, /center:\s*pieCenter/);
  assert.match(source, /buildPieOption\(\{ data: versionPieData, tokens, unitLabel: '消耗权重', naturalLabelLayout: true \}\)/);
  assert.match(source, /buildPieOption\(\{ data: distributionPieData, tokens, unitLabel: '客户占比权重' \}\)/);
});
