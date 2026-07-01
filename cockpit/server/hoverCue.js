/*
 更新时间: 2026-07-01 11:19:49 CST
 更新内容: 新增 AI 文字悬浮气泡接口，通过 DashScope 千问为福小客生成一句话经营提示。
*/
import {
  normalizeHoverCueText,
  shouldRequestHoverCue,
} from '../src/lib/hoverCue.js';

const DEFAULT_MODEL = 'qwen3.7-max-2026-05-20';
const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MAX_HOVER_SNAPSHOT_LENGTH = 12000;

const HOVER_SYSTEM_PROMPT = [
  '你是成都福客人工智能 CEO 经营驾驶舱里的 3D 助手“福小客”。',
  '用户鼠标正悬浮在页面上的一段文字或数字上，你要结合页面数据快照给出一句中文经营提示。',
  '只输出一句话，控制在 36 个中文字以内，适合显示在小人头顶气泡里。',
  '优先解释风险、机会或下一步动作；如果数据不足，说明建议结合目标、ROI 或续费继续看。',
  '不要使用 Markdown、标题、项目符号、引号或表情。',
].join('\n');

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 30000) {
        reject(new Error('请求内容过大'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function getDashScopeConfig() {
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.ALIBABA_API_KEY || '';
  return {
    apiKey,
    model: process.env.DASHSCOPE_MODEL || DEFAULT_MODEL,
    baseUrl: (process.env.DASHSCOPE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    enableThinking: process.env.DASHSCOPE_ENABLE_THINKING === 'true',
  };
}

export function normalizeHoverCuePayload(rawBody) {
  let payload;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch {
    throw new Error('请求 JSON 格式不正确');
  }

  const text = normalizeHoverCueText(payload.text);
  if (!shouldRequestHoverCue(text)) {
    throw new Error('请先悬浮到有文字的经营信息上');
  }

  const snapshotText = JSON.stringify(payload.snapshot || {});
  const snapshot = snapshotText.length > MAX_HOVER_SNAPSHOT_LENGTH
    ? `${snapshotText.slice(0, MAX_HOVER_SNAPSHOT_LENGTH)}\n[页面数据快照已截断]`
    : snapshotText;

  return { text, snapshot };
}

export function buildHoverCueMessages({ text, snapshot }) {
  return [
    { role: 'system', content: HOVER_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        `鼠标悬浮文字：${text}`,
        '',
        '页面数据快照 JSON：',
        snapshot,
      ].join('\n'),
    },
  ];
}

export function extractHoverCueText(data) {
  const raw = data?.choices?.[0]?.message?.content || '';
  return normalizeHoverCueText(
    raw
      .replace(/[*#`_>~]/g, '')
      .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, '')
  );
}

export async function handleAiHoverCueRequest(req, res) {
  if (req.method !== 'POST') {
    writeJson(res, 405, { error: '只支持 POST 请求' });
    return;
  }

  let normalized;
  try {
    normalized = normalizeHoverCuePayload(await readBody(req));
  } catch (err) {
    writeJson(res, 400, { error: err.message });
    return;
  }

  const { apiKey, model, baseUrl, enableThinking } = getDashScopeConfig();
  if (!apiKey) {
    writeJson(res, 500, { error: '缺少 DASHSCOPE_API_KEY，请在服务端环境变量或 .env.local 中配置。' });
    return;
  }

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  let upstream;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: buildHoverCueMessages(normalized),
        stream: false,
        enable_thinking: enableThinking,
        temperature: 0.2,
        max_completion_tokens: 96,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') return;
    writeJson(res, 502, { error: `通义接口请求失败：${err.message}` });
    return;
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    writeJson(res, upstream.status, { error: `通义接口返回错误：${detail || upstream.statusText}` });
    return;
  }

  const data = await upstream.json();
  const cue = extractHoverCueText(data);
  writeJson(res, 200, {
    cue: cue || '这处信息建议结合目标完成率、ROI 和续费一起看。',
  });
}
