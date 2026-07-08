/*
 更新时间: 2026-07-08 18:22:00 CST
 更新内容: 版本二级明细测试同步当前筛选、主结论和纯文字对比摘要结构。
*/
/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: 版本情况测试同步银紫玫瑰半环阴影与切换器选中态。
*/
/*
 更新时间: 2026-07-06 10:00:00 CST
 更新内容: 增加版本二级明细弹窗继承高级果味母版结构的回归测试。
*/
/*
 更新时间: 2026-07-05 23:42:14 CST
 更新内容: 版本情况首页高度对齐测试同步到当前 dash-secondary-grid 二级布局。
*/
/*
 更新时间: 2026-07-04 01:03:12 CST
 更新内容: 约束版本情况补充经营洞察，并继续弱化表头、分割线与环比列对齐。
*/
/*
 更新时间: 2026-07-04 00:21:24 CST
 更新内容: 约束版本情况控制器移到右上、半环只标前两项、表格增加版本色点并弱化表头与环比亮度。
*/
/*
 更新时间: 2026-07-03 23:48:36 CST
 更新内容: 版本情况右侧展示从四张卡片改为六列表格，并要求每行继续打开版本二级弹窗。
*/
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

function cssRuleBody(sourceText, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return sourceText.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\n\\}`))?.groups.body ?? '';
}

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
  assert.match(css, /\.vf-version-table-wrap/);
});

test('places the amount/count switch in the top-right toolbar aligned with the table', () => {
  assert.match(source, /<header className="vf-head">[\s\S]*?<div className="vf-metric-switch" role="tablist" aria-label="版本情况统计口径">/);
  assert.doesNotMatch(source, /<div className="vf-ring-pane">[\s\S]*?<div className="vf-metric-switch" role="tablist" aria-label="版本情况统计口径">/);
  assert.match(css, /\.vf-head \{[\s\S]*?right: 18px;[\s\S]*?justify-content: space-between;/);
  assert.match(css, /\.vf-metric-switch \{[\s\S]*?align-self: flex-start;[\s\S]*?margin-left: 0;/);
  assert.match(css, /\.vf-overview \{[\s\S]*?padding-top: 44px;/);
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

test('renders a scannable six-column table for the four right-side versions', () => {
  assert.match(css, /\.vf-card-zone \{[\s\S]*?align-self: start;/);
  assert.match(source, /function versionShare\(version, totalUnits\)/);
  assert.match(source, /function versionDotColor\(index\)/);
  assert.match(source, /const tableRows = versions\.map\(\(version, index\) => \(\{[\s\S]*?share: versionShare\(version, countTotal\),/);
  assert.match(source, /dotColor: versionDotColor\(index\),/);
  assert.match(source, /<table className="vf-version-table"/);
  assert.match(source, /<th scope="col">版本<\/th>/);
  assert.match(source, /<th scope="col">单价<\/th>/);
  assert.match(source, /<th scope="col">套数<\/th>/);
  assert.match(source, /<th scope="col">占比<\/th>/);
  assert.match(source, /<th scope="col">回款<\/th>/);
  assert.match(source, /<th scope="col">环比<\/th>/);
  assert.match(source, /<span className="vf-version-table__dot" style=\{\{ background: row\.dotColor \}\} aria-hidden="true" \/>/);
  assert.match(source, /<td className="vf-version-table__share">\{row\.share\}%<\/td>/);
  assert.match(css, /\.vf-version-table-wrap\s*\{[\s\S]*?overflow-x:\s*auto;/);
  assert.match(css, /\.vf-version-table\s*\{[\s\S]*?width:\s*100%;[\s\S]*?border-collapse:\s*separate;/);
  assert.match(css, /\.vf-version-table th,[\s\S]*?\.vf-version-table td\s*\{[\s\S]*?padding: 13px 12px;[\s\S]*?border-bottom: 1px solid rgba\(218, 226, 255, \.055\);/);
  assert.match(css, /\.vf-version-table thead th\s*\{[\s\S]*?background:\s*rgba\(0, 0, 0, \.055\);[\s\S]*?color: rgba\(239,251,255,\.42\);/);
  assert.match(css, /\.vf-version-table__row:hover,[\s\S]*?\.vf-version-table__row:focus-visible\s*\{[\s\S]*?background:\s*var\(--glass-cell-hover\);/);
  assert.match(css, /\.vf-version-table__name-inner\s*\{[\s\S]*?display:\s*inline-flex;[\s\S]*?gap:\s*12px;/);
  assert.match(css, /\.vf-version-table__dot\s*\{[\s\S]*?width:\s*8px;[\s\S]*?border-radius:\s*999px;/);
  assert.match(css, /\.vf-version-table__mom\s*\{[\s\S]*?display: block;[\s\S]*?min-width: 52px;[\s\S]*?text-align: right;/);
  assert.doesNotMatch(source, /className="vf-version-card"/);
  assert.doesNotMatch(css, /\.vf-card-grid/);
  assert.doesNotMatch(css, /\.vf-version-card/);
});

test('adds a concise operating insight under the version half ring', () => {
  const insightBlock = cssRuleBody(css, '.vf-insight');

  assert.match(source, /<p className="vf-insight">/);
  assert.match(source, /启航版贡献主要销量，卓越版贡献最高回款，定制版保持高客单补充。/);
  assert.match(css, /\.vf-insight \{[\s\S]*?position: absolute;[\s\S]*?left: 24px;[\s\S]*?bottom: 18px;[\s\S]*?max-width: 430px;[\s\S]*?margin: 0;[\s\S]*?color: rgba\(239,251,255,\.62\);/);
  assert.doesNotMatch(insightBlock, /box-shadow:/);
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
  assert.match(source, /aria-label=\{`查看\$\{row\.name\}版本二级数据`\}/);
  assert.match(source, /setDetailVersionKey\(row\.key\)/);
  assert.match(source, /versionKey=\{detailVersionKey\}/);
  assert.match(source, /<MultiSegmented options=\{SALES_FILTER_OPTS\}/);
  assert.match(source, /<Segmented options=\{VERSION_DETAIL_MODES\}/);
  assert.match(source, /className="km-title-wrap"[\s\S]*?<h3 className="km-title">\{DIM_TITLE\[dim\]\}\{versionName\}\{modeMeta\.label\}<\/h3>[\s\S]*?<p className="km-subtitle">\{versionDetailSubtitle\(dim, versionName, modeMeta\.label\)\}<\/p>/);
  assert.match(source, /<div className="km-filter-group">[\s\S]*?<span className="km-filter-label">渠道<\/span>[\s\S]*?<MultiSegmented options=\{SALES_FILTER_OPTS\}/);
  assert.match(source, /<div className="km-filter-group">[\s\S]*?<span className="km-filter-label">口径<\/span>[\s\S]*?<Segmented options=\{VERSION_DETAIL_MODES\}/);
  assert.match(source, /<div className="km-filter-group">[\s\S]*?<span className="km-filter-label">粒度<\/span>[\s\S]*?<Segmented options=\{DIM_OPTS\}/);
  assert.match(source, /className="km-metric-section"/);
  assert.match(source, /className="km-time-tag">\{selected\.label\}<\/span>/);
  assert.match(source, /className="km-scope-line">当前筛选：\{scope\}<\/span>/);
  assert.match(source, /className="km-hl-insight">\{versionDetailInsight\(trendText, mom\)\}<\/span>/);
  assert.match(source, /const trendText = versionDetailTrendDescription\(series, selIndex, selected, modeMeta\.unit\);/);
  assert.match(source, /className="km-summary km-summary--plain vf-detail-summary"/);
  assert.match(source, /versionSummary\.map\(\(item\) =>/);
  assert.doesNotMatch(source, /className="km-summary-progress-fill"[\s\S]*?versionSummary\.rate/);
  assert.doesNotMatch(source, /DIM_FOOTER/);
  assert.match(css, /\.vf-detail-card/);
  assert.match(css, /\.vf-detail-card \{[\s\S]*?width: min\(760px, calc\(100vw - 48px\)\);/);
  assert.match(css, /\.vf-detail-card \{[\s\S]*?max-height: calc\(100vh - 48px\);/);
  assert.doesNotMatch(css, /\.vf-detail-card \{[\s\S]*?linear-gradient\(90deg, rgba\(9, 9, 13, \.96\), rgba\(5, 5, 8, \.96\) 52%, rgba\(3, 3, 6, \.98\)\)/);
  assert.match(css, /\.vf-detail-summary \{[\s\S]*?margin-top: 18px;/);
  assert.doesNotMatch(css, /\.vf-detail-card \{[\s\S]*?radial-gradient\(circle at 20% 42%, rgba\(255, 79, 216/);
  assert.doesNotMatch(css, /\.vf-detail-card \{[\s\S]*?radial-gradient\(circle at 4% 86%, rgba\(96, 0, 255/);
  assert.match(css, /\.vf-panel \{[\s\S]*?overflow: visible;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?position: fixed;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?inset: 0;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?width: 100vw;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?height: 100vh;/);
  assert.match(css, /\.vf-detail-overlay \{[\s\S]*?z-index: 1000;/);
  assert.match(css, /\.vf-detail-mask \{[\s\S]*?background: rgba\(0, 0, 0, \.82\);/);
  assert.match(css, /\.vf-detail-mask \{[\s\S]*?backdrop-filter: blur\(14px\) saturate\(120%\);/);
});

test('opens the matching secondary modal from any point on a version table row', () => {
  assert.match(source, /<tr[\s\S]*?className="vf-version-table__row"[\s\S]*?role="button"[\s\S]*?tabIndex=\{0\}/);
  assert.match(source, /onClick=\{\(\) => setDetailVersionKey\(row\.key\)\}/);
  assert.match(source, /onKeyDown=\{\(event\) => \{[\s\S]*?event\.key === 'Enter'[\s\S]*?event\.key === ' '[\s\S]*?setDetailVersionKey\(row\.key\)/);
  assert.match(source, /aria-label=\{`查看\$\{row\.name\}版本二级数据`\}/);
  assert.match(css, /\.vf-version-table__row\s*\{[\s\S]*?cursor:\s*pointer;/);
  assert.match(css, /\.vf-version-table__row:hover,[\s\S]*?\.vf-version-table__row:focus-visible \{/);
});

test('keeps the version half ring calm and labels only the two largest versions', () => {
  assert.match(source, /const isMajorLabel = index < 2;/);
  assert.match(source, /label:\s*\{[\s\S]*?show: isMajorLabel,/);
  assert.match(source, /labelLine:\s*\{[\s\S]*?show: isMajorLabel,/);
  assert.match(source, /center: \['49\.5%', '68%'\]/);
  assert.match(source, /shadowBlur: 5,/);
  assert.match(source, /shadowColor: 'rgba\(184, 156, 255, \.08\)'/);
  assert.match(css, /\.vf-ring-pane \{[\s\S]*?align-items: flex-start;/);
  assert.match(css, /\.vf-ring-pane \{[\s\S]*?padding-top: 0;/);
  assert.match(css, /\.vf-ring-pane \{[\s\S]*?padding-left: 4px;/);
  assert.match(css, /\.vf-ring-pane::before \{[\s\S]*?content: none;/);
  assert.doesNotMatch(css, /\.vf-ring\s*\{[\s\S]*?filter: drop-shadow\(0 0 20px rgba\(255, 79, 216/);
  assert.match(css, /\.vf-ring \{[\s\S]*?margin-top: -10px;/);
  assert.match(css, /\.vf-ring \{[\s\S]*?margin-left: -16px;/);
});

test('uses restrained silver-rose selected state and softer table deltas', () => {
  assert.match(css, /\.vf-metric-switch__thumb \{[\s\S]*?background: linear-gradient\(135deg, rgba\(142, 134, 255, \.72\), rgba\(228, 184, 215, \.46\)\);/);
  assert.match(css, /\.vf-metric-switch__thumb \{[\s\S]*?box-shadow: 0 0 16px rgba\(184, 156, 255, \.20\), 0 1px 8px rgba\(0, 0, 0, 0\.28\);/);
  assert.match(css, /\.vf-metric-switch__btn \{[\s\S]*?color: rgba\(255,255,255,\.65\);/);
  assert.match(css, /\.vf-metric-switch__btn--active,[\s\S]*?\.vf-metric-switch__btn--active:hover \{[\s\S]*?color: #fff;/);
  assert.doesNotMatch(css, /\.vf-metric-switch__thumb \{[\s\S]*?background: var\(--control-solid\);/);
  assert.match(css, /\.vf-version-table__mom \{[\s\S]*?opacity: \.82;[\s\S]*?text-shadow: none;/);
});

test('keeps the overview version row aligned to the large recovery card height', () => {
  assert.match(dashboardCss, /\.dash-secondary-grid\{\s*flex:1;min-height:0;display:grid;gap:16px;\s*grid-template-columns:minmax\(0,1\.6fr\) minmax\(0,1fr\);\s*grid-template-rows:minmax\(326px,1fr\) minmax\(326px,342px\);/);
  assert.match(dashboardCss, /\.dash-secondary-cell--version\{grid-area:version\}/);
});

test('shows four primary version table rows with original facts and count share', () => {
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

  assert.match(source, /vf-version-table__price/);
  assert.match(source, /vf-version-table__mom/);
  assert.match(source, /vf-version-table__units/);
  assert.match(source, /vf-version-table__recovered/);
  assert.match(source, /share: versionShare\(version, countTotal\)/);
  assert.doesNotMatch(source, /当期应续费金额/);
  assert.doesNotMatch(source, /当期已续费金额/);
  assert.doesNotMatch(source, /当期续费率/);
});
