/*
 更新时间: 2026-07-14 11:12:00 CST
 更新内容: 新增数据维护更新看板快照，按业务日期/月判断每组数据是否到数；达到或超过当前日期/月均视为已增加到数。
*/
import { queryRows } from './db.js';

const DATA_GROUPS = [
  { key: 'revenue', name: '经营回款', table: 'fact_revenue_daily', type: 'daily', dateColumn: 'stat_date' },
  { key: 'target', name: '目标数据', table: 'biz_target_monthly', type: 'monthly', dateColumn: 'year_month' },
  { key: 'cost', name: '渠道成本', table: 'biz_channel_cost_monthly', type: 'monthly', dateColumn: 'year_month' },
  { key: 'opening', name: '开户数', table: 'fact_opening_account_daily', type: 'daily', dateColumn: 'stat_date' },
  { key: 'versionSales', name: '版本销售', table: 'fact_version_sales_daily', type: 'daily', dateColumn: 'stat_date' },
  { key: 'renewal', name: '续费数据', table: 'fact_renewal_daily', type: 'daily', dateColumn: 'stat_date' },
  { key: 'computeUsage', name: '算力用量', table: 'fact_compute_usage_daily', type: 'daily', dateColumn: 'stat_date' },
  { key: 'computeCustomer', name: '算力客户', table: 'fact_compute_customer_daily', type: 'daily', dateColumn: 'stat_date' },
  { key: 'delivery', name: '交付订单', table: 'fact_delivery_order', type: 'daily', dateColumn: 'delivery_date' },
  { key: 'deliveryTarget', name: '交付目标', table: 'biz_delivery_target_monthly', type: 'monthly', dateColumn: 'year_month' },
];

const STATUS_LABELS = {
  updated: '今日已更新',
  current_month: '本月有数据',
  stale: '延迟',
  empty: '无数据',
  error: '异常',
};

function formatChinaDate(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function monthOf(dateText) {
  return String(dateText || '').slice(0, 7);
}

function addOneYear(year) {
  return `${Number(year) + 1}-01-01`;
}

function diffDays(fromDate, toDate) {
  if (!fromDate || !toDate) return null;
  const from = new Date(`${fromDate}T00:00:00+08:00`).getTime();
  const to = new Date(`${toDate}T00:00:00+08:00`).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.max(0, Math.floor((to - from) / 86400000));
}

function diffMonthStartDays(fromMonth, toMonth) {
  if (!fromMonth || !toMonth) return null;
  return diffDays(`${fromMonth}-01`, `${toMonth}-01`);
}

async function readDailyGroup(connection, group, year) {
  const start = `${year}-01-01`;
  const end = addOneYear(year);
  const rows = await queryRows(
    connection,
    `SELECT DATE_FORMAT(MAX(\`${group.dateColumn}\`), '%Y-%m-%d') AS latest_value, COUNT(*) AS row_count FROM \`${group.table}\` WHERE \`${group.dateColumn}\` >= ? AND \`${group.dateColumn}\` < ?`,
    [start, end],
  );
  return rows[0] ?? {};
}

async function readMonthlyGroup(connection, group, year) {
  const rows = await queryRows(
    connection,
    `SELECT MAX(\`${group.dateColumn}\`) AS latest_value, COUNT(*) AS row_count FROM \`${group.table}\` WHERE \`${group.dateColumn}\` LIKE ?`,
    [`${year}-%`],
  );
  return rows[0] ?? {};
}

function mapGroupStatus({ group, latestValue, rowCount, today, currentMonth }) {
  if (!rowCount || !latestValue) {
    return {
      status: 'empty',
      statusLabel: STATUS_LABELS.empty,
      lagDays: null,
    };
  }

  if (group.type === 'monthly') {
    const latestMonth = monthOf(latestValue);
    const current = latestMonth >= currentMonth;
    return {
      status: current ? 'current_month' : 'stale',
      statusLabel: current ? STATUS_LABELS.current_month : STATUS_LABELS.stale,
      lagDays: current ? 0 : diffMonthStartDays(latestMonth, currentMonth),
    };
  }

  const current = String(latestValue) >= today;
  return {
    status: current ? 'updated' : 'stale',
    statusLabel: current ? STATUS_LABELS.updated : STATUS_LABELS.stale,
    lagDays: current ? 0 : diffDays(String(latestValue), today),
  };
}

async function buildGroupSnapshot(connection, group, { year, today, currentMonth }) {
  try {
    const row = group.type === 'monthly'
      ? await readMonthlyGroup(connection, group, year)
      : await readDailyGroup(connection, group, year);
    const latestValue = row.latest_value ? String(row.latest_value).slice(0, group.type === 'monthly' ? 7 : 10) : '';
    const rowCount = Number(row.row_count || 0);
    const status = mapGroupStatus({ group, latestValue, rowCount, today, currentMonth });
    return {
      key: group.key,
      name: group.name,
      table: group.table,
      type: group.type,
      latestValue,
      rowCount,
      ...status,
    };
  } catch (err) {
    return {
      key: group.key,
      name: group.name,
      table: group.table,
      type: group.type,
      latestValue: '',
      rowCount: 0,
      status: 'error',
      statusLabel: STATUS_LABELS.error,
      lagDays: null,
      error: err.message,
    };
  }
}

function makeSummary(groups) {
  return groups.reduce((summary, group) => {
    summary.total += 1;
    if (group.status === 'current_month') {
      summary.currentMonth += 1;
    } else if (group.status in summary) {
      summary[group.status] += 1;
    }
    return summary;
  }, { total: 0, updated: 0, currentMonth: 0, stale: 0, empty: 0, error: 0 });
}

export async function buildUpdateMonitorSnapshot(connection, { year = 2026, now = new Date() } = {}) {
  const today = formatChinaDate(now);
  const currentMonth = monthOf(today);
  const groups = await Promise.all(DATA_GROUPS.map((group) => buildGroupSnapshot(connection, group, {
    year,
    today,
    currentMonth,
  })));
  return {
    checkedAt: now.toISOString(),
    today,
    currentMonth,
    summary: makeSummary(groups),
    groups,
  };
}
