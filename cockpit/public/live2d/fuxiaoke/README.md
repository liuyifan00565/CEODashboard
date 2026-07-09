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

前端会优先识别 `fuxiaoke.model3.json` 中的 `Meta.LocalRenderer: "fuxiaoke-local-rig-v1"`，并使用项目内福小客动作帧渲染完整动作层。

后续如果要替换为 Cubism Editor 正式导出的福小客 Live2D 模型文件，也请放在本目录，并确保入口文件命名为:

```text
fuxiaoke.model3.json
```

前端会固定检测上述入口文件。替换模型时可以调整入口 JSON 内部引用的 `.moc3`、贴图、动作、表情和物理文件路径，但不要改入口文件名，除非同步修改 `Live2DMascotStage.jsx` 中的 `MASCOT_LIVE2D_MODEL_SOURCE`。

模型引用的 `.moc3`、贴图、动作、表情和物理文件请按 `fuxiaoke.model3.json` 内的相对路径一并放入本目录。
