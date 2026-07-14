/*
 更新时间: 2026-07-14 11:40:00 CST
 更新内容: 数据维护新增只读数据更新看板，支持小时级自动刷新、顶部多选状态筛选和数据拉取时效展示。
*/
/*
 Update time: 2026-07-13 18:53:01 CST
 Update content: Cost maintenance restores a readonly sales-labor rollup and an independently editable marketing-labor matrix.
*/
/*
 Update time: 2026-07-13 16:48:56 CST
 Update content: 每个渠道月份可分别填写运营成本与人力成本，移除无渠道归属的独立人力成本表。
*/
/*
 Update time: 2026-07-13 10:07:26 CST
 Update content: 成本维护移除赢单金额展示，仅保留成本、成交、退款和 ROI。
*/
/*
 Update time: 2026-07-13 00:00:00 CST
 Update content: Switch target summary readonly values back to compact text rows.
*/
/*
 Update time: 2026-07-13 00:00:00 CST
 Update content: Split readonly target values into number and unit pieces to match editable input formatting.
*/
/*
 Update time: 2026-07-13 00:00:00 CST
 Update content: Wrap target maintenance progress lines so progress bars align at the bottom of month cells.
*/
/*
 Update time: 2026-07-13 00:00:00 CST
 Update content: Target maintenance month cells show editable target and actual completion amount fields.
 */
/*
 Update time: 2026-07-10 18:19:58 CST
 Update content: Snap target maintenance current-month auto alignment to full period columns so the table does not open on a clipped half column.
*/
/*
 Update time: 2026-07-09 16:47:39 CST
 Update content: 成本维护的成本与退款输入框增加“万”单位提示，保持页面录入单位清晰。
*/
/*
 Update time: 2026-07-09 14:51:22 CST
 Update content: 目标维护改为部门级:右侧表格只显示部门行(隐藏人员明细行),部门行(除"所有组织"合计行外)
   变为可编辑目标,draft 键改用 summary-<deptId>;左侧组织架构人数改为部门计数。配合后端 saveTarget/
   readTarget 与首页口径一并改为部门级(staff_id IS NULL)。
*/
/*
 Update time: 2026-07-09 14:29:12 CST
 Update content: 修复成本/组织/渠道维护页"下载模板"按钮点击无响应。工具栏按钮以 onDownloadTemplate
   直接作 onClick 时,React 会把事件对象当第一个参数传入,覆盖了 handleDownloadTemplate 的默认参数
   pageKey=activePage,导致 getImportConfig 拿事件对象当 key 查不到配置、静默跳过不下载。
   handler 改为显式判断:仅当传入字符串 pageKey 时才采用,否则回退 activePage,三个维护页一并修复。
*/
/*
 Update time: 2026-07-09 16:20:00 CST
 Update content: Cost maintenance table adds editable refund amount for each channel and month.
*/
/*
 更新时间: 2026-07-08 19:12:00 CST
 更新内容: 成本维护与渠道维护删除按钮统一改为二级确认；渠道维护渠道大类支持删除并提交软删除。
*/
/*
 更新时间: 2026-07-08 18:58:00 CST
 更新内容: 成本维护渠道树新增删除按钮，未保存渠道直接移除，已落库渠道保存时提交删除列表。
*/
/*
 更新时间: 2026-07-08 18:45:00 CST
 更新内容: 成本维护左侧渠道树与顶部工具栏新增“新增渠道”入口，新增渠道可编辑名称并随成本保存落库。
*/
/*
 更新时间: 2026-07-08 14:11:07 CST
 更新内容: 维护页保存按钮改为仅有未保存修改时启用，移除页内返回入口和无实际变更按钮；
          渠道新增大类支持保存前改名，新增来源默认归入当前选中大类。
*/
/*
 更新时间: 2026-07-08 12:09:25 CST
 更新内容: 让目标维护页左侧组织架构点击后同步过滤右侧年度目标表，避免只切换选中态但数据范围不变。
*/
/*
 更新时间: 2026-07-08 11:45:00 CST
 更新内容: 维护页保存 payload 补齐 departments/groups；新增组织/渠道大类可落库并映射给人员/来源；
          渠道来源“启用/排除”改为互斥状态，保存时真实写入 is_excluded。
*/
/*
 更新时间: 2026-07-08 11:28:12 CST
 更新内容: 将组织维护、渠道维护表格内的原生下拉统一替换为 GlassSelect，并让组织归属选择改为受控本地状态。
*/
/*
 更新时间: 2026-07-07 14:30:00 CST
 更新内容: 四个维护子页改为 forwardRef + useImperativeHandle 暴露 collect()，用 draftRef/受控 state
          收集页内编辑；父 MaintenancePage 的"保存"按钮改为 POST /api/maintenance/save 写库后回拉，
          删除静态"页内未接库"提示，saving 期间遮罩禁编辑。页内编辑与 Excel 导入同样反映到数据库。
*/
/*
 更新时间: 2026-07-07 11:00:00 CST
 更新内容: 四个维护子页改为从真实 MySQL（GET /api/maintenance/data）读取数据替换 mock；
          year 状态上提、按 dataVersion 重挂载、导入写库后重拉；保存按钮诚实标注"页内未接库"。
*/
/*
 更新时间: 2026-07-07 10:00:00 CST
 更新内容: 数据维护四个子页接入 Excel 导入与下载模板按钮，弹出配置驱动的导入弹窗（解析/列映射/预览/空跑校验）。
*/
/*
 更新时间: 2026-07-03 17:20:28 CST
 更新内容: 强化目标维护可填单元格状态标记，方便区分可填写目标和只读汇总目标。
*/
/*
 更新时间: 2026-07-03 17:05:00 CST
 更新内容: 目标维护选中行新增左右横向滚动按钮，便于不用底部滚动条即可移动月份表格。
*/
/*
 Update time: 2026-07-03 11:24:05 CST
 Update content: Freeze target maintenance department/person names outside the horizontal period scroller to prevent glass bleed-through.
*/
/*
 Update time: 2026-07-03 11:19:40 CST
 Update content: Unify all data maintenance side navigation with the organization tree style.
*/
/*
 Update time: 2026-07-03 11:12:08 CST
 Update content: Separate editable target maintenance inputs from readonly target summary values.
*/
/*
 Update time: 2026-07-03 11:11:56 CST
 Update content: Add selectable maintenance table rows with persistent purple clicked-row highlights.
*/
/*
 Update time: 2026-07-03 11:02:59 CST
 Update content: Collapse target maintenance completed amount and completion percent into one compact progress line.
*/
/*
 Update time: 2026-07-03 10:54:19 CST
 Update content: Use one wide scrolling target maintenance table and remove pinned annual/current-quarter columns.
*/
/*
 Update time: 2026-07-03 10:29:25 CST
 Update content: Correct target maintenance current-month alignment to use the scroll pane coordinate system.
*/
/*
 Update time: 2026-07-03 10:22:28 CST
 Update content: Split target maintenance fixed annual/current-quarter summary columns from the horizontal month scroll pane and align the pane to the current month by default.
*/
/*
 更新时间: 2026-07-03 10:04:51 CST
 更新内容: 为维护页年度下拉框增加紧凑宽度专属类。
*/
/*
 Update time: 2026-07-03 10:31:00 CST
 Update content: Pin target maintenance annual and current-quarter columns based on the dashboard business month.
*/
/*
 更新时间: 2026-07-02 19:13:36 CST
 更新内容: 去除内容区分隔点，标题分隔点保持原样，并将维护页进度百分比单独换行展示。
*/
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  META,
  MAINTENANCE_PERIOD_COLUMNS,
  getMaintenancePageMeta,
} from '../data/mock';
import { fetchMaintenanceData } from '../data/maintenanceLiveData.js';
import './MaintenancePage.css';
import { getImportConfig } from '../lib/maintenanceImportConfig.js';
import { downloadTemplate } from '../lib/excelImport.js';
import {
  buildTargetSaveRows,
  buildCostSaveRows,
  buildOrgSaveRows,
  buildDepartmentSaveRows,
  buildChannelSaveRows,
  buildChannelGroupSaveRows,
} from '../lib/maintenanceSaveBuilders.js';
import MaintenanceImportDialog from './MaintenanceImportDialog.jsx';
import GlassSelect from './GlassSelect.jsx';

const YEARS = [2024, 2025, 2026, 2027];
const YEAR_OPTIONS = YEARS.map((item) => ({ value: String(item), label: String(item) }));

const EMPTY_ARRAY = [];
const COST_MONTH_KEYS = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12'];
const COST_QUARTER_MONTHS = {
  q1: ['m01', 'm02', 'm03'],
  q2: ['m04', 'm05', 'm06'],
  q3: ['m07', 'm08', 'm09'],
  q4: ['m10', 'm11', 'm12'],
};

function buildDepartmentLaborPeriods(monthCosts) {
  const periods = {};
  COST_MONTH_KEYS.forEach((key) => {
    periods[key] = { cost: Number(monthCosts?.[key]) || 0 };
  });
  Object.entries(COST_QUARTER_MONTHS).forEach(([quarter, months]) => {
    periods[quarter] = { cost: months.reduce((sum, key) => sum + periods[key].cost, 0) };
  });
  periods.year = { cost: COST_MONTH_KEYS.reduce((sum, key) => sum + periods[key].cost, 0) };
  return periods;
}

function makeSelectOptions(items, emptyLabel = '') {
  const choices = (items ?? []).map((item) => ({
    value: String(item.id ?? ''),
    label: item.name ?? String(item.id ?? ''),
  }));
  return emptyLabel ? [{ value: '', label: emptyLabel }, ...choices] : choices;
}

const MAINTENANCE_TITLE_TEXT = {
  'update-monitor-maintenance': '数据更新看板',
  'target-maintenance': '目标维护',
  'cost-maintenance': '成本维护',
  'org-maintenance': '组织维护',
  'channel-maintenance': '渠道维护',
};
const READONLY_MAINTENANCE_PAGES = new Set(['update-monitor-maintenance']);
const UPDATE_MONITOR_REFRESH_MS = 60 * 60 * 1000;

// PAGE_RENDERERS 在文件底部（四个 forwardRef 子页定义之后）声明，避免 const 的 TDZ。

const TARGET_PERIOD_COLUMNS = buildTargetPeriodColumns(MAINTENANCE_PERIOD_COLUMNS, META.monthLabel);

function getMaintenanceCurrentMonth(monthLabel = '') {
  const match = String(monthLabel).match(/(\d{1,2})\s*月/);
  const parsedMonth = match ? Number(match[1]) : 0;
  if (parsedMonth >= 1 && parsedMonth <= 12) return parsedMonth;
  return new Date().getMonth() + 1;
}

function buildTargetPeriodColumns(periodColumns, monthLabel = '') {
  const currentMonth = getMaintenanceCurrentMonth(monthLabel);
  return periodColumns.map((column) => ({
    ...column,
    targetCurrentMonth: column.month === currentMonth,
  }));
}

function formatWan(value) {
  return `${Number(value || 0).toLocaleString('zh-CN')} 万`;
}

function formatWanCompact(value) {
  return formatWan(value).replace(/\s+/g, '');
}

function formatPct(value) {
  return `${Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 1 })}%`;
}

function formatRoi(value) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function nowLabel() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function handleSelectableRowKeyDown(event, rowKey, onSelect) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onSelect(rowKey);
}

function getSelectableRowProps(rowKey, selectedRowKey, onSelect, className = '') {
  const selected = selectedRowKey === rowKey;
  return {
    className: `${className}${selected ? ' mnt-row--selected' : ''}`.trim(),
    'data-maintenance-row-selected': selected ? 'true' : undefined,
    tabIndex: 0,
    onClick: () => onSelect(rowKey),
    onKeyDown: (event) => handleSelectableRowKeyDown(event, rowKey, onSelect),
  };
}

function getMaintenanceNavMeta(item, countText) {
  if (item.meta) return item.meta;
  if (item.kind) return item.kind;
  if (typeof item.userCount === 'number') return `${item.userCount} 人`;
  if (typeof item.count === 'number') return `${item.count} ${item.countText ?? countText}`;
  return '';
}

function buildMaintenanceNavTree(items, { rootId = 'all', countText = '项' } = {}) {
  const nodes = items.map((item) => ({
    id: item.id,
    name: item.name,
    parentId: item.parentId || '',
    meta: getMaintenanceNavMeta(item, countText),
    disabled: item.enabled === false,
    children: [],
  }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const roots = [];

  nodes.forEach((node) => {
    if (node.parentId && nodeById.has(node.parentId)) {
      nodeById.get(node.parentId).children.push(node);
      return;
    }
    roots.push(node);
  });

  const root = nodeById.get(rootId);
  return root ? [root] : roots;
}

function getDescendantIds(items, selectedId) {
  const ids = new Set([selectedId]);
  let changed = true;

  while (changed) {
    changed = false;
    items.forEach((item) => {
      if (!ids.has(item.id) && ids.has(item.parentId)) {
        ids.add(item.id);
        changed = true;
      }
    });
  }

  return ids;
}

function collectNestedNodeIds(node, ids) {
  if (!node) return;
  ids.add(String(node.id));
  node.children?.forEach((child) => collectNestedNodeIds(child, ids));
}

function findNestedNodeById(node, selectedId) {
  if (!node) return null;
  if (String(node.id) === String(selectedId)) return node;

  for (const child of node.children ?? []) {
    const found = findNestedNodeById(child, selectedId);
    if (found) return found;
  }

  return null;
}

function getNestedDescendantIds(rootNode, selectedId) {
  const selectedNode = findNestedNodeById(rootNode, selectedId);
  const ids = new Set();
  collectNestedNodeIds(selectedNode, ids);
  return ids;
}

function targetRowBelongsToOrg(row, selectedOrgIds) {
  if (row.type === 'department') {
    const rowId = String(row.id ?? '');
    const summaryPrefix = 'summary-';
    return selectedOrgIds.has(rowId)
      || (rowId.startsWith(summaryPrefix) && selectedOrgIds.has(rowId.slice(summaryPrefix.length)));
  }

  return selectedOrgIds.has(String(row.deptId ?? ''));
}

function MaintenanceToolbarSurface({ className = '', children }) {
  return (
    <div className={`mnt-toolbar-surface ${className}`.trim()}>{children}</div>
  );
}

function MaintenanceSurface({ className = '', children }) {
  return (
    <div className={`mnt-surface-shell ${className}`.trim()}>
      <div className="mnt-surface">{children}</div>
    </div>
  );
}

function SaveBadge({ status }) {
  const dirty = status === '有未保存修改';
  return <span className={`mnt-save-badge${dirty ? ' mnt-save-badge--dirty' : ''}`}>{status}</span>;
}

function MaintenanceToolbar({ activePage, status, year, saving, canSave, showWriteActions = true, onYearChange, onSave, onImport, onDownloadTemplate, onPageAction, onOpenTemplateDialog }) {
  const meta = getMaintenancePageMeta(activePage);
  const title = MAINTENANCE_TITLE_TEXT[activePage] ?? meta.title;

  function handleYearChange(nextYear) {
    onYearChange?.(nextYear);
  }

  const actions = {
    'target-maintenance': (
      <>
        <GlassSelect className="mnt-control mnt-year-control" value={year} onChange={handleYearChange} aria-label="目标年份" disabled={saving} options={YEAR_OPTIONS} />
        <button className="mnt-btn" type="button" onClick={onOpenTemplateDialog} disabled={saving}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onImport} disabled={saving}>Excel导入</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave} disabled={saving || !canSave}>{saving ? '保存中…' : '保存目标'}</button>
      </>
    ),
    'cost-maintenance': (
      <>
        <GlassSelect className="mnt-control mnt-year-control" value={year} onChange={handleYearChange} aria-label="成本维护年份" disabled={saving} options={YEAR_OPTIONS} />
        <button className="mnt-btn" type="button" onClick={onDownloadTemplate} disabled={saving}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onImport} disabled={saving}>Excel导入</button>
        <button className="mnt-btn" type="button" onClick={() => onPageAction('addCostChannel')} disabled={saving}>新增渠道</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave} disabled={saving || !canSave}>{saving ? '保存中…' : '保存成本'}</button>
      </>
    ),
    'org-maintenance': (
      <>
        <button className="mnt-btn" type="button" onClick={onDownloadTemplate} disabled={saving}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onImport} disabled={saving}>Excel导入</button>
        <button className="mnt-btn" type="button" onClick={() => onPageAction('addDepartment')} disabled={saving}>新增组织</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave} disabled={saving || !canSave}>{saving ? '保存中…' : '保存组织'}</button>
      </>
    ),
    'channel-maintenance': (
      <>
        <button className="mnt-btn" type="button" onClick={onDownloadTemplate} disabled={saving}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onImport} disabled={saving}>Excel导入</button>
        <button className="mnt-btn" type="button" onClick={() => onPageAction('addChannelGroup')} disabled={saving}>新增大类</button>
        <button className="mnt-btn" type="button" onClick={() => onPageAction('addSource')} disabled={saving}>新增来源</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave} disabled={saving || !canSave}>{saving ? '保存中…' : '保存渠道'}</button>
      </>
    ),
  };
  const readonlyActions = (
    <>
      <GlassSelect className="mnt-control mnt-year-control" value={year} onChange={handleYearChange} aria-label="看板年份" disabled={saving} options={YEAR_OPTIONS} />
      <span className="mnt-readonly-note">按业务日期自动检查</span>
    </>
  );

  return (
    <MaintenanceToolbarSurface className="mnt-toolbar-glass">
      <section className="mnt-toolbar" aria-label={`${title}工具栏`}>
        <div className="mnt-title-block">
          <h2>{title}<span className="mnt-title-scope"> · {meta.scope}</span></h2>
        </div>
        <div className="mnt-actions">
          {showWriteActions ? (actions[activePage] ?? actions['target-maintenance']) : readonlyActions}
          {showWriteActions ? <SaveBadge status={status} /> : <span className="mnt-save-badge">只读</span>}
          {showWriteActions
            ? (saving
                ? <span className="mnt-saving-hint">正在写入数据库…</span>
                : <span className="mnt-save-hint" title="页内编辑保存后写入数据库；新增组织/大类仅本会话有效">页内可保存</span>)
            : <span className="mnt-save-hint">不写入数据库</span>}
        </div>
      </section>
    </MaintenanceToolbarSurface>
  );
}

function TemplateDownloadDialog({ configs, onClose, onDownloadTemplate }) {
  return (
    <div className="mnt-template-dialog" role="dialog" aria-label="选择下载模板">
      <button className="mnt-template-dialog__mask" type="button" aria-label="关闭模板选择" onClick={onClose} />
      <div className="mnt-template-dialog__card">
        <header>
          <h3>选择下载模板</h3>
          <div className="mnt-template-dialog__head-actions">
            <button className="mnt-btn" type="button" onClick={onClose}>关闭</button>
          </div>
        </header>
        <div className="mnt-template-dialog__options">
          {configs.map((config) => (
            <section className="mnt-template-option-card" key={config.pageKey}>
              <div className="mnt-template-option-card__head">
                <div>
                  <strong>{config.pageKey === 'target-maintenance' ? '目标模板' : '实际完成模板'}</strong>
                  <span>{config.label}</span>
                </div>
                <button className="mnt-btn mnt-btn--primary" type="button" onClick={() => onDownloadTemplate(config.pageKey)}>下载此模板</button>
              </div>
              <table className="mnt-template-preview">
                <thead>
                  <tr>{config.columns.map((column) => <th key={column.field}>{column.header}</th>)}</tr>
                </thead>
                <tbody>
                  <tr>{config.columns.map((column) => <td key={column.field}>{column.required ? '必填' : '可选'}</td>)}</tr>
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, meta, className = '', children }) {
  return (
    <MaintenanceSurface className={`mnt-panel-glass ${className}`.trim()}>
      <section className="mnt-panel">
        <div className="mnt-panel__head">
          <h3>{title}</h3>
          {meta && <span>{meta}</span>}
        </div>
        {children}
      </section>
    </MaintenanceSurface>
  );
}

function MatrixShell({ className = '', children }) {
  return <div className={`mnt-matrix-wrap ${className}`.trim()}>{children}</div>;
}

function formatMonitorCheckedAt(value) {
  if (!value) return '未检查';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatLagDays(value) {
  if (value == null) return '—';
  const days = Number(value);
  if (!Number.isFinite(days)) return '—';
  if (days <= 0) return '0 天';
  return `${days} 天`;
}

const UPDATE_MONITOR_SUMMARY = [
  { key: 'increase', label: '增加' },
  { key: 'stale', label: '延迟' },
  { key: 'empty', label: '无数据' },
  { key: 'error', label: '异常' },
];
const UPDATE_MONITOR_STATUS_CLASS = {
  updated: 'mnt-update-status--updated',
  current_month: 'mnt-update-status--current_month',
  stale: 'mnt-update-status--stale',
  empty: 'mnt-update-status--empty',
  error: 'mnt-update-status--error',
};

function getUpdateMonitorSummaryValue(summary, key) {
  if (key === 'increase') {
    return Number(summary.updated || 0) + Number(summary.currentMonth || 0);
  }
  return Number(summary[key] || 0);
}

function isUpdateMonitorGroupInFilter(group, key) {
  if (key === 'increase') return group.status === 'updated' || group.status === 'current_month';
  return group.status === key;
}

function formatUpdateMonitorAge(value, nowMs = Date.now()) {
  if (!value) return '未拉取';
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '未知';
  const diffMs = Math.max(0, nowMs - time);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

const UpdateMonitorMaintenancePage = forwardRef(function UpdateMonitorMaintenancePage({ monitor, lastLoadedAt }, ref) {
  const groups = monitor?.groups ?? EMPTY_ARRAY;
  const summary = monitor?.summary ?? {};
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [relativeNow, setRelativeNow] = useState(() => Date.now());
  const visibleGroups = useMemo(() => groups.filter((group) => {
    if (!selectedFilters.length) return true;
    return selectedFilters.some((key) => isUpdateMonitorGroupInFilter(group, key));
  }), [groups, selectedFilters]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setRelativeNow(Date.now()), 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useImperativeHandle(ref, () => ({
    collect: () => ({ rows: [], laborRows: [], departments: [], groups: [], deletions: [] }),
  }), []);

  function toggleStatusFilter(key) {
    setSelectedFilters((current) => (
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    ));
  }

  return (
    <section className="mnt-update-monitor">
      <Panel
        title="数据组更新状态"
        meta={`检查时间 ${formatMonitorCheckedAt(monitor?.checkedAt)} · 当前日期 ${monitor?.today ?? '—'} · 数据拉取 ${formatUpdateMonitorAge(lastLoadedAt || monitor?.checkedAt, relativeNow)}`}
        className="mnt-main-panel"
      >
        <div className="mnt-update-summary" aria-label="数据更新汇总">
          {UPDATE_MONITOR_SUMMARY.map((item) => {
            const selected = selectedFilters.includes(item.key);
            return (
              <label
                className={`mnt-update-summary-card mnt-update-summary-card--${item.key}${selected ? ' mnt-update-summary-card--selected' : ''}`}
                key={item.key}
              >
                <span className="mnt-update-summary-card-head">
                  <span>{item.label}</span>
                  <input
                    className="mnt-update-summary-check"
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleStatusFilter(item.key)}
                    aria-label={`筛选${item.label}`}
                  />
                </span>
                <strong>{getUpdateMonitorSummaryValue(summary, item.key)}</strong>
              </label>
            );
          })}
        </div>
        <MatrixShell className="mnt-update-table-wrap">
          <table className="mnt-user-table mnt-update-table">
            <thead>
              <tr>
                <th>数据组</th>
                <th>状态</th>
                <th>最新日期/月</th>
                <th>记录数</th>
                <th>落后</th>
                <th>数据表</th>
              </tr>
            </thead>
            <tbody>
              {visibleGroups.map((group) => (
                <tr key={group.key} className={group.status === 'error' ? 'mnt-row--muted' : ''}>
                  <td className="mnt-name-cell mnt-update-name-cell">
                    <strong>{group.name}</strong>
                    <span className="mnt-update-name-meta">{group.type === 'monthly' ? '月度数据' : '日级数据'}</span>
                  </td>
                  <td>
                    <span className={`mnt-update-status ${UPDATE_MONITOR_STATUS_CLASS[group.status] ?? UPDATE_MONITOR_STATUS_CLASS.empty}`}>
                      {group.statusLabel}
                    </span>
                  </td>
                  <td>{group.latestValue || '—'}</td>
                  <td>{Number(group.rowCount || 0).toLocaleString('zh-CN')}</td>
                  <td>{formatLagDays(group.lagDays)}</td>
                  <td><code>{group.table}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </MatrixShell>
      </Panel>
    </section>
  );
});

function MaintenanceSideNav({ nodes, activeId, onSelect, renderAction }) {
  return (
    <nav className="mnt-side-nav" aria-label="维护侧栏导航">
      <ul>
        {nodes.map((node) => (
          <MaintenanceSideNavNode key={node.id} node={node} activeId={activeId} onSelect={onSelect} renderAction={renderAction} />
        ))}
      </ul>
    </nav>
  );
}

function MaintenanceSideNavNode({ node, activeId, onSelect, renderAction }) {
  const active = node.id === activeId;
  const action = renderAction?.(node);
  return (
    <li>
      <div className="mnt-side-nav-row">
        <button
          type="button"
          className={`mnt-side-nav__button${active ? ' mnt-side-nav__button--active' : ''}${node.disabled ? ' mnt-side-nav__button--muted' : ''}`}
          onClick={() => onSelect(node.id)}
        >
          <span>{node.name}</span>
          {node.meta && <small>{node.meta}</small>}
        </button>
        {action}
      </div>
      {node.children?.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <MaintenanceSideNavNode key={child.id} node={child} activeId={activeId} onSelect={onSelect} renderAction={renderAction} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ConfirmDeleteAction({ id, pendingId, setPendingId, onConfirm, title }) {
  if (pendingId === id) {
    return (
      <span className="mnt-delete-confirm">
        <button className="mnt-btn mnt-btn--danger mnt-btn--tiny" type="button" onClick={onConfirm}>确认删除</button>
        <button className="mnt-btn mnt-btn--tiny" type="button" onClick={() => setPendingId('')}>取消</button>
      </span>
    );
  }
  return (
    <button className="mnt-btn mnt-btn--danger mnt-btn--tiny mnt-nav-delete" type="button" onClick={() => setPendingId(id)} title={title}>
      删除
    </button>
  );
}

function ProgressLine({ period }) {
  const width = Math.max(0, Math.min(100, Number(period?.pct || 0)));
  const progressText = period?.target ? formatPct(period.pct) : '未设目标';
  return (
    <>
      <div className="mnt-mini-line">完成{formatWanCompact(period?.actual)} · {progressText}</div>
      <div className={`mnt-progress mnt-progress--${period?.status || 'unset'}`}>
        <span style={{ width: `${width}%` }} />
      </div>
    </>
  );
}

function useTargetCurrentMonthAlignment() {
  const scrollPaneRef = useRef(null);

  useLayoutEffect(() => {
    const scrollPane = scrollPaneRef.current;
    if (!scrollPane) return;

    const currentMonthHeader = scrollPane.querySelector('[data-target-current-month="true"]');
    if (!currentMonthHeader) return;

    const maxScrollLeft = Math.max(0, scrollPane.scrollWidth - scrollPane.clientWidth);
    const periodWidth = currentMonthHeader.offsetWidth || 172;
    const targetScrollLeft = currentMonthHeader.offsetLeft + currentMonthHeader.offsetWidth - scrollPane.clientWidth;
    const snappedScrollLeft = Math.ceil(targetScrollLeft / periodWidth) * periodWidth;
    scrollPane.scrollLeft = Math.max(0, Math.min(snappedScrollLeft, maxScrollLeft));
  }, []);

  return scrollPaneRef;
}

function scrollTargetPeriods(scrollPaneRef, direction) {
  const scrollPane = scrollPaneRef.current;
  if (!scrollPane) return;

  const scrollDistance = Math.max(172, Math.round(scrollPane.clientWidth * 0.72));
  scrollPane.scrollBy({
    left: direction === 'left' ? -scrollDistance : scrollDistance,
    behavior: 'smooth',
  });
}

function TargetRowScrollButton({ direction, scrollPaneRef }) {
  const isLeft = direction === 'left';
  const label = isLeft ? '向左移动目标月份表格' : '向右移动目标月份表格';

  function handleClick(event) {
    event.stopPropagation();
    scrollTargetPeriods(scrollPaneRef, direction);
  }

  return (
    <button
      className={`mnt-row-scroll-btn mnt-row-scroll-btn--${direction}`}
      type="button"
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <span aria-hidden="true">{isLeft ? '‹' : '›'}</span>
    </button>
  );
}

function TargetPeriodHeader({ column }) {
  return (
    <th data-target-current-month={column.targetCurrentMonth ? 'true' : undefined}>
      {column.label}
    </th>
  );
}

function TargetAmountInput({ label, value, onChange, ariaLabel }) {
  return (
    <label className="mnt-target-edit-row">
      <span className="mnt-target-edit-label">{label}</span>
      <span className="mnt-target-input-wrap">
        <input
          className="mnt-number-input mnt-target-input"
          type="number"
          min="0"
          defaultValue={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label={ariaLabel}
        />
        <span className="mnt-target-input-unit">万</span>
      </span>
    </label>
  );
}

function TargetPeriodCell({ row, column, onEdit }) {
  const period = row.periods[column.key];
  const editable = row.type === 'department' && column.month && row.id !== 'summary-all';

  return (
    <td
      className={`mnt-period-cell ${editable ? 'mnt-period-cell--editable' : 'mnt-period-cell--readonly'}`}
      data-target-editable={editable ? 'true' : 'false'}
      title={editable ? '可填写目标和实际完成' : '汇总数据，不可直接填写'}
    >
      <div className="mnt-target-cell-main">
        {editable ? (
          <div className="mnt-target-edit-stack">
            <TargetAmountInput
              label="目标"
              value={period.target}
              onChange={(value) => onEdit?.(row.id, column.key, 'target', value)}
              ariaLabel={`${row.name}${column.label}目标`}
            />
            <TargetAmountInput
              label="完成"
              value={period.actual}
              onChange={(value) => onEdit?.(row.id, column.key, 'actual', value)}
              ariaLabel={`${row.name}${column.label}完成`}
            />
          </div>
        ) : (
          <div className="mnt-target-readonly-value">
            <span>目标 <strong>{formatWanCompact(period.target)}</strong></span>
            <span>完成 <strong>{formatWanCompact(period.actual)}</strong></span>
          </div>
        )}
      </div>
      <div className="mnt-target-progress-slot">
        <ProgressLine period={period} />
      </div>
    </td>
  );
}

const TargetMaintenancePage = forwardRef(function TargetMaintenancePage({ markDirty, status, rows, orgTree, year }, ref) {
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedTargetRow, setSelectedTargetRow] = useState(null);
  const targetScrollPaneRef = useTargetCurrentMonthAlignment();
  const draftRef = useRef({});
  const rowList = useMemo(() => rows ?? EMPTY_ARRAY, [rows]);
  const selectedOrgIds = useMemo(
    () => getNestedDescendantIds(orgTree, selectedOrg),
    [orgTree, selectedOrg]
  );
  const visibleTargetRows = useMemo(() => {
    // 目标维护改为部门级：只保留部门行，不再显示人员明细行
    const deptRows = rowList.filter((row) => row.type === 'department');
    if (!orgTree || selectedOrg === orgTree.id || selectedOrgIds.size === 0) return deptRows;
    return deptRows.filter((row) => targetRowBelongsToOrg(row, selectedOrgIds));
  }, [orgTree, rowList, selectedOrg, selectedOrgIds]);
  const visibleDeptCount = visibleTargetRows.filter((row) => row.type === 'department' && row.id !== 'summary-all').length;
  const selectedTargetRowIndex = visibleTargetRows.findIndex((row) => `target:${row.id}` === selectedTargetRow);

  useImperativeHandle(ref, () => ({
    collect: () => ({ rows: buildTargetSaveRows(rowList, draftRef.current, year), laborRows: [], deletions: [] }),
  }), [rowList, year]);

  function handleEdit(rowId, monthKey, field, value) {
    draftRef.current[`${rowId}|${monthKey}|${field}`] = Number(value) || 0;
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--target">
      <Panel title="组织架构" meta={`${visibleDeptCount} 个部门`} className="mnt-side-panel">
        <MaintenanceSideNav nodes={orgTree ? [orgTree] : []} activeId={selectedOrg} onSelect={setSelectedOrg} />
      </Panel>
      <Panel title="年度目标" meta={<SaveBadge status={status} />} className="mnt-main-panel">
        <MatrixShell className="mnt-matrix-wrap--target">
          <div className="mnt-target-matrix">
            <div className="mnt-target-name-pane">
              <table className="mnt-matrix mnt-matrix--target-name">
                <thead>
                  <tr>
                    <th>部门</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTargetRows.map((row) => (
                    <tr key={row.id} {...getSelectableRowProps(`target:${row.id}`, selectedTargetRow, setSelectedTargetRow, row.type === 'department' ? 'mnt-row--summary' : '')}>
                      <td className="mnt-name-cell">
                        <strong>{row.name}</strong>
                        <span>{row.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedTargetRowIndex >= 0 && (
              <div className="mnt-row-scroll-controls" style={{ '--mnt-selected-row-index': selectedTargetRowIndex }}>
                <TargetRowScrollButton direction="left" scrollPaneRef={targetScrollPaneRef} />
                <TargetRowScrollButton direction="right" scrollPaneRef={targetScrollPaneRef} />
              </div>
            )}
            <div className="mnt-target-scroll-pane" ref={targetScrollPaneRef}>
              <table className="mnt-matrix mnt-matrix--target">
                <thead>
                  <tr>
                    {TARGET_PERIOD_COLUMNS.map((column) => <TargetPeriodHeader key={column.key} column={column} />)}
                  </tr>
                </thead>
                <tbody>
                  {visibleTargetRows.map((row) => (
                    <tr key={row.id} {...getSelectableRowProps(`target:${row.id}`, selectedTargetRow, setSelectedTargetRow, row.type === 'department' ? 'mnt-row--summary' : '')}>
                      {TARGET_PERIOD_COLUMNS.map((column) => (
                        <TargetPeriodCell key={column.key} row={row} column={column} onEdit={handleEdit} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </MatrixShell>
      </Panel>
    </section>
  );
});

const CostMaintenancePage = forwardRef(function CostMaintenancePage({ markDirty, status, costChannels, costRows, laborRows, year }, ref) {
  const [channels, setChannels] = useState(costChannels ?? EMPTY_ARRAY);
  const [allRows, setAllRows] = useState(costRows ?? EMPTY_ARRAY);
  const [departmentLaborRows, setDepartmentLaborRows] = useState(laborRows ?? EMPTY_ARRAY);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedCostRow, setSelectedCostRow] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const draftRef = useRef({});
  const deletedChannelIdsRef = useRef([]);
  useEffect(() => {
    setChannels(costChannels ?? EMPTY_ARRAY);
    setAllRows(costRows ?? EMPTY_ARRAY);
    setDepartmentLaborRows(laborRows ?? EMPTY_ARRAY);
    setPendingDeleteId('');
    draftRef.current = {};
    deletedChannelIdsRef.current = [];
  }, [costChannels, costRows, laborRows]);
  const costNavNodes = useMemo(() => buildMaintenanceNavTree(
    channels.map((channel) => ({
      ...channel,
      parentId: channel.id === 'all' ? '' : channel.parentId || 'all',
      meta: channel.kind,
    })),
    { rootId: 'all', countText: '项' }
  ), [channels]);
  const selectedIds = useMemo(() => {
    if (selectedChannel === 'all') return new Set(allRows.map((row) => row.id));
    return new Set([
      selectedChannel,
      ...channels.filter((item) => item.parentId === selectedChannel).map((item) => item.id),
    ]);
  }, [selectedChannel, channels, allRows]);
  const visibleRows = allRows.filter((row) => selectedIds.has(row.id) || selectedChannel === 'all');
  const selectedNewChannel = channels.find((channel) => (
    String(channel.id) === String(selectedChannel) && String(channel.id).startsWith('new-channel-')
  ));
  const displayedDepartmentLaborRows = useMemo(() => departmentLaborRows.map((row) => {
    if (row.costType !== 'sales') return row;
    const monthCosts = Object.fromEntries(COST_MONTH_KEYS.map((monthKey) => [
      monthKey,
      allRows
        .filter((costRow) => costRow.type === 'channel')
        .reduce((sum, costRow) => sum + (Number(costRow.periods?.[monthKey]?.labor) || 0), 0),
    ]));
    return { ...row, periods: buildDepartmentLaborPeriods(monthCosts) };
  }), [allRows, departmentLaborRows]);

  useImperativeHandle(ref, () => ({
    collect: () => {
      const r = buildCostSaveRows({ rows: allRows, laborRows: departmentLaborRows }, draftRef.current, year);
      return { rows: r.rows, laborRows: r.laborRows, groups: buildChannelGroupSaveRows(channels), deletions: deletedChannelIdsRef.current };
    },
    addCostChannel,
  }), [allRows, channels, departmentLaborRows, selectedChannel, year]);

  function handleCostFieldEdit(rowId, monthKey, field, value) {
    const key = `${rowId}|${monthKey}|${field}`;
    const amount = Number(value) || 0;
    draftRef.current[key] = amount;
    if (field === 'labor') {
      setAllRows((current) => current.map((row) => {
        if (String(row.id) !== String(rowId)) return row;
        const period = row.periods?.[monthKey] || {};
        return {
          ...row,
          periods: {
            ...row.periods,
            [monthKey]: {
              ...period,
              labor: amount,
              laborConfigured: true,
              totalCost: (Number(period.operations) || 0) + amount,
            },
          },
        };
      }));
    }
    markDirty();
  }

  function handleDepartmentLaborEdit(rowId, monthKey, value) {
    const amount = Number(value) || 0;
    draftRef.current[`${rowId}|${monthKey}|cost`] = amount;
    setDepartmentLaborRows((current) => current.map((row) => {
      if (String(row.id) !== String(rowId) || row.editable === false) return row;
      const monthCosts = Object.fromEntries(COST_MONTH_KEYS.map((key) => [
        key,
        key === monthKey ? amount : Number(row.periods?.[key]?.cost) || 0,
      ]));
      return { ...row, periods: buildDepartmentLaborPeriods(monthCosts) };
    }));
    markDirty();
  }

  function buildEmptyCostPeriods() {
    return MAINTENANCE_PERIOD_COLUMNS.reduce((periods, column) => ({
      ...periods,
      [column.key]: { operations: 0, labor: 0, laborConfigured: false, totalCost: 0, actual: 0, deals: 0, refund: 0, roi: 0 },
    }), {});
  }

  function addCostChannel() {
    const index = channels.filter((channel) => channel.id !== 'all').length + 1;
    const id = `new-channel-${index}`;
    const name = `新增渠道 ${index}`;
    const parentId = selectedChannel === 'all' ? '' : selectedChannel;
    setChannels((current) => [
      ...current,
      { id, name, kind: '明细', parentId, enabled: true },
    ]);
    setAllRows((current) => [
      ...current,
      { id, type: 'channel', name, parentId: 'summary-all', periods: buildEmptyCostPeriods() },
    ]);
    setSelectedChannel(id);
    markDirty();
  }

  function updateCostChannel(channelId, patch) {
    setChannels((current) => current.map((channel) => (
      String(channel.id) === String(channelId) ? { ...channel, ...patch } : channel
    )));
    if ('name' in patch) {
      setAllRows((current) => current.map((row) => (
        String(row.id) === String(channelId) ? { ...row, name: patch.name } : row
      )));
    }
    markDirty();
  }

  function deleteCostChannel(channelId) {
    if (channelId === 'all') return;
    const deleteIds = getDescendantIds(channels, channelId);
    setChannels((current) => current.filter((channel) => !deleteIds.has(channel.id)));
    setAllRows((current) => current.filter((row) => !deleteIds.has(row.id)));
    Object.keys(draftRef.current).forEach((key) => {
      const rowId = key.split('|')[0];
      if (deleteIds.has(rowId)) delete draftRef.current[key];
    });
    deletedChannelIdsRef.current = Array.from(new Set([
      ...deletedChannelIdsRef.current,
      ...Array.from(deleteIds).filter((id) => !String(id).startsWith('new-channel-') && id !== 'all'),
    ]));
    if (deleteIds.has(selectedChannel)) setSelectedChannel('all');
    markDirty();
  }

  function renderCostChannelAction(node) {
    if (node.id === 'all') return null;
    return (
      <ConfirmDeleteAction
        id={`cost:${node.id}`}
        pendingId={pendingDeleteId}
        setPendingId={setPendingDeleteId}
        onConfirm={() => {
          deleteCostChannel(node.id);
          setPendingDeleteId('');
        }}
        title={`删除${node.name}`}
      />
    );
  }

  return (
    <section className="mnt-layout mnt-layout--cost">
      <Panel title="渠道树" meta={`${channels.length - 1} 个渠道`} className="mnt-side-panel">
        <button className="mnt-btn mnt-local-action" type="button" onClick={addCostChannel}>新增渠道</button>
        {selectedNewChannel && (
          <label className="mnt-channel-group-editor">
            <span>新增渠道名称</span>
            <input
              className="mnt-control"
              value={selectedNewChannel.name}
              onChange={(e) => updateCostChannel(selectedNewChannel.id, { name: e.target.value })}
              aria-label="新增渠道名称"
            />
          </label>
        )}
        <MaintenanceSideNav nodes={costNavNodes} activeId={selectedChannel} onSelect={setSelectedChannel} renderAction={renderCostChannelAction} />
      </Panel>
      <div className="mnt-cost-stack">
        <Panel title="渠道成本维护" meta={<SaveBadge status={status} />} className="mnt-main-panel">
          <MatrixShell>
            <table className="mnt-matrix mnt-matrix--cost">
              <thead>
                <tr>
                  <th>渠道</th>
                  {MAINTENANCE_PERIOD_COLUMNS.map((column) => <th key={column.key}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} {...getSelectableRowProps(`cost:${row.id}`, selectedCostRow, setSelectedCostRow, row.type === 'group' ? 'mnt-row--summary' : '')}>
                    <td className="mnt-name-cell">
                      <strong>{row.name}</strong>
                      <span>{row.type === 'group' ? '渠道合计' : '明细渠道'}</span>
                    </td>
                    {MAINTENANCE_PERIOD_COLUMNS.map((column) => {
                      const period = row.periods[column.key];
                      const editable = row.type === 'channel' && column.month;
                      return (
                        <td key={column.key} className="mnt-period-cell mnt-period-cell--cost">
                          {editable ? (
                            <label className="mnt-inline-field">
                              <span>运营</span>
                              <div className="mnt-cost-unit-input-wrap">
                                <input
                                  className="mnt-number-input mnt-cost-unit-input"
                                  type="number"
                                  min="0"
                                  defaultValue={period.operations}
                                  onChange={(e) => handleCostFieldEdit(row.id, column.key, 'operations', e.target.value)}
                                  aria-label={`${row.name}${column.label}运营成本`}
                                />
                                <span className="mnt-cost-unit-input-unit">万</span>
                              </div>
                            </label>
                          ) : (
                            <div className="mnt-mini-line">运营 {formatWan(period.operations)}</div>
                          )}
                          {editable ? (
                            <label className="mnt-inline-field">
                              <span>人力</span>
                              <div className="mnt-cost-unit-input-wrap">
                                <input
                                  className="mnt-number-input mnt-cost-unit-input"
                                  type="number"
                                  min="0"
                                  defaultValue={period.labor}
                                  onChange={(e) => handleCostFieldEdit(row.id, column.key, 'labor', e.target.value)}
                                  aria-label={`${row.name}${column.label}人力成本`}
                                />
                                <span className="mnt-cost-unit-input-unit">万</span>
                              </div>
                            </label>
                          ) : (
                            <>
                              <div className="mnt-mini-line">人力 {formatWan(period.labor)}</div>
                              <div className="mnt-mini-line mnt-mini-line--strong">合计 {formatWan(period.totalCost)}</div>
                            </>
                          )}
                          <div className="mnt-mini-line">成交 {period.deals} 单</div>
                          {editable ? (
                            <label className="mnt-inline-field">
                              <span>退款</span>
                              <div className="mnt-cost-unit-input-wrap">
                                <input
                                  className="mnt-number-input mnt-cost-unit-input"
                                  type="number"
                                  min="0"
                                  defaultValue={period.refund || 0}
                                  onChange={(e) => handleCostFieldEdit(row.id, column.key, 'refund', e.target.value)}
                                  aria-label={`${row.name}${column.label}退款`}
                                />
                                <span className="mnt-cost-unit-input-unit">万</span>
                              </div>
                            </label>
                          ) : (
                            <div className="mnt-mini-line">退款 {formatWan(period.refund)}</div>
                          )}
                          <div className="mnt-mini-line mnt-mini-line--strong">ROI {formatRoi(period.roi)}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </MatrixShell>
        </Panel>
        <Panel title="部门人力成本" meta="销售部人力成本自动汇总 / 市场部人力成本独立填写" className="mnt-main-panel">
          <MatrixShell>
            <table className="mnt-matrix mnt-matrix--cost">
              <thead>
                <tr>
                  <th>部门</th>
                  {MAINTENANCE_PERIOD_COLUMNS.map((column) => <th key={column.key}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {displayedDepartmentLaborRows.map((row) => (
                  <tr key={row.id} {...getSelectableRowProps(`cost:${row.id}`, selectedCostRow, setSelectedCostRow)}>
                    <td className="mnt-name-cell">
                      <strong>{row.name}</strong>
                      <span>{row.source}</span>
                    </td>
                    {MAINTENANCE_PERIOD_COLUMNS.map((column) => {
                      const period = row.periods?.[column.key] || { cost: 0 };
                      const editable = row.editable !== false && column.month;
                      return (
                        <td key={column.key} className="mnt-period-cell mnt-period-cell--cost">
                          {editable ? (
                            <label className="mnt-inline-field">
                              <span>人力</span>
                              <div className="mnt-cost-unit-input-wrap">
                                <input
                                  className="mnt-number-input mnt-cost-unit-input"
                                  type="number"
                                  min="0"
                                  defaultValue={period.cost}
                                  onChange={(e) => handleDepartmentLaborEdit(row.id, column.key, e.target.value)}
                                  aria-label={`${row.name}${column.label}人力成本`}
                                />
                                <span className="mnt-cost-unit-input-unit">万</span>
                              </div>
                            </label>
                          ) : (
                            <div className="mnt-mini-line mnt-mini-line--strong">人力 {formatWan(period.cost)}</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </MatrixShell>
        </Panel>
      </div>
    </section>
  );
});

const OrgMaintenancePage = forwardRef(function OrgMaintenancePage({ markDirty, status, departments: propDepartments, users: propUsers }, ref) {
  const [departments, setDepartments] = useState(propDepartments ?? []);
  const [users, setUsers] = useState(propUsers ?? []);
  const [selectedDepartment, setSelectedDepartment] = useState(
    () => propDepartments?.find((d) => !d.parentId)?.id ?? 'headquarters'
  );
  const [selectedOrgRow, setSelectedOrgRow] = useState(null);
  const draftRef = useRef({});
  // 父组件按 dataVersion 用 key 重挂载，props 变化时同步本地状态
  useEffect(() => {
    setDepartments(propDepartments ?? []);
    setUsers(propUsers ?? []);
  }, [propDepartments, propUsers]);
  const departmentNavItems = useMemo(() => departments.map((dept) => ({
    ...dept,
    count: users.filter((user) => user.deptId === dept.id && user.enabled).length,
    countText: '人',
  })), [departments, users]);
  const rootDepartmentId = useMemo(
    () => departments.find((dept) => !dept.parentId)?.id ?? departments[0]?.id ?? 'headquarters',
    [departments],
  );
  const departmentNavNodes = useMemo(
    () => buildMaintenanceNavTree(departmentNavItems, { rootId: rootDepartmentId, countText: '人' }),
    [departmentNavItems, rootDepartmentId]
  );
  const selectedDepartmentIds = useMemo(
    () => getDescendantIds(departments, selectedDepartment),
    [departments, selectedDepartment]
  );
  const visibleUsers = selectedDepartment === 'headquarters'
    ? users
    : users.filter((user) => selectedDepartmentIds.has(user.deptId));
  const departmentChoices = useMemo(() => makeSelectOptions(departments), [departments]);

  useImperativeHandle(ref, () => ({
    collect: () => ({ rows: buildOrgSaveRows(users, draftRef.current), departments: buildDepartmentSaveRows(departments), laborRows: [], deletions: [] }),
    addDepartment,
  }), [departments, users]);

  function editField(userId, field, value) {
    draftRef.current[`${userId}|${field}`] = value;
    setUsers((currentUsers) => currentUsers.map((user) => (
      String(user.id) === String(userId) ? { ...user, [field]: value } : user
    )));
    markDirty();
  }

  function addDepartment() {
    const nextIndex = departments.length + 1;
    setDepartments([
      ...departments,
      { id: `new-dept-${nextIndex}`, name: `新增组织 ${nextIndex}`, parentId: rootDepartmentId, enabled: true },
    ]);
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--org">
      <Panel title="BI组织架构" meta={`${departments.length} 个组织`} className="mnt-side-panel">
        <button className="mnt-btn mnt-local-action" type="button" onClick={addDepartment}>新增组织</button>
        <MaintenanceSideNav nodes={departmentNavNodes} activeId={selectedDepartment} onSelect={setSelectedDepartment} />
      </Panel>
      <Panel title="BI人员范围" meta={<><span>{users.filter((user) => user.isSales && user.enabled).length} 名销售</span> <SaveBadge status={status} /></>} className="mnt-main-panel">
        <MatrixShell>
          <table className="mnt-user-table">
            <thead>
              <tr>
                <th>人员</th>
                <th>BI组织</th>
                <th>销售</th>
                <th>启用</th>
                <th>卫瓴ID</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id} {...getSelectableRowProps(`org:${user.id}`, selectedOrgRow, setSelectedOrgRow, user.enabled && user.isSales ? '' : 'mnt-row--muted')}>
                  <td className="mnt-name-cell">
                    <strong>{user.name}</strong>
                    <span>{user.sourceName}</span>
                  </td>
                  <td>
                    <GlassSelect className="mnt-control" value={String(user.deptId ?? '')} onChange={(value) => editField(user.id, 'deptId', value)} aria-label={`${user.name}所属组织`} options={departmentChoices} />
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" defaultChecked={user.isSales} onChange={(e) => editField(user.id, 'isSales', e.target.checked)} />
                      销售
                    </label>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" defaultChecked={user.enabled} onChange={(e) => editField(user.id, 'enabled', e.target.checked)} />
                      启用
                    </label>
                  </td>
                  <td><code>{user.sourceUserId}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </MatrixShell>
      </Panel>
    </section>
  );
});

const ChannelMaintenancePage = forwardRef(function ChannelMaintenancePage({ markDirty, status, groups: propGroups, sources: propSources }, ref) {
  const [groups, setGroups] = useState(propGroups ?? []);
  const [sources, setSources] = useState(
    (propSources ?? []).map((s) => ({ ...s, _uid: s.code, _isNew: false })),
  );
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedSourceRow, setSelectedSourceRow] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const deletedCodesRef = useRef([]);
  const deletedGroupIdsRef = useRef([]);
  const newCounterRef = useRef(0);
  useEffect(() => {
    setGroups(propGroups ?? []);
    setSources((propSources ?? []).map((s) => ({ ...s, _uid: s.code, _isNew: false })));
    setPendingDeleteId('');
    deletedCodesRef.current = [];
    deletedGroupIdsRef.current = [];
  }, [propGroups, propSources]);
  const sourceCountByGroup = useMemo(() => {
    const counts = new Map();
    sources.forEach((source) => {
      counts.set(source.groupId, (counts.get(source.groupId) ?? 0) + 1);
    });
    return counts;
  }, [sources]);
  const channelGroupNavItems = useMemo(() => [
    { id: 'all', name: '全部渠道大类', parentId: '', count: sources.length, countText: '来源', enabled: true },
    ...groups.map((group) => ({
      ...group,
      parentId: group.parentId || 'all',
      count: sourceCountByGroup.get(group.id) ?? 0,
      countText: '来源',
    })),
  ], [groups, sourceCountByGroup, sources.length]);
  const channelGroupNavNodes = useMemo(
    () => buildMaintenanceNavTree(channelGroupNavItems, { rootId: 'all', countText: '来源' }),
    [channelGroupNavItems]
  );
  const selectedGroupIds = useMemo(
    () => getDescendantIds(channelGroupNavItems, selectedGroup),
    [channelGroupNavItems, selectedGroup]
  );
  const visibleSources = selectedGroup === 'all'
    ? sources
    : sources.filter((source) => selectedGroupIds.has(source.groupId));
  const channelGroupChoices = useMemo(() => makeSelectOptions(groups, '选择渠道大类'), [groups]);
  const selectedNewGroup = groups.find((group) => (
    String(group.id) === String(selectedGroup) && String(group.id).startsWith('new-channel-')
  ));

  useImperativeHandle(ref, () => ({
    collect: () => {
      const r = buildChannelSaveRows(sources, deletedCodesRef.current);
      return { rows: r.rows, groups: buildChannelGroupSaveRows(groups), laborRows: [], deletions: r.deletions, groupDeletions: deletedGroupIdsRef.current };
    },
    addChannelGroup: () => addGroup(selectedGroup === 'all' ? '' : selectedGroup),
    addSource,
  }), [groups, selectedGroup, sources]);

  function updateGroup(groupId, patch) {
    setGroups((currentGroups) => currentGroups.map((group) => (
      String(group.id) === String(groupId) ? { ...group, ...patch } : group
    )));
    markDirty();
  }

  function updateSource(uid, patch) {
    setSources((currentSources) => currentSources.map((s) => (s._uid === uid ? { ...s, ...patch } : s)));
    markDirty();
  }

  function addGroup(parentId = '') {
    const nextIndex = groups.length + 1;
    const id = `new-channel-${nextIndex}`;
    setGroups([
      ...groups,
      { id, name: `新增大类 ${nextIndex}`, parentId, enabled: true },
    ]);
    setSelectedGroup(id);
    markDirty();
  }

  function addSource() {
    newCounterRef.current += 1;
    const uid = `new-${newCounterRef.current}`;
    const groupId = selectedGroup === 'all' ? (groups[0]?.id || '') : selectedGroup;
    setSources([
      ...sources,
      { _uid: uid, _isNew: true, code: String(9000 + newCounterRef.current), name: `新增来源 ${newCounterRef.current}`, groupId, enabled: true, excluded: false },
    ]);
    markDirty();
  }

  function deleteSource(source) {
    setSources(sources.filter((s) => s._uid !== source._uid));
    // 仅已落库的来源需要从数据库删除；新增未保存的来源只移除本地行
    if (!source._isNew && source.code) {
      deletedCodesRef.current.push(source.code);
    }
    markDirty();
  }

  function deleteGroup(groupId) {
    if (groupId === 'all') return;
    const deleteIds = getDescendantIds(groups, groupId);
    setGroups(groups.filter((group) => !deleteIds.has(group.id)));
    setSources(sources.filter((source) => {
      if (!deleteIds.has(source.groupId)) return true;
      if (!source._isNew && source.code) deletedCodesRef.current.push(source.code);
      return false;
    }));
    deletedGroupIdsRef.current = Array.from(new Set([
      ...deletedGroupIdsRef.current,
      ...Array.from(deleteIds).filter((id) => !String(id).startsWith('new-channel-')),
    ]));
    if (deleteIds.has(selectedGroup)) setSelectedGroup('all');
    markDirty();
  }

  function renderChannelGroupAction(node) {
    if (node.id === 'all') return null;
    return (
      <ConfirmDeleteAction
        id={`channel:${node.id}`}
        pendingId={pendingDeleteId}
        setPendingId={setPendingDeleteId}
        onConfirm={() => {
          deleteGroup(node.id);
          setPendingDeleteId('');
        }}
        title={`删除${node.name}`}
      />
    );
  }

  return (
    <section className="mnt-layout mnt-layout--channel">
      <Panel title="渠道大类" meta={`${groups.length} 个大类`} className="mnt-side-panel">
        <button className="mnt-btn mnt-local-action" type="button" onClick={() => addGroup(selectedGroup === 'all' ? '' : selectedGroup)}>新增大类</button>
        {selectedNewGroup && (
          <label className="mnt-channel-group-editor">
            <span>新增大类名称</span>
            <input
              className="mnt-control"
              value={selectedNewGroup.name}
              onChange={(e) => updateGroup(selectedNewGroup.id, { name: e.target.value })}
              aria-label="新增大类名称"
            />
          </label>
        )}
        <MaintenanceSideNav nodes={channelGroupNavNodes} activeId={selectedGroup} onSelect={setSelectedGroup} renderAction={renderChannelGroupAction} />
      </Panel>
      <Panel title="卫瓴线索来源" meta={<SaveBadge status={status} />} className="mnt-main-panel">
        <button className="mnt-btn mnt-local-action" type="button" onClick={addSource}>新增来源</button>
        <MatrixShell>
          <table className="mnt-user-table mnt-source-table">
            <thead>
              <tr>
                <th>来源编码</th>
                <th>来源名称</th>
                <th>归属渠道大类</th>
                <th>启用</th>
                <th>排除</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleSources.map((source) => (
                <tr key={source._uid} {...getSelectableRowProps(`source:${source.code}`, selectedSourceRow, setSelectedSourceRow, source.excluded ? 'mnt-row--muted' : '')}>
                  <td>
                    {source._isNew ? (
                      <input className="mnt-control" value={source.code} onChange={(e) => updateSource(source._uid, { code: e.target.value })} aria-label={`${source.name}来源编码`} />
                    ) : (
                      <code>{source.code}</code>
                    )}
                  </td>
                  <td><input className="mnt-control" value={source.name} onChange={(e) => updateSource(source._uid, { name: e.target.value })} aria-label={`${source.name}来源名称`} /></td>
                  <td>
                    <GlassSelect className="mnt-control" value={String(source.groupId ?? '')} onChange={(value) => updateSource(source._uid, { groupId: value })} aria-label={`${source.name}归属渠道`} options={channelGroupChoices} />
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" checked={!!source.enabled} onChange={(e) => updateSource(source._uid, { enabled: e.target.checked, excluded: !e.target.checked })} />
                      启用
                    </label>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" checked={!!source.excluded} onChange={(e) => updateSource(source._uid, { excluded: e.target.checked, enabled: !e.target.checked })} />
                      排除
                    </label>
                  </td>
                  <td>
                    <ConfirmDeleteAction
                      id={`source:${source._uid}`}
                      pendingId={pendingDeleteId}
                      setPendingId={setPendingDeleteId}
                      onConfirm={() => {
                        deleteSource(source);
                        setPendingDeleteId('');
                      }}
                      title={`删除${source.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </MatrixShell>
      </Panel>
    </section>
  );
});

const PAGE_RENDERERS = {
  'update-monitor-maintenance': UpdateMonitorMaintenancePage,
  'target-maintenance': TargetMaintenancePage,
  'cost-maintenance': CostMaintenancePage,
  'org-maintenance': OrgMaintenancePage,
  'channel-maintenance': ChannelMaintenancePage,
};

export default function MaintenancePage({ activePage = 'target-maintenance' }) {
  const [statusByPage, setStatusByPage] = useState({});
  const [importOpen, setImportOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [year, setYear] = useState('2026');
  const [data, setData] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [lastLoadedAt, setLastLoadedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const pageRef = useRef(null);
  const Page = PAGE_RENDERERS[activePage] ?? TargetMaintenancePage;
  const isReadonlyPage = READONLY_MAINTENANCE_PAGES.has(activePage);
  const status = statusByPage[activePage] ?? '未修改';
  const dirty = status === '有未保存修改';
  const importConfig = getImportConfig(activePage);
  const importConfigs = useMemo(() => {
    if (activePage === 'target-maintenance') {
      return [
        getImportConfig('target-maintenance'),
        getImportConfig('target-actual-import'),
      ].filter(Boolean);
    }
    return importConfig ? [importConfig] : [];
  }, [activePage, importConfig]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchMaintenanceData(activePage, year)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLastLoadedAt(new Date().toISOString());
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setData(null);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [activePage, year, dataVersion]);

  useEffect(() => {
    if (activePage !== 'update-monitor-maintenance') return undefined;
    const intervalId = window.setInterval(() => {
      setDataVersion((v) => v + 1);
    }, UPDATE_MONITOR_REFRESH_MS);
    return () => window.clearInterval(intervalId);
  }, [activePage]);

  function markDirty() {
    setStatusByPage((current) => ({ ...current, [activePage]: '有未保存修改' }));
  }

  function markSaved() {
    setStatusByPage((current) => ({ ...current, [activePage]: `已保存 ${nowLabel()}` }));
  }

  function handleDownloadTemplate(pageKey) {
    // 工具栏按钮把 onDownloadTemplate 直接当 onClick 用时,React 会把事件对象作为第一个参数传入,
    // 不能再依赖默认参数回退 activePage;此处显式判断,只有字符串 pageKey 才采用,否则用当前页。
    const key = typeof pageKey === 'string' && pageKey ? pageKey : activePage;
    const config = getImportConfig(key);
    if (config) downloadTemplate(config);
    setTemplateDialogOpen(false);
  }

  function handleImported() {
    // 导入写库后重拉数据，让表单显示新行
    setDataVersion((v) => v + 1);
    markSaved();
  }

  function handlePageAction(action) {
    const handler = pageRef.current?.[action];
    if (typeof handler === 'function') {
      handler();
      return;
    }
    markDirty();
  }

  async function handleSave() {
    if (saving || !dirty) return;
    const collected = pageRef.current?.collect?.();
    const payload = {
      pageKey: activePage,
      year,
      rows: collected?.rows ?? [],
      laborRows: collected?.laborRows ?? [],
      departments: collected?.departments ?? [],
      groups: collected?.groups ?? [],
      deletions: collected?.deletions ?? [],
      groupDeletions: collected?.groupDeletions ?? [],
    };
    if (!payload.rows.length && !payload.laborRows.length && !payload.departments.length && !payload.groups.length && !payload.deletions.length && !payload.groupDeletions.length) {
      markSaved();
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const resp = await fetch('/api/maintenance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await resp.json().catch(() => null);
      if (!resp.ok) {
        setSaveError(result?.error || `保存失败（${resp.status}）`);
        return;
      }
      // 写库后重拉，让表单回显数据库最新值并清空 draft（重挂载）
      setDataVersion((v) => v + 1);
      markSaved();
      if (result?.errors?.length) {
        setSaveError(`部分行未写入：${result.errors.map((e) => e.message).join('；')}`);
      }
    } catch (err) {
      setSaveError(`网络异常：${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const pageProps = (() => {
    const d = data || {};
    switch (activePage) {
      case 'update-monitor-maintenance': return { monitor: d, lastLoadedAt };
      case 'target-maintenance': return { rows: d.rows, orgTree: d.orgTree };
      case 'cost-maintenance': return { costChannels: d.channels, costRows: d.rows, laborRows: d.laborRows };
      case 'org-maintenance': return { departments: d.departments, users: d.users };
      case 'channel-maintenance': return { groups: d.groups, sources: d.sources };
      default: return {};
    }
  })();
  const pageRenderKey = activePage === 'update-monitor-maintenance'
    ? `${activePage}-${year}`
    : `${activePage}-${year}-${dataVersion}`;

  return (
    <div className={`mnt-page${saving ? ' mnt-page--saving' : ''}`}>
      <MaintenanceToolbar
        activePage={activePage}
        status={status}
        year={year}
        saving={saving}
        canSave={dirty}
        showWriteActions={!isReadonlyPage}
        onYearChange={setYear}
        onSave={handleSave}
        onImport={() => setImportOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
        onPageAction={handlePageAction}
        onOpenTemplateDialog={() => setTemplateDialogOpen(true)}
      />
      {templateDialogOpen && activePage === 'target-maintenance' && (
        <TemplateDownloadDialog
          configs={importConfigs}
          onClose={() => setTemplateDialogOpen(false)}
          onDownloadTemplate={handleDownloadTemplate}
        />
      )}
      {loading && <div className="mnt-state-line">正在加载真实数据库…</div>}
      {error && <div className="mnt-state-line mnt-state-line--error">加载失败：{error}</div>}
      {saveError && <div className="mnt-state-line mnt-state-line--error">{saveError}</div>}
      {!loading && !error && data && (
        <>
          <Page
            ref={pageRef}
            key={pageRenderKey}
            markDirty={markDirty}
            status={status}
            year={year}
            {...pageProps}
          />
          {saving && <div className="mnt-saving-overlay" aria-live="polite">正在写入数据库…</div>}
        </>
      )}
      {importOpen && importConfigs.length > 0 && (
        <MaintenanceImportDialog
          config={importConfigs[0]}
          configs={importConfigs}
          onClose={() => setImportOpen(false)}
          onImported={handleImported}
        />
      )}
    </div>
  );
}
