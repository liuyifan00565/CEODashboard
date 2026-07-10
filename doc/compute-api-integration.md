# Compute API Integration

更新时间: 2026-07-10 15:58:00 CST
更新内容: 客户分页同步从算力页组件挂载流程提升到 App 后台流程：`/api/compute-data` 成功后立即按
          `/api/compute-customers?page=&pageSize=200` 循环同步客户明细，用户未进入算力页时也会后台加载；
          算力页只接收并展示客户同步状态，避免进入页面才开始拉客户。

更新时间: 2026-07-09 21:15:00 CST
更新内容: 新增 `/api/compute-customers` 分页接口，算力页进入后在后台按 200/页循环拉取全量客户列表并增量合并到表格，
          不再受首屏 20 条采样限制；客户表按手机号去重合并，实测发现 `getCustomerBoardList` 按 `sort_type: 1`
          （算力用量）分页时，因用量字段实时变化会导致排名漂移——顺序翻页会出现同一客户跨页重复、另一部分客户
          从未出现的情况（实测 total=4970 时，遍历 25 页拿到 4970 行原始记录，去重后仅剩约 3869 个不同手机号）。
          这是外部接口本身在活跃排序字段上做偏移分页的已知限制，不是前端合并逻辑的 bug；README 里也建议全量客户
          数据改由数据库同步任务增量拉取，而不是页面里实时全量翻页。
          同时移除首页全屏阻塞加载占位，`/api/dashboard-data` 未就绪时仪表盘用本地快照立即渲染，顶栏改为轻量
          同步提示条 `dash-sync-pill`。

更新时间: 2026-07-09 20:08:00 CST
更新内容: token 同步状态条仅在后台同步仍在加载时显示；数据库加载占位增加短延迟减少刷新闪烁。

更新时间: 2026-07-09 19:52:00 CST
更新内容: 外部算力数据改为首页数据就绪后后台同步；算力页仅在同步未完成时显示状态条；客户明细实时只取 20 条。

更新时间: 2026-07-09 19:32:00 CST
更新内容: 外部算力数据改为进入算力页后按需读取；客户明细实时只取 50 条；补充原始 API 返回格式供建表参考。

更新时间: 2026-07-09 19:05:00 CST
更新内容: 客户明细恢复为首屏页加载以缩短打开时间；前端只在 dashboard-data 失败时回退 compute-data；趋势缺失日期使用本地历史占位补齐。

更新时间: 2026-07-09 18:18:00 CST
更新内容: 补齐全量客户分页、回复率百分比归一、组件级消耗映射，以及前端仅使用真实外部趋势派生月/年视图的说明。

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

- `/api/dashboard-data`：只生成本地 MySQL 经营快照，不再实时调用外部算力接口；这是前端首屏的优先读取入口。
- `/api/compute-data`：只读取外部算力数据并返回 `computeOverview`、`computeUsageTrend`、`computeVersionConsumption`、`computeUsageDistribution`、`computeCustomerRows`（首屏 20 条采样）、`computeResourceHealth`。前端在 `/api/dashboard-data` 成功后后台调用该接口；如果用户进入算力页时同步还没完成，算力页才显示状态条。
- `/api/compute-customers?page=&pageSize=`：只读取 `getCustomerBoardList` 的某一页客户明细，返回 `{ rows, total, page, pageSize }`。`App` 在 `/api/compute-data` 就绪后，于后台按 `pageSize=200` 从 `page=1` 开始循环调用该接口，每页到达后立即按手机号合并进客户表（不整体替换、不阻塞其它区块渲染），直到某页返回的行数少于 `pageSize` 或已合并数量达到 `total` 为止。该流程不依赖算力页是否已经打开；算力页只展示同步状态和已合并结果。

如果外部算力接口返回 404、鉴权失败或其它异常，`/api/dashboard-data` 会保留本地 MySQL 生成的快照继续返回，不让 token/算力覆盖失败影响其它模块。此时 `/api/compute-data` 仍会返回对应错误，用于排查外部接口 base/path/token 配置。

## 外部接口

服务端用 GET query 调用两个接口，请求头携带 `x-token`：

```text
GET /api/v1/customer-management/getPlatformBoard
GET /api/v1/customer-management/getCustomerBoardList
```

这两个路径是默认值。若当前真实页面使用其它 path，在 `.env.local` 中设置 `COMPUTE_PLATFORM_BOARD_PATH` / `COMPUTE_CUSTOMER_BOARD_PATH` 即可替换，不需要改代码。`COMPUTE_API_BASE_URL` 和 path 如果同时包含 `/csrc`，服务端会按单个 `/csrc` 拼接，避免出现 `/csrc/csrc/...`。

`getPlatformBoard` 使用 `{ start_time, end_time }`，提供算力总容量、新增算力、消耗算力、近 30 日用量趋势和容量趋势。

`getCustomerBoardList` 使用客户筛选、分页和排序参数，当前看板默认按算力用量排序，实时只读取 20 条客户明细用于表格排行，并保留接口返回的 `total` 作为总客户数。该接口提供客户数、客户算力用量/余额、新开客户/店铺、平均回复率、版本消耗、用量区间分布和客户明细排行。后续完整客户历史应由数据库同步任务增量写入，再由看板查询本地库。

回复率字段如果以 0-1 小数返回，会在服务端统一换算为 0-100 百分比，避免前端风险判断和展示把 0.69 当作 0.69%。

## 快照字段

外部返回会映射到现有前端字段：

```text
computeOverview
computeUsageTrend
computeVersionConsumption
computeUsageDistribution
computeCustomerRows
computeResourceHealth
```

因此前端 `ComputeUsagePage` 不需要直接知道外部接口；它仍只读取 `/api/dashboard-data` 生成的运行时快照。
当本地 MySQL 不可用时，前端会改读 `/api/compute-data`，但字段结构仍保持一致。

`computeResourceHealth` 使用外部接口中的 `ocr_deduct`、`voc_deduct`、`video_deduct`、`reply_intercept_deduct`、`dialogue_test_deduct` 派生组件级 token 消耗构成。前端日维度优先使用外部接口返回日期的数据；接口未覆盖的日期继续使用本地历史占位补齐，避免月/年趋势因为外部接口只有短窗口而断档。

## 原始外部 API 返回格式

外部接口通常会包一层状态字段，真实数据在 `data` 中：

```json
{
  "status_code": 200,
  "message": "success",
  "data": {}
}
```

`getPlatformBoard` 的 `data` 结构：

```json
{
  "total": 2650773741,
  "incr": 449249887,
  "deduct": 139751667,
  "reply_intercept_deduct": 195636,
  "dialogue_test_deduct": 0,
  "last_30_day_details": [
    {
      "date": 20260630,
      "deduct": 5360000,
      "incr": 0,
      "ocr_deduct": 120294,
      "voc_deduct": 112388,
      "video_deduct": 5,
      "reply_intercept_deduct": 1,
      "dialogue_test_deduct": 0
    }
  ],
  "last_30_day_pool": [
    {
      "date": 20260630,
      "pool": 26000000
    }
  ]
}
```

`getCustomerBoardList` 的 `data` 结构：

```json
{
  "customer_num": 5558,
  "deduct": 34186157,
  "pool": 2650773741,
  "avg_ai_reply_rate": 0.704,
  "new_customer_num": 52,
  "new_shop_num": 1174,
  "video_deduct": 5245,
  "voc_deduct": 2248780,
  "customer_list": {
    "total": 4905,
    "list": [
      {
        "phone": "150****1491",
        "nick_name": "一本官方旗舰店",
        "level": 8,
        "sales_manager": "雪姐",
        "customer_manager": "龙涛",
        "deduct": 2010190,
        "pool": 7783896,
        "avg_ai_reply_rate": 0.81,
        "video_deduct": 88,
        "voc_deduct": 1200
      }
    ]
  },
  "level_deduct_details": {
    "total": 110,
    "details": [
      { "level": 6, "deduct": 37 }
    ]
  },
  "range_customer_details": {
    "total": 105,
    "details": [
      { "range": "算力用量=0", "num": 75 },
      { "range": "算力用量>10000", "num": 10 }
    ]
  }
}
```
