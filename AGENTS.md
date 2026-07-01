# AGENTS.md

更新时间: 2026-05-28 11:38:43
更新内容: 关闭代理渠道 11 全局过滤规则，代理渠道按普通来源进入统计

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

所有代码更新后需要在代码顶部说明本次更新的内容和时间，方便我查看代码变化

## Git 工作规则

- 每次修改项目文件后都需要使用 Git 记录，方便随时回滚。
- 修改前后需要查看 `git status`，避免误提交无关文件。
- 每次提交应尽量保持单一目的，只包含本次任务相关文件。
- Git 提交说明中必须包含用户本次发出的原始提示词，方便回看当时执行的命令和需求。
- 如果工作区已有未提交改动，提交前必须区分本次修改和既有改动，不要把无关内容混入同一个提交。

## Docker 服务重启规则

- 每次修改会影响运行服务的项目代码或配置后，必须重启对应 Docker 服务，并用实际接口或页面验证运行中的服务已经加载新代码。
- 修改 `view/app.py` 或 BI API 聚合逻辑后，必须执行 `docker restart weilin-dashboard-api`，因为容器内 Python 进程只在启动时加载代码，文件改了但服务不重启不会生效。
- 修改前端静态文件后，如果通过 Nginx 挂载到 `weilin-dashboard-web`，通常刷新页面即可；如果修改了 Nginx 配置、Docker 配置或服务启动参数，必须重启对应容器后再验证。
- 修改同步脚本或后台接口后，应根据实际运行容器重启 `weilin-sync-worker`、`weilin-backend` 或其它受影响服务，避免只改文件但线上运行逻辑仍是旧代码。

## Docker 打包交付规则

- 后续给运维的阿里云 Docker 交付包必须统一使用 `scripts/package_aliyun_amd64.sh` 生成，不要手工临时拼文件或只发单个 `docker-compose.yml`。
- 交付包必须同时包含 `install.sh` 和 `update.sh`：首次部署或重装使用 `install.sh`，后续升级优先使用 `update.sh`。
- 每次调整 Docker 打包、部署、更新脚本或交付包结构后，必须同步更新 `DEPLOY_ALIYUN_AMD64.md` 和 `README.md` 中的部署说明。

## 文档同步规则

- 每次修改统计口径、同步逻辑、字段映射、表结构、API 取数字段、看板指标计算方式后，必须同步更新对应说明文档。
