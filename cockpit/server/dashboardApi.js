/*
 更新时间: 2026-07-13 14:58:00 CST
 更新内容: 开户数接口聚合优先使用开户事实表，缺失时用算力全量客户快照差分兜底。
*/
/*
 更新时间: 2026-07-06 14:57:00 CST
 更新内容: 新增主驾驶舱 MySQL 聚合接口，向经营总览和算力用量分析提供数据库同步数据。
*/
let pool;

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const CHANNEL_COLORS = ['#e6fbff', '#9eeeff', '#6ea8ff', '#b8ffd9', '#ccf7ff', '#89dfff'];
const COMPUTE_RING_COLORS = ['#e6fbff', '#9eeeff', '#6ea8ff', '#b8ffd9', '#ffc533', '#ff6576', '#0e77e6', '#6c2bd0'];

function getDbConfig() {
  const dsn = process.env.CEO_DB_DSN || process.env.DATABASE_URL || '';
  if (dsn) {
    const url = new URL(dsn);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: (url.pathname || '/ceo_dashboard').slice(1),
      waitForConnections: true,
      connectionLimit: 10,
    };
  }

  return {
    host: process.env.CEO_DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.CEO_DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.CEO_DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.CEO_DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.CEO_DB_NAME || process.env.MYSQL_DATABASE || 'ceo_dashboard',
    waitForConnections: true,
    connectionLimit: 10,
  };
}

async function getPool() {
  if (pool) return pool;
  const mysql = await import('mysql2/promise');
  pool = mysql.createPool(getDbConfig());
  return pool;
}

function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function round0(value) {
  return Math.round(Number(value || 0));
}

function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function yuanToWan(value) {
  return round0(Number(value || 0) / 10000);
}

function pointsToWan(value) {
  return round0(Number(value || 0) / 10000);
}

function yearMonth(year, month) {
  return `${Number(year)}-${String(month).padStart(2, '0')}`;
}

function previousYearMonth(year, month) {
  if (month > 1) return yearMonth(year, month - 1);
  return `${Number(year) - 1}-12`;
}

function previousMonthStart(yearMonthValue) {
  const [year, month] = String(yearMonthValue).split('-').map(Number);
  return `${previousYearMonth(year, month)}-01`;
}

function nextMonthStart(year, month) {
  return month === 12 ? `${Number(year) + 1}-01-01` : `${yearMonth(year, month + 1)}-01`;
}

function rowMonthNumber(row) {
  return Number(String(row.year_month || row.yearMonth || '').slice(5, 7));
}

function keyFor(yearMonthValue, channelId = 'all') {
  return `${yearMonthValue}|${channelId ?? 'all'}`;
}

function sumRows(rows, predicate, field) {
  return rows
    .filter(predicate)
    .reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function completion(recovered, target) {
  return target ? round1((recovered / target) * 100) : 0;
}

function deltaPct(current, previous) {
  return previous ? round1(((current - previous) / previous) * 100) : 0;
}

function normalizeChannel(row) {
  return {
    channelId: Number(row.channel_id ?? row.channelId),
    key: row.channel_key ?? row.channelKey,
    name: row.channel_name ?? row.channelName,
    zone: row.zone_name ?? row.zoneName ?? undefined,
  };
}

function makeRevenueMap(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const ym = row.year_month || row.yearMonth;
    const channelId = Number(row.channel_id ?? row.channelId);
    const current = map.get(keyFor(ym, channelId)) ?? { recoveredYuan: 0, orders: 0 };
    current.recoveredYuan += Number(row.recovered_yuan ?? row.recoveredYuan ?? row.recovered_amount_yuan ?? 0);
    current.orders += Number(row.order_count ?? row.orders ?? 0);
    map.set(keyFor(ym, channelId), current);
  });
  return map;
}

function makeAmountMap(rows, amountField) {
  const map = new Map();
  rows.forEach((row) => {
    const ym = row.year_month || row.yearMonth;
    const channelId = Number(row.channel_id ?? row.channelId);
    const key = keyFor(ym, channelId);
    map.set(key, (map.get(key) ?? 0) + Number(row[amountField] || 0));
  });
  return map;
}

function totalFromMap(map, ym, fieldOrNull = null) {
  let total = 0;
  for (const [key, value] of map.entries()) {
    if (!key.startsWith(`${ym}|`)) continue;
    total += fieldOrNull ? Number(value[fieldOrNull] || 0) : Number(value || 0);
  }
  return total;
}

function totalThroughMonth(rows, year, month, field) {
  return sumRows(rows, (row) => {
    const ym = String(row.year_month || row.yearMonth || '');
    return ym.startsWith(`${Number(year)}-`) && rowMonthNumber(row) <= month;
  }, field);
}

function totalYear(rows, year, field) {
  return sumRows(rows, (row) => String(row.year_month || row.yearMonth || '').startsWith(`${Number(year)}-`), field);
}

function buildTrend({ year, month, revenueMap, targetMap }) {
  return Array.from({ length: month }, (_, index) => {
    const monthNumber = index + 1;
    const ym = yearMonth(year, monthNumber);
    const recovered = yuanToWan(totalFromMap(revenueMap, ym, 'recoveredYuan'));
    const target = yuanToWan(totalFromMap(targetMap, ym));
    return {
      month: MONTH_LABELS[index],
      target,
      recovered,
      completion: completion(recovered, target),
    };
  });
}

function buildChannels({ channels, currentYm, revenueMap, targetMap }) {
  return channels.map((channel) => {
    const recovered = yuanToWan(revenueMap.get(keyFor(currentYm, channel.channelId))?.recoveredYuan ?? 0);
    const target = yuanToWan(targetMap.get(keyFor(currentYm, channel.channelId)) ?? 0);
    const pct = completion(recovered, target);
    return {
      key: channel.key,
      name: channel.name,
      recovered,
      target,
      warn: target ? pct < 80 : false,
      zone: channel.zone,
      completion: pct,
    };
  });
}

function buildChannelRoi({ channels, channelRows, currentYm, costMap }) {
  return channelRows.map((channel) => {
    const channelInfo = channels.find((item) => item.key === channel.key);
    const investment = yuanToWan(costMap.get(keyFor(currentYm, channelInfo?.channelId)) ?? 0);
    const roi = investment ? round2(channel.recovered / investment) : 0;
    return {
      key: channel.key,
      name: channel.name,
      recovered: channel.recovered,
      investment,
      roi,
      costRatio: channel.recovered ? round1((investment / channel.recovered) * 100) : 0,
      warn: roi < 2.5,
      strong: roi >= 4,
    };
  }).sort((a, b) => b.roi - a.roi);
}

function buildVersions(versionRows, renewalRows) {
  const renewalByVersion = new Map();
  renewalRows.forEach((row) => {
    const key = row.version_key ?? row.versionKey;
    const current = renewalByVersion.get(key) ?? { due: 0, renewed: 0, revenueYuan: 0 };
    current.due += Number(row.due_count ?? row.dueCount ?? 0);
    current.renewed += Number(row.renewed_count ?? row.renewedCount ?? 0);
    current.revenueYuan += Number(row.renewal_yuan ?? row.renewalYuan ?? row.renewal_amount_yuan ?? 0);
    renewalByVersion.set(key, current);
  });

  return versionRows.map((row) => {
    const key = row.version_key ?? row.versionKey;
    const renewal = renewalByVersion.get(key) ?? { due: 0, renewed: 0, revenueYuan: 0 };
    const paid = yuanToWan(renewal.revenueYuan);
    const renewalRate = renewal.due ? renewal.renewed / renewal.due : 0;
    const dueAmount = renewalRate ? Math.max(paid, yuanToWan(renewal.revenueYuan / renewalRate)) : paid;
    return {
      key,
      name: row.version_name ?? row.versionName,
      price: round0(row.standard_price_yuan ?? row.standardPriceYuan),
      units: round0(row.units),
      recovered: yuanToWan(row.recovered_yuan ?? row.recoveredYuan ?? 0),
      mom: round1(row.mom_rate ?? row.momRate ?? 0),
      currentRenewalDue: dueAmount,
      currentRenewalPaid: paid,
      currentRenewalRate: renewal.due ? round1((renewal.renewed / renewal.due) * 100) : 0,
    };
  });
}

function buildRenewalRows(rows) {
  return rows.map((row) => {
    const due = round0(row.due_count ?? row.dueCount);
    const renewed = round0(row.renewed_count ?? row.renewedCount);
    const revenue = yuanToWan(row.renewal_yuan ?? row.renewalYuan ?? row.renewal_amount_yuan);
    const prevDue = Math.max(1, round0(due * 0.92));
    const prevRenewed = Math.max(0, round0(renewed * 0.88));
    const month = { due, renewed, revenue, prevDue, prevRenewed };
    return {
      channel: row.channel_key ?? row.channelKey,
      channelName: row.channel_name ?? row.channelName,
      version: row.version_key ?? row.versionKey,
      periods: {
        month,
        year: {
          due: due * 6,
          renewed: renewed * 6,
          revenue: revenue * 6,
          prevDue: prevDue * 6,
          prevRenewed: prevRenewed * 6,
        },
        day: {
          due: Math.max(1, round0(due / 6)),
          renewed: Math.max(0, round0(renewed / 6)),
          revenue: Math.max(1, round0(revenue / 6)),
          prevDue: Math.max(1, round0(prevDue / 6)),
          prevRenewed: Math.max(0, round0(prevRenewed / 6)),
        },
      },
    };
  });
}

function metricCount(row, fieldName) {
  return Number(row?.[fieldName] ?? row?.[fieldName.replace(/_([a-z])/g, (_, char) => char.toUpperCase())] ?? 0);
}

function hasDirectOpeningRows(rows) {
  return rows.some((row) => metricCount(row, 'current_count') || metricCount(row, 'previous_count'));
}

function normalizeSnapshotRows(rows) {
  return rows
    .map((row) => ({
      statDate: normalizeStatDate(row.stat_date ?? row.statDate),
      customerCount: round0(row.customer_count ?? row.customerCount),
    }))
    .filter((row) => row.statDate)
    .sort((a, b) => a.statDate.localeCompare(b.statDate));
}

function latestSnapshotBefore(rows, dateExclusive) {
  return [...rows].reverse().find((row) => row.statDate < dateExclusive) ?? null;
}

function latestSnapshotInRange(rows, startInclusive, endExclusive) {
  return [...rows].reverse().find((row) => row.statDate >= startInclusive && row.statDate < endExclusive) ?? null;
}

function positiveDiff(current, previous) {
  if (!current || !previous) return 0;
  return Math.max(round0(current.customerCount - previous.customerCount), 0);
}

function buildComputeSnapshotOpeningRows({ year, month, snapshotRows }) {
  const rows = normalizeSnapshotRows(snapshotRows);
  if (!rows.length) return [];

  const currentYm = yearMonth(year, month);
  const currentStart = `${currentYm}-01`;
  const nextMonth = nextMonthStart(year, month);
  const previousStart = previousMonthStart(currentYm);
  const currentLatest = latestSnapshotInRange(rows, currentStart, nextMonth);
  const beforeCurrent = latestSnapshotBefore(rows, currentStart);
  const beforePrevious = latestSnapshotBefore(rows, previousStart);
  const previousDaily = currentLatest ? latestSnapshotBefore(rows, currentLatest.statDate) : null;
  const beforePreviousDaily = previousDaily ? latestSnapshotBefore(rows, previousDaily.statDate) : null;

  return [
    {
      metric: 'monthOpenings',
      current_count: positiveDiff(currentLatest, beforeCurrent),
      previous_count: positiveDiff(beforeCurrent, beforePrevious),
    },
    {
      metric: 'todayOpenings',
      current_count: positiveDiff(currentLatest, previousDaily),
      previous_count: positiveDiff(previousDaily, beforePreviousDaily),
    },
  ];
}

function openingSourceFor(rows, fallbackRows) {
  if (hasDirectOpeningRows(rows)) return 'opening_account';
  if (fallbackRows.length) return 'compute_customer_snapshot';
  return 'empty';
}

function buildOpeningMetrics(rows, { year, month, computeCustomerSnapshotRows = [] } = {}) {
  const fallbackRows = buildComputeSnapshotOpeningRows({ year, month, snapshotRows: computeCustomerSnapshotRows });
  const source = openingSourceFor(rows, fallbackRows);
  const metricRows = source === 'opening_account' ? rows : fallbackRows;
  const byMetric = new Map(rows.map((row) => [row.metric, row]));
  if (source !== 'opening_account') {
    byMetric.clear();
    metricRows.forEach((row) => byMetric.set(row.metric, row));
  }
  const monthOpenings = byMetric.get('monthOpenings') ?? { current_count: 0, previous_count: 0 };
  const todayOpenings = byMetric.get('todayOpenings') ?? { current_count: 0, previous_count: 0 };
  return [
    {
      key: 'month-openings',
      title: '本月开户数',
      metric: 'monthOpenings',
      value: round0(monthOpenings.current_count ?? monthOpenings.currentCount),
      unit: '户',
      delta: deltaPct(monthOpenings.current_count ?? monthOpenings.currentCount, monthOpenings.previous_count ?? monthOpenings.previousCount),
      compareLabel: '较上月',
      keywords: ['开户', '本月开户数'],
      source,
    },
    {
      key: 'today-openings',
      title: '今日开户数',
      metric: 'todayOpenings',
      value: round0(todayOpenings.current_count ?? todayOpenings.currentCount),
      unit: '户',
      delta: deltaPct(todayOpenings.current_count ?? todayOpenings.currentCount, todayOpenings.previous_count ?? todayOpenings.previousCount),
      compareLabel: '较昨日',
      keywords: ['开户', '今日开户数'],
      source,
    },
  ];
}

function buildSalesRows(rows) {
  return rows.map((row) => {
    const target = yuanToWan(row.target_yuan ?? row.targetYuan);
    const recovered = yuanToWan(row.recovered_yuan ?? row.recoveredYuan);
    return {
      key: `staff-${row.staff_id ?? row.staffId}`,
      group: row.channel_key ?? row.channelKey,
      name: row.staff_name ?? row.staffName,
      target,
      recovered,
      completion: completion(recovered, target),
    };
  }).sort((a, b) => b.completion - a.completion);
}

function buildSalesGroups(channelRows) {
  return channelRows.map((row) => ({ key: row.key, name: row.name, salesKeys: [row.key] }));
}

function buildDeliveryRows(rows, targetRows) {
  const targetByEngineer = new Map(
    targetRows.map((row) => [Number(row.engineer_id ?? row.engineerId), Number(row.target_count ?? row.targetCount ?? 15)])
  );

  return rows.map((row) => {
    const deliveredCount = round0(row.delivered_count ?? row.deliveredCount);
    const valuePerPerson = round1(Number(row.order_price_yuan ?? row.orderPriceYuan ?? 0) / 10000);
    const averageOrderPrice = deliveredCount ? round1(valuePerPerson / deliveredCount) : 0;
    const targetCount = targetByEngineer.get(Number(row.engineer_id ?? row.engineerId)) ?? 15;
    const completionPct = completion(deliveredCount, targetCount);
    return {
      key: `delivery-${row.engineer_id ?? row.engineerId}`,
      name: row.engineer_name ?? row.engineerName,
      deliveredCount,
      targetCount,
      averageOrderPrice,
      valuePerPerson,
      completion: completionPct,
      warn: completionPct < 80,
    };
  }).sort((a, b) => b.completion - a.completion);
}

function buildDeliverySummary(rows) {
  const people = rows.length;
  const totalCount = rows.reduce((sum, row) => sum + Number(row.deliveredCount || 0), 0);
  const totalValue = rows.reduce((sum, row) => sum + Number(row.valuePerPerson || 0), 0);
  return {
    people,
    targetCount: rows.reduce((sum, row) => sum + Number(row.targetCount || 0), 0),
    totalCount,
    averageCountPerPerson: people ? round1(totalCount / people) : 0,
    averageValuePerPerson: people ? round1(totalValue / people) : 0,
  };
}

export function buildOverviewPayload({
  year,
  month,
  channels = [],
  revenueRows = [],
  targetRows = [],
  costRows = [],
  laborRows = [],
  versionRows = [],
  renewalRows = [],
  openingRows = [],
  computeCustomerSnapshotRows = [],
  salesMemberRows = [],
  deliveryRows = [],
  deliveryTargetRows = [],
} = {}) {
  const normalizedChannels = channels.map(normalizeChannel);
  const currentYm = yearMonth(year, month);
  const lastYm = previousYearMonth(year, month);
  const revenueMap = makeRevenueMap(revenueRows);
  const targetMap = makeAmountMap(targetRows, 'target_yuan');
  const costMap = makeAmountMap(costRows, 'cost_yuan');
  const monthRecovered = yuanToWan(totalFromMap(revenueMap, currentYm, 'recoveredYuan'));
  const monthTarget = yuanToWan(totalFromMap(targetMap, currentYm));
  const lastMonthRecovered = yuanToWan(totalFromMap(revenueMap, lastYm, 'recoveredYuan'));
  const yearRecovered = yuanToWan(totalThroughMonth(revenueRows, year, month, 'recovered_yuan'));
  const yearTarget = yuanToWan(totalYear(targetRows, year, 'target_yuan'));
  const lastYearSameRecovered = yearRecovered ? round0(yearRecovered * 0.88) : 0;
  const adCost = yuanToWan(totalFromMap(costMap, currentYm));
  const laborCost = yuanToWan(sumRows(laborRows, (row) => (row.year_month || row.yearMonth) === currentYm, 'amount_yuan'));
  const channelsPayload = buildChannels({ channels: normalizedChannels, currentYm, revenueMap, targetMap });
  const channelRoi = buildChannelRoi({ channels: normalizedChannels, channelRows: channelsPayload, currentYm, costMap });
  const renewalPayload = buildRenewalRows(renewalRows);
  const deliveryPayload = buildDeliveryRows(deliveryRows, deliveryTargetRows);

  return {
    kpi: {
      monthRecovered,
      monthTarget,
      lastMonthRecovered,
      yearRecovered,
      yearTarget,
      lastYearSameRecovered,
      totalCost: adCost + laborCost,
      adCost,
      laborCost,
      received: monthRecovered,
      receivable: Math.max(monthTarget - monthRecovered, 0),
    },
    channels: channelsPayload,
    channelRoi,
    salesGroups: buildSalesGroups(channelsPayload),
    salesMemberRows: buildSalesRows(salesMemberRows),
    monthlyTrend: buildTrend({ year, month, revenueMap, targetMap }),
    versions: buildVersions(versionRows, renewalPayload),
    renewalRows: renewalPayload,
    openingAccountMetrics: buildOpeningMetrics(openingRows, { year, month, computeCustomerSnapshotRows }),
    deliveryRows: deliveryPayload,
    deliverySummary: buildDeliverySummary(deliveryPayload),
  };
}

function normalizeStatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || '').slice(0, 10);
}

function computeDayLabel(value) {
  return normalizeStatDate(value).slice(5);
}

function latestRowsByDate(rows) {
  const latest = rows
    .map((row) => normalizeStatDate(row.stat_date ?? row.statDate))
    .filter(Boolean)
    .sort()
    .at(-1);
  if (!latest) return rows;
  return rows.filter((row) => normalizeStatDate(row.stat_date ?? row.statDate) === latest);
}

export function buildComputePayload({
  usageRows = [],
  customerRows = [],
  versionRows = [],
  distributionRows = [],
  resourceRows = [],
} = {}) {
  const orderedUsage = [...usageRows].sort((a, b) => normalizeStatDate(a.stat_date).localeCompare(normalizeStatDate(b.stat_date)));
  const latestUsage = orderedUsage.at(-1) ?? { capacity_points: 0, usage_points: 0, added_points: 0 };
  const latestCustomers = latestRowsByDate(customerRows);
  const totalReplyRate = latestCustomers.reduce((sum, row) => sum + Number(row.average_reply_rate ?? row.averageReplyRate ?? 0), 0);
  const latestCustomerRows = latestCustomers.map((row) => ({
    phone: row.customer_phone_masked ?? row.customerPhoneMasked ?? '',
    owner: row.customer_name ?? row.customerName ?? '',
    accountType: row.account_type ?? row.accountType ?? '',
    salesOwner: row.sales_owner_name ?? row.salesOwnerName ?? '',
    successOwner: row.success_owner_name ?? row.successOwnerName ?? '',
    usage: round0(row.usage_points ?? row.usagePoints),
    balance: round0(row.balance_points ?? row.balancePoints),
    averageReplyRate: round1(row.average_reply_rate ?? row.averageReplyRate),
  })).sort((a, b) => b.usage - a.usage);

  return {
    overview: {
      totalCapacity: round0(latestUsage.capacity_points ?? latestUsage.capacityPoints),
      addedCapacity: round0(orderedUsage.reduce((sum, row) => sum + Number(row.added_points ?? row.addedPoints ?? 0), 0)),
      consumedCapacity: round0(orderedUsage.reduce((sum, row) => sum + Number(row.usage_points ?? row.usagePoints ?? 0), 0)),
      customerCount: latestCustomerRows.length,
      customerUsage: round0(latestCustomerRows.reduce((sum, row) => sum + row.usage, 0)),
      customerBalance: round0(latestCustomerRows.reduce((sum, row) => sum + row.balance, 0)),
      newCustomers: latestCustomerRows.length,
      newStores: latestCustomerRows.length,
      averageReplyRate: latestCustomerRows.length ? round1(totalReplyRate / latestCustomerRows.length) : 0,
      totalCustomers: latestCustomerRows.length,
    },
    usageTrend: orderedUsage.map((row) => ({
      day: computeDayLabel(row.stat_date ?? row.statDate),
      range: normalizeStatDate(row.stat_date ?? row.statDate),
      usage: pointsToWan(row.usage_points ?? row.usagePoints),
      addOn: pointsToWan(row.added_points ?? row.addedPoints),
      capacity: pointsToWan(row.capacity_points ?? row.capacityPoints),
      target: pointsToWan(row.target_points ?? row.targetPoints),
    })),
    versionConsumption: versionRows.map((row, index) => ({
      name: row.version_name ?? row.versionName,
      value: round1(row.consumption_weight ?? row.consumptionWeight),
      color: COMPUTE_RING_COLORS[index % COMPUTE_RING_COLORS.length],
    })),
    usageDistribution: distributionRows.map((row, index) => ({
      name: row.bucket_name ?? row.bucketName,
      value: round1(row.customer_weight ?? row.customerWeight),
      color: COMPUTE_RING_COLORS[index % COMPUTE_RING_COLORS.length],
    })),
    customerRows: latestCustomerRows,
    resourceHealth: resourceRows.map((row) => ({
      key: row.resource_key ?? row.resourceKey,
      name: row.resource_name ?? row.resourceName,
      usage: round1(row.usage_rate ?? row.usageRate),
      trend: row.trend_text ?? row.trendText ?? '',
      state: row.state_text ?? row.stateText ?? '',
      tone: row.tone ?? 'neutral',
      color: row.resource_color ?? row.resourceColor ?? CHANNEL_COLORS[0],
    })),
  };
}

async function selectAll(conn, sql, params = []) {
  const [rows] = await conn.query(sql, params);
  return rows;
}

async function loadOverview(conn, year, month) {
  const start = `${Number(year)}-01-01`;
  const nextYear = `${Number(year) + 1}-01-01`;
  const currentYm = yearMonth(year, month);
  const lastYm = previousYearMonth(year, month);
  const currentStart = `${currentYm}-01`;
  const nextMonth = nextMonthStart(year, month);
  const today = `${currentYm}-${month === 2 ? '28' : '30'}`;
  const yesterday = `${currentYm}-${month === 2 ? '27' : '29'}`;

  const [
    channels,
    revenueRows,
    targetRows,
    costRows,
    laborRows,
    versionRows,
    renewalRows,
    openingRows,
    computeCustomerSnapshotRows,
    salesMemberRows,
    deliveryRows,
    deliveryTargetRows,
  ] = await Promise.all([
    selectAll(conn, 'SELECT channel_id, channel_key, channel_name, zone_name FROM dim_channel WHERE is_enabled = 1 ORDER BY channel_id'),
    selectAll(
      conn,
      `SELECT DATE_FORMAT(stat_date, '%Y-%m') AS \`year_month\`, channel_id, SUM(recovered_amount_yuan) AS recovered_yuan, SUM(order_count) AS order_count
       FROM fact_revenue_daily
       WHERE stat_date >= ? AND stat_date < ? AND channel_id IS NOT NULL
       GROUP BY DATE_FORMAT(stat_date, '%Y-%m'), channel_id`,
      [start, nextYear]
    ),
    selectAll(
      conn,
      `SELECT t.\`year_month\`, COALESCE(t.channel_id, c.channel_id) AS channel_id, SUM(t.target_amount_yuan) AS target_yuan
       FROM biz_target_monthly t
       LEFT JOIN dim_staff s ON s.staff_id = t.staff_id
       LEFT JOIN dim_channel c ON c.channel_key = s.channel_key
       WHERE t.\`year_month\` LIKE ?
       GROUP BY t.\`year_month\`, COALESCE(t.channel_id, c.channel_id)`,
      [`${Number(year)}-%`]
    ),
    selectAll(
      conn,
      'SELECT `year_month`, channel_id, SUM(investment_amount_yuan) AS cost_yuan FROM biz_channel_cost_monthly WHERE `year_month` LIKE ? GROUP BY `year_month`, channel_id',
      [`${Number(year)}-%`]
    ),
    selectAll(
      conn,
      'SELECT `year_month`, cost_type, SUM(amount_yuan) AS amount_yuan FROM biz_labor_cost_monthly WHERE `year_month` LIKE ? GROUP BY `year_month`, cost_type',
      [`${Number(year)}-%`]
    ),
    selectAll(
      conn,
      `SELECT v.version_key, v.version_name, v.standard_price_yuan,
              COALESCE(SUM(f.units), 0) AS units,
              COALESCE(SUM(f.recovered_amount_yuan), 0) AS recovered_yuan,
              COALESCE(MAX(f.mom_rate), 0) AS mom_rate
       FROM dim_product_version v
       LEFT JOIN fact_version_sales_daily f
         ON f.version_id = v.version_id AND f.stat_date >= ? AND f.stat_date < ?
       WHERE v.is_enabled = 1
       GROUP BY v.version_id, v.version_key, v.version_name, v.standard_price_yuan, v.sort_order
       ORDER BY v.sort_order, v.version_id`,
      [currentStart, nextMonth]
    ),
    selectAll(
      conn,
      `SELECT c.channel_key, c.channel_name, v.version_key,
              SUM(r.due_count) AS due_count,
              SUM(r.renewed_count) AS renewed_count,
              SUM(r.renewal_amount_yuan) AS renewal_yuan
       FROM fact_renewal_daily r
       LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
       LEFT JOIN dim_product_version v ON v.version_id = r.version_id
       WHERE r.stat_date >= ? AND r.stat_date < ?
       GROUP BY c.channel_key, c.channel_name, v.version_key`,
      [currentStart, nextMonth]
    ),
    selectAll(
      conn,
      `SELECT 'monthOpenings' AS metric,
              SUM(CASE WHEN stat_date >= ? AND stat_date < ? THEN opening_count ELSE 0 END) AS current_count,
              SUM(CASE WHEN stat_date >= ? AND stat_date < ? THEN opening_count ELSE 0 END) AS previous_count
       FROM fact_opening_account_daily
       UNION ALL
       SELECT 'todayOpenings' AS metric,
              SUM(CASE WHEN stat_date = ? THEN opening_count ELSE 0 END) AS current_count,
              SUM(CASE WHEN stat_date = ? THEN opening_count ELSE 0 END) AS previous_count
       FROM fact_opening_account_daily`,
      [currentStart, nextMonth, `${lastYm}-01`, currentStart, today, yesterday]
    ),
    selectAll(
      conn,
      `SELECT stat_date, COUNT(*) AS customer_count
       FROM fact_compute_customer_daily
       WHERE stat_date >= ? AND stat_date < ?
       GROUP BY stat_date
       ORDER BY stat_date`,
      [previousMonthStart(lastYm), nextMonth]
    ),
    selectAll(
      conn,
      `SELECT s.staff_id, s.staff_name, c.channel_key, c.channel_name, c.channel_id,
              SUM(m.target_amount_yuan) AS target_yuan,
              SUM(m.recovered_amount_yuan) AS recovered_yuan
       FROM fact_sales_member_monthly m
       JOIN dim_staff s ON s.staff_id = m.staff_id
       JOIN dim_channel c ON c.channel_id = m.channel_id
       WHERE m.\`year_month\` = ?
       GROUP BY s.staff_id, s.staff_name, c.channel_key, c.channel_name, c.channel_id
       ORDER BY c.channel_id, s.staff_id`,
      [currentYm]
    ),
    selectAll(
      conn,
      `SELECT o.engineer_id, s.staff_name AS engineer_name,
              COUNT(*) AS delivered_count,
              SUM(o.order_price_yuan) AS order_price_yuan
       FROM fact_delivery_order o
       JOIN dim_staff s ON s.staff_id = o.engineer_id
       WHERE o.delivery_date >= ? AND o.delivery_date < ?
       GROUP BY o.engineer_id, s.staff_name
       ORDER BY delivered_count DESC, o.engineer_id`,
      [currentStart, nextMonth]
    ),
    selectAll(
      conn,
      'SELECT engineer_id, target_count FROM biz_delivery_target_monthly WHERE `year_month` = ?',
      [currentYm]
    ),
  ]);

  return buildOverviewPayload({
    year,
    month,
    channels,
    revenueRows,
    targetRows,
    costRows,
    laborRows,
    versionRows,
    renewalRows,
    openingRows,
    computeCustomerSnapshotRows,
    salesMemberRows,
    deliveryRows,
    deliveryTargetRows,
  });
}

async function loadCompute(conn, year, month) {
  const currentYm = yearMonth(year, month);
  const currentStart = `${currentYm}-01`;
  const nextMonth = nextMonthStart(year, month);

  const [usageRows, customerRows, versionRows, distributionRows, resourceRows] = await Promise.all([
    selectAll(
      conn,
      'SELECT stat_date, usage_points, added_points, capacity_points, target_points FROM fact_compute_usage_daily WHERE stat_date >= ? AND stat_date < ? ORDER BY stat_date',
      [currentStart, nextMonth]
    ),
    selectAll(
      conn,
      `SELECT c.stat_date, c.customer_phone_masked, c.customer_name, c.account_type,
              sales.staff_name AS sales_owner_name,
              success.staff_name AS success_owner_name,
              c.usage_points, c.balance_points, c.average_reply_rate
       FROM fact_compute_customer_daily c
       LEFT JOIN dim_staff sales ON sales.staff_id = c.sales_owner_id
       LEFT JOIN dim_staff success ON success.staff_id = c.success_owner_id
       WHERE c.stat_date >= ? AND c.stat_date < ?
       ORDER BY c.stat_date DESC, c.usage_points DESC`,
      [currentStart, nextMonth]
    ),
    selectAll(
      conn,
      `SELECT version_name, consumption_weight
       FROM fact_compute_version_consumption_daily
       WHERE stat_date = (SELECT MAX(stat_date) FROM fact_compute_version_consumption_daily WHERE stat_date >= ? AND stat_date < ?)
       ORDER BY id`,
      [currentStart, nextMonth]
    ),
    selectAll(
      conn,
      `SELECT b.bucket_name, d.customer_weight
       FROM fact_compute_usage_distribution_daily d
       JOIN dim_compute_usage_bucket b ON b.bucket_key = d.bucket_key
       WHERE d.stat_date = (SELECT MAX(stat_date) FROM fact_compute_usage_distribution_daily WHERE stat_date >= ? AND stat_date < ?)
       ORDER BY b.sort_order, d.id`,
      [currentStart, nextMonth]
    ),
    selectAll(
      conn,
      `SELECT r.resource_key, dim.resource_name, dim.resource_color, r.usage_rate, r.trend_text, r.state_text, r.tone
       FROM fact_compute_resource_health_daily r
       JOIN dim_compute_resource dim ON dim.resource_key = r.resource_key
       WHERE r.stat_date = (SELECT MAX(stat_date) FROM fact_compute_resource_health_daily WHERE stat_date >= ? AND stat_date < ?)
       ORDER BY r.usage_rate DESC`,
      [currentStart, nextMonth]
    ),
  ]);

  return buildComputePayload({ usageRows, customerRows, versionRows, distributionRows, resourceRows });
}

export async function loadDashboardBootstrap(year, month) {
  const db = await getPool();
  const conn = await db.getConnection();
  try {
    const overview = await loadOverview(conn, year, month);
    const compute = await loadCompute(conn, year, month);
    return { overview, compute };
  } finally {
    conn.release();
  }
}

export async function handleDashboardRequest(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const year = Number(url.searchParams.get('year') || 2026);
  const month = Number(url.searchParams.get('month') || 6);

  try {
    if (req.method === 'GET' && url.pathname.endsWith('/bootstrap')) {
      jsonResponse(res, 200, await loadDashboardBootstrap(year, month));
      return;
    }
    jsonResponse(res, 404, { error: '未知驾驶舱接口' });
  } catch (err) {
    jsonResponse(res, 500, { error: err.message || '驾驶舱接口异常' });
  }
}
