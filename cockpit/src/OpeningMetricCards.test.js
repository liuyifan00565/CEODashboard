/*
 更新时间: 2026-07-01 18:37:59 CST
 更新内容: 增加开户数小卡片无左上紫色发光及对应二级数据回归测试。
*/
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { getKpiSeries, OPENING_ACCOUNT_METRICS } from './data/mock.js';

const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const mockSource = readFileSync(new URL('./data/mock.js', import.meta.url), 'utf8');
const componentPath = fileURLToPath(new URL('./components/OpeningMetricCards.jsx', import.meta.url));
const cssPath = fileURLToPath(new URL('./components/OpeningMetricCards.css', import.meta.url));

test('exports month and today opening-account metrics with trend deltas', () => {
  assert.match(mockSource, /export const OPENING_ACCOUNT_METRICS = \[/);
  assert.match(mockSource, /title:\s*'本月开户数'/);
  assert.match(mockSource, /title:\s*'今日开户数'/);
  assert.match(mockSource, /metric:\s*'monthOpenings'/);
  assert.match(mockSource, /metric:\s*'todayOpenings'/);
  assert.match(mockSource, /delta:\s*8\.2/);
  assert.match(mockSource, /keywords:\s*\['开户', '本月开户数', '今日开户数'\]/);
});

test('provides matching secondary series for each opening-account metric', () => {
  const monthMetric = OPENING_ACCOUNT_METRICS.find((metric) => metric.key === 'month-openings');
  const todayMetric = OPENING_ACCOUNT_METRICS.find((metric) => metric.key === 'today-openings');

  assert.equal(monthMetric?.metric, 'monthOpenings');
  assert.equal(todayMetric?.metric, 'todayOpenings');
  assert.equal(getKpiSeries(monthMetric.metric, { dim: 'month' }).at(-1).value, monthMetric.value);
  assert.equal(getKpiSeries(todayMetric.metric, { dim: 'day' }).at(-1).value, todayMetric.value);
});

test('renders opening-account cards below the homepage recovery KPI stack only', () => {
  assert.match(appSource, /import OpeningMetricCards from '\.\/components\/OpeningMetricCards';/);
  assert.match(appSource, /const showOpeningMetrics = activeMenu === 'overview';/);
  assert.match(appSource, /const openCardData = useMemo\(\s*\(\) => filteredKpiCards\.find\(\(card\) => card\.key === openCard\?\.key\) \?\? openCard \?\? null,/);
  assert.match(appSource, /<div className="dash-kpis">[\s\S]*?<\/div>\s*\{showOpeningMetrics && \(\s*<OpeningMetricCards onOpenSecondary=\{handleOpenCard\} \/>/);
  assert.doesNotMatch(appSource, /monthRecoveryCard && handleOpenCard\(monthRecoveryCard\)/);
});

test('implements compact horizontal opening-account cards', () => {
  assert.equal(existsSync(componentPath), true, 'OpeningMetricCards.jsx should exist');
  assert.equal(existsSync(cssPath), true, 'OpeningMetricCards.css should exist');

  const componentSource = readFileSync(componentPath, 'utf8');
  const cssSource = readFileSync(cssPath, 'utf8');

  assert.match(componentSource, /import \{ OPENING_ACCOUNT_METRICS \} from '\.\.\/data\/mock';/);
  assert.match(componentSource, /className="opening-metric-cards"/);
  assert.match(componentSource, /export default function OpeningMetricCards\(\{ onOpenSecondary \}\)/);
  assert.match(componentSource, /type="button"/);
  assert.match(componentSource, /onClick=\{\(\) => onOpenSecondary\?\.\(metric\)\}/);
  assert.match(componentSource, /className="opening-metric-card__delta"/);
  assert.match(componentSource, /<div className="opening-metric-card__hint">点击展开二级 ▸<\/div>/);
  assert.match(componentSource, /▲ \{formatDelta\(metric\.delta\)\}/);
  assert.match(cssSource, /\.opening-metric-cards\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(cssSource, /\.opening-metric-card\s*\{[\s\S]*?min-height:\s*118px;[\s\S]*?border:\s*1px solid var\(--line-2\);[\s\S]*?background:\s*transparent;/);
  assert.match(cssSource, /\.opening-metric-card__hint\s*\{[\s\S]*?grid-column:\s*1 \/ -1;[\s\S]*?color:\s*var\(--faint\);/);
  assert.doesNotMatch(cssSource, /\.opening-metric-card::before/);
  assert.doesNotMatch(cssSource, /rgba\(var\(--warn-rgb\), \.24\)/);
  assert.match(cssSource, /@media \(max-width:760px\) \{[\s\S]*?grid-template-columns:\s*1fr;/);
});
