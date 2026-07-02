/*
 更新时间: 2026-07-02 11:52:30 CST
 更新内容: 增加算力用量分析顶部 KPI 卡片悬浮时不显示流光边框的回归测试。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const computePageCss = readFileSync(new URL('./components/ComputeUsagePage.css', import.meta.url), 'utf8');

test('keeps top compute KPI cards free of hover border flow', () => {
  assert.doesNotMatch(computePageCss, /@property --cpu-kpi-flow-angle/);
  assert.doesNotMatch(computePageCss, /--cpu-kpi-flow-angle/);
  assert.doesNotMatch(computePageCss, /\.cpu-kpi::after/);
  assert.doesNotMatch(computePageCss, /cpuKpiFlow/);
  assert.doesNotMatch(computePageCss, /conic-gradient\(\s*from var\(--cpu-kpi-flow-angle\)/);
});
