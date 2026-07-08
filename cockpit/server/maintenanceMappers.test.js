/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 覆盖目标页启用销售过滤、成本页空年份默认 sales/marketing 人力成本行、渠道父级映射。
*/
/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: 新增 maintenanceMappers 纯函数单测，覆盖 target rollup/status、cost roi、org sourceName、channel enabled=!excluded。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTargetSnapshot,
  buildCostSnapshot,
  buildOrgSnapshot,
  buildChannelSnapshot,
} from './maintenanceMappers.js';

const DEPARTMENTS = [
  { department_id: 1001, department_name: '总部', parent_id: null, is_enabled: 1 },
  { department_id: 1002, department_name: '线上销售部', parent_id: 1001, is_enabled: 1 },
  { department_id: 1003, department_name: '华南战区', parent_id: 1002, is_enabled: 1 },
];

const STAFF = [
  { staff_id: 2001, staff_name: '王丽英', department_id: 1002, is_sales: 1, is_enabled: 1, external_bi_user_id: 'wl_1' },
  { staff_id: 2002, staff_name: '李思雨', department_id: 1003, is_sales: 1, is_enabled: 1, external_bi_user_id: 'wl_2' },
  { staff_id: 2098, staff_name: '停用销售', department_id: 1002, is_sales: 1, is_enabled: 0, external_bi_user_id: 'wl_stop' },
  { staff_id: 2099, staff_name: '旧账号', department_id: 1002, is_sales: 0, is_enabled: 0, external_bi_user_id: 'wl_x' },
];

test('buildTargetSnapshot: 人员行 + 部门汇总 + 全部汇总 + 季度/全年 rollup', () => {
  // 2001 一月目标 100万(=1000000元)，实际 80万 -> pct 80 -> warning
  const targets = [
    { year_month: '2026-01', staff_id: 2001, target_amount_yuan: 1000000 },
    { year_month: '2026-01', staff_id: 2098, target_amount_yuan: 9990000 },
  ];
  const revenue = [{ ym: '2026-01', staff_id: 2001, amt: 800000, deals: 3 }];
  const { rows, orgTree } = buildTargetSnapshot({ departments: DEPARTMENTS, staff: STAFF, targets, revenue });

  const user = rows.find((r) => r.id === 'user-2001');
  assert.equal(user.type, 'user');
  assert.equal(user.name, '王丽英');
  assert.equal(user.periods.m01.target, 100); // 元→万
  assert.equal(user.periods.m01.actual, 80);
  assert.equal(user.periods.m01.pct, 80);
  assert.equal(user.periods.m01.status, 'warning');
  // q1 = m01+m02+m03 = 100+0+0
  assert.equal(user.periods.q1.target, 100);
  assert.equal(user.periods.year.target, 100);

  // 全部汇总行把 2001 的 1 月也加进去
  const all = rows.find((r) => r.id === 'summary-all');
  assert.equal(all.type, 'department');
  assert.equal(all.periods.m01.target, 100);

  // 非销售(2099)不应出现在人员行
  assert.ok(!rows.some((r) => r.id === 'user-2099'));
  // 停用销售(2098)也不应出现在人员行或汇总目标
  assert.ok(!rows.some((r) => r.id === 'user-2098'));
  assert.equal(all.periods.m01.target, 100);
  // orgTree userCount 只数启用销售
  assert.ok(orgTree.userCount >= 2);
});

test('buildTargetSnapshot: 目标为 0 时 status=unset', () => {
  const { rows } = buildTargetSnapshot({ departments: DEPARTMENTS, staff: STAFF, targets: [], revenue: [] });
  const user = rows.find((r) => r.id === 'user-2001');
  assert.equal(user.periods.m02.target, 0);
  assert.equal(user.periods.m02.status, 'unset');
});

test('buildCostSnapshot: 渠道行 + 全部汇总 + roi + 人力行', () => {
  const channels = [
    { channel_id: 3001, channel_name: '线上', parent_id: null, is_enabled: 1 },
    { channel_id: 3002, channel_name: '华南线下', parent_id: null, is_enabled: 1 },
  ];
  const costs = [{ year_month: '2026-01', channel_id: 3001, investment_amount_yuan: 500000 }]; // 50万
  const revenue = [{ ym: '2026-01', channel_id: 3001, amt: 750000, deals: 5 }]; // 75万
  const labor = [
    { year_month: '2026-01', cost_type: 'sales', amount_yuan: 530000 },
    { year_month: '2026-01', cost_type: 'marketing', amount_yuan: 260000 },
  ];
  const { channels: nav, rows, laborRows } = buildCostSnapshot({ channels, costs, revenue, labor });

  assert.equal(nav[0].id, 'all');
  assert.equal(nav[1].id, '3001');
  assert.equal(nav[1].kind, '明细');

  const ch = rows.find((r) => r.id === '3001');
  assert.equal(ch.type, 'channel');
  assert.equal(ch.periods.m01.cost, 50);
  assert.equal(ch.periods.m01.actual, 75);
  assert.equal(ch.periods.m01.deals, 5);
  assert.equal(ch.periods.m01.roi, 0.5); // (75-50)/50

  const all = rows.find((r) => r.id === 'summary-all');
  assert.equal(all.type, 'group');
  assert.equal(all.periods.m01.cost, 50);

  assert.equal(laborRows.length, 2);
  assert.equal(laborRows.find((l) => l.id === 'labor-sales').name, '销售部人力成本');
  assert.equal(laborRows.find((l) => l.id === 'labor-sales').periods.m01.cost, 53);
});

test('buildCostSnapshot: 人力成本空年份仍生成 sales/marketing 默认行', () => {
  const { laborRows } = buildCostSnapshot({ channels: [], costs: [], revenue: [], labor: [] });
  assert.equal(laborRows.length, 2);
  assert.ok(laborRows.some((row) => row.id === 'labor-sales'));
  assert.ok(laborRows.some((row) => row.id === 'labor-marketing'));
});

test('buildOrgSnapshot: 部门/人员形状 + sourceName 派生', () => {
  const { departments, users } = buildOrgSnapshot({ departments: DEPARTMENTS, staff: STAFF });
  assert.equal(departments[0].id, '1001');
  assert.equal(departments[0].parentId, '');
  assert.equal(departments[1].parentId, '1001');

  const u = users.find((x) => x.id === '2001');
  assert.equal(u.name, '王丽英');
  assert.equal(u.isSales, true);
  assert.equal(u.sourceName, 'BI 销售');
  assert.equal(users.find((x) => x.id === '2099').sourceName, '历史人员');
});

test('buildChannelSnapshot: groups 扁平 + enabled = NOT is_excluded', () => {
  const channels = [
    { channel_id: 3001, channel_name: '线上', parent_id: null, is_enabled: 1 },
    { channel_id: 3002, channel_name: '线上子类', parent_id: 3001, is_enabled: 1 },
  ];
  const sources = [
    { source_id: 7001, source_code: '1001', source_name: '百度搜索', channel_id: 3001, is_excluded: 0 },
    { source_id: 7099, source_code: '9999', source_name: '测试', channel_id: null, is_excluded: 1 },
  ];
  const { groups, sources: srcs } = buildChannelSnapshot({ channels, sources });
  assert.equal(groups[0].id, '3001');
  assert.equal(groups[0].parentId, '');
  assert.equal(groups[1].parentId, '3001');

  const s1 = srcs.find((s) => s.code === '1001');
  assert.equal(s1.groupId, '3001');
  assert.equal(s1.enabled, true);
  assert.equal(s1.excluded, false);

  const s2 = srcs.find((s) => s.code === '9999');
  assert.equal(s2.enabled, false);
  assert.equal(s2.excluded, true);
});
