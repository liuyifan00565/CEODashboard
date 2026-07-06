/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 新增前端真实数据库数据加载器，从 /api/dashboard-data 获取 MySQL 快照并覆盖运行时数据。
*/
import { applyDashboardDataSnapshot } from './mock.js';

export async function loadDashboardData({ fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('当前环境不支持 fetch，无法加载真实数据库数据。');
  }

  const response = await fetchImpl('/api/dashboard-data', {
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
    throw new Error(payload?.error || `真实数据库接口返回 ${response.status}`);
  }

  applyDashboardDataSnapshot(payload);
  return payload;
}
