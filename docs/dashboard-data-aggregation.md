# Dashboard Data Aggregation

更新时间: 2026-07-08 17:23:00 CST
更新内容: 业务月份临时锁定为 2026 年 6 月；其它数据原因处理完后移除覆盖即可恢复自动月份，首页和默认日期范围先按 6 月查看。

更新时间: 2026-07-08 16:37:08 CST
更新内容: 渠道目标和人员明细补齐部门编码到渠道键的兜底规则；渠道二级本月/年度明细改用目标维护与日级回款口径。

更新时间: 2026-07-08 11:45:00 CST
更新内容: 首页目标聚合与目标维护口径对齐，只统计启用销售且有部门的人员目标；停用/非销售/无部门人员目标不再进入分母。

更新时间: 2026-07-07 14:05:00 CST
更新内容: 补充算力 overview 客户侧指标、开户环比/较昨日、续费上月、月时间进度的真实数据来源，移除硬编码 0 的占位说明。

## API

`/api/dashboard-data` 读取本地 MySQL 兼容库 `ceo_dashboard`，返回前端运行时快照。前端通过 `src/data/liveData.js` 拉取接口，再由 `src/data/mock.js` 的 `applyDashboardDataSnapshot` 覆盖页面数据。

业务月份 `latestMonth` 当前通过 `TEMP_DASHBOARD_MONTH_OVERRIDE = '2026-06'` 临时锁定为 2026 年 6 月；其它数据原因处理完后，移除该覆盖即可恢复自动月份。自动月份回退路径会优先取 `fact_revenue_daily.stat_date` 最新年月，再与 `fact_sales_member_monthly.year_month` 比较兜底。

前端 KPI 默认日期范围当前固定为 `2026-06-01` 至 `2026-06-30`；完整自然月范围按 100% 口径计算，手动查看历史完整月份时不会因月份天数差异缩放 KPI。

## 经营目标与回款

- 本月回款、年度累计回款、月趋势实际值：优先使用 `fact_revenue_daily.recovered_amount_yuan`，按 `stat_date` 的年月聚合。
- 当 `fact_revenue_daily` 没有数据时，回退使用 `fact_sales_member_monthly.recovered_amount_yuan`。
- 本月目标、年度目标、月趋势目标：使用 `biz_target_monthly.target_amount_yuan`，仅统计关联到 `dim_staff` 且满足 `is_sales=1`、`is_enabled=1`、`department_id IS NOT NULL` 的人员目标。
- 渠道目标：`biz_target_monthly.staff_id` 关联销售人员渠道后按渠道汇总，同样只统计启用销售且有部门的人员；当 `dim_staff.channel_key` 为空时，按 `dim_department.department_code` 兜底映射：`online-sales -> online`、`south-sales -> south`、`east-sales -> east`、`agent-sales -> agent`。
- 渠道二级销售人员明细：本月/年度目标来自 `biz_target_monthly`，实际回款优先来自 `fact_revenue_daily.staff_id` 聚合；没有日级回款时才回退 `fact_sales_member_monthly`。因此新销售只要已在目标维护中有目标，即使销售月表尚未生成，也会出现在对应渠道的二级明细中。

## 版本与续费

- 版本套数、版本回款、环比：使用 `fact_version_sales_daily` 按 `version_id` 和 `channel_id` 先聚合。
- 当前续费到期数、已续数：使用 `fact_renewal_daily` 按 `version_id` 先聚合，再关联版本销售结果。
- 不允许直接把 `fact_version_sales_daily` 与 `fact_renewal_daily` 明细表一对多 JOIN 后再汇总，否则版本套数和回款会被续费行数放大。

## 其他模块

- 渠道投入：`biz_channel_cost_monthly.investment_amount_yuan`。
- 人力成本：`biz_labor_cost_monthly.amount_yuan`。
- 开户数：`fact_opening_account_daily.opening_count`。本月开户环比 `previous` 取上一月同表汇总，今日开户 `previous` 取上一个有数据日期的汇总；当无历史日期时回退 0。
- 算力趋势、客户排行、资源健康：分别来自 `fact_compute_usage_daily`、`fact_compute_customer_daily`、`fact_compute_resource_health_daily` 等算力事实表。
- 算力 overview：总容量/新增/已耗来自 `fact_compute_usage_daily`；客户数、客户用量、客户余额、平均回复率、新开客户数、店铺数来自 `fact_compute_customer_daily` 最新快照——新开客户按手机号在更早日期不存在的记录计数，店铺数按 `customer_name` 同理计数；平均回复率取 `AVG(average_reply_rate)`。
- 续费：`fact_renewal_daily` 按渠道×版本先聚合当月到期/已续/续费金额，再 LEFT JOIN 上一月同口径聚合得到 `prev_due_count`/`prev_renewed_count`；当上一月无数据时回退 0。
- 经营节奏：月时间进度按真实日历推导（已过完整月=100%、未到月=0%、当月=已过天数/30），不再使用固定 30 的占位分支；年度时间进度仍按 `latestMonth` 月序 / 12。
- 交付看板：`fact_delivery_order` 聚合交付单数和金额，`biz_delivery_target_monthly` 提供实施工程师月目标。
