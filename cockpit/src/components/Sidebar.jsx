/* 更新时间: 2026-07-05 15:29:01 CST  更新内容: 侧边导航改为窄栏图标优先结构，并为每个入口补充可访问标签。 */
/* 更新时间: 2026-07-03 23:39:28 CST  更新内容: 降低左侧导航玻璃容器的高光、模糊和折射强度。 */
/* 更新时间: 2026-07-02 16:28:00 CST  更新内容: 侧边导航改用统一 AppIcon 线性图标体系，移除字符占位图标。 */
import GlassSurface from './GlassSurface/GlassSurface'
import AppIcon from './AppIcon';
import './Sidebar.css'

export default function Sidebar({ items = [], active, onChange }) {
  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={24}
      brightness={48}
      blur={10}
      displace={0.28}
      backgroundOpacity={0.055}
      distortionScale={-48}
      className="sb-glass"
    >
      <nav className="sb-root" aria-label="主导航">
        <ul className="sb-list">
          {items.map((item) => (
            <li key={item.key} className="sb-list-item">
              <button
                type="button"
                className={`sb-item${item.key === active ? ' sb-item--active' : ''}`}
                onClick={() => onChange && onChange(item.key)}
                aria-label={item.name}
                title={item.name}
              >
                <AppIcon name={item.icon ?? item.key} className="sb-icon" size={19} />
                <span className="sb-name">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </GlassSurface>
  )
}
