/*
 更新时间: 2026-07-06 14:57:00 CST
 更新内容: 生产服务入口新增 /api/dashboard MySQL 聚合接口，供经营总览和算力用量分析同步数据库。
*/
/*
 更新时间: 2026-07-06 10:28:05 CST
 更新内容: 接入 /api/maintenance 数据维护 MySQL 读写接口。
*/
/*
 更新时间: 2026-07-01 11:19:49 CST
 更新内容: 生产服务入口新增 /api/ai/hover-cue 千问悬浮气泡接口，并保留静态 dist 与 AI 分析接口。
*/
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { handleAiAnalyzeRequest } from './server/dashscope.js';
import { handleAiHoverCueRequest } from './server/hoverCue.js';
import { handleDashboardRequest } from './server/dashboardApi.js';
import { loadLocalEnv } from './server/env.js';
import { handleMaintenanceRequest } from './server/maintenanceApi.js';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(__filename);
const distRoot = path.join(projectRoot, 'dist');
const port = Number(process.env.PORT || 4173);

loadLocalEnv(projectRoot);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
};

function isInsideDist(filePath) {
  const relative = path.relative(distRoot, filePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const requested = decodedPath === '/' ? '/index.html' : decodedPath;
  let filePath = path.join(distRoot, requested);

  if (!isInsideDist(filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distRoot, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('请先执行 npm run build 生成 dist。');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/ai/analyze') {
    handleAiAnalyzeRequest(req, res).catch((err) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end(`AI 分析接口异常：${err.message}`);
    });
    return;
  }

  if (url.pathname === '/api/ai/hover-cue') {
    handleAiHoverCueRequest(req, res).catch((err) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ error: `AI 悬浮气泡接口异常：${err.message}` }));
    });
    return;
  }

  if (url.pathname.startsWith('/api/maintenance/')) {
    handleMaintenanceRequest(req, res).catch((err) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ error: `数据维护接口异常：${err.message}` }));
    });
    return;
  }

  if (url.pathname.startsWith('/api/dashboard/')) {
    handleDashboardRequest(req, res).catch((err) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ error: `驾驶舱数据接口异常：${err.message}` }));
    });
    return;
  }

  serveStatic(req, res);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`CEO cockpit server listening on http://127.0.0.1:${port}`);
});
