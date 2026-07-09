/*
 更新时间: 2026-07-09 21:15:00 CST
 更新内容: 增加 loadExternalComputeCustomerPage 分页拉取和 handleComputeCustomersRequest 接口的回归测试。
*/
/*
 更新时间: 2026-07-09 19:52:00 CST
 更新内容: 增加默认客户明细实时读取 20 条的回归，避免首屏排行样本再次变大。
*/
/*
 更新时间: 2026-07-09 19:05:00 CST
 更新内容: 外部客户列表测试改为验证首屏页加载和 total 保留，避免全量分页导致看板启动变慢。
*/
/*
 更新时间: 2026-07-09 18:18:00 CST
 更新内容: 覆盖外部算力全量客户分页、回复率百分比归一和组件级消耗字段映射。
*/
/*
 更新时间: 2026-07-09 17:55:00 CST
 更新内容: 外部算力接口改为 GET query，并覆盖 base/path 同时带 /csrc 时不重复拼接。
*/
/*
 更新时间: 2026-07-09 17:45:00 CST
 更新内容: 增加外部算力接口 path 环境变量回归，支持按真实页面接口调整 endpoint。
*/
/*
 更新时间: 2026-07-09 16:18:00 CST
 更新内容: 新增外部算力看板接口映射测试，覆盖 /csrc 接口请求参数、x-token 鉴权头和快照字段转换。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildExternalComputeRequestWindow,
  computeApiConfigFromEnv,
  handleComputeCustomersRequest,
  loadExternalComputeCustomerPage,
  loadExternalComputeSnapshot,
  mapExternalComputeBoards,
} from './computeApi.js';

test('maps external compute board payloads into dashboard compute snapshot fields', () => {
  const snapshot = mapExternalComputeBoards({
    platformBoard: {
      total: 2650773741,
      incr: 449249887,
      deduct: 139751667,
      reply_intercept_deduct: 195636,
      dialogue_test_deduct: 0,
      last_30_day_details: [
        { date: 20260629, deduct: 5120000, ocr_deduct: 106088, video_deduct: 0, voc_deduct: 111519, reply_intercept_deduct: 9, dialogue_test_deduct: 0 },
        { date: 20260630, deduct: 5360000, ocr_deduct: 120294, video_deduct: 5, voc_deduct: 112388, reply_intercept_deduct: 1, dialogue_test_deduct: 0 },
      ],
      last_30_day_pool: [
        { date: 20260629, pool: 25780000 },
        { date: 20260630, pool: 26000000 },
      ],
    },
    customerBoard: {
      avg_ai_reply_rate: 0.704,
      customer_num: 5558,
      deduct: 34186157,
      video_deduct: 5245,
      voc_deduct: 2248780,
      new_customer_num: 52,
      new_shop_num: 1174,
      pool: 2650773741,
      customer_list: {
        total: 4905,
        list: [
          {
            phone: '150****1491',
            nick_name: '一本官方旗舰店',
            level: 8,
            sales_manager: '雪姐',
            customer_manager: '龙涛',
            deduct: 2010190,
            video_deduct: 88,
            voc_deduct: 1200,
            pool: 7783896,
            avg_ai_reply_rate: 0.81,
          },
        ],
      },
      level_deduct_details: {
        total: 110,
        details: [
          { level: 6, deduct: 37 },
          { level: 7, deduct: 28 },
        ],
      },
      range_customer_details: {
        total: 105,
        details: [
          { range: '算力用量=0', num: 75 },
          { range: '算力用量>10000', num: 10 },
        ],
      },
    },
  });

  assert.deepEqual(snapshot.computeOverview, {
    totalCapacity: 2650773741,
    addedCapacity: 449249887,
    consumedCapacity: 139751667,
    customerCount: 5558,
    customerUsage: 34186157,
    customerBalance: 2650773741,
    newCustomers: 52,
    newStores: 1174,
    averageReplyRate: 70.4,
    totalCustomers: 4905,
  });
  assert.deepEqual(snapshot.computeUsageTrend, [
    { day: '06-29', range: '2026-06-29', usage: 512, addOn: 0, capacity: 2578 },
    { day: '06-30', range: '2026-06-30', usage: 536, addOn: 0, capacity: 2600 },
  ]);
  assert.deepEqual(snapshot.computeVersionConsumption, [
    { name: '卓越版', value: 37 },
    { name: '创世版', value: 28 },
  ]);
  assert.deepEqual(snapshot.computeUsageDistribution, [
    { name: '算力用量=0', value: 75 },
    { name: '算力用量>10000', value: 10 },
  ]);
  assert.deepEqual(snapshot.computeCustomerRows, [
    {
      phone: '150****1491',
      owner: '一本官方旗舰店',
      accountType: '至尊版ultra',
      salesOwner: '雪姐',
      successOwner: '龙涛',
      usage: 2010190,
      balance: 7783896,
      averageReplyRate: 81,
      videoUsage: 88,
      vocUsage: 1200,
    },
  ]);
  assert.deepEqual(
    snapshot.computeResourceHealth.map((row) => [row.key, row.name, row.usage > 0]),
    [
      ['ocr', 'OCR识别', true],
      ['voc', 'VOC分析', true],
      ['video', '视频识别', true],
      ['reply-intercept', '回复拦截', true],
      ['dialogue-test', '对话测试', false],
    ]
  );
});

test('loads external compute boards with get query and x-token header', async () => {
  const calls = [];
  const now = new Date('2026-07-09T10:00:00+08:00');
  const window = buildExternalComputeRequestWindow(now);
  const snapshot = await loadExternalComputeSnapshot({
    baseUrl: 'https://pre.zhihuige.cc/csrc/',
    platformBoardPath: '/csrc/api/v1/customer-management/getPlatformBoard',
    customerBoardPath: '/csrc/api/v1/customer-management/getCustomerBoardList',
    customerPageSize: 2,
    token: 'secret-token',
    now,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      const parsedUrl = new URL(url);
      const isPlatform = parsedUrl.pathname.endsWith('/getPlatformBoard');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status_code: 200,
          data: isPlatform
            ? { total: 1, incr: 2, deduct: 3, last_30_day_details: [], last_30_day_pool: [] }
            : {
              customer_num: 3,
              customer_list: {
                list: [
                  { phone: '1', nick_name: '一号', level: 6, deduct: 20, pool: 200, avg_ai_reply_rate: 0.8 },
                  { phone: '2', nick_name: '二号', level: 7, deduct: 10, pool: 100, avg_ai_reply_rate: 0.7 },
                ],
                total: 3,
              },
              level_deduct_details: { details: [], total: 0 },
              range_customer_details: { details: [], total: 0 },
            },
        }),
      };
    },
  });

  assert.deepEqual(window, { start_time: 1780934400, end_time: 1783526399 });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map((call) => {
    const url = new URL(call.url);
    return `${url.origin}${url.pathname}`;
  }), [
    'https://pre.zhihuige.cc/csrc/api/v1/customer-management/getPlatformBoard',
    'https://pre.zhihuige.cc/csrc/api/v1/customer-management/getCustomerBoardList',
  ]);
  assert.equal(calls[0].options.method, 'GET');
  assert.equal(calls[1].options.method, 'GET');
  assert.equal(calls[0].options.body, undefined);
  assert.equal(calls[1].options.body, undefined);
  assert.equal(new URL(calls[0].url).searchParams.get('start_time'), String(window.start_time));
  assert.equal(new URL(calls[0].url).searchParams.get('end_time'), String(window.end_time));
  assert.deepEqual(Object.fromEntries(new URL(calls[1].url).searchParams), {
    customer_manager: '',
    sales_manager: '',
    start_time: String(window.start_time),
    end_time: String(window.end_time),
    level: '0',
    limit_type: '1',
    page: '1',
    page_size: '2',
    sort_type: '1',
  });
  assert.equal(calls[0].options.headers['x-token'], 'secret-token');
  assert.equal(calls[1].options.headers['x-token'], 'secret-token');
  assert.equal(snapshot.computeOverview.totalCapacity, 1);
  assert.equal(snapshot.computeOverview.totalCustomers, 3);
  assert.deepEqual(snapshot.computeCustomerRows.map((row) => [row.phone, row.averageReplyRate]), [
    ['1', 80],
    ['2', 70],
  ]);
});

test('reads external compute endpoint paths from env config', () => {
  const config = computeApiConfigFromEnv({
    COMPUTE_API_BASE_URL: 'https://pre.zhihuige.cc/lmr',
    COMPUTE_API_TOKEN: 'secret-token',
    COMPUTE_PLATFORM_BOARD_PATH: '/api/custom/platform',
    COMPUTE_CUSTOMER_BOARD_PATH: '/api/custom/customer',
  });

  assert.deepEqual(config, {
    baseUrl: 'https://pre.zhihuige.cc/lmr',
    token: 'secret-token',
    platformBoardPath: '/api/custom/platform',
    customerBoardPath: '/api/custom/customer',
  });
});

test('uses 20 customer rows as the default live ranking sample size', async () => {
  const customerUrls = [];
  await loadExternalComputeSnapshot({
    baseUrl: 'https://pre.zhihuige.cc/csrc/',
    token: 'secret-token',
    now: new Date('2026-07-09T10:00:00+08:00'),
    fetchImpl: async (url) => {
      const parsedUrl = new URL(url);
      const isCustomer = parsedUrl.pathname.endsWith('/getCustomerBoardList');
      if (isCustomer) customerUrls.push(parsedUrl);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status_code: 200,
          data: isCustomer
            ? {
              customer_list: { list: [], total: 0 },
              level_deduct_details: { details: [], total: 0 },
              range_customer_details: { details: [], total: 0 },
            }
            : { last_30_day_details: [], last_30_day_pool: [] },
        }),
      };
    },
  });

  assert.equal(customerUrls[0].searchParams.get('page_size'), '20');
});

test('loads a single customer page for background pagination without calling the platform board', async () => {
  const calls = [];
  const page = await loadExternalComputeCustomerPage({
    baseUrl: 'https://pre.zhihuige.cc/csrc/',
    token: 'secret-token',
    page: 2,
    pageSize: 3,
    now: new Date('2026-07-09T10:00:00+08:00'),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status_code: 200,
          data: {
            customer_list: {
              list: [
                { phone: '4', nick_name: '四号', level: 3, deduct: 5, pool: 50, avg_ai_reply_rate: 0.6 },
              ],
              total: 4,
            },
          },
        }),
      };
    },
  });

  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /getCustomerBoardList/);
  assert.equal(new URL(calls[0].url).searchParams.get('page'), '2');
  assert.equal(new URL(calls[0].url).searchParams.get('page_size'), '3');
  assert.deepEqual(page, {
    rows: [{
      phone: '4',
      owner: '四号',
      accountType: '企业版',
      salesOwner: '',
      successOwner: '',
      usage: 5,
      balance: 50,
      averageReplyRate: 60,
      videoUsage: 0,
      vocUsage: 0,
    }],
    total: 4,
    page: 2,
    pageSize: 3,
  });
});

test('serves paginated compute customers over http with page/pageSize query params', async () => {
  process.env.COMPUTE_API_BASE_URL = 'https://pre.zhihuige.cc/csrc/';
  process.env.COMPUTE_API_TOKEN = 'secret-token';

  const chunks = [];
  let statusCode = null;
  const res = {
    writeHead(code) { statusCode = code; },
    end(body) { chunks.push(body); },
  };
  const req = { url: '/api/compute-customers?page=1&pageSize=2' };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      status_code: 200,
      data: { customer_list: { list: [], total: 0 } },
    }),
  });

  try {
    await handleComputeCustomersRequest(req, res);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.COMPUTE_API_BASE_URL;
    delete process.env.COMPUTE_API_TOKEN;
  }

  assert.equal(statusCode, 200);
  const body = JSON.parse(chunks[0]);
  assert.equal(body.source, 'mysql');
  assert.equal(body.page, 1);
  assert.equal(body.pageSize, 2);
  assert.deepEqual(body.rows, []);
  assert.equal(body.total, 0);
});
