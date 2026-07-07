/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: 新增数据维护真实数据库加载器，从 /api/maintenance/data 获取四个维护页的 MySQL 快照，
          返回形状与 mock 导出一致，供 MaintenancePage 替换静态 mock。
*/

/**
 * 拉取某维护页的真实数据库快照。
 * @param {string} page pageKey（target-maintenance / cost-maintenance / org-maintenance / channel-maintenance）
 * @param {number} year 年份
 * @returns {Promise<object>} 形如 { orgTree, rows } / { channels, rows, laborRows } / { departments, users } / { groups, sources }
 */
export async function fetchMaintenanceData(page, year, { fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('当前环境不支持 fetch，无法加载维护页数据。');
  }
  const url = `/api/maintenance/data?page=${encodeURIComponent(page)}&year=${encodeURIComponent(year)}`;
  const response = await fetchImpl(url, {
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
    throw new Error(payload?.error || `维护页数据接口返回 ${response.status}`);
  }
  return payload?.data ?? {};
}
