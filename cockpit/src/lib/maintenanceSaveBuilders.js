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

/**
 * 目标维护：把 draft（"user-<staff_id>|mXX" -> 万）转成保存行。
 * 只产出 draft 命中且对应 user 行的格；summary/department 行天然被排除。
 * @param {Array} rows 快照 rows
 * @param {Record<string, number>} draft
 * @param {string|number} year
 * @returns {Array<{staff_id, staff_name, year_month, target_amount_wan}>}
 */
export function buildTargetSaveRows(rows, draft, year) {
  const userRows = new Map(
    (Array.isArray(rows) ? rows : [])
      .filter((r) => r && r.type === 'user' && typeof r.id === 'string' && r.id.startsWith('user-'))
      .map((r) => [r.id, r]),
  );
  const out = [];
  for (const [key, value] of Object.entries(draft || {})) {
    const { rowId, field: monthKey } = splitDraftKey(key);
    const mm = monthKeyToMM(monthKey);
    const row = userRows.get(rowId);
    if (!mm || !row) continue;
    out.push({
      staff_id: rowId.slice('user-'.length),
      staff_name: row.name,
      year_month: `${year}-${mm}`,
      target_amount_wan: Number(value) || 0,
    });
  }
  return out;
}

/**
 * 成本维护：把 draft 转成渠道成本行 + 人力成本行。
 * 渠道行键 "channel_id|mXX"；人力行键 "labor-<cost_type>|mXX"。
 * @returns {{ rows: Array, laborRows: Array }}
 */
export function buildCostSaveRows(snapshot, draft, year) {
  const rows = Array.isArray(snapshot?.rows) ? snapshot.rows : [];
  const laborRows = Array.isArray(snapshot?.laborRows) ? snapshot.laborRows : [];
  const channelRows = new Map(
    rows.filter((r) => r && r.type === 'channel' && r.id != null).map((r) => [String(r.id), r]),
  );
  const laborMap = new Map(laborRows.filter((r) => r && r.id).map((r) => [r.id, r]));

  const costRows = [];
  const laborOut = [];
  for (const [key, value] of Object.entries(draft || {})) {
    const { rowId, field: monthKey } = splitDraftKey(key);
    const mm = monthKeyToMM(monthKey);
    if (!mm) continue;
    const yearMonth = `${year}-${mm}`;
    if (rowId.startsWith('labor-')) {
      const laborRow = laborMap.get(rowId);
      if (!laborRow) continue;
      laborOut.push({
        cost_type: rowId.slice('labor-'.length),
        year_month: yearMonth,
        amount_wan: Number(value) || 0,
      });
    } else {
      const chRow = channelRows.get(rowId);
      if (!chRow) continue;
      costRows.push({
        channel_id: rowId,
        channel_name: chRow.name,
        year_month: yearMonth,
        investment_amount_wan: Number(value) || 0,
      });
    }
  }
  return { rows: costRows, laborRows: laborOut };
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
    is_excluded: s.excluded ? 1 : 0,
  }));
  return { rows, deletions: Array.isArray(deletedCodes) ? deletedCodes.filter(Boolean) : [] };
}
