/*
 更新时间: 2026-07-08 16:37:08 CST
 更新内容: 组织保存根据部门编码自动维护 dim_staff.channel_key，销售调岗同步换渠道，转非销售或无组织时清空渠道。
*/
/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 保存接口补齐维护联动：目标保存校验启用销售；组织保存支持新增 dim_department 并映射临时部门 ID；
          渠道保存支持新增 dim_channel 并映射临时渠道 ID，来源“启用/排除”统一落 is_excluded。
*/
/*
 更新时间: 2026-07-08
 更新内容: saveTarget 加门槛：upsert 前校验 staff 是销售(is_sales=1)且有部门，否则 skipped+errors，
          与导入写库口径一致，避免页内编辑给无部门/非销售人员写目标。
*/
/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: 新增页内编辑保存接口 POST /api/maintenance/save，按 pageKey 事务执行"部分列 upsert"：
          只更新维护页实际可编辑的列，绝不覆盖未编辑列（target 的 opening/order、org 的 external_bi_user_id）。
          金额页内用"万"、写库 ×10000 转元，与导入写库口径一致。channel 支持新增来源 INSERT 与删除来源 DELETE。
          复用 maintenanceImport.js 的 WAN_TO_YUAN / readJsonBody / sendJson，避免口径漂移。
*/
import { createDbConnection, queryRows, nextId } from './db.js';
import { WAN_TO_YUAN, readJsonBody, sendJson } from './maintenanceImport.js';
import { buildDepartmentChannelKeyMap } from './departmentChannel.js';

function isTempId(value, prefix) {
  return String(value || '').startsWith(prefix);
}

function normalizeNullableId(value) {
  return value == null || value === '' ? null : String(value);
}

/** 目标维护：按 (year_month, staff_id) 部分列 upsert，仅写 target_amount_yuan。人员须 is_sales=1 且有部门。 */
export async function saveTarget(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  for (const row of rows) {
    const staffId = Number(row.staff_id);
    const yearMonth = String(row.year_month || '');
    if (!Number.isInteger(staffId) || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      skipped += 1;
      errors.push({ field: 'staff_id|year_month', message: `目标行键非法，跳过：staff_id=${row.staff_id} year_month=${yearMonth}` });
      continue;
    }
    // 口径与导入一致：只允许销售且有部门的人员保存目标
    const staffRows = await queryRows(connection, 'SELECT is_sales, is_enabled, department_id FROM dim_staff WHERE staff_id = ? LIMIT 1', [staffId]);
    const st = staffRows[0];
    if (!st) {
      skipped += 1;
      errors.push({ field: 'staff_id', message: `人员不存在，跳过：staff_id=${staffId}` });
      continue;
    }
    if (Number(st.is_sales) !== 1) {
      skipped += 1;
      errors.push({ field: 'staff_id', message: `staff_id=${staffId} 不是销售，无法保存目标` });
      continue;
    }
    if (st.department_id == null) {
      skipped += 1;
      errors.push({ field: 'staff_id', message: `staff_id=${staffId} 无所属组织，无法保存目标` });
      continue;
    }
    if (Number(st.is_enabled) !== 1) {
      skipped += 1;
      errors.push({ field: 'staff_id', message: `staff_id=${staffId} 已停用，无法保存目标` });
      continue;
    }
    const amountYuan = WAN_TO_YUAN(row.target_amount_wan);
    const existing = await queryRows(connection, 'SELECT target_id FROM biz_target_monthly WHERE `year_month` = ? AND staff_id = ?', [yearMonth, staffId]);
    if (existing[0]?.target_id) {
      await connection.execute(
        'UPDATE biz_target_monthly SET target_amount_yuan = ? WHERE target_id = ?',
        [amountYuan, existing[0].target_id],
      );
    } else {
      const id = await nextId(connection, 'biz_target_monthly', 'target_id');
      await connection.execute(
        'INSERT INTO biz_target_monthly (target_id, `year_month`, staff_id, target_amount_yuan, target_opening_count, target_order_count) VALUES (?, ?, ?, ?, 0, 0)',
        [id, yearMonth, staffId, amountYuan],
      );
    }
    written += 1;
  }
  return { written, skipped, errors };
}

/** 成本维护：按 (year_month, channel_id) upsert biz_channel_cost_monthly，仅写 investment_amount_yuan。 */
export async function saveCost(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  for (const row of rows) {
    const channelId = Number(row.channel_id);
    const yearMonth = String(row.year_month || '');
    if (!Number.isInteger(channelId) || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      skipped += 1;
      errors.push({ field: 'channel_id|year_month', message: `成本行键非法，跳过：channel_id=${row.channel_id} year_month=${yearMonth}` });
      continue;
    }
    const amountYuan = WAN_TO_YUAN(row.investment_amount_wan);
    const existing = await queryRows(connection, 'SELECT cost_id FROM biz_channel_cost_monthly WHERE `year_month` = ? AND channel_id = ?', [yearMonth, channelId]);
    if (existing[0]?.cost_id) {
      await connection.execute('UPDATE biz_channel_cost_monthly SET investment_amount_yuan = ? WHERE cost_id = ?', [amountYuan, existing[0].cost_id]);
    } else {
      const id = await nextId(connection, 'biz_channel_cost_monthly', 'cost_id');
      await connection.execute('INSERT INTO biz_channel_cost_monthly (cost_id, `year_month`, channel_id, investment_amount_yuan) VALUES (?, ?, ?, ?)', [id, yearMonth, channelId, amountYuan]);
    }
    written += 1;
  }
  return { written, skipped, errors };
}

/** 人力成本维护：按 (year_month, cost_type) upsert biz_labor_cost_monthly，仅写 amount_yuan。 */
export async function saveLabor(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  for (const row of rows) {
    const costType = String(row.cost_type || '');
    const yearMonth = String(row.year_month || '');
    if (!costType || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      skipped += 1;
      errors.push({ field: 'cost_type|year_month', message: `人力成本行键非法，跳过：cost_type=${costType} year_month=${yearMonth}` });
      continue;
    }
    const amountYuan = WAN_TO_YUAN(row.amount_wan);
    const existing = await queryRows(connection, 'SELECT labor_cost_id FROM biz_labor_cost_monthly WHERE `year_month` = ? AND cost_type = ?', [yearMonth, costType]);
    if (existing[0]?.labor_cost_id) {
      await connection.execute('UPDATE biz_labor_cost_monthly SET amount_yuan = ? WHERE labor_cost_id = ?', [amountYuan, existing[0].labor_cost_id]);
    } else {
      const id = await nextId(connection, 'biz_labor_cost_monthly', 'labor_cost_id');
      await connection.execute('INSERT INTO biz_labor_cost_monthly (labor_cost_id, `year_month`, cost_type, amount_yuan) VALUES (?, ?, ?, ?)', [id, yearMonth, costType, amountYuan]);
    }
    written += 1;
  }
  return { written, skipped, errors };
}

/** 组织维护：先新增 dim_department，再按 staff_id 更新 dim_staff 的 department_id/is_sales/is_enabled。 */
export async function saveOrg(connection, rows, departments = []) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  const deptRows = await queryRows(connection, 'SELECT department_id, department_code, parent_id FROM dim_department');
  const departmentRecords = [...deptRows];
  const validDeptIds = new Set(deptRows.map((d) => String(d.department_id)));
  const tempDeptIdMap = new Map();

  for (const dept of departments) {
    const tempId = String(dept.department_id || '');
    if (!isTempId(tempId, 'new-dept-')) continue;
    const name = String(dept.department_name || '').trim();
    if (!name) {
      skipped += 1;
      errors.push({ field: 'department_name', message: `新增组织名称为空，跳过：${tempId}` });
      continue;
    }
    const rawParentId = normalizeNullableId(dept.parent_id);
    const parentId = rawParentId == null ? null : (tempDeptIdMap.get(rawParentId) || rawParentId);
    if (parentId !== null && !validDeptIds.has(parentId)) {
      skipped += 1;
      errors.push({ field: 'parent_id', message: `上级组织尚未落库（${parentId}），跳过新增组织：${name}` });
      continue;
    }
    const id = await nextId(connection, 'dim_department', 'department_id');
    await connection.execute(
      'INSERT INTO dim_department (department_id, department_code, department_name, parent_id, sort_order, is_enabled) VALUES (?, ?, ?, ?, 0, ?)',
      [id, `dept_${id}`, name, parentId, dept.is_enabled == null ? 1 : (dept.is_enabled ? 1 : 0)],
    );
    departmentRecords.push({ department_id: id, department_code: `dept_${id}`, parent_id: parentId });
    validDeptIds.add(String(id));
    tempDeptIdMap.set(tempId, String(id));
    written += 1;
  }

  const departmentChannelKeys = buildDepartmentChannelKeyMap(departmentRecords);

  for (const row of rows) {
    const staffId = Number(row.staff_id);
    if (!Number.isInteger(staffId)) {
      skipped += 1;
      errors.push({ field: 'staff_id', message: `人员 staff_id 非法，跳过：${row.staff_id}` });
      continue;
    }
    const rawDeptId = normalizeNullableId(row.department_id);
    const deptId = rawDeptId == null ? null : (tempDeptIdMap.get(rawDeptId) || rawDeptId);
    if (deptId !== null && !validDeptIds.has(deptId)) {
      skipped += 1;
      errors.push({ field: 'department_id', message: `组织尚未落库（${deptId}），跳过该人员：staff_id=${staffId}` });
      continue;
    }
    const isSales = row.is_sales ? 1 : 0;
    const isEnabled = row.is_enabled == null ? 1 : (row.is_enabled ? 1 : 0);
    const channelKey = isSales && deptId !== null ? (departmentChannelKeys.get(String(deptId)) ?? null) : null;
    await connection.execute(
      'UPDATE dim_staff SET department_id = ?, channel_key = ?, is_sales = ?, is_enabled = ? WHERE staff_id = ?',
      [deptId, channelKey, isSales, isEnabled, staffId],
    );
    written += 1;
  }
  return { written, skipped, errors };
}

/** 渠道维护：先新增 dim_channel，再按 source_code upsert dim_channel_source，支持新增来源 INSERT 与删除来源 DELETE。 */
export async function saveChannel(connection, rows, deletions = [], groups = []) {
  let written = 0;
  let skipped = 0;
  let deleted = 0;
  const errors = [];
  const channelRows = await queryRows(connection, 'SELECT channel_id FROM dim_channel');
  const validChannelIds = new Set(channelRows.map((c) => String(c.channel_id)));
  const tempChannelIdMap = new Map();

  for (const group of groups) {
    const tempId = String(group.channel_id || '');
    if (!isTempId(tempId, 'new-channel-')) continue;
    const name = String(group.channel_name || '').trim();
    if (!name) {
      skipped += 1;
      errors.push({ field: 'channel_name', message: `新增渠道大类名称为空，跳过：${tempId}` });
      continue;
    }
    const rawParentId = normalizeNullableId(group.parent_id);
    const parentId = rawParentId == null ? null : (tempChannelIdMap.get(rawParentId) || rawParentId);
    if (parentId !== null && !validChannelIds.has(parentId)) {
      skipped += 1;
      errors.push({ field: 'parent_id', message: `上级渠道大类尚未落库（${parentId}），跳过新增大类：${name}` });
      continue;
    }
    const id = await nextId(connection, 'dim_channel', 'channel_id');
    await connection.execute(
      'INSERT INTO dim_channel (channel_id, channel_key, channel_name, parent_id, is_enabled) VALUES (?, ?, ?, ?, ?)',
      [id, `channel_${id}`, name, parentId, group.is_enabled == null ? 1 : (group.is_enabled ? 1 : 0)],
    );
    validChannelIds.add(String(id));
    tempChannelIdMap.set(tempId, String(id));
    written += 1;
  }

  for (const row of rows) {
    const sourceCode = String(row.source_code || '');
    if (!sourceCode) {
      skipped += 1;
      errors.push({ field: 'source_code', message: '来源编码为空，跳过' });
      continue;
    }
    const rawChannelId = normalizeNullableId(row.channel_id);
    const channelId = rawChannelId == null ? null : (tempChannelIdMap.get(rawChannelId) || rawChannelId);
    if (channelId !== null && !validChannelIds.has(channelId)) {
      skipped += 1;
      errors.push({ field: 'channel_id', message: `渠道大类尚未落库（${channelId}），跳过该来源：${sourceCode}` });
      continue;
    }
    const excluded = row.is_excluded ? 1 : 0;
    const existing = await queryRows(connection, 'SELECT source_id FROM dim_channel_source WHERE source_code = ?', [sourceCode]);
    if (existing[0]?.source_id) {
      await connection.execute(
        'UPDATE dim_channel_source SET source_name = ?, channel_id = ?, is_excluded = ? WHERE source_id = ?',
        [row.source_name, channelId, excluded, existing[0].source_id],
      );
    } else {
      const id = await nextId(connection, 'dim_channel_source', 'source_id');
      await connection.execute(
        'INSERT INTO dim_channel_source (source_id, source_code, source_name, channel_id, is_excluded) VALUES (?, ?, ?, ?, ?)',
        [id, sourceCode, row.source_name, channelId, excluded],
      );
    }
    written += 1;
  }

  for (const code of deletions) {
    const sourceCode = String(code || '');
    if (!sourceCode) continue;
    const [result] = await connection.execute('DELETE FROM dim_channel_source WHERE source_code = ?', [sourceCode]);
    deleted += Number(result?.affectedRows || 0);
  }

  return { written, skipped, deleted, errors };
}

const SAVERS = {
  'target-maintenance': (conn, body) => saveTarget(conn, body.rows || []),
  'cost-maintenance': async (conn, body) => {
    const costRes = await saveCost(conn, body.rows || []);
    const laborRes = await saveLabor(conn, body.laborRows || []);
    return {
      written: costRes.written + laborRes.written,
      skipped: costRes.skipped + laborRes.skipped,
      deleted: 0,
      errors: [...costRes.errors, ...laborRes.errors],
    };
  },
  'org-maintenance': (conn, body) => saveOrg(conn, body.rows || [], body.departments || []),
  'channel-maintenance': (conn, body) => saveChannel(conn, body.rows || [], body.deletions || [], body.groups || []),
};

/**
 * 真写库：单事务执行页专属部分列 upsert，FK 不满足的行跳过不中断。
 * @param {string} pageKey
 * @param {object} body { rows, laborRows?, departments?, groups?, deletions? }
 * @returns {Promise<{written:number, skipped:number, deleted:number, errors:object[], summary:string}>}
 */
export async function persistSave(pageKey, body) {
  const saver = SAVERS[pageKey];
  if (!saver) {
    return { written: 0, skipped: 0, deleted: 0, errors: [{ field: '', message: `未配置的保存页：${pageKey}` }], summary: `未配置的保存页：${pageKey}` };
  }
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();
    const result = await saver(connection, body || {});
    await connection.commit();
    return {
      written: result.written,
      skipped: result.skipped,
      deleted: result.deleted || 0,
      errors: result.errors,
      summary: `已写入 ${result.written} 行，跳过 ${result.skipped} 行，删除 ${result.deleted || 0} 行。`,
    };
  } catch (err) {
    await connection.rollback();
    return {
      written: 0,
      skipped: 0,
      deleted: 0,
      errors: [{ field: '', message: `保存失败已回滚：${err.message}` }],
      summary: `保存失败已回滚：${err.message}`,
    };
  } finally {
    await connection.end();
  }
}

/**
 * POST /api/maintenance/save
 * 请求体：{ pageKey, year, rows, laborRows?, departments?, groups?, deletions? }
 * 响应：{ pageKey, year, written, skipped, deleted, errors, summary }
 */
export async function handleMaintenanceSaveRequest(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, 400, { error: err.message });
    return;
  }

  const { pageKey, year } = body || {};
  if (!pageKey) {
    sendJson(res, 400, { error: '缺少 pageKey' });
    return;
  }
  if (!SAVERS[pageKey]) {
    sendJson(res, 400, { error: `未配置的保存页：${pageKey}` });
    return;
  }

  const result = await persistSave(pageKey, body);
  sendJson(res, 200, {
    pageKey,
    year: year ?? null,
    written: result.written,
    skipped: result.skipped,
    deleted: result.deleted,
    errors: result.errors,
    summary: result.summary,
  });
}
