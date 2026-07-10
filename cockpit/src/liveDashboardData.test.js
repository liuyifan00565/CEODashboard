/*
 更新时间: 2026-07-10 15:58:00 CST
 更新内容: 算力客户分页同步断言改为检查 App 后台流程，确认客户加载不再依赖 ComputeUsagePage 挂载。
*/
/*
 更新时间: 2026-07-09 22:30:00 CST
 更新内容: dashboardDataVersion 状态被彻底移除，相关断言改为验证经营总览页在 dashboard-data 未就绪时渲染
          骨架屏、不使用本地示例数据，以及 dashboard-data/算力数据就绪都不再触发内容区重挂载。
*/
/*
 更新时间: 2026-07-09 22:05:00 CST
 更新内容: 增加算力数据就绪不再触发 dashboardDataVersion 自增（避免算力页整体重挂载）以及算力页在数据未就绪时
          渲染骨架屏、不使用本地示例数据的静态断言。
*/
/*
 更新时间: 2026-07-09 21:15:00 CST
 更新内容: 移除全屏数据库加载阻塞占位的静态断言，改为要求顶栏轻量同步提示条 dash-sync-pill；
          新增算力客户分页接口在生产和 Vite 开发服务的注册断言。
*/
/*
 更新时间: 2026-07-09 20:08:00 CST
 更新内容: 增加数据库加载延迟占位和 token 同步加载中才显示的静态断言。
*/
/*
 更新时间: 2026-07-09 19:52:00 CST
 更新内容: 算力数据改为首页数据就绪后后台同步，算力页只负责显示未完成状态。
*/
/*
 更新时间: 2026-07-09 19:32:00 CST
 更新内容: 增加算力页按需加载外部 token 数据的静态断言，首页仍只等待 dashboard-data。
*/
/*
 更新时间: 2026-07-09 17:05:00 CST
 更新内容: 增加 /api/compute-data 静态测试，要求生产和 Vite 开发服务都支持算力独立回退接口。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 增加真实数据库加载链路静态测试，要求 App、生产服务和 Vite 开发服务统一使用 /api/dashboard-data。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const serverSource = readFileSync(new URL('../server.js', import.meta.url), 'utf8');
const viteConfigSource = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
const computePageSource = readFileSync(new URL('./components/ComputeUsagePage.jsx', import.meta.url), 'utf8');

test('loads mysql dashboard data in the background without blocking the dashboard shell', () => {
  assert.match(appSource, /import \{ loadComputeCustomerPage, loadComputeData, loadDashboardData \} from '\.\/data\/liveData';/);
  assert.match(appSource, /useEffect\(\(\) => \{[\s\S]*?loadDashboardData\(\)[\s\S]*?setDashboardDataState\(\{ status: 'ready', error: '' \}\)/);
  assert.doesNotMatch(appSource, /if \(!isDashboardDataReady\)/);
  assert.doesNotMatch(appSource, /className="dash-data-state"/);
  assert.match(appSource, /dashboardDataState\.status === 'error'/);
  assert.match(appSource, /className="dash-sync-pill dash-sync-pill--error"/);
  assert.match(appSource, /className="dash-sync-pill dash-sync-pill--loading"/);
  assert.match(appSource, /const DASHBOARD_LOADING_DELAY_MS = 450;/);
  assert.match(appSource, /const \[showDashboardLoading, setShowDashboardLoading\] = useState\(false\);/);
  assert.match(appSource, /window\.setTimeout\(\(\) => \{[\s\S]*?setShowDashboardLoading\(true\);[\s\S]*?\}, DASHBOARD_LOADING_DELAY_MS\)/);
});

test('loads external compute data in the background after dashboard data is ready', () => {
  assert.match(appSource, /const \[computeDataState, setComputeDataState\] = useState\(\{ status: 'idle', error: '' \}\);/);
  assert.match(appSource, /if \(dashboardDataState\.status !== 'ready' \|\| computeDataState\.status !== 'idle'\) return undefined;/);
  assert.match(appSource, /loadComputeData\(\)[\s\S]*?setComputeDataState\(\{ status: 'ready', error: '' \}\)/);
  assert.match(appSource, /<ComputeUsagePage[\s\S]*?computeDataState=\{computeDataState\}[\s\S]*?customerSyncState=\{computeCustomerSyncState\}[\s\S]*?\/>/);
});

test('removed dashboardDataVersion entirely so neither dashboard nor compute data readiness remounts the content area', () => {
  assert.doesNotMatch(appSource, /const \[dashboardDataVersion/);
  assert.doesNotMatch(appSource, /setDashboardDataVersion/);
  assert.match(appSource, /<div className="dash-content" ref=\{gridRef\} key=\{contentKey\}>/);
  assert.match(appSource, /\}, \[contentKey\]\);/);
  assert.match(appSource, /\}, \[searchTerm, activeSearchIndex, contentKey, isComputePage, dashboardDataState\.status, computeDataState\.status\]\);/);
});

test('gates compute page content on real data instead of rendering local sample data while loading', () => {
  assert.match(computePageSource, /if \(computeDataState\.status === 'idle' \|\| computeDataState\.status === 'loading'\) \{/);
  assert.match(computePageSource, /className="cpu-skeleton-grid"/);
  assert.match(computePageSource, /className="cpu-sync cpu-sync--loading"/);
  const loadingBranch = computePageSource.match(/if \(computeDataState\.status === 'idle' \|\| computeDataState\.status === 'loading'\) \{[\s\S]*?\n  \}\n/)?.[0] ?? '';
  assert.notEqual(loadingBranch, '');
  assert.doesNotMatch(loadingBranch, /cpu-kpi-grid/);
  assert.doesNotMatch(loadingBranch, /cpu-customer/);
});

test('gates the overview page on real dashboard data instead of rendering local sample data while loading', () => {
  assert.match(appSource, /const isDashboardDataLoading = dashboardDataState\.status === 'loading';/);
  assert.match(appSource, /\) : isDashboardDataLoading \? \(/);
  assert.match(appSource, /className="dash-skeleton-strip"/);
  assert.match(appSource, /className="dash-skeleton-block dash-skeleton-block--overview"/);
  const skeletonBranch = appSource.match(/\) : isDashboardDataLoading \? \([\s\S]*?\) : \(/)?.[0] ?? '';
  assert.notEqual(skeletonBranch, '');
  assert.doesNotMatch(skeletonBranch, /<TopKpiStrip/);
  assert.doesNotMatch(skeletonBranch, /<OperatingOverview/);
  assert.doesNotMatch(skeletonBranch, /<MonthlyTrend/);
  assert.doesNotMatch(skeletonBranch, /<OpeningMetricCards/);
  assert.doesNotMatch(skeletonBranch, /<VersionFinancePanel/);
  assert.doesNotMatch(skeletonBranch, /<DeliveryPanel/);
});

test('registers the same live dashboard data api in production and vite dev servers', () => {
  assert.match(serverSource, /handleDashboardDataRequest/);
  assert.match(serverSource, /url\.pathname === '\/api\/dashboard-data'/);
  assert.match(viteConfigSource, /handleDashboardDataRequest/);
  assert.match(viteConfigSource, /server\.middlewares\.use\('\/api\/dashboard-data'/);
});

test('registers compute-only data api in production and vite dev servers', () => {
  assert.match(serverSource, /handleComputeDataRequest/);
  assert.match(serverSource, /url\.pathname === '\/api\/compute-data'/);
  assert.match(viteConfigSource, /handleComputeDataRequest/);
  assert.match(viteConfigSource, /server\.middlewares\.use\('\/api\/compute-data'/);
});

test('registers paginated compute customers api in production and vite dev servers', () => {
  assert.match(serverSource, /handleComputeCustomersRequest/);
  assert.match(serverSource, /url\.pathname === '\/api\/compute-customers'/);
  assert.match(viteConfigSource, /handleComputeCustomersRequest/);
  assert.match(viteConfigSource, /server\.middlewares\.use\('\/api\/compute-customers'/);
});

test('syncs all compute customers in the background via pagination instead of a single capped request', () => {
  assert.match(appSource, /const CUSTOMER_SYNC_PAGE_SIZE = 200;/);
  assert.match(appSource, /const \[computeCustomerSyncState, setComputeCustomerSyncState\] = useState\(\{ status: 'idle', total: 0 \}\);/);
  assert.match(appSource, /import \{ loadComputeCustomerPage, loadComputeData, loadDashboardData \} from '\.\/data\/liveData';/);
  assert.match(appSource, /appendComputeCustomerRows,/);
  assert.match(appSource, /if \(computeDataState\.status !== 'ready' \|\| computeCustomerSyncState\.status !== 'idle'\) return undefined;/);
  assert.match(appSource, /loadComputeCustomerPage\(\{ page, pageSize: CUSTOMER_SYNC_PAGE_SIZE \}\)/);
  assert.match(appSource, /customerSyncState=\{computeCustomerSyncState\}/);
  assert.doesNotMatch(computePageSource, /loadComputeCustomerPage\(/);
  assert.match(computePageSource, /className="cpu-customer-sync"/);
});
