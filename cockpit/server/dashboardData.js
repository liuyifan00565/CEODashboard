/*
 更新时间: 2026-07-14 18:59:10 CST
 更新内容: 合并特殊渠道结构与渠道费比；主 KPI 及日/月/年趋势继续统一读取自然年选源毛回款视图并独立扣减统一退款。
*/
/*
 更新时间: 2026-07-14 18:32:40 CST
 更新内容: 主指标及跨期趋势统一读取自然年选源视图，目标统一读取父组织优先的有效目标视图；退款独立月也能成为当前业务月。
*/
/*
 更新时间: 2026-07-14 18:15:00 CST
 更新内容: 公司月度、真实订单与日报按统一数据库视图选择来源；经营指标统一用毛回款减可维护退款。
*/
/*
 更新时间: 2026-07-14 18:04:01 CST
 更新内容: 合并公司月度业绩与统一毛回款口径；月度 total 驱动公司 KPI/趋势，真实订单继续驱动人员下钻，旧模式退款严格守恒。
*/
/*
 更新时间: 2026-07-14 17:57:56 CST
 更新内容: 统一回款视图模式的目标完成明细强制使用部门目标与部门回款，仅真实订单模式保留人员明细。
*/
/*
 更新时间: 2026-07-14 17:09:11 CST
 更新内容: 经营总览统一读取数据库回款聚合视图，退款按月渠道精确守恒扣减并允许净回款为负数。
*/
/*
 更新时间: 2026-07-14 17:25:00 CST
 更新内容: 公司 KPI 与月度趋势仅展示具备完整渠道月总额的月份；1-3 月线上订单只保留用于人员和订单下钻。
*/
/*
 更新时间: 2026-07-14 17:55:47 CST
 更新内容: 新增 makeChannelExpenseRatio，按渠道分别计算费比——线上渠道成本 = 投流(operations)+人力(labor)，
          线下三个渠道（华南/华东/代理）成本只算人力，不计入投流，因为线下不做付费投流；
          快照新增 channelExpenseRatio 字段供首页新的渠道费比小卡使用，与已有 channelRoi（线上线下口径一致的
          泛用投入产出比，供 AI 分析和总投入卡下钻复用）区分开，避免改动 channelRoi 影响其现有消费方。
*/
/*
 更新时间: 2026-07-14 17:50:49 CST
 更新内容: 看板仅使用公司月度大数，并向回款半环返回不作为独立经营渠道的特殊渠道结构金额。
*/
/*
 更新时间: 2026-07-14 17:10:00 CST
 更新内容: 公司月度总额按月份覆盖订单汇总；无月度总额的月份回退订单数据，恢复 1-3 月趋势且避免 4 月重复累计。
*/
/*
 更新时间: 2026-07-14 16:48:00 CST
 更新内容: 公司月度 total 独立驱动 KPI/趋势，四渠道行驱动结构；成交来源继续读取真实订单，不使用本工作簿忽略列。
*/
/*
 更新时间: 2026-07-14 15:45:00 CST
 更新内容: 公司级月度业绩事实优先驱动 KPI、趋势、渠道与来源结构；订单明细继续用于人员下钻，避免重叠月份重复计数。
*/
/*
 更新时间: 2026-07-14 14:29:30 CST
 更新内容: 成交来源聚合由年内累计改为最新业务月，确保来源环图与首页当前月份口径一致。
*/
/*
 更新时间: 2026-07-14 14:04:11 CST
 更新内容: 看板快照新增成交来源聚合，按来源与经营渠道返回年内净回款、成交数、客户数和数据日期范围。
*/
/*
 更新时间: 2026-07-14 13:18:00 CST
 更新内容: 业务月份改取最新真实事实月份；自营收入按销售业绩减退款计算净回款，并向下钻返回全部 Excel 字段。
*/
/*
 更新时间: 2026-07-13 21:00:00 CST
 更新内容: makeMonthlyTrend 改为按 monthlyTargets 和 recoveredRows 两边年月的并集构建月份骨架，不再只依赖
          monthlyTargets 是否存在——此前目标维护未配置任何月份时（biz_target_monthly 为空），即使当月有
          真实回款，月度经营趋势图也会整月空白；现在无目标的月份 target 按 0 处理（完成率随之为 0%），
          与交付看板"目标未配置"时仍展示真实数据的口径保持一致。
*/
/*
 Update time: 2026-07-13 18:53:01 CST
 Update content: Dashboard labor combines channel-derived sales labor with independent marketing labor, with legacy fallback for unconfigured channel labor.
*/
/* 更新时间: 2026-07-13 16:48:56 CST  更新内容: 总成本改为各渠道运营成本 + 各渠道人力成本；旧无渠道人力仅在新字段未维护时回退。 */
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
import { ensureCostSchema } from './costSchema.js';

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
  const channelKey = row?.channel_key ?? '__unassigned__';
  return yearMonth && channelKey ? `${yearMonth}|${channelKey}` : '';
}

export function applyRefundsToRecoveredRows(recoveredRows = [], refundRows = []) {
  if (!refundRows.length) return recoveredRows;

  const rowIndexesByMonthChannel = new Map();
  recoveredRows.forEach((row, index) => {
    const key = monthChannelKey(row);
    if (!key) return;
    const indexes = rowIndexesByMonthChannel.get(key) ?? [];
    indexes.push(index);
    rowIndexesByMonthChannel.set(key, indexes);
  });
  const refundByMonthChannel = groupSumBy(refundRows, monthChannelKey, 'refund_wan');
  const result = recoveredRows.map((row) => ({ ...row }));

  for (const [key, refundValue] of refundByMonthChannel) {
    const refundCents = Math.round(num(refundValue) * 100);
    if (!refundCents) continue;
    const indexes = rowIndexesByMonthChannel.get(key) ?? [];
    if (!indexes.length) {
      const [yearMonth, channelKey] = key.split('|');
      result.push({
        year_month: yearMonth,
        channel_key: channelKey,
        gross_recovered_wan: 0,
        refund_wan: round2(refundCents / 100),
        recovered_wan: round2(-refundCents / 100),
      });
      continue;
    }

    const grossCents = indexes.map((index) => Math.round(num(result[index].recovered_wan) * 100));
    const grossTotalCents = grossCents.reduce((total, value) => total + value, 0);
    let allocatedCents = 0;
    indexes.forEach((index, position) => {
      const isLast = position === indexes.length - 1;
      const allocationCents = isLast
        ? refundCents - allocatedCents
        : Math.round(grossTotalCents ? refundCents * (grossCents[position] / grossTotalCents) : 0);
      allocatedCents += allocationCents;
      const row = result[index];
      const gross = num(row.recovered_wan);
      const allocatedRefund = allocationCents / 100;
      result[index] = {
        ...row,
        gross_recovered_wan: row.gross_recovered_wan ?? row.recovered_wan,
        refund_wan: round2(num(row.refund_wan) + allocatedRefund),
        recovered_wan: round2(gross - allocatedRefund),
      };
    });
  }

  return result;
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
  const operationsCost = num(kpi.operationsCost ?? kpi.adCost);
  return {
    monthCompletion: pct(kpi.monthRecovered, kpi.monthTarget),
    monthGap: Math.max(0, round0(kpi.monthTarget - kpi.monthRecovered)),
    monthMoM: kpi.lastMonthRecovered ? round1(((kpi.monthRecovered - kpi.lastMonthRecovered) / kpi.lastMonthRecovered) * 100) : 0,
    yearCompletion: pct(kpi.yearRecovered, kpi.yearTarget),
    yearGap: Math.max(0, round0(kpi.yearTarget - kpi.yearRecovered)),
    yearYoY: kpi.lastYearSameRecovered ? round1(((kpi.yearRecovered - kpi.lastYearSameRecovered) / kpi.lastYearSameRecovered) * 100) : 0,
    costRatio: pct(kpi.totalCost, kpi.monthRecovered),
    channelRoi: kpi.totalCost ? round2(kpi.monthRecovered / kpi.totalCost) : 0,
    roi: operationsCost ? round2(kpi.monthRecovered / operationsCost) : 0,
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
      ? round2(yearRecoveredByChannel.get(channel.channel_key))
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
    const costRow = costByChannel.get(channel.key);
    const operations = num(costRow?.operations_wan ?? costRow?.investment_wan);
    const labor = num(costRow?.labor_wan);
    const investment = round0(operations + labor);
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

function makeChannelExpenseRatio({ channelRows, channelCosts }) {
  const costByChannel = byKey(channelCosts, 'channel_key');
  return channelRows.map((channel) => {
    const costRow = costByChannel.get(channel.key);
    const isOnline = channel.key === 'online';
    const adCost = isOnline ? round0(num(costRow?.operations_wan ?? costRow?.investment_wan)) : 0;
    const laborCost = round0(num(costRow?.labor_wan));
    const cost = adCost + laborCost;
    const roi = cost ? round2(channel.recovered / cost) : 0;
    return {
      key: channel.key,
      name: channel.name,
      recovered: channel.recovered,
      adCost,
      laborCost,
      cost,
      costRatio: pct(cost, channel.recovered),
      roi,
      basis: isOnline ? 'adLabor' : 'laborOnly',
      warn: roi > 0 && roi < 2.5,
      strong: roi >= 4,
    };
  });
}

function makeMonthlyTrend({ monthlyTargets, recoveredRows, latestMonth, currentMonthTarget }) {
  const latestYear = String(latestMonth).slice(0, 4);
  const recoveredByMonth = groupSum(recoveredRows, 'year_month', 'recovered_wan');
  const targetByMonth = groupSum(monthlyTargets, 'year_month', 'target_wan');
  const months = new Set([
    ...monthlyTargets.map((row) => row.year_month),
    ...recoveredRows.map((row) => row.year_month),
  ]);
  return [...months]
    .filter((yearMonth) => String(yearMonth).startsWith(latestYear)
      && monthNumber(yearMonth) <= monthNumber(latestMonth))
    .sort()
    .map((yearMonth) => {
      const recovered = round0(recoveredByMonth.get(yearMonth));
      const target = yearMonth === latestMonth ? currentMonthTarget : round0(targetByMonth.get(yearMonth));
      return {
        month: monthName(yearMonth),
        target,
        recovered,
        completion: pct(recovered, target),
      };
    });
}

function makeRevenueStructureRows(rows = [], latestMonth, latestYear) {
  const normalized = rows.map((row) => ({
    key: row.structure_key || 'special',
    name: row.structure_name || '特殊渠道',
    yearMonth: row.year_month,
    recovered: round0(row.recovered_wan),
  }));
  const yearly = new Map();
  normalized
    .filter((row) => String(row.yearMonth).startsWith(latestYear))
    .forEach((row) => {
      const current = yearly.get(row.key) ?? { key: row.key, name: row.name, recovered: 0 };
      current.recovered += row.recovered;
      yearly.set(row.key, current);
    });
  return {
    month: normalized.filter((row) => row.yearMonth === latestMonth),
    year: [...yearly.values()],
  };
}

// 本月每日回款，供经营总览趋势图的日视图使用；biz_target_monthly 无日粒度目标，只返回实际回款。
function makeDailyRevenueTrend(rows = []) {
  const recoveredByDay = groupSum((rows ?? []).filter((row) => row.day_key), 'day_key', 'recovered_wan');
  return [...recoveredByDay.entries()].sort(([left], [right]) => String(left).localeCompare(String(right))).map(([dayKey, recovered]) => ({
    day: String(dayKey).slice(5),
    date: dayKey,
    recovered: round0(recovered),
  }));
}

// 按自然年聚合的回款/目标，供经营总览趋势图的年视图使用；只返回数据库里实际存在的年份。
function makeYearlyTrend({ yearlyRecovered = [], yearlyTargets = [] }) {
  const normalizeYear = (rows) => rows.map((row) => ({
    ...row,
    year: String(row.year ?? row.year_month ?? '').slice(0, 4),
  }));
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
  const operationsByMonth = new Map();
  const channelLaborByMonth = new Map();
  const configuredLaborMonths = new Set();
  const legacyLaborByMonth = new Map();
  const marketingLaborByMonth = new Map();

  for (const row of channelCosts) {
    const yearMonth = row.year_month || latestMonth;
    if (!yearMonth) continue;
    months.add(yearMonth);
    const channels = channelByMonth.get(yearMonth) ?? {};
    const operations = num(row.operations_wan ?? row.investment_wan);
    const labor = num(row.labor_wan);
    channels[row.channel_key] = num(channels[row.channel_key]) + operations + labor;
    channelByMonth.set(yearMonth, channels);
    operationsByMonth.set(yearMonth, num(operationsByMonth.get(yearMonth)) + operations);
    channelLaborByMonth.set(yearMonth, num(channelLaborByMonth.get(yearMonth)) + labor);
    if (row.labor_wan != null) configuredLaborMonths.add(yearMonth);
  }

  for (const row of laborCosts) {
    const yearMonth = row.year_month || latestMonth;
    if (!yearMonth) continue;
    months.add(yearMonth);
    legacyLaborByMonth.set(yearMonth, num(legacyLaborByMonth.get(yearMonth)) + num(row.amount_wan));
    if (row.cost_type === 'marketing') {
      marketingLaborByMonth.set(yearMonth, num(marketingLaborByMonth.get(yearMonth)) + num(row.amount_wan));
    }
  }

  return [...months]
    .filter((yearMonth) => !latestMonth || yearMonth <= latestMonth)
    .sort()
    .map((yearMonth) => {
      const channels = channelByMonth.get(yearMonth) ?? {};
      const roundedChannels = Object.fromEntries(
        Object.entries(channels).map(([channelKey, value]) => [channelKey, round0(value)])
      );
      const operationsCost = round0(operationsByMonth.get(yearMonth));
      const laborCost = round0(configuredLaborMonths.has(yearMonth)
        ? num(channelLaborByMonth.get(yearMonth)) + num(marketingLaborByMonth.get(yearMonth))
        : legacyLaborByMonth.get(yearMonth));
      return {
        yearMonth,
        label: monthName(yearMonth),
        operationsCost,
        adCost: operationsCost,
        laborCost,
        totalCost: operationsCost + laborCost,
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
  useRevenueOrders,
}) {
  if (useRevenueOrders && salesRows.length) {
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
  const recoverySourceRows = recoveredRows;
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
  const revenueRefundRows = refundRows.filter((row) => String(row.year_month).startsWith(latestYear));
  const latestMonthRefundRows = refundRows.filter((row) => row.year_month === latestMonth);
  const salesRows = applyRefundsToRecoveredRows(rows.salesMemberMonthly ?? [], revenueRefundRows);
  const previousSalesRows = applyRefundsToRecoveredRows(
    rows.previousMonthSales ?? [],
    refundRows.filter((row) => row.year_month === previousMonth),
  );
  const lastYearSalesRows = applyRefundsToRecoveredRows(
    rows.lastYearSales ?? [],
    refundRows.filter((row) => row.year_month <= `${Number(latestYear) - 1}-${String(latestMonth).slice(5, 7)}`
      && String(row.year_month).startsWith(String(Number(latestYear) - 1))),
  );
  const currentSalesRows = salesRows.filter((row) => row.year_month === latestMonth);
  const yearSalesRows = salesRows.filter((row) => String(row.year_month).startsWith(latestYear));
  const rawRevenueRows = rows.revenueDaily ?? [];
  const monthlyTotalRows = rows.useRevenueMonthly
    ? applyRefundsToRecoveredRows(rows.monthlyRevenueTotals ?? [], revenueRefundRows)
    : [];
  const revenueRows = applyRefundsToRecoveredRows(rawRevenueRows, revenueRefundRows);
  const kpiRevenueRows = monthlyTotalRows.length ? monthlyTotalRows : revenueRows;
  const useRevenueDaily = monthlyTotalRows.length > 0 || rawRevenueRows.length > 0;
  const currentRevenueRows = revenueRows.filter((row) => row.year_month === latestMonth);
  const previousRevenueRows = kpiRevenueRows.filter((row) => row.year_month === previousMonth);
  const yearRevenueRows = revenueRows.filter((row) => String(row.year_month).startsWith(latestYear) && monthNumber(row.year_month) <= monthNumber(latestMonth));
  const currentKpiRevenueRows = kpiRevenueRows.filter((row) => row.year_month === latestMonth);
  const yearKpiRevenueRows = kpiRevenueRows.filter((row) => String(row.year_month).startsWith(latestYear) && monthNumber(row.year_month) <= monthNumber(latestMonth));
  const recoveredRows = useRevenueDaily ? kpiRevenueRows : yearSalesRows;
  const currentRecoveredRows = useRevenueDaily ? currentRevenueRows : currentSalesRows;
  const monthRefund = round0(sum(refundRows.filter((row) => row.year_month === latestMonth), 'refund_wan'));
  const yearRefund = round0(sum(refundRows.filter((row) => String(row.year_month).startsWith(latestYear) && monthNumber(row.year_month) <= monthNumber(latestMonth)), 'refund_wan'));
  const currentMonthRecovered = round0(sum(useRevenueDaily ? currentKpiRevenueRows : currentSalesRows, 'recovered_wan'));
  const currentMonthlyTarget = (rows.monthlyTargets ?? []).find((row) => row.year_month === latestMonth);
  const currentMonthTarget = round0(currentMonthlyTarget?.target_wan ?? sum(currentSalesRows, 'target_wan'));
  const annualTarget = round0(sum(rows.monthlyTargets ?? [], 'target_wan'));
  const yearRecovered = round0(sum(useRevenueDaily ? yearKpiRevenueRows : yearSalesRows, 'recovered_wan'));
  const operationsCost = round0((rows.channelCosts ?? []).reduce(
    (total, row) => total + num(row.operations_wan ?? row.investment_wan),
    0,
  ));
  const hasChannelLabor = (rows.channelCosts ?? []).some((row) => row.labor_wan != null);
  const marketingLaborCost = sum(
    (rows.laborCosts ?? []).filter((row) => row.cost_type === 'marketing'),
    'amount_wan',
  );
  const laborCost = round0(hasChannelLabor
    ? sum(rows.channelCosts ?? [], 'labor_wan') + marketingLaborCost
    : sum(rows.laborCosts ?? [], 'amount_wan'));
  const monthTargetGap = Math.max(0, currentMonthTarget - currentMonthRecovered);
  const kpi = {
    monthRecovered: currentMonthRecovered,
    monthTarget: currentMonthTarget,
    lastMonthRecovered: round0(sum(
      previousSalesRows.length ? previousSalesRows : previousRevenueRows,
      'recovered_wan',
    )),
    yearRecovered,
    yearTarget: annualTarget,
    lastYearSameRecovered: round0(sum(lastYearSalesRows, 'recovered_wan')),
    monthRefund,
    yearRefund,
    totalCost: operationsCost + laborCost,
    operationsCost,
    adCost: operationsCost,
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
    revenueStructure: makeRevenueStructureRows(rows.revenueStructureRows ?? [], latestMonth, latestYear),
    channelRoi: makeChannelRoi({ channelRows: channels, channelCosts: rows.channelCosts ?? [] }),
    channelExpenseRatio: makeChannelExpenseRatio({ channelRows: channels, channelCosts: rows.channelCosts ?? [] }),
    channelSourceBreakdown: rows.channelSourceBreakdown ?? [],
    monthlyTrend: makeMonthlyTrend({ monthlyTargets: rows.monthlyTargets ?? [], recoveredRows, latestMonth, currentMonthTarget }),
    dailyRevenueTrend: makeDailyRevenueTrend(applyRefundsToRecoveredRows(rows.dailyRevenue ?? [], latestMonthRefundRows)),
    yearlyTrend: makeYearlyTrend({
      yearlyRecovered: applyRefundsToRecoveredRows(rows.yearlyRevenue ?? [], refundRows),
      yearlyTargets: rows.yearlyTargets ?? [],
    }),
    costTrend,
    salesMemberRows: makeSalesMemberRows({
      salesRows: yearSalesRows,
      targetRows: rows.memberTargets ?? [],
      recoveredRows: applyRefundsToRecoveredRows(rows.memberRecovered ?? [], refundRows),
      latestMonth,
      latestYear,
      useRevenueOrders: Boolean(rows.useRevenueOrders),
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
      revenueOrders: rows.revenueDetailRows ?? [],
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

async function tableExists(connection, tableName) {
  const rows = await queryRows(
    connection,
    'SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1',
    [tableName],
  );
  return rows.length > 0;
}

async function revenueOrderRowsExist(connection, latestYear) {
  if (!(await tableExists(connection, 'fact_revenue_order'))) return false;
  const rows = await queryRows(
    connection,
    'SELECT 1 FROM fact_revenue_order WHERE stat_date >= ? AND stat_date < ? LIMIT 1',
    [`${latestYear}-01-01`, `${Number(latestYear) + 1}-01-01`],
  );
  return rows.length > 0;
}

async function revenueMonthlyRowsExist(connection, latestYear) {
  if (!(await tableExists(connection, 'fact_revenue_channel_monthly'))) return false;
  const rows = await queryRows(
    connection,
    "SELECT 1 FROM v_revenue_company_monthly_allocated WHERE `year_month` LIKE CONCAT(?, '%') LIMIT 1",
    [latestYear],
  );
  return rows.length > 0;
}

async function loadLatestActualMonth(connection) {
  const latestRows = await queryRows(
    connection,
    `SELECT MAX(actual_month) AS latestMonth
     FROM (
       SELECT DATE_FORMAT(MAX(stat_date), '%Y-%m') AS actual_month
       FROM v_revenue_gross_canonical
       UNION ALL
       SELECT MAX(\`year_month\`) AS actual_month
       FROM v_revenue_refund_canonical
       WHERE refund_amount_yuan <> 0
     ) actual_months`,
  );
  return latestRows[0]?.latestMonth || chinaTodayYMD().yearMonth;
}

async function selectDashboardBusinessMonth(connection) {
  return process.env.DASHBOARD_MONTH_OVERRIDE || TEMP_DASHBOARD_MONTH_OVERRIDE || await loadLatestActualMonth(connection);
}

export async function buildDashboardSnapshot(connection) {
  const latestMonth = await selectDashboardBusinessMonth(connection);
  await ensureCostSchema(connection);
  const prevMonthRows = await queryRows(connection, "SELECT DATE_FORMAT(DATE_SUB(STR_TO_DATE(CONCAT(?, '-01'), '%Y-%m-%d'), INTERVAL 1 MONTH), '%Y-%m') AS previousMonth", [latestMonth]);
  const previousMonth = prevMonthRows[0]?.previousMonth;
  const latestYear = String(latestMonth).slice(0, 4);
  const lastYearMonth = `${Number(latestYear) - 1}-${String(latestMonth).slice(5, 7)}`;
  const nextYear = String(Number(latestYear) + 1);
  const useRevenueOrders = await revenueOrderRowsExist(connection, latestYear);
  const useRevenueMonthly = await revenueMonthlyRowsExist(connection, latestYear);
  const [latestMonthYearNum, latestMonthNum] = String(latestMonth).split('-').map(Number);
  const nextMonthBoundary = latestMonthNum === 12
    ? `${latestMonthYearNum + 1}-01-01`
    : `${latestMonthYearNum}-${String(latestMonthNum + 1).padStart(2, '0')}-01`;

  const [
    channels,
    salesMemberMonthly,
    revenueDaily,
    monthlyRevenueTotals,
    revenueStructureRows,
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
    channelSourceBreakdown,
    revenueDetailRows,
    openingDetailRows,
    versionDetailRows,
  ] = await Promise.all([
    queryRows(connection, 'SELECT channel_id, channel_key, channel_name, zone_name FROM dim_channel WHERE is_enabled = 1 ORDER BY channel_id'),
    useRevenueOrders ? queryRows(connection, `
      SELECT *
      FROM (
        SELECT DATE_FORMAT(o.stat_date, '%Y-%m') AS \`year_month\`,
               o.staff_id,
               COALESCE(s.staff_name, o.sales_name_raw, CONCAT('销售', o.staff_id)) AS staff_name,
               ${STAFF_OR_FACT_CHANNEL_KEY_SQL} AS channel_key,
               COALESCE(c.channel_name, o.channel_name_raw, ${CHANNEL_NAME_BY_KEY_SQL(STAFF_OR_FACT_CHANNEL_KEY_SQL)}) AS channel_name,
               ROUND(SUM(o.sales_amount_yuan) / 10000, 2) AS recovered_wan,
               ROUND(COALESCE(MAX(t.target_amount_yuan), 0) / 10000, 2) AS target_wan
        FROM fact_revenue_order o
        LEFT JOIN dim_staff s ON s.staff_id = o.staff_id
        LEFT JOIN dim_department d ON d.department_id = s.department_id
        LEFT JOIN dim_channel c ON c.channel_id = o.channel_id
        LEFT JOIN fact_sales_member_monthly t
          ON t.staff_id = o.staff_id
         AND t.\`year_month\` = DATE_FORMAT(o.stat_date, '%Y-%m')
        WHERE o.stat_date >= ? AND o.stat_date < ?
        GROUP BY DATE_FORMAT(o.stat_date, '%Y-%m'), o.staff_id, s.staff_name, o.sales_name_raw,
                 ${STAFF_OR_FACT_CHANNEL_KEY_SQL},
                 COALESCE(c.channel_name, o.channel_name_raw, ${CHANNEL_NAME_BY_KEY_SQL(STAFF_OR_FACT_CHANNEL_KEY_SQL)})
      ) order_member_monthly
      WHERE staff_id IS NOT NULL AND channel_key IS NOT NULL
      ORDER BY \`year_month\`, staff_id
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]) : queryRows(connection, `
      SELECT *
      FROM (
        SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`, r.staff_id, s.staff_name,
               ${STAFF_OR_FACT_CHANNEL_KEY_SQL} AS channel_key,
               COALESCE(c.channel_name, ${CHANNEL_NAME_BY_KEY_SQL(STAFF_OR_FACT_CHANNEL_KEY_SQL)}) AS channel_name,
               ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan,
               0 AS target_wan
        FROM v_revenue_gross_canonical r
        JOIN dim_staff s ON s.staff_id = r.staff_id
        LEFT JOIN dim_department d ON d.department_id = s.department_id
        LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
        WHERE r.stat_date >= ? AND r.stat_date < ?
        GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m'), r.staff_id, s.staff_name,
                 ${STAFF_OR_FACT_CHANNEL_KEY_SQL},
                 COALESCE(c.channel_name, ${CHANNEL_NAME_BY_KEY_SQL(STAFF_OR_FACT_CHANNEL_KEY_SQL)})
      ) member_monthly
      WHERE channel_key IS NOT NULL
      ORDER BY \`year_month\`, staff_id
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]),
    queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`, c.channel_key,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM v_revenue_gross_canonical r
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      WHERE r.stat_date >= ? AND r.stat_date < ?
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m'), c.channel_key
      ORDER BY \`year_month\`, c.channel_key
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]),
    useRevenueMonthly ? queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM v_revenue_gross_canonical r
      WHERE r.stat_date >= ? AND r.stat_date < ?
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m')
      ORDER BY \`year_month\`
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]) : Promise.resolve([]),
    useRevenueMonthly ? queryRows(connection, `
      SELECT \`year_month\`, 'special' AS structure_key,
             COALESCE(source_name_raw, '特殊渠道') AS structure_name,
             ROUND(SUM(net_amount_yuan) / 10000, 2) AS recovered_wan
      FROM fact_revenue_channel_monthly
      WHERE \`year_month\` LIKE CONCAT(?, '%') AND record_level = 'structure'
      GROUP BY \`year_month\`, COALESCE(source_name_raw, '特殊渠道')
      ORDER BY \`year_month\`, structure_name
    `, [latestYear]) : Promise.resolve([]),
    queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m-%d') AS day_key,
             DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`, c.channel_key,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM v_revenue_gross_canonical r
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      WHERE r.stat_date >= ? AND r.stat_date < ?
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m-%d'), DATE_FORMAT(r.stat_date, '%Y-%m'), c.channel_key
      ORDER BY day_key, c.channel_key
    `, [`${latestMonth}-01`, nextMonthBoundary]),
    queryRows(connection, `
      SELECT YEAR(r.stat_date) AS \`year\`, DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`, c.channel_key,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM v_revenue_gross_canonical r
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      GROUP BY YEAR(r.stat_date), DATE_FORMAT(r.stat_date, '%Y-%m'), c.channel_key
      ORDER BY \`year\`, \`year_month\`, c.channel_key
    `),
    queryRows(connection, `
      SELECT LEFT(t.\`year_month\`, 4) AS \`year\`,
             ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan
      FROM v_target_monthly_effective t
      WHERE t.staff_id IS NULL
      GROUP BY LEFT(t.\`year_month\`, 4)
      ORDER BY \`year\`
    `),
    queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`, c.channel_key,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM v_revenue_gross_canonical r
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      WHERE DATE_FORMAT(r.stat_date, '%Y-%m') = ?
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m'), c.channel_key
    `, [previousMonth]),
    queryRows(connection, `
      SELECT DATE_FORMAT(r.stat_date, '%Y-%m') AS \`year_month\`, c.channel_key,
             ROUND(SUM(r.recovered_amount_yuan) / 10000, 2) AS recovered_wan
      FROM v_revenue_gross_canonical r
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      WHERE DATE_FORMAT(r.stat_date, '%Y-%m') <= ? AND YEAR(r.stat_date) = ?
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m'), c.channel_key
    `, [lastYearMonth, Number(latestYear) - 1]),
    queryRows(connection, `
      SELECT t.\`year_month\`,
             ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan,
             SUM(t.target_opening_count) AS opening_target,
             SUM(t.target_order_count) AS order_target
      FROM v_target_monthly_effective t
      WHERE t.\`year_month\` LIKE CONCAT(?, '%')
        AND t.staff_id IS NULL
      GROUP BY t.\`year_month\`
      ORDER BY t.\`year_month\`
    `, [latestYear]),
    queryRows(connection, `
      SELECT c.channel_key, ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan
      FROM v_target_monthly_effective t
      LEFT JOIN dim_channel c ON c.channel_id = t.channel_id
      WHERE t.\`year_month\` = ?
        AND t.staff_id IS NULL
      GROUP BY c.channel_key
      HAVING channel_key IS NOT NULL
    `, [latestMonth]),
    queryRows(connection, `
      SELECT c.channel_key, ROUND(SUM(t.target_amount_yuan) / 10000, 2) AS target_wan
      FROM v_target_monthly_effective t
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
      FROM v_target_monthly_effective t
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
      FROM v_revenue_gross_canonical r
      JOIN dim_department d ON d.department_id = r.department_id
      LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
      WHERE r.stat_date >= ? AND r.stat_date < ?
        AND d.is_enabled = 1
      GROUP BY DATE_FORMAT(r.stat_date, '%Y-%m'), d.department_id, d.department_name, c.channel_key
      ORDER BY \`year_month\`, channel_key, d.department_id
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]),
    queryRows(connection, `
      SELECT c.channel_key,
             ROUND(cost.operations_amount_yuan / 10000, 2) AS operations_wan,
             ROUND(cost.labor_amount_yuan / 10000, 2) AS labor_wan
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
      SELECT cost.\`year_month\`, c.channel_key,
             ROUND(SUM(cost.operations_amount_yuan) / 10000, 2) AS operations_wan,
             ROUND(SUM(cost.labor_amount_yuan) / 10000, 2) AS labor_wan
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
      SELECT refund.\`year_month\`, c.channel_key,
             ROUND(SUM(refund.refund_amount_yuan) / 10000, 2) AS refund_wan
      FROM v_revenue_refund_canonical refund
      LEFT JOIN dim_channel c ON c.channel_id = refund.channel_id
      GROUP BY refund.\`year_month\`, c.channel_key
      ORDER BY refund.\`year_month\`, c.channel_key
    `),
    useRevenueOrders ? queryRows(connection, `
      SELECT v.version_key,
             COALESCE(v.version_name, o.version_name_raw, '未标记版本') AS version_name,
             COALESCE(v.standard_price_yuan, AVG(NULLIF(o.price_amount_yuan, 0)), 0) AS standard_price_yuan,
             ${STAFF_OR_FACT_CHANNEL_KEY_SQL} AS channel_key,
             COUNT(*) AS units,
             ROUND(SUM(o.net_amount_yuan) / 10000, 2) AS recovered_wan,
             NULL AS mom_rate,
             0 AS current_renewal_due,
             0 AS current_renewal_paid
      FROM fact_revenue_order o
      LEFT JOIN dim_product_version v ON v.version_id = o.version_id
      LEFT JOIN dim_staff s ON s.staff_id = o.staff_id
      LEFT JOIN dim_department d ON d.department_id = s.department_id
      LEFT JOIN dim_channel c ON c.channel_id = o.channel_id
      WHERE DATE_FORMAT(o.stat_date, '%Y-%m') = ?
      GROUP BY v.version_key, COALESCE(v.version_name, o.version_name_raw, '未标记版本'),
               v.standard_price_yuan, ${STAFF_OR_FACT_CHANNEL_KEY_SQL}
      ORDER BY recovered_wan DESC
    `, [latestMonth]) : queryRows(connection, `
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
    useRevenueOrders ? queryRows(connection, `
      SELECT sourceKey, sourceName, channelKey,
        ROUND(SUM(net_amount_yuan) / 10000, 2) AS recovered,
        COUNT(*) AS dealCount,
        COUNT(DISTINCT customerKey) AS customerCount,
        DATE_FORMAT(MIN(stat_date), '%Y-%m-%d') AS periodStart,
        DATE_FORMAT(MAX(stat_date), '%Y-%m-%d') AS periodEnd
      FROM (
        SELECT
          COALESCE(CAST(cs.source_id AS CHAR), CONCAT('source-', COALESCE(NULLIF(TRIM(o.channel_name_raw), ''), 'unmarked'))) AS sourceKey,
          COALESCE(cs.source_name, NULLIF(TRIM(o.channel_name_raw), ''), '未标注') AS sourceName,
          COALESCE(${STAFF_OR_FACT_CHANNEL_KEY_SQL}, '') AS channelKey,
          o.net_amount_yuan,
          COALESCE(NULLIF(TRIM(o.customer_name), ''), NULLIF(TRIM(o.wechat_group_name), ''), o.order_no) AS customerKey,
          o.stat_date
        FROM fact_revenue_order o
        LEFT JOIN dim_channel_source cs ON cs.source_id = o.channel_source_id
        LEFT JOIN dim_staff s ON s.staff_id = o.staff_id
        LEFT JOIN dim_department d ON d.department_id = s.department_id
        LEFT JOIN dim_channel c ON c.channel_id = o.channel_id
        WHERE o.stat_date >= ? AND o.stat_date < ?
      ) source_orders
      GROUP BY sourceKey, sourceName, channelKey
      ORDER BY recovered DESC, dealCount DESC
    `, [`${latestMonth}-01`, nextMonthBoundary]) : Promise.resolve([]),
    useRevenueMonthly ? queryRows(connection, `
      SELECT
        CONCAT(m.\`year_month\`, '-01') AS \`date\`,
        m.\`year_month\` AS yearMonth,
        LEFT(m.\`year_month\`, 4) AS \`year\`,
        COALESCE(c.channel_key, '') AS channelKey,
        'monthly_channel_summary' AS orderType,
        ROUND((m.gross_amount_yuan - COALESCE(refund.refund_amount_yuan, 0)) / 10000, 2) AS \`value\`,
        ROUND(m.gross_amount_yuan / 10000, 2) AS salesAmount,
        '' AS orderNo,
        '' AS salesName,
        '' AS customerName,
        '' AS groupName,
        '' AS systemOwnerName,
        '' AS versionName,
        0 AS price,
        ROUND(COALESCE(refund.refund_amount_yuan, 0) / 10000, 2) AS refund,
        COALESCE(m.source_name_raw, c.channel_name, '') AS channelName,
        '' AS remark,
        '' AS otherNote,
        m.source_sheet AS sourceSheet,
        m.source_row_no AS sourceRowNo
      FROM v_revenue_company_monthly_allocated m
      LEFT JOIN dim_channel c ON c.channel_id = m.channel_id
      LEFT JOIN v_revenue_refund_canonical refund
        ON refund.\`year_month\` = m.\`year_month\`
       AND refund.channel_id <=> m.channel_id
      WHERE m.\`year_month\` LIKE CONCAT(?, '%')
      ORDER BY m.\`year_month\`, m.source_id
    `, [latestYear]) : useRevenueOrders ? queryRows(connection, `
      SELECT
        DATE_FORMAT(o.stat_date, '%Y-%m-%d') AS \`date\`,
        DATE_FORMAT(o.stat_date, '%Y-%m') AS yearMonth,
        CAST(YEAR(o.stat_date) AS CHAR) AS \`year\`,
        COALESCE(${STAFF_OR_FACT_CHANNEL_KEY_SQL}, '') AS channelKey,
        COALESCE(o.order_type, 'self_operated') AS orderType,
        ROUND(o.net_amount_yuan / 10000, 2) AS \`value\`,
        ROUND(o.sales_amount_yuan / 10000, 2) AS salesAmount,
        o.order_no AS orderNo,
        COALESCE(s.staff_name, o.sales_name_raw, '') AS salesName,
        COALESCE(o.customer_name, '') AS customerName,
        COALESCE(o.wechat_group_name, '') AS groupName,
        COALESCE(o.system_owner_name, '') AS systemOwnerName,
        COALESCE(v.version_name, o.version_name_raw, '') AS versionName,
        ROUND(COALESCE(o.price_amount_yuan, 0) / 10000, 2) AS price,
        ROUND(COALESCE(o.refund_amount_yuan, 0) / 10000, 2) AS refund,
        COALESCE(o.channel_name_raw, c.channel_name, ${CHANNEL_NAME_BY_KEY_SQL(STAFF_OR_FACT_CHANNEL_KEY_SQL)}, '') AS channelName,
        COALESCE(o.remark, '') AS remark,
        COALESCE(o.other_note, '') AS otherNote,
        COALESCE(o.source_sheet, '') AS sourceSheet,
        o.source_row_no AS sourceRowNo
      FROM fact_revenue_order o
      LEFT JOIN dim_staff s ON s.staff_id = o.staff_id
      LEFT JOIN dim_department d ON d.department_id = s.department_id
      LEFT JOIN dim_channel c ON c.channel_id = o.channel_id
      LEFT JOIN dim_product_version v ON v.version_id = o.version_id
      WHERE o.stat_date >= ? AND o.stat_date < ?
      ORDER BY o.stat_date, o.order_id
    `, [`${latestYear}-01-01`, `${nextYear}-01-01`]) : queryRows(connection, `
      WITH revenue_detail AS (
        SELECT r.stat_date, COALESCE(c.channel_key, '') AS channel_key, r.order_type,
               SUM(r.recovered_amount_yuan) AS gross_yuan
        FROM v_revenue_gross_canonical r
        LEFT JOIN dim_channel c ON c.channel_id = r.channel_id
        WHERE r.stat_date >= ? AND r.stat_date < ?
        GROUP BY r.stat_date, c.channel_key, r.order_type
      ), monthly_gross AS (
        SELECT DATE_FORMAT(stat_date, '%Y-%m') AS \`year_month\`, channel_key, SUM(gross_yuan) AS gross_yuan
        FROM revenue_detail
        GROUP BY DATE_FORMAT(stat_date, '%Y-%m'), channel_key
      ), monthly_refund AS (
        SELECT refund.\`year_month\`, COALESCE(c.channel_key, '') AS channel_key,
               SUM(refund.refund_amount_yuan) AS refund_yuan
        FROM v_revenue_refund_canonical refund
        LEFT JOIN dim_channel c ON c.channel_id = refund.channel_id
        GROUP BY refund.\`year_month\`, COALESCE(c.channel_key, '')
      ), allocated_detail AS (
        SELECT detail.*,
               CASE WHEN monthly.gross_yuan <> 0
                 THEN COALESCE(refund.refund_yuan, 0) * detail.gross_yuan / monthly.gross_yuan
                 ELSE 0
               END AS allocated_refund_yuan
        FROM revenue_detail detail
        JOIN monthly_gross monthly
          ON monthly.\`year_month\` = DATE_FORMAT(detail.stat_date, '%Y-%m')
         AND monthly.channel_key = detail.channel_key
        LEFT JOIN monthly_refund refund
          ON refund.\`year_month\` = monthly.\`year_month\`
         AND refund.channel_key = monthly.channel_key
      )
      SELECT DATE_FORMAT(stat_date, '%Y-%m-%d') AS \`date\`,
             DATE_FORMAT(stat_date, '%Y-%m') AS yearMonth,
             CAST(YEAR(stat_date) AS CHAR) AS \`year\`,
             channel_key AS channelKey,
             order_type AS orderType,
             ROUND((gross_yuan - allocated_refund_yuan) / 10000, 2) AS \`value\`,
             ROUND(gross_yuan / 10000, 2) AS grossValue,
             ROUND(allocated_refund_yuan / 10000, 2) AS refund
      FROM allocated_detail
      ORDER BY stat_date, channel_key, order_type
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
    useRevenueOrders,
    useRevenueMonthly,
    channels,
    salesMemberMonthly,
    revenueDaily,
    monthlyRevenueTotals,
    revenueStructureRows,
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
    channelSourceBreakdown,
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
