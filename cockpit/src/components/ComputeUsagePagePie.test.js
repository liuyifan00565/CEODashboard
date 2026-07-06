/*
 更新时间: 2026-07-06 14:30:26 CST
 更新内容: 要求算力用量分布顶部小扇区折线外移上提，避免遮住数据。
*/
/*
 更新时间: 2026-07-06 14:21:24 CST
 更新内容: 要求算力用量分布保持完整圆环图，仅沿用自然外拉折线布局。
*/
/*
 更新时间: 2026-07-06 15:29:41 CST
 更新内容: 要求算力用量分布环图外拉折线显著加长并增强线条可见度。
*/
/*
 更新时间: 2026-07-06 15:17:44 CST
 更新内容: 要求算力用量分布环图外拉折线参照 ECharts 半环示例拉出两段折线。
*/
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

test('keeps the usage distribution chart as a full donut with lifted natural label lines', () => {
  assert.match(source, /const COMPUTE_USAGE_DISTRIBUTION_UNIT_LABEL = '客户占比权重';/);
  assert.match(source, /const COMPUTE_DEFAULT_PIE_CENTER = \['55%', '52%'\];/);
  assert.match(source, /const COMPUTE_DEFAULT_PIE_RADIUS = \['58%', '92%'\];/);
  assert.match(source, /const COMPUTE_USAGE_DISTRIBUTION_PIE_CENTER = \['45%', '52%'\];/);
  assert.match(source, /const COMPUTE_USAGE_DISTRIBUTION_PIE_RADIUS = \['54%', '86%'\];/);
  assert.doesNotMatch(source, /COMPUTE_USAGE_DISTRIBUTION_PIE_ANGLES/);
  assert.match(source, /const isUsageDistributionPie = unitLabel === COMPUTE_USAGE_DISTRIBUTION_UNIT_LABEL;/);
  assert.match(source, /const pieCenter = isUsageDistributionPie \? COMPUTE_USAGE_DISTRIBUTION_PIE_CENTER : COMPUTE_DEFAULT_PIE_CENTER;/);
  assert.match(source, /const pieRadius = isUsageDistributionPie \? COMPUTE_USAGE_DISTRIBUTION_PIE_RADIUS : COMPUTE_DEFAULT_PIE_RADIUS;/);
  assert.doesNotMatch(source, /const pieAngles =/);
  assert.match(source, /const pieLabelLine = isUsageDistributionPie \? COMPUTE_USAGE_DISTRIBUTION_LABEL_LINE : COMPUTE_DEFAULT_LABEL_LINE;/);
  assert.match(source, /const COMPUTE_DEFAULT_LABEL_LINE = \{\s*length:\s*12,\s*length2:\s*16,\s*smooth:\s*false,\s*width:\s*1,\s*opacity:\s*\.72,\s*\};/);
  assert.match(source, /const COMPUTE_USAGE_DISTRIBUTION_LABEL_LINE = \{\s*length:\s*24,\s*length2:\s*20,\s*smooth:\s*false,\s*width:\s*1,\s*opacity:\s*\.78,\s*\};/);
  assert.match(source, /if \(params\.data\?\.wrapLabel\) \{/);
  assert.match(source, /wrapLabel:\s*isUsageDistributionPie/);
  assert.match(source, /return `\{name\|\$\{name\}\}\\n\{value\|\$\{params\.percent\}%\}`;/);
  assert.match(source, /radius:\s*pieRadius/);
  assert.match(source, /center:\s*pieCenter/);
  assert.doesNotMatch(source, /\.\.\.pieAngles,/);
  assert.match(source, /labelLine:\s*\{[\s\S]*?length:\s*pieLabelLine\.length,[\s\S]*?length2:\s*pieLabelLine\.length2,[\s\S]*?smooth:\s*pieLabelLine\.smooth/);
  assert.match(source, /lineStyle:\s*\{\s*color:\s*tokens\.chartAxis,\s*width:\s*pieLabelLine\.width,\s*opacity:\s*pieLabelLine\.opacity\s*\}/);
  assert.match(source, /buildPieOption\(\{ data: versionPieData, tokens, unitLabel: '消耗权重', naturalLabelLayout: true \}\)/);
  assert.match(source, /buildPieOption\(\{ data: distributionPieData, tokens, unitLabel: '客户占比权重', naturalLabelLayout: true \}\)/);
});
