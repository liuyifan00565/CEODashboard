/*
 更新时间: 2026-07-13 19:26:40 CST
 更新内容: 年度折叠条回归补充加粗进度条和右侧完成百分比。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./components/OperatingOverview.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./components/OperatingOverview.css', import.meta.url), 'utf8');

test('shows the annual recovery summary before monthly progress and keeps details collapsed initially', () => {
  assert.match(source, /const \[annualExpanded, setAnnualExpanded\] = useState\(false\);/);
  assert.ok(source.indexOf('op-search-result--annual') < source.indexOf('op-search-result--progress'));
  assert.match(source, /className="op-annual-summary"[\s\S]*?<h2>年度回款总览<\/h2>[\s\S]*?className="op-annual-summary-progress"[\s\S]*?className="op-annual-toggle"/);
  assert.match(source, /aria-expanded=\{annualExpanded\}/);
  assert.match(source, /aria-controls="annual-overview-details"/);
  assert.match(source, /onClick=\{\(\) => setAnnualExpanded\(\(expanded\) => !expanded\)\}/);
  assert.match(source, /id="annual-overview-details"[\s\S]*?aria-hidden=\{!annualExpanded\}[\s\S]*?inert=\{!annualExpanded\}/);
  assert.doesNotMatch(source, /op-annual-progress-footer/);
});

test('uses one thick progress bar with a percentage and animates the annual detail reveal', () => {
  assert.match(css, /grid-template-areas:\s*"annual"\s*"progress";/);
  assert.match(css, /\.op-annual-summary\s*\{[\s\S]*?grid-template-columns:\s*max-content minmax\(140px, 1fr\) 32px;/);
  assert.match(source, /className="op-annual-progress-track"[\s\S]*?<strong>\{formatPct\(KPI_DERIVED\.yearCompletion\)\}<\/strong>/);
  assert.match(css, /\.op-annual-summary-progress\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto;/);
  assert.match(css, /\.op-annual-progress-track\s*\{[\s\S]*?height:\s*14px;/);
  assert.match(css, /\.op-annual-details\s*\{[\s\S]*?grid-template-rows:\s*0fr;[\s\S]*?opacity:\s*0;/);
  assert.match(css, /\.op-panel--annual\.is-expanded \.op-annual-details\s*\{[\s\S]*?grid-template-rows:\s*1fr;[\s\S]*?opacity:\s*1;/);
  assert.match(css, /\.op-panel--annual\.is-expanded \.op-annual-toggle-icon\s*\{[\s\S]*?rotate\(225deg\);/);
});
