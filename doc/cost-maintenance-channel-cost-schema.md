# 成本维护：按渠道拆分运营成本与人力成本

更新时间: 2026-07-14 17:09:11 CST
更新内容: 明确退款是净回款扣减项而不是运营/人力成本；毛回款统一来自数据库聚合视图，ROI 改用净回款计算。

更新时间: 2026-07-13 18:53:01 CST
更新内容: 恢复销售部与市场部人力口径；销售部由四个渠道人力自动汇总，市场部继续独立维护，并修正看板总成本兼容规则。

## 业务口径

- 成本维护的最小粒度是“月份 + 渠道”。例如华东线下的运营成本和人力成本都属于华东线下，不与其他渠道共用。
- 每个渠道月份同时维护 `运营成本`、`人力成本`，两项均可填写，允许明确填写为 `0`。
- 销售部人力成本 = 四个渠道人力成本之和，只读自动汇总，不再单独填写。
- 市场部人力成本独立填写，不分摊到四个渠道。
- 渠道总成本 = 运营成本 + 人力成本。
- 毛回款来自 `v_revenue_gross_canonical`，退款来自 `biz_channel_cost_monthly.refund_amount_yuan`；净实际回款 = 毛回款 - 退款。退款可以大于当月毛回款，此时净实际回款允许为负数。
- 退款不是运营成本，也不是人力成本，不进入 `totalCost`；运营成本和人力成本只参与成本与 ROI。
- 渠道 ROI =（净实际回款 - 渠道总成本）/ 渠道总成本。总成本为 0 时 ROI 显示为 0。
- 公司总人力成本 = 销售部人力成本 + 市场部人力成本。
- 公司总成本 = 四个渠道运营成本 + 销售部人力成本 + 市场部人力成本。
- 季度、年度数据由对应月份聚合，不单独写库。

## 数据库设计

渠道月成本统一存储在 `biz_channel_cost_monthly`：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `cost_id` | `BIGINT` | 自增主键 |
| `year_month` | `CHAR(7)` | 月份，格式 `YYYY-MM` |
| `channel_id` | `BIGINT` | 渠道 ID |
| `operations_amount_yuan` | `DECIMAL(18,2)` | 该渠道运营成本，单位元 |
| `labor_amount_yuan` | `DECIMAL(18,2) NULL` | 该渠道人力成本，单位元；`NULL` 表示尚未迁移/配置 |
| `refund_amount_yuan` | `DECIMAL(18,2)` | 该渠道退款金额，单位元 |

`refund_amount_yuan` 与成本字段共用“月份 + 渠道”维护粒度，但统计语义独立：它只从毛回款中扣减，不能并入运营成本、人力成本或公司总成本。

唯一约束为 `uq_channel_cost_month (year_month, channel_id)`，保证一个渠道一个月份只有一行。保存运营成本或人力成本时均原子更新同一行，避免两类成本相互覆盖或产生重复记录。

市场部月人力成本继续存储在 `biz_labor_cost_monthly`：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `labor_cost_id` | `BIGINT` | 自增主键 |
| `year_month` | `CHAR(7)` | 月份，格式 `YYYY-MM` |
| `cost_type` | `VARCHAR` | 新写入固定为 `marketing` |
| `amount_yuan` | `DECIMAL(18,2)` | 市场部人力成本，单位元 |

唯一约束为 `(year_month, cost_type)`。销售部人力不再向该表写入 `sales` 行，因为其来源已经是四个渠道的 `labor_amount_yuan`；查询时直接聚合，避免“渠道合计”和“销售部手填”两套数据不一致。

迁移脚本为 `scripts/migrate_cost_components.sql`，可重复执行。脚本会：

1. 将旧 `investment_amount_yuan` 回填到 `operations_amount_yuan`。
2. 新增可空的 `labor_amount_yuan`，不对旧的全局人力成本做不可靠的渠道分摊。
3. 合并历史重复的渠道月份记录后建立唯一键。
4. 补齐成本表自增主键。

数据库完整性迁移 `scripts/migrate_database_integrity.sql` 会把退款字段统一为 `DECIMAL(18,2)`，并建立 `v_revenue_gross_canonical`。成本维护读取毛回款时只使用该视图，不再直接汇总包含手工部门汇总行的 `fact_revenue_daily`。

如果测试版曾创建过 `NOT NULL DEFAULT 0` 的人力字段，迁移会先改为可空，并把其中无法区分“未配置”的零值恢复为 `NULL`；迁移完成后，用户在新页面明确保存的 `0` 仍作为已配置零值保留。

## 旧数据兼容

旧表 `biz_labor_cost_monthly` 中的 `marketing` 行仍作为市场部人力的正式数据来源，成本维护页可以读取和保存；历史 `sales` 行只用于迁移前月份的兼容兜底，不再由页面新增或更新。旧总额不会平均分摊给华东线下或其他渠道。

看板兼容规则：

1. 当某个月所有渠道的 `labor_amount_yuan` 都是 `NULL` 时，总人力成本使用旧表 `sales + marketing`，保证历史月份不丢数。
2. 一旦该月开始维护任一渠道人力成本，销售部人力改用渠道月表汇总，旧 `sales` 行不再参与；市场部仍读取独立的 `marketing` 行。
3. 渠道 ROI 只使用该渠道的运营成本和人力成本，不把市场部人力强行分摊到渠道。

## 接口与页面

- `GET /api/maintenance/data?page=cost-maintenance&year=YYYY` 返回各渠道的月度 `operations`、`labor`、`totalCost`、毛回款兼容字段 `actual`、`refund`、`netRecovered` 和 `roi`，并额外返回 `laborRows`：销售部只读汇总行、市场部独立维护行。
- `POST /api/maintenance/save` 的渠道成本记录同时包含 `operations_amount_wan`、`labor_amount_wan` 和 `refund_amount_wan`；`laborRows` 只提交 `cost_type=marketing` 的市场部月人力。
- 页面在每个渠道月份单元格内分别显示“运营”和“人力”输入框；华东线下与其他渠道使用相同规则。
- 页面在渠道成本矩阵下方显示部门人力矩阵：销售部随四个渠道输入自动汇总，市场部月份可独立填写。
- 如果旧月份的人力成本尚未配置，用户只修改运营成本或退款时，保存仍保留人力字段为 `NULL`；只有实际编辑人力输入框（包括明确填 `0`）才会将其标记为已配置。
