/*
 更新时间: 2026-06-25 16:45:36
 更新内容: 主体大面板拖拽层新增释放后网格吸附，支持月度经营趋势等大卡片自动补位对齐。
*/
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  PANEL_LAYOUT_LIMITS,
  arrangePanelLayouts,
  createPanelLayouts,
  getPanelLayerHeight,
  movePanelLayout,
  resizePanelLayout,
  snapPanelLayouts,
} from '../lib/panelLayout';
import HighlightBeam from './HighlightBeam';
import './DraggablePanelLayer.css';

const DRAG_CLICK_THRESHOLD = 4;

function getViewport(frameWidth, frameHeight) {
  return {
    width: frameWidth,
    height: Math.max(window.innerHeight * 3, frameHeight * 3, PANEL_LAYOUT_LIMITS.defaultHeight * 4),
  };
}

function matchesSearch(keywords, term) {
  if (!term) return false;
  const normalized = term.trim().toLowerCase();
  if (!normalized) return false;
  return keywords.some((keyword) => String(keyword).toLowerCase().includes(normalized));
}

function getPanelLimits() {
  return PANEL_LAYOUT_LIMITS;
}

function getLocalFrameRect(frame) {
  const rect = frame.getBoundingClientRect();
  return {
    left: 0,
    top: 0,
    width: rect.width,
    height: Math.max(rect.height, window.innerHeight - rect.top - 24),
  };
}

export default function DraggablePanelLayer({ panels, searchTerm, mode }) {
  const frameRef = useRef(null);
  const actionRef = useRef(null);
  const frameRectRef = useRef(null);
  const orderRef = useRef(panels.map((panel) => panel.key));
  const suppressClickRef = useRef(false);
  const [layouts, setLayouts] = useState([]);
  const [layerHeight, setLayerHeight] = useState(PANEL_LAYOUT_LIMITS.defaultHeight);
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    const panelKeys = panels.map((panel) => panel.key);
    const panelKeySet = new Set(panelKeys);
    orderRef.current = orderRef.current.filter((key) => panelKeySet.has(key));
    panelKeys.forEach((key) => {
      if (!orderRef.current.includes(key)) orderRef.current.push(key);
    });
  }, [panels]);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const rebuildLayouts = () => {
      const frameRect = getLocalFrameRect(frame);
      const viewport = getViewport(frameRect.width, frameRect.height);
      const limits = getPanelLimits();
      const nextLayouts = createPanelLayouts(panels, frameRect, viewport, limits);
      const sizes = Object.fromEntries(nextLayouts.map((layout) => [layout.key, layout]));
      const arranged = arrangePanelLayouts({
        panels,
        order: orderRef.current,
        frameRect,
        viewport,
        sizes,
        limits,
      });

      frameRectRef.current = frameRect;
      orderRef.current = arranged.order;
      setLayouts(arranged.layouts);
      setLayerHeight(getPanelLayerHeight(arranged.layouts, frameRect.top));
    };

    rebuildLayouts();
    window.addEventListener('resize', rebuildLayouts);
    return () => window.removeEventListener('resize', rebuildLayouts);
  }, [panels, mode]);

  useEffect(() => {
    function handlePointerMove(event) {
      const action = actionRef.current;
      if (!action) return;

      event.preventDefault();

      const dx = event.clientX - action.startX;
      const dy = event.clientY - action.startY;
      const distance = Math.hypot(dx, dy);

      if (distance > DRAG_CLICK_THRESHOLD) {
        suppressClickRef.current = true;
      }

      const frameRect = frameRectRef.current || (frameRef.current ? getLocalFrameRect(frameRef.current) : null);
      if (!frameRect) return;

      const viewport = getViewport(frameRect.width, frameRect.height);
      const limits = getPanelLimits();
      const updater = action.type === 'resize' ? resizePanelLayout : movePanelLayout;
      const nextLayout = updater(action.startLayout, { dx, dy }, viewport, limits);

      setLayouts((currentLayouts) => {
        const sizes = Object.fromEntries(currentLayouts.map((layout) => [layout.key, layout]));
        sizes[action.key] = nextLayout;
        const arranged = arrangePanelLayouts({
          panels,
          order: orderRef.current,
          frameRect,
          viewport,
          sizes,
          activeKey: action.key,
          activeLayout: nextLayout,
          limits,
        });

        orderRef.current = arranged.order;
        setLayerHeight(getPanelLayerHeight(arranged.layouts, frameRect.top));
        return arranged.layouts;
      });
    }

    function handlePointerUp() {
      const action = actionRef.current;
      actionRef.current = null;
      setActiveKey('');
      document.body.classList.remove('panel-dragging');

      if (!action) return;

      setLayouts((currentLayouts) => {
        const frameRect = frameRectRef.current || (frameRef.current ? getLocalFrameRect(frameRef.current) : null);
        const activeLayout = currentLayouts.find((layout) => layout.key === action.key);
        if (!frameRect || !activeLayout) return currentLayouts;

        const viewport = getViewport(frameRect.width, frameRect.height);
        const limits = getPanelLimits();
        const sizes = Object.fromEntries(currentLayouts.map((layout) => [layout.key, layout]));
        sizes[action.key] = activeLayout;
        const snapped = snapPanelLayouts({
          panels,
          order: orderRef.current,
          frameRect,
          viewport,
          sizes,
          activeKey: action.key,
          activeLayout,
          snapAnchor: action.type === 'resize' ? 'origin' : 'center',
          limits,
        });

        orderRef.current = snapped.order;
        setLayerHeight(getPanelLayerHeight(snapped.layouts, frameRect.top));
        return snapped.layouts;
      });
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.classList.remove('panel-dragging');
    };
  }, [panels]);

  function beginAction(event, panelKey, type) {
    if (event.button !== 0) return;

    const startLayout = layouts.find((layout) => layout.key === panelKey);
    if (!startLayout) return;

    actionRef.current = {
      key: panelKey,
      type,
      startX: event.clientX,
      startY: event.clientY,
      startLayout,
    };
    suppressClickRef.current = false;
    setActiveKey(panelKey);
    document.body.classList.add('panel-dragging');

    if (type === 'resize') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function captureClick(event) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      ref={frameRef}
      className={`draggable-panel-layer draggable-panel-layer--${mode}`}
      style={{ '--panel-layer-height': `${layerHeight}px` }}
    >
      {panels.map((panel) => {
        const layout = layouts.find((item) => item.key === panel.key);
        if (!layout) return null;

        return (
          <div
            className={`dash-cell draggable-panel-card${activeKey === panel.key ? ' draggable-panel-card--active' : ''}`}
            data-anim
            key={panel.key}
            style={{
              left: `${layout.x}px`,
              top: `${layout.y}px`,
              width: `${layout.width}px`,
              height: `${layout.height}px`,
            }}
            onPointerDown={(event) => beginAction(event, panel.key, 'move')}
            onClickCapture={captureClick}
          >
            <HighlightBeam active={matchesSearch(panel.keywords, searchTerm)}>
              {panel.content}
            </HighlightBeam>
            <span
              className="draggable-panel-card__resize"
              aria-hidden="true"
              onPointerDown={(event) => beginAction(event, panel.key, 'resize')}
            />
          </div>
        );
      })}
    </div>
  );
}
