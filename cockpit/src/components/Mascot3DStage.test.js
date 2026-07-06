/*
 更新时间: 2026-07-06 12:35:55 CST
 更新内容: 增加 AI 小人正面参考图还原验收，锁定脸部开窗轮廓、福客 logo 中轴位置和项目 logo.png。
*/
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const generatorSource = readFileSync(new URL('../../../scripts/generate_ai_mascot_glb.py', import.meta.url), 'utf8');
const glbUrl = new URL('../../public/models/ai-mascot.glb', import.meta.url);
const stageCode = stripSourceComments(stageSource);
const stageCssCode = stripSourceComments(stageCss);
const generatorCode = stripSourceComments(generatorSource);

function stripSourceComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"""[\s\S]*?"""/g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/#.*$/gm, '');
}

function countMatches(source, patterns) {
  return patterns.filter((pattern) => pattern.test(source)).length;
}

function readGlbHeader(url) {
  const bytes = readFileSync(url);
  return {
    magic: bytes.toString('ascii', 0, 4),
    version: bytes.readUInt32LE(4),
    length: bytes.readUInt32LE(8),
    fileSize: bytes.length,
  };
}

test('ships a real Blender-generated GLB mascot model instead of PNG frame or layer assets', () => {
  assert.ok(existsSync(glbUrl), 'GLB mascot model should exist');
  assert.ok(statSync(glbUrl).size > 500000, 'GLB mascot should contain real model data, not a placeholder');

  const header = readGlbHeader(glbUrl);
  assert.equal(header.magic, 'glTF');
  assert.equal(header.version, 2);
  assert.equal(header.length, header.fileSize);

  assert.match(generatorCode, /import\s+bpy/);
  assert.match(generatorCode, /bpy\.ops\.export_scene\.gltf/);
  assert.match(generatorCode, /export_format\s*=\s*["']GLB["']/);
  assert.match(generatorCode, /OUTPUT\s*=\s*ROOT\s*\/\s*["']cockpit["']\s*\/\s*["']public["']\s*\/\s*["']models["']\s*\/\s*["']ai-mascot\.glb["']/);
  assert.match(generatorCode, /transparent-glass-dome/);
  assert.match(generatorCode, /shape_panel\(["']soft-face-panel["']/);
  assert.match(generatorCode, /purple-face-window-rim/);
  assert.match(generatorCode, /AI-badge-text/);
  assert.match(generatorCode, /microphone-boom/);
  assert.match(generatorCode, /LOGO_IMAGE\s*=\s*ROOT\s*\/\s*["']logo\.png["']/);
  assert.match(generatorCode, /image_plane\(["']helmet-wing-logo["'],\s*LOGO_IMAGE,\s*\(0,\s*-1\.055,\s*2\.19\),\s*0\.245/);
  assert.doesNotMatch(generatorCode, /helmet-wing-logo["'],\s*["']F["']/);

  assert.doesNotMatch(stageCode, /MASCOT_RIG_LAYERS|mascot-rig-layer|MASCOT_ACTION_POSES|ceo-mascot-[\w-]+\.png|ai-mascot-frames|sprite/i);
  assert.doesNotMatch(stageCode, /\/mascot-rig\/(?:head|body|left-arm|right-arm|left-leg|right-leg)\.png/);
});

test('loads the GLB through React Three Fiber with an image fallback only for failure or loading', () => {
  assert.match(stageCode, /from\s+['"]@react-three\/fiber['"]/);
  assert.match(stageCode, /from\s+['"]@react-three\/drei['"]/);
  assert.match(stageCode, /from\s+['"]three['"]/);
  assert.match(stageCode, /MASCOT_GLB_SOURCE\s*=\s*['"]\/models\/ai-mascot\.glb['"]/);
  assert.match(stageCode, /useGLTF\(MASCOT_GLB_SOURCE\)/);
  assert.match(stageCode, /useGLTF\.preload\(MASCOT_GLB_SOURCE\)/);
  assert.match(stageCode, /<Canvas[\s\S]*orthographic/);
  assert.match(stageCode, /preserveDrawingBuffer:\s*true/);
  assert.match(stageCode, /<primitive\s+object=\{model\}[\s\S]*position=\{\[0,\s*-1\.28,\s*0\]\}[\s\S]*scale=\{0\.92\}/);
  assert.match(stageCode, /MascotCanvasErrorBoundary/);
  assert.match(stageCode, /FALLBACK_MASCOT_SOURCE\s*=\s*['"]\/ai-mascot-transparent\.png['"]/);
  assert.match(stageCssCode, /\.mascot-3d-stage--ready\s+\.mascot-reference-fallback\s*\{[\s\S]*visibility:\s*hidden;/);
  assert.match(stageCssCode, /\.mascot-3d-stage--failed\s+\.mascot-reference-fallback\s*\{[\s\S]*visibility:\s*visible;/);

  assert.doesNotMatch(stageCode, /TextureLoader|useTexture|<img[\s\S]*mascot-rig-layer/);
  assert.doesNotMatch(stageCssCode, /\.mascot-rig-root|\.mascot-rig-layer/);
});

test('defines named GLB control nodes for high-frame code-driven actions', () => {
  const controls = [
    'MascotRoot',
    'BodyCtrl',
    'HeadCtrl',
    'LeftArmCtrl',
    'RightArmCtrl',
    'LeftLegCtrl',
    'RightLegCtrl',
  ];

  for (const control of controls) {
    assert.match(stageCode, new RegExp(`['"]${control}['"]`));
    assert.match(generatorCode, new RegExp(`empty\\(['"]${control}['"]`));
  }

  assert.match(stageCode, /model\.getObjectByName\(name\)/);
  assert.match(stageCode, /snapshotTransform\(object\)/);
  assert.match(stageCode, /restoreTransform\(controls\.root/);
  assert.match(stageCode, /restoreTransform\(controls\.head/);
  assert.match(stageCode, /restoreTransform\(controls\.leftArm/);
  assert.match(stageCode, /restoreTransform\(controls\.rightArm/);
  assert.match(stageCode, /restoreTransform\(controls\.leftLeg/);
  assert.match(stageCode, /restoreTransform\(controls\.rightLeg/);
});

test('maps every mascot companion action to control-node motion instead of swapping frames', () => {
  const actionSignals = [
    /MASCOT_ACTIONS\.wave/,
    /MASCOT_ACTIONS\.talk/,
    /MASCOT_ACTIONS\.think/,
    /MASCOT_ACTIONS\.alert/,
    /MASCOT_ACTIONS\.celebrate/,
    /MASCOT_ACTIONS\.click/,
    /analysisActive\s*\|\|\s*action\s*===\s*MASCOT_ACTIONS\.talk/,
    /useFrame\s*\(/,
    /performance\.now\(\)/,
    /pointer\.active/,
    /Math\.sin\(t\s*\*/,
    /rightArmRotZ/,
    /leftArmRotZ/,
    /headRotZ/,
    /rootScale/,
  ];

  assert.equal(countMatches(stageCode, actionSignals), actionSignals.length, 'all companion actions should drive continuous 3D control motion');
  assert.match(stageCode, /data-action=\{safeAction\}/);
  assert.match(stageCode, /clampUnit\(pointer\.x\)/);
  assert.match(stageCode, /clampUnit\(pointer\.y\)/);
  assert.doesNotMatch(stageCode, /frameIndex|poseKey|requestAnimationFrame|setInterval/);
});

test('keeps the GLB mascot compact for the dashboard launcher', () => {
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{/);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*width:\s*112px;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1\.34;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*overflow:\s*visible;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*drop-shadow\(0 0 30px rgba\(184, 156, 255, \.18\)\);/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s+canvas\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage--default\s*\{[^}]*width:\s*96px;/s);
  assert.match(stageCssCode, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.mascot-3d-stage\s*\{[^}]*width:\s*96px;[\s\S]*?\.mascot-3d-stage--default\s*\{[^}]*width:\s*84px;/);
});
