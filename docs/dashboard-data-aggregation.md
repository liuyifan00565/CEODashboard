# Dashboard Data Aggregation

更新时间: 2026-07-14 18:32:40 CST
更新内容:
- 回款来源按自然年在数据库统一选择：存在完整公司月度渠道事实时只用公司月度；否则有真实订单时只用订单；再否则使用日报与目标维护覆盖值。目标维护、成本维护和经营总览均读取同一选择结果。
- 公司月度 `total` 是公司毛回款权威值，`channel` 只作为拆分权重；数据库按渠道原始占比分配权威总额，最后一行补齐分级尾差。无法归属组织的金额仍进入公司总计，但不伪造部门归属。
- 净实际回款统一为 `v_revenue_gross_canonical` 毛回款减 `v_revenue_refund_canonical` 退款。退款优先采用成本维护的月渠道值；没有维护行时才回退真实来源自带退款，因此导入值可在维护页修订且不会重复扣减。
- 上月、去年同期和年度趋势均按各自自然年的已选来源统计，不再沿用当前年份的来源类型。当某月只有非零退款而无毛回款时，该月仍是有效业务月，经营总览显示负净回款。
- 目标维护与经营总览统一读取 `v_target_monthly_effective`；同月父子组织都维护目标时以父组织为准，子组织值不再重复进入看板总目标。

更新时间: 2026-07-14 18:04:01 CST
更新内容:
- 合并公司月度业绩与统一毛回款数据链路：公司月度 `total` 驱动 KPI/趋势、`channel` 驱动渠道结构；真实订单继续驱动人员下钻；没有真实订单时使用统一视图的部门目标与回款。
- 公司月度净回款和真实订单净回款不重复扣退款；旧统一视图模式按月渠道精确分摊退款，允许负净回款并保证总额守恒。

更新时间: 2026-07-14 17:57:02 CST
更新内容:
- 新增 `fact_revenue_monthly_override` 与 `v_revenue_gross_canonical`，目标维护、成本维护、经营总览统一读取同一套毛回款；部门月度覆盖值会覆盖本部门及下级组织同月日报明细，父级覆盖优先，避免汇总行与明细重复累计。
- 目标维护完成金额不再写入 `fact_revenue_daily`，业务请求也不再执行 `ALTER TABLE`；旧 `manual_department` 行由正式迁移搬入覆盖表。
- 目标实际回款覆盖仅允许写入能唯一映射到启用经营渠道的组织；总部等无单一渠道的父级组织会明确拒绝实际回款保存或导入，但其目标金额仍可保存。
- 净实际回款统一为“毛回款 - 退款”。退款超过毛回款时允许出现负数；退款按月和渠道分摊时补齐舍入尾差，无毛回款渠道也生成负向调整，保证总额严格守恒。
- 旧日报模式的月、日、年趋势统一读取毛回款视图并扣减退款；`fact_sales_member_monthly` 不再覆盖日报或决定业务月份。真实订单模式继续直接使用订单净回款，避免重复扣退款。

更新时间: 2026-07-14 17:25:00 CST
更新内容:
- 公司 KPI、月度趋势与年度累计只使用具备完整渠道的公司月度 total；1-3 月订单数据仅代表线上，不补入公司总额，继续用于人员和订单下钻。
- 新增 `fact_revenue_channel_monthly`。公司级月度 total 行独立驱动 KPI/趋势，channel 行驱动四渠道结构；两者不相加，订单表继续用于人员下钻。
- `server/importCompanyRevenue.js` 只读取 `福客2026年4-6月业绩`，导入 4-6 月实际营收，以及线上、代理、华南线下、华东线下；忽略 `Sheet1`、线下父级合计、代理细分、南棠渠道、特殊渠道和目标。
- 新增 `server/importSelfOperatedRevenue.js`，按 1-4 月月表导入 565 行，并用汇总表补齐线索来源；人员、版本、来源维表和导入批次在同一事务中维护。
- 自营收入统一按 `net_amount_yuan = sales_amount_yuan - refund_amount_yuan` 统计。业务月份默认取最新真实事实月份，不再因当前月份晚于 Excel 数据月份而显示空下钻。
- 线索来源通过 `channel_source_id -> dim_channel_source` 保存，组织销售渠道继续使用 `channel_id`；回款下钻展示客户、企微群、负责人、销售业绩、价格、退款、净回款、来源、其他说明、备注和 Excel 来源行。
- `--replace-demo-data` 清空演示事实、目标和成本数据；售前试用演示快照默认不再进入 live 页面。

更新时间: 2026-07-14 16:34:51 CST
更新内容:
- 首页“本月开户数”和“今日开户数”在 `/api/dashboard-data` 或 `/api/compute-data` 同步到算力数据后，
  改用算力用量分析页同口径覆盖展示：本月开户数取客户算力明细排行客户记录数
  `computeOverview.customerCount`，今日开户数取在用账户数
  `computeOverview.customerCount - computeUsageDistribution` 中“算力用量=0”档。
- 数据维护模块新增 `数据更新看板`，通过 `/api/maintenance/data?page=update-monitor-maintenance&year=YYYY`
  返回各业务数据组到数状态。日级表按最新业务日期是否达到或超过北京时间今日判断“今日已更新/增加”；
  月度表按最新 `year_month` 是否达到或超过当前年月判断“本月有数据/增加”；单表异常只标记该组为“异常”，
  不阻断其它组展示。前端看板每小时自动重新拉取一次该接口，并展示本次数据拉取距当前的时间。
- 交付看板重构为售前试用转化与配置负载页面，当前统一读取集中演示月快照，不使用旧订单交付聚合推算试用指标。
- 明确核心同批试用 cohort、渠道 / 团队成熟 cohort、风险分层、14 单人员负载阈值，以及真实后端接入所需字段。
- 成本表兼容迁移 `ensureCostSchema` 在开发启动或多请求并发触发时，若其它请求已创建
  `operations_amount_yuan`、`labor_amount_yuan`、`refund_amount_yuan` 或业务唯一索引，会把 MySQL
  的重复列/重复索引错误视为幂等完成并继续读取真实数据，避免首页显示“真实数据库数据加载失败”。

更新时间: 2026-07-13 17:20:00 CST
更新内容:
- 经营总览趋势图新增年/月/日切换。快照新增 `dailyRevenueTrend`（本月每日回款，`fact_revenue_daily` 按天聚合，
  无日粒度目标，只有实际回款）和 `yearlyTrend`（按自然年聚合的回款/目标，`fact_revenue_daily` 按 `YEAR(stat_date)`
  聚合回款，`biz_target_monthly`（`staff_id IS NULL`）按年份前 4 位聚合目标；只返回数据库里实际存在的年份，
  历史年份不做退款额调整）。
- 总投入·费比卡片副标题新增“广告ROI”= 当前筛选范围回款 / 广告投入，与费比使用同一套按渠道/日期范围缩放的口径。
- 算力用量分析页 KPI 条新增“在用账户数” = 总客户数 - 零用量分布档，复用现有客户分布数据，不新增查询。

Update time: 2026-07-10 17:02:12 CST
Update content: Department-level recovered detail now detects whether `fact_revenue_daily.department_id` exists. Newer schemas use `COALESCE(r.department_id, staff.department_id)`, while older deployments without the column resolve departments through `fact_revenue_daily.staff_id -> dim_staff.department_id`, preventing `/api/dashboard-data` from failing with `Unknown column 'r.department_id'`.

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

`/api/dashboard-data.deliveryRows` 继续返回 `fact_delivery_order` 与 `biz_delivery_target_monthly` 的旧交付订单 / 人员目标聚合，以保持接口兼容。新的售前试用交付看板当前通过 `src/data/presaleTrialDelivery.js` 的异步加载器读取集中演示月快照，不读取、混合或回退到 `deliveryRows`；已交付订单不能替代当前试用客户。

`/api/dashboard-data` 不实时调用外部算力接口，避免首页等待 token 服务。dashboard 快照就绪后，`App` 会在后台调用 `/api/compute-data` 覆盖 `computeOverview`、`computeUsageTrend`、`computeVersionConsumption`、`computeUsageDistribution`、`computeCustomerRows` 和 `computeResourceHealth`；随后按 `/api/compute-customers?page=&pageSize=200` 分页拉取客户明细并按手机号增量合并。算力页只接收 token 同步状态和客户同步状态，用骨架屏/进度文案展示后台加载进度。

业务月份 `latestMonth` 默认取 `v_revenue_gross_canonical` 已选中来源的最新事实月份；`fact_sales_member_monthly` 不再参与实际回款来源选择。可通过 `DASHBOARD_MONTH_OVERRIDE=YYYY-MM` 显式覆盖。

前端 KPI 默认日期范围跟随浏览器运行时当前自然月的第一天到最后一天；完整自然月范围按 100% 口径计算，手动查看历史完整月份时不会因月份天数差异缩放 KPI。

## 经营目标与回款

- 自营收入真实明细：`scripts/create_self_operated_revenue_tables.sql` 创建 `fact_revenue_order`。`server/importSelfOperatedRevenue.js` 读取月表中的日期、销售、客户、企微群、福客系统负责人、版本、订单号、销售实际业绩、价格、退款、备注和其他说明，并以 `1-4月` 汇总表的同序行补齐线索来源。图片备注公式无法转成可搜索文本，保留来源工作表和行号供回查。
- 公司级月度业绩：`scripts/create_revenue_monthly_tables.sql` 创建 `fact_revenue_channel_monthly`。同一业务年份存在可分配的公司月度记录时，`total` 是公司毛回款权威值，`channel` 是结构权重；`v_revenue_company_monthly_allocated` 按渠道占比校准到 total，并补齐分级尾差，不与订单或日报再次相加。
- 本月回款、年度累计回款、月趋势实际值：统一先读取 `v_revenue_gross_canonical` 的毛回款，再减 `v_revenue_refund_canonical`。来源按自然年依次选择公司月度、真实订单、日报/维护覆盖；公司月度启用时只统计具备完整渠道拆分的月份，不用只有线上范围的订单补齐公司总额。
- `/api/dashboard-data` 同时返回 `kpi.monthRefund` 和 `kpi.yearRefund`，月度和年度主卡在回款大数字右侧分别显示本月退款金额、年度累计退款金额。
- `v_revenue_refund_canonical` 以成本维护的月渠道退款为优先值，没有维护行时才回退公司月度或订单来源退款。所有来源都只在统一聚合阶段扣减一次；退款允许超过毛回款，并按月渠道补齐分摊尾差，无毛回款渠道生成负向调整。
- `fact_sales_member_monthly.recovered_amount_yuan` 不再作为实际回款覆盖源。当订单级真实表启用时，即使同时存在公司月度事实，`salesMemberRows` 仍按订单 `staff_id` 汇总本月/年度目标和实际回款；没有订单时使用统一视图的部门明细。
- 本月目标、年度目标和月趋势目标使用 `biz_target_monthly.target_amount_yuan`，仅取 `staff_id IS NULL` 的部门级目标；本次公司业绩工作簿不导入目标。
- 目标维护完成金额写入 `fact_revenue_monthly_override`。只有能唯一映射到启用经营渠道的组织才能写入覆盖值；总部等无单一渠道的父级组织只能维护目标金额，实际回款保存或导入会被拒绝。同一月份存在父、子组织覆盖值时只采用最上层覆盖值；没有覆盖值的组织继续使用日报明细。统一视图输出毛回款，不包含运营成本或人力成本。
- 渠道目标：`biz_target_monthly.channel_id` 直接关联 `dim_channel` 按渠道汇总，仅取 `staff_id IS NULL` 的部门级目标。
- 渠道二级明细：公司月度结构来自 `v_revenue_company_monthly_allocated`；订单模式保留人员级跟踪；没有订单时，本月/年度目标与毛回款分别来自 `biz_target_monthly` 和 `v_revenue_gross_canonical`，按部门目标完成率降序排列。
- 回款二级弹窗：公司月度事实启用时返回四个渠道月汇总；人员下钻仍读取订单级销售明细，避免把月汇总伪装成个人订单。成交来源环图继续只读取订单级真实来源，不把公司渠道汇总伪装为来源。
- 经营总览趋势图日视图：公司月度模式以当月校准渠道汇总作为月初点；订单模式按日渠道聚合毛回款；日报模式保留真实日期。三种来源都再扣统一退款。无日粒度目标，只展示净实际回款。
- 经营总览趋势图年视图：按自然年汇总已选来源的毛回款并扣减各年统一退款；目标来自 `biz_target_monthly` 的部门级目标。

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
- 总投入费比二级下钻：全渠道视角展示 `totalCost`；选择单个或多个渠道时，主指标只展示所选渠道投放成本合计，底部同时标明全渠道总投入和广告/人力构成。人力成本不强行分摊到单渠道。副标题额外附加“广告ROI” = 当前筛选范围回款 / 广告投入（`adCost` 为 0 时记为 0）。
- 开户数：首页“本月开户数”和“今日开户数”首屏先使用 `/api/dashboard-data.openingAccountMetrics`
  的 `fact_opening_account_daily.opening_count` 兜底；`/api/dashboard-data` 或 `/api/compute-data`
  同步到算力数据后，前端用算力用量分析客户记录数覆盖本月开户数，用“客户记录数 - 零用量客户数”
  覆盖今日开户数，保持首页开户数字与当前算力用量分析页一致。
  旧开户表中的本月/今日 `previous` 仍仅用于算力数据未就绪时的兜底环比。
- 开户二级趋势：`/api/dashboard-data.detailRows.openings` 来自 `fact_opening_account_daily`，前端只按真实日级行聚合年/月/日，不再使用固定前端开户趋势数组或写死开户目标。
- 算力趋势、客户排行、资源健康：默认来自 `fact_compute_usage_daily`、`fact_compute_customer_daily`、`fact_compute_resource_health_daily` 等算力事实表；外部 token/算力接口对应的建表脚本为 `scripts/create_compute_token_usage_tables.sql`。配置 `COMPUTE_API_BASE_URL` 和 `COMPUTE_API_TOKEN` 后，`/api/compute-data` 会通过服务端读取外部算力看板并覆盖运行时算力模块；客户全量明细由 `/api/compute-customers` 分页返回。
- 算力年/月/日序列：前端只对已加载的 `computeUsageTrend` 日级真实行做聚合；外部接口或数据库缺少的日期不再由前端生成补点。
- 算力 overview：总容量/新增/已耗来自 `fact_compute_usage_daily`；客户数、客户用量、客户余额、平均回复率、新开客户数、店铺数来自 `fact_compute_customer_daily` 最新快照——新开客户按手机号在更早日期不存在的记录计数，店铺数按 `customer_name` 同理计数；平均回复率取 `AVG(average_reply_rate)`。
- 算力页前端派生指标：算力利用率 = `consumedCapacity / totalCapacity`；供需关系图把趋势中的用量、按当前总容量缩放后的容量和二者利用率同屏展示；风险客户按客户明细中的低余额（余额不高于 100 万点或余额/用量不高于 3）、高消耗（用量不低于 40 万点）、低回复（平均回复率低于 60%）和零用量标签派生；建议动作由风险标签映射为销售提醒充值、客成激活、客成排查配置、余额预警或高价值场景复盘；版本效率洞察按版本消耗占比计算头部版本和前两版本集中度。在用账户数 = 总客户数 - 用量分布中“算力用量=0”档，复用现有 `computeUsageDistribution` 数据，不新增查询。
- 续费：`fact_renewal_daily` 按渠道×版本先聚合当月到期/已续/续费金额，再 LEFT JOIN 上一月同口径聚合得到 `prev_due_count`/`prev_renewed_count`；当上一月无数据时回退 0。
- 经营节奏：月时间进度按真实日历推导（已过完整月=100%、未到月=0%、当月=已过天数/30），不再使用固定 30 的占位分支；年度时间进度仍按 `latestMonth` 月序 / 12。
- 旧交付聚合：`fact_delivery_order` 聚合交付单数和金额，`biz_delivery_target_monthly` 提供实施工程师月目标；结果继续保留在 `deliveryRows` 供兼容消费者使用，但售前试用交付看板不再展示客户均价、目标完成率或“目标未配置”。

## 售前试用交付看板

- 同一月份快照同时驱动核心指标、渠道环图、阶段风险、月度比较、渠道 / 团队转化与人员负载；月切换不得出现不同模块使用不同时间范围。
- 核心试用转化率使用同一批进入试用并到达观察点的客户，2026-07 为 `12 / 26 = 46.2%`。渠道 / 团队表使用上期启动且已完成观察窗的成熟队列，2026-07 合计为 `15 / 36 = 41.7%`；表内当前试用数和环图总数不是该转化率分母。
- 风险分层展示：阶段“已超期”记录全部超期客户；核心卡记录临近到期加重点超期；未配置负责人、预计金额未填写属于可能重叠的数据治理提醒，不与核心卡简单相加。
- 月度比较由原始值计算。一般指标使用环比百分比，转化率使用百分点 `pp`，平均试用周期使用天数差；风险数与周期下降均判定为改善。
- 配置人员建议容量默认为 14 单；负载比例低于 80% 为正常，80% 至 100% 为偏高，超过 100% 为超负荷。真实接口提供人员级容量后优先使用后端值。
- 真实数据接入仍缺少试用唯一 ID、客户与负责人、开始 / 计划结束 / 实际结束时间、阶段与超期标识、渠道 / 团队、cohort 与观察窗、成熟队列标识、成交状态 / 时间 / 订单、预计与成交金额、风险类型 / 级别 / 去重关联、人员本月累计 / 转化 / 超期 / 容量，以及所选月和自然上月的完整指标。阶段枚举、时区、成交去重、跨渠道归属、币种 / 含税和权限过滤规则也需由后端明确。
- 完整口径和字段清单见 [`../doc/presale-trial-delivery-dashboard.md`](../doc/presale-trial-delivery-dashboard.md)。

## Cost Maintenance Refund Amount

- `biz_channel_cost_monthly.refund_amount_yuan` stores the monthly refund amount for each channel.
- Cost maintenance displays and saves this field in wan, then converts it to yuan before writing to MySQL.
- Dashboard channel investment and ROI aggregation continue to use `investment_amount_yuan` unless a later metric requirement explicitly changes the formula.
- Dashboard recovered metrics subtract monthly refunds from the matching month+channel recovered amount; visible labels remain "回款".
