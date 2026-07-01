/*
 更新时间: 2026-07-01 11:19:49 CST
 更新内容: 新增 AI 悬浮气泡后端入参清洗、提示词、结果提取和服务路由测试。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildHoverCueMessages,
  extractHoverCueText,
  normalizeHoverCuePayload,
} from './hoverCue.js';

const serverSource = readFileSync(new URL('../server.js', import.meta.url), 'utf8');
const viteSource = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');

test('normalizes hover cue payload and trims long text', () => {
  const payload = normalizeHoverCuePayload(JSON.stringify({
    text: `  ${'目标完成率'.repeat(80)}  `,
    snapshot: { kpi: { month: 1 } },
  }));

  assert.equal(payload.text.length, 160);
  assert.match(payload.snapshot, /"kpi"/);
});

test('rejects hover cue payload without readable text', () => {
  assert.throws(
    () => normalizeHoverCuePayload(JSON.stringify({ text: ' ' })),
    /请先悬浮到有文字的经营信息上/
  );
});

test('builds a concise Qwen prompt for mascot hover bubbles', () => {
  const messages = buildHoverCueMessages({
    text: '目标完成率 83.8%',
    snapshot: '{"kpi":{"progress":83.8}}',
  });

  assert.equal(messages[0].role, 'system');
  assert.match(messages[0].content, /福小客/);
  assert.match(messages[0].content, /一句话/);
  assert.equal(messages[1].role, 'user');
  assert.match(messages[1].content, /目标完成率 83.8%/);
  assert.match(messages[1].content, /页面数据快照 JSON/);
});

test('extracts and cleans hover cue text from OpenAI-compatible response', () => {
  const cue = extractHoverCueText({
    choices: [
      { message: { content: '  **目标完成率偏弱，建议先看渠道 ROI。**\\n' } },
    ],
  });

  assert.equal(cue, '目标完成率偏弱，建议先看渠道 ROI。');
});

test('routes hover cue requests in production and Vite development servers', () => {
  assert.match(serverSource, /import \{ handleAiHoverCueRequest \} from '\.\/server\/hoverCue\.js';/);
  assert.match(serverSource, /url\.pathname === '\/api\/ai\/hover-cue'/);
  assert.match(viteSource, /import \{ handleAiHoverCueRequest \} from '\.\/server\/hoverCue\.js'/);
  assert.match(viteSource, /server\.middlewares\.use\('\/api\/ai\/hover-cue'/);
});
