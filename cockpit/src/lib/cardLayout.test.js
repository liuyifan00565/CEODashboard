/*
 更新时间: 2026-06-25 16:45:36
 更新内容: 新增 KPI 数据卡片释放后按网格吸附、自动补位和缩放跨度对齐测试。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CARD_LAYOUT_LIMITS,
  arrangeCardLayouts,
  createCardLayouts,
  moveCardLayout,
  resizeCardLayout,
  snapCardLayouts,
} from './cardLayout.js';

const viewport = { width: 1440, height: 900 };
const frameRect = { left: 282, top: 96, width: 1088, height: 240 };
const cards = [
  { key: 'revenue' },
  { key: 'target' },
  { key: 'roi' },
  { key: 'receivable' },
];

test('creates one fixed-position card layout per card in the KPI frame', () => {
  const layouts = createCardLayouts(cards, frameRect, viewport);

  assert.equal(layouts.length, 4);
  assert.deepEqual(layouts.map((layout) => layout.key), ['revenue', 'target', 'roi', 'receivable']);
  assert.equal(layouts[0].x, frameRect.left);
  assert.equal(layouts[0].y, frameRect.top);
  assert.equal(layouts[0].height, CARD_LAYOUT_LIMITS.defaultHeight);
  assert.ok(layouts[0].width >= CARD_LAYOUT_LIMITS.minWidth);
  assert.equal(layouts[1].x, layouts[0].x + layouts[0].width + CARD_LAYOUT_LIMITS.gap);
});

test('keeps four columns when the KPI frame can fit minimum card widths', () => {
  const layouts = createCardLayouts(
    cards,
    { left: 280, top: 102, width: 961, height: 240 },
    { width: 1280, height: 720 },
  );

  assert.equal(layouts[0].y, layouts[1].y);
  assert.equal(layouts[1].y, layouts[2].y);
  assert.equal(layouts[2].y, layouts[3].y);
  assert.equal(layouts[0].width, 229);
});

test('clamps moved cards inside the visible viewport margin', () => {
  const layout = { key: 'revenue', x: 282, y: 96, width: 260, height: 210 };

  assert.deepEqual(
    moveCardLayout(layout, { dx: -1000, dy: -1000 }, viewport),
    { ...layout, x: CARD_LAYOUT_LIMITS.viewportMargin, y: CARD_LAYOUT_LIMITS.viewportMargin },
  );

  assert.deepEqual(
    moveCardLayout(layout, { dx: 3000, dy: 2000 }, viewport),
    {
      ...layout,
      x: viewport.width - layout.width - CARD_LAYOUT_LIMITS.viewportMargin,
      y: viewport.height - layout.height - CARD_LAYOUT_LIMITS.viewportMargin,
    },
  );
});

test('keeps a visible grab strip when cards move under the left glass rail', () => {
  const layout = { key: 'revenue', x: 280, y: 96, width: 229, height: 210 };
  const limits = { ...CARD_LAYOUT_LIMITS, leftOverlayGuard: 242, minVisibleWidth: 72 };

  assert.deepEqual(
    moveCardLayout(layout, { dx: -1000, dy: 0 }, viewport, limits),
    {
      ...layout,
      x: 85,
    },
  );
});

test('resizes from the bottom-right corner while preserving position and viewport bounds', () => {
  const layout = { key: 'revenue', x: 282, y: 96, width: 260, height: 210 };

  assert.deepEqual(
    resizeCardLayout(layout, { dx: -200, dy: -120 }, viewport),
    {
      ...layout,
      width: CARD_LAYOUT_LIMITS.minWidth,
      height: CARD_LAYOUT_LIMITS.minHeight,
    },
  );

  assert.deepEqual(
    resizeCardLayout(layout, { dx: 3000, dy: 2000 }, viewport),
    {
      ...layout,
      width: viewport.width - layout.x - CARD_LAYOUT_LIMITS.viewportMargin,
      height: viewport.height - layout.y - CARD_LAYOUT_LIMITS.viewportMargin,
    },
  );
});

test('prevents resize from hiding a card completely under the left glass rail', () => {
  const layout = { key: 'revenue', x: 12, y: 96, width: 473, height: 210 };
  const limits = { ...CARD_LAYOUT_LIMITS, leftOverlayGuard: 242, minVisibleWidth: 72 };

  assert.deepEqual(
    resizeCardLayout(layout, { dx: -300, dy: 0 }, viewport, limits),
    {
      ...layout,
      width: 302,
    },
  );
});

test('reflows other cards away from the active dragged card slot', () => {
  const baseLayouts = createCardLayouts(cards, frameRect, viewport);
  const activeLayout = { ...baseLayouts[0], x: baseLayouts[2].x, y: baseLayouts[2].y };
  const arranged = arrangeCardLayouts({
    cards,
    order: cards.map((card) => card.key),
    frameRect,
    viewport,
    sizes: Object.fromEntries(baseLayouts.map((layout) => [layout.key, layout])),
    activeKey: 'revenue',
    activeLayout,
  });

  assert.deepEqual(arranged.order, ['target', 'roi', 'revenue', 'receivable']);
  assert.deepEqual(
    arranged.layouts.map((layout) => ({ key: layout.key, x: layout.x, y: layout.y })),
    [
      { key: 'revenue', x: baseLayouts[2].x, y: baseLayouts[2].y },
      { key: 'target', x: baseLayouts[0].x, y: baseLayouts[0].y },
      { key: 'roi', x: baseLayouts[1].x, y: baseLayouts[1].y },
      { key: 'receivable', x: baseLayouts[3].x, y: baseLayouts[3].y },
    ],
  );
});

test('packs reflowed cards into free slots when the active card overlaps multiple slots', () => {
  const baseLayouts = createCardLayouts(cards, frameRect, viewport);
  const activeLayout = {
    ...baseLayouts[0],
    x: baseLayouts[1].x,
    y: baseLayouts[1].y,
    width: baseLayouts[1].width * 2 + CARD_LAYOUT_LIMITS.gap,
    height: baseLayouts[1].height,
  };
  const arranged = arrangeCardLayouts({
    cards,
    order: cards.map((card) => card.key),
    frameRect,
    viewport,
    sizes: Object.fromEntries(baseLayouts.map((layout) => [layout.key, layout])),
    activeKey: 'revenue',
    activeLayout,
  });

  const layouts = arranged.layouts;
  for (let i = 0; i < layouts.length; i += 1) {
    for (let j = i + 1; j < layouts.length; j += 1) {
      assert.equal(rectsOverlap(layouts[i], layouts[j]), false, `${layouts[i].key} overlaps ${layouts[j].key}`);
    }
  }

  assert.ok(layouts.some((layout) => layout.key !== 'revenue' && layout.y > frameRect.top));
});

test('snaps a dropped KPI card to the nearest grid slot and fills the earlier gap', () => {
  const baseLayouts = createCardLayouts(cards, frameRect, viewport);
  const activeLayout = {
    ...baseLayouts[0],
    x: baseLayouts[2].x + 32,
    y: baseLayouts[2].y + 18,
  };
  const snapped = snapCardLayouts({
    cards,
    order: cards.map((card) => card.key),
    frameRect,
    viewport,
    sizes: Object.fromEntries(baseLayouts.map((layout) => [layout.key, layout])),
    activeKey: 'revenue',
    activeLayout,
  });
  const byKey = Object.fromEntries(snapped.layouts.map((layout) => [layout.key, layout]));

  assert.deepEqual(snapped.order, ['target', 'roi', 'revenue', 'receivable']);
  assert.deepEqual(
    ['target', 'roi', 'revenue', 'receivable'].map((key) => ({ key, x: byKey[key].x, y: byKey[key].y })),
    [
      { key: 'target', x: baseLayouts[0].x, y: baseLayouts[0].y },
      { key: 'roi', x: baseLayouts[1].x, y: baseLayouts[1].y },
      { key: 'revenue', x: baseLayouts[2].x, y: baseLayouts[2].y },
      { key: 'receivable', x: baseLayouts[3].x, y: baseLayouts[3].y },
    ],
  );
  assert.equal(byKey.revenue.width, baseLayouts[2].width);
  assert.equal(byKey.revenue.height, baseLayouts[2].height);
  assertNoOverlaps(snapped.layouts);
});

test('snaps a resized KPI card to grid-sized width and height spans', () => {
  const baseLayouts = createCardLayouts(cards, frameRect, viewport);
  const activeLayout = {
    ...baseLayouts[0],
    width: baseLayouts[0].width * 2 + CARD_LAYOUT_LIMITS.gap + 31,
    height: baseLayouts[0].height * 2 + CARD_LAYOUT_LIMITS.gap + 22,
  };
  const snapped = snapCardLayouts({
    cards,
    order: cards.map((card) => card.key),
    frameRect,
    viewport,
    sizes: Object.fromEntries(baseLayouts.map((layout) => [layout.key, layout])),
    activeKey: 'revenue',
    activeLayout,
    snapAnchor: 'origin',
  });
  const revenue = snapped.layouts.find((layout) => layout.key === 'revenue');

  assert.equal(revenue.x, baseLayouts[0].x);
  assert.equal(revenue.y, baseLayouts[0].y);
  assert.equal(revenue.width, baseLayouts[0].width * 2 + CARD_LAYOUT_LIMITS.gap);
  assert.equal(revenue.height, baseLayouts[0].height * 2 + CARD_LAYOUT_LIMITS.gap);
  assert.ok(snapped.layouts.some((layout) => layout.key !== 'revenue' && layout.y > frameRect.top));
  assertNoOverlaps(snapped.layouts);
});

function assertNoOverlaps(layouts) {
  for (let i = 0; i < layouts.length; i += 1) {
    for (let j = i + 1; j < layouts.length; j += 1) {
      assert.equal(rectsOverlap(layouts[i], layouts[j]), false, `${layouts[i].key} overlaps ${layouts[j].key}`);
    }
  }
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y
  );
}
