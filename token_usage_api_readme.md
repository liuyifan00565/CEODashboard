# Token Usage API Format for SQL Schema Design

更新时间: 2026-07-09 19:52:00 CST
更新内容: 记录外部 token/算力接口的请求参数、返回字段和建议落库拆表方向，供 SQL 建表使用。

## 接口概览

外部 token/算力数据来自两个接口：

```text
GET /api/v1/customer-management/getPlatformBoard
GET /api/v1/customer-management/getCustomerBoardList
```

请求头：

```text
Accept: application/json
x-token: <token>
```

时间参数使用 Unix 秒级时间戳。当前看板默认取北京时间昨天结束往前 30 天：

```text
start_time=<unix_seconds>
end_time=<unix_seconds>
```

## 通用响应包装

两个接口通常都有一层状态包装，真实业务数据在 `data` 里：

```json
{
  "status_code": 200,
  "message": "success",
  "data": {}
}
```

有些环境也可能返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## getPlatformBoard

请求参数：

```json
{
  "start_time": 1780934400,
  "end_time": 1783526399
}
```

返回 `data` 示例：

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

字段说明：

```text
total: 当前总算力池/总余额
incr: 周期内新增算力
deduct: 周期内总消耗算力
reply_intercept_deduct: 周期内回复拦截消耗
dialogue_test_deduct: 周期内对话测试消耗
last_30_day_details[].date: 日维度日期，常见格式 YYYYMMDD
last_30_day_details[].deduct: 当日总消耗
last_30_day_details[].incr: 当日新增
last_30_day_details[].ocr_deduct: 当日 OCR 消耗
last_30_day_details[].voc_deduct: 当日 VOC 消耗
last_30_day_details[].video_deduct: 当日视频识别消耗
last_30_day_details[].reply_intercept_deduct: 当日回复拦截消耗
last_30_day_details[].dialogue_test_deduct: 当日对话测试消耗
last_30_day_pool[].date: 日维度日期
last_30_day_pool[].pool: 当日容量池/余额
```

## getCustomerBoardList

请求参数：

```json
{
  "customer_manager": "",
  "sales_manager": "",
  "start_time": 1780934400,
  "end_time": 1783526399,
  "level": 0,
  "limit_type": 1,
  "page": 1,
  "page_size": 20,
  "sort_type": 1
}
```

实时看板目前只拉 `page_size=20` 的客户排行样本，避免页面等待。后续完整客户数据建议由数据库同步任务增量拉取。

返回 `data` 示例：

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

字段说明：

```text
customer_num: 当前客户数
deduct: 周期内客户总消耗
pool: 当前客户总余额/容量池
avg_ai_reply_rate: 平均 AI 回复率。可能是 0-1 小数，展示时需乘以 100
new_customer_num: 周期内新客户数
new_shop_num: 周期内新店铺数
video_deduct: 周期内视频识别消耗
voc_deduct: 周期内 VOC 消耗
customer_list.total: 满足筛选条件的客户总数
customer_list.list[].phone: 客户手机号/账号标识，可能已脱敏
customer_list.list[].nick_name: 客户/店铺/账号名称
customer_list.list[].level: 版本等级枚举
customer_list.list[].sales_manager: 销售负责人
customer_list.list[].customer_manager: 客成负责人
customer_list.list[].deduct: 客户周期内消耗
customer_list.list[].pool: 客户当前余额
customer_list.list[].avg_ai_reply_rate: 客户平均 AI 回复率。可能是 0-1 小数
customer_list.list[].video_deduct: 客户视频识别消耗
customer_list.list[].voc_deduct: 客户 VOC 消耗
level_deduct_details.details[].level: 版本等级枚举
level_deduct_details.details[].deduct: 对应版本周期消耗
range_customer_details.details[].range: 用量区间文案
range_customer_details.details[].num: 对应用量区间客户数
```

## 版本等级枚举

```text
1: 个人版
2: 试用版
3: 企业版
4: 旗舰版
5: 免费版
6: 卓越版
7: 创世版
8: 至尊版ultra
9: 启航版
10: 定制尊享版
```

## 建议落库方向

可以按以下事实表/维表拆分：

```text
fact_compute_platform_period
- start_time
- end_time
- total_points
- incr_points
- deduct_points
- reply_intercept_deduct_points
- dialogue_test_deduct_points
- synced_at

fact_compute_usage_daily
- stat_date
- deduct_points
- incr_points
- pool_points
- ocr_deduct_points
- voc_deduct_points
- video_deduct_points
- reply_intercept_deduct_points
- dialogue_test_deduct_points
- synced_at

fact_compute_customer_snapshot
- snapshot_date
- phone
- nick_name
- level
- sales_manager
- customer_manager
- deduct_points
- pool_points
- avg_ai_reply_rate
- video_deduct_points
- voc_deduct_points
- synced_at

fact_compute_customer_summary_period
- start_time
- end_time
- customer_num
- customer_total
- deduct_points
- pool_points
- avg_ai_reply_rate
- new_customer_num
- new_shop_num
- video_deduct_points
- voc_deduct_points
- synced_at

fact_compute_level_deduct_period
- start_time
- end_time
- level
- deduct_points
- synced_at

fact_compute_usage_range_period
- start_time
- end_time
- usage_range
- customer_count
- synced_at
```

同步策略建议：

```text
1. platform daily/summary 每次按时间窗 upsert。
2. customer snapshot 初期可分页全量同步，之后按可用的更新时间/新增客户逻辑做增量。
3. 看板实时接口只取少量排行；完整排行、筛选、历史趋势应优先查本地数据库。
4. 回复率字段入库可保留原始小数，同时增加展示百分比派生字段或在查询层统一乘以 100。
```
