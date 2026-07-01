/*
 更新时间: 2026-07-01 15:19:39 CST
 更新内容: 版本情况回归测试约束合计数量/金额显示在标题下方左上角，并要求右侧四卡片上下均衡。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { VERSIONS } from '../data/mock.js';

const source = readFileSync(new URL('./VersionFinancePanel.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./VersionFinancePanel.css', import.meta.url), 'utf8');
const dashboardCss = readFileSync(new URL('../dashboard.css', import.meta.url), 'utf8');

test('keeps VersionFinancePanel free of the removed finance health summary', () => {
  assert.doesNotMatch(source, /vf-finance/);
  assert.doesNotMatch(source, /vf-health/);
  assert.doesNotMatch(source, /createFinanceHealthOption/);
  assert.doesNotMatch(css, /\.vf-finance/);
  assert.doesNotMatch(css, /\.vf-health/);
});

test('renders the large overview layout with half ring and amount/count switch', () => {
  assert.match(source, /import \{ useState \} from 'react';/);
  assert.match(source, /import EChart from '\.\/EChart';/);
  assert.match(source, /const VERSION_DISPLAY_KEYS = \['qihang', 'zhuoyue', 'zhizun', 'custom'\];/);
  assert.match(source, /const VERSION_MODES = \[/);
  assert.match(source, /label: '数量'/);
  assert.match(source, /label: '金额'/);
  assert.match(source, /function versionHalfRingOption/);
  assert.match(css, /\.vf-overview/);
  assert.match(css, /\.vf-ring/);
  assert.match(css, /\.vf-metric-switch/);
  assert.match(css, /\.vf-card-grid/);
});

test('places both totals under the version title instead of inside the ring', () => {
  assert.match(source, /className="vf-total-stack"/);
  assert.match(source, /合计数量/);
  assert.match(source, /合计金额/);
  assert.doesNotMatch(source, /className="vf-ring-summary"/);
  assert.doesNotMatch(source, /className="vf-ring-center"/);
  assert.match(css, /\.vf-total-stack/);
  assert.doesNotMatch(css, /\.vf-ring-summary/);
  assert.doesNotMatch(css, /\.vf-ring-center/);
});

test('balances the four right-side version cards vertically', () => {
  assert.match(css, /\.vf-card-grid \{[\s\S]*?align-self: center;/);
  assert.match(css, /\.vf-card-grid \{[\s\S]*?align-content: center;/);
  assert.match(css, /\.vf-card-grid \{[\s\S]*?grid-template-rows: repeat\(2, minmax\(118px, 136px\)\);/);
});

test('keeps the overview version row aligned to the large recovery card height', () => {
  assert.match(dashboardCss, /\.dash-grid--overview\{\s*grid-template-columns:minmax\(0,1\.6fr\) minmax\(0,1fr\);\s*grid-template-rows:minmax\(326px,1fr\) minmax\(326px,342px\);/);
});

test('shows four primary version cards with compact original facts', () => {
  assert.deepEqual(
    VERSIONS
      .filter((version) => ['qihang', 'zhuoyue', 'zhizun', 'custom'].includes(version.key))
      .map((version) => version.name),
    ['启航版', '卓越版', '至尊版', '定制版']
  );

  for (const version of VERSIONS) {
    assert.equal(typeof version.currentRenewalDue, 'number', `${version.name} should have current due renewal amount`);
    assert.equal(typeof version.currentRenewalPaid, 'number', `${version.name} should have current paid renewal amount`);
    assert.equal(
      version.currentRenewalRate,
      version.currentRenewalDue ? +(version.currentRenewalPaid / version.currentRenewalDue * 100).toFixed(1) : 0
    );
  }

  assert.match(source, /vf-version-price/);
  assert.match(source, /vf-version-mom/);
  assert.match(source, /label="套数"/);
  assert.match(source, /label="回款"/);
  assert.doesNotMatch(source, /当期应续费金额/);
  assert.doesNotMatch(source, /当期已续费金额/);
  assert.doesNotMatch(source, /当期续费率/);
});
