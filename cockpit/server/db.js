/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: 新增共享 DB 工具模块（dbConfigFromEnv/createDbConnection/queryRows），
          供 maintenanceData 读接口与 maintenanceImport 写接口复用；不改动 dashboardData.js。
*/
import mysql from 'mysql2/promise';

const DB_DEFAULTS = { host: '127.0.0.1', port: 3306, database: 'ceo_dashboard' };

/** 从环境变量读 DB 配置，与 dashboardData.js 的 dbConfigFromEnv 同逻辑。 */
export function dbConfigFromEnv() {
  return {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || DB_DEFAULTS.host,
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || DB_DEFAULTS.port),
    user: process.env.DB_USERNAME || process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DATABASE_NAME || DB_DEFAULTS.database,
    charset: 'utf8mb4',
    dateStrings: true,
  };
}

/** 每请求一个连接（与现有 dashboardData.js 一致）。 */
export function createDbConnection() {
  return mysql.createConnection(dbConfigFromEnv());
}

/** 执行参数化查询，返回行数组。 */
export async function queryRows(connection, sql, params = []) {
  const [rows] = await connection.execute(sql, params);
  return rows;
}

/** 取某表主键最大值+1，用于无自增的 bigint 主键新行。 */
export async function nextId(connection, table, idColumn) {
  const rows = await queryRows(connection, `SELECT COALESCE(MAX(\`${idColumn}\`), 0) + 1 AS nextId FROM \`${table}\``);
  return Number(rows[0]?.nextId ?? 1);
}
