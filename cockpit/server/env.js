/*
 更新时间: 2026-06-24 22:42:00
 更新内容: 新增本地环境变量加载器，支持 AI 分析服务读取 .env.local 中的通义 API Key。
*/
import fs from 'node:fs';
import path from 'node:path';

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const index = trimmed.indexOf('=');
  if (index === -1) return null;

  const key = trimmed.slice(0, index).trim();
  let value = trimmed.slice(index + 1).trim();
  if (!key) return null;

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

export function loadLocalEnv(rootDir) {
  const files = ['.env.local', '.env'];
  for (const file of files) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      const [key, value] = parsed;
      if (process.env[key] == null) {
        process.env[key] = value;
      }
    }
  }
}
