/*
 更新时间: 2026-07-08 16:37:08 CST
 更新内容: 目标导入和组织导入新增/调整销售人员时，按所属组织编码自动写入 dim_staff.channel_key。
*/
/*
 更新时间: 2026-07-08 13:05:31 CST
 更新内容: 目标导入遇到陌生员工时先返回“是否新增员工”确认项；确认后自动新增启用销售员工到所属组织，再继续写入目标。
*/
/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 目标导入新增 is_enabled 校验，只有启用销售且有部门、部门名一致的人员才能写入目标。
*/
/*
 更新时间: 2026-07-08
 更新内容: persistTarget 收紧口径：人员须 is_sales=1 且有部门，且 Excel「所属组织」与实际部门一致才写入；
          无部门/非销售/部门不符的行 skipped 并给出明确原因。新增 resolveTargetStaff 连带取部门信息。
          同时修复 handleMaintenanceImportRequest 整列必填缺失(row:0)被 filter 误丢、仍写库的 bug：
          row:0/null 视为整文件阻断，有则 acceptedRows 为空，一行都不写。
*/
/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: persistImport 由空跑翻转为真写库：按 pageKey 事务 upsert 到 biz_target_monthly /
          biz_channel_cost_monthly / dim_staff / dim_channel_source，FK 不满足的行跳过不中断整体。
          金额列以"万"录入，写库时 ×10000 转元（与维护页万单位一致）。
*/
/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: 将 WAN_TO_YUAN / readJsonBody / sendJson 标记为 export，供页内编辑保存接口
          (maintenanceSave.js) 复用同一份万→元换算与 JSON 读取/响应逻辑，避免两处口径漂移。
*/
import { getImportConfig } from '../src/lib/maintenanceImportConfig.js';
import { mapAndValidate } from '../src/lib/excelImport.js';
import { createDbConnection, queryRows, nextId } from './db.js';
import { resolveDepartmentChannelKey } from './departmentChannel.js';

/** 手写读取 JSON 请求体（后端无 body-parser），限制最大 5MB 防滥用。 */
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

/**
 * 目标导入专用：按姓名解析人员，连带取 is_sales / department_id / department_name。
 * 用于校验「人员必须是销售且有部门，且 Excel 写的部门与实际部门一致」。
 */
async function resolveTargetStaff(connection, staffName) {
  const rows = await queryRows(
    connection,
    'SELECT s.staff_id AS id, s.is_sales AS is_sales, s.is_enabled AS is_enabled, s.department_id AS department_id, d.department_name AS department_name FROM dim_staff s LEFT JOIN dim_department d ON d.department_id = s.department_id WHERE s.staff_name = ? LIMIT 1',
    [staffName],
  );
  return rows[0] ?? null;
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

function makePendingNewStaff(row) {
  const staffName = String(row.staff_name || '').trim();
  const departmentName = String(row.department_name || '').trim();
  return {
    staff_name: staffName,
    department_name: departmentName,
    message: `员工「${staffName}」并不在「${departmentName || '未填写组织'}」组织里，是否新增员工？`,
  };
}

async function createTargetStaff(connection, row, department) {
  const id = await nextId(connection, 'dim_staff', 'staff_id');
  const code = `staff_${id}`;
  const channelKey = await resolveDepartmentChannelKeyFromDb(connection, department.id);
  await connection.execute(
    'INSERT INTO dim_staff (staff_id, staff_code, staff_name, department_id, channel_key, external_bi_user_id, is_sales, is_delivery, is_success, is_enabled) VALUES (?, ?, ?, ?, ?, ?, 1, 0, 0, 1)',
    [id, code, row.staff_name, department.id, channelKey, null],
  );
  return {
    id,
    is_sales: 1,
    is_enabled: 1,
    department_id: department.id,
    department_name: department.name,
    channel_key: channelKey,
  };
}

/** 目标维护：按 (year_month, staff_id) upsert biz_target_monthly。人员须 is_sales=1 且有部门，且 Excel 部门须与实际一致。 */
export async function persistTarget(connection, rows, options = {}) {
  let written = 0;
  let skipped = 0;
  let createdStaff = 0;
  const errors = [];
  const pendingNewStaff = [];
  const createMissingStaff = options.createMissingStaff === true;
  for (const row of rows) {
    let staff = await resolveTargetStaff(connection, row.staff_name);
    if (!staff) {
      skipped += 1;
      if (!createMissingStaff) {
        pendingNewStaff.push(makePendingNewStaff(row));
        continue;
      }
      const claimedDepartment = String(row.department_name || '').trim();
      const department = await resolveDepartmentByName(connection, claimedDepartment);
      if (!department) {
        errors.push({ row: null, field: 'department_name', message: `组织不存在，无法新增员工「${row.staff_name}」：${claimedDepartment || '未填写组织'}` });
        continue;
      }
      staff = await createTargetStaff(connection, row, department);
      createdStaff += 1;
      skipped -= 1;
    }
    if (Number(staff.is_sales) !== 1) {
      skipped += 1;
      errors.push({ row: null, field: 'staff_name', message: `${row.staff_name} 不是销售，无法导入目标。请先在组织维护页将其设为销售` });
      continue;
    }
    if (staff.department_id == null) {
      skipped += 1;
      errors.push({ row: null, field: 'department_name', message: `${row.staff_name} 无所属组织，无法导入目标。请先在组织维护页分配部门` });
      continue;
    }
    if (Number(staff.is_enabled) !== 1) {
      skipped += 1;
      errors.push({ row: null, field: 'staff_name', message: `${row.staff_name} 已停用，无法导入目标。请先在组织维护页启用该人员` });
      continue;
    }
    const claimed = String(row.department_name || '').trim();
    const actual = staff.department_name ? String(staff.department_name).trim() : '';
    if (claimed && actual && claimed !== actual) {
      skipped += 1;
      errors.push({ row: null, field: 'department_name', message: `${row.staff_name} 不属于「${claimed}」，实际属于「${actual}」，跳过` });
      continue;
    }
    const staffId = staff.id;
    const existing = await queryRows(connection, 'SELECT target_id FROM biz_target_monthly WHERE `year_month` = ? AND staff_id = ?', [row.target_month, staffId]);
    const amountYuan = WAN_TO_YUAN(row.target_amount_yuan);
    const opening = Number(row.target_opening_count || 0);
    const order = Number(row.target_order_count || 0);
    if (existing[0]?.target_id) {
      await connection.execute(
        'UPDATE biz_target_monthly SET target_amount_yuan = ?, target_opening_count = ?, target_order_count = ? WHERE target_id = ?',
        [amountYuan, opening, order, existing[0].target_id],
      );
    } else {
      const id = await nextId(connection, 'biz_target_monthly', 'target_id');
      await connection.execute(
        'INSERT INTO biz_target_monthly (target_id, `year_month`, staff_id, target_amount_yuan, target_opening_count, target_order_count) VALUES (?, ?, ?, ?, ?, ?)',
        [id, row.target_month, staffId, amountYuan, opening, order],
      );
    }
    written += 1;
  }
  return { written, skipped, createdStaff, pendingNewStaff, errors };
}

/** 成本维护：按 (year_month, channel_id) upsert biz_channel_cost_monthly。 */
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
    const amountYuan = WAN_TO_YUAN(row.investment_amount_yuan);
    const existing = await queryRows(connection, 'SELECT cost_id FROM biz_channel_cost_monthly WHERE `year_month` = ? AND channel_id = ?', [row.cost_month, channelId]);
    if (existing[0]?.cost_id) {
      await connection.execute('UPDATE biz_channel_cost_monthly SET investment_amount_yuan = ? WHERE cost_id = ?', [amountYuan, existing[0].cost_id]);
    } else {
      const id = await nextId(connection, 'biz_channel_cost_monthly', 'cost_id');
      await connection.execute('INSERT INTO biz_channel_cost_monthly (cost_id, `year_month`, channel_id, investment_amount_yuan) VALUES (?, ?, ?, ?)', [id, row.cost_month, channelId, amountYuan]);
    }
    written += 1;
  }
  return { written, skipped, errors };
}

/** 组织维护：按 staff_name upsert dim_staff。 */
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

/** 渠道维护：按 source_code upsert dim_channel_source。 */
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
  'cost-maintenance': persistCost,
  'org-maintenance': persistOrg,
  'channel-maintenance': persistChannel,
};

/**
 * 真写库钩子：事务 upsert 校验通过的 rows 到对应表，FK 不满足的行跳过不中断。
 * @returns {Promise<{dryRun:boolean, written:number, skipped:number, createdStaff:number, pendingNewStaff:object[], errors:object[], note:string}>}
 */
export async function persistImport(pageKey, rows, options = {}) {
  const persister = PERSISTERS[pageKey];
  if (!persister) {
    return { dryRun: false, written: 0, skipped: rows.length, createdStaff: 0, pendingNewStaff: [], errors: [{ row: null, field: '', message: `未配置的导入页：${pageKey}` }], note: `未配置的导入页：${pageKey}` };
  }
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();
    const result = await persister(connection, rows, pageKey === 'target-maintenance' ? {
      createMissingStaff: options.createMissingTargetStaff === true,
    } : {});
    await connection.commit();
    const createdStaff = result.createdStaff ?? 0;
    const pendingNewStaff = result.pendingNewStaff ?? [];
    const pendingNote = pendingNewStaff.length ? ` 待确认新增员工 ${pendingNewStaff.length} 人。` : '';
    const createdNote = createdStaff ? ` 新增员工 ${createdStaff} 人。` : '';
    return {
      dryRun: false,
      written: result.written,
      skipped: result.skipped,
      createdStaff,
      pendingNewStaff,
      errors: result.errors,
      note: `已写入 ${result.written} 行到 ${pageKey} 对应表，跳过 ${result.skipped} 行。${createdNote}${pendingNote}`,
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

/**
 * POST /api/maintenance/import
 * 请求体：{ pageKey, rows, rawHeaders, rawRows, meta, options }
 * 响应：{ dryRun, pageKey, accepted, rejected, written, skipped, createdStaff, pendingNewStaff, errors, warnings, summary }
 */
export async function handleMaintenanceImportRequest(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, 400, { error: err.message });
    return;
  }

  const { pageKey, rows: incomingRows = [], rawHeaders, rawRows, options = {} } = body || {};
  if (!pageKey) {
    sendJson(res, 400, { error: '缺少 pageKey' });
    return;
  }

  const config = getImportConfig(pageKey);
  if (!config) {
    sendJson(res, 400, { error: `未配置的导入页：${pageKey}` });
    return;
  }

  // 服务端再校验
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
          errors.push({ row: displayRowNo, field: col.field, message: `必填列【${col.header}】为空` });
        }
      }
    });
  }

  // row:0/null 的错误是整文件级阻断（如必填列整列缺失），有则一行都不写；
  // row>=2 的错误是行级阻断，只剔除对应行。
  const blockingErrors = errors.filter((e) => !e.row);
  const errorRows = new Set(errors.map((e) => e.row).filter((r) => r && r > 1));
  const acceptedRows = blockingErrors.length ? [] : rows.filter((_, idx) => !errorRows.has(idx + 2));

  const persist = await persistImport(pageKey, acceptedRows, options);
  const allErrors = [...errors, ...persist.errors];

  sendJson(res, 200, {
    dryRun: persist.dryRun,
    pageKey,
    accepted: acceptedRows.length,
    rejected: errors.length,
    written: persist.written,
    skipped: persist.skipped,
    createdStaff: persist.createdStaff ?? 0,
    pendingNewStaff: persist.pendingNewStaff ?? [],
    totalRows: rows.length,
    errors: allErrors,
    warnings,
    matchedColumns: Object.fromEntries(
      Object.entries(matchedColumns).map(([f, v]) => [f, v?.header ?? null]),
    ),
    summary: `${persist.note} 校验通过 ${acceptedRows.length} 行，拒绝 ${errors.length} 行。`,
  });
}
