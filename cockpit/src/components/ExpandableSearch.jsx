/*
 Update time: 2026-07-02 17:18:50 CST
 Update content: Add Word-style result counter and Enter-to-next search navigation.
*/
/*
 更新时间: 2026-07-02 16:28:00 CST
 更新内容: 展开式搜索入口改用统一 AppIcon 搜索图标。
*/
import { useState, useRef } from 'react';
import GlassSurface from './GlassSurface/GlassSurface';
import AppIcon from './AppIcon';

export default function ExpandableSearch({ onChange, currentIndex = 0, totalResults = 0, onNext }) {
  const [expanded, setExpanded] = useState(false);
  const [val, setVal] = useState('');
  const inputRef = useRef(null);
  const hasQuery = val.trim().length > 0;
  const displayIndex = hasQuery ? currentIndex : 0;

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
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (hasQuery) onNext?.();
    }
  }

  return (
    <div className={`search-wrap${expanded ? ' search-wrap--expanded' : ''}`} onMouseEnter={open}>
      <GlassSurface
        width={expanded ? 318 : 54}
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
            <AppIcon name="search" size={18} />
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
            onKeyDown={handleKeyDown}
            placeholder="请输入关键词"
            className="search-input"
            style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? 'auto' : 'none' }}
          />
          {expanded && hasQuery && (
            <button
              type="button"
              className="search-count"
              aria-label="跳转到下一个搜索结果"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onNext?.()}
            >
              {`${displayIndex}/${totalResults}`}
            </button>
          )}
        </div>
      </GlassSurface>
    </div>
  );
}
