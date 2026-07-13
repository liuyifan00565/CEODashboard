/*
 更新时间: 2026-07-13 18:53:01 CST
 更新内容: 成本维护快照恢复部门人力行：销售部自动汇总，市场部独立维护。
*/
/*
 更新时间: 2026-07-13 16:48:56 CST
 更新内容: 成本维护快照统一为按渠道返回运营成本和人力成本，不再返回独立人力成本行。
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
