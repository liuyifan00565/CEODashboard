更新时间: 2026-07-10 12:04:46 CST
更新内容: 新增福小客自然丝滑动作的测试先行实施计划，覆盖共享时间线、播放接入、衔接、样式与文档验收。

# 福小客自然丝滑动作实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不更换福小客素材、不改变侧栏布局和点击逻辑的前提下，让待机与全部交互动作使用自然、非匀速且一致的时间线播放。

**Architecture:** 在 `cockpit/src/lib/mascotMotionTimeline.js` 中提供不依赖 React 的时间线解析纯函数；`mascotAnimationManifest.js` 为每个动作声明 `{ frame, durationMs }` 时间线；Sprite fallback 与本地 rig 保留各自渲染层，但共享同一个解析函数。现有单层 motion bridge 继续禁止 ghost/crossfade，并改用带时长的收势与起势条目。

**Tech Stack:** React 19、Vite 8、JavaScript ES modules、Node.js `node:test`、CSS keyframes。

## Global Constraints

- 保持人物尺寸、脚底位置、侧栏入口边界和点击打开 AI 对话框的逻辑不变。
- 不修改 `cockpit/public/mascot-actions/*.png`，不引入新模型或新依赖。
- 外层连续动效只使用 `translate3d`，最大位移约 1–2px；禁止 `scale()` 和 `rotate()`。
- 不创建 ghost、blend 或 crossfade 人物图层。
- 待机单循环保持 5–6 秒，每个循环只短暂使用一次闭眼帧。
- `prefers-reduced-motion` 开启时不启动持续时间线或 motion bridge。
- 所有代码和文档文件顶部添加 2026-07-10 的更新时间与本次更新内容。
- 不暂存或提交当前工作区中与福小客动作无关的既有改动。

---

## 文件结构

- 创建 `cockpit/src/lib/mascotMotionTimeline.js`：时间线总时长、按已播放时间解析帧、减少动态代表帧、bridge 时间线构建。
- 创建 `cockpit/src/lib/mascotMotionTimeline.test.js`：纯函数的循环、非循环、端点、减少动态和 bridge 单元测试。
- 修改 `cockpit/src/lib/mascotAnimationManifest.js`：为待机和每个运行态动作声明带时长的时间线。
- 修改 `cockpit/src/lib/mascotAnimationManifest.test.js`：验证自然节奏、5–6 秒待机、短眨眼、循环端点停顿和帧边界。
- 修改 `cockpit/src/components/MascotSpriteStage.jsx` 与测试：fallback 使用共享时间线解析。
- 修改 `cockpit/src/components/Live2DMascotStage.jsx` 与测试：本地 rig 正常播放和 bridge 都使用共享时间线解析。
- 修改 `cockpit/src/components/MascotSpriteStage.css`、`Live2DMascotStage.css` 与现有测试：收敛连续位移动效。
- 修改 `cockpit/README.md`、`doc/mascot-live2d.md`：同步动作口径与降级规则。

---

### Task 1: 共享动作时间线解析器

**Files:**
- Create: `cockpit/src/lib/mascotMotionTimeline.js`
- Create: `cockpit/src/lib/mascotMotionTimeline.test.js`

**Interfaces:**
- Consumes: `animation.timeline: Array<{ frame: number, durationMs: number }>`、`animation.loop: boolean`、`animation.reducedMotionFrame?: number`。
- Produces: `getMascotTimelineDuration(timeline)`、`resolveMascotTimeline(animation, elapsedMs)`、`getMascotReducedMotionFrame(animation)`、`buildMascotMotionBridge(fromAnimation, fromCursor, toAnimation)`。

- [ ] **Step 1: 写入失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMascotMotionBridge,
  getMascotReducedMotionFrame,
  getMascotTimelineDuration,
  resolveMascotTimeline,
} from './mascotMotionTimeline.js';

const loop = {
  key: 'talk',
  sheetKey: 'talk',
  intensity: 'speech',
  loop: true,
  leadInFrameCount: 2,
  settleFrameCount: 2,
  reducedMotionFrame: 1,
  timeline: [
    { frame: 0, durationMs: 100 },
    { frame: 1, durationMs: 200 },
    { frame: 2, durationMs: 100 },
  ],
};

test('resolves variable frame durations and loop counts', () => {
  assert.equal(getMascotTimelineDuration(loop.timeline), 400);
  assert.deepEqual(resolveMascotTimeline(loop, 250), {
    cursor: 1,
    frame: 1,
    loopCount: 0,
    finished: false,
    durationMs: 400,
  });
  assert.equal(resolveMascotTimeline(loop, 450).frame, 0);
  assert.equal(resolveMascotTimeline(loop, 450).loopCount, 1);
});

test('clamps one-shot timelines and exposes a reduced-motion frame', () => {
  const oneShot = { ...loop, loop: false, reducedMotionFrame: 2 };
  assert.equal(resolveMascotTimeline(oneShot, 999).frame, 2);
  assert.equal(resolveMascotTimeline(oneShot, 999).finished, true);
  assert.equal(getMascotReducedMotionFrame(oneShot), 2);
});

test('builds one-layer settle and lead-in bridge entries', () => {
  const next = { ...loop, key: 'think', sheetKey: 'think' };
  const bridge = buildMascotMotionBridge(loop, 2, next);
  assert.deepEqual(bridge.timeline.map((entry) => entry.frame), [2, 1, 0, 1]);
  assert.equal(bridge.timeline[0].sheetKey, 'talk');
  assert.equal(bridge.timeline.at(-1).sheetKey, 'think');
  assert.equal(bridge.targetAction, 'think');
  assert.equal(bridge.targetCursor, 2);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `cd cockpit && node --test src/lib/mascotMotionTimeline.test.js`

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND`，因为 `mascotMotionTimeline.js` 尚未创建。

- [ ] **Step 3: 编写最小实现**

```js
export function getMascotTimelineDuration(timeline = []) {
  return timeline.reduce((total, entry) => total + Math.max(1, Number(entry.durationMs) || 0), 0);
}

export function resolveMascotTimeline(animation, elapsedMs = 0) {
  const timeline = animation?.timeline ?? [];
  const durationMs = getMascotTimelineDuration(timeline);
  if (!timeline.length || durationMs <= 0) {
    return { cursor: 0, frame: 0, loopCount: 0, finished: true, durationMs: 0 };
  }

  const safeElapsed = Math.max(0, Number(elapsedMs) || 0);
  const loopCount = animation.loop ? Math.floor(safeElapsed / durationMs) : 0;
  const cycleElapsed = animation.loop
    ? safeElapsed % durationMs
    : Math.min(safeElapsed, durationMs - 1);
  let accumulated = 0;
  let cursor = timeline.length - 1;
  for (let index = 0; index < timeline.length; index += 1) {
    accumulated += Math.max(1, Number(timeline[index].durationMs) || 0);
    if (cycleElapsed < accumulated) {
      cursor = index;
      break;
    }
  }

  return {
    cursor,
    frame: timeline[cursor].frame,
    loopCount,
    finished: !animation.loop && safeElapsed >= durationMs,
    durationMs,
  };
}

export function getMascotReducedMotionFrame(animation) {
  const timeline = animation?.timeline ?? [];
  const preferred = Number(animation?.reducedMotionFrame);
  if (Number.isInteger(preferred) && timeline.some((entry) => entry.frame === preferred)) return preferred;
  return timeline[0]?.frame ?? 0;
}

function bridgeEntry(animation, entry) {
  return Object.freeze({
    actionKey: animation.key,
    intensity: animation.intensity,
    sheetKey: animation.sheetKey,
    frame: entry.frame,
    durationMs: Math.min(120, Math.max(60, entry.durationMs)),
  });
}

export function buildMascotMotionBridge(fromAnimation, fromCursor, toAnimation) {
  const settleCount = Math.max(0, fromAnimation.settleFrameCount ?? 0);
  const leadInCount = Math.max(0, toAnimation.leadInFrameCount ?? 0);
  const outgoing = fromAnimation.timeline
    .slice(Math.max(0, fromCursor - settleCount + 1), fromCursor + 1)
    .reverse()
    .map((entry) => bridgeEntry(fromAnimation, entry));
  const incoming = toAnimation.timeline
    .slice(0, leadInCount)
    .map((entry) => bridgeEntry(toAnimation, entry));
  return Object.freeze({
    timeline: Object.freeze([...outgoing, ...incoming]),
    targetAction: toAnimation.key,
    targetCursor: incoming.length,
  });
}
```

- [ ] **Step 4: 运行单元测试并确认通过**

Run: `cd cockpit && node --test src/lib/mascotMotionTimeline.test.js`

Expected: 3 tests PASS，0 FAIL。

- [ ] **Step 5: 提交 Task 1**

```bash
git add cockpit/src/lib/mascotMotionTimeline.js cockpit/src/lib/mascotMotionTimeline.test.js
git commit -m "feat: add mascot motion timeline resolver" -m "用户原始提示词：帮我把左下角我的那个小人的动作变得丝滑一点，那些动作啊什么的变得好看一点"
```

---

### Task 2: 自然动作时间线清单

**Files:**
- Modify: `cockpit/src/lib/mascotAnimationManifest.js`
- Modify: `cockpit/src/lib/mascotAnimationManifest.test.js`

**Interfaces:**
- Consumes: `getMascotTimelineDuration(timeline)` from Task 1。
- Produces: 每个 `getMascotAnimation(action)` 结果包含冻结的 `timeline`、`durationMs`、`leadInFrameCount`、`settleFrameCount` 和 `reducedMotionFrame`。

- [ ] **Step 1: 更新清单测试，使旧匀速清单失败**

```js
test('uses a five-to-six second idle timeline with one brief blink', () => {
  const idle = getMascotAnimation(MASCOT_ACTIONS.idle);
  assert.ok(Array.isArray(idle.timeline));
  assert.ok(idle.durationMs >= 5000 && idle.durationMs <= 6000);
  const closedEntries = idle.timeline.filter((entry) => entry.frame >= 4 && entry.frame <= 6);
  assert.deepEqual(closedEntries.map((entry) => entry.frame), [4]);
  assert.ok(closedEntries[0].durationMs <= 100);
});

test('uses positive variable durations and valid frame indexes for every action', () => {
  for (const action of requiredActions) {
    const animation = MASCOT_ANIMATIONS[action];
    assert.ok(animation.timeline.length >= 8);
    assert.ok(animation.timeline.every((entry) => entry.durationMs > 0));
    assert.ok(new Set(animation.timeline.map((entry) => entry.durationMs)).size > 1);
    assert.ok(animation.timeline.every((entry) => (
      entry.frame >= 0 && entry.frame < MASCOT_ACTION_SHEETS[animation.sheetKey].frameCount
    )));
  }
});

test('gives looping actions a calm endpoint hold', () => {
  for (const key of [MASCOT_ACTIONS.talk, MASCOT_ACTIONS.think, MASCOT_ACTIONS.alert, 'maintenanceReview']) {
    const animation = MASCOT_ANIMATIONS[key];
    const midpoint = animation.timeline.findIndex((entry, index) => (
      index > 0 && entry.frame < animation.timeline[index - 1].frame
    ));
    assert.ok(midpoint > 0);
    assert.ok(animation.timeline[midpoint - 1].durationMs >= 180);
  }
});
```

- [ ] **Step 2: 运行清单测试并确认失败**

Run: `cd cockpit && node --test src/lib/mascotAnimationManifest.test.js`

Expected: FAIL，首次失败指出 `idle.timeline` 不存在。

- [ ] **Step 3: 为清单增加冻结的非匀速时间线**

在 `mascotAnimationManifest.js` 中加入：

```js
import { getMascotTimelineDuration } from './mascotMotionTimeline.js';

function motionTimeline(frames, durations) {
  return Object.freeze(frames.map((frame, index) => Object.freeze({
    frame,
    durationMs: durations[index],
  })));
}

const IDLE_TIMELINE = motionTimeline(
  [0, 1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 13],
  [700, 400, 300, 220, 90, 180, 300, 340, 380, 420, 450, 400, 330, 300, 250, 220],
);

const LOOP_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const CALM_LOOP_TIMELINE = motionTimeline(
  LOOP_FRAMES,
  [130, 110, 100, 90, 90, 90, 90, 100, 110, 120, 140, 220, 140, 120, 110, 100, 90, 90, 100, 110, 130, 190],
);
```

`idleVariant()` 与 `actionSpec()` 接收 `timeline`，并通过 `getMascotTimelineDuration()` 计算 `durationMs`。一次性动作使用独立持续时间数组，循环动作在帧 11 和回到帧 1 前各保留至少 180ms；提醒的中间帧可以略快，但最大位移不变。所有动作设置：

```js
leadInFrameCount: 2,
settleFrameCount: key === MASCOT_ACTIONS.idle ? 0 : 2,
reducedMotionFrame: timeline[Math.floor(timeline.length / 2)].frame,
```

- [ ] **Step 4: 运行清单测试并确认通过**

Run: `cd cockpit && node --test src/lib/mascotAnimationManifest.test.js`

Expected: 所有 manifest 与 PNG 审计测试 PASS。

- [ ] **Step 5: 提交 Task 2**

```bash
git add cockpit/src/lib/mascotAnimationManifest.js cockpit/src/lib/mascotAnimationManifest.test.js
git commit -m "feat: define natural mascot motion timelines" -m "用户原始提示词：帮我把左下角我的那个小人的动作变得丝滑一点，那些动作啊什么的变得好看一点"
```

---

### Task 3: Sprite 与本地 rig 共用时间线

**Files:**
- Modify: `cockpit/src/components/MascotSpriteStage.jsx`
- Modify: `cockpit/src/components/MascotSpriteStage.test.js`
- Modify: `cockpit/src/components/Live2DMascotStage.jsx`
- Modify: `cockpit/src/components/Live2DMascotStage.test.js`

**Interfaces:**
- Consumes: `resolveMascotTimeline()`、`getMascotReducedMotionFrame()`、`buildMascotMotionBridge()` from Task 1；manifest timeline from Task 2。
- Produces: 两个渲染路径依据同一 `elapsedMs -> cursor/frame` 结果更新，bridge 使用 `timeline` 而不是固定 `14 FPS`。

- [ ] **Step 1: 更新组件源码回归测试**

在 `MascotSpriteStage.test.js` 中要求：

```js
assert.match(componentCode, /resolveMascotTimeline/);
assert.match(componentCode, /getMascotReducedMotionFrame/);
assert.match(componentCode, /const motion = resolveMascotTimeline\(animation, elapsed\);/);
assert.doesNotMatch(componentCode, /1000 \/ animation\.fps/);
```

在 `Live2DMascotStage.test.js` 中要求：

```js
assert.match(componentCode, /buildMascotMotionBridge/);
assert.match(componentCode, /resolveMascotTimeline/);
assert.match(componentCode, /motionBridge\?\.timeline\[bridgeCursor\]/);
assert.doesNotMatch(componentCode, /LOCAL_RIG_MOTION_BRIDGE_FPS/);
assert.doesNotMatch(componentCode, /1000 \/ animation\.fps/);
```

- [ ] **Step 2: 运行组件测试并确认失败**

Run: `cd cockpit && node --test src/components/MascotSpriteStage.test.js src/components/Live2DMascotStage.test.js`

Expected: FAIL，缺少共享时间线 import，且仍匹配固定 FPS 代码。

- [ ] **Step 3: 接入 Sprite fallback**

`MascotSpriteStage.jsx` 从新模块导入解析函数，并在 `tick(now)` 中使用：

```js
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  const frame = getMascotReducedMotionFrame(animation);
  const cursor = animation.timeline.findIndex((entry) => entry.frame === frame);
  setFrameCursor(Math.max(0, cursor));
  return undefined;
}

function tick(now) {
  const elapsed = now - startedAt;
  const motion = resolveMascotTimeline(animation, elapsed);
  setFrameCursor(motion.cursor);
  if (animation.loop && motion.loopCount > lastLoopRef.current) {
    lastLoopRef.current = motion.loopCount;
    if (animation.key === MASCOT_ACTIONS.idle) setIdleVariantIndex((index) => index + 1);
  }
  if (!motion.finished) animationFrameRef.current = requestAnimationFrame(tick);
}
```

当前显示帧改为：

```js
const currentFrame = animation.timeline[frameCursor]?.frame ?? animation.timeline[0]?.frame ?? 0;
```

- [ ] **Step 4: 接入本地 rig 与 bridge**

删除本地固定 bridge FPS。正常播放与 bridge 都调用 `resolveMascotTimeline()`；bridge 返回的条目已经带 `sheetKey`、`actionKey`、`intensity` 和 `durationMs`：

```js
const currentLocalRigFrame = motionBridge?.timeline[bridgeCursor] ?? createLocalRigFrame(
  animation,
  animation.timeline[frameCursor]?.frame ?? animation.timeline[0]?.frame ?? 0,
);
```

当 `prefers-reduced-motion` 开启时，直接设置目标动作并使用 `getMascotReducedMotionFrame(nextAnimation)`，不启动 bridge。bridge 完成时读取最新 `action`；如果它与 `motionBridge.targetAction` 不同，立即以最新动作重新构建 bridge，避免播放过时队列。

- [ ] **Step 5: 运行组件与时间线测试**

Run: `cd cockpit && node --test src/lib/mascotMotionTimeline.test.js src/lib/mascotAnimationManifest.test.js src/components/MascotSpriteStage.test.js src/components/Live2DMascotStage.test.js`

Expected: 所有测试 PASS，0 FAIL。

- [ ] **Step 6: 提交 Task 3**

```bash
git add cockpit/src/components/MascotSpriteStage.jsx cockpit/src/components/MascotSpriteStage.test.js cockpit/src/components/Live2DMascotStage.jsx cockpit/src/components/Live2DMascotStage.test.js
git commit -m "feat: share mascot timeline playback" -m "用户原始提示词：帮我把左下角我的那个小人的动作变得丝滑一点，那些动作啊什么的变得好看一点"
```

---

### Task 4: 连续位移动效、文档与全量验证

**Files:**
- Modify: `cockpit/src/components/MascotSpriteStage.css`
- Modify: `cockpit/src/components/Live2DMascotStage.css`
- Modify: `cockpit/src/components/MascotSpriteStage.test.js`
- Modify: `cockpit/src/components/Live2DMascotStage.test.js`
- Modify: `cockpit/README.md`
- Modify: `doc/mascot-live2d.md`

**Interfaces:**
- Consumes: Task 2 的动作 `intensity` 类名。
- Produces: 脚底锚定的 translate-only 连续动效与同步说明。

- [ ] **Step 1: 收紧 CSS 回归断言并确认失败**

新增断言，要求待机周期为 5.28 秒、最大纵向位移不超过 1.2px，并继续禁止缩放与旋转：

```js
assert.match(cssCode, /mascot-sheet-idle-life 5\.28s/);
assert.match(cssCode, /translate3d\(0, -1\.2px, 0\)/);
assert.doesNotMatch(cssCode, /transform:\s*[^;]*(?:scale|rotate)/);
```

本地 rig CSS 同样要求对应 intensity 使用相同周期，并保持 `animation: none` 的基础层只由 intensity 选择器覆盖。

- [ ] **Step 2: 运行 CSS 源码测试并确认失败**

Run: `cd cockpit && node --test src/components/MascotSpriteStage.test.js src/components/Live2DMascotStage.test.js`

Expected: FAIL，旧待机周期仍为 `5.8s`，本地 rig 的周期尚未同步。

- [ ] **Step 3: 修改 translate-only CSS**

待机使用 5.28 秒非对称曲线：

```css
.mascot-sprite-stage--idle .mascot-sprite-stage__sheet,
.mascot-sprite-stage--maintenance .mascot-sprite-stage__sheet,
.mascot-local-live2d-rig--idle .mascot-local-live2d-rig__sheet,
.mascot-local-live2d-rig--maintenance .mascot-local-live2d-rig__sheet {
  animation: mascot-sheet-idle-life 5.28s cubic-bezier(.45, 0, .2, 1) infinite;
}

@keyframes mascot-sheet-idle-life {
  0%, 100% { transform: translate3d(0, 0, 0); }
  36% { transform: translate3d(0, -1.2px, 0); }
  72% { transform: translate3d(.5px, -.35px, 0); }
}
```

说话、思考、提醒和一次性动作保留各自节奏，但所有关键帧只出现 `translate3d`，横向不超过 1.6px、纵向不超过 2px，首尾回到零位移。

- [ ] **Step 4: 同步文档顶部与说明**

在 `cockpit/README.md` 与 `doc/mascot-live2d.md` 顶部新增 2026-07-10 更新说明，并记录：

- Sprite fallback 与本地 rig 共享毫秒级非匀速时间线。
- 待机循环 5.28 秒且每轮只短眨眼一次。
- 循环动作端点短停，一次性动作包含起势、主动作、短停和回落。
- 继续禁止 ghost crossfade、人物缩放和大幅旋转。
- 正式 Cubism 模型仍是未来获得真实骨骼插值的必要条件。

- [ ] **Step 5: 运行全部相关测试、lint 与构建**

Run: `cd cockpit && node --test src/lib/mascotMotionTimeline.test.js src/lib/mascotAnimationManifest.test.js src/components/MascotSpriteStage.test.js src/components/Live2DMascotStage.test.js src/components/AIAnalysisWidget.test.js src/App.layout.test.js`

Expected: 所有测试 PASS，0 FAIL。

Run: `cd cockpit && npm run lint`

Expected: exit code 0，无新增 lint 错误。

Run: `cd cockpit && npm run build`

Expected: `vite build` exit code 0，生成 `dist/`。

- [ ] **Step 6: 运行服务验收**

确认 `http://127.0.0.1:5174` 返回 200；观察至少两个 5.28 秒待机循环，并依次触发挥手、点击、说话、思考、提醒和庆祝。验收标准：无双影、无空白帧、无人物缩放、脚底稳定、动作端点无突然反向。

- [ ] **Step 7: 提交 Task 4**

```bash
git add cockpit/src/components/MascotSpriteStage.css cockpit/src/components/Live2DMascotStage.css cockpit/src/components/MascotSpriteStage.test.js cockpit/src/components/Live2DMascotStage.test.js cockpit/README.md doc/mascot-live2d.md
git commit -m "feat: polish natural Fu Xiaoke motion" -m "用户原始提示词：帮我把左下角我的那个小人的动作变得丝滑一点，那些动作啊什么的变得好看一点"
```

---

### Task 5: 双远端同步与三方一致性确认

**Files:**
- No file changes.

**Interfaces:**
- Consumes: Tasks 1–4 的已验证提交。
- Produces: 本地、`origin/codex/ai-mascot-3d-model`、`ttoswar/codex/ai-mascot-3d-model` 指向同一提交。

- [ ] **Step 1: 检查工作区与远端**

Run: `git status --short --branch && git remote -v`

Expected: 本次福小客相关文件无未提交修改；既有无关改动仍保持原状；存在 `origin` 与 `ttoswar`。

- [ ] **Step 2: 拉取两个远端当前分支**

Run: `git fetch origin codex/ai-mascot-3d-model && git fetch ttoswar codex/ai-mascot-3d-model`

Expected: 两个 fetch 成功。

- [ ] **Step 3: 处理远端前进**

若 `origin/codex/ai-mascot-3d-model` 或 `ttoswar/codex/ai-mascot-3d-model` 不在本地 HEAD 历史中，先暂停推送，检查提交差异并使用非交互 rebase 合并；不得覆盖远端提交。

- [ ] **Step 4: 推送两个远端**

Run: `git push origin codex/ai-mascot-3d-model`

Run: `git push ttoswar codex/ai-mascot-3d-model`

Expected: 两次 push 都成功。

- [ ] **Step 5: 再次抓取并确认三方一致**

Run: `git fetch origin codex/ai-mascot-3d-model && git fetch ttoswar codex/ai-mascot-3d-model`

Run: `git rev-parse HEAD && git rev-parse origin/codex/ai-mascot-3d-model && git rev-parse ttoswar/codex/ai-mascot-3d-model`

Expected: 三个完整提交 ID 完全一致。
