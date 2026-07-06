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

test('loads mysql dashboard data before rendering dashboard content', () => {
  assert.match(appSource, /import \{ loadDashboardData \} from '\.\/data\/liveData';/);
  assert.match(appSource, /useEffect\(\(\) => \{[\s\S]*?loadDashboardData\(\)[\s\S]*?setDashboardDataVersion/);
  assert.match(appSource, /dashboardDataState\.status === 'loading'/);
  assert.match(appSource, /dashboardDataState\.status === 'error'/);
  assert.match(appSource, /isDashboardDataReady/);
});

test('registers the same live dashboard data api in production and vite dev servers', () => {
  assert.match(serverSource, /handleDashboardDataRequest/);
  assert.match(serverSource, /url\.pathname === '\/api\/dashboard-data'/);
  assert.match(viteConfigSource, /handleDashboardDataRequest/);
  assert.match(viteConfigSource, /server\.middlewares\.use\('\/api\/dashboard-data'/);
});
