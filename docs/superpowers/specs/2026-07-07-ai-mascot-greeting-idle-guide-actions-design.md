<!--
更新时间: 2026-07-07 11:44:14 CST
更新内容: 新增 AI 小人打招呼、待机与点击指引右侧对话框的动作设计规格。
-->

# AI 小人打招呼、待机与指引动作设计规格

## 背景

本次需求来自用户原始提示词：`先做打招呼，待机跟指引吧 指引是当用户点击小人的时候指右边的对话框`，并确认指引动作播放时长为“大约一秒”。

当前 AI 小人由 `AIAnalysisWidget.jsx` 管理交互状态，由 `Mascot3DStage.jsx` 加载 `/models/ai-mascot.glb` 并通过 GLB 控制节点实时驱动动作。现有动作包括 `idle`、`wave`、`talk`、`think`、`alert`、`celebrate` 和 `click`，点击小人已经会打开或收起 AI 经营分析对话框。

## 目标

让 AI 小人先具备三个明确可感知的助手动作：

- 打招呼：悬停或问候时右手挥动，头部轻微响应。
- 待机：不打扰页面，保持轻微浮动、呼吸和头部慢摆。
- 指引：用户点击小人打开右侧对话框时，小人短暂指向右侧对话框，约 1 秒后回到打开状态下的说话/待机节奏。

## 采用方案

采用新增 `MASCOT_ACTIONS.guide` 的方案。

这样可以把“点击反馈”和“指引对话框”分开：`click` 继续用于通用点击/弹跳反馈，`guide` 专门表示打开对话框后的短引导动作。后续如果需要指向 KPI 卡片、筛选器或其它区域，也可以复用这个动作语义而不影响点击关闭逻辑。

不采用复用 `click` 的方案，因为会让点击关闭和点击打开的动作语义混在一起。也不采用 CSS 箭头提示，因为本次目标是评测并使用小人的骨骼/控制节点动作能力。

## 动作设计

### 待机 `idle`

保持当前小尺寸入口内的轻微浮动。根节点缓慢上下漂浮，身体有很小的左右摆动，头部根据鼠标位置或时间做低幅度跟随。动作幅度要克制，避免抢占驾驶舱数据视线。

### 打招呼 `wave`

右臂抬起并做 2 到 3 次短摆，身体轻微上浮，头部轻点。这个动作主要用于鼠标悬停和默认问候气泡，不改变对话框打开/关闭逻辑。

### 指引 `guide`

点击小人且即将打开对话框时触发：

- 身体轻微向右侧倾斜。
- 头部朝右侧对话框方向看。
- 右臂抬起并向右侧外展，手部形成“请看这里”的指向感。
- 动作持续约 1000ms，然后自动回到 `talk`，因为对话框打开后 AI 助手进入可交流状态。

点击收起对话框时不播放 `guide`，只保留轻量反馈和收起提示。

## 数据流

1. `AIAnalysisWidget` 仍然拥有 `mascotAction` 状态。
2. 用户点击小人时，先判断 `nextOpen`。
3. 当 `nextOpen === true` 时，调用 `playMascotAction(MASCOT_ACTIONS.guide, 1000, true)` 并打开对话框。
4. 当 `nextOpen === false` 时，保持现有收起逻辑，不触发 `guide`。
5. `Mascot3DStage` 将 `guide` 作为合法动作，并在 `useFrame` 中对 GLB 控制节点施加指向右侧的姿态。
6. 约 1 秒计时结束后，`playMascotAction` 将动作恢复为打开态的 `talk`。

## 实现边界

计划只修改以下文件：

- `cockpit/src/lib/mascotCompanion.js`
- `cockpit/src/lib/mascotCompanion.test.js`
- `cockpit/src/components/AIAnalysisWidget.jsx`
- `cockpit/src/components/AIAnalysisWidget.test.js`
- `cockpit/src/components/Mascot3DStage.jsx`
- `cockpit/src/components/Mascot3DStage.test.js`
- 必要时小范围同步 `cockpit/src/lib/mascotRig.js` 与测试，用于保持旧姿态工具的动作枚举一致。

不修改 AI API、业务指标口径、数据库同步逻辑、Docker 配置、维护页样式和 GLB 模型文件。

## 测试要求

实现前先补测试，至少覆盖：

- `MASCOT_ACTIONS` 包含 `guide`。
- 点击打开 AI 对话框时触发 `MASCOT_ACTIONS.guide`，持续约 `1000` ms。
- 点击关闭 AI 对话框时不触发 `guide`。
- `Mascot3DStage` 将 `guide` 视为合法动作。
- `Mascot3DStage` 中存在 `guide` 对右臂、头部、身体倾斜的控制节点动作。
- 现有 `wave`、`idle`、`talk` 等动作入口不被破坏。

验证命令至少包括：

- `cd cockpit && node --test src/lib/mascotCompanion.test.js`
- `cd cockpit && node --test src/components/AIAnalysisWidget.test.js`
- `cd cockpit && node --test src/components/Mascot3DStage.test.js`
- `cd cockpit && npm run build`

## 验收标准

- 小人待机时稳定、安静、不遮挡页面。
- 悬停小人时能清楚看到打招呼动作。
- 点击小人打开 AI 对话框时，小人向右侧对话框做约 1 秒指引动作。
- 指引结束后，打开状态恢复到说话/交流动作。
- 点击关闭对话框不会出现指向已关闭对话框的动作。
- 构建通过，相关测试通过。

## 自审

- 范围明确：只处理打招呼、待机和点击打开指引三类动作。
- 触发明确：`guide` 只在点击打开对话框时触发，时长约 1000ms。
- 边界明确：不改 GLB 文件、不改业务数据、不改 Docker 和部署脚本。
- 无待定项：当前设计不包含 TBD 或需要二次选择的动作语义。
