/*
 更新时间: 2026-07-07 13:20:49 CST
 更新内容: 增加高精度配色 GLB 和稳定待机动作验收，修复颜色粗糙与小人乱跑回归风险。
*/
/*
 更新时间: 2026-07-07 13:02:18 CST
 更新内容: 增加用户配色 FBX 的顶点色转移验收，确保当前 GLB 不再只是零件均色。
*/
/*
 更新时间: 2026-07-07 12:24:46 CST
 更新内容: 将当前页面 AI 小人验收切换为用户 FBX 优化 GLB，约束转换脚本、控制节点和轻量化体积。
*/
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
const converterSource = readFileSync(new URL('../../../scripts/convert_component_rig_to_glb.mjs', import.meta.url), 'utf8');
const glbUrl = new URL('../../public/models/ai-mascot.glb', import.meta.url);
const lockedGlbUrl = new URL('../../public/models/mascot_graymodel_v2_locked.glb', import.meta.url);
const lockedPreviewUrl = new URL('../../public/models/mascot_graymodel_v2_locked_preview.png', import.meta.url);
const stageCode = stripSourceComments(stageSource);
const stageCssCode = stripSourceComments(stageCss);
const generatorCode = stripSourceComments(generatorSource);
const converterCode = stripSourceComments(converterSource);
const glbJson = readGlbJson(glbUrl);

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

function readGlbJson(url) {
  const bytes = readFileSync(url);
  let offset = 12;

  while (offset < bytes.length) {
    const chunkLength = bytes.readUInt32LE(offset);
    const chunkType = bytes.toString('ascii', offset + 4, offset + 8);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkType === 'JSON') {
      return JSON.parse(bytes.toString('utf8', chunkStart, chunkEnd));
    }

    offset = chunkEnd;
  }

  throw new Error('GLB JSON chunk should exist');
}

function glbNames(collection) {
  return new Set((collection ?? []).map((item) => item.name).filter(Boolean));
}

function glbPrimitives(json) {
  return (json.meshes ?? []).flatMap((mesh) => mesh.primitives ?? []);
}

function glbAttributeVertexCount(json, attributeName) {
  return glbPrimitives(json).reduce((sum, primitive) => {
    const accessorIndex = primitive.attributes?.[attributeName];
    if (!Number.isInteger(accessorIndex)) return sum;
    return sum + (json.accessors?.[accessorIndex]?.count ?? 0);
  }, 0);
}

test('ships the optimized rigged FBX mascot model instead of the previous generated mascot', () => {
  assert.ok(existsSync(glbUrl), 'GLB mascot model should exist');
  assert.ok(statSync(glbUrl).size > 8000000, 'High-fidelity rigged mascot should contain enough vertex-color detail from the user FBX');
  assert.ok(statSync(glbUrl).size < 25000000, 'High-fidelity rigged mascot should stay reasonable for dashboard loading');

  const header = readGlbHeader(glbUrl);
  assert.equal(header.magic, 'glTF');
  assert.equal(header.version, 2);
  assert.equal(header.length, header.fileSize);

  const nodeNames = glbNames(glbJson.nodes);
  for (const control of ['MascotRoot', 'BodyCtrl', 'HeadCtrl', 'LeftArmCtrl', 'RightArmCtrl', 'LeftLegCtrl', 'RightLegCtrl']) {
    assert.ok(nodeNames.has(control), `${control} should be present in the optimized rig`);
  }

  for (const rigNode of ['CTRL_HeadShell', 'CTRL_Face', 'CTRL_L_Ear', 'CTRL_R_Ear', 'CTRL_Mic_Body', 'CTRL_Mic_Boom', 'CTRL_L_Hand', 'CTRL_R_Hand']) {
    assert.ok(nodeNames.has(rigNode), `${rigNode} should preserve the imported FBX control structure`);
  }

  for (const meshName of ['part_0', 'part_1', 'part_2', 'part_3', 'part_4', 'part_5', 'part_6', 'part_7', 'part_8', 'part_9', 'part_10', 'part_11', 'part_12']) {
    assert.ok(nodeNames.has(meshName), `${meshName} should be preserved from the rigged FBX`);
  }

  assert.match(converterCode, /FBXLoader/);
  assert.match(converterCode, /GLTFExporter/);
  assert.match(converterCode, /MeshoptSimplifier/);
  assert.match(converterCode, /PNG\.sync\.read/);
  assert.match(converterCode, /colorSource/);
  assert.match(converterCode, /compactMesh/);
  assert.match(converterCode, /DEFAULT_RATIO\s*=\s*0\.18/);
  assert.match(converterCode, /DEFAULT_COLOR_SOURCE_STRIDE\s*=\s*1/);
  assert.match(converterCode, /MIN_COLOR_SEARCH_RADIUS\s*=\s*1/);
  assert.match(converterCode, /CTRL_Rig_Root:\s*['"]MascotRoot['"]/);
  assert.match(converterCode, /CTRL_Body:\s*['"]BodyCtrl['"]/);
  assert.match(converterCode, /CTRL_Head:\s*['"]HeadCtrl['"]/);

  assert.doesNotMatch(stageCode, /MASCOT_RIG_LAYERS|mascot-rig-layer|MASCOT_ACTION_POSES|ceo-mascot-[\w-]+\.png|ai-mascot-frames|sprite/i);
  assert.doesNotMatch(stageCode, /\/mascot-rig\/(?:head|body|left-arm|right-arm|left-leg|right-leg)\.png/);
});

test('bakes the user color-source FBX texture into GLB vertex colors', () => {
  const primitives = glbPrimitives(glbJson);
  const positionVertices = glbAttributeVertexCount(glbJson, 'POSITION');
  const colorVertices = glbAttributeVertexCount(glbJson, 'COLOR_0');

  assert.ok(primitives.length > 0, 'Optimized mascot GLB should contain mesh primitives');
  assert.ok(
    primitives.every((primitive) => Number.isInteger(primitive.attributes?.COLOR_0)),
    'Every optimized mascot primitive should carry baked COLOR_0 vertex colors from the color-source FBX',
  );
  assert.ok(positionVertices > 250000, 'Color transfer should retain enough vertices to preserve the source FBX detail');
  assert.equal(colorVertices, positionVertices, 'Every exported vertex should have a transferred texture color');
  assert.match(converterCode, /extractBaseColorTexture/);
  assert.match(converterCode, /assignVertexColorsFromSource/);
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
  assert.match(stageCode, /<primitive\s+object=\{model\}[\s\S]*position=\{\[0,\s*-1\.08,\s*0\]\}[\s\S]*scale=\{2\.16\}/);
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

test('keeps launcher idle motion anchored instead of wandering around the card', () => {
  assert.match(stageCode, /const pointerX = 0;/);
  assert.match(stageCode, /const pointerY = 0;/);
  assert.match(stageCode, /const idleFloat = Math\.sin\(t \* 1\.35\) \* 0\.012;/);
  assert.match(stageCode, /restoreTransform\(controls\.root,\s*base\.root,\s*\[0,\s*rootY,\s*0\]/);
  assert.doesNotMatch(stageCode, /pointer\.active\s*\?\s*pointer\.x\s*:\s*Math\.sin/);
  assert.doesNotMatch(stageCode, /pointer\.active\s*\?\s*pointer\.y\s*:\s*Math\.cos/);
  assert.doesNotMatch(stageCode, /pointerX\s*\*\s*0\.055/);
});

test('maps guide action to a right-side dialog pointing motion', () => {
  assert.match(stageCode, /MASCOT_ACTIONS\.guide/);
  assert.match(stageCode, /if \(action === MASCOT_ACTIONS\.guide\) \{/);
  assert.match(stageCode, /bodyRotZ \+= -0\.075;/);
  assert.match(stageCode, /headRotZ \+= -0\.12 \+ Math\.sin\(t \* 4\.2\) \* 0\.018;/);
  assert.match(stageCode, /rightArmPosition = \[0\.075,\s*0\.11,\s*0\];/);
  assert.match(stageCode, /rightArmRotZ \+= 0\.62 \+ Math\.sin\(t \* 5\.4\) \* 0\.045;/);
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
