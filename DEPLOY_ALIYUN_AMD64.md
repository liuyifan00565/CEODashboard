# 阿里云 AMD64 Docker 离线部署说明

更新时间: 2026-07-13 16:48:56 CST
更新内容: 交付包新增运营成本、人力成本渠道月表迁移，安装和升级时自动补齐字段及唯一键。

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
tar -xzf ceodashboard-aliyun-amd64-deploy-YYYYMMDD-HHMMSS.tar.gz
cd ceodashboard-aliyun-amd64-deploy-YYYYMMDD-HHMMSS
bash update.sh /opt/ceodashboard
```

`install.sh` 和 `update.sh` 都会：

- 导入包内离线镜像。
- 复制 `docker-compose.yml`、`.env.example`、初始化 SQL 和迁移 SQL。
- 如果包内带 `.env`，先备份服务器旧 `.env` 再覆盖。
- 校验 `.env` 必填项，禁止示例密码上线。
- 执行 `docker compose -f docker-compose.yml up -d`。
- 执行 `docker/migrations/*.sql`，不删除 MySQL 数据卷。
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
