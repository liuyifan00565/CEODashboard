/*
 更新时间: 2026-07-02 16:28:00 CST
 更新内容: 主题切换按钮改用统一 AppIcon 太阳/月亮图标。
*/
import { useEffect, useState } from 'react';
import GlassSurface from './GlassSurface/GlassSurface';
import AppIcon from './AppIcon';

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
          <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} className="theme-toggle__icon" size={18} />
        </button>
      </GlassSurface>
    </div>
  );
}
