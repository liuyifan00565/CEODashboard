/*
 更新时间: 2026-06-24
 更新内容: React + Vite demo 入口，挂载 CEO 经营驾驶舱 App。
*/
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
