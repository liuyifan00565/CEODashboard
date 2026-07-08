/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 目标维护导入说明同步为“启用销售且有部门”，停用人员无法导入或维护目标。
*/
/*
 更新时间: 2026-07-08
 更新内容: target-maintenance 导入新增「所属组织」必填列（department_name）。
          目标维护口径收紧为「人员必须是销售(is_sales=1)且有部门」，
          导入时校验 Excel 写的部门与人员实际部门一致，无部门/非销售/部门不符一律拒绝。
*/
/*
 更新时间: 2026-07-07 10:00:00 CST
 更新内容: 新增数据维护 Excel 导入配置注册表，作为"导入什么表/哪些列/怎么校验"的单一数据源，
          前端与后端共享，业务确认后只改本文件即可调整导入口径。
*/

/**
 * 数据维护 Excel 导入配置注册表
 * ==========================================================================
 * 这是整个导入流水线里【唯一会被业务需求改动】的文件。
 * 导入弹窗、前端解析逻辑、后端空跑校验全部读这份配置，没有任何地方硬编码列名。
 *
 * 下方四个维护页各放了一条【占位】条目，列定义参照
 * docs/superpowers/specs/2026-07-02-maintenance-pages-content-design.md 里的 MySQL 字段。
 * 等业务确认真实要导入的表结构后，只需改本文件即可，不必动 excelImport.js / 弹窗 / 后端。
 *
 * 【如何新增一种导入表】
 *   1. 复制一条 pageKey 条目，pageKey 与 MaintenancePage.jsx 的 MAINTENANCE_TITLE_TEXT 键一致。
 *   2. 修改 columns：field 是落库字段名（snake_case），header 是模板表头文案，
 *      aliases 是 Excel 里可能出现的其它表头写法（用于自动匹配），required 是否必填，
 *      type 取 string|number|boolean|month|date，可选 min/max/description。
 *   3. uniqueKey 填去重判定字段组合（同一组键重复视为重复行）。
 *   4. 如某维护页同时要导入两张表（例如成本页的渠道成本 + 人力成本），
 *      可把第二张表加成一个新 pageKey，并在 MaintenanceToolbar 里挂一个独立按钮。
 * ==========================================================================
 */

/**
 * @typedef {Object} ImportColumn
 * @property {string} field        落库字段名（snake_case）
 * @property {string} header       模板表头文案
 * @property {string[]} [aliases]  Excel 中可能出现的其它表头写法
 * @property {boolean} [required]  是否必填
 * @property {'string'|'number'|'boolean'|'month'|'date'} [type] 字段类型
 * @property {number} [min]        number 类型最小值
 * @property {number} [max]        number 类型最大值
 * @property {string} [description]字段说明（写库含义）
 */

/**
 * @typedef {Object} ImportConfig
 * @property {string} pageKey      维护页键，与 MaintenancePage.jsx 一致
 * @property {string} label        导入弹窗标题
 * @property {string|null} sheetName 指定 sheet 名；null = 取第一个 sheet
 * @property {ImportColumn[]} columns 列定义
 * @property {string[]} uniqueKey  去重字段组合
 * @property {string} [notes]      备注（待业务确认事项）
 */

/** @type {Record<string, ImportConfig>} */
export const MAINTENANCE_IMPORT_CONFIG = {
  'target-maintenance': {
    pageKey: 'target-maintenance',
    label: '目标维护导入',
    sheetName: null,
    columns: [
      { field: 'staff_name', header: '人员名称', aliases: ['销售', '人员', '销售人员'], required: true, type: 'string', description: '对应 dim_staff.staff_name' },
      // 更新时间: 2026-07-08 — 新增「所属组织」必填列：目标维护要求人员必须在销售组织里，
      // 导入时后端校验该人确实属于此部门（直系部门名一致），无部门/非销售/部门不符一律拒绝。
      { field: 'department_name', header: '所属组织', aliases: ['组织', '部门', 'BI组织'], required: true, type: 'string', description: '对应 dim_department.department_name；必须与该人员实际所属部门一致，否则拒绝。人员须为启用销售(is_sales=1/is_enabled=1)且有部门才能导入目标。' },
      { field: 'target_month', header: '目标月份', aliases: ['月份'], required: true, type: 'month', description: 'YYYY-MM，对应 biz_target_monthly.target_month' },
      { field: 'target_amount_yuan', header: '回款目标(万)', aliases: ['回款目标', '目标金额', '回款目标万', '回款目标(元)'], required: true, type: 'number', min: 0, description: '维护页以万为单位录入，写库时×10000转元，对应 biz_target_monthly.target_amount_yuan' },
      { field: 'target_opening_count', header: '开户目标(个)', aliases: ['开户目标', '开户目标个'], required: false, type: 'number', min: 0, description: '对应 biz_target_monthly.target_opening_count' },
      { field: 'target_order_count', header: '订单目标(单)', aliases: ['订单目标', '订单目标单'], required: false, type: 'number', min: 0, description: '对应 biz_target_monthly.target_order_count' },
    ],
    uniqueKey: ['staff_name', 'target_month'],
    notes: '口径：目标维护只认 is_sales=1、is_enabled=1 且有部门的人员。导入时「所属组织」必须与人员实际部门一致；无部门/非销售/停用/部门不符的行拒绝。旧模板（无「所属组织」列）会被拒，需重新下载模板。',
  },

  'cost-maintenance': {
    pageKey: 'cost-maintenance',
    label: '成本维护导入',
    sheetName: null,
    columns: [
      { field: 'channel_name', header: '渠道名称', aliases: ['渠道'], required: true, type: 'string', description: '对应 dim_channel.channel_name' },
      { field: 'cost_month', header: '成本月份', aliases: ['月份'], required: true, type: 'month', description: 'YYYY-MM，对应 biz_channel_cost_monthly.cost_month' },
      { field: 'investment_amount_yuan', header: '投入成本(万)', aliases: ['投入成本', '成本', '投放成本', '投入成本(元)'], required: true, type: 'number', min: 0, description: '维护页以万为单位录入，写库时×10000转元，对应 biz_channel_cost_monthly.investment_amount_yuan' },
    ],
    uniqueKey: ['channel_name', 'cost_month'],
    notes: '待业务确认：人力成本 biz_labor_cost_monthly 需单独导入时，在此新增一条 pageKey（如 labor-cost-maintenance）并挂独立按钮。',
  },

  'org-maintenance': {
    pageKey: 'org-maintenance',
    label: '组织维护导入',
    sheetName: null,
    columns: [
      { field: 'staff_name', header: '人员名称', aliases: ['人员', '姓名'], required: true, type: 'string', description: '对应 dim_staff.staff_name' },
      { field: 'department_name', header: '所属组织', aliases: ['组织', '部门', 'BI组织'], required: true, type: 'string', description: '对应 dim_department.department_name' },
      { field: 'is_sales', header: '是否销售', aliases: ['销售'], required: false, type: 'boolean', description: '对应 dim_staff.is_sales' },
      { field: 'is_enabled', header: '是否启用', aliases: ['启用'], required: false, type: 'boolean', description: '对应 dim_staff.is_enabled' },
      { field: 'external_bi_user_id', header: '外部BI ID', aliases: ['卫瓴ID', 'BI ID', '外部ID'], required: false, type: 'string', description: '对应 dim_staff.external_bi_user_id' },
    ],
    uniqueKey: ['staff_name'],
    notes: '待业务确认：组织树 dim_department 是否需要单独导入（可新增 department-maintenance 条目）。',
  },

  'channel-maintenance': {
    pageKey: 'channel-maintenance',
    label: '渠道维护导入',
    sheetName: null,
    columns: [
      { field: 'source_code', header: '来源编码', aliases: ['编码'], required: true, type: 'string', description: '对应 dim_channel_source.source_code' },
      { field: 'source_name', header: '来源名称', aliases: ['来源'], required: true, type: 'string', description: '对应 dim_channel_source.source_name' },
      { field: 'channel_name', header: '归属渠道大类', aliases: ['渠道', '渠道大类', '归属渠道'], required: true, type: 'string', description: '对应 dim_channel.channel_name' },
      { field: 'is_excluded', header: '是否排除', aliases: ['排除'], required: false, type: 'boolean', description: '对应 dim_channel_source.is_excluded' },
    ],
    uniqueKey: ['source_code'],
    notes: '待业务确认：dim_channel_source 当前无 is_enabled 字段，是否参与统计以"是否排除"为准。',
  },
};

/** 按 pageKey 取导入配置；未配置时返回 null。 */
export function getImportConfig(pageKey) {
  return MAINTENANCE_IMPORT_CONFIG[pageKey] ?? null;
}
