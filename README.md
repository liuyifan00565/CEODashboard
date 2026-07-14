# CEO Dashboard

更新时间: 2026-07-14 16:00:00 CST
更新内容: 新增公司级月度业绩导入，按权威总额、渠道和来源承接 2026 年 1-6 月数据及年度/月度目标。

CEO Dashboard 是经营驾驶舱项目。前端位于 `cockpit/`，生产运行时由 Node 服务同时提供 React 静态页面、真实 MySQL 数据接口、外部算力接口代理和 AI 小人分析接口。

## 本地开发

本地 Docker 联调：

```bash
docker compose up -d --build
```

访问：

```text
http://127.0.0.1:5174
```

更多前端和业务口径说明见 `cockpit/README.md`。

## 导入真实自营收入

本地或服务器容器运行后，将 Excel 复制到应用容器并执行事务导入：

```bash
docker cp "2026年1-4月自营收入明细(1).xlsx" ceodashboard-cockpit:/tmp/self-operated-revenue.xlsx
docker exec ceodashboard-cockpit node server/importSelfOperatedRevenue.js /tmp/self-operated-revenue.xlsx --replace-demo-data
docker restart ceodashboard-cockpit
```

`--replace-demo-data` 会清空现有演示事实、目标和成本数据，再导入真实收入明细；不带该参数时只替换 `fact_revenue_order`。导入会保留来源工作表和行号，缺少日期的原始行也会入库，但不进入按日期统计的 KPI。

公司级月度汇总另行导入，避免与上述订单明细重复累计：

```bash
docker cp "福客2026业绩(2026.04-06).xlsx" ceodashboard-cockpit:/tmp/company-revenue.xlsx
docker exec ceodashboard-cockpit node server/importCompanyRevenue.js /tmp/company-revenue.xlsx
docker restart ceodashboard-cockpit
```

公司月度事实优先驱动 KPI、趋势和渠道结构；订单表继续驱动人员级下钻。导入同时保存 6000 万年度目标与工作簿中已明确给出的 4-12 月月度目标。

## 阿里云镜像交付

运维需要阿里云 AMD64 离线部署包时，在项目根目录执行：

```bash
bash scripts/package_aliyun_amd64.sh
```

脚本默认读取并校验 `cockpit/.env.local`，生成包含生产 `.env`、应用镜像、`mysql:8.4` 离线镜像、`install.sh`、`update.sh`、`ENV_KEY_STATUS.txt`、`VERSION.txt` 和数据库迁移脚本的完整交付包。迁移脚本会补齐算力表、渠道月运营/人力成本字段、自营收入订单级事实表，以及公司级月度回款和年度目标表。

如需复用已有交付包里的运行时配置：

```bash
bash scripts/package_aliyun_amd64.sh --env-file deploy_artifacts/ceodashboard-aliyun-amd64-20260710-162023/.env
```

真实 `DASHSCOPE_API_KEY`、`COMPUTE_API_TOKEN`、数据库密码只放运行时 `.env`，不要写入源码或提交到 Git。

完整部署说明见 `DEPLOY_ALIYUN_AMD64.md`。
