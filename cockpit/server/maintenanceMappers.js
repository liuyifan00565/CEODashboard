/*
 Update time: 2026-07-14 18:32:40 CST
 Update content: Keep disabled or unmapped staff/channel facts in maintenance grand totals while preserving the visible enabled-only detail rows.
*/
/*
 Update time: 2026-07-14 18:20:00 CST
 Update content: Include unassigned gross revenue and refunds in the all-channel cost summary without creating a fake channel row.
*/
/*
 Update time: 2026-07-14 18:12:08 CST
 Update content: Include completely unassigned recovered revenue in the all-organization target summary without attributing it to a department.
*/
/*
 Update time: 2026-07-14 17:09:11 CST
 Update content: Cost ROI uses net recovered amount (gross recovered minus refund); operations and labor remain ROI costs only.
*/
/*
 Update time: 2026-07-13 18:53:01 CST
 Update content: Cost snapshots derive sales-department labor from channel labor and expose marketing-department labor as an independent row.
*/
/*
 Update time: 2026-07-13 16:48:56 CST
 Update content: Cost snapshots expose editable operations and labor costs on every channel-month row.
*/
/*
 Update time: 2026-07-09 14:51:22 CST
 Update content: buildTargetSnapshot 改为部门级:不再生成人员明细行(user 行),部门目标 rollup 不再回退
   人员目标(只用部门级 directTarget + 子部门累加);回款 actual 仍按人员汇总到部门;左侧树改显示子部门数。
   配合 readTarget 只取 staff_id IS NULL 的部门级目标。
*/
/*
 Update time: 2026-07-09 16:20:00 CST
 Update content: Add channel refund amount to cost maintenance periods so four channels can maintain monthly refunds alongside investment.
*/
const QUARTER_MONTHS = { q1: ['m01', 'm02', 'm03'], q2: ['m04', 'm05', 'm06'], q3: ['m07', 'm08', 'm09'], q4: ['m10', 'm11', 'm12'] };
const ALL_MONTH_KEYS = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12'];

function monthKeyFromYM(ym) {
  const m = String(ym).slice(5, 7);
  return `m${m}`;
}

function roundWan(yuan) {
  return Math.round((Number(yuan || 0) / 10000) * 100) / 100;
}

function maintenanceStatus(pct, target) {
  if (!target) return 'unset';
  if (pct >= 120) return 'good';
  if (pct >= 80) return 'warning';
  return 'danger';
}

function targetPeriod(target, actual) {
  const t = Math.round(Number(target || 0) * 100) / 100;
  const a = Math.round(Number(actual || 0) * 100) / 100;
  const pct = t ? Math.round((a / t) * 1000) / 10 : 0;
  return { target: t, actual: a, pct, status: maintenanceStatus(pct, t) };
}

function costPeriod(operations, labor, actual, deals, refund, laborConfigured = false) {
  const o = Math.round(Number(operations || 0) * 100) / 100;
  const l = Math.round(Number(labor || 0) * 100) / 100;
  const totalCost = Math.round((o + l) * 100) / 100;
  const a = Math.round(Number(actual || 0) * 100) / 100;
  const d = Math.round(Number(deals || 0));
  const r = Math.round(Number(refund || 0) * 100) / 100;
  const netRecovered = Math.round((a - r) * 100) / 100;
  const roi = totalCost ? Math.round(((netRecovered - totalCost) / totalCost) * 100) / 100 : 0;
  return { operations: o, labor: l, laborConfigured: Boolean(laborConfigured), totalCost, actual: a, netRecovered, deals: d, refund: r, roi };
}

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

function buildCostPeriods(monthOperations, monthLabor, monthActual, monthDeals, monthRefund = [], monthLaborConfigured = []) {
  const periods = {};
  ALL_MONTH_KEYS.forEach((k, i) => {
    periods[k] = costPeriod(monthOperations[i], monthLabor[i], monthActual[i], monthDeals[i], monthRefund[i], monthLaborConfigured[i]);
  });
  Object.entries(QUARTER_MONTHS).forEach(([q, keys]) => {
    const o = keys.reduce((s, k) => s + (periods[k].operations || 0), 0);
    const l = keys.reduce((s, k) => s + (periods[k].labor || 0), 0);
    const a = keys.reduce((s, k) => s + (periods[k].actual || 0), 0);
    const d = keys.reduce((s, k) => s + (periods[k].deals || 0), 0);
    const r = keys.reduce((s, k) => s + (periods[k].refund || 0), 0);
    periods[q] = costPeriod(o, l, a, d, r, keys.some((k) => periods[k].laborConfigured));
  });
  const operationsYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].operations || 0), 0);
  const laborYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].labor || 0), 0);
  const aYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].actual || 0), 0);
  const dYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].deals || 0), 0);
  const rYear = ALL_MONTH_KEYS.reduce((s, k) => s + (periods[k].refund || 0), 0);
  periods.year = costPeriod(operationsYear, laborYear, aYear, dYear, rYear, ALL_MONTH_KEYS.some((k) => periods[k].laborConfigured));
  return periods;
}

function laborPeriod(cost) {
  return { cost: Math.round(Number(cost || 0) * 100) / 100 };
}

function buildLaborPeriods(monthCosts) {
  const periods = {};
  ALL_MONTH_KEYS.forEach((key, index) => {
    periods[key] = laborPeriod(monthCosts[index]);
  });
  Object.entries(QUARTER_MONTHS).forEach(([quarter, keys]) => {
    periods[quarter] = laborPeriod(keys.reduce((sum, key) => sum + periods[key].cost, 0));
  });
  periods.year = laborPeriod(ALL_MONTH_KEYS.reduce((sum, key) => sum + periods[key].cost, 0));
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

export function buildTargetSnapshot({ departments = [], staff = [], targets = [], revenue = [] } = {}) {
  const sales = staff.filter((s) => (
    (s.is_sales === 1 || s.is_sales === true || Number(s.is_sales) === 1)
    && s.department_id != null
    && Number(s.is_enabled) === 1
  ));
  const activeSalesIds = new Set(sales.map((row) => row.staff_id));

  const departmentsById = new Map(departments.map((d) => [d.department_id, d]));
  const childDeptIds = new Map();
  departments.forEach((d) => {
    if (d.parent_id != null && departmentsById.has(d.parent_id)) {
      if (!childDeptIds.has(d.parent_id)) childDeptIds.set(d.parent_id, []);
      childDeptIds.get(d.parent_id).push(d.department_id);
    }
  });

  const targetByStaff = new Map();
  const targetByDept = new Map();
  targets.forEach((t) => {
    const mk = monthKeyFromYM(t.year_month);
    if (!ALL_MONTH_KEYS.includes(mk)) return;
    if (t.department_id != null && t.staff_id == null) {
      if (!targetByDept.has(t.department_id)) targetByDept.set(t.department_id, {});
      targetByDept.get(t.department_id)[mk] = roundWan(t.target_amount_yuan);
      return;
    }
    if (t.staff_id != null) {
      if (!targetByStaff.has(t.staff_id)) targetByStaff.set(t.staff_id, {});
      targetByStaff.get(t.staff_id)[mk] = roundWan(t.target_amount_yuan);
    }
  });

  const actualByStaff = new Map();
  const actualDetailByDept = new Map();
  const unassignedActual = {};
  revenue.forEach((r) => {
    const mk = monthKeyFromYM(r.ym);
    if (!ALL_MONTH_KEYS.includes(mk)) return;
    if (r.staff_id != null && activeSalesIds.has(r.staff_id)) {
      if (!actualByStaff.has(r.staff_id)) actualByStaff.set(r.staff_id, {});
      const bucket = actualByStaff.get(r.staff_id);
      bucket[mk] = (bucket[mk] || 0) + roundWan(r.amt);
      return;
    }
    if (r.department_id != null) {
      if (!actualDetailByDept.has(r.department_id)) actualDetailByDept.set(r.department_id, {});
      const bucket = actualDetailByDept.get(r.department_id);
      bucket[mk] = (bucket[mk] || 0) + roundWan(r.amt);
      return;
    }
    unassignedActual[mk] = (unassignedActual[mk] || 0) + roundWan(r.amt);
  });

  const salesByDept = new Map();
  sales.forEach((s) => {
    if (!salesByDept.has(s.department_id)) salesByDept.set(s.department_id, []);
    salesByDept.get(s.department_id).push(s);
  });

  const deptRollupCache = new Map();
  function departmentRollup(deptId) {
    if (deptRollupCache.has(deptId)) return deptRollupCache.get(deptId);
    const directTarget = targetByDept.get(deptId) || {};
    const detailActual = actualDetailByDept.get(deptId) || {};
    const members = salesByDept.get(deptId) || [];
    const childRollups = (childDeptIds.get(deptId) || []).map((id) => departmentRollup(id));

    const target = ALL_MONTH_KEYS.map((mk, idx) => {
      if (directTarget[mk] != null) return directTarget[mk];
      // 部门级目标：不再汇总人员目标，只累加子部门目标
      const childSum = childRollups.reduce((sum, child) => sum + child.target[idx], 0);
      return childSum;
    });
    const actual = ALL_MONTH_KEYS.map((mk, idx) => {
      const staffSum = members.reduce((sum, st) => sum + (actualByStaff.get(st.staff_id)?.[mk] || 0), 0);
      const childSum = childRollups.reduce((sum, child) => sum + child.actual[idx], 0);
      return (detailActual[mk] || 0) + staffSum + childSum;
    });
    const value = { target, actual };
    deptRollupCache.set(deptId, value);
    return value;
  }

  const rows = [];
  const rootDepartments = departments.filter((d) => d.parent_id == null || !departmentsById.has(d.parent_id));
  const allTarget = ALL_MONTH_KEYS.map((_, idx) => rootDepartments.reduce((sum, d) => sum + departmentRollup(d.department_id).target[idx], 0));
  const allActual = ALL_MONTH_KEYS.map((mk, idx) => (
    rootDepartments.reduce((sum, d) => sum + departmentRollup(d.department_id).actual[idx], 0)
    + (unassignedActual[mk] || 0)
  ));
  rows.push({ id: 'summary-all', type: 'department', name: '所有组织', role: '组织合计', periods: buildTargetPeriods(allTarget, allActual) });

  departments.forEach((d) => {
    const rollup = departmentRollup(d.department_id);
    const hasData = rollup.target.some((v) => v) || rollup.actual.some((v) => v) || (salesByDept.get(d.department_id)?.length || 0) > 0 || (childDeptIds.get(d.department_id)?.length || 0) > 0;
    if (!hasData) return;
    rows.push({ id: `summary-${d.department_id}`, type: 'department', name: d.department_name, role: '组织合计', periods: buildTargetPeriods(rollup.target, rollup.actual) });
  });

  // 部门级目标维护：不再生成人员明细行（回款仍按人员汇总进部门 actual）

  const orgTree = buildDeptTree(departments, (deptId) => {
    // 左侧树显示子部门数（不再显示人员数）
    return (childDeptIds.get(deptId) || []).length;
  });

  return { orgTree, rows };
}

export function buildCostSnapshot({ channels = [], costs = [], revenue = [], labor = [] } = {}) {
  const costByChannel = new Map();
  const laborByChannel = new Map();
  const laborConfiguredByChannel = new Map();
  const refundByChannel = new Map();
  costs.forEach((c) => {
    const mk = monthKeyFromYM(c.year_month);
    if (!ALL_MONTH_KEYS.includes(mk)) return;
    if (!costByChannel.has(c.channel_id)) costByChannel.set(c.channel_id, {});
    if (!laborByChannel.has(c.channel_id)) laborByChannel.set(c.channel_id, {});
    if (!laborConfiguredByChannel.has(c.channel_id)) laborConfiguredByChannel.set(c.channel_id, {});
    if (!refundByChannel.has(c.channel_id)) refundByChannel.set(c.channel_id, {});
    costByChannel.get(c.channel_id)[mk] = roundWan(c.operations_amount_yuan);
    laborByChannel.get(c.channel_id)[mk] = roundWan(c.labor_amount_yuan);
    laborConfiguredByChannel.get(c.channel_id)[mk] = c.labor_amount_yuan != null;
    refundByChannel.get(c.channel_id)[mk] = roundWan(c.refund_amount_yuan);
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
  const sumAllChannels = (valueMap, mk) => [...valueMap.values()]
    .reduce((sum, values) => sum + (values?.[mk] || 0), 0);
  const allCost = ALL_MONTH_KEYS.map((mk) => sumAllChannels(costByChannel, mk));
  const allLabor = ALL_MONTH_KEYS.map((mk) => sumAllChannels(laborByChannel, mk));
  const allLaborConfigured = ALL_MONTH_KEYS.map((mk) => [...laborConfiguredByChannel.values()]
    .some((values) => Boolean(values?.[mk])));
  const allRefund = ALL_MONTH_KEYS.map((mk) => sumAllChannels(refundByChannel, mk));
  const allActual = ALL_MONTH_KEYS.map((mk) => sumAllChannels(actualByChannel, mk));
  const allDeals = ALL_MONTH_KEYS.map((mk) => sumAllChannels(dealsByChannel, mk));
  rows.push({ id: 'summary-all', type: 'group', name: '全部渠道', periods: buildCostPeriods(allCost, allLabor, allActual, allDeals, allRefund, allLaborConfigured) });

  channels.forEach((c) => {
    const cb = costByChannel.get(c.channel_id) || {};
    const lb = laborByChannel.get(c.channel_id) || {};
    const laborConfigured = laborConfiguredByChannel.get(c.channel_id) || {};
    const rb = refundByChannel.get(c.channel_id) || {};
    const ab = actualByChannel.get(c.channel_id) || {};
    const db = dealsByChannel.get(c.channel_id) || {};
    rows.push({
      id: String(c.channel_id),
      type: 'channel',
      name: c.channel_name,
      parentId: 'summary-all',
      periods: buildCostPeriods(
        ALL_MONTH_KEYS.map((mk) => cb[mk] || 0),
        ALL_MONTH_KEYS.map((mk) => lb[mk] || 0),
        ALL_MONTH_KEYS.map((mk) => ab[mk] || 0),
        ALL_MONTH_KEYS.map((mk) => db[mk] || 0),
        ALL_MONTH_KEYS.map((mk) => rb[mk] || 0),
        ALL_MONTH_KEYS.map((mk) => Boolean(laborConfigured[mk])),
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

  const marketingByMonth = new Map();
  labor.forEach((row) => {
    if (String(row.cost_type) !== 'marketing') return;
    const monthKey = monthKeyFromYM(row.year_month);
    if (!ALL_MONTH_KEYS.includes(monthKey)) return;
    marketingByMonth.set(monthKey, (marketingByMonth.get(monthKey) || 0) + roundWan(row.amount_yuan));
  });
  const laborRows = [
    {
      id: 'labor-sales',
      costType: 'sales',
      name: '销售部人力成本',
      source: '四个渠道人力成本合计',
      editable: false,
      periods: buildLaborPeriods(allLabor),
    },
    {
      id: 'labor-marketing',
      costType: 'marketing',
      name: '市场部人力成本',
      source: '独立维护',
      editable: true,
      periods: buildLaborPeriods(ALL_MONTH_KEYS.map((key) => marketingByMonth.get(key) || 0)),
    },
  ];

  return { channels: navChannels, rows, laborRows };
}

function deriveSourceName(s) {
  if (Number(s.is_enabled) === 0) return '历史人员';
  if (Number(s.is_sales) === 1) return 'BI 销售';
  if (Number(s.is_delivery) === 1) return '实施';
  if (Number(s.is_success) === 1) return '客户成功';
  return '人员';
}

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
