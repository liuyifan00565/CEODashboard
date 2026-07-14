/*
 更新时间: 2026-07-14 11:00:00 CST
 更新内容: 新增登录页：账号密码表单，复用经营驾驶舱玻璃卡片视觉，提交态禁用按钮并展示中文错误提示。
*/
import { useState } from 'react';
import { login } from '../lib/auth';
import './LoginPage.css';

export default function LoginPage({ onLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setStatus('error');
      setError('请输入账号和密码');
      return;
    }
    setStatus('submitting');
    setError('');
    try {
      const user = await login(username.trim(), password);
      onLoggedIn(user);
    } catch (err) {
      setStatus('error');
      setError(err.message || '登录失败');
    }
  }

  return (
    <div className="login-page">
      <div className="bg" aria-hidden="true" />
      <form className="login-card" onSubmit={handleSubmit}>
        <b className="login-card__title">福客经营驾驶舱</b>
        <span className="login-card__subtitle">请登录后查看经营数据</span>

        <label className="login-field">
          <span>账号</span>
          <input
            className="login-input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={status === 'submitting'}
          />
        </label>

        <label className="login-field">
          <span>密码</span>
          <input
            className="login-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status === 'submitting'}
          />
        </label>

        {status === 'error' && <span className="login-error" role="alert">{error}</span>}

        <button className="login-submit" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? '登录中…' : '登录'}
        </button>
      </form>
    </div>
  );
}
