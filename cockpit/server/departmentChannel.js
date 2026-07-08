/*
 更新时间: 2026-07-08 16:37:08 CST
 更新内容: 新增组织编码到经营渠道的统一映射，供维护写入和看板人员口径复用。
*/

const DEPARTMENT_CHANNEL_BY_CODE = new Map([
  ['online-sales', 'online'],
  ['south-sales', 'south'],
  ['east-sales', 'east'],
  ['agent-sales', 'agent'],
]);

export function channelKeyForDepartmentCode(departmentCode) {
  return DEPARTMENT_CHANNEL_BY_CODE.get(String(departmentCode || '').trim()) ?? null;
}

export function buildDepartmentChannelKeyMap(departments = []) {
  const byId = new Map(departments.map((dept) => [String(dept.department_id), dept]));
  const cache = new Map();

  function resolve(departmentId, seen = new Set()) {
    const key = String(departmentId ?? '');
    if (!key) return null;
    if (cache.has(key)) return cache.get(key);
    if (seen.has(key)) return null;
    seen.add(key);

    const dept = byId.get(key);
    if (!dept) return null;
    const direct = channelKeyForDepartmentCode(dept.department_code);
    const channelKey = direct ?? resolve(dept.parent_id, seen);
    cache.set(key, channelKey);
    return channelKey;
  }

  for (const dept of departments) {
    resolve(dept.department_id);
  }
  return cache;
}

export function resolveDepartmentChannelKey(departments, departmentId) {
  return buildDepartmentChannelKeyMap(departments).get(String(departmentId ?? '')) ?? null;
}
