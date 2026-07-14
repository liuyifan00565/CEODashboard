/*
 Update time: 2026-07-14 17:57:02 CST
 Update content: Skip actual revenue imports when the organization cannot map to one enabled channel, preventing NULL-channel monthly overrides.
*/
/*
 Update time: 2026-07-14 17:09:11 CST
 Update content: Maintenance imports rely on database auto-increment keys and persist department monthly actuals to the dedicated override table.
*/
/*
 Update time: 2026-07-13 16:48:56 CST
 Update content: Cost import writes per-channel operations and labor costs through one atomic monthly-channel upsert.
*/
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
import { createDbConnection, queryRows } from './db.js';
import { ensureCostSchema } from './costSchema.js';
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
    await connection.execute(
      `INSERT INTO biz_target_monthly
         (\`year_month\`, department_id, staff_id, channel_id, target_amount_yuan, target_opening_count, target_order_count)
       VALUES (?, ?, NULL, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         channel_id = VALUES(channel_id),
         target_amount_yuan = VALUES(target_amount_yuan),
         target_opening_count = VALUES(target_opening_count),
         target_order_count = VALUES(target_order_count)`,
      [row.target_month, department.id, channelId, amountYuan, opening, order],
    );
    written += 1;
  }

  return { written, skipped, createdStaff: 0, pendingNewStaff: [], errors };
}

export async function persistActual(connection, rows) {
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

    const yearMonth = String(row.actual_month || '');
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
      skipped += 1;
      errors.push({ row: null, field: 'actual_month', message: `完成月份非法，跳过：${yearMonth}` });
      continue;
    }

    const channelId = await resolveDepartmentChannelId(connection, department.id);
    if (channelId == null) {
      skipped += 1;
      errors.push({
        row: null,
        field: 'department_name',
        message: `组织无法唯一映射到启用经营渠道，实际回款未导入：${department.name || row.department_name}`,
      });
      continue;
    }
    const recoveredYuan = WAN_TO_YUAN(row.recovered_amount_yuan);
    const opening = Number(row.actual_opening_count || 0);
    const order = Number(row.order_count || 0);
    await connection.execute(
      `INSERT INTO fact_revenue_monthly_override
         (\`year_month\`, department_id, channel_id, recovered_amount_yuan, actual_opening_count, order_count)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         channel_id = VALUES(channel_id),
         recovered_amount_yuan = VALUES(recovered_amount_yuan),
         actual_opening_count = VALUES(actual_opening_count),
         order_count = VALUES(order_count)`,
      [yearMonth, department.id, channelId, recoveredYuan, opening, order],
    );
    written += 1;
  }

  return { written, skipped, errors };
}

async function persistCost(connection, rows) {
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
    const amountYuan = WAN_TO_YUAN(row.operations_amount_wan);
    const laborYuan = row.labor_amount_wan == null ? null : WAN_TO_YUAN(row.labor_amount_wan);
    const refundYuan = WAN_TO_YUAN(row.refund_amount_yuan);
    await connection.execute(
      `INSERT INTO biz_channel_cost_monthly (\`year_month\`, channel_id, operations_amount_yuan, labor_amount_yuan, refund_amount_yuan)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE operations_amount_yuan = VALUES(operations_amount_yuan), labor_amount_yuan = VALUES(labor_amount_yuan), refund_amount_yuan = VALUES(refund_amount_yuan)`,
      [row.cost_month, channelId, amountYuan, laborYuan, refundYuan],
    );
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
      await connection.execute(
        "INSERT INTO dim_staff (staff_code, staff_name, department_id, channel_key, external_bi_user_id, is_sales, is_delivery, is_success, is_enabled) VALUES (COALESCE(NULLIF(?, ''), CONCAT('staff_', REPLACE(UUID(), '-', ''))), ?, ?, ?, ?, ?, 0, 0, ?)",
        [row.external_bi_user_id || null, row.staff_name, deptId, channelKey, row.external_bi_user_id || null, isSales, isEnabled],
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
    await connection.execute(
      `INSERT INTO dim_channel_source (source_code, source_name, channel_id, is_excluded)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         source_name = VALUES(source_name),
         channel_id = VALUES(channel_id),
         is_excluded = VALUES(is_excluded)`,
      [row.source_code, row.source_name, channelId, excluded],
    );
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
    if (pageKey === 'cost-maintenance') await ensureCostSchema(connection);
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
