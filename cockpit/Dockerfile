# 更新时间: 2026-07-07 14:35:00 CST
# 更新内容: 新增本地 Docker 联调用开发镜像，基于 node:20-slim，npm ci 安装依赖后以 Vite dev 服务同时提供前端 HMR 与后端 API（vite.config.js 已接好 /api 中间件）。

FROM node:20-bookworm-slim

WORKDIR /app

# 先只拷依赖描述，利用层缓存
COPY package.json package-lock.json* ./

# 安装依赖（容器内 node_modules，避免宿主 Windows 平台不匹配）
RUN npm ci

# 拷源码（运行时 src/server 等会被 compose 卷覆盖以支持热更新，此处仅为镜像兜底）
COPY . .

EXPOSE 5173

# Vite dev：--host 让容器外可访问；compose 会挂载 src 实现 HMR
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
