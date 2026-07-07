/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: persistImport 由空跑翻转为真写库：按 pageKey 事务 upsert 到 biz_target_monthly /
          biz_channel_cost_monthly / dim_staff / dim_channel_source，FK 不满足的行跳过不中断整体。
          金额列以"万"录入，写库时 ×10000 转元（与维护页万单位一致）。
*/
import { getImportConfig } from '../src/lib/maintenanceImportConfig.js';
import { mapAndValidate } from '../src/lib/excelImport.js';
import { createDbConnection, queryRows, nextId } from './db.js';

/** 手写读取 JSON 请求体（后端无 body-parser），限制最大 5MB 防滥用。 */
function readJsonBody(req, limitBytes = 5 * 1024 * 1024) {
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

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

const WAN_TO_YUAN = (wan) => Math.round(Number(wan || 0) * 10000);

async function resolveByName(connection, table, nameCol, nameValue, idCol) {
  if (!nameValue) return null;
  const rows = await queryRows(connection, `SELECT \`${idCol}\` AS id FROM \`${table}\` WHERE \`${nameCol}\` = ? LIMIT 1`, [nameValue]);
  return rows[0]?.id ?? null;
}

/** 目标维护：按 (year_month, staff_id) upsert biz_target_monthly。 */
async function persistTarget(connection, rows) {
  let written = 0;
  let skipped = 0;
  const errors = [];
  for (const row of rows) {
    const staffId = await resolveByName(connection, 'dim_staff', 'staff_name', row.staff_name, 'staff_id');
    if (!staffId) {
      skipped += 1;
      errors.push({ row: null, field: 'staff_name', message: `人员不存在，跳过：${row.staff_name}` });
      continue;
    }
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
  return { written, skipped, errors };
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
    const deptId = await resolveByName(connection, 'dim_department', 'department_name', row.department_name, 'department_id');
    if (!deptId) {
      skipped += 1;
      errors.push({ row: null, field: 'department_name', message: `组织不存在，跳过：${row.department_name}` });
      continue;
    }
    const isSales = row.is_sales ? 1 : 0;
    const isEnabled = row.is_enabled == null ? 1 : (row.is_enabled ? 1 : 0);
    const existing = await queryRows(connection, 'SELECT staff_id FROM dim_staff WHERE staff_name = ?', [row.staff_name]);
    if (existing[0]?.staff_id) {
      await connection.execute(
        'UPDATE dim_staff SET department_id = ?, is_sales = ?, is_enabled = ?, external_bi_user_id = ? WHERE staff_id = ?',
        [deptId, isSales, isEnabled, row.external_bi_user_id || null, existing[0].staff_id],
      );
    } else {
      const id = await nextId(connection, 'dim_staff', 'staff_id');
      const code = row.external_bi_user_id || `staff_${id}`;
      await connection.execute(
        'INSERT INTO dim_staff (staff_id, staff_code, staff_name, department_id, external_bi_user_id, is_sales, is_delivery, is_success, is_enabled) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)',
        [id, code, row.staff_name, deptId, row.external_bi_user_id || null, isSales, isEnabled],
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
 * @returns {Promise<{dryRun:boolean, written:number, skipped:number, errors:object[], note:string}>}
 */
export async function persistImport(pageKey, rows) {
  const persister = PERSISTERS[pageKey];
  if (!persister) {
    return { dryRun: false, written: 0, skipped: rows.length, errors: [{ row: null, field: '', message: `未配置的导入页：${pageKey}` }], note: `未配置的导入页：${pageKey}` };
  }
  const connection = await createDbConnection();
  try {
    await connection.beginTransaction();
    const result = await persister(connection, rows);
    await connection.commit();
    return {
      dryRun: false,
      written: result.written,
      skipped: result.skipped,
      errors: result.errors,
      note: `已写入 ${result.written} 行到 ${pageKey} 对应表，跳过 ${result.skipped} 行。`,
    };
  } catch (err) {
    await connection.rollback();
    return {
      dryRun: false,
      written: 0,
      skipped: rows.length,
      errors: [{ row: null, field: '', message: `写库失败已回滚：${err.message}` }],
      note: `写库失败已回滚：${err.message}`,
    };
  } finally {
    await connection.end();
  }
}

/**
 * POST /api/maintenance/import
 * 请求体：{ pageKey, rows, rawHeaders, rawRows, meta }
 * 响应：{ dryRun, pageKey, accepted, rejected, written, skipped, errors, warnings, summary }
 */
export async function handleMaintenanceImportRequest(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, 400, { error: err.message });
    return;
  }

  const { pageKey, rows: incomingRows = [], rawHeaders, rawRows } = body || {};
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

  const errorRows = new Set(errors.map((e) => e.row).filter((r) => r));
  const acceptedRows = rows.filter((_, idx) => !errorRows.has(idx + 2));

  const persist = await persistImport(pageKey, acceptedRows);
  const allErrors = [...errors, ...persist.errors];

  sendJson(res, 200, {
    dryRun: persist.dryRun,
    pageKey,
    accepted: acceptedRows.length,
    rejected: errors.length,
    written: persist.written,
    skipped: persist.skipped,
    totalRows: rows.length,
    errors: allErrors,
    warnings,
    matchedColumns: Object.fromEntries(
      Object.entries(matchedColumns).map(([f, v]) => [f, v?.header ?? null]),
    ),
    summary: `${persist.note} 校验通过 ${acceptedRows.length} 行，拒绝 ${errors.length} 行。`,
  });
}
