# 成本维护：按渠道拆分运营成本与人力成本

更新时间: 2026-07-13 16:48:56 CST
更新内容: 成本维护改为每个渠道、每个月分别填写运营成本和人力成本，并修正数据库唯一键与旧人力成本兼容规则。

## 业务口径

- 成本维护的最小粒度是“月份 + 渠道”。例如华东线下的运营成本和人力成本都属于华东线下，不与其他渠道共用。
- 每个渠道月份同时维护 `运营成本`、`人力成本`，两项均可填写，允许明确填写为 `0`。
- 渠道总成本 = 运营成本 + 人力成本。
- 渠道 ROI =（渠道成交额 - 渠道总成本）/ 渠道总成本。总成本为 0 时 ROI 显示为 0。
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

唯一约束为 `uq_channel_cost_month (year_month, channel_id)`，保证一个渠道一个月份只有一行。保存运营成本或人力成本时均原子更新同一行，避免两类成本相互覆盖或产生重复记录。

迁移脚本为 `scripts/migrate_cost_components.sql`，可重复执行。脚本会：

1. 将旧 `investment_amount_yuan` 回填到 `operations_amount_yuan`。
2. 新增可空的 `labor_amount_yuan`，不对旧的全局人力成本做不可靠的渠道分摊。
3. 合并历史重复的渠道月份记录后建立唯一键。
4. 补齐成本表自增主键。

如果测试版曾创建过 `NOT NULL DEFAULT 0` 的人力字段，迁移会先改为可空，并把其中无法区分“未配置”的零值恢复为 `NULL`；迁移完成后，用户在新页面明确保存的 `0` 仍作为已配置零值保留。

## 旧数据兼容

旧表 `biz_labor_cost_monthly` 没有渠道维度，只能表示整月总人力成本。新成本维护页不再读写该表，也不会把旧总额平均分摊给华东线下或其他渠道。

看板兼容规则：当某个月所有渠道的 `labor_amount_yuan` 都是 `NULL` 时，仍使用旧表的人力成本总额；一旦该月开始维护任一渠道人力成本，看板即改用渠道月表汇总。这样可避免旧总额与新渠道人力重复计算。

## 接口与页面

- `GET /api/maintenance/data?page=cost-maintenance&year=YYYY` 返回各渠道的月度 `operations`、`labor`、`totalCost`、`actual`、`refund` 和 `roi`。
- `POST /api/maintenance/save` 的每条成本记录同时包含 `operations_amount_wan`、`labor_amount_wan` 和 `refund_amount_wan`。
- 页面在每个渠道月份单元格内分别显示“运营”和“人力”输入框；华东线下与其他渠道使用相同规则。
- 如果旧月份的人力成本尚未配置，用户只修改运营成本或退款时，保存仍保留人力字段为 `NULL`；只有实际编辑人力输入框（包括明确填 `0`）才会将其标记为已配置。
