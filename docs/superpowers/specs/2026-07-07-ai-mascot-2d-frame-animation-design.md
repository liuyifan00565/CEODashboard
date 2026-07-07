更新时间: 2026-07-07 14:03:53 CST
更新内容: 新增 AI 小人从 3D GLB 切回 2D 帧动画的第一期产品闭环设计。

# AI Mascot 2D Frame Animation Design

## Goal

Replace the current GLB-based mascot with a deterministic 2D frame animation system based on these approved project assets:

- `cockpit/public/ai-mascot-analysis-laptop.png`
- `cockpit/public/ai-mascot-sprite.png`
- `cockpit/public/ai-mascot-transparent.png`
- `cockpit/public/favicon.svg`
- `cockpit/public/icons.svg`
- `cockpit/public/logo-black.png`

The first implementation phase must be visible in the product: sidebar mascot entry, click-to-open AI dialog, AI conversation states, data-maintenance guidance, and at least four idle loops.

## Approved Scope

Phase 1 uses the existing `ai-mascot-sprite.png` as the primary motion source. The sheet is treated as a 12-column by 4-row sprite sheet with 48 transparent frames. The full-resolution transparent mascot is the high-quality fallback/brand anchor, and the laptop mascot is used for analysis and data-maintenance states.

The system must support these actions from the first pass:

- `idle`, plus four named idle variants: breathe, look, bounce, patrol
- `wave`
- `guide`
- `talk`
- `think`
- `alert`
- `celebrate`
- `click`
- `maintenance`
- `maintenanceSave`
- `maintenanceReview`

## Architecture

Create a focused 2D stage component instead of continuing the 3D pipeline:

- `src/lib/mascotAnimationManifest.js` defines frame geometry, action loops, fps, priority, fallback images, and idle rotation rules.
- `src/components/MascotSpriteStage.jsx` renders the mascot as image/sprite layers with CSS-variable driven background positioning.
- `src/components/MascotSpriteStage.css` owns visual polish: stable bounds, drop shadow, interpolation, reduced-motion fallback, and high-DPI rendering.
- `AIAnalysisWidget.jsx` continues to own product state and passes only `action`, `analysisActive`, and `context`.

The current `Mascot3DStage` route should be removed from the AI launcher. GLB conversion scripts can remain in the repository for history, but no runtime path should load the GLB mascot for this launcher.

## Motion Quality Rules

- The mascot must not move outside the sidebar card bounds during idle or conversation.
- Sprite frame timing should use 24 fps for active actions and 12-18 fps for calm idle loops.
- Each action must have a deterministic frame sequence with explicit duration and `loop` behavior.
- Idle mode should rotate through four variants without requiring mouse movement.
- `prefers-reduced-motion` must fall back to one stable frame or a slow opacity/scale cue.
- Frame rendering must use `steps(1)` or explicit JS frame indexing, never blurred CSS background interpolation.

## Product Triggers

- Sidebar idle: rotate four idle variants.
- Click mascot while closed: play `guide` for about one second, open the dialog, then settle into `talk`.
- Click mascot while open: play `click`, close the dialog, then return to idle.
- AI request pending: play `think`.
- AI stream/talk: play `talk`.
- AI error: play `alert`.
- KPI positive cue: play `celebrate`.
- Data-maintenance mode: play `maintenance` as the resting action; save/review hooks can map to `maintenanceSave` and `maintenanceReview` as the page exposes those events.

## Testing

Tests should assert:

- Runtime launcher imports `MascotSpriteStage`, not `Mascot3DStage`.
- The sprite manifest declares 12 columns, 4 rows, 48 total frames, and all required action names.
- At least four idle variants exist.
- The launcher references only approved project image assets.
- Maintenance mode maps to a maintenance action.
- Reduced-motion CSS exists for the sprite stage.

## Delivery Notes

This phase intentionally does not promise hundreds of hand-painted new PNGs. It creates a production-grade frame animation system that can absorb future hand-cut frames without changing product code. New manually drawn frame sheets can replace or extend the manifest action by action.
