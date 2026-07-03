/*
 更新时间: 2026-07-03 18:18:56 CST
 更新内容: 放宽 AI 小人 3D 模型红灯测试的具体实现命名绑定，保留 procedural 3D、rig 驱动和 PNG 降级兜底约束。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const mascotTransparentUrl = new URL('../../public/ai-mascot-transparent.png', import.meta.url);

function countMatches(source, patterns) {
  return patterns.filter((pattern) => pattern.test(source)).length;
}

test('renders Fu Xiaoke as articulated Three.js model parts instead of a full-character texture', () => {
  const proceduralGeometryCount = countMatches(stageSource, [
    /<sphereGeometry\b/,
    /<capsuleGeometry\b/,
    /<torusGeometry\b/,
    /<cylinderGeometry\b/,
    /<boxGeometry\b/,
  ]);

  assert.ok(proceduralGeometryCount >= 4, 'mascot should be assembled from several procedural geometry types');
  assert.doesNotMatch(stageSource, /useTexture/);
  assert.doesNotMatch(stageSource, /function MascotImageStack/);
  assert.doesNotMatch(stageSource, /mascot-image-stack/);
  assert.doesNotMatch(stageSource, /MASCOT_ACTION_POSES/);
  assert.doesNotMatch(stageSource, /ceo-mascot-(kpi-guide|report-presenter|risk-alert|target-achieved)\.png/);
  assert.doesNotMatch(stageSource, /<planeGeometry args=\{\[width, height\]\}/);
});

test('keeps the transparent Fu Xiaoke PNG only as a WebGL fallback', () => {
  assert.ok(existsSync(mascotTransparentUrl));
  assert.match(stageSource, /FALLBACK_MASCOT_SOURCE[\s\S]*['"]\/ai-mascot-transparent\.png['"]/);
  assert.match(stageSource, /mascot-fallback-image/);
  assert.match(stageCss, /\.mascot-fallback-image\s*\{/);
  assert.match(stageCss, /\.mascot-3d-stage--[^}]*fallback[^}]* \.mascot-fallback-image\s*\{|\.mascot-3d-stage--webgl-failed \.mascot-fallback-image\s*\{/);
  assert.doesNotMatch(stageSource, /useTexture/);
  assert.doesNotMatch(stageSource, /MASCOT_ACTION_POSES/);
});

test('maps mascot rig bones into named model part refs', () => {
  assert.match(stageSource, /getMascotRigPose/);
  assert.match(stageSource, /getMascotRigPose\(action,\s*t\)/);

  const rigPartCount = countMatches(stageSource, [
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
  assert.match(stageSource, /MASCOT_COLORS|mascotColors|colors\s*=\s*\{/);
  assert.match(stageSource, /mesh(?:Standard|Physical|Phong|Lambert)Material/);
  assert.doesNotMatch(stageSource, /function MascotImage\(/);
  assert.doesNotMatch(stageSource, /meshBasicMaterial[\s\S]*map=\{texture\}/);
  assert.doesNotMatch(stageSource, /CanvasTexture/);
  assert.doesNotMatch(stageSource, /new THREE\.SkinnedMesh/);
  assert.doesNotMatch(stageSource, /skinIndex/);
  assert.doesNotMatch(stageSource, /skinWeight/);
});

test('follows the mouse like a desktop pet while staying fixed-facing', () => {
  assert.match(stageSource, /pointerTarget\.x = THREE\.MathUtils\.lerp\(pointerTarget\.x, motion\.x, 0\.12\);/);
  assert.match(stageSource, /pointerTarget\.y = THREE\.MathUtils\.lerp\(pointerTarget\.y, motion\.y, 0\.12\);/);
  assert.match(stageSource, /group\.current\.position\.x = pointerTarget\.x;/);
  assert.match(stageSource, /group\.current\.position\.y = pointerTarget\.y;/);
  assert.match(stageSource, /group\.current\.rotation\.z = motion\.tilt;/);
  assert.match(stageSource, /group\.current\.scale\.set\(motion\.scale, motion\.scale, 1\);/);
  assert.match(stageSource, /pointer\.active \? pointer\.x : Math\.sin\(t \* 0\.72\) \* 0\.18/);
  assert.match(stageSource, /pointer\.active \? pointer\.y : Math\.cos\(t \* 0\.64\) \* 0\.12/);
  assert.doesNotMatch(stageSource, /group\.current\.rotation\.y\s*=/);
  assert.doesNotMatch(stageSource, /group\.current\.rotation\.(?:x|y|z)\s*=\s*[^;\n]*Math\.PI\s*\*\s*2/);
});

test('gives each companion action a distinct desktop-pet motion while preserving proportions', () => {
  assert.match(stageSource, /if \(action === MASCOT_ACTIONS\.think\) \{/);
  assert.match(stageSource, /motion\.y \+= Math\.sin\(t \* 2\.8\) \* 0\.022;/);
  assert.match(stageSource, /motion\.tilt \+= Math\.sin\(t \* 1\.7\) \* 0\.042;/);
  assert.match(stageSource, /if \(action === MASCOT_ACTIONS\.talk\) \{/);
  assert.match(stageSource, /motion\.tilt \+= Math\.sin\(t \* 4\.2\) \* 0\.025;/);
  assert.match(stageSource, /motion\.tilt \+= 0\.075 \* Math\.sin\(t \* 6\.4\);/);
  assert.match(stageSource, /motion\.y \+= Math\.pow\(bounce, 1\.4\) \* 0\.18;/);
  assert.match(stageSource, /scale: 1,/);
  assert.doesNotMatch(stageSource, /scale: isAnalyzing/);
  assert.doesNotMatch(stageSource, /motion\.scale =/);
  assert.doesNotMatch(stageSource, /motion\.scaleX|motion\.scaleY/);
  assert.doesNotMatch(stageSource, /scale\.set\(motion\.scaleX/);
  assert.doesNotMatch(stageSource, /scale\.set\(motion\.scale,\s*motion\.scale \*/);
});

test('drives the 3D model with mascot rig poses and action-specific expression values', () => {
  assert.match(stageSource, /getMascotRigPose\(action,\s*t\)/);
  assert.match(stageSource, /pose\.(?:root|spine|head|leftUpperArm|rightUpperArm|leftUpperLeg|rightUpperLeg)/);

  const expressionSignalCount = countMatches(stageSource, [
    /blink/i,
    /talk|mouth/i,
    /glow|light/i,
    /action === MASCOT_ACTIONS\.(?:talk|think|alert|celebrate|click|wave)/,
  ]);

  assert.ok(expressionSignalCount >= 3, 'model should expose action-driven expression, glow, talk, or blink behavior');
  assert.match(stageSource, /const isAnalyzing = analysisActive \|\| action === MASCOT_ACTIONS\.think \|\| action === MASCOT_ACTIONS\.talk \|\| action === MASCOT_ACTIONS\.click;/);
  assert.match(stageSource, /const flyLift = isAnalyzing \?/);
  assert.doesNotMatch(stageSource, /actionPoseOpacity/);
  assert.doesNotMatch(stageSource, /material\.opacity = poseKey === selectedPoseKey/);
});

test('renders with extra headroom so the helmet is not clipped', () => {
  assert.match(stageSource, /camera=\{\{ position: \[0, 0, 5\], zoom: 64 \}\}/);
  assert.match(stageSource, /gl=\{\{ alpha: true, antialias: true, preserveDrawingBuffer: true \}\}/);
  assert.match(stageCss, /aspect-ratio:\s*1\s*\/\s*1\.36;/);
  assert.match(stageCss, /overflow:\s*visible;/);
});

test('keeps the 3D stage compact while preserving the original bright launcher treatment', () => {
  assert.match(stageCss, /\.mascot-3d-stage\s*\{/);
  assert.match(stageCss, /\.mascot-3d-stage\s*\{[^}]*width:\s*112px;/s);
  assert.match(stageCss, /\.mascot-3d-stage\s*\{[^}]*filter:\s*drop-shadow\(0 18px 28px rgba\(0, 0, 0, \.4\)\) drop-shadow\(0 0 18px rgba\(114, 77, 255, \.34\)\);/s);
  assert.match(stageCss, /\.mascot-3d-stage--default\s*\{[^}]*width:\s*96px;/s);
  assert.doesNotMatch(stageCss, /\.mascot-3d-stage--default\s*\{[^}]*opacity:/s);
  assert.doesNotMatch(stageCss, /\.mascot-3d-stage--default\s*\{[^}]*filter:/s);
  assert.doesNotMatch(stageCss, /\.mascot-image-stack/);
  assert.doesNotMatch(stageCss, /\.mascot-pose-image/);
  assert.match(stageCss, /\.mascot-fallback-image\s*\{[^}]*opacity:\s*0;/s);
  assert.match(stageCss, /\.mascot-3d-stage--webgl-failed \.mascot-fallback-image\s*\{[^}]*opacity:\s*1;/s);
  assert.match(stageCss, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.mascot-3d-stage\s*\{[^}]*width:\s*96px;[\s\S]*?\.mascot-3d-stage--default\s*\{[^}]*width:\s*84px;/);
  assert.match(stageSource, /const defaultIdle = action === MASCOT_ACTIONS\.idle && !analysisActive;/);
  assert.match(stageSource, /className=\{`mascot-3d-stage\$\{defaultIdle \? ' mascot-3d-stage--default' : ''\}`\}/);
  assert.doesNotMatch(stageCss, /brightness\(\.84\)|saturate\(\.68\)/);
});
