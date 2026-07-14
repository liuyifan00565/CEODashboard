# CEO Dashboard

更新时间: 2026-07-14 18:55:42 CST
更新内容: 阿里云交付包的完整性迁移同步建立年度回款选源、公司月度分摊、统一退款和有效目标视图；建表迁移先执行，完整性迁移最后执行。

更新时间: 2026-07-14 17:57:00 CST
更新内容: 阿里云安装与升级流程在数据库迁移前停止旧 cockpit，避免迁移期间产生并发写入。

更新时间: 2026-07-14 17:09:11 CST
更新内容: 数据库新增统一毛回款聚合、部门月度覆盖、自增主键和迁移台账；交付脚本改为先迁移数据库再启动新版应用。

更新时间: 2026-07-14 16:30:00 CST
更新内容: 公司月度业绩仅导入 4-6 月明细表，按线上、代理、华南线下、华东线下展示，不读取 Sheet1 或其它渠道列。

更新时间: 2026-07-14 13:18:00 CST
更新内容: 新增自营收入 Excel 服务器导入命令，支持替换演示数据并按真实最新月份展示完整订单下钻。

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

公司月度事实优先驱动 KPI、趋势和渠道结构；订单表继续驱动人员级下钻。导入只读取 `福客2026年4-6月业绩`：`直营` 映射为线上，`代理` 映射为代理，`其中线下：华南/华东` 分别映射为华南线下/华东线下；不读取 `Sheet1`、线下父级合计、代理细分、南棠渠道、特殊渠道或目标。

## 阿里云镜像交付

运维需要阿里云 AMD64 离线部署包时，在项目根目录执行：

```bash
bash scripts/package_aliyun_amd64.sh
```

脚本默认读取并校验 `cockpit/.env.local`，生成包含生产 `.env`、应用镜像、`mysql:8.4` 离线镜像、`install.sh`、`update.sh`、`ENV_KEY_STATUS.txt`、`VERSION.txt` 和数据库迁移脚本的完整交付包。迁移脚本会补齐算力表、渠道月运营/人力成本、自营收入订单级事实表、公司级月度回款事实表，以及年度回款选源、公司月度金额守恒分摊、统一退款、有效目标、部门月度覆盖、自增主键和自然唯一键；建表迁移先执行，数据库完整性迁移最后执行。安装/升级流程先启动并等待 MySQL，停止旧 `cockpit` 后执行迁移，再启动新版应用，避免迁移期间继续写库或新代码短暂访问旧结构。

如需复用已有交付包里的运行时配置：

```bash
bash scripts/package_aliyun_amd64.sh --env-file deploy_artifacts/ceodashboard-aliyun-amd64-20260710-162023/.env
```

真实 `DASHSCOPE_API_KEY`、`COMPUTE_API_TOKEN`、数据库密码只放运行时 `.env`，不要写入源码或提交到 Git。

完整部署说明见 `DEPLOY_ALIYUN_AMD64.md`。
