# AGENTS.md

更新时间: 2026-07-07 11:10:04
更新内容: 合并下载版 AGENTS.md 的文档同步规则与 Development Specifications，保留项目原有 Git、Docker、UI 与双远端同步规则

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

所有代码更新后需要在代码顶部说明本次更新的内容和时间，方便我查看代码变化

## Git 工作规则

- 每次修改项目文件后都需要使用 Git 记录，方便随时回滚。
- 修改前后需要查看 `git status`，避免误提交无关文件。
- 每次提交应尽量保持单一目的，只包含本次任务相关文件。
- Git 提交说明中必须包含用户本次发出的原始提示词，方便回看当时执行的命令和需求。
- 如果工作区已有未提交改动，提交前必须区分本次修改和既有改动，不要把无关内容混入同一个提交。
- 每次修改项目文件后，在推送到分支前必须先从当前分支对应远端自动拉取最新更新并处理冲突，确认本地分支基于最新远端提交后再推送。
- 每次修改项目文件后，完成校验并提交后必须同时推送到 `origin`（`liuyifan00565/CEODashboard`）和 `ttoswar`（`ttoswar/CEODashboard`）两个 GitHub 远端；推送前后都要确认两个远端分支状态，避免漏推或覆盖他人提交。
- 每次完成双远端推送后，必须再次从 `origin` 和 `ttoswar` 当前分支拉取/确认更新，确保本地分支、`origin` 分支和 `ttoswar` 分支三方提交一致后再结束任务。

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

- 项目的功能逻辑说明文档都存放在 `/doc` 目录下，并且文档格式统一使用 `Markdown`。
- 每次修改统计口径、同步逻辑、字段映射、表结构、API 取数字段、看板指标计算方式后，必须同步更新对应说明文档。
- 文档更新要和代码修改放在同一个任务链路中完成；若用户只要求补文档，则单独提交文档变更。
- 文档顶部也要维护更新时间和更新内容，方便回看本次口径调整。

## Development Specifications

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## UI 规则

- 所有卡片和按钮的背景、边框、模糊、阴影与圆角必须优先复用项目既有统一玻璃体系（如 `GlassSurface`、`var(--line-2)`、`var(--glass-blur)`、`var(--glass-shadow)`、透明面板背景等），不要为单个卡片或按钮临时新增不一致的实色底、边框或阴影；确需新增变体时，应先抽象为共享样式或主题变量，保证后续新界面格式风格统一。
- 四个维护页（目标维护、成本维护、组织维护、渠道维护）的顶部工具栏、内容卡片和表格外壳必须沿用算力用量分析页面原来的透明玻璃卡片 CSS：面板外层使用 `background: transparent`、`border: 1px solid var(--line-2)`、`backdrop-filter: var(--glass-blur)`、`box-shadow: var(--glass-shadow)` 和统一圆角；不要再改成深色实底、紫色渐变、额外径向光斑、流光边框或单独新增的 `--glass-panel-bg` 变体。
- 维护页顶部工具栏需要保持原来的紧凑高度，工具栏玻璃背景只包裹实际内容高度，不要为了背景效果把标题栏拉高。
- 维护页表格也必须跟随上述透明玻璃体系：表格滚动外壳保持透明，表头只使用低透明黑色玻璃底（如 `rgba(0,0,0,.16)`）并加 `blur(14px)`，首列固定列使用更轻的透明黑色玻璃底（如 `rgba(0,0,0,.14)`）并加 `blur(14px)`；汇总行不要使用深色实底或高饱和色，行悬浮态统一使用 `var(--glass-cell-hover)`。
- 半环图扇区鼠标悬浮时显示的迷你提示卡片，必须沿用原 KPI 二级弹窗卡片的玻璃边框、模糊和阴影体系，但底色要足够深以保证文字可读；不要按占比切换紫色、荧光绿或其它高饱和底色，也不要因此修改其它二级卡片。
