/*
 更新时间: 2026-07-07 16:30:00 CST
 更新内容: 新增可复用 GlassSelect 组件——深色玻璃 + 银紫微光的下拉选择器，
          替代原生 select 白底下拉穿帮；面板走 createPortal 避免被工具栏 overflow 裁切，
          支持键盘上下/回车/Esc、外击关闭、选中银紫高亮 + ✓。
          API 与原生 select 对齐：value / onChange(value) / options / aria-label / className，
          可复用到任意需要下拉/悬浮面板的场景。
*/
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './GlassSelect.css';

const ARROW_DOWN = 'ArrowDown';
const ARROW_UP = 'ArrowUp';
const ENTER = 'Enter';
const ESCAPE = 'Escape';
const TAB = 'Tab';
const SPACE = ' ';

const OPTION_HEIGHT = 36;
const PANEL_PADDING = 12;

function normalizeOptions(options) {
  return options.map((option) => {
    if (option == null) return { value: '', label: '' };
    if (typeof option === 'object') {
      return { value: option.value, label: option.label ?? String(option.value) };
    }
    return { value: option, label: String(option) };
  });
}

function initialActiveIndex(options, value) {
  const idx = options.findIndex((option) => option.value === value);
  return idx >= 0 ? idx : 0;
}

/**
 * GlassSelect — 深色玻璃下拉选择器。
 *
 * 关闭态渲染为一个玻璃按钮（值 + ▾），展开态通过 createPortal 把面板挂到 body，
 * 避免被父级 overflow / transform 裁切。面板样式与顶部按钮同体系，
 * 选中项使用品牌银紫渐变 + ✓，hover 使用更轻的白色蒙层。
 *
 * 完全不依赖原生 option，因此不会出现白底 + 系统蓝的穿帮。
 */
export default function GlassSelect({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  className = '',
  triggerClassName = '',
  placeholder = '请选择',
  align = 'start',
  disabled = false,
}) {
  const opts = useMemo(() => normalizeOptions(options), [options]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => initialActiveIndex(opts, value));
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 0 });

  const selected = opts.find((option) => option.value === value) ?? null;

  function placePanel() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight
      || opts.length * OPTION_HEIGHT + PANEL_PADDING;
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < panelHeight + 12 && rect.top > panelHeight + 12;
    const top = dropUp ? Math.max(8, rect.top - panelHeight - 8) : rect.bottom + 8;
    const left = align === 'end' ? Math.max(8, rect.right - Math.max(rect.width, 160)) : rect.left;
    setCoords({ top, left, minWidth: rect.width });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    placePanel();
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleScroll() { placePanel(); }
    function handleResize() { placePanel(); }
    function handlePointerDown(event) {
      if (triggerRef.current?.contains(event.target)) return;
      if (panelRef.current?.contains(event.target)) return;
      setOpen(false);
    }
    function handleKey(event) {
      if (event.key === ESCAPE) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  // keep active index synced with value while closed so first open lands on the current item
  useEffect(() => {
    if (!open) setActiveIndex(initialActiveIndex(opts, value));
  }, [value, open, opts]);

  function choose(option) {
    onChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event) {
    if (!open) {
      if (event.key === ARROW_DOWN || event.key === ARROW_UP || event.key === ENTER || event.key === SPACE) {
        event.preventDefault();
        setActiveIndex(initialActiveIndex(opts, value));
        setOpen(true);
      }
      return;
    }
    if (event.key === ARROW_DOWN) {
      event.preventDefault();
      setActiveIndex((idx) => Math.min(opts.length - 1, idx + 1));
    } else if (event.key === ARROW_UP) {
      event.preventDefault();
      setActiveIndex((idx) => Math.max(0, idx - 1));
    } else if (event.key === ENTER || event.key === SPACE) {
      event.preventDefault();
      const option = opts[activeIndex];
      if (option) choose(option);
    } else if (event.key === TAB) {
      setOpen(false);
    }
  }

  const triggerClasses = ['glass-select__trigger', className, triggerClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="glass-select">
      <button
        ref={triggerRef}
        type="button"
        className={triggerClasses}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="glass-select__value">{selected ? selected.label : placeholder}</span>
        <span className={`glass-select__chevron${open ? ' is-open' : ''}`} aria-hidden>▾</span>
      </button>
      {open && createPortal(
        <div
          ref={panelRef}
          className="glass-select__panel"
          role="listbox"
          aria-label={ariaLabel}
          style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: coords.minWidth }}
        >
          {opts.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            const classes = [
              'glass-select__option',
              isSelected ? 'is-selected' : '',
              isActive ? 'is-active' : '',
            ].filter(Boolean).join(' ');
            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={classes}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                <span className="glass-select__option-label">{option.label}</span>
                <span className="glass-select__check" aria-hidden>{isSelected ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
