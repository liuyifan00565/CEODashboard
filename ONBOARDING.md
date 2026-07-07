# 新同事环境搭建说明

更新时间: 2026-07-07 15:45:00 CST
更新内容: 在启动步骤前补醒目提示——种子 SQL（docker/db-init/ceo_dashboard_full.sql）已 gitignore 不在仓库，clone 后该目录为空，必须向前端负责人索取文件放进 docker/db-init/ 后再 docker compose up，否则数据库为空。

本文档面向**新加入项目的同事**，目标是让你在 20 分钟内把 CEO 经营驾驶舱在本机跑起来，且环境与线上阿里云一致。

## 你要做的 5 步

### 1. 拉取代码

```bash
git clone https://github.com/ttoswar/CEODashboard.git CEODashboard
cd CEODashboard
git checkout codex/ai-mascot-3d-model
```

> ⚠️ **必须切到 `codex/ai-mascot-3d-model` 分支**。最新代码（数据维护页、本地 Docker 联调环境、dashboard 聚合修复等）都在这个 feature 分支上，`main` 是落后的。clone 后默认在 main，不切分支会缺功能。

### 2. 安装 Docker Desktop

下载安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Windows/Mac 均可）。安装完启动它，等右下角/托盘图标变为运行状态。

> 这是一次性操作，以后不用重复装。

### 3. 启动项目

任选其一：

- **桌面脚本**（如果桌面上有 `start-ceo.bat`）：双击即可，会自动起 Docker + 项目 + 开浏览器。
- **命令行**：

```bash
docker compose up -d --build
```

首次启动会拉 MySQL 8.4 和 Node 20 镜像、安装 npm 依赖、自动导入 `ceo_dashboard` 完整数据，约 3~5 分钟。后续启动只需几秒。

> ⚠️ **启动前先要种子 SQL**：`docker/db-init/ceo_dashboard_full.sql` 含真实业务数据，已 gitignore **不在仓库里**，clone 下来这个目录是空的。**必须向前端负责人索取该文件**，放进 `docker/db-init/` 后再 `docker compose up`，否则数据库是空的、页面没数据。

完成后打开浏览器：**http://127.0.0.1:5173**

### 4. 配置通义 API Key（AI 分析功能）

AI 分析、悬浮气泡接口依赖通义千问 API Key，**密钥不入 git 仓库**，请向前端负责人索取，填入：

```
cockpit/.env.local
```

字段（参考 `cockpit/.env.example`）：

```bash
DASHSCOPE_API_KEY=sk-xxxx
DASHSCOPE_MODEL=qwen3.7-max-2026-05-20
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_ENABLE_THINKING=false
```

> 数据库连接（`DB_*`）**不用你配**——`docker-compose.yml` 已写好，容器内自动指向数据库服务。`cockpit/.env.local` 里如果 `DB_HOST` 是 `127.0.0.1`，在 Docker 环境下会被 compose 的 `DB_HOST=db` 覆盖，无需改动。

### 5. 验证

```bash
curl http://127.0.0.1:5173/api/dashboard-data
```

返回 JSON 且含 `"source":"mysql"` 即正常。浏览器打开驾驶舱，数据应为真实聚合数据。

## 日常开发

```bash
docker compose up -d      # 起服务（已起着不用重复）
# 改 cockpit/src 下代码 → 浏览器自动热更新（HMR）
docker compose down       # 停服务（数据保留在卷里，下次还在）
docker compose down -v    # 彻底重置数据库数据
```

- 前端代码：`cockpit/src/`
- 后端接口：`cockpit/server/`（`dashboardData.js` 数据聚合、`dashscope.js` AI 分析）
- 改后端代码后需 `docker compose restart cockpit` 才生效（Vite dev 不自动重载 server 模块）。

## 不用 Docker 的备选方式

如果因故不能用 Docker，可走裸 npm 方式（需自备 MySQL 8.4 并手动导入数据，参考 `cockpit/README.md`）：

```bash
cd cockpit
npm install
npm run dev
```

> 不推荐。环境与线上不一致，且要自己装 MySQL + 导数据 + 配连接，耗时较长。

## 常见问题

| 现象 | 处理 |
|---|---|
| `docker compose up` 报连不上 Docker | 先确认 Docker Desktop 已启动且托盘图标为运行状态 |
| `/api/dashboard-data` 报错 | `docker compose logs db` 看数据库是否 healthy；首次启动未导完数据时稍等 |
| AI 分析接口 500 | 检查 `cockpit/.env.local` 的 `DASHSCOPE_API_KEY` 是否填了正确值 |
| 端口 5173/3306 被占 | 改 `docker-compose.yml` 的端口映射，或停掉占用程序 |

## 说明

- 本文档面向**本地开发联调**（Docker + Vite dev）。生产部署到阿里云见 `DEPLOY_ALIYUN_AMD64.md`。
- 数据库种子数据（`docker/db-init/*.sql`）含真实业务数据，已 gitignore，不入库；如需种子文件请联系前端负责人。
