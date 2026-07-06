/*
 更新时间: 2026-07-06 11:02:20 CST
 更新内容: 验收 AI 小人从单张参考 PNG 升级为 imagegen 透明图切层骨骼 rig，并覆盖动作层驱动。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const mascotTransparentUrl = new URL('../../public/ai-mascot-transparent.png', import.meta.url);
const rigLayerUrls = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg']
  .map((name) => new URL(`../../public/mascot-rig/${name}.png`, import.meta.url));
const stageCode = stripSourceComments(stageSource);
const stageCssCode = stripSourceComments(stageCss);

function stripSourceComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function countMatches(source, patterns) {
  return patterns.filter((pattern) => pattern.test(source)).length;
}

function readPngMeta(url) {
  const bytes = readFileSync(url);
  return {
    signature: bytes.toString('ascii', 1, 4),
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  };
}

test('renders Fu Xiaoke as a six-layer imagegen rig instead of a single full-body image', () => {
  const expectedLayers = ['left-leg', 'right-leg', 'body', 'left-arm', 'right-arm', 'head'];

  assert.match(stageCode, /MASCOT_RIG_LAYERS\s*=\s*\[/);
  for (const layer of expectedLayers) {
    assert.match(stageCode, new RegExp(`id:\\s*['"]${layer}['"][\\s\\S]*src:\\s*['"]/mascot-rig/${layer}\\.png['"]`));
    assert.match(stageCode, new RegExp(`mascot-rig-layer--\\$\\{layer\\.id\\}`));
  }

  assert.match(stageCode, /<span className="mascot-rig-root" aria-hidden="true">/);
  assert.match(stageCode, /MASCOT_RIG_LAYERS\.map/);
  assert.match(stageCode, /<img[\s\S]*className=\{`mascot-rig-layer mascot-rig-layer--\$\{layer\.id\}`\}[\s\S]*src=\{layer\.src\}/);
  assert.match(stageCssCode, /\.mascot-rig-root\s*\{/);
  assert.match(stageCssCode, /\.mascot-rig-layer\s*\{/);

  assert.doesNotMatch(stageCode, /REFERENCE_MASCOT_SOURCE|src=\{REFERENCE_MASCOT_SOURCE\}|className="mascot-imagegen-asset"/);
  assert.doesNotMatch(stageCode, /<svg\b|mascot-layered-rig|mascot-layer--|wing-logo/);
  assert.doesNotMatch(stageCode, /@react-three\/fiber|@react-three\/drei|new THREE|<Canvas\b|useFrame\s*\(/);
  assert.doesNotMatch(stageCode, /<mesh\b|sphereGeometry|capsuleGeometry|boxGeometry|meshStandardMaterial|TextureLoader|useTexture/);
  assert.doesNotMatch(stageCode, /MASCOT_ACTION_POSES|ceo-mascot-[\w-]+\.png|ai-mascot-frames|sprite/i);
});

test('ships reference and rig layers as transparent same-canvas PNG assets', () => {
  assert.ok(existsSync(mascotTransparentUrl), 'reference transparent mascot asset should exist');
  const referenceMeta = readPngMeta(mascotTransparentUrl);
  assert.equal(referenceMeta.signature, 'PNG');
  assert.equal(referenceMeta.width, 1084);
  assert.equal(referenceMeta.height, 1451);
  assert.ok([4, 6].includes(referenceMeta.colorType), 'reference PNG should include an alpha channel');

  for (const layerUrl of rigLayerUrls) {
    assert.ok(existsSync(layerUrl), `${layerUrl.pathname} should exist`);
    const layerMeta = readPngMeta(layerUrl);
    assert.equal(layerMeta.signature, 'PNG');
    assert.equal(layerMeta.width, 1084);
    assert.equal(layerMeta.height, 1451);
    assert.ok([4, 6].includes(layerMeta.colorType), `${layerUrl.pathname} should include an alpha channel`);
  }
});

test('defines independent bone pivots for head body arms and legs', () => {
  const boneSignals = [
    /\.mascot-rig-layer--head\s*\{[\s\S]*transform-origin:\s*50%\s+48%;/,
    /\.mascot-rig-layer--body\s*\{[\s\S]*transform-origin:\s*50%\s+70%;/,
    /\.mascot-rig-layer--left-arm\s*\{[\s\S]*transform-origin:\s*33%\s+50%;/,
    /\.mascot-rig-layer--right-arm\s*\{[\s\S]*transform-origin:\s*67%\s+50%;/,
    /\.mascot-rig-layer--left-leg\s*\{[\s\S]*transform-origin:\s*39%\s+72%;/,
    /\.mascot-rig-layer--right-leg\s*\{[\s\S]*transform-origin:\s*59%\s+72%;/,
  ];

  assert.equal(countMatches(stageCssCode, boneSignals), boneSignals.length, 'each visible part should have its own pivot');
  assert.match(stageCssCode, /will-change:\s*transform/);
  assert.match(stageCssCode, /position:\s*absolute/);
  assert.match(stageCssCode, /inset:\s*0/);
});

test('drives the rig with action classes and pointer variables instead of frame swaps', () => {
  assert.match(stageCode, /MASCOT_ACTIONS\.(?:idle|wave|talk|think|alert|celebrate|click)/);
  assert.match(stageCode, /data-action=\{safeAction\}/);
  assert.match(stageCode, /style=\{stageStyle\}/);
  assert.match(stageCode, /--mascot-pointer-x/);
  assert.match(stageCode, /--mascot-pointer-y/);
  assert.match(stageCode, /--mascot-pointer-translate-x/);
  assert.match(stageCode, /--mascot-pointer-translate-y/);
  assert.match(stageCode, /Math\.max\(-1,\s*Math\.min\(1,/);

  const actionSignals = [
    /\.mascot-action--idle/,
    /\.mascot-action--wave/,
    /\.mascot-action--talk/,
    /\.mascot-action--think/,
    /\.mascot-action--alert/,
    /\.mascot-action--celebrate/,
    /\.mascot-action--click/,
    /@keyframes mascot-rig-float/,
    /@keyframes mascot-rig-head-idle/,
    /@keyframes mascot-rig-wave-right/,
    /@keyframes mascot-rig-talk-head/,
    /@keyframes mascot-rig-alert-root/,
    /@keyframes mascot-rig-celebrate-left-arm/,
    /@keyframes mascot-rig-celebrate-right-arm/,
    /@keyframes mascot-rig-leg-bounce/,
  ];

  assert.equal(countMatches(stageCssCode, actionSignals), actionSignals.length, 'all companion actions should map to high-frame rig motion');
  assert.match(stageCssCode, /var\(--mascot-pointer-translate-x\)/);
  assert.match(stageCssCode, /var\(--mascot-pointer-translate-y\)/);
  assert.match(stageCssCode, /var\(--mascot-pointer-tilt\)/);
  assert.doesNotMatch(stageCode, /scaleX|scaleY/);
  assert.doesNotMatch(stageCssCode, /scaleX\(|scaleY\(/);
  assert.doesNotMatch(stageCode, /ai-mascot-sprite|mascot-frame|poseKey|frameIndex/i);
});

test('keeps the AI mascot compact while preserving the original launcher treatment', () => {
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{/);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*width:\s*112px;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1\.34;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*overflow:\s*visible;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*filter:\s*drop-shadow\(0 18px 30px rgba\(0, 0, 0, \.38\)\) drop-shadow\(0 0 30px rgba\(114, 77, 255, \.24\)\);/s);
  assert.match(stageCssCode, /\.mascot-3d-stage--default\s*\{[^}]*width:\s*96px;/s);
  assert.match(stageCssCode, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.mascot-3d-stage\s*\{[^}]*width:\s*96px;[\s\S]*?\.mascot-3d-stage--default\s*\{[^}]*width:\s*84px;/);
});
