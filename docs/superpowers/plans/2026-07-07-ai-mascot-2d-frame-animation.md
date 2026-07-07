更新时间: 2026-07-07 14:03:53 CST
更新内容: 新增 AI 小人 2D 帧动画第一期产品闭环实施计划。

# AI Mascot 2D Frame Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sidebar AI mascot GLB runtime with a high-quality 2D sprite animation system using the approved mascot image assets.

**Architecture:** Add a manifest-driven 2D mascot stage. Product state remains in `AIAnalysisWidget.jsx`; animation details live in `mascotAnimationManifest.js`, `MascotSpriteStage.jsx`, and `MascotSpriteStage.css`.

**Tech Stack:** React, CSS sprite sheets, Node test runner, PNG validation through existing Node APIs.

## Global Constraints

- Use `cockpit/public/ai-mascot-sprite.png` as the primary 48-frame sheet.
- Keep `cockpit/public/ai-mascot-transparent.png` and `cockpit/public/ai-mascot-analysis-laptop.png` as approved fallback/accent assets.
- Do not load `/models/ai-mascot.glb` in the AI launcher after this change.
- Define at least four idle variants.
- Keep the mascot anchored inside the sidebar card.
- Add/update top-of-file update notes for every edited code, CSS, and test file.

---

### Task 1: Manifest And Tests

**Files:**
- Create: `cockpit/src/lib/mascotAnimationManifest.js`
- Create: `cockpit/src/lib/mascotAnimationManifest.test.js`

**Interfaces:**
- Produces: `MASCOT_SPRITE_SHEET`, `MASCOT_APPROVED_ASSETS`, `MASCOT_IDLE_VARIANTS`, `MASCOT_ANIMATIONS`, `getMascotAnimation(action, options)`

- [ ] **Step 1: Write failing manifest tests**

Use Node tests to assert sprite geometry, approved assets, all required action keys, four idle variants, and maintenance actions.

- [ ] **Step 2: Implement manifest**

Define a deterministic action map over the 48 existing frames with fps, loop mode, and optional overlay image.

- [ ] **Step 3: Run manifest test**

Run: `node --test cockpit/src/lib/mascotAnimationManifest.test.js`

### Task 2: Sprite Stage

**Files:**
- Create: `cockpit/src/components/MascotSpriteStage.jsx`
- Create: `cockpit/src/components/MascotSpriteStage.css`
- Create: `cockpit/src/components/MascotSpriteStage.test.js`

**Interfaces:**
- Consumes: `getMascotAnimation(action, options)`
- Produces: `<MascotSpriteStage action analysisActive context label />`

- [ ] **Step 1: Write failing component tests**

Assert the stage imports the manifest, uses sprite CSS variables, exposes `data-action`, includes reduced-motion support, and does not import Three/GLB.

- [ ] **Step 2: Implement component**

Use `requestAnimationFrame` to advance integer frame indexes. Render the sprite sheet as a background layer and optional laptop/static accent layer.

- [ ] **Step 3: Run component test**

Run: `node --test cockpit/src/components/MascotSpriteStage.test.js`

### Task 3: Product Integration

**Files:**
- Modify: `cockpit/src/components/AIAnalysisWidget.jsx`
- Modify: `cockpit/src/components/AIAnalysisWidget.css`
- Modify: `cockpit/src/components/AIAnalysisWidget.test.js`
- Modify: `cockpit/src/App.jsx`

**Interfaces:**
- Consumes: `<MascotSpriteStage />`
- Produces: maintenance context action mapping for the sidebar AI mascot.

- [ ] **Step 1: Update failing integration tests**

Assert `AIAnalysisWidget` imports `MascotSpriteStage`, passes approved action/context props, and no longer blocks sprite asset references.

- [ ] **Step 2: Replace 3D stage integration**

Swap `Mascot3DStage` for `MascotSpriteStage`. Add `context={maintenanceMode ? 'maintenance' : 'dashboard'}` from `App.jsx`.

- [ ] **Step 3: Run integration test**

Run: `node --test cockpit/src/components/AIAnalysisWidget.test.js`

### Task 4: Verification

**Files:**
- Test/build only.

- [ ] **Step 1: Run focused tests**

Run: `node --test cockpit/src/lib/mascotAnimationManifest.test.js cockpit/src/components/MascotSpriteStage.test.js cockpit/src/components/AIAnalysisWidget.test.js`

- [ ] **Step 2: Build**

Run: `pnpm --dir cockpit build`

- [ ] **Step 3: Browser check**

Start Vite, open the page, verify `.mascot-sprite-stage` is visible, the canvas/GLB path is absent, and the mascot remains inside the sidebar card.
