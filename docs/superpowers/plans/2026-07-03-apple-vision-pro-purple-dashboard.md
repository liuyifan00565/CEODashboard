# Apple Vision Pro Purple Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dashboard visuals with the confirmed cold-purple Apple / Vision Pro style.

**Architecture:** Keep the existing React/Vite dashboard structure. Add a dedicated `ColorBends` background component, route it through `App.jsx`, and centralize the palette in `index.css` plus existing chart/color helpers.

**Tech Stack:** React 19, Vite, ECharts, CSS custom properties, Node test runner.

---

### Task 1: Lock Visual Regression Tests

**Files:**
- Modify: `cockpit/src/RefinedNeonPalette.test.js`
- Modify: `cockpit/src/components/KpiCard.test.js`
- Modify: `cockpit/src/App.layout.test.js`

- [ ] Assert `index.css` exposes the cold-purple tokens: `#7C6CFF`, `#8F86FF`, `#A79CFF`, `#C9C2FF`, `#E7E2FF`, `#9EDCFF`.
- [ ] Assert `App.jsx` imports `ColorBends` and no longer imports or renders `Silk`.
- [ ] Assert recovery half-ring gradients use brand purple pairs and only a small ice-blue accent.
- [ ] Run `npm test -- RefinedNeonPalette KpiCard App.layout` and confirm the new assertions fail before implementation.

### Task 2: Add Color Bends Environment Layer

**Files:**
- Create: `cockpit/src/components/ColorBends/ColorBends.jsx`
- Create: `cockpit/src/components/ColorBends/ColorBends.css`
- Modify: `cockpit/src/App.jsx`
- Modify: `cockpit/src/index.css`

- [ ] Build a full-screen canvas/WebGL ReactBits-style Color Bends component with slow animation and 2-4 cold-purple colors.
- [ ] Render it only as `.color-bends-layer` inside `.bg`, with the CSS opacity controlled at `.58`.
- [ ] Keep `.bg-shade` above it and remove the previous Silk layer import/render.
- [ ] Update `index.css` background comments and tokens to describe Color Bends, deep sea blue-black base, and dark readability mask.

### Task 3: Rebuild Palette And Glass Tokens

**Files:**
- Modify: `cockpit/src/index.css`
- Modify: `cockpit/src/lib/format.js`
- Modify: `cockpit/src/lib/theme.js`

- [ ] Set brand and semantic colors to cold purple/blue-purple/lavender with muted warning pink.
- [ ] Set card glass to `rgba(255,255,255,.05-.09)`, borders to `rgba(255,255,255,.10-.14)`, and shadows to soft blue-black plus subtle inset light.
- [ ] Update progress gradients to `#7C6CFF -> #A79CFF -> #C9C2FF` with a small `#9EDCFF` tail.
- [ ] Keep warning progress gradient as `#F08AC3 -> #F5A4CF`.

### Task 4: Tune Cards, Progress, And Charts

**Files:**
- Modify: `cockpit/src/components/KpiCard.jsx`
- Modify: `cockpit/src/components/KpiCard.css`
- Modify: `cockpit/src/components/VersionFinancePanel.jsx`
- Modify: `cockpit/src/components/VersionFinancePanel.css`
- Modify: `cockpit/src/components/ChannelPanel.css`
- Modify: `cockpit/src/components/OpeningMetricCards.css`
- Modify: `cockpit/src/dashboard.css`

- [ ] Change recovery and version half-ring colors to the approved purple system.
- [ ] Reduce strong glow, keep hover lift subtle, and use a faint blue-purple environmental edge.
- [ ] Keep mini tooltips on the existing glass border/blur/shadow system with a dark readable base.
- [ ] Preserve maintenance page glass rules from `AGENTS.md`.

### Task 5: Verify And Ship

**Files:**
- Test: `cockpit/src/RefinedNeonPalette.test.js`
- Test: `cockpit/src/components/KpiCard.test.js`
- Test: `cockpit/src/App.layout.test.js`

- [ ] Run targeted tests and full `npm test`.
- [ ] Run `npm run build`.
- [ ] If running Docker/Nginx containers are present, refresh or restart the affected frontend service and verify the page loads the new code.
- [ ] Commit only this task's files, then pull and push both `origin` and `ttoswar`, and confirm all three branch tips match.
