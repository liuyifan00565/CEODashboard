# Dashboard Data Aggregation

更新时间: 2026-07-09 22:30:00 CST
更新内容: 经营总览页在 `dashboard-data` 未就绪前改为渲染骨架屏（不再用 mock.js 本地示例经营数据顶替）；彻底移除
          `dashboardDataVersion` 状态——它此前用于在数据到达时把内容区 key 变化强制重挂载，表现为"页面刷新了一下"，
          实际上组件本来就会因为 props/state 变化正常重渲染，不需要重挂载。算力页和经营总览页现在都是：加载中只显示
          骨架屏和轻量提示条，数据就绪后一次性、无重挂载地换成真实内容。

更新时间: 2026-07-09 21:15:00 CST
更新内容: 移除首页全屏加载阻塞占位，`dashboard-data` 未就绪时仪表盘用本地快照立即渲染，顶栏改为轻量同步提示条；
          新增 `/api/compute-customers` 分页接口，算力页后台循环拉取全量客户列表并按手机号增量合并，不再受
          首屏 20 条采样限制，详见 `doc/compute-api-integration.md` 中关于外部接口排序漂移的说明。

更新时间: 2026-07-09 20:08:00 CST
更新内容: token 同步状态条仅在后台同步仍在加载时显示；数据库加载占位增加短延迟减少刷新闪烁。

更新时间: 2026-07-09 19:52:00 CST
更新内容: token 外部数据改为 dashboard-data 成功后后台同步；算力页仅在同步未完成时提示；实时客户排行限制为 20 条。

更新时间: 2026-07-09 19:32:00 CST
更新内容: dashboard-data 不再等待外部算力接口；算力页进入后按需调用 compute-data，实时客户明细限制为 50 条。

更新时间: 2026-07-09 19:05:00 CST
更新内容: 外部算力客户明细恢复首屏页加载、compute-data 改为 dashboard-data 失败兜底、长周期趋势缺失日期继续用本地历史占位补齐。

更新时间: 2026-07-09 18:18:00 CST
更新内容: 算力外部接口补齐全量客户分页、回复率百分比归一、组件级消耗构成映射；前端月/年趋势改为仅由真实日度数据聚合。

更新时间: 2026-07-09 17:55:00 CST
更新内容: 外部算力接口按真实 Network 行为改为 GET query 请求；base/path 同时带 `/csrc` 时服务端会去重，避免 404。

更新时间: 2026-07-09 17:45:00 CST
更新内容: 前端在 `/api/dashboard-data` 成功后继续读取 `/api/compute-data` 覆盖 token/算力模块；外部算力接口 path 支持环境变量配置。

更新时间: 2026-07-09 17:28:00 CST
更新内容: 外部算力接口 404 或异常时不再阻塞 `/api/dashboard-data`，全量 MySQL 快照会继续返回，仅跳过 token/算力外部覆盖。

更新时间: 2026-07-09 17:05:00 CST
更新内容: 新增 `/api/compute-data` 独立算力快照接口；前端在 `/api/dashboard-data` 失败时只回退加载 token/算力数据，其它看板数据保持原有展示。

更新时间: 2026-07-09 16:18:00 CST
更新内容: 算力数据支持通过 COMPUTE_API_BASE_URL / COMPUTE_API_TOKEN 调用外部算力看板接口，并覆盖 `/api/dashboard-data` 返回快照中的算力模块。

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

`/api/dashboard-data` 只读取本地 MySQL 快照，不再实时调用外部算力接口，避免首页等待 token 数据服务。当前端首页数据就绪后，会在后台调用 `/api/compute-data` 读取外部算力看板接口，把返回结果映射为 `computeOverview`、`computeUsageTrend`、`computeVersionConsumption`、`computeUsageDistribution`、`computeCustomerRows` 和 `computeResourceHealth`，并覆盖运行时算力模块。外部接口只在服务端调用，前端不直接接触 `x-token`。如果用户进入算力页时后台同步还没完成，算力页先展示本地快照并显示同步状态。

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
- 成本趋势：`costTrend` 按当前业务年份从 `biz_channel_cost_monthly` 聚合各渠道投放成本，并从 `biz_labor_cost_monthly` 聚合人力成本，返回 `{ yearMonth, label, adCost, laborCost, totalCost, channels }`；其中 `channels` 是渠道投放成本拆分，`totalCost = adCost + laborCost`。
- 总投入费比二级下钻：全渠道视角展示 `totalCost`；选择单个或多个渠道时，主指标只展示所选渠道投放成本合计，底部同时标明全渠道总投入和广告/人力构成。人力成本不强行分摊到单渠道。
- 开户数：`fact_opening_account_daily.opening_count`。本月开户环比 `previous` 取上一月同表汇总，今日开户 `previous` 取上一个有数据日期的汇总；当无历史日期时回退 0。
- 算力趋势、客户排行、资源健康：分别来自 `fact_compute_usage_daily`、`fact_compute_customer_daily`、`fact_compute_resource_health_daily` 等算力事实表。
- 外部算力接口覆盖：配置 `COMPUTE_API_BASE_URL`（例如以 `/csrc` 结尾的接口 base）和 `COMPUTE_API_TOKEN` 后，`server/computeApi.js` 会用 GET query 调用 `/api/v1/customer-management/getPlatformBoard` 和 `/api/v1/customer-management/getCustomerBoardList`。如果真实页面 Network 使用不同 path，可通过 `COMPUTE_PLATFORM_BOARD_PATH` 和 `COMPUTE_CUSTOMER_BOARD_PATH` 覆盖默认路径；base/path 同时带 `/csrc` 时服务端会去重。请求头使用 `x-token`，请求时间窗默认为北京时间昨天结束往前 30 天。`getPlatformBoard` 提供总容量、新增算力、消耗算力、近 30 日用量、容量趋势和 OCR/VOC/视频/回复拦截/对话测试等组件级消耗；`getCustomerBoardList` 提供客户数、客户算力用量/余额、新开客户/店铺、平均回复率、版本消耗、用量区间分布和客户明细排行，服务端实时读取 20 条客户明细并保留接口 `total` 作为总客户数。完整客户历史后续应由数据库同步任务增量写入，再由看板查询本地库。
- 算力 overview：总容量/新增/已耗来自 `fact_compute_usage_daily`；客户数、客户用量、客户余额、平均回复率、新开客户数、店铺数来自 `fact_compute_customer_daily` 最新快照——新开客户按手机号在更早日期不存在的记录计数，店铺数按 `customer_name` 同理计数；平均回复率取 `AVG(average_reply_rate)`。
- 算力页前端派生指标：算力利用率 = `consumedCapacity / totalCapacity`；供需关系图把趋势中的用量、按当前总容量缩放后的容量和二者利用率同屏展示；外部回复率若为 0-1 小数，服务端统一转为 0-100 百分比；风险客户按客户明细中的低余额（余额不高于 100 万点或余额/用量不高于 3）、高消耗（用量不低于 40 万点）、低回复（平均回复率低于 60%）和零用量标签派生；建议动作由风险标签映射为销售提醒充值、客成激活、客成排查配置、余额预警或高价值场景复盘；版本效率洞察按版本消耗占比计算头部版本和前两版本集中度；组件级消耗构成来自 `computeResourceHealth`；日趋势优先使用外部接口返回日期的数据，接口未覆盖日期继续使用本地历史占位补齐，避免月/年趋势因外部短窗口断档。
- 续费：`fact_renewal_daily` 按渠道×版本先聚合当月到期/已续/续费金额，再 LEFT JOIN 上一月同口径聚合得到 `prev_due_count`/`prev_renewed_count`；当上一月无数据时回退 0。
- 经营节奏：月时间进度按真实日历推导（已过完整月=100%、未到月=0%、当月=已过天数/30），不再使用固定 30 的占位分支；年度时间进度仍按 `latestMonth` 月序 / 12。
- 交付看板：`fact_delivery_order` 聚合交付单数和金额，`biz_delivery_target_monthly` 提供实施工程师月目标。
