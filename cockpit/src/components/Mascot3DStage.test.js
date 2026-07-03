/*
 更新时间: 2026-07-03 18:27:19 CST
 更新内容: 改为检查去注释后的 AI 小人舞台源码，减少对具体实现名称和公式的绑定。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const mascotTransparentUrl = new URL('../../public/ai-mascot-transparent.png', import.meta.url);
const stageCode = stripSourceComments(stageSource);
const stageCssCode = stripSourceComments(stageCss);

function stripSourceComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function countMatches(source, patterns) {
  return patterns.filter((pattern) => pattern.test(source)).length;
}

function uniqueStringLiterals(source) {
  const literals = [];
  const stringPattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;

  while ((match = stringPattern.exec(source)) !== null) {
    literals.push(match[2]);
  }

  return [...new Set(literals)];
}

function jsxGeometryTypes(source) {
  return [...new Set([...source.matchAll(/<([a-z][A-Za-z]*Geometry)\b/g)].map((match) => match[1]))];
}

test('renders Fu Xiaoke as articulated Three.js model parts instead of a full-character texture', () => {
  const geometryTypes = jsxGeometryTypes(stageCode).filter((type) => type !== 'planeGeometry');

  assert.ok(geometryTypes.length >= 3, 'visible mascot should use diverse procedural geometry types');
  assert.doesNotMatch(stageCode, /\buseTexture\b|TextureLoader|loadTexture/);
  assert.doesNotMatch(stageCode, /meshBasicMaterial[\s\S]{0,160}(?:map=\{|\bmap:)/);
  assert.doesNotMatch(stageCode, /<planeGeometry\b[\s\S]{0,160}(?:width|height|texture|map|source|mascot)/i);
  assert.doesNotMatch(stageCode, /MascotImageStack|mascot-image-stack|mascot-pose-image/);
  assert.doesNotMatch(stageCode, /MASCOT_ACTION_POSES|ceo-mascot-[\w-]+\.png/);
});

test('keeps the transparent Fu Xiaoke PNG only as a WebGL fallback', () => {
  assert.ok(existsSync(mascotTransparentUrl));
  const pngLiterals = uniqueStringLiterals(stageCode).filter((literal) => literal.includes('.png'));

  assert.deepEqual(pngLiterals, ['/ai-mascot-transparent.png']);
  assert.match(stageCode, /mascot-fallback-image/);
  assert.match(stageCssCode, /\.mascot-fallback-image\s*\{/);
  assert.match(stageCssCode, /\.mascot-3d-stage--[\w-]*(?:fallback|failed)[\w-]*\s+\.mascot-fallback-image\s*\{/);
  assert.doesNotMatch(stageCode, /\buseTexture\b|TextureLoader|loadTexture|MASCOT_ACTION_POSES/);
  assert.doesNotMatch(stageCode, /<mesh[\s\S]{0,240}(?:ai-mascot-transparent\.png|mascot[^'"]*\.png)[\s\S]{0,240}<mesh/i);
});

test('maps mascot rig bones into named model part refs', () => {
  assert.match(stageCode, /from ['"]\.\.\/lib\/mascotRig['"]|getMascotRigPose/);
  assert.match(stageCode, /getMascotRigPose\s*\([^)]*action[^)]*\)/);

  const rigPartCount = countMatches(stageCode, [
    /\bbody\b|\btorso\b|\bspine\b/i,
    /\bhead\b/i,
    /\bleft(?:Upper)?Arm\b|\bleftArm\b/i,
    /\bright(?:Upper)?Arm\b|\brightArm\b/i,
    /\bleft(?:Upper|Lower)?Leg\b|\bleftLeg\b/i,
    /\bright(?:Upper|Lower)?Leg\b|\brightLeg\b/i,
    /\bleftHand\b/i,
    /\brightHand\b/i,
  ]);

  assert.ok(rigPartCount >= 5, 'stage should expose semantic model parts or rig bone keys for head, arms, hands, and legs');
});

test('uses procedural geometry and not a single image plane for the visible mascot', () => {
  assert.match(stageCode, /<mesh(?:\s|>)/);
  assert.match(stageCode, /mesh(?:Standard|Physical|Phong|Lambert|Toon|Normal)Material/);
  assert.doesNotMatch(stageCode, /function\s+\w*Image\w*\(/);
  assert.doesNotMatch(stageCode, /meshBasicMaterial[\s\S]{0,180}(?:map=\{|\bmap:)/);
  assert.doesNotMatch(stageCode, /CanvasTexture|new THREE\.SkinnedMesh|skinIndex|skinWeight/);
  assert.doesNotMatch(stageCode, /\.(?:png|webp|jpg|jpeg)['"`][\s\S]{0,120}(?:map|texture|material)|(?:map|texture|material)[\s\S]{0,120}\.(?:png|webp|jpg|jpeg)['"`]/i);
});

test('follows the mouse like a desktop pet while staying fixed-facing', () => {
  assert.match(stageCode, /pointer\.(?:active|x|y)/);
  assert.match(stageCode, /position\.(?:x|y)|position\.set\(/);
  assert.match(stageCode, /rotation\.z|tilt/);
  assert.match(stageCode, /scale(?:\.set|:)/);
  assert.doesNotMatch(stageCode, /group\.current\.rotation\.y\s*=/);
  assert.doesNotMatch(stageCode, /group\.current\.rotation\.(?:x|y|z)\s*=\s*[^;\n]*Math\.PI\s*\*\s*2/);
});

test('gives each companion action a distinct desktop-pet motion while preserving proportions', () => {
  assert.match(stageCode, /MASCOT_ACTIONS\.(?:think|talk|alert|celebrate|click|wave)/);
  assert.match(stageCode, /motion|pose|animation/i);
  assert.doesNotMatch(stageCode, /scale:\s*isAnalyzing/);
  assert.doesNotMatch(stageCode, /motion\.scale\s*=/);
  assert.doesNotMatch(stageCode, /motion\.scaleX|motion\.scaleY/);
  assert.doesNotMatch(stageCode, /scale\.set\(motion\.scaleX/);
  assert.doesNotMatch(stageCode, /scale\.set\(motion\.scale,\s*motion\.scale\s*\*/);
});

test('drives the 3D model with mascot rig poses and action-specific expression values', () => {
  assert.match(stageCode, /getMascotRigPose\s*\([^)]*action[^)]*\)/);
  assert.match(stageCode, /pose\.(?:root|spine|head|left|right|arm|leg|hand)|(?:root|spine|head|left|right|arm|leg|hand)[\s\S]{0,80}pose/i);

  const expressionSignalCount = countMatches(stageCode, [
    /blink/i,
    /talk|mouth/i,
    /glow|light/i,
    /MASCOT_ACTIONS\.(?:talk|think|alert|celebrate|click|wave)/,
  ]);

  assert.ok(expressionSignalCount >= 3, 'model should expose action-driven expression, glow, talk, or blink behavior');
  assert.doesNotMatch(stageCode, /actionPoseOpacity/);
  assert.doesNotMatch(stageCode, /material\.opacity\s*=\s*poseKey\s*===\s*selectedPoseKey/);
});

test('renders with extra headroom so the helmet is not clipped', () => {
  assert.match(stageCode, /camera=\{\{[\s\S]*position:\s*\[0,\s*0,\s*5\]/);
  assert.match(stageCode, /gl=\{\{[\s\S]*alpha:\s*true[\s\S]*antialias:\s*true/);
  assert.match(stageCssCode, /aspect-ratio:\s*1\s*\/\s*1\.36;/);
  assert.match(stageCssCode, /overflow:\s*visible;/);
});

test('keeps the 3D stage compact while preserving the original bright launcher treatment', () => {
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{/);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*width:\s*112px;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*filter:\s*drop-shadow\(0 18px 28px rgba\(0, 0, 0, \.4\)\) drop-shadow\(0 0 18px rgba\(114, 77, 255, \.34\)\);/s);
  assert.match(stageCssCode, /\.mascot-3d-stage--default\s*\{[^}]*width:\s*96px;/s);
  assert.doesNotMatch(stageCssCode, /\.mascot-3d-stage--default\s*\{[^}]*opacity:/s);
  assert.doesNotMatch(stageCssCode, /\.mascot-3d-stage--default\s*\{[^}]*filter:/s);
  assert.doesNotMatch(stageCssCode, /\.mascot-image-stack|\.mascot-pose-image/);
  assert.match(stageCssCode, /\.mascot-fallback-image\s*\{[^}]*opacity:\s*0;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage--[\w-]*(?:fallback|failed)[\w-]*\s+\.mascot-fallback-image\s*\{[^}]*opacity:\s*1;/s);
  assert.match(stageCssCode, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.mascot-3d-stage\s*\{[^}]*width:\s*96px;[\s\S]*?\.mascot-3d-stage--default\s*\{[^}]*width:\s*84px;/);
  assert.match(stageCode, /mascot-3d-stage--default/);
  assert.doesNotMatch(stageCssCode, /brightness\(\.84\)|saturate\(\.68\)/);
});
