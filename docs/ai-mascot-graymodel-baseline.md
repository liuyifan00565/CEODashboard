更新时间: 2026-07-06 14:19:58 CST
更新内容: 锁定 AI 小人灰模基准版本，记录分件结构、下一阶段精修顺序和材质测试风险。

# AI 小人灰模基准

当前锁定版本:

- `cockpit/public/models/mascot_graymodel_v1.glb`
- `cockpit/public/models/mascot_graymodel_v1_preview.png`
- `cockpit/public/models/mascot_graymodel_v2_locked.glb`
- `cockpit/public/models/mascot_graymodel_v2_locked_preview.png`

当前工作模型:

- `cockpit/public/models/ai-mascot.glb`
- 生成脚本: `scripts/generate_ai_mascot_glb.py`

## 分件结构

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

## 下一阶段顺序

1. 二级形体精修: 只调整曲面顺滑、厚度、倒角和连接关系，不再改大头小身比例。
2. 基础材质测试: 头盔玻璃、身体白色、局部紫色、少量冷蓝发光分别测试。
3. 材质验收后再做灯光与最终渲染，不提前堆科技线条。

## 风险约束

- 不继续增加随机机甲切缝。
- 身体白色保持干净温润，不做灰脏塑料。
- 头盔保持透明蓝紫 tint，不做实心紫壳。
- 发光线只做少量点睛，不做全身炫光。
