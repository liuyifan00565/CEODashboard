/*
 更新时间: 2026-07-06 14:57:00 CST
 更新内容: 更新开户数卡片断言，匹配 MySQL 聚合数据 getter 入口。
*/
/*
 更新时间: 2026-07-03 11:09:47 CST
 更新内容: 增加“今日”搜索只定位今日开户数、不误命中本月开户数的回归测试。
*/
/*
 更新时间: 2026-07-03 10:59:56 CST
 更新内容: 增加顶部搜索输入“今日”可定位到开户数卡片的回归测试。
*/
/*
 更新时间: 2026-07-02 15:13:35 CST
 更新内容: 增加开户数小卡片上移到首页财务卡片区的回归测试。
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

  const monthMetric = OPENING_ACCOUNT_METRICS.find((metric) => metric.key === 'month-openings');
  const todayMetric = OPENING_ACCOUNT_METRICS.find((metric) => metric.key === 'today-openings');
  assert.deepEqual(monthMetric?.keywords, ['开户', '本月开户数']);
  assert.deepEqual(todayMetric?.keywords, ['开户', '今日开户数']);
});

test('provides matching secondary series for each opening-account metric', () => {
  const monthMetric = OPENING_ACCOUNT_METRICS.find((metric) => metric.key === 'month-openings');
  const todayMetric = OPENING_ACCOUNT_METRICS.find((metric) => metric.key === 'today-openings');

  assert.equal(monthMetric?.metric, 'monthOpenings');
  assert.equal(todayMetric?.metric, 'todayOpenings');
  assert.equal(getKpiSeries(monthMetric.metric, { dim: 'month' }).at(-1).value, monthMetric.value);
  assert.equal(getKpiSeries(todayMetric.metric, { dim: 'day' }).at(-1).value, todayMetric.value);
});

test('renders opening-account cards in the homepage finance KPI stack only', () => {
  assert.match(appSource, /import OpeningMetricCards from '\.\/components\/OpeningMetricCards';/);
  assert.match(appSource, /const showOpeningMetrics = activeMenu === 'overview';/);
  assert.match(appSource, /const openCardData = useMemo\(\s*\(\) => filteredKpiCards\.find\(\(card\) => card\.key === openCard\?\.key\) \?\? openCard \?\? null,/);
  assert.match(appSource, /<div className="dash-finance-kpi-item dash-finance-kpi-item--openings" data-kpi-key="openings">[\s\S]*?<OpeningMetricCards searchTerm=\{searchTerm\} onOpenSecondary=\{handleOpenCard\} \/>[\s\S]*?<\/div>/);
  assert.doesNotMatch(appSource, /<div className="dash-kpis">[\s\S]*?<\/div>\s*\{showOpeningMetrics && \(\s*<OpeningMetricCards onOpenSecondary=\{handleOpenCard\} \/>/);
  assert.doesNotMatch(appSource, /monthRecoveryCard && handleOpenCard\(monthRecoveryCard\)/);
});

test('implements compact horizontal opening-account cards', () => {
  assert.equal(existsSync(componentPath), true, 'OpeningMetricCards.jsx should exist');
  assert.equal(existsSync(cssPath), true, 'OpeningMetricCards.css should exist');

  const componentSource = readFileSync(componentPath, 'utf8');
  const cssSource = readFileSync(cssPath, 'utf8');

  assert.match(componentSource, /import \{ getOpeningAccountMetrics \} from '\.\.\/data\/mock';/);
  assert.match(componentSource, /const metrics = getOpeningAccountMetrics\(\);/);
  assert.match(componentSource, /import \{ matchesSearchTerm \} from '\.\.\/lib\/searchMatch';/);
  assert.match(componentSource, /import SearchResultBorder from '\.\/SearchResultBorder';/);
  assert.match(componentSource, /className="opening-metric-cards"/);
  assert.match(componentSource, /export default function OpeningMetricCards\(\{ searchTerm = '', onOpenSecondary \}\)/);
  assert.match(componentSource, /<SearchResultBorder active=\{matchesSearchTerm\(metric\.keywords,\s*searchTerm\)\} key=\{metric\.key\}>[\s\S]*?<button/);
  assert.match(componentSource, /type="button"/);
  assert.match(componentSource, /onClick=\{\(\) => onOpenSecondary\?\.\(metric\)\}/);
  assert.match(componentSource, /<\/button>\s*<\/SearchResultBorder>/);
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
