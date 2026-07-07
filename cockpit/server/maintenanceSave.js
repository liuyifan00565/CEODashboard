/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: 新增页内编辑保存接口 POST /api/maintenance/save，按 pageKey 事务执行"部分列 upsert"：
          只更新维护页实际可编辑的列，绝不覆盖未编辑列（target 的 opening/order、org 的 external_bi_user_id）。
          金额页内用"万"、写库 ×10000 转元，与导入写库口径一致。channel 支持新增来源 INSERT 与删除来源 DELETE。
          复用 maintenanceImport.js 的 WAN_TO_YUAN / readJsonBody / sendJson，避免口径漂移。
*/
import { createDbConnection, queryRows, nextId } from './db.js';
import { WAN_TO_YUAN, readJsonBody, sendJson } from './maintenanceImport.js';

/** 目标维护：按 (year_month, staff_id) 部分列 upsert，仅写 target_amount_yuan。 */
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

/** 组织维护：按 staff_id 更新 dim_staff 的 department_id/is_sales/is_enabled，跳过指向合成部门的行。 */
export async function saveOrg(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  const deptRows = await queryRows(connection, 'SELECT department_id FROM dim_department');
  const validDeptIds = new Set(deptRows.map((d) => String(d.department_id)));
  for (const row of rows) {
    const staffId = Number(row.staff_id);
    if (!Number.isInteger(staffId)) {
      skipped += 1;
      errors.push({ field: 'staff_id', message: `人员 staff_id 非法，跳过：${row.staff_id}` });
      continue;
    }
    const deptId = row.department_id == null ? null : String(row.department_id);
    if (deptId !== null && !validDeptIds.has(deptId)) {
      skipped += 1;
      errors.push({ field: 'department_id', message: `组织尚未落库（${deptId}），跳过该人员：staff_id=${staffId}` });
      continue;
    }
    const isSales = row.is_sales ? 1 : 0;
    const isEnabled = row.is_enabled == null ? 1 : (row.is_enabled ? 1 : 0);
    await connection.execute(
      'UPDATE dim_staff SET department_id = ?, is_sales = ?, is_enabled = ? WHERE staff_id = ?',
      [deptId, isSales, isEnabled, staffId],
    );
    written += 1;
  }
  return { written, skipped, errors };
}

/** 渠道维护：按 source_code upsert dim_channel_source，支持新增来源 INSERT 与删除来源 DELETE。 */
export async function saveChannel(connection, rows, deletions = []) {
  let written = 0;
  let skipped = 0;
  let deleted = 0;
  const errors = [];
  const channelRows = await queryRows(connection, 'SELECT channel_id FROM dim_channel');
  const validChannelIds = new Set(channelRows.map((c) => String(c.channel_id)));

  for (const row of rows) {
    const sourceCode = String(row.source_code || '');
    if (!sourceCode) {
      skipped += 1;
      errors.push({ field: 'source_code', message: '来源编码为空，跳过' });
      continue;
    }
    const channelId = row.channel_id == null || row.channel_id === '' ? null : String(row.channel_id);
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
  'org-maintenance': (conn, body) => saveOrg(conn, body.rows || []),
  'channel-maintenance': (conn, body) => saveChannel(conn, body.rows || [], body.deletions || []),
};

/**
 * 真写库：单事务执行页专属部分列 upsert，FK 不满足的行跳过不中断。
 * @param {string} pageKey
 * @param {object} body { rows, laborRows?, deletions? }
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
 * 请求体：{ pageKey, year, rows, laborRows?, deletions? }
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
