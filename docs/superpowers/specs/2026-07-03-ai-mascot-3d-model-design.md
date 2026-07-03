<!--
更新时间: 2026-07-03 18:01:05 CST
更新内容: 新增 AI 小人建模设计规格，确认采用页面内 Three.js 可动 3D 福小客方案。
-->

# AI 小人 3D 建模设计规格

## 背景

本次需求来自用户原始提示词：`对ai小人进行建模`。

当前驾驶舱左下角的 AI 小人是福小客经营助手，入口由 `AIAnalysisWidget.jsx` 渲染，视觉舞台由 `Mascot3DStage.jsx` 提供。现状已经接入 `@react-three/fiber`、`three` 和 `@react-three/drei`，但主体仍是透明 PNG 平面叠加 DOM 图片栈，`mascotRig.js` 只提供骨骼姿态数据，没有真正渲染为分部件 3D 模型。

用户已确认采用 A 方案：在现有页面内直接做一个可动的 Three.js 3D 福小客。

## 目标

把左下角福小客从图片式 2.5D 舞台升级为页面内实时渲染的轻量 3D 模型，让它在保留原 mascot 识别度的同时，能响应现有 AI 助手动作状态。

建模后应满足：

- 第一眼仍是当前紫蓝头盔、耳机、圆脸、白色机身、胸口 AI 徽章的福小客。
- `idle`、`wave`、`think`、`talk`、`alert`、`celebrate`、`click` 动作继续由现有 `MASCOT_ACTIONS` 驱动。
- 入口仍保持当前小尺寸，不压迫侧栏，不改变 AI 对话框打开/关闭逻辑。
- 视觉继续贴合项目深色玻璃体系，使用紫蓝高光和柔和发光，不引入跳脱颜色或新风格角色。

## 方案选择

### 采用方案：页面内 Three.js 分部件模型

在 `Mascot3DStage.jsx` 中用 Three.js 基础几何体和材质组合福小客模型，拆分为头盔、透明罩、脸部、耳机、麦克风、身体、手臂、腿、脚、胸口 AI 徽章和发光线条。每个主要肢体挂在独立 group 上，读取 `getMascotRigPose()` 的对应骨骼旋转和位置，形成轻量骨骼动画。

这个方案最适合当前项目，因为仓库已经有 R3F 依赖和动作状态，也能避免引入外部建模软件、GLB 生成链路和资源管理成本。

### 不采用方案：独立 GLB 模型

GLB 更标准，但当前项目没有 Blender、导出、压缩、贴图和模型版本管理流程。为了一个左下角入口引入完整资产管线成本过高，后续如需要高精度模型再扩展。

### 不采用方案：继续增强 2.5D 图片

只增强图片动效最快，但无法满足“建模”的核心诉求，也无法充分复用已有 `mascotRig` 骨骼姿态。

## 模型结构

模型采用一个 `MascotModel` 根组件，内部拆成清晰子组件：

- `MascotHead`: 圆润头盔、透明玻璃罩、脸部底色、眼睛、嘴和脸颊。
- `MascotHeadset`: 左右耳机、耳机外圈、麦克风支架和麦克风头。
- `MascotBody`: 白色圆润躯干、紫色领口、胸口 AI 徽章。
- `MascotArm`: 左右肩、上臂、前臂和手套。
- `MascotLeg`: 左右腿和紫色脚底。
- `MascotSuitLines`: 胸部、手臂和腿部的浅蓝发光线条。
- `MascotGlow`: 低强度轮廓光和底部柔和阴影。

所有形状优先使用 `sphereGeometry`、`capsuleGeometry`、`boxGeometry`、`torusGeometry`、`cylinderGeometry` 和少量 `Text`，避免手写 SVG 或额外图片资产。材质使用 `meshStandardMaterial`、`meshPhysicalMaterial` 和项目现有紫蓝色系。

## 动作与数据流

数据流保持现有入口不变：

1. `AIAnalysisWidget` 根据悬停、点击、打开、加载、回答和报错状态设置 `mascotAction`。
2. `Mascot3DStage` 接收 `action`、`pointer`、`analysisActive`。
3. `MascotPuppet` 在 `useFrame` 中读取 `getMascotRigPose(action, time)`。
4. `MascotModel` 将骨骼姿态映射到头、身体、左右手臂、左右腿和麦克风的 group rotation。
5. pointer 输入继续控制模型轻微看向鼠标、浮动和倾斜。

动作语义：

- `idle`: 微浮动、轻微眨眼、头部慢速摆动。
- `wave`: 右手抬起挥手，头部轻微点头。
- `think`: 头部偏转，右手靠近脸部，发光线条变慢。
- `talk`: 头、手臂和嘴部轻微循环动作。
- `alert`: 身体前倾、双手打开、警示暖色边缘光短暂增强。
- `celebrate`: 双手上举、身体弹跳，保持正面朝向。
- `click`: 快速弹跳反馈，然后回到打开或闲置状态。

## 视觉要求

- 保留原福小客比例：大头盔、小身体、短手短腿，入口整体仍可爱但不幼稚。
- 主色控制在紫、蓝紫、冰蓝和白色；警示状态只允许少量柔和红粉边缘光。
- 透明头盔需要有玻璃高光和外沿，不做大面积纯紫实心块。
- 模型必须正面可读，不做 360 度持续旋转。
- 小尺寸下眼睛、嘴、耳机、胸口 AI 徽章仍能看清。
- Stage 保持透明背景，继续由现有 `.mascot-3d-stage` 尺寸和阴影承载，不新增不一致的卡片或按钮样式。

## 实现边界

本次只改 AI 小人舞台和相关测试：

- `cockpit/src/components/Mascot3DStage.jsx`
- `cockpit/src/components/Mascot3DStage.css`
- `cockpit/src/components/Mascot3DStage.test.js`
- 必要时小范围调整 `cockpit/src/lib/mascotRig.js` 和 `cockpit/src/lib/mascotRig.test.js`
- 必要时同步 `cockpit/src/components/AIAnalysisWidget.test.js` 中对舞台结构的断言

不改 AI 分析接口、不改业务数据、不改 KPI 计算、不改 Docker 配置、不改维护页样式。

## 降级与性能

Canvas 仍使用透明背景和正交相机。模型只使用基础几何体，避免高面数和外部纹理加载。对于 `prefers-reduced-motion: reduce`，保留静态姿态或明显降低动作幅度。

如果 WebGL 初始化失败，应保留可见的静态替代：优先显示现有 `ai-mascot-transparent.png`，保证入口不会空白。

## 测试要求

实现前先补测试，覆盖以下行为：

- `Mascot3DStage.jsx` 不再依赖 DOM 图片栈作为主要可见小人。
- 舞台包含真实分部件模型组件，例如 `MascotHead`、`MascotBody`、`MascotArm`、`MascotLeg`。
- `MascotPuppet` 使用 `getMascotRigPose(action, t)` 驱动模型姿态。
- 仍保留透明 PNG 作为 WebGL 降级资产，而不是主要渲染路径。
- CSS 保持当前小尺寸、透明背景和现有发光强度，不新增外层卡片样式。
- `mascotRig` 继续保证固定正面朝向，动作不引入整圈旋转。

验证命令至少包括：

- `npm test -- Mascot3DStage.test.js`
- `npm test -- mascotRig.test.js`
- `npm test -- AIAnalysisWidget.test.js`
- `npm run build`

## 验收标准

- 左下角 AI 小人入口在桌面和移动端都可见、尺寸稳定、无布局跳动。
- 闲置、悬停、点击、打开对话、加载分析、回答、报错等状态都能触发对应 3D 动作。
- 模型不是单张 PNG 平面，也不是只靠 DOM 图片切换动作。
- 颜色、发光、阴影和整体风格与当前 CEO 驾驶舱一致。
- 构建通过，相关测试通过。
