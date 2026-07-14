/*
 更新时间: 2026-07-14 11:00:00 CST
 更新内容: 新增登录相关前端请求封装：fetchCurrentUser/login/logout，统一走 credentials:'include'
          携带会话 Cookie，供 App.jsx 登录门禁使用。
*/

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** 查询当前登录状态；未登录返回 null，不抛错。 */
export async function fetchCurrentUser() {
  const response = await fetch('/api/auth/me', { credentials: 'include' });
  if (!response.ok) return null;
  const body = await parseJson(response);
  return body?.user ?? null;
}

/** 登录成功返回 user；失败抛出带中文提示的 Error。 */
export async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(body?.error || '登录失败');
  }
  return body.user;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}
