/*
 更新时间: 2026-07-03 11:28:32 CST
 更新内容: 要求版本情况半环图对称轴精准对齐数量/金额切换按钮。
*/
/*
 更新时间: 2026-07-03 11:17:34 CST
 更新内容: 要求版本情况半环图右移并保持数量/金额切换位置不变。
*/
/*
 更新时间: 2026-07-01 18:37:59 CST
 更新内容: 版本情况回归测试约束图表和二级弹窗无紫色发光背景。
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
  assert.match(source, /import \{ useEffect, useMemo, useRef, useState \} from 'react';/);
  assert.match(source, /import \{ createPortal \} from 'react-dom';/);
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

test('matches the version half ring size to the recovery half ring', () => {
  assert.match(source, /className="vf-ring-chart" style=\{\{ height: 326 \}\}/);
  assert.match(css, /\.vf-ring \{[\s\S]*?width: clamp\(430px, 34vw, 560px\);/);
  assert.match(css, /\.vf-ring \{[\s\S]*?min-height: 326px;/);
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
  assert.match(css, /\.vf-card-zone \{[\s\S]*?align-self: start;/);
  assert.match(css, /\.vf-card-grid \{[\s\S]*?height: min\(100%, 304px\);/);
  assert.match(css, /\.vf-card-grid \{[\s\S]*?grid-template-rows: repeat\(2, minmax\(124px, 1fr\)\);/);
  assert.match(css, /\.vf-card-grid \{[\s\S]*?align-content: stretch;/);
  assert.match(css, /\.vf-version-card \{[\s\S]*?justify-content: space-between;/);
  assert.match(css, /\.vf-version-footer \{[\s\S]*?gap: 7px;/);
});

test('adds a KPI-style secondary expand entry and version detail modal', () => {
  assert.match(source, /import \* as echarts from 'echarts';/);
  assert.match(source, /import gsap from 'gsap';/);
  assert.match(source, /import MultiSegmented from '\.\/MultiSegmented';/);
  assert.match(source, /import Segmented from '\.\/Segmented';/);
  assert.match(source, /const VERSION_DETAIL_MODES = \[/);
  assert.match(source, /label: '金额'/);
  assert.match(source, /label: '套数'/);
  assert.match(source, /function VersionDetailModal/);
  assert.match(source, /return createPortal\(modal, document\.body\);/);
  assert.match(source, /function buildVersionDetailSeries\(\{ salesKeys, mode, dim, versionKey \}\)/);
  assert.match(source, /className="km-overlay vf-detail-overlay"/);
  assert.match(source, /className="km-mask vf-detail-mask"/);
  assert.match(source, /className="km-card vf-detail-card"/);
  assert.match(source, /点击展开二级 ▸/);
  assert.match(source, /className="vf-version-footer"/);
  assert.match(source, /setDetailVersionKey\(v\.key\)/);
  assert.match(source, /versionKey=\{detailVersionKey\}/);
  assert.match(source, /<MultiSegmented options=\{SALES_FILTER_OPTS\}/);
  assert.match(source, /<Segmented options=\{VERSION_DETAIL_MODES\}/);
  assert.match(source, /{DIM_FOOTER\[dim\]} · {versionName}{modeMeta\.label}合计/);
  assert.match(css, /\.vf-expand-hint/);
  assert.match(css, /\.vf-version-footer/);
  assert.match(css, /\.vf-detail-card/);
  assert.match(css, /\.vf-detail-card \{[\s\S]*?width: min\(720px, calc\(100vw - 48px\)\);/);
  assert.match(css, /\.vf-detail-card \{[\s\S]*?max-height: calc\(100vh - 48px\);/);
  assert.match(css, /\.vf-detail-card \{[\s\S]*?linear-gradient\(90deg, rgba\(9, 9, 13, \.96\), rgba\(5, 5, 8, \.96\) 52%, rgba\(3, 3, 6, \.98\)\)/);
  assert.match(css, /\.vf-detail-card \{[\s\S]*?rgba\(4, 4, 7, \.96\);/);
  assert.doesNotMatch(css, /\.vf-detail-card \{[\s\S]*?radial-gradient\(circle at 20% 42%, rgba\(255, 79, 216/);
  assert.doesNotMatch(css, /\.vf-detail-card \{[\s\S]*?radial-gradient\(circle at 4% 86%, rgba\(96, 0, 255/);
  assert.match(css, /\.vf-detail-card \{[\s\S]*?backdrop-filter: blur\(26px\) saturate\(145%\);/);
  assert.match(css, /\.vf-panel \{[\s\S]*?overflow: visible;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?position: fixed;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?inset: 0;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?width: 100vw;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?height: 100vh;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?z-index: 1000;/);
  assert.match(css, /\.vf-detail-mask \{[\s\S]*?background: rgba\(0, 0, 0, \.82\);/);
  assert.match(css, /\.vf-detail-mask \{[\s\S]*?backdrop-filter: blur\(14px\) saturate\(120%\);/);
});

test('opens the matching secondary card from any point on a version card', () => {
  assert.match(source, /className="vf-version-card"[\s\S]*?role="button"[\s\S]*?tabIndex=\{0\}/);
  assert.match(source, /onClick=\{\(\) => setDetailVersionKey\(v\.key\)\}/);
  assert.match(source, /onKeyDown=\{\(event\) => \{[\s\S]*?event\.key === 'Enter'[\s\S]*?event\.key === ' '[\s\S]*?setDetailVersionKey\(v\.key\)/);
  assert.match(source, /<span className="vf-expand-hint">[\s\S]*?点击展开二级 ▸[\s\S]*?<\/span>/);
  assert.doesNotMatch(source, /<button type="button" className="vf-expand-hint"/);
  assert.match(css, /\.vf-version-card \{[\s\S]*?cursor: pointer;/);
  assert.match(css, /\.vf-version-card:hover,[\s\S]*?\.vf-version-card:focus-visible \{/);
  assert.match(css, /\.vf-expand-hint \{[\s\S]*?pointer-events: none;/);
});

test('nudges the version half ring right while keeping the mode switch fixed', () => {
  assert.match(source, /center: \['49\.5%', '70%'\]/);
  assert.match(css, /\.vf-ring-pane \{[\s\S]*?align-items: flex-start;/);
  assert.match(css, /\.vf-ring-pane \{[\s\S]*?padding-top: 6px;/);
  assert.match(css, /\.vf-ring-pane \{[\s\S]*?padding-left: 4px;/);
  assert.match(css, /\.vf-metric-switch \{[\s\S]*?align-self: center;[\s\S]*?margin-left: -28px;/);
  assert.match(css, /\.vf-ring-pane::before \{[\s\S]*?content: none;/);
  assert.doesNotMatch(css, /\.vf-ring\s*\{[\s\S]*?filter: drop-shadow\(0 0 20px rgba\(255, 79, 216/);
  assert.match(css, /\.vf-ring \{[\s\S]*?margin-top: -24px;/);
  assert.match(css, /\.vf-ring \{[\s\S]*?margin-left: -16px;/);
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
