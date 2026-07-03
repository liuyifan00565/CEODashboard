/*
 更新时间: 2026-07-03 18:06:34 CST
 更新内容: 要求 AI 小人舞台升级为真实 Three.js 分部件 3D 模型，并保留 PNG 作为降级兜底。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const mascotTransparentUrl = new URL('../../public/ai-mascot-transparent.png', import.meta.url);

test('renders Fu Xiaoke as articulated Three.js model parts instead of a full-character texture', () => {
  assert.match(stageSource, /import \{\s*Text\s*\} from '@react-three\/drei';/);
  assert.match(stageSource, /function MascotModel\(\{ pose, action, analysisActive, time \}\)/);
  assert.match(stageSource, /function MascotHead\(\{ poseRefs, blink, talkOpen \}\)/);
  assert.match(stageSource, /function MascotHeadset\(\)/);
  assert.match(stageSource, /function MascotBody\(\{ poseRefs \}\)/);
  assert.match(stageSource, /function MascotArm\(\{ side, poseRefs \}\)/);
  assert.match(stageSource, /function MascotLeg\(\{ side, poseRefs \}\)/);
  assert.match(stageSource, /function MascotSuitLines\(\)/);
  assert.match(stageSource, /function MascotGlow\(\{ action \}\)/);
  assert.match(stageSource, /<sphereGeometry args=\{\[/);
  assert.match(stageSource, /<capsuleGeometry args=\{\[/);
  assert.match(stageSource, /<torusGeometry args=\{\[/);
  assert.match(stageSource, /<cylinderGeometry args=\{\[/);
  assert.match(stageSource, /<Text[\s\S]*?>AI<\/Text>/);
  assert.doesNotMatch(stageSource, /function MascotImageStack/);
  assert.doesNotMatch(stageSource, /mascot-image-stack/);
  assert.doesNotMatch(stageSource, /Object\.entries\(MASCOT_ACTION_POSES\)\.map/);
  assert.doesNotMatch(stageSource, /<planeGeometry args=\{\[width, height\]\}/);
});

test('keeps the transparent Fu Xiaoke PNG only as a WebGL fallback', () => {
  assert.ok(existsSync(mascotTransparentUrl));
  assert.match(stageSource, /const FALLBACK_MASCOT_SOURCE = '\/ai-mascot-transparent\.png';/);
  assert.match(stageSource, /const \[webglFailed, setWebglFailed\] = useState\(false\);/);
  assert.match(stageSource, /onCreated=\{\(\) => setWebglFailed\(false\)\}/);
  assert.match(stageSource, /onError=\{\(\) => setWebglFailed\(true\)\}/);
  assert.match(stageSource, /<img\s+className="mascot-fallback-image"\s+src=\{FALLBACK_MASCOT_SOURCE\}/s);
  assert.match(stageCss, /\.mascot-fallback-image\s*\{/);
  assert.match(stageCss, /\.mascot-3d-stage--webgl-failed \.mascot-fallback-image\s*\{/);
  assert.doesNotMatch(stageSource, /useTexture/);
  assert.doesNotMatch(stageSource, /MASCOT_ACTION_POSES/);
});

test('maps mascot rig bones into named model part refs', () => {
  assert.match(stageSource, /function createPoseRefs\(\) \{/);
  assert.match(stageSource, /root: useRef\(null\),/);
  assert.match(stageSource, /head: useRef\(null\),/);
  assert.match(stageSource, /leftUpperArm: useRef\(null\),/);
  assert.match(stageSource, /rightUpperArm: useRef\(null\),/);
  assert.match(stageSource, /leftUpperLeg: useRef\(null\),/);
  assert.match(stageSource, /rightUpperLeg: useRef\(null\),/);
  assert.match(stageSource, /function applyRigPose\(poseRefs, pose\) \{/);
  assert.match(stageSource, /applyBonePose\(poseRefs\.head\.current, pose\.head\);/);
  assert.match(stageSource, /applyBonePose\(poseRefs\.rightUpperArm\.current, pose\.rightUpperArm\);/);
  assert.match(stageSource, /applyBonePose\(poseRefs\.leftUpperLeg\.current, pose\.leftUpperLeg\);/);
});

test('uses procedural geometry and not a single image plane for the visible mascot', () => {
  assert.match(stageSource, /const MASCOT_COLORS = \{/);
  assert.match(stageSource, /helmet:\s*'#724DFF'/);
  assert.match(stageSource, /ice:\s*'#66D9FF'/);
  assert.match(stageSource, /glass:\s*'#C9D7FF'/);
  assert.match(stageSource, /skin:\s*'#FFE7F6'/);
  assert.match(stageSource, /white:\s*'#F8F7FF'/);
  assert.match(stageSource, /function MascotMaterials\(\) \{/);
  assert.match(stageSource, /meshPhysicalMaterial/);
  assert.match(stageSource, /meshStandardMaterial/);
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
  assert.doesNotMatch(stageSource, /rotation\.y/);
  assert.doesNotMatch(stageSource, /Math\.PI \* 2/);
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
  assert.match(stageSource, /import \{ getMascotRigPose \} from '\.\.\/lib\/mascotRig';/);
  assert.match(stageSource, /const pose = getMascotRigPose\(action, t\);/);
  assert.match(stageSource, /applyRigPose\(poseRefs, pose\);/);
  assert.match(stageSource, /const expression = getMascotExpression\(action, t, analysisActive\);/);
  assert.match(stageSource, /blink=\{expression\.blink\}/);
  assert.match(stageSource, /talkOpen=\{expression\.talkOpen\}/);
  assert.match(stageSource, /glowIntensity=\{expression\.glowIntensity\}/);
  assert.match(stageSource, /const isAnalyzing = analysisActive \|\| action === MASCOT_ACTIONS\.think \|\| action === MASCOT_ACTIONS\.talk \|\| action === MASCOT_ACTIONS\.click;/);
  assert.match(stageSource, /const flyLift = isAnalyzing \? 0\.16 \+ Math\.abs\(Math\.sin\(t \* 2\.4\)\) \* 0\.04 : 0;/);
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
