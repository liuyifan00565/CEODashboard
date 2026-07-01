/*
 更新时间: 2026-07-01 10:26:08
 更新内容: 回归测试同步 KPI 卡片打开时通知福小客的交互处理函数。
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

test('keeps all dashboard data cards on fixed grid layouts', () => {
  assert.doesNotMatch(appSource, /DraggableKpiLayer/);
  assert.doesNotMatch(appSource, /DraggablePanelLayer/);
  assert.match(appSource, /className="dash-kpis"/);
  assert.match(appSource, /data-kpi-key=\{card\.key\}/);
  assert.match(appSource, /const gridClassName = activeMenu === 'overview'/);
  assert.match(appSource, /className=\{gridClassName\}/);
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
