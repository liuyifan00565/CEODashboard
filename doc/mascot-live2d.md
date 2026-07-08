更新时间: 2026-07-08 19:31:00 CST
更新内容: 补充开发环境官方 Haru 样例回退，用于福小客正式 Live2D 模型到位前验证渲染链路。

更新时间: 2026-07-08 18:55:00 CST
更新内容: 新增左下角福小客 Live2D 可选渲染层的接入边界、资产要求与降级规则说明。

# 福小客 Live2D 桌宠接入说明

左下角福小客小人保留原有 sprite 帧动画作为默认展示和兜底层。Live2D 只作为可选增强层挂在 `MascotSpriteStage` 内，不接管点击事件，也不修改点击小人打开 AI 经营分析对话框的逻辑。

## 资产位置

- `cockpit/public/live2d/live2dcubismcore.min.js`
- `cockpit/public/live2d/fuxiaoke/fuxiaoke.model3.json`

`fuxiaoke.model3.json` 引用的 `.moc3`、纹理、动作、表情和物理文件应放在同一模型目录或其子目录内，并保持 JSON 中的相对路径可用。

## 加载与降级

前端会先检查同源 Live2D Core 与模型入口文件是否存在，并拒绝把 HTML fallback 当成模型资源。只有两个入口文件都可用时才懒加载 PixiJS 与 `pixi-live2d-display/cubism4`。

任一文件缺失、内容类型异常、Cubism Core 初始化失败或模型加载失败时，组件会保持 sprite 小人可见并把状态切到 fallback。此过程不影响左下角入口点击，也不会隐藏原有小人。

## 开发样例回退

开发环境中，本地福小客模型缺失时会尝试加载 Live2D 官方 Haru 样例模型和官方 Cubism Core 直链，用来肉眼验证 Pixi + Live2D 渲染链路是否真实可用。这个样例不是最终福小客形象，只能作为开发验证态。

如需关闭样例回退，在前端环境变量中设置:

```bash
VITE_MASCOT_LIVE2D_SAMPLE_FALLBACK=false
```

正式交付应替换为 `cockpit/public/live2d/fuxiaoke/fuxiaoke.model3.json` 和本地 `live2dcubismcore.min.js`，避免依赖外部网络和样例角色授权边界。

## 选型边界

当前看板是 Web/Vite 前端，因此优先采用 PixiJS + `pixi-live2d-display` 的浏览器渲染方案。完整 Electron/Tauri 桌宠项目适合独立桌面应用，但会额外引入窗口管理、托盘、Agent 通讯和打包链路，不适合直接嵌进现有仪表盘。

## 授权要求

只允许放入已确认授权可用于本项目的模型、纹理和运行时文件。来源不明、不可商用或禁止再分发的角色模型不要提交到仓库。
