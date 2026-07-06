/*
 更新时间: 2026-07-06 10:28:05 CST
 更新内容: 增加维护页 MySQL 保存字段映射与金额单位转换的回归测试。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildChannelSourceRows,
  buildLaborCostRows,
  buildTargetRows,
  getMaintenanceResourceFromPath,
  monthKeyToYearMonth,
  wanToYuan,
  yuanToWan,
} from './maintenanceApi.js';

test('converts maintenance amount units between UI wan values and database yuan values', () => {
  assert.equal(wanToYuan(12.34), 123400);
  assert.equal(wanToYuan('0.5'), 5000);
  assert.equal(wanToYuan(''), 0);
  assert.equal(yuanToWan(123400), 12.34);
});

test('maps maintenance month keys to database year_month values', () => {
  assert.equal(monthKeyToYearMonth(2026, 'm01'), '2026-01');
  assert.equal(monthKeyToYearMonth('2026', 'm12'), '2026-12');
  assert.equal(monthKeyToYearMonth(2026, 'q1'), null);
  assert.equal(monthKeyToYearMonth(2026, 'year'), null);
});

test('parses maintenance API resource from the mounted route path', () => {
  assert.equal(getMaintenanceResourceFromPath('/api/maintenance/bootstrap'), 'bootstrap');
  assert.equal(getMaintenanceResourceFromPath('/api/maintenance/targets'), 'targets');
});

test('builds target rows only from editable monthly staff targets', () => {
  const rows = buildTargetRows(2026, [
    {
      id: 'staff-2001',
      type: 'user',
      staffId: 2001,
      departmentId: 1001,
      periods: {
        year: { target: 999 },
        q1: { target: 99 },
        m01: { target: 12 },
        m02: { target: 13 },
      },
    },
    {
      id: 'department-1001',
      type: 'department',
      departmentId: 1001,
      periods: {
        m01: { target: 100 },
      },
    },
  ]);

  assert.deepEqual(rows, [
    {
      yearMonth: '2026-01',
      departmentId: null,
      staffId: 2001,
      channelId: null,
      versionId: null,
      targetAmountYuan: 120000,
      targetOpeningCount: 0,
      targetOrderCount: 0,
    },
    {
      yearMonth: '2026-02',
      departmentId: null,
      staffId: 2001,
      channelId: null,
      versionId: null,
      targetAmountYuan: 130000,
      targetOpeningCount: 0,
      targetOrderCount: 0,
    },
  ]);
});

test('builds labor cost rows from editable monthly cost types', () => {
  assert.deepEqual(
    buildLaborCostRows(2026, [
      {
        id: 'labor-sales',
        costType: 'sales',
        departmentId: null,
        periods: {
          year: { cost: 999 },
          m01: { cost: 48 },
          m02: { cost: 50 },
        },
      },
    ]),
    [
      {
        yearMonth: '2026-01',
        costType: 'sales',
        departmentId: null,
        amountYuan: 480000,
      },
      {
        yearMonth: '2026-02',
        costType: 'sales',
        departmentId: null,
        amountYuan: 500000,
      },
    ]
  );
});

test('builds channel source rows using only dim_channel_source database fields', () => {
  assert.deepEqual(
    buildChannelSourceRows([
      {
        sourceId: 7001,
        code: '1001',
        name: '百度搜索',
        groupId: 'channel-3001',
        enabled: false,
        excluded: true,
      },
    ]),
    [
      {
        sourceId: 7001,
        sourceCode: '1001',
        sourceName: '百度搜索',
        channelId: 3001,
        isExcluded: 1,
      },
    ]
  );
});
