<!--
Update time: 2026-07-09 16:20:00 CST
Update content: Cost maintenance adds channel monthly refund amount, stored as `biz_channel_cost_monthly.refund_amount_yuan`.
-->
<!--
更新时间: 2026-07-08 13:05:31 CST
更新内容: 目标维护导入口径补充陌生员工确认新增流程：先返回“是否新增员工”确认项，确认后新增启用销售员工并继续写入目标。
-->
<!--
更新时间: 2026-07-08 11:45:00 CST
更新内容: 维护联动补齐：目标维护只认启用销售且有部门；组织/渠道新增维表可落库；人力成本空年份默认展示 sales/marketing；
          渠道来源“启用”通过 is_excluded 反向落库。
-->
<!--
更新时间: 2026-07-08
更新内容: 目标维护口径收紧——人员必须是销售(is_sales=1)且有部门(department_id 非空)才能维护目标。
          Excel 导入新增「所属组织」必填列，后端校验该人确实属于该部门；无部门/非销售/部门不符的行拒绝。
          旧模板(无「所属组织」列)会被整体拒绝，需重新下载模板。页内保存同样加门槛。
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

### 导入口径（2026-07-08 收紧）

- 目标维护只认 `is_sales=1`、`is_enabled=1` 且 `department_id IS NOT NULL` 的人员；无部门/非销售/停用人员在目标维护页不显示，也无法导入/保存目标。
- Excel 导入模板新增「所属组织」必填列（`department_name`），后端按人员姓名解析其真实部门，与 Excel 填写的部门名比对：不一致则该行 `skipped` 并提示实际部门。
- 若人员姓名在 `dim_staff` 中不存在，导入不会直接写库，而是返回待确认项：`员工「XX」并不在「组织」组织里，是否新增员工？`。用户确认后，后端按 Excel 的「所属组织」查找启用组织，新增 `dim_staff` 记录（`is_sales=1`、`is_enabled=1`、`is_delivery=0`、`is_success=0`），再继续写入该人员目标；若组织名不存在或未启用，则拒绝新增并提示组织不存在。
- 拒绝场景与提示：
  - 人员不存在且未确认新增 → 返回待确认项，不写目标
  - 确认新增但组织不存在 → `组织不存在，无法新增员工「XX」：组织`
  - 非销售 → `XX 不是销售，无法导入目标。请先在组织维护页将其设为销售`
  - 无部门 → `XX 无所属组织，无法导入目标。请先在组织维护页分配部门`
  - 停用 → `XX 已停用，无法导入目标。请先在组织维护页启用该人员`
  - 部门不符 → `XX 不属于「A」，实际属于「B」，跳过`
- 旧模板（无「所属组织」列）会被整体拒绝（`accepted=0, written=0`），需重新下载模板。
- 页内编辑保存（`saveTarget`）同步加门槛，口径与导入一致。

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
   - 当所选年份还没有人力成本数据时，页面仍默认生成 `sales` 和 `marketing` 两行，允许直接录入并保存到 `biz_labor_cost_monthly`。
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
- 页面新增的组织使用 `new-dept-*` 临时 ID；保存时后端先写 `dim_department`，再把人员的临时 `department_id` 映射为真实 ID。

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
- 页面新增的渠道大类使用 `new-channel-*` 临时 ID；保存时后端先写 `dim_channel`，再把来源的临时 `channel_id` 映射为真实 ID。

右侧维护线索来源：

- 来源编码，对应 `source_code`。
- 来源名称，对应 `source_name`。
- 归属渠道，对应 `channel_id`。
- 是否排除，对应 `is_excluded`。

当前 `dim_channel_source` 没有 `is_enabled` 字段，因此“启用”作为 `is_excluded` 的反向视图处理：

- 勾选“启用”会取消“排除”，保存为 `is_excluded=0`。
- 取消“启用”或勾选“排除”都会保存为 `is_excluded=1`。

## 验证要求

内容改造后需要验证：

- 四个维护页仍能正常切换。
- 顶部工具栏高度和玻璃样式不变。
- 卡片、表格外壳、表头、固定首列继续沿用现有透明玻璃体系。
- 页面文案与数据库字段语义一致。
- 不改动 `MaintenancePage.css`，除非后续发现文本溢出且必须用现有变量做小范围修正。

## 后续实现边界

第一阶段只改本地静态内容：

- `cockpit/src/data/mock.js`
- 必要时调整 `cockpit/src/components/MaintenancePage.jsx` 中的字段标题和文案

不在第一阶段接入真实 MySQL 接口，不新增后端服务，不新增数据库字段。

第二阶段如需真实数据读写，再设计接口：

- `GET /api/maintenance/targets`
- `POST /api/maintenance/targets`
- `GET /api/maintenance/costs`
- `POST /api/maintenance/costs`
- `GET /api/maintenance/org`
- `POST /api/maintenance/org`
- `GET /api/maintenance/channels`
- `POST /api/maintenance/channels`

## Cost Maintenance Refund Amount Addendum

- Channel cost maintenance now includes editable monthly refund amount for each channel.
- The field maps to `biz_channel_cost_monthly.refund_amount_yuan`.
- UI and Excel import use wan as the input unit; API persistence converts to yuan.
- The existing ROI formula remains based on win amount and investment amount unless a later requirement changes the metric definition.
