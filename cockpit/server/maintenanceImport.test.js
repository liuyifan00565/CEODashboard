/*
 Update time: 2026-07-14 17:57:02 CST
 Update content: Cover skipping actual revenue imports for organizations without one enabled channel.
*/
/*
 Update time: 2026-07-14 17:09:11 CST
 Update content: Cover auto-increment target inserts and department monthly revenue override imports without request-time DDL.
*/
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
    if (sql.includes('FROM biz_target_monthly')) return [];
    return [];
  });

  const result = await persistTarget(conn, [targetRow]);

  assert.equal(result.written, 1);
  assert.equal(result.skipped, 0);
  assert.deepEqual(result.pendingNewStaff, []);
  assert.deepEqual(result.errors, []);

  const insert = execs.find((e) => e.sql.startsWith('INSERT INTO biz_target_monthly'));
  assert.ok(insert);
  assert.match(insert.sql, /ON DUPLICATE KEY UPDATE[\s\S]*target_opening_count = VALUES\(target_opening_count\)/);
  assert.doesNotMatch(insert.sql, /target_id/);
  assert.deepEqual(insert.params, ['2026-07', 1002, 3001, 1000000, 10, 20]);
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

test('persistActual atomically upserts organization actual completion into monthly override', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('FROM dim_department WHERE department_name')) return [{ id: 1002, name: '线上销售部', department_code: 'online-sales', parent_id: 1001 }];
    if (sql.includes('SELECT department_id, department_code, parent_id FROM dim_department')) {
      return [
        { department_id: 1001, department_code: 'headquarters', parent_id: null },
        { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
      ];
    }
    if (sql.includes('FROM dim_channel')) return [{ id: 3001 }];
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

  const insert = execs.find((e) => e.sql.startsWith('INSERT INTO fact_revenue_monthly_override'));
  assert.ok(insert);
  assert.match(insert.sql, /ON DUPLICATE KEY UPDATE/);
  assert.deepEqual(insert.params, ['2026-07', 1002, 3001, 885000, 7, 12]);
});

test('persistActual never alters schema during a business request', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('FROM dim_department WHERE department_name')) return [{ id: 1002, name: '线上销售部', department_code: 'online-sales', parent_id: 1001 }];
    if (sql.includes('SELECT department_id, department_code, parent_id FROM dim_department')) {
      return [
        { department_id: 1001, department_code: 'headquarters', parent_id: null },
        { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
      ];
    }
    if (sql.includes('FROM dim_channel')) return [{ id: 3001 }];
    return [];
  });

  const result = await persistActual(conn, [{
    department_name: '线上销售部',
    actual_month: '2026-07',
    recovered_amount_yuan: 88.5,
  }]);

  assert.equal(result.written, 1);
  assert.equal(execs.some((e) => /ALTER TABLE/i.test(e.sql)), false);
});

test('persistActual skips parent organization without one enabled channel', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('FROM dim_department WHERE department_name')) {
      return [{ id: 1001, name: '总部', department_code: 'headquarters', parent_id: null }];
    }
    if (sql.includes('SELECT department_id, department_code, parent_id FROM dim_department')) {
      return [{ department_id: 1001, department_code: 'headquarters', parent_id: null }];
    }
    return [];
  });

  const result = await persistActual(conn, [{
    department_name: '总部',
    actual_month: '2026-07',
    recovered_amount_yuan: 88.5,
  }]);

  assert.equal(result.written, 0);
  assert.equal(result.skipped, 1);
  assert.equal(result.errors[0].field, 'department_name');
  assert.match(result.errors[0].message, /无法唯一映射到启用经营渠道/);
  assert.equal(execs.length, 0);
});
