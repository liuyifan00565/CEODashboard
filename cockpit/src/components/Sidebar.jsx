/* 更新时间: 2026-07-14 21:45:00 CST  更新内容: 新增可选 onLogout prop，在品牌头区（标题+月份+用户名下方）
   加一个小的退出登录按钮，不再由 App.jsx 在 Sidebar 外部单独渲染一行。 */
/* 更新时间: 2026-07-13 14:25:00 CST  更新内容: 侧栏品牌副标题拆分为独立行，支持月份左对齐、当前视角右对齐。 */
/* 更新时间: 2026-07-09 18:26:40 CST  更新内容: 侧边导航顶部新增福客驾驶舱品牌 logo 区，承接主内容顶部移出的品牌识别信息。 */
/* 更新时间: 2026-07-09 13:13:45 CST  更新内容: 侧边导航新增模式换组过渡，经营总览与数据维护切换时先柔和淡出再进入。 */
/* 更新时间: 2026-07-05 16:12:00 CST  更新内容: 侧边导航恢复 220px 图标加文字分组结构，兼顾管理识别效率与轻玻璃质感。 */
/* 更新时间: 2026-07-03 23:39:28 CST  更新内容: 降低左侧导航玻璃容器的高光、模糊和折射强度。 */
/* 更新时间: 2026-07-02 16:28:00 CST  更新内容: 侧边导航改用统一 AppIcon 线性图标体系，移除字符占位图标。 */
import { useEffect, useRef, useState } from 'react';
import GlassSurface from './GlassSurface/GlassSurface'
import AppIcon from './AppIcon';
import MetallicPaint from './MetallicPaint/MetallicPaint';
import './Sidebar.css'

const SIDEBAR_LEAVE_MS = 110;
const SIDEBAR_ENTER_MS = 220;

function groupItemsBySection(items) {
  return items.reduce((sections, item) => {
    const title = item.section ?? '导航';
    let section = sections.find((candidate) => candidate.title === title);
    if (!section) {
      section = { title, items: [] };
      sections.push(section);
    }
    section.items.push(item);
    return sections;
  }, []);
}

export default function Sidebar({
  items = [],
  active,
  onChange,
  transitionKey = 'default',
  brandTitle = '福客经营驾驶舱',
  brandMeta = '',
  onLogout,
}) {
  const [transitionState, setTransitionState] = useState(() => ({
    items,
    active,
    transitionKey,
    phase: 'ready',
  }));
  const latestPropsRef = useRef({ items, active, transitionKey });
  const transitionKeyRef = useRef(transitionKey);
  const enterTimerRef = useRef(0);

  latestPropsRef.current = { items, active, transitionKey };

  useEffect(() => {
    if (transitionKeyRef.current === transitionKey) return undefined;

    transitionKeyRef.current = transitionKey;
    setTransitionState((current) => ({ ...current, phase: 'leaving' }));

    const leaveTimer = window.setTimeout(() => {
      const latest = latestPropsRef.current;
      setTransitionState({
        items: latest.items,
        active: latest.active,
        transitionKey: latest.transitionKey,
        phase: 'entering',
      });

      const enterTimer = window.setTimeout(() => {
        const settled = latestPropsRef.current;
        enterTimerRef.current = 0;
        setTransitionState({
          items: settled.items,
          active: settled.active,
          transitionKey: settled.transitionKey,
          phase: 'ready',
        });
      }, SIDEBAR_ENTER_MS);

      enterTimerRef.current = enterTimer;
    }, SIDEBAR_LEAVE_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current);
        enterTimerRef.current = 0;
      }
    };
  }, [transitionKey]);

  const isSettled = transitionState.phase === 'ready' && transitionState.transitionKey === transitionKey;
  const visibleItems = isSettled ? items : transitionState.items;
  const visibleActive = isSettled ? active : transitionState.active;
  const visiblePhase = transitionState.transitionKey === transitionKey ? transitionState.phase : 'leaving';
  const sections = groupItemsBySection(visibleItems);

  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={24}
      brightness={46}
      blur={12}
      displace={0.22}
      backgroundOpacity={0.052}
      distortionScale={-44}
      className="sb-glass"
    >
      <nav className={`sb-root sb-root--${visiblePhase}`} aria-label="主导航" data-transition-key={transitionKey}>
        <div className="sb-brand" aria-label={`${brandTitle}${brandMeta ? ` ${brandMeta}` : ''}`}>
          <span className="sb-brand-logo" aria-hidden="true">
            <MetallicPaint
              imageSrc="/logo-black.png"
              seed={64}
              scale={3.4}
              refraction={0.018}
              blur={0.014}
              liquid={0.68}
              speed={0.28}
              brightness={1.72}
              contrast={0.82}
              lightColor="#ffffff"
              darkColor="#050505"
              tintColor="#f0d99a"
              chromaticSpread={1.8}
              distortion={0.72}
              contour={0.28}
            />
          </span>
          <span className="sb-brand-copy">
            <b>{brandTitle}</b>
            {brandMeta && (
              <small>
                {brandMeta.split('\n').map((line, index) => (
                  <span key={`${line}-${index}`}>{line}</span>
                ))}
              </small>
            )}
            {onLogout && (
              <button type="button" className="sb-brand-logout" onClick={onLogout}>退出登录</button>
            )}
          </span>
        </div>
        {sections.map((section) => (
          <section className="sb-section" key={section.title}>
            <span className="sb-section-title">{section.title}</span>
            <ul className="sb-list">
              {section.items.map((item) => (
                <li key={item.key} className="sb-list-item">
                  <button
                    type="button"
                    className={`sb-item${item.key === visibleActive ? ' sb-item--active' : ''}`}
                    onClick={() => onChange && onChange(item.key)}
                    aria-label={item.name}
                    title={item.name}
                    disabled={Boolean(item.disabled)}
                  >
                    <AppIcon name={item.icon ?? item.key} className="sb-icon" size={16} />
                    <span className="sb-name">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </GlassSurface>
  )
}
