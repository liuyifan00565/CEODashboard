/*
 更新时间: 2026-07-09 22:30:00 CST
 更新内容: 搜索命中扫描回归依赖数组同步为 dashboardDataState.status + computeDataState.status（不再用
          dashboardDataVersion），覆盖经营总览/算力数据就绪后搜索高亮仍会刷新。
*/
/*
 更新时间: 2026-07-09 22:05:00 CST
 更新内容: 搜索命中扫描回归同步依赖数组新增 computeDataState.status，覆盖算力数据就绪后搜索高亮仍会刷新。
*/
/*
 更新时间: 2026-07-09 13:14:23 CST
 更新内容: 经营总览回归测试同步未完成半环占位、放大图表、年度进度条左两列布局和文字箭头入口。
*/
/*
 更新时间: 2026-07-09 13:13:45 CST
 更新内容: 回归测试锁定经营总览与数据维护侧边导航换组的淡出淡入动效和稳定高度。
*/
/*
 更新时间: 2026-07-09 12:19:47 CST
 更新内容: 经营总览回归测试同步年度回款总览三栏卡和底部年度目标进度 footer。
*/
/*
 更新时间: 2026-07-09 12:12:08 CST
 更新内容: 经营总览回归测试同步半环中心数字移除，并锁定进一步收窄后的图表列尺寸。
*/
/*
 更新时间: 2026-07-09 12:02:57 CST
 更新内容: 经营总览回归测试同步超额/缺口并入主数字事实行，并删除独立风险渠道提醒卡。
*/
/*
 更新时间: 2026-07-09 11:58:00 CST
 更新内容: 经营总览回归测试同步收窄后的月度回款主卡，移除时间进度和月目标进度条断言。
*/
/*
 更新时间: 2026-07-09 11:43:19 CST
 更新内容: 经营总览回归测试同步月度回款主卡三栏布局，锁定本月回款结构与实际/目标经营列表。
*/
/*
 更新时间: 2026-07-09 11:15:17 CST
 更新内容: 经营总览回归测试锁定渠道目标完成结构饼图与版本情况半环同款的色板、环形参数和低光晕样式。
*/
/*
 更新时间: 2026-07-09 11:08:00 CST
 更新内容: 经营总览回归测试同步风险判断下沉到半环结构数据生成阶段，锁定 row.risk 渲染风险标签。
*/
/*
 更新时间: 2026-07-09 11:02:18 CST
 更新内容: 经营总览回归测试补充渠道半环风险基准断言，要求低于整体完成基准的渠道显示风险标签。
*/
/*
 更新时间: 2026-07-09 10:52:02 CST
 更新内容: 经营总览回归测试同步渠道目标完成结构半环模块，锁定本月/本年切换、ECharts 半环和轻量摘要。
*/
/*
 更新时间: 2026-07-08 18:51:50 CST
 更新内容: 算力页回归测试同步经营健康驾驶舱改版，覆盖利用率、风险客户、供需关系和客户建议动作。
*/
/*
 更新时间: 2026-07-08 18:22:00 CST
 更新内容: 经营总览二级弹窗回归同步成本月度口径、当前筛选提示和渠道人员明细标题。
*/
/*
 更新时间: 2026-07-08 17:49:56 CST
 更新内容: 数据维护目标完成率回归说明同步为 120% 及以上才使用金色 good 状态。
*/
/*
 更新时间: 2026-07-08 17:28:57 CST
 更新内容: 渠道完成情况回归测试要求进度条复用 120% 超额阈值工具函数，避免 100%-119.9% 显示金色。
*/
/*
 更新时间: 2026-07-08 17:15:00 CST
 更新内容: 回归测试要求经营进度标题和搜索命中读取运行时月份，不再把 2026 年 6 月写死在组件中。
*/
/*
 更新时间: 2026-07-08 16:57:24 CST
 更新内容: 回归测试同步顶部右侧删除“更新数据”按钮，仅保留搜索控件。
*/
/*
 更新时间: 2026-07-08 14:46:29 CST
 更新内容: 回归测试锁定维护模式返回入口改为侧边导航里的“经营总览”分组项，并移除独立大按钮。
*/
/*
 Update time: 2026-07-08 14:45:22 CST
 Update content: Require search result boxes to keep a persistent edge border highlight instead of a short-lived glow.
*/
/*
 更新时间: 2026-07-08 14:11:07 CST
 更新内容: 回归测试同步移除搜索占位、维护页返回入口和无实际变更按钮，并锁定保存按钮脏状态启用与渠道新增归属。
*/
/*
 更新时间: 2026-07-08 14:08:42 CST
 更新内容: 回归测试锁定顶部品牌胶囊滚动折叠滞回阈值，并避免搜索命中标记随无关渲染重复刷新。
*/
/*
 更新时间: 2026-07-08 14:00:14 CST
 更新内容: 回归测试锁定主界面侧边导航移除渠道分析和客户转化禁用入口。
*/
/*
 更新时间: 2026-07-08 11:47:38 CST
 更新内容: 回归测试同步维护模式“返回主界面”按钮移到左侧导航栏下方。
*/
/*
 更新时间: 2026-07-08 11:28:12 CST
 更新内容: 增加维护页与导入弹窗下拉框统一使用 GlassSelect 的回归测试，防止原生白底 select 回流。
*/
/*
 更新时间: 2026-07-07 15:25:00 CST
 更新内容: 经营摘要回归测试改为 doesNotMatch，锁定 monthJudgement / annualJudgement / op-judgement 已从经营总览移除。
*/
/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 将 AI 小人布局验收切换为 2D Sprite 舞台，并约束维护页 context 传递。
*/
/*
 更新时间: 2026-07-06 18:53:22 CST
 更新内容: 经营总览回归测试改为要求风险渠道和年度节奏判断读取运行时真实数据。
*/
/*
 更新时间: 2026-07-06 17:02:49 CST
 更新内容: 增加年度节奏胶囊条回归测试，要求移除折线图并展示四项节奏指标、完成/剩余胶囊和下半年月均 447 万。
*/
/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: 布局守卫测试同步高级果味配色，覆盖银紫玫瑰高亮、玫瑰风险、香槟目标与算力容量冷蓝例外。
*/
/*
 更新时间: 2026-07-06 10:49:52 CST
 更新内容: 增加顶部品牌胶囊滚动折叠为 sticky 身份标识的回归测试。
*/
/*
 更新时间: 2026-07-06 00:20:59 CST
 更新内容: 增加所有仪表盘卡片复用月度趋势悬浮亮边效果的回归测试。
*/
/*
 更新时间: 2026-07-06 00:00:13 CST
 更新内容: 布局守卫测试同步算力与控件金色到高级哑金。
*/
/*
 更新时间: 2026-07-05 23:42:14 CST
 更新内容: 增加主界面满分高级感果味抛光回归测试，覆盖弱分隔线、低层级标题、年度图表呼吸、渠道完成率内联进度和二级弹窗低饱和控件。
*/
/*
 更新时间: 2026-07-05 22:59:45 CST
 更新内容: 增加年度节奏最终版三指标、单行辅助说明和单标题布局回归测试。
*/
/*
 更新时间: 2026-07-05 22:45:24 CST
 更新内容: 增加渠道完成表列头对齐、移除状态列并改为进度条的回归测试。
*/
/*
 更新时间: 2026-07-05 21:45:08 CST
 更新内容: 增加年度节奏精简指标、关键节点图表标签和渠道表本月/年度互斥列回归测试。
*/
/*
 更新时间: 2026-07-05 21:24:15 CST
 更新内容: 经营进度顶部微调回归测试，覆盖删眉题、查看近期明细、轻量节奏文案和弱分隔线。
*/
/*
 更新时间: 2026-07-05 19:10:30 CST
 更新内容: 增加经营总览信息密度、年度节奏虚线、渠道融合表和本月/年度二级入口回归测试。
*/
/*
 更新时间: 2026-07-05 18:46:00 CST
 更新内容: 调整经营总览回归测试，要求融合总览下方恢复月度趋势、开户投入、版本情况和交付面板。
*/
/*
 更新时间: 2026-07-05 18:20:00 CST
 更新内容: 增加经营总览三段融合改版的布局、渠道切换和顶部更新数据按钮回归测试。
*/
/*
 更新时间: 2026-07-05 16:12:00 CST
 更新内容: 回归测试锁定 220px 图文管理侧栏、非固定页面标题和移除年度风险预测块。
*/
/*
 Update time: 2026-07-04 01:03:12 CST
 Update content: Guard the restrained CEO dashboard pass with softer left ambient glow, more topbar breathing room, and a highlighted current month.
*/
/*
 Update time: 2026-07-04 00:23:37 CST
 Update content: Require search result feedback to use a one-shot soft purple glow instead of the electric border animation.
*/
/*
 Update time: 2026-07-03 23:39:28 CST
 Update content: Add regression coverage for calmer shared glass controls in the topbar, search, and sidebar.
*/
/*
 Update time: 2026-07-03 18:54:17 CST
 Update content: Require maintenance progress colors to use red below 80, purple below the 120 percent over-target line, and gold at 120 percent or above.
*/
/*
 Update time: 2026-07-03 18:31:29 CST
 Update content: Align compute and search-highlight visual guardrails with the graphite violet champagne palette.
*/
/*
 Update time: 2026-07-03 17:54:18 CST
 Update content: Require dashboard and compute cards to use the neutral dark glass recipe instead of transparent purple glass.
*/
/*
 Update time: 2026-07-03 17:53:00 CST
 Update content: Require compute donut charts to follow the unified violet-blue overview half-ring palette.
*/
/*
 Update time: 2026-07-03 15:24:00 CST
 Update content: Require search highlight and dashboard background wiring to follow the cold-purple Color Bends visual system.
*/
/*
 Update time: 2026-07-03 15:03:14 CST
 Update content: Require every maintenance-page side navigation column to use the organization-structure width.
*/
/*
 Update time: 2026-07-03 13:05:00 CST
 Update content: 搜索高亮边框断言改为冰蓝新色 rgba(110,168,255,.34)。
*/
/*
 Update time: 2026-07-03 11:33:47 CST
 Update content: Require maintenance selected-row overlays to use pure violet instead of pink-purple.
*/
/*
 Update time: 2026-07-03 11:19:40 CST
 Update content: Add regression coverage for unified organization-style maintenance side navigation.
*/
/*
 更新时间: 2026-07-03 11:45:24 CST
 更新内容: 合并本地与 ttoswar 维护页回归测试，采用远端维护页语义实色进度条预期。
*/
/*
 更新时间: 2026-07-03 11:45:57 CST
 更新内容: 合并维护页进度条语义实色规范的布局回归断言。
*/
/*
 更新时间: 2026-07-03 11:41:06 CST
 更新内容: 增加顶部品牌玻璃胶囊加宽到 256px 的回归测试。
*/
/*
 更新时间: 2026-07-03 10:59:56 CST
 更新内容: 增加开户数卡片复用顶部搜索定位边框的布局回归测试。
*/
/*
 Update time: 2026-07-03 11:11:56 CST
 Update content: Add regression coverage for purple maintenance row hover overlays and persistent clicked-row highlights.
*/
/*
 Update time: 2026-07-03 11:02:59 CST
 Update content: Require target maintenance progress text to show completed amount and percent on one line.
*/
/*
 Update time: 2026-07-03 10:54:19 CST
 Update content: Require target maintenance to use one wide scrolling table without pinned annual/current-quarter columns and solid progress colors.
*/
/*
 更新时间: 2026-07-03 10:47:37 CST
 更新内容: 增加顶部数据维护/返回主界面按钮去除左侧图标并收窄宽度的回归测试。
*/
/*
 Update time: 2026-07-03 10:29:25 CST
 Update content: Add regression coverage for current-month scroll alignment using the scroll pane coordinate system.
*/
/*
 Update time: 2026-07-03 10:21:20 CST
 Update content: Add regression coverage for target maintenance pinning only annual/current-quarter summary columns and aligning the scroll pane to the current month.
*/
/*
 Update time: 2026-07-03 10:04:51 CST
 Update content: Add regression coverage for compact maintenance year dropdown width.
*/
/*
 Update time: 2026-07-03 10:24:00 CST
 Update content: Add regression coverage for target maintenance current-quarter fixed columns.
*/
/*
 Update time: 2026-07-02 18:55:52 CST
 Update content: Add regression coverage for maintenance progress bars fading from a highlighted left edge to a softer right edge and sync maintenance input style expectations.
*/
/*
 Update time: 2026-07-02 18:49:46 CST
 Update content: Add regression coverage for placing the data maintenance pill inside the right toolbar before search.
*/
/*
 更新时间: 2026-07-06 00:13:39 CST
 更新内容: 增加版本情况面板复用月度趋势悬浮亮边效果的回归测试。
*/
/*
 更新时间: 2026-07-05 23:59:27 CST
 更新内容: 增加搜索命中外壳不改变经营总览卡片网格位置的回归测试。
*/
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
/*
 Update time: 2026-07-02 18:16:13 CST
 Update content: Expect search highlight green to use the restored fluorescent lime RGB.
*/
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const mockSource = readFileSync(new URL('./data/mock.js', import.meta.url), 'utf8');
const dashboardCss = readFileSync(new URL('./dashboard.css', import.meta.url), 'utf8');
const indexCss = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const projectAgentGuidance = readFileSync(new URL('../../AGENTS.md', import.meta.url), 'utf8');
const kpiCardCss = readFileSync(new URL('./components/KpiCard.css', import.meta.url), 'utf8');
const kpiModalSource = readFileSync(new URL('./components/KpiModal.jsx', import.meta.url), 'utf8');
const kpiModalCss = readFileSync(new URL('./components/KpiModal.css', import.meta.url), 'utf8');
const monthlyTrendSource = readFileSync(new URL('./components/MonthlyTrend.jsx', import.meta.url), 'utf8');
const aiAnalysisWidgetCss = readFileSync(new URL('./components/AIAnalysisWidget.css', import.meta.url), 'utf8');
const aiAnalysisWidgetSource = readFileSync(new URL('./components/AIAnalysisWidget.jsx', import.meta.url), 'utf8');
const mascotSpriteStageCss = readFileSync(new URL('./components/MascotSpriteStage.css', import.meta.url), 'utf8');
const deliveryPanelCss = readFileSync(new URL('./components/DeliveryPanel.css', import.meta.url), 'utf8');
const channelPanelSource = readFileSync(new URL('./components/ChannelPanel.jsx', import.meta.url), 'utf8');
const channelPanelCss = readFileSync(new URL('./components/ChannelPanel.css', import.meta.url), 'utf8');
const operatingOverviewUrl = new URL('./components/OperatingOverview.jsx', import.meta.url);
const operatingOverviewCssUrl = new URL('./components/OperatingOverview.css', import.meta.url);
const operatingOverviewSource = existsSync(operatingOverviewUrl) ? readFileSync(operatingOverviewUrl, 'utf8') : '';
const operatingOverviewCss = existsSync(operatingOverviewCssUrl) ? readFileSync(operatingOverviewCssUrl, 'utf8') : '';
const sidebarCss = readFileSync(new URL('./components/Sidebar.css', import.meta.url), 'utf8');
const versionFinancePanelCss = readFileSync(new URL('./components/VersionFinancePanel.css', import.meta.url), 'utf8');
const openingMetricCardsCss = readFileSync(new URL('./components/OpeningMetricCards.css', import.meta.url), 'utf8');
const computePageSource = readFileSync(new URL('./components/ComputeUsagePage.jsx', import.meta.url), 'utf8');
const computePageCss = readFileSync(new URL('./components/ComputeUsagePage.css', import.meta.url), 'utf8');
const maintenancePageSource = readFileSync(new URL('./components/MaintenancePage.jsx', import.meta.url), 'utf8');
const maintenancePageCss = readFileSync(new URL('./components/MaintenancePage.css', import.meta.url), 'utf8');
const maintenanceImportDialogSource = readFileSync(new URL('./components/MaintenanceImportDialog.jsx', import.meta.url), 'utf8');
const searchResultBorderSource = readFileSync(new URL('./components/SearchResultBorder.jsx', import.meta.url), 'utf8');
const sidebarSource = readFileSync(new URL('./components/Sidebar.jsx', import.meta.url), 'utf8');
const expandableSearchSource = readFileSync(new URL('./components/ExpandableSearch.jsx', import.meta.url), 'utf8');
const glassSurfaceCss = readFileSync(new URL('./components/GlassSurface/GlassSurface.css', import.meta.url), 'utf8');

function cssRuleBody(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\n\\}`))?.groups.body ?? '';
}

test('keeps the overview on a fixed operating story layout', () => {
  assert.doesNotMatch(appSource, /DraggableKpiLayer/);
  assert.doesNotMatch(appSource, /DraggablePanelLayer/);
  assert.match(appSource, /<OperatingOverview[\s\S]*?searchTerm=\{searchTerm\}[\s\S]*?\/>/);
  assert.match(operatingOverviewSource, /className="op-overview"/);
  assert.match(operatingOverviewCss, /\.op-overview\s*\{[\s\S]*?display:\s*grid;/);
  assert.doesNotMatch(appSource, /recoveryKpiCards/);
  assert.doesNotMatch(appSource, /sidePanel=\{<ChannelPanel/);
  assert.doesNotMatch(appSource, /const gridClassName = activeMenu === 'overview'/);
  assert.doesNotMatch(appSource, /className=\{gridClassName\}/);
});

test('renders compute usage analysis as an independent dashboard page', () => {
  assert.match(appSource, /import ComputeUsagePage from '\.\/components\/ComputeUsagePage';/);
  assert.match(appSource, /const isComputePage = activeMenu === 'compute';/);
  assert.match(appSource, /isComputePage \? \(/);
  assert.match(appSource, /<ComputeUsagePage searchTerm=\{searchTerm\} dim="day" dateRange=\{\[\]\} computeDataState=\{computeDataState\} \/>/);
  assert.match(appSource, /: \(\s*<>[\s\S]*?<OperatingOverview[\s\S]*?searchTerm=\{searchTerm\}/);
});

test('uses neutral dark glass backgrounds without BorderGlow sweep for top compute KPI cards', () => {
  const computeKpiBlock = cssRuleBody(computePageCss, '.cpu-kpi');
  const computeTrendPanelBlock = cssRuleBody(computePageCss, '.cpu-panel');

  assert.doesNotMatch(computePageSource, /import BorderGlow from '\.\/BorderGlow\/BorderGlow';/);
  assert.doesNotMatch(computePageSource, /<BorderGlow/);
  assert.match(computePageSource, /<article className=\{`cpu-kpi cpu-kpi--\$\{tone\}\$\{active \? ' cpu-kpi--match' : ''\}`\}>/);
  assert.match(computePageCss, /\.cpu-kpi \{[\s\S]*?background:\s*var\(--dashboard-card-bg\);[\s\S]*?border:\s*1px solid var\(--dashboard-card-border\);[\s\S]*?border-radius:\s*16px;[\s\S]*?box-shadow:\s*var\(--dashboard-card-shadow\);/);
  assert.match(computeKpiBlock, /backdrop-filter:\s*var\(--dashboard-card-blur\);/);
  assert.match(computeTrendPanelBlock, /background:\s*var\(--dashboard-card-bg\);/);
  assert.match(computeTrendPanelBlock, /border:\s*1px solid var\(--dashboard-card-border\);/);
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
  assert.match(computePageSource, /const usagePeakLineColor = tokens\.semanticGoal;/);
  assert.match(computePageSource, /const usagePeakLabelColor = '#F7F8FC';/);
  assert.match(computePageSource, /const maxUsage = Math\.max\(\.\.\.usage\);/);
  assert.match(computePageSource, /const usagePeakLineData = usage\.map\(\(value\) => \(\{/);
  assert.match(computePageSource, /label:\s*\{[\s\S]*?show:\s*true[\s\S]*?color:\s*usagePeakLabelColor,[\s\S]*?fontWeight:\s*780,[\s\S]*?formatter:\s*\(params\) => formatWan\(params\.value\)[\s\S]*?textBorderColor:\s*'rgba\(13,0,22,\.82\)'[\s\S]*?textBorderWidth:\s*2[\s\S]*?textShadowColor:\s*'rgba\(0,0,0,\.82\)'[\s\S]*?textShadowBlur:\s*6/);
  assert.doesNotMatch(computePageSource, /label:\s*value === maxUsage \?/);
  assert.doesNotMatch(computePageSource, /textShadowColor:\s*'rgba\(255,74,255,\.78\)'/);
  assert.match(computePageSource, /lineStyle:\s*\{ color: usagePeakLineColor, width: 2\.4[\s\S]*?shadowBlur: 14[\s\S]*?shadowColor: 'rgba\(201,169,107,\.26\)'/);
  assert.match(computePageSource, /itemStyle:\s*\{[\s\S]*?color:\s*usagePeakLineColor,[\s\S]*?borderColor:\s*'#ffffff'/);
  assert.match(computePageSource, /barCategoryGap:\s*'42%'/);
  assert.doesNotMatch(computePageSource, /目标用量/);
  assert.doesNotMatch(computePageSource, /完成率%/);
  assert.doesNotMatch(computePageSource, /label:\s*'完成率'/);
  assert.doesNotMatch(computePageSource, /barGap:\s*'-100%'/);
  const usageTrendSource = computePageSource.match(/function buildTrendOption[\s\S]*?function buildCapacityTrendOption/)?.[0] ?? '';
  assert.doesNotMatch(usageTrendSource, /yAxisIndex:\s*1/);
  assert.doesNotMatch(computePageSource, /const completionColor = '#f472b6';/);
  assert.doesNotMatch(computePageSource, /#dfff00/);
  assert.doesNotMatch(computePageSource, /#ff4d5f/);
  assert.match(computePageSource, /axisLabel:\s*\{ color: faint, fontSize: 12, interval: 0, hideOverlap: false, margin: 12 \}/);
  assert.match(computePageSource, /xAxis:\s*\{ axisLabel:\s*\{ interval: 0, hideOverlap: false, fontSize: 11 \} \}/);
  assert.doesNotMatch(computePageSource, /stack:\s*'usage'/);
  assert.doesNotMatch(computePageSource, /name:\s*'总容量'[\s\S]*?type:\s*'line'/);
});

test('keeps the right toolbar focused on search while data keeps default monthly filters', () => {
  assert.doesNotMatch(appSource, /import ThemeToggle/);
  assert.doesNotMatch(appSource, /import DateRangePicker/);
  assert.doesNotMatch(appSource, /import Segmented/);
  assert.doesNotMatch(appSource, /const DIM_OPTS = \[/);
  assert.doesNotMatch(appSource, /COMPUTE_PERIOD_OPTS/);
  assert.doesNotMatch(appSource, /computePeriod/);
  assert.match(appSource, /const dim = 'month';/);
  assert.match(appSource, /const dateRange = DEFAULT_FILTER_RANGE;/);
  assert.match(appSource, /<div className="dash-tools">\s*<ExpandableSearch[\s\S]*?onChange=\{setSearchTerm\}[\s\S]*?currentIndex=\{searchStats\.current\}[\s\S]*?totalResults=\{searchStats\.total\}[\s\S]*?onNext=\{jumpToNextSearchResult\}[\s\S]*?\/>\s*<\/div>/);
  assert.doesNotMatch(appSource, /aria-label="更新数据"/);
  assert.doesNotMatch(appSource, /<span>更新数据<\/span>/);
  assert.doesNotMatch(appSource, /<DateRangePicker/);
  assert.doesNotMatch(appSource, /<Segmented options=\{DIM_OPTS\}/);
  assert.doesNotMatch(appSource, /<ThemeToggle/);
  assert.match(appSource, /<ComputeUsagePage searchTerm=\{searchTerm\} dim="day" dateRange=\{\[\]\} computeDataState=\{computeDataState\} \/>/);
  assert.match(computePageSource, /export default function ComputeUsagePage\(\{ searchTerm = '', dim = 'month', dateRange = \[\], computeDataState = \{ status: 'ready', error: '' \} \}\)/);
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
  assert.match(appSource, /\}, \[searchTerm, activeSearchIndex, contentKey, isComputePage, dashboardDataState\.status, computeDataState\.status\]\);/);
  assert.doesNotMatch(appSource, /\}, \[searchTerm, activeSearchIndex, contentKey, isComputePage, filteredKpiCards, dashboardDataVersion\]\);/);
});

test('keeps overview card placement stable when search result wrappers appear', () => {
  assert.match(searchResultBorderSource, /export default function SearchResultBorder\(\{ active, children, className = '' \}\)/);
  assert.match(operatingOverviewSource, /<SearchResultBorder active=\{matchesSearchTerm\(progressKeywords, searchTerm\)\} className="op-search-result op-search-result--progress">/);
  assert.match(operatingOverviewSource, /<SearchResultBorder active=\{matchesSearchTerm\(ANNUAL_KEYWORDS, searchTerm\)\} className="op-search-result op-search-result--annual">/);
  assert.doesNotMatch(operatingOverviewSource, /CHANNEL_KEYWORDS/);
  assert.doesNotMatch(operatingOverviewSource, /op-search-result--channel/);
  assert.match(cssRuleBody(operatingOverviewCss, '.op-search-result--progress'), /grid-area:\s*progress;/);
  assert.match(cssRuleBody(operatingOverviewCss, '.op-search-result--annual'), /grid-area:\s*annual;/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-search-result--channel/);
});

test('morphs the FuKe brand capsule into compact and minimal sticky identities on scroll', () => {
  const brandBlock = cssRuleBody(dashboardCss, '.dash-topbar .brand');
  const brandTitleBlock = cssRuleBody(dashboardCss, '.dash-topbar .brand b');
  const brandMetaBlock = cssRuleBody(dashboardCss, '.dash-topbar .brand small');
  const compactBrandBlock = cssRuleBody(dashboardCss, '.dash-topbar .brand-glass--compact');
  const minimalBrandBlock = cssRuleBody(dashboardCss, '.dash-topbar .brand-glass--minimal');
  const inlineCopyBlock = cssRuleBody(dashboardCss, '.dash-topbar .brand-copy-inline');

  assert.match(mockSource, /monthLabel: '2026年6月'/);
  assert.doesNotMatch(mockSource, /monthLabel: '2026 年 6 月'/);
  assert.match(appSource, /import MetallicPaint from '\.\/components\/MetallicPaint\/MetallicPaint';/);
  assert.match(appSource, /const \[brandMode, setBrandMode\] = useState\('full'\);/);
  assert.match(appSource, /const compactMonthLabel = formatCompactMonthLabel\(META\.monthLabel\);/);
  assert.match(appSource, /const brandIdentityText = brandMode === 'minimal'\s*\?\s*'经营驾驶舱'\s*:\s*`福客经营驾驶舱 · \$\{compactMonthLabel\} · \$\{compactContextLabel\}`;/);
  assert.match(appSource, /const BRAND_FULL_ENTER_SCROLL = 56;/);
  assert.match(appSource, /const BRAND_FULL_EXIT_SCROLL = 104;/);
  assert.match(appSource, /const fullThreshold = currentMode === 'full' \? BRAND_FULL_EXIT_SCROLL : BRAND_FULL_ENTER_SCROLL;/);
  assert.match(appSource, /scrollTop <= fullThreshold[\s\S]*?'full'[\s\S]*?deepScroll \? 'minimal' : 'compact'/);
  assert.match(appSource, /window\.addEventListener\('scroll', requestBrandMode, \{ passive: true \}\);/);
  assert.match(appSource, /<GlassSurface[\s\S]*?width=\{brandMode === 'full' \? 320 : brandMode === 'compact' \? 248 : 180\}[\s\S]*?height=\{brandMode === 'full' \? 62 : brandMode === 'compact' \? 40 : 38\}[\s\S]*?borderRadius=\{brandMode === 'full' \? 22 : 16\}[\s\S]*?backgroundOpacity=\{brandMode === 'full' \? 0\.045 : brandMode === 'compact' \? 0\.03 : 0\.018\}[\s\S]*?className=\{`brand-glass brand-glass--\$\{brandMode\}`\}[\s\S]*?<div className="brand"/);
  assert.match(appSource, /<span className="brand-logo-paint" aria-hidden="true">[\s\S]*?<MetallicPaint[\s\S]*?imageSrc="\/logo-black\.png"[\s\S]*?\/>[\s\S]*?<\/span>/);
  assert.match(appSource, /<div className="brand-copy">[\s\S]*?<span className="brand-copy-full"[\s\S]*?<b>福客经营驾驶舱<\/b>[\s\S]*?<small>\{META\.monthLabel\} \/ \{activeContextLabel\}<\/small>[\s\S]*?<\/span>[\s\S]*?<span className="brand-copy-inline">\{brandIdentityText\}<\/span>[\s\S]*?<\/div>/);
  assert.match(appSource, /<div className="dash-secondary-grid" ref=\{secondaryGridRef\}>/);
  assert.match(dashboardCss, /\.dash-topbar \.brand-glass\{[\s\S]*?flex:0 0 320px;[\s\S]*?min-width:320px[\s\S]*?transition:width \.26s cubic-bezier\(\.22,1,\.36,1\),height \.26s cubic-bezier\(\.22,1,\.36,1\),flex-basis \.26s cubic-bezier\(\.22,1,\.36,1\),min-width \.26s cubic-bezier\(\.22,1,\.36,1\),max-width \.26s cubic-bezier\(\.22,1,\.36,1\),opacity \.26s cubic-bezier\(\.22,1,\.36,1\),filter \.26s cubic-bezier\(\.22,1,\.36,1\) !important;/);
  assert.match(compactBrandBlock, /flex-basis:\s*248px;/);
  assert.match(compactBrandBlock, /min-width:\s*248px;/);
  assert.match(compactBrandBlock, /max-width:\s*248px;/);
  assert.match(minimalBrandBlock, /flex-basis:\s*180px;/);
  assert.match(minimalBrandBlock, /min-width:\s*180px;/);
  assert.match(minimalBrandBlock, /max-width:\s*180px;/);
  assert.match(minimalBrandBlock, /opacity:\s*\.74;/);
  assert.match(brandBlock, /padding:\s*0 18px;/);
  assert.match(brandBlock, /gap:\s*13px;/);
  assert.match(brandTitleBlock, /font-size:\s*20px;/);
  assert.match(brandTitleBlock, /font-weight:\s*760;/);
  assert.match(brandMetaBlock, /font-size:\s*16px;/);
  assert.match(brandMetaBlock, /color:\s*rgba\(247,248,252,\.58\);/);
  assert.match(inlineCopyBlock, /font-size:\s*14px;/);
  assert.match(inlineCopyBlock, /white-space:\s*nowrap;/);
  assert.match(inlineCopyBlock, /text-overflow:\s*ellipsis;/);
  assert.doesNotMatch(appSource, /<div className="dash-title-block">/);
  assert.doesNotMatch(dashboardCss, /\.dash-title-block/);
  assert.doesNotMatch(appSource, /className="dash-page-context"/);
  assert.doesNotMatch(dashboardCss, /\.dash-page-context/);
  assert.match(appSource, /const activeContextLabel = maintenanceMode\s*\?\s*'数据维护'\s*:\s*activeMenu === 'overview' \? 'CEO视角' : activeMenuLabel;/);
  assert.doesNotMatch(appSource, /<small>\{META\.monthLabel\}｜\{activeContextLabel\}<\/small>/);
  assert.doesNotMatch(appSource, /<small>\{META\.monthLabel\} \| \{activeContextLabel\}<\/small>/);
  assert.doesNotMatch(appSource, /福客 · CEO 经营驾驶舱/);
  assert.doesNotMatch(appSource, /\{META\.monthLabel\} · \{activeMenu === 'overview' \? '月度视角' : activeMenuLabel\}/);
});

test('adds a dashboard maintenance entry and a compact sidebar return item that swaps the navigation', () => {
  assert.match(appSource, /import \{ META, MENU, MAINTENANCE_MENU, getDashboardChannelKey, getDashboardMenuLabel \} from '\.\/data\/mock';/);
  assert.match(appSource, /const DEFAULT_MAINTENANCE_MENU = MAINTENANCE_MENU\[0\]\?\.key \?\? 'target-maintenance';/);
  assert.match(appSource, /const MAINTENANCE_HOME_ITEM = \{ key: 'dashboard-home', name: '经营总览', icon: 'return', section: '导航' \};/);
  assert.match(appSource, /const MAINTENANCE_SIDEBAR_ITEMS = \[\s*MAINTENANCE_HOME_ITEM,\s*\.\.\.MAINTENANCE_MENU\.map\(\(item\) => \(\{ \.\.\.item, section: '数据维护' \}\)\),\s*\];/);
  assert.match(appSource, /const \[maintenanceMode,\s*setMaintenanceMode\] = useState\(false\);/);
  assert.match(appSource, /const \[activeMaintenanceMenu,\s*setActiveMaintenanceMenu\] = useState\(DEFAULT_MAINTENANCE_MENU\);/);
  assert.match(appSource, /const sidebarItems = maintenanceMode \? MAINTENANCE_SIDEBAR_ITEMS : DASHBOARD_SIDEBAR_ITEMS;/);
  assert.match(appSource, /const sidebarActive = maintenanceMode \? activeMaintenanceMenu : activeMenu;/);
  assert.match(appSource, /const sidebarTransitionKey = maintenanceMode \? 'maintenance' : 'dashboard';/);
  assert.match(appSource, /const activeContextLabel = maintenanceMode\s*\?\s*'数据维护'\s*:/);
  assert.doesNotMatch(appSource, /`数据维护 · \$\{activeMaintenanceLabel\}`/);
  assert.match(appSource, /function handleSidebarChange\(nextMenu\) \{[\s\S]*?if \(nextMenu === 'data-maintenance'\) \{[\s\S]*?setMaintenanceMode\(true\);[\s\S]*?setActiveMaintenanceMenu\(DEFAULT_MAINTENANCE_MENU\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?if \(nextMenu === 'dashboard-home'\) \{[\s\S]*?handleMaintenanceBack\(\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?if \(maintenanceMode\) \{[\s\S]*?setActiveMaintenanceMenu\(nextMenu\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?handleMenuChange\(nextMenu\);[\s\S]*?\}/);
  assert.doesNotMatch(appSource, /function handleMaintenanceModeToggle\(\)/);
  assert.match(appSource, /<Sidebar items=\{sidebarItems\} active=\{sidebarActive\} onChange=\{handleSidebarChange\} transitionKey=\{sidebarTransitionKey\} \/>/);
  assert.doesNotMatch(appSource, /className="maintenance-back-glass"/);
  assert.doesNotMatch(appSource, /dash-maintenance-switch--sidebar/);
  assert.doesNotMatch(appSource, /aria-label="返回主界面"/);
  assert.doesNotMatch(appSource, /className="maintenance-glass"/);
  assert.match(appSource, /<div className="dash-tools">\s*<ExpandableSearch/);
  assert.doesNotMatch(appSource, /aria-label="更新数据"/);
  assert.doesNotMatch(appSource, /<span>更新数据<\/span>/);
  assert.doesNotMatch(appSource, /className=\{`dash-maintenance-switch\$\{maintenanceMode \? ' dash-maintenance-switch--active' : ''\}`\}/);
  assert.doesNotMatch(appSource, /aria-pressed=\{maintenanceMode\}/);
  assert.doesNotMatch(appSource, /\{maintenanceMode \? '返回主界面' : '更新数据'\}/);
  assert.doesNotMatch(appSource, /dash-maintenance-switch__icon/);
  assert.doesNotMatch(dashboardCss, /\.dash-tools \.maintenance-glass/);
  assert.doesNotMatch(dashboardCss, /\.dash-topbar \.maintenance-glass\{[\s\S]*?margin-left:auto;/);
  assert.doesNotMatch(dashboardCss, /\.dash-topbar \.maintenance-glass \.glass-surface__content/);
  assert.doesNotMatch(dashboardCss, /maintenance-back-glass/);
  assert.doesNotMatch(dashboardCss, /dash-maintenance-switch/);
  assert.doesNotMatch(dashboardCss, /dash-maintenance-switch--sidebar/);
  assert.doesNotMatch(dashboardCss, /dash-maintenance-switch--active/);
  assert.match(projectAgentGuidance, /所有卡片和按钮的背景、边框、模糊、阴影与圆角必须优先复用项目既有统一玻璃体系/);
});

test('softens the shared glass controls so navigation and top tools stay restrained', () => {
  assert.match(appSource, /className=\{`brand-glass brand-glass--\$\{brandMode\}`\}/);
  assert.match(sidebarSource, /<GlassSurface[\s\S]*?brightness=\{46\}[\s\S]*?blur=\{12\}[\s\S]*?displace=\{0\.22\}[\s\S]*?backgroundOpacity=\{0\.052\}[\s\S]*?distortionScale=\{-44\}[\s\S]*?className="sb-glass"/);
  assert.match(expandableSearchSource, /brightness=\{48\}[\s\S]*?blur=\{7\}[\s\S]*?displace=\{0\.35\}[\s\S]*?backgroundOpacity=\{0\.035\}[\s\S]*?distortionScale=\{-60\}/);
  assert.match(glassSurfaceCss, /\.glass-surface--svg\s*\{[\s\S]*?box-shadow:[\s\S]*?inset 0 0 0 1px[\s\S]*?inset 0 1px 0 rgba\(255, 255, 255, 0\.10\)[\s\S]*?0px 10px 30px rgba\(17, 17, 26, 0\.08\);/);
  assert.doesNotMatch(glassSurfaceCss, /0px 16px 56px rgba\(17, 17, 26, 0\.05\) inset/);
});

test('uses a 220px icon and text management sidebar with restrained hierarchy', () => {
  const sidebarItemBlock = cssRuleBody(sidebarCss, '.sb-item');
  const sidebarNameBlock = cssRuleBody(sidebarCss, '.sb-name');
  const sidebarSectionBlock = cssRuleBody(sidebarCss, '.sb-section-title');

  assert.match(appSource, /const DASHBOARD_SIDEBAR_ITEMS = \[[\s\S]*?\.\.\.MENU\.map[\s\S]*?key: 'data-maintenance'[\s\S]*?section: '系统'/);
  assert.doesNotMatch(appSource, /search-history|搜索记录/);
  assert.doesNotMatch(appSource, /channel-analysis/);
  assert.doesNotMatch(appSource, /customer-conversion/);
  assert.doesNotMatch(appSource, /name: '渠道分析'/);
  assert.doesNotMatch(appSource, /name: '客户转化'/);
  assert.match(appSource, /const MAINTENANCE_SIDEBAR_ITEMS = \[\s*MAINTENANCE_HOME_ITEM,\s*\.\.\.MAINTENANCE_MENU\.map\(\(item\) => \(\{ \.\.\.item, section: '数据维护' \}\)\),\s*\];/);
  assert.match(dashboardCss, /\.dash-aside\{[\s\S]*?width:220px;[\s\S]*?padding:18px 12px;/);
  assert.match(sidebarSource, /<nav className=\{`sb-root sb-root--\$\{visiblePhase\}`\} aria-label="主导航" data-transition-key=\{transitionKey\}>/);
  assert.match(sidebarSource, /<button[\s\S]*?type="button"[\s\S]*?className=\{`sb-item\$\{item\.key === visibleActive \? ' sb-item--active' : ''\}`\}[\s\S]*?aria-label=\{item\.name\}[\s\S]*?title=\{item\.name\}/);
  assert.match(sidebarSource, /<span className="sb-section-title">\{section\.title\}<\/span>/);
  assert.match(sidebarSource, /disabled=\{Boolean\(item\.disabled\)\}/);
  assert.match(sidebarCss, /\.sb-root\s*\{[\s\S]*?width:\s*100%;[\s\S]*?padding:\s*12px;/);
  assert.match(sidebarItemBlock, /justify-content:\s*flex-start;/);
  assert.match(sidebarItemBlock, /gap:\s*10px;/);
  assert.match(sidebarItemBlock, /height:\s*44px;/);
  assert.match(sidebarItemBlock, /border-radius:\s*12px;/);
  assert.match(sidebarNameBlock, /font-size:\s*14px;/);
  assert.match(sidebarNameBlock, /font-weight:\s*500;/);
  assert.match(sidebarNameBlock, /color:\s*rgba\(255,255,255,\.62\);/);
  assert.match(sidebarSectionBlock, /font-size:\s*12px;/);
  assert.match(sidebarSectionBlock, /color:\s*rgba\(255,255,255,\.34\);/);
  assert.match(sidebarSectionBlock, /letter-spacing:\s*\.08em;/);
  assert.match(sidebarCss, /\.sb-icon\s*\{[\s\S]*?width:\s*16px;[\s\S]*?height:\s*16px;/);
  assert.match(sidebarCss, /\.sb-item--active\s*\{[\s\S]*?background:\s*rgba\(255,255,255,\.065\);[\s\S]*?border-color:\s*rgba\(255,255,255,\.08\);/);
  assert.match(sidebarCss, /\.sb-item--active::before\s*\{[\s\S]*?width:\s*3px;[\s\S]*?height:\s*18px;[\s\S]*?background:\s*linear-gradient\(180deg,#A994FF,#7F6BFF\);/);
  assert.doesNotMatch(sidebarNameBlock, /position:\s*absolute/);
  assert.doesNotMatch(sidebarNameBlock, /opacity:\s*0/);
  assert.doesNotMatch(sidebarSource, /<div className="sb-title">导航<\/div>/);
});

test('smooths the sidebar swap between dashboard and data maintenance modes', () => {
  assert.match(appSource, /const sidebarTransitionKey = maintenanceMode \? 'maintenance' : 'dashboard';/);
  assert.match(appSource, /<Sidebar items=\{sidebarItems\} active=\{sidebarActive\} onChange=\{handleSidebarChange\} transitionKey=\{sidebarTransitionKey\} \/>/);
  assert.match(sidebarSource, /const SIDEBAR_LEAVE_MS = 110;/);
  assert.match(sidebarSource, /const SIDEBAR_ENTER_MS = 220;/);
  assert.match(sidebarSource, /export default function Sidebar\(\{ items = \[\], active, onChange, transitionKey = 'default' \}\)/);
  assert.match(sidebarSource, /phase: 'leaving'/);
  assert.match(sidebarSource, /phase: 'entering'/);
  assert.match(sidebarSource, /const visiblePhase = transitionState\.transitionKey === transitionKey \? transitionState\.phase : 'leaving';/);
  assert.match(sidebarSource, /className=\{`sb-root sb-root--\$\{visiblePhase\}`\}/);
  assert.match(sidebarCss, /\.sb-root\s*\{[\s\S]*?min-height:\s*274px;[\s\S]*?transition:\s*min-height \.28s cubic-bezier\(\.22,1,\.36,1\);/);
  assert.match(sidebarCss, /\.sb-root--leaving \.sb-list-item,\s*[\s\S]*?\.sb-root--leaving \.sb-section-title\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?filter:\s*blur\(2px\);[\s\S]*?transform:\s*translateY\(7px\) scale\(\.992\);/);
  assert.match(sidebarCss, /\.sb-root--entering \.sb-list-item\s*\{[\s\S]*?animation:\s*sbNavItemIn \.3s cubic-bezier\(\.22,1,\.36,1\) both;/);
  assert.match(sidebarCss, /\.sb-item::before\s*\{[\s\S]*?transition:\s*opacity \.26s cubic-bezier\(\.22,1,\.36,1\), transform \.26s cubic-bezier\(\.22,1,\.36,1\);/);
  assert.match(sidebarCss, /@keyframes sbNavItemIn/);
  assert.match(sidebarCss, /@media \(prefers-reduced-motion: reduce\)/);
});

test('renders data maintenance as four independent pages instead of the dashboard grid', () => {
  assert.match(appSource, /import MaintenancePage from '\.\/components\/MaintenancePage';/);
  assert.match(appSource, /const isMaintenancePage = maintenanceMode;/);
  assert.match(appSource, /function handleMaintenanceBack\(\) \{[\s\S]*?setMaintenanceMode\(false\);[\s\S]*?setActiveMenu\('overview'\);[\s\S]*?setActiveMaintenanceMenu\(DEFAULT_MAINTENANCE_MENU\);[\s\S]*?\}/);
  assert.match(appSource, /isMaintenancePage \? \([\s\S]*?<MaintenancePage activePage=\{activeMaintenanceMenu\} onBack=\{handleMaintenanceBack\} \/>[\s\S]*?\) : isComputePage \? \(/);
  assert.match(maintenancePageSource, /export default function MaintenancePage\(\{ activePage = 'target-maintenance' \}\)/);
  assert.match(maintenancePageSource, /const PAGE_RENDERERS = \{/);
  assert.match(maintenancePageSource, /'target-maintenance': TargetMaintenancePage/);
  assert.match(maintenancePageSource, /'cost-maintenance': CostMaintenancePage/);
  assert.match(maintenancePageSource, /'org-maintenance': OrgMaintenancePage/);
  assert.match(maintenancePageSource, /'channel-maintenance': ChannelMaintenancePage/);
});

test('builds the target and cost maintenance pages from reference matrix content', () => {
  assert.match(maintenancePageSource, /MAINTENANCE_PERIOD_COLUMNS/);
  assert.match(maintenancePageSource, /import \{ fetchMaintenanceData \} from '\.\.\/data\/maintenanceLiveData\.js';/);
  assert.match(maintenancePageSource, /case 'target-maintenance': return \{ rows: d\.rows, orgTree: d\.orgTree \};/);
  assert.match(maintenancePageSource, /下载模板/);
  assert.match(maintenancePageSource, /Excel导入/);
  assert.match(maintenancePageSource, /保存目标/);
  assert.match(maintenancePageSource, /年度目标/);
  assert.match(maintenancePageSource, /目标维护/);
  assert.match(maintenancePageSource, /case 'cost-maintenance': return \{ costChannels: d\.channels, costRows: d\.rows, laborRows: d\.laborRows \};/);
  assert.match(maintenancePageSource, /渠道成本维护/);
  assert.match(maintenancePageSource, /人力成本维护/);
  assert.match(maintenancePageSource, /保存成本/);
});

test('keeps target maintenance completed amount and percent on one line', () => {
  assert.match(maintenancePageSource, /function formatWanCompact\(value\) \{[\s\S]*?return formatWan\(value\)\.replace\(\/\\s\+\/g, ''\);[\s\S]*?\}/);
  assert.match(maintenancePageSource, /function ProgressLine\(\{ period \}\) \{[\s\S]*?const progressText = period\?\.target \? formatPct\(period\.pct\) : '未设目标';[\s\S]*?<div className="mnt-mini-line">完成\{formatWanCompact\(period\?\.actual\)\} · \{progressText\}<\/div>/);
  assert.doesNotMatch(maintenancePageSource, /mnt-mini-line--pct/);
  assert.doesNotMatch(maintenancePageCss, /\.mnt-mini-line--pct/);
});

test('keeps target maintenance periods in one scrollable table without pinned summary columns', () => {
  assert.match(maintenancePageSource, /import \{[\s\S]*?META,[\s\S]*?MAINTENANCE_PERIOD_COLUMNS/);
  assert.match(maintenancePageSource, /const TARGET_PERIOD_COLUMNS = buildTargetPeriodColumns\(MAINTENANCE_PERIOD_COLUMNS, META\.monthLabel\);/);
  assert.doesNotMatch(maintenancePageSource, /TARGET_FIXED_PERIOD_COLUMNS/);
  assert.doesNotMatch(maintenancePageSource, /TARGET_SCROLL_PERIOD_COLUMNS/);
  assert.doesNotMatch(maintenancePageSource, /targetPinned/);
  assert.match(maintenancePageSource, /function getMaintenanceCurrentMonth\(monthLabel = ''\) \{/);
  assert.doesNotMatch(maintenancePageSource, /pinnedQuarterColumns/);
  assert.doesNotMatch(maintenancePageSource, /fixedKeys/);
  assert.doesNotMatch(maintenancePageSource, /quarterKey/);
  assert.match(maintenancePageSource, /targetCurrentMonth:\s*column\.month === currentMonth/);
  assert.match(maintenancePageSource, /data-target-current-month=\{column\.targetCurrentMonth \? 'true' : undefined\}/);
  assert.doesNotMatch(maintenancePageSource, /quarterStartMonth/);
  assert.doesNotMatch(maintenancePageSource, /column\.month >=/);
});

test('renders target maintenance as a single wide horizontal matrix with wider cells', () => {
  const targetWrapBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix-wrap--target');
  const targetScrollPaneBlock = cssRuleBody(maintenancePageCss, '.mnt-target-scroll-pane');
  const targetTableBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix--target');
  const numberInputBlock = cssRuleBody(maintenancePageCss, '.mnt-number-input');

  assert.match(maintenancePageSource, /function useTargetCurrentMonthAlignment\(\) \{/);
  assert.match(maintenancePageSource, /const currentMonthHeader = scrollPane\.querySelector\('\[data-target-current-month="true"\]'\);/);
  assert.match(maintenancePageSource, /currentMonthHeader\.offsetLeft \+ currentMonthHeader\.offsetWidth - scrollPane\.clientWidth/);
  assert.match(maintenancePageSource, /scrollPane\.scrollLeft = Math\.max\(0, Math\.min\(targetScrollLeft, maxScrollLeft\)\);/);
  assert.match(maintenancePageSource, /<div className="mnt-target-scroll-pane" ref=\{targetScrollPaneRef\}>[\s\S]*?<table className="mnt-matrix mnt-matrix--target">/);
  assert.match(maintenancePageSource, /\{TARGET_PERIOD_COLUMNS\.map\(\(column\) => <TargetPeriodHeader key=\{column\.key\} column=\{column\} \/>\)\}/);
  assert.doesNotMatch(maintenancePageSource, /mnt-target-fixed-pane/);
  assert.doesNotMatch(maintenancePageSource, /mnt-matrix--target-fixed/);
  assert.doesNotMatch(maintenancePageSource, /mnt-matrix--target-scroll/);
  assert.match(targetWrapBlock, /--mnt-target-name-width:\s*186px;/);
  assert.match(targetWrapBlock, /--mnt-target-period-width:\s*172px;/);
  assert.match(targetWrapBlock, /overflow:\s*hidden;/);
  assert.match(targetScrollPaneBlock, /overflow:\s*auto;/);
  assert.match(targetScrollPaneBlock, /overscroll-behavior-x:\s*contain;/);
  assert.match(targetTableBlock, /min-width:\s*calc\(var\(--mnt-target-name-width\) \+ var\(--mnt-target-period-width\) \* 17\);/);
  assert.match(numberInputBlock, /width:\s*118px;/);
  assert.doesNotMatch(maintenancePageCss, /\.mnt-target-fixed-pane/);
  assert.doesNotMatch(maintenancePageCss, /mnt-target-sticky--3|mnt-target-sticky--4|mnt-target-sticky--5/);
  assert.doesNotMatch(maintenancePageCss, /rgba\(0,0,0,\.82\)|rgba\(0,0,0,\.86\)|var\(--glass-panel-bg\)|radial-gradient|#101012/);
});

test('builds the org and channel maintenance pages from reference tree and table content', () => {
  assert.match(maintenancePageSource, /case 'org-maintenance': return \{ departments: d\.departments, users: d\.users \};/);
  assert.match(maintenancePageSource, /新增组织/);
  assert.doesNotMatch(maintenancePageSource, /更新 BI 销售人员/);
  assert.match(maintenancePageSource, /BI组织架构/);
  assert.match(maintenancePageSource, /BI人员范围/);
  assert.match(maintenancePageSource, /卫瓴ID/);
  assert.match(maintenancePageSource, /case 'channel-maintenance': return \{ groups: d\.groups, sources: d\.sources \};/);
  assert.doesNotMatch(maintenancePageSource, /补齐默认来源/);
  assert.match(maintenancePageSource, /新增大类/);
  assert.match(maintenancePageSource, /新增来源/);
  assert.match(maintenancePageSource, /新增大类名称/);
  assert.match(maintenancePageSource, /const selectedNewGroup = groups\.find/);
  assert.match(maintenancePageSource, /setSelectedGroup\(id\);/);
  assert.match(maintenancePageSource, /const groupId = selectedGroup === 'all' \? \(groups\[0\]\?\.id \|\| ''\) : selectedGroup;/);
  assert.match(maintenancePageSource, /卫瓴线索来源/);
});

test('uses one organization-style side navigation across all maintenance pages', () => {
  const sideNavBlock = cssRuleBody(maintenancePageCss, '.mnt-side-nav');
  const sideNavChildListBlock = cssRuleBody(maintenancePageCss, '.mnt-side-nav li ul');
  const sideNavButtonBlock = cssRuleBody(maintenancePageCss, '.mnt-side-nav__button');
  const sideNavActiveBlock = cssRuleBody(maintenancePageCss, '.mnt-side-nav__button--active');

  assert.match(maintenancePageSource, /function MaintenanceSideNav\(\{ nodes, activeId, onSelect \}\)/);
  assert.match(maintenancePageSource, /function MaintenanceSideNavNode\(\{ node, activeId, onSelect \}\)/);
  assert.match(maintenancePageSource, /function buildMaintenanceNavTree\(items, \{ rootId = 'all', countText = '项' \} = \{\}\) \{/);
  assert.match(maintenancePageSource, /<MaintenanceSideNav nodes=\{orgTree \? \[orgTree\] : \[\]\} activeId=\{selectedOrg\} onSelect=\{setSelectedOrg\} \/>/);
  assert.match(maintenancePageSource, /<MaintenanceSideNav nodes=\{costNavNodes\} activeId=\{selectedChannel\} onSelect=\{setSelectedChannel\} \/>/);
  assert.match(maintenancePageSource, /<MaintenanceSideNav nodes=\{departmentNavNodes\} activeId=\{selectedDepartment\} onSelect=\{setSelectedDepartment\} \/>/);
  assert.match(maintenancePageSource, /<MaintenanceSideNav nodes=\{channelGroupNavNodes\} activeId=\{selectedGroup\} onSelect=\{setSelectedGroup\} \/>/);
  assert.doesNotMatch(maintenancePageSource, /className="mnt-channel-tree"/);
  assert.doesNotMatch(maintenancePageSource, /className="mnt-edit-list"/);
  assert.doesNotMatch(maintenancePageSource, /className="mnt-tree"/);
  assert.doesNotMatch(maintenancePageSource, /className="mnt-tree-button/);

  assert.match(sideNavBlock, /overflow:\s*auto;/);
  assert.match(sideNavChildListBlock, /border-left:\s*1px dashed var\(--line\);/);
  assert.match(sideNavButtonBlock, /min-height:\s*34px;/);
  assert.match(sideNavButtonBlock, /border-radius:\s*10px;/);
  assert.match(sideNavButtonBlock, /background:\s*transparent;/);
  assert.match(sideNavButtonBlock, /justify-content:\s*space-between;/);
  assert.match(sideNavActiveBlock, /border-color:\s*var\(--line-2\);/);
  assert.match(sideNavActiveBlock, /background:\s*rgba\(255,\s*255,\s*255,\s*\.09\);/);
});

test('keeps data maintenance cards buttons and controls on the dashboard glass system', () => {
  const panelBlock = cssRuleBody(maintenancePageCss, '.mnt-surface');
  const buttonBlock = cssRuleBody(maintenancePageCss, '.mnt-btn');
  const primaryButtonBlock = cssRuleBody(maintenancePageCss, '.mnt-btn--primary');
  const inputBlock = cssRuleBody(maintenancePageCss, '.mnt-control');
  const toolbarBlock = cssRuleBody(maintenancePageCss, '.mnt-toolbar');
  const actionsBlock = cssRuleBody(maintenancePageCss, '.mnt-actions');
  const toolbarControlBlock = cssRuleBody(maintenancePageCss, '.mnt-toolbar .mnt-control');
  const matrixWrapBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix-wrap');
  const progressBlock = cssRuleBody(maintenancePageCss, '.mnt-progress');
  const progressDangerBlock = cssRuleBody(maintenancePageCss, '.mnt-progress--danger span');
  const progressWarningBlock = cssRuleBody(maintenancePageCss, '.mnt-progress--warning span');
  const progressGoodBlock = cssRuleBody(maintenancePageCss, '.mnt-progress--good span');
  const progressUnsetBlock = cssRuleBody(maintenancePageCss, '.mnt-progress--unset span');

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
  assert.match(maintenancePageSource, /aria-label="目标年份"[\s\S]*?options=\{YEAR_OPTIONS\} \/>\s*<button className="mnt-btn" type="button" onClick=\{onDownloadTemplate\} disabled=\{saving\}>下载模板<\/button>/);
  assert.match(maintenancePageSource, /const dirty = status === '有未保存修改';/);
  assert.match(maintenancePageSource, /disabled=\{saving \|\| !canSave\}>\{saving \? '保存中…' : '保存目标'\}<\/button>/);
  assert.match(maintenancePageSource, /if \(saving \|\| !dirty\) return;/);
  assert.match(maintenancePageSource, /<div className="mnt-actions">\s*\{actions\[activePage\] \?\? actions\['target-maintenance'\]\}\s*<SaveBadge status=\{status\} \/>/);
  assert.doesNotMatch(maintenancePageSource, /返回看板/);
  assert.doesNotMatch(maintenancePageSource, /<div className="mnt-actions">\s*<SaveBadge/);
  assert.match(toolbarBlock, /min-height:\s*42px;/);
  assert.match(toolbarBlock, /padding:\s*6px 10px;/);
  assert.match(actionsBlock, /flex-wrap:\s*nowrap;/);
  assert.match(actionsBlock, /gap:\s*7px;/);
  assert.match(toolbarControlBlock, /width:\s*180px;/);
  assert.match(toolbarControlBlock, /flex:\s*0 0 180px;/);
  assert.doesNotMatch(maintenancePageCss, /grid-template-columns:\s*minmax\(190px,\s*230px\) minmax\(0,\s*1fr\);/);
  assert.match(maintenancePageCss, /\.mnt-layout--target \{[\s\S]*?grid-template-columns:\s*minmax\(220px,\s*260px\) minmax\(0,\s*1fr\);/);
  assert.match(maintenancePageCss, /\.mnt-layout--cost,\s*[\s\S]*?\.mnt-layout--channel \{[\s\S]*?grid-template-columns:\s*minmax\(220px,\s*260px\) minmax\(0,\s*1fr\);/);
  assert.match(maintenancePageCss, /\.mnt-layout--org \{[\s\S]*?grid-template-columns:\s*minmax\(220px,\s*260px\) minmax\(0,\s*1fr\);/);
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
  assert.match(progressBlock, /background:\s*var\(--bar-track\);/);
  assert.doesNotMatch(maintenancePageCss, /<<<<<<<|=======|>>>>>>>/);
  assert.doesNotMatch(maintenancePageCss, /--mnt-progress-purple|--mnt-progress-blue/);
  assert.match(progressDangerBlock, /background:\s*var\(--bar-warn\);/);
  assert.match(progressWarningBlock, /background:\s*var\(--bar-good\);/);
  assert.match(progressGoodBlock, /background:\s*var\(--bar-gold\);/);
  assert.match(progressUnsetBlock, /background:\s*rgba\(255,\s*255,\s*255,\s*\.24\);/);
  assert.match(buttonBlock, /min-height:\s*28px;/);
  assert.match(buttonBlock, /background:\s*var\(--glass-cell\);/);
  assert.match(buttonBlock, /border:\s*1px solid var\(--line\);/);
  assert.match(buttonBlock, /border-radius:\s*12px;/);
  assert.match(primaryButtonBlock, /background:\s*var\(--control-solid\);/);
  assert.match(inputBlock, /min-height:\s*28px;/);
  assert.match(inputBlock, /background:\s*color-mix\(in srgb,\s*var\(--glass-cell-hover\)\s*48%,\s*transparent\);/);
  assert.match(maintenancePageCss, /\.mnt-edit-row,\s*[\s\S]*?\.mnt-channel-manage-row \{[\s\S]*?background:\s*var\(--panel-2\);/);
  assert.doesNotMatch(maintenancePageCss, /\.mnt-edit-row,[\s\S]*?background:\s*transparent;/);
  assert.doesNotMatch(maintenancePageCss, /\.mnt-row--summary td \{[\s\S]*?background:\s*rgba\(var\(--good-rgb\)/);
  assert.doesNotMatch(maintenancePageCss, /#fff;/);
  assert.doesNotMatch(maintenancePageCss, /box-shadow:\s*0 5px 14px rgba\(216, 58, 215/);
});

test('uses silver-purple maintenance table row hover overlays and persistent clicked-row highlights', () => {
  const matrixWrapBlock = cssRuleBody(maintenancePageCss, '.mnt-matrix-wrap');

  assert.match(matrixWrapBlock, /--glass-cell-hover:\s*rgba\(184,\s*156,\s*255,\s*\.12\);/);
  assert.match(matrixWrapBlock, /--mnt-row-selected-overlay:\s*var\(--mnt-selected-bg\);/);
  assert.match(matrixWrapBlock, /--mnt-row-selected-hover-overlay:\s*rgba\(184,\s*156,\s*255,\s*\.15\);/);
  assert.match(matrixWrapBlock, /--mnt-selected-bg:\s*rgba\(184,\s*156,\s*255,\s*\.10\);/);
  assert.match(matrixWrapBlock, /--mnt-selected-border:\s*rgba\(228,\s*184,\s*215,\s*\.24\);/);
  assert.doesNotMatch(matrixWrapBlock, /190,\s*64,\s*255|210,\s*86,\s*255/);
  assert.match(maintenancePageCss, /\.mnt-matrix tbody tr:hover td,\s*[\s\S]*?\.mnt-user-table tbody tr:hover td \{[\s\S]*?background:\s*var\(--glass-cell-hover\);/);
  assert.match(maintenancePageCss, /\.mnt-matrix tbody tr\.mnt-row--selected td,\s*[\s\S]*?\.mnt-user-table tbody tr\.mnt-row--selected td \{[\s\S]*?background:\s*var\(--mnt-row-selected-overlay\);/);
  assert.match(maintenancePageCss, /\.mnt-matrix tbody tr\.mnt-row--selected:hover td,\s*[\s\S]*?\.mnt-user-table tbody tr\.mnt-row--selected:hover td \{[\s\S]*?background:\s*var\(--mnt-row-selected-hover-overlay\);/);
  assert.match(maintenancePageSource, /function getSelectableRowProps\(rowKey, selectedRowKey, onSelect, className = ''\) \{/);
  assert.match(maintenancePageSource, /'data-maintenance-row-selected': selected \? 'true' : undefined,/);
  assert.match(maintenancePageSource, /className: `\$\{className\}\$\{selected \? ' mnt-row--selected' : ''\}`\.trim\(\),/);
  assert.match(maintenancePageSource, /const \[selectedTargetRow,\s*setSelectedTargetRow\] = useState\(null\);/);
  assert.match(maintenancePageSource, /const \[selectedCostRow,\s*setSelectedCostRow\] = useState\(null\);/);
  assert.match(maintenancePageSource, /const \[selectedOrgRow,\s*setSelectedOrgRow\] = useState\(null\);/);
  assert.match(maintenancePageSource, /const \[selectedSourceRow,\s*setSelectedSourceRow\] = useState\(null\);/);
  assert.match(maintenancePageSource, /getSelectableRowProps\(`target:\$\{row\.id\}`, selectedTargetRow, setSelectedTargetRow/);
  assert.match(maintenancePageSource, /getSelectableRowProps\(`cost:\$\{row\.id\}`, selectedCostRow, setSelectedCostRow/);
  assert.match(maintenancePageSource, /getSelectableRowProps\(`labor:\$\{row\.id\}`, selectedCostRow, setSelectedCostRow/);
  assert.match(maintenancePageSource, /getSelectableRowProps\(`org:\$\{user\.id\}`, selectedOrgRow, setSelectedOrgRow/);
  assert.match(maintenancePageSource, /getSelectableRowProps\(`source:\$\{source\.code\}`, selectedSourceRow, setSelectedSourceRow/);
});

test('keeps the maintenance year dropdown compact in the toolbar', () => {
  const yearControlBlock = cssRuleBody(maintenancePageCss, '.mnt-toolbar .mnt-year-control');

  assert.match(maintenancePageSource, /className="mnt-control mnt-year-control" value=\{year\} onChange=\{handleYearChange\} aria-label="目标年份"/);
  assert.match(maintenancePageSource, /className="mnt-control mnt-year-control" value=\{year\} onChange=\{handleYearChange\} aria-label="成本维护年份"/);
  assert.match(yearControlBlock, /width:\s*116px;/);
  assert.match(yearControlBlock, /flex-basis:\s*116px;/);
});

test('uses GlassSelect for maintenance and import dropdown controls', () => {
  assert.match(maintenancePageSource, /import GlassSelect from '\.\/GlassSelect\.jsx';/);
  assert.match(maintenanceImportDialogSource, /import GlassSelect from '\.\/GlassSelect\.jsx';/);
  assert.doesNotMatch(maintenancePageSource, /<select[\s>]/);
  assert.doesNotMatch(maintenancePageSource, /<option[\s>]/);
  assert.doesNotMatch(maintenanceImportDialogSource, /<select[\s>]/);
  assert.doesNotMatch(maintenanceImportDialogSource, /<option[\s>]/);
  assert.match(maintenancePageSource, /const departmentChoices = useMemo\(\(\) => makeSelectOptions\(departments\), \[departments\]\);/);
  assert.match(maintenancePageSource, /aria-label=\{`\$\{user\.name\}所属组织`\} options=\{departmentChoices\}/);
  assert.match(maintenancePageSource, /const channelGroupChoices = useMemo\(\(\) => makeSelectOptions\(groups, '选择渠道大类'\), \[groups\]\);/);
  assert.match(maintenancePageSource, /aria-label=\{`\$\{source\.name\}归属渠道`\} options=\{channelGroupChoices\}/);
  assert.match(maintenanceImportDialogSource, /const sheetOptions = useMemo\(/);
  assert.match(maintenanceImportDialogSource, /aria-label="选择工作表" options=\{sheetOptions\}/);
});

test('uses full-width compute trend sliders that resize from 3 to 15 bars', () => {
  assert.match(computePageSource, /const MIN_VISIBLE_TREND_BARS = 3;/);
  assert.match(computePageSource, /const MAX_VISIBLE_TREND_BARS = 15;/);
  assert.match(computePageSource, /const showSlider = days\.length > MAX_VISIBLE_TREND_BARS;/);
  assert.match(computePageSource, /function getTrendZoomRange\(pointCount\) \{/);
  assert.match(computePageSource, /const lastIndex = Math\.max\(0, pointCount - 1\);/);
  assert.match(computePageSource, /const maxValueSpan = Math\.min\(MAX_VISIBLE_TREND_BARS - 1, lastIndex\);/);
  assert.match(computePageSource, /const sliderStartValue = Math\.max\(0, lastIndex - maxValueSpan\);/);
  assert.match(computePageSource, /const sliderEndValue = lastIndex;/);
  assert.match(computePageSource, /minValueSpan:\s*Math\.min\(MIN_VISIBLE_TREND_BARS - 1, maxValueSpan\)/);
  assert.match(computePageSource, /maxValueSpan,/);
  assert.match(computePageSource, /const \{ sliderStartValue, sliderEndValue, minValueSpan, maxValueSpan \} = getTrendZoomRange\(days\.length\);/);
  assert.equal((computePageSource.match(/getTrendZoomRange\(days\.length\)/g) ?? []).length, 2);
  assert.equal((computePageSource.match(/zoomLock:\s*false/g) ?? []).length, 4);
  assert.match(computePageSource, /dataZoom: showSlider \? \[/);
  assert.equal((computePageSource.match(/startValue:\s*sliderStartValue/g) ?? []).length, 4);
  assert.match(computePageSource, /endValue:\s*sliderEndValue/);
  assert.match(computePageSource, /minValueSpan,\s*\n\s*maxValueSpan,\s*\n\s*zoomLock:\s*false/);
  assert.doesNotMatch(computePageSource, /sliderWindowSpan/);
  assert.doesNotMatch(computePageSource, /zoomLock:\s*true/);
  assert.match(computePageSource, /realtime:\s*true/);
  assert.match(computePageSource, /borderColor:\s*'rgba\(184,156,255,\.30\)'/);
  assert.match(computePageSource, /fillerColor:\s*'rgba\(201,169,107,\.16\)'/);
  assert.match(computePageSource, /shadowColor:\s*'rgba\(201,169,107,\.28\)'/);
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

test('adds a linked full-width compute supply-demand card below usage trend', () => {
  assert.match(computePageSource, /function buildCapacityTrendOption\(\{ trend, tokens, totalCapacity \}\)/);
  assert.match(computePageSource, /const capacityColor = tokens\.semanticCapacity;/);
  assert.match(computePageSource, /capacity:\s*point\.capacity \?\? 0/);
  assert.match(computePageSource, /const buckets = buildChronologicalTrendPoints\(trend\);/);
  assert.equal((computePageSource.match(/const buckets = buildChronologicalTrendPoints\(trend\);/g) ?? []).length, 2);
  assert.match(computePageSource, /function buildChronologicalTrendPoints\(trend\) \{[\s\S]*?return buildTrendPoints\(trend\)\.reverse\(\);[\s\S]*?\}/);
  assert.match(computePageSource, /const latestTrendPoint = buildTrendPoints\(trend\)\[0\];/);
  assert.match(computePageSource, /const latestCapacityBase = latestTrendPoint\?\.capacity \|\| 1;/);
  assert.match(computePageSource, /const capacityScale = totalCapacity \/ latestCapacityBase;/);
  assert.match(computePageSource, /const capacity = buckets\.map\(\(point\) => Math\.round\(point\.capacity \* capacityScale \/ 10000\)\);/);
  assert.match(computePageSource, /const usage = buckets\.map\(\(point\) => Number\(point\.usage\) \|\| 0\);/);
  assert.match(computePageSource, /const utilization = buckets\.map\(\(point, index\) => percentOf\(usage\[index\], capacity\[index\]\)\);/);
  assert.match(computePageSource, /const capacityTrendOption = useMemo\([\s\S]*?buildCapacityTrendOption\(\{ trend, tokens, totalCapacity: overview\.totalCapacity \}\),[\s\S]*?\[trend, tokens, overview\.totalCapacity\]/);
  assert.match(computePageSource, /title=\{`\$\{periodLabel\}算力供需关系`\}/);
  assert.match(computePageSource, /sub="容量池 · 消耗 · 利用率"/);
  assert.match(computePageSource, /className="cpu-panel--capacity-trend"/);
  assert.match(computePageSource, /className="cpu-capacity-chart"/);
  assert.match(computePageSource, /className="cpu-capacity-echart"/);
  assert.match(computePageSource, /option=\{capacityTrendOption\}/);
  assert.match(computePageSource, /name:\s*'算力总容量'[\s\S]*?type:\s*'line'[\s\S]*?smooth:\s*true[\s\S]*?areaStyle:/);
  assert.match(computePageSource, /name:\s*'算力用量'[\s\S]*?type:\s*'bar'/);
  assert.match(computePageSource, /name:\s*'利用率'[\s\S]*?type:\s*'line'[\s\S]*?yAxisIndex:\s*1/);
  assert.match(computePageSource, /tooltipRow\(\{ color: utilizationColor, label: '利用率', value: formatPct\(utilizationValue\) \}\)/);
  assert.match(computePageSource, /fillerColor:\s*'rgba\(126,167,255,\.22\)'/);
  assert.match(computePageSource, /borderColor:\s*'rgba\(126,167,255,\.34\)'/);
  assert.match(computePageSource, /shadowColor:\s*'rgba\(126,167,255,\.42\)'/);
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
  assert.match(computePageSource, /const COMPUTE_RING_COLORS = \[[\s\S]*?'#8E86FF'[\s\S]*?'#B89CFF'[\s\S]*?'#E4B8D7'[\s\S]*?'#C9A96B'[\s\S]*?'rgba\(148, 163, 184, \.18\)'[\s\S]*?'#D9D1FF'[\s\S]*?'#A6C878'[\s\S]*?'#F06A8B'/);
  assert.doesNotMatch(computePageSource, /const COMPUTE_RING_COLORS = \[[\s\S]*?'#9EDCFF'[\s\S]*?\];/);
  assert.match(computePageSource, /function applyComputeRingPalette\(data\)/);
  assert.match(computePageSource, /sort\(\(a, b\) => b\.value - a\.value\)/);
  assert.match(computePageSource, /const versionPieData = useMemo\(\s*\(\) => applyComputeRingPalette\(versions\),/);
  assert.match(computePageSource, /const distributionPieData = useMemo\(\s*\(\) => applyComputeRingPalette\(distribution\),/);
  assert.match(computePageSource, /buildPieOption\(\{ data: versionPieData, tokens, unitLabel: '消耗权重', naturalLabelLayout: true \}\)/);
  assert.match(computePageSource, /buildPieOption\(\{ data: distributionPieData, tokens, unitLabel: '客户占比权重' \}\)/);
  assert.match(computePageSource, /borderRadius:\s*8,[\s\S]*?borderColor:\s*'rgba\(255, 255, 255, \.12\)'[\s\S]*?borderWidth:\s*2,[\s\S]*?shadowBlur:\s*22,[\s\S]*?shadowColor:\s*'rgba\(0, 0, 0, \.32\)'/);
  assert.doesNotMatch(computePageSource, /borderColor:\s*'rgba\(12,12,13,\.72\)'/);
});

test('surfaces compute executive judgement, utilization, and customer actions', () => {
  assert.match(computePageSource, /label:\s*'算力利用率'/);
  assert.match(computePageSource, /value:\s*formatPct\(executive\.utilizationRate\)/);
  assert.match(computePageSource, /label:\s*'高风险客户'/);
  assert.match(computePageSource, /value:\s*formatInt\(executive\.highRiskCount\)/);
  assert.match(computePageSource, /function buildExecutiveSnapshot\(\{ overview, trend, distribution, customerRows \}\)/);
  assert.match(computePageSource, /className=\{`cpu-command cpu-command--\$\{executive\.tone\}`\}/);
  assert.match(computePageSource, /经营判断 · \{periodLabel\}口径/);
  assert.match(computePageSource, /executive\.metrics\.map\(\(metric\) =>/);
  assert.match(computePageSource, /const LOW_BALANCE_POINTS = 1000000;/);
  assert.match(computePageSource, /const HIGH_USAGE_POINTS = 400000;/);
  assert.match(computePageSource, /const LOW_REPLY_RATE = 60;/);
  assert.match(computePageSource, /function buildCustomerRiskProfile\(row\)/);
  assert.match(computePageSource, /<th>风险标签<\/th>/);
  assert.match(computePageSource, /<th>建议动作<\/th>/);
  assert.match(computePageSource, /className=\{`cpu-risk-tag cpu-risk-tag--\$\{tag\.tone\}`\}/);
  assert.match(computePageSource, /className="cpu-table__action"/);
  assert.match(computePageSource, /const versionInsight = useMemo\(\(\) => buildVersionInsight\(versionPieData\), \[versionPieData\]\);/);
  assert.match(computePageSource, /const distributionInsight = useMemo\(\(\) => buildDistributionInsight\(distributionPieData\), \[distributionPieData\]\);/);
  assert.match(computePageCss, /\.cpu-command \{[\s\S]*?background:\s*var\(--dashboard-card-bg\);[\s\S]*?border:\s*1px solid var\(--dashboard-card-border\);/);
  assert.match(computePageCss, /\.cpu-panel-insight \{/);
  assert.match(computePageCss, /\.cpu-risk-tag--risk \{/);
  assert.match(computePageCss, /\.cpu-table__action \{/);
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

test('shows compute component token breakdown from external api fields', () => {
  assert.match(computePageSource, /getComputeResourceHealth/);
  assert.match(computePageSource, /resourceHealth/);
  assert.match(computePageSource, /SEARCH_KEYWORDS[\s\S]*?health:/);
  assert.match(computePageSource, /算力消耗构成/);
  assert.match(computePageSource, /cpu-panel--health/);
  assert.match(computePageCss, /cpu-panel--health/);
  assert.match(computePageCss, /cpu-health/);
  assert.match(computePageSource, /computeDataState\.status === 'loading'/);
  assert.doesNotMatch(computePageSource, /token 用量数据同步失败/);
});

test('keeps the operating story overview while restoring secondary KPI companion openings', () => {
  assert.match(appSource, /import OperatingOverview from '\.\/components\/OperatingOverview';/);
  assert.match(appSource, /const monthKpiCard = filteredKpiCards\.find\(\(card\) => card\.key === 'month'\);/);
  assert.match(appSource, /const yearKpiCard = filteredKpiCards\.find\(\(card\) => card\.key === 'year'\);/);
  assert.match(appSource, /<OperatingOverview[\s\S]*?searchTerm=\{searchTerm\}[\s\S]*?monthKpiCard=\{monthKpiCard\}[\s\S]*?yearKpiCard=\{yearKpiCard\}[\s\S]*?onOpenKpi=\{handleOpenCard\}[\s\S]*?\/>/);
  assert.match(appSource, /<AIAnalysisWidget[\s\S]*?activeMenu=\{activeMenu\}[\s\S]*?dim=\{dim\}[\s\S]*?channelKey=\{activeChannelKey\}[\s\S]*?companionCue=\{companionCue\}[\s\S]*?context=\{maintenanceMode \? 'maintenance' : 'dashboard'\}[\s\S]*?\/>/);
  assert.match(appSource, /buildCardCompanionCue/);
  assert.match(appSource, /function handleOpenCard/);
  assert.match(appSource, /<KpiCard card=\{card\} onOpen=\{handleOpenCard\} \/>/);
  assert.doesNotMatch(appSource, /sidePanel=\{<ChannelPanel/);
});

test('places the AI mascot inside a subdued sidebar status card', () => {
  const aiWidgetBlock = cssRuleBody(aiAnalysisWidgetCss, '.ai-widget');

  assert.match(aiAnalysisWidgetSource, /<div className="ai-status-copy" aria-hidden="true">[\s\S]*?<span>AI 助手<\/span>[\s\S]*?<b>经营分析<\/b>[\s\S]*?<\/div>/);
  assert.match(aiWidgetBlock, /background:\s*rgba\(255,\s*255,\s*255,\s*\.04\);/);
  assert.match(aiWidgetBlock, /border:\s*1px solid rgba\(255,\s*255,\s*255,\s*\.08\);/);
  assert.match(aiWidgetBlock, /border-radius:\s*18px;/);
  assert.match(aiAnalysisWidgetCss, /\.ai-status-copy\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*3px;/);
  assert.match(aiAnalysisWidgetCss, /\.ai-card-wrap\s*\{[\s\S]*?left:\s*244px;/);
});

test('uses one fused operating story instead of duplicated monthly and yearly recovery cards', () => {
  assert.match(operatingOverviewSource, /const progressTitle = `\$\{META\.monthLabel\}经营进度`;/);
  assert.match(operatingOverviewSource, /<h1>\{progressTitle\}<\/h1>/);
  assert.doesNotMatch(operatingOverviewSource, /<h1>2026年6月经营进度<\/h1>/);
  assert.doesNotMatch(operatingOverviewSource, /<span className="op-eyebrow">经营进度总览<\/span>/);
  assert.match(operatingOverviewSource, /本月回款/);
  assert.match(operatingOverviewSource, /月度完成率/);
  assert.doesNotMatch(operatingOverviewSource, /formatPaceLead/);
  assert.doesNotMatch(operatingOverviewSource, /领先 7\.1%/);
  assert.doesNotMatch(operatingOverviewSource, /预计影响缺口 \{overviewMetrics\.riskImpactGap\}万/);
  assert.match(operatingOverviewSource, /目标缺口/);
  assert.match(operatingOverviewSource, /超额完成/);
  assert.match(operatingOverviewSource, /op-month-primary-fact--over/);
  assert.match(operatingOverviewSource, /\{targetStatusLabel\} \{formatWan\(targetStatusValue\)\}万/);
  assert.doesNotMatch(operatingOverviewSource, /<span>风险渠道<\/span>/);
  assert.match(operatingOverviewSource, /getChannelCompletionRows\('month'\)/);
  assert.match(operatingOverviewSource, /function MonthlyRecoveryStructure/);
  assert.match(operatingOverviewSource, /function OperatingSituation/);
  assert.match(operatingOverviewSource, /chartName: '本月回款结构'/);
  assert.match(operatingOverviewSource, /<h2>\{periodMeta\.chartName\}<\/h2>/);
  assert.match(operatingOverviewSource, /<h2>经营情况<\/h2>/);
  assert.match(operatingOverviewSource, /实际回款 \/ 目标回款/);
  assert.match(operatingOverviewSource, /实际 \{formatWan\(row\.recovered\)\}万 \/ 目标 \{formatWan\(row\.target\)\}万/);
  assert.match(operatingOverviewSource, /row\.gap > 0 && <span>缺口 \{formatWan\(row\.gap\)\}万<\/span>/);
  assert.doesNotMatch(operatingOverviewSource, /className="op-channel-center"/);
  assert.doesNotMatch(operatingOverviewSource, /<b>\{formatPct\(structure\.completion\)\}<\/b>/);
  assert.doesNotMatch(operatingOverviewSource, /riskChannel\?\.name/);
  assert.doesNotMatch(operatingOverviewSource, /const riskChannel/);
  assert.doesNotMatch(operatingOverviewSource, /overviewMetrics\.monthJudgement/);
  assert.match(operatingOverviewSource, /function DetailLink/);
  assert.match(operatingOverviewSource, /点击查看近期明细/);
  assert.match(operatingOverviewSource, /className="op-detail-link"/);
  assert.match(operatingOverviewSource, /className="op-detail-link-arrow"/);
  assert.match(operatingOverviewSource, /onOpenKpi\(monthKpiCard\)/);
  assert.match(operatingOverviewSource, /<h2>年度回款总览<\/h2>/);
  assert.doesNotMatch(operatingOverviewSource, /<span className="op-eyebrow">年度经营进度<\/span>/);
  assert.doesNotMatch(operatingOverviewSource, /<span className="op-eyebrow">年度节奏<\/span>/);
  assert.match(operatingOverviewSource, /const annualChannelRows = getChannelCompletionRows\('year'\);/);
  assert.match(operatingOverviewSource, /const annualStructure = useMemo\(\(\) => buildChannelStructure\(annualChannelRows\), \[annualChannelRows\]\);/);
  assert.match(operatingOverviewSource, /chartName: '年度回款结构'/);
  assert.match(operatingOverviewSource, /年度累计回款/);
  assert.match(operatingOverviewSource, /年度目标/);
  assert.match(operatingOverviewSource, /年度完成率/);
  assert.doesNotMatch(operatingOverviewSource, /年度缺口/);
  assert.match(operatingOverviewSource, /className="op-annual-grid"[\s\S]*?op-annual-primary[\s\S]*?<AnnualRecoveryStructure[\s\S]*?<OperatingSituation/);
  assert.match(operatingOverviewSource, /<span>年目标完成率 \{formatPct\(KPI_DERIVED\.yearCompletion\)\}<\/span>/);
  assert.match(operatingOverviewSource, /<span>剩余目标 \{formatWan\(annualRemainingTarget\)\}万<\/span>/);
  assert.match(operatingOverviewSource, /className="op-annual-progress-footer"/);
  assert.match(operatingOverviewSource, /<span>年度目标进度<\/span>/);
  assert.match(operatingOverviewSource, /<b>\{formatWan\(KPI\.yearRecovered\)\}万 \/ \{formatWan\(KPI\.yearTarget\)\}万<\/b>/);
  assert.match(operatingOverviewSource, /<span>时间进度 \{formatPct\(overviewMetrics\.annualTimeProgress\)\}<\/span>/);
  assert.match(operatingOverviewSource, /后续月均需完成 \{formatWan\(overviewMetrics\.remainingMonthlyRequired\)\}万/);
  assert.doesNotMatch(operatingOverviewSource, /overviewMetrics\.annualJudgement/);
  assert.doesNotMatch(operatingOverviewSource, /op-judgement/);
  assert.doesNotMatch(operatingOverviewSource, /<span>节奏偏差<\/span>/);
  assert.doesNotMatch(operatingOverviewSource, /function shouldShowActualAnnualLabel/);
  assert.doesNotMatch(operatingOverviewSource, /annualRhythmOption/);
  assert.doesNotMatch(operatingOverviewSource, /getAnnualRhythmSeries/);
  assert.doesNotMatch(operatingOverviewSource, /<EChart option=\{annualOption\}/);
  assert.doesNotMatch(operatingOverviewSource, /当前年度完成率略高于时间进度/);
  assert.match(operatingOverviewSource, /点击查看年度拆解/);
  assert.doesNotMatch(operatingOverviewSource, /明细 &gt;/);
  assert.match(operatingOverviewSource, /onOpenKpi\(yearKpiCard\)/);
  assert.match(operatingOverviewSource, /getOperatingOverviewMetrics/);
  assert.doesNotMatch(operatingOverviewSource, /function ChannelStructurePanel\(\)/);
  assert.doesNotMatch(operatingOverviewSource, /<h2>渠道目标完成结构<\/h2>/);
  assert.doesNotMatch(operatingOverviewSource, /CHANNEL_PERIOD_OPTIONS/);
  assert.doesNotMatch(operatingOverviewSource, /<Segmented/);
  assert.match(operatingOverviewSource, /<EChart className="op-channel-chart" option=\{option\} style=\{\{ height: '100%' \}\} \/>/);
  assert.match(operatingOverviewSource, /buildChannelStructure\(monthChannelRows\)/);
  assert.match(operatingOverviewSource, /const incompleteGap = Math\.max\(0, totalTarget - totalRecovered\);/);
  assert.match(operatingOverviewSource, /name: '未完成'/);
  assert.match(operatingOverviewSource, /isIncomplete:\s*true/);
  assert.match(operatingOverviewSource, /const isIncompleteLabel = item\.isIncomplete && Number\(item\.value\) > 0;/);
  assert.match(operatingOverviewSource, /图上占比 <strong>\$\{share\}%<\/strong> · 目标 \$\{formatWan\(target\)\} 万 · 完成率 \$\{formatPct\(completion\)\}/);
  assert.match(operatingOverviewSource, /const riskBaseline = Math\.min\(100, completion\);/);
  assert.match(operatingOverviewSource, /risk: row\.warn \|\| rowCompletion < riskBaseline,/);
  assert.match(operatingOverviewSource, /\{row\.risk && <span className="op-channel-risk">风险<\/span>\}/);
  assert.match(operatingOverviewSource, /colorStops: \[\{ offset: 0, color: '#8E86FF' \}, \{ offset: 1, color: '#E4B8D7' \}\]/);
  assert.match(operatingOverviewSource, /colorStops: \[\{ offset: 0, color: '#B89CFF' \}, \{ offset: 1, color: '#D9D1FF' \}\]/);
  assert.match(operatingOverviewSource, /colorStops: \[\{ offset: 0, color: '#9B6FAD' \}, \{ offset: 1, color: '#E4B8D7' \}\]/);
  assert.match(operatingOverviewSource, /colorStops: \[\{ offset: 0, color: '#C9A96B' \}, \{ offset: 1, color: '#E3D2A4' \}\]/);
  assert.match(operatingOverviewSource, /animationDuration:\s*900/);
  assert.match(operatingOverviewSource, /radius:\s*\['52%', '88%'\]/);
  assert.match(operatingOverviewSource, /center:\s*\['49\.5%', '72%'\]/);
  assert.match(operatingOverviewSource, /borderRadius:\s*8,/);
  assert.match(operatingOverviewSource, /borderColor:\s*'rgba\(255, 255, 255, \.11\)'/);
  assert.match(operatingOverviewSource, /shadowColor:\s*'rgba\(184, 156, 255, \.08\)'/);
  assert.match(operatingOverviewSource, /const isMajorLabel = index < 2 && !item\.isEmpty && Number\(item\.value\) > 0;/);
  assert.match(operatingOverviewCss, /\.op-channel-chart-wrap::before\s*\{[\s\S]*?content:\s*none;/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-channel-chart\s*\{[\s\S]*?filter:\s*drop-shadow/);
  assert.match(operatingOverviewCss, /\.op-overview/);
  assert.match(operatingOverviewCss, /background:\s*var\(--dashboard-card-bg\);/);
  assert.match(operatingOverviewCss, /border:\s*1px solid var\(--dashboard-card-border\);/);
  assert.match(operatingOverviewCss, /backdrop-filter:\s*var\(--dashboard-card-blur\);/);
  assert.match(operatingOverviewCss, /box-shadow:\s*var\(--dashboard-card-shadow\);/);
  assert.match(operatingOverviewCss, /\.op-annual-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(200px, \.76fr\) minmax\(260px, \.94fr\) minmax\(340px, 1\.22fr\);/);
  assert.match(operatingOverviewCss, /\.op-annual-primary b\s*\{[\s\S]*?font-size:\s*clamp\(46px, 5\.1vw, 74px\);/);
  assert.match(operatingOverviewCss, /\.op-annual-progress-footer\s*\{[\s\S]*?grid-column:\s*1 \/ 3;[\s\S]*?grid-row:\s*2;/);
  assert.match(operatingOverviewCss, /\.op-annual-grid \.op-operating-side\s*\{[\s\S]*?grid-column:\s*3;[\s\S]*?grid-row:\s*1 \/ span 2;/);
  assert.match(operatingOverviewCss, /\.op-annual-progress-track\s*\{/);
  assert.match(operatingOverviewCss, /\.op-annual-fill\s*\{/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-annual-capsule\s*\{/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-annual-chart\s*\{/);
  assert.match(operatingOverviewCss, /\.op-month-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(200px, \.78fr\) minmax\(250px, \.92fr\) minmax\(330px, 1\.22fr\);/);
  assert.match(operatingOverviewCss, /\.op-recovery-structure\s*\{[\s\S]*?border-left:\s*1px solid rgba\(255,255,255,\.035\);[\s\S]*?border-right:\s*1px solid rgba\(255,255,255,\.035\);/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-channel-center/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-panel--channel/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-search-result--channel/);
  assert.doesNotMatch(appSource, /recoveryKpiCards/);
  assert.doesNotMatch(appSource, /sidePanel=\{<ChannelPanel/);
  assert.doesNotMatch(dashboardCss, /\.dash-kpis/);
});

test('polishes the operating progress hierarchy with whitespace-first grouping', () => {
  const monthGridBlock = cssRuleBody(operatingOverviewCss, '.op-month-grid');
  const progressTitleBlock = cssRuleBody(operatingOverviewCss, '.op-progress-head h1');
  const primaryValueBlock = cssRuleBody(operatingOverviewCss, '.op-month-primary b');

  assert.match(progressTitleBlock, /font-size:\s*clamp\(21px, 2vw, 28px\);/);
  assert.match(progressTitleBlock, /font-weight:\s*700;/);
  assert.match(primaryValueBlock, /font-size:\s*clamp\(54px, 6\.2vw, 86px\);/);
  assert.match(primaryValueBlock, /font-weight:\s*840;/);
  assert.match(monthGridBlock, /border-top:\s*1px solid rgba\(255,255,255,\.035\);/);
  assert.match(monthGridBlock, /border-bottom:\s*1px solid rgba\(255,255,255,\.035\);/);
  assert.match(operatingOverviewCss, /\.op-recovery-structure\s*\{[\s\S]*?grid-template-rows:\s*auto 186px;[\s\S]*?align-content:\s*center;/);
  assert.match(operatingOverviewCss, /\.op-channel-chart-wrap\s*\{[\s\S]*?height:\s*186px;[\s\S]*?min-height:\s*0;/);
  assert.match(operatingOverviewCss, /\.op-channel-chart\s*\{[\s\S]*?min-height:\s*0;/);
  assert.match(operatingOverviewCss, /\.op-channel-item\s*\{[\s\S]*?min-height:\s*41px;/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-structure-progress/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-progress-track/);
  assert.match(operatingOverviewCss, /\.op-month-primary-facts \.op-month-primary-fact--over\s*\{/);
  assert.match(operatingOverviewCss, /\.op-month-primary-facts \.op-month-primary-fact--risk\s*\{/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-operating-alerts/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-operating-alert/);
  assert.doesNotMatch(progressTitleBlock, /font-size:\s*clamp\(24px, 2\.4vw, 34px\);/);
  assert.doesNotMatch(monthGridBlock, /rgba\(255,255,255,\.075\)/);
});

test('replaces the annual rhythm chart with a yearly recovery overview footer', () => {
  assert.match(operatingOverviewSource, /const annualCapsuleWidth = `\$\{Math\.min\(KPI_DERIVED\.yearCompletion, 100\)\}%`;/);
  assert.match(operatingOverviewSource, /const annualPaceDelta = \+\(KPI_DERIVED\.yearCompletion - overviewMetrics\.annualTimeProgress\)\.toFixed\(1\);/);
  assert.match(operatingOverviewSource, /const annualPaceLabel = `\$\{annualPaceDelta < 0 \? '低于' : '高于'\}线性进度 \$\{formatPp\(annualPaceDelta\)\}`;/);
  assert.match(operatingOverviewSource, /className="op-annual-progress-footer"/);
  assert.match(operatingOverviewSource, /className="op-annual-progress-track"/);
  assert.match(operatingOverviewSource, /className="op-annual-fill" style=\{\{ width: annualCapsuleWidth \}\}/);
  assert.match(operatingOverviewSource, /aria-label=\{`年度目标进度 \$\{formatWan\(KPI\.yearRecovered\)\} 万 \/ \$\{formatWan\(KPI\.yearTarget\)\} 万，完成率 \$\{formatPct\(KPI_DERIVED\.yearCompletion\)\}，时间进度 \$\{formatPct\(overviewMetrics\.annualTimeProgress\)\}，\$\{annualPaceLabel\}`\}/);
  assert.match(operatingOverviewCss, /\.op-annual-progress-main\s*\{[\s\S]*?min-height:\s*38px;[\s\S]*?grid-template-columns:\s*auto auto minmax\(120px, 1fr\) auto;/);
  assert.match(operatingOverviewCss, /\.op-annual-progress-track\s*\{[\s\S]*?height:\s*12px;[\s\S]*?border-radius:\s*999px;[\s\S]*?background:\s*var\(--bar-track\);/);
  assert.match(operatingOverviewCss, /\.op-annual-fill\s*\{[\s\S]*?background:\s*linear-gradient\(135deg, rgba\(142,134,255,\.78\), rgba\(228,184,215,\.62\)\);/);
  assert.match(operatingOverviewCss, /\.op-annual-progress-meta\s*\{[\s\S]*?flex-wrap:\s*wrap;/);
  assert.doesNotMatch(operatingOverviewCss, /\.op-annual-capsule-labels/);
  assert.doesNotMatch(operatingOverviewSource, /<EChart option=\{annualOption\}/);
});

test('uses low-saturation dashboard controls in focused secondary interfaces', () => {
  assert.match(channelPanelCss, /\.ch-head \.sgm-thumb\s*\{[\s\S]*?background:\s*linear-gradient\(135deg, rgba\(142,134,255,\.64\), rgba\(228,184,215,\.42\)\);/);
  assert.match(channelPanelCss, /\.ch-head \.sgm-btn--active,[\s\S]*?\.ch-head \.sgm-btn--active:hover\s*\{[\s\S]*?color:\s*rgba\(255,255,255,\.96\);/);
  assert.match(kpiModalCss, /\.km-controls \.sgm-thumb\s*\{[\s\S]*?background:\s*linear-gradient\(135deg, rgba\(142,134,255,\.64\), rgba\(228,184,215,\.44\)\);/);
  assert.match(kpiModalCss, /\.km-controls \.msgm-btn--active,[\s\S]*?\.km-controls \.msgm-btn--active:hover\s*\{[\s\S]*?background:\s*linear-gradient\(135deg, rgba\(142,134,255,\.62\), rgba\(228,184,215,\.42\)\);/);
  assert.doesNotMatch(channelPanelCss, /\.ch-head[\s\S]*?var\(--control-solid\)/);
  assert.doesNotMatch(kpiModalCss, /\.km-controls[\s\S]*?var\(--control-solid\)/);
  assert.match(indexCss, /--control-solid:#8E86FF;/);
});

test('restores secondary dashboard panels below the operating overview story', () => {
  assert.match(appSource, /<OperatingOverview[\s\S]*?searchTerm=\{searchTerm\}/);
  assert.match(appSource, /className="dash-secondary-grid"/);
  assert.match(appSource, /<MonthlyTrend channelKey=\{activeChannelKey\} \/>/);
  assert.match(appSource, /<OpeningMetricCards searchTerm=\{searchTerm\} onOpenSecondary=\{handleOpenCard\} \/>/);
  assert.match(appSource, /<VersionFinancePanel channelKey=\{activeChannelKey\} \/>/);
  assert.match(appSource, /<DeliveryPanel \/>/);
  assert.match(appSource, /financeKpiCards\.map\(\(card\) => \(/);
  assert.match(dashboardCss, /\.dash-secondary-grid/);
  assert.match(dashboardCss, /\.dash-secondary-delivery/);
  assert.doesNotMatch(appSource, /recoveryKpiCards/);
  assert.doesNotMatch(dashboardCss, /\.dash-kpis/);
});

test('gives the version panel the same hover halo as the monthly trend panel', () => {
  assert.match(dashboardCss, /\.dash-secondary-cell \.mt-panel,\s*[\s\S]*?\.dash-secondary-cell \.vf-panel\s*\{[\s\S]*?isolation:isolate;[\s\S]*?transition:border-color \.22s ease, box-shadow \.22s ease;/);
  assert.match(dashboardCss, /\.dash-secondary-cell \.mt-panel:hover,\s*[\s\S]*?\.dash-secondary-cell \.vf-panel:hover,\s*[\s\S]*?\.dash-secondary-cell \.vf-panel:focus-within,[\s\S]*?\.dash-secondary-delivery \.dlv-panel:hover,[\s\S]*?\.dash-secondary-delivery \.dlv-panel:focus-within\s*\{[\s\S]*?border-color:rgba\(255,255,255,\.34\);[\s\S]*?box-shadow:var\(--glass-shadow\);/);
});

test('gives every dashboard card the shared hover halo', () => {
  assert.match(operatingOverviewCss, /\.op-panel\s*\{[\s\S]*?transition:\s*border-color \.22s ease, box-shadow \.22s ease;/);
  assert.match(operatingOverviewCss, /\.op-panel:hover,\s*[\s\S]*?\.op-panel:focus-within\s*\{[\s\S]*?border-color:\s*rgba\(255,255,255,\.34\);[\s\S]*?box-shadow:\s*var\(--glass-shadow\);/);
  assert.match(kpiCardCss, /\.kpi-card:hover,\s*[\s\S]*?\.kpi-card:focus-visible\s*\{[\s\S]*?border-color:\s*rgba\(255,255,255,\.34\);[\s\S]*?box-shadow:\s*var\(--glass-shadow\);/);
  assert.match(openingMetricCardsCss, /\.opening-metric-card:hover,\s*[\s\S]*?\.opening-metric-card:focus-visible\s*\{[\s\S]*?border-color:\s*rgba\(255,255,255,\.34\);[\s\S]*?box-shadow:\s*var\(--glass-shadow\);/);
  assert.match(computePageCss, /\.cpu-kpi:hover,\s*[\s\S]*?\.cpu-kpi:focus-within\s*\{[\s\S]*?border-color:\s*rgba\(255,255,255,\.34\);[\s\S]*?box-shadow:\s*var\(--glass-shadow\);/);
  assert.match(computePageCss, /\.cpu-panel:hover,\s*[\s\S]*?\.cpu-panel:focus-within\s*\{[\s\S]*?border-color:\s*rgba\(255,255,255,\.34\);[\s\S]*?box-shadow:\s*var\(--glass-shadow\);/);
});

test('keeps search result boxes highlighted with persistent edge borders', () => {
  assert.match(operatingOverviewSource, /import SearchResultBorder from '\.\/SearchResultBorder';/);
  assert.match(operatingOverviewSource, /import \{ matchesSearchTerm \} from '\.\.\/lib\/searchMatch';/);
  assert.doesNotMatch(searchResultBorderSource, /ElectricBorder/);
  assert.doesNotMatch(searchResultBorderSource, /<canvas/);
  assert.doesNotMatch(appSource, /import HighlightBeam/);
  assert.doesNotMatch(appSource, /<HighlightBeam/);
  assert.match(operatingOverviewSource, /<SearchResultBorder active=\{matchesSearchTerm\(progressKeywords,\s*searchTerm\)\} className="op-search-result op-search-result--progress">/);
  assert.match(operatingOverviewSource, /<SearchResultBorder active=\{matchesSearchTerm\(ANNUAL_KEYWORDS,\s*searchTerm\)\} className="op-search-result op-search-result--annual">/);
  assert.doesNotMatch(operatingOverviewSource, /CHANNEL_KEYWORDS/);
  assert.doesNotMatch(operatingOverviewSource, /op-search-result--channel/);
  assert.match(searchResultBorderSource, /data-search-match=\{active \? 'true' : undefined\}/);
  assert.match(searchResultBorderSource, /aria-label=\{active \? '搜索命中结果' : undefined\}/);
  assert.match(searchResultBorderSource, /className="search-result-border__content"/);
  assert.match(dashboardCss, /\.search-result-border\[data-search-match="true"\]::before\{[\s\S]*?opacity:\.78;/);
  assert.match(dashboardCss, /\.search-result-border\[data-search-match="true"\]::after\{[\s\S]*?opacity:\.22;/);
  assert.match(dashboardCss, /\.search-result-border\[data-search-current="true"\]::before\{[\s\S]*?opacity:1;[\s\S]*?border-color:rgba\(228,184,215,\.62\);/);
  assert.match(dashboardCss, /\.search-result-border\[data-search-current="true"\]::after\{[\s\S]*?opacity:\.32;/);
  assert.doesNotMatch(dashboardCss, /@keyframes searchResultSoftGlow|@keyframes searchResultSoftFill/);
  assert.doesNotMatch(dashboardCss, /animation:searchResultSoft/);
  assert.doesNotMatch(dashboardCss, /\.eb-/);
  assert.doesNotMatch(dashboardCss, /jitter|zigzag/i);
});

test('keeps the current search result highlight edge-only without full-card purple wash', () => {
  const currentSearchBlock = cssRuleBody(dashboardCss, '.search-result-border[data-search-current="true"]');
  const matchSearchBorderBlock = cssRuleBody(dashboardCss, '.search-result-border[data-search-match="true"]::before');
  const currentSearchBorderBlock = cssRuleBody(dashboardCss, '.search-result-border[data-search-current="true"]::before');
  const currentSearchContentBlock = cssRuleBody(
    dashboardCss,
    '.search-result-border[data-search-current="true"] .search-result-border__content'
  );
  const currentSearchBackgroundBlock = cssRuleBody(
    dashboardCss,
    '.search-result-border::after'
  );

  assert.doesNotMatch(currentSearchBlock, /filter:\s*drop-shadow/);
  assert.doesNotMatch(matchSearchBorderBlock, /animation:/);
  assert.doesNotMatch(currentSearchBorderBlock, /animation:/);
  assert.doesNotMatch(currentSearchContentBlock, /box-shadow:/);
  assert.doesNotMatch(currentSearchBackgroundBlock, /transform:\s*scale/);
  assert.match(dashboardCss, /\.search-result-border::before\{[\s\S]*?border:1px solid rgba\(228,184,215,\.38\);/);
  assert.match(dashboardCss, /\.search-result-border::after\{[\s\S]*?background:rgba\(228,184,215,\.045\);/);
  assert.doesNotMatch(computePageCss, /\.cpu-kpi-slot\[data-search-current="true"\],[\s\S]*?filter:\s*drop-shadow/);
  assert.doesNotMatch(computePageCss, /\.cpu-panel\[data-search-current="true"\][\s\S]*?box-shadow:[\s\S]*?rgba\(96,0,255/);
});

test('removes the overview channel ROI card and replaces the original overview grid', () => {
  assert.doesNotMatch(appSource, /function ChannelRoiPanel/);
  assert.doesNotMatch(appSource, /dash-cell--roi/);
  assert.doesNotMatch(appSource, /panelVisible = \{[\s\S]*?roi:/);
  assert.match(appSource, /<OperatingOverview[\s\S]*?searchTerm=\{searchTerm\}/);
  assert.match(appSource, /className="dash-secondary-delivery"/);
  assert.match(dashboardCss, /grid-template-areas:\s*"trend finance"\s*"version version";/);
  assert.doesNotMatch(dashboardCss, /grid-template-areas:[\s\S]*?"roi version"/);
});

test('routes overview through the fused operating layout while compute keeps scoped data', () => {
  assert.doesNotMatch(appSource, /TOKEN_STATS/);
  assert.doesNotMatch(appSource, /dash-token/);
  assert.doesNotMatch(appSource, /activeMenu === 'finance'/);
  assert.match(appSource, /const activeChannelKey = getDashboardChannelKey\(activeMenu\);/);
  assert.match(appSource, /<OperatingOverview[\s\S]*?searchTerm=\{searchTerm\}/);
  assert.match(appSource, /<ComputeUsagePage searchTerm=\{searchTerm\} dim="day" dateRange=\{\[\]\} computeDataState=\{computeDataState\} \/>/);
  assert.match(appSource, /getFilteredKpiCards\(\{ dim, dateRange, channel: activeChannelKey \}\)/);
  assert.match(appSource, /<MonthlyTrend channelKey=\{activeChannelKey\} \/>/);
  assert.match(appSource, /<VersionFinancePanel channelKey=\{activeChannelKey\} \/>/);
  assert.doesNotMatch(appSource, /className=\{gridClassName\}/);
});

test('scrolls the dashboard content into view when a sidebar menu item is selected', () => {
  assert.match(appSource, /const pendingMenuScrollRef = useRef\(false\);/);
  assert.match(appSource, /function handleMenuChange\(nextMenu\)/);
  assert.match(appSource, /pendingMenuScrollRef\.current = true;/);
  assert.match(appSource, /<Sidebar items=\{sidebarItems\} active=\{sidebarActive\} onChange=\{handleSidebarChange\} transitionKey=\{sidebarTransitionKey\} \/>/);
  assert.match(appSource, /gridRef\.current\?\.scrollIntoView\(\{\s*behavior:\s*'smooth',\s*block:\s*'start'\s*\}\);/);
  assert.match(dashboardCss, /\.dash-content\{[\s\S]*?scroll-margin-top:92px;/);
});

test('uses one channel completion panel with month and year switching', () => {
  assert.match(channelPanelSource, /渠道完成情况/);
  assert.match(channelPanelSource, /import Segmented from '\.\/Segmented';/);
  assert.match(channelPanelSource, /export default function ChannelPanel\(\{ channelKey = 'all', title = '渠道完成情况', showPeriodSwitch = false \}\)/);
  assert.match(channelPanelSource, /const \[period,\s*setPeriod\] = useState\('month'\);/);
  assert.match(channelPanelSource, /getChannelCompletionRows\(period, channelKey\)/);
  assert.match(channelPanelSource, /<Segmented options=\{CHANNEL_PERIOD_OPTIONS\} value=\{period\} onChange=\{setPeriod\} \/>/);
  assert.match(channelPanelSource, /period === 'year' \? '年度渠道完成情况' : `本月\$\{title\}`/);
  assert.match(channelPanelSource, /const tableColumns = CHANNEL_TABLE_COLUMNS\[period\];/);
  assert.match(channelPanelSource, /CHANNEL_TABLE_COLUMNS/);
  assert.match(channelPanelSource, /label: '本月完成'/);
  assert.match(channelPanelSource, /label: '月目标'/);
  assert.match(channelPanelSource, /label: '完成率'/);
  assert.match(channelPanelSource, /label: '缺口'/);
  assert.match(channelPanelSource, /label: '年度累计'/);
  assert.match(channelPanelSource, /label: '年度目标'/);
  assert.match(channelPanelSource, /label: '年度完成率'/);
  assert.match(channelPanelSource, /label: '年度缺口'/);
  assert.doesNotMatch(channelPanelSource, /<span>进度<\/span>/);
  assert.doesNotMatch(channelPanelSource, /<span>状态<\/span>/);
  assert.doesNotMatch(channelPanelSource, /年度贡献/);
  assert.match(channelPanelSource, /function formatChannelPct/);
  assert.match(channelPanelSource, /Number\(value\)\.toFixed\(1\)/);
  assert.match(channelPanelSource, /period === 'year' \? c\.yearCompletion : c\.monthCompletion/);
  assert.match(channelPanelSource, /formatChannelPct\(pct\)/);
  assert.match(channelPanelSource, /className="ch-completion-stack"/);
  assert.match(channelPanelSource, /<span className="ch-completion-value">\{formatChannelPct\(pct\)\}<\/span>/);
  assert.match(channelPanelSource, /className="ch-progress-cell"/);
  assert.match(channelPanelSource, /className="ch-progress"/);
  assert.match(channelPanelSource, /className="ch-progress-fill"/);
  assert.match(channelPanelSource, /width:\s*`\$\{Math\.min\(pct, 100\)\}%`/);
  assert.match(channelPanelSource, /import \{ channelCompletionBarBackground \} from '\.\.\/lib\/channelCompletionBar';/);
  assert.match(channelPanelSource, /const progressBackground = channelCompletionBarBackground\(\{ completion: pct \}, tokens\.progressMid\);/);
  assert.match(channelPanelSource, /const progressBackground = channelCompletionBarBackground\(member, tokens\.progressMid\);/);
  assert.doesNotMatch(channelPanelSource, /progressGradient\(pct, tokens\.progressMid\)/);
  assert.match(channelPanelSource, /aria-label=\{`\$\{c\.name\}完成进度 \$\{formatChannelPct\(pct\)\}`\}/);
  assert.doesNotMatch(channelPanelSource, /className=\{`ch-status/);
  assert.doesNotMatch(channelPanelSource, /\{c\.status\}/);
  assert.match(channelPanelSource, /c\.monthRecovered/);
  assert.match(channelPanelSource, /c\.monthTarget/);
  assert.match(channelPanelSource, /c\.monthGap/);
  assert.match(channelPanelSource, /c\.yearRecovered/);
  assert.match(channelPanelSource, /c\.yearTarget/);
  assert.match(channelPanelSource, /c\.yearGap/);
  assert.doesNotMatch(channelPanelSource, /className="ch-tag"/);
  assert.doesNotMatch(channelPanelSource, /本月进度/);
  assert.doesNotMatch(channelPanelSource, /本月销售完成/);
  assert.match(channelPanelSource, /createPortal/);
  assert.match(channelPanelSource, /document\.body/);
  assert.match(channelPanelSource, /const modalTitle = openRow \? `\$\{openRow\.name\}\$\{periodLabel\}人员完成明细` : '';/);
  assert.match(channelPanelSource, /当前口径：\{openRow\.name\} · \{periodLabel\} · 单位：万元 · 按完成率降序排列/);
  assert.match(channelPanelSource, /formatChannelAmount/);
  assert.match(channelPanelSource, /fmtPct/);
  assert.match(channelPanelSource, /ch-row-arrow/);
  assert.match(channelPanelCss, /\.ch-row-arrow/);
  assert.match(channelPanelCss, /grid-template-columns:\s*minmax\(84px, \.95fr\) repeat\(4, minmax\(78px, \.82fr\)\);/);
  assert.match(channelPanelCss, /\.ch-table-head span:nth-child\(n \+ 2\)\s*\{[\s\S]*?text-align:\s*right;/);
  assert.match(channelPanelCss, /\.ch-cell\s*\{[\s\S]*?text-align:\s*right;[\s\S]*?font-variant-numeric:\s*tabular-nums;/);
  assert.match(channelPanelCss, /\.ch-cell--completion\s*\{[\s\S]*?align-self:\s*stretch;/);
  assert.match(channelPanelCss, /\.ch-completion-stack\s*\{[\s\S]*?align-items:\s*flex-end;/);
  assert.match(channelPanelCss, /\.ch-progress-cell\s*\{/);
  assert.match(channelPanelCss, /\.ch-progress-fill\s*\{/);
  assert.doesNotMatch(channelPanelCss, /\.ch-status/);
  assert.doesNotMatch(operatingOverviewSource, /<ChannelStructurePanel \/>/);
  assert.match(operatingOverviewSource, /<MonthlyRecoveryStructure[\s\S]*?structure=\{monthlyStructure\}[\s\S]*?option=\{monthlyStructureOption\}/);
  assert.doesNotMatch(operatingOverviewSource, /progressWidth=\{progressWidth\}/);
  assert.match(operatingOverviewSource, /<OperatingSituation[\s\S]*?structure=\{monthlyStructure\}/);
  assert.doesNotMatch(operatingOverviewSource, /<ChannelPanel title="渠道完成情况" showPeriodSwitch \/>/);
  assert.doesNotMatch(appSource, /sidePanel=\{<ChannelPanel/);
});

test('opens monthly and annual drilldowns from the operating overview with contextual modal labels', () => {
  assert.match(operatingOverviewSource, /function OperatingOverview\(\{ searchTerm = '', monthKpiCard, yearKpiCard, onOpenKpi \}\)/);
  assert.match(operatingOverviewSource, /disabled=\{!monthKpiCard \|\| !onOpenKpi\}/);
  assert.match(operatingOverviewSource, /disabled=\{!yearKpiCard \|\| !onOpenKpi\}/);
  assert.match(kpiModalSource, /const initialDim = isCost \? 'month' : card\.key === 'year' \? 'year' : 'month';/);
  assert.match(kpiModalSource, /const modalTitle = isCost \? '投入趋势与环比' : card\.key === 'year' \? '年度回款明细' : card\.key === 'month' \? '月度回款明细' : card\.title;/);
  assert.match(kpiModalSource, /<h3 className="km-title">\{modalTitle\}<\/h3>/);
  assert.match(kpiModalSource, /className="km-scope-line">当前筛选：\{scope\}<\/span>/);
  assert.match(kpiModalSource, /const COST_DIM_OPTS = \[/);
});

test('removes the yearly risk forecast block so recovery cards stay on channel completion', () => {
  assert.doesNotMatch(channelPanelSource, /function buildAnnualRiskForecast/);
  assert.doesNotMatch(channelPanelSource, /variant === 'forecast'/);
  assert.doesNotMatch(channelPanelSource, /<div className="ch-forecast"/);
  assert.doesNotMatch(channelPanelSource, /预计全年完成率/);
  assert.doesNotMatch(channelPanelSource, /主要缺口/);
  assert.doesNotMatch(channelPanelSource, /追回所需月均增量/);
  assert.doesNotMatch(channelPanelSource, /<span className="ch-tag">需关注<\/span>/);
  assert.doesNotMatch(channelPanelSource, /落后预警/);
  assert.doesNotMatch(channelPanelCss, /\.ch-forecast/);
  assert.doesNotMatch(channelPanelCss, /\.ch-tag/);
});

test('matches overview cards to the neutral dark glass recipe', () => {
  const kpiCardBlock = cssRuleBody(kpiCardCss, '.kpi-card');
  const operatingPanelBlock = cssRuleBody(operatingOverviewCss, '.op-panel');
  const deliveryPanelBlock = cssRuleBody(deliveryPanelCss, '.dlv-panel');
  const channelPanelBlock = cssRuleBody(channelPanelCss, '.ch-panel');
  const versionPanelBlock = cssRuleBody(versionFinancePanelCss, '.vf-panel');
  const openingCardBlock = cssRuleBody(openingMetricCardsCss, '.opening-metric-card');

  [kpiCardBlock, operatingPanelBlock, deliveryPanelBlock, channelPanelBlock, versionPanelBlock, openingCardBlock].forEach((block) => {
    assert.match(block, /background:\s*var\(--dashboard-card-bg\);/);
    assert.match(block, /border:\s*1px solid var\(--dashboard-card-border\);/);
    assert.match(block, /backdrop-filter:\s*var\(--dashboard-card-blur\);/);
    assert.match(block, /box-shadow:\s*var\(--dashboard-card-shadow\);/);
  });
  assert.doesNotMatch(operatingPanelBlock, /#101012/);
  assert.doesNotMatch(operatingPanelBlock, /radial-gradient\(ellipse at 52% 94%/);
  assert.doesNotMatch(deliveryPanelBlock, /#101012/);
  assert.doesNotMatch(deliveryPanelBlock, /radial-gradient\(ellipse at 52% 94%/);
  assert.doesNotMatch(versionPanelBlock, /rgba\(201,194,255,\.055\)|linear-gradient\(120deg/);
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

test('keeps operating overview panels free of hover flow borders', () => {
  const operatingPanelBlock = cssRuleBody(operatingOverviewCss, '.op-panel');
  const deliveryPanelBlock = cssRuleBody(deliveryPanelCss, '.dlv-panel');

  assert.doesNotMatch(dashboardCss, /@property --dash-flow-angle/);
  assert.doesNotMatch(dashboardCss, /\.dash-secondary-cell \.mt-panel::before/);
  assert.doesNotMatch(dashboardCss, /\.dash-secondary-delivery \.dlv-panel::before/);
  assert.doesNotMatch(operatingOverviewCss, /@property --dash-flow-angle/);
  assert.doesNotMatch(operatingOverviewCss, /conic-gradient\(\s*from var\(--dash-flow-angle\)/);
  assert.doesNotMatch(dashboardCss, /dashPanelFlow/);
  assert.doesNotMatch(dashboardCss, /conic-gradient\(\s*from var\(--dash-flow-angle\)/);
  assert.doesNotMatch(dashboardCss, /rgba\(244,114,182/);
  assert.doesNotMatch(dashboardCss, /rgba\(192,132,252/);
  assert.match(dashboardCss, /\.dash-secondary-delivery \.dlv-panel\{[\s\S]*?transition:border-color \.22s ease, box-shadow \.22s ease;/);
  assert.match(operatingPanelBlock, /background:\s*var\(--dashboard-card-bg\);/);
  assert.match(deliveryPanelBlock, /background:\s*var\(--dashboard-card-bg\);/);
});

test('uses static trend legend and overlapping target versus recovered bars', () => {
  assert.match(monthlyTrendSource, /selectedMode:\s*false/);
  assert.match(monthlyTrendSource, /barGap:\s*'-100%'/);
  assert.match(monthlyTrendSource, /barCategoryGap:\s*'42%'/);
});

test('highlights the current month in the restrained monthly trend instead of brightening every bar', () => {
  assert.match(monthlyTrendSource, /function isCurrentTrendMonth\(item\)/);
  assert.match(monthlyTrendSource, /currentMonthBarColor\(item, tokens\)/);
  assert.match(monthlyTrendSource, /target\.map\(\(value\) => \(\{[\s\S]*?itemStyle: \{[\s\S]*?color: targetBarColor\(tokens\),/);
  assert.match(monthlyTrendSource, /recovered\.map\(\(value, index\) => \(\{[\s\S]*?color: currentMonthBarColor\(trend\[index\], tokens\),/);
  assert.match(monthlyTrendSource, /axisLabel: \{[\s\S]*?color: \(\{ value \}\) => \(value === '6月' \? tokens\.chartText : faint\),/);
  assert.match(indexCss, /--chart-bar-current:#8E86FF;/);
  assert.match(indexCss, /--chart-bar-muted:rgba\(184,156,255,\.22\);/);
});

test('keeps left ambient glow behind the AI mascot diffused and subordinate', () => {
  assert.match(indexCss, /--bg-radial-d:rgba\(184,156,255,\.042\);/);
  assert.match(indexCss, /radial-gradient\(ellipse at 10% 78%,var\(--bg-radial-d\),transparent 34%\)/);
  assert.match(aiAnalysisWidgetCss, /\.ai-orb--think \.mascot-sprite-stage,[\s\S]*?drop-shadow\(0 0 36px rgba\(184, 156, 255, \.16\)\)/);
  assert.match(mascotSpriteStageCss, /drop-shadow\(0 0 30px rgba\(184, 156, 255, \.18\)\)/);
  assert.doesNotMatch(indexCss, /--bg-radial-d:rgba\(139,124,255,\.10\);/);
  assert.doesNotMatch(aiAnalysisWidgetCss, /drop-shadow\(0 0 32px rgba\(139, 124, 255, \.28\)\)/);
});

test('gives the top brand capsule more breathing room before the main chart', () => {
  assert.match(dashboardCss, /\.dash-main\{[\s\S]*?gap:20px;/);
  assert.match(dashboardCss, /\.dash-topbar\{[\s\S]*?padding:14px clamp\(16px,3vw,40px\) 18px;/);
  assert.match(dashboardCss, /\.dash-content\{[\s\S]*?gap:18px;/);
  assert.match(dashboardCss, /\.dash-content\{[\s\S]*?scroll-margin-top:92px;/);
});

test('uses sales filters followed directly by year month day in the KPI modal', () => {
  assert.match(kpiModalSource, /import MultiSegmented from '\.\/MultiSegmented';/);
  assert.match(kpiModalSource, /salesKeys/);
  assert.match(kpiModalSource, /<div className="km-filter-group">[\s\S]*?<span className="km-filter-label">渠道<\/span>[\s\S]*?<MultiSegmented options=\{SALES_FILTER_OPTS\} value=\{salesKeys\} onChange=\{setSalesKeys\} \/>[\s\S]*?<div className="km-filter-group">[\s\S]*?<span className="km-filter-label">粒度<\/span>[\s\S]*?<Segmented options=\{isCost \? COST_DIM_OPTS : DIM_OPTS\} value=\{dim\} onChange=\{setDim\} \/>/);
  assert.doesNotMatch(kpiModalSource, /ORDER_TYPE_OPTS/);
  assert.doesNotMatch(kpiModalSource, /orderType/);
  assert.doesNotMatch(kpiModalSource, /新签/);
  assert.doesNotMatch(kpiModalSource, /续订/);
  assert.doesNotMatch(kpiModalSource, /km-type-control/);
  assert.doesNotMatch(kpiModalSource, /<span>type<\/span>/);
  assert.doesNotMatch(kpiModalSource, /value:\s*'all',\s*label:\s*'全部'/);
});
