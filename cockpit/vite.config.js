/*
 更新时间: 2026-07-06 14:57:00 CST
 更新内容: 为 Vite 开发服务接入 /api/dashboard MySQL 聚合接口。
*/
/*
 更新时间: 2026-07-06 10:28:05 CST
 更新内容: 为 Vite 开发服务接入 /api/maintenance 数据维护 MySQL 读写接口。
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
import { handleDashboardRequest } from './server/dashboardApi.js'
import { loadLocalEnv } from './server/env.js'
import { handleMaintenanceRequest } from './server/maintenanceApi.js'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
loadLocalEnv(projectRoot)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ceo-ai-analysis-api',
      configureServer(server) {
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
        server.middlewares.use('/api/maintenance', (req, res) => {
          req.url = `/api/maintenance${req.url || ''}`
          handleMaintenanceRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            res.end(JSON.stringify({ error: `数据维护接口异常：${err.message}` }))
          })
        })
        server.middlewares.use('/api/dashboard', (req, res) => {
          req.url = `/api/dashboard${req.url || ''}`
          handleDashboardRequest(req, res).catch((err) => {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            }
            res.end(JSON.stringify({ error: `驾驶舱数据接口异常：${err.message}` }))
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
