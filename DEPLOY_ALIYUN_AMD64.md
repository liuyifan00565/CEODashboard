# 阿里云 AMD64 Docker 镜像交付说明

更新时间: 2026-07-10 17:20:00 CST
更新内容: 新增 CEO Dashboard 生产镜像交付流程；支持 Compose MySQL、运行时密钥校验、`bi.freecallai.cn` 运维反向代理说明。

## 交付范围

本项目交付给运维的是 `linux/amd64` Docker 镜像包和运行示例，不在项目内管理 DNS、HTTPS、Nginx、SLB 或 CDN。

运维需要将 `bi.freecallai.cn` 反向代理到驾驶舱服务：

```text
http://服务器内网或本机:5174
```

生产服务必须运行 `node server.js`，由同一个 `cockpit` 容器提供 React `dist` 静态页面、`/api/dashboard-data`、`/api/compute-data`、`/api/compute-customers`、`/api/ai/analyze` 和 `/api/ai/hover-cue`。不能只用纯静态 Nginx 托管前端文件，否则数据库和 AI 接口不可用。

## 生成交付包

在项目根目录执行：

```bash
bash scripts/package_aliyun_amd64.sh
```

脚本会构建并导出应用镜像：

```text
ceodashboard-cockpit:amd64
```

输出目录：

```text
deploy_artifacts/ceodashboard-aliyun-amd64-YYYYMMDD-HHMMSS/
deploy_artifacts/ceodashboard-aliyun-amd64-YYYYMMDD-HHMMSS.tar.gz
```

交付包包含：

- `images/ceodashboard-cockpit-amd64.tar.gz`
- `docker-compose.yml`，生产 Compose 示例
- `docker/db-init/ceo_dashboard_full.sql`，MySQL 空卷首次启动初始化数据
- `.env.example`
- `install.sh`
- `update.sh`

默认不会把真实 `.env` 打进交付包。真实密钥应由运维写入服务器部署目录 `.env`。

如果明确需要把本机运行时配置一起交给运维，可使用 `--include-env`：

```bash
bash scripts/package_aliyun_amd64.sh --include-env --env-file /c/Users/22720/Desktop/.env.local
```

`--include-env` 会复制指定 env 文件到包内 `.env`，并自动把容器内数据库地址调整为：

```env
DB_HOST=db
DB_PORT=3306
PORT=5174
COCKPIT_PORT=5174
```

脚本只输出 `SET/EMPTY` 校验结果，不打印密钥值。校验必填项：

```text
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_NAME
DASHSCOPE_API_KEY
```

当前桌面新配置中的 `DASHSCOPE_API_KEY` 如果为空，不能直接带 `--include-env` 打包；需要先在源 env 文件或服务器 `.env` 中补齐真实 AI 小人 API Key。

## 运行时环境变量

服务器部署目录 `.env` 至少包含：

```env
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your-production-mysql-password
DB_NAME=ceo_dashboard
PORT=5174
COCKPIT_PORT=5174

DASHSCOPE_API_KEY=your-dashscope-api-key
DASHSCOPE_MODEL=qwen3.7-max-2026-05-20
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_ENABLE_THINKING=false
```

外部算力 API 是服务端运行时密钥，和 AI Key 一样不要写入前端源码或 Git：

```env
COMPUTE_API_BASE_URL=https://pre.zhihuige.cc/csrc
COMPUTE_API_TOKEN=your-compute-api-token
COMPUTE_PLATFORM_BOARD_PATH=/api/v1/customer-management/getPlatformBoard
COMPUTE_CUSTOMER_BOARD_PATH=/api/v1/customer-management/getCustomerBoardList
```

如果 `COMPUTE_API_BASE_URL` 和 `COMPUTE_API_TOKEN` 都为空，只影响外部算力实时同步；`/api/dashboard-data` 仍会读取本地 MySQL 快照。

## 运维部署

首次部署：

```bash
tar -xzf ceodashboard-aliyun-amd64-YYYYMMDD-HHMMSS.tar.gz
cd ceodashboard-aliyun-amd64-YYYYMMDD-HHMMSS
bash install.sh /opt/ceodashboard
```

后续升级：

```bash
tar -xzf ceodashboard-aliyun-amd64-YYYYMMDD-HHMMSS.tar.gz
cd ceodashboard-aliyun-amd64-YYYYMMDD-HHMMSS
bash update.sh /opt/ceodashboard
```

`install.sh` 和 `update.sh` 都会：

- 加载包内应用镜像
- 复制生产 `docker-compose.yml`
- 复制 MySQL 初始化 SQL
- 保留服务器已有 `.env`
- 如果包内带 `.env`，会先备份服务器旧 `.env` 再覆盖
- 执行 `docker compose -f docker-compose.yml up -d`

MySQL 数据使用 Docker named volume `ceodashboard_db_data` 持久化。`docker/db-init/ceo_dashboard_full.sql` 只会在 MySQL 空卷首次启动时自动导入，不会在升级时覆盖已有数据。

## 验证

服务器上验证容器：

```bash
cd /opt/ceodashboard
docker compose -f docker-compose.yml ps
docker image inspect ceodashboard-cockpit:amd64 mysql:8.4 --format '{{join .RepoTags ","}} {{.Os}}/{{.Architecture}}'
```

验证接口：

```bash
curl http://127.0.0.1:5174/
curl http://127.0.0.1:5174/api/dashboard-data
curl 'http://127.0.0.1:5174/api/compute-data'
```

AI 分析接口需要 POST：

```bash
curl -X POST http://127.0.0.1:5174/api/ai/analyze \
  -H 'Content-Type: application/json' \
  -d '{"question":"请概括当前经营风险","snapshot":{"kpi":{}}}'
```

域名侧由运维完成反向代理后验证：

```bash
curl https://bi.freecallai.cn/
```
