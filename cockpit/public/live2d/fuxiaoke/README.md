更新时间: 2026-07-09 13:18:11 CST
更新内容: 本地 rig motion3 缩短眨眼和 fade 参数，前端使用离散帧 motion bridge 替代旧帧透明淡出。

更新时间: 2026-07-09 12:09:25 CST
更新内容: 说明当前 model3/moc3 是项目本地 rig 资源，不等同于 Cubism Editor 导出的真实二进制骨骼模型。

更新时间: 2026-07-09 11:53:13 CST
更新内容: 补齐本目录内项目本地福小客 rig 资源包说明，包括 model3、moc payload 与 motion3 动作文件。

更新时间: 2026-07-08 18:55:00 CST
更新内容: 补充 Live2D 入口文件名必须稳定，便于前端资源预检测和懒加载。

更新时间: 2026-07-08 15:24:00 CST
更新内容: 新增福小客 Live2D 模型目标目录说明，供后续放置正式授权的 model3.json 资产。

# 福小客 Live2D 模型

本目录现在包含项目本地福小客 rig 资源包:

```text
fuxiaoke.model3.json
fuxiaoke.moc3
motions/*.motion3.json
```

前端会优先识别 `fuxiaoke.model3.json` 中的 `Meta.LocalRenderer: "fuxiaoke-local-rig-v1"`，并使用项目内福小客动作帧渲染完整动作层。本地 renderer 会用离散帧 motion bridge 衔接动作，`motions/*.motion3.json` 中的 blink/fade 时间保持短促，避免闭眼过久和旧帧透明糊过去。这个 `model3.json` 是本地 rig 的入口清单，当前 `fuxiaoke.moc3` 是本地 renderer 用来识别和校验资源包的 payload，不是 Cubism Editor 导出的二进制骨骼文件。

后续如果要替换为 Cubism Editor 正式导出的福小客 Live2D 模型文件，也请放在本目录，并确保入口文件命名为:

```text
fuxiaoke.model3.json
```

前端会固定检测上述入口文件。替换模型时可以调整入口 JSON 内部引用的 `.moc3`、贴图、动作、表情和物理文件路径，但不要改入口文件名，除非同步修改 `Live2DMascotStage.jsx` 中的 `MASCOT_LIVE2D_MODEL_SOURCE`。

模型引用的 `.moc3`、贴图、动作、表情和物理文件请按 `fuxiaoke.model3.json` 内的相对路径一并放入本目录。
