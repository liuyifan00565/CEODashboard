/*
 更新时间: 2026-07-14 11:00:00 CST
 更新内容: 新增登录功能所需的 dim_user / user_session 表结构，首次访问时自动建表（幂等），
          role 预留字符串字段供后续按岗位配置查看范围/权限使用。
*/
import { queryRows } from './db.js';

async function tableExists(connection, tableName) {
  const rows = await queryRows(
    connection,
    'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1',
    [tableName],
  );
  return rows.length > 0;
}

/**
 * 登录功能表结构：
 * - dim_user：账号与口令哈希，role 先留自由文本（如 admin），后续按岗位拆分权限时直接复用该列。
 * - user_session：服务端会话，登出/封禁可直接删行使会话失效，不依赖客户端 JWT 自我过期。
 */
export async function ensureAuthSchema(connection) {
  if (!(await tableExists(connection, 'dim_user'))) {
    await connection.execute(`
      CREATE TABLE dim_user (
        user_id BIGINT NOT NULL AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(64) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'admin',
        is_enabled TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        UNIQUE KEY uq_user_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录账号'
    `);
  }

  if (!(await tableExists(connection, 'user_session'))) {
    await connection.execute(`
      CREATE TABLE user_session (
        session_token VARCHAR(64) NOT NULL,
        user_id BIGINT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        PRIMARY KEY (session_token),
        KEY idx_user_session_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录会话'
    `);
  }
}
