# 数据库完整性与统一回款聚合

更新时间: 2026-07-14 19:02:00 CST
更新内容: 公司月度事实新增每月一个 `structure` 展示项；它只展示已包含在 total 中的特殊渠道金额，不参与主 KPI、统一回款选源、退款分摊或渠道成本。

更新时间: 2026-07-14 18:32:40 CST
更新内容: 新增父组织优先的有效目标视图；按自然年统一三类回款来源，建立金额守恒分摊与“成本维护优先、导入退款兜底”的统一退款视图；显式零值 total 同样会锁定该年公司月度来源。

更新时间: 2026-07-14 17:09:11 CST
更新内容: 建立部门月度回款覆盖表、组织闭包与统一毛回款视图，补齐自然唯一键、迁移台账和应用写入表自增主键。

## 本次解决的问题

- 目标维护曾同时读取 `fact_revenue_daily` 和 `fact_sales_member_monthly`，人员月表会覆盖日报，导致目标页与成本页、经营总览不一致。
- 目标维护的部门月度完成值曾作为 `manual_department` 汇总行写进日报事实表；成本页和看板直接汇总时，会把汇总行与人员明细重复相加。
- 退款按渠道分摊后曾把负数截断为 0，退款大于毛回款时总额不守恒。
- 公司月度事实只按来源行哈希去重，更换文件名后可能写入同月多个 total 或重复渠道行。
- 多张写入表由应用执行 `MAX(id)+1` 生成主键，并发保存或导入可能拿到相同 ID。
- 运行库与空库初始化结构存在漂移，且没有迁移台账。

## 统一业务口径

1. `biz_target_monthly.target_amount_yuan` 是部门月度目标。
2. `fact_revenue_channel_monthly` 是公司月度导入事实：`total` 行是月度毛回款和退款权威总额，`channel` 行只提供四渠道原始占比，`structure` 行只记录已包含在 total 中的特殊渠道展示金额。
3. `fact_revenue_order.sales_amount_yuan` 是真实订单毛回款，`refund_amount_yuan` 是订单导入退款。
4. `fact_revenue_daily.recovered_amount_yuan` 是日级毛回款明细。
5. `fact_revenue_monthly_override.recovered_amount_yuan` 是目标维护录入的部门月度毛回款覆盖值。
6. `biz_channel_cost_monthly.refund_amount_yuan` 是可编辑退款扣减项；同月同渠道存在成本维护行时优先使用该值，导入源退款只作兜底和审计。
7. 净实际回款 = 统一毛回款 - 统一退款。
8. 运营成本和人力成本不从实际回款中扣减，只参与总成本、费比和 ROI。

`fact_revenue_channel_monthly` 只允许三种层级/渠道组合：`total + channel_id IS NULL`、`channel + channel_id IS NOT NULL` 或 `structure + channel_id IS NULL`。虚拟列 `scope_channel_id` 将 total/structure 固定映射为 `0`、channel 映射为真实渠道 ID，唯一键 `year_month + record_level + scope_channel_id` 保证每月只有一个 total、每月每渠道只有一行且每月最多一个 structure。渠道外键使用 `ON DELETE RESTRICT`，避免渠道删除后产生不合法的空渠道明细。

## 部门月度覆盖表

`fact_revenue_monthly_override` 以 `year_month + department_id` 为唯一业务键。页面保存和 Excel 导入都使用原子 upsert，不再执行“先查最大主键再插入”，也不再在业务请求中修改表结构。

覆盖规则：

- 某部门某月没有覆盖值时，使用该部门及人员的日报明细。
- 有覆盖值时，该值替代本部门及所有下级组织同月日报明细。
- 父、子组织同月都存在覆盖值时，只采用最上层父组织覆盖值，避免重复。
- 覆盖值为 0 仍表示明确覆盖，不能回退到日报。

## 数据库聚合视图

- `v_department_closure`：组织后代到祖先的闭包关系，包含组织自身。
- `v_target_monthly_effective`：只保留部门级月度目标；同月父、子组织都有目标时，父组织目标覆盖其所有后代目标。目标维护汇总和经营总览目标只读该视图，避免父子目标重复累加。
- `v_revenue_monthly_effective_override`：过滤掉已被上级覆盖的子组织月度覆盖值。
- `v_revenue_company_monthly_allocated`：先汇总每月 `total` 权威毛回款和退款，再按 `channel` 原始占比分配到渠道；`structure` 明确排除在权威总额与分摊权重之外。各渠道保留两位小数，按 `channel_id` 排序的最后一个渠道承接尾差，因此渠道合计与 total 精确相等。某指标的渠道权重合计为 0 时优先借用另一指标的渠道占比，两项权重都为 0 时由最后一渠道承接该指标总额。total 没有渠道行时一律生成 `channel_id/department_id = NULL` 的“未归属”记录；即使毛回款和退款都是 0，也作为显式事实保留并参与年度选源。
- `v_revenue_gross_canonical`：按自然年选择唯一毛回款源。该年存在有效公司月度分摊时，整年只使用公司月度源；否则该年存在 `stat_date` 非空的真实订单时，整年只使用订单 `sales_amount_yuan`；否则使用日报与有效部门月度覆盖。
- `v_revenue_refund_canonical`：按“月 + 渠道”优先读取成本维护退款；没有对应成本维护行时，回退当前自然年已选收入源自带的退款。公司月度源使用分摊退款，订单源按月渠道聚合退款，日报源没有导入退款兜底。

目标维护、成本维护和经营总览只能从 `v_revenue_gross_canonical` 读取毛回款，并从 `v_revenue_refund_canonical` 读取退款；维护页和看板的目标聚合只读取 `v_target_monthly_effective`。`fact_sales_member_monthly` 不再覆盖实际回款，也不再决定经营总览业务月份。

公司月度和真实订单事实表都保留自身退款用于导入审计与未维护月份兜底，但不能绕过成本维护的显式退款值。成本维护行即使填写为 `0` 也表示明确覆盖，不能回退到导入退款。

公司月度与订单行的组织归属优先使用人员所属部门；没有人员部门时按渠道键映射：`online → online-sales`、`south → south-sales`、`east → east-sales`、`agent → agent-sales`。同时兼容历史/外部组织编码 `south-region` 与 `east-region`，但不修改现有组织种子。

## 主键与唯一键

以下主键统一为 `BIGINT AUTO_INCREMENT`：

- `biz_target_monthly.target_id`
- `fact_revenue_daily.id`
- `dim_staff.staff_id`
- `dim_channel_source.source_id`
- `dim_product_version.version_id`
- `import_batch.batch_id`
- `dim_channel.channel_id`
- `dim_department.department_id`

应用插入时省略这些主键；需要关联新记录时读取 MySQL 返回的 `insertId`。自增 ID 出现空洞属于正常现象，不承载排序、年份或其它业务含义。

自然唯一键包括渠道键、来源编码、组织编码、人员编码、版本键和部门月度目标作用域。迁移发现已有重复时会终止并提示修复，不会静默删除业务数据。

## 迁移与回滚

现有数据卷执行 `scripts/migrate_database_integrity.sql`；空数据卷由 `docker/db-init/ceo_dashboard_full.sql` 直接建立最终结构。迁移会：

1. 补齐日报组织与实际开户字段。
2. 将历史 `manual_department` 行按“同部门同月最新 ID”迁入覆盖表，再从日报事实表删除旧汇总行。
3. 建立组织覆盖视图、自然唯一键和自增主键。
4. 校验公司月度事实的层级/渠道组合和业务重复，发现问题即终止，不静默删除；校验通过后更新作用域唯一键与 CHECK 约束，使存量库合法支持每月一个 structure。
5. 建立公司月度金额守恒分摊、自然年毛回款选源和退款优先级视图。
6. 将退款精度统一为 `DECIMAL(18,2)`。
7. 写入 `schema_migrations` 版本 `20260714_database_integrity`。

完整初始化 SQL 会在创建视图前补齐 `fact_revenue_order` 和 `fact_revenue_channel_monthly`，保证空库仅执行 `docker/db-init/ceo_dashboard_full.sql` 也能得到最终结构。现有数据卷必须先执行订单表和公司月度表迁移，再最后执行本完整性迁移。

迁移前必须使用 `mysqldump` 备份。迁移脚本可重复执行；已发布脚本不得原地改写，后续结构调整应新增迁移版本。

## 验收

迁移后至少验证：

```sql
SELECT TABLE_NAME, COLUMN_NAME, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND EXTRA LIKE '%auto_increment%';

SELECT version, description, applied_at
FROM schema_migrations
ORDER BY applied_at;

SELECT DATE_FORMAT(stat_date, '%Y-%m') AS year_month,
       SUM(recovered_amount_yuan) AS gross_recovered_yuan
FROM v_revenue_gross_canonical
GROUP BY DATE_FORMAT(stat_date, '%Y-%m');

SELECT allocated.`year_month`,
       SUM(allocated.gross_amount_yuan) AS allocated_gross_yuan,
       SUM(allocated.refund_amount_yuan) AS allocated_refund_yuan,
       totals.total_gross_yuan,
       totals.total_refund_yuan
FROM v_revenue_company_monthly_allocated allocated
JOIN (
  SELECT `year_month`,
         SUM(gross_amount_yuan) AS total_gross_yuan,
         SUM(refund_amount_yuan) AS total_refund_yuan
  FROM fact_revenue_channel_monthly
  WHERE record_level = 'total'
  GROUP BY `year_month`
) totals ON totals.`year_month` = allocated.`year_month`
GROUP BY allocated.`year_month`, totals.total_gross_yuan, totals.total_refund_yuan;

SELECT `year_month`, channel_id, refund_amount_yuan, source_kind
FROM v_revenue_refund_canonical
ORDER BY `year_month`, channel_id;
```

接口对账必须满足：目标维护毛回款 = 成本维护毛回款，经营总览净实际回款 = 毛回款 - 退款。退款超过毛回款时净值可以为负数，不能被截断。
