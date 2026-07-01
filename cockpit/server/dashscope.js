/*
 更新时间: 2026-06-24 23:03:00
 更新内容: 通义流式分析默认关闭思考模式，缩短驾驶舱交互等待时间；
          保留环境变量开关以便后续需要深度分析时启用，并禁止 Markdown 标记进入卡片。
*/
const DEFAULT_MODEL = 'qwen3.7-max-2026-05-20';
const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MAX_QUESTION_LENGTH = 1200;
const MAX_SNAPSHOT_LENGTH = 28000;

const SYSTEM_PROMPT = [
  '你是成都福客人工智能 CEO 经营驾驶舱的经营分析助手。',
  '你只能基于用户提供的页面数据快照做判断；如果数据不足，明确说明缺少什么数据。',
  '输出使用中文，面向 CEO，优先给经营结论、风险原因和下一步动作，不要泛泛而谈。',
  '涉及金额时保留页面单位，不要擅自换算；涉及渠道、ROI、目标完成率、续费率时引用具体数字。',
  '回答结构保持清晰，控制在 6 到 10 条要点内。',
  '不要使用 Markdown 粗体、斜体、标题符号或项目符号星号；用中文编号、短句和换行即可。',
].join('\n');

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function writeText(res, statusCode, message) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(message);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 51200) {
        reject(new Error('请求内容过大'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function normalizePayload(rawBody) {
  let payload;
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch {
    throw new Error('请求 JSON 格式不正确');
  }

  const question = String(payload.question || '').trim().slice(0, MAX_QUESTION_LENGTH);
  if (!question) {
    throw new Error('请先输入需要分析的问题');
  }

  const snapshotText = JSON.stringify(payload.snapshot || {});
  const snapshot = snapshotText.length > MAX_SNAPSHOT_LENGTH
    ? `${snapshotText.slice(0, MAX_SNAPSHOT_LENGTH)}\n[页面数据快照已截断]`
    : snapshotText;

  return { question, snapshot };
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

function buildMessages({ question, snapshot }) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        '请分析当前驾驶舱页面数据。',
        '',
        `用户问题：${question}`,
        '',
        '页面数据快照 JSON：',
        snapshot,
      ].join('\n'),
    },
  ];
}

function extractDeltaText(data) {
  if (!data || !Array.isArray(data.choices)) return '';
  return data.choices
    .map((choice) => choice?.delta?.content || '')
    .filter(Boolean)
    .join('');
}

async function pipeDashScopeStream(upstream, res) {
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of upstream.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const dataText = trimmed.slice(5).trim();
      if (!dataText || dataText === '[DONE]') continue;

      try {
        const data = JSON.parse(dataText);
        const delta = extractDeltaText(data);
        if (delta) res.write(delta);
      } catch {
        // 上游偶发非 JSON 行时跳过，不中断已经开始的流。
      }
    }
  }

  const tail = decoder.decode();
  if (tail) buffer += tail;
}

export async function handleAiAnalyzeRequest(req, res) {
  if (req.method !== 'POST') {
    writeJson(res, 405, { error: '只支持 POST 请求' });
    return;
  }

  let normalized;
  try {
    normalized = normalizePayload(await readBody(req));
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
        messages: buildMessages(normalized),
        stream: true,
        stream_options: { include_usage: false },
        enable_thinking: enableThinking,
        temperature: 0.25,
        max_completion_tokens: 1600,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') return;
    writeText(res, 502, `通义接口请求失败：${err.message}`);
    return;
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    writeText(res, upstream.status, `通义接口返回错误：${detail || upstream.statusText}`);
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  try {
    await pipeDashScopeStream(upstream, res);
  } catch (err) {
    if (err.name !== 'AbortError') {
      res.write(`\n\n[AI 分析流中断：${err.message}]`);
    }
  } finally {
    res.end();
  }
}
