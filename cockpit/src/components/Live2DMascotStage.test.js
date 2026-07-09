/*
 更新时间: 2026-07-09 13:18:11 CST
 更新内容: 验收本地福小客 rig 使用离散帧 motion bridge 衔接动作，并禁止旧 ghost crossfade 层回归。
*/
/*
 Update time: 2026-07-08 20:29:00 CST
 Update content: Forbid external sample-character fallback so the visible sidebar mascot remains Fu Xiaoke.
*/
/*
 Update time: 2026-07-08 20:02:00 CST
 Update content: Require Live2D fitting to use local bounds so compact sidebar rendering stays visible.
*/
/*
 Update time: 2026-07-08 19:51:00 CST
 Update content: Require Pixi cleanup to preserve the React-owned canvas during development remounts.
*/
/*
 Update time: 2026-07-08 19:43:00 CST
 Update content: Require same-origin Live2D asset probes to recheck with GET when HEAD cannot prove the content type.
*/
/*
 Update time: 2026-07-08 18:55:00 CST
 Update content: Require Live2D assets to be checked before Pixi and Cubism are loaded.
*/
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
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const componentSource = readFileSync(new URL('./Live2DMascotStage.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('./Live2DMascotStage.css', import.meta.url), 'utf8');
const componentCode = stripSourceComments(componentSource);
const cssCode = stripSourceComments(cssSource);
const live2dModelUrl = new URL('../../public/live2d/fuxiaoke/fuxiaoke.model3.json', import.meta.url);
const live2dMocUrl = new URL('../../public/live2d/fuxiaoke/fuxiaoke.moc3', import.meta.url);
const live2dIdleMotionUrl = new URL('../../public/live2d/fuxiaoke/motions/idle.motion3.json', import.meta.url);

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

test('fits full-body Live2D models inside the compact sidebar stage', () => {
  assert.match(componentCode, /function getModelBounds\(model\)/);
  assert.match(componentCode, /model\.getLocalBounds\?\.\(\)/);
  assert.match(componentCode, /Math\.abs\(bounds\?\.width \|\| 0\) \|\| model\.width \|\| 1/);
  assert.match(componentCode, /Math\.min\(app\.screen\.width \/ bounds\.width,\s*app\.screen\.height \/ bounds\.height\) \* 0\.94/);
  assert.match(componentCode, /app\.screen\.width \/ 2 - \(bounds\.x \+ bounds\.width \/ 2\) \* scale/);
  assert.match(componentCode, /app\.screen\.height \/ 2 - \(bounds\.y \+ bounds\.height \/ 2\) \* scale/);
  assert.doesNotMatch(componentCode, /model\.anchor\?\.set\?\.\(0\.5,\s*0\.5\)/);
  assert.doesNotMatch(componentCode, /model\.position\.set\(app\.screen\.width \/ 2,\s*app\.screen\.height \* 0\.92\)/);
});

test('uses local Fu Xiaoke Live2D paths and falls back when assets are absent', () => {
  assert.match(componentCode, /MASCOT_LIVE2D_MODEL_SOURCE = '\/live2d\/fuxiaoke\/fuxiaoke\.model3\.json';/);
  assert.match(componentCode, /MASCOT_LIVE2D_CORE_SOURCE = '\/live2d\/live2dcubismcore\.min\.js';/);
  assert.match(componentCode, /canUseLive2DAssets\(coreSource,\s*modelSource\)/);
  assert.match(componentCode, /loadScriptOnce\(coreSource\)/);
  assert.match(componentCode, /if \(!window\.Live2DCubismCore\) \{/);
  assert.match(componentCode, /onLoadStateChange\?\.\('checking'\);/);
  assert.match(componentCode, /onLoadStateChange\?\.\('loading'\);/);
  assert.match(componentCode, /onLoadStateChange\?\.\('ready'\);/);
  assert.match(componentCode, /onLoadStateChange\?\.\('fallback'\);/);
});

test('ships a complete local Fu Xiaoke rig resource pack', () => {
  assert.ok(existsSync(live2dModelUrl), 'Fu Xiaoke model3 entry should exist');
  assert.ok(existsSync(live2dMocUrl), 'Fu Xiaoke local rig moc payload should exist');
  const model = JSON.parse(readFileSync(live2dModelUrl, 'utf8'));
  const mocPayload = readFileSync(live2dMocUrl, 'utf8');
  assert.equal(model.Meta.LocalRenderer, 'fuxiaoke-local-rig-v1');
  assert.equal(model.FileReferences.Moc, 'fuxiaoke.moc3');
  assert.match(mocPayload, /fuxiaoke-local-rig-v1/);
  for (const group of ['Idle', 'Wave', 'Guide', 'Talk', 'Think', 'Alert', 'Celebrate', 'Tap', 'tap_body']) {
    const motionFile = model.FileReferences.Motions[group]?.[0]?.File;
    assert.ok(motionFile, `${group} should declare a motion3 file`);
    assert.ok(
      existsSync(new URL(`../../public/live2d/fuxiaoke/${motionFile}`, import.meta.url)),
      `${motionFile} should exist`,
    );
  }
});

test('keeps local motion fade metadata short enough for crisp action changes', () => {
  const idleMotion = JSON.parse(readFileSync(live2dIdleMotionUrl, 'utf8'));
  assert.ok(idleMotion.Meta.FadeInTime <= 0.18);
  assert.ok(idleMotion.Meta.FadeOutTime <= 0.18);
  const eyeOpenCurve = idleMotion.Curves.find((curve) => curve.Id === 'ParamEyeLOpen');
  assert.deepEqual(eyeOpenCurve.Segments.slice(2, 8), [0.62, 1, 0.68, 0, 0.76, 1]);
});

test('prefers the local Fu Xiaoke rig before falling back to Cubism runtime loading', () => {
  assert.match(componentCode, /LOCAL_FU_XIAOKE_RIG_FORMAT = 'fuxiaoke-local-rig-v1';/);
  assert.match(componentCode, /function resolveLive2DAssetPath\(modelSource,\s*assetPath\)/);
  assert.match(componentCode, /function loadLocalFuXiaokeRigAssets\(modelSource\)/);
  assert.match(componentCode, /model\?\.Meta\?\.LocalRenderer !== LOCAL_FU_XIAOKE_RIG_FORMAT/);
  assert.match(componentCode, /mocPayload\.includes\(LOCAL_FU_XIAOKE_RIG_FORMAT\)/);
  assert.match(componentCode, /const localRigModel = await loadLocalFuXiaokeRigAssets\(modelSource\);/);
  assert.match(componentCode, /setLocalRigReady\(true\);/);
  assert.match(componentCode, /onLoadStateChange\?\.\('ready'\);/);
  assert.match(componentCode, /<FuxiaokeLocalRigStage action=\{action\} \/>/);
});

test('does not show an external sample character when Fu Xiaoke Live2D assets are missing', () => {
  assert.doesNotMatch(componentCode, /Haru|CubismWebSamples|cdn\.jsdelivr\.net|cubism\.live2d\.com/);
  assert.doesNotMatch(componentCode, /SAMPLE_MODEL_SOURCE|SAMPLE_CORE_SOURCE|SAMPLE_FALLBACK/);
  assert.doesNotMatch(componentCode, /sampleFallbackEnabled|sampleModelSource|sampleCoreSource|sample-loading/);
  assert.match(componentCode, /if \(!assetsAvailable\) \{\s*onLoadStateChange\?\.\('fallback'\);\s*return;/);
});

test('checks same-origin Live2D assets before loading runtime code', () => {
  assert.match(componentCode, /function isSameOriginAsset\(src\)/);
  assert.match(componentCode, /function hasExpectedContentType\(response,\s*kind\)/);
  assert.match(componentCode, /function hasContentType\(response\)/);
  assert.match(componentCode, /function isLive2DAssetReachable\(src,\s*kind\)/);
  assert.match(componentCode, /fetch\(src,\s*\{\s*method:\s*'HEAD',\s*cache:\s*'no-store'\s*\}\)/);
  assert.match(componentCode, /if \(response\.ok && hasContentType\(response\)\) return hasExpectedContentType\(response,\s*kind\);/);
  assert.match(componentCode, /if \(!response\.ok && response\.status !== 405 && response\.status !== 501\) return false;/);
  assert.match(componentCode, /fetch\(src,\s*\{\s*method:\s*'GET',\s*cache:\s*'no-store'\s*\}\)/);
  assert.match(componentCode, /contentType\.includes\('text\/html'\)/);
  assert.match(componentCode, /LIVE2D_ASSET_CONTENT_TYPES\[kind\]\.some/);
  assert.match(componentCode, /Promise\.all\(\[\s*isLive2DAssetReachable\(coreSource,\s*'core'\),\s*isLive2DAssetReachable\(modelSource,\s*'model'\),/);
  assert.match(componentCode, /if \(!assetsAvailable\) \{\s*onLoadStateChange\?\.\('fallback'\);\s*return;/);
});

test('guards optional resize observation after Live2D has loaded', () => {
  assert.match(componentCode, /if \(typeof ResizeObserver !== 'undefined'\) \{/);
  assert.match(componentCode, /resizeObserver = new ResizeObserver/);
  assert.match(componentCode, /resizeObserver\.observe\(containerRef\.current\);/);
  assert.match(componentCode, /resizeObserver\?\.disconnect\(\);/);
});

test('preserves the React-owned canvas while cleaning up Pixi resources', () => {
  assert.match(componentCode, /app\.destroy\(false\);/);
  assert.match(componentCode, /appRef\.current\?\.destroy\(false,\s*\{\s*children:\s*true\s*\}\);/);
  assert.doesNotMatch(componentCode, /app\.destroy\(true\)/);
  assert.doesNotMatch(componentCode, /appRef\.current\?\.destroy\(true/);
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
  assert.match(cssCode, /\.mascot-live2d-stage\s*\{[\s\S]*transition:\s*none;/);
  assert.match(cssCode, /\.mascot-live2d-stage__canvas\s*\{[\s\S]*pointer-events:\s*none;/);
  assert.match(cssCode, /\.mascot-sprite-stage--live2d-ready\s+\.mascot-live2d-stage\s*\{[\s\S]*opacity:\s*1;/);
  assert.match(cssCode, /\.mascot-sprite-stage--live2d-ready\s+\.mascot-sprite-stage__sheet\s*\{[\s\S]*opacity:\s*0;/);
});

test('renders the local Fu Xiaoke rig as a click-through ready layer', () => {
  assert.match(cssCode, /\.mascot-local-live2d-rig,\s*[\s\S]*?\.mascot-local-live2d-rig__sheet\s*\{[\s\S]*pointer-events:\s*none;/);
  assert.match(cssCode, /\.mascot-local-live2d-rig__sheet\s*\{[\s\S]*background-image:\s*var\(--fuxiaoke-rig-sheet-url\);/);
  assert.match(cssCode, /\.mascot-local-live2d-rig__sheet\s*\{[\s\S]*background-size:\s*var\(--fuxiaoke-rig-sheet-width\) 100%;/);
  assert.match(cssCode, /\.mascot-local-live2d-rig__sheet\s*\{[\s\S]*animation:\s*none;/);
  assert.doesNotMatch(cssCode, /fuxiaoke-local-rig-idle/);
  assert.doesNotMatch(cssCode, /fuxiaoke-local-rig-crossfade-out|mascot-local-live2d-rig__sheet--ghost|mascot-local-live2d-rig__blend-layer/);
});

test('uses frame-level motion bridges instead of ghost overlays for local rig action changes', () => {
  assert.match(componentCode, /LOCAL_RIG_MOTION_BRIDGE_FPS = 14;/);
  assert.match(componentCode, /function buildLocalRigMotionBridge\(fromAnimation,\s*fromCursor,\s*toAnimation\)/);
  assert.match(componentCode, /getOutgoingSettleFrames\(fromAnimation,\s*fromCursor\)/);
  assert.match(componentCode, /toAnimation\.frames\s*\.\s*slice\(0,\s*LOCAL_RIG_LEAD_IN_FRAME_COUNT\)/);
  assert.match(componentCode, /const \[motionBridge,\s*setMotionBridge\] = useState\(null\);/);
  assert.match(componentCode, /motionBridge\?\.frames\[bridgeCursor\]/);
  assert.doesNotMatch(componentCode, /transitionGhost|transitionTimeoutRef|mascot-local-live2d-rig__sheet--ghost|mascot-local-live2d-rig__blend-layer/);
});
