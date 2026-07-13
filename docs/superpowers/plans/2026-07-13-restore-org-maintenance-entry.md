<!--
更新时间: 2026-07-13 15:08:41 CST
更新内容: 新增永久恢复数据维护侧边栏“组织维护”入口的 TDD 实施计划。
-->

# 恢复组织维护入口实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 永久恢复数据维护侧边栏中的“组织维护”入口，并锁定四个维护入口的顺序和元数据。

**Architecture:** 保留现有 `App.jsx -> MaintenancePage.jsx -> OrgMaintenancePage` 数据流，只修改 `MAINTENANCE_MENU` 的静态菜单定义。通过现有 Node 回归测试先证明入口缺失，再实施最小菜单改动。

**Tech Stack:** React 19、Vite 8、Node.js `node:test`、ES Modules。

## Global Constraints

- 菜单顺序固定为：目标维护、成本维护、组织维护、渠道维护。
- 不修改组织维护页面布局、CSS、数据库、接口、导入或保存逻辑。
- 所有改动文件顶部增加 2026-07-13 的更新说明。
- 只提交本任务文件，不包含工作区既有无关改动。
- 提交说明包含用户原始提示词。

---

### Task 1: 永久恢复组织维护菜单入口

**Files:**
- Create: `docs/superpowers/plans/2026-07-13-restore-org-maintenance-entry.md`
- Modify: `cockpit/src/data/channelViews.test.js:1-170`
- Modify: `cockpit/src/data/mock.js:1-990`

**Interfaces:**
- Consumes: `MAINTENANCE_MENU` 数组及现有 `{ key, name, icon }` 菜单项结构。
- Produces: 包含 `org-maintenance` 的四项 `MAINTENANCE_MENU`，供 `App.jsx` 现有侧边栏映射直接使用。

- [ ] **Step 1: 写入失败回归测试**

把 `channelViews.test.js` 中菜单断言改为：

```js
assert.deepEqual(
  MAINTENANCE_MENU.map((item) => item.name),
  ['目标维护', '成本维护', '组织维护', '渠道维护']
);
assert.deepEqual(
  MAINTENANCE_MENU.map((item) => item.key),
  ['target-maintenance', 'cost-maintenance', 'org-maintenance', 'channel-maintenance']
);
assert.deepEqual(
  MAINTENANCE_MENU.map((item) => item.icon),
  ['target', 'cost', 'organization', 'channel']
);
```

同时把页面元数据顺序断言改为四项：

```js
assert.deepEqual(
  MAINTENANCE_MENU.map((item) => getMaintenancePageMeta(item.key).title),
  ['目标维护', '成本维护', '组织维护', '渠道维护']
);
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run: `node --test src/data/channelViews.test.js`

Expected: FAIL，差异显示实际菜单仍缺少 `组织维护`、`org-maintenance` 和 `organization`。

- [ ] **Step 3: 实施最小菜单改动**

删除：

```js
const ORG_MAINTENANCE_VISIBLE = false;
```

把条件展开项替换为永久菜单项：

```js
{ key: 'org-maintenance', name: '组织维护', icon: 'organization' },
```

- [ ] **Step 4: 运行相关验证**

Run: `node --test src/data/channelViews.test.js src/App.layout.test.js`

Expected: PASS，0 failures。

Run: `npm run lint`

Expected: exit code 0。

Run: `npm run build`

Expected: exit code 0，并成功生成 Vite production build。

- [ ] **Step 5: 验证运行页面**

打开 `http://127.0.0.1:5174/`，进入数据维护。

Expected: 侧边栏按“目标维护、成本维护、组织维护、渠道维护”显示；点击“组织维护”后真实部门和人员数据正常加载。

- [ ] **Step 6: 提交本任务文件**

```bash
git add docs/superpowers/plans/2026-07-13-restore-org-maintenance-entry.md cockpit/src/data/channelViews.test.js cockpit/src/data/mock.js
git commit -m "fix: restore organization maintenance entry" -m "User prompt: 我的数据维护那里不是有组织维护吗，之前好像是不是隐藏了，你给我看一下帮我把他显现出来" -m "Approval prompt: 可以，方案1吧；可以，进行代码修改了吧"
```
