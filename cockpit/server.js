/*
 更新时间: 2026-07-09 21:15:00 CST
 更新内容: 生产服务新增 /api/compute-customers 分页接口，供算力页后台全量同步客户列表。
*/
/*
 更新时间: 2026-07-09 17:05:00 CST
 更新内容: 生产服务新增 /api/compute-data 外部算力独立接口，供全量数据库接口失败时单独加载 token 用量。
*/
/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: 生产服务新增 POST /api/maintenance/save 数据维护页内编辑保存接口，按页执行部分列 upsert 写库。
*/
/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: 生产服务新增 GET /api/maintenance/data 数据维护读接口，返回四个维护页的真实 MySQL 快照。
*/
/*
 更新时间: 2026-07-07 10:00:00 CST
 更新内容: 生产服务新增 POST /api/maintenance/import 数据维护 Excel 导入空跑校验接口。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 生产服务新增 /api/dashboard-data 真实 MySQL 数据接口，供前端替换 mock 数据。
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
import { handleComputeDataRequest, handleComputeCustomersRequest } from './server/computeApi.js';
import { handleDashboardDataRequest } from './server/dashboardData.js';
import { handleMaintenanceImportRequest } from './server/maintenanceImport.js';
import { handleMaintenanceDataRequest } from './server/maintenanceData.js';
import { handleMaintenanceSaveRequest } from './server/maintenanceSave.js';
import { loadLocalEnv } from './server/env.js';

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

  if (url.pathname === '/api/dashboard-data') {
    handleDashboardDataRequest(req, res);
    return;
  }

  if (url.pathname === '/api/compute-data') {
    handleComputeDataRequest(req, res);
    return;
  }

  if (url.pathname === '/api/compute-customers') {
    handleComputeCustomersRequest(req, res);
    return;
  }

  if (url.pathname === '/api/maintenance/data' && req.method === 'GET') {
    handleMaintenanceDataRequest(req, res);
    return;
  }

  if (url.pathname === '/api/maintenance/import' && req.method === 'POST') {
    handleMaintenanceImportRequest(req, res).catch((err) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ error: `数据维护导入接口异常：${err.message}` }));
    });
    return;
  }

  if (url.pathname === '/api/maintenance/save' && req.method === 'POST') {
    handleMaintenanceSaveRequest(req, res).catch((err) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      }
      res.end(JSON.stringify({ error: `数据维护保存接口异常：${err.message}` }));
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

  serveStatic(req, res);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`CEO cockpit server listening on http://127.0.0.1:${port}`);
});
