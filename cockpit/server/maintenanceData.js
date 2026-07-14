/*
 更新时间: 2026-07-14 17:09:11 CST
 更新内容: 目标维护和成本维护统一读取 v_revenue_gross_canonical，移除销售月表覆盖和原始日报重复汇总。
*/
/*
 更新时间: 2026-07-14 10:27:00 CST
 更新内容: 数据维护读接口新增 update-monitor-maintenance，只读返回各业务数据组每日更新状态。
*/
/*
 Update time: 2026-07-13 18:53:01 CST
 Update content: Cost maintenance also reads independent marketing labor while sales labor remains derived from channel rows.
*/
/*
 Update time: 2026-07-13 16:48:56 CST
 Update content: Cost maintenance reads per-channel operations and labor costs after running the backward-compatible schema migration.
*/
/*
 Update time: 2026-07-10 17:09:42 CST
 Update content: readTarget 兼容旧库 fact_revenue_daily 缺少 department_id/actual_opening_count 的结构，读取时由 staff_id 兜底组织并把开户数按 0 处理。
*/
/*
 Update time: 2026-07-09 14:51:22 CST
 Update content: readTarget 的 biz_target_monthly 查询加 AND staff_id IS NULL,只取部门级目标,
   忽略历史人员目标行(配合目标维护页改为部门级录入)。
*/
/*
 Update time: 2026-07-09 16:20:00 CST
 Update content: Cost maintenance reads refund_amount_yuan from biz_channel_cost_monthly and auto-adds the column when old databases lack it.
*/
/*
 更新时间: 2026-07-08 19:12:00 CST
 更新内容: 渠道维护读取只展示启用渠道大类，配合渠道大类删除后的回拉隐藏。
*/
/*
 更新时间: 2026-07-08 18:58:00 CST
 更新内容: 成本维护读取只展示启用渠道，配合成本页删除渠道后的回拉隐藏。
*/
/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 目标维护读取口径继续收紧为启用销售且有部门，确保组织维护停用人员后目标页和看板分母同步排除。
*/
/*
 更新时间: 2026-07-08
 更新内容: readTarget 的 dim_staff 查询收紧为 is_sales=1 且 department_id IS NOT NULL，
          目标维护只显示「在销售组织里」的人员，无部门人员不再出现。
*/
/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: 新增数据维护读接口 GET /api/maintenance/data?page=&year=，按 pageKey 查 MySQL 并用
          maintenanceMappers 拼成与 mock 同形状的快照返回，供前端四个维护页替换 mock。
*/
import { createDbConnection, queryRows } from './db.js';
import { ensureCostSchema } from './costSchema.js';
import { buildUpdateMonitorSnapshot } from './maintenanceUpdateMonitor.js';
import {
  buildTargetSnapshot,
  buildCostSnapshot,
  buildOrgSnapshot,
  buildChannelSnapshot,
} from './maintenanceMappers.js';

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function parseYear(yearStr) {
  const y = Number(yearStr);
  if (Number.isInteger(y) && y >= 2000 && y <= 2100) return y;
  return 2026;
}

async function readTarget(connection, year) {
  const [departments, staff, targets, revenue] = await Promise.all([
    queryRows(connection, 'SELECT department_id, department_name, parent_id, is_enabled FROM dim_department'),
    queryRows(connection, 'SELECT staff_id, staff_name, department_id, is_sales, is_delivery, is_success, is_enabled, external_bi_user_id FROM dim_staff WHERE is_sales = 1 AND department_id IS NOT NULL AND is_enabled = 1'),
    queryRows(connection, "SELECT `year_month`, department_id, staff_id, target_amount_yuan, target_opening_count, target_order_count FROM biz_target_monthly WHERE `year_month` LIKE ? AND staff_id IS NULL", [`${year}-%`]),
    queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS ym,
             r.department_id,
             r.staff_id,
             SUM(r.recovered_amount_yuan) AS amt,
             SUM(r.order_count) AS deals,
             SUM(COALESCE(r.actual_opening_count, 0)) AS openings
      FROM v_revenue_gross_canonical r
      WHERE r.stat_date BETWEEN ? AND ?
      GROUP BY r.department_id, r.staff_id, ym
    `, [`${year}-01-01`, `${year}-12-31`]),
  ]);
  return buildTargetSnapshot({ departments, staff, targets, revenue });
}

async function readCost(connection, year) {
  await ensureCostSchema(connection);
  const [channels, costs, revenue, labor] = await Promise.all([
    queryRows(connection, 'SELECT channel_id, channel_name, parent_id, is_enabled FROM dim_channel WHERE is_enabled = 1'),
    queryRows(connection, 'SELECT `year_month`, channel_id, operations_amount_yuan, labor_amount_yuan, refund_amount_yuan FROM biz_channel_cost_monthly WHERE `year_month` LIKE ?', [`${year}-%`]),
    queryRows(connection, "SELECT DATE_FORMAT(stat_date, '%Y-%m') AS ym, channel_id, SUM(recovered_amount_yuan) AS amt, SUM(order_count) AS deals FROM v_revenue_gross_canonical WHERE stat_date BETWEEN ? AND ? GROUP BY channel_id, ym", [`${year}-01-01`, `${year}-12-31`]),
    queryRows(connection, "SELECT `year_month`, cost_type, amount_yuan FROM biz_labor_cost_monthly WHERE `year_month` LIKE ? AND cost_type = 'marketing'", [`${year}-%`]),
  ]);
  return buildCostSnapshot({ channels, costs, revenue, labor });
}

async function readOrg(connection) {
  const [departments, staff] = await Promise.all([
    queryRows(connection, 'SELECT department_id, department_name, parent_id, is_enabled FROM dim_department'),
    queryRows(connection, 'SELECT staff_id, staff_name, department_id, is_sales, is_delivery, is_success, is_enabled, external_bi_user_id FROM dim_staff'),
  ]);
  return buildOrgSnapshot({ departments, staff });
}

async function readChannel(connection) {
  const [channels, sources] = await Promise.all([
    queryRows(connection, 'SELECT channel_id, channel_name, parent_id, is_enabled FROM dim_channel WHERE is_enabled = 1'),
    queryRows(connection, 'SELECT source_id, source_code, source_name, channel_id, is_excluded FROM dim_channel_source'),
  ]);
  return buildChannelSnapshot({ channels, sources });
}

const READERS = {
  'update-monitor-maintenance': (conn, year) => buildUpdateMonitorSnapshot(conn, { year }),
  'target-maintenance': (conn, year) => readTarget(conn, year),
  'cost-maintenance': (conn, year) => readCost(conn, year),
  'org-maintenance': (conn) => readOrg(conn),
  'channel-maintenance': (conn) => readChannel(conn),
};

/** GET /api/maintenance/data?page=<pageKey>&year=<YYYY> */
export async function handleMaintenanceDataRequest(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const page = url.searchParams.get('page');
  const year = parseYear(url.searchParams.get('year'));
  const reader = page ? READERS[page] : null;
  if (!reader) {
    sendJson(res, 400, { error: `未配置的维护页：${page || '(空)'}` });
    return;
  }

  let connection;
  try {
    connection = await createDbConnection();
    const data = await reader(connection, year);
    sendJson(res, 200, { page, year, data });
  } catch (err) {
    if (!res.headersSent) {
      sendJson(res, 500, { error: `数据维护读接口异常：${err.message}` });
    }
  } finally {
    await connection?.end();
  }
}
