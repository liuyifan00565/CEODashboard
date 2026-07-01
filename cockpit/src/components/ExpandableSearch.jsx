/*
 更新时间: 2026-06-25 18:45:25
 更新内容: 删除展开式搜索框的快捷键提示，并将展开态输入提示改为“请输入关键词”。
*/
import { useState, useRef } from 'react';
import GlassSurface from './GlassSurface/GlassSurface';

export default function ExpandableSearch({ onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [val, setVal] = useState('');
  const inputRef = useRef(null);

  const open = () => {
    setExpanded(true);
    setTimeout(() => {
      try {
        inputRef.current?.focus({ preventScroll: true });
      } catch {
        inputRef.current?.focus();
      }
    }, 140);
  };
  const close = () => {
    if (!val) setExpanded(false);
  };

  return (
    <div className={`search-wrap${expanded ? ' search-wrap--expanded' : ''}`} onMouseEnter={open}>
      <GlassSurface
        width={expanded ? 240 : 54}
        height={54}
        borderRadius={27}
        brightness={62}
        blur={12}
        displace={1}
        backgroundOpacity={0.06}
        distortionScale={-150}
      >
        <div className="search-inner">
          <button className="search-ico" onClick={open} aria-label="搜索" aria-expanded={expanded}>
            <svg width="18" height="18" viewBox="0 0 16 16">
              <path d="M11 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-.7 3.3 3 3" stroke="currentColor" fill="none" strokeWidth="1.5" />
            </svg>
          </button>
          <input
            ref={inputRef}
            value={val}
            onChange={(e) => {
              const next = e.target.value;
              setVal(next);
              if (onChange) onChange(next);
            }}
            onBlur={close}
            placeholder="请输入关键词"
            className="search-input"
            style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? 'auto' : 'none' }}
          />
        </div>
      </GlassSurface>
    </div>
  );
}
