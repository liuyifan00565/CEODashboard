/*
 更新时间: 2026-07-01 17:29:45 CST
 更新内容: 增加首页月度经营趋势和交付看板深黑实体背景约束，避免大面板再次透明。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const dashboardCss = readFileSync(new URL('./dashboard.css', import.meta.url), 'utf8');
const kpiModalSource = readFileSync(new URL('./components/KpiModal.jsx', import.meta.url), 'utf8');
const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');
const deliveryPanelCss = readFileSync(new URL('./components/DeliveryPanel.css', import.meta.url), 'utf8');
const channelPanelSource = readFileSync(new URL('./components/ChannelPanel.jsx', import.meta.url), 'utf8');
const channelPanelCss = readFileSync(new URL('./components/ChannelPanel.css', import.meta.url), 'utf8');
const computePageSource = readFileSync(new URL('./components/ComputeUsagePage.jsx', import.meta.url), 'utf8');
const computePageCss = readFileSync(new URL('./components/ComputeUsagePage.css', import.meta.url), 'utf8');

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

test('uses the AI analysis BorderGlow treatment for all top compute KPI cards', () => {
  assert.match(computePageSource, /import BorderGlow from '\.\/BorderGlow\/BorderGlow';/);
  assert.match(computePageSource, /<BorderGlow[\s\S]*?className=\{`cpu-kpi-glow cpu-kpi-glow--\$\{tone\}/);
  assert.match(computePageSource, /glowColor="40 80 80"/);
  assert.match(computePageSource, /colors=\{\['#c084fc', '#f472b6', '#38bdf8'\]\}/);
  assert.match(computePageCss, /\.cpu-kpi-glow\.border-glow-card \{/);
  assert.match(computePageCss, /animation:\s*cpuAiBorderSweep/);
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

test('matches the compute trend chart to the overview target-bar and completion-line language', () => {
  assert.match(computePageSource, /data:\s*\['算力用量', '目标用量', '完成率%'\]/);
  assert.match(computePageSource, /sub="基础消耗 \+ 目标用量 · 完成率"/);
  assert.doesNotMatch(computePageSource, /同步观察总容量/);
  assert.match(computePageSource, /itemWidth:\s*18/);
  assert.match(computePageSource, /itemHeight:\s*12/);
  assert.match(computePageSource, /itemGap:\s*22/);
  assert.match(computePageSource, /textStyle:\s*\{[\s\S]*?color:\s*txt,[\s\S]*?fontSize:\s*18,[\s\S]*?fontWeight:\s*850,[\s\S]*?textShadowColor:\s*'rgba\(0,0,0,\.55\)',[\s\S]*?textShadowBlur:\s*8,[\s\S]*?\}/);
  assert.match(computePageSource, /name:\s*'目标用量'[\s\S]*?type:\s*'bar'[\s\S]*?color:\s*tokens\.chartBarFaint/);
  assert.match(computePageSource, /name:\s*'算力用量'[\s\S]*?type:\s*'bar'[\s\S]*?barGap:\s*'-100%'/);
  assert.match(computePageSource, /barCategoryGap:\s*'42%'/);
  assert.match(computePageSource, /name:\s*'完成率%'[\s\S]*?type:\s*'line'[\s\S]*?yAxisIndex:\s*1/);
  assert.match(computePageSource, /const completionColor = '#f472b6';/);
  assert.doesNotMatch(computePageSource, /#dfff00/);
  assert.doesNotMatch(computePageSource, /#ff4d5f/);
  assert.match(computePageSource, /axisLabel:\s*\{ color: faint, fontSize: 12, interval: 0, hideOverlap: false, margin: 12 \}/);
  assert.match(computePageSource, /xAxis:\s*\{ axisLabel:\s*\{ interval: 0, hideOverlap: false, fontSize: 11 \} \}/);
  assert.doesNotMatch(computePageSource, /stack:\s*'usage'/);
  assert.doesNotMatch(computePageSource, /name:\s*'总容量'[\s\S]*?type:\s*'line'/);
});

test('uses the same year month day topbar controls for compute and links them to trend dates', () => {
  assert.match(appSource, /const DIM_OPTS = \[/);
  assert.match(appSource, /\{ value: 'year', label: '年' \}/);
  assert.match(appSource, /\{ value: 'month', label: '月' \}/);
  assert.match(appSource, /\{ value: 'day', label: '日' \}/);
  assert.doesNotMatch(appSource, /COMPUTE_PERIOD_OPTS/);
  assert.doesNotMatch(appSource, /computePeriod/);
  assert.match(appSource, /<DateRangePicker value=\{dateRange\} onChange=\{\(dates\) => setDateRange\(dates\?\.length \? \[\.\.\.dates\] : DEFAULT_FILTER_RANGE\)\} \/>/);
  assert.match(appSource, /<Segmented options=\{DIM_OPTS\} value=\{dim\} onChange=\{setDim\} \/>/);
  assert.doesNotMatch(appSource, /isComputePage \? \([\s\S]*?<DateRangePicker/);
  assert.match(appSource, /<ComputeUsagePage searchTerm=\{searchTerm\} dim=\{dim\} dateRange=\{dateRange\} \/>/);
  assert.match(computePageSource, /export default function ComputeUsagePage\(\{ searchTerm = '', dim = 'month', dateRange = \[\] \}\)/);
  assert.match(computePageSource, /const periodLabel = DIM_TREND_LABELS\[dim\] \?\? DIM_TREND_LABELS\.month;/);
  assert.match(computePageSource, /const trend = getComputeUsageTrend\(\{ dim, dateRange \}\);/);
  assert.match(computePageSource, /title=\{`\$\{periodLabel\}算力用量趋势`\}/);
});

test('uses a full-width compute trend card with draggable 15-bar window and descending period labels', () => {
  assert.match(computePageSource, /const MAX_VISIBLE_TREND_BARS = 15;/);
  assert.match(computePageSource, /const showSlider = days\.length > MAX_VISIBLE_TREND_BARS;/);
  assert.match(computePageSource, /const sliderEndValue = Math\.min\(MAX_VISIBLE_TREND_BARS - 1, days\.length - 1\);/);
  assert.match(computePageSource, /const sliderWindowSpan = sliderEndValue;/);
  assert.match(computePageSource, /dataZoom: showSlider \? \[/);
  assert.match(computePageSource, /startValue:\s*0/);
  assert.match(computePageSource, /endValue:\s*sliderEndValue/);
  assert.match(computePageSource, /minValueSpan:\s*sliderWindowSpan/);
  assert.match(computePageSource, /maxValueSpan:\s*sliderWindowSpan/);
  assert.match(computePageSource, /zoomLock:\s*true/);
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
});

test('adds dropdown filters and pagination to compute customer ranking', () => {
  assert.match(computePageSource, /CUSTOMER_SORT_OPTIONS = \[/);
  assert.match(computePageSource, /value:\s*'usage-desc'[\s\S]*?label:\s*'算力用量 \/ 全部'/);
  assert.match(computePageSource, /CUSTOMER_FILTER_ALL = 'all';/);
  assert.match(computePageSource, /const \[customerSort,\s*setCustomerSort\] = useState\('usage-desc'\);/);
  assert.match(computePageSource, /const \[customerVersionFilter,\s*setCustomerVersionFilter\] = useState\(CUSTOMER_FILTER_ALL\);/);
  assert.match(computePageSource, /const \[customerSalesFilter,\s*setCustomerSalesFilter\] = useState\(CUSTOMER_FILTER_ALL\);/);
  assert.match(computePageSource, /function buildCustomerFilterOptions\(rows,\s*field\)/);
  assert.match(computePageSource, /function filterCustomerRows\(rows,\s*\{ versionFilter,\s*salesFilter \}\)/);
  assert.match(computePageSource, /sort\(\(a,\s*b\) => b\.usage - a\.usage\)/);
  assert.match(computePageSource, /const DEFAULT_CUSTOMER_PAGE_SIZE = 20;/);
  assert.match(computePageSource, /const CUSTOMER_PAGE_SIZE_OPTIONS = \[10, 20, 50\];/);
  assert.match(computePageSource, /const \[customerPage,\s*setCustomerPage\] = useState\(1\);/);
  assert.match(computePageSource, /const \[customerPageSize,\s*setCustomerPageSize\] = useState\(DEFAULT_CUSTOMER_PAGE_SIZE\);/);
  assert.match(computePageSource, /customerPageCount = Math\.max\(1, Math\.ceil\(customerTotal \/ customerPageSize\)\);/);
  assert.match(computePageSource, /customerPageRows\.map\(\(customer\) => \(/);
  assert.match(computePageSource, /className="cpu-customer-toolbar"/);
  assert.match(computePageSource, /className="cpu-customer-filters"/);
  assert.match(computePageSource, /className="cpu-select-field"/);
  assert.match(computePageSource, /className="cpu-select-control"/);
  assert.match(computePageSource, /使用版本/);
  assert.match(computePageSource, /销售负责人/);
  assert.match(computePageSource, /className="cpu-pagination"/);
  assert.match(computePageSource, /共 \{formatInt\(customerTotal\)\} 条/);
  assert.match(computePageSource, /\{customerPageSize\} 条\/页/);
  assert.match(computePageCss, /\.cpu-customer-toolbar \{/);
  assert.match(computePageCss, /\.cpu-customer-filters \{/);
  assert.match(computePageCss, /\.cpu-select-control \{/);
  assert.match(computePageCss, /\.cpu-pagination \{/);
  assert.match(computePageCss, /\.cpu-page-button--active/);
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
  assert.match(appSource, /const financeKpiCards = filteredKpiCards\.filter\(\(card\) => \['cost', 'renewal'\]\.includes\(card\.key\)\);/);
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

test('moves cost and renewal KPI cards into the former sales completion panel slot', () => {
  assert.match(appSource, /<div className="dash-cell dash-cell--finance-kpis" data-anim>/);
  assert.match(appSource, /financeKpiCards\.map\(\(card\) => \(/);
  assert.match(appSource, /className="dash-finance-kpi-item"/);
  assert.match(dashboardCss, /grid-template-areas:\s*"trend finance"\s*"version version";/);
  assert.match(dashboardCss, /\.dash-grid--overview \.dash-cell--finance-kpis\{grid-area:finance\}/);
  assert.match(dashboardCss, /\.dash-finance-kpis\{[\s\S]*?display:grid;[\s\S]*?grid-template-rows:repeat\(2,minmax\(0,1fr\)\);[\s\S]*?gap:14px;/);
});

test('uses ElectricBorder for search result highlighting instead of HighlightBeam', () => {
  assert.match(appSource, /import ElectricBorder from '\.\/components\/ElectricBorder\/ElectricBorder';/);
  assert.doesNotMatch(appSource, /import HighlightBeam/);
  assert.doesNotMatch(appSource, /<HighlightBeam/);
  assert.match(appSource, /<SearchResultBorder active=\{hit\(card\.keywords,\s*searchTerm\)\}>/);
  assert.match(appSource, /<ElectricBorder[\s\S]*?color="#6000FF"[\s\S]*?speed=\{1\}[\s\S]*?chaos=\{0\.12\}[\s\S]*?thickness=\{2\}/);
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
  assert.match(appSource, /<Sidebar items=\{MENU\} active=\{activeMenu\} onChange=\{handleMenuChange\} \/>/);
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

test('uses solid dark glass backgrounds for overview trend and delivery panels', () => {
  const trendPanelBlock = cssRuleBody(dashboardCss, '.dash-cell .mt-panel');
  const deliveryPanelBlock = cssRuleBody(deliveryPanelCss, '.dlv-panel');

  assert.match(trendPanelBlock, /background:\s*[\s\S]*?#101012;/);
  assert.match(trendPanelBlock, /border:1px solid var\(--line-2\);/);
  assert.match(trendPanelBlock, /backdrop-filter:var\(--glass-blur\);/);
  assert.doesNotMatch(trendPanelBlock, /background:\s*transparent;/);
  assert.match(deliveryPanelBlock, /background:\s*[\s\S]*?#101012;/);
  assert.match(deliveryPanelBlock, /border: 1px solid var\(--line-2\);/);
  assert.match(deliveryPanelBlock, /backdrop-filter: var\(--glass-blur\);/);
  assert.doesNotMatch(deliveryPanelBlock, /background:\s*transparent;/);
});

test('uses static trend legend and overlapping target versus recovered bars', () => {
  assert.match(monthlyTrendSource, /selectedMode:\s*false/);
  assert.match(monthlyTrendSource, /barGap:\s*'-100%'/);
  assert.match(monthlyTrendSource, /barCategoryGap:\s*'42%'/);
});

test('uses multi-select sales filters and order type in the KPI modal', () => {
  assert.match(kpiModalSource, /import MultiSegmented from '\.\/MultiSegmented';/);
  assert.match(kpiModalSource, /ORDER_TYPE_OPTS/);
  assert.match(kpiModalSource, /salesKeys/);
  assert.match(kpiModalSource, /orderType/);
  assert.doesNotMatch(kpiModalSource, /<span>type<\/span>/);
  assert.doesNotMatch(kpiModalSource, /value:\s*'all',\s*label:\s*'全部'/);
});
