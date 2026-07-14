/*
 Update time: 2026-07-14 10:13:00 CST
 Update content: Cover duplicate-column races during concurrent cost schema migration.
*/
/*
 Update time: 2026-07-13 16:48:56 CST
 Update content: Cover the cost schema migration from legacy investment cost to operations cost, including natural unique keys and auto-increment primary keys.
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import { ensureCostSchema } from './costSchema.js';

function makeLegacyConnection() {
  const execs = [];
  const connection = {
    async execute(sql, params = []) {
      const normalized = String(sql).trim();
      if (/^SELECT/i.test(normalized)) {
        if (normalized.includes('INFORMATION_SCHEMA.COLUMNS') && params[0] === 'biz_channel_cost_monthly') {
          if (params[1] === 'investment_amount_yuan') return [[{ COLUMN_NAME: params[1], EXTRA: '' }]];
          if (params[1] === 'cost_id') return [[{ COLUMN_NAME: params[1], EXTRA: '' }]];
          return [[]];
        }
        if (normalized.includes('INFORMATION_SCHEMA.COLUMNS') && params[0] === 'biz_labor_cost_monthly') {
          if (params[1] === 'labor_cost_id') return [[{ COLUMN_NAME: params[1], EXTRA: '' }]];
          return [[]];
        }
        if (normalized.includes('INFORMATION_SCHEMA.STATISTICS')) return [[]];
        return [[]];
      }
      execs.push({ sql: normalized, params });
      return [{}];
    },
  };
  return { connection, execs };
}

test('ensureCostSchema migrates legacy cost columns and enforces business keys', async () => {
  const { connection, execs } = makeLegacyConnection();

  await ensureCostSchema(connection);

  assert.ok(execs.some((entry) => /ADD COLUMN operations_amount_yuan DECIMAL\(18,2\)/.test(entry.sql)));
  assert.ok(execs.some((entry) => /ADD COLUMN labor_amount_yuan DECIMAL\(18,2\) NULL DEFAULT NULL/.test(entry.sql)));
  assert.ok(execs.some((entry) => /SET operations_amount_yuan = investment_amount_yuan/.test(entry.sql)));
  assert.ok(execs.some((entry) => /ADD COLUMN refund_amount_yuan DECIMAL\(18,2\)/.test(entry.sql)));
  assert.ok(execs.some((entry) => /DELETE older[\s\S]*older\.cost_id < newer\.cost_id/.test(entry.sql)));
  assert.ok(execs.some((entry) => /ADD UNIQUE KEY uq_channel_cost_month \(`year_month`, channel_id\)/.test(entry.sql)));
  assert.ok(execs.some((entry) => /ADD UNIQUE KEY uq_labor_cost_month_type \(`year_month`, cost_type\)/.test(entry.sql)));
  assert.ok(execs.some((entry) => /MODIFY cost_id BIGINT NOT NULL AUTO_INCREMENT/.test(entry.sql)));
  assert.ok(execs.some((entry) => /MODIFY labor_cost_id BIGINT NOT NULL AUTO_INCREMENT/.test(entry.sql)));
});

test('ensureCostSchema normalizes an earlier non-null labor column for legacy fallback', async () => {
  const { connection, execs } = makeLegacyConnection();
  const originalExecute = connection.execute;
  connection.execute = async (sql, params = []) => {
    const normalized = String(sql).trim();
    if (/^SELECT/i.test(normalized)
      && normalized.includes('INFORMATION_SCHEMA.COLUMNS')
      && params[0] === 'biz_channel_cost_monthly'
      && params[1] === 'labor_amount_yuan') {
      return [[{ COLUMN_NAME: 'labor_amount_yuan', EXTRA: '', IS_NULLABLE: 'NO' }]];
    }
    return originalExecute.call(connection, sql, params);
  };

  await ensureCostSchema(connection);

  assert.ok(execs.some((entry) => /MODIFY labor_amount_yuan DECIMAL\(18,2\) NULL DEFAULT NULL/.test(entry.sql)));
  assert.ok(execs.some((entry) => /SET labor_amount_yuan = NULL WHERE labor_amount_yuan = 0/.test(entry.sql)));
});

test('ensureCostSchema keeps going when a concurrent migration already added a column', async () => {
  const { connection, execs } = makeLegacyConnection();
  const originalExecute = connection.execute;
  connection.execute = async (sql, params = []) => {
    const normalized = String(sql).trim();
    if (/ADD COLUMN operations_amount_yuan/i.test(normalized)) {
      const err = new Error("Duplicate column name 'operations_amount_yuan'");
      err.code = 'ER_DUP_FIELDNAME';
      err.errno = 1060;
      throw err;
    }
    return originalExecute.call(connection, sql, params);
  };

  await ensureCostSchema(connection);

  assert.ok(execs.some((entry) => /ADD COLUMN labor_amount_yuan DECIMAL\(18,2\) NULL DEFAULT NULL/.test(entry.sql)));
  assert.ok(execs.some((entry) => /ADD UNIQUE KEY uq_channel_cost_month \(`year_month`, channel_id\)/.test(entry.sql)));
});
