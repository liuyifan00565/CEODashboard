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
  return `${normalizeBaseUrl(baseUrl)}${path}`;
}

function accountLevelName(level) {
  return ACCOUNT_LEVEL_NAMES[Number(level)] ?? String(level || '');
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

async function postJson({ baseUrl, token, path, body, fetchImpl }) {
  const response = await fetchImpl(endpointUrl(baseUrl, path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-token': token,
    },
    body: JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(`外部算力接口请求失败：HTTP ${response.status}`);
  }

  return payload;
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
      averageReplyRate: round1(customerBoard.avg_ai_reply_rate ?? customerBoard.average_ai_reply_rate),
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
    computeCustomerRows: customerList.map((row) => ({
      phone: row.phone,
      owner: row.nick_name ?? row.owner ?? row.customer_name,
      accountType: accountLevelName(row.level),
      salesOwner: row.sales_manager ?? '',
      successOwner: row.customer_manager ?? '',
      usage: round0(row.deduct),
      balance: round0(row.pool),
      averageReplyRate: round1(row.avg_ai_reply_rate ?? row.average_ai_reply_rate ?? row.averageResponseRate),
    })),
  };
}

export async function loadExternalComputeSnapshot({
  baseUrl,
  token,
  now = new Date(),
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!baseUrl || !token) return null;
  if (typeof fetchImpl !== 'function') {
    throw new Error('当前 Node 环境不支持 fetch，无法读取外部算力接口。');
  }

  const window = buildExternalComputeRequestWindow(now);
  const customerBody = {
    customer_manager: '',
    sales_manager: '',
    start_time: window.start_time,
    end_time: window.end_time,
    level: 0,
    limit_type: 1,
    page: 1,
    page_size: 200,
    sort_type: 1,
  };

  const [platformPayload, customerPayload] = await Promise.all([
    postJson({ baseUrl, token, path: PLATFORM_BOARD_PATH, body: window, fetchImpl }),
    postJson({ baseUrl, token, path: CUSTOMER_BOARD_PATH, body: customerBody, fetchImpl }),
  ]);

  return mapExternalComputeBoards({
    platformBoard: normalizeApiPayload(platformPayload, '平台算力概览'),
    customerBoard: normalizeApiPayload(customerPayload, '客户算力列表'),
  });
}

export function hasExternalComputeConfig(env = process.env) {
  return Boolean(env.COMPUTE_API_BASE_URL && env.COMPUTE_API_TOKEN);
}

export async function loadConfiguredExternalComputeSnapshot({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  if (!hasExternalComputeConfig(env)) return null;
  return loadExternalComputeSnapshot({
    baseUrl: env.COMPUTE_API_BASE_URL,
    token: env.COMPUTE_API_TOKEN,
    fetchImpl,
  });
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
