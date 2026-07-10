更新时间: 2026-07-10 11:52:07 CST
更新内容: 新增福小客首版经营助手的测试先行实施计划，动作优化和规则雷达不在本计划内。

# 福小客首版经营助手实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让福小客基于当前真实看板快照提供一次事实简报、上下文原因分析、日/月经营报告和页面定位。

**Architecture:** 新增纯函数生成事实简报，`AIAnalysisWidget` 负责一次性展示与快捷命令，`App` 负责定位真实看板区域；现有 `/api/ai/analyze` 继续调用 Qwen，但接收更完整的经营与算力快照。

**Tech Stack:** React 19、Vite 8、Node.js test runner、GSAP、现有通义 DashScope 接口。

## Global Constraints

- 不修改福小客 Sprite、Live2D、动作帧或动作切换逻辑。
- 不新增规则雷达、红黄线、风险阈值或数据库写操作。
- 所有新样式复用 `var(--line-2)`、`var(--glass-shadow)` 和现有透明玻璃体系。
- 每个生产行为先写失败测试，再写最小实现。
- 代码与文档顶部记录本次更新时间和更新内容。

---

### Task 1: 事实简报纯函数

**Files:**
- Create: `cockpit/src/lib/businessBrief.js`
- Create: `cockpit/src/lib/businessBrief.test.js`

**Interfaces:**
- Consumes: `buildBusinessBrief(snapshot)` 的 `snapshot.kpi`、`snapshot.derived`、`snapshot.channels`、`snapshot.versions`。
- Produces: `{ text, facts, primaryAction }`，供 `AIAnalysisWidget` 展示与定位。

- [ ] **Step 1: 写失败测试**

覆盖真实字段生成简报、缺失字段降级、渠道按回款排序、版本按套数排序。

- [ ] **Step 2: 验证测试因缺少模块失败**

Run: `node --test src/lib/businessBrief.test.js`
Expected: FAIL，提示找不到 `businessBrief.js`。

- [ ] **Step 3: 写最小实现**

实现数值校验、中文金额格式、事实片段拼接和定位目标输出，不加入风险判断。

- [ ] **Step 4: 验证通过**

Run: `node --test src/lib/businessBrief.test.js`
Expected: PASS。

### Task 2: 一次性简报与报告快捷入口

**Files:**
- Modify: `cockpit/src/components/AIAnalysisWidget.jsx`
- Modify: `cockpit/src/components/AIAnalysisWidget.css`
- Modify: `cockpit/src/components/AIAnalysisWidget.test.js`

**Interfaces:**
- Consumes: `buildBusinessBrief(snapshot)` 与 `onNavigateInsight(target)`。
- Produces: 会话内一次事实气泡、日度简报/月度报告/渠道版本/业绩算力快捷问题、页面定位按钮。

- [ ] **Step 1: 写失败集成测试**

要求组件导入 `buildBusinessBrief`、使用 `sessionStorage` 去重、移除 10 秒闲聊 interval、渲染报告和定位命令。

- [ ] **Step 2: 验证测试按预期失败**

Run: `node --test src/components/AIAnalysisWidget.test.js`
Expected: FAIL，缺少事实简报和快捷命令。

- [ ] **Step 3: 写最小组件实现**

在 dashboard context 中延迟展示一次简报；维护页不主动展示；保留现有流式问答、悬浮提示与小人动作调用。

- [ ] **Step 4: 验证组件测试通过**

Run: `node --test src/components/AIAnalysisWidget.test.js`
Expected: PASS。

### Task 3: 看板定位与下钻

**Files:**
- Modify: `cockpit/src/App.jsx`
- Modify: `cockpit/src/dashboard.css`
- Modify: `cockpit/src/App.layout.test.js`

**Interfaces:**
- Consumes: `onNavigateInsight(target)` 的 `performance|channels|trend|versions|compute`。
- Produces: 平滑滚动、短暂焦点样式和算力页面切换。

- [ ] **Step 1: 写失败布局测试**

要求 App 提供目标选择器映射、传入 `onNavigateInsight`，并使用 `scrollIntoView({ behavior: 'smooth' })`。

- [ ] **Step 2: 验证测试按预期失败**

Run: `node --test src/App.layout.test.js`
Expected: FAIL，缺少 AI 定位回调。

- [ ] **Step 3: 写最小定位实现**

为现有区域补充稳定 `data-ai-insight-target` 标记；定位时添加并移除 `ai-insight-focus` 类；算力目标调用现有菜单切换。

- [ ] **Step 4: 验证布局测试通过**

Run: `node --test src/App.layout.test.js`
Expected: PASS。

### Task 4: AI 分析边界与文档同步

**Files:**
- Modify: `cockpit/server/dashscope.js`
- Create: `cockpit/server/dashscope.test.js`
- Modify: `cockpit/README.md`
- Modify: `doc/ai-mascot-business-assistant-design.md`

**Interfaces:**
- Consumes: 扩展后的页面快照与四类快捷问题。
- Produces: 区分事实、可能原因、数据缺口的 Qwen 提示约束。

- [ ] **Step 1: 写失败提示词测试**

验证系统提示包含“可能原因”“数据不足”“不得把相关性写成因果”和日/月报告结构要求。

- [ ] **Step 2: 验证测试按预期失败**

Run: `node --test server/dashscope.test.js`
Expected: FAIL，现有系统提示缺少上述约束。

- [ ] **Step 3: 更新系统提示和说明文档**

保留现有流式接口和模型配置，只收紧输出边界并记录首版功能。

- [ ] **Step 4: 运行完整校验**

Run: `node --test src/lib/businessBrief.test.js src/components/AIAnalysisWidget.test.js src/App.layout.test.js server/dashscope.test.js`
Expected: PASS。

Run: `npm run lint`
Expected: PASS。

Run: `npm run build`
Expected: PASS。

### Task 5: 运行态验证与交付

**Files:**
- Verify only.

**Interfaces:**
- Consumes: 已构建前端和当前 MySQL 快照。
- Produces: 页面、AI 接口与两个 Git 远端的一致提交。

- [ ] **Step 1: 重启受影响的运行服务并验证接口**

确认当前运行方式后重启对应前端/Node 服务，验证 `/api/dashboard-data` 与 `/api/ai/analyze`。

- [ ] **Step 2: 浏览器验证**

检查一次性简报、快捷报告、定位滚动、算力跳转，以及桌面/移动端无重叠。

- [ ] **Step 3: Git 提交与双远端同步**

只暂存本任务文件；提交说明包含用户原始提示词；拉取、推送并复核 `origin` 与 `ttoswar` 当前分支一致。

## Execution Selection

用户已明确要求在当前会话直接实现，采用 Inline Execution。
