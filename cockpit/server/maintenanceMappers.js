/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 维护快照补齐联动口径：目标人员只取启用销售且有部门；成本页空年份默认生成 sales/marketing 人力成本行；
          渠道/成本导航保留 dim_channel.parent_id，新增渠道大类后可形成树。
*/
/*
 更新时间: 2026-07-08
 更新内容: buildTargetSnapshot 的 sales 过滤补 department_id 非空判断，与读取口径一致：
          目标维护只认「销售 + 有部门」的人员，防御性兜底，避免无部门人员混入目标行/组织树人数。
*/
/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: 新增数据维护 DB→页面形状的纯函数映射器（target/cost/org/channel 四个 build*Snapshot），
          无需 DB 即可单测；输出形状刻意与 mock.js 导出一致，前端子页可直接换 props。
*/

const QUARTER_MONTHS = { q1: ['m01', 'm02', 'm03'], q2: ['m04', 'm05', 'm06'], q3: ['m07', 'm08', 'm09'], q4: ['m10', 'm11', 'm12'] };
const ALL_MONTH_KEYS = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12'];

function monthKeyFromYM(ym) {
  const m = String(ym).slice(5, 7); // "2026-03" -> "03"
  return `m${m}`;
}

function roundWan(yuan) {
  // DB 存元，页面用万；保留 2 位小数
  return Math.round((Number(yuan || 0) / 10000) * 100) / 100;
}

function maintenanceStatus(pct, target) {
  if (!target) return 'unset';
  if (pct >= 100) return 'good';
  if (pct >= 80) return 'warning';
  return 'danger';
}

function targetPeriod(target, actual) {
  const t = Math.round(Number(target || 0) * 100) / 100;
  const a = Math.round(Number(actual || 0) * 100) / 100;
  const pct = t ? Math.round((a / t) * 1000) / 10 : 0;
  return { target: t, actual: a, pct, status: maintenanceStatus(pct, t) };
}

function costPeriod(cost, actual, deals) {
  const c = Math.round(Number(cost || 0) * 100) / 100;
  const a = Math.round(Number(actual || 0) * 100) / 100;
  const d = Math.round(Number(deals || 0));
  const roi = c ? Math.round(((a - c) / c) * 100) / 100 : 0;
  return { cost: c, actual: a, deals: d, roi };
}

function laborPeriod(cost) {
  return { cost: Math.round(Number(cost || 0) * 100) / 100 };
}

/** 由 12 个月的 {target,actual} 拼装含季度/全年的 periods。 */
function buildTargetPeriods(monthTarget, monthActual) {
  const periods = {};
  ALL_MONTH_KEYS.forEach((k, i) => {
    periods[k] = targetPeriod(monthTarget[i], monthActual[i]);
  });
  Object.entries(QUARTER_MONTHS).forEach(([q, keys]) => {
    const t = keys.reduce((s, k) => s + (periods[k].target || 0), 0);
    const a = keys.reduce((s, k) => s + (periods[k].actual || 0), 0);
    periods[q] = targetPeriod(t, a);
  });
  const tYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].target || 0), 0);
  const aYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].actual || 0), 0);
  periods.year = targetPeriod(tYear, aYear);
  return periods;
}

function buildCostPeriods(monthCost, monthActual, monthDeals) {
  const periods = {};
  ALL_MONTH_KEYS.forEach((k, i) => {
    periods[k] = costPeriod(monthCost[i], monthActual[i], monthDeals[i]);
  });
  Object.entries(QUARTER_MONTHS).forEach(([q, keys]) => {
    const c = keys.reduce((s, k) => s + (periods[k].cost || 0), 0);
    const a = keys.reduce((s, k) => s + (periods[k].actual || 0), 0);
    const d = keys.reduce((s, k) => s + (periods[k].deals || 0), 0);
    periods[q] = costPeriod(c, a, d);
  });
  const cYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].cost || 0), 0);
  const aYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].actual || 0), 0);
  const dYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].deals || 0), 0);
  periods.year = costPeriod(cYear, aYear, dYear);
  return periods;
}

function buildLaborPeriods(monthCost) {
  const periods = {};
  ALL_MONTH_KEYS.forEach((k, i) => {
    periods[k] = laborPeriod(monthCost[i]);
  });
  Object.entries(QUARTER_MONTHS).forEach(([q, keys]) => {
    const c = keys.reduce((s, k) => s + (periods[k].cost || 0), 0);
    periods[q] = laborPeriod(c);
  });
  const cYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].cost || 0), 0);
  periods.year = laborPeriod(cYear);
  return periods;
}

function buildDeptTree(departments, userCountFn) {
  const byId = new Map(departments.map((d) => [d.department_id, { ...d }]));
  const nodes = new Map();
  departments.forEach((d) => {
    nodes.set(d.department_id, {
      id: String(d.department_id),
      name: d.department_name,
      userCount: userCountFn(d.department_id),
      children: [],
    });
  });
  const roots = [];
  departments.forEach((d) => {
    const node = nodes.get(d.department_id);
    if (d.parent_id && byId.has(d.parent_id)) {
      nodes.get(d.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });
  if (roots.length === 1) return roots[0];
  return { id: 'all', name: '全部组织', userCount: roots.reduce((s, r) => s + r.userCount, 0), children: roots };
}

/** 收集某部门及其所有后代部门 id（含自身）。 */
function descendantDeptIds(departments, deptId) {
  const ids = new Set([deptId]);
  let changed = true;
  while (changed) {
    changed = false;
    departments.forEach((d) => {
      if (d.parent_id && ids.has(d.parent_id) && !ids.has(d.department_id)) {
        ids.add(d.department_id);
        changed = true;
      }
    });
  }
  return ids;
}

/**
 * 目标维护快照。
 * @param {object} p {departments, staff, targets, revenue}
 *   targets: [{year_month, staff_id, target_amount_yuan, ...}]
 *   revenue: [{ym, staff_id, amt, deals}]  amt=recovered_amount_yuan
 * @returns {{orgTree, rows}}
 */
export function buildTargetSnapshot({ departments = [], staff = [], targets = [], revenue = [] } = {}) {
  const sales = staff.filter((s) => (
    (s.is_sales === 1 || s.is_sales === true || Number(s.is_sales) === 1)
    && s.department_id != null
    && Number(s.is_enabled) === 1
  ));

  // 按人按月索引
  const targetByStaff = new Map(); // staff_id -> {m01..target_wan}
  targets.forEach((t) => {
    const mk = monthKeyFromYM(t.year_month);
    if (!ALL_MONTH_KEYS.includes(mk)) return;
    if (!targetByStaff.has(t.staff_id)) targetByStaff.set(t.staff_id, {});
    targetByStaff.get(t.staff_id)[mk] = roundWan(t.target_amount_yuan);
  });
  const actualByStaff = new Map();
  revenue.forEach((r) => {
    const mk = monthKeyFromYM(r.ym);
    if (!ALL_MONTH_KEYS.includes(mk)) return;
    if (!actualByStaff.has(r.staff_id)) actualByStaff.set(r.staff_id, {});
    const bucket = actualByStaff.get(r.staff_id);
    bucket[mk] = (bucket[mk] || 0) + roundWan(r.amt);
  });

  // 部门 -> 直接下属销售
  const salesByDept = new Map();
  sales.forEach((s) => {
    if (!salesByDept.has(s.department_id)) salesByDept.set(s.department_id, []);
    salesByDept.get(s.department_id).push(s);
  });

  const rows = [];

  // 全部汇总行
  const allTarget = ALL_MONTH_KEYS.map((mk) => sales.reduce((s, st) => s + (targetByStaff.get(st.staff_id)?.[mk] || 0), 0));
  const allActual = ALL_MONTH_KEYS.map((mk) => sales.reduce((s, st) => s + (actualByStaff.get(st.staff_id)?.[mk] || 0), 0));
  rows.push({ id: 'summary-all', type: 'department', name: '所有部门', role: '组织合计', periods: buildTargetPeriods(allTarget, allActual) });

  // 各部门汇总行（仅含有销售人员的部门）
  departments.forEach((d) => {
    const ids = descendantDeptIds(departments, d.department_id);
    const members = sales.filter((s) => ids.has(s.department_id));
    if (!members.length) return;
    const t = ALL_MONTH_KEYS.map((mk) => members.reduce((s, st) => s + (targetByStaff.get(st.staff_id)?.[mk] || 0), 0));
    const a = ALL_MONTH_KEYS.map((mk) => members.reduce((s, st) => s + (actualByStaff.get(st.staff_id)?.[mk] || 0), 0));
    rows.push({ id: `summary-${d.department_id}`, type: 'department', name: d.department_name, role: '组织合计', periods: buildTargetPeriods(t, a) });
  });

  // 人员明细行
  sales.forEach((s) => {
    const tb = targetByStaff.get(s.staff_id) || {};
    const ab = actualByStaff.get(s.staff_id) || {};
    const t = ALL_MONTH_KEYS.map((mk) => tb[mk] || 0);
    const a = ALL_MONTH_KEYS.map((mk) => ab[mk] || 0);
    rows.push({
      id: `user-${s.staff_id}`,
      type: 'user',
      name: s.staff_name,
      role: '人员',
      deptId: s.department_id != null ? String(s.department_id) : undefined,
      periods: buildTargetPeriods(t, a),
    });
  });

  const orgTree = buildDeptTree(departments, (deptId) => {
    const ids = descendantDeptIds(departments, deptId);
    return sales.filter((s) => ids.has(s.department_id) && (s.is_enabled === 1 || Number(s.is_enabled) === 1)).length;
  });

  return { orgTree, rows };
}

/**
 * 成本维护快照。
 * @param {object} p {channels, costs, revenue, labor}
 *   costs: [{year_month, channel_id, investment_amount_yuan}]
 *   revenue: [{ym, channel_id, amt, deals}]
 *   labor: [{year_month, cost_type, amount_yuan}]
 * @returns {{channels, rows, laborRows}}
 */
const LABOR_NAME = { sales: '销售部人力成本', marketing: '市场部人力成本', delivery: '实施部人力成本' };
const DEFAULT_LABOR_TYPES = ['sales', 'marketing'];

export function buildCostSnapshot({ channels = [], costs = [], revenue = [], labor = [] } = {}) {
  const costByChannel = new Map();
  costs.forEach((c) => {
    const mk = monthKeyFromYM(c.year_month);
    if (!ALL_MONTH_KEYS.includes(mk)) return;
    if (!costByChannel.has(c.channel_id)) costByChannel.set(c.channel_id, {});
    costByChannel.get(c.channel_id)[mk] = roundWan(c.investment_amount_yuan);
  });
  const actualByChannel = new Map();
  const dealsByChannel = new Map();
  revenue.forEach((r) => {
    const mk = monthKeyFromYM(r.ym);
    if (!ALL_MONTH_KEYS.includes(mk)) return;
    if (!actualByChannel.has(r.channel_id)) actualByChannel.set(r.channel_id, {});
    if (!dealsByChannel.has(r.channel_id)) dealsByChannel.set(r.channel_id, {});
    actualByChannel.get(r.channel_id)[mk] = (actualByChannel.get(r.channel_id)[mk] || 0) + roundWan(r.amt);
    dealsByChannel.get(r.channel_id)[mk] = (dealsByChannel.get(r.channel_id)[mk] || 0) + Number(r.deals || 0);
  });

  const rows = [];
  // 全部汇总
  const allCost = ALL_MONTH_KEYS.map((mk) => channels.reduce((s, c) => s + (costByChannel.get(c.channel_id)?.[mk] || 0), 0));
  const allActual = ALL_MONTH_KEYS.map((mk) => channels.reduce((s, c) => s + (actualByChannel.get(c.channel_id)?.[mk] || 0), 0));
  const allDeals = ALL_MONTH_KEYS.map((mk) => channels.reduce((s, c) => s + (dealsByChannel.get(c.channel_id)?.[mk] || 0), 0));
  rows.push({ id: 'summary-all', type: 'group', name: '全部渠道', periods: buildCostPeriods(allCost, allActual, allDeals) });

  channels.forEach((c) => {
    const cb = costByChannel.get(c.channel_id) || {};
    const ab = actualByChannel.get(c.channel_id) || {};
    const db = dealsByChannel.get(c.channel_id) || {};
    rows.push({
      id: String(c.channel_id),
      type: 'channel',
      name: c.channel_name,
      parentId: 'summary-all',
      periods: buildCostPeriods(
        ALL_MONTH_KEYS.map((mk) => cb[mk] || 0),
        ALL_MONTH_KEYS.map((mk) => ab[mk] || 0),
        ALL_MONTH_KEYS.map((mk) => db[mk] || 0),
      ),
    });
  });

  const navChannels = [
    { id: 'all', name: '全部渠道', kind: '全部', parentId: '' },
    ...channels.map((c) => ({
      id: String(c.channel_id),
      name: c.channel_name,
      kind: '明细',
      parentId: c.parent_id != null ? String(c.parent_id) : 'all',
      enabled: Number(c.is_enabled) === 1,
    })),
  ];

  // 人力成本按 cost_type 聚合
  const laborByType = new Map();
  labor.forEach((l) => {
    const mk = monthKeyFromYM(l.year_month);
    if (!ALL_MONTH_KEYS.includes(mk)) return;
    if (!laborByType.has(l.cost_type)) laborByType.set(l.cost_type, {});
    laborByType.get(l.cost_type)[mk] = roundWan(l.amount_yuan);
  });
  const laborTypes = [...new Set([...DEFAULT_LABOR_TYPES, ...laborByType.keys()])];
  const laborRows = laborTypes.map((costType) => {
    const bucket = laborByType.get(costType) || {};
    return {
    id: `labor-${costType}`,
    name: LABOR_NAME[costType] || `${costType} 人力成本`,
    periods: buildLaborPeriods(ALL_MONTH_KEYS.map((mk) => bucket[mk] || 0)),
    };
  });

  return { channels: navChannels, rows, laborRows };
}

function deriveSourceName(s) {
  if (Number(s.is_enabled) === 0) return '历史人员';
  if (Number(s.is_sales) === 1) return 'BI 销售';
  if (Number(s.is_delivery) === 1) return '实施';
  if (Number(s.is_success) === 1) return '客户成功';
  return '人员';
}

/** 组织维护快照。 */
export function buildOrgSnapshot({ departments = [], staff = [] } = {}) {
  const departs = departments.map((d) => ({
    id: String(d.department_id),
    name: d.department_name,
    parentId: d.parent_id != null ? String(d.parent_id) : '',
    enabled: Number(d.is_enabled) === 1,
  }));
  const users = staff.map((s) => ({
    id: String(s.staff_id),
    name: s.staff_name,
    sourceName: deriveSourceName(s),
    deptId: s.department_id != null ? String(s.department_id) : '',
    isSales: Number(s.is_sales) === 1,
    enabled: Number(s.is_enabled) === 1,
    sourceUserId: s.external_bi_user_id || '',
  }));
  return { departments: departs, users };
}

/** 渠道维护快照。 */
export function buildChannelSnapshot({ channels = [], sources = [] } = {}) {
  const groups = channels.map((c) => ({
    id: String(c.channel_id),
    name: c.channel_name,
    parentId: c.parent_id != null ? String(c.parent_id) : '',
    enabled: Number(c.is_enabled) === 1,
  }));
  const srcs = sources.map((s) => ({
    code: s.source_code,
    name: s.source_name,
    groupId: s.channel_id != null ? String(s.channel_id) : '',
    enabled: Number(s.is_excluded) !== 1,
    excluded: Number(s.is_excluded) === 1,
  }));
  return { groups, sources: srcs };
}
