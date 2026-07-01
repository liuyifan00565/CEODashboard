/*
 更新时间: 2026-06-25 16:45:36
 更新内容: 新增 KPI 数据卡片固定定位、拖拽和右下角缩放的布局计算工具；
          默认列数按最小卡片宽度计算，内容区可容纳时保持四列；
          新增拖拽时的避让重排，避免卡片互相重叠；
          新增释放后按网格吸附、缩放跨度对齐和自动补位。
*/
export const CARD_LAYOUT_LIMITS = {
  gap: 14,
  minWidth: 220,
  minHeight: 180,
  defaultHeight: 218,
  viewportMargin: 12,
  leftOverlayGuard: 0,
  minVisibleWidth: 72,
};

export function clamp(value, min, max) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function getColumnCount(frameWidth, cardCount, limits) {
  const maxColumns = Math.min(4, cardCount);
  for (let columns = maxColumns; columns > 1; columns -= 1) {
    const cardWidth = (frameWidth - limits.gap * (columns - 1)) / columns;
    if (cardWidth >= limits.minWidth) return columns;
  }
  return 1;
}

function getCardKeys(cards) {
  return cards.map((card) => card.key);
}

function normalizeOrder(order, cards) {
  const keys = getCardKeys(cards);
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

function createLayoutSlots(frameRect, viewport, count, limits) {
  const columnCount = getColumnCount(frameRect.width, Math.min(4, Math.max(1, count)), limits);
  const widthFromFrame = (frameRect.width - limits.gap * (columnCount - 1)) / columnCount;
  const slotWidth = Math.max(limits.minWidth, Math.floor(widthFromFrame));
  const rows = Math.max(1, Math.ceil(count / columnCount));
  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const x = clamp(
        Math.round(frameRect.left + column * (slotWidth + limits.gap)),
        limits.viewportMargin,
        viewport.width - limits.minWidth - limits.viewportMargin,
      );
      const y = clamp(
        Math.round(frameRect.top + row * (limits.defaultHeight + limits.gap)),
        limits.viewportMargin,
        viewport.height - limits.minHeight - limits.viewportMargin,
      );
      slots.push({ x, y, width: slotWidth, height: limits.defaultHeight });
    }
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

function getSnappedCardSize(layout, slot, slotIndex, slots, viewport, limits) {
  const rawWidth = layout?.width || slot.width;
  const rawHeight = layout?.height || slot.height;
  const columnCount = getColumnCountFromSlots(slots);
  const columnIndex = getSlotColumnIndex(slotIndex, slots);
  const maxColumnSpan = Math.max(1, columnCount - columnIndex);
  const columnSpan = clamp(
    Math.round((rawWidth + limits.gap) / (slot.width + limits.gap)),
    1,
    maxColumnSpan,
  );
  const rowSpan = Math.max(
    1,
    Math.round((rawHeight + limits.gap) / (limits.defaultHeight + limits.gap)),
  );
  const snappedWidth = columnSpan * slot.width + (columnSpan - 1) * limits.gap;
  const snappedHeight = rowSpan * limits.defaultHeight + (rowSpan - 1) * limits.gap;

  return {
    width: clamp(
      snappedWidth,
      getMinWidthForX(slot.x, limits),
      viewport.width - slot.x - limits.viewportMargin,
    ),
    height: clamp(
      snappedHeight,
      limits.minHeight,
      viewport.height - slot.y - limits.viewportMargin,
    ),
  };
}

function getSnappedCardCandidate(key, layout, slot, slotIndex, slots, viewport, limits) {
  const size = getSnappedCardSize(layout, slot, slotIndex, slots, viewport, limits);
  return {
    key,
    x: slot.x,
    y: slot.y,
    width: size.width,
    height: size.height,
  };
}

function packSnappedCardLayouts(order, slots, sizes, activeKey, activeLayout, viewport, limits) {
  const layouts = [];
  const blockedRects = [];

  order.forEach((key) => {
    const rawLayout = key === activeKey && activeLayout ? activeLayout : sizes[key];
    let selectedLayout = null;

    for (let index = 0; index < slots.length; index += 1) {
      const candidate = getSnappedCardCandidate(
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
      selectedLayout = getSnappedCardCandidate(
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

export function createCardLayouts(cards, frameRect, viewport, limits = CARD_LAYOUT_LIMITS) {
  const count = cards.length;
  if (!count) return [];

  const columnCount = getColumnCount(frameRect.width, count, limits);
  const widthFromFrame = (frameRect.width - limits.gap * (columnCount - 1)) / columnCount;
  const cardWidth = Math.max(limits.minWidth, Math.floor(widthFromFrame));
  const maxX = viewport.width - limits.viewportMargin - limits.minWidth;
  const maxY = viewport.height - limits.viewportMargin - limits.minHeight;

  return cards.map((card, index) => {
    const column = index % columnCount;
    const row = Math.floor(index / columnCount);
    const x = clamp(
      Math.round(frameRect.left + column * (cardWidth + limits.gap)),
      limits.viewportMargin,
      maxX,
    );
    const y = clamp(
      Math.round(frameRect.top + row * (limits.defaultHeight + limits.gap)),
      limits.viewportMargin,
      maxY,
    );
    const maxWidth = viewport.width - x - limits.viewportMargin;

    return {
      key: card.key,
      x,
      y,
      width: clamp(cardWidth, limits.minWidth, maxWidth),
      height: limits.defaultHeight,
    };
  });
}

export function arrangeCardLayouts({
  cards,
  order = getCardKeys(cards),
  frameRect,
  viewport,
  sizes = {},
  activeKey = '',
  activeLayout = null,
  snapAnchor = 'center',
  limits = CARD_LAYOUT_LIMITS,
}) {
  const normalizedOrder = normalizeOrder(order, cards);
  const slotCount = Math.max(cards.length * 3, cards.length + 4);
  const slots = createLayoutSlots(frameRect, viewport, slotCount, limits);
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

export function snapCardLayouts({
  cards,
  order = getCardKeys(cards),
  frameRect,
  viewport,
  sizes = {},
  activeKey = '',
  activeLayout = null,
  snapAnchor = 'center',
  limits = CARD_LAYOUT_LIMITS,
}) {
  const normalizedOrder = normalizeOrder(order, cards);
  const slotCount = Math.max(cards.length * 3, cards.length + 4);
  const slots = createLayoutSlots(frameRect, viewport, slotCount, limits);
  const nextOrder = activeKey && activeLayout
    ? moveKeyToIndex(normalizedOrder, activeKey, getNearestSlotIndex(activeLayout, slots, snapAnchor))
    : normalizedOrder;

  return {
    layouts: packSnappedCardLayouts(
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

export function moveCardLayout(layout, delta, viewport, limits = CARD_LAYOUT_LIMITS) {
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
      viewport.height - layout.height - limits.viewportMargin,
    ),
  };
}

export function resizeCardLayout(layout, delta, viewport, limits = CARD_LAYOUT_LIMITS) {
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

export function getLayerHeight(layouts, frameTop = 0, limits = CARD_LAYOUT_LIMITS) {
  if (!layouts.length) return limits.defaultHeight;
  const bottom = Math.max(...layouts.map((layout) => layout.y + layout.height));
  return Math.max(limits.defaultHeight, Math.ceil(bottom - frameTop));
}
