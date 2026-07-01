/*
 更新时间: 2026-06-25 16:45:36
 更新内容: 新增主体大面板固定定位、拖拽缩放和避让重排的布局计算工具；
          新增释放后按面板网格吸附、列宽重算和空位自动补齐。
*/
import { clamp } from './cardLayout.js';

export const PANEL_LAYOUT_LIMITS = {
  gap: 16,
  minWidth: 340,
  minHeight: 260,
  defaultHeight: 300,
  viewportMargin: 12,
  leftOverlayGuard: 0,
  minVisibleWidth: 96,
  wideRatio: 0.62,
};

function getPanelKeys(panels) {
  return panels.map((panel) => panel.key);
}

function normalizeOrder(order, panels) {
  const keys = getPanelKeys(panels);
  const keySet = new Set(keys);
  const normalized = order.filter((key) => keySet.has(key));
  keys.forEach((key) => {
    if (!normalized.includes(key)) normalized.push(key);
  });
  return normalized;
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y
  );
}

function moveKeyToIndex(order, key, targetIndex) {
  const currentIndex = order.indexOf(key);
  if (currentIndex === -1) return order;
  const nextOrder = order.slice();
  nextOrder.splice(currentIndex, 1);
  nextOrder.splice(clamp(targetIndex, 0, nextOrder.length), 0, key);
  return nextOrder;
}

function getMinXForWidth(width, limits) {
  if (!limits.leftOverlayGuard) return limits.viewportMargin;
  return Math.max(
    limits.viewportMargin,
    limits.leftOverlayGuard - width + limits.minVisibleWidth,
  );
}

function getMinWidthForX(x, limits) {
  if (!limits.leftOverlayGuard || x >= limits.leftOverlayGuard) return limits.minWidth;
  return Math.max(
    limits.minWidth,
    limits.leftOverlayGuard - x + limits.minVisibleWidth,
  );
}

function getInnerFrameRect(frameRect, viewport, limits) {
  const left = clamp(
    Math.round(frameRect.left),
    limits.viewportMargin,
    Number.POSITIVE_INFINITY,
  );
  const right = Math.min(
    frameRect.left + frameRect.width,
    viewport.width - limits.viewportMargin,
  );

  return {
    ...frameRect,
    left,
    width: Math.max(limits.minWidth, right - left),
  };
}

function getColumnMetrics(frameRect, limits) {
  if (frameRect.width < limits.minWidth * 2 + limits.gap) {
    return {
      columns: [{ x: frameRect.left, width: frameRect.width }],
      rowHeight: Math.max(limits.defaultHeight, Math.floor(frameRect.height / 2)),
    };
  }

  const leftWidth = Math.floor((frameRect.width - limits.gap) * limits.wideRatio);
  const rightWidth = frameRect.width - limits.gap - leftWidth;
  return {
    columns: [
      { x: frameRect.left, width: leftWidth },
      { x: frameRect.left + leftWidth + limits.gap, width: rightWidth },
    ],
    rowHeight: Math.max(limits.defaultHeight, Math.floor((frameRect.height - limits.gap) / 2)),
  };
}

function createPanelSlots(frameRect, viewport, count, limits) {
  const innerFrameRect = getInnerFrameRect(frameRect, viewport, limits);
  const { columns, rowHeight } = getColumnMetrics(innerFrameRect, limits);
  const rows = Math.max(1, Math.ceil(count / columns.length));
  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    columns.forEach((column) => {
      const x = clamp(
        Math.round(column.x),
        limits.viewportMargin,
        viewport.width - limits.minWidth - limits.viewportMargin,
      );
      const y = clamp(
        Math.round(innerFrameRect.top + row * (rowHeight + limits.gap)),
        limits.viewportMargin,
        Number.POSITIVE_INFINITY,
      );
      slots.push({
        x,
        y,
        width: Math.max(limits.minWidth, Math.floor(column.width)),
        height: rowHeight,
      });
    });
  }

  return slots;
}

function getNearestSlotIndex(layout, slots, snapAnchor = 'center') {
  const anchorX = snapAnchor === 'origin' ? layout.x : layout.x + layout.width / 2;
  const anchorY = snapAnchor === 'origin' ? layout.y : layout.y + layout.height / 2;
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  slots.forEach((slot, index) => {
    const slotCenterX = slot.x + slot.width / 2;
    const slotCenterY = slot.y + slot.height / 2;
    const slotAnchorX = snapAnchor === 'origin' ? slot.x : slotCenterX;
    const slotAnchorY = snapAnchor === 'origin' ? slot.y : slotCenterY;
    const distance = Math.hypot(anchorX - slotAnchorX, anchorY - slotAnchorY);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function getColumnCountFromSlots(slots) {
  if (!slots.length) return 1;

  const firstRowY = slots[0].y;
  const firstNextRowIndex = slots.findIndex((slot, index) => index > 0 && slot.y !== firstRowY);
  return firstNextRowIndex === -1 ? slots.length : firstNextRowIndex;
}

function getSlotColumnIndex(slotIndex, slots) {
  return slotIndex % getColumnCountFromSlots(slots);
}

function getPanelSpanWidth(slotIndex, slots, span, limits) {
  const columnCount = getColumnCountFromSlots(slots);
  const rowStartIndex = Math.floor(slotIndex / columnCount) * columnCount;
  const columnIndex = getSlotColumnIndex(slotIndex, slots);
  let width = 0;

  for (let offset = 0; offset < span; offset += 1) {
    width += slots[rowStartIndex + columnIndex + offset]?.width || 0;
  }

  return width + Math.max(0, span - 1) * limits.gap;
}

function getBestPanelColumnSpan(rawWidth, slotIndex, slots, limits) {
  const columnCount = getColumnCountFromSlots(slots);
  const columnIndex = getSlotColumnIndex(slotIndex, slots);
  const maxSpan = Math.max(1, columnCount - columnIndex);
  let bestSpan = 1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let span = 1; span <= maxSpan; span += 1) {
    const spanWidth = getPanelSpanWidth(slotIndex, slots, span, limits);
    const distance = Math.abs(rawWidth - spanWidth);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestSpan = span;
    }
  }

  return bestSpan;
}

function getSnappedPanelSize(layout, slot, slotIndex, slots, viewport, limits) {
  const rawWidth = layout?.width || slot.width;
  const rawHeight = layout?.height || slot.height;
  const columnSpan = getBestPanelColumnSpan(rawWidth, slotIndex, slots, limits);
  const rowSpan = Math.max(
    1,
    Math.round((rawHeight + limits.gap) / (slot.height + limits.gap)),
  );
  const snappedWidth = getPanelSpanWidth(slotIndex, slots, columnSpan, limits);
  const snappedHeight = rowSpan * slot.height + (rowSpan - 1) * limits.gap;

  return {
    width: clamp(
      snappedWidth,
      getMinWidthForX(slot.x, limits),
      viewport.width - slot.x - limits.viewportMargin,
    ),
    height: Math.max(limits.minHeight, snappedHeight),
  };
}

function getSnappedPanelCandidate(key, layout, slot, slotIndex, slots, viewport, limits) {
  const size = getSnappedPanelSize(layout, slot, slotIndex, slots, viewport, limits);
  return {
    key,
    x: slot.x,
    y: slot.y,
    width: size.width,
    height: size.height,
  };
}

function packSnappedPanelLayouts(order, slots, sizes, activeKey, activeLayout, viewport, limits) {
  const layouts = [];
  const blockedRects = [];

  order.forEach((key) => {
    const rawLayout = key === activeKey && activeLayout ? activeLayout : sizes[key];
    let selectedLayout = null;

    for (let index = 0; index < slots.length; index += 1) {
      const candidate = getSnappedPanelCandidate(
        key,
        rawLayout,
        slots[index],
        index,
        slots,
        viewport,
        limits,
      );

      if (!blockedRects.some((blocked) => rectsOverlap(candidate, blocked))) {
        selectedLayout = candidate;
        break;
      }
    }

    if (!selectedLayout) {
      const lastIndex = slots.length - 1;
      selectedLayout = getSnappedPanelCandidate(
        key,
        rawLayout,
        slots[lastIndex],
        lastIndex,
        slots,
        viewport,
        limits,
      );
    }

    layouts.push(selectedLayout);
    blockedRects.push(selectedLayout);
  });

  return layouts;
}

export function createPanelLayouts(panels, frameRect, viewport, limits = PANEL_LAYOUT_LIMITS) {
  if (!panels.length) return [];

  if (panels.length === 1) {
    const innerFrameRect = getInnerFrameRect(frameRect, viewport, limits);
    const width = clamp(
      Math.floor(innerFrameRect.width),
      limits.minWidth,
      viewport.width - innerFrameRect.left - limits.viewportMargin,
    );
    return [{
      key: panels[0].key,
      x: clamp(Math.round(innerFrameRect.left), limits.viewportMargin, viewport.width - width - limits.viewportMargin),
      y: clamp(Math.round(frameRect.top), limits.viewportMargin, viewport.height - limits.minHeight - limits.viewportMargin),
      width,
      height: Math.max(limits.defaultHeight, Math.floor(frameRect.height)),
    }];
  }

  const slots = createPanelSlots(frameRect, viewport, panels.length, limits);
  return panels.map((panel, index) => {
    const slot = slots[index];
    return {
      key: panel.key,
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
    };
  });
}

export function arrangePanelLayouts({
  panels,
  order = getPanelKeys(panels),
  frameRect,
  viewport,
  sizes = {},
  activeKey = '',
  activeLayout = null,
  snapAnchor = 'center',
  limits = PANEL_LAYOUT_LIMITS,
}) {
  const normalizedOrder = normalizeOrder(order, panels);
  const slotCount = Math.max(panels.length * 4, panels.length + 6);
  const slots = createPanelSlots(frameRect, viewport, slotCount, limits);
  const nextOrder = activeKey && activeLayout
    ? moveKeyToIndex(normalizedOrder, activeKey, getNearestSlotIndex(activeLayout, slots, snapAnchor))
    : normalizedOrder;
  const layouts = [];
  const blockedRects = [];

  if (activeKey && activeLayout) {
    const active = { ...activeLayout, key: activeKey };
    layouts.push(active);
    blockedRects.push(active);
  }

  nextOrder.forEach((key) => {
    if (key === activeKey) return;

    const size = sizes[key] || {};
    const width = size.width || slots[0]?.width || limits.minWidth;
    const height = size.height || limits.defaultHeight;
    const slot = slots.find((candidateSlot) => {
      const candidate = {
        key,
        x: candidateSlot.x,
        y: candidateSlot.y,
        width,
        height,
      };
      return !blockedRects.some((blocked) => rectsOverlap(candidate, blocked));
    }) || slots[slots.length - 1];

    const layout = {
      key,
      x: slot.x,
      y: slot.y,
      width,
      height,
    };
    layouts.push(layout);
    blockedRects.push(layout);
  });

  return { layouts, order: nextOrder };
}

export function snapPanelLayouts({
  panels,
  order = getPanelKeys(panels),
  frameRect,
  viewport,
  sizes = {},
  activeKey = '',
  activeLayout = null,
  snapAnchor = 'center',
  limits = PANEL_LAYOUT_LIMITS,
}) {
  const normalizedOrder = normalizeOrder(order, panels);
  const slotCount = Math.max(panels.length * 4, panels.length + 6);
  const slots = createPanelSlots(frameRect, viewport, slotCount, limits);
  const nextOrder = activeKey && activeLayout
    ? moveKeyToIndex(normalizedOrder, activeKey, getNearestSlotIndex(activeLayout, slots, snapAnchor))
    : normalizedOrder;

  return {
    layouts: packSnappedPanelLayouts(
      nextOrder,
      slots,
      sizes,
      activeKey,
      activeLayout,
      viewport,
      limits,
    ),
    order: nextOrder,
  };
}

export function movePanelLayout(layout, delta, viewport, limits = PANEL_LAYOUT_LIMITS) {
  return {
    ...layout,
    x: clamp(
      Math.round(layout.x + delta.dx),
      getMinXForWidth(layout.width, limits),
      viewport.width - layout.width - limits.viewportMargin,
    ),
    y: clamp(
      Math.round(layout.y + delta.dy),
      limits.viewportMargin,
      Number.POSITIVE_INFINITY,
    ),
  };
}

export function resizePanelLayout(layout, delta, viewport, limits = PANEL_LAYOUT_LIMITS) {
  return {
    ...layout,
    width: clamp(
      Math.round(layout.width + delta.dx),
      getMinWidthForX(layout.x, limits),
      viewport.width - layout.x - limits.viewportMargin,
    ),
    height: clamp(
      Math.round(layout.height + delta.dy),
      limits.minHeight,
      viewport.height - layout.y - limits.viewportMargin,
    ),
  };
}

export function getPanelLayerHeight(layouts, frameTop = 0, limits = PANEL_LAYOUT_LIMITS) {
  if (!layouts.length) return limits.defaultHeight;
  const bottom = Math.max(...layouts.map((layout) => layout.y + layout.height));
  return Math.max(limits.defaultHeight, Math.ceil(bottom - frameTop));
}
