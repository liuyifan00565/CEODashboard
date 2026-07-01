/*
 更新时间: 2026-07-01 11:06:18
 更新内容: 福小客舞台测试约束分析电脑保持在右侧，并增加双手捧电脑姿势。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');

test('uses the original Fu Xiaoke PNG as the only visible character texture', () => {
  assert.match(stageSource, /useTexture\('\/ai-mascot-transparent\.png'\)/);
  assert.match(stageSource, /texture\.colorSpace = THREE\.SRGBColorSpace;/);
  assert.match(stageSource, /<meshBasicMaterial\s+map=\{texture\}\s+transparent\s+toneMapped=\{false\}/s);
  assert.doesNotMatch(stageSource, /sphereGeometry/);
  assert.doesNotMatch(stageSource, /capsuleGeometry/);
  assert.doesNotMatch(stageSource, /function HelmetHead/);
});

test('keeps one complete original image plane and forbids soft-bone warping', () => {
  assert.match(stageSource, /function MascotImage\(\{ meshRef \}\)/);
  assert.match(stageSource, /<planeGeometry args=\{\[MASCOT_STAGE_WIDTH, MASCOT_STAGE_HEIGHT\]\}/);
  assert.match(stageSource, /<meshBasicMaterial\s+map=\{texture\}\s+transparent\s+toneMapped=\{false\}/s);
  assert.match(stageSource, /function getDesktopPetMotion\(action = MASCOT_ACTIONS\.idle, t = 0, pointer = DEFAULT_POINTER, analysisActive = false\)/);
  assert.doesNotMatch(stageSource, /const MASCOT_PARTS = \[/);
  assert.doesNotMatch(stageSource, /function createMascotPartMesh/);
  assert.doesNotMatch(stageSource, /const MASCOT_GRID_COLUMNS/);
  assert.doesNotMatch(stageSource, /const MASCOT_GRID_ROWS/);
  assert.doesNotMatch(stageSource, /SOFT_BONES/);
  assert.doesNotMatch(stageSource, /applyMascotSoftBones/);
  assert.doesNotMatch(stageSource, /position\.needsUpdate/);
  assert.doesNotMatch(stageSource, /CanvasTexture/);
  assert.doesNotMatch(stageSource, /new THREE\.SkinnedMesh/);
  assert.doesNotMatch(stageSource, /skinIndex/);
  assert.doesNotMatch(stageSource, /skinWeight/);
  assert.doesNotMatch(stageSource, /getVertexSkinning/);
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

test('shows a laptop analysis prop and flies upward during analysis', () => {
  assert.match(stageSource, /function AnalysisLaptop\(\{ laptopRef \}\)/);
  assert.match(stageSource, /<group ref=\{laptopRef\} position=\{\[0\.56, -0\.36, 0\.18\]\} rotation=\{\[0, 0, -0\.08\]\} visible=\{false\}>/);
  assert.match(stageSource, /<planeGeometry args=\{\[0\.68, 0\.42\]\} \/>/);
  assert.match(stageSource, /<planeGeometry args=\{\[0\.56, 0\.31\]\} \/>/);
  assert.match(stageSource, /color="#0d1230"/);
  assert.match(stageSource, /color="#e8f6ff"/);
  assert.match(stageSource, /function LaptopGripHand\(\{ x, y, rotation = 0 \}\)/);
  assert.match(stageSource, /<LaptopGripHand x=\{-0\.34\} y=\{-0\.1\} rotation=\{0\.18\} \/>/);
  assert.match(stageSource, /<LaptopGripHand x=\{0\.34\} y=\{-0\.105\} rotation=\{-0\.2\} \/>/);
  assert.match(stageSource, /const isAnalyzing = analysisActive \|\| action === MASCOT_ACTIONS\.think \|\| action === MASCOT_ACTIONS\.talk \|\| action === MASCOT_ACTIONS\.click;/);
  assert.match(stageSource, /const flyLift = isAnalyzing \? 0\.18 \+ Math\.abs\(Math\.sin\(t \* 2\.4\)\) \* 0\.045 : 0;/);
  assert.match(stageSource, /laptopOpacity: isAnalyzing \? 1 : 0,/);
  assert.match(stageSource, /laptopRef\.current\.visible = motion\.laptopOpacity > 0\.05;/);
  assert.match(stageSource, /material\.opacity = motion\.laptopOpacity;/);
  assert.match(stageSource, /laptopRef\.current\.position\.y = -0\.36 \+ Math\.sin\(t \* 3\.2\) \* 0\.018;/);
  assert.match(stageSource, /<AnalysisLaptop laptopRef=\{laptopRef\} \/>/);
});

test('renders with extra headroom so the helmet is not clipped', () => {
  assert.match(stageSource, /camera=\{\{ position: \[0, 0, 5\], zoom: 64 \}\}/);
  assert.match(stageCss, /aspect-ratio:\s*1\s*\/\s*1\.36;/);
  assert.match(stageCss, /overflow:\s*visible;/);
});

test('keeps the 3D stage compact for the sidebar launcher', () => {
  assert.match(stageCss, /\.mascot-3d-stage\s*\{/);
  assert.match(stageCss, /filter:\s*drop-shadow/);
});
