更新时间: 2026-07-07 13:02:18 CST
更新内容: 补充用户配色 FBX 作为 base color 贴图来源，当前 GLB 已烘焙 COLOR_0 顶点色。

更新时间: 2026-07-07 12:24:46 CST
更新内容: 记录当前页面 AI 小人已替换为用户 FBX 优化 GLB，旧 Blender 灰模保留为历史基准。

# AI 小人模型基准

## 当前页面模型

- 工作模型: `cockpit/public/models/ai-mascot.glb`
- 当前页面生成脚本: `scripts/convert_component_rig_to_glb.mjs`
- 动作源文件: 用户提供的 rigged FBX，本地路径为 `C:/Users/22720/Downloads/20260706191350_9ab0fe16 (1)_component_rig.fbx`
- 配色源文件: 用户提供的 textured FBX，本地路径为 `C:/Users/22720/Downloads/664ed1cdae913be9c494dcaa6a84cac4.fbx`
- 转换处理: 保留动作源的 `CTRL_*` 控制结构，重命名页面动作所需控制节点，提取配色源的 `base_color_texture`，通过空间最近点把贴图色烘焙为 GLB 的 `COLOR_0` 顶点色，焊接重复顶点，按默认 `0.05` 比例减面并压实未引用顶点。
- 页面动作控制节点: `MascotRoot`、`BodyCtrl`、`HeadCtrl`、`LeftArmCtrl`、`RightArmCtrl`、`LeftLegCtrl`、`RightLegCtrl`

## 历史灰模基准

以下文件保留为旧 Blender 灰模基准和回看材料，不再作为当前页面小人的生成入口:

- `cockpit/public/models/mascot_graymodel_v1.glb`
- `cockpit/public/models/mascot_graymodel_v1_preview.png`
- `cockpit/public/models/mascot_graymodel_v2_locked.glb`
- `cockpit/public/models/mascot_graymodel_v2_locked_preview.png`
- 旧 Blender 灰模脚本: `scripts/generate_ai_mascot_glb.py`

## 旧灰模分件结构

- 头部: `helmet-back-shell`, `helmet-front-violet-panel`, `helmet-wing-logo`
- 外层透明头盔: `transparent-glass-dome`, `glass-upper-white-highlight`, `glass-right-white-highlight`
- 内部脸部主体: `face-cushion-volume`, `soft-face-panel`
- 五官: `eye--0.21`, `eye-0.21`, `left-cheek`, `right-cheek`, `smile-mouth`
- 配件: `left-headphone-shell`, `right-headphone-shell`, `microphone-boom`, `microphone-tip`
- 下巴支撑圈: `helmet-lower-white-support-ring`, `helmet-lower-white-left-cap`, `helmet-lower-white-right-cap`
- 身体: `soft-suit-body`, `purple-front-yoke`, `purple-neck-yoke`, `soft-hip-bridge`
- 胸口徽章: `ai-badge-recess-ring`, `ai-badge-outer-bezel`, `purple-ai-badge-ring`, `ai-badge-glow-core`, `AI-badge-text`
- 手臂: `left-shoulder-socket`, `right-shoulder-socket`, `left-shoulder-flow`, `right-shoulder-flow`, `left-arm`, `right-arm`, `left-hand-mitt`, `right-hand-mitt`
- 腿脚: `left-soft-leg`, `right-soft-leg`, `left-purple-boot`, `right-purple-boot`

## 旧灰模后续精修顺序

1. 二级形体精修: 只调整曲面顺滑、厚度、倒角和连接关系，不再改大头小身比例。
2. 基础材质测试: 头盔玻璃、身体白色、局部紫色、少量冷蓝发光分别测试。
3. 材质验收后再做灯光与最终渲染，不提前堆科技线条。

## 当前模型风险约束

- 当前页面模型必须继续保留动作控制节点，否则待机、打招呼、点击指引等动作会退化。
- 不提交原始 100MB 级 FBX；如需复现，使用本地源文件路径运行转换脚本重新生成轻量 GLB。
- 若后续重新减面，先用页面截图确认轮廓、手臂指引方向和入口尺寸，再替换 `ai-mascot.glb`。

## 旧灰模风险约束

- 不继续增加随机机甲切缝。
- 身体白色保持干净温润，不做灰脏塑料。
- 头盔保持透明蓝紫 tint，不做实心紫壳。
- 发光线只做少量点睛，不做全身炫光。
