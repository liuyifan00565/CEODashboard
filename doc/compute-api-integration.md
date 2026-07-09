# Compute API Integration

更新时间: 2026-07-09 17:05:00 CST
更新内容: 增加 `/api/compute-data` 独立算力接口说明，支持全量 MySQL 快照失败时只回退加载 token/算力数据。

更新时间: 2026-07-09 16:18:00 CST
更新内容: 新增外部算力看板 API 接入说明，记录服务端环境变量、接口路径和字段映射方式。

## 接入方式

算力页默认仍可使用本地 MySQL 的算力事实表聚合结果。若服务端环境同时提供以下变量，则服务端会调用外部算力看板接口，并用外部返回覆盖快照中的算力模块：

```text
COMPUTE_API_BASE_URL
COMPUTE_API_TOKEN
```

`COMPUTE_API_BASE_URL` 应指向外部服务的 API base，例如带 `/csrc` 的地址。`COMPUTE_API_TOKEN` 只在 Node 服务端读取，并作为 `x-token` 请求头发送；前端不会直接读取或传递该 token。

外部算力数据有两条读取路径：

- `/api/dashboard-data`：本地 MySQL 快照生成成功后，额外覆盖其中的算力模块。
- `/api/compute-data`：只读取外部算力数据并返回 `computeOverview`、`computeUsageTrend`、`computeVersionConsumption`、`computeUsageDistribution`、`computeCustomerRows`。前端在 `/api/dashboard-data` 失败时会自动尝试该接口，因此其它看板数据保持原有展示，token/算力模块可单独接真实数据。

## 外部接口

服务端调用两个接口：

```text
POST /api/v1/customer-management/getPlatformBoard
POST /api/v1/customer-management/getCustomerBoardList
```

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
