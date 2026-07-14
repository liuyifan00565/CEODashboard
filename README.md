# CEO Dashboard

更新时间: 2026-07-14 13:05:00 CST
更新内容: 阿里云 AMD64 交付包新增自营收入订单级事实表迁移，用于承接真实 Excel 明细。

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

运维需要阿里云 AMD64 离线部署包时，在项目根目录执行：

```bash
bash scripts/package_aliyun_amd64.sh
```

脚本默认读取并校验 `cockpit/.env.local`，生成包含生产 `.env`、应用镜像、`mysql:8.4` 离线镜像、`install.sh`、`update.sh`、`ENV_KEY_STATUS.txt`、`VERSION.txt` 和数据库迁移脚本的完整交付包。迁移脚本会补齐算力表、渠道月运营/人力成本字段，以及自营收入订单级事实表。

如需复用已有交付包里的运行时配置：

```bash
bash scripts/package_aliyun_amd64.sh --env-file deploy_artifacts/ceodashboard-aliyun-amd64-20260710-162023/.env
```

真实 `DASHSCOPE_API_KEY`、`COMPUTE_API_TOKEN`、数据库密码只放运行时 `.env`，不要写入源码或提交到 Git。

完整部署说明见 `DEPLOY_ALIYUN_AMD64.md`。
