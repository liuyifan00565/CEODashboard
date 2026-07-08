/*
 Update time: 2026-07-08 15:48:00 CST
 Update content: Require Live2D resize handling to be guarded when ResizeObserver is unavailable.
*/
/*
 Update time: 2026-07-08 15:32:00 CST
 Update content: Require Pixi to be lazy-loaded with the Live2D renderer instead of entering the main dashboard bundle.
*/
/*
 Update time: 2026-07-08 15:24:00 CST
 Update content: Add regression coverage for the optional Pixi Live2D Fu Xiaoke mascot renderer and fallback boundary.
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const componentSource = readFileSync(new URL('./Live2DMascotStage.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('./Live2DMascotStage.css', import.meta.url), 'utf8');
const componentCode = stripSourceComments(componentSource);
const cssCode = stripSourceComments(cssSource);

function stripSourceComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

test('loads Live2D through Pixi without owning mascot click behavior', () => {
  assert.doesNotMatch(componentCode, /import \* as PIXI from 'pixi\.js';/);
  assert.match(componentCode, /import\('pixi\.js'\)/);
  assert.match(componentCode, /import\('pixi-live2d-display\/cubism4'\)/);
  assert.match(componentCode, /Promise\.all\(\[/);
  assert.match(componentCode, /window\.PIXI = PIXI;/);
  assert.match(componentCode, /new PIXI\.Application\(\{/);
  assert.match(componentCode, /view:\s*canvasRef\.current/);
  assert.match(componentCode, /backgroundAlpha:\s*0/);
  assert.match(componentCode, /Live2DModel\.from\(modelSource\)/);
  assert.doesNotMatch(componentCode, /onClick|onPointerDown|onPointerMove|addEventListener\('click'/);
});

test('uses local Fu Xiaoke Live2D paths and falls back when assets are absent', () => {
  assert.match(componentCode, /MASCOT_LIVE2D_MODEL_SOURCE = '\/live2d\/fuxiaoke\/fuxiaoke\.model3\.json';/);
  assert.match(componentCode, /MASCOT_LIVE2D_CORE_SOURCE = '\/live2d\/live2dcubismcore\.min\.js';/);
  assert.match(componentCode, /loadScriptOnce\(coreSource\)/);
  assert.match(componentCode, /if \(!window\.Live2DCubismCore\) \{/);
  assert.match(componentCode, /onLoadStateChange\?\.\('loading'\);/);
  assert.match(componentCode, /onLoadStateChange\?\.\('ready'\);/);
  assert.match(componentCode, /onLoadStateChange\?\.\('fallback'\);/);
});

test('guards optional resize observation after Live2D has loaded', () => {
  assert.match(componentCode, /if \(typeof ResizeObserver !== 'undefined'\) \{/);
  assert.match(componentCode, /resizeObserver = new ResizeObserver/);
  assert.match(componentCode, /resizeObserver\.observe\(containerRef\.current\);/);
  assert.match(componentCode, /resizeObserver\?\.disconnect\(\);/);
});

test('maps existing mascot actions to optional Live2D motion groups', () => {
  [
    'idle',
    'wave',
    'guide',
    'talk',
    'think',
    'alert',
    'celebrate',
    'click',
  ].forEach((action) => {
    assert.match(componentCode, new RegExp(`\\[MASCOT_ACTIONS\\.${action}\\]`));
  });
  assert.match(componentCode, /function playFirstAvailableMotion\(model,\s*action\)/);
  assert.match(componentCode, /model\.motion\?\.\(group\)/);
  assert.match(componentCode, /catch \{\s*\}/);
});

test('keeps Live2D canvas transparent and unable to steal launcher clicks', () => {
  assert.match(cssCode, /\.mascot-live2d-stage\s*\{/);
  assert.match(cssCode, /\.mascot-live2d-stage\s*\{[\s\S]*pointer-events:\s*none;/);
  assert.match(cssCode, /\.mascot-live2d-stage__canvas\s*\{[\s\S]*pointer-events:\s*none;/);
  assert.match(cssCode, /\.mascot-sprite-stage--live2d-ready\s+\.mascot-live2d-stage\s*\{[\s\S]*opacity:\s*1;/);
  assert.match(cssCode, /\.mascot-sprite-stage--live2d-ready\s+\.mascot-sprite-stage__sheet\s*\{[\s\S]*opacity:\s*0;/);
});
