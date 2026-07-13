# CEO 经营驾驶舱 React Demo

更新时间: 2026-07-13 14:58:00 CST
更新内容: 同步开户数指标由接口返回，优先使用开户事实表，缺失时使用算力全量客户快照差分兜底的统计口径。

更新时间: 2026-07-06 12:25:08 CST
更新内容: 补充经营总览和算力用量分析通过 `/api/dashboard/bootstrap` 读取 MySQL 聚合数据的说明。

更新时间: 2026-07-06 11:39:42 CST
更新内容: 补充数据维护页 UI 与本地数据库双向同步和自动刷新说明。

更新时间: 2026-07-06 10:28:05 CST
更新内容: 增加数据维护页 MySQL 接入、环境变量和保存接口说明。

更新时间: 2026-07-01 18:32:30 CST
更新内容: 同步首页开户数小卡片二级弹窗改为展示对应开户数数据的说明。

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

## 数据维护 MySQL 接入

四个数据维护页会通过服务端 `/api/maintenance/*` 接口读取和保存本地 MySQL `ceo_dashboard`：

- `GET /api/maintenance/bootstrap?year=2026`：一次性读取目标、成本、组织、渠道四页数据。
- `PUT /api/maintenance/targets`：保存人员月度目标到 `biz_target_monthly.target_amount_yuan`，页面单位为“万”，落库单位为“元”。
- `PUT /api/maintenance/costs`：保存渠道月度投入到 `biz_channel_cost_monthly.investment_amount_yuan`，保存人力成本到 `biz_labor_cost_monthly.amount_yuan`。
- `PUT /api/maintenance/org`：保存组织和人员字段到 `dim_department`、`dim_staff`。
- `PUT /api/maintenance/channels`：保存渠道大类到 `dim_channel`，保存线索来源映射到 `dim_channel_source`。

本地创建 `cockpit/.env.local`，不要提交真实数据库密码：

```bash
CEO_DB_HOST=127.0.0.1
CEO_DB_PORT=3306
CEO_DB_USER=ceo_navicat
CEO_DB_PASSWORD=your-mysql-password
CEO_DB_NAME=ceo_dashboard
```

也可以用 `CEO_DB_DSN=mysql://user:password@127.0.0.1:3306/ceo_dashboard`。如果维护表为空，接口会返回与 MySQL 字段对齐的默认可编辑数据；用户在 UI 中保存后，数据库成为后续展示来源。

维护页保存时会通过 `PUT /api/maintenance/*` 写入本地数据库；页面空闲时每 5 秒无缓存读取一次本地数据库，让 Navicat 或其它工具直接改库后的数据自动回显到 UI。若某个维护页处于“有未保存修改”或“保存中”，自动刷新会保留该页当前编辑内容，避免外部数据库刷新覆盖尚未保存的输入。

## 主驾驶舱 MySQL 聚合

经营总览和算力用量分析会在页面启动时请求：

```bash
GET /api/dashboard/bootstrap?year=2026&month=6
```

服务端会从 MySQL 聚合后返回前端可直接展示的数据；如果该接口请求失败，前端会保留 `src/data/mock.js` 中的演示数据作为兜底。

经营总览主要读取：

- `fact_revenue_daily`：按渠道、月份聚合回款和订单数。
- `biz_target_monthly`：按渠道、月份聚合目标。
- `biz_channel_cost_monthly`、`biz_labor_cost_monthly`：聚合广告投入、人力成本和总投入。
- `fact_version_sales_daily`、`fact_renewal_daily`：聚合版本销量、回款和续费数据。
- `fact_opening_account_daily`：优先聚合本月开户数和今日开户数。
- `fact_sales_member_monthly`：聚合销售人员目标完成情况。
- `fact_delivery_order`、`biz_delivery_target_monthly`：聚合交付人员交付单数、目标和人效。

算力用量分析主要读取：

- `fact_compute_usage_daily`：聚合算力容量、新增和消耗趋势。
- `fact_compute_customer_daily`：聚合客户算力排行、余额和平均回复率；当开户事实表没有可用数据时，接口会把该表按每日全量客户快照做差分，兜底计算本月开户数和今日开户数。
- `fact_compute_version_consumption_daily`：聚合版本算力消耗占比。
- `fact_compute_usage_distribution_daily`、`dim_compute_usage_bucket`：聚合算力用量分布。
- `fact_compute_resource_health_daily`、`dim_compute_resource`：聚合资源健康度。

当前本地库已放入 2026 年 6 月演示数据，使用固定 ID 段写入，便于后续替换或回滚；真实业务接入时只要按相同表结构持续同步事实表，前端会按数据库位置自动聚合展示。

## 筛选联动演示口径

顶部日历范围筛选器和年/月/日筛选器会联动经营总览里的 KPI 数据卡片。当前仍使用虚拟数据：默认 `2026-06-01 至 2026-06-30` + `月` 视角保持原首屏 mock 数值；选择其它日期范围时，会按日期跨度和日期位置生成一个演示用折算系数；切换 `年`、`月`、`日` 时，会切换到对应粒度的虚拟基准值。

该口径只用于展示筛选后卡片数字滚动变化、完成率、缺口、环比和续费率联动效果，不代表真实生产统计口径。后续接入真实接口时，应以 BI/API 聚合结果替换 `src/lib/filterKpiCards.js` 中的虚拟折算逻辑。

`总投入 · 费比` 卡片的大字展示费比百分比；总投入、广告和人力金额保留在副文案中，用于说明费比的投入构成。

首页本年目标完成情况卡片下方新增 `本月开户数` 和 `今日开户数` 两张低高度小卡片。卡片优先展示 `/api/dashboard/bootstrap` 返回的 `overview.openingAccountMetrics`；接口先读取 `fact_opening_account_daily.opening_count`，如果开户事实表没有可用数据，再用 `fact_compute_customer_daily` 的每日全量客户快照差分计算。前端只消费接口返回结果，不在浏览器侧用客户数自行相减。两张小卡片点击后复用 KPI 二级弹窗样式和销售维度、年/月/日筛选控件，但图表数据会切换为对应的开户数趋势。

## 菜单与销售维度口径

左侧菜单当前包含 `经营总览`、`线上销售分析`、`华南线下销售分析`、`华东线下销售分析`、`代理销售分析`、`算力用量分析`。经营总览展示全局数据，供 CEO 查看整体经营状态；四个销售分析入口复用经营总览同一套 KPI、月度趋势、销售完成和版本情况布局，只把数据上下文切换到对应销售范围；算力用量分析目前作为导航入口，沿用全局数据上下文。

当前页面仍使用 `src/data/mock.js` 中的虚拟演示数据。`本月销售完成` 面板按 `线上`、`线下华南`、`线下华东`、`代理` 四类汇总，点击后在屏幕正中间弹出人员明细卡片，人员按目标完成率降序排列。KPI 二级弹窗的销售维度筛选为多选，默认四个明细项全选；如果需要查看全量，保持四项点亮即可。

KPI 二级弹窗提供 `新签` 和 `续订` 两个订单类型选项，用于切换金额序列和对应环比；界面不展示额外标签。该口径只用于 Demo 展示，后续接入真实接口时应由 BI/API 返回对应订单类型的聚合数据。

## 交付看板演示口径

一级看板新增 `交付看板`，用于展示 AI 客服交付配置的人效情况。当前 mock 数据按实施工程师展示客户均价、人均金额价值、交付单数，以及 15 单/月目标完成率；低于预警阈值的人员复用现有进度颜色逻辑突出显示。该面板目前不接交付工单系统，后续真实版本可由后台录入或接口聚合替换 mock 数据。

## 版本情况演示口径

首页版本情况卡片只展示版本明细，不再展示已回款、应收、广告费、年度缺口四个财务小结，也不再展示财务健康柱状图。当前版本范围为启航版、卓越版、至尊版、定制版、试用版、增购包 6 类。

每个版本展示价格、套数、回款、环比、当期应续费金额、当期已续费金额和当期续费率。当期续费率按 `当期已续费金额 / 当期应续费金额` 计算；当前数据仍为 `src/data/mock.js` 内的演示数据，后续接入真实口径时应替换为 BI/API 返回的版本维度数据。

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
