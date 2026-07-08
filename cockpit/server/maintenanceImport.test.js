/*
 更新时间: 2026-07-08 13:05:31 CST
 更新内容: 覆盖目标导入陌生员工确认逻辑，校验未确认时只返回待确认项、确认后新增员工并写入目标。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import { persistTarget } from './maintenanceImport.js';

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
  staff_name: '照祥',
  department_name: '线上销售部',
  target_month: '2026-07',
  target_amount_yuan: 100,
  target_opening_count: 10,
  target_order_count: 20,
};

test('persistTarget returns pending confirmation when staff is unknown', async () => {
  const { conn, execs } = makeConn(() => []);

  const result = await persistTarget(conn, [targetRow]);

  assert.equal(result.written, 0);
  assert.equal(result.skipped, 1);
  assert.equal(result.createdStaff, 0);
  assert.equal(result.errors.length, 0);
  assert.equal(result.pendingNewStaff.length, 1);
  assert.equal(result.pendingNewStaff[0].staff_name, '照祥');
  assert.equal(result.pendingNewStaff[0].department_name, '线上销售部');
  assert.match(result.pendingNewStaff[0].message, /是否新增员工/);
  assert.equal(execs.length, 0);
});

test('persistTarget creates enabled sales staff and inserts target after confirmation', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('FROM dim_staff s')) return [];
    if (sql.includes('FROM dim_department')) return [{ id: 1002, name: '线上销售部' }];
    if (sql.includes('COALESCE(MAX') && sql.includes('FROM `dim_staff`')) return [{ nextId: 2006 }];
    if (sql.includes('COALESCE(MAX') && sql.includes('FROM `biz_target_monthly`')) return [{ nextId: 9001 }];
    if (sql.includes('FROM biz_target_monthly')) return [];
    return [];
  });

  const result = await persistTarget(conn, [targetRow], { createMissingStaff: true });

  assert.equal(result.written, 1);
  assert.equal(result.skipped, 0);
  assert.equal(result.createdStaff, 1);
  assert.deepEqual(result.pendingNewStaff, []);
  assert.deepEqual(result.errors, []);

  const staffInsert = execs.find((e) => e.sql.startsWith('INSERT INTO dim_staff'));
  assert.ok(staffInsert);
  assert.deepEqual(staffInsert.params, [2006, 'staff_2006', '照祥', 1002, null]);
  assert.match(staffInsert.sql, /is_sales, is_delivery, is_success, is_enabled/);
  assert.match(staffInsert.sql, /VALUES \(\?, \?, \?, \?, \?, 1, 0, 0, 1\)/);

  const targetInsert = execs.find((e) => e.sql.startsWith('INSERT INTO biz_target_monthly'));
  assert.ok(targetInsert);
  assert.deepEqual(targetInsert.params, [9001, '2026-07', 2006, 1000000, 10, 20]);
});
