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

function TargetTreeNode({ node, activeId, onSelect }) {
  return (
    <li>
      <button
        type="button"
        className={`mnt-tree-button${node.id === activeId ? ' mnt-tree-button--active' : ''}`}
        onClick={() => onSelect(node.id)}
      >
        <span>{node.name}</span>
        <small>{node.userCount} 人</small>
      </button>
      {node.children?.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TargetTreeNode key={child.id} node={child} activeId={activeId} onSelect={onSelect} />
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
    <td className="mnt-period-cell">
      {editable ? (
        <input
          className="mnt-control mnt-number-input"
          type="number"
          min="0"
          defaultValue={period.target}
          onChange={markDirty}
          aria-label={`${row.name}${column.label}目标`}
        />
      ) : (
        <strong>{formatWan(period.target)}</strong>
      )}
      <ProgressLine period={period} />
    </td>
  );
}

function TargetMaintenancePage({ markDirty, status }) {
  const [selectedOrg, setSelectedOrg] = useState('all');
  const targetScrollPaneRef = useTargetCurrentMonthAlignment();
  const rows = TARGET_MAINTENANCE_ROWS;

  return (
    <section className="mnt-layout mnt-layout--target">
      <Panel title="组织架构" meta={`${rows.filter((row) => row.type === 'user').length} 人`} className="mnt-side-panel">
        <div className="mnt-tree">
          <ul>
            <TargetTreeNode node={TARGET_MAINTENANCE_ORG_TREE} activeId={selectedOrg} onSelect={setSelectedOrg} />
          </ul>
        </div>
      </Panel>
      <Panel title="年度目标" meta={<SaveBadge status={status} />} className="mnt-main-panel">
        <MatrixShell className="mnt-matrix-wrap--target">
          <div className="mnt-target-scroll-pane" ref={targetScrollPaneRef}>
            <table className="mnt-matrix mnt-matrix--target">
              <thead>
                <tr>
                  <th>部门/人员</th>
                  {TARGET_PERIOD_COLUMNS.map((column) => <TargetPeriodHeader key={column.key} column={column} />)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={row.type === 'department' ? 'mnt-row--summary' : ''}>
                    <td className="mnt-name-cell">
                      <strong>{row.name}</strong>
                      <span>{row.role}</span>
                    </td>
                    {TARGET_PERIOD_COLUMNS.map((column) => (
                      <TargetPeriodCell key={column.key} row={row} column={column} markDirty={markDirty} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MatrixShell>
      </Panel>
    </section>
  );
}

function channelDepth(channelId, channels = COST_MAINTENANCE_CHANNELS) {
  let depth = 0;
  let current = channels.find((item) => item.id === channelId);
  while (current?.parentId) {
    depth += 1;
    current = channels.find((item) => item.id === current.parentId);
  }
  return depth;
}

function CostMaintenancePage({ markDirty, status }) {
  const [selectedChannel, setSelectedChannel] = useState('all');
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
        <div className="mnt-channel-tree">
          {COST_MAINTENANCE_CHANNELS.map((channel) => (
            <label
              key={channel.id}
              className={`mnt-channel-row${selectedChannel === channel.id ? ' mnt-channel-row--active' : ''}`}
              style={{ '--depth': channelDepth(channel.id) }}
            >
              <input
                type="radio"
                name="cost-channel"
                checked={selectedChannel === channel.id}
                onChange={() => setSelectedChannel(channel.id)}
              />
              <span>{channel.name}</span>
              <small>{channel.kind}</small>
            </label>
          ))}
        </div>
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
                  <tr key={row.id} className={row.type === 'group' ? 'mnt-row--summary' : ''}>
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
                  <tr key={row.id}>
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
        <div className="mnt-edit-list">
          {departments.map((dept) => (
            <div key={dept.id} className={`mnt-edit-row${dept.enabled ? '' : ' mnt-edit-row--muted'}`}>
              <input className="mnt-control" defaultValue={dept.name} onChange={markDirty} aria-label={`${dept.name}组织名称`} />
              <select className="mnt-control" defaultValue={dept.parentId} onChange={markDirty} aria-label={`${dept.name}上级组织`}>
                <option value="">无上级</option>
                {departmentOptions(dept.id)}
              </select>
              <label className="mnt-check">
                <input type="checkbox" defaultChecked={dept.enabled} onChange={markDirty} />
                启用
              </label>
            </div>
          ))}
        </div>
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
              {ORG_MAINTENANCE_USERS.map((user) => (
                <tr key={user.id} className={user.enabled && user.isSales ? '' : 'mnt-row--muted'}>
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
        <button className="mnt-btn mnt-local-action" type="button" onClick={() => addGroup('')}>新增大类</button>
        <div className="mnt-edit-list">
          {groups.map((group) => (
            <div key={group.id} className={`mnt-channel-manage-row${group.enabled ? '' : ' mnt-edit-row--muted'}`} style={{ '--depth': group.parentId ? 1 : 0 }}>
              <span className="mnt-tree-caret">›</span>
              <input className="mnt-control" defaultValue={group.name} onChange={markDirty} aria-label={`${group.name}渠道大类名称`} />
              <label className="mnt-check">
                <input type="checkbox" defaultChecked={group.enabled} onChange={markDirty} />
                启用
              </label>
              <button className="mnt-btn mnt-btn--tiny" type="button" onClick={() => addGroup(group.id)}>新增下级</button>
            </div>
          ))}
        </div>
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
              {sources.map((source) => (
                <tr key={source.code} className={source.excluded ? 'mnt-row--muted' : ''}>
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
