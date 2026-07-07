# AI Mascot Greeting Idle Guide Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clear greeting, idle, and one-second right-side dialog guide motions to the existing 3D AI mascot.

**Architecture:** Keep `AIAnalysisWidget` as the interaction state owner and `Mascot3DStage` as the GLB control-node animation boundary. Add a dedicated `MASCOT_ACTIONS.guide` action so opening-dialog guidance stays separate from generic click feedback and talk/idle states.

**Tech Stack:** React 19, Vite, Three.js, `@react-three/fiber`, `@react-three/drei`, Node native test runner.

## Global Constraints

- Update touched source/test files at the top with a Chinese timestamp and update summary.
- Commit only files related to this feature.
- Include the user original prompt in commit messages: `先做打招呼，待机跟指引吧 指引是当用户点击小人的时候指右边的对话框`.
- Do not modify AI API, business metric calculations, database sync logic, Docker files, maintenance page styles, or GLB assets.
- Use TDD: write failing tests first, verify they fail, then implement the smallest passing change.
- `guide` must trigger only when clicking the mascot opens the dialog, last `1000` ms, and return to `talk` while the dialog is open.
- Clicking the mascot to close the dialog must not trigger `guide`.

---

### Task 1: Red Tests For Guide Action Contract

**Files:**
- Modify: `cockpit/src/lib/mascotCompanion.test.js`
- Modify: `cockpit/src/components/AIAnalysisWidget.test.js`
- Modify: `cockpit/src/components/Mascot3DStage.test.js`

**Interfaces:**
- Consumes: existing `MASCOT_ACTIONS`, `playMascotAction`, and `Mascot3DStage` action validation.
- Produces: failing tests that require `MASCOT_ACTIONS.guide`, a one-second open-dialog trigger, and GLB guide-node animation.

- [ ] **Step 1: Update `mascotCompanion.test.js` header and add guide enum test**

Add this comment at the top:

```js
/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 增加 AI 小人 guide 指引动作枚举测试，约束点击打开对话框时使用独立动作语义。
*/
```

Add this test after the imports:

```js
test('defines a dedicated guide action for pointing users to the AI dialog', () => {
  assert.equal(MASCOT_ACTIONS.guide, 'guide');
});
```

- [ ] **Step 2: Update `AIAnalysisWidget.test.js` header and add open-click guide trigger assertions**

Add a new top comment:

```js
/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 约束点击打开 AI 对话框时播放约 1 秒 guide 指引动作，点击关闭不触发指引。
*/
```

Add this test after `responds to KPI card context with matching speech and motion`:

```js
test('plays a one-second guide motion only when opening the AI dialog from the mascot', () => {
  assert.match(componentSource, /if \(nextOpen\) \{\s*playMascotAction\(MASCOT_ACTIONS\.guide,\s*1000,\s*true\);[\s\S]*?openAiDialog\(\);[\s\S]*?return;\s*\}/);
  assert.match(componentSource, /playMascotAction\(MASCOT_ACTIONS\.click,\s*860,\s*false\);/);
  assert.doesNotMatch(componentSource, /playMascotAction\(MASCOT_ACTIONS\.guide,\s*1000,\s*false\)/);
});
```

- [ ] **Step 3: Update `Mascot3DStage.test.js` header and guide action animation assertions**

Add a new top comment:

```js
/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 增加 GLB 小人 guide 指引动作测试，约束右臂、头部和身体指向右侧对话框。
*/
```

Add this test after `maps every mascot companion action to control-node motion instead of swapping frames`:

```js
test('maps guide action to a right-side dialog pointing motion', () => {
  assert.match(stageCode, /MASCOT_ACTIONS\.guide/);
  assert.match(stageCode, /if \(action === MASCOT_ACTIONS\.guide\) \{/);
  assert.match(stageCode, /bodyRotZ \+= -0\.075;/);
  assert.match(stageCode, /headRotZ \+= -0\.12 \+ Math\.sin\(t \* 4\.2\) \* 0\.018;/);
  assert.match(stageCode, /rightArmRotZ \+= -0\.68 \+ Math\.sin\(t \* 5\.4\) \* 0\.045;/);
  assert.match(stageCode, /leftArmRotZ \+= 0\.08;/);
});
```

- [ ] **Step 4: Run red tests**

Run:

```powershell
cd cockpit
node --test src/lib/mascotCompanion.test.js src/components/AIAnalysisWidget.test.js src/components/Mascot3DStage.test.js
```

Expected: FAIL. The failures should mention missing `guide`, missing `MASCOT_ACTIONS.guide`, or missing guide-specific animation snippets.

- [ ] **Step 5: Commit red tests**

Run:

```powershell
git status --short --branch
git add cockpit/src/lib/mascotCompanion.test.js cockpit/src/components/AIAnalysisWidget.test.js cockpit/src/components/Mascot3DStage.test.js
git commit -m "test: require ai mascot guide action" -m "用户原始提示词: 先做打招呼，待机跟指引吧 指引是当用户点击小人的时候指右边的对话框"
```

Expected: commit succeeds with only the three test files staged.

### Task 2: Implement Guide Action State And Click Flow

**Files:**
- Modify: `cockpit/src/lib/mascotCompanion.js`
- Modify: `cockpit/src/components/AIAnalysisWidget.jsx`

**Interfaces:**
- Consumes: failing tests from Task 1.
- Produces: `MASCOT_ACTIONS.guide` and click-open logic that plays `guide` for `1000` ms.

- [ ] **Step 1: Update `mascotCompanion.js` header and add enum value**

Add a new top comment:

```js
/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 新增 guide 指引动作枚举，用于点击打开 AI 对话框时指向右侧对话框。
*/
```

Change `MASCOT_ACTIONS` to include:

```js
export const MASCOT_ACTIONS = Object.freeze({
  idle: 'idle',
  wave: 'wave',
  guide: 'guide',
  talk: 'talk',
  think: 'think',
  alert: 'alert',
  celebrate: 'celebrate',
  click: 'click',
});
```

- [ ] **Step 2: Update `AIAnalysisWidget.jsx` header and split open/close click actions**

Add a new top comment:

```js
/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 点击打开 AI 对话框时播放约 1 秒 guide 指引动作，点击关闭时保留轻量点击反馈。
*/
```

Replace `handleMascotClick` with:

```js
function handleMascotClick() {
  const nextOpen = !open;
  showCompanionCue({
    action: nextOpen ? MASCOT_ACTIONS.guide : MASCOT_ACTIONS.talk,
    text: nextOpen ? '我把 AI 经营分析窗口打开了，您可以直接问经营问题。' : '我先收起来，有需要再点我。',
  }, { openDialog: false, duration: 3800 });

  if (nextOpen) {
    playMascotAction(MASCOT_ACTIONS.guide, 1000, true);
    openAiDialog();
    return;
  }

  playMascotAction(MASCOT_ACTIONS.click, 860, false);
  closeAiDialog();
}
```

- [ ] **Step 3: Run focused tests**

Run:

```powershell
cd cockpit
node --test src/lib/mascotCompanion.test.js src/components/AIAnalysisWidget.test.js
```

Expected: `mascotCompanion.test.js` passes. `AIAnalysisWidget.test.js` passes for click-flow assertions or fails only if source formatting needs the exact test pattern aligned with equivalent code.

- [ ] **Step 4: Commit state and click-flow implementation**

Run:

```powershell
git status --short --branch
git add cockpit/src/lib/mascotCompanion.js cockpit/src/components/AIAnalysisWidget.jsx
git commit -m "feat: trigger ai mascot guide on dialog open" -m "用户原始提示词: 先做打招呼，待机跟指引吧 指引是当用户点击小人的时候指右边的对话框"
```

Expected: commit succeeds with only the two implementation files staged.

### Task 3: Implement GLB Guide Pose

**Files:**
- Modify: `cockpit/src/components/Mascot3DStage.jsx`

**Interfaces:**
- Consumes: `MASCOT_ACTIONS.guide`.
- Produces: guide-specific GLB control-node motion in `useFrame`.

- [ ] **Step 1: Update `Mascot3DStage.jsx` header**

Add a new top comment:

```js
/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 新增 guide 指引动作姿态，点击打开 AI 对话框时让小人指向右侧对话框约 1 秒。
*/
```

- [ ] **Step 2: Add guide motion block after wave handling and before talk handling**

Insert:

```js
if (action === MASCOT_ACTIONS.guide) {
  rootY += 0.035 + Math.sin(t * 4.8) * 0.012;
  rootRotZ -= 0.045;
  bodyRotZ += -0.075;
  headRotZ += -0.12 + Math.sin(t * 4.2) * 0.018;
  rightArmRotZ += -0.68 + Math.sin(t * 5.4) * 0.045;
  leftArmRotZ += 0.08;
}
```

- [ ] **Step 3: Run stage test**

Run:

```powershell
cd cockpit
node --test src/components/Mascot3DStage.test.js
```

Expected: PASS.

- [ ] **Step 4: Commit GLB guide pose**

Run:

```powershell
git status --short --branch
git add cockpit/src/components/Mascot3DStage.jsx
git commit -m "feat: add ai mascot guide pose" -m "用户原始提示词: 先做打招呼，待机跟指引吧 指引是当用户点击小人的时候指右边的对话框"
```

Expected: commit succeeds with only `Mascot3DStage.jsx` staged.

### Task 4: Verification, Runtime Check, And Remote Sync

**Files:**
- No planned source changes.

**Interfaces:**
- Consumes: completed guide action implementation.
- Produces: passing tests, passing build, visual confirmation, and remote sync attempt.

- [ ] **Step 1: Run focused tests**

Run:

```powershell
cd cockpit
node --test src/lib/mascotCompanion.test.js src/components/AIAnalysisWidget.test.js src/components/Mascot3DStage.test.js
```

Expected: PASS.

- [ ] **Step 2: Run build**

Run:

```powershell
cd cockpit
npm run build
```

Expected: PASS.

- [ ] **Step 3: Start dev server**

Run:

```powershell
cd cockpit
npm run dev -- --host 127.0.0.1
```

Expected: Vite serves the dashboard on a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 4: Visual interaction check**

Open the local URL and verify:

- Idle: mascot remains visible, gently floating, no layout shift.
- Hover: mascot waves.
- Click open: AI dialog opens on the right and mascot points to it for about one second.
- After one second: mascot returns to open-dialog talk motion.
- Click close: dialog closes without guide motion.

- [ ] **Step 5: Stop dev server**

Stop the Vite process after visual checks.

- [ ] **Step 6: Pull, push, and confirm remotes**

Run:

```powershell
$branch = git branch --show-current
git fetch origin $branch
git fetch ttoswar $branch
git pull --ff-only origin $branch
git pull --ff-only ttoswar $branch
git push origin HEAD:$branch
git push ttoswar HEAD:$branch
git fetch origin $branch
git fetch ttoswar $branch
git rev-parse HEAD
git rev-parse origin/$branch
git rev-parse ttoswar/$branch
git status --short --branch
```

Expected: local `HEAD` and both remote branch refs match. If `origin` returns `Repository not found`, report that `ttoswar` was synced and `origin` needs credentials or repository access.

## Self-Review

- Spec coverage: The plan covers `idle`, `wave`, new `guide`, click-open-only trigger, one-second duration, return to `talk`, no guide on close, focused tests, build, visual check, and dual-remote sync.
- Placeholder scan: No `TBD`, `TODO`, `fill in`, or unspecified implementation steps remain.
- Type consistency: The action name is consistently `MASCOT_ACTIONS.guide` with value `'guide'`; the click duration is consistently `1000`.
