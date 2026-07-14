# 阿里云 AMD64 Docker 离线部署说明

更新时间: 2026-07-14 17:57:00 CST
更新内容: 安装与升级在数据库迁移前停止旧 cockpit，防止迁移期间继续写库，迁移成功后再启动应用。

更新时间: 2026-07-14 17:09:11 CST
更新内容: 交付包新增数据库完整性迁移，并调整升级顺序为 MySQL 就绪、执行迁移、再启动新版应用。

更新时间: 2026-07-14 13:18:00 CST
更新内容: 补充服务器自营收入 Excel 导入、演示数据清理、重启和接口验收流程。

## 1) 打包

在项目根目录执行：

```bash
bash scripts/package_aliyun_amd64.sh
```

默认读取 `cockpit/.env.local`，校验并复制为交付包内 `.env`。如果要复用历史交付包里的生产配置，可显式指定：

```bash
bash scripts/package_aliyun_amd64.sh --env-file deploy_artifacts/ceodashboard-aliyun-amd64-20260710-162023/.env
```

脚本会：

- 交叉构建 `linux/amd64` 应用镜像，镜像 tag 为本次包唯一值。
- 拉取并导出 `mysql:8.4` 的 `linux/amd64` 镜像。
- 校验 `.env` 必填项，不打印密钥明文。
- 生成安装、升级、迁移、版本和密钥状态文件。

输出示例：

```text
deploy_artifacts/ceodashboard-aliyun-amd64-deploy-YYYYMMDD-HHMMSS/
deploy_artifacts/ceodashboard-aliyun-amd64-deploy-YYYYMMDD-HHMMSS.tar.gz
```

## 2) 交付包内容

必须包含：

- `install.sh`：首次部署
- `update.sh`：升级部署
- `docker-compose.yml`：生产编排文件
- `.env`：生产运行时配置，包含真实 `DASHSCOPE_API_KEY`、数据库密码和 `APP_IMAGE_TAG`
- `.env.example`：占位示例，不用于直接上线
- `ENV_KEY_STATUS.txt`：关键环境变量是否为 `SET`
- `VERSION.txt`：包名、镜像、平台、Git 提交和打包时工作区状态
- `images/ceodashboard-cockpit-*.tar.gz`：应用镜像，`linux/amd64`
- `images/mysql-8.4-amd64.tar.gz`：MySQL 镜像，`linux/amd64`
- `docker/db-init/ceo_dashboard_full.sql`：MySQL 空卷首次初始化数据
- `docker/migrations/20260709_compute_token_usage_tables.sql`：升级时补齐算力表结构
- `docker/migrations/20260713_cost_components.sql`：升级时拆分渠道月运营成本与人力成本，并修复渠道月份唯一键
- `docker/migrations/20260714_database_integrity.sql`：升级时建立统一毛回款聚合、部门月度覆盖、迁移台账、自然唯一键和应用写入表自增主键
- `docker/migrations/20260714_self_operated_revenue_tables.sql`：升级时补齐自营收入订单级事实表，用于导入真实 Excel 明细

## 2.1) 导入真实自营收入 Excel

完成 `install.sh` 或 `update.sh` 后，在部署目录执行：

```bash
docker cp "/path/to/2026年1-4月自营收入明细.xlsx" ceodashboard-cockpit:/tmp/self-operated-revenue.xlsx
docker exec ceodashboard-cockpit node server/importSelfOperatedRevenue.js /tmp/self-operated-revenue.xlsx --replace-demo-data
docker restart ceodashboard-cockpit
curl -fsS http://127.0.0.1:5174/api/dashboard-data
```

首次切换真实数据使用 `--replace-demo-data`，它会在同一事务中清理演示事实、目标和成本表。后续更新同类工作簿时可不带该参数；默认替换旧的自营收入订单，避免重复累计。导入结果会输出总行数、缺失日期行数、销售额、退款额、净回款、人员和线索来源。

## 3) 必填环境变量

`.env` 至少包含：

```env
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your-production-mysql-password
DB_NAME=ceo_dashboard
PORT=5174
COCKPIT_PORT=5174
APP_IMAGE_REPO=ceodashboard-cockpit
APP_IMAGE_TAG=aliyun-amd64-YYYYMMDD-HHMMSS

DASHSCOPE_API_KEY=your-dashscope-api-key
DASHSCOPE_MODEL=qwen3.7-max-2026-05-20
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_ENABLE_THINKING=false
```

外部算力 API 可选，但必须成对配置：

```env
COMPUTE_API_BASE_URL=https://pre.zhihuige.cc/csrc
COMPUTE_API_TOKEN=your-compute-api-token
COMPUTE_PLATFORM_BOARD_PATH=/api/v1/customer-management/getPlatformBoard
COMPUTE_CUSTOMER_BOARD_PATH=/api/v1/customer-management/getCustomerBoardList
```

## 4) 生产部署

首次部署：

```bash
tar -xzf ceodashboard-aliyun-amd64-deploy-YYYYMMDD-HHMMSS.tar.gz
cd ceodashboard-aliyun-amd64-deploy-YYYYMMDD-HHMMSS
bash install.sh /opt/ceodashboard
```

后续升级：

```bash
docker exec ceodashboard-db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction "$MYSQL_DATABASE"' > ceo_dashboard-before-update-$(date +%Y%m%d-%H%M%S).sql
tar -xzf ceodashboard-aliyun-amd64-deploy-YYYYMMDD-HHMMSS.tar.gz
cd ceodashboard-aliyun-amd64-deploy-YYYYMMDD-HHMMSS
bash update.sh /opt/ceodashboard
```

`install.sh` 和 `update.sh` 都会：

- 导入包内离线镜像。
- 复制 `docker-compose.yml`、`.env.example`、初始化 SQL 和迁移 SQL。
- 如果包内带 `.env`，先备份服务器旧 `.env` 再覆盖。
- 校验 `.env` 必填项，禁止示例密码上线。
- 只启动 MySQL，并等待 `mysqladmin ping` 就绪。
- 停止旧 `cockpit` 容器，确保迁移期间没有本项目应用继续写库。
- 按文件名顺序执行 `docker/migrations/*.sql`，不删除 MySQL 数据卷；数据库完整性迁移可重复执行并记录到 `schema_migrations`。
- 数据库迁移成功后再启动或切换到新版 `cockpit` 容器。
- 等待 `http://127.0.0.1:${COCKPIT_PORT}/api/health` 最多 120 秒。

MySQL 数据使用 Docker named volume `ceodashboard_db_data` 持久化；升级不会删除卷。

## 5) 运维验收

```bash
cd /opt/ceodashboard
docker compose -f docker-compose.yml ps
docker image inspect ceodashboard-cockpit:$(grep '^APP_IMAGE_TAG=' .env | cut -d= -f2) mysql:8.4 --format '{{join .RepoTags ","}} {{.Os}}/{{.Architecture}}'
curl -fsS http://127.0.0.1:5174/api/health
curl -fsS http://127.0.0.1:5174/
curl -fsS http://127.0.0.1:5174/api/dashboard-data
docker exec ceodashboard-db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT version,applied_at FROM schema_migrations ORDER BY applied_at; SELECT TABLE_NAME,COLUMN_NAME,EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND EXTRA LIKE '\''%auto_increment%'\'' ORDER BY TABLE_NAME;"'
```

健康检查返回 `"aiAvailable":true` 代表 `DASHSCOPE_API_KEY` 已被服务端读取。

域名侧由运维反向代理 `bi.freecallai.cn` 到：

```text
http://服务器内网或本机:5174
```

## 6) 失败排查

- `mysql:8.4` 找不到：确认包内存在 `images/mysql-8.4-amd64.tar.gz`，并检查 `install.sh` 镜像导入日志。
- `APP_IMAGE_TAG is required`：检查服务器 `/opt/ceodashboard/.env` 是否来自本次包。
- `aiAvailable:false`：检查 `ENV_KEY_STATUS.txt` 和服务器 `.env` 的 `DASHSCOPE_API_KEY` 是否为 `SET`。
- 健康检查超时：执行 `docker compose -f docker-compose.yml logs --tail 200 cockpit db`。
- 业务数据为空：确认首次启动前 `docker/db-init/ceo_dashboard_full.sql` 已在包内，且 MySQL 卷首次初始化时不是旧空卷。
