/*
 更新时间: 2026-07-07 10:00:00 CST
 更新内容: 新增数据维护 Excel 导入后端空跑接口 POST /api/maintenance/import，
          读取前端解析后的 JSON 行，按共享配置做服务端再校验并回显汇总，不写库；
          persistImport 为后续接通 MySQL 的唯一钩子（当前空跑）。
*/
import { getImportConfig } from '../src/lib/maintenanceImportConfig.js';
import { mapAndValidate } from '../src/lib/excelImport.js';

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

/**
 * 后续接通真实落库的唯一钩子。
 * TODO(业务确认后)：按 pageKey 把校验通过的 rows 写入对应 MySQL 表
 *   （biz_target_monthly / biz_channel_cost_monthly / dim_staff / dim_channel_source）。
 * 目前空跑，只回显将写入的内容，不执行任何 SQL。
 * @returns {Promise<{dryRun:boolean, note:string}>}
 */
export async function persistImport(pageKey, rows) {
  return {
    dryRun: true,
    note: `未接通真实落库：将写入 ${rows.length} 行到 ${pageKey} 对应表，待业务确认表结构后在 persistImport 内实现 SQL。`,
  };
}

/**
 * POST /api/maintenance/import
 * 请求体：{ pageKey: string, rows: object[], meta?: { sheetName?: string } }
 *   - rows 为前端解析+映射后的字段对象数组（已含表头信息时也可重传 rawHeaders/rawRows 走服务端再校验）。
 * 响应：{ dryRun, accepted, rejected, errors, warnings, summary }
 * 行为：空跑校验，不写库。
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

  // 服务端再校验：优先用前端传来的 rawHeaders/rawRows 重跑完整 mapAndValidate（信不过客户端）。
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
    // 退化路径：前端只传 mapped rows，则做最小必填校验
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

  const rejected = errors.length;
  // accepted = rows 中未出现 error 的行数（按 Excel 行号）
  const errorRows = new Set(errors.map((e) => e.row));
  const acceptedCount = rows.filter((_, idx) => !errorRows.has(idx + 2)).length;

  const persist = await persistImport(pageKey, rows);

  sendJson(res, 200, {
    dryRun: persist.dryRun,
    pageKey,
    accepted: acceptedCount,
    rejected,
    totalRows: rows.length,
    errors,
    warnings,
    matchedColumns: Object.fromEntries(
      Object.entries(matchedColumns).map(([f, v]) => [f, v?.header ?? null]),
    ),
    summary: `${persist.note} 校验通过 ${acceptedCount} 行，拒绝 ${rejected} 行，共 ${rows.length} 行。`,
  });
}
