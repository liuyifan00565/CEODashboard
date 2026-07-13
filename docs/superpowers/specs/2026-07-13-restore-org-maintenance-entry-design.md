<!--
更新时间: 2026-07-13 15:03:45 CST
更新内容: 明确永久恢复数据维护侧边栏“组织维护”入口的最小改动范围、验证标准和不变项。
-->

# 恢复组织维护入口设计

## 背景

`组织维护` 页面、真实数据库读取接口、Excel 导入和页内保存逻辑仍然存在。当前入口不可见，是因为 `cockpit/src/data/mock.js` 中的临时常量 `ORG_MAINTENANCE_VISIBLE` 被设置为 `false`，导致 `MAINTENANCE_MENU` 构建时过滤了 `org-maintenance`。

本次需求是重新显示组织维护入口，并取消这层临时隐藏逻辑。

## 采用方案

采用永久恢复方案：

- 删除 `ORG_MAINTENANCE_VISIBLE` 临时开关。
- 在 `MAINTENANCE_MENU` 中直接恢复 `{ key: 'org-maintenance', name: '组织维护', icon: 'organization' }`。
- 菜单顺序保持为：目标维护、成本维护、组织维护、渠道维护。
- 更新 `cockpit/src/data/channelViews.test.js`，回归锁定四个入口及其名称、键、图标和页面元数据顺序。

不采用仅把开关改为 `true` 的方案，因为需求已经确认永久恢复，继续保留临时开关会留下无用分支。

## 不变范围

本次不修改：

- `OrgMaintenancePage` 的页面布局和透明玻璃样式。
- 组织和人员字段、数据库表结构或数据。
- `/api/maintenance/data?page=org-maintenance` 读取逻辑。
- `/api/maintenance/save` 组织保存逻辑。
- 组织维护 Excel 模板和导入逻辑。
- 其它三个维护页的菜单、页面或业务口径。

## 数据流

恢复后的入口继续沿用现有链路：

1. `MAINTENANCE_MENU` 向侧边栏提供 `org-maintenance` 菜单项。
2. 用户点击后，`App.jsx` 将 `activeMaintenanceMenu` 切换为 `org-maintenance`。
3. `MaintenancePage.jsx` 选择现有 `OrgMaintenancePage` 渲染器。
4. 页面调用现有组织维护读接口，展示真实部门和人员数据。

不新增新的状态、接口或条件分支。

## 错误处理

沿用组织维护页面现有的加载与保存错误提示。本次仅恢复入口，不改变错误处理行为。

## 测试与验收

按测试驱动顺序实施：

1. 先把菜单回归测试改为期望四个维护入口，并确认测试因当前入口仍隐藏而失败。
2. 再删除隐藏开关并恢复菜单项，确认相关测试通过。
3. 运行前端相关测试、lint 和 build。
4. 在本地运行页面中进入数据维护，确认侧边栏出现“组织维护”。
5. 点击入口，确认组织维护页面成功加载真实部门和人员数据，浏览器控制台无新增错误。

验收标准：

- 数据维护侧边栏按既定顺序显示四个入口。
- “组织维护”点击后进入现有组织维护页面。
- 组织维护真实接口正常返回并在页面展示。
- 其它维护入口和现有测试不受影响。
