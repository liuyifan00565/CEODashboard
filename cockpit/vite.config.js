/*
 更新时间: 2026-06-24 22:42:00
 更新内容: 为 Vite 开发服务接入 /api/ai/analyze 通义流式接口；
          保留 @ -> src 路径别名以支持 shadcn registry 组件。
*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

import { handleAiAnalyzeRequest } from './server/dashscope.js'
import { loadLocalEnv } from './server/env.js'

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
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
