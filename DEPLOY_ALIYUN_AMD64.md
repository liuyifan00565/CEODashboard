# 阿里云 AMD64 Docker 部署说明

更新时间: 2026-06-24 22:42:00
更新内容: 补充 CEO 驾驶舱 AI 分析工具所需的通义服务端环境变量。

阿里云服务器当前按 `linux/amd64` 架构交付。MacBook 本机仍使用基础 `docker-compose.yml` 原生运行，不使用本文件中的 AMD64 覆盖配置。

## 交付规则

后续给运维的阿里云 Docker 包统一按 AMD64 格式交付：

- 本地统一用 `bash scripts/package_aliyun_amd64.sh` 生成交付包。
- 包内必须同时带 `install.sh` 和 `update.sh`。
- 首次部署或需要重装时执行 `install.sh`。
- 已有环境后续升级时执行 `update.sh`。

## AI 分析工具环境变量

如果部署 `cockpit` React 驾驶舱并启用左侧 AI 分析工具，通义 API Key 只能配置在服务端环境，不要写入前端源码：

```bash
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
DASHSCOPE_MODEL=qwen3.7-max-2026-05-20
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_ENABLE_THINKING=false
```

生产服务需要通过 `node server.js` 或等价容器入口同时提供 `dist` 静态文件和 `/api/ai/analyze`，不能只用纯静态 Nginx 托管，否则 AI 分析接口不可用。
