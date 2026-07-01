/* 更新时间: 2026-06-24  更新内容: 新建 HighlightBeam 流动描边包裹器, active 时四周旋转白色光束描边 + 柔和外发光, 平滑淡入淡出, 不裁剪子内容 */
import './HighlightBeam.css'

export default function HighlightBeam({ active = false, children, className = '', radius = 16 }) {
  const cls = ['hlb-wrap', active ? 'hlb-active' : '', className].filter(Boolean).join(' ')
  return (
    <div className={cls} style={{ '--hlb-radius': `${radius}px` }}>
      <span className="hlb-beam" aria-hidden="true" />
      <div className="hlb-content">{children}</div>
    </div>
  )
}
