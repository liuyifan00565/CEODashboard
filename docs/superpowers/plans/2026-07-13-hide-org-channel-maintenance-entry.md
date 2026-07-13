# Hide Organization and Channel Maintenance Entries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the organization-maintenance and channel-maintenance sidebar entries while keeping both pages, APIs, metadata, and data structures available for later restoration.

**Architecture:** Treat `MAINTENANCE_MENU` as the only visibility boundary. Lock the two-entry sidebar contract in the existing data regression test, then remove only the two menu objects; leave `getMaintenancePageMeta()` and all maintenance datasets unchanged.

**Tech Stack:** React, JavaScript ES modules, Node.js built-in test runner, oxlint, Vite.

## Global Constraints

- The data-maintenance sidebar must show only `目标维护` and `成本维护`, in that order.
- `org-maintenance` and `channel-maintenance` metadata, page components, import/export behavior, save behavior, APIs, and data models must remain intact.
- Do not change maintenance layout, glass styling, routes, API handlers, or database logic.
- Add the 2026-07-13 update time and change summary at the top of every modified source or test file.
- Do not stage or modify `cockpit/server/dashboardData.js`, `cockpit/server/dashboardData.test.js`, `.claude/`, or `CEODashboard_database_package_20260706_131035/`.
- Inspect `git status` before editing, before committing, and after committing.

---

### Task 1: Lock and implement the two-entry maintenance sidebar

**Files:**
- Modify: `cockpit/src/data/channelViews.test.js:1-165`
- Modify: `cockpit/src/data/mock.js:1-990`

**Interfaces:**
- Consumes: `MAINTENANCE_MENU`, an exported array of `{ key: string, name: string, icon: string }` objects.
- Produces: `MAINTENANCE_MENU` containing only target and cost maintenance entries; `getMaintenancePageMeta('org-maintenance')` and `getMaintenancePageMeta('channel-maintenance')` remain unchanged and callable.

- [ ] **Step 1: Confirm the worktree boundary**

Run from `C:\Users\10185\Desktop\CEODashboard2`:

```powershell
git status --short --branch
```

Expected: note any unrelated changes and keep them out of this task.

- [ ] **Step 2: Write the failing sidebar regression test**

At the top of `cockpit/src/data/channelViews.test.js`, add:

```js
/*
 更新时间: 2026-07-13 16:03:26 CST
 更新内容: 回归测试隐藏数据维护侧边栏的组织维护与渠道维护入口，同时确认两个页面的元数据继续保留。
*/
```

Replace the four-entry menu test with:

```js
test('defines only target and cost entries in the data maintenance sidebar', () => {
  assert.deepEqual(
    MAINTENANCE_MENU.map((item) => item.name),
    ['目标维护', '成本维护']
  );
  assert.deepEqual(
    MAINTENANCE_MENU.map((item) => item.key),
    ['target-maintenance', 'cost-maintenance']
  );
  assert.deepEqual(
    MAINTENANCE_MENU.map((item) => item.icon),
    ['target', 'cost']
  );
  assert.deepEqual(
    MENU.map((item) => item.name),
    ['经营总览', '算力用量分析']
  );
});
```

Replace the metadata test with a test that does not derive expected pages from the visible menu:

```js
test('keeps metadata for all four maintenance screens', () => {
  assert.equal(getMaintenancePageMeta('target-maintenance').title, '目标维护');
  assert.equal(getMaintenancePageMeta('cost-maintenance').title, '成本维护');
  assert.equal(getMaintenancePageMeta('org-maintenance').title, '组织维护');
  assert.equal(getMaintenancePageMeta('channel-maintenance').title, '渠道维护');
  assert.equal(getMaintenancePageMeta('target-maintenance').scope, '所有部门');
  assert.equal(getMaintenancePageMeta('cost-maintenance').scope, '全部渠道');
  assert.equal(getMaintenancePageMeta('org-maintenance').scope, 'BI销售 21 人 / 卫瓴人员 28 人');
  assert.equal(getMaintenancePageMeta('channel-maintenance').scope, '卫瓴线索来源字典');
  assert.equal(getMaintenancePageMeta('unknown').title, '目标维护');
});
```

- [ ] **Step 3: Run the test and verify the expected failure**

Run:

```powershell
Set-Location cockpit
node --test src/data/channelViews.test.js
```

Expected: the sidebar test fails because `MAINTENANCE_MENU` still contains organization and channel entries; the metadata test passes.

- [ ] **Step 4: Apply the minimal menu implementation**

At the top of `cockpit/src/data/mock.js`, add:

```js
/*
 更新时间: 2026-07-13 16:03:26 CST
 更新内容: 隐藏数据维护侧边栏的组织维护与渠道维护入口，保留两个页面及其数据和接口能力。
*/
```

Change only the menu export to:

```js
export const MAINTENANCE_MENU = [
  { key: 'target-maintenance', name: '目标维护', icon: 'target' },
  { key: 'cost-maintenance', name: '成本维护', icon: 'cost' },
];
```

Do not remove or edit the `org-maintenance` and `channel-maintenance` entries inside the page metadata map.

- [ ] **Step 5: Run focused and static verification**

Run from `cockpit`:

```powershell
node --test src/data/channelViews.test.js
npm.cmd run lint
npm.cmd run build
```

Expected: the focused test reports zero failures, lint exits with code 0, and Vite completes the production build. Existing warnings may be reported separately but no new errors are allowed.

- [ ] **Step 6: Verify the local page behavior**

Open `http://127.0.0.1:5174/`, enter data maintenance, and verify:

```text
Visible sidebar entries: 目标维护, 成本维护
Hidden sidebar entries: 组织维护, 渠道维护
Target maintenance opens successfully.
Cost maintenance opens successfully.
Browser console has no new error.
```

Because this change only affects Vite-loaded frontend source, refresh the local page; no Docker restart is required unless the user is viewing a separately containerized static build.

- [ ] **Step 7: Review and commit only task files**

Run from the repository root:

```powershell
git diff --check
git status --short
git diff -- cockpit/src/data/mock.js cockpit/src/data/channelViews.test.js
git add -- cockpit/src/data/mock.js cockpit/src/data/channelViews.test.js docs/superpowers/plans/2026-07-13-hide-org-channel-maintenance-entry.md
git diff --cached --name-status
git commit -m "fix: hide organization and channel maintenance entries" -m "User prompt: 算了，还是隐藏一下组织维护和渠道维护吧"
git status --short --branch
```

Expected: the commit contains only the two code/test files and this plan; unrelated files remain unstaged or untracked.

- [ ] **Step 8: Synchronize according to repository rules**

Fetch both remotes, merge or rebase the current branch only when required, push to both remotes, then verify local and remote hashes:

```powershell
git fetch origin
git fetch ttoswar
git push origin codex/ai-mascot-3d-model
git push ttoswar codex/ai-mascot-3d-model
git fetch origin
git fetch ttoswar
git rev-list --left-right --count HEAD...origin/codex/ai-mascot-3d-model
git rev-list --left-right --count HEAD...ttoswar/codex/ai-mascot-3d-model
```

Expected: both comparisons return `0 0`. If `origin` still returns `Repository not found`, preserve the completed local commit, finish the accessible `ttoswar` synchronization, and report the exact origin blocker without changing the remote URL.
