# AGENTS.md

更新时间: 2026-07-02 17:48:55
更新内容: 增加维护页卡片、工具栏和表格必须沿用算力用量分析页面原透明玻璃 CSS 样式的规则

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

所有代码更新后需要在代码顶部说明本次更新的内容和时间，方便我查看代码变化

## Git 工作规则

- 每次修改项目文件后都需要使用 Git 记录，方便随时回滚。
- 修改前后需要查看 `git status`，避免误提交无关文件。
- 每次提交应尽量保持单一目的，只包含本次任务相关文件。
- Git 提交说明中必须包含用户本次发出的原始提示词，方便回看当时执行的命令和需求。
- 如果工作区已有未提交改动，提交前必须区分本次修改和既有改动，不要把无关内容混入同一个提交。
- 每次修改项目文件后，完成校验并提交后必须同时推送到 `origin`（`liuyifan00565/CEODashboard`）和 `ttoswar`（`ttoswar/CEODashboard`）两个 GitHub 远端；推送前后都要确认两个远端分支状态，避免漏推或覆盖他人提交。

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

## UI 规则

- 所有卡片和按钮的背景、边框、模糊、阴影与圆角必须优先复用项目既有统一玻璃体系（如 `GlassSurface`、`var(--line-2)`、`var(--glass-blur)`、`var(--glass-shadow)`、透明面板背景等），不要为单个卡片或按钮临时新增不一致的实色底、边框或阴影；确需新增变体时，应先抽象为共享样式或主题变量，保证后续新界面格式风格统一。
- 四个维护页（目标维护、成本维护、组织维护、渠道维护）的顶部工具栏、内容卡片和表格外壳必须沿用算力用量分析页面原来的透明玻璃卡片 CSS：面板外层使用 `background: transparent`、`border: 1px solid var(--line-2)`、`backdrop-filter: var(--glass-blur)`、`box-shadow: var(--glass-shadow)` 和统一圆角；不要再改成深色实底、紫色渐变、额外径向光斑、流光边框或单独新增的 `--glass-panel-bg` 变体。
- 维护页顶部工具栏需要保持原来的紧凑高度，工具栏玻璃背景只包裹实际内容高度，不要为了背景效果把标题栏拉高。
- 维护页表格也必须跟随上述透明玻璃体系：表格滚动外壳保持透明，表头只使用低透明黑色玻璃底（如 `rgba(0,0,0,.16)`）并加 `blur(14px)`，首列固定列使用更轻的透明黑色玻璃底（如 `rgba(0,0,0,.14)`）并加 `blur(14px)`；汇总行不要使用深色实底或高饱和色，行悬浮态统一使用 `var(--glass-cell-hover)`。
- 半环图扇区鼠标悬浮时显示的迷你提示卡片，必须沿用原 KPI 二级弹窗卡片的玻璃边框、模糊和阴影体系，但底色要足够深以保证文字可读；不要按占比切换紫色、荧光绿或其它高饱和底色，也不要因此修改其它二级卡片。
