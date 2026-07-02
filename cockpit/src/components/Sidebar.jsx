/* 更新时间: 2026-07-02 16:28:00 CST  更新内容: 侧边导航改用统一 AppIcon 线性图标体系，移除字符占位图标。 */
import GlassSurface from './GlassSurface/GlassSurface'
import AppIcon from './AppIcon';
import './Sidebar.css'

export default function Sidebar({ items = [], active, onChange }) {
  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={16}
      brightness={58}
      blur={14}
      displace={1}
      backgroundOpacity={0.06}
      distortionScale={-120}
      className="sb-glass"
    >
      <nav className="sb-root">
        <div className="sb-title">导航</div>
        <ul className="sb-list">
          {items.map((item) => (
            <li
              key={item.key}
              className={`sb-item${item.key === active ? ' sb-item--active' : ''}`}
              onClick={() => onChange && onChange(item.key)}
            >
              <AppIcon name={item.icon ?? item.key} className="sb-icon" size={18} />
              <span className="sb-name">{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>
    </GlassSurface>
  )
}
