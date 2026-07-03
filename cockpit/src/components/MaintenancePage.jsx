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
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

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

function MaintenanceToolbar({ activePage, status, onBack, onDirty, onSave }) {
  const meta = getMaintenancePageMeta(activePage);
  const title = MAINTENANCE_TITLE_TEXT[activePage] ?? meta.title;
  const [year, setYear] = useState('2026');

  function handleYearChange(event) {
    setYear(event.target.value);
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

function TargetPeriodCell({ row, column, markDirty }) {
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
            defaultValue={period.target}
            onChange={markDirty}
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

function TargetMaintenancePage({ markDirty, status }) {
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedTargetRow, setSelectedTargetRow] = useState(null);
  const targetScrollPaneRef = useTargetCurrentMonthAlignment();
  const rows = TARGET_MAINTENANCE_ROWS;

  return (
    <section className="mnt-layout mnt-layout--target">
      <Panel title="组织架构" meta={`${rows.filter((row) => row.type === 'user').length} 人`} className="mnt-side-panel">
        <MaintenanceSideNav nodes={[TARGET_MAINTENANCE_ORG_TREE]} activeId={selectedOrg} onSelect={setSelectedOrg} />
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
                  {rows.map((row) => (
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
                  {rows.map((row) => (
                    <tr key={row.id} {...getSelectableRowProps(`target:${row.id}`, selectedTargetRow, setSelectedTargetRow, row.type === 'department' ? 'mnt-row--summary' : '')}>
                      {TARGET_PERIOD_COLUMNS.map((column) => (
                        <TargetPeriodCell key={column.key} row={row} column={column} markDirty={markDirty} />
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

function CostMaintenancePage({ markDirty, status }) {
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedCostRow, setSelectedCostRow] = useState(null);
  const costNavNodes = useMemo(() => buildMaintenanceNavTree(
    COST_MAINTENANCE_CHANNELS.map((channel) => ({
      ...channel,
      parentId: channel.id === 'all' ? '' : channel.parentId || 'all',
      meta: channel.kind,
    })),
    { rootId: 'all', countText: '项' }
  ), []);
  const selectedIds = useMemo(() => {
    if (selectedChannel === 'all') return new Set(COST_MAINTENANCE_ROWS.map((row) => row.id));
    return new Set([
      selectedChannel,
      ...COST_MAINTENANCE_CHANNELS.filter((item) => item.parentId === selectedChannel).map((item) => item.id),
    ]);
  }, [selectedChannel]);
  const visibleRows = COST_MAINTENANCE_ROWS.filter((row) => selectedIds.has(row.id) || selectedChannel === 'all');

  return (
    <section className="mnt-layout mnt-layout--cost">
      <Panel title="渠道树" meta={`${COST_MAINTENANCE_CHANNELS.length - 1} 个渠道`} className="mnt-side-panel">
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
                              <input className="mnt-control mnt-number-input" type="number" min="0" defaultValue={period.cost} onChange={markDirty} />
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
                {LABOR_COST_MAINTENANCE_ROWS.map((row) => (
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
                            <input className="mnt-control mnt-number-input" type="number" min="0" defaultValue={period.cost} onChange={markDirty} />
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

function departmentOptions(currentId = '') {
  return ORG_MAINTENANCE_DEPARTMENTS.map((dept) => (
    <option key={dept.id} value={dept.id} disabled={dept.id === currentId}>
      {dept.name}
    </option>
  ));
}

function OrgMaintenancePage({ markDirty, status }) {
  const [departments, setDepartments] = useState(ORG_MAINTENANCE_DEPARTMENTS);
  const [selectedDepartment, setSelectedDepartment] = useState('headquarters');
  const [selectedOrgRow, setSelectedOrgRow] = useState(null);
  const departmentNavItems = useMemo(() => departments.map((dept) => ({
    ...dept,
    count: ORG_MAINTENANCE_USERS.filter((user) => user.deptId === dept.id && user.enabled).length,
    countText: '人',
  })), [departments]);
  const departmentNavNodes = useMemo(
    () => buildMaintenanceNavTree(departmentNavItems, { rootId: 'headquarters', countText: '人' }),
    [departmentNavItems]
  );
  const selectedDepartmentIds = useMemo(
    () => getDescendantIds(departments, selectedDepartment),
    [departments, selectedDepartment]
  );
  const visibleUsers = selectedDepartment === 'headquarters'
    ? ORG_MAINTENANCE_USERS
    : ORG_MAINTENANCE_USERS.filter((user) => selectedDepartmentIds.has(user.deptId));

  function addDepartment() {
    const nextIndex = departments.length + 1;
    setDepartments([
      ...departments,
      { id: `new-dept-${nextIndex}`, name: `新增组织 ${nextIndex}`, parentId: 'headquarters', enabled: true },
    ]);
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--org">
      <Panel title="BI组织架构" meta={`${departments.length} 个组织`} className="mnt-side-panel">
        <button className="mnt-btn mnt-local-action" type="button" onClick={addDepartment}>新增组织</button>
        <MaintenanceSideNav nodes={departmentNavNodes} activeId={selectedDepartment} onSelect={setSelectedDepartment} />
      </Panel>
      <Panel title="BI人员范围" meta={<><span>{ORG_MAINTENANCE_USERS.filter((user) => user.isSales && user.enabled).length} 名销售</span> <SaveBadge status={status} /></>} className="mnt-main-panel">
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
                    <select className="mnt-control" defaultValue={user.deptId} onChange={markDirty} aria-label={`${user.name}所属组织`}>
                      {departmentOptions()}
                    </select>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" defaultChecked={user.isSales} onChange={markDirty} />
                      销售
                    </label>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" defaultChecked={user.enabled} onChange={markDirty} />
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
}

function groupOptions(groups) {
  return (
    <>
      <option value="">选择渠道大类</option>
      {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
    </>
  );
}

function ChannelMaintenancePage({ markDirty, status }) {
  const [groups, setGroups] = useState(CHANNEL_MAINTENANCE_GROUPS);
  const [sources, setSources] = useState(CHANNEL_MAINTENANCE_SOURCES);
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
    setGroups([
      ...groups,
      { id: `new-channel-${nextIndex}`, name: `新增大类 ${nextIndex}`, parentId, enabled: true },
    ]);
    markDirty();
  }

  function addSource() {
    const nextIndex = sources.length + 1;
    setSources([
      ...sources,
      { code: String(9000 + nextIndex), name: `新增来源 ${nextIndex}`, groupId: groups[0]?.id || '', enabled: true, excluded: false },
    ]);
    markDirty();
  }

  function deleteSource(code) {
    setSources(sources.filter((source) => source.code !== code));
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
                <th>启用</th>
                <th>排除</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleSources.map((source) => (
                <tr key={source.code} {...getSelectableRowProps(`source:${source.code}`, selectedSourceRow, setSelectedSourceRow, source.excluded ? 'mnt-row--muted' : '')}>
                  <td><input className="mnt-control" defaultValue={source.code} onChange={markDirty} aria-label={`${source.name}来源编码`} /></td>
                  <td><input className="mnt-control" defaultValue={source.name} onChange={markDirty} aria-label={`${source.name}来源名称`} /></td>
                  <td>
                    <select className="mnt-control" defaultValue={source.groupId} onChange={markDirty} aria-label={`${source.name}归属渠道`}>
                      {groupOptions(groups)}
                    </select>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" defaultChecked={source.enabled} onChange={markDirty} />
                      启用
                    </label>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" defaultChecked={source.excluded} onChange={markDirty} />
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
  const Page = PAGE_RENDERERS[activePage] ?? TargetMaintenancePage;
  const status = statusByPage[activePage] ?? '未修改';

  function markDirty() {
    setStatusByPage((current) => ({ ...current, [activePage]: '有未保存修改' }));
  }

  function markSaved() {
    setStatusByPage((current) => ({ ...current, [activePage]: `已保存 ${nowLabel()}` }));
  }

  return (
    <div className="mnt-page">
      <MaintenanceToolbar
        activePage={activePage}
        status={status}
        onBack={onBack}
        onDirty={markDirty}
        onSave={markSaved}
      />
      <Page markDirty={markDirty} status={status} />
    </div>
  );
}
