# Compute API Integration

更新时间: 2026-07-09 17:55:00 CST
更新内容: 外部算力接口按真实 Network 行为改为 GET query 请求；base/path 同时带 `/csrc` 时服务端会去重。

更新时间: 2026-07-09 17:45:00 CST
更新内容: 前端在全量 dashboard 成功后仍会读取 `/api/compute-data` 覆盖 token/算力模块；外部接口 path 支持环境变量配置。

更新时间: 2026-07-09 17:28:00 CST
更新内容: 明确外部算力接口失败不会阻塞 `/api/dashboard-data`，本地 MySQL 快照会继续返回。

更新时间: 2026-07-09 17:05:00 CST
更新内容: 增加 `/api/compute-data` 独立算力接口说明，支持全量 MySQL 快照失败时只回退加载 token/算力数据。

更新时间: 2026-07-09 16:18:00 CST
更新内容: 新增外部算力看板 API 接入说明，记录服务端环境变量、接口路径和字段映射方式。

## 接入方式

算力页默认仍可使用本地 MySQL 的算力事实表聚合结果。若服务端环境同时提供以下变量，则服务端会调用外部算力看板接口，并用外部返回覆盖快照中的算力模块：

```text
COMPUTE_API_BASE_URL
COMPUTE_API_TOKEN
COMPUTE_PLATFORM_BOARD_PATH
COMPUTE_CUSTOMER_BOARD_PATH
```

`COMPUTE_API_BASE_URL` 应指向外部服务的 API base，例如带 `/csrc` 的地址。`COMPUTE_API_TOKEN` 只在 Node 服务端读取，并作为 `x-token` 请求头发送；前端不会直接读取或传递该 token。
`COMPUTE_PLATFORM_BOARD_PATH` 和 `COMPUTE_CUSTOMER_BOARD_PATH` 可选；如果真实页面 Network 里看到的接口路径与默认值不同，就用这两个变量覆盖。

外部算力数据有两条读取路径：

- `/api/dashboard-data`：本地 MySQL 快照生成成功后，额外覆盖其中的算力模块。
- `/api/compute-data`：只读取外部算力数据并返回 `computeOverview`、`computeUsageTrend`、`computeVersionConsumption`、`computeUsageDistribution`、`computeCustomerRows`。前端在 `/api/dashboard-data` 成功后仍会继续尝试该接口，用它覆盖 token/算力模块；如果 `/api/dashboard-data` 失败，也会自动尝试该接口，因此其它看板数据保持原有展示，token/算力模块可单独接真实数据。

如果外部算力接口返回 404、鉴权失败或其它异常，`/api/dashboard-data` 会保留本地 MySQL 生成的快照继续返回，不让 token/算力覆盖失败影响其它模块。此时 `/api/compute-data` 仍会返回对应错误，用于排查外部接口 base/path/token 配置。

## 外部接口

服务端用 GET query 调用两个接口，请求头携带 `x-token`：

```text
GET /api/v1/customer-management/getPlatformBoard
GET /api/v1/customer-management/getCustomerBoardList
```

这两个路径是默认值。若当前真实页面使用其它 path，在 `.env.local` 中设置 `COMPUTE_PLATFORM_BOARD_PATH` / `COMPUTE_CUSTOMER_BOARD_PATH` 即可替换，不需要改代码。`COMPUTE_API_BASE_URL` 和 path 如果同时包含 `/csrc`，服务端会按单个 `/csrc` 拼接，避免出现 `/csrc/csrc/...`。

`getPlatformBoard` 使用 `{ start_time, end_time }`，提供算力总容量、新增算力、消耗算力、近 30 日用量趋势和容量趋势。

`getCustomerBoardList` 使用客户筛选、分页和排序参数，当前看板默认请求全部客户、`page_size=200`、按算力用量排序。该接口提供客户数、客户算力用量/余额、新开客户/店铺、平均回复率、版本消耗、用量区间分布和客户明细排行。

## 快照字段

外部返回会映射到现有前端字段：

```text
computeOverview
computeUsageTrend
computeVersionConsumption
computeUsageDistribution
computeCustomerRows
```

因此前端 `ComputeUsagePage` 不需要直接知道外部接口；它仍只读取 `/api/dashboard-data` 生成的运行时快照。
当本地 MySQL 不可用时，前端会改读 `/api/compute-data`，但字段结构仍保持一致。
