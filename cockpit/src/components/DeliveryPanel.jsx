/*
 更新时间: 2026-07-14 18:03:05 CST
 更新内容: 合并六项月度微型方向坡度图，以及渠道与团队行选择联动右侧配置人员完成情况。
*/
/*
 更新时间: 2026-07-14 15:30:13 CST
 更新内容: 本地显式开关开启时重新加载 2026-06、2026-07 售前试用演示快照，并在页头明确标注演示属性。
*/
/*
 更新时间: 2026-07-14 15:11:44 CST
 更新内容: 将月度对比压缩为六项决策带，并把转化与人员负载合并为同屏双栏交付执行明细。
*/
/*
 更新时间: 2026-07-14 21:10:00 CST
 更新内容: 优化交付环比半环卡，改善状态改为明确绿色，半环与文字分区展示，并为超过 100% 的变化增加标记。
*/
/*
 更新时间: 2026-07-14 13:35:39 CST
 更新内容: 将默认空数据加载器提升为稳定模块常量，避免交付页因 effect 依赖变化无限重载。
*/
/*
 更新时间: 2026-07-14 13:18:00 CST
 更新内容: 默认停用售前试用演示快照，真实接口接入前仅展示无数据状态。
 */
/*
 更新时间: 2026-07-14 12:10:00 CST
 更新内容: 将交付页重构为售前试用转化与配置负载长看板，新增月份联动、环图筛选、阶段风险、月度对比和三张紧凑经营表。
 */
import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_PRESALE_TRIAL_MONTH,
  DELIVERY_CAPACITY_LIMIT,
  PRESALE_TRIAL_MONTH_OPTIONS,
  loadPresaleTrialDashboard,
} from '../data/presaleTrialDelivery';
import { useThemeTokens } from '../lib/theme';
import EChart from './EChart';
import GlassSelect from './GlassSelect.jsx';
import Segmented from './Segmented';
import './DeliveryPanel.css';

const DISTRIBUTION_OPTIONS = [
  { value: 'count', label: '客户数量' },
  { value: 'amount', label: '预计成交金额' },
];

const CONVERSION_DIMENSION_OPTIONS = [
  { value: 'team', label: '按团队' },
  { value: 'channel', label: '按渠道' },
];

const TONE_NAMES = new Set(['good', 'warn', 'risk', 'neutral', 'info', 'primary']);
const EMPTY_DELIVERY_LOADER = () => Promise.resolve(null);
const PRESALE_TRIAL_DEMO_ENABLED = import.meta.env.VITE_ENABLE_PRESALE_TRIAL_DEMO === 'true';
const DEFAULT_DELIVERY_LOADER = PRESALE_TRIAL_DEMO_ENABLED
  ? loadPresaleTrialDashboard
  : EMPTY_DELIVERY_LOADER;

function safeTone(tone) {
  return TONE_NAMES.has(tone) ? tone : 'neutral';
}

function formatInt(value) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function formatWan(value) {
  return `${(Number(value) || 0).toFixed(1)}万`;
}

function formatPct(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

function ratio(value, total) {
  return total > 0 ? (Number(value || 0) / total) * 100 : 0;
}

function compactMonthLabel(label) {
  const month = String(label || '').match(/(\d{1,2})月/);
  return month ? `${Number(month[1])}月` : String(label || '');
}

function getComparisonDirection(currentValue, previousValue) {
  if (currentValue > previousValue) return 'up';
  if (currentValue < previousValue) return 'down';
  return 'flat';
}

function buildDistributionOption({ snapshot, metric, selectedChannel, tokens }) {
  const totalCount = snapshot.distribution.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const totalAmount = snapshot.distribution.reduce((sum, item) => sum + Number(item.expectedAmountWan || 0), 0);
  const palette = [tokens.accentMid, tokens.semanticCapacity, tokens.chartCyan, tokens.semanticGoal];

  return {
    backgroundColor: 'transparent',
    animationDuration: 420,
    animationDurationUpdate: 280,
    animationEasing: 'cubicOut',
    aria: {
      enabled: true,
      description: `${snapshot.monthLabel}当前试用客户渠道分布`,
    },
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      confine: true,
      backgroundColor: tokens.chartTooltipBg,
      borderColor: tokens.chartTooltipBorder,
      borderWidth: 1,
      padding: [11, 12],
      extraCssText: 'border-radius:12px;backdrop-filter:blur(18px) saturate(140%);box-shadow:0 14px 34px rgba(0,0,0,.34)',
      textStyle: { color: tokens.text, fontSize: 12, fontFamily: 'inherit' },
      formatter: (params) => {
        const item = params.data;
        return [
          `<div style="font-size:13px;font-weight:750;color:${tokens.text};margin-bottom:8px">${item.name}</div>`,
          `<div style="display:flex;justify-content:space-between;gap:22px;line-height:1.8;color:${tokens.muted}"><span>客户数量</span><b style="color:${tokens.text}">${formatInt(item.count)}个 · ${formatPct(ratio(item.count, totalCount))}</b></div>`,
          `<div style="display:flex;justify-content:space-between;gap:22px;line-height:1.8;color:${tokens.muted}"><span>预计金额</span><b style="color:${tokens.semanticGoal}">${formatWan(item.expectedAmountWan)} · ${formatPct(ratio(item.expectedAmountWan, totalAmount))}</b></div>`,
        ].join('');
      },
    },
    series: [
      {
        name: '当前试用客户分布',
        type: 'pie',
        radius: ['58%', '82%'],
        center: ['50%', '51%'],
        startAngle: 90,
        clockwise: true,
        minAngle: 3,
        padAngle: 2,
        selectedMode: 'single',
        selectedOffset: 4,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 4 },
        itemStyle: {
          borderColor: tokens.theme === 'light' ? '#F3F6FA' : '#0B1020',
          borderWidth: 2,
          borderRadius: 5,
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,.18)',
        },
        data: snapshot.distribution.map((item, index) => ({
          ...item,
          value: metric === 'amount' ? item.expectedAmountWan : item.count,
          selected: item.key === selectedChannel,
          itemStyle: { color: palette[index % palette.length] },
        })),
      },
    ],
  };
}

function PageHeader({ monthKey, onMonthChange, loading, updatedAt, demo }) {
  return (
    <header className="dlv-page-head">
      <div>
        <h2 id="delivery-dashboard-title">交付看板</h2>
        <p>
          售前试用转化与配置负载
          {demo && <span className="dlv-demo-badge">演示快照 · 非生产数据</span>}
        </p>
      </div>
      <div className="dlv-page-head__actions">
        <label className="dlv-month-control">
          <span>月份</span>
          <GlassSelect
            value={monthKey}
            onChange={onMonthChange}
            options={PRESALE_TRIAL_MONTH_OPTIONS}
            aria-label="选择交付看板月份"
            disabled={loading}
            align="end"
            className="dlv-month-select"
          />
        </label>
        <span className="dlv-updated-at">截至 {updatedAt || '2026-07-14 10:30'}</span>
      </div>
    </header>
  );
}

function KpiCard({ label, value, unit, helper, tone = 'primary' }) {
  return (
    <article className={`dlv-kpi dlv-kpi--${safeTone(tone)}`}>
      <span>{label}</span>
      <div className="dlv-kpi__value">
        <strong>{value}</strong>
        {unit && <i>{unit}</i>}
      </div>
      <p>{helper}</p>
    </article>
  );
}

function Panel({ title, subtitle, actions, className = '', children }) {
  return (
    <section className={`dlv-card${className ? ` ${className}` : ''}`}>
      <header className="dlv-card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="dlv-card-head__actions">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

function ComparisonSlope({ row, monthLabel, previousMonthLabel }) {
  const direction = getComparisonDirection(row.currentRaw, row.previousRaw);
  const tone = safeTone(row.statusTone);
  const currentPointY = direction === 'up' ? '18%' : direction === 'down' ? '82%' : '50%';
  const ariaLabel = `${row.label}：${previousMonthLabel}${row.previousLabel}到${monthLabel}${row.currentLabel}，${row.status}，环比${row.changeLabel}`;

  return (
    <article className="dlv-comparison-item">
      <figure
        className={`dlv-slope dlv-slope--${tone} dlv-slope--${direction}`}
        aria-label={ariaLabel}
      >
        <figcaption className="dlv-slope__head">
          <span>{row.label}</span>
          <span className={`dlv-slope__result dlv-slope__result--${tone}`}>
            <em>{row.status}</em>
            <b>{row.changeLabel}</b>
          </span>
        </figcaption>
        <svg className="dlv-slope__plot" width="100%" height="28" aria-hidden="true" focusable="false">
          <line className="dlv-slope__line" x1="4%" y1="50%" x2="96%" y2={currentPointY} pathLength="1" />
          <circle className="dlv-slope__point dlv-slope__point--previous" cx="4%" cy="50%" r="3" />
          <circle className="dlv-slope__point dlv-slope__point--current" cx="96%" cy={currentPointY} r="4" />
        </svg>
        <div className="dlv-slope__values">
          <span><em>{compactMonthLabel(previousMonthLabel)}</em><b>{row.previousLabel}</b></span>
          <span><em>{compactMonthLabel(monthLabel)}</em><b>{row.currentLabel}</b></span>
        </div>
      </figure>
    </article>
  );
}

function ComparisonBand({ rows, monthLabel, previousMonthLabel }) {
  return (
    <section className="dlv-comparison-band" aria-labelledby="delivery-comparison-title">
      <header className="dlv-comparison-head">
        <div>
          <h3 id="delivery-comparison-title">本月与上月交付对比</h3>
          <p>连线只看方向，环比看幅度；风险和周期下降为改善</p>
        </div>
        <span className="dlv-period-note">{monthLabel} / {previousMonthLabel}</span>
      </header>
      {rows.length ? (
        <div className="dlv-comparison-grid">
          {rows.map((row) => (
            <ComparisonSlope
              row={row}
              monthLabel={monthLabel}
              previousMonthLabel={previousMonthLabel}
              key={row.key}
            />
          ))}
        </div>
      ) : <EmptyBlock text="该月暂无可比较数据" />}
    </section>
  );
}

function EmptyBlock({ text }) {
  return (
    <div className="dlv-empty" role="status">
      <span aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="dlv-loading" role="status" aria-label="正在加载售前试用交付数据">
      <div className="dlv-kpi-grid">
        {Array.from({ length: 4 }, (_, index) => <span className="dlv-skeleton dlv-skeleton--kpi" key={index} />)}
      </div>
      <span className="dlv-skeleton dlv-skeleton--comparison" />
      <div className="dlv-overview-grid">
        <span className="dlv-skeleton dlv-skeleton--panel" />
        <span className="dlv-skeleton dlv-skeleton--panel" />
      </div>
      <span className="dlv-skeleton dlv-skeleton--operations" />
    </div>
  );
}

function DataState({ status, error, onRetry }) {
  return (
    <div className={`dlv-data-state dlv-data-state--${status}`} role={status === 'error' ? 'alert' : 'status'}>
      <span className="dlv-data-state__mark" aria-hidden="true" />
      <div>
        <b>{status === 'error' ? '售前试用数据加载失败' : '该月暂无试用交付数据'}</b>
        <p>{status === 'error' ? error : '请切换其它月份，或等待后续数据同步。'}</p>
      </div>
      {status === 'error' && <button type="button" onClick={onRetry}>重试</button>}
    </div>
  );
}

export default function DeliveryPanel({ dataLoader = DEFAULT_DELIVERY_LOADER }) {
  const tokens = useThemeTokens();
  const [monthKey, setMonthKey] = useState(DEFAULT_PRESALE_TRIAL_MONTH);
  const [distributionMetric, setDistributionMetric] = useState('count');
  const [conversionDimension, setConversionDimension] = useState('channel');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dataState, setDataState] = useState({ status: 'loading', data: null, error: '' });

  useEffect(() => {
    let cancelled = false;
    setDataState({ status: 'loading', data: null, error: '' });

    Promise.resolve()
      .then(() => dataLoader(monthKey))
      .then((data) => {
        if (cancelled) return;
        setDataState({ status: data ? 'ready' : 'empty', data, error: '' });
      })
      .catch((error) => {
        if (cancelled) return;
        setDataState({ status: 'error', data: null, error: error?.message || '未知数据异常' });
      });

    return () => {
      cancelled = true;
    };
  }, [dataLoader, monthKey, reloadKey]);

  const snapshot = dataState.data;
  const distributionTotal = snapshot?.distribution?.reduce((sum, item) => sum + Number(item.count || 0), 0) ?? 0;
  const distributionAmountTotal = snapshot?.distribution?.reduce((sum, item) => sum + Number(item.expectedAmountWan || 0), 0) ?? 0;
  const activeDistributionTotal = distributionMetric === 'amount' ? distributionAmountTotal : distributionTotal;
  const distributionOption = useMemo(
    () => snapshot && activeDistributionTotal > 0
      ? buildDistributionOption({ snapshot, metric: distributionMetric, selectedChannel, tokens })
      : null,
    [snapshot, distributionMetric, selectedChannel, tokens, activeDistributionTotal],
  );
  const chartEvents = useMemo(() => ({
    click: (params) => {
      if (params?.seriesType !== 'pie' || !params?.data?.key) return;
      setSelectedChannel((current) => current === params.data.key ? null : params.data.key);
    },
  }), []);

  function handleMonthChange(nextMonthKey) {
    if (nextMonthKey === monthKey) return;
    setSelectedChannel(null);
    setDataState({ status: 'loading', data: null, error: '' });
    setMonthKey(nextMonthKey);
  }

  function toggleSelectedChannel(channelKey) {
    setSelectedChannel((current) => current === channelKey ? null : channelKey);
  }

  function handleConversionRowKeyDown(event, channelKey) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSelectedChannel(channelKey);
    }
  }

  const selectedChannelRow = snapshot?.distribution?.find((item) => item.key === selectedChannel);
  const selectedChannelName = selectedChannelRow?.name ?? '';
  const allConversionRows = snapshot?.conversion?.[conversionDimension] ?? [];
  const conversionRows = allConversionRows;
  const selectedStaffLoads = selectedChannel
    ? snapshot?.staffLoadsByChannel?.[selectedChannel] ?? []
    : [];
  const selectedAssignedCount = selectedStaffLoads
    .reduce((sum, row) => sum + Number(row.currentAssigned || 0), 0);
  const selectedUnassignedOwners = selectedChannelRow?.unassignedOwners ?? 0;
  const conversionCohortTotal = allConversionRows.reduce((sum, row) => sum + Number(row.cohortStarted || 0), 0);
  const conversionClosedTotal = allConversionRows.reduce((sum, row) => sum + Number(row.closedDeals || 0), 0);
  const capacityLimit = snapshot?.capacityLimit || DELIVERY_CAPACITY_LIMIT;

  return (
    <section className="dlv-panel" aria-labelledby="delivery-dashboard-title">
      <PageHeader
        monthKey={monthKey}
        onMonthChange={handleMonthChange}
        loading={dataState.status === 'loading'}
        updatedAt={snapshot?.updatedAt}
        demo={dataLoader === loadPresaleTrialDashboard}
      />

      {dataState.status === 'loading' && <LoadingView />}
      {dataState.status === 'error' && (
        <DataState status="error" error={dataState.error} onRetry={() => setReloadKey((key) => key + 1)} />
      )}
      {(dataState.status === 'empty' || (dataState.status === 'ready' && !snapshot?.kpis?.currentTrials)) && (
        <DataState status="empty" />
      )}

      {dataState.status === 'ready' && snapshot?.kpis?.currentTrials > 0 && (
        <>
          <div className="dlv-kpi-grid" aria-label="整体试用情况">
            <KpiCard
              label="当前试用客户"
              value={formatInt(snapshot.kpis.currentTrials)}
              unit="个"
              helper={`本月新增${formatInt(snapshot.kpis.newTrials)}个`}
            />
            <KpiCard
              label="试用转化率"
              value={formatPct(snapshot.kpis.conversionRate)}
              helper={`${formatInt(snapshot.kpis.convertedCustomers)} / ${formatInt(snapshot.kpis.conversionCohort)}个完成成交`}
              tone="good"
            />
            <KpiCard
              label="预计成交金额"
              value={(Number(snapshot.kpis.expectedAmountWan) || 0).toFixed(1)}
              unit="万"
              helper={`已成交${formatWan(snapshot.kpis.closedAmountWan)}`}
              tone="warn"
            />
            <KpiCard
              label="风险及超期"
              value={formatInt(snapshot.kpis.urgentRisk)}
              unit="个"
              helper={`${formatInt(snapshot.kpis.nearDeadline)}个临近 · ${formatInt(snapshot.kpis.priorityOverdue)}个超期`}
              tone="risk"
            />
          </div>

          <ComparisonBand
            rows={snapshot.comparisonRows}
            monthLabel={snapshot.monthLabel}
            previousMonthLabel={snapshot.previousMonthLabel}
          />

          <div className="dlv-overview-grid">
            <Panel
              className="dlv-card--distribution"
              title="当前试用客户分布"
              subtitle="当前试用客户渠道构成"
              actions={(
                <Segmented
                  options={DISTRIBUTION_OPTIONS}
                  value={distributionMetric}
                  onChange={setDistributionMetric}
                />
              )}
            >
              {distributionOption ? (
                <div className="dlv-distribution-body">
                  <div className="dlv-ring-wrap">
                    <EChart option={distributionOption} onEvents={chartEvents} style={{ height: '100%' }} />
                    <div className="dlv-ring-center" aria-label={`${formatInt(snapshot.kpis.currentTrials)}个当前试用`}>
                      <strong>{formatInt(snapshot.kpis.currentTrials)}个</strong>
                      <span>当前试用</span>
                    </div>
                  </div>
                  <div className="dlv-distribution-legend">
                    {snapshot.distribution.map((item, index) => {
                      const color = [tokens.accentMid, tokens.semanticCapacity, tokens.chartCyan, tokens.semanticGoal][index % 4];
                      const activeValue = distributionMetric === 'amount' ? item.expectedAmountWan : item.count;
                      const activeTotal = distributionMetric === 'amount' ? distributionAmountTotal : distributionTotal;
                      return (
                        <button
                          className={`dlv-legend-row${item.key === selectedChannel ? ' is-selected' : ''}`}
                          type="button"
                          aria-pressed={item.key === selectedChannel}
                          onClick={() => setSelectedChannel((current) => current === item.key ? null : item.key)}
                          key={item.key}
                        >
                          <span className="dlv-legend-swatch" style={{ background: color }} aria-hidden="true" />
                          <span className="dlv-legend-name">{item.name}</span>
                          <b>{distributionMetric === 'amount' ? formatWan(activeValue) : `${formatInt(activeValue)}个`}</b>
                          <em>{formatPct(ratio(activeValue, activeTotal))}</em>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : <EmptyBlock text="该月暂无可用的渠道分布数据" />}
            </Panel>

            <Panel
              className="dlv-card--stage"
              title="试用阶段与风险"
              subtitle={`阶段总数 ${formatInt(snapshot.kpis.currentTrials)}个 · 已超期为全量口径`}
            >
              {snapshot.stages.length ? (
                <>
                  <div
                    className="dlv-stage-progress"
                    role="img"
                    aria-label={snapshot.stages.map((stage) => `${stage.name}${formatInt(stage.count)}个`).join('，')}
                  >
                    {snapshot.stages.map((stage) => (
                      <span
                        className={`dlv-stage-segment dlv-stage-segment--${safeTone(stage.tone)}`}
                        style={{ flexGrow: Math.max(0, Number(stage.count) || 0) }}
                        key={stage.key}
                      />
                    ))}
                  </div>
                  <div className="dlv-stage-labels">
                    {snapshot.stages.map((stage) => (
                      <div key={stage.key}>
                        <span>{stage.name}</span>
                        <b>{formatInt(stage.count)}</b>
                      </div>
                    ))}
                  </div>
                </>
              ) : <EmptyBlock text="该月暂无试用阶段数据" />}

              <div className="dlv-risk-list" aria-label="试用风险提醒">
                {snapshot.riskAlerts.map((alert) => (
                  <div className="dlv-risk-row" key={alert.key}>
                    <span className={`dlv-risk-icon dlv-risk-icon--${safeTone(alert.tone)}`} aria-hidden="true" />
                    <p>{alert.text}</p>
                    <span className="dlv-risk-arrow" aria-hidden="true">›</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <section className="dlv-operations" aria-labelledby="delivery-operations-title">
            <header className="dlv-operations-head">
              <div>
                <h3 id="delivery-operations-title">交付执行明细</h3>
                <p>同屏核对转化效率与配置承载，快速定位渠道和人员风险</p>
              </div>
            </header>

            <div className="dlv-operations-grid">
              <section className="dlv-operation-pane dlv-operation-pane--conversion" aria-labelledby="delivery-conversion-title">
                <header className="dlv-operation-pane-head">
                  <div>
                    <h4 id="delivery-conversion-title">渠道 / 团队转化</h4>
                    <p>成熟队列完成成交 {formatInt(conversionClosedTotal)} / {formatInt(conversionCohortTotal)}个</p>
                  </div>
                  <div className="dlv-conversion-actions">
                    {selectedChannelName && (
                      <button
                        className="dlv-filter-chip"
                        type="button"
                        aria-label={`清除${selectedChannelName}渠道筛选`}
                        onClick={() => setSelectedChannel(null)}
                      >
                        {selectedChannelName}<span aria-hidden="true">×</span>
                      </button>
                    )}
                    <Segmented
                      options={CONVERSION_DIMENSION_OPTIONS}
                      value={conversionDimension}
                      onChange={setConversionDimension}
                    />
                  </div>
                </header>

                {conversionRows.length ? (
                  <div className="dlv-conversion-list" aria-label="渠道或团队成熟队列转化明细">
                    {conversionRows.map((row) => (
                      <article
                        className={`dlv-conversion-row${row.channelKey === selectedChannel ? ' is-selected' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={row.channelKey === selectedChannel}
                        onClick={() => toggleSelectedChannel(row.channelKey)}
                        onKeyDown={(event) => handleConversionRowKeyDown(event, row.channelKey)}
                        key={row.key}
                      >
                        <div className="dlv-detail-row__top">
                          <div className="dlv-detail-row__identity">
                            <b>{row.name}</b>
                            <span className={`dlv-status dlv-status--${safeTone(row.statusTone)}`}>{row.status}</span>
                          </div>
                          <strong className="dlv-money">{formatWan(row.expectedAmountWan)}</strong>
                        </div>
                        <dl className="dlv-detail-metrics dlv-detail-metrics--conversion">
                          <div><dt>当前试用</dt><dd>{formatInt(row.currentTrials)}个</dd></div>
                          <div><dt>成熟成交 / 上期启动</dt><dd>{formatInt(row.closedDeals)} / {formatInt(row.cohortStarted)}个</dd></div>
                          <div><dt>转化率</dt><dd>{formatPct(row.conversionRate)}</dd></div>
                        </dl>
                      </article>
                    ))}
                  </div>
                ) : <EmptyBlock text="当前筛选下暂无转化数据" />}
              </section>

              <section className="dlv-operation-pane dlv-operation-pane--staff" aria-labelledby="delivery-staff-title">
                <header className="dlv-operation-pane-head">
                  <div>
                    <h4 id="delivery-staff-title">配置人员完成情况</h4>
                    <p>
                      {selectedChannelName
                        ? `${selectedChannelName} · 已分配 ${formatInt(selectedAssignedCount)}个 · 未配置 ${formatInt(selectedUnassignedOwners)}个`
                        : '请先从左侧选择渠道'}
                    </p>
                  </div>
                </header>

                {!selectedChannel ? (
                  <EmptyBlock text="点击左侧渠道查看对应人员完成情况" />
                ) : selectedStaffLoads.length ? (
                  <>
                    <div className="dlv-staff-list" role="list" aria-label="配置人员完成情况明细">
                      {selectedStaffLoads.map((row) => (
                        <article className="dlv-staff-row" role="listitem" key={row.key}>
                          <div className="dlv-detail-row__top">
                            <div className="dlv-detail-row__identity">
                              <b>{row.name}</b>
                              <span className={`dlv-status dlv-status--${safeTone(row.loadTone)}`}>{row.loadStatus}</span>
                            </div>
                            <strong>{formatInt(row.currentAssigned)} / {formatInt(capacityLimit)}</strong>
                          </div>
                          <div
                            className="dlv-load-bar"
                            role="progressbar"
                            aria-label={`${row.name}当前负责客户数`}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={Math.min(100, Math.max(0, Number(row.loadRatio) || 0))}
                            aria-valuetext={`${row.currentAssigned}个，建议上限${capacityLimit}个，负载${formatPct(row.loadRatio)}`}
                          >
                            <span style={{ width: `${Math.min(100, Math.max(0, Number(row.loadRatio) || 0))}%` }} />
                          </div>
                          <dl className="dlv-detail-metrics dlv-detail-metrics--staff">
                            <div><dt>本月累计</dt><dd>{formatInt(row.monthlyTotal)}个</dd></div>
                            <div><dt>已转化</dt><dd>{formatInt(row.converted)}个</dd></div>
                            <div><dt>超期</dt><dd className={row.overdue > 0 ? 'dlv-overdue' : ''}>{formatInt(row.overdue)}个</dd></div>
                            <div><dt>预计金额</dt><dd className="dlv-money">{formatWan(row.expectedAmountWan)}</dd></div>
                          </dl>
                        </article>
                      ))}
                    </div>
                    <p className="dlv-load-note">负载状态基于当前负责客户数占个人建议上限（14单）的比例计算</p>
                  </>
                ) : <EmptyBlock text="该渠道暂无配置人员完成情况" />}
              </section>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
