# CEO Dashboard

更新时间: 2026-07-10 17:20:00 CST
更新内容: 新增阿里云 AMD64 Docker 镜像交付入口说明。

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

## 阿里云镜像交付

运维只需要 Docker 镜像交付包时，在项目根目录执行：

```bash
bash scripts/package_aliyun_amd64.sh
```

如需带运行时配置一起交付：

```bash
bash scripts/package_aliyun_amd64.sh --include-env --env-file /c/Users/22720/Desktop/.env.local
```

真实 `DASHSCOPE_API_KEY`、`COMPUTE_API_TOKEN`、数据库密码只放运行时 `.env`，不要写入源码或提交到 Git。

完整部署说明见 `DEPLOY_ALIYUN_AMD64.md`。
