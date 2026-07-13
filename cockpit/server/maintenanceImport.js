/*
 Update time: 2026-07-13 00:00:00 CST
 Update content: Export revenue daily schema guard for target maintenance actual amount saves.
*/
/*
 Update time: 2026-07-09 14:51:22 CST
 Update content: export resolveDepartmentChannelId 供 maintenanceSave.saveTarget 复用:目标维护页内编辑改为
   部门级保存时,需由 department_id 解析 channel_id 写入 biz_target_monthly(staff_id IS NULL)。
*/
/*
 Update time: 2026-07-09 16:20:00 CST
 Update content: Cost maintenance Excel import supports refund_amount_yuan and ensures the channel cost refund column exists.
*/
import { getImportConfig } from '../src/lib/maintenanceImportConfig.js';
import { mapAndValidate } from '../src/lib/excelImport.js';
import { createDbConnection, queryRows, nextId } from './db.js';
import { resolveDepartmentChannelKey } from './departmentChannel.js';

export function readJsonBody(req, limitBytes = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error('请求体超过 5MB 限制'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error(`请求体不是合法 JSON：${err.message}`));
      }
    });
    req.on('error', reject);
  });
}

export function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

export const WAN_TO_YUAN = (wan) => Math.round(Number(wan || 0) * 10000);

async function resolveByName(connection, table, nameCol, nameValue, idCol) {
  if (!nameValue) return null;
  const rows = await queryRows(connection, `SELECT \`${idCol}\` AS id FROM \`${table}\` WHERE \`${nameCol}\` = ? LIMIT 1`, [nameValue]);
  return rows[0]?.id ?? null;
}

async function resolveDepartmentByName(connection, departmentName) {
  if (!departmentName) return null;
  const rows = await queryRows(
    connection,
    'SELECT department_id AS id, department_name AS name, department_code, parent_id FROM dim_department WHERE department_name = ? AND is_enabled = 1 LIMIT 1',
    [departmentName],
  );
  return rows[0] ?? null;
}

async function resolveDepartmentChannelKeyFromDb(connection, departmentId) {
  const departments = await queryRows(connection, 'SELECT department_id, department_code, parent_id FROM dim_department');
  return resolveDepartmentChannelKey(departments, departmentId);
}

export async function resolveDepartmentChannelId(connection, departmentId) {
  const channelKey = await resolveDepartmentChannelKeyFromDb(connection, departmentId);
  if (!channelKey) return null;
  const rows = await queryRows(connection, 'SELECT channel_id AS id FROM dim_channel WHERE channel_key = ? AND is_enabled = 1 LIMIT 1', [channelKey]);
  return rows[0]?.id ?? null;
}

export async function ensureRevenueDailyColumns(connection) {
  const columns = await queryRows(
    connection,
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fact_revenue_daily' AND COLUMN_NAME IN ('department_id', 'actual_opening_count')",
  );
  const existing = new Set(columns.map((row) => row.COLUMN_NAME || row.column_name));
  if (!existing.has('department_id')) {
    await connection.execute('ALTER TABLE fact_revenue_daily ADD COLUMN department_id BIGINT NULL AFTER staff_id');
  }
  if (!existing.has('actual_opening_count')) {
    await connection.execute('ALTER TABLE fact_revenue_daily ADD COLUMN actual_opening_count INT NOT NULL DEFAULT 0 AFTER recovered_amount_yuan');
  }
}

export async function persistTarget(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];

  for (const row of rows) {
    const department = await resolveDepartmentByName(connection, String(row.department_name || '').trim());
    if (!department) {
      skipped += 1;
      errors.push({ row: null, field: 'department_name', message: `组织不存在或已停用，跳过：${row.department_name || '未填写组织名称'}` });
      continue;
    }

    const channelId = await resolveDepartmentChannelId(connection, department.id);
    const amountYuan = WAN_TO_YUAN(row.target_amount_yuan);
    const opening = Number(row.target_opening_count || 0);
    const order = Number(row.target_order_count || 0);
    const existing = await queryRows(
      connection,
      'SELECT target_id FROM biz_target_monthly WHERE `year_month` = ? AND department_id = ? AND staff_id IS NULL LIMIT 1',
      [row.target_month, department.id],
    );

    if (existing[0]?.target_id) {
      await connection.execute(
        'UPDATE biz_target_monthly SET channel_id = ?, target_amount_yuan = ?, target_opening_count = ?, target_order_count = ? WHERE target_id = ?',
        [channelId, amountYuan, opening, order, existing[0].target_id],
      );
    } else {
      const id = await nextId(connection, 'biz_target_monthly', 'target_id');
      await connection.execute(
        'INSERT INTO biz_target_monthly (target_id, `year_month`, department_id, staff_id, channel_id, target_amount_yuan, target_opening_count, target_order_count) VALUES (?, ?, ?, NULL, ?, ?, ?, ?)',
        [id, row.target_month, department.id, channelId, amountYuan, opening, order],
      );
    }
    written += 1;
  }

  return { written, skipped, createdStaff: 0, pendingNewStaff: [], errors };
}

export async function persistActual(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  await ensureRevenueDailyColumns(connection);

  for (const row of rows) {
    const department = await resolveDepartmentByName(connection, String(row.department_name || '').trim());
    if (!department) {
      skipped += 1;
      errors.push({ row: null, field: 'department_name', message: `组织不存在或已停用，跳过：${row.department_name || '未填写组织名称'}` });
      continue;
    }

    const yearMonth = String(row.actual_month || '');
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
      skipped += 1;
      errors.push({ row: null, field: 'actual_month', message: `完成月份非法，跳过：${yearMonth}` });
      continue;
    }

    const statDate = `${yearMonth}-01`;
    const channelId = await resolveDepartmentChannelId(connection, department.id);
    const recoveredYuan = WAN_TO_YUAN(row.recovered_amount_yuan);
    const opening = Number(row.actual_opening_count || 0);
    const order = Number(row.order_count || 0);
    const existing = await queryRows(
      connection,
      "SELECT id FROM fact_revenue_daily WHERE stat_date = ? AND department_id = ? AND staff_id IS NULL AND order_type = 'manual_department' LIMIT 1",
      [statDate, department.id],
    );

    if (existing[0]?.id) {
      await connection.execute(
        'UPDATE fact_revenue_daily SET channel_id = ?, recovered_amount_yuan = ?, actual_opening_count = ?, order_count = ? WHERE id = ?',
        [channelId, recoveredYuan, opening, order, existing[0].id],
      );
    } else {
      const id = await nextId(connection, 'fact_revenue_daily', 'id');
      await connection.execute(
        "INSERT INTO fact_revenue_daily (id, stat_date, department_id, channel_id, staff_id, version_id, order_type, recovered_amount_yuan, actual_opening_count, order_count) VALUES (?, ?, ?, ?, NULL, NULL, 'manual_department', ?, ?, ?)",
        [id, statDate, department.id, channelId, recoveredYuan, opening, order],
      );
    }
    written += 1;
  }

  return { written, skipped, errors };
}

async function ensureChannelCostRefundColumn(connection) {
  const rows = await queryRows(
    connection,
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_channel_cost_monthly' AND COLUMN_NAME = 'refund_amount_yuan'",
  );
  if (!rows.length) {
    await connection.execute('ALTER TABLE biz_channel_cost_monthly ADD COLUMN refund_amount_yuan DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT \'refund amount for cost maintenance\' AFTER investment_amount_yuan');
  }
}

async function persistCost(connection, rows) {
  await ensureChannelCostRefundColumn(connection);
  let written = 0;
  let skipped = 0;
  const errors = [];
  for (const row of rows) {
    const channelId = await resolveByName(connection, 'dim_channel', 'channel_name', row.channel_name, 'channel_id');
    if (!channelId) {
      skipped += 1;
      errors.push({ row: null, field: 'channel_name', message: `渠道不存在，跳过：${row.channel_name}` });
      continue;
    }
    const amountYuan = WAN_TO_YUAN(row.investment_amount_yuan);
    const refundYuan = WAN_TO_YUAN(row.refund_amount_yuan);
    const existing = await queryRows(connection, 'SELECT cost_id FROM biz_channel_cost_monthly WHERE `year_month` = ? AND channel_id = ?', [row.cost_month, channelId]);
    if (existing[0]?.cost_id) {
      await connection.execute('UPDATE biz_channel_cost_monthly SET investment_amount_yuan = ?, refund_amount_yuan = ? WHERE cost_id = ?', [amountYuan, refundYuan, existing[0].cost_id]);
    } else {
      const id = await nextId(connection, 'biz_channel_cost_monthly', 'cost_id');
      await connection.execute('INSERT INTO biz_channel_cost_monthly (cost_id, `year_month`, channel_id, investment_amount_yuan, refund_amount_yuan) VALUES (?, ?, ?, ?, ?)', [id, row.cost_month, channelId, amountYuan, refundYuan]);
    }
    written += 1;
  }
  return { written, skipped, errors };
}

async function persistOrg(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  for (const row of rows) {
    const department = await resolveDepartmentByName(connection, row.department_name);
    if (!department) {
      skipped += 1;
      errors.push({ row: null, field: 'department_name', message: `组织不存在，跳过：${row.department_name}` });
      continue;
    }
    const deptId = department.id;
    const isSales = row.is_sales ? 1 : 0;
    const isEnabled = row.is_enabled == null ? 1 : (row.is_enabled ? 1 : 0);
    const channelKey = isSales ? await resolveDepartmentChannelKeyFromDb(connection, deptId) : null;
    const existing = await queryRows(connection, 'SELECT staff_id FROM dim_staff WHERE staff_name = ?', [row.staff_name]);
    if (existing[0]?.staff_id) {
      await connection.execute(
        'UPDATE dim_staff SET department_id = ?, channel_key = ?, is_sales = ?, is_enabled = ?, external_bi_user_id = ? WHERE staff_id = ?',
        [deptId, channelKey, isSales, isEnabled, row.external_bi_user_id || null, existing[0].staff_id],
      );
    } else {
      const id = await nextId(connection, 'dim_staff', 'staff_id');
      const code = row.external_bi_user_id || `staff_${id}`;
      await connection.execute(
        'INSERT INTO dim_staff (staff_id, staff_code, staff_name, department_id, channel_key, external_bi_user_id, is_sales, is_delivery, is_success, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)',
        [id, code, row.staff_name, deptId, channelKey, row.external_bi_user_id || null, isSales, isEnabled],
      );
    }
    written += 1;
  }
  return { written, skipped, errors };
}

async function persistChannel(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  for (const row of rows) {
    const channelId = row.channel_name ? await resolveByName(connection, 'dim_channel', 'channel_name', row.channel_name, 'channel_id') : null;
    if (row.channel_name && !channelId) {
      skipped += 1;
      errors.push({ row: null, field: 'channel_name', message: `渠道大类不存在，跳过：${row.channel_name}` });
      continue;
    }
    const excluded = row.is_excluded ? 1 : 0;
    const existing = await queryRows(connection, 'SELECT source_id FROM dim_channel_source WHERE source_code = ?', [row.source_code]);
    if (existing[0]?.source_id) {
      await connection.execute(
        'UPDATE dim_channel_source SET source_name = ?, channel_id = ?, is_excluded = ? WHERE source_id = ?',
        [row.source_name, channelId, excluded, existing[0].source_id],
      );
    } else {
      const id = await nextId(connection, 'dim_channel_source', 'source_id');
      await connection.execute(
        'INSERT INTO dim_channel_source (source_id, source_code, source_name, channel_id, is_excluded) VALUES (?, ?, ?, ?, ?)',
        [id, row.source_code, row.source_name, channelId, excluded],
      );
    }
    written += 1;
  }
  return { written, skipped, errors };
}

const PERSISTERS = {
  'target-maintenance': persistTarget,
  'target-actual-import': persistActual,
  'cost-maintenance': persistCost,
  'org-maintenance': persistOrg,
  'channel-maintenance': persistChannel,
};

function validateImportRows(config, payload) {
  const { rows: incomingRows = [], rawHeaders, rawRows } = payload || {};
  let rows = [];
  let errors = [];
  let warnings = [];
  let matchedColumns = {};

  if (rawHeaders && rawRows) {
    const result = mapAndValidate(rawHeaders, rawRows, config);
    rows = result.rows;
    errors = result.errors;
    warnings = result.warnings;
    matchedColumns = result.matchedColumns;
  } else {
    rows = Array.isArray(incomingRows) ? incomingRows : [];
    rows.forEach((row, idx) => {
      const displayRowNo = idx + 2;
      for (const col of config.columns) {
        if (col.required && (row[col.field] == null || row[col.field] === '')) {
          errors.push({ row: displayRowNo, field: col.field, message: `必填列「${col.header}」为空` });
        }
      }
    });
  }

  const blockingErrors = errors.filter((e) => !e.row);
  const errorRows = new Set(errors.map((e) => e.row).filter((r) => r && r > 1));
  const acceptedRows = blockingErrors.length ? [] : rows.filter((_, idx) => !errorRows.has(idx + 2));
  return { rows, errors, warnings, matchedColumns, acceptedRows };
}

async function handleOneImportPayload(payload, options = {}) {
  const { pageKey } = payload || {};
  if (!pageKey) {
    return { pageKey: '', accepted: 0, rejected: 0, written: 0, skipped: 0, totalRows: 0, errors: [{ row: null, field: 'pageKey', message: '缺少 pageKey' }], warnings: [], matchedColumns: {}, summary: '缺少 pageKey' };
  }
  const config = getImportConfig(pageKey);
  if (!config) {
    return { pageKey, accepted: 0, rejected: 0, written: 0, skipped: 0, totalRows: 0, errors: [{ row: null, field: 'pageKey', message: `未配置的导入页：${pageKey}` }], warnings: [], matchedColumns: {}, summary: `未配置的导入页：${pageKey}` };
  }
  const validated = validateImportRows(config, payload);
  const persist = await persistImport(pageKey, validated.acceptedRows, options);
  const allErrors = [...validated.errors, ...persist.errors];
  return {
    dryRun: persist.dryRun,
    pageKey,
    accepted: validated.acceptedRows.length,
    rejected: validated.errors.length,
    written: persist.written,
    skipped: persist.skipped,
    createdStaff: persist.createdStaff ?? 0,
    pendingNewStaff: persist.pendingNewStaff ?? [],
    totalRows: validated.rows.length,
    errors: allErrors,
    warnings: validated.warnings,
    matchedColumns: Object.fromEntries(
      Object.entries(validated.matchedColumns).map(([f, v]) => [f, v?.header ?? null]),
    ),
    summary: `${persist.note} 校验通过 ${validated.acceptedRows.length} 行，拒绝 ${validated.errors.length} 行。`,
  };
}

export async function persistImport(pageKey, rows, options = {}) {
  const persister = PERSISTERS[pageKey];
  if (!persister) {
    return { dryRun: false, written: 0, skipped: rows.length, createdStaff: 0, pendingNewStaff: [], errors: [{ row: null, field: '', message: `未配置的导入页：${pageKey}` }], note: `未配置的导入页：${pageKey}` };
  }
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();
    const result = await persister(connection, rows, options);
    await connection.commit();
    return {
      dryRun: false,
      written: result.written,
      skipped: result.skipped,
      createdStaff: result.createdStaff ?? 0,
      pendingNewStaff: result.pendingNewStaff ?? [],
      errors: result.errors,
      note: `已写入 ${result.written} 行到 ${pageKey} 对应表，跳过 ${result.skipped} 行。`,
    };
  } catch (err) {
    await connection.rollback();
    return {
      dryRun: false,
      written: 0,
      skipped: rows.length,
      createdStaff: 0,
      pendingNewStaff: [],
      errors: [{ row: null, field: '', message: `写库失败已回滚：${err.message}` }],
      note: `写库失败已回滚：${err.message}`,
    };
  } finally {
    await connection.end();
  }
}

export async function handleMaintenanceImportRequest(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, 400, { error: err.message });
    return;
  }

  const { pageKey, options = {} } = body || {};
  if (Array.isArray(body?.imports)) {
    const results = [];
    for (const item of body.imports) {
      results.push(await handleOneImportPayload(item, options));
    }
    const allErrors = results.flatMap((item) => item.errors || []);
    sendJson(res, 200, {
      dryRun: false,
      pageKey: 'multi-import',
      imports: results,
      accepted: results.reduce((sum, item) => sum + (item.accepted || 0), 0),
      rejected: results.reduce((sum, item) => sum + (item.rejected || 0), 0),
      written: results.reduce((sum, item) => sum + (item.written || 0), 0),
      skipped: results.reduce((sum, item) => sum + (item.skipped || 0), 0),
      createdStaff: 0,
      pendingNewStaff: [],
      totalRows: results.reduce((sum, item) => sum + (item.totalRows || 0), 0),
      errors: allErrors,
      warnings: results.flatMap((item) => item.warnings || []),
      matchedColumns: {},
      summary: results.map((item) => `${item.pageKey}: ${item.summary}`).join('；'),
    });
    return;
  }

  if (!pageKey) {
    sendJson(res, 400, { error: '缺少 pageKey' });
    return;
  }

  const single = await handleOneImportPayload(body, options);
  sendJson(res, 200, {
    dryRun: single.dryRun,
    pageKey,
    accepted: single.accepted,
    rejected: single.rejected,
    written: single.written,
    skipped: single.skipped,
    createdStaff: single.createdStaff ?? 0,
    pendingNewStaff: single.pendingNewStaff ?? [],
    totalRows: single.totalRows,
    errors: single.errors,
    warnings: single.warnings,
    matchedColumns: single.matchedColumns,
    summary: single.summary,
  });
}
