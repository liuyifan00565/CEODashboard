更新时间: 2026-07-08 18:55:00 CST
更新内容: 补充 Live2D 入口文件名必须稳定，便于前端资源预检测和懒加载。

更新时间: 2026-07-08 15:24:00 CST
更新内容: 新增福小客 Live2D 模型目标目录说明，供后续放置正式授权的 model3.json 资产。

# 福小客 Live2D 模型

将正式授权的福小客 Live2D 模型文件放在本目录，并确保入口文件命名为:

```text
fuxiaoke.model3.json
```

前端会固定检测上述入口文件。替换模型时可以调整入口 JSON 内部引用的 `.moc3`、贴图、动作、表情和物理文件路径，但不要改入口文件名，除非同步修改 `Live2DMascotStage.jsx` 中的 `MASCOT_LIVE2D_MODEL_SOURCE`。

模型引用的 `.moc3`、贴图、动作、表情和物理文件请按 `fuxiaoke.model3.json` 内的相对路径一并放入本目录。
