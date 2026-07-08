/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 覆盖新增组织/渠道大类保存 payload，以及来源启用=false 转 is_excluded=1 的映射。
*/
/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: 新增 maintenanceSaveBuilders 纯函数单测：只发已编辑格、过滤 summary、解析 id 前缀、
          channel deletions 透传、draft 空时产 0 行、单位为万。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildTargetSaveRows,
  buildCostSaveRows,
  buildOrgSaveRows,
  buildDepartmentSaveRows,
  buildChannelSaveRows,
  buildChannelGroupSaveRows,
} from './maintenanceSaveBuilders.js';

const TARGET_ROWS = [
  { id: 'summary-all', type: 'department', name: '所有部门', periods: {} },
  { id: 'summary-1002', type: 'department', name: '线上销售部', periods: {} },
  { id: 'user-2001', type: 'user', name: '王丽英', periods: { m03: { target: 100 } } },
  { id: 'user-2002', type: 'user', name: '李思雨', periods: { m03: { target: 50 } } },
];

test('buildTargetSaveRows: 只发已编辑格，过滤 summary，从 user- 前缀解析 staff_id', () => {
  const draft = { 'user-2001|m03': 150, 'summary-1002|m03': 999 };
  const out = buildTargetSaveRows(TARGET_ROWS, draft, 2026);
  assert.equal(out.length, 1);
  assert.equal(out[0].staff_id, '2001');
  assert.equal(out[0].staff_name, '王丽英');
  assert.equal(out[0].year_month, '2026-03');
  assert.equal(out[0].target_amount_wan, 150);
});

test('buildTargetSaveRows: draft 空时产 0 行', () => {
  assert.deepEqual(buildTargetSaveRows(TARGET_ROWS, {}, 2026), []);
  assert.deepEqual(buildTargetSaveRows(TARGET_ROWS, null, 2026), []);
});

test('buildTargetSaveRows: 月份补零（m10 -> 10）', () => {
  const out = buildTargetSaveRows(TARGET_ROWS, { 'user-2002|m10': 7 }, 2026);
  assert.equal(out[0].year_month, '2026-10');
  assert.equal(out[0].target_amount_wan, 7);
});

test('buildTargetSaveRows: 非法月份键被丢弃', () => {
  const out = buildTargetSaveRows(TARGET_ROWS, { 'user-2001|q1': 5, 'user-2001|year': 9, 'user-2001|m13': 9 }, 2026);
  assert.deepEqual(out, []);
});

const COST_SNAPSHOT = {
  rows: [
    { id: 'summary-all', type: 'group', name: '全部渠道', periods: {} },
    { id: '3001', type: 'channel', name: '线上', periods: { m03: { cost: 50 } } },
    { id: '3002', type: 'channel', name: '华南线下', periods: { m03: { cost: 30 } } },
  ],
  laborRows: [
    { id: 'labor-sales', name: '销售部人力成本', periods: { m03: { cost: 53 } } },
    { id: 'labor-marketing', name: '市场部人力成本', periods: { m03: { cost: 27 } } },
  ],
};

test('buildCostSaveRows: 渠道行 + 人力行分开，过滤 summary，解析 id 前缀', () => {
  const draft = { '3001|m03': 60, 'labor-sales|m04': 55 };
  const { rows, laborRows } = buildCostSaveRows(COST_SNAPSHOT, draft, 2026);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].channel_id, '3001');
  assert.equal(rows[0].channel_name, '线上');
  assert.equal(rows[0].year_month, '2026-03');
  assert.equal(rows[0].investment_amount_wan, 60);
  assert.equal(laborRows.length, 1);
  assert.equal(laborRows[0].cost_type, 'sales');
  assert.equal(laborRows[0].year_month, '2026-04');
  assert.equal(laborRows[0].amount_wan, 55);
});

test('buildCostSaveRows: draft 空时双数组皆空', () => {
  const { rows, laborRows } = buildCostSaveRows(COST_SNAPSHOT, {}, 2026);
  assert.deepEqual(rows, []);
  assert.deepEqual(laborRows, []);
});

const ORG_USERS = [
  { id: '2001', name: '王丽英', deptId: '1002', isSales: true, enabled: true },
  { id: '2002', name: '李思雨', deptId: '1003', isSales: false, enabled: true },
];

test('buildOrgSaveRows: 只发有编辑的人员，合并 draft 覆盖', () => {
  const draft = { '2001|isSales': false, '2002|deptId': '1004' };
  const out = buildOrgSaveRows(ORG_USERS, draft);
  out.sort((a, b) => a.staff_id.localeCompare(b.staff_id));
  assert.equal(out.length, 2);
  assert.equal(out[0].staff_id, '2001');
  assert.equal(out[0].department_id, '1002'); // 未改 deptId -> 保留原值
  assert.equal(out[0].is_sales, 0); // draft 改为 false
  assert.equal(out[0].is_enabled, 1); // 未改 -> 保留原值
  assert.equal(out[1].staff_id, '2002');
  assert.equal(out[1].department_id, '1004'); // draft 改
  assert.equal(out[1].is_sales, 0); // 保留原 false
});

test('buildOrgSaveRows: 空部门 id 转 null', () => {
  const out = buildOrgSaveRows(ORG_USERS, { '2001|deptId': '' });
  assert.equal(out.length, 1);
  assert.equal(out[0].department_id, null);
});

test('buildOrgSaveRows: draft 空时产 0 行', () => {
  assert.deepEqual(buildOrgSaveRows(ORG_USERS, {}), []);
});

test('buildDepartmentSaveRows: 只发送新增组织并保留临时父子关系', () => {
  const out = buildDepartmentSaveRows([
    { id: '1001', name: '总部', parentId: '', enabled: true },
    { id: 'new-dept-1', name: '新增组织 1', parentId: '1001', enabled: true },
    { id: 'new-dept-2', name: '新增组织 2', parentId: 'new-dept-1', enabled: false },
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[0].department_id, 'new-dept-1');
  assert.equal(out[0].parent_id, '1001');
  assert.equal(out[1].parent_id, 'new-dept-1');
  assert.equal(out[1].is_enabled, 0);
});

const SOURCES = [
  { code: '1001', name: '百度搜索', groupId: '3001', enabled: true, excluded: false },
  { code: '9001', name: '新增来源 1', groupId: '3001', enabled: true, excluded: false },
];

test('buildChannelSaveRows: 映射 sources + deletions 透传 + 过滤空 code', () => {
  const { rows, deletions } = buildChannelSaveRows(SOURCES, ['9999', '', null]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].source_code, '1001');
  assert.equal(rows[0].source_name, '百度搜索');
  assert.equal(rows[0].channel_id, '3001');
  assert.equal(rows[0].is_excluded, 0);
  assert.equal(rows[1].source_code, '9001'); // 新增来源保留
  assert.deepEqual(deletions, ['9999']);
});

test('buildChannelSaveRows: 空 groupId 转 null', () => {
  const { rows } = buildChannelSaveRows([{ code: 'c1', name: 'n', groupId: '', excluded: true }], []);
  assert.equal(rows[0].channel_id, null);
  assert.equal(rows[0].is_excluded, 1);
});

test('buildChannelSaveRows: 启用=false 会落为 is_excluded=1', () => {
  const { rows } = buildChannelSaveRows([{ code: 'c2', name: 'n', groupId: '3001', enabled: false, excluded: false }], []);
  assert.equal(rows[0].is_excluded, 1);
});

test('buildChannelGroupSaveRows: 只发送新增渠道大类', () => {
  const out = buildChannelGroupSaveRows([
    { id: '3001', name: '线上', parentId: '', enabled: true },
    { id: 'new-channel-1', name: '新增大类 1', parentId: '3001', enabled: true },
  ]);
  assert.deepEqual(out, [{
    channel_id: 'new-channel-1',
    channel_name: '新增大类 1',
    parent_id: '3001',
    is_enabled: 1,
  }]);
});
