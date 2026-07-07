/*
 更新时间: 2026-07-07 10:00:00 CST
 更新内容: 新增 excelImport 纯函数单测，覆盖列别名匹配/类型转换/必填/范围/去重/模板生成。
*/
import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';

import {
  matchColumns,
  mapAndValidate,
  buildTemplateWorkbook,
  extractRows,
} from './excelImport.js';

const TARGET_CONFIG = {
  pageKey: 'target-maintenance',
  label: '目标维护导入',
  sheetName: null,
  columns: [
    { field: 'staff_name', header: '人员名称', aliases: ['销售'], required: true, type: 'string' },
    { field: 'target_month', header: '目标月份', aliases: ['月份'], required: true, type: 'month' },
    { field: 'target_amount_yuan', header: '回款目标(元)', aliases: ['回款目标'], required: true, type: 'number', min: 0 },
    { field: 'is_sales', header: '是否销售', required: false, type: 'boolean' },
  ],
  uniqueKey: ['staff_name', 'target_month'],
};

test('matchColumns 按表头与别名匹配，忽略大小写空白', () => {
  const rawHeaders = [' 销售 ', '月份', '回款目标', '是否销售'];
  const { matched, missing } = matchColumns(rawHeaders, TARGET_CONFIG);
  assert.equal(matched.staff_name.header, '销售');
  assert.equal(matched.target_month.header, '月份');
  assert.equal(matched.target_amount_yuan.header, '回款目标');
  assert.equal(missing.length, 0);
});

test('matchColumns 未匹配的列进入 missing', () => {
  const { matched, missing } = matchColumns(['人员名称', '目标月份'], TARGET_CONFIG);
  assert.equal(matched.staff_name.header, '人员名称');
  assert.equal(missing.length, 2);
  assert.equal(missing[0].field, 'target_amount_yuan');
});

test('mapAndValidate 类型转换与必填校验', () => {
  const headers = ['销售', '月份', '回款目标', '是否销售'];
  const rows = [
    ['张三', '2026年3月', '1,200.5', '是'],
    [null, '2026-04', '500', '否'], // 必填 staff_name 为空 -> error
    ['李四', '2026/5', 'abc', 'x'], // 数字非法 + 布尔非法
  ];
  const { rows: mapped, errors } = mapAndValidate(headers, rows, TARGET_CONFIG);
  assert.equal(mapped[0].staff_name, '张三');
  assert.equal(mapped[0].target_month, '2026-03');
  assert.equal(mapped[0].target_amount_yuan, 1200.5);
  assert.equal(mapped[0].is_sales, true);
  const requiredErr = errors.find((e) => e.row === 3 && e.field === 'staff_name');
  assert.ok(requiredErr, '应报必填错误');
  assert.ok(errors.some((e) => e.row === 4 && e.field === 'target_amount_yuan'), '应报数字错误');
  assert.ok(errors.some((e) => e.row === 4 && e.field === 'is_sales'), '应报布尔错误');
});

test('mapAndValidate 范围校验', () => {
  const { errors } = mapAndValidate(
    ['销售', '月份', '回款目标', '是否销售'],
    [['张三', '2026-03', '-100', '是']],
    TARGET_CONFIG,
  );
  assert.ok(errors.some((e) => e.field === 'target_amount_yuan' && /小于最小值/.test(e.message)));
});

test('mapAndValidate uniqueKey 去重报错', () => {
  const { errors } = mapAndValidate(
    ['销售', '月份', '回款目标', '是否销售'],
    [
      ['张三', '2026-03', '100', '是'],
      ['张三', '2026-03', '200', '是'], // 与第2行重复
      ['李四', '2026-03', '300', '否'],
    ],
    TARGET_CONFIG,
  );
  const dup = errors.find((e) => /与第 2 行重复/.test(e.message));
  assert.ok(dup, '应报重复行错误');
  assert.equal(dup.row, 3);
});

test('mapAndValidate 必填列整列缺失应阻断（报错而非告警）', () => {
  // 只给了销售列，缺 目标月份/回款目标 两个必填列
  const { errors, warnings } = mapAndValidate(
    ['销售'],
    [['张三']],
    TARGET_CONFIG,
  );
  assert.ok(errors.some((e) => e.row === 0 && e.field === 'target_month' && /未在 Excel 表头中找到/.test(e.message)));
  assert.ok(errors.some((e) => e.row === 0 && e.field === 'target_amount_yuan'));
  // 可选列缺失只进 warnings（不进 errors）
  assert.ok(warnings.some((w) => w.includes('是否销售')));
  assert.ok(!errors.some((e) => e.field === 'is_sales'));
});

test('mapAndValidate 整行空行跳过', () => {  const { rows, errors } = mapAndValidate(
    ['销售', '月份', '回款目标', '是否销售'],
    [['张三', '2026-03', '100', '是'], [null, null, null, null]],
    TARGET_CONFIG,
  );
  assert.equal(rows.length, 1);
  assert.equal(errors.length, 0);
});

test('buildTemplateWorkbook 生成表头与示例并可被重新解析', () => {
  const bytes = buildTemplateWorkbook(TARGET_CONFIG);
  const wb = XLSX.read(bytes, { type: 'array' });
  assert.ok(wb.SheetNames.includes('导入数据'));
  assert.ok(wb.SheetNames.includes('说明'));
  const { headers, rawRows } = extractRows(wb, '导入数据');
  assert.deepEqual(headers, ['人员名称', '目标月份', '回款目标(元)', '是否销售']);
  assert.equal(rawRows.length, 1); // 一行示例
});

test('buildTemplateWorkbook 配置改了表头就跟着变（验证可更改性）', () => {
  const cfg = { ...TARGET_CONFIG, columns: TARGET_CONFIG.columns.map((c) => ({ ...c, header: `${c.header}!` })) };
  const bytes = buildTemplateWorkbook(cfg);
  const wb = XLSX.read(bytes, { type: 'array' });
  const { headers } = extractRows(wb, '导入数据');
  assert.deepEqual(headers, ['人员名称!', '目标月份!', '回款目标(元)!', '是否销售!']);
});
