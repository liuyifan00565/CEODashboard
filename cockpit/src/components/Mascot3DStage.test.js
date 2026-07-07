/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 增加 GLB 小人 guide 指引动作测试，约束右臂、头部和身体指向右侧对话框。
*/
/*
 更新时间: 2026-07-06 14:19:58 CST
 更新内容: 增加灰模锁定文件和 MASCOT_PART_MAP 分件清单验收，避免后续材质与形体精修覆盖基准。
*/
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const generatorSource = readFileSync(new URL('../../../scripts/generate_ai_mascot_glb.py', import.meta.url), 'utf8');
const glbUrl = new URL('../../public/models/ai-mascot.glb', import.meta.url);
const lockedGlbUrl = new URL('../../public/models/mascot_graymodel_v2_locked.glb', import.meta.url);
const lockedPreviewUrl = new URL('../../public/models/mascot_graymodel_v2_locked_preview.png', import.meta.url);
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
  assert.match(generatorCode, /helmet-lower-white-support-ring/);
  assert.match(generatorCode, /helmet-lower-white-left-cap/);
  assert.match(generatorCode, /helmet-lower-white-right-cap/);
  assert.doesNotMatch(generatorCode, /shape_panel\(\s*["']helmet-lower-white-band["']/);
  assert.doesNotMatch(generatorCode, /white-helmet-front-rim/);
  assert.match(generatorCode, /face-cushion-volume/);
  assert.match(generatorCode, /shape_panel\(["']soft-face-panel["']/);
  assert.doesNotMatch(generatorCode, /purple-face-window-rim/);
  assert.match(generatorCode, /sphere\(["']soft-suit-body["']/);
  assert.doesNotMatch(generatorCode, /soft-belly-volume/);
  assert.match(generatorCode, /shape_panel\(["']purple-front-yoke["']/);
  assert.match(generatorCode, /soft-hip-bridge/);
  assert.match(generatorCode, /left-shoulder-socket/);
  assert.match(generatorCode, /right-shoulder-socket/);
  assert.match(generatorCode, /left-shoulder-flow/);
  assert.match(generatorCode, /right-shoulder-flow/);
  assert.match(generatorCode, /left-soft-leg/);
  assert.match(generatorCode, /right-soft-leg/);
  assert.match(generatorCode, /ai-badge-recess-ring/);
  assert.match(generatorCode, /ai-badge-outer-bezel/);
  assert.match(generatorCode, /ai-badge-glow-core/);
  assert.doesNotMatch(generatorCode, /visor-brow-soft-highlight/);
  assert.doesNotMatch(generatorCode, /purple-visor-brow/);
  assert.doesNotMatch(generatorCode, /blue-glass-front-rim/);
  assert.doesNotMatch(generatorCode, /helmet-inner-shadow-rim/);
  assert.doesNotMatch(generatorCode, /glass-top-outer-highlight/);
  assert.doesNotMatch(generatorCode, /glass-left-side-highlight/);
  assert.match(generatorCode, /AI-badge-text/);
  assert.match(generatorCode, /microphone-boom/);
  assert.match(generatorCode, /LOGO_IMAGE\s*=\s*ROOT\s*\/\s*["']logo\.png["']/);
  assert.match(generatorCode, /image_plane\(["']helmet-wing-logo["'],\s*LOGO_IMAGE,\s*\(0,\s*-1\.055,\s*2\.19\),\s*0\.245/);
  assert.doesNotMatch(generatorCode, /helmet-wing-logo["'],\s*["']F["']/);

  assert.doesNotMatch(stageCode, /MASCOT_RIG_LAYERS|mascot-rig-layer|MASCOT_ACTION_POSES|ceo-mascot-[\w-]+\.png|ai-mascot-frames|sprite/i);
  assert.doesNotMatch(stageCode, /\/mascot-rig\/(?:head|body|left-arm|right-arm|left-leg|right-leg)\.png/);
});

test('locks the current graymodel checkpoint before material and detail passes', () => {
  assert.ok(existsSync(lockedGlbUrl), 'Locked graymodel GLB should exist before material work');
  assert.ok(existsSync(lockedPreviewUrl), 'Locked graymodel preview should exist before material work');
  assert.equal(readGlbHeader(lockedGlbUrl).magic, 'glTF');
  assert.ok(statSync(lockedGlbUrl).size > 500000);
  assert.ok(statSync(lockedPreviewUrl).size > 200000);
});

test('declares a functional part map for controlled mascot refinement passes', () => {
  const requiredPartGroups = [
    'head',
    'outer_helmet',
    'inner_face',
    'facial_features',
    'accessories',
    'helmet_support',
    'body',
    'badge',
    'arms',
    'legs',
  ];

  assert.match(generatorCode, /MASCOT_PART_MAP\s*=\s*\{/);
  for (const group of requiredPartGroups) {
    assert.match(generatorCode, new RegExp(`["']${group}["']\\s*:`));
  }

  for (const partName of [
    'transparent-glass-dome',
    'face-cushion-volume',
    'left-headphone-shell',
    'right-headphone-shell',
    'microphone-boom',
    'helmet-lower-white-support-ring',
    'soft-suit-body',
    'ai-badge-glow-core',
    'left-arm',
    'right-arm',
    'left-soft-leg',
    'right-soft-leg',
  ]) {
    assert.match(generatorCode, new RegExp(`["']${partName}["']`));
  }
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

test('maps guide action to a right-side dialog pointing motion', () => {
  assert.match(stageCode, /MASCOT_ACTIONS\.guide/);
  assert.match(stageCode, /if \(action === MASCOT_ACTIONS\.guide\) \{/);
  assert.match(stageCode, /bodyRotZ \+= -0\.075;/);
  assert.match(stageCode, /headRotZ \+= -0\.12 \+ Math\.sin\(t \* 4\.2\) \* 0\.018;/);
  assert.match(stageCode, /rightArmRotZ \+= -0\.68 \+ Math\.sin\(t \* 5\.4\) \* 0\.045;/);
  assert.match(stageCode, /leftArmRotZ \+= 0\.08;/);
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
