# Dashboard Data Aggregation

更新时间: 2026-07-07 12:18:57 CST
更新内容: 记录真实数据库导入后的 `/api/dashboard-data` 聚合口径，明确回款、目标、版本、续费、开户、算力和交付模块的数据来源。

## API

`/api/dashboard-data` 读取本地 MySQL 兼容库 `ceo_dashboard`，返回前端运行时快照。前端通过 `src/data/liveData.js` 拉取接口，再由 `src/data/mock.js` 的 `applyDashboardDataSnapshot` 覆盖页面数据。

## 经营目标与回款

- 本月回款、年度累计回款、月趋势实际值：优先使用 `fact_revenue_daily.recovered_amount_yuan`，按 `stat_date` 的年月聚合。
- 当 `fact_revenue_daily` 没有数据时，回退使用 `fact_sales_member_monthly.recovered_amount_yuan`。
- 本月目标、年度目标、月趋势目标：使用 `biz_target_monthly.target_amount_yuan`。
- 渠道目标：`biz_target_monthly.staff_id` 关联 `dim_staff.channel_key` 后按渠道汇总。
- 销售人员明细：使用 `fact_sales_member_monthly`，只作为人员完成明细，不作为公司级目标分母。

## 版本与续费

- 版本套数、版本回款、环比：使用 `fact_version_sales_daily` 按 `version_id` 和 `channel_id` 先聚合。
- 当前续费到期数、已续数：使用 `fact_renewal_daily` 按 `version_id` 先聚合，再关联版本销售结果。
- 不允许直接把 `fact_version_sales_daily` 与 `fact_renewal_daily` 明细表一对多 JOIN 后再汇总，否则版本套数和回款会被续费行数放大。

## 其他模块

- 渠道投入：`biz_channel_cost_monthly.investment_amount_yuan`。
- 人力成本：`biz_labor_cost_monthly.amount_yuan`。
- 开户数：`fact_opening_account_daily.opening_count`。
- 算力趋势、客户排行、资源健康：分别来自 `fact_compute_usage_daily`、`fact_compute_customer_daily`、`fact_compute_resource_health_daily` 等算力事实表。
- 交付看板：`fact_delivery_order` 聚合交付单数和金额，`biz_delivery_target_monthly` 提供实施工程师月目标。
