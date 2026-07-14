/*
 更新时间: 2026-07-14 15:35:00 CST
 更新内容: 新增公司级月度业绩 Excel 导入命令，幂等替换同名工作簿事实并同步年度/月度目标。
*/
import fs from 'node:fs/promises';
import path from 'node:path';

import { parseCompanyRevenueWorkbook, persistCompanyRevenue } from './companyRevenueImport.js';
import { createDbConnection } from './db.js';
import { loadLocalEnv } from './env.js';

const filePath = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
if (!filePath) {
  console.error('Usage: node server/importCompanyRevenue.js <workbook.xlsx>');
  process.exit(1);
}

loadLocalEnv(path.resolve('.'));
const parsed = parseCompanyRevenueWorkbook(await fs.readFile(filePath), path.basename(filePath));
const connection = await createDbConnection();
try {
  console.log(JSON.stringify(await persistCompanyRevenue(connection, parsed), null, 2));
} finally {
  await connection.end();
}
