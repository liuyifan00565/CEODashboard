# 2026-07-09 目标维护导入功能变更日志

## 本次改了什么

这次主要修改的是“数据维护 > 目标维护”里的模板下载和 Excel 导入逻辑。

原来的目标维护模板偏向“人员维度”，也就是按某个人填写每月目标。现在已经调整成“组织维度”，也就是按某个组织填写每月目标或每月实际完成情况。

## 下载模板的变化

点击“下载模板”后，现在会弹出两个模板选项：

1. 目标模板
   - 用来填写每个组织每个月的目标。
   - 表格字段包括：
     - 组织名称
     - 目标月份
     - 回款目标
     - 开户目标
     - 订单目标

2. 实际完成模板
   - 用来填写每个组织每个月真实完成了多少。
   - 表格字段包括：
     - 组织名称
     - 完成月份
     - 实际回款
     - 实际开户数
     - 实际订单数

注意：这两个模板是两个独立的 Excel 模板，不是一个 Excel 里强行合并两个模板。

## Excel 导入的变化

Excel 导入现在可以自动识别两类表：

1. 组织目标表
2. 组织实际完成表

也就是说，导入时有三种情况都支持：

1. 只导入目标模板。
2. 只导入实际完成模板。
3. 一个 Excel 文件里同时放目标表和实际完成表，一次性导入两个表。

系统会根据表头自动判断这张表是“目标表”还是“实际完成表”。

## 数据库写入位置

### 组织目标

组织目标写入表：

```text
biz_target_monthly
```

关键字段：

```text
department_id
year_month
target_amount_yuan
target_opening_count
target_order_count
```

这里的 `department_id` 表示这条目标属于哪个组织。

### 组织实际完成

组织实际完成写入表：

```text
fact_revenue_daily
```

关键字段：

```text
department_id
stat_date
recovered_amount_yuan
actual_opening_count
order_count
```

其中：

- `department_id` 表示这条实际完成属于哪个组织。
- `stat_date` 使用对应月份的 1 号，比如 `2026-07` 会写成 `2026-07-01`。
- `recovered_amount_yuan` 存实际回款金额。
- `actual_opening_count` 存实际开户数。
- `order_count` 存实际订单数。

## 数据库结构新增字段

为了让“实际开户数”能够真正写入数据库，本次给 `fact_revenue_daily` 增加了两个字段：

```text
department_id BIGINT NULL
actual_opening_count INT NOT NULL DEFAULT 0
```

这样实际完成表导入后，不只是页面显示，而是会真正落到 MySQL 数据库里。

## 页面汇总逻辑变化

目标维护页面现在支持组织维度汇总。

如果某个组织某个月已经直接导入了组织目标或组织实际完成数据，页面会优先使用这条组织数据。

如果某个组织没有直接导入组织数据，页面仍然可以从下属人员或子组织的数据往上汇总。

这样做是为了避免重复计算。

## 本次验证

已完成以下验证：

```text
node --test server\maintenanceImport.test.js server\maintenanceMappers.test.js
npm run lint
npm run build
```

验证结果：

- 后端导入和汇总测试通过。
- 前端打包通过。
- Lint 通过，仅保留项目原来已有的 React Hook warning。

## 当前使用方式

1. 打开项目：

```text
http://127.0.0.1:5174/
```

2. 进入：

```text
数据维护 > 目标维护
```

3. 点击：

```text
下载模板
```

4. 按需要下载：

```text
目标模板
实际完成模板
```

5. 填好 Excel 后点击：

```text
Excel导入
```

6. 上传 Excel，系统会自动识别并写入数据库。
