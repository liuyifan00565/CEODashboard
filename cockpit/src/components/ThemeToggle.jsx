/*
 更新时间: 2026-06-25 19:08:50
 更新内容: 新增黑白主题切换按钮，使用 GlassSurface 圆形按钮并持久化主题选择。
*/
import { useEffect, useState } from 'react';
import GlassSurface from './GlassSurface/GlassSurface';

const THEME_KEY = 'ceo-dashboard-theme';
const THEMES = new Set(['dark', 'light']);

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (THEMES.has(stored)) return stored;
  } catch {
    // localStorage may be unavailable in privacy modes.
  }

  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const nextLabel = theme === 'dark' ? '白色' : '黑色';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Keep the visible theme even if persistence is blocked.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="theme-toggle">
      <GlassSurface
        width={54}
        height={54}
        borderRadius={27}
        brightness={62}
        blur={12}
        displace={1}
        backgroundOpacity={0.06}
        distortionScale={-150}
      >
        <button
          type="button"
          className="theme-toggle__button"
          onClick={toggleTheme}
          aria-label={`切换到${nextLabel}主题`}
          aria-pressed={theme === 'light'}
          title={`切换到${nextLabel}主题`}
        >
          {theme === 'dark' ? (
            <svg className="theme-toggle__icon" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="9" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            <svg className="theme-toggle__icon" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M14.7 11.2A6.4 6.4 0 0 1 6.8 3.3 6.4 6.4 0 1 0 14.7 11.2Z"
                fill="none"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </button>
      </GlassSurface>
    </div>
  );
}
