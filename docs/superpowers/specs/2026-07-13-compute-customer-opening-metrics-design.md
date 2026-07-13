# Compute Customer Opening Metrics Design

更新时间: 2026-07-13 14:40:00 CST
更新内容: 明确本月开户数和今日开户数由接口提供，并允许在开户事实表缺失时使用算力全量客户快照差分计算。

## Context

The CEO dashboard currently renders `本月开户数` and `今日开户数` from `overview.openingAccountMetrics` in `/api/dashboard/bootstrap`.

The preferred source is `fact_opening_account_daily.opening_count`. The compute customer table `fact_compute_customer_daily` is confirmed to represent all customers for each snapshot date, so the API can also derive opening counts from daily customer-count differences when the opening fact table is unavailable or empty for the requested period.

## Goal

Expose opening metrics from the API as explicit dashboard fields so the frontend does not infer them locally.

## Data Sources

- Primary: `fact_opening_account_daily`
  - `monthOpenings.current_count`: sum of `opening_count` from the requested month.
  - `monthOpenings.previous_count`: sum of `opening_count` from the previous month.
  - `todayOpenings.current_count`: `opening_count` for the dashboard business date.
  - `todayOpenings.previous_count`: `opening_count` for the previous business date.
- Fallback: `fact_compute_customer_daily`
  - Treat each `stat_date` as a full customer snapshot.
  - Daily opening count is `current_day_distinct_customer_count - previous_day_distinct_customer_count`.
  - Monthly opening count is `latest_snapshot_count_in_month - latest_snapshot_count_before_month`.
  - Negative differences are clamped to `0` because churn or data backfill should not display as negative account openings.

## API Shape

`/api/dashboard/bootstrap` continues returning `overview.openingAccountMetrics` with the existing display contract:

```json
[
  {
    "key": "month-openings",
    "title": "本月开户数",
    "metric": "monthOpenings",
    "value": 126,
    "unit": "户",
    "delta": 8.2,
    "compareLabel": "较上月",
    "keywords": ["开户", "本月开户数"],
    "source": "opening_account"
  },
  {
    "key": "today-openings",
    "title": "今日开户数",
    "metric": "todayOpenings",
    "value": 9,
    "unit": "户",
    "delta": 12.5,
    "compareLabel": "较昨日",
    "keywords": ["开户", "今日开户数"],
    "source": "opening_account"
  }
]
```

When fallback is used, `source` is `compute_customer_snapshot`.

## Selection Rules

1. Query `fact_opening_account_daily` for the requested month and comparison periods.
2. Use the primary source when either requested metric has non-zero primary data.
3. If the primary source has no usable rows for both metrics, derive both metrics from `fact_compute_customer_daily`.
4. Return the same frontend display fields regardless of source.

## Error Handling

- If neither source has usable data, return zero values with `source: "empty"`.
- Do not make the frontend perform customer-count subtraction.
- Do not add a new frontend request; keep the bootstrap payload as the single source for dashboard opening metrics.

## Testing

- Add a server test proving the existing primary opening fact rows still build the same card values.
- Add a server test proving compute customer snapshots derive daily and monthly opening counts.
- Add a server test proving fallback clamps negative customer-count differences to zero.

## Documentation

Update the dashboard README data-source section when implementation lands:

- Opening metrics are provided by `/api/dashboard/bootstrap`.
- The API prefers `fact_opening_account_daily`.
- If the opening fact table is empty, the API derives counts from full daily snapshots in `fact_compute_customer_daily`.
