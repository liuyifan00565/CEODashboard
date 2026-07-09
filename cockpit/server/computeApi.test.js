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
  loadExternalComputeSnapshot,
  mapExternalComputeBoards,
} from './computeApi.js';

test('maps external compute board payloads into dashboard compute snapshot fields', () => {
  const snapshot = mapExternalComputeBoards({
    platformBoard: {
      total: 2650773741,
      incr: 449249887,
      deduct: 139751667,
      last_30_day_details: [
        { date: 20260629, deduct: 5120000 },
        { date: 20260630, deduct: 5360000 },
      ],
      last_30_day_pool: [
        { date: 20260629, pool: 25780000 },
        { date: 20260630, pool: 26000000 },
      ],
    },
    customerBoard: {
      avg_ai_reply_rate: 70.4,
      customer_num: 5558,
      deduct: 34186157,
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
            pool: 7783896,
            avg_ai_reply_rate: 81,
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
    },
  ]);
});

test('loads external compute boards with get query and x-token header', async () => {
  const calls = [];
  const now = new Date('2026-07-09T10:00:00+08:00');
  const window = buildExternalComputeRequestWindow(now);
  const snapshot = await loadExternalComputeSnapshot({
    baseUrl: 'https://pre.zhihuige.cc/csrc/',
    platformBoardPath: '/csrc/api/v1/customer-management/getPlatformBoard',
    customerBoardPath: '/csrc/api/v1/customer-management/getCustomerBoardList',
    token: 'secret-token',
    now,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status_code: 200,
          data: new URL(url).pathname.endsWith('/getPlatformBoard')
            ? { total: 1, incr: 2, deduct: 3, last_30_day_details: [], last_30_day_pool: [] }
            : { customer_list: { list: [], total: 0 }, level_deduct_details: { details: [], total: 0 }, range_customer_details: { details: [], total: 0 } },
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
    page_size: '200',
    sort_type: '1',
  });
  assert.equal(calls[0].options.headers['x-token'], 'secret-token');
  assert.equal(calls[1].options.headers['x-token'], 'secret-token');
  assert.equal(snapshot.computeOverview.totalCapacity, 1);
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
