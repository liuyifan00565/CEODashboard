# 数据库完整性与统一回款聚合

更新时间: 2026-07-14 17:09:11 CST
更新内容: 建立部门月度回款覆盖表、组织闭包与统一毛回款视图，补齐自然唯一键、迁移台账和应用写入表自增主键。

## 本次解决的问题

- 目标维护曾同时读取 `fact_revenue_daily` 和 `fact_sales_member_monthly`，人员月表会覆盖日报，导致目标页与成本页、经营总览不一致。
- 目标维护的部门月度完成值曾作为 `manual_department` 汇总行写进日报事实表；成本页和看板直接汇总时，会把汇总行与人员明细重复相加。
- 退款按渠道分摊后曾把负数截断为 0，退款大于毛回款时总额不守恒。
- 多张写入表由应用执行 `MAX(id)+1` 生成主键，并发保存或导入可能拿到相同 ID。
- 运行库与空库初始化结构存在漂移，且没有迁移台账。

## 统一业务口径

1. `biz_target_monthly.target_amount_yuan` 是部门月度目标。
2. `fact_revenue_daily.recovered_amount_yuan` 是日级毛回款明细。
3. `fact_revenue_monthly_override.recovered_amount_yuan` 是目标维护录入的部门月度毛回款覆盖值。
4. `biz_channel_cost_monthly.refund_amount_yuan` 是退款扣减项。
5. 净实际回款 = 统一毛回款 - 退款。
6. 运营成本和人力成本不从实际回款中扣减，只参与总成本、费比和 ROI。

## 部门月度覆盖表

`fact_revenue_monthly_override` 以 `year_month + department_id` 为唯一业务键。页面保存和 Excel 导入都使用原子 upsert，不再执行“先查最大主键再插入”，也不再在业务请求中修改表结构。

覆盖规则：

- 某部门某月没有覆盖值时，使用该部门及人员的日报明细。
- 有覆盖值时，该值替代本部门及所有下级组织同月日报明细。
- 父、子组织同月都存在覆盖值时，只采用最上层父组织覆盖值，避免重复。
- 覆盖值为 0 仍表示明确覆盖，不能回退到日报。

## 数据库聚合视图

- `v_department_closure`：组织后代到祖先的闭包关系，包含组织自身。
- `v_revenue_monthly_effective_override`：过滤掉已被上级覆盖的子组织月度覆盖值。
- `v_revenue_gross_canonical`：合并有效月度覆盖与未被覆盖的日报明细，并通过人员维表补齐日报组织。

目标维护、成本维护和经营总览的旧日报分支只能从 `v_revenue_gross_canonical` 读取毛回款。`fact_sales_member_monthly` 不再覆盖实际回款，也不再决定经营总览业务月份。

真实订单模式仍以 `fact_revenue_order.net_amount_yuan` 为净回款权威源；该字段已经包含退款，因此经营总览不会再次扣减成本维护退款。

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
4. 将退款精度统一为 `DECIMAL(18,2)`。
5. 写入 `schema_migrations` 版本 `20260714_database_integrity`。

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
```

接口对账必须满足：目标维护毛回款 = 成本维护毛回款，经营总览净实际回款 = 毛回款 - 退款。退款超过毛回款时净值可以为负数，不能被截断。
