更新时间: 2026-07-09 13:18:11 CST
更新内容: 记录本地 rig 采用离散帧 motion bridge 衔接动作，并缩短 idle motion 眨眼曲线与 fade 时间。

更新时间: 2026-07-09 12:09:25 CST
更新内容: 明确当前本地 rig 的 model3 是项目入口清单，启动检测期会冻结 sprite，真实 Cubism 效果需要替换为 Editor 导出的二进制 moc3 资源。

更新时间: 2026-07-09 11:53:13 CST
更新内容: 补齐项目内福小客本地 rig 资源包说明，前端会优先加载该资源包显示完整动作层，再回退到 Cubism 真模型或 sprite。

更新时间: 2026-07-08 20:29:00 CST
更新内容: 移除外部样例人物回退说明，明确正式模型缺失时继续显示项目内福客 AI sprite。

更新时间: 2026-07-08 18:55:00 CST
更新内容: 补充 Live2D 资源预检测与安静降级说明，避免模型缺失时影响左下角 AI 小人入口。

更新时间: 2026-07-08 15:24:00 CST
更新内容: 新增福小客 Live2D 模型放置说明，配合左下角 AI 小人可选 Live2D 渲染层。

# Live2D 模型目录

左下角福小客 AI 小人会优先尝试加载项目内本地 rig 资源包:

- `public/live2d/fuxiaoke/fuxiaoke.model3.json`
- `public/live2d/fuxiaoke/fuxiaoke.moc3`
- `public/live2d/fuxiaoke/motions/*.motion3.json`

该本地 rig 包引用项目内已有福小客动作帧，作为可直接运行的完整动作层。加载检测期内 sprite 会保持静态首帧，只有确认本地 rig 和 Cubism 模型都不可用时才启用 sprite 自身动画，避免启动时多套动画短暂叠加。本地 rig 运行时使用离散帧 motion bridge 连接动作，并读取更短的 blink/fade motion 设计，不使用透明 ghost crossfade。

这里的 `fuxiaoke.model3.json` 是入口清单；当前 `fuxiaoke.moc3` 是项目本地 rig payload，不是 Cubism Editor 导出的二进制骨骼模型。若后续替换为 Cubism Editor 正式导出的二进制模型，则仍沿用以下入口:

- `public/live2d/live2dcubismcore.min.js`
- `public/live2d/fuxiaoke/fuxiaoke.model3.json`

如果本地 rig 包、Cubism Core 或正式模型加载失败，页面会自动继续显示现有的福小客 sprite 帧动画，不影响点击小人打开 AI 经营分析对话框。

渲染层会先检查上述同源文件是否存在且不是 HTML fallback，确认可用后才加载 Pixi 与 Live2D Cubism 运行时。这样模型未准备好时不会抢点击、不会隐藏现有小人，也不会影响看板首屏交互。

开发环境和生产环境都不会在福小客模型缺失时加载外部样例人物。未放入本地授权模型前，左下角入口继续显示项目内已有的福客 AI sprite 帧动画。

请只放入已确认授权可用于本项目的 Live2D 模型文件。不要直接提交来源不明、不可商用或二次分发受限的角色模型。
