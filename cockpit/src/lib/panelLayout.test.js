/*
 更新时间: 2026-06-25 16:45:36
 更新内容: 新增主体大面板释放后按网格吸附、自动补位和全行跨度对齐测试。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PANEL_LAYOUT_LIMITS,
  arrangePanelLayouts,
  createPanelLayouts,
  movePanelLayout,
  resizePanelLayout,
  snapPanelLayouts,
} from './panelLayout.js';

const viewport = { width: 1440, height: 900 };
const frameRect = { left: 282, top: 336, width: 1088, height: 520 };
const panels = [
  { key: 'trend' },
  { key: 'channel' },
  { key: 'roi' },
  { key: 'version' },
];

test('creates a two-column overview layout for large dashboard panels', () => {
  const layouts = createPanelLayouts(panels, frameRect, viewport);

  assert.equal(layouts.length, 4);
  assert.deepEqual(layouts.map((layout) => layout.key), ['trend', 'channel', 'roi', 'version']);
  assert.equal(layouts[0].x, frameRect.left);
  assert.equal(layouts[0].y, frameRect.top);
  assert.equal(layouts[1].y, frameRect.top);
  assert.equal(layouts[2].x, frameRect.left);
  assert.equal(layouts[2].y, layouts[0].y + layouts[0].height + PANEL_LAYOUT_LIMITS.gap);
  assert.ok(layouts[0].width > layouts[1].width);
  assert.ok(layouts[0].height >= PANEL_LAYOUT_LIMITS.defaultHeight);
});

test('keeps a single large panel full-width when there is only one visible panel', () => {
  const [layout] = createPanelLayouts([{ key: 'channel' }], frameRect, viewport);

  assert.equal(layout.key, 'channel');
  assert.equal(layout.x, frameRect.left);
  assert.equal(layout.y, frameRect.top);
  assert.equal(layout.width, frameRect.width);
  assert.ok(layout.height >= PANEL_LAYOUT_LIMITS.defaultHeight);
});

test('moves large panels inside the viewport while respecting the left glass rail', () => {
  const layout = { key: 'trend', x: 282, y: 336, width: 640, height: 300 };
  const limits = { ...PANEL_LAYOUT_LIMITS, leftOverlayGuard: 242, minVisibleWidth: 96 };

  assert.deepEqual(
    movePanelLayout(layout, { dx: -1000, dy: -1000 }, viewport, limits),
    {
      ...layout,
      x: PANEL_LAYOUT_LIMITS.viewportMargin,
      y: PANEL_LAYOUT_LIMITS.viewportMargin,
    },
  );
});

test('reflows other large panels away from the dragged panel slot', () => {
  const baseLayouts = createPanelLayouts(panels, frameRect, viewport);
  const activeLayout = { ...baseLayouts[0], x: baseLayouts[1].x, y: baseLayouts[1].y };
  const arranged = arrangePanelLayouts({
    panels,
    order: panels.map((panel) => panel.key),
    frameRect,
    viewport,
    sizes: Object.fromEntries(baseLayouts.map((layout) => [layout.key, layout])),
    activeKey: 'trend',
    activeLayout,
  });

  assert.deepEqual(arranged.order, ['channel', 'trend', 'roi', 'version']);
  assert.equal(arranged.layouts.find((layout) => layout.key === 'trend').x, baseLayouts[1].x);
  assert.equal(arranged.layouts.find((layout) => layout.key === 'channel').x, baseLayouts[0].x);
  assertNoOverlaps(arranged.layouts);
});

test('pushes other large panels into free rows when one panel is resized wider', () => {
  const baseLayouts = createPanelLayouts(panels, frameRect, viewport);
  const activeLayout = {
    ...baseLayouts[0],
    width: baseLayouts[0].width + baseLayouts[1].width + PANEL_LAYOUT_LIMITS.gap,
  };
  const resized = resizePanelLayout(baseLayouts[0], { dx: baseLayouts[1].width + PANEL_LAYOUT_LIMITS.gap, dy: 60 }, viewport);
  const arranged = arrangePanelLayouts({
    panels,
    order: panels.map((panel) => panel.key),
    frameRect,
    viewport,
    sizes: Object.fromEntries(baseLayouts.map((layout) => [layout.key, layout])),
    activeKey: 'trend',
    activeLayout: { ...activeLayout, width: resized.width, height: resized.height },
  });

  assert.ok(arranged.layouts.find((layout) => layout.key === 'trend').width > baseLayouts[0].width);
  assert.ok(arranged.layouts.some((layout) => layout.key !== 'trend' && layout.y > baseLayouts[2].y));
  assertNoOverlaps(arranged.layouts);
});

test('snaps a dropped large panel to the nearest panel slot and fills the previous gap', () => {
  const baseLayouts = createPanelLayouts(panels, frameRect, viewport);
  const activeLayout = {
    ...baseLayouts[0],
    x: baseLayouts[1].x + 24,
    y: baseLayouts[1].y + 12,
  };
  const snapped = snapPanelLayouts({
    panels,
    order: panels.map((panel) => panel.key),
    frameRect,
    viewport,
    sizes: Object.fromEntries(baseLayouts.map((layout) => [layout.key, layout])),
    activeKey: 'trend',
    activeLayout,
  });
  const byKey = Object.fromEntries(snapped.layouts.map((layout) => [layout.key, layout]));

  assert.deepEqual(snapped.order, ['channel', 'trend', 'roi', 'version']);
  assert.equal(byKey.trend.x, baseLayouts[1].x);
  assert.equal(byKey.trend.y, baseLayouts[1].y);
  assert.equal(byKey.trend.width, baseLayouts[1].width);
  assert.equal(byKey.channel.x, baseLayouts[0].x);
  assert.equal(byKey.channel.y, baseLayouts[0].y);
  assert.equal(byKey.channel.width, baseLayouts[0].width);
  assertNoOverlaps(snapped.layouts);
});

test('snaps a resized large panel to a full-row grid span and repacks the others', () => {
  const baseLayouts = createPanelLayouts(panels, frameRect, viewport);
  const activeLayout = {
    ...baseLayouts[0],
    width: frameRect.width + 28,
  };
  const snapped = snapPanelLayouts({
    panels,
    order: panels.map((panel) => panel.key),
    frameRect,
    viewport,
    sizes: Object.fromEntries(baseLayouts.map((layout) => [layout.key, layout])),
    activeKey: 'trend',
    activeLayout,
    snapAnchor: 'origin',
  });
  const trend = snapped.layouts.find((layout) => layout.key === 'trend');

  assert.equal(trend.x, baseLayouts[0].x);
  assert.equal(trend.y, baseLayouts[0].y);
  assert.equal(trend.width, frameRect.width);
  assert.ok(snapped.layouts.some((layout) => layout.key !== 'trend' && layout.y > trend.y));
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
