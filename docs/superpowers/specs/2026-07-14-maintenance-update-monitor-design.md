# Data Maintenance Update Monitor Design

更新时间: 2026-07-14 11:40:00 CST
更新内容: 新增数据维护更新看板设计，按业务日期判断各组数据是否每日更新；达到或超过当前日期/月均归为增加到数；顶部增加、延迟、无数据、异常固定同一行展示并在每个框右侧提供复选框筛选；页面每小时自动拉取一次并展示数据拉取时效。

## Goal

在数据维护模块新增一个只读维护看板，让用户快速看到每一组经营数据当天是否已经到数，避免进入各维护页逐项排查。

## Scope

- 新增维护页 `update-monitor-maintenance`，中文名为 `数据更新看板`。
- 页面只读，不提供保存、导入和模板下载。
- 复用现有 `/api/maintenance/data?page=&year=` 入口，新增 pageKey 对应的数据读取器。
- 口径按业务日期判断，不新增同步日志表，不改现有导入或同步链路。

## Data Groups

首版覆盖这些数据组：

- 经营回款：`fact_revenue_daily.stat_date`
- 目标数据：`biz_target_monthly.year_month`
- 渠道成本：`biz_channel_cost_monthly.year_month`
- 开户数：`fact_opening_account_daily.stat_date`
- 版本销售：`fact_version_sales_daily.stat_date`
- 续费数据：`fact_renewal_daily.stat_date`
- 算力用量：`fact_compute_usage_daily.stat_date`
- 算力客户：`fact_compute_customer_daily.stat_date`
- 交付订单：`fact_delivery_order`
- 交付目标：`biz_delivery_target_monthly.year_month`

## Freshness Rules

- `daily` 类型：取最新业务日期，达到或超过北京时间今天为 `updated`，早于今天为 `stale`，无记录为 `empty`。
- `monthly` 类型：取最新业务月份，达到或超过北京时间当前年月为 `current_month`，早于当前年月为 `stale`，无记录为 `empty`。
- 查询异常为 `error`。
- 每组返回表名、最新业务日期或月份、记录数、落后天数、状态和状态文案。

## UI

- 新页放入数据维护侧边栏，排在目标维护和成本维护之前。
- 顶部沿用现有维护工具栏，但隐藏保存、导入、模板按钮，保留年份选择用于按年份查看记录量。
- 看板页面每小时自动重新拉取一次数据，面板说明展示数据拉取距离当前的时间。
- 主体为一组紧凑汇总指标和一张只读表：
  - 汇总：增加、延迟、无数据、异常固定同一行展示，最近检查时间和拉取时效放在面板说明中。
  - 筛选：四个汇总框右侧提供复选框；不勾选时显示全部，勾选一个为单选，勾选多个为多选；增加包含 `updated` 和 `current_month` 两类。
  - 明细：数据组、状态、最新日期/月、记录数、落后天数、表名。
- 数据组列下方只保留日级/月度类型，不展示增加、延迟、异常等状态文字，第二行左侧与数据组名对齐。
- 延迟和异常统一使用同一组警示色；数据组列不再使用绿色或红色闪烁样式。
- 视觉沿用维护页玻璃表格系统，不引入新主题。

## Tests

- 后端测试覆盖 daily/monthly/empty/error 状态映射。
- 前端源码回归测试覆盖菜单入口、只读页、隐藏保存导入动作、状态样式类。
- 保持现有维护页保存和导入逻辑不变。
