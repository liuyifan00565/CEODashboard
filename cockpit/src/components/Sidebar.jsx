/* 更新时间: 2026-07-01 14:22:55 CST  更新内容: 左侧导航支持新增“算力用量分析”入口，并补充第六个导航图标。 */
import GlassSurface from './GlassSurface/GlassSurface'
import './Sidebar.css'

const ICONS = ['⬡', '◈', '▤', '⊞', '◎', '◌']

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
          {items.map((item, i) => (
            <li
              key={item.key}
              className={`sb-item${item.key === active ? ' sb-item--active' : ''}`}
              onClick={() => onChange && onChange(item.key)}
            >
              <span className="sb-icon">{ICONS[i % ICONS.length]}</span>
              <span className="sb-name">{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>
    </GlassSurface>
  )
}
