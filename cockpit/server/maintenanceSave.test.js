/*
 Update time: 2026-07-13 00:00:00 CST
 Update content: Cover target maintenance saving department actual completion amount into fact_revenue_daily.
*/
/*
 Update time: 2026-07-10 17:09:42 CST
 Update content: Align target saver tests with department-level targets and staff_id IS NULL persistence.
*/
/*
 Update time: 2026-07-09 16:20:00 CST
 Update content: Cover cost maintenance saving refund_amount_yuan.
*/
/*
 更新时间: 2026-07-08 19:12:00 CST
 更新内容: 单测覆盖渠道维护删除渠道大类时停用 dim_channel 并排除解绑来源。
*/
/*
 更新时间: 2026-07-08 18:58:00 CST
 更新内容: 单测覆盖成本维护删除渠道时停用 dim_channel 并删除当前年份成本。
*/
/*
 更新时间: 2026-07-08 18:45:00 CST
 更新内容: 单测覆盖成本维护新增渠道后映射临时 channel_id，再写入渠道成本。
*/
/*
 更新时间: 2026-07-08 16:37:08 CST
 更新内容: 单测补充组织保存自动维护销售 channel_key，验证调入线上销售部写 online、转非销售清空渠道。
*/
/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 单测同步维护联动新口径：目标保存需启用销售且有部门；组织/渠道新增维表会映射临时 ID 后再保存人员/来源。
*/
/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: 新增 maintenanceSave saver 单测：用假 connection 驱动真实 saver，断言"部分列 upsert"
          语义——target UPDATE 不含 opening/order；org UPDATE 不含 external_bi_user_id；
          labor upsert 键为 (year_month, cost_type)；channel 新增用 nextId 取 source_id 插入；
          org 跳过合成部门、channel 跳过合成大类、删除走 DELETE。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  saveTarget,
  saveCost,
  saveLabor,
  saveOrg,
  saveChannel,
} from './maintenanceSave.js';

/**
 * 假 connection：SELECT 由 selectFn 返回行；写（UPDATE/INSERT/DELETE）记入 execs。
 * queryRows/nextId 内部都走 connection.execute，因此对真实 saver 透明。
 */
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
      if (/^UPDATE dim_channel_source SET channel_id = NULL/i.test(normalized)) return [{ affectedRows: 2 }];
      if (/^UPDATE dim_channel SET is_enabled/i.test(normalized)) return [{ affectedRows: 1 }];
      if (/^DELETE/i.test(normalized)) return [{ affectedRows: 1 }];
      return [{}];
    },
  };
  return { conn, execs };
}

test('saveTarget: UPDATE 部门级目标，只写 channel_id/target_amount_yuan，不碰 opening/order', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('FROM dim_department WHERE department_id')) return [{ department_id: 1002, is_enabled: 1 }];
    if (sql === 'SELECT department_id, department_code, parent_id FROM dim_department') {
      return [
        { department_id: 1001, department_code: 'headquarters', parent_id: null },
        { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
      ];
    }
    if (sql.includes('FROM dim_channel')) return [{ id: 3001 }];
    if (sql.includes('FROM biz_target_monthly')) return [{ target_id: 999 }];
    return [];
  });
  const r = await saveTarget(conn, [{ department_id: 1002, year_month: '2026-03', target_amount_wan: 150 }]);
  assert.equal(r.written, 1);
  const update = execs.find((e) => e.sql.startsWith('UPDATE'));
  assert.ok(update, '应有 UPDATE');
  assert.match(update.sql, /SET channel_id = \?, target_amount_yuan = \?/);
  assert.doesNotMatch(update.sql, /target_opening_count|target_order_count/);
  assert.deepEqual(update.params, [3001, 1500000, 999]); // 150万 -> 1500000元
});

test('saveTarget: 不存在则 INSERT，opening/order 默认 0', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('FROM dim_department WHERE department_id')) return [{ department_id: 1002, is_enabled: 1 }];
    if (sql === 'SELECT department_id, department_code, parent_id FROM dim_department') {
      return [
        { department_id: 1001, department_code: 'headquarters', parent_id: null },
        { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
      ];
    }
    if (sql.includes('FROM dim_channel')) return [{ id: 3001 }];
    if (sql.includes('COALESCE(MAX')) return [{ nextId: 10001 }];
    return [];
  });
  await saveTarget(conn, [{ department_id: 1002, year_month: '2026-03', target_amount_wan: 12 }]);
  const ins = execs.find((e) => e.sql.startsWith('INSERT'));
  assert.ok(ins);
  assert.match(ins.sql, /staff_id, channel_id, target_amount_yuan, target_opening_count, target_order_count\) VALUES \(\?, \?, \?, NULL, \?, \?, 0, 0\)/);
  assert.deepEqual(ins.params, [10001, '2026-03', 1002, 3001, 120000]);
});

test('saveTarget: 非法 department_id/年份被跳过', async () => {
  const { conn, execs } = makeConn(() => [{ target_id: 1 }]);
  const r = await saveTarget(conn, [
    { department_id: 'x', year_month: '2026-03', target_amount_wan: 1 },
    { department_id: 1002, year_month: 'bad', target_amount_wan: 1 },
  ]);
  assert.equal(r.written, 0);
  assert.equal(r.skipped, 2);
  assert.equal(execs.length, 0);
});

test('saveTarget: 停用组织被跳过', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('FROM dim_department WHERE department_id')) return [{ department_id: 1002, is_enabled: 0 }];
    return [];
  });
  const r = await saveTarget(conn, [{ department_id: 1002, year_month: '2026-03', target_amount_wan: 1 }]);
  assert.equal(r.written, 0);
  assert.equal(r.skipped, 1);
  assert.equal(execs.length, 0);
});

test('saveTarget: actual amount saves to fact_revenue_daily without touching target table', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('INFORMATION_SCHEMA.COLUMNS')) {
      return [{ COLUMN_NAME: 'department_id' }, { COLUMN_NAME: 'actual_opening_count' }];
    }
    if (sql.includes('FROM dim_department WHERE department_id')) return [{ department_id: 1002, is_enabled: 1 }];
    if (sql === 'SELECT department_id, department_code, parent_id FROM dim_department') {
      return [
        { department_id: 1001, department_code: 'headquarters', parent_id: null },
        { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
      ];
    }
    if (sql.includes('FROM dim_channel')) return [{ id: 3001 }];
    if (sql.includes('FROM fact_revenue_daily')) return [];
    if (sql.includes('COALESCE(MAX') && sql.includes('fact_revenue_daily')) return [{ nextId: 8001 }];
    return [];
  });
  const r = await saveTarget(conn, [{ department_id: 1002, year_month: '2026-03', actual_amount_wan: 88.5 }]);
  assert.equal(r.written, 1);
  const targetWrite = execs.find((e) => e.sql.includes('biz_target_monthly'));
  assert.equal(targetWrite, undefined);
  const insert = execs.find((e) => e.sql.startsWith('INSERT INTO fact_revenue_daily'));
  assert.ok(insert);
  assert.deepEqual(insert.params, [8001, '2026-03-01', 1002, 3001, 885000, 0, 0]);
});

test('saveCost: 按 (year_month, channel_id) upsert investment_amount_yuan', async () => {
  const { conn, execs } = makeConn(() => [{ cost_id: 5 }]);
  const r = await saveCost(conn, [{ channel_id: 3001, year_month: '2026-03', investment_amount_wan: 50 }]);
  assert.equal(r.written, 1);
  const update = execs.find((e) => e.sql.startsWith('UPDATE'));
  assert.match(update.sql, /SET investment_amount_yuan = \?, refund_amount_yuan = \?/);
  assert.equal(update.params[0], 500000);
  assert.equal(update.params[1], 0);
});

test('saveCost: 新增渠道后映射临时 channel_id 再写成本', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql === 'SELECT channel_id FROM dim_channel') return [{ channel_id: 3001 }];
    if (sql.includes('COALESCE(MAX') && sql.includes('dim_channel')) return [{ nextId: 3100 }];
    if (sql.includes('COALESCE(MAX') && sql.includes('biz_channel_cost_monthly')) return [{ nextId: 5100 }];
    return [];
  });
  const r = await saveCost(
    conn,
    [{ channel_id: 'new-channel-5', year_month: '2026-03', investment_amount_wan: 12, refund_amount_wan: 2 }],
    [{ channel_id: 'new-channel-5', channel_name: '新增渠道 5', parent_id: '', is_enabled: 1 }],
  );
  assert.equal(r.written, 2);
  const channelInsert = execs.find((e) => e.sql.startsWith('INSERT INTO dim_channel '));
  assert.ok(channelInsert);
  assert.equal(channelInsert.params[0], 3100);
  const costInsert = execs.find((e) => e.sql.startsWith('INSERT INTO biz_channel_cost_monthly'));
  assert.ok(costInsert);
  assert.deepEqual(costInsert.params, [5100, '2026-03', 3100, 120000, 20000]);
});

test('saveCost: 删除渠道会停用渠道并清理当前年份成本', async () => {
  const { conn, execs } = makeConn(() => []);
  const r = await saveCost(conn, [], [], ['3002'], 2026);
  assert.equal(r.deleted, 2);
  const channelUpdate = execs.find((e) => e.sql.startsWith('UPDATE dim_channel SET is_enabled'));
  assert.ok(channelUpdate);
  assert.deepEqual(channelUpdate.params, [3002]);
  const costDelete = execs.find((e) => e.sql.startsWith('DELETE FROM biz_channel_cost_monthly'));
  assert.ok(costDelete);
  assert.deepEqual(costDelete.params, [3002, '2026-%']);
});

test('saveLabor: upsert 键为 (year_month, cost_type)，仅写 amount_yuan', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('biz_labor_cost_monthly')) return [{ labor_cost_id: 600000 }];
    return [];
  });
  await saveLabor(conn, [{ cost_type: 'sales', year_month: '2026-03', amount_wan: 53 }]);
  const update = execs.find((e) => e.sql.startsWith('UPDATE'));
  assert.ok(update);
  assert.match(update.sql, /SET amount_yuan = /);
  // SELECT 走 selectFn：验证键含 year_month 与 cost_type
  assert.equal(update.params[0], 530000);
});

test('saveLabor: 不存在则 INSERT (labor_cost_id, year_month, cost_type, amount_yuan)', async () => {
  const { conn, execs } = makeConn(() => []);
  await saveLabor(conn, [{ cost_type: 'marketing', year_month: '2026-04', amount_wan: 27 }]);
  const ins = execs.find((e) => e.sql.startsWith('INSERT'));
  assert.ok(ins);
  assert.match(ins.sql, /INSERT INTO biz_labor_cost_monthly \(labor_cost_id, `year_month`, cost_type, amount_yuan\)/);
});

test('saveOrg: UPDATE 只写 department_id/channel_key/is_sales/is_enabled，不碰 external_bi_user_id；跳过合成部门', async () => {
  const { conn, execs } = makeConn(() => [
    { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
  ]);
  const r = await saveOrg(conn, [
    { staff_id: 2001, department_id: '1002', is_sales: true, is_enabled: false },
    { staff_id: 2002, department_id: 'new-dept-1', is_sales: false, is_enabled: true },
  ]);
  assert.equal(r.written, 1);
  assert.equal(r.skipped, 1);
  const update = execs.find((e) => e.sql.startsWith('UPDATE'));
  assert.ok(update);
  assert.match(update.sql, /SET department_id = \?, channel_key = \?, is_sales = \?, is_enabled = \? WHERE staff_id = \?/);
  assert.doesNotMatch(update.sql, /external_bi_user_id/);
  assert.deepEqual(update.params, ['1002', 'online', 1, 0, 2001]);
});

test('saveOrg: 新增组织后映射临时 department_id 给人员', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql === 'SELECT department_id, department_code, parent_id FROM dim_department') {
      return [{ department_id: 1001, department_code: 'online-sales', parent_id: null }];
    }
    if (sql.includes('COALESCE(MAX')) return [{ nextId: 1100 }];
    return [];
  });
  const r = await saveOrg(
    conn,
    [{ staff_id: 2001, department_id: 'new-dept-1', is_sales: true, is_enabled: true }],
    [{ department_id: 'new-dept-1', department_name: '新销售组', parent_id: '1001', is_enabled: 1 }],
  );
  assert.equal(r.written, 2);
  const deptInsert = execs.find((e) => e.sql.startsWith('INSERT INTO dim_department'));
  assert.ok(deptInsert);
  assert.equal(deptInsert.params[0], 1100);
  const staffUpdate = execs.find((e) => e.sql.startsWith('UPDATE dim_staff'));
  assert.equal(staffUpdate.params[0], '1100');
  assert.equal(staffUpdate.params[1], 'online');
});

test('saveOrg: 转非销售或清空组织时清空 channel_key', async () => {
  const { conn, execs } = makeConn(() => [
    { department_id: 1002, department_code: 'online-sales', parent_id: 1001 },
  ]);
  const r = await saveOrg(conn, [
    { staff_id: 2001, department_id: '1002', is_sales: false, is_enabled: true },
  ]);

  assert.equal(r.written, 1);
  const update = execs.find((e) => e.sql.startsWith('UPDATE dim_staff'));
  assert.deepEqual(update.params, ['1002', null, 0, 1, 2001]);
});

test('saveChannel: 已存在来源 UPDATE source_name/channel_id/is_excluded', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('SELECT channel_id FROM dim_channel')) return [{ channel_id: 3001 }];
    if (sql.includes('SELECT source_id FROM dim_channel_source')) return [{ source_id: 7001 }];
    return [];
  });
  const r = await saveChannel(conn, [{ source_code: '1001', source_name: '百度搜索改', channel_id: '3001', is_excluded: 1 }], []);
  assert.equal(r.written, 1);
  const update = execs.find((e) => e.sql.startsWith('UPDATE'));
  assert.ok(update);
  assert.match(update.sql, /SET source_name = \?, channel_id = \?, is_excluded = \?/);
  assert.equal(update.params[2], 1);
});

test('saveChannel: 新来源用 nextId 取 source_id 后 INSERT', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql.includes('SELECT channel_id FROM dim_channel')) return [{ channel_id: 3001 }];
    if (sql.includes('COALESCE(MAX')) return [{ nextId: 7099 }];
    return [];
  });
  const r = await saveChannel(conn, [{ source_code: '9001', source_name: '新增来源 1', channel_id: '3001', is_excluded: 0 }], []);
  assert.equal(r.written, 1);
  const ins = execs.find((e) => e.sql.startsWith('INSERT INTO dim_channel_source'));
  assert.ok(ins);
  assert.equal(ins.params[0], 7099); // source_id 来自 nextId
  assert.equal(ins.params[1], '9001');
});

test('saveChannel: 删除走 DELETE WHERE source_code = ?，空/null 跳过', async () => {
  const { conn, execs } = makeConn(() => []);
  const r = await saveChannel(conn, [], ['9999', '', null]);
  const dels = execs.filter((e) => e.sql.startsWith('DELETE'));
  // '9999' 删除；'' 与 null 被 String(code||'') 规约为空后 continue 跳过
  assert.equal(dels.length, 1);
  assert.match(dels[0].sql, /DELETE FROM dim_channel_source WHERE source_code = \?/);
  assert.equal(dels[0].params[0], '9999');
  assert.equal(r.deleted, 1);
});

test('saveChannel: 合成大类 channel_id 被跳过', async () => {
  const { conn, execs } = makeConn(() => [{ channel_id: 3001 }]); // dim_channel 只含 3001
  const r = await saveChannel(conn, [{ source_code: '1001', source_name: 'n', channel_id: 'new-channel-1', is_excluded: 0 }], []);
  assert.equal(r.written, 0);
  assert.equal(r.skipped, 1);
  assert.equal(execs.length, 0);
});

test('saveChannel: 新增渠道大类后映射临时 channel_id 给来源', async () => {
  const { conn, execs } = makeConn((sql) => {
    if (sql === 'SELECT channel_id FROM dim_channel') return [{ channel_id: 3001 }];
    if (sql.includes('COALESCE(MAX') && sql.includes('dim_channel')) return [{ nextId: 3100 }];
    if (sql.includes('COALESCE(MAX') && sql.includes('dim_channel_source')) return [{ nextId: 7100 }];
    return [];
  });
  const r = await saveChannel(
    conn,
    [{ source_code: '9002', source_name: '新大类来源', channel_id: 'new-channel-1', is_excluded: 0 }],
    [],
    [{ channel_id: 'new-channel-1', channel_name: '新渠道', parent_id: '', is_enabled: 1 }],
  );
  assert.equal(r.written, 2);
  const groupInsert = execs.find((e) => e.sql.startsWith('INSERT INTO dim_channel '));
  assert.ok(groupInsert);
  assert.equal(groupInsert.params[0], 3100);
  const sourceInsert = execs.find((e) => e.sql.startsWith('INSERT INTO dim_channel_source'));
  assert.equal(sourceInsert.params[3], '3100');
});

test('saveChannel: 删除渠道大类会停用渠道并排除解绑来源', async () => {
  const { conn, execs } = makeConn(() => []);
  const r = await saveChannel(conn, [], [], [], ['3002']);
  assert.equal(r.deleted, 3);
  const sourceUpdate = execs.find((e) => e.sql.startsWith('UPDATE dim_channel_source SET channel_id = NULL'));
  assert.ok(sourceUpdate);
  assert.deepEqual(sourceUpdate.params, [3002]);
  const channelUpdate = execs.find((e) => e.sql.startsWith('UPDATE dim_channel SET is_enabled'));
  assert.ok(channelUpdate);
  assert.deepEqual(channelUpdate.params, [3002]);
});
