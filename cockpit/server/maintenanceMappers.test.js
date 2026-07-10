/*
 Update time: 2026-07-10 17:09:42 CST
 Update content: Align target maintenance mapper tests with department-level rows; staff facts now roll up into summary department rows instead of rendering user rows.
*/
/*
 Update time: 2026-07-09 16:20:00 CST
 Update content: Cover cost maintenance refund amount mapping and rollup.
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

test('buildTargetSnapshot keeps department rows and rolls up staff actuals', () => {
  const targets = [
    { year_month: '2026-01', department_id: 1002, staff_id: null, target_amount_yuan: 1000000 },
    { year_month: '2026-01', staff_id: 2098, target_amount_yuan: 9990000 },
  ];
  const revenue = [{ ym: '2026-01', staff_id: 2001, amt: 800000, deals: 3 }];
  const { rows, orgTree } = buildTargetSnapshot({ departments: DEPARTMENTS, staff: STAFF, targets, revenue });

  const dept = rows.find((r) => r.id === 'summary-1002');
  assert.equal(dept.type, 'department');
  assert.equal(dept.name, '线上销售部');
  assert.equal(dept.periods.m01.target, 100);
  assert.equal(dept.periods.m01.actual, 80);
  assert.equal(dept.periods.m01.pct, 80);
  assert.equal(dept.periods.m01.status, 'warning');

  const all = rows.find((r) => r.id === 'summary-all');
  assert.equal(all.type, 'department');
  assert.equal(all.periods.m01.target, 100);
  assert.ok(!rows.some((r) => String(r.id).startsWith('user-')));
  assert.ok(!rows.some((r) => r.id === 'user-2099'));
  assert.ok(!rows.some((r) => r.id === 'user-2098'));
  assert.ok(orgTree.userCount >= 1);
});

test('buildTargetSnapshot uses organization-level imports without double counting staff', () => {
  const targets = [
    { year_month: '2026-01', department_id: 1002, staff_id: null, target_amount_yuan: 3000000 },
    { year_month: '2026-01', staff_id: 2001, target_amount_yuan: 1000000 },
    { year_month: '2026-01', staff_id: 2002, target_amount_yuan: 2000000 },
  ];
  const revenue = [
    { ym: '2026-01', department_id: 1002, staff_id: null, amt: 2500000 },
    { ym: '2026-01', staff_id: 2001, amt: 800000 },
    { ym: '2026-01', staff_id: 2002, amt: 900000 },
  ];
  const { rows } = buildTargetSnapshot({ departments: DEPARTMENTS, staff: STAFF, targets, revenue });

  const online = rows.find((r) => r.id === 'summary-1002');
  assert.equal(online.periods.m01.target, 300);
  assert.equal(online.periods.m01.actual, 250);

  const all = rows.find((r) => r.id === 'summary-all');
  assert.equal(all.periods.m01.target, 300);
  assert.equal(all.periods.m01.actual, 250);
});

test('buildTargetSnapshot: target 0 means unset', () => {
  const { rows } = buildTargetSnapshot({ departments: DEPARTMENTS, staff: STAFF, targets: [], revenue: [] });
  const dept = rows.find((r) => r.id === 'summary-1002');
  assert.equal(dept.periods.m02.target, 0);
  assert.equal(dept.periods.m02.status, 'unset');
});

test('buildTargetSnapshot: 120% and above becomes good', () => {
  const targets = [
    { year_month: '2026-01', department_id: 1002, staff_id: null, target_amount_yuan: 1000000 },
    { year_month: '2026-02', department_id: 1002, staff_id: null, target_amount_yuan: 1000000 },
  ];
  const revenue = [
    { ym: '2026-01', staff_id: 2001, amt: 1100000, deals: 3 },
    { ym: '2026-02', staff_id: 2001, amt: 1200000, deals: 4 },
  ];
  const { rows } = buildTargetSnapshot({ departments: DEPARTMENTS, staff: STAFF, targets, revenue });
  const dept = rows.find((r) => r.id === 'summary-1002');

  assert.equal(dept.periods.m01.pct, 110);
  assert.equal(dept.periods.m01.status, 'warning');
  assert.equal(dept.periods.m02.pct, 120);
  assert.equal(dept.periods.m02.status, 'good');
});

test('buildCostSnapshot builds channel rows, summary, roi, and labor rows', () => {
  const channels = [
    { channel_id: 3001, channel_name: '线上', parent_id: null, is_enabled: 1 },
    { channel_id: 3002, channel_name: '华南线下', parent_id: null, is_enabled: 1 },
  ];
  const costs = [{ year_month: '2026-01', channel_id: 3001, investment_amount_yuan: 500000, refund_amount_yuan: 120000 }];
  const revenue = [{ ym: '2026-01', channel_id: 3001, amt: 750000, deals: 5 }];
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
  assert.equal(ch.periods.m01.refund, 12);
  assert.equal(ch.periods.m01.roi, 0.5);

  const all = rows.find((r) => r.id === 'summary-all');
  assert.equal(all.type, 'group');
  assert.equal(all.periods.m01.cost, 50);
  assert.equal(all.periods.m01.refund, 12);

  assert.equal(laborRows.length, 2);
  assert.equal(laborRows.find((l) => l.id === 'labor-sales').name, '销售部人力成本');
  assert.equal(laborRows.find((l) => l.id === 'labor-sales').periods.m01.cost, 53);
});

test('buildCostSnapshot creates default labor rows for empty year', () => {
  const { laborRows } = buildCostSnapshot({ channels: [], costs: [], revenue: [], labor: [] });
  assert.equal(laborRows.length, 2);
  assert.ok(laborRows.some((row) => row.id === 'labor-sales'));
  assert.ok(laborRows.some((row) => row.id === 'labor-marketing'));
});

test('buildOrgSnapshot maps departments and staff source names', () => {
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

test('buildChannelSnapshot maps groups and source enabled state', () => {
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
