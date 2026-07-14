# Data Maintenance Update Monitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only data maintenance board showing whether each dataset group has fresh daily or monthly business data.

**Architecture:** Add a small server module that computes freshness rows from MySQL metadata queries and expose it through the existing maintenance data endpoint. Add a read-only renderer inside the existing MaintenancePage shell and hide write/import controls for the new page.

**Tech Stack:** React + Vite frontend, Node.js server handlers, mysql2 promise connections, node:test regression tests.

## Global Constraints

- Keep the page read-only: no save, import, or template actions.
- Use business dates (`stat_date` / `year_month`) as freshness source; do not add sync-log tables.
- Update `/docs` markdown when changing data-sync or API-read logic.
- Commit only files related to this task, and include the original user prompt in the commit message.

---

### Task 1: Backend Freshness Snapshot

**Files:**
- Create: `cockpit/server/maintenanceUpdateMonitor.js`
- Modify: `cockpit/server/maintenanceData.js`
- Test: `cockpit/server/maintenanceUpdateMonitor.test.js`

**Interfaces:**
- Produces: `buildUpdateMonitorSnapshot(connection, { year, now }) => Promise<{ checkedAt, today, currentMonth, summary, groups }>`
- Consumes: `queryRows(connection, sql, params)` from `cockpit/server/db.js`

- [x] **Step 1: Write failing tests**

Add tests that fake `connection.execute` and assert:

```js
const snapshot = await buildUpdateMonitorSnapshot(connection, { year: 2026, now: new Date('2026-07-14T02:00:00Z') });
assert.equal(snapshot.groups.find((g) => g.key === 'revenue').status, 'updated');
assert.equal(snapshot.groups.find((g) => g.key === 'target').status, 'current_month');
assert.equal(snapshot.groups.find((g) => g.key === 'opening').status, 'stale');
assert.equal(snapshot.groups.find((g) => g.key === 'delivery').status, 'empty');
```

- [x] **Step 2: Run failing tests**

Run: `node --test server/maintenanceUpdateMonitor.test.js`

Expected: fail because `maintenanceUpdateMonitor.js` does not exist.

- [x] **Step 3: Implement server module**

Create data-group definitions, query latest business date/month and count, map to status, and compute summary counts.

- [x] **Step 4: Register maintenance reader**

Add `'update-monitor-maintenance': (conn, year) => buildUpdateMonitorSnapshot(conn, { year })` to `READERS` in `maintenanceData.js`.

- [x] **Step 5: Run backend tests**

Run: `node --test server/maintenanceUpdateMonitor.test.js server/maintenanceData.test.js`

Expected: all pass.

### Task 2: Frontend Read-Only Maintenance Page

**Files:**
- Modify: `cockpit/src/data/mock.js`
- Modify: `cockpit/src/data/maintenanceLiveData.js`
- Modify: `cockpit/src/components/MaintenancePage.jsx`
- Modify: `cockpit/src/components/MaintenancePage.css`
- Test: `cockpit/src/App.layout.test.js`

**Interfaces:**
- Consumes: snapshot data shape from Task 1 as `data.groups`, `data.summary`, `data.checkedAt`.
- Produces: new menu item `{ key: 'update-monitor-maintenance', name: '数据更新看板', icon: 'monitor' }`.

- [x] **Step 1: Write failing frontend assertions**

Add source assertions that check the new menu key, renderer, readonly toolbar branch, and status class mapping.

- [x] **Step 2: Run failing frontend test**

Run: `node --test src/App.layout.test.js`

Expected: fail because the new menu/page is absent.

- [x] **Step 3: Add menu and metadata**

Add the new maintenance menu item and `getMaintenancePageMeta` entry.

- [x] **Step 4: Add read-only renderer**

Create `UpdateMonitorMaintenancePage` inside `MaintenancePage.jsx`, render selectable summary tiles, refresh-age text, and a table, and return an empty `collect()`.

- [x] **Step 5: Hide write actions**

Make `MaintenanceToolbar` hide save/import/download for `update-monitor-maintenance`.

- [x] **Step 6: Style monitor page**

Add glass-friendly selectable summary tiles, right-aligned filter checkboxes, status pills, left-aligned data-group secondary text, and table spacing in `MaintenancePage.css`.

- [x] **Step 7: Run frontend test**

Run: `node --test src/App.layout.test.js`

Expected: pass.

### Task 3: Docs, Verification, Commit

**Files:**
- Modify: `docs/dashboard-data-aggregation.md`

**Interfaces:**
- Consumes: final feature behavior from Tasks 1 and 2.
- Produces: documented freshness rules.

- [x] **Step 1: Update docs**

Add a dated note describing the new data update monitor and its daily/monthly freshness rules.

- [x] **Step 2: Run focused tests**

Run: `node --test server/maintenanceUpdateMonitor.test.js server/maintenanceData.test.js src/App.layout.test.js`

Expected: all pass.

- [x] **Step 3: Run build**

Run: `npm run build`

Expected: build exits 0.

- [x] **Step 4: Verify API**

Run: `curl -sS -i 'http://localhost:5174/api/maintenance/data?page=update-monitor-maintenance&year=2026' | sed -n '1,20p'`

Expected: HTTP 200 with JSON payload.

- [ ] **Step 5: Commit**

Run: `git status --short --branch`, stage only task files, and commit with the original user prompt in the body.
