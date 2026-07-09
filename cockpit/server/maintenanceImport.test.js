import assert from 'node:assert/strict';
import test from 'node:test';

import { persistTarget, persistActual } from './maintenanceImport.js';

function makeConn(selectFn) {
  const execs = [];
  const conn = {
    async execute(sql, params = []) {
      const normalized = String(sql).trim();
      if (/^SELECT/i.test(normalized)) {
        const rows = selectFn ? selectFn(normalized, params) : [];
        return [rows];
      }
      execs.push({ sql: normalized, params });
      return [{}];
    },
  };
  return { conn, execs };
}

const targetRow = {
  department_name: '线上销售部',
  target_month: '2026-07',
  target_amount_yuan: 100,
  target_opening_count: 10,
  target_order_count: 20,
};

test('persistTarget inserts organization target into biz_target_monthly', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('FROM dim_department WHERE department_name')) return [{ id: 1002, name: '线上销售部', department_code: 'online-sales', parent_id: 1001 }];
    if (sql.includes('SELECT department_id, department_code, parent_id FROM dim_department')) {
      return [
        { department_id: 1001, department_code: 'headquarters', parent_id: null },
        { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
      ];
    }
    if (sql.includes('FROM dim_channel')) return [{ id: 3001 }];
    if (sql.includes('FROM biz_target_monthly') && !sql.includes('COALESCE')) return [];
    if (sql.includes('COALESCE(MAX') && sql.includes('FROM `biz_target_monthly`')) return [{ nextId: 9001 }];
    return [];
  });

  const result = await persistTarget(conn, [targetRow]);

  assert.equal(result.written, 1);
  assert.equal(result.skipped, 0);
  assert.deepEqual(result.pendingNewStaff, []);
  assert.deepEqual(result.errors, []);

  const insert = execs.find((e) => e.sql.startsWith('INSERT INTO biz_target_monthly'));
  assert.ok(insert);
  assert.deepEqual(insert.params, [9001, '2026-07', 1002, 3001, 1000000, 10, 20]);
});

test('persistTarget rejects unknown organization', async () => {
  const { conn, execs } = makeConn(() => []);

  const result = await persistTarget(conn, [targetRow]);

  assert.equal(result.written, 0);
  assert.equal(result.skipped, 1);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].field, 'department_name');
  assert.equal(execs.length, 0);
});

test('persistActual inserts organization actual completion into fact_revenue_daily', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('INFORMATION_SCHEMA.COLUMNS')) {
      return [{ COLUMN_NAME: 'department_id' }, { COLUMN_NAME: 'actual_opening_count' }];
    }
    if (sql.includes('FROM dim_department WHERE department_name')) return [{ id: 1002, name: '线上销售部', department_code: 'online-sales', parent_id: 1001 }];
    if (sql.includes('SELECT department_id, department_code, parent_id FROM dim_department')) {
      return [
        { department_id: 1001, department_code: 'headquarters', parent_id: null },
        { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
      ];
    }
    if (sql.includes('FROM dim_channel')) return [{ id: 3001 }];
    if (sql.includes('FROM fact_revenue_daily') && !sql.includes('COALESCE')) return [];
    if (sql.includes('COALESCE(MAX') && sql.includes('FROM `fact_revenue_daily`')) return [{ nextId: 8001 }];
    return [];
  });

  const result = await persistActual(conn, [{
    department_name: '线上销售部',
    actual_month: '2026-07',
    recovered_amount_yuan: 88.5,
    actual_opening_count: 7,
    order_count: 12,
  }]);

  assert.equal(result.written, 1);
  assert.equal(result.skipped, 0);
  assert.deepEqual(result.errors, []);

  const insert = execs.find((e) => e.sql.startsWith('INSERT INTO fact_revenue_daily'));
  assert.ok(insert);
  assert.deepEqual(insert.params, [8001, '2026-07-01', 1002, 3001, 885000, 7, 12]);
});

test('persistActual adds missing organization actual columns before writing', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('INFORMATION_SCHEMA.COLUMNS')) return [];
    if (sql.includes('FROM dim_department WHERE department_name')) return [{ id: 1002, name: '线上销售部', department_code: 'online-sales', parent_id: 1001 }];
    if (sql.includes('SELECT department_id, department_code, parent_id FROM dim_department')) return [];
    if (sql.includes('FROM fact_revenue_daily') && !sql.includes('COALESCE')) return [];
    if (sql.includes('COALESCE(MAX') && sql.includes('FROM `fact_revenue_daily`')) return [{ nextId: 8001 }];
    return [];
  });

  const result = await persistActual(conn, [{
    department_name: '线上销售部',
    actual_month: '2026-07',
    recovered_amount_yuan: 88.5,
  }]);

  assert.equal(result.written, 1);
  assert.ok(execs.some((e) => e.sql.includes('ADD COLUMN department_id')));
  assert.ok(execs.some((e) => e.sql.includes('ADD COLUMN actual_opening_count')));
});
