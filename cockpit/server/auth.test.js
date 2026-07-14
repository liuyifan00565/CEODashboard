/*
 更新时间: 2026-07-14 11:00:00 CST
 更新内容: 新增登录功能单测：口令哈希/校验、Cookie 解析、会话创建/查询/失效，均用假 connection 驱动真实函数，
          不连真实数据库（与 maintenanceSave.test.js 的假 connection 用法一致）。
*/
import assert from 'node:assert/strict';
import test from 'node:test';

import { hashPassword, verifyPassword, parseCookies, createSession, getSessionUser, deleteSession } from './auth.js';

function makeConn({ userRow, sessionExpired = false } = {}) {
  const execs = [];
  const conn = {
    async execute(sql, params = []) {
      const normalized = String(sql).trim();
      if (/^INSERT INTO user_session/i.test(normalized)) {
        execs.push({ sql: normalized, params });
        return [{}];
      }
      if (/^SELECT[\s\S]*FROM user_session/i.test(normalized)) {
        if (!userRow || sessionExpired) return [[]];
        return [[{ ...userRow }]];
      }
      if (/^DELETE FROM user_session/i.test(normalized)) {
        execs.push({ sql: normalized, params });
        return [{ affectedRows: 1 }];
      }
      return [[]];
    },
  };
  return { conn, execs };
}

test('hashPassword produces a salted hash that verifyPassword accepts, and rejects wrong passwords', async () => {
  const hash = await hashPassword('correct horse battery staple');
  assert.match(hash, /^[0-9a-f]{32}:[0-9a-f]+$/);
  assert.equal(await verifyPassword('correct horse battery staple', hash), true);
  assert.equal(await verifyPassword('wrong password', hash), false);
});

test('hashPassword salts each call differently even for the same password', async () => {
  const first = await hashPassword('same-password');
  const second = await hashPassword('same-password');
  assert.notEqual(first, second);
});

test('verifyPassword rejects malformed stored hashes instead of throwing', async () => {
  assert.equal(await verifyPassword('anything', ''), false);
  assert.equal(await verifyPassword('anything', 'not-a-valid-hash'), false);
});

test('parseCookies reads the session cookie out of a raw Cookie header', () => {
  const cookies = parseCookies({ headers: { cookie: 'foo=bar; ceo_session=abc123; baz=qux' } });
  assert.equal(cookies.get('ceo_session'), 'abc123');
  assert.equal(cookies.get('foo'), 'bar');
});

test('parseCookies returns an empty map when there is no Cookie header', () => {
  const cookies = parseCookies({ headers: {} });
  assert.equal(cookies.size, 0);
});

test('createSession inserts a session row and returns a token usable by getSessionUser', async () => {
  const { conn, execs } = makeConn({
    userRow: { user_id: 1, username: 'ceo', display_name: 'CEO', role: 'admin', is_enabled: 1 },
  });
  const token = await createSession(conn, 1);
  assert.equal(typeof token, 'string');
  assert.equal(token.length, 64);
  assert.equal(execs.length, 1);
  assert.match(execs[0].sql, /INSERT INTO user_session/);

  const user = await getSessionUser(conn, token);
  assert.deepEqual(user, { id: 1, username: 'ceo', displayName: 'CEO', role: 'admin' });
});

test('getSessionUser returns null for a missing or expired session', async () => {
  const { conn } = makeConn({ sessionExpired: true });
  assert.equal(await getSessionUser(conn, 'some-token'), null);
  assert.equal(await getSessionUser(conn, ''), null);
});

test('getSessionUser returns null for a disabled account even with a valid session row', async () => {
  const { conn } = makeConn({
    userRow: { user_id: 2, username: 'disabled', display_name: 'Disabled', role: 'admin', is_enabled: 0 },
  });
  assert.equal(await getSessionUser(conn, 'token'), null);
});

test('deleteSession issues a DELETE keyed on the session token', async () => {
  const { conn, execs } = makeConn();
  await deleteSession(conn, 'token-to-remove');
  assert.equal(execs.length, 1);
  assert.match(execs[0].sql, /DELETE FROM user_session WHERE session_token = \?/);
  assert.deepEqual(execs[0].params, ['token-to-remove']);
});
