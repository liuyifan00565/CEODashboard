# Dashboard Data Aggregation

Update time: 2026-07-10 15:40:59 CST
Update content: Renewal snapshot rows now always include `day`, `month`, and `year` period objects for every channel/version group. Missing database facts for a grain are represented as zero values instead of an absent field, so secondary renewal pages keep strict real-data semantics without dropping rows because of missing keys.

Update time: 2026-07-10 15:25:00 CST
Update content: Secondary KPI, channel trend, version detail, opening count trend, renewal period detail, and compute date series now use only database/API rows returned by the runtime snapshot. Frontend proportional trends, fixed day weights, static opening goals, static version option snapshots, and missing-date compute synthesis are disabled; if a database grain has no rows, the UI returns an empty/zero result instead of filling temporary data.

Update time: 2026-07-10 17:20:00 CST
Update content: Delivery dashboard completion now requires `biz_delivery_target_monthly.target_count`. If the monthly engineer target is not configured, the API keeps real delivery count and value but returns an unset completion, and the frontend shows "目标未配置" instead of a hard-coded 15-order target or 0% completion.

Update time: 2026-07-10 14:50:00 CST
Update content: Dashboard business month now defaults to the current Beijing calendar month and the frontend default KPI date range follows the current calendar month. `DASHBOARD_MONTH_OVERRIDE` remains available for explicit month overrides.

Update time: 2026-07-10 16:45:00 CST
Update content: Merged Jichuan compute usage API split. `/api/dashboard-data` remains the local MySQL snapshot entry; after it is ready, `App` calls `/api/compute-data` in the background and then paginates `/api/compute-customers` to merge customer rows into the runtime compute table.

Update time: 2026-07-09 18:26:37 CST
Update content: Added the compute token usage schema script reference. External token/compute API fields now have local MySQL tables in `scripts/create_compute_token_usage_tables.sql`; `fact_compute_usage_daily` keeps existing display columns while adding raw API fields.

Update time: 2026-07-09 16:28:48 CST
Update content: Dashboard display text remains "回款"; all dashboard recovered values now subtract per-channel monthly refunds from `biz_channel_cost_monthly.refund_amount_yuan`, and the API returns `kpi.monthRefund` / `kpi.yearRefund` for monthly and annual refund notes.

Update time: 2026-07-09 14:51:22 CST
Update content: 目标口径改为部门级。biz_target_monthly 只取 staff_id IS NULL 的部门级目标(历史人员级目标保留在库但忽略);渠道目标直接用 t.channel_id 关联 dim_channel;渠道二级明细由"按销售人员"改为"按部门"。回款口径不变(仍 fact_revenue_daily 优先)。

Update time: 2026-07-09 16:20:00 CST
Update content: Cost maintenance adds `biz_channel_cost_monthly.refund_amount_yuan` as the per-channel monthly refund amount; dashboard investment aggregation is unchanged.

更新时间: 2026-07-08 18:51:50 CST
更新内容: 补充算力页前端派生指标口径，包括算力利用率、供需关系、风险客户、版本效率洞察和客户建议动作。

更新时间: 2026-07-08 18:22:00 CST
更新内容: 新增成本趋势 costTrend 口径说明；总投入费比二级下钻区分当前渠道投放成本、全渠道总投入以及广告/人力构成。

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

`/api/dashboard-data` 不实时调用外部算力接口，避免首页等待 token 服务。dashboard 快照就绪后，`App` 会在后台调用 `/api/compute-data` 覆盖 `computeOverview`、`computeUsageTrend`、`computeVersionConsumption`、`computeUsageDistribution`、`computeCustomerRows` 和 `computeResourceHealth`；随后按 `/api/compute-customers?page=&pageSize=200` 分页拉取客户明细并按手机号增量合并。算力页只接收 token 同步状态和客户同步状态，用骨架屏/进度文案展示后台加载进度。

业务月份 `latestMonth` 默认跟随北京时间当前自然月；如需排查历史月份，可通过 `DASHBOARD_MONTH_OVERRIDE=YYYY-MM` 显式覆盖。当前自然月无法解析时，自动月份回退路径会优先取 `fact_revenue_daily.stat_date` 最新年月，再与 `fact_sales_member_monthly.year_month` 比较兜底。

前端 KPI 默认日期范围跟随浏览器运行时当前自然月的第一天到最后一天；完整自然月范围按 100% 口径计算，手动查看历史完整月份时不会因月份天数差异缩放 KPI。

## 经营目标与回款

- 本月回款、年度累计回款、月趋势实际值：前端文案仍显示“回款”；数值优先使用 `fact_revenue_daily.recovered_amount_yuan`，再按年月+渠道扣减 `biz_channel_cost_monthly.refund_amount_yuan` 后聚合。
- `/api/dashboard-data` 同时返回 `kpi.monthRefund` 和 `kpi.yearRefund`，月度和年度主卡在回款大数字右侧分别显示本月退款金额、年度累计退款金额。
- 当 `fact_revenue_daily` 没有数据时，回退使用 `fact_sales_member_monthly.recovered_amount_yuan`。
- 本月目标、年度目标、月趋势目标：使用 `biz_target_monthly.target_amount_yuan`，仅取 `staff_id IS NULL` 的部门级目标（目标维护改为按部门录入，历史人员级目标保留在库但不再进入统计）。
- 渠道目标：`biz_target_monthly.channel_id` 直接关联 `dim_channel` 按渠道汇总，仅取 `staff_id IS NULL` 的部门级目标。
- 渠道二级明细：本月/年度目标来自 `biz_target_monthly`（按部门），实际回款来自 `fact_revenue_daily.department_id` 聚合；明细粒度由原来的“销售人员”改为“部门”，按部门目标完成率降序排列。

## 版本与续费

- 版本套数、版本回款、环比：使用 `fact_version_sales_daily` 按 `version_id` 和 `channel_id` 先聚合。
- 当前续费到期数、已续数：使用 `fact_renewal_daily` 按 `version_id` + `channel_id` 先聚合，再关联同粒度版本销售结果，避免跨渠道重复。
- 不允许直接把 `fact_version_sales_daily` 与 `fact_renewal_daily` 明细表一对多 JOIN 后再汇总，否则版本套数和回款会被续费行数放大。
- 版本二级趋势：`/api/dashboard-data.detailRows.versions` 来自 `fact_version_sales_daily` 日级明细聚合，前端只按年/月/日、渠道和版本重新分组，不再按月趋势比例或固定日权重拆分。
- 续费二级粒度：`fact_renewal_daily` 分别按当月、当年和最新有数据日聚合，并返回对应真实上期；后端为每个渠道/版本固定补齐 `day/month/year` 三个对象，某粒度没有真实事实时该对象为 0 值；前端不再在缺失年/日粒度时回退复用月度数据。

## 其他模块

- 渠道投入：`biz_channel_cost_monthly.investment_amount_yuan`。
- 人力成本：`biz_labor_cost_monthly.amount_yuan`。
- 成本趋势：`costTrend` 按当前业务年份从 `biz_channel_cost_monthly` 聚合各渠道投放成本，并从 `biz_labor_cost_monthly` 聚合人力成本，返回 `{ yearMonth, label, adCost, laborCost, totalCost, channels }`；其中 `channels` 是渠道投放成本拆分，`totalCost = adCost + laborCost`。
- 总投入费比二级下钻：全渠道视角展示 `totalCost`；选择单个或多个渠道时，主指标只展示所选渠道投放成本合计，底部同时标明全渠道总投入和广告/人力构成。人力成本不强行分摊到单渠道。
- 开户数：`fact_opening_account_daily.opening_count`。本月开户环比 `previous` 取上一月同表汇总，今日开户 `previous` 取上一个有数据日期的汇总；当无历史日期时回退 0。
- 开户二级趋势：`/api/dashboard-data.detailRows.openings` 来自 `fact_opening_account_daily`，前端只按真实日级行聚合年/月/日，不再使用固定前端开户趋势数组或写死开户目标。
- 算力趋势、客户排行、资源健康：默认来自 `fact_compute_usage_daily`、`fact_compute_customer_daily`、`fact_compute_resource_health_daily` 等算力事实表；外部 token/算力接口对应的建表脚本为 `scripts/create_compute_token_usage_tables.sql`。配置 `COMPUTE_API_BASE_URL` 和 `COMPUTE_API_TOKEN` 后，`/api/compute-data` 会通过服务端读取外部算力看板并覆盖运行时算力模块；客户全量明细由 `/api/compute-customers` 分页返回。
- 算力年/月/日序列：前端只对已加载的 `computeUsageTrend` 日级真实行做聚合；外部接口或数据库缺少的日期不再由前端生成补点。
- 算力 overview：总容量/新增/已耗来自 `fact_compute_usage_daily`；客户数、客户用量、客户余额、平均回复率、新开客户数、店铺数来自 `fact_compute_customer_daily` 最新快照——新开客户按手机号在更早日期不存在的记录计数，店铺数按 `customer_name` 同理计数；平均回复率取 `AVG(average_reply_rate)`。
- 算力页前端派生指标：算力利用率 = `consumedCapacity / totalCapacity`；供需关系图把趋势中的用量、按当前总容量缩放后的容量和二者利用率同屏展示；风险客户按客户明细中的低余额（余额不高于 100 万点或余额/用量不高于 3）、高消耗（用量不低于 40 万点）、低回复（平均回复率低于 60%）和零用量标签派生；建议动作由风险标签映射为销售提醒充值、客成激活、客成排查配置、余额预警或高价值场景复盘；版本效率洞察按版本消耗占比计算头部版本和前两版本集中度。
- 续费：`fact_renewal_daily` 按渠道×版本先聚合当月到期/已续/续费金额，再 LEFT JOIN 上一月同口径聚合得到 `prev_due_count`/`prev_renewed_count`；当上一月无数据时回退 0。
- 经营节奏：月时间进度按真实日历推导（已过完整月=100%、未到月=0%、当月=已过天数/30），不再使用固定 30 的占位分支；年度时间进度仍按 `latestMonth` 月序 / 12。
- 交付看板：`fact_delivery_order` 聚合交付单数和金额，`biz_delivery_target_monthly` 提供实施工程师月目标。目标表未配置时不计算完成率、不触发交付预警，前端显示“目标未配置”。

## Cost Maintenance Refund Amount

- `biz_channel_cost_monthly.refund_amount_yuan` stores the monthly refund amount for each channel.
- Cost maintenance displays and saves this field in wan, then converts it to yuan before writing to MySQL.
- Dashboard channel investment and ROI aggregation continue to use `investment_amount_yuan` unless a later metric requirement explicitly changes the formula.
- Dashboard recovered metrics subtract monthly refunds from the matching month+channel recovered amount; visible labels remain "回款".
