/*
 更新时间: 2026-07-14 11:00:00 CST
 更新内容: 新增登录账号创建/更新脚本，命令行执行：
          node server/seedAuthUser.js <username> <password> [displayName] [role]
          用户名已存在则更新密码/显示名/角色（幂等），供上线前手动建首个账号使用。
*/
import { createDbConnection } from './db.js';
import { ensureAuthSchema } from './authSchema.js';
import { hashPassword } from './auth.js';
import { loadLocalEnv } from './env.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

async function seedAuthUser({ username, password, displayName, role }) {
  const connection = await createDbConnection();
  try {
    await ensureAuthSchema(connection);
    const passwordHash = await hashPassword(password);
    await connection.execute(
      `INSERT INTO dim_user (username, password_hash, display_name, role, is_enabled)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), display_name = VALUES(display_name), role = VALUES(role), is_enabled = 1`,
      [username, passwordHash, displayName, role],
    );
  } finally {
    await connection.end();
  }
}

async function main() {
  const [username, password, displayName, role] = process.argv.slice(2);
  if (!username || !password) {
    console.error('用法：node server/seedAuthUser.js <username> <password> [displayName] [role]');
    process.exitCode = 1;
    return;
  }
  const projectRoot = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
  loadLocalEnv(projectRoot);
  await seedAuthUser({
    username,
    password,
    displayName: displayName || username,
    role: role || 'admin',
  });
  console.log(`账号已就绪：${username}`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err) => {
    console.error('创建账号失败：', err.message);
    process.exitCode = 1;
  });
}

export { seedAuthUser };
