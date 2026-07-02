/*
 更新时间: 2026-07-02 18:10:27 CST
 更新内容: 合并 GitHub 数据维护回归测试与本地品牌、搜索和顶部栏测试。
*/
/*
 Update time: 2026-07-02 17:34:56 CST
 Update content: Guard current search result highlighting against full-card purple glow.
*/
/*
 Update time: 2026-07-02 17:18:50 CST
 Update content: Add Word-style search navigation and current-result highlight regression tests.
*/
/*
 Update time: 2026-07-02 17:12:03 CST
 Update content: Add a brand title regression test for 福客经营驾驶舱, compact month label, CEO视角 subtitle, and 3D default text.
*/
/*
 Update time: 2026-07-02 16:41:14 CST
 Update content: Add a layout regression test that keeps only search in the top toolbar.
*/
/*
 更新时间: 2026-07-02 15:13:35 CST
 更新内容: 增加首页财务卡片区移除续费率、开户数上移和总投入下移的布局回归测试。
*/
/*
 更新时间: 2026-07-02 17:32:46 CST
 更新内容: 增加维护页顶部、内容卡片和表格恢复为算力页原透明玻璃样式的回归测试。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const mockSource = readFileSync(new URL('./data/mock.js', import.meta.url), 'utf8');
const fluidGlassSource = readFileSync(new URL('./components/FluidGlass/FluidGlass.jsx', import.meta.url), 'utf8');
const dashboardCss = readFileSync(new URL('./dashboard.css', import.meta.url), 'utf8');
const projectAgentGuidance = readFileSync(new URL('../../AGENTS.md', import.meta.url), 'utf8');
const kpiCardCss = readFileSync(new URL('./components/KpiCard.css', import.meta.url), 'utf8');
const kpiModalSource = readFileSync(new URL('./components/KpiModal.jsx', import.meta.url), 'utf8');
const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');
const deliveryPanelCss = readFileSync(new URL('./components/DeliveryPanel.css', import.meta.url), 'utf8');
const channelPanelSource = readFileSync(new URL('./components/ChannelPanel.jsx', import.meta.url), 'utf8');
const channelPanelCss = readFileSync(new URL('./components/ChannelPanel.css', import.meta.url), 'utf8');
const computePageSource = readFileSync(new URL('./components/ComputeUsagePage.jsx', import.meta.url), 'utf8');
const computePageCss = readFileSync(new URL('./components/ComputeUsagePage.css', import.meta.url), 'utf8');
const maintenancePageSource = readFileSync(new URL('./components/MaintenancePage.jsx', import.meta.url), 'utf8');
const maintenancePageCss = readFileSync(new URL('./components/MaintenancePage.css', import.meta.url), 'utf8');

function cssRuleBody(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\n\\}`))?.groups.body ?? '';
}

test('keeps all dashboard data cards on fixed grid layouts', () => {
  assert.doesNotMatch(appSource, /DraggableKpiLayer/);
  assert.doesNotMatch(appSource, /DraggablePanelLayer/);
  assert.match(appSource, /className="dash-kpis"/);
  assert.match(appSource, /data-kpi-key=\{card\.key\}/);
  assert.match(appSource, /const gridClassName = activeMenu === 'overview'/);
  assert.match(appSource, /className=\{gridClassName\}/);
});

test('renders compute usage analysis as an independent dashboard page', () => {
  assert.match(appSource, /import ComputeUsagePage from '\.\/components\/ComputeUsagePage';/);
  assert.match(appSource, /const isComputePage = activeMenu === 'compute';/);
  assert.match(appSource, /isComputePage \? \(/);
  assert.match(appSource, /<ComputeUsagePage searchTerm=\{searchTerm\} dim=\{dim\} dateRange=\{dateRange\} \/>/);
  assert.match(appSource, /: \(\s*<>\s*<div className="dash-kpis">/);
});

test('uses trend-panel glass backgrounds without BorderGlow sweep for top compute KPI cards', () => {
  const computeKpiBlock = cssRuleBody(computePageCss, '.cpu-kpi');
  const computeTrendPanelBlock = cssRuleBody(computePageCss, '.cpu-panel');

  assert.doesNotMatch(computePageSource, /import BorderGlow from '\.\/BorderGlow\/BorderGlow';/);
  assert.doesNotMatch(computePageSource, /<BorderGlow/);
  assert.match(computePageSource, /<article className=\{`cpu-kpi cpu-kpi--\$\{tone\}\$\{active \? ' cpu-kpi--match' : ''\}`\}>/);
  assert.match(computePageCss, /\.cpu-kpi \{[\s\S]*?border:\s*1px solid var\(--line-2\);[\s\S]*?border-radius:\s*16px;[\s\S]*?box-shadow:\s*var\(--glass-shadow\);/);
  assert.match(computeKpiBlock, /background:\s*transparent;/);
  assert.match(computeTrendPanelBlock, /background:\s*transparent;/);
  assert.doesNotMatch(computeKpiBlock, /#101012/);
  assert.doesNotMatch(computeKpiBlock, /radial-gradient\(circle at 82% 12%/);
  assert.doesNotMatch(computePageCss, /\.cpu-kpi::before/);
  assert.doesNotMatch(computePageCss, /cpu-kpi-glow/);
  assert.doesNotMatch(computePageCss, /cpuAiBorderSweep/);
  assert.doesNotMatch(computePageCss, /--edge-proximity/);
  assert.doesNotMatch(computePageSource, /cpu-kpi--pink-flow/);
  assert.doesNotMatch(computePageCss, /cpu-kpi--pink-flow/);
  assert.doesNotMatch(computePageCss, /cpuPinkFlow/);
  assert.doesNotMatch(computePageCss, /conic-gradient\(\s*from var\(--cpu-flow-angle\)/);
});

test('removes the compute page inner title and ratio header block', () => {
  assert.doesNotMatch(computePageSource, /cpu-eyebrow/);
  assert.doesNotMatch(computePageSource, /cpu-head/);
  assert.doesNotMatch(computePageCss, /\.cpu-head/);
  assert.doesNotMatch(computePageSource, /Compute Usage/);
  assert.doesNotMatch(computePageSource, /近30日消耗、容量与客户用量结构/);
  assert.doesNotMatch(computePageSource, /日用量环比/);
  assert.doesNotMatch(computePageSource, /previousTrend/);
  assert.doesNotMatch(computePageSource, /<p>/);
  assert.match(computePageCss, /\.cpu-page \{[\s\S]*?margin-top:\s*0;/);
});

test('keeps only compute usage in the compute trend chart with clear non-fluorescent value labels', () => {
  assert.match(computePageSource, /data:\s*\['算力用量'\]/);
  assert.match(computePageSource, /sub="算力用量"/);
  assert.doesNotMatch(computePageSource, /同步观察总容量/);
  assert.match(computePageSource, /itemWidth:\s*18/);
  assert.match(computePageSource, /itemHeight:\s*12/);
  assert.match(computePageSource, /itemGap:\s*22/);
  assert.match(computePageSource, /textStyle:\s*\{[\s\S]*?color:\s*txt,[\s\S]*?fontSize:\s*18,[\s\S]*?fontWeight:\s*850,[\s\S]*?textShadowColor:\s*'rgba\(0,0,0,\.55\)',[\s\S]*?textShadowBlur:\s*8,[\s\S]*?\}/);
  assert.match(computePageSource, /name:\s*'算力用量'[\s\S]*?type:\s*'bar'/);
  assert.match(computePageSource, /name:\s*'算力用量'[\s\S]*?type:\s*'line'[\s\S]*?smooth:\s*true[\s\S]*?symbol:\s*'circle'[\s\S]*?symbolSize:\s*7/);
  assert.match(computePageSource, /const usagePeakLineColor = '#f000ff';/);
  assert.match(computePageSource, /const usagePeakLabelColor = '#f8f4ff';/);
  assert.match(computePageSource, /const maxUsage = Math\.max\(\.\.\.usage\);/);
  assert.match(computePageSource, /const usagePeakLineData = usage\.map\(\(value\) => \(\{/);
  assert.match(computePageSource, /label:\s*\{[\s\S]*?show:\s*true[\s\S]*?color:\s*usagePeakLabelColor,[\s\S]*?fontWeight:\s*780,[\s\S]*?formatter:\s*\(params\) => formatWan\(params\.value\)[\s\S]*?textBorderColor:\s*'rgba\(13,0,22,\.82\)'[\s\S]*?textBorderWidth:\s*2[\s\S]*?textShadowColor:\s*'rgba\(0,0,0,\.82\)'[\s\S]*?textShadowBlur:\s*6/);
  assert.doesNotMatch(computePageSource, /label:\s*value === maxUsage \?/);
  assert.doesNotMatch(computePageSource, /textShadowColor:\s*'rgba\(255,74,255,\.78\)'/);
  assert.match(computePageSource, /lineStyle:\s*\{ color: usagePeakLineColor, width: 2\.4[\s\S]*?shadowBlur: 14[\s\S]*?shadowColor: 'rgba\(240,0,255,\.5\)'/);
  assert.match(computePageSource, /itemStyle:\s*\{[\s\S]*?color:\s*usagePeakLineColor,[\s\S]*?borderColor:\s*'#ffffff'/);
  assert.match(computePageSource, /barCategoryGap:\s*'42%'/);
  assert.doesNotMatch(computePageSource, /目标用量/);
  assert.doesNotMatch(computePageSource, /完成率%/);
  assert.doesNotMatch(computePageSource, /label:\s*'完成率'/);
  assert.doesNotMatch(computePageSource, /barGap:\s*'-100%'/);
  assert.doesNotMatch(computePageSource, /yAxisIndex:\s*1/);
  assert.doesNotMatch(computePageSource, /const completionColor = '#f472b6';/);
  assert.doesNotMatch(computePageSource, /#dfff00/);
  assert.doesNotMatch(computePageSource, /#ff4d5f/);
  assert.match(computePageSource, /axisLabel:\s*\{ color: faint, fontSize: 12, interval: 0, hideOverlap: false, margin: 12 \}/);
  assert.match(computePageSource, /xAxis:\s*\{ axisLabel:\s*\{ interval: 0, hideOverlap: false, fontSize: 11 \} \}/);
  assert.doesNotMatch(computePageSource, /stack:\s*'usage'/);
  assert.doesNotMatch(computePageSource, /name:\s*'总容量'[\s\S]*?type:\s*'line'/);
});

test('keeps only search in the top toolbar while data keeps default monthly filters', () => {
  assert.doesNotMatch(appSource, /import ThemeToggle/);
  assert.doesNotMatch(appSource, /import DateRangePicker/);
  assert.doesNotMatch(appSource, /import Segmented/);
  assert.doesNotMatch(appSource, /const DIM_OPTS = \[/);
  assert.doesNotMatch(appSource, /COMPUTE_PERIOD_OPTS/);
  assert.doesNotMatch(appSource, /computePeriod/);
  assert.match(appSource, /const dim = 'month';/);
  assert.match(appSource, /const dateRange = DEFAULT_FILTER_RANGE;/);
  assert.match(appSource, /<div className="dash-tools">\s*<ExpandableSearch[\s\S]*?onChange=\{setSearchTerm\}[\s\S]*?currentIndex=\{searchStats\.current\}[\s\S]*?totalResults=\{searchStats\.total\}[\s\S]*?onNext=\{jumpToNextSearchResult\}[\s\S]*?\/>\s*<\/div>/);
  assert.doesNotMatch(appSource, /<DateRangePicker/);
  assert.doesNotMatch(appSource, /<Segmented options=\{DIM_OPTS\}/);
  assert.doesNotMatch(appSource, /<ThemeToggle/);
  assert.match(appSource, /<ComputeUsagePage searchTerm=\{searchTerm\} dim=\{dim\} dateRange=\{dateRange\} \/>/);
  assert.match(computePageSource, /export default function ComputeUsagePage\(\{ searchTerm = '', dim = 'month', dateRange = \[\] \}\)/);
  assert.match(computePageSource, /const periodLabel = DIM_TREND_LABELS\[dim\] \?\? DIM_TREND_LABELS\.month;/);
  assert.match(computePageSource, /const trend = getComputeUsageTrend\(\{ dim, dateRange \}\);/);
});

test('counts searchable matches and cycles the current result from the top search field', () => {
  assert.match(appSource, /const \[searchStats, setSearchStats\] = useState\(\{ current: 0, total: 0 \}\);/);
  assert.match(appSource, /const \[activeSearchIndex, setActiveSearchIndex\] = useState\(0\);/);
  assert.match(appSource, /function jumpToNextSearchResult\(\) \{/);
  assert.match(appSource, /setActiveSearchIndex\(\(index\) => \(index \+ 1\) % Math\.max\(searchStats\.total, 1\)\);/);
  assert.match(appSource, /querySelectorAll\('\[data-search-match="true"\]'\)/);
  assert.match(appSource, /node\.dataset\.searchCurrent = index === currentIndex \? 'true' : 'false';/);
  assert.match(appSource, /scrollIntoView\(\{ behavior: 'smooth', block: 'center', inline: 'nearest' \}\)/);
});

test('renders the brand title as 福客经营驾驶舱 with CEO monthly perspective', () => {
  assert.match(mockSource, /monthLabel: '2026年6月'/);
  assert.doesNotMatch(mockSource, /monthLabel: '2026 年 6 月'/);
  assert.match(appSource, /<b>福客经营驾驶舱<\/b>/);
  assert.match(appSource, /const activeContextLabel = maintenanceMode\s*\?\s*'数据维护'\s*:\s*activeMenu === 'overview' \? 'CEO视角' : activeMenuLabel;/);
  assert.match(appSource, /<small>\{META\.monthLabel\}｜\{activeContextLabel\}<\/small>/);
  assert.doesNotMatch(appSource, /福客 · CEO 经营驾驶舱/);
  assert.doesNotMatch(appSource, /\{META\.monthLabel\} · \{activeMenu === 'overview' \? '月度视角' : activeMenuLabel\}/);
  assert.match(fluidGlassSource, /福客经营驾驶舱/);
  assert.doesNotMatch(fluidGlassSource, /福客 · CEO 经营驾驶舱/);
});

test('adds a topbar data maintenance switch that swaps the sidebar navigation', () => {
  const maintenanceSwitchBlock = cssRuleBody(dashboardCss, '.dash-maintenance-switch');
  const maintenanceActiveBlock = cssRuleBody(dashboardCss, '.dash-maintenance-switch--active');

  assert.match(appSource, /import \{ META, MENU, MAINTENANCE_MENU, getDashboardChannelKey, getDashboardMenuLabel \} from '\.\/data\/mock';/);
  assert.match(appSource, /const DEFAULT_MAINTENANCE_MENU = MAINTENANCE_MENU\[0\]\?\.key \?\? 'target-maintenance';/);
  assert.match(appSource, /const \[maintenanceMode,\s*setMaintenanceMode\] = useState\(false\);/);
  assert.match(appSource, /const \[activeMaintenanceMenu,\s*setActiveMaintenanceMenu\] = useState\(DEFAULT_MAINTENANCE_MENU\);/);
  assert.match(appSource, /const sidebarItems = maintenanceMode \? MAINTENANCE_MENU : MENU;/);
  assert.match(appSource, /const sidebarActive = maintenanceMode \? activeMaintenanceMenu : activeMenu;/);
  assert.match(appSource, /const activeContextLabel = maintenanceMode\s*\?\s*'数据维护'\s*:/);
  assert.doesNotMatch(appSource, /`数据维护 · \$\{activeMaintenanceLabel\}`/);
  assert.match(appSource, /function handleSidebarChange\(nextMenu\) \{[\s\S]*?if \(maintenanceMode\) \{[\s\S]*?setActiveMaintenanceMenu\(nextMenu\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?handleMenuChange\(nextMenu\);[\s\S]*?\}/);
  assert.match(appSource, /function handleMaintenanceModeToggle\(\) \{[\s\S]*?if \(maintenanceMode\) \{[\s\S]*?setMaintenanceMode\(false\);[\s\S]*?setActiveMenu\('overview'\);[\s\S]*?setActiveMaintenanceMenu\(DEFAULT_MAINTENANCE_MENU\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?setMaintenanceMode\(true\);[\s\S]*?setActiveMaintenanceMenu\(DEFAULT_MAINTENANCE_MENU\);[\s\S]*?\}/);
  assert.match(appSource, /<Sidebar items=\{sidebarItems\} active=\{sidebarActive\} onChange=\{handleSidebarChange\} \/>/);
  assert.match(appSource, /className="maintenance-glass"/);
  assert.match(appSource, /<GlassSurface[\s\S]*?width=\{118\}[\s\S]*?height=\{52\}[\s\S]*?borderRadius=\{16\}[\s\S]*?brightness=\{58\}[\s\S]*?blur=\{12\}[\s\S]*?backgroundOpacity=\{0\.06\}[\s\S]*?distortionScale=\{-130\}[\s\S]*?className="maintenance-glass"[\s\S]*?<button/);
  assert.match(appSource, /className=\{`dash-maintenance-switch\$\{maintenanceMode \? ' dash-maintenance-switch--active' : ''\}`\}/);
  assert.match(appSource, /aria-pressed=\{maintenanceMode\}/);
  assert.match(appSource, /\{maintenanceMode \? '返回主界面' : '数据维护'\}/);
  assert.match(dashboardCss, /\.dash-topbar \.maintenance-glass\{[\s\S]*?margin-left:auto;/);
  assert.match(dashboardCss, /\.dash-topbar \.maintenance-glass \.glass-surface__content\{padding:0\}/);
  assert.match(maintenanceSwitchBlock, /width:100%;/);
  assert.match(maintenanceSwitchBlock, /height:100%;/);
  assert.match(maintenanceSwitchBlock, /border:none;/);
  assert.match(maintenanceSwitchBlock, /background:transparent;/);
  assert.doesNotMatch(maintenanceSwitchBlock, /background:var\(--ai-chip-bg\);/);
  assert.doesNotMatch(maintenanceActiveBlock, /background:var\(--ai-chip-hover\);/);
  assert.match(projectAgentGuidance, /所有卡片和按钮的背景、边框、模糊、阴影与圆角必须优先复用项目既有统一玻璃体系/);
});

test('renders data maintenance as four independent pages instead of the dashboard grid', () => {
  assert.match(appSource, /import MaintenancePage from '\.\/components\/MaintenancePage';/);
  assert.match(appSource, /const isMaintenancePage = maintenanceMode;/);
  assert.match(appSource, /function handleMaintenanceBack\(\) \{[\s\S]*?setMaintenanceMode\(false\);[\s\S]*?setActiveMenu\('overview'\);[\s\S]*?setActiveMaintenanceMenu\(DEFAULT_MAINTENANCE_MENU\);[\s\S]*?\}/);
  assert.match(appSource, /isMaintenancePage \? \([\s\S]*?<MaintenancePage activePage=\{activeMaintenanceMenu\} onBack=\{handleMaintenanceBack\} \/>[\s\S]*?\) : isComputePage \? \(/);
  assert.match(maintenancePageSource, /export default function MaintenancePage\(\{ activePage = 'target-maintenance', onBack \}\)/);
  assert.match(maintenancePageSource, /const PAGE_RENDERERS = \{/);
  assert.match(maintenancePageSource, /'target-maintenance': TargetMaintenancePage/);
  assert.match(maintenancePageSource, /'cost-maintenance': CostMaintenancePage/);
  assert.match(maintenancePageSource, /'org-maintenance': OrgMaintenancePage/);
  assert.match(maintenancePageSource, /'channel-maintenance': ChannelMaintenancePage/);
});

test('builds the target and cost maintenance pages from reference matrix content', () => {
  assert.match(maintenancePageSource, /MAINTENANCE_PERIOD_COLUMNS/);
  assert.match(maintenancePageSource, /TARGET_MAINTENANCE_ORG_TREE/);
  assert.match(maintenancePageSource, /TARGET_MAINTENANCE_ROWS/);
  assert.match(maintenancePageSource, /下载模板/);
  assert.match(maintenancePageSource, /Excel导入/);
  assert.match(maintenancePageSource, /保存目标/);
  assert.match(maintenancePageSource, /年度目标/);
  assert.match(maintenancePageSource, /目标维护/);
  assert.match(maintenancePageSource, /COST_MAINTENANCE_CHANNELS/);
  assert.match(maintenancePageSource, /COST_MAINTENANCE_ROWS/);
  assert.match(maintenancePageSource, /LABOR_COST_MAINTENANCE_ROWS/);
  assert.match(maintenancePageSource, /渠道成本维护/);
  assert.match(maintenancePageSource, /人力成本维护/);
  assert.match(maintenancePageSource, /保存成本/);
});

test('builds the org and channel maintenance pages from reference tree and table content', () => {
  assert.match(maintenancePageSource, /ORG_MAINTENANCE_DEPARTMENTS/);
  assert.match(maintenancePageSource, /ORG_MAINTENANCE_USERS/);
  assert.match(maintenancePageSource, /新增组织/);
  assert.match(maintenancePageSource, /更新 BI 销售人员/);
  assert.match(maintenancePageSource, /BI组织架构/);
  assert.match(maintenancePageSource, /BI人员范围/);
  assert.match(maintenancePageSource, /卫瓴ID/);
  assert.match(maintenancePageSource, /CHANNEL_MAINTENANCE_GROUPS/);
  assert.match(maintenancePageSource, /CHANNEL_MAINTENANCE_SOURCES/);
  assert.match(maintenancePageSource, /补齐默认来源/);
  assert.match(maintenancePageSource, /新增大类/);
  assert.match(maintenancePageSource, /新增来源/);
  assert.match(maintenancePageSource, /卫瓴线索来源/);
});

test('keeps data maintenance cards buttons and controls on the dashboard glass system', () => {
  const panelBlock = cssRuleBody(maintenancePageCss, '.mnt-surface');
  const buttonBlock = cssRuleBody(maintenancePageCss, '.mnt-btn');
  const primaryButtonBlock = cssRuleBody(maintenancePageCss, '.mnt-btn--primary');
  const inputBlock = cssRuleBody(maintenancePageCss, '.mnt-control');
  const toolbarBlock = cssRuleBody(maintenancePageCss, '.mnt-toolbar');
  const actionsBlock = cssRuleBody(maintenancePageCss, '.mnt-actions');
  const toolbarControlBlock = cssRuleBody(maintenancePageCss, '.mnt-toolbar .mnt-control');
  const targetLayoutBlock = cssRuleBody(maintenancePageCss, '.mnt-layout--target');
  const matrixWrapBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix-wrap');
  const computePanelBlock = cssRuleBody(computePageCss, '.cpu-panel');
  const progressBlock = cssRuleBody(maintenancePageCss, '.mnt-progress');
  const progressGoodBlock = cssRuleBody(maintenancePageCss, '.mnt-progress--good span');

  const toolbarSurfaceBlock = cssRuleBody(maintenancePageCss, '.mnt-toolbar-surface');

  assert.doesNotMatch(maintenancePageSource, /import GlassSurface from '\.\/GlassSurface\/GlassSurface';/);
  assert.match(maintenancePageSource, /function MaintenanceToolbarSurface/);
  assert.match(maintenancePageSource, /function MaintenanceSurface/);
  assert.match(maintenancePageSource, /<MaintenanceToolbarSurface className="mnt-toolbar-glass">[\s\S]*?<section className="mnt-toolbar"/);
  assert.match(maintenancePageSource, /<div className=\{`mnt-toolbar-surface \$\{className\}`\.trim\(\)\}>\{children\}<\/div>/);
  assert.match(maintenancePageSource, /<div className=\{`mnt-surface-shell \$\{className\}`\.trim\(\)\}>\s*<div className="mnt-surface">\{children\}<\/div>\s*<\/div>/);
  assert.doesNotMatch(maintenancePageSource, /<MaintenanceSurface className="mnt-toolbar-glass">/);
  assert.match(toolbarSurfaceBlock, /border:\s*1px solid var\(--line-2\);/);
  assert.match(toolbarSurfaceBlock, /height:\s*auto;/);
  assert.match(toolbarSurfaceBlock, /background:\s*transparent;/);
  assert.match(toolbarSurfaceBlock, /backdrop-filter:\s*var\(--glass-blur\);/);
  assert.match(toolbarSurfaceBlock, /box-shadow:\s*var\(--glass-shadow\);/);
  assert.doesNotMatch(toolbarSurfaceBlock, /var\(--glass-panel-bg\);/);
  assert.match(maintenancePageSource, /<h2>\{title\}<span className="mnt-title-scope"> · \{meta\.scope\}<\/span><\/h2>/);
  assert.doesNotMatch(maintenancePageSource, /<h2>\{title\}<\/h2>\s*<span>\{meta\.scope\}<\/span>/);
  assert.match(maintenancePageCss, /\.mnt-title-scope \{[\s\S]*?display:\s*inline;[\s\S]*?font-size:\s*12px;/);
  assert.doesNotMatch(maintenancePageCss, /\.mnt-toolbar \.mnt-title-block span \{/);
  assert.match(maintenancePageSource, /aria-label="目标年份"[\s\S]*?<\/select>\s*<button className="mnt-btn" type="button" onClick=\{onDirty\}>下载模板<\/button>/);
  assert.match(maintenancePageSource, /<div className="mnt-actions">\s*\{actions\[activePage\] \?\? actions\['target-maintenance'\]\}\s*<button className="mnt-btn" type="button" onClick=\{onBack\}>返回看板<\/button>\s*<SaveBadge status=\{status\} \/>/);
  assert.doesNotMatch(maintenancePageSource, /<div className="mnt-actions">\s*<SaveBadge/);
  assert.match(toolbarBlock, /min-height:\s*42px;/);
  assert.match(toolbarBlock, /padding:\s*6px 10px;/);
  assert.match(actionsBlock, /flex-wrap:\s*nowrap;/);
  assert.match(actionsBlock, /gap:\s*7px;/);
  assert.match(toolbarControlBlock, /width:\s*180px;/);
  assert.match(toolbarControlBlock, /flex:\s*0 0 180px;/);
  assert.match(targetLayoutBlock, /grid-template-columns:\s*minmax\(190px,\s*230px\) minmax\(0,\s*1fr\);/);
  assert.match(maintenancePageCss, /\.mnt-layout--cost,\s*[\s\S]*?\.mnt-layout--channel \{[\s\S]*?grid-template-columns:\s*minmax\(220px,\s*260px\) minmax\(0,\s*1fr\);/);
  assert.match(maintenancePageCss, /\.mnt-layout--org \{[\s\S]*?grid-template-columns:\s*minmax\(220px,\s*260px\) minmax\(0,\s*1fr\);/);
  assert.match(computePanelBlock, /background:\s*transparent;/);
  assert.match(panelBlock, /background:\s*transparent;/);
  assert.doesNotMatch(panelBlock, /var\(--panel\);/);
  assert.doesNotMatch(panelBlock, /var\(--glass-panel-bg\);/);
  assert.doesNotMatch(panelBlock, /radial-gradient\(circle at 20% 48%/);
  assert.doesNotMatch(maintenancePageCss, /\.mnt-surface::before/);
  assert.match(panelBlock, /border:\s*1px solid var\(--line-2\);/);
  assert.match(panelBlock, /backdrop-filter:\s*var\(--glass-blur\);/);
  assert.match(panelBlock, /box-shadow:\s*var\(--glass-shadow\);/);
  assert.match(matrixWrapBlock, /background:\s*transparent;/);
  assert.match(maintenancePageCss, /\.mnt-matrix th,\s*[\s\S]*?\.mnt-user-table th \{[\s\S]*?background:\s*rgba\(0,0,0,\.16\);[\s\S]*?backdrop-filter:\s*blur\(14px\);/);
  assert.match(maintenancePageCss, /\.mnt-matrix th:first-child,\s*[\s\S]*?\.mnt-matrix td:first-child \{[\s\S]*?background:\s*rgba\(0,0,0,\.14\);[\s\S]*?backdrop-filter:\s*blur\(14px\);/);
  assert.match(maintenancePageCss, /\.mnt-row--summary td \{[\s\S]*?background:\s*transparent;/);
  assert.match(maintenancePageCss, /\.mnt-matrix tbody tr:hover td,\s*[\s\S]*?\.mnt-user-table tbody tr:hover td \{[\s\S]*?background:\s*var\(--glass-cell-hover\);/);
  assert.match(maintenancePageSource, /<ProgressLine period=\{period\} \/>/);
  assert.match(progressBlock, /height:\s*7px;/);
  assert.match(progressBlock, /background:\s*rgba\(255,\s*255,\s*255,\s*\.09\);/);
  assert.match(progressGoodBlock, /background:\s*linear-gradient\(90deg,\s*rgba\(var\(--good-rgb\),\s*\.92\),\s*rgba\(255,255,255,\.78\)\);/);
  assert.match(buttonBlock, /min-height:\s*28px;/);
  assert.match(buttonBlock, /background:\s*var\(--glass-cell\);/);
  assert.match(buttonBlock, /border:\s*1px solid var\(--line\);/);
  assert.match(buttonBlock, /border-radius:\s*12px;/);
  assert.match(primaryButtonBlock, /background:\s*var\(--control-solid\);/);
  assert.match(inputBlock, /min-height:\s*28px;/);
  assert.match(inputBlock, /background:\s*var\(--glass-cell\);/);
  assert.match(maintenancePageCss, /\.mnt-edit-row,\s*[\s\S]*?\.mnt-channel-manage-row \{[\s\S]*?background:\s*var\(--panel-2\);/);
  assert.doesNotMatch(maintenancePageCss, /\.mnt-edit-row,[\s\S]*?background:\s*transparent;/);
  assert.doesNotMatch(maintenancePageCss, /\.mnt-row--summary td \{[\s\S]*?background:\s*rgba\(var\(--good-rgb\)/);
  assert.doesNotMatch(maintenancePageCss, /#fff;/);
  assert.doesNotMatch(maintenancePageCss, /box-shadow:\s*0 5px 14px rgba\(216, 58, 215/);
});

test('uses full-width compute trend sliders that resize from 3 to 15 bars', () => {
  assert.match(computePageSource, /const MIN_VISIBLE_TREND_BARS = 3;/);
  assert.match(computePageSource, /const MAX_VISIBLE_TREND_BARS = 15;/);
  assert.match(computePageSource, /const showSlider = days\.length > MAX_VISIBLE_TREND_BARS;/);
  assert.match(computePageSource, /function getTrendZoomRange\(pointCount\) \{/);
  assert.match(computePageSource, /const sliderEndValue = Math\.min\(MAX_VISIBLE_TREND_BARS - 1, pointCount - 1\);/);
  assert.match(computePageSource, /minValueSpan:\s*Math\.min\(MIN_VISIBLE_TREND_BARS - 1, sliderEndValue\)/);
  assert.match(computePageSource, /maxValueSpan:\s*sliderEndValue/);
  assert.match(computePageSource, /const \{ sliderEndValue, minValueSpan, maxValueSpan \} = getTrendZoomRange\(days\.length\);/);
  assert.equal((computePageSource.match(/getTrendZoomRange\(days\.length\)/g) ?? []).length, 2);
  assert.equal((computePageSource.match(/zoomLock:\s*false/g) ?? []).length, 4);
  assert.match(computePageSource, /dataZoom: showSlider \? \[/);
  assert.match(computePageSource, /startValue:\s*0/);
  assert.match(computePageSource, /endValue:\s*sliderEndValue/);
  assert.match(computePageSource, /minValueSpan,\s*\n\s*maxValueSpan,\s*\n\s*zoomLock:\s*false/);
  assert.doesNotMatch(computePageSource, /sliderWindowSpan/);
  assert.doesNotMatch(computePageSource, /zoomLock:\s*true/);
  assert.match(computePageSource, /realtime:\s*true/);
  assert.match(computePageSource, /borderColor:\s*'rgba\(192,132,252,\.32\)'/);
  assert.match(computePageSource, /fillerColor:\s*'rgba\(244,114,182,\.26\)'/);
  assert.match(computePageSource, /shadowColor:\s*'rgba\(192,132,252,\.56\)'/);
  assert.match(computePageSource, /shadowBlur:\s*16/);
  assert.match(computePageSource, /className="cpu-trend-echart"/);
  assert.match(computePageCss, /\.cpu-trend-chart \{[\s\S]*?position:\s*relative;/);
  assert.match(computePageCss, /\.cpu-trend-echart \{[\s\S]*?height:\s*100% !important;/);
  assert.doesNotMatch(computePageCss, /\.cpu-trend-chart > div,\s*[\s\S]*?height:\s*100% !important;/);
  assert.doesNotMatch(computePageSource, /cpu-trend-slider-glow/);
  assert.doesNotMatch(computePageCss, /cpu-trend-slider-glow/);
  assert.doesNotMatch(computePageCss, /cpuSliderGlow/);
  assert.match(computePageSource, /type:\s*'slider'[\s\S]*?showDetail:\s*false[\s\S]*?brushSelect:\s*false/);
  assert.match(computePageSource, /grid:\s*\{ top: 42, left: 10, right: 12, bottom: showSlider \? 44 : 8, containLabel: true \}/);
  assert.match(computePageSource, /const trend = getComputeUsageTrend\(\{ dim, dateRange \}\);/);
  assert.match(computePageCss, /grid-template-areas:\s*"trend trend"\s*"capacity capacity"\s*"version usage";/);
  assert.match(computePageCss, /\.cpu-panel--trend \{[\s\S]*?min-height:\s*560px;/);
  assert.match(computePageCss, /\.cpu-trend-chart \{[\s\S]*?min-height:\s*420px;/);
});

test('adds a linked full-width compute capacity trend card below usage trend', () => {
  assert.match(computePageSource, /function buildCapacityTrendOption\(\{ trend, tokens, totalCapacity \}\)/);
  assert.match(computePageSource, /const capacityColor = '#38f5ff';/);
  assert.match(computePageSource, /capacity:\s*point\.capacity \?\? 0/);
  assert.match(computePageSource, /const latestCapacityBase = buckets\[0\]\?\.capacity \|\| 1;/);
  assert.match(computePageSource, /const capacityScale = totalCapacity \/ latestCapacityBase;/);
  assert.match(computePageSource, /const capacity = buckets\.map\(\(point\) => Math\.round\(point\.capacity \* capacityScale\)\);/);
  assert.match(computePageSource, /value: formatInt\(params\[0\]\?\.value \|\| 0\)/);
  assert.match(computePageSource, /const capacityTrendOption = useMemo\([\s\S]*?buildCapacityTrendOption\(\{ trend, tokens, totalCapacity: overview\.totalCapacity \}\),[\s\S]*?\[trend, tokens, overview\.totalCapacity\]/);
  assert.match(computePageSource, /title=\{`\$\{periodLabel\}算力总容量趋势`\}/);
  assert.match(computePageSource, /sub="容量池变化 · 可调度算力"/);
  assert.match(computePageSource, /className="cpu-panel--capacity-trend"/);
  assert.match(computePageSource, /className="cpu-capacity-chart"/);
  assert.match(computePageSource, /className="cpu-capacity-echart"/);
  assert.match(computePageSource, /option=\{capacityTrendOption\}/);
  assert.match(computePageSource, /name:\s*'算力总容量'[\s\S]*?type:\s*'line'[\s\S]*?smooth:\s*true[\s\S]*?areaStyle:/);
  assert.match(computePageSource, /fillerColor:\s*'rgba\(56,245,255,\.24\)'/);
  assert.match(computePageSource, /borderColor:\s*'rgba\(56,245,255,\.34\)'/);
  assert.match(computePageSource, /shadowColor:\s*'rgba\(56,245,255,\.5\)'/);
  assert.match(computePageCss, /\.cpu-panel--capacity-trend \{[\s\S]*?grid-area:\s*capacity;[\s\S]*?min-height:\s*430px;/);
  assert.match(computePageCss, /\.cpu-capacity-chart \{[\s\S]*?min-height:\s*300px;/);
  assert.match(computePageCss, /\.cpu-capacity-echart \{[\s\S]*?height:\s*100% !important;/);
});

test('places compute pie cards side by side without bottom legend explanations', () => {
  assert.match(computePageCss, /\.cpu-grid \{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);[\s\S]*?grid-template-areas:\s*"trend trend"\s*"capacity capacity"\s*"version usage";/);
  assert.match(computePageCss, /\.cpu-panel--pie \{[\s\S]*?display:\s*flex;[\s\S]*?flex-direction:\s*column;/);
  assert.doesNotMatch(computePageCss, /\.cpu-panel--pie \{[^}]*grid-template-columns:/);
  assert.doesNotMatch(computePageSource, /sub="圆角环图 · 外拉标签"/);
  assert.doesNotMatch(computePageSource, /sub="客户用量区间 · 中心不堆数据"/);
  assert.doesNotMatch(computePageSource, /function PieSummary/);
  assert.doesNotMatch(computePageSource, /<PieSummary/);
  assert.doesNotMatch(computePageCss, /cpu-pie-summary/);
  assert.doesNotMatch(computePageCss, /cpu-pie-chip/);
  assert.match(computePageCss, /\.cpu-panel--version-pie \{[\s\S]*?min-height:\s*320px;/);
  assert.match(computePageCss, /\.cpu-panel--usage-pie \{[\s\S]*?min-height:\s*320px;/);
  assert.match(computePageCss, /\.cpu-panel--pie \.cpu-pie-wrap \{[\s\S]*?min-height:\s*218px;/);
  assert.doesNotMatch(computePageSource, /cpu-pie-scroll/);
  assert.doesNotMatch(computePageSource, /cpu-pie-stage/);
  assert.doesNotMatch(computePageCss, /cpu-pie-scroll/);
  assert.doesNotMatch(computePageCss, /cpu-pie-stage/);
  assert.doesNotMatch(computePageSource, /data\.slice\(0,\s*5\)\.map/);
});

test('keeps compute pie labels and tooltip cards readable around donut charts', () => {
  assert.match(computePageSource, /'padding:12px 14px'/);
  assert.match(computePageSource, /position:\s*'outer'/);
  assert.doesNotMatch(computePageSource, /alignTo:\s*'labelLine'/);
  assert.match(computePageSource, /radius:\s*\['58%', '92%'\]/);
  assert.match(computePageSource, /center:\s*\['55%', '52%'\]/);
  assert.doesNotMatch(computePageSource, /width:\s*126/);
  assert.doesNotMatch(computePageSource, /overflow:\s*'truncate'/);
  assert.doesNotMatch(computePageSource, /ellipsis:\s*'…'/);
  assert.match(computePageSource, /function formatPieLabelName/);
  assert.match(computePageSource, /formatPieLabelName\(params\.name\)/);
  assert.doesNotMatch(computePageSource, /edgeDistance:\s*12/);
  assert.doesNotMatch(computePageSource, /distanceToLabelLine:\s*0/);
  assert.doesNotMatch(computePageSource, /bleedMargin:\s*12/);
  assert.match(computePageSource, /labelLine:\s*\{[\s\S]*?show:\s*true,[\s\S]*?lineStyle:/);
  assert.match(computePageSource, /label:\s*\{[\s\S]*?fontSize:\s*14,[\s\S]*?lineHeight:\s*18/);
  assert.match(computePageSource, /name:\s*\{[\s\S]*?fontSize:\s*14,[\s\S]*?fontWeight:\s*820,[\s\S]*?textShadowBlur:\s*8/);
  assert.match(computePageSource, /value:\s*\{[\s\S]*?color:\s*tokens\.chartText,[\s\S]*?fontSize:\s*13,[\s\S]*?fontWeight:\s*780/);
  assert.match(computePageSource, /const COMPUTE_STACKED_PIE_LABELS = new Set\(\['卓越版'\]\);/);
  assert.match(computePageSource, /function formatComputePieLabel\(params\)/);
  assert.match(computePageSource, /COMPUTE_STACKED_PIE_LABELS\.has\(String\(params\.name\)\)/);
  assert.match(computePageSource, /return `\{name\|\$\{name\}\}\\n\{value\|\$\{params\.percent\}%\}`;/);
  assert.match(computePageSource, /return `\{name\|\$\{name\}\} \{value\|\$\{params\.percent\}%\}`;/);
  assert.match(computePageSource, /formatter:\s*formatComputePieLabel/);
  assert.match(computePageSource, /const COMPUTE_VERSION_RIGHT_LABEL_SLOTS = \{[\s\S]*?'试用版': -82,[\s\S]*?'企业版': -42,[\s\S]*?'旗舰版': -2,[\s\S]*?'免费版': 38,[\s\S]*?'卓越版': 86/);
  assert.match(computePageSource, /function buildPieOption\(\{ data, tokens, unitLabel, naturalLabelLayout = false \}\)/);
  assert.match(computePageSource, /\.\.\.\(naturalLabelLayout \? \{\} : \{ labelLayout: computePieLabelLayout \}\)/);
  assert.match(computePageSource, /function computePieLabelLayout\(params\)/);
  assert.match(computePageSource, /align:\s*'left'/);
  assert.match(computePageSource, /verticalAlign:\s*'middle'/);
  assert.match(computePageSource, /hideOverlap:\s*false/);
  assert.doesNotMatch(computePageSource, /formatter:\s*\(params\) => `\{name\|\$\{params\.name\}\}\\n/);
});

test('uses the overview half-ring palette for compute donut charts', () => {
  assert.match(computePageSource, /const COMPUTE_RING_COLORS = \[[\s\S]*?'#e6fbff'[\s\S]*?'#9eeeff'[\s\S]*?'#6ea8ff'[\s\S]*?'#b8ffd9'[\s\S]*?'rgba\(230, 251, 255, \.42\)'/);
  assert.match(computePageSource, /function applyComputeRingPalette\(data\)/);
  assert.match(computePageSource, /sort\(\(a, b\) => b\.value - a\.value\)/);
  assert.match(computePageSource, /const versionPieData = useMemo\(\s*\(\) => applyComputeRingPalette\(versions\),/);
  assert.match(computePageSource, /const distributionPieData = useMemo\(\s*\(\) => applyComputeRingPalette\(distribution\),/);
  assert.match(computePageSource, /buildPieOption\(\{ data: versionPieData, tokens, unitLabel: '消耗权重', naturalLabelLayout: true \}\)/);
  assert.match(computePageSource, /buildPieOption\(\{ data: distributionPieData, tokens, unitLabel: '客户占比权重' \}\)/);
  assert.match(computePageSource, /borderRadius:\s*8,[\s\S]*?borderColor:\s*'rgba\(255, 255, 255, \.12\)'[\s\S]*?borderWidth:\s*2,[\s\S]*?shadowBlur:\s*22,[\s\S]*?shadowColor:\s*'rgba\(0, 0, 0, \.32\)'/);
  assert.doesNotMatch(computePageSource, /borderColor:\s*'rgba\(12,12,13,\.72\)'/);
});

test('uses mutually exclusive table-header sorting and pagination in compute customer ranking', () => {
  assert.match(computePageSource, /CUSTOMER_SORT_FIELDS = \[/);
  assert.match(computePageSource, /key:\s*'usage'[\s\S]*?label:\s*'算力用量'[\s\S]*?getValue:\s*\(row\) => row\.usage/);
  assert.match(computePageSource, /key:\s*'balance'[\s\S]*?label:\s*'算力余额'[\s\S]*?getValue:\s*\(row\) => row\.balance/);
  assert.match(computePageSource, /key:\s*'reply'[\s\S]*?label:\s*'平均回复率'[\s\S]*?getValue:\s*\(row\) => row\.averageReplyRate/);
  assert.doesNotMatch(computePageSource, /算力用量 \/ 全部/);
  assert.doesNotMatch(computePageSource, /算力余额 \/ 全部/);
  assert.doesNotMatch(computePageSource, /平均回复率 \/ 全部/);
  assert.match(computePageSource, /CUSTOMER_SORT_DIRECTIONS = \{[\s\S]*?asc:\s*'升序'[\s\S]*?desc:\s*'降序'/);
  assert.match(computePageSource, /CUSTOMER_COLUMN_FILTER_ALL = 'all';/);
  assert.match(computePageSource, /CUSTOMER_COLUMN_FILTERS = \[/);
  assert.match(computePageSource, /key:\s*'accountType'[\s\S]*?label:\s*'账号类型'/);
  assert.match(computePageSource, /key:\s*'salesOwner'[\s\S]*?label:\s*'销售负责人'/);
  assert.match(computePageSource, /key:\s*'successOwner'[\s\S]*?label:\s*'客成负责人'/);
  assert.match(computePageSource, /function buildInitialCustomerColumnFilters\(\)/);
  assert.match(computePageSource, /function buildCustomerColumnFilterOptions\(rows,\s*field\)/);
  assert.match(computePageSource, /function filterCustomerRowsByColumnFilters\(rows,\s*filters\)/);
  assert.match(computePageSource, /const \[customerSort,\s*setCustomerSort\] = useState\('usage-desc'\);/);
  assert.match(computePageSource, /const \[customerColumnFilters,\s*setCustomerColumnFilters\] = useState\(\(\) => buildInitialCustomerColumnFilters\(\)\);/);
  assert.match(computePageSource, /const \[openCustomerColumnFilter,\s*setOpenCustomerColumnFilter\] = useState\(null\);/);
  assert.match(computePageSource, /function getCustomerSortState\(sortKey = 'usage-desc'\)/);
  assert.match(computePageSource, /const sortMultiplier = sortDirection === 'asc' \? 1 : -1;/);
  assert.match(computePageSource, /const filteredCustomers = useMemo\(\s*\(\) => filterCustomerRowsByColumnFilters\(customerRows, customerColumnFilters\),/);
  assert.match(computePageSource, /const sortedCustomers = useMemo\(\s*\(\) => sortCustomerRows\(filteredCustomers, customerSort\),/);
  assert.match(computePageSource, /function CustomerSortableHeader\(/);
  assert.match(computePageSource, /const isActive = activeSortField\.key === sortFieldKey;/);
  assert.match(computePageSource, /aria-pressed=\{isActive\}/);
  assert.match(computePageSource, /onClick=\{\(\) => onSortChange\(sortFieldKey\)\}/);
  assert.doesNotMatch(computePageSource, /CUSTOMER_FILTER_ALL/);
  assert.doesNotMatch(computePageSource, /customerVersionFilter/);
  assert.doesNotMatch(computePageSource, /customerSalesFilter/);
  assert.doesNotMatch(computePageSource, /function buildCustomerFilterOptions/);
  assert.doesNotMatch(computePageSource, /function filterCustomerRows\(/);
  assert.match(computePageSource, /const DEFAULT_CUSTOMER_PAGE_SIZE = 20;/);
  assert.match(computePageSource, /const CUSTOMER_PAGE_SIZE_OPTIONS = \[10, 20, 50, 100, 200, 500\];/);
  assert.match(computePageSource, /const \[customerPage,\s*setCustomerPage\] = useState\(1\);/);
  assert.match(computePageSource, /const \[customerPageSize,\s*setCustomerPageSize\] = useState\(DEFAULT_CUSTOMER_PAGE_SIZE\);/);
  assert.match(computePageSource, /const \[customerPageSizeMenuOpen,\s*setCustomerPageSizeMenuOpen\] = useState\(false\);/);
  assert.match(computePageSource, /customerPageCount = Math\.max\(1, Math\.ceil\(customerTotal \/ customerPageSize\)\);/);
  assert.match(computePageSource, /customerPageRows\.map\(\(customer\) => \(/);
  assert.match(computePageSource, /className="cpu-customer-toolbar"/);
  assert.doesNotMatch(computePageSource, /className="cpu-customer-filters"/);
  assert.doesNotMatch(computePageSource, /className=\{`cpu-sort-card/);
  assert.doesNotMatch(computePageSource, /className="cpu-sort-card__arrows"/);
  assert.doesNotMatch(computePageSource, /className="cpu-select-field"/);
  assert.doesNotMatch(computePageSource, /className="cpu-select-control"/);
  assert.doesNotMatch(computePageSource, /<span className="cpu-control-label">使用版本:<\/span>/);
  assert.doesNotMatch(computePageSource, /aria-label="销售负责人"/);
  assert.match(computePageSource, /className="cpu-pagination"/);
  assert.match(computePageSource, /<CustomerColumnHeader\s+label="账号类型"\s+filterKey="accountType"/);
  assert.match(computePageSource, /<CustomerColumnHeader\s+label="销售负责人"\s+filterKey="salesOwner"/);
  assert.match(computePageSource, /<CustomerColumnHeader\s+label="客成负责人"\s+filterKey="successOwner"/);
  assert.match(computePageSource, /<CustomerSortableHeader\s+label="算力用量"\s+sortFieldKey="usage"/);
  assert.match(computePageSource, /<CustomerSortableHeader\s+label="算力余额"\s+sortFieldKey="balance"/);
  assert.match(computePageSource, /<CustomerSortableHeader\s+label="平均回复率"\s+sortFieldKey="reply"/);
  assert.match(computePageSource, /className="cpu-th-filter"/);
  assert.match(computePageSource, /className=\{`cpu-column-filter/);
  assert.match(computePageSource, /className="cpu-column-filter__menu"/);
  assert.match(computePageSource, /className=\{`cpu-column-filter__option/);
  assert.match(computePageSource, /共 \{formatInt\(customerTotal\)\} 条/);
  assert.match(computePageSource, /className=\{`cpu-page-size-select/);
  assert.match(computePageSource, /className="cpu-page-size-menu"/);
  assert.match(computePageSource, /className=\{`cpu-page-size-option/);
  assert.match(computePageSource, /\{customerPageSize\}条\/页/);
  assert.doesNotMatch(computePageSource, /className=\{`cpu-page-size__button/);
  assert.match(computePageCss, /\.cpu-customer-toolbar \{/);
  assert.doesNotMatch(computePageCss, /\.cpu-customer-filters \{/);
  assert.doesNotMatch(computePageCss, /\.cpu-sort-card \{/);
  assert.match(computePageCss, /\.cpu-sort-header \{/);
  assert.match(computePageCss, /\.cpu-sort-header__button \{/);
  assert.match(computePageCss, /\.cpu-sort-header__button--active \{/);
  assert.match(computePageCss, /\.cpu-sort-header__arrow--active \{/);
  assert.doesNotMatch(computePageCss, /\.cpu-select-control \{/);
  assert.match(computePageCss, /\.cpu-page-size-select \{/);
  assert.match(computePageCss, /\.cpu-page-size-menu \{/);
  assert.match(computePageCss, /\.cpu-page-size-option--active \{/);
  assert.match(computePageCss, /\.cpu-th-filter \{/);
  assert.match(computePageCss, /\.cpu-column-filter__trigger \{/);
  assert.match(computePageCss, /\.cpu-column-filter__menu \{/);
  assert.match(computePageCss, /\.cpu-column-filter__option--active \{/);
  assert.doesNotMatch(computePageCss, /\.cpu-page-size__button/);
  assert.match(computePageCss, /\.cpu-pagination \{/);
  assert.match(computePageCss, /\.cpu-page-button--active/);
});

test('moves the whole compute customer ranking table upward', () => {
  const customerTableWrapBlock = cssRuleBody(computePageCss, '.cpu-panel--customers .cpu-table-wrap');

  assert.match(customerTableWrapBlock, /margin-top:\s*-12px;/);
});

test('removes compute resource utilization from the compute analysis page', () => {
  assert.doesNotMatch(computePageSource, /getComputeResourceHealth/);
  assert.doesNotMatch(computePageSource, /resourceHealth/);
  assert.doesNotMatch(computePageSource, /SEARCH_KEYWORDS[\s\S]*?health:/);
  assert.doesNotMatch(computePageSource, /资源利用率/);
  assert.doesNotMatch(computePageSource, /cpu-panel--health/);
  assert.doesNotMatch(computePageCss, /cpu-panel--health/);
  assert.doesNotMatch(computePageCss, /cpu-health/);
  assert.doesNotMatch(computePageCss, /grid-area:\s*health/);
});

test('notifies Fu Xiaoke when a KPI card is opened', () => {
  assert.match(appSource, /import \{ buildCardCompanionCue \} from '\.\/lib\/mascotCompanion';/);
  assert.match(appSource, /const \[companionCue,\s*setCompanionCue\] = useState\(null\);/);
  assert.match(appSource, /function handleOpenCard\(card\) \{[\s\S]*?setOpenCard\(card\);[\s\S]*?setCompanionCue\(\{[\s\S]*?\.\.\.buildCardCompanionCue\(card\),[\s\S]*?id: makeCompanionCueId\(card\),[\s\S]*?\}\);[\s\S]*?\}/);
  assert.match(appSource, /<AIAnalysisWidget activeMenu=\{activeMenu\} dim=\{dim\} channelKey=\{activeChannelKey\} companionCue=\{companionCue\} \/>/);
  assert.match(appSource, /<KpiCard[\s\S]*?card=\{card\}[\s\S]*?onOpen=\{handleOpenCard\}/);
});

test('builds two long recovery cards that each include a sales completion panel', () => {
  assert.match(appSource, /const recoveryKpiCards = filteredKpiCards\.filter\(\(card\) => \['month', 'year'\]\.includes\(card\.key\)\);/);
  assert.match(appSource, /const financeKpiCards = filteredKpiCards\.filter\(\(card\) => card\.key === 'cost'\);/);
  assert.match(dashboardCss, /\.dash-kpis\{\s*display:grid;grid-template-columns:minmax\(0,1fr\);grid-template-rows:repeat\(2,minmax\(326px,auto\)\);/);
  assert.match(dashboardCss, /\.dash-kpi-item\[data-kpi-key="month"\]\{grid-column:1;grid-row:1\}/);
  assert.match(dashboardCss, /\.dash-kpi-item\[data-kpi-key="year"\]\{grid-column:1;grid-row:2\}/);
  assert.match(appSource, /function recoveryChannelTitle\(card\) \{[\s\S]*?return card\.key === 'year' \? '本年渠道完成情况' : '本月渠道完成情况';[\s\S]*?\}/);
  assert.match(appSource, /recoveryKpiCards\.map\(\(card\) => \([\s\S]*?<KpiCard[\s\S]*?card=\{card\}[\s\S]*?onOpen=\{handleOpenCard\}[\s\S]*?sidePanel=\{<ChannelPanel channelKey=\{activeChannelKey\} title=\{recoveryChannelTitle\(card\)\} \/>\}[\s\S]*?\/>/);
  assert.doesNotMatch(appSource, /className="dash-kpi-sales"/);
  assert.doesNotMatch(dashboardCss, /\.dash-kpi-sales/);
  assert.doesNotMatch(dashboardCss, /\.dash-kpi-item\[data-kpi-key="cost"\]\{grid-column:2;grid-row:1\}/);
  assert.doesNotMatch(dashboardCss, /\.dash-kpi-item\[data-kpi-key="renewal"\]\{grid-column:2;grid-row:2\}/);
});

test('moves opening metrics into the cost slot and cost into the former renewal slot', () => {
  assert.match(appSource, /<div className="dash-cell dash-cell--finance-kpis" data-anim>/);
  assert.match(appSource, /<div className="dash-finance-kpi-item dash-finance-kpi-item--openings" data-kpi-key="openings">[\s\S]*?<OpeningMetricCards onOpenSecondary=\{handleOpenCard\} \/>[\s\S]*?<\/div>/);
  assert.match(appSource, /financeKpiCards\.map\(\(card\) => \(/);
  assert.match(appSource, /className="dash-finance-kpi-item"/);
  assert.doesNotMatch(appSource, /\['cost', 'renewal'\]\.includes\(card\.key\)/);
  assert.doesNotMatch(appSource, /data-kpi-key=\{card\.key\} key=\{card\.key\}[\s\S]*?card=\{card\}[\s\S]*?card\.key === 'renewal'/);
  assert.match(dashboardCss, /grid-template-areas:\s*"trend finance"\s*"version version";/);
  assert.match(dashboardCss, /\.dash-grid--overview \.dash-cell--finance-kpis\{grid-area:finance\}/);
  assert.match(dashboardCss, /\.dash-finance-kpis\{[\s\S]*?display:grid;[\s\S]*?grid-template-rows:repeat\(2,minmax\(0,1fr\)\);[\s\S]*?gap:14px;/);
  assert.match(dashboardCss, /\.dash-finance-kpi-item--openings \.opening-metric-cards\{[\s\S]*?height:100%;/);
});

test('uses ElectricBorder for search result highlighting instead of HighlightBeam', () => {
  assert.match(appSource, /import ElectricBorder from '\.\/components\/ElectricBorder\/ElectricBorder';/);
  assert.doesNotMatch(appSource, /import HighlightBeam/);
  assert.doesNotMatch(appSource, /<HighlightBeam/);
  assert.match(appSource, /<SearchResultBorder active=\{hit\(card\.keywords,\s*searchTerm\)\}>/);
  assert.match(appSource, /data-search-match="true"/);
  assert.match(appSource, /aria-label="搜索命中结果"/);
  assert.match(appSource, /<ElectricBorder[\s\S]*?color="#6000FF"[\s\S]*?speed=\{1\}[\s\S]*?chaos=\{0\.12\}[\s\S]*?thickness=\{2\}/);
  assert.match(dashboardCss, /\.search-result-border\[data-search-current="true"\]/);
});

test('keeps the current search result highlight edge-only without full-card purple wash', () => {
  const currentSearchBlock = cssRuleBody(dashboardCss, '.search-result-border[data-search-current="true"]');
  const currentSearchContentBlock = cssRuleBody(
    dashboardCss,
    '.search-result-border[data-search-current="true"] .eb-content'
  );
  const currentSearchBackgroundBlock = cssRuleBody(
    dashboardCss,
    '.search-result-border[data-search-current="true"] .eb-background-glow'
  );

  assert.doesNotMatch(currentSearchBlock, /filter:\s*drop-shadow/);
  assert.doesNotMatch(currentSearchContentBlock, /box-shadow:/);
  assert.doesNotMatch(currentSearchBackgroundBlock, /transform:\s*scale/);
  assert.match(dashboardCss, /\.search-result-border\[data-search-current="true"\] \.eb-glow-1\{[\s\S]*?border-color:rgba\(214,248,74,\.34\);/);
  assert.match(dashboardCss, /\.search-result-border\[data-search-current="true"\] \.eb-glow-2\{[\s\S]*?filter:blur\(3px\);/);
  assert.doesNotMatch(computePageCss, /\.cpu-kpi-slot\[data-search-current="true"\],[\s\S]*?filter:\s*drop-shadow/);
  assert.doesNotMatch(computePageCss, /\.cpu-panel\[data-search-current="true"\][\s\S]*?box-shadow:[\s\S]*?rgba\(96,0,255/);
});

test('removes the overview channel ROI card and keeps delivery below the original overview grid', () => {
  assert.doesNotMatch(appSource, /function ChannelRoiPanel/);
  assert.doesNotMatch(appSource, /dash-cell--roi/);
  assert.doesNotMatch(appSource, /panelVisible = \{[\s\S]*?roi:/);
  assert.match(dashboardCss, /grid-template-areas:\s*"trend finance"\s*"version version";/);
  assert.match(appSource, /className="dash-delivery-row"/);
  assert.doesNotMatch(dashboardCss, /grid-template-areas:[\s\S]*?"roi version"/);
});

test('routes every channel menu through the same overview layout with channel-scoped data', () => {
  assert.doesNotMatch(appSource, /TOKEN_STATS/);
  assert.doesNotMatch(appSource, /dash-token/);
  assert.doesNotMatch(appSource, /activeMenu === 'finance'/);
  assert.match(appSource, /const activeChannelKey = getDashboardChannelKey\(activeMenu\);/);
  assert.match(appSource, /getFilteredKpiCards\(\{ dim, dateRange, channel: activeChannelKey \}\)/);
  assert.match(appSource, /<MonthlyTrend channelKey=\{activeChannelKey\} \/>/);
  assert.match(appSource, /<ChannelPanel channelKey=\{activeChannelKey\} title=\{recoveryChannelTitle\(card\)\} \/>/);
  assert.match(appSource, /<VersionFinancePanel channelKey=\{activeChannelKey\} \/>/);
  assert.match(appSource, /className=\{gridClassName\}/);
});

test('scrolls the dashboard content into view when a sidebar menu item is selected', () => {
  assert.match(appSource, /const pendingMenuScrollRef = useRef\(false\);/);
  assert.match(appSource, /function handleMenuChange\(nextMenu\)/);
  assert.match(appSource, /pendingMenuScrollRef\.current = true;/);
  assert.match(appSource, /<Sidebar items=\{sidebarItems\} active=\{sidebarActive\} onChange=\{handleSidebarChange\} \/>/);
  assert.match(appSource, /gridRef\.current\?\.scrollIntoView\(\{\s*behavior:\s*'smooth',\s*block:\s*'start'\s*\}\);/);
  assert.match(dashboardCss, /\.dash-content\{[\s\S]*?scroll-margin-top:86px;/);
});

test('uses channel completion wording and connects the delivery dashboard panel', () => {
  assert.match(channelPanelSource, /本月渠道完成情况/);
  assert.match(channelPanelSource, /export default function ChannelPanel\(\{ channelKey = 'all', title = '本月渠道完成情况' \}\)/);
  assert.match(channelPanelSource, /<span className="ch-title">\{title\}<\/span>/);
  assert.doesNotMatch(channelPanelSource, /本月销售完成/);
  assert.match(channelPanelSource, /createPortal/);
  assert.match(channelPanelSource, /document\.body/);
  assert.match(channelPanelSource, /fmtWan/);
  assert.match(channelPanelSource, /fmtPct/);
  assert.match(channelPanelSource, /ch-row-arrow/);
  assert.match(channelPanelCss, /\.ch-row-arrow/);
  assert.match(appSource, /import DeliveryPanel from '\.\/components\/DeliveryPanel';/);
  assert.match(appSource, /<DeliveryPanel \/>/);
  assert.match(dashboardCss, /dash-delivery-row/);
  assert.match(appSource, /sidePanel=\{<ChannelPanel channelKey=\{activeChannelKey\} title=\{recoveryChannelTitle\(card\)\} \/>\}/);
  assert.match(appSource, /className="dash-cell dash-cell--finance-kpis"/);
  assert.doesNotMatch(dashboardCss, /"version delivery"/);
});

test('matches overview trend and delivery panel backgrounds to the homepage renewal KPI card', () => {
  const kpiCardBlock = cssRuleBody(kpiCardCss, '.kpi-card');
  const trendPanelBlock = cssRuleBody(dashboardCss, '.dash-cell .mt-panel');
  const deliveryPanelBlock = cssRuleBody(deliveryPanelCss, '.dlv-panel');

  assert.match(kpiCardBlock, /background:\s*transparent;/);
  assert.match(trendPanelBlock, /background:\s*transparent;/);
  assert.match(trendPanelBlock, /border:1px solid var\(--line-2\);/);
  assert.match(trendPanelBlock, /backdrop-filter:var\(--glass-blur\);/);
  assert.match(trendPanelBlock, /box-shadow:var\(--glass-shadow\);/);
  assert.doesNotMatch(trendPanelBlock, /#101012/);
  assert.doesNotMatch(trendPanelBlock, /radial-gradient\(ellipse at 52% 94%/);
  assert.match(deliveryPanelBlock, /background:\s*transparent;/);
  assert.match(deliveryPanelBlock, /border: 1px solid var\(--line-2\);/);
  assert.match(deliveryPanelBlock, /backdrop-filter: var\(--glass-blur\);/);
  assert.match(deliveryPanelBlock, /box-shadow: var\(--glass-shadow\);/);
  assert.doesNotMatch(deliveryPanelBlock, /#101012/);
  assert.doesNotMatch(deliveryPanelBlock, /radial-gradient\(ellipse at 52% 94%/);
});

test('keeps channel secondary detail modal on the unified focused glass background without purple glow', () => {
  const channelModalBlock = cssRuleBody(channelPanelCss, '.ch-modal-card');
  const channelMaskBlock = cssRuleBody(channelPanelCss, '.ch-modal-mask');

  assert.match(channelModalBlock, /linear-gradient\(90deg, rgba\(9, 9, 13, 0\.96\), rgba\(5, 5, 8, 0\.96\) 52%, rgba\(3, 3, 6, 0\.98\)\)/);
  assert.match(channelModalBlock, /rgba\(4,\s*4,\s*7,\s*0\.96\);/);
  assert.match(channelModalBlock, /border: 1px solid var\(--line-2\);/);
  assert.match(channelModalBlock, /backdrop-filter: blur\(26px\) saturate\(145%\);/);
  assert.match(channelMaskBlock, /background: rgba\(0, 0, 0, 0\.82\);/);
  assert.match(channelMaskBlock, /backdrop-filter: blur\(14px\) saturate\(120%\);/);
  assert.doesNotMatch(channelModalBlock, /background:\s*transparent;/);
  assert.doesNotMatch(channelModalBlock, /radial-gradient\(circle at 20% 42%, rgba\(255, 79, 216/);
  assert.doesNotMatch(channelModalBlock, /radial-gradient\(circle at 4% 86%, rgba\(96, 0, 255/);
});

test('keeps overview trend and delivery panels free of hover flow borders', () => {
  const trendPanelBlock = cssRuleBody(dashboardCss, '.dash-cell .mt-panel');
  const deliveryPanelBlock = cssRuleBody(deliveryPanelCss, '.dlv-panel');

  assert.doesNotMatch(dashboardCss, /@property --dash-flow-angle/);
  assert.doesNotMatch(dashboardCss, /\.dash-cell \.mt-panel::before/);
  assert.doesNotMatch(dashboardCss, /\.dash-delivery-row \.dlv-panel::before/);
  assert.doesNotMatch(dashboardCss, /dashPanelFlow/);
  assert.doesNotMatch(dashboardCss, /conic-gradient\(\s*from var\(--dash-flow-angle\)/);
  assert.doesNotMatch(dashboardCss, /rgba\(244,114,182/);
  assert.doesNotMatch(dashboardCss, /rgba\(192,132,252/);
  assert.match(dashboardCss, /\.dash-delivery-row \.dlv-panel\{[\s\S]*?transition:border-color \.22s ease, box-shadow \.22s ease;/);
  assert.match(trendPanelBlock, /background:\s*transparent;/);
  assert.match(deliveryPanelBlock, /background:\s*transparent;/);
});

test('uses static trend legend and overlapping target versus recovered bars', () => {
  assert.match(monthlyTrendSource, /selectedMode:\s*false/);
  assert.match(monthlyTrendSource, /barGap:\s*'-100%'/);
  assert.match(monthlyTrendSource, /barCategoryGap:\s*'42%'/);
});

test('uses sales filters followed directly by year month day in the KPI modal', () => {
  assert.match(kpiModalSource, /import MultiSegmented from '\.\/MultiSegmented';/);
  assert.match(kpiModalSource, /salesKeys/);
  assert.match(kpiModalSource, /<MultiSegmented options=\{SALES_FILTER_OPTS\} value=\{salesKeys\} onChange=\{setSalesKeys\} \/>\s*<Segmented options=\{DIM_OPTS\} value=\{dim\} onChange=\{setDim\} \/>/);
  assert.doesNotMatch(kpiModalSource, /ORDER_TYPE_OPTS/);
  assert.doesNotMatch(kpiModalSource, /orderType/);
  assert.doesNotMatch(kpiModalSource, /新签/);
  assert.doesNotMatch(kpiModalSource, /续订/);
  assert.doesNotMatch(kpiModalSource, /km-type-control/);
  assert.doesNotMatch(kpiModalSource, /<span>type<\/span>/);
  assert.doesNotMatch(kpiModalSource, /value:\s*'all',\s*label:\s*'全部'/);
});
