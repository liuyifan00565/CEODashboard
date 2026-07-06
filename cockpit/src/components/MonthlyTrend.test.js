/*
 更新时间: 2026-07-06 12:25:08 CST
 更新内容: 新增月度经营趋势折线图稳定性回归测试，防止完成率数据变化后标签溢出或重叠。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./MonthlyTrend.jsx', import.meta.url), 'utf8');

test('keeps the completion line readable for changing monthly trend data', () => {
  assert.match(source, /function safeTrendNumber\(value\)/);
  assert.match(source, /function normalizeTrendRows\(trend\)/);
  assert.match(source, /function completionAxisMax\(values\)/);
  assert.match(source, /function completionLabelLayout\(params\)/);
  assert.match(source, /const normalizedTrend = normalizeTrendRows\(getChannelTrend\(channelKey\)\);/);
  assert.match(source, /const completionAxisLimit = completionAxisMax\(completion\);/);
  assert.doesNotMatch(source, /max:\s*100,/);
  assert.match(source, /max:\s*completionAxisLimit/);
  assert.match(source, /scale:\s*true/);
  assert.match(source, /grid:\s*\{[\s\S]*?top:\s*54[\s\S]*?right:\s*18[\s\S]*?bottom:\s*10/);
  assert.match(source, /label:\s*\{[\s\S]*?position:\s*\(params\) => \(params\.dataIndex % 2 === 0 \? 'top' : 'bottom'\)/);
  assert.match(source, /formatter:\s*\(\{ value \}\) => `\$\{Number\(value\)\.toFixed\(1\)\}%`/);
  assert.match(source, /labelLayout:\s*completionLabelLayout/);
  assert.match(source, /showAllSymbol:\s*true/);
  assert.match(source, /clip:\s*false/);
});
