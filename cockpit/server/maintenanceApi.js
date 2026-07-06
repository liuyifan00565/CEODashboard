/*
 更新时间: 2026-07-06 10:28:05 CST
 更新内容: 新增数据维护页 MySQL 读写接口，统一 UI 可编辑字段与 ceo_dashboard 表字段。
*/
const MONTH_KEYS = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12'];
const QUARTERS = {
  q1: ['m01', 'm02', 'm03'],
  q2: ['m04', 'm05', 'm06'],
  q3: ['m07', 'm08', 'm09'],
  q4: ['m10', 'm11', 'm12'],
};

const DEFAULT_DEPARTMENTS = [
  { departmentId: 1001, departmentCode: 'headquarters', departmentName: '成都福客人工智能', parentId: null, sortOrder: 10, isEnabled: 1 },
  { departmentId: 1002, departmentCode: 'online-sales', departmentName: '线上销售部', parentId: 1001, sortOrder: 20, isEnabled: 1 },
  { departmentId: 1003, departmentCode: 'offline-sales', departmentName: '线下销售部', parentId: 1001, sortOrder: 30, isEnabled: 1 },
  { departmentId: 1004, departmentCode: 'south-sales', departmentName: '华南战区', parentId: 1003, sortOrder: 40, isEnabled: 1 },
  { departmentId: 1005, departmentCode: 'east-sales', departmentName: '华东战区', parentId: 1003, sortOrder: 50, isEnabled: 1 },
  { departmentId: 1006, departmentCode: 'agent-sales', departmentName: '代理渠道部', parentId: 1001, sortOrder: 60, isEnabled: 1 },
  { departmentId: 1099, departmentCode: 'paused-team', departmentName: '历史停用团队', parentId: 1001, sortOrder: 990, isEnabled: 0 },
];

const DEFAULT_STAFF = [
  { staffId: 2001, staffCode: 'u-online-01', staffName: '王丽英', departmentId: 1002, channelKey: 'online', externalBiUserId: 'wl_10086', isSales: 1, isDelivery: 0, isSuccess: 0, isEnabled: 1 },
  { staffId: 2002, staffCode: 'u-online-02', staffName: '李思雨', departmentId: 1002, channelKey: 'online', externalBiUserId: 'wl_10087', isSales: 1, isDelivery: 0, isSuccess: 0, isEnabled: 1 },
  { staffId: 2003, staffCode: 'u-south-01', staffName: '杨磊', departmentId: 1004, channelKey: 'south', externalBiUserId: 'wl_10091', isSales: 1, isDelivery: 0, isSuccess: 0, isEnabled: 1 },
  { staffId: 2004, staffCode: 'u-east-01', staffName: '马骏', departmentId: 1005, channelKey: 'east', externalBiUserId: 'wl_10095', isSales: 1, isDelivery: 0, isSuccess: 0, isEnabled: 1 },
  { staffId: 2005, staffCode: 'u-agent-01', staffName: '南唐代理', departmentId: 1006, channelKey: 'agent', externalBiUserId: 'wl_partner_01', isSales: 1, isDelivery: 0, isSuccess: 0, isEnabled: 1 },
  { staffId: 2099, staffCode: 'u-paused-01', staffName: '旧账号样本', departmentId: 1099, channelKey: null, externalBiUserId: 'wl_archived_01', isSales: 0, isDelivery: 0, isSuccess: 0, isEnabled: 0 },
];

const DEFAULT_CHANNELS = [
  { channelId: 3001, channelKey: 'online', channelName: '线上', parentId: null, zoneName: null, cityListJson: null, isEnabled: 1 },
  { channelId: 3002, channelKey: 'south', channelName: '华南线下', parentId: null, zoneName: '华南战区', cityListJson: ['广州', '普宁'], isEnabled: 1 },
  { channelId: 3003, channelKey: 'east', channelName: '华东线下', parentId: null, zoneName: '华东战区', cityListJson: ['杭州', '武汉'], isEnabled: 1 },
  { channelId: 3004, channelKey: 'agent', channelName: '代理', parentId: null, zoneName: null, cityListJson: null, isEnabled: 1 },
];

const DEFAULT_SOURCES = [
  { sourceId: 7001, sourceCode: '1001', sourceName: '百度搜索', channelId: 3001, isExcluded: 0 },
  { sourceId: 7002, sourceCode: '1002', sourceName: '巨量广告', channelId: 3001, isExcluded: 0 },
  { sourceId: 7003, sourceCode: '2001', sourceName: '广州会销', channelId: 3002, isExcluded: 0 },
  { sourceId: 7004, sourceCode: '2002', sourceName: '杭州会销', channelId: 3003, isExcluded: 0 },
  { sourceId: 7005, sourceCode: '3001', sourceName: '老客转介绍', channelId: 3001, isExcluded: 0 },
  { sourceId: 7006, sourceCode: '4001', sourceName: '代理商报备', channelId: 3004, isExcluded: 0 },
  { sourceId: 7099, sourceCode: '9999', sourceName: '测试来源', channelId: null, isExcluded: 1 },
];

const DEFAULT_LABOR_ROWS = [
  { id: 'labor-sales', name: '销售部人力成本', costType: 'sales', departmentId: null },
  { id: 'labor-marketing', name: '市场部人力成本', costType: 'marketing', departmentId: null },
];

let pool;

export function wanToYuan(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric * 10000);
}

export function yuanToWan(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round((numeric / 10000) * 100) / 100;
}

export function monthKeyToYearMonth(year, monthKey) {
  const match = String(monthKey || '').match(/^m(\d{2})$/);
  if (!match) return null;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return null;
  return `${Number(year)}-${String(month).padStart(2, '0')}`;
}

export function getMaintenanceResourceFromPath(pathname) {
  const parts = String(pathname || '').split('/').filter(Boolean);
  if (parts[0] === 'api' && parts[1] === 'maintenance') return parts[2] || '';
  return parts.at(-1) || '';
}

function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf8');
  if (!body.trim()) return {};
  return JSON.parse(body);
}

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
      namedPlaceholders: false,
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
    namedPlaceholders: false,
  };
}

async function getPool() {
  if (pool) return pool;
  const mysql = await import('mysql2/promise');
  pool = mysql.createPool(getDbConfig());
  return pool;
}

function toNumberOrNull(value) {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDbBool(value) {
  return value ? 1 : 0;
}

function prefixedId(prefix, id) {
  return id == null ? '' : `${prefix}-${id}`;
}

function parsePrefixedId(value, prefix) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  const text = String(value);
  const prefixed = text.match(new RegExp(`^${prefix}-(\\d+)$`));
  if (prefixed) return Number(prefixed[1]);
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function periodStatus(pct, target) {
  if (!target) return 'unset';
  return pct > 80 ? 'good' : 'danger';
}

function createTargetPeriod(targetWan, actualWan) {
  const target = Math.max(0, Number(targetWan || 0));
  const actual = Math.max(0, Number(actualWan || 0));
  const pct = target ? +((actual / target) * 100).toFixed(1) : 0;
  return { target, actual, pct, status: periodStatus(pct, target) };
}

function createCostPeriod(costWan, actualWan, deals) {
  const cost = Math.max(0, Number(costWan || 0));
  const actual = Math.max(0, Number(actualWan || 0));
  const safeDeals = Math.max(0, Math.round(Number(deals || 0)));
  const roi = cost ? +((actual - cost) / cost).toFixed(2) : 0;
  return { cost, actual, deals: safeDeals, roi };
}

function createLaborPeriod(costWan) {
  return { cost: Math.max(0, Number(costWan || 0)) };
}

function sumPeriodFields(keys, periods, field) {
  return keys.reduce((sum, key) => sum + Number(periods[key]?.[field] || 0), 0);
}

function completeTargetPeriods(monthPeriods) {
  const periods = { ...monthPeriods };
  for (const key of MONTH_KEYS) {
    if (!periods[key]) periods[key] = createTargetPeriod(0, 0);
  }
  Object.entries(QUARTERS).forEach(([key, months]) => {
    periods[key] = createTargetPeriod(sumPeriodFields(months, periods, 'target'), sumPeriodFields(months, periods, 'actual'));
  });
  periods.year = createTargetPeriod(sumPeriodFields(MONTH_KEYS, periods, 'target'), sumPeriodFields(MONTH_KEYS, periods, 'actual'));
  return periods;
}

function completeCostPeriods(monthPeriods) {
  const periods = { ...monthPeriods };
  for (const key of MONTH_KEYS) {
    if (!periods[key]) periods[key] = createCostPeriod(0, 0, 0);
  }
  Object.entries(QUARTERS).forEach(([key, months]) => {
    periods[key] = createCostPeriod(
      sumPeriodFields(months, periods, 'cost'),
      sumPeriodFields(months, periods, 'actual'),
      sumPeriodFields(months, periods, 'deals')
    );
  });
  periods.year = createCostPeriod(
    sumPeriodFields(MONTH_KEYS, periods, 'cost'),
    sumPeriodFields(MONTH_KEYS, periods, 'actual'),
    sumPeriodFields(MONTH_KEYS, periods, 'deals')
  );
  return periods;
}

function completeLaborPeriods(monthPeriods) {
  const periods = { ...monthPeriods };
  for (const key of MONTH_KEYS) {
    if (!periods[key]) periods[key] = createLaborPeriod(0);
  }
  Object.entries(QUARTERS).forEach(([key, months]) => {
    periods[key] = createLaborPeriod(sumPeriodFields(months, periods, 'cost'));
  });
  periods.year = createLaborPeriod(sumPeriodFields(MONTH_KEYS, periods, 'cost'));
  return periods;
}

function rowsByMonth(rows, getAmount) {
  const map = new Map();
  rows.forEach((row) => {
    const yearMonth = String(row.year_month || row.yearMonth || '');
    const month = Number(yearMonth.slice(5, 7));
    if (month < 1 || month > 12) return;
    map.set(`m${String(month).padStart(2, '0')}`, getAmount(row));
  });
  return map;
}

function normalizeDepartment(row) {
  return {
    departmentId: Number(row.department_id ?? row.departmentId),
    departmentCode: row.department_code ?? row.departmentCode,
    departmentName: row.department_name ?? row.departmentName,
    parentId: toNumberOrNull(row.parent_id ?? row.parentId),
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    isEnabled: normalizeDbBool(row.is_enabled ?? row.isEnabled),
  };
}

function normalizeStaff(row) {
  return {
    staffId: Number(row.staff_id ?? row.staffId),
    staffCode: row.staff_code ?? row.staffCode,
    staffName: row.staff_name ?? row.staffName,
    departmentId: toNumberOrNull(row.department_id ?? row.departmentId),
    channelKey: row.channel_key ?? row.channelKey ?? null,
    externalBiUserId: row.external_bi_user_id ?? row.externalBiUserId ?? '',
    isSales: normalizeDbBool(row.is_sales ?? row.isSales),
    isDelivery: normalizeDbBool(row.is_delivery ?? row.isDelivery),
    isSuccess: normalizeDbBool(row.is_success ?? row.isSuccess),
    isEnabled: normalizeDbBool(row.is_enabled ?? row.isEnabled),
  };
}

function normalizeChannel(row) {
  let cityListJson = row.city_list_json ?? row.cityListJson ?? null;
  if (typeof cityListJson === 'string' && cityListJson) {
    try {
      cityListJson = JSON.parse(cityListJson);
    } catch {
      cityListJson = null;
    }
  }
  return {
    channelId: Number(row.channel_id ?? row.channelId),
    channelKey: row.channel_key ?? row.channelKey,
    channelName: row.channel_name ?? row.channelName,
    parentId: toNumberOrNull(row.parent_id ?? row.parentId),
    zoneName: row.zone_name ?? row.zoneName ?? null,
    cityListJson,
    isEnabled: normalizeDbBool(row.is_enabled ?? row.isEnabled),
  };
}

function normalizeSource(row) {
  return {
    sourceId: Number(row.source_id ?? row.sourceId),
    sourceCode: row.source_code ?? row.sourceCode,
    sourceName: row.source_name ?? row.sourceName,
    channelId: toNumberOrNull(row.channel_id ?? row.channelId),
    isExcluded: normalizeDbBool(row.is_excluded ?? row.isExcluded),
  };
}

function departmentToUi(row) {
  return {
    id: prefixedId('department', row.departmentId),
    departmentId: row.departmentId,
    code: row.departmentCode,
    name: row.departmentName,
    parentId: prefixedId('department', row.parentId),
    enabled: Boolean(row.isEnabled),
  };
}

function staffToUi(row) {
  return {
    id: prefixedId('staff', row.staffId),
    staffId: row.staffId,
    name: row.staffName,
    sourceName: row.isSales ? 'BI 销售' : 'BI 人员',
    deptId: prefixedId('department', row.departmentId),
    isSales: Boolean(row.isSales),
    enabled: Boolean(row.isEnabled),
    externalBiUserId: row.externalBiUserId || '',
  };
}

function channelToUi(row) {
  return {
    id: prefixedId('channel', row.channelId),
    channelId: row.channelId,
    key: row.channelKey,
    name: row.channelName,
    kind: row.parentId ? '明细' : '渠道',
    parentId: prefixedId('channel', row.parentId),
    enabled: Boolean(row.isEnabled),
  };
}

function sourceToUi(row) {
  return {
    sourceId: row.sourceId,
    code: row.sourceCode,
    name: row.sourceName,
    groupId: prefixedId('channel', row.channelId),
    excluded: Boolean(row.isExcluded),
  };
}

function buildOrgTree(departments, staff) {
  const countByDept = new Map();
  staff.forEach((person) => {
    if (!person.isEnabled) return;
    countByDept.set(person.departmentId, (countByDept.get(person.departmentId) ?? 0) + 1);
  });

  const nodes = departments.map((department) => ({
    id: prefixedId('department', department.departmentId),
    departmentId: department.departmentId,
    name: department.departmentName,
    userCount: countByDept.get(department.departmentId) ?? 0,
    disabled: !department.isEnabled,
    parentId: prefixedId('department', department.parentId),
    children: [],
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots = [];

  nodes.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId).children.push(node);
      return;
    }
    roots.push(node);
  });

  if (roots.length === 1) return roots[0];
  return {
    id: 'all',
    name: '所有组织',
    userCount: staff.filter((person) => person.isEnabled).length,
    children: roots,
  };
}

function collectDepartmentIds(departments, rootDepartmentId) {
  const ids = new Set([rootDepartmentId]);
  let changed = true;
  while (changed) {
    changed = false;
    departments.forEach((department) => {
      if (!ids.has(department.departmentId) && ids.has(department.parentId)) {
        ids.add(department.departmentId);
        changed = true;
      }
    });
  }
  return ids;
}

function mapPeriodRowsByOwner(rows, ownerKey) {
  const grouped = new Map();
  rows.forEach((row) => {
    const ownerId = Number(row[ownerKey]);
    if (!ownerId) return;
    if (!grouped.has(ownerId)) grouped.set(ownerId, []);
    grouped.get(ownerId).push(row);
  });
  return grouped;
}

function makeTargetPeriods(year, targetRows, actualRows) {
  const targetByMonth = rowsByMonth(targetRows, (row) => yuanToWan(row.target_amount_yuan ?? row.targetAmountYuan));
  const actualByMonth = rowsByMonth(actualRows, (row) => yuanToWan(row.actual_yuan ?? row.actualYuan ?? row.recovered_amount_yuan));
  const months = {};
  MONTH_KEYS.forEach((key) => {
    months[key] = createTargetPeriod(targetByMonth.get(key) ?? 0, actualByMonth.get(key) ?? 0);
  });
  return completeTargetPeriods(months);
}

function makeCostPeriods(year, costRows, actualRows) {
  const costByMonth = rowsByMonth(costRows, (row) => yuanToWan(row.investment_amount_yuan ?? row.investmentAmountYuan));
  const actualByMonth = rowsByMonth(actualRows, (row) => ({
    actual: yuanToWan(row.actual_yuan ?? row.actualYuan ?? row.recovered_amount_yuan),
    deals: Number(row.deals ?? row.order_count ?? 0),
  }));
  const months = {};
  MONTH_KEYS.forEach((key) => {
    const actual = actualByMonth.get(key) ?? { actual: 0, deals: 0 };
    months[key] = createCostPeriod(costByMonth.get(key) ?? 0, actual.actual, actual.deals);
  });
  return completeCostPeriods(months);
}

function makeLaborPeriods(year, laborRows) {
  const costByMonth = rowsByMonth(laborRows, (row) => yuanToWan(row.amount_yuan ?? row.amountYuan));
  const months = {};
  MONTH_KEYS.forEach((key) => {
    months[key] = createLaborPeriod(costByMonth.get(key) ?? 0);
  });
  return completeLaborPeriods(months);
}

function sumTargetPeriods(rows) {
  const months = {};
  MONTH_KEYS.forEach((key) => {
    months[key] = createTargetPeriod(
      rows.reduce((sum, row) => sum + Number(row.periods[key]?.target || 0), 0),
      rows.reduce((sum, row) => sum + Number(row.periods[key]?.actual || 0), 0)
    );
  });
  return completeTargetPeriods(months);
}

function sumCostPeriods(rows) {
  const months = {};
  MONTH_KEYS.forEach((key) => {
    months[key] = createCostPeriod(
      rows.reduce((sum, row) => sum + Number(row.periods[key]?.cost || 0), 0),
      rows.reduce((sum, row) => sum + Number(row.periods[key]?.actual || 0), 0),
      rows.reduce((sum, row) => sum + Number(row.periods[key]?.deals || 0), 0)
    );
  });
  return completeCostPeriods(months);
}

export function buildTargetRows(year, rows = []) {
  const result = [];
  rows.forEach((row) => {
    if (row.type !== 'user') return;
    const staffId = toNumberOrNull(row.staffId) ?? parsePrefixedId(row.id, 'staff');
    if (!staffId) return;
    Object.keys(row.periods ?? {}).filter((key) => MONTH_KEYS.includes(key)).forEach((monthKey) => {
      const yearMonth = monthKeyToYearMonth(year, monthKey);
      if (!yearMonth) return;
      result.push({
        yearMonth,
        departmentId: null,
        staffId,
        channelId: null,
        versionId: null,
        targetAmountYuan: wanToYuan(row.periods?.[monthKey]?.target),
        targetOpeningCount: Number(row.periods?.[monthKey]?.targetOpeningCount || 0),
        targetOrderCount: Number(row.periods?.[monthKey]?.targetOrderCount || 0),
      });
    });
  });
  return result;
}

export function buildChannelCostRows(year, rows = []) {
  const result = [];
  rows.forEach((row) => {
    if (row.type !== 'channel') return;
    const channelId = toNumberOrNull(row.channelId) ?? parsePrefixedId(row.id, 'channel');
    if (!channelId) return;
    Object.keys(row.periods ?? {}).filter((key) => MONTH_KEYS.includes(key)).forEach((monthKey) => {
      const yearMonth = monthKeyToYearMonth(year, monthKey);
      if (!yearMonth) return;
      result.push({
        yearMonth,
        channelId,
        investmentAmountYuan: wanToYuan(row.periods?.[monthKey]?.cost),
      });
    });
  });
  return result;
}

export function buildLaborCostRows(year, rows = []) {
  const result = [];
  rows.forEach((row) => {
    if (!row.costType) return;
    Object.keys(row.periods ?? {}).filter((key) => MONTH_KEYS.includes(key)).forEach((monthKey) => {
      const yearMonth = monthKeyToYearMonth(year, monthKey);
      if (!yearMonth) return;
      result.push({
        yearMonth,
        costType: row.costType,
        departmentId: toNumberOrNull(row.departmentId) ?? parsePrefixedId(row.deptId, 'department'),
        amountYuan: wanToYuan(row.periods?.[monthKey]?.cost),
      });
    });
  });
  return result;
}

export function buildChannelSourceRows(rows = []) {
  return rows.map((source) => ({
    sourceId: toNumberOrNull(source.sourceId),
    sourceCode: String(source.code ?? '').trim(),
    sourceName: String(source.name ?? '').trim(),
    channelId: parsePrefixedId(source.groupId, 'channel'),
    isExcluded: source.excluded ? 1 : 0,
  })).filter((source) => source.sourceCode && source.sourceName);
}

async function selectAll(conn, sql, params = []) {
  const [rows] = await conn.query(sql, params);
  return rows;
}

async function loadDepartments(conn) {
  const rows = await selectAll(conn, 'SELECT * FROM dim_department ORDER BY COALESCE(sort_order, 0), department_id');
  return rows.length ? rows.map(normalizeDepartment) : DEFAULT_DEPARTMENTS;
}

async function loadStaff(conn) {
  const rows = await selectAll(conn, 'SELECT * FROM dim_staff ORDER BY staff_id');
  return rows.length ? rows.map(normalizeStaff) : DEFAULT_STAFF;
}

async function loadChannels(conn) {
  const rows = await selectAll(conn, 'SELECT * FROM dim_channel ORDER BY channel_id');
  return rows.length ? rows.map(normalizeChannel) : DEFAULT_CHANNELS;
}

async function loadSources(conn) {
  const rows = await selectAll(conn, 'SELECT * FROM dim_channel_source ORDER BY source_id');
  return rows.length ? rows.map(normalizeSource) : DEFAULT_SOURCES;
}

async function loadTargetPage(conn, year) {
  const departments = await loadDepartments(conn);
  const staff = await loadStaff(conn);
  const yearPrefix = `${Number(year)}-%`;
  const targetRows = await selectAll(conn, 'SELECT * FROM biz_target_monthly WHERE `year_month` LIKE ? AND staff_id IS NOT NULL', [yearPrefix]);
  const actualRows = await selectAll(
    conn,
    `SELECT DATE_FORMAT(stat_date, '%Y-%m') AS \`year_month\`, staff_id, SUM(recovered_amount_yuan) AS actual_yuan
     FROM fact_revenue_daily
     WHERE stat_date >= ? AND stat_date < ? AND staff_id IS NOT NULL
     GROUP BY DATE_FORMAT(stat_date, '%Y-%m'), staff_id`,
    [`${Number(year)}-01-01`, `${Number(year) + 1}-01-01`]
  );
  const targetsByStaff = mapPeriodRowsByOwner(targetRows, 'staff_id');
  const actualByStaff = mapPeriodRowsByOwner(actualRows, 'staff_id');

  const userRows = staff
    .filter((person) => person.isSales || person.isEnabled)
    .map((person) => ({
      id: prefixedId('staff', person.staffId),
      staffId: person.staffId,
      departmentId: person.departmentId,
      type: 'user',
      name: person.staffName,
      role: person.isSales ? '销售人员' : '人员',
      deptId: prefixedId('department', person.departmentId),
      periods: makeTargetPeriods(year, targetsByStaff.get(person.staffId) ?? [], actualByStaff.get(person.staffId) ?? []),
    }));

  const departmentRows = departments
    .filter((department) => department.isEnabled)
    .map((department) => {
      const descendantIds = collectDepartmentIds(departments, department.departmentId);
      const children = userRows.filter((row) => descendantIds.has(row.departmentId));
      return {
        id: prefixedId('department', department.departmentId),
        departmentId: department.departmentId,
        type: 'department',
        name: department.departmentName,
        role: '组织合计',
        periods: sumTargetPeriods(children),
      };
    });

  return {
    orgTree: buildOrgTree(departments, staff),
    rows: [...departmentRows, ...userRows],
  };
}

async function loadCostPage(conn, year) {
  const channels = await loadChannels(conn);
  const yearPrefix = `${Number(year)}-%`;
  const costRows = await selectAll(conn, 'SELECT * FROM biz_channel_cost_monthly WHERE `year_month` LIKE ?', [yearPrefix]);
  const actualRows = await selectAll(
    conn,
    `SELECT DATE_FORMAT(stat_date, '%Y-%m') AS \`year_month\`, channel_id, SUM(recovered_amount_yuan) AS actual_yuan, SUM(order_count) AS deals
     FROM fact_revenue_daily
     WHERE stat_date >= ? AND stat_date < ? AND channel_id IS NOT NULL
     GROUP BY DATE_FORMAT(stat_date, '%Y-%m'), channel_id`,
    [`${Number(year)}-01-01`, `${Number(year) + 1}-01-01`]
  );
  const costByChannel = mapPeriodRowsByOwner(costRows, 'channel_id');
  const actualByChannel = mapPeriodRowsByOwner(actualRows, 'channel_id');
  const channelRows = channels
    .filter((channel) => channel.isEnabled)
    .map((channel) => ({
      id: prefixedId('channel', channel.channelId),
      channelId: channel.channelId,
      type: 'channel',
      name: channel.channelName,
      parentId: prefixedId('channel', channel.parentId),
      periods: makeCostPeriods(year, costByChannel.get(channel.channelId) ?? [], actualByChannel.get(channel.channelId) ?? []),
    }));
  const laborRows = await selectAll(conn, 'SELECT * FROM biz_labor_cost_monthly WHERE `year_month` LIKE ?', [yearPrefix]);

  return {
    channels: [
      { id: 'all', name: '全部渠道', kind: '全部', parentId: '' },
      ...channels.map(channelToUi),
    ],
    rows: [
      {
        id: 'all',
        type: 'group',
        name: '全部渠道',
        periods: sumCostPeriods(channelRows),
      },
      ...channelRows,
    ],
    laborRows: DEFAULT_LABOR_ROWS.map((row) => ({
      ...row,
      periods: makeLaborPeriods(year, laborRows.filter((item) => item.cost_type === row.costType)),
    })),
  };
}

async function loadOrgPage(conn) {
  const departments = await loadDepartments(conn);
  const staff = await loadStaff(conn);
  return {
    departments: departments.map(departmentToUi),
    users: staff.map(staffToUi),
  };
}

async function loadChannelPage(conn) {
  const channels = await loadChannels(conn);
  const sources = await loadSources(conn);
  return {
    groups: channels.map(channelToUi),
    sources: sources.map(sourceToUi),
  };
}

async function loadAllPages(year) {
  const db = await getPool();
  const conn = await db.getConnection();
  try {
    const target = await loadTargetPage(conn, year);
    const cost = await loadCostPage(conn, year);
    const org = await loadOrgPage(conn);
    const channel = await loadChannelPage(conn);
    return { target, cost, org, channel };
  } finally {
    conn.release();
  }
}

async function nextId(conn, table, column, floor = 1) {
  const [rows] = await conn.query(`SELECT COALESCE(MAX(${column}), ?) + 1 AS next_id FROM ${table}`, [floor - 1]);
  return Number(rows[0]?.next_id || floor);
}

async function saveTargetPage(conn, year, data) {
  const rows = buildTargetRows(year, data?.rows ?? []);
  await conn.query('DELETE FROM biz_target_monthly WHERE `year_month` LIKE ? AND staff_id IS NOT NULL', [`${Number(year)}-%`]);
  let targetId = await nextId(conn, 'biz_target_monthly', 'target_id', 400000);
  for (const row of rows) {
    await conn.query(
      `INSERT INTO biz_target_monthly
       (target_id, \`year_month\`, department_id, staff_id, channel_id, version_id, target_amount_yuan, target_opening_count, target_order_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        targetId++,
        row.yearMonth,
        row.departmentId,
        row.staffId,
        row.channelId,
        row.versionId,
        row.targetAmountYuan,
        row.targetOpeningCount,
        row.targetOrderCount,
      ]
    );
  }
  return loadTargetPage(conn, year);
}

async function saveCostPage(conn, year, data) {
  const channelRows = buildChannelCostRows(year, data?.rows ?? []);
  const laborRows = buildLaborCostRows(year, data?.laborRows ?? []);
  await conn.query('DELETE FROM biz_channel_cost_monthly WHERE `year_month` LIKE ?', [`${Number(year)}-%`]);
  await conn.query('DELETE FROM biz_labor_cost_monthly WHERE `year_month` LIKE ?', [`${Number(year)}-%`]);

  let costId = await nextId(conn, 'biz_channel_cost_monthly', 'cost_id', 500000);
  for (const row of channelRows) {
    await conn.query(
      'INSERT INTO biz_channel_cost_monthly (cost_id, `year_month`, channel_id, investment_amount_yuan) VALUES (?, ?, ?, ?)',
      [costId++, row.yearMonth, row.channelId, row.investmentAmountYuan]
    );
  }

  let laborCostId = await nextId(conn, 'biz_labor_cost_monthly', 'labor_cost_id', 600000);
  for (const row of laborRows) {
    await conn.query(
      'INSERT INTO biz_labor_cost_monthly (labor_cost_id, `year_month`, cost_type, department_id, amount_yuan) VALUES (?, ?, ?, ?, ?)',
      [laborCostId++, row.yearMonth, row.costType, row.departmentId, row.amountYuan]
    );
  }

  return loadCostPage(conn, year);
}

async function saveOrgPage(conn, data) {
  const departments = data?.departments ?? [];
  const users = data?.users ?? [];
  let departmentId = await nextId(conn, 'dim_department', 'department_id', 1001);
  const departmentIdByUiId = new Map();

  for (const [index, department] of departments.entries()) {
    const existingId = toNumberOrNull(department.departmentId) ?? parsePrefixedId(department.id, 'department');
    const id = existingId || departmentId++;
    departmentIdByUiId.set(department.id, id);
    await conn.query(
      `INSERT INTO dim_department
       (department_id, department_code, department_name, parent_id, sort_order, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         department_code = VALUES(department_code),
         department_name = VALUES(department_name),
         parent_id = VALUES(parent_id),
         sort_order = VALUES(sort_order),
         is_enabled = VALUES(is_enabled)`,
      [
        id,
        department.code || `dept_${id}`,
        String(department.name || `组织 ${id}`).trim(),
        departmentIdByUiId.get(department.parentId) ?? parsePrefixedId(department.parentId, 'department'),
        index * 10,
        department.enabled === false ? 0 : 1,
      ]
    );
  }

  let staffId = await nextId(conn, 'dim_staff', 'staff_id', 2001);
  for (const user of users) {
    const existingId = toNumberOrNull(user.staffId) ?? parsePrefixedId(user.id, 'staff');
    const id = existingId || staffId++;
    await conn.query(
      `INSERT INTO dim_staff
       (staff_id, staff_code, staff_name, department_id, channel_key, external_bi_user_id, is_sales, is_delivery, is_success, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
       ON DUPLICATE KEY UPDATE
         staff_code = VALUES(staff_code),
         staff_name = VALUES(staff_name),
         department_id = VALUES(department_id),
         channel_key = VALUES(channel_key),
         external_bi_user_id = VALUES(external_bi_user_id),
         is_sales = VALUES(is_sales),
         is_enabled = VALUES(is_enabled)`,
      [
        id,
        user.staffCode || `staff_${id}`,
        String(user.name || `人员 ${id}`).trim(),
        departmentIdByUiId.get(user.deptId) ?? parsePrefixedId(user.deptId, 'department'),
        user.channelKey || null,
        user.externalBiUserId || '',
        user.isSales ? 1 : 0,
        user.enabled === false ? 0 : 1,
      ]
    );
  }

  return loadOrgPage(conn);
}

async function saveChannelPage(conn, data) {
  const groups = data?.groups ?? [];
  const sources = buildChannelSourceRows(data?.sources ?? []);
  let channelId = await nextId(conn, 'dim_channel', 'channel_id', 3001);
  const channelIdByUiId = new Map();

  for (const group of groups) {
    const existingId = toNumberOrNull(group.channelId) ?? parsePrefixedId(group.id, 'channel');
    const id = existingId || channelId++;
    channelIdByUiId.set(group.id, id);
    await conn.query(
      `INSERT INTO dim_channel
       (channel_id, channel_key, channel_name, parent_id, zone_name, city_list_json, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         channel_key = VALUES(channel_key),
         channel_name = VALUES(channel_name),
         parent_id = VALUES(parent_id),
         zone_name = VALUES(zone_name),
         city_list_json = VALUES(city_list_json),
         is_enabled = VALUES(is_enabled)`,
      [
        id,
        group.key || `channel_${id}`,
        String(group.name || `渠道 ${id}`).trim(),
        channelIdByUiId.get(group.parentId) ?? parsePrefixedId(group.parentId, 'channel'),
        group.zoneName || null,
        group.cityListJson ? JSON.stringify(group.cityListJson) : null,
        group.enabled === false ? 0 : 1,
      ]
    );
  }

  await conn.query('DELETE FROM dim_channel_source');
  let sourceId = await nextId(conn, 'dim_channel_source', 'source_id', 7001);
  for (const row of sources) {
    const id = row.sourceId || sourceId++;
    await conn.query(
      'INSERT INTO dim_channel_source (source_id, source_code, source_name, channel_id, is_excluded) VALUES (?, ?, ?, ?, ?)',
      [id, row.sourceCode, row.sourceName, row.channelId, row.isExcluded]
    );
  }

  return loadChannelPage(conn);
}

async function savePage(pageKey, year, data) {
  const db = await getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let saved;
    if (pageKey === 'targets') saved = await saveTargetPage(conn, year, data);
    if (pageKey === 'costs') saved = await saveCostPage(conn, year, data);
    if (pageKey === 'org') saved = await saveOrgPage(conn, data);
    if (pageKey === 'channels') saved = await saveChannelPage(conn, data);
    if (!saved) throw new Error(`未知维护页：${pageKey}`);
    await conn.commit();
    return saved;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function handleMaintenanceRequest(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const resource = getMaintenanceResourceFromPath(url.pathname);
  const year = Number(url.searchParams.get('year') || new Date().getFullYear());

  try {
    if (req.method === 'GET' && resource === 'bootstrap') {
      jsonResponse(res, 200, await loadAllPages(year));
      return;
    }

    if (req.method === 'GET' && ['targets', 'costs', 'org', 'channels'].includes(resource)) {
      const data = await loadAllPages(year);
      const keyByResource = { targets: 'target', costs: 'cost', org: 'org', channels: 'channel' };
      jsonResponse(res, 200, data[keyByResource[resource]]);
      return;
    }

    if ((req.method === 'PUT' || req.method === 'POST') && ['targets', 'costs', 'org', 'channels'].includes(resource)) {
      const body = await readJsonBody(req);
      const saved = await savePage(resource, Number(body.year || year), body.data);
      jsonResponse(res, 200, saved);
      return;
    }

    jsonResponse(res, 404, { error: '未知维护接口' });
  } catch (err) {
    jsonResponse(res, 500, { error: err.message || '维护接口异常' });
  }
}
