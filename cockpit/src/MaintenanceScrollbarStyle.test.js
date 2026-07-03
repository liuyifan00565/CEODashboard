/*
 Update time: 2026-07-03 11:10:18 CST
 Update content: Add regression coverage for narrower maintenance page scrollbars.
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const maintenancePageCss = readFileSync(new URL('./components/MaintenancePage.css', import.meta.url), 'utf8');

function cssRuleBodyByPattern(source, selectorPattern) {
  return source.match(new RegExp(`${selectorPattern}\\s*\\{(?<body>[\\s\\S]*?)\\n\\}`))?.groups.body ?? '';
}

test('keeps maintenance scrollbars narrow and glass friendly', () => {
  const scrollSurfaceSelector = String.raw`\.mnt-matrix-wrap,\s*\.mnt-target-scroll-pane,\s*\.mnt-tree,\s*\.mnt-channel-tree,\s*\.mnt-edit-list`;
  const webkitScrollbarSelector = String.raw`\.mnt-matrix-wrap::-webkit-scrollbar,\s*\.mnt-target-scroll-pane::-webkit-scrollbar,\s*\.mnt-tree::-webkit-scrollbar,\s*\.mnt-channel-tree::-webkit-scrollbar,\s*\.mnt-edit-list::-webkit-scrollbar`;
  const webkitThumbSelector = String.raw`\.mnt-matrix-wrap::-webkit-scrollbar-thumb,\s*\.mnt-target-scroll-pane::-webkit-scrollbar-thumb,\s*\.mnt-tree::-webkit-scrollbar-thumb,\s*\.mnt-channel-tree::-webkit-scrollbar-thumb,\s*\.mnt-edit-list::-webkit-scrollbar-thumb`;
  const webkitTrackSelector = String.raw`\.mnt-matrix-wrap::-webkit-scrollbar-track,\s*\.mnt-target-scroll-pane::-webkit-scrollbar-track,\s*\.mnt-tree::-webkit-scrollbar-track,\s*\.mnt-channel-tree::-webkit-scrollbar-track,\s*\.mnt-edit-list::-webkit-scrollbar-track`;
  const scrollSurfaceBlock = cssRuleBodyByPattern(maintenancePageCss, scrollSurfaceSelector);
  const webkitScrollbarBlock = cssRuleBodyByPattern(maintenancePageCss, webkitScrollbarSelector);
  const webkitThumbBlock = cssRuleBodyByPattern(maintenancePageCss, webkitThumbSelector);
  const webkitTrackBlock = cssRuleBodyByPattern(maintenancePageCss, webkitTrackSelector);

  assert.match(scrollSurfaceBlock, /scrollbar-width:\s*thin;/);
  assert.match(scrollSurfaceBlock, /scrollbar-color:\s*rgba\(255,\s*255,\s*255,\s*\.36\)\s*transparent;/);
  assert.match(webkitScrollbarBlock, /width:\s*8px;/);
  assert.match(webkitScrollbarBlock, /height:\s*8px;/);
  assert.match(webkitThumbBlock, /background:\s*rgba\(255,\s*255,\s*255,\s*\.36\);/);
  assert.match(webkitThumbBlock, /border-radius:\s*999px;/);
  assert.match(webkitThumbBlock, /border:\s*2px solid transparent;/);
  assert.match(webkitTrackBlock, /background:\s*transparent;/);
});
