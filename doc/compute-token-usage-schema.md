# 算力 Token 用量建表说明

更新时间: 2026-07-09 18:26:37 CST
更新内容: 根据外部 token/算力接口建表说明新增本地 MySQL 落库表结构，并说明与现有算力页展示表的兼容关系。

## 建表脚本

建表脚本位于 `scripts/create_compute_token_usage_tables.sql`，可在 `ceo_dashboard` 库重复执行。

脚本来源字段对应桌面文档 `token_usage_api_readme.md` 中两个接口：

- `GET /api/v1/customer-management/getPlatformBoard`
- `GET /api/v1/customer-management/getCustomerBoardList`

## 表结构

本次新增/补齐以下表：

- `dim_compute_level`：版本等级枚举，记录 1 到 10 的版本名称。
- `fact_compute_platform_period`：平台周期汇总，对应 `getPlatformBoard.data` 的 `total`、`incr`、`deduct` 等周期字段。
- `fact_compute_usage_daily`：日维度算力明细，对应 `last_30_day_details` 与 `last_30_day_pool`；保留现有算力页使用的 `usage_points`、`added_points`、`capacity_points`、`target_points`，并补充接口原始字段 `deduct_points`、`incr_points`、`pool_points`、`ocr_deduct_points`、`voc_deduct_points`、`video_deduct_points`、`reply_intercept_deduct_points`、`dialogue_test_deduct_points`。
- `fact_compute_customer_summary_period`：客户周期汇总，对应 `getCustomerBoardList.data` 顶层汇总字段和 `customer_list.total`。
- `fact_compute_customer_snapshot`：客户排行/快照，对应 `customer_list.list`。
- `fact_compute_level_deduct_period`：版本等级周期消耗，对应 `level_deduct_details.details`。
- `fact_compute_usage_range_period`：用量区间客户数，对应 `range_customer_details.details`。

## 主键与 Upsert 口径

- `fact_compute_platform_period` 使用 `(start_time, end_time)` 作为周期唯一键。
- `fact_compute_usage_daily` 新库使用 `stat_date` 唯一键；旧库如果已存在该表，脚本只补字段和索引，不强制重建数据。
- `fact_compute_customer_summary_period` 使用 `(start_time, end_time)` 作为周期唯一键。
- `fact_compute_customer_snapshot` 使用 `(snapshot_date, phone, nick_name)` 做客户快照唯一键，兼容手机号已脱敏但客户名可区分的场景。
- `fact_compute_level_deduct_period` 使用 `(start_time, end_time, level)` 作为唯一键。
- `fact_compute_usage_range_period` 使用 `(start_time, end_time, usage_range)` 作为唯一键。

## 展示兼容关系

现有算力页后端查询仍使用以下旧展示字段：

- `usage_points`：算力用量
- `added_points`：新增算力
- `capacity_points`：容量/余额
- `target_points`：目标用量

外部接口同步任务写入 `fact_compute_usage_daily` 时，应同步写入：

- `deduct_points` 与 `usage_points`
- `incr_points` 与 `added_points`
- `pool_points` 与 `capacity_points`

这样可以让新接口原始字段和现有算力页展示同时可用。`avg_ai_reply_rate` 在新周期/快照表中保留接口原始值；若接口返回 0 到 1 的小数，展示层统一乘以 100。
