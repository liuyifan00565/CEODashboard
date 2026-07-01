/*
 更新时间: 2026-06-25 16:45:36
 更新内容: KPI 数据卡片拖拽层新增释放后网格吸附，拖动或缩放结束时自动补位并保持对齐。
*/
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  CARD_LAYOUT_LIMITS,
  arrangeCardLayouts,
  createCardLayouts,
  getLayerHeight,
  moveCardLayout,
  resizeCardLayout,
  snapCardLayouts,
} from '../lib/cardLayout';
import HighlightBeam from './HighlightBeam';
import KpiCard from './KpiCard';
import './DraggableKpiLayer.css';

const DRAG_CLICK_THRESHOLD = 4;

function getViewport() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || 0,
    height: window.innerHeight || document.documentElement.clientHeight || 0,
  };
}

function matchesSearch(keywords, term) {
  if (!term) return false;
  const normalized = term.trim().toLowerCase();
  if (!normalized) return false;
  return keywords.some((keyword) => String(keyword).toLowerCase().includes(normalized));
}

function getDragLimits() {
  const asideRect = document.querySelector('.dash-aside')?.getBoundingClientRect();
  return {
    ...CARD_LAYOUT_LIMITS,
    leftOverlayGuard: Math.max(0, Math.round(asideRect?.right || 0)),
  };
}

export default function DraggableKpiLayer({ cards, searchTerm, onOpen }) {
  const frameRef = useRef(null);
  const actionRef = useRef(null);
  const frameRectRef = useRef(null);
  const orderRef = useRef(cards.map((card) => card.key));
  const suppressClickRef = useRef(false);
  const [layouts, setLayouts] = useState([]);
  const [layerHeight, setLayerHeight] = useState(218);
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    const cardKeys = cards.map((card) => card.key);
    const cardKeySet = new Set(cardKeys);
    orderRef.current = orderRef.current.filter((key) => cardKeySet.has(key));
    cardKeys.forEach((key) => {
      if (!orderRef.current.includes(key)) orderRef.current.push(key);
    });
  }, [cards]);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const rebuildLayouts = () => {
      const rect = frame.getBoundingClientRect();
      const viewport = getViewport();
      const limits = getDragLimits();
      const nextLayouts = createCardLayouts(cards, rect, viewport, limits);
      const sizes = Object.fromEntries(nextLayouts.map((layout) => [layout.key, layout]));
      const arranged = arrangeCardLayouts({
        cards,
        order: orderRef.current,
        frameRect: rect,
        viewport,
        sizes,
        limits,
      });

      frameRectRef.current = rect;
      orderRef.current = arranged.order;
      setLayouts(arranged.layouts);
      setLayerHeight(getLayerHeight(arranged.layouts, rect.top));
    };

    rebuildLayouts();
    window.addEventListener('resize', rebuildLayouts);
    return () => window.removeEventListener('resize', rebuildLayouts);
  }, [cards]);

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

      const updater = action.type === 'resize' ? resizeCardLayout : moveCardLayout;
      const nextLayout = updater(action.startLayout, { dx, dy }, getViewport(), getDragLimits());

      setLayouts((currentLayouts) => {
        const frameRect = frameRectRef.current || frameRef.current?.getBoundingClientRect();
        if (!frameRect) {
          return currentLayouts.map((layout) => (layout.key === action.key ? nextLayout : layout));
        }

        const viewport = getViewport();
        const limits = getDragLimits();
        const sizes = Object.fromEntries(currentLayouts.map((layout) => [layout.key, layout]));
        sizes[action.key] = nextLayout;
        const arranged = arrangeCardLayouts({
          cards,
          order: orderRef.current,
          frameRect,
          viewport,
          sizes,
          activeKey: action.key,
          activeLayout: nextLayout,
          limits,
        });

        orderRef.current = arranged.order;
        setLayerHeight(getLayerHeight(arranged.layouts, frameRect.top));
        return arranged.layouts;
      });
    }

    function handlePointerUp() {
      const action = actionRef.current;
      actionRef.current = null;
      setActiveKey('');
      document.body.classList.remove('kpi-dragging');

      if (!action) return;

      setLayouts((currentLayouts) => {
        const frameRect = frameRectRef.current || frameRef.current?.getBoundingClientRect();
        const activeLayout = currentLayouts.find((layout) => layout.key === action.key);
        if (!frameRect || !activeLayout) return currentLayouts;

        const viewport = getViewport();
        const limits = getDragLimits();
        const sizes = Object.fromEntries(currentLayouts.map((layout) => [layout.key, layout]));
        sizes[action.key] = activeLayout;
        const snapped = snapCardLayouts({
          cards,
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
        setLayerHeight(getLayerHeight(snapped.layouts, frameRect.top));
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
      document.body.classList.remove('kpi-dragging');
    };
  }, [cards]);

  function beginAction(event, cardKey, type) {
    if (event.button !== 0) return;

    const startLayout = layouts.find((layout) => layout.key === cardKey);
    if (!startLayout) return;

    actionRef.current = {
      key: cardKey,
      type,
      startX: event.clientX,
      startY: event.clientY,
      startLayout,
    };
    suppressClickRef.current = false;
    setActiveKey(cardKey);
    document.body.classList.add('kpi-dragging');

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
      className="draggable-kpi-layer"
      style={{ '--kpi-layer-height': `${layerHeight}px` }}
    >
      {cards.map((card) => {
        const layout = layouts.find((item) => item.key === card.key);
        if (!layout) return null;

        return (
          <div
            className={`draggable-kpi-card${activeKey === card.key ? ' draggable-kpi-card--active' : ''}`}
            data-anim
            key={card.key}
            style={{
              left: `${layout.x}px`,
              top: `${layout.y}px`,
              width: `${layout.width}px`,
              height: `${layout.height}px`,
            }}
            onPointerDown={(event) => beginAction(event, card.key, 'move')}
            onClickCapture={captureClick}
          >
            <HighlightBeam active={matchesSearch(card.keywords, searchTerm)}>
              <KpiCard card={card} onOpen={onOpen} />
            </HighlightBeam>
            <span
              className="draggable-kpi-card__resize"
              aria-hidden="true"
              onPointerDown={(event) => beginAction(event, card.key, 'resize')}
            />
          </div>
        );
      })}
    </div>
  );
}
