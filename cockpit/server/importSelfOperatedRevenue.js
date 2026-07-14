/*
 更新时间: 2026-07-14 13:18:00 CST
 更新内容: 新增服务器端自营收入 Excel 导入命令，支持替换旧订单并清理演示事实与目标数据。
*/
import fs from 'node:fs/promises';
import path from 'node:path';

import { createDbConnection } from './db.js';
import { loadLocalEnv } from './env.js';
import { parseSelfOperatedRevenueWorkbook, persistSelfOperatedRevenue } from './selfOperatedRevenueImport.js';

const args = process.argv.slice(2);
const filePath = args.find((arg) => !arg.startsWith('--'));
if (!filePath) {
  console.error('Usage: node server/importSelfOperatedRevenue.js <workbook.xlsx> [--replace-demo-data] [--append]');
  process.exit(1);
}

loadLocalEnv(path.resolve('.'));
const parsed = parseSelfOperatedRevenueWorkbook(await fs.readFile(filePath), path.basename(filePath));
const connection = await createDbConnection();
try {
  const result = await persistSelfOperatedRevenue(connection, parsed, {
    replaceExisting: !args.includes('--append'),
    replaceDemoData: args.includes('--replace-demo-data'),
  });
  console.log(JSON.stringify(result, null, 2));
} finally {
  await connection.end();
}

