/*
 更新时间: 2026-07-14 11:00:00 CST
 更新内容: 新增登录功能：POST /api/auth/login、POST /api/auth/logout、GET /api/auth/me。
          口令用内置 crypto.scrypt 加盐哈希（不引入新依赖），会话为服务端存储的随机 token（Cookie 下发），
          登出/封禁账号可直接失效会话。requireAuth 包一层校验供后续接入权限体系时直接复用，
          本次暂未挂到既有业务接口上（避免影响正在并行开发的交付看板/数据健康检查）。
*/
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { createDbConnection, queryRows } from './db.js';
import { ensureAuthSchema } from './authSchema.js';

const scrypt = promisify(scryptCallback);

const SESSION_COOKIE = 'ceo_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天
const SCRYPT_KEYLEN = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(String(password), salt, SCRYPT_KEYLEN);
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  const [salt, hex] = String(storedHash || '').split(':');
  if (!salt || !hex) return false;
  const derived = await scrypt(String(password), salt, SCRYPT_KEYLEN);
  const stored = Buffer.from(hex, 'hex');
  if (stored.length !== derived.length) return false;
  return timingSafeEqual(stored, derived);
}

export function parseCookies(req) {
  const header = req.headers?.cookie;
  const map = new Map();
  if (!header) return map;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) map.set(key, decodeURIComponent(value));
  }
  return map;
}

function isHttps(req) {
  return req.headers?.['x-forwarded-proto'] === 'https';
}

function setSessionCookie(req, res, token, maxAgeSeconds) {
  const attrs = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isHttps(req)) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function clearSessionCookie(req, res) {
  const attrs = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isHttps(req)) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req, limitBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error('请求体过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('请求体不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });
}

function toUserPayload(row) {
  return {
    id: row.user_id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
  };
}

export async function createSession(connection, userId) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await connection.execute(
    'INSERT INTO user_session (session_token, user_id, expires_at) VALUES (?, ?, ?)',
    [token, userId, expiresAt],
  );
  return token;
}

export async function getSessionUser(connection, token) {
  if (!token) return null;
  const rows = await queryRows(
    connection,
    `SELECT u.user_id, u.username, u.display_name, u.role, u.is_enabled
     FROM user_session s
     JOIN dim_user u ON u.user_id = s.user_id
     WHERE s.session_token = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [token],
  );
  const user = rows[0];
  if (!user || Number(user.is_enabled) !== 1) return null;
  return toUserPayload(user);
}

export async function deleteSession(connection, token) {
  if (!token) return;
  await connection.execute('DELETE FROM user_session WHERE session_token = ?', [token]);
}

/** POST /api/auth/login { username, password } */
export async function handleAuthLoginRequest(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, 400, { error: err.message });
    return;
  }

  const username = String(body?.username || '').trim();
  const password = String(body?.password || '');
  if (!username || !password) {
    sendJson(res, 400, { error: '请输入账号和密码' });
    return;
  }

  const connection = await createDbConnection();
  try {
    await ensureAuthSchema(connection);
    const rows = await queryRows(
      connection,
      'SELECT user_id, username, password_hash, display_name, role, is_enabled FROM dim_user WHERE username = ? LIMIT 1',
      [username],
    );
    const user = rows[0];
    if (!user || Number(user.is_enabled) !== 1) {
      sendJson(res, 401, { error: '账号或密码错误' });
      return;
    }
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      sendJson(res, 401, { error: '账号或密码错误' });
      return;
    }
    const token = await createSession(connection, user.user_id);
    setSessionCookie(req, res, token, SESSION_TTL_MS / 1000);
    sendJson(res, 200, { user: toUserPayload(user) });
  } finally {
    await connection.end();
  }
}

/** POST /api/auth/logout */
export async function handleAuthLogoutRequest(req, res) {
  const token = parseCookies(req).get(SESSION_COOKIE);
  const connection = await createDbConnection();
  try {
    await ensureAuthSchema(connection);
    await deleteSession(connection, token);
  } finally {
    await connection.end();
  }
  clearSessionCookie(req, res);
  sendJson(res, 200, { ok: true });
}

/** GET /api/auth/me */
export async function handleAuthMeRequest(req, res) {
  const token = parseCookies(req).get(SESSION_COOKIE);
  const connection = await createDbConnection();
  try {
    await ensureAuthSchema(connection);
    const user = await getSessionUser(connection, token);
    if (!user) {
      sendJson(res, 401, { user: null });
      return;
    }
    sendJson(res, 200, { user });
  } finally {
    await connection.end();
  }
}

/**
 * 供后续接入权限体系时复用：包一层 session 校验，未登录直接 401，已登录把 user 挂到 req.user 再调用 handler。
 * 本次未接入既有业务接口。
 */
export function requireAuth(handler) {
  return async function wrapped(req, res) {
    const token = parseCookies(req).get(SESSION_COOKIE);
    const connection = await createDbConnection();
    let user;
    try {
      await ensureAuthSchema(connection);
      user = await getSessionUser(connection, token);
    } finally {
      await connection.end();
    }
    if (!user) {
      sendJson(res, 401, { error: '请先登录' });
      return;
    }
    req.user = user;
    return handler(req, res);
  };
}
