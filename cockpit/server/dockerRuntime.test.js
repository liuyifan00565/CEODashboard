/*
 更新时间: 2026-07-10 16:46:49 CST
 更新内容: 新增生产 Dockerfile 运行时共享模块复制测试，防止 server 端从 src/lib 导入时报模块缺失。
*/
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const dockerfileSource = readFileSync(new URL('../Dockerfile.prod', import.meta.url), 'utf8');
const hoverCueSource = readFileSync(new URL('./hoverCue.js', import.meta.url), 'utf8');
const maintenanceImportSource = readFileSync(new URL('./maintenanceImport.js', import.meta.url), 'utf8');

test('production Dockerfile copies shared src lib modules required by server imports', () => {
  assert.match(hoverCueSource, /from '\.\.\/src\/lib\/hoverCue\.js';/);
  assert.match(maintenanceImportSource, /from '\.\.\/src\/lib\/maintenanceImportConfig\.js';/);
  assert.match(maintenanceImportSource, /from '\.\.\/src\/lib\/excelImport\.js';/);
  assert.match(dockerfileSource, /^COPY src\/lib \.\/src\/lib$/m);
});
