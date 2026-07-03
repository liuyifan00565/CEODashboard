# AI Mascot 3D Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Fu Xiaoke PNG/DOM image-stack mascot with a lightweight, articulated Three.js model that supports the existing AI assistant actions.

**Architecture:** Keep `AIAnalysisWidget` as the state owner and keep `Mascot3DStage` as the rendering boundary. Refactor `Mascot3DStage.jsx` so the Canvas renders named 3D subcomponents (`MascotHead`, `MascotBody`, `MascotArm`, `MascotLeg`, headset, suit lines, glow), while `getMascotRigPose()` continues to drive the action poses. Preserve the existing transparent PNG only as a fallback, not as the primary visible mascot.

**Tech Stack:** React 19, Vite, Three.js, `@react-three/fiber`, `@react-three/drei`, Node test runner, existing static source tests.

更新时间: 2026-07-03 18:06:34 CST  
更新内容: 新增 AI 小人 3D 建模实施计划，按 TDD 拆解测试、模型、动作、降级和验证步骤。

---

## File Structure

- Modify: `cockpit/src/components/Mascot3DStage.test.js`
  - Owns source-level regression tests for the mascot stage.
  - Will change old "full-character texture" expectations into "true 3D articulated model" expectations.
- Modify: `cockpit/src/components/Mascot3DStage.jsx`
  - Owns the Canvas, 3D model subcomponents, model animation loop, and fallback image.
  - Will remove `MascotImageStack` from the primary visual path.
- Modify: `cockpit/src/components/Mascot3DStage.css`
  - Owns fixed launcher dimensions, transparent stage, fallback-image layering, and responsive sizing.
  - Must preserve current width, aspect ratio, shadow strength, and no-card outer treatment.
- Modify: `cockpit/src/components/AIAnalysisWidget.test.js`
  - Owns AI launcher integration assertions.
  - Will continue to assert that `AIAnalysisWidget` passes `action`, `pointer`, and `analysisActive` into `Mascot3DStage`.
- Modify if needed: `cockpit/src/lib/mascotRig.js`
  - Owns pose generation for named action states.
  - Only adjust if the 3D model needs a more readable mouth/blink/action parameter.
- Modify if needed: `cockpit/src/lib/mascotRig.test.js`
  - Owns pose invariants, especially fixed front-facing orientation and distinct action poses.
- Do not modify: AI API files, KPI calculations, maintenance pages, Docker scripts, deployment docs.

## Task 1: Red Tests For Real 3D Mascot Stage

**Files:**
- Modify: `cockpit/src/components/Mascot3DStage.test.js`
- Modify: `cockpit/src/components/AIAnalysisWidget.test.js`

- [ ] **Step 1: Update the file header in `Mascot3DStage.test.js`**

Replace the top comment with:

```js
/*
 更新时间: 2026-07-03 18:06:34 CST
 更新内容: 要求 AI 小人舞台升级为真实 Three.js 分部件 3D 模型，并保留 PNG 作为降级兜底。
*/
```

- [ ] **Step 2: Replace the old full-character texture test**

In `cockpit/src/components/Mascot3DStage.test.js`, replace the entire test named `uses the original Fu Xiaoke PNG and generated action poses as full-character textures` with:

```js
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
```

- [ ] **Step 3: Replace the generated pose asset tests with fallback tests**

Delete these tests from `Mascot3DStage.test.js`:

```js
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
```

Add these tests in the same location:

```js
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
```

- [ ] **Step 4: Replace the old complete-image-plane test**

Replace the entire test named `keeps one complete original image plane and forbids soft-bone warping` with:

```js
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
```

- [ ] **Step 5: Replace the crossfade generated-pose test**

Replace the entire test named `crossfades to the selected generated action pose and flies upward during analysis` with:

```js
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
```

- [ ] **Step 6: Update CSS assertions for fallback image, not DOM image stack**

In `Mascot3DStage.test.js`, add to the compact stage test:

```js
  assert.doesNotMatch(stageCss, /\.mascot-image-stack/);
  assert.doesNotMatch(stageCss, /\.mascot-pose-image/);
  assert.match(stageCss, /\.mascot-fallback-image\s*\{[^}]*opacity:\s*0;/s);
  assert.match(stageCss, /\.mascot-3d-stage--webgl-failed \.mascot-fallback-image\s*\{[^}]*opacity:\s*1;/s);
```

- [ ] **Step 7: Update AI launcher integration test wording**

In `cockpit/src/components/AIAnalysisWidget.test.js`, keep the `uses the 3D mascot stage for the AI launcher` test but add:

```js
  assert.doesNotMatch(componentSource, /ai-mascot-transparent\.png/);
  assert.doesNotMatch(componentSource, /ceo-mascot-kpi-guide/);
  assert.doesNotMatch(componentSource, /ceo-mascot-report-presenter/);
```

This keeps image ownership inside `Mascot3DStage`.

- [ ] **Step 8: Run red tests**

Run:

```bash
cd cockpit
npm test -- Mascot3DStage.test.js AIAnalysisWidget.test.js
```

Expected: FAIL. The failures should mention missing `MascotModel`, `MascotHead`, `MascotBody`, `createPoseRefs`, `applyRigPose`, `FALLBACK_MASCOT_SOURCE`, or old DOM image-stack code still present. If the tests pass before implementation, stop and tighten the tests.

- [ ] **Step 9: Commit red tests**

Run:

```bash
git status --short --branch
git add cockpit/src/components/Mascot3DStage.test.js cockpit/src/components/AIAnalysisWidget.test.js
git commit -m "test: require 3d ai mascot model" -m "用户原始提示词: 对ai小人进行建模"
```

Expected: commit succeeds with only these two test files staged. Existing unrelated modified files stay unstaged.

## Task 2: Implement Procedural 3D Fu Xiaoke Model

**Files:**
- Modify: `cockpit/src/components/Mascot3DStage.jsx`
- Modify: `cockpit/src/components/Mascot3DStage.css`

- [ ] **Step 1: Update the file header in `Mascot3DStage.jsx`**

Replace the top comment with:

```js
/*
 更新时间: 2026-07-03 18:06:34 CST
 更新内容: 将福小客从 PNG 图片舞台升级为 Three.js 分部件 3D 模型，并保留透明 PNG 作为 WebGL 降级兜底。
*/
```

- [ ] **Step 2: Replace imports**

Replace the current imports:

```js
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Mascot3DStage.css';
```

with:

```js
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import { getMascotRigPose } from '../lib/mascotRig';
import './Mascot3DStage.css';
```

- [ ] **Step 3: Replace image constants with model constants**

Delete:

```js
const MASCOT_IMAGE_WIDTH = 1084;
const MASCOT_IMAGE_HEIGHT = 1451;
const MASCOT_STAGE_HEIGHT = 2.04;
const MASCOT_STAGE_WIDTH = MASCOT_STAGE_HEIGHT * (MASCOT_IMAGE_WIDTH / MASCOT_IMAGE_HEIGHT);
const DEFAULT_POINTER = { x: 0, y: 0, active: false };
const MASCOT_BASE_POSE = {
  source: '/ai-mascot-transparent.png',
  width: MASCOT_IMAGE_WIDTH,
  height: MASCOT_IMAGE_HEIGHT,
};
const MASCOT_ACTION_POSES = {
  kpiGuide: {
    source: '/assets/mascot/ceo-mascot-kpi-guide.png',
    width: 1082,
    height: 1454,
  },
  reportPresenter: {
    source: '/assets/mascot/ceo-mascot-report-presenter.png',
    width: 1071,
    height: 1469,
  },
  riskAlert: {
    source: '/assets/mascot/ceo-mascot-risk-alert.png',
    width: 1060,
    height: 1484,
  },
  targetAchieved: {
    source: '/assets/mascot/ceo-mascot-target-achieved.png',
    width: 1072,
    height: 1467,
  },
};
```

Add:

```js
const DEFAULT_POINTER = { x: 0, y: 0, active: false };
const FALLBACK_MASCOT_SOURCE = '/ai-mascot-transparent.png';
const MASCOT_COLORS = {
  helmet: '#724DFF',
  helmetDeep: '#4B2AD8',
  ice: '#66D9FF',
  glass: '#C9D7FF',
  skin: '#FFE7F6',
  blush: '#F5A4CF',
  eye: '#06112F',
  white: '#F8F7FF',
  sole: '#5C35E8',
  warning: '#FF6B9A',
};
```

- [ ] **Step 4: Replace image pose helpers with rig helpers**

Delete `getMascotPoseStageWidth`, `getMascotPoseKey`, and `getMascotImageStackTransform`.

Add these helpers:

```js
function applyBonePose(node, bone) {
  if (!node || !bone) return;
  node.rotation.set(bone.rotation[0], bone.rotation[1], bone.rotation[2]);
  node.position.set(bone.position[0], bone.position[1], bone.position[2]);
}

function applyRigPose(poseRefs, pose) {
  applyBonePose(poseRefs.root.current, pose.root);
  applyBonePose(poseRefs.spine.current, pose.spine);
  applyBonePose(poseRefs.neck.current, pose.neck);
  applyBonePose(poseRefs.head.current, pose.head);
  applyBonePose(poseRefs.leftShoulder.current, pose.leftShoulder);
  applyBonePose(poseRefs.leftUpperArm.current, pose.leftUpperArm);
  applyBonePose(poseRefs.leftForearm.current, pose.leftForearm);
  applyBonePose(poseRefs.leftHand.current, pose.leftHand);
  applyBonePose(poseRefs.rightShoulder.current, pose.rightShoulder);
  applyBonePose(poseRefs.rightUpperArm.current, pose.rightUpperArm);
  applyBonePose(poseRefs.rightForearm.current, pose.rightForearm);
  applyBonePose(poseRefs.rightHand.current, pose.rightHand);
  applyBonePose(poseRefs.leftHip.current, pose.leftHip);
  applyBonePose(poseRefs.leftUpperLeg.current, pose.leftUpperLeg);
  applyBonePose(poseRefs.leftLowerLeg.current, pose.leftLowerLeg);
  applyBonePose(poseRefs.leftFoot.current, pose.leftFoot);
  applyBonePose(poseRefs.rightHip.current, pose.rightHip);
  applyBonePose(poseRefs.rightUpperLeg.current, pose.rightUpperLeg);
  applyBonePose(poseRefs.rightLowerLeg.current, pose.rightLowerLeg);
  applyBonePose(poseRefs.rightFoot.current, pose.rightFoot);
}

function getMascotExpression(action = MASCOT_ACTIONS.idle, t = 0, analysisActive = false) {
  const blink = Math.abs(Math.sin(t * 1.8)) > 0.965 ? 0.18 : 1;
  const talking = action === MASCOT_ACTIONS.talk || analysisActive;
  const talkOpen = talking ? 0.45 + Math.abs(Math.sin(t * 8.4)) * 0.55 : 0;
  const glowIntensity = action === MASCOT_ACTIONS.alert
    ? 1.25 + Math.abs(Math.sin(t * 8)) * 0.4
    : action === MASCOT_ACTIONS.celebrate
      ? 1.15 + Math.abs(Math.sin(t * 5.2)) * 0.35
      : analysisActive
        ? 1
        : 0.72;

  return { blink, talkOpen, glowIntensity };
}
```

- [ ] **Step 5: Keep and slightly retune `getDesktopPetMotion`**

Keep `getDesktopPetMotion`, but change the analyzing lift line to:

```js
  const flyLift = isAnalyzing ? 0.16 + Math.abs(Math.sin(t * 2.4)) * 0.04 : 0;
```

Keep the pointer lerp and fixed `rotation.z` behavior. Do not introduce `rotation.y`, `Math.PI * 2`, `motion.scaleX`, or `motion.scaleY`.

- [ ] **Step 6: Add `createPoseRefs`**

Add this function before `MascotPuppet`:

```js
function createPoseRefs() {
  return {
    root: useRef(null),
    spine: useRef(null),
    neck: useRef(null),
    head: useRef(null),
    leftShoulder: useRef(null),
    leftUpperArm: useRef(null),
    leftForearm: useRef(null),
    leftHand: useRef(null),
    rightShoulder: useRef(null),
    rightUpperArm: useRef(null),
    rightForearm: useRef(null),
    rightHand: useRef(null),
    leftHip: useRef(null),
    leftUpperLeg: useRef(null),
    leftLowerLeg: useRef(null),
    leftFoot: useRef(null),
    rightHip: useRef(null),
    rightUpperLeg: useRef(null),
    rightLowerLeg: useRef(null),
    rightFoot: useRef(null),
  };
}
```

- [ ] **Step 7: Add material and geometry components**

Add these components before `MascotPuppet`:

```jsx
function MascotMaterials() {
  return null;
}

function MascotGlow({ action, glowIntensity = 0.72 }) {
  const glowColor = action === MASCOT_ACTIONS.alert ? MASCOT_COLORS.warning : MASCOT_COLORS.ice;

  return (
    <group>
      <pointLight color={glowColor} intensity={0.95 * glowIntensity} distance={3.2} position={[0, 0.75, 1.15]} />
      <mesh position={[0, -1.03, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 48]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.1 * glowIntensity} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MascotHead({ poseRefs, blink, talkOpen }) {
  const smileGeometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.12, -0.04, 0),
      new THREE.Vector3(0, -0.1 - talkOpen * 0.025, 0),
      new THREE.Vector3(0.12, -0.04, 0),
    ]),
    16,
    0.012 + talkOpen * 0.006,
    8,
    false,
  );

  return (
    <group ref={poseRefs.neck}>
      <group ref={poseRefs.head}>
        <mesh position={[0, 0.31, 0]}>
          <sphereGeometry args={[0.56, 48, 32]} />
          <meshStandardMaterial color={MASCOT_COLORS.helmet} roughness={0.32} metalness={0.05} emissive={MASCOT_COLORS.helmetDeep} emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[0, 0.22, 0.08]} scale={[1.08, 0.82, 0.9]}>
          <sphereGeometry args={[0.54, 48, 32]} />
          <meshPhysicalMaterial color={MASCOT_COLORS.glass} transparent opacity={0.36} roughness={0.08} metalness={0.02} transmission={0.22} thickness={0.18} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0.16, 0.32]} scale={[0.92, 0.68, 0.22]}>
          <sphereGeometry args={[0.43, 48, 28]} />
          <meshStandardMaterial color={MASCOT_COLORS.skin} roughness={0.52} />
        </mesh>
        <mesh position={[-0.16, 0.18, 0.47]} scale={[1, blink, 1]}>
          <sphereGeometry args={[0.055, 24, 16]} />
          <meshStandardMaterial color={MASCOT_COLORS.eye} roughness={0.18} />
        </mesh>
        <mesh position={[0.16, 0.18, 0.47]} scale={[1, blink, 1]}>
          <sphereGeometry args={[0.055, 24, 16]} />
          <meshStandardMaterial color={MASCOT_COLORS.eye} roughness={0.18} />
        </mesh>
        <mesh position={[-0.27, 0.05, 0.44]} scale={[1.35, 0.78, 0.2]}>
          <sphereGeometry args={[0.055, 20, 12]} />
          <meshBasicMaterial color={MASCOT_COLORS.blush} transparent opacity={0.48} />
        </mesh>
        <mesh position={[0.27, 0.05, 0.44]} scale={[1.35, 0.78, 0.2]}>
          <sphereGeometry args={[0.055, 20, 12]} />
          <meshBasicMaterial color={MASCOT_COLORS.blush} transparent opacity={0.48} />
        </mesh>
        <mesh position={[0, -0.02, 0.5]}>
          <primitive object={smileGeometry} attach="geometry" />
          <meshStandardMaterial color="#0B1020" roughness={0.28} />
        </mesh>
        <Text position={[0.22, 0.48, 0.47]} rotation={[0, 0, 0]} fontSize={0.13} color={MASCOT_COLORS.white} anchorX="center" anchorY="middle">
          F
        </Text>
        <MascotHeadset />
      </group>
    </group>
  );
}

function MascotHeadset() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.54, 0.16, 0.02]} rotation={[0, 0, side * 0.08]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 32]} />
            <meshStandardMaterial color={MASCOT_COLORS.white} roughness={0.26} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.15, 0.022, 10, 32]} />
            <meshStandardMaterial color={MASCOT_COLORS.helmet} roughness={0.24} emissive={MASCOT_COLORS.helmetDeep} emissiveIntensity={0.16} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.48, -0.09, 0.36]} rotation={[0.75, 0.28, -0.62]}>
        <cylinderGeometry args={[0.012, 0.012, 0.38, 12]} />
        <meshStandardMaterial color="#10172A" roughness={0.22} />
      </mesh>
      <mesh position={[0.35, -0.25, 0.5]} scale={[1.35, 0.72, 0.72]}>
        <sphereGeometry args={[0.05, 20, 12]} />
        <meshStandardMaterial color="#111827" roughness={0.22} />
      </mesh>
    </group>
  );
}

function MascotBody({ poseRefs }) {
  return (
    <group ref={poseRefs.spine}>
      <mesh position={[0, -0.16, 0]} scale={[0.82, 1, 0.5]}>
        <capsuleGeometry args={[0.31, 0.45, 18, 32]} />
        <meshStandardMaterial color={MASCOT_COLORS.white} roughness={0.36} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.16, 0.02]} scale={[0.55, 0.16, 0.44]}>
        <sphereGeometry args={[0.34, 32, 16]} />
        <meshStandardMaterial color={MASCOT_COLORS.helmetDeep} roughness={0.28} emissive={MASCOT_COLORS.helmet} emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0, -0.1, 0.34]}>
        <cylinderGeometry args={[0.16, 0.16, 0.035, 48]} />
        <meshStandardMaterial color={MASCOT_COLORS.helmet} roughness={0.24} emissive={MASCOT_COLORS.helmetDeep} emissiveIntensity={0.18} />
      </mesh>
      <Text position={[0, -0.1, 0.365]} fontSize={0.13} color={MASCOT_COLORS.white} anchorX="center" anchorY="middle">
        AI
      </Text>
      <MascotSuitLines />
    </group>
  );
}

function MascotArm({ side, poseRefs }) {
  const shoulderRef = side === 'left' ? poseRefs.leftShoulder : poseRefs.rightShoulder;
  const upperRef = side === 'left' ? poseRefs.leftUpperArm : poseRefs.rightUpperArm;
  const forearmRef = side === 'left' ? poseRefs.leftForearm : poseRefs.rightForearm;
  const handRef = side === 'left' ? poseRefs.leftHand : poseRefs.rightHand;
  const x = side === 'left' ? -1 : 1;

  return (
    <group ref={shoulderRef}>
      <group ref={upperRef} position={[x * 0.34, 0.01, 0]}>
        <mesh rotation={[0, 0, x * 0.2]}>
          <capsuleGeometry args={[0.085, 0.34, 12, 20]} />
          <meshStandardMaterial color={MASCOT_COLORS.white} roughness={0.36} />
        </mesh>
        <group ref={forearmRef} position={[x * 0.04, -0.28, 0]}>
          <mesh rotation={[0, 0, x * -0.08]}>
            <capsuleGeometry args={[0.078, 0.28, 12, 20]} />
            <meshStandardMaterial color={MASCOT_COLORS.white} roughness={0.36} />
          </mesh>
          <group ref={handRef} position={[0, -0.24, 0]}>
            <mesh scale={[1.05, 0.86, 0.9]}>
              <sphereGeometry args={[0.105, 24, 16]} />
              <meshStandardMaterial color={MASCOT_COLORS.white} roughness={0.42} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function MascotLeg({ side, poseRefs }) {
  const hipRef = side === 'left' ? poseRefs.leftHip : poseRefs.rightHip;
  const upperRef = side === 'left' ? poseRefs.leftUpperLeg : poseRefs.rightUpperLeg;
  const lowerRef = side === 'left' ? poseRefs.leftLowerLeg : poseRefs.rightLowerLeg;
  const footRef = side === 'left' ? poseRefs.leftFoot : poseRefs.rightFoot;
  const x = side === 'left' ? -1 : 1;

  return (
    <group ref={hipRef}>
      <group ref={upperRef} position={[x * 0.15, -0.43, 0]}>
        <mesh>
          <capsuleGeometry args={[0.105, 0.38, 12, 22]} />
          <meshStandardMaterial color={MASCOT_COLORS.white} roughness={0.38} />
        </mesh>
        <group ref={lowerRef} position={[0, -0.32, 0]}>
          <mesh>
            <capsuleGeometry args={[0.105, 0.28, 12, 22]} />
            <meshStandardMaterial color={MASCOT_COLORS.white} roughness={0.38} />
          </mesh>
          <group ref={footRef} position={[0, -0.2, 0.05]}>
            <mesh scale={[1.25, 0.58, 0.92]}>
              <sphereGeometry args={[0.13, 24, 16]} />
              <meshStandardMaterial color={MASCOT_COLORS.sole} roughness={0.3} emissive={MASCOT_COLORS.helmetDeep} emissiveIntensity={0.12} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function MascotSuitLines() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.18, -0.08, 0.37]} rotation={[0, 0, side * 0.16]} scale={[0.018, 0.16, 0.014]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={MASCOT_COLORS.ice} emissive={MASCOT_COLORS.ice} emissiveIntensity={0.75} roughness={0.22} />
        </mesh>
      ))}
      <mesh position={[0, -0.36, 0.36]} scale={[0.28, 0.018, 0.014]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={MASCOT_COLORS.ice} emissive={MASCOT_COLORS.ice} emissiveIntensity={0.65} roughness={0.22} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 8: Add `MascotModel`**

Add:

```jsx
function MascotModel({ poseRefs, action, analysisActive, time, expression }) {
  return (
    <group ref={poseRefs.root} scale={[0.92, 0.92, 0.92]}>
      <MascotGlow action={action} glowIntensity={expression.glowIntensity} />
      <group position={[0, 0.13, 0]}>
        <MascotBody poseRefs={poseRefs} />
        <MascotArm side="left" poseRefs={poseRefs} />
        <MascotArm side="right" poseRefs={poseRefs} />
        <MascotLeg side="left" poseRefs={poseRefs} />
        <MascotLeg side="right" poseRefs={poseRefs} />
      </group>
      <group position={[0, 0.76 + Math.sin(time * 2.1) * 0.012, 0]}>
        <MascotHead poseRefs={poseRefs} blink={expression.blink} talkOpen={expression.talkOpen} />
      </group>
    </group>
  );
}
```

- [ ] **Step 9: Replace `MascotImage`, `MascotImageStack`, and old `MascotPuppet`**

Delete the old `MascotImage`, `MascotImageStack`, and `MascotPuppet` implementations.

Add this `MascotPuppet`:

```jsx
function MascotPuppet({ action, pointer, analysisActive }) {
  const group = useRef(null);
  const pointerTarget = useRef({ x: 0, y: 0 }).current;
  const poseRefs = createPoseRefs();
  const expressionRef = useRef({ blink: 1, talkOpen: 0, glowIntensity: 0.72 });
  const timeRef = useRef(0);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    timeRef.current = t;
    const motion = getDesktopPetMotion(action, t, pointer, analysisActive);
    const pose = getMascotRigPose(action, t);
    const expression = getMascotExpression(action, t, analysisActive);
    expressionRef.current = expression;

    pointerTarget.x = THREE.MathUtils.lerp(pointerTarget.x, motion.x, 0.12);
    pointerTarget.y = THREE.MathUtils.lerp(pointerTarget.y, motion.y, 0.12);
    group.current.position.x = pointerTarget.x;
    group.current.position.y = pointerTarget.y;
    group.current.rotation.z = motion.tilt;
    group.current.scale.set(motion.scale, motion.scale, 1);
    applyRigPose(poseRefs, pose);
  });

  return (
    <group ref={group}>
      <MascotMaterials />
      <ambientLight intensity={1.7} />
      <directionalLight color="#ffffff" intensity={1.15} position={[1.8, 2.4, 2.8]} />
      <directionalLight color={MASCOT_COLORS.ice} intensity={0.75} position={[-1.8, 1.2, 1.5]} />
      <MascotModel
        poseRefs={poseRefs}
        action={action}
        analysisActive={analysisActive}
        time={timeRef.current}
        expression={expressionRef.current}
      />
    </group>
  );
}
```

- [ ] **Step 10: Update `Mascot3DStage` fallback behavior**

Replace the exported component with:

```jsx
export default function Mascot3DStage({
  action = MASCOT_ACTIONS.idle,
  pointer = DEFAULT_POINTER,
  analysisActive = false,
  label = '福小客 3D 经营助手',
}) {
  const [webglFailed, setWebglFailed] = useState(false);
  const defaultIdle = action === MASCOT_ACTIONS.idle && !analysisActive;

  return (
    <span
      className={`mascot-3d-stage${defaultIdle ? ' mascot-3d-stage--default' : ''}${webglFailed ? ' mascot-3d-stage--webgl-failed' : ''}`}
      role="img"
      aria-label={label}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 5], zoom: 70 }}
        dpr={[1, 1.7]}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        onCreated={() => setWebglFailed(false)}
        onError={() => setWebglFailed(true)}
      >
        <MascotPuppet action={action} pointer={pointer} analysisActive={analysisActive} />
      </Canvas>
      <img
        className="mascot-fallback-image"
        src={FALLBACK_MASCOT_SOURCE}
        alt=""
        draggable="false"
        aria-hidden="true"
      />
    </span>
  );
}
```

- [ ] **Step 11: Update `Mascot3DStage.css` header and remove image-stack CSS**

Replace the top comment with:

```css
/*
 更新时间: 2026-07-03 18:06:34 CST
 更新内容: 为 Three.js 分部件 AI 小人保留透明舞台尺寸，并新增 WebGL 降级 PNG 兜底层。
*/
```

Delete these CSS blocks:

```css
.mascot-image-stack { ... }
.mascot-image-stack__motion { ... }
.mascot-image-stack--kpiGuide .mascot-image-stack__motion { ... }
.mascot-image-stack--reportPresenter .mascot-image-stack__motion { ... }
.mascot-image-stack--riskAlert .mascot-image-stack__motion { ... }
.mascot-image-stack--targetAchieved .mascot-image-stack__motion { ... }
.mascot-pose-image { ... }
.mascot-pose-image.is-active { ... }
@keyframes mascot-dom-idle { ... }
@keyframes mascot-dom-guide { ... }
@keyframes mascot-dom-report { ... }
@keyframes mascot-dom-alert { ... }
@keyframes mascot-dom-celebrate { ... }
```

Add:

```css
.mascot-fallback-image {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 1;
  width: auto;
  height: 100%;
  max-width: none;
  opacity: 0;
  transform: translateX(-50%);
  transition: opacity .18s ease;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.mascot-3d-stage--webgl-failed canvas {
  opacity: 0;
}

.mascot-3d-stage--webgl-failed .mascot-fallback-image {
  opacity: 1;
}
```

Keep the existing `.mascot-3d-stage`, `.mascot-3d-stage--default`, canvas, and mobile width rules except for the canvas opacity. Change:

```css
  opacity: 0;
```

inside `.mascot-3d-stage canvas` to:

```css
  opacity: 1;
```

- [ ] **Step 12: Run the Mascot stage tests**

Run:

```bash
cd cockpit
npm test -- Mascot3DStage.test.js
```

Expected: PASS. If failures mention exact snippets, update implementation or tests so they describe the same intended model.

- [ ] **Step 13: Commit the model implementation**

Run:

```bash
git status --short --branch
git add cockpit/src/components/Mascot3DStage.jsx cockpit/src/components/Mascot3DStage.css
git commit -m "feat: model ai mascot in threejs" -m "用户原始提示词: 对ai小人进行建模"
```

Expected: commit succeeds with only the stage component and CSS staged.

## Task 3: Preserve Action Semantics And Launcher Wiring

**Files:**
- Modify if needed: `cockpit/src/lib/mascotRig.js`
- Modify if needed: `cockpit/src/lib/mascotRig.test.js`
- Modify if needed: `cockpit/src/components/AIAnalysisWidget.test.js`

- [ ] **Step 1: Run existing rig tests**

Run:

```bash
cd cockpit
npm test -- src/lib/mascotRig.test.js
```

Expected: PASS. The current rig already contains `idle`, `wave`, `talk`, `think`, `alert`, `celebrate`, and `click` poses with fixed front-facing yaw.

- [ ] **Step 2: Add an expression-focused rig invariant only if visual review shows weak motion**

If manual review later shows the model action is too subtle, add this test to `cockpit/src/lib/mascotRig.test.js`:

```js
test('all interactive action poses differ from idle in at least one major limb', () => {
  const idle = getMascotRigPose(MASCOT_ACTIONS.idle, 0.8);
  const actions = [
    MASCOT_ACTIONS.wave,
    MASCOT_ACTIONS.talk,
    MASCOT_ACTIONS.think,
    MASCOT_ACTIONS.alert,
    MASCOT_ACTIONS.celebrate,
    MASCOT_ACTIONS.click,
  ];

  actions.forEach((action) => {
    const pose = getMascotRigPose(action, 0.8);
    const limbChanged = [
      'head',
      'spine',
      'leftUpperArm',
      'rightUpperArm',
      'leftForearm',
      'rightForearm',
      'leftUpperLeg',
      'rightUpperLeg',
    ].some((bone) => (
      pose[bone].rotation.some((value, index) => Math.abs(value - idle[bone].rotation[index]) > 0.08)
    ));

    assert.ok(limbChanged, `${action} should visibly change the mascot pose`);
  });
});
```

Run:

```bash
cd cockpit
npm test -- src/lib/mascotRig.test.js
```

Expected before changes: PASS if current rig is expressive enough. If it fails for an action, adjust only that action's existing pose values in `mascotRig.js`, then rerun until PASS.

- [ ] **Step 3: Confirm `AIAnalysisWidget` still owns action transitions**

Run:

```bash
cd cockpit
npm test -- src/components/AIAnalysisWidget.test.js
```

Expected: PASS. The launcher must still pass `action={mascotAction}`, `pointer={mascotPointer}`, and `analysisActive={open || loading}`.

- [ ] **Step 4: Commit only if this task changed rig or launcher tests**

If no files changed, skip this commit. If files changed, run:

```bash
git status --short --branch
git add cockpit/src/lib/mascotRig.js cockpit/src/lib/mascotRig.test.js cockpit/src/components/AIAnalysisWidget.test.js
git commit -m "fix: strengthen ai mascot action poses" -m "用户原始提示词: 对ai小人进行建模"
```

Expected: commit succeeds with only changed rig or launcher test files staged.

## Task 4: Full Verification And Runtime Visual Check

**Files:**
- No planned file changes.

- [ ] **Step 1: Run focused test suite**

Run:

```bash
cd cockpit
npm test -- src/components/Mascot3DStage.test.js src/lib/mascotRig.test.js src/components/AIAnalysisWidget.test.js
```

Expected: PASS.

- [ ] **Step 2: Run build**

Run:

```bash
cd cockpit
npm run build
```

Expected: PASS with Vite build output and no fatal errors.

- [ ] **Step 3: Start dev server**

Run:

```bash
cd cockpit
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`. Keep the process running until visual checks are complete.

- [ ] **Step 4: Visual interaction check**

Open the local URL and check the left-bottom AI assistant:

- Idle: mascot is visible, transparent background, compact size.
- Hover: right hand waves and glow shifts to ice blue.
- Click open: mascot bounces and AI dialog opens.
- Ask a quick prompt: mascot switches into think/talk behavior while loading and answering.
- Error path if available: alert pose leans forward and uses warm edge glow.
- Mobile viewport around 390px wide: mascot remains visible and does not overlap the dialog controls.

Expected: no blank Canvas, no clipped helmet, no old DOM pose image flashes.

- [ ] **Step 5: Stop dev server**

Stop the Vite process with `Ctrl+C`.

- [ ] **Step 6: Final Git status review**

Run:

```bash
git status --short --branch
```

Expected: only pre-existing unrelated working-tree changes remain unstaged. No uncommitted Mascot3DStage implementation files remain.

## Task 5: Required Pull, Push, And Post-Push Sync

**Files:**
- No file changes expected.

- [ ] **Step 1: Fetch and inspect both remotes**

Run:

```bash
git fetch origin main
git fetch ttoswar main
git rev-parse HEAD
git rev-parse origin/main
git rev-parse ttoswar/main
git log --left-right --cherry-pick --oneline HEAD...origin/main
git log --left-right --cherry-pick --oneline HEAD...ttoswar/main
```

Expected: local `HEAD` contains the mascot implementation commits. If a remote contains new commits not in local, stop and rebase/merge intentionally before pushing.

- [ ] **Step 2: Pull latest updates before pushing**

Run sequentially, not in parallel:

```bash
git pull --ff-only origin main
git pull --ff-only ttoswar main
```

Expected: both commands say `Already up to date.` or fast-forward cleanly.

- [ ] **Step 3: Push to both remotes**

Run:

```bash
git push origin main
git push ttoswar main
```

Expected: both pushes succeed. If `origin` returns `403 Permission to liuyifan00565/CEODashboard.git denied to afu-ann`, report that `ttoswar` can be synced but `origin` needs credentials with write access.

- [ ] **Step 4: Pull/confirm after both pushes**

Run sequentially:

```bash
git fetch origin main
git fetch ttoswar main
git rev-parse HEAD
git rev-parse origin/main
git rev-parse ttoswar/main
git pull --ff-only origin main
git pull --ff-only ttoswar main
```

Expected: local `HEAD`, `origin/main`, and `ttoswar/main` all match. If `origin` push was blocked by 403, expected final state is local `HEAD == ttoswar/main` and `origin/main` behind; report that exception clearly.

## Self-Review

- Spec coverage: The plan covers the confirmed A direction, real Three.js model parts, preserved AI launcher state flow, rig-driven actions, transparent fallback PNG, compact stage CSS, focused tests, build, visual check, and dual-remote sync.
- Forbidden-marker scan: Passed; the plan contains no unresolved markers or vague unexpanded test steps.
- Type consistency: Component names in tests match implementation tasks: `MascotModel`, `MascotHead`, `MascotHeadset`, `MascotBody`, `MascotArm`, `MascotLeg`, `MascotSuitLines`, `MascotGlow`, `createPoseRefs`, `applyRigPose`, `getMascotExpression`, and `FALLBACK_MASCOT_SOURCE`.
