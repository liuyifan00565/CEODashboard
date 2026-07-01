/* 更新时间: 2026-06-24 16:44:50  更新内容: 修复 flatpickr 中文本地化解析，日历弹层月份、星期和范围分隔符改为中文。 */
import { useEffect, useRef } from 'react'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import 'flatpickr/dist/themes/dark.css'
import * as zhMod from 'flatpickr/dist/l10n/zh.js'
import GlassSurface from './GlassSurface/GlassSurface'
import './DateRangePicker.css'

// 健壮地解析中文本地化对象，兼容 CommonJS / ESM 不同的 import 形态
const zh = zhMod.Mandarin || zhMod.zh || (zhMod.default && (zhMod.default.zh || zhMod.default.Mandarin || zhMod.default)) || undefined
if (zh) {
  try { flatpickr.localize(zh) } catch { /* 本地化失败时静默降级为默认英文 */ }
}

const DEFAULT_RANGE = ['2026-06-01', '2026-06-30']

export default function DateRangePicker({ value, onChange }) {
  const inputRef = useRef(null)
  const fpRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const initialRangeRef = useRef(value && value.length ? value : DEFAULT_RANGE)
  onChangeRef.current = onChange

  // 初始化 flatpickr 实例（仅一次），卸载时销毁
  useEffect(() => {
    if (!inputRef.current) return
    const fp = flatpickr(inputRef.current, {
      mode: 'range',
      dateFormat: 'Y-m-d',
      defaultDate: initialRangeRef.current,
      locale: zh,
      onChange: (dates) => {
        if (onChangeRef.current) onChangeRef.current(dates)
      },
    })
    fpRef.current = fp
    return () => {
      try { fp.destroy() } catch { /* ignore */ }
      fpRef.current = null
    }
  }, [])

  // 受控：外部 value 变化时同步到实例（不触发 onChange）
  useEffect(() => {
    const fp = fpRef.current
    if (!fp || !value || !value.length) return
    fp.setDate(value, false)
  }, [value])

  return (
    <GlassSurface
      width="100%"
      height={42}
      borderRadius={12}
      brightness={58}
      blur={12}
      displace={1}
      backgroundOpacity={0.07}
      distortionScale={-120}
      className="fp-glass"
    >
      <div className="fp-wrap">
        <span className="fp-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4.5" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 2.5v4M16 2.5v4" />
          </svg>
        </span>
        <input
          ref={inputRef}
          className="fp-input"
          type="text"
          readOnly
          placeholder="选择日期范围"
        />
      </div>
    </GlassSurface>
  )
}
