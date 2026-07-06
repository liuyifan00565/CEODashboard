/*
 Update time: 2026-07-06 11:15:05 CST
 Update content: Filter annual target rows to the selected organization branch instead of scrolling the full table.
*/
/*
 Update time: 2026-07-06 11:04:58 CST
 Update content: Display the target maintenance root organization as all departments in both side nav and target rows.
*/
/*
 Update time: 2026-07-06 11:01:06 CST
 Update content: Show the shared target data updated timestamp before the status badge on all four maintenance pages.
*/
/*
 Update time: 2026-07-06 10:57:51 CST
 Update content: Add a compact target data updated timestamp to the target maintenance toolbar and refresh it after saves.
*/
/*
 Update time: 2026-07-06 10:28:05 CST
 Update content: Load data maintenance pages from MySQL APIs and save editable UI fields back to matching database tables.
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
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  CHANNEL_MAINTENANCE_GROUPS,
  CHANNEL_MAINTENANCE_SOURCES,
  COST_MAINTENANCE_CHANNELS,
  COST_MAINTENANCE_ROWS,
  LABOR_COST_MAINTENANCE_ROWS,
  META,
  MAINTENANCE_PERIOD_COLUMNS,
  ORG_MAINTENANCE_DEPARTMENTS,
  ORG_MAINTENANCE_USERS,
  TARGET_MAINTENANCE_ORG_TREE,
  TARGET_MAINTENANCE_ROWS,
  getMaintenancePageMeta,
} from '../data/mock';
import './MaintenancePage.css';

const YEARS = [2024, 2025, 2026, 2027];

const MAINTENANCE_TITLE_TEXT = {
  'target-maintenance': '目标维护',
  'cost-maintenance': '成本维护',
  'org-maintenance': '组织维护',
  'channel-maintenance': '渠道维护',
};

const PAGE_RENDERERS = {
  'target-maintenance': TargetMaintenancePage,
  'cost-maintenance': CostMaintenancePage,
  'org-maintenance': OrgMaintenancePage,
  'channel-maintenance': ChannelMaintenancePage,
};

const TARGET_PERIOD_COLUMNS = buildTargetPeriodColumns(MAINTENANCE_PERIOD_COLUMNS, META.monthLabel);
const MAINTENANCE_MONTH_KEYS = MAINTENANCE_PERIOD_COLUMNS.filter((column) => column.month).map((column) => column.key);
const MAINTENANCE_QUARTERS = {
  q1: ['m01', 'm02', 'm03'],
  q2: ['m04', 'm05', 'm06'],
  q3: ['m07', 'm08', 'm09'],
  q4: ['m10', 'm11', 'm12'],
};
const PAGE_DATA_KEYS = {
  'target-maintenance': 'target',
  'cost-maintenance': 'cost',
  'org-maintenance': 'org',
  'channel-maintenance': 'channel',
};
const PAGE_API_RESOURCES = {
  'target-maintenance': 'targets',
  'cost-maintenance': 'costs',
  'org-maintenance': 'org',
  'channel-maintenance': 'channels',
};
const INITIAL_TARGET_UPDATED_AT = '2026/7/6 10:42:41';
const TARGET_ALL_DEPARTMENTS_LABEL = '所有部门';
const DEFAULT_MAINTENANCE_DATA = {
  target: {
    orgTree: TARGET_MAINTENANCE_ORG_TREE,
    rows: TARGET_MAINTENANCE_ROWS,
  },
  cost: {
    channels: COST_MAINTENANCE_CHANNELS,
    rows: COST_MAINTENANCE_ROWS,
    laborRows: LABOR_COST_MAINTENANCE_ROWS,
  },
  org: {
    departments: ORG_MAINTENANCE_DEPARTMENTS,
    users: ORG_MAINTENANCE_USERS,
  },
  channel: {
    groups: CHANNEL_MAINTENANCE_GROUPS,
    sources: CHANNEL_MAINTENANCE_SOURCES,
  },
};

function cloneMaintenanceData(data = DEFAULT_MAINTENANCE_DATA) {
  return JSON.parse(JSON.stringify(data));
}

function mergeMaintenanceData(data) {
  return {
    ...cloneMaintenanceData(),
    ...(data || {}),
  };
}

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

function maintenanceStatus(pct, target) {
  if (!target) return 'unset';
  return pct > 80 ? 'good' : 'danger';
}

function targetPeriod(target, actual) {
  const safeTarget = Math.max(0, Number(target || 0));
  const safeActual = Math.max(0, Number(actual || 0));
  const pct = safeTarget ? +((safeActual / safeTarget) * 100).toFixed(1) : 0;
  return { target: safeTarget, actual: safeActual, pct, status: maintenanceStatus(pct, safeTarget) };
}

function costPeriod(cost, actual, deals = 0) {
  const safeCost = Math.max(0, Number(cost || 0));
  const safeActual = Math.max(0, Number(actual || 0));
  const safeDeals = Math.max(0, Math.round(Number(deals || 0)));
  const roi = safeCost ? +((safeActual - safeCost) / safeCost).toFixed(2) : 0;
  return { cost: safeCost, actual: safeActual, deals: safeDeals, roi };
}

function laborPeriod(cost) {
  return { cost: Math.max(0, Number(cost || 0)) };
}

function sumPeriodValues(keys, periods, field) {
  return keys.reduce((sum, key) => sum + Number(periods[key]?.[field] || 0), 0);
}

function recalcTargetPeriods(periods) {
  const next = { ...periods };
  Object.entries(MAINTENANCE_QUARTERS).forEach(([key, months]) => {
    next[key] = targetPeriod(sumPeriodValues(months, next, 'target'), sumPeriodValues(months, next, 'actual'));
  });
  next.year = targetPeriod(sumPeriodValues(MAINTENANCE_MONTH_KEYS, next, 'target'), sumPeriodValues(MAINTENANCE_MONTH_KEYS, next, 'actual'));
  return next;
}

function recalcCostPeriods(periods) {
  const next = { ...periods };
  Object.entries(MAINTENANCE_QUARTERS).forEach(([key, months]) => {
    next[key] = costPeriod(
      sumPeriodValues(months, next, 'cost'),
      sumPeriodValues(months, next, 'actual'),
      sumPeriodValues(months, next, 'deals')
    );
  });
  next.year = costPeriod(
    sumPeriodValues(MAINTENANCE_MONTH_KEYS, next, 'cost'),
    sumPeriodValues(MAINTENANCE_MONTH_KEYS, next, 'actual'),
    sumPeriodValues(MAINTENANCE_MONTH_KEYS, next, 'deals')
  );
  return next;
}

function recalcLaborPeriods(periods) {
  const next = { ...periods };
  Object.entries(MAINTENANCE_QUARTERS).forEach(([key, months]) => {
    next[key] = laborPeriod(sumPeriodValues(months, next, 'cost'));
  });
  next.year = laborPeriod(sumPeriodValues(MAINTENANCE_MONTH_KEYS, next, 'cost'));
  return next;
}

function nowLabel() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function nowFullLabel() {
  const date = new Date();
  const padTime = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}`;
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

function withTargetAllDepartmentsRoot(orgTree) {
  if (!orgTree) return orgTree;
  return { ...orgTree, name: TARGET_ALL_DEPARTMENTS_LABEL };
}

function withTargetAllDepartmentsRow(row, rootId) {
  return row.id === rootId ? { ...row, name: TARGET_ALL_DEPARTMENTS_LABEL } : row;
}

function collectTargetOrgBranch(node, ids) {
  if (!node) return;
  ids.add(node.id);
  (node.children ?? []).forEach((child) => collectTargetOrgBranch(child, ids));
}

function collectTargetOrgIds(node, selectedId) {
  if (!node) return new Set();
  if (node.id === selectedId) {
    const ids = new Set();
    collectTargetOrgBranch(node, ids);
    return ids;
  }
  for (const child of node.children ?? []) {
    const ids = collectTargetOrgIds(child, selectedId);
    if (ids.size) return ids;
  }
  return new Set();
}

function filterTargetRowsByOrg(rows, orgIds, selectedOrg, rootId) {
  if (selectedOrg === rootId || orgIds.size === 0) return rows;
  return rows.filter((row) => row.type === 'department' ? orgIds.has(row.id) : orgIds.has(row.deptId));
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

function TargetUpdatedAtBadge({ updatedAt }) {
  if (!updatedAt) return null;
  return <span className="mnt-target-updated-at">目标数据已更新：{updatedAt}</span>;
}

function MaintenanceToolbar({ activePage, year, status, targetUpdatedAt, onBack, onDirty, onSave, onYearChange }) {
  const meta = getMaintenancePageMeta(activePage);
  const title = MAINTENANCE_TITLE_TEXT[activePage] ?? meta.title;

  function handleYearChange(event) {
    onYearChange(event.target.value);
    onDirty();
  }

  const actions = {
    'target-maintenance': (
      <>
        <select className="mnt-control mnt-year-control" value={year} onChange={handleYearChange} aria-label="目标年份">
          {YEARS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="mnt-btn" type="button" onClick={onDirty}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onDirty}>Excel导入</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave}>保存目标</button>
      </>
    ),
    'cost-maintenance': (
      <>
        <select className="mnt-control mnt-year-control" value={year} onChange={handleYearChange} aria-label="成本维护年份">
          {YEARS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave}>保存成本</button>
      </>
    ),
    'org-maintenance': (
      <>
        <button className="mnt-btn" type="button" onClick={onDirty}>新增组织</button>
        <button className="mnt-btn" type="button" onClick={onDirty}>更新 BI 销售人员</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave}>保存组织</button>
      </>
    ),
    'channel-maintenance': (
      <>
        <button className="mnt-btn" type="button" onClick={onDirty}>补齐默认来源</button>
        <button className="mnt-btn" type="button" onClick={onDirty}>新增大类</button>
        <button className="mnt-btn" type="button" onClick={onDirty}>新增来源</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave}>保存渠道</button>
      </>
    ),
  };

  return (
    <MaintenanceToolbarSurface className="mnt-toolbar-glass">
      <section className="mnt-toolbar" aria-label={`${title}工具栏`}>
        <div className="mnt-title-block">
          <h2>{title}<span className="mnt-title-scope"> · {meta.scope}</span></h2>
        </div>
        <div className="mnt-actions">
          {actions[activePage] ?? actions['target-maintenance']}
          <button className="mnt-btn" type="button" onClick={onBack}>返回看板</button>
          <TargetUpdatedAtBadge updatedAt={targetUpdatedAt} />
          <SaveBadge status={status} />
        </div>
      </section>
    </MaintenanceToolbarSurface>
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

function MaintenanceSideNav({ nodes, activeId, onSelect }) {
  return (
    <nav className="mnt-side-nav" aria-label="维护侧栏导航">
      <ul>
        {nodes.map((node) => (
          <MaintenanceSideNavNode key={node.id} node={node} activeId={activeId} onSelect={onSelect} />
        ))}
      </ul>
    </nav>
  );
}

function MaintenanceSideNavNode({ node, activeId, onSelect }) {
  const active = node.id === activeId;
  return (
    <li>
      <button
        type="button"
        className={`mnt-side-nav__button${active ? ' mnt-side-nav__button--active' : ''}${node.disabled ? ' mnt-side-nav__button--muted' : ''}`}
        onClick={() => onSelect(node.id)}
      >
        <span>{node.name}</span>
        {node.meta && <small>{node.meta}</small>}
      </button>
      {node.children?.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <MaintenanceSideNavNode key={child.id} node={child} activeId={activeId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
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
    const targetScrollLeft = currentMonthHeader.offsetLeft + currentMonthHeader.offsetWidth - scrollPane.clientWidth;
    scrollPane.scrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
  }, []);

  return scrollPaneRef;
}

function TargetPeriodHeader({ column }) {
  return (
    <th data-target-current-month={column.targetCurrentMonth ? 'true' : undefined}>
      {column.label}
    </th>
  );
}

function TargetPeriodCell({ row, column, onTargetChange }) {
  const period = row.periods[column.key];
  const editable = row.type === 'user' && column.month;

  return (
    <td className={`mnt-period-cell ${editable ? 'mnt-period-cell--editable' : 'mnt-period-cell--readonly'}`}>
      {editable ? (
        <div className="mnt-target-input-wrap">
          <input
            className="mnt-number-input mnt-target-input"
            type="number"
            min="0"
            value={period.target}
            onChange={(event) => onTargetChange(row.id, column.key, event.target.value)}
            aria-label={`${row.name}${column.label}目标`}
          />
          <span className="mnt-target-input-unit">万</span>
        </div>
      ) : (
        <div className="mnt-target-readonly-value">
          <strong>{formatWan(period.target)}</strong>
        </div>
      )}
      <ProgressLine period={period} />
    </td>
  );
}

function TargetMaintenancePage({ markDirty, status, data, onDataChange }) {
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedTargetRow, setSelectedTargetRow] = useState(null);
  const targetScrollPaneRef = useTargetCurrentMonthAlignment();
  const rows = data?.rows ?? TARGET_MAINTENANCE_ROWS;
  const orgTree = data?.orgTree ?? TARGET_MAINTENANCE_ORG_TREE;
  const targetOrgTree = useMemo(() => withTargetAllDepartmentsRoot(orgTree), [orgTree]);
  const targetRows = useMemo(() => rows.map((row) => withTargetAllDepartmentsRow(row, orgTree?.id)), [orgTree?.id, rows]);
  const targetOrgIds = useMemo(() => collectTargetOrgIds(targetOrgTree, selectedOrg), [selectedOrg, targetOrgTree]);
  const visibleTargetRows = useMemo(() => filterTargetRowsByOrg(targetRows, targetOrgIds, selectedOrg, orgTree?.id), [orgTree?.id, selectedOrg, targetOrgIds, targetRows]);

  function handleTargetOrgSelect(orgId) {
    setSelectedOrg(orgId);
    setSelectedTargetRow(null);
  }

  function handleTargetChange(rowId, monthKey, value) {
    onDataChange((current) => ({
      ...current,
      rows: (current.rows ?? []).map((row) => {
        if (row.id !== rowId) return row;
        const periods = {
          ...row.periods,
          [monthKey]: targetPeriod(value, row.periods?.[monthKey]?.actual),
        };
        return { ...row, periods: recalcTargetPeriods(periods) };
      }),
    }));
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--target">
      <Panel title="组织架构" meta={`${rows.filter((row) => row.type === 'user').length} 人`} className="mnt-side-panel">
        <MaintenanceSideNav nodes={[targetOrgTree]} activeId={selectedOrg} onSelect={handleTargetOrgSelect} />
      </Panel>
      <Panel title="年度目标" meta={<SaveBadge status={status} />} className="mnt-main-panel">
        <MatrixShell className="mnt-matrix-wrap--target">
          <div className="mnt-target-matrix">
            <div className="mnt-target-name-pane">
              <table className="mnt-matrix mnt-matrix--target-name">
                <thead>
                  <tr>
                    <th>部门/人员</th>
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
                        <TargetPeriodCell key={column.key} row={row} column={column} onTargetChange={handleTargetChange} />
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
}

function CostMaintenancePage({ markDirty, status, data, onDataChange }) {
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedCostRow, setSelectedCostRow] = useState(null);
  const channels = data?.channels ?? COST_MAINTENANCE_CHANNELS;
  const rows = data?.rows ?? COST_MAINTENANCE_ROWS;
  const laborRows = data?.laborRows ?? LABOR_COST_MAINTENANCE_ROWS;
  const costNavNodes = useMemo(() => buildMaintenanceNavTree(
    channels.map((channel) => ({
      ...channel,
      parentId: channel.id === 'all' ? '' : channel.parentId || 'all',
      meta: channel.kind,
    })),
    { rootId: 'all', countText: '项' }
  ), [channels]);
  const selectedIds = useMemo(() => {
    if (selectedChannel === 'all') return new Set(rows.map((row) => row.id));
    return new Set([
      selectedChannel,
      ...channels.filter((item) => item.parentId === selectedChannel).map((item) => item.id),
    ]);
  }, [channels, rows, selectedChannel]);
  const visibleRows = rows.filter((row) => selectedIds.has(row.id) || selectedChannel === 'all');

  function updateChannelCost(rowId, monthKey, value) {
    onDataChange((current) => ({
      ...current,
      rows: (current.rows ?? []).map((row) => {
        if (row.id !== rowId) return row;
        const currentPeriod = row.periods?.[monthKey] ?? {};
        const periods = {
          ...row.periods,
          [monthKey]: costPeriod(value, currentPeriod.actual, currentPeriod.deals),
        };
        return { ...row, periods: recalcCostPeriods(periods) };
      }),
    }));
    markDirty();
  }

  function updateLaborCost(rowId, monthKey, value) {
    onDataChange((current) => ({
      ...current,
      laborRows: (current.laborRows ?? []).map((row) => {
        if (row.id !== rowId) return row;
        const periods = {
          ...row.periods,
          [monthKey]: laborPeriod(value),
        };
        return { ...row, periods: recalcLaborPeriods(periods) };
      }),
    }));
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--cost">
      <Panel title="渠道树" meta={`${Math.max(0, channels.length - 1)} 个渠道`} className="mnt-side-panel">
        <MaintenanceSideNav nodes={costNavNodes} activeId={selectedChannel} onSelect={setSelectedChannel} />
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
                              <span>成本</span>
                              <input className="mnt-control mnt-number-input" type="number" min="0" value={period.cost} onChange={(event) => updateChannelCost(row.id, column.key, event.target.value)} />
                            </label>
                          ) : (
                            <div className="mnt-mini-line">成本 {formatWan(period.cost)}</div>
                          )}
                          <div className="mnt-mini-line">赢单 {formatWan(period.actual)}</div>
                          <div className="mnt-mini-line">成交 {period.deals} 单</div>
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
        <Panel title="人力成本维护" meta="销售部 / 市场部" className="mnt-main-panel">
          <MatrixShell className="mnt-matrix-wrap--short">
            <table className="mnt-matrix mnt-matrix--labor">
              <thead>
                <tr>
                  <th>成本类型</th>
                  {MAINTENANCE_PERIOD_COLUMNS.map((column) => <th key={column.key}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {laborRows.map((row) => (
                  <tr key={row.id} {...getSelectableRowProps(`labor:${row.id}`, selectedCostRow, setSelectedCostRow)}>
                    <td className="mnt-name-cell">
                      <strong>{row.name}</strong>
                      <span>部门月度固定成本</span>
                    </td>
                    {MAINTENANCE_PERIOD_COLUMNS.map((column) => {
                      const period = row.periods[column.key];
                      return (
                        <td key={column.key} className="mnt-period-cell">
                          {column.month ? (
                            <input className="mnt-control mnt-number-input" type="number" min="0" value={period.cost} onChange={(event) => updateLaborCost(row.id, column.key, event.target.value)} />
                          ) : (
                            <strong>{formatWan(period.cost)}</strong>
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
}

function departmentOptions(departments, currentId = '') {
  return departments.map((dept) => (
    <option key={dept.id} value={dept.id} disabled={dept.id === currentId}>
      {dept.name}
    </option>
  ));
}

function OrgMaintenancePage({ markDirty, status, data, onDataChange }) {
  const departments = data?.departments ?? ORG_MAINTENANCE_DEPARTMENTS;
  const users = data?.users ?? ORG_MAINTENANCE_USERS;
  const [selectedDepartment, setSelectedDepartment] = useState('headquarters');
  const [selectedOrgRow, setSelectedOrgRow] = useState(null);
  const activeDepartment = departments.some((dept) => dept.id === selectedDepartment)
    ? selectedDepartment
    : departments[0]?.id ?? 'headquarters';
  const departmentNavItems = useMemo(() => departments.map((dept) => ({
    ...dept,
    count: users.filter((user) => user.deptId === dept.id && user.enabled).length,
    countText: '人',
  })), [departments, users]);
  const departmentNavNodes = useMemo(
    () => buildMaintenanceNavTree(departmentNavItems, { rootId: 'headquarters', countText: '人' }),
    [departmentNavItems]
  );
  const selectedDepartmentIds = useMemo(
    () => getDescendantIds(departments, activeDepartment),
    [activeDepartment, departments]
  );
  const visibleUsers = activeDepartment === 'headquarters'
    ? users
    : users.filter((user) => selectedDepartmentIds.has(user.deptId));

  function addDepartment() {
    const nextIndex = departments.length + 1;
    onDataChange((current) => ({
      ...current,
      departments: [
        ...(current.departments ?? []),
        { id: `new-dept-${nextIndex}`, name: `新增组织 ${nextIndex}`, parentId: 'department-1001', enabled: true },
      ],
    }));
    markDirty();
  }

  function updateUser(userId, patch) {
    onDataChange((current) => ({
      ...current,
      users: (current.users ?? []).map((user) => (user.id === userId ? { ...user, ...patch } : user)),
    }));
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--org">
      <Panel title="BI组织架构" meta={`${departments.length} 个组织`} className="mnt-side-panel">
        <button className="mnt-btn mnt-local-action" type="button" onClick={addDepartment}>新增组织</button>
        <MaintenanceSideNav nodes={departmentNavNodes} activeId={activeDepartment} onSelect={setSelectedDepartment} />
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
                <th>外部BI ID</th>
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
                    <select className="mnt-control" value={user.deptId} onChange={(event) => updateUser(user.id, { deptId: event.target.value })} aria-label={`${user.name}所属组织`}>
                      {departmentOptions(departments)}
                    </select>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" checked={user.isSales} onChange={(event) => updateUser(user.id, { isSales: event.target.checked })} />
                      销售
                    </label>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" checked={user.enabled} onChange={(event) => updateUser(user.id, { enabled: event.target.checked })} />
                      启用
                    </label>
                  </td>
                  <td><code>{user.externalBiUserId ?? user.sourceUserId}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </MatrixShell>
      </Panel>
    </section>
  );
}

function groupOptions(groups) {
  return (
    <>
      <option value="">选择渠道大类</option>
      {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
    </>
  );
}

function ChannelMaintenancePage({ markDirty, status, data, onDataChange }) {
  const groups = data?.groups ?? CHANNEL_MAINTENANCE_GROUPS;
  const sources = data?.sources ?? CHANNEL_MAINTENANCE_SOURCES;
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedSourceRow, setSelectedSourceRow] = useState(null);
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

  function addGroup(parentId = '') {
    const nextIndex = groups.length + 1;
    onDataChange((current) => ({
      ...current,
      groups: [
        ...(current.groups ?? []),
        { id: `new-channel-${nextIndex}`, name: `新增大类 ${nextIndex}`, parentId, enabled: true },
      ],
    }));
    markDirty();
  }

  function addSource() {
    const nextIndex = sources.length + 1;
    onDataChange((current) => ({
      ...current,
      sources: [
        ...(current.sources ?? []),
        { sourceId: null, code: String(9000 + nextIndex), name: `新增来源 ${nextIndex}`, groupId: groups[0]?.id || '', excluded: false },
      ],
    }));
    markDirty();
  }

  function deleteSource(code) {
    onDataChange((current) => ({
      ...current,
      sources: (current.sources ?? []).filter((source) => source.code !== code),
    }));
    markDirty();
  }

  function updateSource(code, patch) {
    onDataChange((current) => ({
      ...current,
      sources: (current.sources ?? []).map((source) => (source.code === code ? { ...source, ...patch } : source)),
    }));
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--channel">
      <Panel title="渠道大类" meta={`${groups.length} 个大类`} className="mnt-side-panel">
        <button className="mnt-btn mnt-local-action" type="button" onClick={() => addGroup(selectedGroup === 'all' ? '' : selectedGroup)}>新增大类</button>
        <MaintenanceSideNav nodes={channelGroupNavNodes} activeId={selectedGroup} onSelect={setSelectedGroup} />
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
                <th>排除</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleSources.map((source) => (
                <tr key={source.code} {...getSelectableRowProps(`source:${source.code}`, selectedSourceRow, setSelectedSourceRow, source.excluded ? 'mnt-row--muted' : '')}>
                  <td><input className="mnt-control" value={source.code} onChange={(event) => updateSource(source.code, { code: event.target.value })} aria-label={`${source.name}来源编码`} /></td>
                  <td><input className="mnt-control" value={source.name} onChange={(event) => updateSource(source.code, { name: event.target.value })} aria-label={`${source.name}来源名称`} /></td>
                  <td>
                    <select className="mnt-control" value={source.groupId} onChange={(event) => updateSource(source.code, { groupId: event.target.value })} aria-label={`${source.name}归属渠道`}>
                      {groupOptions(groups)}
                    </select>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" checked={source.excluded} onChange={(event) => updateSource(source.code, { excluded: event.target.checked })} />
                      排除
                    </label>
                  </td>
                  <td><button className="mnt-btn mnt-btn--danger" type="button" onClick={() => deleteSource(source.code)}>删除</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </MatrixShell>
      </Panel>
    </section>
  );
}

export default function MaintenancePage({ activePage = 'target-maintenance', onBack }) {
  const [statusByPage, setStatusByPage] = useState({});
  const [targetUpdatedAt, setTargetUpdatedAt] = useState(INITIAL_TARGET_UPDATED_AT);
  const [year, setYear] = useState('2026');
  const [maintenanceData, setMaintenanceData] = useState(() => cloneMaintenanceData());
  const Page = PAGE_RENDERERS[activePage] ?? TargetMaintenancePage;
  const status = statusByPage[activePage] ?? '未修改';
  const dataKey = PAGE_DATA_KEYS[activePage] ?? 'target';

  useEffect(() => {
    let active = true;

    async function loadMaintenanceData() {
      try {
        const response = await fetch(`/api/maintenance/bootstrap?year=${encodeURIComponent(year)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!active) return;
        setMaintenanceData(mergeMaintenanceData(data));
        setStatusByPage((current) => ({ ...current, [activePage]: '已加载数据库' }));
      } catch {
        if (!active) return;
        setMaintenanceData(cloneMaintenanceData());
        setStatusByPage((current) => ({ ...current, [activePage]: '数据库未连接，使用示例数据' }));
      }
    }

    loadMaintenanceData();
    return () => {
      active = false;
    };
  }, [activePage, year]);

  function markDirty() {
    setStatusByPage((current) => ({ ...current, [activePage]: '有未保存修改' }));
  }

  function updatePageData(key, updater) {
    setMaintenanceData((current) => ({
      ...current,
      [key]: typeof updater === 'function' ? updater(current[key]) : updater,
    }));
  }

  async function saveActivePage() {
    const resource = PAGE_API_RESOURCES[activePage] ?? 'targets';
    setStatusByPage((current) => ({ ...current, [activePage]: '保存中' }));

    try {
      const response = await fetch(`/api/maintenance/${resource}?year=${encodeURIComponent(year)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          data: maintenanceData[dataKey],
        }),
      });
      const saved = await response.json();
      if (!response.ok) throw new Error(saved?.error || `HTTP ${response.status}`);
      setMaintenanceData((current) => ({
        ...current,
        [dataKey]: saved,
      }));
      setTargetUpdatedAt(nowFullLabel());
      setStatusByPage((current) => ({ ...current, [activePage]: `已保存 ${nowLabel()}` }));
    } catch {
      setStatusByPage((current) => ({ ...current, [activePage]: '保存失败' }));
    }
  }

  return (
    <div className="mnt-page">
      <MaintenanceToolbar
        activePage={activePage}
        year={year}
        status={status}
        targetUpdatedAt={targetUpdatedAt}
        onBack={onBack}
        onDirty={markDirty}
        onSave={saveActivePage}
        onYearChange={setYear}
      />
      <Page
        data={maintenanceData[dataKey]}
        markDirty={markDirty}
        status={status}
        onDataChange={(updater) => updatePageData(dataKey, updater)}
      />
    </div>
  );
}
