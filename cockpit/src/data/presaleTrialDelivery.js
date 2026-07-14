/*
 更新时间: 2026-07-14 14:30:00 CST
 更新内容: 新增售前试用交付看板集中演示数据、月份加载器、环比计算、渠道筛选与人员负载口径。
*/

/** @typedef {'good' | 'risk' | 'neutral'} ComparisonTone */
/** @typedef {'good' | 'warn' | 'risk'} BusinessStatusTone */
/** @typedef {'neutral' | 'info' | 'primary' | 'warn' | 'risk'} StageTone */
/** @typedef {'neutral' | 'warn' | 'risk'} RiskTone */
/** @typedef {'newTrials' | 'convertedCustomers' | 'conversionRate' | 'expectedAmountWan' | 'urgentRisk' | 'averageTrialDays'} ComparisonMetricKey */

/**
 * @typedef {Object} PresaleTrialMonthOption
 * @property {string} value 月份键，格式为 YYYY-MM。
 * @property {string} label 选择器显示文案。
 */

/**
 * @typedef {Object} PresaleTrialKpis
 * @property {number} currentTrials 当前试用客户数。
 * @property {number} newTrials 本月新增试用客户数。
 * @property {number} convertedCustomers 同批试用客户中的已成交数。
 * @property {number} conversionCohort 同批进入试用并完成观察窗的客户数。
 * @property {number} conversionRate 同批试用转化率，单位为百分数。
 * @property {number} expectedAmountWan 预计成交金额，单位为万元。
 * @property {number} closedAmountWan 已成交金额，单位为万元。
 * @property {number} urgentRisk 需要重点介入的风险及超期客户数。
 * @property {number} nearDeadline 三天内临近试用周期上限的客户数。
 * @property {number} priorityOverdue 需要重点介入的超期客户数。
 * @property {number} averageTrialDays 平均试用周期，单位为天。
 */

/**
 * @typedef {Object} PresaleTrialDistributionRow
 * @property {string} key 渠道唯一键。
 * @property {string} name 渠道名称。
 * @property {number} count 当前试用客户数。
 * @property {number} expectedAmountWan 预计成交金额，单位为万元。
 */

/**
 * @typedef {Object} PresaleTrialStageRow
 * @property {string} key 阶段唯一键。
 * @property {string} name 阶段名称。
 * @property {number} count 当前处于该阶段的客户数。
 * @property {StageTone} tone 阶段视觉语义。
 */

/**
 * @typedef {Object} PresaleTrialRiskAlert
 * @property {string} key 风险唯一键。
 * @property {string} text 风险提醒文案。
 * @property {RiskTone} tone 风险视觉语义。
 */

/**
 * @typedef {Object} PresaleTrialComparisonMetrics
 * @property {number} newTrials 新增试用客户数。
 * @property {number} convertedCustomers 完成成交客户数。
 * @property {number} conversionRate 试用转化率，单位为百分数。
 * @property {number} expectedAmountWan 预计成交金额，单位为万元。
 * @property {number} urgentRisk 风险及超期客户数。
 * @property {number} averageTrialDays 平均试用周期，单位为天。
 */

/**
 * @typedef {Object} PresaleTrialComparisonRow
 * @property {ComparisonMetricKey} key 指标唯一键。
 * @property {string} label 指标名称。
 * @property {string} currentLabel 当前月份格式化值。
 * @property {string} previousLabel 上一月份格式化值。
 * @property {string} changeLabel 格式化变化值，转化率使用 pp。
 * @property {string} status 业务含义状态。
 * @property {ComparisonTone} statusTone 状态视觉语义。
 */

/**
 * @typedef {Object} PresaleTrialConversionRow
 * @property {string} key 行唯一键。
 * @property {string} channelKey 对应渠道筛选键。
 * @property {string} name 渠道或团队名称。
 * @property {number} currentTrials 当前试用客户数。
 * @property {number} cohortStarted 上期启动且已完成观察窗的客户数。
 * @property {number} closedDeals 该成熟队列中的已成交客户数。
 * @property {number} conversionRate 成熟队列转化率，单位为百分数。
 * @property {number} expectedAmountWan 预计成交金额，单位为万元。
 * @property {'正常' | '关注' | '风险'} status 业务状态。
 * @property {BusinessStatusTone} statusTone 状态视觉语义。
 */

/**
 * @typedef {Object} PresaleTrialStaffLoad
 * @property {string} key 人员唯一键。
 * @property {string} name 配置人员姓名。
 * @property {number} currentAssigned 当前负责客户数。
 * @property {number} monthlyTotal 本月累计负责客户数。
 * @property {number} converted 本月已转化客户数。
 * @property {number} overdue 当前超期客户数。
 * @property {number} expectedAmountWan 预计成交金额，单位为万元。
 * @property {number} loadRatio 当前负责客户数占建议上限的百分数。
 * @property {'正常' | '偏高' | '超负荷'} loadStatus 负载状态。
 * @property {BusinessStatusTone} loadTone 负载视觉语义。
 */

/**
 * @typedef {Omit<PresaleTrialConversionRow, 'conversionRate'>} PresaleTrialConversionSourceRow
 */

/**
 * @typedef {Omit<PresaleTrialStaffLoad, 'loadRatio' | 'loadStatus' | 'loadTone'>} PresaleTrialStaffLoadSource
 */

/**
 * @typedef {Object} PresaleTrialSnapshotSource
 * @property {string} monthKey 月份键。
 * @property {string} monthLabel 月份显示名称。
 * @property {string} previousMonthLabel 上一月份显示名称。
 * @property {string} updatedAt 数据更新时间。
 * @property {Omit<PresaleTrialKpis, 'conversionRate'>} kpis 未派生转化率的核心指标。
 * @property {PresaleTrialDistributionRow[]} distribution 渠道分布。
 * @property {PresaleTrialStageRow[]} stages 阶段分布。
 * @property {PresaleTrialRiskAlert[]} riskAlerts 风险提醒。
 * @property {{channel: PresaleTrialConversionSourceRow[], team: PresaleTrialConversionSourceRow[]}} conversion 未派生成熟队列转化率的渠道与团队数据。
 * @property {PresaleTrialStaffLoadSource[]} staffLoads 未派生负载状态的人员数据。
 * @property {number} unassignedOwners 未配置负责人的客户数。
 */

/**
 * @typedef {Object} PresaleTrialSnapshot
 * @property {string} monthKey 月份键，格式为 YYYY-MM。
 * @property {string} monthLabel 月份显示名称。
 * @property {string} previousMonthLabel 上一月份显示名称。
 * @property {string} updatedAt 数据更新时间，格式为 YYYY-MM-DD HH:mm。
 * @property {PresaleTrialKpis} kpis 核心指标。
 * @property {PresaleTrialDistributionRow[]} distribution 当前试用客户渠道分布。
 * @property {PresaleTrialStageRow[]} stages 当前试用阶段分布。
 * @property {PresaleTrialRiskAlert[]} riskAlerts 风险提醒。
 * @property {PresaleTrialComparisonRow[]} comparisonRows 本月与上月比较行。
 * @property {{channel: PresaleTrialConversionRow[], team: PresaleTrialConversionRow[]}} conversion 渠道及团队成熟队列转化数据。
 * @property {PresaleTrialStaffLoad[]} staffLoads 配置人员负载数据。
 * @property {number} unassignedOwners 尚未配置负责人的客户数。
 * @property {number} capacityLimit 单人建议容量上限。
 */

/**
 * @typedef {Object} ComparisonChange
 * @property {string} changeLabel 格式化变化值。
 * @property {string} status 业务含义状态。
 * @property {ComparisonTone} statusTone 状态视觉语义。
 */

export const DEFAULT_PRESALE_TRIAL_MONTH = '2026-07';
export const DELIVERY_CAPACITY_LIMIT = 14;

/** @type {ReadonlyArray<Readonly<PresaleTrialMonthOption>>} */
export const PRESALE_TRIAL_MONTH_OPTIONS = Object.freeze([
  Object.freeze({ value: '2026-07', label: '本月' }),
  Object.freeze({ value: '2026-06', label: '上月' }),
]);

const COMPARISON_DEFINITIONS = Object.freeze({
  newTrials: {
    label: '新增试用客户',
    mode: 'percent',
    favorableDirection: 'up',
    positiveStatus: '增长',
    negativeStatus: '下降',
    valueSuffix: '个',
    decimals: 0,
  },
  convertedCustomers: {
    label: '完成成交客户',
    mode: 'percent',
    favorableDirection: 'up',
    positiveStatus: '增长',
    negativeStatus: '下降',
    valueSuffix: '个',
    decimals: 0,
  },
  conversionRate: {
    label: '试用转化率',
    mode: 'pp',
    favorableDirection: 'up',
    positiveStatus: '改善',
    negativeStatus: '恶化',
    valueSuffix: '%',
    decimals: 1,
  },
  expectedAmountWan: {
    label: '预计成交金额',
    mode: 'percent',
    favorableDirection: 'up',
    positiveStatus: '增长',
    negativeStatus: '下降',
    valueSuffix: '万',
    decimals: 1,
  },
  urgentRisk: {
    label: '风险及超期客户',
    mode: 'percent',
    favorableDirection: 'down',
    positiveStatus: '改善',
    negativeStatus: '恶化',
    valueSuffix: '个',
    decimals: 0,
  },
  averageTrialDays: {
    label: '平均试用周期',
    mode: 'days',
    favorableDirection: 'down',
    positiveStatus: '改善',
    negativeStatus: '恶化',
    valueSuffix: '天',
    decimals: 1,
  },
});

/** @type {ComparisonMetricKey[]} */
const COMPARISON_KEYS = [
  'newTrials',
  'convertedCustomers',
  'conversionRate',
  'expectedAmountWan',
  'urgentRisk',
  'averageTrialDays',
];

function roundToOne(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function formatSigned(value, suffix) {
  const normalized = Math.abs(value) < 0.05 ? 0 : roundToOne(value);
  const prefix = normalized > 0 ? '+' : '';
  return `${prefix}${normalized.toFixed(1)}${suffix}`;
}

function formatMetricValue(value, definition) {
  return `${value.toFixed(definition.decimals)}${definition.valueSuffix}`;
}

/**
 * 按成熟队列计算转化率，避免使用当前存量客户作为分母。
 * @param {number} closedDeals 已成交客户数。
 * @param {number} cohortStarted 同批启动并完成观察窗的客户数。
 * @returns {number} 一位小数的百分数；无有效分母时返回 0。
 */
export function calculateConversionRate(closedDeals, cohortStarted) {
  if (!Number.isFinite(cohortStarted) || cohortStarted <= 0) return 0;
  return roundToOne((closedDeals / cohortStarted) * 100);
}

/**
 * 计算并格式化单项月度变化，同时按指标含义判断改善或恶化。
 * @param {ComparisonMetricKey} metricKey 指标键。
 * @param {number} currentValue 本月值。
 * @param {number} previousValue 上月值。
 * @returns {ComparisonChange}
 */
export function formatComparisonChange(metricKey, currentValue, previousValue) {
  const definition = COMPARISON_DEFINITIONS[metricKey];
  if (!definition) throw new Error(`未知的交付比较指标：${metricKey}`);

  const difference = currentValue - previousValue;
  let changeLabel;
  if (definition.mode === 'percent') {
    changeLabel = previousValue === 0
      ? '—'
      : formatSigned((difference / previousValue) * 100, '%');
  } else if (definition.mode === 'pp') {
    changeLabel = formatSigned(difference, 'pp');
  } else {
    changeLabel = formatSigned(difference, '天');
  }

  if (Math.abs(difference) < Number.EPSILON) {
    return { changeLabel, status: '持平', statusTone: 'neutral' };
  }

  const isFavorable = definition.favorableDirection === 'up'
    ? difference > 0
    : difference < 0;
  return {
    changeLabel,
    status: isFavorable ? definition.positiveStatus : definition.negativeStatus,
    statusTone: isFavorable ? 'good' : 'risk',
  };
}

/**
 * 由两个月的原始指标生成比较表，所有变化均在运行时计算。
 * @param {PresaleTrialComparisonMetrics} currentMetrics 本月指标。
 * @param {PresaleTrialComparisonMetrics} previousMetrics 上月指标。
 * @returns {PresaleTrialComparisonRow[]}
 */
export function buildComparisonRows(currentMetrics, previousMetrics) {
  return COMPARISON_KEYS.map((key) => {
    const definition = COMPARISON_DEFINITIONS[key];
    const currentValue = currentMetrics[key];
    const previousValue = previousMetrics[key];
    return {
      key,
      label: definition.label,
      currentLabel: formatMetricValue(currentValue, definition),
      previousLabel: formatMetricValue(previousValue, definition),
      ...formatComparisonChange(key, currentValue, previousValue),
    };
  });
}

/**
 * 根据 14 单建议上限计算人员负载状态。
 * @param {number} currentAssigned 当前负责客户数。
 * @param {number} [capacityLimit=DELIVERY_CAPACITY_LIMIT] 建议容量上限。
 * @returns {{loadRatio: number, loadStatus: '正常' | '偏高' | '超负荷', loadTone: BusinessStatusTone}}
 */
export function getStaffLoadState(currentAssigned, capacityLimit = DELIVERY_CAPACITY_LIMIT) {
  if (!Number.isFinite(capacityLimit) || capacityLimit <= 0) {
    throw new Error('配置人员建议容量上限必须大于 0。');
  }
  const loadRatio = roundToOne((currentAssigned / capacityLimit) * 100);
  if (loadRatio > 100) {
    return { loadRatio, loadStatus: '超负荷', loadTone: 'risk' };
  }
  if (loadRatio >= 80) {
    return { loadRatio, loadStatus: '偏高', loadTone: 'warn' };
  }
  return { loadRatio, loadStatus: '正常', loadTone: 'good' };
}

/**
 * 按环图渠道键筛选渠道或团队转化行；all 或空值返回全部行副本。
 * @param {PresaleTrialConversionRow[]} rows 待筛选转化行。
 * @param {string | null | undefined} channelKey 渠道筛选键。
 * @returns {PresaleTrialConversionRow[]}
 */
export function filterConversionRows(rows, channelKey) {
  if (!Array.isArray(rows)) return [];
  if (!channelKey || channelKey === 'all') return rows.slice();
  return rows.filter((row) => row.channelKey === channelKey);
}

/**
 * @param {PresaleTrialKpis} kpis 核心指标。
 * @returns {PresaleTrialComparisonMetrics}
 */
function toComparisonMetrics(kpis) {
  return {
    newTrials: kpis.newTrials,
    convertedCustomers: kpis.convertedCustomers,
    conversionRate: kpis.conversionRate,
    expectedAmountWan: kpis.expectedAmountWan,
    urgentRisk: kpis.urgentRisk,
    averageTrialDays: kpis.averageTrialDays,
  };
}

/**
 * @param {PresaleTrialConversionSourceRow[]} rows 未派生转化率的行。
 * @returns {PresaleTrialConversionRow[]}
 */
function buildConversionRows(rows) {
  return rows.map((row) => ({
    ...row,
    conversionRate: calculateConversionRate(row.closedDeals, row.cohortStarted),
  }));
}

/**
 * @param {PresaleTrialStaffLoadSource[]} rows 未派生负载状态的人员行。
 * @param {number} capacityLimit 建议容量上限。
 * @returns {PresaleTrialStaffLoad[]}
 */
function buildStaffLoads(rows, capacityLimit) {
  return rows.map((row) => ({
    ...row,
    ...getStaffLoadState(row.currentAssigned, capacityLimit),
  }));
}

const MAY_COMPARISON_BASELINE = Object.freeze({
  newTrials: 13,
  convertedCustomers: 7,
  conversionRate: 35,
  expectedAmountWan: 61.2,
  urgentRisk: 10,
  averageTrialDays: 15.1,
});

/** @type {PresaleTrialSnapshotSource} */
const JULY_SOURCE = {
  monthKey: '2026-07',
  monthLabel: '2026年7月',
  previousMonthLabel: '2026年6月',
  updatedAt: '2026-07-14 10:30',
  kpis: {
    currentTrials: 60,
    newTrials: 18,
    convertedCustomers: 12,
    conversionCohort: 26,
    expectedAmountWan: 82.4,
    closedAmountWan: 31.6,
    urgentRisk: 5,
    nearDeadline: 3,
    priorityOverdue: 2,
    averageTrialDays: 12.6,
  },
  distribution: [
    { key: 'east', name: '华东', count: 18, expectedAmountWan: 26.4 },
    { key: 'south', name: '华南', count: 15, expectedAmountWan: 21.8 },
    { key: 'direct', name: '线上直营', count: 17, expectedAmountWan: 19.6 },
    { key: 'agency', name: '代理渠道', count: 10, expectedAmountWan: 14.6 },
  ],
  stages: [
    { key: 'pending', name: '待配置', count: 6, tone: 'neutral' },
    { key: 'configuring', name: '配置中', count: 14, tone: 'info' },
    { key: 'trial', name: '试用中', count: 26, tone: 'primary' },
    { key: 'review', name: '待复盘', count: 9, tone: 'warn' },
    { key: 'overdue', name: '已超期', count: 5, tone: 'risk' },
  ],
  riskAlerts: [
    { key: 'near-deadline', text: '3个客户将在3天内超过试用周期', tone: 'warn' },
    { key: 'unassigned', text: '2个客户尚未配置负责人', tone: 'risk' },
    { key: 'missing-amount', text: '3个客户预计成交金额未填写', tone: 'neutral' },
  ],
  conversion: {
    channel: [
      { key: 'east', channelKey: 'east', name: '华东', currentTrials: 18, cohortStarted: 12, closedDeals: 7, expectedAmountWan: 26.4, status: '正常', statusTone: 'good' },
      { key: 'south', channelKey: 'south', name: '华南', currentTrials: 15, cohortStarted: 10, closedDeals: 3, expectedAmountWan: 21.8, status: '关注', statusTone: 'warn' },
      { key: 'direct', channelKey: 'direct', name: '线上直营', currentTrials: 17, cohortStarted: 8, closedDeals: 4, expectedAmountWan: 19.6, status: '正常', statusTone: 'good' },
      { key: 'agency', channelKey: 'agency', name: '代理渠道', currentTrials: 10, cohortStarted: 6, closedDeals: 1, expectedAmountWan: 14.6, status: '风险', statusTone: 'risk' },
    ],
    team: [
      { key: 'east-team', channelKey: 'east', name: '华东战区', currentTrials: 16, cohortStarted: 10, closedDeals: 6, expectedAmountWan: 23.2, status: '正常', statusTone: 'good' },
      { key: 'south-team', channelKey: 'south', name: '华南战区', currentTrials: 14, cohortStarted: 9, closedDeals: 3, expectedAmountWan: 20.4, status: '关注', statusTone: 'warn' },
      { key: 'direct-team', channelKey: 'direct', name: '线上销售部', currentTrials: 20, cohortStarted: 11, closedDeals: 5, expectedAmountWan: 25.1, status: '正常', statusTone: 'good' },
      { key: 'agency-team', channelKey: 'agency', name: '代理渠道部', currentTrials: 10, cohortStarted: 6, closedDeals: 1, expectedAmountWan: 13.7, status: '风险', statusTone: 'risk' },
    ],
  },
  staffLoads: [
    { key: 'chen-chen', name: '陈晨', currentAssigned: 11, monthlyTotal: 18, converted: 3, overdue: 1, expectedAmountWan: 16.2 },
    { key: 'zhao-qing', name: '赵晴', currentAssigned: 13, monthlyTotal: 21, converted: 3, overdue: 1, expectedAmountWan: 18.9 },
    { key: 'han-yu', name: '韩宇', currentAssigned: 15, monthlyTotal: 22, converted: 2, overdue: 2, expectedAmountWan: 20.6 },
    { key: 'zhou-ning', name: '周宁', currentAssigned: 10, monthlyTotal: 17, converted: 2, overdue: 0, expectedAmountWan: 13.4 },
    { key: 'qin-jia', name: '秦佳', currentAssigned: 9, monthlyTotal: 15, converted: 2, overdue: 1, expectedAmountWan: 10.3 },
  ],
  unassignedOwners: 2,
};

/** @type {PresaleTrialSnapshotSource} */
const JUNE_SOURCE = {
  monthKey: '2026-06',
  monthLabel: '2026年6月',
  previousMonthLabel: '2026年5月',
  updatedAt: '2026-07-14 10:30',
  kpis: {
    currentTrials: 52,
    newTrials: 15,
    convertedCustomers: 9,
    conversionCohort: 23,
    expectedAmountWan: 68.6,
    closedAmountWan: 23.8,
    urgentRisk: 8,
    nearDeadline: 4,
    priorityOverdue: 4,
    averageTrialDays: 14.2,
  },
  distribution: [
    { key: 'east', name: '华东', count: 16, expectedAmountWan: 21.8 },
    { key: 'south', name: '华南', count: 13, expectedAmountWan: 18.2 },
    { key: 'direct', name: '线上直营', count: 14, expectedAmountWan: 16.4 },
    { key: 'agency', name: '代理渠道', count: 9, expectedAmountWan: 12.2 },
  ],
  stages: [
    { key: 'pending', name: '待配置', count: 6, tone: 'neutral' },
    { key: 'configuring', name: '配置中', count: 12, tone: 'info' },
    { key: 'trial', name: '试用中', count: 22, tone: 'primary' },
    { key: 'review', name: '待复盘', count: 7, tone: 'warn' },
    { key: 'overdue', name: '已超期', count: 5, tone: 'risk' },
  ],
  riskAlerts: [
    { key: 'near-deadline', text: '4个客户将在3天内超过试用周期', tone: 'warn' },
    { key: 'unassigned', text: '2个客户尚未配置负责人', tone: 'risk' },
    { key: 'missing-amount', text: '4个客户预计成交金额未填写', tone: 'neutral' },
  ],
  conversion: {
    channel: [
      { key: 'east', channelKey: 'east', name: '华东', currentTrials: 16, cohortStarted: 11, closedDeals: 5, expectedAmountWan: 21.8, status: '正常', statusTone: 'good' },
      { key: 'south', channelKey: 'south', name: '华南', currentTrials: 13, cohortStarted: 9, closedDeals: 3, expectedAmountWan: 18.2, status: '关注', statusTone: 'warn' },
      { key: 'direct', channelKey: 'direct', name: '线上直营', currentTrials: 14, cohortStarted: 7, closedDeals: 3, expectedAmountWan: 16.4, status: '正常', statusTone: 'good' },
      { key: 'agency', channelKey: 'agency', name: '代理渠道', currentTrials: 9, cohortStarted: 5, closedDeals: 1, expectedAmountWan: 12.2, status: '风险', statusTone: 'risk' },
    ],
    team: [
      { key: 'east-team', channelKey: 'east', name: '华东战区', currentTrials: 14, cohortStarted: 10, closedDeals: 5, expectedAmountWan: 19.5, status: '正常', statusTone: 'good' },
      { key: 'south-team', channelKey: 'south', name: '华南战区', currentTrials: 12, cohortStarted: 8, closedDeals: 2, expectedAmountWan: 17, status: '关注', statusTone: 'warn' },
      { key: 'direct-team', channelKey: 'direct', name: '线上销售部', currentTrials: 17, cohortStarted: 9, closedDeals: 4, expectedAmountWan: 20.5, status: '正常', statusTone: 'good' },
      { key: 'agency-team', channelKey: 'agency', name: '代理渠道部', currentTrials: 9, cohortStarted: 5, closedDeals: 1, expectedAmountWan: 11.6, status: '风险', statusTone: 'risk' },
    ],
  },
  staffLoads: [
    { key: 'chen-chen', name: '陈晨', currentAssigned: 10, monthlyTotal: 16, converted: 2, overdue: 1, expectedAmountWan: 13.8 },
    { key: 'zhao-qing', name: '赵晴', currentAssigned: 12, monthlyTotal: 18, converted: 2, overdue: 1, expectedAmountWan: 15.6 },
    { key: 'han-yu', name: '韩宇', currentAssigned: 13, monthlyTotal: 19, converted: 2, overdue: 2, expectedAmountWan: 16.9 },
    { key: 'zhou-ning', name: '周宁', currentAssigned: 8, monthlyTotal: 14, converted: 2, overdue: 0, expectedAmountWan: 10.8 },
    { key: 'qin-jia', name: '秦佳', currentAssigned: 7, monthlyTotal: 12, converted: 1, overdue: 1, expectedAmountWan: 8.7 },
  ],
  unassignedOwners: 2,
};

/**
 * @param {PresaleTrialSnapshotSource} source 完整月份源数据。
 * @param {PresaleTrialComparisonMetrics} previousMetrics 上月比较基线。
 * @returns {PresaleTrialSnapshot}
 */
function buildSnapshot(source, previousMetrics) {
  const kpis = {
    ...source.kpis,
    conversionRate: calculateConversionRate(
      source.kpis.convertedCustomers,
      source.kpis.conversionCohort,
    ),
  };
  return {
    monthKey: source.monthKey,
    monthLabel: source.monthLabel,
    previousMonthLabel: source.previousMonthLabel,
    updatedAt: source.updatedAt,
    kpis,
    distribution: source.distribution,
    stages: source.stages,
    riskAlerts: source.riskAlerts,
    comparisonRows: buildComparisonRows(toComparisonMetrics(kpis), previousMetrics),
    conversion: {
      channel: buildConversionRows(source.conversion.channel),
      team: buildConversionRows(source.conversion.team),
    },
    staffLoads: buildStaffLoads(source.staffLoads, DELIVERY_CAPACITY_LIMIT),
    unassignedOwners: source.unassignedOwners,
    capacityLimit: DELIVERY_CAPACITY_LIMIT,
  };
}

const juneSnapshot = buildSnapshot(JUNE_SOURCE, MAY_COMPARISON_BASELINE);

/** @type {Record<string, PresaleTrialSnapshot>} */
const SNAPSHOTS = {
  '2026-07': buildSnapshot(JULY_SOURCE, toComparisonMetrics(juneSnapshot.kpis)),
  '2026-06': juneSnapshot,
};

/**
 * @param {PresaleTrialSnapshot} snapshot 源快照。
 * @returns {PresaleTrialSnapshot}
 */
function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
}

/**
 * 异步加载指定月份的售前试用交付快照。当前实现读取集中演示数据，接口形态可直接替换为后端请求。
 * @param {string} [monthKey=DEFAULT_PRESALE_TRIAL_MONTH] 月份键，格式为 YYYY-MM。
 * @returns {Promise<PresaleTrialSnapshot | null>}
 */
export async function loadPresaleTrialDashboard(monthKey = DEFAULT_PRESALE_TRIAL_MONTH) {
  await Promise.resolve();
  const snapshot = SNAPSHOTS[monthKey];
  return snapshot ? cloneSnapshot(snapshot) : null;
}
