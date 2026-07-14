/*
 Update time: 2026-07-14 10:13:00 CST
 Update content: Make cost schema migration idempotent under concurrent startup requests by tolerating already-created columns and indexes.
*/
/*
 Update time: 2026-07-13 16:48:56 CST
 Update content: Store operations and labor costs together per channel-month, preserving legacy operations values and enforcing atomic business keys.
*/
import { queryRows } from './db.js';

async function readColumn(connection, tableName, columnName) {
  const rows = await queryRows(
    connection,
    'SELECT COLUMN_NAME, EXTRA, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
    [tableName, columnName],
  );
  return rows[0] ?? null;
}

async function hasIndex(connection, tableName, indexName) {
  const rows = await queryRows(
    connection,
    'SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1',
    [tableName, indexName],
  );
  return rows.length > 0;
}

function isDuplicateColumnError(err) {
  return err?.code === 'ER_DUP_FIELDNAME'
    || err?.errno === 1060
    || /Duplicate column name/i.test(String(err?.message || ''));
}

function isDuplicateIndexError(err) {
  return err?.code === 'ER_DUP_KEYNAME'
    || err?.errno === 1061
    || /Duplicate key name/i.test(String(err?.message || ''));
}

async function addColumnIfStillMissing(connection, sql) {
  try {
    await connection.execute(sql);
    return true;
  } catch (err) {
    if (isDuplicateColumnError(err)) return false;
    throw err;
  }
}

async function addIndexIfStillMissing(connection, sql) {
  try {
    await connection.execute(sql);
    return true;
  } catch (err) {
    if (isDuplicateIndexError(err)) return false;
    throw err;
  }
}

/**
 * 成本表兼容迁移：
 * - 旧 investment_amount_yuan 只用于首次回填 operations_amount_yuan；旧无渠道人力成本不自动均摊；
 * - 同一业务键若已有重复行，保留主键最大的最新行；
 * - 业务唯一键配合 INSERT ... ON DUPLICATE KEY UPDATE，避免先查后写竞态。
 */
export async function ensureCostSchema(connection) {
  const operationsColumn = await readColumn(connection, 'biz_channel_cost_monthly', 'operations_amount_yuan');
  if (!operationsColumn) {
    const addedOperationsColumn = await addColumnIfStillMissing(
      connection,
      "ALTER TABLE biz_channel_cost_monthly ADD COLUMN operations_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '运营成本；按月按渠道维护' AFTER channel_id",
    );
    const legacyInvestmentColumn = await readColumn(connection, 'biz_channel_cost_monthly', 'investment_amount_yuan');
    if (addedOperationsColumn && legacyInvestmentColumn) {
      await connection.execute('UPDATE biz_channel_cost_monthly SET operations_amount_yuan = investment_amount_yuan');
    }
  }

  const laborColumn = await readColumn(connection, 'biz_channel_cost_monthly', 'labor_amount_yuan');
  if (!laborColumn) {
    await addColumnIfStillMissing(
      connection,
      "ALTER TABLE biz_channel_cost_monthly ADD COLUMN labor_amount_yuan DECIMAL(18,2) NULL DEFAULT NULL COMMENT '人力成本；按月按渠道维护，NULL 表示尚未迁移' AFTER operations_amount_yuan",
    );
  } else if (laborColumn.IS_NULLABLE !== 'YES') {
    await connection.execute(
      "ALTER TABLE biz_channel_cost_monthly MODIFY labor_amount_yuan DECIMAL(18,2) NULL DEFAULT NULL COMMENT '人力成本；按月按渠道维护，NULL 表示尚未迁移'",
    );
    await connection.execute('UPDATE biz_channel_cost_monthly SET labor_amount_yuan = NULL WHERE labor_amount_yuan = 0');
  }

  const refundColumn = await readColumn(connection, 'biz_channel_cost_monthly', 'refund_amount_yuan');
  if (!refundColumn) {
    await addColumnIfStillMissing(
      connection,
      "ALTER TABLE biz_channel_cost_monthly ADD COLUMN refund_amount_yuan DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '退款金额；用于净回款' AFTER labor_amount_yuan",
    );
  }

  if (!await hasIndex(connection, 'biz_channel_cost_monthly', 'uq_channel_cost_month')) {
    await connection.execute(`
      DELETE older
      FROM biz_channel_cost_monthly older
      JOIN biz_channel_cost_monthly newer
        ON newer.\`year_month\` = older.\`year_month\`
       AND newer.channel_id = older.channel_id
       AND older.cost_id < newer.cost_id
    `);
    await addIndexIfStillMissing(connection, 'ALTER TABLE biz_channel_cost_monthly ADD UNIQUE KEY uq_channel_cost_month (`year_month`, channel_id)');
  }

  if (!await hasIndex(connection, 'biz_labor_cost_monthly', 'uq_labor_cost_month_type')) {
    await connection.execute(`
      DELETE older
      FROM biz_labor_cost_monthly older
      JOIN biz_labor_cost_monthly newer
        ON newer.\`year_month\` = older.\`year_month\`
       AND newer.cost_type = older.cost_type
       AND older.labor_cost_id < newer.labor_cost_id
    `);
    await addIndexIfStillMissing(connection, 'ALTER TABLE biz_labor_cost_monthly ADD UNIQUE KEY uq_labor_cost_month_type (`year_month`, cost_type)');
  }

  const channelIdColumn = await readColumn(connection, 'biz_channel_cost_monthly', 'cost_id');
  if (!String(channelIdColumn?.EXTRA || '').includes('auto_increment')) {
    await connection.execute("ALTER TABLE biz_channel_cost_monthly MODIFY cost_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '成本ID'");
  }

  const laborIdColumn = await readColumn(connection, 'biz_labor_cost_monthly', 'labor_cost_id');
  if (!String(laborIdColumn?.EXTRA || '').includes('auto_increment')) {
    await connection.execute("ALTER TABLE biz_labor_cost_monthly MODIFY labor_cost_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '人力成本ID'");
  }
}
