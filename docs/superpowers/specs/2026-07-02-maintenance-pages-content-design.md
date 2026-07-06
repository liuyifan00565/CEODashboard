<!--
更新时间: 2026-07-06 10:28:05 CST
更新内容: 补充维护页真实 MySQL 读写接口已接入，更新第二阶段实现状态与验证记录。
-->
<!--
更新时间: 2026-07-02 18:25:37 CST
更新内容: 新增四个维护页内容规划，按 MySQL 字段和线上旧维护页结构确定本地页面展示内容；明确只改内容、不改样式框架。
-->

# 四个维护页内容规划

## 背景

本次规划面向 `http://192.168.2.173:5174/` 中的四个维护页面：目标维护、成本维护、组织维护、渠道维护。要求只调整页面内容、字段语义和默认展示数据，不调整现有透明玻璃样式、页面布局框架或 CSS 视觉体系。

参考来源包括：

- 本地 MySQL 数据库 `ceo_dashboard` 的表结构与字段。
- 线上旧系统 `https://fukebi.freecallai.cn/` 的四个维护页结构。
- 当前 React 页面 `cockpit/src/components/MaintenancePage.jsx` 和静态数据 `cockpit/src/data/mock.js`。

当前本地 MySQL 中关键维护表状态：

- 已有基础渠道：`线上`、`华南线下`、`华东线下`、`代理`，来自 `dim_channel`。
- `dim_department`、`dim_staff`、`biz_target_monthly`、`biz_channel_cost_monthly`、`biz_labor_cost_monthly`、`dim_channel_source` 当前为空表。
- 因此本次内容规划按数据库字段可承载的信息来设计页面内容，默认数据用于表达未来真实数据接入后的结构。

## 方案

采用最小内容改造方案：

- 保留四个维护页现有布局：顶部工具栏、左侧树或列表、右侧表格/矩阵。
- 保留 `MaintenancePage.css` 中现有透明玻璃卡片、工具栏和表格样式。
- 只调整页面文案、字段标签、默认数据、表格列含义和示例内容。
- 不新增页面级视觉样式，不新增深色实底、渐变、光斑、流光边框或新的玻璃变量。

## 目标维护

### 页面定位

目标维护用于维护销售人员的年度/月度经营目标，并为看板中的目标完成率、开户目标和订单目标提供分母。

### 数据来源

- `dim_department`: 组织树。
- `dim_staff`: 销售人员范围。
- `biz_target_monthly`: 月度目标。
- `fact_revenue_daily`: 实际回款和订单完成数据。
- `fact_opening_account_daily`: 实际开户完成数据。

### 页面内容

左侧继续展示组织架构，内容改为 BI 组织树：

- 根节点：公司或全部组织。
- 子节点：销售部门、战区或业务组。
- 每个节点展示启用销售人数。

右侧继续展示年度目标矩阵：

- 行：组织汇总行 + 销售人员明细行。
- 列：全年、季度、月份。
- 主输入：回款目标，对应 `target_amount_yuan`。
- 可扩展口径：开户目标 `target_opening_count`、订单目标 `target_order_count`。
- 完成展示：实际回款、完成率、进度条。

默认文案建议：

- 面板标题：`年度目标`。
- 第一列：`组织/人员`。
- 人员说明：`销售人员`。
- 组织汇总说明：`组织合计`。

## 成本维护

### 页面定位

成本维护用于维护渠道投放成本和部门人力成本，并为渠道 ROI、费比、人效等看板指标提供成本分母。

### 数据来源

- `dim_channel`: 渠道树。
- `biz_channel_cost_monthly`: 渠道投放成本。
- `biz_labor_cost_monthly`: 人力成本。
- `fact_revenue_daily`: 赢单金额和成交单数。

### 页面内容

左侧渠道树按 `dim_channel` 展示：

- `线上`
- `华南线下`
- `华东线下`
- `代理`

右侧保留两块内容：

1. 渠道成本维护
   - 行：渠道汇总 + 渠道明细。
   - 列：全年、季度、月份。
   - 可编辑字段：投入成本，对应 `investment_amount_yuan`。
   - 只读指标：赢单金额、成交单数、ROI。
   - ROI 口径：当月赢单金额和当月投入成本计算得出。

2. 人力成本维护
   - 默认保留销售部和市场部。
   - 对应 `cost_type = sales` 和 `cost_type = marketing`。
   - 如后续交付看板需要，可增加 `delivery`。
   - 可编辑字段：月度人力成本，对应 `amount_yuan`。

默认文案建议：

- 渠道树标题：`渠道树`。
- 渠道成本标题：`渠道成本维护`。
- 人力成本标题：`人力成本维护`。
- 成本行说明：`月度投入成本`。

## 组织维护

### 页面定位

组织维护用于维护 BI 组织树和人员口径，决定看板筛选、目标分配、权限范围和销售人员统计范围。

### 数据来源

- `dim_department`: 组织。
- `dim_staff`: 人员。

### 页面内容

左侧维护 BI 组织架构：

- 组织名称，对应 `department_name`。
- 上级组织，对应 `parent_id`。
- 启用状态，对应 `is_enabled`。
- 排序可由 `sort_order` 控制，但当前页面不必新增排序列。

右侧维护 BI 人员范围：

- 人员名称，对应 `staff_name`。
- 所属组织，对应 `department_id`。
- 是否销售，对应 `is_sales`。
- 是否启用，对应 `is_enabled`。
- 外部 BI ID，对应 `external_bi_user_id`。

字段文案调整：

- `卫瓴ID` 建议改为 `外部BI ID`，避免和当前数据库字段语义不一致。
- 人员来源说明可展示为 `BI 人员`、`销售人员`、`停用人员` 等轻量标签。

## 渠道维护

### 页面定位

渠道维护用于维护渠道大类和外部线索来源的归属关系，支撑渠道归因、ROI 和渠道筛选。

### 数据来源

- `dim_channel`: 渠道大类和层级。
- `dim_channel_source`: 线索来源编码、名称、归属渠道和排除状态。

### 页面内容

左侧维护渠道大类：

- 渠道名称，对应 `channel_name`。
- 上级渠道，对应 `parent_id`。
- 启用状态，对应 `is_enabled`。
- 默认内容优先跟随当前库已有渠道：`线上`、`华南线下`、`华东线下`、`代理`。

右侧维护线索来源：

- 来源编码，对应 `source_code`。
- 来源名称，对应 `source_name`。
- 归属渠道，对应 `channel_id`。
- 是否排除，对应 `is_excluded`。

当前 `dim_channel_source` 没有 `is_enabled` 字段，因此右侧表格不展示“启用”，以“排除”作为是否参与统计的主要开关。

## 验证要求

维护页接入 MySQL 后需要验证：

- 四个维护页仍能正常切换。
- 顶部工具栏高度和玻璃样式不变。
- 卡片、表格外壳、表头、固定首列继续沿用现有透明玻璃体系。
- 页面文案与数据库字段语义一致。
- UI 中可编辑的目标、成本、人力成本、组织人员、渠道来源字段保存后能更新对应 MySQL 表。
- 维护页读取接口失败时仍能保留字段语义一致的前端兜底数据。

## 已接入接口

本次已将原“第二阶段”真实读写接口接入当前 React/Node 服务：

- `GET /api/maintenance/bootstrap?year=2026`
- `GET /api/maintenance/targets?year=2026`
- `PUT /api/maintenance/targets`
- `GET /api/maintenance/costs?year=2026`
- `PUT /api/maintenance/costs`
- `GET /api/maintenance/org`
- `PUT /api/maintenance/org`
- `GET /api/maintenance/channels`
- `PUT /api/maintenance/channels`

字段落库规则：

- 页面金额单位为“万”，保存到 MySQL 时转成“元”。
- 目标维护只保存人员月度目标到 `biz_target_monthly`，季度和全年由月度汇总展示。
- 成本维护保存渠道月度投入到 `biz_channel_cost_monthly`，保存人力成本到 `biz_labor_cost_monthly`。
- 组织维护保存 `dim_department` 和 `dim_staff`，人员外部 ID 使用 `external_bi_user_id`。
- 渠道维护保存 `dim_channel` 和 `dim_channel_source`，线索来源只保存 `source_code`、`source_name`、`channel_id`、`is_excluded`。

不新增数据库字段，不改变现有表结构。
