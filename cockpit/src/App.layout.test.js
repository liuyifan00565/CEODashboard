/*
 更新时间: 2026-07-01 15:51:08 CST
 更新内容: 回归测试补充算力页饼图图例压缩、图心右移和长标签短名展示规则。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const dashboardCss = readFileSync(new URL('./dashboard.css', import.meta.url), 'utf8');
const kpiModalSource = readFileSync(new URL('./components/KpiModal.jsx', import.meta.url), 'utf8');
const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');
const channelPanelSource = readFileSync(new URL('./components/ChannelPanel.jsx', import.meta.url), 'utf8');
const channelPanelCss = readFileSync(new URL('./components/ChannelPanel.css', import.meta.url), 'utf8');
const computePageSource = readFileSync(new URL('./components/ComputeUsagePage.jsx', import.meta.url), 'utf8');
const computePageCss = readFileSync(new URL('./components/ComputeUsagePage.css', import.meta.url), 'utf8');

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
  assert.match(appSource, /<ComputeUsagePage searchTerm=\{searchTerm\} period=\{computePeriod\} \/>/);
  assert.match(appSource, /: \(\s*<>\s*<div className="dash-kpis">/);
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
  assert.match(computePageSource, /name:\s*'目标用量'[\s\S]*?type:\s*'bar'[\s\S]*?color:\s*tokens\.chartBarFaint/);
  assert.match(computePageSource, /name:\s*'算力用量'[\s\S]*?type:\s*'bar'[\s\S]*?barGap:\s*'-100%'/);
  assert.match(computePageSource, /barCategoryGap:\s*'42%'/);
  assert.match(computePageSource, /name:\s*'完成率%'[\s\S]*?type:\s*'line'[\s\S]*?yAxisIndex:\s*1/);
  assert.match(computePageSource, /const completionColor = '#dfff00';/);
  assert.doesNotMatch(computePageSource, /#ff4d5f/);
  assert.match(computePageSource, /axisLabel:\s*\{ color: faint, fontSize: 12, interval: 0, hideOverlap: false, margin: 12 \}/);
  assert.match(computePageSource, /xAxis:\s*\{ axisLabel:\s*\{ interval: 0, hideOverlap: false, fontSize: 11 \} \}/);
  assert.doesNotMatch(computePageSource, /stack:\s*'usage'/);
  assert.doesNotMatch(computePageSource, /name:\s*'总容量'[\s\S]*?type:\s*'line'/);
});

test('keeps compute page topbar date picker before period presets and drives trend labels', () => {
  assert.match(appSource, /const COMPUTE_PERIOD_OPTS = \[/);
  assert.match(appSource, /\{ value: '7d', label: '近7日' \}/);
  assert.match(appSource, /\{ value: '30d', label: '近30日' \}/);
  assert.match(appSource, /\{ value: 'half-year', label: '近半年' \}/);
  assert.match(appSource, /const \[computePeriod, setComputePeriod\] = useState\('30d'\);/);
  assert.match(appSource, /isComputePage \? \([\s\S]*?<DateRangePicker value=\{dateRange\}[\s\S]*?<Segmented options=\{COMPUTE_PERIOD_OPTS\} value=\{computePeriod\} onChange=\{setComputePeriod\} \/>[\s\S]*?\) : \(/);
  assert.match(appSource, /<ComputeUsagePage searchTerm=\{searchTerm\} period=\{computePeriod\} \/>/);
  assert.match(computePageSource, /export default function ComputeUsagePage\(\{ searchTerm = '', period = '30d' \}\)/);
  assert.match(computePageSource, /const periodLabel = PERIOD_LABELS\[period\] \?\? PERIOD_LABELS\['30d'\];/);
  assert.match(computePageSource, /title=\{`\$\{periodLabel\}算力用量趋势`\}/);
});

test('uses a full-width compute trend card with draggable 30-day window and month labels for half-year', () => {
  assert.match(computePageSource, /const canSlide = period === '30d' && days\.length > 10;/);
  assert.match(computePageSource, /dataZoom: canSlide \? \[/);
  assert.match(computePageSource, /endValue:\s*Math\.min\(9, days\.length - 1\)/);
  assert.match(computePageSource, /type:\s*'slider'[\s\S]*?showDetail:\s*false[\s\S]*?brushSelect:\s*false/);
  assert.match(computePageSource, /const trend = getComputeUsageTrend\(period\);/);
  assert.match(computePageCss, /grid-template-areas:\s*"trend trend"\s*"health version"\s*"health usage";/);
  assert.match(computePageCss, /\.cpu-panel--trend \{[\s\S]*?min-height:\s*560px;/);
  assert.match(computePageCss, /\.cpu-trend-chart \{[\s\S]*?min-height:\s*420px;/);
});

test('stacks compute pie cards with chart-left and explanation-right layout', () => {
  assert.match(computePageCss, /\.cpu-grid \{[\s\S]*?grid-template-columns:\s*minmax\(300px,\s*\.74fr\) minmax\(0,\s*1\.36fr\);[\s\S]*?grid-template-areas:\s*"trend trend"\s*"health version"\s*"health usage";/);
  assert.match(computePageCss, /\.cpu-panel--pie \{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(400px,\s*1\.62fr\) minmax\(150px,\s*\.38fr\);/);
  assert.match(computePageCss, /\.cpu-panel--pie \{[\s\S]*?column-gap:\s*12px;/);
  assert.match(computePageCss, /\.cpu-panel--pie \.cpu-panel__head \{[\s\S]*?grid-column:\s*1 \/ -1;/);
  assert.match(computePageCss, /\.cpu-panel--pie \.cpu-pie-summary \{[\s\S]*?display:\s*grid;[\s\S]*?align-content:\s*start;/);
  assert.match(computePageCss, /\.cpu-panel--pie \.cpu-pie-chip \{[\s\S]*?grid-template-columns:\s*auto minmax\(0,\s*1fr\) auto;/);
  assert.match(computePageCss, /\.cpu-panel--pie \.cpu-pie-chip small \{[\s\S]*?display:\s*none;/);
  assert.doesNotMatch(computePageSource, /data\.slice\(0,\s*5\)\.map/);
});

test('keeps compute pie labels and tooltip cards readable around donut charts', () => {
  assert.match(computePageSource, /'padding:12px 14px'/);
  assert.match(computePageSource, /position:\s*'outer'/);
  assert.match(computePageSource, /alignTo:\s*'labelLine'/);
  assert.match(computePageSource, /center:\s*\['56%', '52%'\]/);
  assert.match(computePageSource, /width:\s*152/);
  assert.match(computePageSource, /function formatPieLabelName/);
  assert.match(computePageSource, /formatPieLabelName\(params\.name\)/);
  assert.match(computePageSource, /edgeDistance:\s*18/);
  assert.match(computePageSource, /distanceToLabelLine:\s*8/);
  assert.match(computePageSource, /bleedMargin:\s*12/);
  assert.match(computePageSource, /labelLine:\s*\{[\s\S]*?length:\s*16,[\s\S]*?length2:\s*14/);
  assert.match(computePageSource, /labelLayout:\s*\{[\s\S]*?moveOverlap:\s*'shiftY'/);
  assert.match(computePageSource, /moveOverlap:\s*'shiftY'/);
  assert.doesNotMatch(computePageSource, /labelLayout:\s*\(params\) =>/);
  assert.doesNotMatch(computePageSource, /formatter:\s*\(params\) => `\{name\|\$\{params\.name\}\}\\n/);
});

test('renders all compute resource utilization rows in compact equal-height cards', () => {
  assert.match(computePageSource, /resourceHealth\.filter\(\(item\) => item\.usage > 0\)\.map/);
  assert.match(computePageSource, /style=\{\{ width: `\$\{item\.usage\}%`, '--cpu-resource-color': item\.color \}\}/);
  assert.match(computePageCss, /\.cpu-panel--health \{[\s\S]*?min-height:\s*684px;/);
  assert.match(computePageCss, /\.cpu-health-list \{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*repeat\(auto-fit,\s*minmax\(58px,\s*1fr\)\);/);
  assert.match(computePageCss, /\.cpu-health-row \{[\s\S]*?min-height:\s*58px;[\s\S]*?padding:\s*10px 14px;/);
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
