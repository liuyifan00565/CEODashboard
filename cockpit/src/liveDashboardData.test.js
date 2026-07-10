/*
 更新时间: 2026-07-10 16:43:00 CST
 更新内容: 合并 Jichuan 算力独立接口与后台同步静态断言，并更新 App 不再使用 dashboardDataVersion 的回归检查。
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

test('loads mysql dashboard data before rendering dashboard content', () => {
  assert.match(appSource, /import \{ loadComputeCustomerPage, loadComputeData, loadDashboardData \} from '\.\/data\/liveData';/);
  assert.match(appSource, /useEffect\(\(\) => \{[\s\S]*?loadDashboardData\(\)[\s\S]*?setDashboardDataState\(\{ status: 'ready', error: '' \}\)/);
  assert.match(appSource, /dashboardDataState\.status === 'loading'/);
  assert.match(appSource, /dashboardDataState\.status === 'error'/);
  assert.match(appSource, /isDashboardDataReady/);
  assert.match(appSource, /className="dash-data-state"/);
});

test('removed dashboardDataVersion so data readiness does not remount the content area', () => {
  assert.doesNotMatch(appSource, /const \[dashboardDataVersion/);
  assert.doesNotMatch(appSource, /setDashboardDataVersion/);
  assert.match(appSource, /<div className="dash-content" ref=\{gridRef\} key=\{contentKey\}>/);
  assert.match(appSource, /\}, \[contentKey\]\);/);
  assert.match(appSource, /\}, \[searchTerm, activeSearchIndex, contentKey, isComputePage, dashboardDataState\.status, computeDataState\.status\]\);/);
});

test('registers the same live dashboard data api in production and vite dev servers', () => {
  assert.match(serverSource, /handleDashboardDataRequest/);
  assert.match(serverSource, /url\.pathname === '\/api\/dashboard-data'/);
  assert.match(viteConfigSource, /handleDashboardDataRequest/);
  assert.match(viteConfigSource, /server\.middlewares\.use\('\/api\/dashboard-data'/);
});

test('loads external compute data in the background after dashboard data is ready', () => {
  assert.match(appSource, /const \[computeDataState, setComputeDataState\] = useState\(\{ status: 'idle', error: '' \}\);/);
  assert.match(appSource, /if \(dashboardDataState\.status !== 'ready' \|\| computeDataState\.status !== 'idle'\) return undefined;/);
  assert.match(appSource, /loadComputeData\(\)[\s\S]*?setComputeDataState\(\{ status: 'ready', error: '' \}\)/);
  assert.match(appSource, /<ComputeUsagePage[\s\S]*?computeDataState=\{computeDataState\}[\s\S]*?customerSyncState=\{computeCustomerSyncState\}[\s\S]*?\/>/);
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

test('syncs all compute customers in the background via pagination instead of waiting for the compute page', () => {
  assert.match(appSource, /const CUSTOMER_SYNC_PAGE_SIZE = 200;/);
  assert.match(appSource, /const \[computeCustomerSyncState, setComputeCustomerSyncState\] = useState\(\{ status: 'idle', total: 0 \}\);/);
  assert.match(appSource, /appendComputeCustomerRows,/);
  assert.match(appSource, /if \(computeDataState\.status !== 'ready' \|\| computeCustomerSyncState\.status !== 'idle'\) return undefined;/);
  assert.match(appSource, /loadComputeCustomerPage\(\{ page, pageSize: CUSTOMER_SYNC_PAGE_SIZE \}\)/);
  assert.match(appSource, /customerSyncState=\{computeCustomerSyncState\}/);
  assert.doesNotMatch(computePageSource, /import \{[\s\S]*?loadComputeCustomerPage[\s\S]*?\} from/);
});

test('gates compute page content on real compute data while loading', () => {
  assert.match(computePageSource, /if \(computeDataState\.status === 'idle' \|\| computeDataState\.status === 'loading'\) \{/);
  assert.match(computePageSource, /className="cpu-skeleton-grid"/);
  assert.match(computePageSource, /className="cpu-sync cpu-sync--loading"/);
});
