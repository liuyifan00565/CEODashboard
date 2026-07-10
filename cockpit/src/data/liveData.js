/*
 更新时间: 2026-07-09 21:15:00 CST
 更新内容: 新增 loadComputeCustomerPage，供算力页后台分页拉取全量客户列表，不再受首屏采样条数限制。
*/
/*
 更新时间: 2026-07-09 19:32:00 CST
 更新内容: dashboard-data 与 compute-data 拆分加载；算力外部数据由算力页按需调用 loadComputeData。
*/
/*
 更新时间: 2026-07-09 19:05:00 CST
 更新内容: 首屏优先等待 dashboard-data；只有它失败时才回退 compute-data，避免两个入口重复请求外部算力接口拖慢打开速度。
*/
/*
 更新时间: 2026-07-09 18:35:00 CST
 更新内容: dashboard-data 和 compute-data 由串行 await 改为并行 Promise.allSettled，修复外部算力接口
          较慢时首屏需要等待两个接口相加耗时（约 16-20 秒）才显示、看起来像卡死加载的问题。
*/
/*
 更新时间: 2026-07-09 17:45:00 CST
 更新内容: dashboard 快照成功后继续尝试 /api/compute-data 覆盖算力模块，确保 token 用量优先读取外部真实数据。
*/
/*
 更新时间: 2026-07-09 17:05:00 CST
 更新内容: 全量真实数据库加载失败时回退读取 /api/compute-data，只覆盖算力模块，避免其它看板内容被阻塞。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 新增前端真实数据库数据加载器，从 /api/dashboard-data 获取 MySQL 快照并覆盖运行时数据。
*/
import { applyDashboardDataSnapshot } from './mock.js';

async function fetchJson(fetchImpl, path) {
  const response = await fetchImpl(path, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `真实数据接口返回 ${response.status}`);
  }

  return payload;
}

export async function loadDashboardData({ fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('当前环境不支持 fetch，无法加载真实数据库数据。');
  }
  const dashboardPayload = await fetchJson(fetchImpl, '/api/dashboard-data');
  applyDashboardDataSnapshot(dashboardPayload);
  return dashboardPayload;
}

export async function loadComputeData({ fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('当前环境不支持 fetch，无法加载算力数据。');
  }
  const computePayload = await fetchJson(fetchImpl, '/api/compute-data');
  applyDashboardDataSnapshot(computePayload);
  return computePayload;
}

export async function loadComputeCustomerPage({ page = 1, pageSize = 200, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('当前环境不支持 fetch，无法加载算力客户分页数据。');
  }

  return fetchJson(fetchImpl, `/api/compute-customers?page=${page}&pageSize=${pageSize}`);
}
