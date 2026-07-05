# CEO 经营驾驶舱 React Demo

更新时间: 2026-07-05 19:10:30 CST
更新内容: 同步经营总览信息密度增强版，补充月度/年度节奏判断、渠道融合表和本月/年度明细入口说明。

## 技术栈

- React + Vite
- Three.js / @react-three/fiber / @react-three/drei / maath
- ECharts
- GSAP
- flatpickr
- ReactBits registry 组件

## 本地运行

先安装依赖：

```bash
npm install
```

开发模式会由 Vite 同时提供页面和 `/api/ai/analyze`：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

生产模式由 Node 服务同时提供 `dist` 静态文件和 AI 分析接口：

```bash
npm run serve
```

代码检查：

```bash
npm run lint
```

## 经营总览演示口径

经营总览首页顶部为三段经营故事流：`经营进度总览`、`年度节奏`、`渠道完成情况`。本月作为主视角展示 `486万` 本月回款、`83.8%` 月度完成率、`94万` 目标缺口和风险渠道 `线下华东 70%`，同时补充 `时间进度 76.7%`、`节奏 +7.1%`、`预计影响缺口 36万` 和月度经营判断。

年度节奏以 `src/data/mock.js` 中的 `KPI.yearRecovered` 和 `KPI.yearTarget` 为权威值；趋势图展示 `1-6月累计实线 + 7-12月目标虚线`，并补充 `时间进度 50.0%`、`节奏偏差 +3.8%`、`剩余月均需完成 536万`。经营判断固定展示：“当前年度完成率略高于时间进度，但线下华东连续低于目标，需优先恢复渠道回款。”

`渠道完成情况` 只保留一组渠道列表，右上角可在 `本月 / 年度` 间切换，默认本月。切换只控制进度条主视角：本月显示月完成率，年度显示年度完成率。每行同时展示渠道名称、进度条、本月完成、月完成率、年度累计、年度贡献和状态；线下华东使用低饱和风险色标记 `需关注`，点击渠道行仍可展开人员完成明细弹窗。

顶部 `查看本月明细` 和 `查看年度明细` 入口复用现有 KPI 二级弹窗，不恢复旧首页两张本月/本年半环长卡；旧半环结构只作为明细弹窗和后续下钻能力保留。

三段经营故事流下方继续保留原有业务拆解模块：月度经营趋势、开户数、总投入费比、版本情况和交付面板，用于解释经营结果背后的趋势、成本、产品和交付状态。

当前仍使用虚拟演示数据，不代表真实生产统计口径。后续接入真实接口时，应以 BI/API 聚合结果替换 `src/data/mock.js` 中的 mock 数据和 `src/lib/filterKpiCards.js` 中的虚拟折算逻辑。

## 菜单与销售维度口径

左侧菜单当前包含 `经营总览`、`算力用量分析`，以及系统区的 `数据维护` 入口。顶部右侧按钮显示为 `更新数据`，当前复用数据维护入口行为；进入维护模式后按钮显示 `返回主界面`。

当前页面仍使用 `src/data/mock.js` 中的虚拟演示数据。渠道完成情况按 `线上`、`线下华南`、`代理`、`线下华东` 汇总，点击后在屏幕正中间弹出人员明细卡片，人员按目标完成率降序排列。

KPI 二级弹窗、月度经营趋势、版本情况和交付面板继续在经营总览下方展示，顶部主故事负责本月和年度节奏判断，下方模块负责进一步拆解原因。

## 保留面板演示口径

交付、版本、开户数、月度趋势和 KPI 二级弹窗组件已恢复到经营总览首页下方，供用户在看完顶部经营结论后继续下钻业务原因。

交付面板 mock 数据按实施工程师展示客户均价、人均金额价值、交付单数，以及 15 单/月目标完成率；低于预警阈值的人员复用现有进度颜色逻辑突出显示。该面板目前不接交付工单系统，后续真实版本可由后台录入或接口聚合替换 mock 数据。

版本情况面板保留左侧半环图和右侧列表型表格源码，可展示启航版、卓越版、至尊版、定制版等版本维度。当前数据仍为 `src/data/mock.js` 内的演示数据，后续接入真实口径时应替换为 BI/API 返回的版本维度数据。

## AI 分析工具

左侧菜单下方有一个透明背景 AI 小人入口，入口使用 3D 舞台承载 `public/ai-mascot-transparent.png` 福小客形象；默认待机，鼠标悬停会挥手并跟随指针，点击后打开 AI 经营分析对话框。小人会按当前场景在原位置淡入切换形象：`public/assets/mascot/ceo-mascot-kpi-guide.png` 用于引导，`ceo-mascot-report-presenter.png` 用于汇报和分析，`ceo-mascot-risk-alert.png` 用于预警，`ceo-mascot-target-achieved.png` 用于达成庆祝。

页面还支持文字悬浮 AI 气泡：鼠标停留在任意可读页面文字上时，前端会先根据该处文字立刻给出一条本地短提示，随后约 120ms 触发服务端 `/api/ai/hover-cue` 请求，把该处文字和当前页面数据快照发给千问精修。千问返回时会校验鼠标当前悬浮的仍是同一段文字，避免旧位置回复延迟显示。前端会缓存同一页面上下文下的同一段文字，减少重复请求。

AI 经营分析对话框会把当前页面的 KPI、销售维度、ROI、产品版本、续费率和月度趋势数据快照发到服务端 `/api/ai/analyze`。服务端再调用阿里云百炼 OpenAI-compatible Chat Completions 接口，并把通义的流式文本结果转发给前端。

本地创建 `cockpit/.env.local`，不要把真实 key 提交到 Git：

```bash
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
DASHSCOPE_MODEL=qwen3.7-max-2026-05-20
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_ENABLE_THINKING=false
```

`DASHSCOPE_MODEL` 默认就是 `qwen3.7-max-2026-05-20`，如果后续要切到稳定别名或新快照，只需要改环境变量。驾驶舱交互默认关闭思考模式，避免等待过久；需要深度分析时把 `DASHSCOPE_ENABLE_THINKING=true`。

## ReactBits 组件

本 demo 使用的 ReactBits 组件源码已落到：

- `src/components/DotField/`：页面点阵背景
- `src/components/GlassSurface/`：展开式玻璃搜索框
- `src/components/FluidGlass/`：官方 FluidGlass 原件
- `src/components/GlassCursor.jsx`：基于 FluidGlass lens 模型做的玻璃球鼠标指针
- `public/ai-mascot-transparent.png`：AI 分析入口透明小人素材
- `public/ai-mascot-sprite.png`：AI 分析入口 4 行 × 12 帧 sprite sheet 动作素材
- `public/assets/mascot/`：福小客 KPI 引导、汇报、风险提醒和达成庆祝场景形象
- `src/components/BorderGlow/`：AI 对话卡片辉光边框
- `src/components/ShinyText/`：AI 流式等待状态闪光文字

`components.json` 已配置 `@react-bits` registry：

```json
"registries": {
  "@react-bits": "https://reactbits.dev/r/{name}.json"
}
```

当前 `npx shadcn@latest view @react-bits/<Component>` 可以正常读取 registry 内容。实测 `npx shadcn@latest add @react-bits/FluidGlass-JS-CSS --path src/components --dry-run --yes` 可以解析；`DotField-JS-CSS` 和 `GlassSurface-JS-CSS` 因 registry 内含 CSS 文件，在 `shadcn@latest` 的 `add` 阶段会报 `Unexpected token (1:0)`，所以这两个组件按 `view/curl` 返回的官方 registry 内容落地。

本次新增的 `CircularText-JS-CSS`、`BorderGlow-JS-CSS`、`ShinyText-JS-CSS` 同样先执行了：

```bash
npx shadcn@latest add @react-bits/CircularText-JS-CSS @react-bits/BorderGlow-JS-CSS @react-bits/ShinyText-JS-CSS --yes
```

CLI 已安装 `motion` 依赖，但写入 CSS 文件时仍触发 `Unexpected token (1:0)`，因此组件源码按 registry 返回内容落地。
