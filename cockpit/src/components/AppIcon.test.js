/*
 更新时间: 2026-07-14 10:30:00 CST
 更新内容: 回归锁定数据更新看板 monitor 图标进入统一 AppIcon 映射。
*/
/*
 更新时间: 2026-07-08 13:28:16 CST
 更新内容: 增加渠道图标语义回归测试，要求使用来源节点汇入中心节点的图形。
*/
/*
 更新时间: 2026-07-02 17:02:00 CST
 更新内容: 调整 AppIcon 名称列表测试，验证组件静态属性而非命名导出。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const iconComponentUrl = new URL('./AppIcon.jsx', import.meta.url);
const iconSource = existsSync(iconComponentUrl) ? readFileSync(iconComponentUrl, 'utf8') : '';
const sidebarSource = readFileSync(new URL('./Sidebar.jsx', import.meta.url), 'utf8');
const dateRangeSource = readFileSync(new URL('./DateRangePicker.jsx', import.meta.url), 'utf8');
const themeToggleSource = readFileSync(new URL('./ThemeToggle.jsx', import.meta.url), 'utf8');
const searchSource = readFileSync(new URL('./ExpandableSearch.jsx', import.meta.url), 'utf8');
const kpiModalSource = readFileSync(new URL('./KpiModal.jsx', import.meta.url), 'utf8');
const versionFinanceSource = readFileSync(new URL('./VersionFinancePanel.jsx', import.meta.url), 'utf8');
const channelPanelSource = readFileSync(new URL('./ChannelPanel.jsx', import.meta.url), 'utf8');
const computeUsageSource = readFileSync(new URL('./ComputeUsagePage.jsx', import.meta.url), 'utf8');
const aiWidgetSource = readFileSync(new URL('./AIAnalysisWidget.jsx', import.meta.url), 'utf8');
test('defines a single AppIcon entry point with business icon aliases', () => {
  assert.ok(existsSync(iconComponentUrl), 'AppIcon.jsx should exist');
  assert.match(iconSource, /const APP_ICON_NAMES/);
  assert.match(iconSource, /AppIcon\.names = APP_ICON_NAMES/);
  assert.match(iconSource, /const ICON_PATHS = \{/);
  assert.match(iconSource, /function AppIcon/);
  assert.match(iconSource, /export default AppIcon/);
  assert.match(iconSource, /viewBox="0 0 24 24"/);
  assert.match(iconSource, /strokeLinecap="round"/);
  assert.match(iconSource, /strokeLinejoin="round"/);

  for (const name of [
    'overview',
    'compute',
    'target',
    'cost',
    'organization',
    'channel',
    'monitor',
    'calendar',
    'sun',
    'moon',
    'search',
    'close',
    'chevronLeft',
    'chevronRight',
    'chevronDown',
    'sortAsc',
    'sortDesc',
    'filter',
  ]) {
    assert.match(iconSource, new RegExp(`\\b${name}:`), `AppIcon should map ${name}`);
  }
});

test('renders sidebar navigation icons through the shared AppIcon system', () => {
  assert.match(sidebarSource, /import AppIcon from '\.\/AppIcon';/);
  assert.doesNotMatch(sidebarSource, /const ICONS = \[/);
  assert.match(sidebarSource, /<AppIcon name=\{item\.icon \?\? item\.key\}/);
  assert.match(sidebarSource, /className="sb-icon"/);
});

test('draws the channel glyph as source nodes mapped into a channel hub', () => {
  assert.match(iconSource, /channel:\s*\([\s\S]*?<circle cx="12" cy="12" r="3\.2" \/>/);
  assert.match(iconSource, /<circle cx="5\.2" cy="6" r="2\.1" \/>/);
  assert.match(iconSource, /<circle cx="5\.2" cy="18" r="2\.1" \/>/);
  assert.match(iconSource, /<circle cx="18\.8" cy="12" r="2\.1" \/>/);
  assert.doesNotMatch(iconSource, /M17\.5 6l-3\.5 2\.5 3\.5 2\.5/);
});

test('uses shared AppIcon glyphs for topbar utility controls', () => {
  assert.match(dateRangeSource, /import AppIcon from '\.\/AppIcon';/);
  assert.match(dateRangeSource, /<AppIcon name="calendar"/);
  assert.match(themeToggleSource, /import AppIcon from '\.\/AppIcon';/);
  assert.match(themeToggleSource, /<AppIcon name=\{theme === 'dark' \? 'sun' : 'moon'\}/);
  assert.match(searchSource, /import AppIcon from '\.\/AppIcon';/);
  assert.match(searchSource, /<AppIcon name="search"/);
});

test('uses shared AppIcon glyphs for modal and table control icons', () => {
  assert.match(kpiModalSource, /import AppIcon from '\.\/AppIcon';/);
  assert.match(kpiModalSource, /<AppIcon name="close"/);
  assert.doesNotMatch(kpiModalSource, />×<\/button>/);

  assert.match(versionFinanceSource, /import AppIcon from '\.\/AppIcon';/);
  assert.match(versionFinanceSource, /<AppIcon name="close"/);
  assert.doesNotMatch(versionFinanceSource, />×<\/button>/);

  assert.match(channelPanelSource, /import AppIcon from '\.\/AppIcon';/);
  assert.match(channelPanelSource, /<AppIcon name="close"/);
  assert.match(channelPanelSource, /<AppIcon name="chevronRight"/);
  assert.doesNotMatch(channelPanelSource, />×<\/button>/);

  assert.match(computeUsageSource, /import AppIcon from '\.\/AppIcon';/);
  assert.match(computeUsageSource, /<AppIcon name="filter"/);
  assert.match(computeUsageSource, /<AppIcon name="sortAsc"/);
  assert.match(computeUsageSource, /<AppIcon name="sortDesc"/);
  assert.match(computeUsageSource, /<AppIcon name="chevronLeft"/);
  assert.match(computeUsageSource, /<AppIcon name="chevronRight"/);
  assert.match(computeUsageSource, /<AppIcon name="chevronDown"/);
  assert.doesNotMatch(computeUsageSource, />[‹›]<\/button>/);

  assert.match(aiWidgetSource, /import AppIcon from '\.\/AppIcon';/);
  assert.match(aiWidgetSource, /<AppIcon name="close"/);
  assert.doesNotMatch(aiWidgetSource, />\s*×\s*<\/button>/);
});
