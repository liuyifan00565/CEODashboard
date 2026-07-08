/* 更新时间: 2026-07-08 17:23:00 CST  更新内容: 日期选择器默认范围复用统一 KPI 默认范围，当前先按 2026 年 6 月查看。 */
/* 更新时间: 2026-07-02 16:28:00 CST  更新内容: 日期选择器日历入口改用统一 AppIcon 线性图标。 */
import { useEffect, useRef } from 'react'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import 'flatpickr/dist/themes/dark.css'
import * as zhMod from 'flatpickr/dist/l10n/zh.js'
import GlassSurface from './GlassSurface/GlassSurface'
import AppIcon from './AppIcon';
import { DEFAULT_FILTER_RANGE } from '../lib/filterKpiCards';
import './DateRangePicker.css'

// 健壮地解析中文本地化对象，兼容 CommonJS / ESM 不同的 import 形态
const zh = zhMod.Mandarin || zhMod.zh || (zhMod.default && (zhMod.default.zh || zhMod.default.Mandarin || zhMod.default)) || undefined
if (zh) {
  try { flatpickr.localize(zh) } catch { /* 本地化失败时静默降级为默认英文 */ }
}

const DEFAULT_RANGE = DEFAULT_FILTER_RANGE

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
          <AppIcon name="calendar" size={16} />
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
