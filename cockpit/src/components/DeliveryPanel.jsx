/*
 更新时间: 2026-07-14 13:18:00 CST
 更新内容: 默认停用售前试用演示快照，真实接口接入前仅展示无数据状态。
*/
import { useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_PRESALE_TRIAL_MONTH,
  DELIVERY_CAPACITY_LIMIT,
  PRESALE_TRIAL_MONTH_OPTIONS,
  filterConversionRows,
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

function PageHeader({ monthKey, onMonthChange, loading, updatedAt }) {
  return (
    <header className="dlv-page-head">
      <div>
        <h2 id="delivery-dashboard-title">交付看板</h2>
        <p>售前试用转化与配置负载</p>
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
      <div className="dlv-overview-grid">
        <span className="dlv-skeleton dlv-skeleton--panel" />
        <span className="dlv-skeleton dlv-skeleton--panel" />
      </div>
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

export default function DeliveryPanel({ dataLoader = async () => null }) {
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

  const selectedChannelName = snapshot?.distribution?.find((item) => item.key === selectedChannel)?.name ?? '';
  const allConversionRows = snapshot?.conversion?.[conversionDimension] ?? [];
  const conversionRows = filterConversionRows(allConversionRows, selectedChannel);
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
                        <div className={`dlv-legend-row${item.key === selectedChannel ? ' is-selected' : ''}`} key={item.key}>
                          <span className="dlv-legend-swatch" style={{ background: color }} aria-hidden="true" />
                          <span className="dlv-legend-name">{item.name}</span>
                          <b>{distributionMetric === 'amount' ? formatWan(activeValue) : `${formatInt(activeValue)}个`}</b>
                          <em>{formatPct(ratio(activeValue, activeTotal))}</em>
                        </div>
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

          <Panel
            className="dlv-card--table"
            title="本月与上月交付对比"
            subtitle="变化按指标业务含义判断，风险和周期下降为改善"
            actions={<span className="dlv-period-note">{snapshot.monthLabel} / {snapshot.previousMonthLabel}</span>}
          >
            {snapshot.comparisonRows.length ? (
              <div className="dlv-table-wrap">
                <table className="dlv-table dlv-table--comparison">
                  <colgroup><col /><col /><col /><col /><col /></colgroup>
                  <thead><tr><th scope="col">指标</th><th scope="col">本月</th><th scope="col">上月</th><th scope="col">变化</th><th scope="col">状态</th></tr></thead>
                  <tbody>
                    {snapshot.comparisonRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.label}</td>
                        <td>{row.currentLabel}</td>
                        <td>{row.previousLabel}</td>
                        <td className={`dlv-change dlv-change--${safeTone(row.statusTone)}`}>{row.changeLabel}</td>
                        <td><span className={`dlv-status dlv-status--${safeTone(row.statusTone)}`}>{row.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyBlock text="该月暂无可比较数据" />}
          </Panel>

          <Panel
            className="dlv-card--table"
            title="渠道 / 团队转化情况"
            subtitle={`成熟队列：上期启动且完成观察窗 · ${formatInt(conversionClosedTotal)} / ${formatInt(conversionCohortTotal)}个完成成交`}
            actions={(
              <div className="dlv-conversion-actions">
                {selectedChannelName && (
                  <button className="dlv-filter-chip" type="button" onClick={() => setSelectedChannel(null)}>
                    {selectedChannelName}<span aria-hidden="true">×</span>
                  </button>
                )}
                <Segmented
                  options={CONVERSION_DIMENSION_OPTIONS}
                  value={conversionDimension}
                  onChange={setConversionDimension}
                />
              </div>
            )}
          >
            {conversionRows.length ? (
              <div className="dlv-table-wrap">
                <table className="dlv-table dlv-table--conversion">
                  <colgroup><col /><col /><col /><col /><col /><col /><col /></colgroup>
                  <thead>
                    <tr>
                      <th scope="col">{conversionDimension === 'team' ? '团队' : '渠道'}</th>
                      <th scope="col">当前试用</th>
                      <th scope="col">上期启动</th>
                      <th scope="col">已成交</th>
                      <th scope="col">转化率</th>
                      <th scope="col">预计金额</th>
                      <th scope="col">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversionRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.name}</td>
                        <td>{formatInt(row.currentTrials)}</td>
                        <td>{formatInt(row.cohortStarted)}</td>
                        <td>{formatInt(row.closedDeals)}</td>
                        <td>{formatPct(row.conversionRate)}</td>
                        <td className="dlv-money">{formatWan(row.expectedAmountWan)}</td>
                        <td><span className={`dlv-status dlv-status--${safeTone(row.statusTone)}`}>{row.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyBlock text="当前筛选下暂无转化数据" />}
          </Panel>

          <Panel
            className="dlv-card--table dlv-card--load"
            title="配置人员负载"
            subtitle={`当前已分配 ${formatInt(snapshot.kpis.currentTrials - snapshot.unassignedOwners)}个 · 未配置负责人 ${formatInt(snapshot.unassignedOwners)}个`}
          >
            {snapshot.staffLoads.length ? (
              <>
                <div className="dlv-table-wrap">
                  <table className="dlv-table dlv-table--load">
                    <colgroup><col /><col /><col /><col /><col /><col /><col /></colgroup>
                    <thead><tr><th scope="col">配置人员</th><th scope="col">当前负责</th><th scope="col">本月累计</th><th scope="col">已转化</th><th scope="col">超期</th><th scope="col">预计金额</th><th scope="col">负载状态</th></tr></thead>
                    <tbody>
                      {snapshot.staffLoads.map((row) => (
                        <tr key={row.key}>
                          <td>{row.name}</td>
                          <td>
                            <div className="dlv-load-cell">
                              <span>{formatInt(row.currentAssigned)} / {formatInt(capacityLimit)}</span>
                              <div
                                className="dlv-load-bar"
                                role="progressbar"
                                aria-label={`${row.name}当前负责客户数`}
                                aria-valuemin="0"
                                aria-valuemax={capacityLimit}
                                aria-valuenow={row.currentAssigned}
                                aria-valuetext={`${row.currentAssigned}个，建议上限${capacityLimit}个`}
                              >
                                <span style={{ width: `${Math.min(100, Math.max(0, Number(row.loadRatio) || 0))}%` }} />
                              </div>
                            </div>
                          </td>
                          <td>{formatInt(row.monthlyTotal)}</td>
                          <td>{formatInt(row.converted)}</td>
                          <td className={row.overdue > 0 ? 'dlv-overdue' : ''}>{formatInt(row.overdue)}</td>
                          <td className="dlv-money">{formatWan(row.expectedAmountWan)}</td>
                          <td><span className={`dlv-status dlv-status--${safeTone(row.loadTone)}`}>{row.loadStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="dlv-load-note">负载状态基于当前负责客户数占个人建议上限（14单）的比例计算</p>
              </>
            ) : <EmptyBlock text="该月暂无配置人员负载数据" />}
          </Panel>
        </>
      )}
    </section>
  );
}
