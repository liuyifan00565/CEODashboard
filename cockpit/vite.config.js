/*
 更新时间: 2026-07-14 11:00:00 CST
 更新内容: Vite 开发服务新增登录接口 /api/auth/login、/api/auth/logout、/api/auth/me，与生产 server.js 保持一致。
*/
/*
 更新时间: 2026-07-10 17:20:59 CST
 更新内容: Vite 开发服务新增 /api/health，与生产 server.js 健康检查保持一致，便于 Docker 联调验证。
*/
/*
 更新时间: 2026-07-10 16:41:00 CST
 更新内容: 合并 Jichuan 算力开发路由，新增 /api/compute-data 与 /api/compute-customers，同时保留固定端口和轮询监听。
*/
/*
 更新时间: 2026-07-09 15:08:00 CST
 更新内容: 合并 Vite 重复 server 配置，保留 5174 固定端口和 Windows 轮询监听，避免开发服务被后一个 server 块覆盖回默认端口。
*/
/*
 更新时间: 2026-07-09 14:45:00 CST
 更新内容: Vite 开发服务新增 server.watch.usePolling=true(interval 500ms)，解决 Windows + Docker Desktop bind mount 下 inotify 事件不传播导致 HMR 不触发、改了代码页面不更新的问题。
*/
/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: Vite 开发服务新增 POST /api/maintenance/save 数据维护页内编辑保存接口，与生产一致。
*/
/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: Vite 开发服务新增 GET /api/maintenance/data 数据维护读接口，与生产一致。
*/
/*
 更新时间: 2026-07-07 10:00:00 CST
 更新内容: Vite 开发服务新增 POST /api/maintenance/import 数据维护 Excel 导入空跑校验接口，与生产一致。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: Vite 开发服务新增 /api/dashboard-data，保证开发与生产都读取真实 MySQL 数据。
*/
/*
 更新时间: 2026-07-01 11:19:49 CST
 更新内容: 为 Vite 开发服务接入 /api/ai/analyze 流式分析接口和 /api/ai/hover-cue 悬浮气泡接口；
          保留 @ -> src 路径别名以支持 shadcn registry 组件。
*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

import { handleAiAnalyzeRequest } from './server/dashscope.js'
import { handleAiHoverCueRequest } from './server/hoverCue.js'
import { handleComputeDataRequest, handleComputeCustomersRequest } from './server/computeApi.js'
import { handleDashboardDataRequest } from './server/dashboardData.js'
import { handleMaintenanceImportRequest } from './server/maintenanceImport.js'
import { handleMaintenanceDataRequest } from './server/maintenanceData.js'
import { handleMaintenanceSaveRequest } from './server/maintenanceSave.js'
import { handleAuthLoginRequest, handleAuthLogoutRequest, handleAuthMeRequest } from './server/auth.js'
import { loadLocalEnv } from './server/env.js'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
loadLocalEnv(projectRoot)

function handleHealthRequest(_req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify({
    status: 'ok',
    service: 'ceodashboard-cockpit',
    timestamp: new Date().toISOString(),
    aiAvailable: Boolean(process.env.DASHSCOPE_API_KEY || process.env.ALIBABA_API_KEY),
    computeConfigured: Boolean(process.env.COMPUTE_API_BASE_URL && process.env.COMPUTE_API_TOKEN),
    dbConfigured: Boolean(process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USERNAME && process.env.DB_PASSWORD && process.env.DB_NAME),
    imageTag: process.env.APP_IMAGE_TAG || 'development',
  }))
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    watch: {
      // Windows + Docker Desktop bind mount 下 inotify 不传播，改用轮询保证 HMR 触发
      usePolling: true,
      interval: 500,
    },
  },
  plugins: [
    react(),
    {
      name: 'ceo-ai-analysis-api',
      configureServer(server) {
        server.middlewares.use('/api/health', (req, res) => {
          handleHealthRequest(req, res)
        })
        server.middlewares.use('/api/ai/analyze', (req, res) => {
          handleAiAnalyzeRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
            }
            res.end(`AI 分析接口异常：${err.message}`)
          })
        })
        server.middlewares.use('/api/ai/hover-cue', (req, res) => {
          handleAiHoverCueRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            res.end(JSON.stringify({ error: `AI 悬浮气泡接口异常：${err.message}` }))
          })
        })
        server.middlewares.use('/api/dashboard-data', (req, res) => {
          handleDashboardDataRequest(req, res)
        })
        server.middlewares.use('/api/compute-data', (req, res) => {
          handleComputeDataRequest(req, res)
        })
        server.middlewares.use('/api/compute-customers', (req, res) => {
          handleComputeCustomersRequest(req, res)
        })
        server.middlewares.use('/api/maintenance/data', (req, res) => {
          handleMaintenanceDataRequest(req, res)
        })
        server.middlewares.use('/api/maintenance/import', (req, res) => {
          handleMaintenanceImportRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            res.end(JSON.stringify({ error: `数据维护导入接口异常：${err.message}` }))
          })
        })
        server.middlewares.use('/api/maintenance/save', (req, res) => {
          handleMaintenanceSaveRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            res.end(JSON.stringify({ error: `数据维护保存接口异常：${err.message}` }))
          })
        })
        server.middlewares.use('/api/auth/login', (req, res) => {
          handleAuthLoginRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            res.end(JSON.stringify({ error: `登录接口异常：${err.message}` }))
          })
        })
        server.middlewares.use('/api/auth/logout', (req, res) => {
          handleAuthLogoutRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            res.end(JSON.stringify({ error: `登出接口异常：${err.message}` }))
          })
        })
        server.middlewares.use('/api/auth/me', (req, res) => {
          handleAuthMeRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            res.end(JSON.stringify({ error: `登录状态查询接口异常：${err.message}` }))
          })
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
