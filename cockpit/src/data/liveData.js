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

  try {
    const payload = await fetchJson(fetchImpl, '/api/dashboard-data');
    applyDashboardDataSnapshot(payload);
    try {
      const computePayload = await fetchJson(fetchImpl, '/api/compute-data');
      applyDashboardDataSnapshot(computePayload);
      return { ...payload, ...computePayload };
    } catch {
      return payload;
    }
  } catch (dashboardError) {
    try {
      const computePayload = await fetchJson(fetchImpl, '/api/compute-data');
      applyDashboardDataSnapshot(computePayload);
      return computePayload;
    } catch (computeError) {
      throw new Error(`${dashboardError.message}；算力接口回退失败：${computeError.message}`);
    }
  }
}
