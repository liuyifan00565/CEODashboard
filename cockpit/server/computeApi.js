/*
 更新时间: 2026-07-09 23:10:00 CST
 更新内容: 提取 buildCustomerBoardParams，loadExternalComputeSnapshot 和 loadExternalComputeCustomerPage
          不再各自拼一份几乎相同的客户列表请求参数对象。
*/
/*
 更新时间: 2026-07-09 21:15:00 CST
 更新内容: 新增 /api/compute-customers 分页接口（loadExternalComputeCustomerPage / handleComputeCustomersRequest），
          支持前端后台分页拉取全量客户列表，不再受首屏 20 条采样限制；提取 mapCustomerRow 供两处复用。
*/
/*
 更新时间: 2026-07-09 19:52:00 CST
 更新内容: 外部客户明细实时读取条数从 50 降到 20，实时看板只保留轻量排行样本。
*/
/*
 更新时间: 2026-07-09 19:32:00 CST
 更新内容: 外部客户明细首屏页缩小到 50 条，后续全量客户同步交给数据库增量任务处理，避免实时看板加载等待。
*/
/*
 更新时间: 2026-07-09 19:05:00 CST
 更新内容: 外部客户列表恢复为首屏页数据，避免为表格一次拉取全部客户导致看板打开过慢；总客户数仍使用接口 total。
*/
/*
 更新时间: 2026-07-09 18:35:00 CST
 更新内容: 外部算力接口请求增加 8 秒超时（AbortController），避免外部服务偶发卡顿时整个看板首屏无限期停在加载中。
*/
/*
 更新时间: 2026-07-09 18:18:00 CST
 更新内容: 外部算力接口补齐全量客户分页、回复率百分比归一和组件级消耗字段映射。
*/
/*
 更新时间: 2026-07-09 17:55:00 CST
 更新内容: 外部算力接口改为 GET query 请求，并避免 base/path 同时包含 /csrc 时拼出重复路径。
*/
/*
 更新时间: 2026-07-09 17:45:00 CST
 更新内容: 支持通过 COMPUTE_PLATFORM_BOARD_PATH / COMPUTE_CUSTOMER_BOARD_PATH 配置外部算力接口路径，便于对齐真实页面 endpoint。
*/
/*
 更新时间: 2026-07-09 17:05:00 CST
 更新内容: 新增 /api/compute-data 响应处理器，支持前端在 MySQL 全量快照失败时单独读取外部算力数据。
*/
/*
 更新时间: 2026-07-09 16:18:00 CST
 更新内容: 新增外部算力看板接口读取与字段映射，用 COMPUTE_API_BASE_URL / COMPUTE_API_TOKEN 覆盖本地算力快照。
*/

const PLATFORM_BOARD_PATH = '/api/v1/customer-management/getPlatformBoard';
const CUSTOMER_BOARD_PATH = '/api/v1/customer-management/getCustomerBoardList';
const DAY_SECONDS = 24 * 60 * 60;
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

const ACCOUNT_LEVEL_NAMES = {
  1: '个人版',
  2: '试用版',
  3: '企业版',
  4: '旗舰版',
  5: '免费版',
  6: '卓越版',
  7: '创世版',
  8: '至尊版ultra',
  9: '启航版',
  10: '定制尊享版',
};

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round0(value) {
  return Math.round(num(value));
}

function round1(value) {
  return Math.round(num(value) * 10) / 10;
}

function percentValue(value) {
  const numericValue = num(value);
  return round1(numericValue > 0 && numericValue <= 1 ? numericValue * 100 : numericValue);
}

function dayStartUnix(date) {
  const shifted = new Date(date.getTime() + BEIJING_OFFSET_MS);
  const utcStart = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  return Math.floor((utcStart - BEIJING_OFFSET_MS) / 1000);
}

function formatExternalDate(value) {
  const text = String(value ?? '');
  const digits = text.replace(/\D/g, '');
  if (digits.length >= 8) {
    const normalized = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    return { range: normalized, day: normalized.slice(5) };
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    const normalized = text.slice(0, 10);
    return { range: normalized, day: normalized.slice(5) };
  }
  return { range: text, day: text };
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '').trim().replace(/\/+$/, '');
}

function endpointUrl(baseUrl, path) {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${path || ''}`;
  const basePath = new URL(normalizedBase).pathname.replace(/\/+$/, '');
  const firstPathSegment = normalizedPath.split('/').filter(Boolean)[0];
  if (firstPathSegment && basePath.endsWith(`/${firstPathSegment}`)) {
    return `${normalizedBase}${normalizedPath.slice(firstPathSegment.length + 1)}`;
  }
  return `${normalizedBase}${normalizedPath}`;
}

function accountLevelName(level) {
  return ACCOUNT_LEVEL_NAMES[Number(level)] ?? String(level || '');
}

function usageShare(value, total) {
  const numericValue = num(value);
  if (!total || numericValue <= 0) return 0;
  return Math.max(0.1, round1((numericValue / total) * 100));
}

function formatPointState(value) {
  return `${round0(value).toLocaleString('zh-CN')} 点`;
}

function buildResourceHealth(platformBoard, customerBoard) {
  const total = Math.max(num(platformBoard.deduct), num(customerBoard.deduct), 1);
  const rows = [
    { key: 'ocr', name: 'OCR识别', value: sumByField(platformBoard.last_30_day_details, 'ocr_deduct'), color: '#8E86FF' },
    { key: 'voc', name: 'VOC分析', value: num(customerBoard.voc_deduct) || sumByField(platformBoard.last_30_day_details, 'voc_deduct'), color: '#B89CFF' },
    { key: 'video', name: '视频识别', value: num(customerBoard.video_deduct) || sumByField(platformBoard.last_30_day_details, 'video_deduct'), color: '#D9D1FF' },
    { key: 'reply-intercept', name: '回复拦截', value: num(platformBoard.reply_intercept_deduct) || sumByField(platformBoard.last_30_day_details, 'reply_intercept_deduct'), color: '#F06A8B' },
    { key: 'dialogue-test', name: '对话测试', value: num(platformBoard.dialogue_test_deduct) || sumByField(platformBoard.last_30_day_details, 'dialogue_test_deduct'), color: '#C9A96B' },
  ];

  return rows.map((row) => {
    const usage = usageShare(row.value, total);
    return {
      key: row.key,
      name: row.name,
      usage,
      value: round0(row.value),
      trend: formatPointState(row.value),
      state: usage >= 10 ? '高频消耗' : usage > 0 ? '低频消耗' : '暂无消耗',
      tone: usage >= 10 ? 'warn' : 'neutral',
      color: row.color,
    };
  });
}

function sumByField(rows = [], field) {
  return rows.reduce((total, row) => total + num(row[field]), 0);
}

function normalizeApiPayload(payload, label) {
  if (payload?.status_code && Number(payload.status_code) !== 200) {
    throw new Error(`${label} 返回异常：${payload.message || payload.status_code}`);
  }
  if (payload?.code && Number(payload.code) !== 200) {
    throw new Error(`${label} 返回异常：${payload.message || payload.code}`);
  }
  return payload?.data ?? payload;
}

const EXTERNAL_API_TIMEOUT_MS = 8000;

async function getJson({ baseUrl, token, path, params, fetchImpl, timeoutMs = EXTERNAL_API_TIMEOUT_MS }) {
  const url = new URL(endpointUrl(baseUrl, path));
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetchImpl(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-token': token,
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`外部算力接口请求超时（${timeoutMs}ms）：${path}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(`外部算力接口请求失败：HTTP ${response.status} (${path})`);
  }

  return payload;
}

export function computeApiConfigFromEnv(env = process.env) {
  return {
    baseUrl: env.COMPUTE_API_BASE_URL,
    token: env.COMPUTE_API_TOKEN,
    platformBoardPath: env.COMPUTE_PLATFORM_BOARD_PATH || PLATFORM_BOARD_PATH,
    customerBoardPath: env.COMPUTE_CUSTOMER_BOARD_PATH || CUSTOMER_BOARD_PATH,
  };
}

export function buildExternalComputeRequestWindow(now = new Date()) {
  const end_time = dayStartUnix(now) - 1;
  const start_time = end_time - (30 * DAY_SECONDS) + 1;
  return { start_time, end_time };
}

export function mapExternalComputeBoards({ platformBoard = {}, customerBoard = {} }) {
  const poolByDate = new Map(
    (platformBoard.last_30_day_pool ?? []).map((row) => {
      const { range } = formatExternalDate(row.date);
      return [range, row];
    })
  );
  const details = platformBoard.last_30_day_details ?? [];
  const trend = details.map((row) => {
    const { day, range } = formatExternalDate(row.date);
    const pool = poolByDate.get(range);
    return {
      day,
      range,
      usage: round0(num(row.deduct ?? row.usage ?? row.value) / 10000),
      addOn: round0(num(row.incr ?? row.added ?? row.add_on) / 10000),
      capacity: round0(num(pool?.pool ?? row.pool) / 10000),
    };
  });

  const customerList = customerBoard.customer_list?.list ?? customerBoard.customer_list ?? [];
  const customerTotal = customerBoard.customer_list?.total ?? customerList.length;

  return {
    computeOverview: {
      totalCapacity: round0(platformBoard.total),
      addedCapacity: round0(platformBoard.incr),
      consumedCapacity: round0(platformBoard.deduct),
      customerCount: round0(customerBoard.customer_num),
      customerUsage: round0(customerBoard.deduct),
      customerBalance: round0(customerBoard.pool),
      newCustomers: round0(customerBoard.new_customer_num),
      newStores: round0(customerBoard.new_shop_num),
      averageReplyRate: percentValue(customerBoard.avg_ai_reply_rate ?? customerBoard.average_ai_reply_rate),
      totalCustomers: round0(customerTotal),
    },
    computeUsageTrend: trend,
    computeVersionConsumption: (customerBoard.level_deduct_details?.details ?? [])
      .filter((row) => Number(row.level) !== 1)
      .map((row) => ({
        name: accountLevelName(row.level),
        value: round0(row.deduct),
      })),
    computeUsageDistribution: (customerBoard.range_customer_details?.details ?? []).map((row) => ({
      name: row.range,
      value: round0(row.num),
    })),
    computeCustomerRows: customerList.map(mapCustomerRow),
    computeResourceHealth: buildResourceHealth(platformBoard, customerBoard),
  };
}

function mapCustomerRow(row) {
  return {
    phone: row.phone,
    owner: row.nick_name ?? row.owner ?? row.customer_name,
    accountType: accountLevelName(row.level),
    salesOwner: row.sales_manager ?? '',
    successOwner: row.customer_manager ?? '',
    usage: round0(row.deduct),
    balance: round0(row.pool),
    averageReplyRate: percentValue(row.avg_ai_reply_rate ?? row.average_ai_reply_rate ?? row.averageResponseRate),
    videoUsage: round0(row.video_deduct),
    vocUsage: round0(row.voc_deduct),
  };
}

function buildCustomerBoardParams(window, { page, pageSize }) {
  return {
    customer_manager: '',
    sales_manager: '',
    start_time: window.start_time,
    end_time: window.end_time,
    level: 0,
    limit_type: 1,
    page,
    page_size: pageSize,
    sort_type: 1,
  };
}

export async function loadExternalComputeSnapshot({
  baseUrl,
  token,
  platformBoardPath = PLATFORM_BOARD_PATH,
  customerBoardPath = CUSTOMER_BOARD_PATH,
  customerPageSize = 20,
  now = new Date(),
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!baseUrl || !token) return null;
  if (typeof fetchImpl !== 'function') {
    throw new Error('当前 Node 环境不支持 fetch，无法读取外部算力接口。');
  }

  const window = buildExternalComputeRequestWindow(now);
  const customerBody = buildCustomerBoardParams(window, { page: 1, pageSize: customerPageSize });

  const [platformPayload, customerPayload] = await Promise.all([
    getJson({ baseUrl, token, path: platformBoardPath, params: window, fetchImpl }),
    getJson({ baseUrl, token, path: customerBoardPath, params: customerBody, fetchImpl }),
  ]);

  return mapExternalComputeBoards({
    platformBoard: normalizeApiPayload(platformPayload, '平台算力概览'),
    customerBoard: normalizeApiPayload(customerPayload, '客户算力列表'),
  });
}

export async function loadExternalComputeCustomerPage({
  baseUrl,
  token,
  customerBoardPath = CUSTOMER_BOARD_PATH,
  page = 1,
  pageSize = 200,
  now = new Date(),
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!baseUrl || !token) return null;
  if (typeof fetchImpl !== 'function') {
    throw new Error('当前 Node 环境不支持 fetch，无法读取外部算力接口。');
  }

  const window = buildExternalComputeRequestWindow(now);
  const customerBody = buildCustomerBoardParams(window, { page, pageSize });

  const customerPayload = await getJson({ baseUrl, token, path: customerBoardPath, params: customerBody, fetchImpl });
  const customerBoard = normalizeApiPayload(customerPayload, '客户算力列表');
  const customerList = customerBoard.customer_list?.list ?? customerBoard.customer_list ?? [];
  const total = customerBoard.customer_list?.total ?? customerList.length;

  return {
    rows: customerList.map(mapCustomerRow),
    total: round0(total),
    page,
    pageSize,
  };
}

export function hasExternalComputeConfig(env = process.env) {
  return Boolean(env.COMPUTE_API_BASE_URL && env.COMPUTE_API_TOKEN);
}

export async function loadConfiguredExternalComputeSnapshot({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  if (!hasExternalComputeConfig(env)) return null;
  return loadExternalComputeSnapshot({
    ...computeApiConfigFromEnv(env),
    fetchImpl,
  });
}

export async function loadConfiguredExternalComputeCustomerPage({ page, pageSize, env = process.env, fetchImpl = globalThis.fetch } = {}) {
  if (!hasExternalComputeConfig(env)) return null;
  return loadExternalComputeCustomerPage({
    ...computeApiConfigFromEnv(env),
    page,
    pageSize,
    fetchImpl,
  });
}

function parsePositiveInt(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function handleComputeCustomersRequest(req, res) {
  try {
    const requestUrl = new URL(req.url, 'http://internal');
    const page = parsePositiveInt(requestUrl.searchParams.get('page'), 1);
    const pageSize = Math.min(500, parsePositiveInt(requestUrl.searchParams.get('pageSize'), 200));

    const result = await loadConfiguredExternalComputeCustomerPage({ page, pageSize });
    if (!result) {
      res.writeHead(503, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify({ error: '外部算力接口未配置。' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({ source: 'mysql', ...result }));
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({
      error: `外部算力客户分页接口异常：${err.message}`,
    }));
  }
}

export async function handleComputeDataRequest(_req, res) {
  try {
    const snapshot = await loadConfiguredExternalComputeSnapshot();
    if (!snapshot) {
      res.writeHead(503, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify({ error: '外部算力接口未配置。' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({ source: 'mysql', ...snapshot }));
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({
      error: `外部算力数据接口异常：${err.message}`,
    }));
  }
}
