/*
 Update time: 2026-07-13 16:48:56 CST
 Update content: Cost maintenance save builder merges per-channel operations and labor inputs into one monthly database row.
*/
/*
 Update time: 2026-07-13 00:00:00 CST
 Update content: Target maintenance save rows support separate target and actual amount draft fields for the same department month.
*/
/*
 Update time: 2026-07-09 14:51:22 CST
 Update content: buildTargetSaveRows 改为部门级:处理 summary-<deptId> 行,输出 {department_id, department_name,
   year_month, target_amount_wan},不再输出 staff_id(由后端 saveTarget 置 NULL),与目标维护页部门级录入对齐。
*/
/*
 Update time: 2026-07-09 16:20:00 CST
 Update content: Cost maintenance save builder supports separate channel investment and refund amount draft fields.
*/
/*
 更新时间: 2026-07-08 18:45:00 CST
 更新内容: 成本维护新增渠道时保留 new-channel 临时 ID 成本行，供后端落库后映射真实 channel_id。
*/
/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 保存构建器新增组织/渠道大类 payload，支持新增维表落库；渠道来源启用=false 会转换为 is_excluded=1。
*/
/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: 新增数据维护页内编辑保存的纯函数行构建器（target/cost+labor/org/channel）。
          只把 draftRef 里出现过的已编辑格转成保存接口所需行，过滤 summary/department 行，
          从行 id 前缀解析 staff_id/channel_id/cost_type。输出金额单位为"万"，由后端 saver 转元。
          channel 走受控 sources state，builder 只做形状映射 + deletions 透传。
*/

const MONTH_KEY_RE = /^m(\d{2})$/;

function monthKeyToMM(monthKey) {
  const m = MONTH_KEY_RE.exec(String(monthKey || ''));
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 1 || n > 12) return null;
  return String(n).padStart(2, '0');
}

function splitDraftKey(key) {
  const sep = String(key || '').indexOf('|');
  if (sep < 0) return { rowId: '', field: '' };
  return { rowId: String(key).slice(0, sep), field: String(key).slice(sep + 1) };
}

function splitCostDraftKey(key) {
  const parts = String(key || '').split('|');
  return {
    rowId: parts[0] || '',
    monthKey: parts[1] || '',
    valueField: parts[2] || 'operations',
  };
}

function splitTargetDraftKey(key) {
  const parts = String(key || '').split('|');
  return {
    rowId: parts[0] || '',
    monthKey: parts[1] || '',
    valueField: parts[2] || 'target',
  };
}

/**
 * 目标维护：把 draft（"summary-<deptId>|mXX" -> 万）转成部门级保存行。
 * 只产出 draft 命中且对应部门行(排除 summary-all 合计行)的格；staff_id 由后端置 NULL。
 * @param {Array} rows 快照 rows
 * @param {Record<string, number>} draft
 * @param {string|number} year
 * @returns {Array<{department_id, department_name, year_month, target_amount_wan}>}
 */
export function buildTargetSaveRows(rows, draft, year) {
  const deptRows = new Map(
    (Array.isArray(rows) ? rows : [])
      .filter((r) => r && r.type === 'department' && typeof r.id === 'string' && r.id.startsWith('summary-') && r.id !== 'summary-all')
      .map((r) => [r.id, r]),
  );
  const outByKey = new Map();
  for (const [key, value] of Object.entries(draft || {})) {
    const { rowId, monthKey, valueField } = splitTargetDraftKey(key);
    const mm = monthKeyToMM(monthKey);
    const row = deptRows.get(rowId);
    if (!mm || !row) continue;
    const yearMonth = `${year}-${mm}`;
    const mapKey = `${rowId}|${yearMonth}`;
    const existing = outByKey.get(mapKey) || {
      department_id: rowId.slice('summary-'.length),
      department_name: row.name,
      year_month: yearMonth,
    };
    if (valueField === 'actual') {
      existing.actual_amount_wan = Number(value) || 0;
    } else {
      existing.target_amount_wan = Number(value) || 0;
    }
    outByKey.set(mapKey, existing);
  }
  return Array.from(outByKey.values());
}

/**
 * 成本维护：把同一渠道月份的运营、人力和退款 draft 合并为一条渠道成本行。
 * @returns {{ rows: Array }}
 */
export function buildCostSaveRows(snapshot, draft, year) {
  const rows = Array.isArray(snapshot?.rows) ? snapshot.rows : [];
  const channelRows = new Map(
    rows.filter((r) => r && r.type === 'channel' && r.id != null).map((r) => [String(r.id), r]),
  );

  const costRowsByKey = new Map();
  for (const [key, value] of Object.entries(draft || {})) {
    const { rowId, monthKey, valueField } = splitCostDraftKey(key);
    const mm = monthKeyToMM(monthKey);
    if (!mm) continue;
    const yearMonth = `${year}-${mm}`;
    const chRow = channelRows.get(rowId);
    if (!chRow) continue;
    const mapKey = `${rowId}|${yearMonth}`;
    const sourcePeriod = chRow.periods?.[monthKey];
    const existing = costRowsByKey.get(mapKey) || {
      channel_id: rowId,
      channel_name: chRow.name,
      year_month: yearMonth,
      operations_amount_wan: Number(sourcePeriod?.operations) || 0,
      labor_amount_wan: sourcePeriod?.laborConfigured === false ? null : Number(sourcePeriod?.labor) || 0,
      refund_amount_wan: Number(sourcePeriod?.refund) || 0,
    };
    if (valueField === 'refund') {
      existing.refund_amount_wan = Number(value) || 0;
    } else if (valueField === 'labor') {
      existing.labor_amount_wan = Number(value) || 0;
    } else {
      existing.operations_amount_wan = Number(value) || 0;
    }
    costRowsByKey.set(mapKey, existing);
  }
  return { rows: Array.from(costRowsByKey.values()) };
}

/**
 * 组织维护：把 draft（"<staff_id>|deptId|isSales|enabled"）合并到 users，只发有编辑的人员。
 * @returns {Array<{staff_id, department_id, is_sales, is_enabled}>}
 */
export function buildOrgSaveRows(users, draft) {
  const list = Array.isArray(users) ? users : [];
  const byId = new Map(list.filter((u) => u && u.id != null).map((u) => [String(u.id), u]));
  const touched = new Set();
  for (const key of Object.keys(draft || {})) {
    const { rowId } = splitDraftKey(key);
    if (byId.has(rowId)) touched.add(rowId);
  }
  const out = [];
  for (const id of touched) {
    const user = byId.get(id);
    const deptId = `${id}|deptId` in draft ? draft[`${id}|deptId`] : user.deptId;
    const isSales = `${id}|isSales` in draft ? draft[`${id}|isSales`] : user.isSales;
    const enabled = `${id}|enabled` in draft ? draft[`${id}|enabled`] : user.enabled;
    out.push({
      staff_id: id,
      department_id: deptId == null || deptId === '' ? null : String(deptId),
      is_sales: isSales ? 1 : 0,
      is_enabled: enabled == null ? null : (enabled ? 1 : 0),
    });
  }
  return out;
}

/**
 * 组织维护：把本地新增组织（new-dept-*）转成后端可落库行。
 * @returns {Array<{department_id, department_name, parent_id, is_enabled}>}
 */
export function buildDepartmentSaveRows(departments) {
  return (Array.isArray(departments) ? departments : [])
    .filter((dept) => dept && String(dept.id || '').startsWith('new-dept-'))
    .map((dept) => ({
      department_id: String(dept.id),
      department_name: String(dept.name ?? ''),
      parent_id: dept.parentId == null || dept.parentId === '' ? null : String(dept.parentId),
      is_enabled: dept.enabled == null ? 1 : (dept.enabled ? 1 : 0),
    }));
}

/**
 * 渠道维护：把本地新增渠道大类（new-channel-*）转成后端可落库行。
 * @returns {Array<{channel_id, channel_name, parent_id, is_enabled}>}
 */
export function buildChannelGroupSaveRows(groups) {
  return (Array.isArray(groups) ? groups : [])
    .filter((group) => group && String(group.id || '').startsWith('new-channel-'))
    .map((group) => ({
      channel_id: String(group.id),
      channel_name: String(group.name ?? ''),
      parent_id: group.parentId == null || group.parentId === '' ? null : String(group.parentId),
      is_enabled: group.enabled == null ? 1 : (group.enabled ? 1 : 0),
    }));
}

/**
 * 渠道维护：从受控 sources state 映射成保存行 + 删除列表。
 * @param {Array} sources 当前 sources 本地 state（含新增/编辑后的最新值）
 * @param {string[]} deletedCodes 待删除的 source_code 列表
 * @returns {{ rows: Array<{source_code, source_name, channel_id, is_excluded}>, deletions: string[] }}
 */
export function buildChannelSaveRows(sources, deletedCodes) {
  const rows = (Array.isArray(sources) ? sources : []).map((s) => ({
    source_code: String(s.code ?? ''),
    source_name: String(s.name ?? ''),
    channel_id: s.groupId == null || s.groupId === '' ? null : String(s.groupId),
    is_excluded: s.excluded || s.enabled === false ? 1 : 0,
  }));
  return { rows, deletions: Array.isArray(deletedCodes) ? deletedCodes.filter(Boolean) : [] };
}
