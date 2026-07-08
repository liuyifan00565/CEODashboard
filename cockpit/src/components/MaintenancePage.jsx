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
  buildChannelSaveRows,
} from '../lib/maintenanceSaveBuilders.js';
import MaintenanceImportDialog from './MaintenanceImportDialog.jsx';
import GlassSelect from './GlassSelect.jsx';

const YEARS = [2024, 2025, 2026, 2027];
const YEAR_OPTIONS = YEARS.map((item) => ({ value: String(item), label: String(item) }));

const EMPTY_ARRAY = [];

function makeSelectOptions(items, emptyLabel = '') {
  const choices = (items ?? []).map((item) => ({
    value: String(item.id ?? ''),
    label: item.name ?? String(item.id ?? ''),
  }));
  return emptyLabel ? [{ value: '', label: emptyLabel }, ...choices] : choices;
}

const MAINTENANCE_TITLE_TEXT = {
  'target-maintenance': '目标维护',
  'cost-maintenance': '成本维护',
  'org-maintenance': '组织维护',
  'channel-maintenance': '渠道维护',
};

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

function MaintenanceToolbar({ activePage, status, year, saving, onYearChange, onBack, onDirty, onSave, onImport, onDownloadTemplate }) {
  const meta = getMaintenancePageMeta(activePage);
  const title = MAINTENANCE_TITLE_TEXT[activePage] ?? meta.title;

  function handleYearChange(nextYear) {
    onYearChange?.(nextYear);
    onDirty();
  }

  const actions = {
    'target-maintenance': (
      <>
        <GlassSelect className="mnt-control mnt-year-control" value={year} onChange={handleYearChange} aria-label="目标年份" disabled={saving} options={YEAR_OPTIONS} />
        <button className="mnt-btn" type="button" onClick={onDownloadTemplate} disabled={saving}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onImport} disabled={saving}>Excel导入</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave} disabled={saving}>{saving ? '保存中…' : '保存目标'}</button>
      </>
    ),
    'cost-maintenance': (
      <>
        <GlassSelect className="mnt-control mnt-year-control" value={year} onChange={handleYearChange} aria-label="成本维护年份" disabled={saving} options={YEAR_OPTIONS} />
        <button className="mnt-btn" type="button" onClick={onDownloadTemplate} disabled={saving}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onImport} disabled={saving}>Excel导入</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave} disabled={saving}>{saving ? '保存中…' : '保存成本'}</button>
      </>
    ),
    'org-maintenance': (
      <>
        <button className="mnt-btn" type="button" onClick={onDownloadTemplate} disabled={saving}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onImport} disabled={saving}>Excel导入</button>
        <button className="mnt-btn" type="button" onClick={onDirty} disabled={saving}>新增组织</button>
        <button className="mnt-btn" type="button" onClick={onDirty} disabled={saving}>更新 BI 销售人员</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave} disabled={saving}>{saving ? '保存中…' : '保存组织'}</button>
      </>
    ),
    'channel-maintenance': (
      <>
        <button className="mnt-btn" type="button" onClick={onDownloadTemplate} disabled={saving}>下载模板</button>
        <button className="mnt-btn" type="button" onClick={onImport} disabled={saving}>Excel导入</button>
        <button className="mnt-btn" type="button" onClick={onDirty} disabled={saving}>补齐默认来源</button>
        <button className="mnt-btn" type="button" onClick={onDirty} disabled={saving}>新增大类</button>
        <button className="mnt-btn" type="button" onClick={onDirty} disabled={saving}>新增来源</button>
        <button className="mnt-btn mnt-btn--primary" type="button" onClick={onSave} disabled={saving}>{saving ? '保存中…' : '保存渠道'}</button>
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
          {saving
            ? <span className="mnt-saving-hint">正在写入数据库…</span>
            : <span className="mnt-save-hint" title="页内编辑保存后写入数据库；新增组织/大类仅本会话有效">页内可保存</span>}
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

function TargetPeriodCell({ row, column, onEdit }) {
  const period = row.periods[column.key];
  const editable = row.type === 'user' && column.month;

  return (
    <td
      className={`mnt-period-cell ${editable ? 'mnt-period-cell--editable' : 'mnt-period-cell--readonly'}`}
      data-target-editable={editable ? 'true' : 'false'}
      title={editable ? '可填写目标' : '汇总目标，不可直接填写'}
    >
      {editable ? (
        <div className="mnt-target-input-wrap">
          <input
            className="mnt-number-input mnt-target-input"
            type="number"
            min="0"
            defaultValue={period.target}
            onChange={(e) => onEdit?.(row.id, column.key, e.target.value)}
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

const TargetMaintenancePage = forwardRef(function TargetMaintenancePage({ markDirty, status, rows, orgTree, year }, ref) {
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedTargetRow, setSelectedTargetRow] = useState(null);
  const targetScrollPaneRef = useTargetCurrentMonthAlignment();
  const draftRef = useRef({});
  const rowList = rows ?? [];
  const selectedTargetRowIndex = rowList.findIndex((row) => `target:${row.id}` === selectedTargetRow);

  useImperativeHandle(ref, () => ({
    collect: () => ({ rows: buildTargetSaveRows(rowList, draftRef.current, year), laborRows: [], deletions: [] }),
  }), [rowList, year]);

  function handleEdit(rowId, monthKey, value) {
    draftRef.current[`${rowId}|${monthKey}`] = Number(value) || 0;
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--target">
      <Panel title="组织架构" meta={`${rowList.filter((row) => row.type === 'user').length} 人`} className="mnt-side-panel">
        <MaintenanceSideNav nodes={orgTree ? [orgTree] : []} activeId={selectedOrg} onSelect={setSelectedOrg} />
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
                  {rowList.map((row) => (
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
                  {rowList.map((row) => (
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
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedCostRow, setSelectedCostRow] = useState(null);
  const channels = costChannels ?? EMPTY_ARRAY;
  const allRows = costRows ?? EMPTY_ARRAY;
  const laborList = laborRows ?? EMPTY_ARRAY;
  const draftRef = useRef({});
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

  useImperativeHandle(ref, () => ({
    collect: () => {
      const r = buildCostSaveRows({ rows: allRows, laborRows: laborList }, draftRef.current, year);
      return { rows: r.rows, laborRows: r.laborRows, deletions: [] };
    },
  }), [allRows, laborList, year]);

  function handleEdit(rowId, monthKey, value) {
    draftRef.current[`${rowId}|${monthKey}`] = Number(value) || 0;
    markDirty();
  }

  return (
    <section className="mnt-layout mnt-layout--cost">
      <Panel title="渠道树" meta={`${channels.length - 1} 个渠道`} className="mnt-side-panel">
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
                              <input className="mnt-control mnt-number-input" type="number" min="0" defaultValue={period.cost} onChange={(e) => handleEdit(row.id, column.key, e.target.value)} />
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
                {laborList.map((row) => (
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
                            <input className="mnt-control mnt-number-input" type="number" min="0" defaultValue={period.cost} onChange={(e) => handleEdit(row.id, column.key, e.target.value)} />
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
  const departmentNavNodes = useMemo(
    () => buildMaintenanceNavTree(departmentNavItems, { rootId: 'headquarters', countText: '人' }),
    [departmentNavItems]
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
    collect: () => ({ rows: buildOrgSaveRows(users, draftRef.current), laborRows: [], deletions: [] }),
  }), [users]);

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
  const deletedCodesRef = useRef([]);
  const newCounterRef = useRef(0);
  useEffect(() => {
    setGroups(propGroups ?? []);
    setSources((propSources ?? []).map((s) => ({ ...s, _uid: s.code, _isNew: false })));
    deletedCodesRef.current = [];
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

  useImperativeHandle(ref, () => ({
    collect: () => {
      const r = buildChannelSaveRows(sources, deletedCodesRef.current);
      return { rows: r.rows, laborRows: [], deletions: r.deletions };
    },
  }), [sources]);

  function updateSource(uid, patch) {
    setSources(sources.map((s) => (s._uid === uid ? { ...s, ...patch } : s)));
    markDirty();
  }

  function addGroup(parentId = '') {
    const nextIndex = groups.length + 1;
    setGroups([
      ...groups,
      { id: `new-channel-${nextIndex}`, name: `新增大类 ${nextIndex}`, parentId, enabled: true },
    ]);
    markDirty();
  }

  function addSource() {
    newCounterRef.current += 1;
    const uid = `new-${newCounterRef.current}`;
    setSources([
      ...sources,
      { _uid: uid, _isNew: true, code: String(9000 + newCounterRef.current), name: `新增来源 ${newCounterRef.current}`, groupId: groups[0]?.id || '', enabled: true, excluded: false },
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
                      <input type="checkbox" checked={!!source.enabled} onChange={(e) => updateSource(source._uid, { enabled: e.target.checked })} />
                      启用
                    </label>
                  </td>
                  <td>
                    <label className="mnt-check">
                      <input type="checkbox" checked={!!source.excluded} onChange={(e) => updateSource(source._uid, { excluded: e.target.checked })} />
                      排除
                    </label>
                  </td>
                  <td><button className="mnt-btn mnt-btn--danger" type="button" onClick={() => deleteSource(source)}>删除</button></td>
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
  'target-maintenance': TargetMaintenancePage,
  'cost-maintenance': CostMaintenancePage,
  'org-maintenance': OrgMaintenancePage,
  'channel-maintenance': ChannelMaintenancePage,
};

export default function MaintenancePage({ activePage = 'target-maintenance', onBack }) {
  const [statusByPage, setStatusByPage] = useState({});
  const [importOpen, setImportOpen] = useState(false);
  const [year, setYear] = useState('2026');
  const [data, setData] = useState(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const pageRef = useRef(null);
  const Page = PAGE_RENDERERS[activePage] ?? TargetMaintenancePage;
  const status = statusByPage[activePage] ?? '未修改';
  const importConfig = getImportConfig(activePage);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchMaintenanceData(activePage, year)
      .then((d) => {
        if (!cancelled) {
          setData(d);
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

  function markDirty() {
    setStatusByPage((current) => ({ ...current, [activePage]: '有未保存修改' }));
  }

  function markSaved() {
    setStatusByPage((current) => ({ ...current, [activePage]: `已保存 ${nowLabel()}` }));
  }

  function handleDownloadTemplate() {
    if (importConfig) downloadTemplate(importConfig);
  }

  function handleImported() {
    // 导入写库后重拉数据，让表单显示新行
    setDataVersion((v) => v + 1);
    markDirty();
  }

  async function handleSave() {
    if (saving) return;
    const collected = pageRef.current?.collect?.();
    const payload = {
      pageKey: activePage,
      year,
      rows: collected?.rows ?? [],
      laborRows: collected?.laborRows ?? [],
      deletions: collected?.deletions ?? [],
    };
    if (!payload.rows.length && !payload.laborRows.length && !payload.deletions.length) {
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
      case 'target-maintenance': return { rows: d.rows, orgTree: d.orgTree };
      case 'cost-maintenance': return { costChannels: d.channels, costRows: d.rows, laborRows: d.laborRows };
      case 'org-maintenance': return { departments: d.departments, users: d.users };
      case 'channel-maintenance': return { groups: d.groups, sources: d.sources };
      default: return {};
    }
  })();

  return (
    <div className={`mnt-page${saving ? ' mnt-page--saving' : ''}`}>
      <MaintenanceToolbar
        activePage={activePage}
        status={status}
        year={year}
        saving={saving}
        onYearChange={setYear}
        onBack={onBack}
        onDirty={markDirty}
        onSave={handleSave}
        onImport={() => setImportOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
      />
      {loading && <div className="mnt-state-line">正在加载真实数据库…</div>}
      {error && <div className="mnt-state-line mnt-state-line--error">加载失败：{error}</div>}
      {saveError && <div className="mnt-state-line mnt-state-line--error">{saveError}</div>}
      {!loading && !error && data && (
        <>
          <Page
            ref={pageRef}
            key={`${activePage}-${year}-${dataVersion}`}
            markDirty={markDirty}
            status={status}
            year={year}
            {...pageProps}
          />
          {saving && <div className="mnt-saving-overlay" aria-live="polite">正在写入数据库…</div>}
        </>
      )}
      {importOpen && importConfig && (
        <MaintenanceImportDialog
          config={importConfig}
          onClose={() => setImportOpen(false)}
          onImported={handleImported}
        />
      )}
    </div>
  );
}
