# CEO 经营驾驶舱 React Demo

更新时间: 2026-07-10 15:49:48 CST
更新内容: 年度拆解入口恢复为与月度入口一致的半环图右下位置，不再额外上移。

更新时间: 2026-07-10 15:42:33 CST
更新内容: 年度拆解入口上收避开年度目标进度条，进度条区域不被透明热区截获。

更新时间: 2026-07-10 15:36:50 CST
更新内容: 月度与年度回款结构下钻入口移动到半环图右下方，并扩大透明点击热区，支持点击入口附近进入二级页面。

更新时间: 2026-07-10 15:25:00 CST
更新内容: 福小客接入真实算力加载状态；外部算力接口未就绪时 AI 只报告数据缺口，不再把内存默认值作为经营事实。

更新时间: 2026-07-10 15:16:00 CST
更新内容: 合并远端最新经营布局和算力后台同步后，福小客继续提供真实快照简报、四类 CEO 分析、五类看板定位、实时续费观察及短屏适配。

更新时间: 2026-07-10 11:10:16 CST
更新内容: 经营总览回款结构半环改为对齐首页版本情况实际显示尺寸：250px 图高、340px 到 460px 图宽，避免三栏主卡内过大。

更新时间: 2026-07-10 11:03:44 CST
更新内容: 删除年度累计回款大数字上方的重复小标签，并将“点击查看年度拆解”移到年度回款结构半环图标题右上方，与月度入口形式统一。

更新时间: 2026-07-10 10:54:38 CST
更新内容: 月度“点击查看近期明细”入口移动到本月回款结构半环图标题右上方，年度拆解入口保持不变。

更新时间: 2026-07-10 10:53:56 CST
更新内容: 主内容桌面侧距收窄以适度加宽卡片，并删除月度大数字上方重复的“本月回款”小标签。

更新时间: 2026-07-10 10:51:28 CST
更新内容: 搜索入口移到左侧导航下方以释放首屏高度；年度进度条下移，删除外围胶囊和累计/目标文字，只保留进度条与完成率。

更新时间: 2026-07-09 18:07:32 CST
更新内容: 按截图红线继续收缩月度与年度经营主卡底部，把回款结构图区压到 190px，减少右侧经营列表下方留白。

更新时间: 2026-07-09 17:59:03 CST
更新内容: 经营总览月度与年度主卡继续收紧上下高度，压缩图区、经营情况行高和年度目标进度胶囊高度。

更新时间: 2026-07-09 17:57:41 CST
更新内容: 经营总览年度目标进度条右端收回到中间结构区分界线内侧，避免越界压到右侧经营情况。

更新时间: 2026-07-09 17:49:45 CST
更新内容: 经营总览年度目标进度条桌面端继续向右延长，更接近右侧经营情况列左侧留白。

更新时间: 2026-07-09 17:39:04 CST
更新内容: 经营总览年度目标进度条改为内嵌在年度左侧事实区两个胶囊下方，并向右延展到半环区域，避免位移裁切导致不可见。

更新时间: 2026-07-09 17:29:39 CST
更新内容: 经营总览年度目标进度 footer 改为位于年度卡主内容行内并通过位移上提，不再贴在卡片底部。

更新时间: 2026-07-09 17:19:28 CST
更新内容: 经营总览年度目标进度 footer 加大上移幅度，并收窄累计/目标数字与进度条之间的间距。

更新时间: 2026-07-09 17:16:09 CST
更新内容: 经营总览年度目标进度 footer 删除可见标题文字，进度条左移并整体上移。

更新时间: 2026-07-09 17:12:32 CST
更新内容: 经营总览年度目标进度条下方移除时间进度、线性进度差和后续月均需完成三项辅助数据，年度 footer 只保留目标进度主信息。

更新时间: 2026-07-09 16:28:48 CST
更新内容: 首页“回款”文案保持不变，实际值改为回款扣减渠道月度退款后的净额；本月和年度主卡在回款大数字右侧用目标同款小字显示退款金额。

更新时间: 2026-07-09 14:51:22 CST
更新内容: 目标维护与首页目标口径改为部门级:biz_target_monthly 取 staff_id IS NULL 的部门级目标,目标维护页只显示部门行(可编辑),渠道二级明细由按销售人员改为按部门。

更新时间: 2026-07-09 13:18:11 CST
更新内容: 左下角福小客缩短待机闭眼时长，并将本地 rig 动作衔接改为离散帧 motion bridge，不再使用旧帧透明 ghost crossfade。

更新时间: 2026-07-09 13:14:23 CST
更新内容: 经营总览说明同步文字箭头下钻入口、月度/年度半环未完成占位，以及年度进度条只跨左侧信息区的新布局。

更新时间: 2026-07-09 12:19:47 CST
更新内容: 经营总览说明同步年度回款总览卡，年度改为大数字、年度结构、经营情况和底部目标进度 footer。

更新时间: 2026-07-09 12:09:25 CST
更新内容: 修复左下角福小客模型检测期 sprite、local rig 与过渡层短暂叠加的问题，并明确当前 model3 是项目本地 rig 入口，不等同于 Cubism Editor 导出的真实骨骼模型。

更新时间: 2026-07-09 11:53:13 CST
更新内容: 补齐左下角福小客本地 rig 资源包与优先渲染路径，包含 model3、moc payload 和 motion3 动作文件，不再只停留在 Live2D 缺资源 fallback。

更新时间: 2026-07-09 11:43:55 CST
更新内容: 左下角福小客 sprite 动作切换增加旧帧淡出过渡，缓解非 Live2D 骨骼动作之间直接硬切的问题。

更新时间: 2026-07-09 11:29:54 CST
更新内容: 左下角福小客默认待机改为 16 帧慢呼吸、短弧线慢眨眼和胸口轻脉冲循环，并修正闭眼眼区补色，待机本体更有生命感且保持人物尺寸和脚底稳定。

更新时间: 2026-07-09 10:52:44 CST
更新内容: 左下角福小客在固定外框内增加 translate-only 内层生命感动效，让待机、指引、说话和庆祝状态不再像静态贴图。

更新时间: 2026-07-08 18:22:00 CST
更新内容: 总投入费比二级下钻改用成本趋势 costTrend，明确当前渠道投入、全渠道总投入和广告/人力构成口径。

更新时间: 2026-07-08 18:16:34 CST
更新内容: 左下角福小客非待机动作改用正式福客姿态母版生成，补充动作与待机帧的可见差异验收，避免看起来只有待机动作。

更新时间: 2026-07-08 18:02:17 CST
更新内容: 左下角福小客外层不再使用旋转、位移或缩放状态动效，所有动作只由同尺寸福客帧图表达，避免边界框变化导致视觉大小跳变。

更新时间: 2026-07-08 17:45:00 CST
更新内容: 左下角福小客逐个接回同源同尺寸的独立稳定动作帧，保留挥手、指引、说话、思考、提醒、庆祝和点击节奏，同时避免裁切、大小跳变和旧符号残留。

更新时间: 2026-07-08 17:33:51 CST
更新内容: 左下角福小客所有运行态动作统一使用同一套完整稳定福客帧，避免人物裁切、大小跳变和无意义符号残留。

更新时间: 2026-07-08 17:20:26 CST
更新内容: 左下角福小客待机帧改为同源稳定慢呼吸，降低播放速度并移除快速眨眼，避免小人忽大忽小。

更新时间: 2026-07-08 17:04:41 CST
更新内容: 左下角福小客默认待机切换为 imagegen 生成的福客 AI 富帧循环，增强眨眼、微转头和呼吸动作。

更新时间: 2026-07-08 16:57:24 CST
更新内容: 移除顶部右侧“更新数据”入口说明，数据维护仅通过左侧菜单进入。

更新时间: 2026-07-08 20:29:00 CST
更新内容: 移除左下角福小客 Live2D 的外部样例人物回退，正式模型缺失时只显示项目内福客 AI 素材。

更新时间: 2026-07-08 16:37:08 CST
更新内容: 渠道目标和渠道二级人员明细补齐部门编码兜底渠道口径，新增销售只要维护了目标即可出现在本月/年度下钻。

更新时间: 2026-07-08 18:55:00 CST
更新内容: 左下角福小客 Live2D 渲染前新增本地资源预检测，并补充桌宠接入说明文档入口。

更新时间: 2026-07-08 15:24:00 CST
更新内容: 左下角福小客 AI 小人新增可选 Pixi Live2D 渲染层，缺少正式授权模型时自动保留现有 sprite 帧动画兜底。

更新时间: 2026-07-08 11:45:00 CST
更新内容: 首页目标口径继续与数据维护同步，只统计启用销售且有部门的人员目标；补充组织/渠道维护新增维表联动说明。

更新时间: 2026-07-07 12:18:57 CST
更新内容: 首页目标口径统一到 biz_target_monthly，版本销售聚合说明补充续费事实表预聚合规则。

## 技术栈

- React + Vite
- Three.js / @react-three/fiber / @react-three/drei / maath
- PixiJS / pixi-live2d-display（左下角 AI 小人可选 Live2D 渲染层）
- ECharts
- GSAP
- flatpickr
- ReactBits registry 组件

## 本地运行

> **新同事首选 Docker 联调方式**（自带 MySQL + 数据，环境与线上一致），见仓库根目录 [`ONBOARDING.md`](../ONBOARDING.md)。下面是裸 npm 备选方式，需自备 MySQL 并手动导数据。

先安装依赖：

```bash
npm install
```

开发模式会由 Vite 同时提供页面、`/api/dashboard-data`、`/api/ai/analyze`：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

生产模式由 Node 服务同时提供 `dist` 静态文件、真实数据库数据接口和 AI 分析接口：

```bash
npm run serve
```

代码检查：

```bash
npm run lint
```

## 真实数据库口径

驾驶舱启动后会先请求 `/api/dashboard-data`，Node 服务读取 MySQL `ceo_dashboard` 并返回经营快照。接口成功前前端只显示数据库加载状态，不渲染旧 mock；接口失败时显示错误，不自动回退演示数据。

本地创建 `cockpit/.env.local`，不要提交真实密码：

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your-mysql-password
DB_NAME=ceo_dashboard
```

当前首页回款文案保持“回款”，实际值优先来自 `fact_revenue_daily.recovered_amount_yuan`，按月份和渠道扣减 `biz_channel_cost_monthly.refund_amount_yuan` 后聚合；当日级回款表没有数据时，才回退到 `fact_sales_member_monthly.recovered_amount_yuan`。`/api/dashboard-data` 会返回 `kpi.monthRefund` 和 `kpi.yearRefund`，用于展示本月和年度累计退款额。月目标、年度目标和渠道目标统一来自 `biz_target_monthly.target_amount_yuan`，且只统计 `staff_id IS NULL` 的部门级目标；渠道目标直接按 `biz_target_monthly.channel_id` 关联 `dim_channel` 汇总。渠道二级部门明细按本月/年度分别使用目标维护与日级回款聚合，新增部门只要有维护目标，即使销售月表尚未生成也会出现在对应渠道下钻中。导入完整数据库后，年度累计实际会按当年 1 月到当前月的日级净回款累计，不再只等于单月销售人员月表回款，也不会显示旧 mock。

渠道完成的实际回款优先来自 `dim_channel` + `fact_revenue_daily`，渠道投入来自 `biz_channel_cost_monthly`，人力成本来自 `biz_labor_cost_monthly`。`/api/dashboard-data` 同时返回 `costTrend`，按月输出 `{ yearMonth, label, adCost, laborCost, totalCost, channels }`；总投入费比二级下钻中，全渠道视角展示 `totalCost`，单渠道视角只展示该渠道投放成本，并在底部补充全渠道总投入与广告/人力构成，人力成本不分摊到单渠道。版本销售先按 `fact_version_sales_daily` 聚合版本套数和回款，续费数据先按 `fact_renewal_daily.version_id` 聚合后再关联版本销售，避免一对多 JOIN 放大销售金额。开户、算力和交付模块分别读取 `fact_opening_account_daily`、算力事实表和 `fact_delivery_order`/`biz_delivery_target_monthly`。

数据维护页内保存支持新增组织和渠道大类：前端临时 ID 会在后端先落 `dim_department` / `dim_channel`，再映射给人员或来源；组织保存与目标导入新增销售时会按组织编码自动维护 `dim_staff.channel_key`，渠道来源的“启用”按 `is_excluded` 的反向视图保存。

## 经营总览口径

经营总览首页顶部为两张回款总览卡：`本月经营进度` 和 `年度回款总览`。本月作为一号主视角展示 `/api/dashboard-data` 返回的本月回款、回款右侧本月退款提示、月度目标完成率、目标缺口/超额完成，大数字上方不再重复显示“本月回款”小标签；同一卡内用放大的半环图解释本月回款结构、用右侧经营情况列展示各渠道实际/目标/完成率和风险缺口。年度主卡同样在年度累计回款右侧展示年度累计退款提示，并删除大数字上方重复的“年度累计回款”小标签。

年度回款总览以 `/api/dashboard-data` 返回的 `kpi.yearRecovered` 和 `kpi.yearTarget` 为权威值；卡片参考月度主卡展示年度累计回款大数字、年度回款结构半环和年度经营情况列表，“点击查看年度拆解”入口位于年度回款结构半环图右下方；年度左侧事实区两个胶囊下方用薄年度目标进度条表达完成率，进度条适度下移，外围不使用胶囊底板，也不重复显示累计/目标数值，桌面端向右延展到中间结构区分界线内侧，避免挤占右侧经营情况。

渠道完成情况不再作为独立顶部卡片出现；月度和年度渠道拆解分别进入本月主卡、年度总览卡的半环图和右侧经营情况列。半环按目标口径展示渠道实际回款和 `未完成` 目标缺口占位；每行同时展示渠道名称、实际回款、目标回款、完成率、缺口和风险标签，点击渠道相关 KPI 仍可通过明细入口展开下钻。

月度 `点击查看近期明细 ›` 与年度 `点击查看年度拆解 ›` 分别位于对应回款结构半环图右下方，并使用同一套定位；两个入口复用现有 KPI 二级弹窗，保留透明大点击热区，点到文字周边也能进入二级页面，但视觉上不做成胶囊按钮。年度进度条层级高于入口热区，避免透明点击层覆盖进度条。首页回款结构由总览卡内半环承担，不恢复旧首页两张本月/本年半环长卡。

两张回款总览卡保持紧凑信息密度，但月度/年度回款结构半环必须维持与首页“版本情况”半环一致的实际视觉尺寸：桌面端图区高度为 250px，图表宽度使用 340px 到 460px 的响应范围，低高度桌面档不再继续压小饼图。下方继续保留原有业务拆解模块：月度经营趋势、开户数、总投入费比、版本情况和交付面板，用于解释经营结果背后的趋势、成本、产品和交付状态。

`src/data/mock.js` 仍保留初始结构和测试基线，但运行时会被真实数据库快照覆盖。新增字段或统计口径调整时，需要同步更新 `server/dashboardData.js` 的 SQL 聚合和本说明。

## 菜单与销售维度口径

左侧菜单当前包含 `经营总览`、`算力用量分析`，以及系统区的 `数据维护` 入口；全局搜索以紧凑玻璃行放在导航下方，主内容不再保留独占顶栏。进入维护模式后可通过侧边导航里的 `经营总览` 返回主界面。

渠道完成情况按数据库 `dim_channel.channel_key` 汇总，当前支持 `线上`、`线下华南`、`代理`、`线下华东`，点击后在屏幕正中间弹出部门明细卡片；部门明细跟随本月/年度切换，按对应周期目标完成率降序排列。目标维护与首页目标口径均为部门级（`biz_target_monthly` 取 `staff_id IS NULL`）。

KPI 二级弹窗、月度经营趋势、版本情况和交付面板继续在经营总览下方展示，顶部主故事负责本月和年度节奏判断，下方模块负责进一步拆解原因。

## 保留面板演示口径

交付、版本、开户数、月度趋势和 KPI 二级弹窗组件已恢复到经营总览首页下方，供用户在看完顶部经营结论后继续下钻业务原因。

交付面板按 `fact_delivery_order` 和 `biz_delivery_target_monthly` 展示实施工程师客户均价、人均金额价值、交付单数和月目标完成率；低于预警阈值的人员复用现有进度颜色逻辑突出显示。

版本情况面板保留左侧半环图和右侧列表型表格源码，数据来自 `fact_version_sales_daily` 和 `dim_product_version`。

## AI 分析工具

左侧菜单下方有一个透明背景 AI 小人入口，运行态动作使用 `public/mascot-actions/` 下同尺寸福客 AI 独立稳定帧；非待机动作由正式福客姿态图生成，待机、挥手、指引、说话、思考、提醒、庆祝和点击在小尺寸入口里也能明显区分，避免看起来只有同一套待机站姿。仓库内已放入 `public/live2d/fuxiaoke/fuxiaoke.model3.json` 本地 rig 入口、`fuxiaoke.moc3` 本地 payload 与 `motions/*.motion3.json`，运行时会先静态冻结 sprite，再切到本地 rig；如果本地 rig 不可用，才回退到 sprite 兜底。本地 rig 参照 Live2D motion fade 的思路用离散帧 bridge 衔接动作，不再使用旧帧透明 ghost crossfade；Sprite fallback 与本地 rig 共用毫秒级非匀速时间线，待机循环为 5.28 秒并且每轮只短暂播放一格闭眼，循环动作会在端点短停后回摆。这里的 `model3.json` 是入口清单，当前 `.moc3` 是项目本地 payload；若要达到真实 Cubism 骨骼、物理和表情效果，需要替换为 Cubism Editor 正式导出的二进制 `.moc3`、贴图和动作资源。小人默认待机，鼠标悬停会挥手并跟随指针，点击后打开 AI 经营分析对话框。Live2D 资产检测、降级和授权边界见 [`../doc/mascot-live2d.md`](../doc/mascot-live2d.md)。

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
- `public/live2d/`：福小客 Live2D/本地 rig 模型目标目录；当前仓库包含可运行的本地 rig 包，替换为正式 Cubism 模型时需放入 `live2dcubismcore.min.js`、二进制 `.moc3`、贴图和入口 `fuxiaoke/fuxiaoke.model3.json`，缺失或授权未确认时自动降级到 sprite
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
