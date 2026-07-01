/* 更新时间: 2026-06-24 16:19:31  更新内容: 年/月/日筛选只保留 ReactBits GlassSurface 液态玻璃底，移除内部灰底边框叠层。 */
import { useRef, useState, useLayoutEffect, useCallback } from 'react'
import GlassSurface from './GlassSurface/GlassSurface'
import './Segmented.css'

export default function Segmented({ options = [], value, onChange }) {
  const wrapRef = useRef(null)
  const btnRefs = useRef([])
  const [thumb, setThumb] = useState({ left: 0, width: 0, ready: false })

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  )
  const glassWidth = options.reduce((total, opt) => {
    const labelLength = String(opt.label ?? '').length
    return total + Math.max(44, labelLength * 15 + 30)
  }, 8)

  const measure = useCallback(() => {
    const btn = btnRefs.current[activeIndex]
    if (!btn) return
    setThumb({ left: btn.offsetLeft, width: btn.offsetWidth, ready: true })
  }, [activeIndex])

  useLayoutEffect(() => {
    measure()
  }, [measure, options.length])

  useLayoutEffect(() => {
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure])

  return (
    <GlassSurface
      width={glassWidth}
      height={42}
      borderRadius={12}
      brightness={58}
      blur={12}
      displace={1}
      backgroundOpacity={0.07}
      distortionScale={-120}
      className="sgm-glass"
    >
      <div className="sgm-wrap" ref={wrapRef} role="tablist">
        <span
          className="sgm-thumb"
          style={{
            transform: `translateX(${thumb.left}px)`,
            width: thumb.width,
            opacity: thumb.ready ? 1 : 0,
          }}
          aria-hidden="true"
        />
        {options.map((opt, i) => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={selected}
              ref={(el) => (btnRefs.current[i] = el)}
              className={`sgm-btn${selected ? ' sgm-btn--active' : ''}`}
              onClick={() => onChange && onChange(opt.value)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </GlassSurface>
  )
}
