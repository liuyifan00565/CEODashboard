/*
 更新时间: 2026-07-10 10:59:53 CST
 更新内容: 停用全局 GlassCursor 覆盖层，只保留系统原生光标，消除鼠标静止时的页面合成闪烁。
*/
/*
 更新时间: 2026-07-06 11:23:48 CST
 更新内容: 恢复全局 GlassCursor 环境柔光挂载，用低透明银紫玫瑰光补充暗色玻璃层次。
*/
/*
 更新时间: 2026-07-05 23:55:52 CST
 更新内容: 移除全局 GlassCursor 光标光晕挂载，保留系统原生光标显示。
*/
/*
 更新时间: 2026-07-03 16:05:19 CST
 更新内容: 在 React 入口挂载玻璃光标层，恢复光标旁边的紫色小光晕。
*/
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
