/*
 更新时间: 2026-07-06 14:41:51 CST
 更新内容: 要求月度经营趋势完成率蓝色读数横向偏移最终改为 13px，纵向保持上移 2px。
*/
/*
 更新时间: 2026-07-06 14:41:51 CST
 更新内容: 要求月度经营趋势完成率蓝色读数横向偏移改为 12，并整体上移 2px。
*/
/*
 更新时间: 2026-07-06 14:41:51 CST
 更新内容: 要求月度经营趋势完成率蓝色读数整体向左移动。
*/
/*
 更新时间: 2026-07-06 14:31:30 CST
 更新内容: 要求月度经营趋势完成率读数避开折线并保留轻微文字阴影。
*/
/*
 更新时间: 2026-07-06 16:26:12 CST
 更新内容: 要求月度经营趋势完成率读数从当前下方位置继续上移贴近折线。
*/
/*
 更新时间: 2026-07-06 16:07:18 CST
 更新内容: 要求月度经营趋势完成率读数贴近折线下方红框位置，不再过低。
*/
/*
 更新时间: 2026-07-06 15:44:36 CST
 更新内容: 要求月度经营趋势完成率读数放到折线下方并向柱子右侧偏移。
*/
/*
 更新时间: 2026-07-06 14:44:12 CST
 更新内容: 要求月度经营趋势完成率折线、圆点和读数改为图二青蓝色。
*/
/*
 更新时间: 2026-07-06 14:30:24 CST
 更新内容: 要求月度经营趋势完成率读数贴近折线原点上方，避免距离过高。
*/
/*
 更新时间: 2026-07-06 14:18:47 CST
 更新内容: 要求月度经营趋势完成率读数取消黑色贴片，仅保留荧光黄文字。
*/
/*
 更新时间: 2026-07-06 14:03:06 CST
 更新内容: 要求月度经营趋势完成率读数固定悬浮在折线上方，不再显示在线条上。
*/
/*
 更新时间: 2026-07-06 13:37:20 CST
 更新内容: 要求月度经营趋势完成率读数使用清晰贴片并预留更高顶部空间。
*/
/*
 更新时间: 2026-07-06 12:25:08 CST
 更新内容: 新增月度经营趋势折线图稳定性回归测试，防止完成率数据变化后标签溢出或重叠。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./MonthlyTrend.jsx', import.meta.url), 'utf8');
const completionLabelBlock = source.match(/label:\s*\{[\s\S]*?formatter:\s*\(\{ value \}\) => `\$\{Number\(value\)\.toFixed\(1\)\}%`,\n\s*\}/)?.[0] ?? '';

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
  assert.match(source, /completionAxisMax\(values\)[\s\S]*?Math\.max\(24,\s*maxValue \* 0\.18\)/);
  assert.match(source, /grid:\s*\{[\s\S]*?top:\s*68[\s\S]*?right:\s*24[\s\S]*?bottom:\s*12/);
  assert.match(source, /const COMPLETION_LABEL_OFFSET = \[13,\s*0\];/);
  assert.match(source, /const COMPLETION_LINE_COLOR = '#43eaff';/);
  assert.doesNotMatch(source, /position:\s*\(params\) => \(params\.dataIndex % 2 === 0 \? 'top' : 'bottom'\)/);
  assert.match(source, /label:\s*\{[\s\S]*?position:\s*'bottom'/);
  assert.match(source, /offset:\s*COMPLETION_LABEL_OFFSET/);
  assert.match(source, /align:\s*'left'/);
  assert.match(source, /lineStyle:\s*\{\s*color:\s*COMPLETION_LINE_COLOR,\s*width:\s*2\s*\}/);
  assert.match(source, /itemStyle:\s*\{\s*color:\s*COMPLETION_LINE_COLOR/);
  assert.match(completionLabelBlock, /color:\s*COMPLETION_LINE_COLOR/);
  assert.doesNotMatch(source, /progressColor/);
  assert.doesNotMatch(completionLabelBlock, /COLOR\.good/);
  assert.doesNotMatch(completionLabelBlock, /backgroundColor:/);
  assert.doesNotMatch(completionLabelBlock, /borderColor:/);
  assert.doesNotMatch(completionLabelBlock, /borderWidth:/);
  assert.doesNotMatch(completionLabelBlock, /borderRadius:/);
  assert.doesNotMatch(completionLabelBlock, /padding:/);
  assert.match(source, /fontWeight:\s*700/);
  assert.match(source, /distance:\s*2/);
  assert.match(source, /textShadowColor:\s*'rgba\(0,\s*0,\s*0,\s*\.72\)'/);
  assert.match(source, /textShadowBlur:\s*5/);
  assert.match(source, /Math\.max\(8,\s*labelY \+ 4\)/);
  assert.match(source, /formatter:\s*\(\{ value \}\) => `\$\{Number\(value\)\.toFixed\(1\)\}%`/);
  assert.match(source, /labelLayout:\s*completionLabelLayout/);
  assert.match(source, /showAllSymbol:\s*true/);
  assert.match(source, /clip:\s*false/);
});
