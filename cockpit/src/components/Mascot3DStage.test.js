/*
 更新时间: 2026-07-01 11:50:00 CST
 更新内容: 增加福小客多动作形象测试，按引导、汇报、风险和达成场景切换合适形象。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const mascotTransparentUrl = new URL('../../public/ai-mascot-transparent.png', import.meta.url);
const mascotKpiGuideUrl = new URL('../../public/assets/mascot/ceo-mascot-kpi-guide.png', import.meta.url);
const mascotReportPresenterUrl = new URL('../../public/assets/mascot/ceo-mascot-report-presenter.png', import.meta.url);
const mascotRiskAlertUrl = new URL('../../public/assets/mascot/ceo-mascot-risk-alert.png', import.meta.url);
const mascotTargetAchievedUrl = new URL('../../public/assets/mascot/ceo-mascot-target-achieved.png', import.meta.url);

function readPngSize(url) {
  const png = readFileSync(url);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

test('uses the original Fu Xiaoke PNG and generated action poses as full-character textures', () => {
  assert.ok(existsSync(mascotTransparentUrl));
  assert.match(stageSource, /source = '\/ai-mascot-transparent\.png'/);
  assert.match(stageSource, /MASCOT_ACTION_POSES/);
  assert.match(stageSource, /const texture = useTexture\(source\);/);
  assert.match(stageSource, /texture\.colorSpace = THREE\.SRGBColorSpace;/);
  assert.match(stageSource, /<meshBasicMaterial\s+ref=\{materialRef\}\s+map=\{texture\}\s+transparent\s+toneMapped=\{false\}/s);
  assert.doesNotMatch(stageSource, /sphereGeometry/);
  assert.doesNotMatch(stageSource, /capsuleGeometry/);
  assert.doesNotMatch(stageSource, /function HelmetHead/);
});

test('keeps generated action pose canvases close to the original mascot proportions', () => {
  const originalSize = readPngSize(mascotTransparentUrl);
  const actionSizes = [
    readPngSize(mascotKpiGuideUrl),
    readPngSize(mascotReportPresenterUrl),
    readPngSize(mascotRiskAlertUrl),
    readPngSize(mascotTargetAchievedUrl),
  ];

  actionSizes.forEach((size) => {
    assert.ok(Math.abs(size.height - originalSize.height) < 40);
    assert.ok(Math.abs(size.width - originalSize.width) < 40);
  });
  assert.match(stageSource, /function getMascotPoseStageWidth\(pose\) \{/);
});

test('loads the generated mascot action images for their matching contexts', () => {
  assert.ok(existsSync(mascotKpiGuideUrl));
  assert.ok(existsSync(mascotReportPresenterUrl));
  assert.ok(existsSync(mascotRiskAlertUrl));
  assert.ok(existsSync(mascotTargetAchievedUrl));
  assert.match(stageSource, /kpiGuide:\s*\{\s*source:\s*'\/assets\/mascot\/ceo-mascot-kpi-guide\.png'/s);
  assert.match(stageSource, /reportPresenter:\s*\{\s*source:\s*'\/assets\/mascot\/ceo-mascot-report-presenter\.png'/s);
  assert.match(stageSource, /riskAlert:\s*\{\s*source:\s*'\/assets\/mascot\/ceo-mascot-risk-alert\.png'/s);
  assert.match(stageSource, /targetAchieved:\s*\{\s*source:\s*'\/assets\/mascot\/ceo-mascot-target-achieved\.png'/s);
  assert.match(stageSource, /function getMascotPoseKey\(action = MASCOT_ACTIONS\.idle, analysisActive = false\)/);
  assert.match(stageSource, /if \(action === MASCOT_ACTIONS\.alert\) return 'riskAlert';/);
  assert.match(stageSource, /if \(action === MASCOT_ACTIONS\.celebrate\) return 'targetAchieved';/);
  assert.match(stageSource, /if \(action === MASCOT_ACTIONS\.wave\) return 'kpiGuide';/);
  assert.match(stageSource, /if \(analysisActive \|\| action === MASCOT_ACTIONS\.think \|\| action === MASCOT_ACTIONS\.talk \|\| action === MASCOT_ACTIONS\.click\) return 'reportPresenter';/);
});

test('renders a DOM image stack so generated mascot poses are visible in the sidebar', () => {
  assert.match(stageSource, /function MascotImageStack\(\{ action, pointer, analysisActive \}\)/);
  assert.match(stageSource, /const activePoseKey = getMascotPoseKey\(action, analysisActive\);/);
  assert.match(stageSource, /<img\s+className=\{`mascot-pose-image\$\{active \? ' is-active' : ''\}`\}/s);
  assert.match(stageSource, /src=\{pose\.source\}/);
  assert.match(stageSource, /aria-hidden="true"/);
  assert.match(stageCss, /\.mascot-image-stack\s*\{/);
  assert.match(stageCss, /\.mascot-pose-image\.is-active\s*\{/);
});

test('keeps one complete original image plane and forbids soft-bone warping', () => {
  assert.match(stageSource, /function MascotImage\(\{\s*meshRef,\s*materialRef,\s*source = '\/ai-mascot-transparent\.png',\s*width = MASCOT_STAGE_WIDTH,\s*height = MASCOT_STAGE_HEIGHT,\s*z = 0,\s*initialOpacity = 1,\s*\}\)/s);
  assert.match(stageSource, /<planeGeometry args=\{\[width, height\]\}/);
  assert.match(stageSource, /<meshBasicMaterial\s+ref=\{materialRef\}\s+map=\{texture\}\s+transparent\s+toneMapped=\{false\}/s);
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

test('crossfades to the selected generated action pose and flies upward during analysis', () => {
  assert.match(stageSource, /function getMascotPoseStageWidth\(pose\) \{/);
  assert.match(stageSource, /const mascotMaterialRef = useRef\(null\);/);
  assert.match(stageSource, /const actionPoseRefs = useRef\(\{\}\);/);
  assert.match(stageSource, /const actionPoseMaterialRefs = useRef\(\{\}\);/);
  assert.match(stageSource, /const actionPoseOpacity = useRef\(0\);/);
  assert.match(stageSource, /const isAnalyzing = analysisActive \|\| action === MASCOT_ACTIONS\.think \|\| action === MASCOT_ACTIONS\.talk \|\| action === MASCOT_ACTIONS\.click;/);
  assert.match(stageSource, /const flyLift = isAnalyzing \? 0\.18 \+ Math\.abs\(Math\.sin\(t \* 2\.4\)\) \* 0\.045 : 0;/);
  assert.match(stageSource, /actionPoseOpacity:\s*getMascotPoseKey\(action, analysisActive\) \? 1 : 0,/);
  assert.match(stageSource, /actionPoseOpacity\.current = THREE\.MathUtils\.lerp\(actionPoseOpacity\.current, motion\.actionPoseOpacity, 0\.18\);/);
  assert.match(stageSource, /mascotMaterialRef\.current\.opacity = 1 - poseOpacity;/);
  assert.match(stageSource, /Object\.entries\(MASCOT_ACTION_POSES\)\.forEach/);
  assert.match(stageSource, /material\.opacity = poseKey === selectedPoseKey \? poseOpacity : 0;/);
  assert.match(stageSource, /mesh\.visible = poseKey === selectedPoseKey && poseOpacity > 0\.02;/);
  assert.doesNotMatch(stageSource, /source="\/ai-mascot-analysis-laptop\.png"/);
  assert.doesNotMatch(stageSource, /function AnalysisLaptop/);
  assert.doesNotMatch(stageSource, /function LaptopBoneArm/);
});

test('renders with extra headroom so the helmet is not clipped', () => {
  assert.match(stageSource, /camera=\{\{ position: \[0, 0, 5\], zoom: 64 \}\}/);
  assert.match(stageSource, /gl=\{\{ alpha: true, antialias: true, preserveDrawingBuffer: true \}\}/);
  assert.match(stageCss, /aspect-ratio:\s*1\s*\/\s*1\.36;/);
  assert.match(stageCss, /overflow:\s*visible;/);
});

test('keeps the 3D stage compact for the sidebar launcher', () => {
  assert.match(stageCss, /\.mascot-3d-stage\s*\{/);
  assert.match(stageCss, /filter:\s*drop-shadow/);
});
