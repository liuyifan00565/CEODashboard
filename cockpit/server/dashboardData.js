/*
 更新时间: 2026-07-13 17:20:00 CST
 更新内容: 新增本月每日回款查询（GROUP BY DATE_FORMAT(stat_date, '%Y-%m-%d')）和按自然年聚合的回款/目标查询，
          快照新增 dailyRevenueTrend/yearlyTrend 字段，供经营总览页月度经营趋势图新增的日/月/年切换使用；
          年视图只返回数据库里实际存在的年份，不做多年回款的退款额调整（历史年份 refundRows 未取）。
*/
/*
 更新时间: 2026-07-10 17:02:12 CST
 更新内容: dashboard 部门回款明细兼容旧库 fact_revenue_daily 无 department_id 的结构，按 staff_id 兜底解析组织，避免接口报 Unknown column。
*/
/* Update time: 2026-07-13 16:55:00 CST  Update content: Channel member drilldowns prefer staff-level monthly sales facts when available, falling back to department rows only when staff facts are absent. */
/*
 更新时间: 2026-07-10 15:40:59 CST
 更新内容: 续费快照为每个渠道版本补齐 day/month/year 空粒度，避免二级页因部分粒度字段缺失而漏算。
*/
/*
 更新时间: 2026-07-10 17:20:00 CST
 更新内容: 交付看板目标未配置时返回 null 完成率和 targetConfigured=false，避免把缺失目标误显示为 0%。
*/
/*
 更新时间: 2026-07-10 15:25:00 CST
 更新内容: dashboard 快照补充回款、开户、版本的真实日级明细行，并按真实续费事实表返回月/年/日粒度，供前端二级页停用临时趋势。
*/
/*
 更新时间: 2026-07-10 14:50:00 CST
 更新内容: 首页业务月份默认跟随北京时间当前自然月，不再临时锁定 2026-06；仍支持 DASHBOARD_MONTH_OVERRIDE 显式覆盖。
*/
/*
 更新时间: 2026-07-09 16:05:00 CST
 更新内容: 回款全局计算逻辑改为赢单金额扣退款金额，从 biz_channel_cost_monthly.refund_amount_yuan
   按月份+渠道扣减日级或销售月表回款，并在 dashboard 快照返回月度/年度退款额。
*/
/*
 更新时间: 2026-07-09 14:51:22 CST
 更新内容: 目标口径改为部门级:monthlyTargets/channelTargets/yearChannelTargets/memberTargets 查询
   去掉 JOIN dim_staff,改 WHERE staff_id IS NULL 取部门级目标,渠道目标直接用 t.channel_id;
   memberTargets/memberRecovered 改按 department 聚合;addMemberMetric 改用 department_id/department_name,
   首页"目标完成明细"由按人改为按部门。回款总数仍走 revenueDaily(查询3),不受影响。
*/
/*
 更新时间: 2026-07-08 18:22:00 CST
 更新内容: dashboard 快照新增成本月趋势 costTrend，按渠道投放成本与人力成本聚合，供总投入费比二级下钻使用。
*/
/*
 更新时间: 2026-07-08 17:23:00 CST
 更新内容: 首页业务月份增加临时 2026-06 覆盖；其它原因处理完后移除覆盖即可恢复自动月份。
*/
/*
 更新时间: 2026-07-08 16:37:08 CST
 更新内容: 渠道目标和人员明细增加部门编码兜底渠道口径，年度/本月下钻改用维护目标与日级回款聚合，避免新增销售漏显。
*/
/*
 更新时间: 2026-07-08 15:10:00 CST
 更新内容: 修复经营节奏「本月时间进度/已过天数」在 UTC 容器里跨月凌晨错位的问题：
          原用服务端 new Date() 取今天，容器跑 UTC，北京时间月初凌晨会把「今天」算成上个月、天数也错。
          改用 chinaTodayYMD() 按 UTC+8 取今天年月日，与进程时区无关（与 Excel 月份错位同类根因）。
*/
/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 首页目标聚合与目标维护口径对齐，只统计启用销售且有部门的 staff 目标，避免组织维护停用/转非销售后旧目标继续进入分母。
*/
/*
 更新时间: 2026-07-07 15:25:00 CST
 更新内容: 移除经营总览 monthJudgement / annualJudgement 摘要字段及仅服务于该摘要的 riskName 局部变量，服务端不再产出模板拼接的摘要句。
*/
/*
 更新时间: 2026-07-07 14:05:00 CST
 更新内容: 修复聚合占位逻辑——月时间进度改为按真实日历推导；开户环比/较昨日、续费上月、算力 overview 的客户余额/平均回复率/新开客户/店铺改用真实来源，移除硬编码 0。
*/
/*
 更新时间: 2026-07-07 12:18:57 CST
 更新内容: 首页回款目标改用 biz_target_monthly 维护口径，版本销售查询改为续费先聚合后关联，避免 JOIN 放大。
*/
/*
 更新时间: 2026-07-06 18:49:54 CST
 更新内容: 清理经营节奏聚合函数未使用参数，保持真实数据库接口 lint 输出干净。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 新增真实 MySQL dashboard 数据聚合接口，将 ceo_dashboard 表汇总为前端可覆盖的经营快照。
*/
import mysql from 'mysql2/promise';

const DB_DEFAULTS = {
  host: '127.0.0.1',
  port: 3306,
  database: 'ceo_dashboard',
};

// 本地排查时可临时填入 YYYY-MM；默认走北京时间当前自然月。
const TEMP_DASHBOARD_MONTH_OVERRIDE = '';

const STAFF_CHANNEL_KEY_SQL = `COALESCE(NULLIF(s.channel_key, ''), CASE
  WHEN d.department_code = 'online-sales' THEN 'online'
  WHEN d.department_code = 'south-sales' THEN 'south'
  WHEN d.department_code = 'east-sales' THEN 'east'
  WHEN d.department_code = 'agent-sales' THEN 'agent'
  ELSE NULL
END)`;

const STAFF_OR_FACT_CHANNEL_KEY_SQL = `COALESCE(NULLIF(s.channel_key, ''), CASE
  WHEN d.department_code = 'online-sales' THEN 'online'
  WHEN d.department_code = 'south-sales' THEN 'south'
  WHEN d.department_code = 'east-sales' THEN 'east'
  WHEN d.department_code = 'agent-sales' THEN 'agent'
  ELSE NULL
END, c.channel_key)`;

const CHANNEL_NAME_BY_KEY_SQL = (keySql) => `CASE ${keySql}
  WHEN 'online' THEN '线上'
  WHEN 'south' THEN '华南线下'
  WHEN 'east' THEN '华东线下'
  WHEN 'agent' THEN '代理'
  ELSE NULL
END`;

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

function round2(value) {
  return Math.round(num(value) * 100) / 100;
}

function pct(part, total) {
  return num(total) ? round1((num(part) / num(total)) * 100) : 0;
}

function monthNumber(yearMonth) {
  return Number(String(yearMonth || '').slice(5, 7)) || 1;
}

function monthLabel(yearMonth) {
  const [year, month] = String(yearMonth || chinaTodayYMD().yearMonth).split('-');
  return `${year}年${Number(month)}月`;
}

function monthName(yearMonth) {
  return `${monthNumber(yearMonth)}月`;
}

/**
 * 中国当地（UTC+8）今天的年月日，与服务进程时区无关。
 * 容器默认跑 UTC，直接 new Date() 会在北京时间月初凌晨把「今天」算成上个月（与 Excel 日期单元格
 * 月份错位同类根因）。这里把时间戳加 8 小时后取 UTC 分量，任何时区下都得到北京时间当地的日历日期。
 */
export function chinaTodayYMD() {
  const shifted = new Date(Date.now() + 8 * 3600 * 1000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  return {
    year,
    month,
    day,
    yearMonth: `${year}-${String(month).padStart(2, '0')}`,
  };
}

function previousYearMonthValue(yearMonth) {
  const [year, month] = String(yearMonth || chinaTodayYMD().yearMonth).split('-').map(Number);
  if (month > 1) return `${year}-${String(month - 1).padStart(2, '0')}`;
  return `${year - 1}-12`;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + num(row[field]), 0);
}

function byKey(rows, keyField) {
  return rows.reduce((map, row) => {
    map.set(row[keyField], row);
    return map;
  }, new Map());
}

function groupSum(rows, keyField, valueField) {
  const result = new Map();
  for (const row of rows) {
    const key = row[keyField];
    result.set(key, num(result.get(key)) + num(row[valueField]));
  }
  return result;
}

function groupSumBy(rows, keyFn, valueField) {
  const result = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    result.set(key, num(result.get(key)) + num(row[valueField]));
  }
  return result;
}

function monthChannelKey(row) {
  const yearMonth = row?.year_month;
  const channelKey = row?.channel_key;
  return yearMonth && channelKey ? `${yearMonth}|${channelKey}` : '';
}

function applyRefundsToRecoveredRows(recoveredRows = [], refundRows = []) {
  if (!recoveredRows.length || !refundRows.length) return recoveredRows;

  const grossByMonthChannel = groupSumBy(recoveredRows, monthChannelKey, 'recovered_wan');
  const refundByMonthChannel = groupSumBy(refundRows, monthChannelKey, 'refund_wan');

  return recoveredRows.map((row) => {
    const key = monthChannelKey(row);
    const refundTotal = num(refundByMonthChannel.get(key));
    if (!key || !refundTotal) return row;

    const grossTotal = num(grossByMonthChannel.get(key));
    const gross = num(row.recovered_wan);
    const allocatedRefund = grossTotal ? refundTotal * (gross / grossTotal) : 0;
    const refundWan = round2(num(row.refund_wan) + allocatedRefund);
    return {
      ...row,
      gross_recovered_wan: row.gross_recovered_wan ?? row.recovered_wan,
      refund_wan: refundWan,
      recovered_wan: Math.max(0, round2(gross - allocatedRefund)),
    };
  });
}

function completionRow(row) {
  const completion = pct(row.recovered, row.target);
  return {
    ...row,
    completion,
    warn: row.warn ?? completion < 80,
  };
}

function makeKpiDerived(kpi) {
  return {
    monthCompletion: pct(kpi.monthRecovered, kpi.monthTarget),
    monthGap: Math.max(0, round0(kpi.monthTarget - kpi.monthRecovered)),
    monthMoM: kpi.lastMonthRecovered ? round1(((kpi.monthRecovered - kpi.lastMonthRecovered) / kpi.lastMonthRecovered) * 100) : 0,
    yearCompletion: pct(kpi.yearRecovered, kpi.yearTarget),
    yearGap: Math.max(0, round0(kpi.yearTarget - kpi.yearRecovered)),
    yearYoY: kpi.lastYearSameRecovered ? round1(((kpi.yearRecovered - kpi.lastYearSameRecovered) / kpi.lastYearSameRecovered) * 100) : 0,
    costRatio: pct(kpi.totalCost, kpi.monthRecovered),
    channelRoi: kpi.totalCost ? round2(kpi.monthRecovered / kpi.totalCost) : 0,
    roi: kpi.adCost ? round2(kpi.monthRecovered / kpi.adCost) : 0,
  };
}

function makeOperatingMetrics({ kpiDerived, latestMonth, channelRows }) {
  const currentMonth = monthNumber(latestMonth);
  const today = chinaTodayYMD();
  const todayYearMonth = today.yearMonth;
  const daysInMonth = 30;
  let daysElapsed;
  if (todayYearMonth > latestMonth) {
    daysElapsed = daysInMonth;
  } else if (todayYearMonth < latestMonth) {
    daysElapsed = 0;
  } else {
    daysElapsed = Math.min(daysInMonth, today.day);
  }
  const monthTimeProgress = round1((daysElapsed / daysInMonth) * 100);
  const annualTimeProgress = round1((currentMonth / 12) * 100);
  const remainingMonths = Math.max(12 - currentMonth, 1);
  const weakest = [...channelRows].sort((a, b) => a.completion - b.completion)[0];
  const riskImpactGap = weakest ? Math.max(0, round0(weakest.target - weakest.recovered)) : 0;
  const monthPaceDelta = round1(kpiDerived.monthCompletion - monthTimeProgress);
  const annualPaceDelta = round1(kpiDerived.yearCompletion - annualTimeProgress);
  const remainingMonthlyRequired = Math.max(0, Math.round(kpiDerived.yearGap / remainingMonths));

  return {
    monthTimeProgress,
    monthPaceDelta,
    riskImpactGap,
    annualTimeProgress,
    annualPaceDelta,
    annualRemainingRate: round1(100 - kpiDerived.yearCompletion),
    remainingMonths,
    remainingMonthlyRequired,
  };
}

function makeChannelRows({
  channels,
  currentRecoveredRows,
  currentSalesRows,
  currentTargetRows,
  yearlyRecovered,
  annualTarget,
  monthRecoveredTotal,
  monthTargetTotal,
  yearRecoveredRows = [],
  yearTargetRows = [],
}) {
  const recoveredByChannel = groupSum(currentRecoveredRows, 'channel_key', 'recovered_wan');
  const targetRows = currentTargetRows?.length ? currentTargetRows : currentSalesRows;
  const targetByChannel = groupSum(targetRows, 'channel_key', 'target_wan');
  const yearRecoveredByChannel = groupSum(yearRecoveredRows, 'channel_key', 'recovered_wan');
  const yearTargetByChannel = groupSum(yearTargetRows, 'channel_key', 'target_wan');
  return channels.map((channel) => {
    const recovered = round0(recoveredByChannel.get(channel.channel_key));
    const target = round0(targetByChannel.get(channel.channel_key));
    const yearRecovered = yearRecoveredRows.length
      ? round0(yearRecoveredByChannel.get(channel.channel_key))
      : monthRecoveredTotal ? round0(yearlyRecovered * (recovered / monthRecoveredTotal)) : recovered;
    const yearTarget = yearTargetRows.length
      ? round0(yearTargetByChannel.get(channel.channel_key))
      : monthTargetTotal ? round0(annualTarget * (target / monthTargetTotal)) : target;
    return completionRow({
      key: channel.channel_key,
      name: channel.channel_name,
      recovered,
      target,
      zone: channel.zone_name || undefined,
      cities: [],
      yearRecovered,
      yearTarget,
    });
  });
}

function makeChannelRoi({ channelRows, channelCosts }) {
  const costByChannel = byKey(channelCosts, 'channel_key');
  return channelRows.map((channel) => {
    const investment = round0(costByChannel.get(channel.key)?.investment_wan);
    const roi = investment ? round2(channel.recovered / investment) : 0;
    return {
      key: channel.key,
      name: channel.name,
      recovered: channel.recovered,
      investment,
      roi,
      costRatio: pct(investment, channel.recovered),
      warn: roi > 0 && roi < 2.5,
      strong: roi >= 4,
    };
  }).sort((a, b) => b.roi - a.roi);
}

function makeMonthlyTrend({ monthlyTargets, recoveredRows, latestMonth, currentMonthTarget }) {
  const recoveredByMonth = groupSum(recoveredRows, 'year_month', 'recovered_wan');
  return monthlyTargets
    .filter((row) => monthNumber(row.year_month) <= monthNumber(latestMonth))
    .map((row) => {
      const recovered = round0(recoveredByMonth.get(row.year_month));
      const target = row.year_month === latestMonth ? currentMonthTarget : round0(row.target_wan);
      return {
        month: monthName(row.year_month),
        target,
        recovered,
        completion: pct(recovered, target),
      };
    });
}

// 本月每日回款，供经营总览趋势图的日视图使用；biz_target_monthly 无日粒度目标，只返回实际回款。
function makeDailyRevenueTrend(rows = []) {
  return (rows ?? []).map((row) => ({
    day: String(row.day_key).slice(5),
    date: row.day_key,
    recovered: round0(row.recovered_wan),
  }));
}

// 按自然年聚合的回款/目标，供经营总览趋势图的年视图使用；只返回数据库里实际存在的年份。
function makeYearlyTrend({ yearlyRecovered = [], yearlyTargets = [] }) {
  const normalizeYear = (rows) => rows.map((row) => ({ ...row, year: String(row.year) }));
  const recoveredByYear = groupSum(normalizeYear(yearlyRecovered), 'year', 'recovered_wan');
  const targetByYear = groupSum(normalizeYear(yearlyTargets), 'year', 'target_wan');
  const years = new Set([...recoveredByYear.keys(), ...targetByYear.keys()]);
  return [...years].filter(Boolean).sort().map((year) => {
    const recovered = round0(recoveredByYear.get(year));
    const target = round0(targetByYear.get(year));
    return { year, target, recovered, completion: pct(recovered, target) };
  });
}

function makeCostTrend({ channelCosts = [], laborCosts = [], latestMonth }) {
  const months = new Set();
  const channelByMonth = new Map();
  const laborByMonth = new Map();

  for (const row of channelCosts) {
    const yearMonth = row.year_month || latestMonth;
    if (!yearMonth) continue;
    months.add(yearMonth);
    const channels = channelByMonth.get(yearMonth) ?? {};
    channels[row.channel_key] = num(channels[row.channel_key]) + num(row.investment_wan);
    channelByMonth.set(yearMonth, channels);
  }

  for (const row of laborCosts) {
    const yearMonth = row.year_month || latestMonth;
    if (!yearMonth) continue;
    months.add(yearMonth);
    laborByMonth.set(yearMonth, num(laborByMonth.get(yearMonth)) + num(row.amount_wan));
  }

  return [...months]
    .filter((yearMonth) => !latestMonth || yearMonth <= latestMonth)
    .sort()
    .map((yearMonth) => {
      const channels = channelByMonth.get(yearMonth) ?? {};
      const roundedChannels = Object.fromEntries(
        Object.entries(channels).map(([channelKey, value]) => [channelKey, round0(value)])
      );
      const adCost = round0(Object.values(channels).reduce((total, value) => total + num(value), 0));
      const laborCost = round0(laborByMonth.get(yearMonth));
      return {
        yearMonth,
        label: monthName(yearMonth),
        adCost,
        laborCost,
        totalCost: adCost + laborCost,
        channels: roundedChannels,
      };
    });
}

function addMemberMetric(map, row, field) {
  const deptId = row.department_id;
  const channelKey = row.channel_key;
  if (deptId == null || !channelKey) return;
  const key = `${channelKey}:${deptId}`;
  const current = map.get(key) ?? {
    key: `dept-${deptId}`,
    group: channelKey,
    name: row.department_name,
    monthTarget: 0,
    monthRecovered: 0,
    yearTarget: 0,
    yearRecovered: 0,
  };
  current[field] += num(row.value_wan);
  map.set(key, current);
}

function makeStaffSalesMemberRows(salesRows, latestMonth, latestYear) {
  const memberMap = new Map();

  salesRows
    .filter((row) => String(row.year_month).startsWith(latestYear) && String(row.year_month) <= latestMonth)
    .forEach((row) => {
      const staffId = row.staff_id;
      const channelKey = row.channel_key;
      if (staffId == null || !channelKey) return;

      const key = `${channelKey}:${staffId}`;
      const current = memberMap.get(key) ?? {
        key: `staff-${staffId}`,
        group: channelKey,
        name: row.staff_name,
        monthTarget: 0,
        monthRecovered: 0,
        yearTarget: 0,
        yearRecovered: 0,
      };

      if (row.year_month === latestMonth) {
        current.monthTarget += num(row.target_wan);
        current.monthRecovered += num(row.recovered_wan);
      }

      current.yearTarget += num(row.target_wan);
      current.yearRecovered += num(row.recovered_wan);
      memberMap.set(key, current);
    });

  return [...memberMap.values()].map((row) => completionRow({
    ...row,
    target: round0(row.monthTarget),
    recovered: round0(row.monthRecovered),
    monthTarget: round0(row.monthTarget),
    monthRecovered: round0(row.monthRecovered),
    yearTarget: round0(row.yearTarget),
    yearRecovered: round0(row.yearRecovered),
  }));
}

function makeSalesMemberRows({
  salesRows,
  targetRows = [],
  recoveredRows = [],
  latestMonth,
  latestYear,
  useRevenueDaily,
}) {
  if (salesRows.length) {
    return makeStaffSalesMemberRows(salesRows, latestMonth, latestYear);
  }

  if (!targetRows.length && !recoveredRows.length) {
    return salesRows.map((row) => completionRow({
      key: `staff-${row.staff_id}`,
      group: row.channel_key,
      name: row.staff_name,
      target: round0(row.target_wan),
      recovered: round0(row.recovered_wan),
      monthTarget: round0(row.target_wan),
      monthRecovered: round0(row.recovered_wan),
      yearTarget: round0(row.target_wan),
      yearRecovered: round0(row.recovered_wan),
    }));
  }

  const memberMap = new Map();
  const recoverySourceRows = useRevenueDaily ? recoveredRows : salesRows;
  const normalizeTarget = (row) => ({ ...row, value_wan: row.target_wan });
  const normalizeRecovered = (row) => ({ ...row, value_wan: row.recovered_wan });

  targetRows
    .filter((row) => row.year_month === latestMonth)
    .map(normalizeTarget)
    .forEach((row) => addMemberMetric(memberMap, row, 'monthTarget'));
  targetRows
    .filter((row) => String(row.year_month).startsWith(latestYear))
    .map(normalizeTarget)
    .forEach((row) => addMemberMetric(memberMap, row, 'yearTarget'));
  recoverySourceRows
    .filter((row) => row.year_month === latestMonth)
    .map(normalizeRecovered)
    .forEach((row) => addMemberMetric(memberMap, row, 'monthRecovered'));
  recoverySourceRows
    .filter((row) => String(row.year_month).startsWith(latestYear) && String(row.year_month) <= latestMonth)
    .map(normalizeRecovered)
    .forEach((row) => addMemberMetric(memberMap, row, 'yearRecovered'));

  return [...memberMap.values()].map((row) => completionRow({
    ...row,
    target: round0(row.monthTarget),
    recovered: round0(row.monthRecovered),
    monthTarget: round0(row.monthTarget),
    monthRecovered: round0(row.monthRecovered),
    yearTarget: round0(row.yearTarget),
    yearRecovered: round0(row.yearRecovered),
  }));
}

function makeVersionRows(rows) {
  return rows.map((row) => ({
    key: row.version_key || row.version_name,
    name: row.version_name,
    channelKey: row.channel_key || 'all',
    price: round0(row.standard_price_yuan),
    units: round0(row.units),
    recovered: round0(row.recovered_wan),
    mom: round1(row.mom_rate),
    currentRenewalDue: round0(row.current_renewal_due),
    currentRenewalPaid: round0(row.current_renewal_paid),
    currentRenewalRate: pct(row.current_renewal_paid, row.current_renewal_due),
  }));
}

function emptyRenewalPeriod() {
  return {
    due: 0,
    renewed: 0,
    revenue: 0,
    prevDue: 0,
    prevRenewed: 0,
  };
}

function emptyRenewalPeriods() {
  return {
    day: emptyRenewalPeriod(),
    month: emptyRenewalPeriod(),
    year: emptyRenewalPeriod(),
  };
}

function makeRenewalRows(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const channel = row.channel_key;
    const version = row.version_key || 'all';
    const key = `${channel}::${version}`;
    const current = grouped.get(key) ?? {
      channel,
      channelName: row.channel_name,
      version,
      periods: emptyRenewalPeriods(),
    };
    current.periods[row.period_kind || 'month'] = {
      due: round0(row.due_count),
      renewed: round0(row.renewed_count),
      revenue: round0(row.renewal_wan),
      prevDue: round0(row.prev_due_count),
      prevRenewed: round0(row.prev_renewed_count),
    };
    grouped.set(key, current);
  });

  return [...grouped.values()];
}

function makeOpeningMetrics(rows) {
  const byMetric = byKey(rows, 'metric');
  const month = byMetric.get('monthOpenings') ?? {};
  const today = byMetric.get('todayOpenings') ?? {};
  return [
    {
      key: 'month-openings',
      title: '本月开户数',
      metric: 'monthOpenings',
      value: round0(month.value),
      unit: '户',
      delta: month.previous ? round1(((num(month.value) - num(month.previous)) / num(month.previous)) * 100) : 0,
      compareLabel: '较上月',
      keywords: ['开户', '本月开户数'],
    },
    {
      key: 'today-openings',
      title: '今日开户数',
      metric: 'todayOpenings',
      value: round0(today.value),
      unit: '户',
      delta: today.previous ? round1(((num(today.value) - num(today.previous)) / num(today.previous)) * 100) : 0,
      compareLabel: '较昨日',
      keywords: ['开户', '今日开户数'],
    },
  ];
}

function makeComputeOverview(rows) {
  const overview = rows.computeOverview ?? {};
  return {
    totalCapacity: round0(overview.total_capacity),
    addedCapacity: round0(overview.added_capacity),
    consumedCapacity: round0(overview.consumed_capacity),
    customerCount: round0(overview.customer_count),
    customerUsage: round0(overview.customer_usage),
    customerBalance: round0(overview.customer_balance),
    newCustomers: round0(overview.new_customers),
    newStores: round0(overview.new_stores),
    averageReplyRate: round1(overview.average_reply_rate),
    totalCustomers: round0(overview.total_customers),
  };
}

function makeComputeTrend(rows) {
  return (rows.computeUsageDaily ?? []).map((row) => ({
    day: String(row.stat_date).slice(5),
    range: String(row.stat_date),
    usage: round0(num(row.usage_points) / 10000),
    addOn: round0(num(row.added_points) / 10000),
    capacity: round0(num(row.capacity_points) / 10000),
    target: round0(num(row.target_points) / 10000),
  }));
}

function makeDeliveryRows(rows) {
  return (rows.deliveryRows ?? []).map((row) => {
    const deliveredCount = round0(row.delivered_count);
    const targetCount = round0(row.target_count);
    const valuePerPerson = round1(row.value_wan);
    return {
      key: `delivery-${row.engineer_id}`,
      name: row.engineer_name,
      deliveredCount,
      targetCount,
      targetConfigured: targetCount > 0,
      averageOrderPrice: deliveredCount ? round1(valuePerPerson / deliveredCount) : 0,
      valuePerPerson,
      completion: targetCount ? pct(deliveredCount, targetCount) : null,
      warn: targetCount ? deliveredCount / targetCount < 0.8 : false,
    };
  }).sort((a, b) => {
    const targetOrder = Number(b.targetConfigured) - Number(a.targetConfigured);
    if (targetOrder) return targetOrder;
    const completionOrder = Number(b.completion || 0) - Number(a.completion || 0);
    if (completionOrder) return completionOrder;
    return Number(b.deliveredCount || 0) - Number(a.deliveredCount || 0);
  });
}

export function mapDashboardRowsToSnapshot(rows) {
  const latestMonth = rows.latestMonth || rows.salesMemberMonthly?.[0]?.year_month || chinaTodayYMD().yearMonth;
  const latestYear = String(latestMonth).slice(0, 4);
  const previousMonth = rows.previousMonth || previousYearMonthValue(latestMonth);
  const refundRows = rows.refundRows ?? [];
  const salesRows = applyRefundsToRecoveredRows(rows.salesMemberMonthly ?? [], refundRows);
  const previousSalesRows = applyRefundsToRecoveredRows(rows.previousMonthSales ?? [], refundRows);
  const lastYearSalesRows = applyRefundsToRecoveredRows(rows.lastYearSales ?? [], refundRows);
  const currentSalesRows = salesRows.filter((row) => row.year_month === latestMonth);
  const yearSalesRows = salesRows.filter((row) => String(row.year_month).startsWith(latestYear));
  const revenueRows = applyRefundsToRecoveredRows(rows.revenueDaily ?? [], refundRows);
  const useRevenueDaily = revenueRows.length > 0;
  const currentRevenueRows = revenueRows.filter((row) => row.year_month === latestMonth);
  const previousRevenueRows = revenueRows.filter((row) => row.year_month === previousMonth);
  const yearRevenueRows = revenueRows.filter((row) => String(row.year_month).startsWith(latestYear) && monthNumber(row.year_month) <= monthNumber(latestMonth));
  const recoveredRows = useRevenueDaily ? revenueRows : yearSalesRows;
  const currentRecoveredRows = useRevenueDaily ? currentRevenueRows : currentSalesRows;
  const monthRefund = round0(sum(refundRows.filter((row) => row.year_month === latestMonth), 'refund_wan'));
  const yearRefund = round0(sum(refundRows.filter((row) => String(row.year_month).startsWith(latestYear) && monthNumber(row.year_month) <= monthNumber(latestMonth)), 'refund_wan'));
  const currentMonthRecovered = round0(sum(currentRecoveredRows, 'recovered_wan'));
  const currentMonthlyTarget = (rows.monthlyTargets ?? []).find((row) => row.year_month === latestMonth);
  const currentMonthTarget = round0(currentMonthlyTarget?.target_wan ?? sum(currentSalesRows, 'target_wan'));
  const annualTarget = round0(sum(rows.monthlyTargets ?? [], 'target_wan'));
  const yearRecovered = round0(sum(useRevenueDaily ? yearRevenueRows : yearSalesRows, 'recovered_wan'));
  const adCost = round0(sum(rows.channelCosts ?? [], 'investment_wan'));
  const laborCost = round0(sum(rows.laborCosts ?? [], 'amount_wan'));
  const monthTargetGap = Math.max(0, currentMonthTarget - currentMonthRecovered);
  const kpi = {
    monthRecovered: currentMonthRecovered,
    monthTarget: currentMonthTarget,
    lastMonthRecovered: useRevenueDaily ? round0(sum(previousRevenueRows, 'recovered_wan')) : round0(sum(previousSalesRows, 'recovered_wan')),
    yearRecovered,
    yearTarget: annualTarget,
    lastYearSameRecovered: round0(sum(lastYearSalesRows, 'recovered_wan')),
    monthRefund,
    yearRefund,
    totalCost: adCost + laborCost,
    adCost,
    laborCost,
    received: currentMonthRecovered,
    receivable: monthTargetGap,
  };
  const kpiDerived = makeKpiDerived(kpi);
  const channels = makeChannelRows({
    channels: rows.channels ?? [],
    currentRecoveredRows,
    currentSalesRows,
    currentTargetRows: rows.channelTargets ?? [],
    yearlyRecovered: yearRecovered,
    annualTarget,
    monthRecoveredTotal: currentMonthRecovered,
    monthTargetTotal: currentMonthTarget,
    yearRecoveredRows: useRevenueDaily ? yearRevenueRows : yearSalesRows,
    yearTargetRows: rows.yearChannelTargets ?? [],
  });
  const operatingOverviewMetrics = makeOperatingMetrics({ kpiDerived, latestMonth, channelRows: channels });
  const deliveryRows = makeDeliveryRows(rows);
  const costTrend = makeCostTrend({
    channelCosts: rows.channelCostTrend ?? rows.channelCosts ?? [],
    laborCosts: rows.laborCostTrend ?? rows.laborCosts ?? [],
    latestMonth,
  });

  return {
    source: 'mysql',
    generatedAt: new Date().toISOString(),
    meta: {
      monthLabel: monthLabel(latestMonth),
      annualTarget,
    },
    kpi,
    kpiDerived,
    operatingOverviewMetrics,
    channels,
    channelRoi: makeChannelRoi({ channelRows: channels, channelCosts: rows.channelCosts ?? [] }),
    monthlyTrend: makeMonthlyTrend({ monthlyTargets: rows.monthlyTargets ?? [], recoveredRows, latestMonth, currentMonthTarget }),
    dailyRevenueTrend: makeDailyRevenueTrend(rows.dailyRevenue),
    yearlyTrend: makeYearlyTrend({ yearlyRecovered: rows.yearlyRevenue ?? [], yearlyTargets: rows.yearlyTargets ?? [] }),
    costTrend,
    salesMemberRows: makeSalesMemberRows({
      salesRows: yearSalesRows,
      targetRows: rows.memberTargets ?? [],
      recoveredRows: applyRefundsToRecoveredRows(rows.memberRecovered ?? [], refundRows),
      latestMonth,
      latestYear,
      useRevenueDaily,
    }),
    versions: makeVersionRows(rows.versionSales ?? []),
    renewalRows: makeRenewalRows(rows.renewalRows ?? []),
    openingAccountMetrics: makeOpeningMetrics(rows.openingRows ?? []),
    computeOverview: makeComputeOverview(rows),
    computeUsageTrend: makeComputeTrend(rows),
    computeVersionConsumption: rows.computeVersionConsumption ?? [],
    computeUsageDistribution: rows.computeUsageDistribution ?? [],
    computeCustomerRows: rows.computeCustomerRows ?? [],
    computeResourceHealth: rows.computeResourceHealth ?? [],
    deliveryRows,
    detailRows: {
      revenue: rows.revenueDetailRows ?? [],
      openings: rows.openingDetailRows ?? [],
      versions: rows.versionDetailRows ?? [],
    },
  };
}

function dbConfigFromEnv() {
  return {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || DB_DEFAULTS.host,
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || DB_DEFAULTS.port),
    user: process.env.DB_USERNAME || process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DATABASE_NAME || DB_DEFAULTS.database,
    charset: 'utf8mb4',
    dateStrings: true,
  };
}

async function queryRows(connection, sql, params = []) {
  const [rows] = await connection.execute(sql, params);
  return rows;
}

async function tableHasColumn(connection, tableName, columnName) {
  const rows = await queryRows(
    connection,
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
    [tableName, columnName],
  );
  return rows.length > 0;
}

async function loadLatestActualMonth(connection) {
  const latestRows = await queryRows(connection, `
    SELECT MAX(actual_month) AS latestMonth
    FROM (
      SELECT DATE_FORMAT(MAX(stat_date), '%Y-%m') AS actual_month
      FROM fact_revenue_daily
      UNION ALL
      SELECT MAX(\`year_month\`) AS actual_month
      FROM fact_sales_member_monthly
    ) actual_months
  `);
  return latestRows[0]?.latestMonth || chinaTodayYMD().yearMonth;
}

async function selectDashboardBusinessMonth(connection) {
  return process.env.DASHBOARD_MONTH_OVERRIDE || TEMP_DASHBOARD_MONTH_OVERRIDE || chinaTodayYMD().yearMonth || await loadLatestActualMonth(connection);
}

async function ensureDashboardRefundColumn(connection) {
  const rows = await queryRows(
    connection,
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_channel_cost_monthly' AND COLUMN_NAME = 'refund_amount_yuan'",
  );
  if (!rows.length) {
    await connection.execute('ALTER TABLE biz_channel_cost_monthly ADD COLUMN refund_amount_yuan DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT \'refund amount for dashboard net recovery\' AFTER investment_amount_yuan');
  }
}

export async function buildDashboardSnapshot(connection) {
  const latestMonth = await selectDashboardBusinessMonth(connection);
  await ensureDashboardRefundColumn(connection);
  const revenueHasDepartmentId = await tableHasColumn(connection, 'fact_revenue_daily', 'department_id');
  const revenueDepartmentIdSql = revenueHasDepartmentId
    ? 'COALESCE(r.department_id, s.department_id)'
    : 's.department_id';
  const prevMonthRows = await queryRows(connection, "SELECT DATE_FORMAT(DATE_SUB(STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d'), INTERVAL 1 MONTH), '%Y-%m') AS previousMonth", [latestMonth]);
  const previousMonth = prevMonthRows[0]?.previousMonth;
  const latestYear = String(latestMonth).slice(0, 4);
  const lastYearMonth = `${Number(latestYear) - 1}-${String(latestMonth).slice(5, 7)}`;
  const nextYear = String(Number(latestYear) + 1);
  const [latestMonthYearNum, latestMonthNum] = String(latestMonth).split('-').map(Number);
  const nextMonthBoundary = latestMonthNum === 12
    ? `${latestMonthYearNum + 1}-01-01`
    : `${latestMonthYearNum}-${String(latestMonthNum + 1).padStart(2, '0')}-01`;

  const [
    channels,
    salesMemberMonthly,
    revenueDaily,
    dailyRevenue,
    yearlyRevenue,
    yearlyTargets,
    previousMonthSales,
    lastYearSales,
    monthlyTargets,
    channelTargets,
    yearChannelTargets,
    memberTargets,
    memberRecovered,
    channelCosts,
    laborCosts,
    channelCostTrend,
    laborCostTrend,
    refundRows,
    versionSales,
    renewalRows,
    openingRows,
    computeOverviewRows,
    computeUsageDaily,
    computeVersionConsumption,
    computeUsageDistribution,
    computeCustomerRows,
    computeResourceHealth,
    deliveryRows,
    revenueDetailRows,
    openingDetailRows,
    versionDetailRows,
  ] = await Promise.all([
    queryRows(connection, 'SELECT channel_id, channel_key, channel_name, zone_name FROM dim_channel WHERE is_enabled = 1 ORDER BY channel_id'),
    queryRows(connection, `
      SELECT *
      FROM (
        SELECT f.\`year_month\`, f.staff_id, s.staff_name,
               ${STAFF_OR_FACT_CHANNEL_KEY_SQL} AS channel_key,
               COALESCE(c.channel_name, ${CHANNEL_NAME_BY_KEY_SQL(STAFF_OR_FACT_CHANNEL_KEY_SQL)}) AS channel_name,
               ROUND(f.recovered_amount_yuan / 10000, 2) AS recovered_wan,
               ROUND(f.target_amount_yuan / 10000, 2) AS target_wan
        FROM fact_sales_member_monthly f
        JOIN dim_staff s ON s.staff_id = f.staff_id
        LEFT JOIN dim_department d ON d.department_id = s.department_id
        LEFT JOIN dim_channel c ON c.channel_id = f.channel_id
        WHERE f.\`year_month\` LIKE CONCAT(?, '%')
      ) member_monthly
      WHERE channel_key IS NOT NULL
      ORDER BY \`year_month\`, staff_id
    `, [latestYear]),
    queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`, c.channel_key,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM fact_revenue_daily r
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      WHERE r.stat_date >= ? AND r.stat_date < ?
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m'), c.channel_key
      ORDER BY \`year_month\`, c.channel_key
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]),
    queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m-%d') AS day_key,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM fact_revenue_daily r
      WHERE r.stat_date >= ? AND r.stat_date < ?
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m-%d')
      ORDER BY day_key
    `, [`${latestMonth}-01`, nextMonthBoundary]),
    queryRows(connection, `
      SELECT YEAR(r.stat_date) AS \`year\`,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM fact_revenue_daily r
      GROUP BY YEAR(r.stat_date)
      ORDER BY \`year\`
    `),
    queryRows(connection, `
      SELECT LEFT(t.\`year_month\`, 4) AS \`year\`,
             ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan
      FROM biz_target_monthly t
      WHERE t.staff_id IS NULL
      GROUP BY LEFT(t.\`year_month\`, 4)
      ORDER BY \`year\`
    `),
    queryRows(connection, `
      SELECT f.\`year_month\`, ${STAFF_OR_FACT_CHANNEL_KEY_SQL} AS channel_key,
             ROUND(SUM(f.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM fact_sales_member_monthly f
      JOIN dim_staff s ON s.staff_id = f.staff_id
      LEFT JOIN dim_department d ON d.department_id = s.department_id
      LEFT JOIN dim_channel c ON c.channel_id = f.channel_id
      WHERE f.\`year_month\` = ?
      GROUP BY f.\`year_month\`, channel_key
      HAVING channel_key IS NOT NULL
    `, [previousMonth]),
    queryRows(connection, `
      SELECT f.\`year_month\`, ${STAFF_OR_FACT_CHANNEL_KEY_SQL} AS channel_key,
             ROUND(SUM(f.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM fact_sales_member_monthly f
      JOIN dim_staff s ON s.staff_id = f.staff_id
      LEFT JOIN dim_department d ON d.department_id = s.department_id
      LEFT JOIN dim_channel c ON c.channel_id = f.channel_id
      WHERE f.\`year_month\` <= ? AND f.\`year_month\` LIKE CONCAT(?, '%')
      GROUP BY f.\`year_month\`, channel_key
      HAVING channel_key IS NOT NULL
    `, [lastYearMonth, Number(latestYear) - 1]),
    queryRows(connection, `
      SELECT t.\`year_month\`,
             ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan,
             SUM(t.target_opening_count) AS opening_target,
             SUM(t.target_order_count) AS order_target
      FROM biz_target_monthly t
      WHERE t.\`year_month\` LIKE CONCAT(?, '%')
        AND t.staff_id IS NULL
      GROUP BY t.\`year_month\`
      ORDER BY t.\`year_month\`
    `, [latestYear]),
    queryRows(connection, `
      SELECT c.channel_key, ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan
      FROM biz_target_monthly t
      LEFT JOIN dim_channel c ON c.channel_id = t.channel_id
      WHERE t.\`year_month\` = ?
        AND t.staff_id IS NULL
      GROUP BY c.channel_key
      HAVING channel_key IS NOT NULL
    `, [latestMonth]),
    queryRows(connection, `
      SELECT c.channel_key, ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan
      FROM biz_target_monthly t
      LEFT JOIN dim_channel c ON c.channel_id = t.channel_id
      WHERE t.\`year_month\` LIKE CONCAT(?, '%')
        AND t.staff_id IS NULL
      GROUP BY c.channel_key
      HAVING channel_key IS NOT NULL
    `, [latestYear]),
    queryRows(connection, `
      SELECT t.\`year_month\`, d.department_id, d.department_name,
             c.channel_key,
             ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan
      FROM biz_target_monthly t
      JOIN dim_department d ON d.department_id = t.department_id
      LEFT JOIN dim_channel c ON c.channel_id = t.channel_id
      WHERE t.\`year_month\` LIKE CONCAT(?, '%')
        AND t.staff_id IS NULL
      GROUP BY t.\`year_month\`, d.department_id, d.department_name, c.channel_key
      HAVING channel_key IS NOT NULL
      ORDER BY t.\`year_month\`, channel_key, d.department_id
    `, [latestYear]),
    queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`, d.department_id, d.department_name,
             c.channel_key,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM fact_revenue_daily r
      LEFT JOIN dim_staff s ON s.staff_id = r.staff_id
      JOIN dim_department d ON d.department_id = ${revenueDepartmentIdSql}
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      WHERE r.stat_date >= ? AND r.stat_date < ?
        AND d.is_enabled = 1
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m'), d.department_id, d.department_name, c.channel_key
      HAVING channel_key IS NOT NULL
      ORDER BY \`year_month\`, channel_key, d.department_id
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]),
    queryRows(connection, `
      SELECT c.channel_key, ROUND(cost.investment_amount_yuan / 10000, 2) AS investment_wan
      FROM biz_channel_cost_monthly cost
      JOIN dim_channel c ON c.channel_id = cost.channel_id
      WHERE cost.\`year_month\` = ?
    `, [latestMonth]),
    queryRows(connection, `
      SELECT cost_type, ROUND(amount_yuan / 10000, 2) AS amount_wan
      FROM biz_labor_cost_monthly
      WHERE \`year_month\` = ?
    `, [latestMonth]),
    queryRows(connection, `
      SELECT cost.\`year_month\`, c.channel_key, ROUND(SUM(cost.investment_amount_yuan) / 10000, 2) AS investment_wan
      FROM biz_channel_cost_monthly cost
      JOIN dim_channel c ON c.channel_id = cost.channel_id
      WHERE cost.\`year_month\` LIKE CONCAT(?, '%')
        AND cost.\`year_month\` <= ?
      GROUP BY cost.\`year_month\`, c.channel_key
      ORDER BY cost.\`year_month\`, c.channel_key
    `, [latestYear, latestMonth]),
    queryRows(connection, `
      SELECT \`year_month\`, cost_type, ROUND(SUM(amount_yuan) / 10000, 2) AS amount_wan
      FROM biz_labor_cost_monthly
      WHERE \`year_month\` LIKE CONCAT(?, '%')
        AND \`year_month\` <= ?
      GROUP BY \`year_month\`, cost_type
      ORDER BY \`year_month\`, cost_type
    `, [latestYear, latestMonth]),
    queryRows(connection, `
      SELECT cost.\`year_month\`, c.channel_key, ROUND(SUM(cost.refund_amount_yuan) / 10000, 2) AS refund_wan
      FROM biz_channel_cost_monthly cost
      JOIN dim_channel c ON c.channel_id = cost.channel_id
      WHERE cost.\`year_month\` LIKE CONCAT(?, '%')
        AND cost.\`year_month\` <= ?
      GROUP BY cost.\`year_month\`, c.channel_key
      ORDER BY cost.\`year_month\`, c.channel_key
    `, [latestYear, latestMonth]),
    queryRows(connection, `
      SELECT v.version_key, v.version_name, v.standard_price_yuan, c.channel_key,
             f.units,
             f.recovered_wan,
             f.mom_rate,
             COALESCE(r.current_renewal_due, 0) AS current_renewal_due,
             COALESCE(r.current_renewal_paid, 0) AS current_renewal_paid
      FROM (
        SELECT version_id, channel_id,
               SUM(units) AS units,
               ROUND(SUM(recovered_amount_yuan) / 10000, 2) AS recovered_wan,
               MAX(mom_rate) AS mom_rate
        FROM fact_version_sales_daily
        WHERE DATE_FORMAT(stat_date, '%Y-%m') = ?
        GROUP BY version_id, channel_id
      ) f
      JOIN dim_product_version v ON v.version_id = f.version_id
      LEFT JOIN dim_channel c ON c.channel_id = f.channel_id
      LEFT JOIN (
        SELECT version_id, channel_id,
               SUM(due_count) AS current_renewal_due,
               SUM(renewed_count) AS current_renewal_paid
        FROM fact_renewal_daily
        WHERE DATE_FORMAT(stat_date, '%Y-%m') = ?
        GROUP BY version_id, channel_id
      ) r ON r.version_id = f.version_id AND r.channel_id = f.channel_id
      ORDER BY f.recovered_wan DESC
    `, [latestMonth, latestMonth]),
    queryRows(connection, `
      SELECT *
      FROM (
        SELECT 'month' AS period_kind, c.channel_key, c.channel_name, v.version_key,
               cur.due_count, cur.renewed_count, cur.renewal_wan,
               COALESCE(p.prev_due_count, 0) AS prev_due_count,
               COALESCE(p.prev_renewed_count, 0) AS prev_renewed_count
        FROM (
          SELECT channel_id, version_id,
                 SUM(due_count) AS due_count,
                 SUM(renewed_count) AS renewed_count,
                 ROUND(SUM(renewal_amount_yuan) / 10000, 2) AS renewal_wan
          FROM fact_renewal_daily
          WHERE DATE_FORMAT(stat_date, '%Y-%m') = ?
          GROUP BY channel_id, version_id
        ) cur
        LEFT JOIN dim_channel c ON c.channel_id = cur.channel_id
        LEFT JOIN dim_product_version v ON v.version_id = cur.version_id
        LEFT JOIN (
          SELECT channel_id, version_id,
                 SUM(due_count) AS prev_due_count,
                 SUM(renewed_count) AS prev_renewed_count
          FROM fact_renewal_daily
          WHERE DATE_FORMAT(stat_date, '%Y-%m') = ?
          GROUP BY channel_id, version_id
        ) p ON p.channel_id = cur.channel_id AND p.version_id = cur.version_id

        UNION ALL

        SELECT 'year' AS period_kind, c.channel_key, c.channel_name, v.version_key,
               cur.due_count, cur.renewed_count, cur.renewal_wan,
               COALESCE(p.prev_due_count, 0) AS prev_due_count,
               COALESCE(p.prev_renewed_count, 0) AS prev_renewed_count
        FROM (
          SELECT channel_id, version_id,
                 SUM(due_count) AS due_count,
                 SUM(renewed_count) AS renewed_count,
                 ROUND(SUM(renewal_amount_yuan) / 10000, 2) AS renewal_wan
          FROM fact_renewal_daily
          WHERE stat_date >= ? AND stat_date < ?
          GROUP BY channel_id, version_id
        ) cur
        LEFT JOIN dim_channel c ON c.channel_id = cur.channel_id
        LEFT JOIN dim_product_version v ON v.version_id = cur.version_id
        LEFT JOIN (
          SELECT channel_id, version_id,
                 SUM(due_count) AS prev_due_count,
                 SUM(renewed_count) AS prev_renewed_count
          FROM fact_renewal_daily
          WHERE stat_date >= ? AND stat_date < ?
          GROUP BY channel_id, version_id
        ) p ON p.channel_id = cur.channel_id AND p.version_id = cur.version_id

        UNION ALL

        SELECT 'day' AS period_kind, c.channel_key, c.channel_name, v.version_key,
               cur.due_count, cur.renewed_count, cur.renewal_wan,
               COALESCE(p.prev_due_count, 0) AS prev_due_count,
               COALESCE(p.prev_renewed_count, 0) AS prev_renewed_count
        FROM (
          SELECT channel_id, version_id,
                 SUM(due_count) AS due_count,
                 SUM(renewed_count) AS renewed_count,
                 ROUND(SUM(renewal_amount_yuan) / 10000, 2) AS renewal_wan
          FROM fact_renewal_daily
          WHERE stat_date = (
            SELECT MAX(stat_date)
            FROM fact_renewal_daily
            WHERE stat_date >= ? AND stat_date < ?
          )
          GROUP BY channel_id, version_id
        ) cur
        LEFT JOIN dim_channel c ON c.channel_id = cur.channel_id
        LEFT JOIN dim_product_version v ON v.version_id = cur.version_id
        LEFT JOIN (
          SELECT channel_id, version_id,
                 SUM(due_count) AS prev_due_count,
                 SUM(renewed_count) AS prev_renewed_count
          FROM fact_renewal_daily
          WHERE stat_date = (
            SELECT MAX(prev_stat.stat_date)
            FROM fact_renewal_daily prev_stat
            WHERE prev_stat.stat_date < (
              SELECT MAX(cur_stat.stat_date)
              FROM fact_renewal_daily cur_stat
              WHERE cur_stat.stat_date >= ? AND cur_stat.stat_date < ?
            )
          )
          GROUP BY channel_id, version_id
        ) p ON p.channel_id = cur.channel_id AND p.version_id = cur.version_id
      ) renewal_periods
      ORDER BY period_kind, renewal_wan DESC
    `, [
      latestMonth,
      previousMonth,
      `${latestYear}-01-01`,
      `${nextYear}-01-01`,
      `${Number(latestYear) - 1}-01-01`,
      `${latestYear}-01-01`,
      `${latestYear}-01-01`,
      `${nextYear}-01-01`,
      `${latestYear}-01-01`,
      `${nextYear}-01-01`,
    ]),
    queryRows(connection, `
      SELECT 'monthOpenings' AS metric, SUM(opening_count) AS value,
             (SELECT COALESCE(SUM(opening_count), 0) FROM fact_opening_account_daily WHERE DATE_FORMAT(stat_date, '%Y-%m') = ?) AS previous
      FROM fact_opening_account_daily
      WHERE DATE_FORMAT(stat_date, '%Y-%m') = ?
      UNION ALL
      SELECT 'todayOpenings' AS metric, SUM(opening_count) AS value,
             (SELECT COALESCE(SUM(opening_count), 0) FROM fact_opening_account_daily
              WHERE stat_date = (SELECT MAX(stat_date) FROM fact_opening_account_daily WHERE stat_date < (SELECT MAX(stat_date) FROM fact_opening_account_daily))) AS previous
      FROM fact_opening_account_daily
      WHERE stat_date = (SELECT MAX(stat_date) FROM fact_opening_account_daily)
    `, [previousMonth, latestMonth]),
    queryRows(connection, `
      SELECT
        SUM(usage_points) AS consumed_capacity,
        SUM(added_points) AS added_capacity,
        MAX(capacity_points) AS total_capacity,
        (SELECT COUNT(DISTINCT customer_phone_masked) FROM fact_compute_customer_daily WHERE stat_date = (SELECT MAX(stat_date) FROM fact_compute_customer_daily)) AS customer_count,
        (SELECT COALESCE(SUM(usage_points), 0) FROM fact_compute_customer_daily WHERE stat_date = (SELECT MAX(stat_date) FROM fact_compute_customer_daily)) AS customer_usage,
        (SELECT COALESCE(SUM(balance_points), 0) FROM fact_compute_customer_daily WHERE stat_date = (SELECT MAX(stat_date) FROM fact_compute_customer_daily)) AS customer_balance,
        (SELECT COUNT(DISTINCT customer_phone_masked) FROM fact_compute_customer_daily) AS total_customers,
        (SELECT COUNT(*) FROM fact_compute_customer_daily latest
         WHERE latest.stat_date = (SELECT MAX(stat_date) FROM fact_compute_customer_daily)
           AND latest.customer_phone_masked IS NOT NULL
           AND NOT EXISTS (
             SELECT 1 FROM fact_compute_customer_daily earlier
             WHERE earlier.customer_phone_masked = latest.customer_phone_masked
               AND earlier.stat_date < latest.stat_date
           )) AS new_customers,
        (SELECT COUNT(DISTINCT latest.customer_name) FROM fact_compute_customer_daily latest
         WHERE latest.stat_date = (SELECT MAX(stat_date) FROM fact_compute_customer_daily)
           AND latest.customer_name IS NOT NULL
           AND NOT EXISTS (
             SELECT 1 FROM fact_compute_customer_daily earlier
             WHERE earlier.customer_name = latest.customer_name
               AND earlier.stat_date < latest.stat_date
           )) AS new_stores,
        (SELECT ROUND(AVG(average_reply_rate), 1) FROM fact_compute_customer_daily WHERE stat_date = (SELECT MAX(stat_date) FROM fact_compute_customer_daily)) AS average_reply_rate
      FROM fact_compute_usage_daily
    `),
    queryRows(connection, `
      SELECT stat_date, usage_points, added_points, capacity_points, target_points
      FROM fact_compute_usage_daily
      ORDER BY stat_date
    `),
    queryRows(connection, `
      SELECT version_name AS name, consumption_weight AS value
      FROM fact_compute_version_consumption_daily
      WHERE stat_date = (SELECT MAX(stat_date) FROM fact_compute_version_consumption_daily)
      ORDER BY consumption_weight DESC
    `),
    queryRows(connection, `
      SELECT b.bucket_name AS name, d.customer_weight AS value
      FROM fact_compute_usage_distribution_daily d
      JOIN dim_compute_usage_bucket b ON b.bucket_key = d.bucket_key
      WHERE d.stat_date = (SELECT MAX(stat_date) FROM fact_compute_usage_distribution_daily)
      ORDER BY b.sort_order
    `),
    queryRows(connection, `
      SELECT customer_phone_masked AS phone, customer_name AS owner, account_type AS accountType,
             usage_points AS \`usage\`, balance_points AS balance, average_reply_rate AS averageReplyRate,
             '' AS salesOwner, '' AS successOwner
      FROM fact_compute_customer_daily
      WHERE stat_date = (SELECT MAX(stat_date) FROM fact_compute_customer_daily)
      ORDER BY usage_points DESC
      LIMIT 20
    `),
    queryRows(connection, `
      SELECT h.resource_key AS \`key\`, r.resource_name AS name, h.usage_rate AS \`usage\`,
             h.trend_text AS trend, h.state_text AS state, h.tone, r.resource_color AS color
      FROM fact_compute_resource_health_daily h
      JOIN dim_compute_resource r ON r.resource_key = h.resource_key
      WHERE h.stat_date = (SELECT MAX(stat_date) FROM fact_compute_resource_health_daily)
      ORDER BY h.usage_rate DESC
    `),
    queryRows(connection, `
      SELECT d.engineer_id, COALESCE(s.staff_name, CONCAT('工程师', d.engineer_id)) AS engineer_name,
             COUNT(*) AS delivered_count,
             COALESCE(MAX(t.target_count), 0) AS target_count,
             ROUND(SUM(d.order_price_yuan) / 10000, 2) AS value_wan
      FROM fact_delivery_order d
      LEFT JOIN dim_staff s ON s.staff_id = d.engineer_id
      LEFT JOIN biz_delivery_target_monthly t ON t.engineer_id = d.engineer_id AND t.\`year_month\` = DATE_FORMAT(d.delivery_date, '%Y-%m')
      WHERE DATE_FORMAT(d.delivery_date, '%Y-%m') = ?
      GROUP BY d.engineer_id, s.staff_name
    `, [latestMonth]),
    queryRows(connection, `
      SELECT
        DATE_FORMAT(r.stat_date, '%Y-%m-%d') AS \`date\`,
        DATE_FORMAT(r.stat_date, '%Y-%m') AS yearMonth,
        CAST(YEAR(r.stat_date) AS CHAR) AS \`year\`,
        COALESCE(c.channel_key, '') AS channelKey,
        r.order_type AS orderType,
        ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS \`value\`
      FROM fact_revenue_daily r
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      WHERE r.stat_date >= ? AND r.stat_date < ?
      GROUP BY r.stat_date, c.channel_key, r.order_type
      ORDER BY r.stat_date, c.channel_key, r.order_type
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]),
    queryRows(connection, `
      SELECT
        DATE_FORMAT(o.stat_date, '%Y-%m-%d') AS \`date\`,
        DATE_FORMAT(o.stat_date, '%Y-%m') AS yearMonth,
        CAST(YEAR(o.stat_date) AS CHAR) AS \`year\`,
        COALESCE(c.channel_key, '') AS channelKey,
        SUM(o.opening_count) AS \`value\`
      FROM fact_opening_account_daily o
      LEFT JOIN dim_channel c ON c.channel_id = o.channel_id
      WHERE o.stat_date >= ? AND o.stat_date < ?
      GROUP BY o.stat_date, c.channel_key
      ORDER BY o.stat_date, c.channel_key
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]),
    queryRows(connection, `
      SELECT
        DATE_FORMAT(f.stat_date, '%Y-%m-%d') AS \`date\`,
        DATE_FORMAT(f.stat_date, '%Y-%m') AS yearMonth,
        CAST(YEAR(f.stat_date) AS CHAR) AS \`year\`,
        COALESCE(c.channel_key, '') AS channelKey,
        v.version_key AS versionKey,
        v.version_name AS versionName,
        v.standard_price_yuan AS price,
        SUM(f.units) AS units,
        ROUND(SUM(f.recovered_amount_yuan) / 10000, 2) AS recovered
      FROM fact_version_sales_daily f
      JOIN dim_product_version v ON v.version_id = f.version_id
      LEFT JOIN dim_channel c ON c.channel_id = f.channel_id
      WHERE f.stat_date >= ? AND f.stat_date < ?
      GROUP BY f.stat_date, c.channel_key, v.version_key, v.version_name, v.standard_price_yuan
      ORDER BY f.stat_date, c.channel_key, v.version_key
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]),
  ]);

  return mapDashboardRowsToSnapshot({
    latestMonth,
    previousMonth,
    channels,
    salesMemberMonthly,
    revenueDaily,
    dailyRevenue,
    yearlyRevenue,
    yearlyTargets,
    previousMonthSales,
    lastYearSales,
    monthlyTargets,
    channelTargets,
    yearChannelTargets,
    memberTargets,
    memberRecovered,
    channelCosts,
    laborCosts,
    channelCostTrend,
    laborCostTrend,
    refundRows,
    versionSales,
    renewalRows,
    openingRows,
    computeOverview: computeOverviewRows[0],
    computeUsageDaily,
    computeVersionConsumption,
    computeUsageDistribution,
    computeCustomerRows,
    computeResourceHealth,
    deliveryRows,
    revenueDetailRows,
    openingDetailRows,
    versionDetailRows,
  });
}

export async function handleDashboardDataRequest(_req, res) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfigFromEnv());
    const snapshot = await buildDashboardSnapshot(connection);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(snapshot));
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({
      error: `真实数据库数据接口异常：${err.message}`,
    }));
  } finally {
    await connection?.end();
  }
}
