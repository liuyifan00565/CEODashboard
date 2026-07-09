/* 更新时间: 2026-07-09 11:08:00 CST  更新内容: 将渠道风险判断下沉到半环结构数据生成阶段，确保低于整体基准的渠道稳定显示风险标签。 */
/* 更新时间: 2026-07-09 11:02:18 CST  更新内容: 经营总览渠道半环模块补充低于整体完成基准的风险标签，便于快速识别拖累渠道。 */
/* 更新时间: 2026-07-09 10:52:02 CST  更新内容: 经营总览右上渠道表单升级为本月/本年可切换的半环饼图与轻量渠道摘要模块。 */
/* 更新时间: 2026-07-08 17:11:00 CST  更新内容: 经营进度标题和搜索关键词改为读取运行时月份，避免真实数据切月后标题仍显示 6 月。 */
/* 更新时间: 2026-07-07 17:33:00 CST  更新内容: 年度节奏 CTA 由"明细 >"升级为更产品化的"查看年度拆解"，并同步搜索关键词与测试。 */
/* 更新时间: 2026-07-07 15:25:00 CST  更新内容: 移除月度/年度经营摘要判断文案及其专属搜索关键词，经营总览不再显示模板拼接的摘要句。 */
/* 更新时间: 2026-07-06 18:52:14 CST  更新内容: 风险渠道和年度节奏判断改为读取运行时渠道与节奏数据，不再硬编码线下华东和固定完成率。 */
/* 更新时间: 2026-07-06 17:02:49 CST  更新内容: 年度节奏移除折线图，改为四项指标和年度进度胶囊条。 */
/* 更新时间: 2026-07-06 10:48:16 CST  更新内容: 经营总览年度节奏线改为银紫玫瑰主线与香槟目标虚线的业务语义分层。 */
/* 更新时间: 2026-07-06 00:00:13 CST  更新内容: 年度目标线的金色阴影同步降为高级哑金强度。 */
/* 更新时间: 2026-07-06 00:00:23 CST  更新内容: 为经营总览搜索命中外壳补充固定区域类名，避免搜索高亮改变卡片排布。 */
/* 更新时间: 2026-07-05 23:42:14 CST  更新内容: 年度节奏图表降噪并增加呼吸空间，顶部经营进度标题降级以突出核心数字。 */
/* 更新时间: 2026-07-05 22:59:45 CST  更新内容: 年度节奏最终版改为三项核心指标、单行辅助说明、单标题和轻量明细入口。 */
/* 更新时间: 2026-07-05 21:45:08 CST  更新内容: 年度节奏精简为五个核心指标，并只在图表首月、当前月和年目标显示数字标签。 */
/* 更新时间: 2026-07-05 21:24:15 CST  更新内容: 精简经营进度卡片眉题、风险渠道与节奏文案，并弱化指标分隔线。 */
/* 更新时间: 2026-07-05 19:10:30 CST  更新内容: 经营总览提高信息密度，加入月度/年度节奏判断、年度虚线目标和顶部明细入口。 */
/* 更新时间: 2026-07-05 18:32:00 CST  更新内容: 本月回款主数字改为静态权威值，避免截图或首屏加载时显示滚动中间态。 */
/* 更新时间: 2026-07-05 18:20:00 CST  更新内容: 新增经营总览三段融合布局，本月为主视角、年度为节奏背景、渠道为原因拆解。 */
import { useMemo, useState } from 'react';
import SearchResultBorder from './SearchResultBorder';
import EChart from './EChart';
import Segmented from './Segmented';
import {
  META,
  KPI,
  KPI_DERIVED,
  getChannelCompletionRows,
  getOperatingOverviewMetrics,
} from '../data/mock';
import { matchesSearchTerm } from '../lib/searchMatch';
import { useThemeTokens } from '../lib/theme';
import './OperatingOverview.css';

const PROGRESS_KEYWORDS_BASE = [
  '本月回款',
  '月度完成率',
  '时间进度',
  '领先 7.1%',
  '目标缺口',
  '风险渠道',
  '线下华东',
];
const ANNUAL_KEYWORDS = [
  '年度节奏',
  '年度累计',
  '年度目标',
  '年度完成率',
  '时间进度',
  '已完成',
  '剩余',
  '明细 >',
  '下半年月均需完成',
];
const CHANNEL_KEYWORDS = ['渠道目标完成结构', '渠道完成结构', '本月', '本年', '线上', '线下华南', '线下华东', '代理', '未完成', '超额完成', '风险', '需关注'];
const CHANNEL_PERIOD_OPTIONS = [
  { value: 'month', label: '本月' },
  { value: 'year', label: '本年' },
];
const CHANNEL_PERIOD_META = {
  month: {
    unit: '本月',
    recoveredLabel: '本月完成',
    targetLabel: '月目标',
    centerLabel: '本月目标完成率',
    chartName: '本月渠道目标完成结构',
  },
  year: {
    unit: '本年',
    recoveredLabel: '本年完成',
    targetLabel: '年目标',
    centerLabel: '本年目标完成率',
    chartName: '本年渠道目标完成结构',
  },
};
const CHANNEL_STRUCTURE_STYLES = {
  online: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#F4F0FF' }, { offset: 0.52, color: '#D9D1FF' }, { offset: 1, color: '#B89CFF' }] },
    swatch: '#D9D1FF',
  },
  south: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#8E86FF' }, { offset: 0.58, color: '#B89CFF' }, { offset: 1, color: '#E4B8D7' }] },
    swatch: '#B89CFF',
  },
  east: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#7EA7FF' }, { offset: 0.58, color: '#AFA4F4' }, { offset: 1, color: '#D9D1FF' }] },
    swatch: '#AFA4F4',
  },
  agent: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#89B7A4' }, { offset: 0.58, color: '#A6C878' }, { offset: 1, color: '#D8E5C3' }] },
    swatch: '#A6C878',
  },
};
const INCOMPLETE_STRUCTURE_STYLE = {
  color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,255,255,.075)' }, { offset: 1, color: 'rgba(255,255,255,.035)' }] },
  swatch: 'rgba(255,255,255,.28)',
};

function formatWan(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatPct(value) {
  return `${Number(value).toFixed(1)}%`;
}

function safeRatioPercent(value, total) {
  return total ? +((Number(value) || 0) / total * 100).toFixed(1) : 0;
}

function formatPaceLead(value) {
  const number = Number(value);
  return `${number >= 0 ? '领先' : '落后'} ${Math.abs(number).toFixed(1)}%`;
}

function channelStyle(key) {
  return CHANNEL_STRUCTURE_STYLES[key] ?? CHANNEL_STRUCTURE_STYLES.online;
}

function buildChannelStructure(rows) {
  const totalRecovered = rows.reduce((sum, row) => sum + (Number(row.recovered) || 0), 0);
  const totalTarget = rows.reduce((sum, row) => sum + (Number(row.target) || 0), 0);
  const completion = totalTarget ? +((totalRecovered / totalTarget) * 100).toFixed(1) : 0;
  const isOverTarget = completion >= 100;
  const chartBase = isOverTarget ? Math.max(totalRecovered, 1) : Math.max(totalTarget, 1);
  const overTargetScale = isOverTarget && totalRecovered ? totalTarget / totalRecovered : 1;
  const riskBaseline = Math.min(100, completion);
  const channelItems = rows.map((row) => {
    const style = channelStyle(row.key);
    const recovered = Number(row.recovered) || 0;
    const chartValue = isOverTarget ? recovered * overTargetScale : recovered;
    const rowCompletion = Number(row.completion) || 0;

    return {
      ...row,
      recovered,
      target: Number(row.target) || 0,
      completion: rowCompletion,
      risk: row.warn || rowCompletion < riskBaseline,
      share: safeRatioPercent(recovered, chartBase),
      chartValue,
      swatch: style.swatch,
      itemStyle: { color: style.color },
    };
  });
  const incompleteValue = Math.max(0, totalTarget - totalRecovered);
  const incompleteShare = safeRatioPercent(incompleteValue, Math.max(totalTarget, 1));
  const pieData = channelItems.map((row) => ({
    value: row.chartValue,
    rawValue: row.recovered,
    targetValue: row.target,
    completion: row.completion,
    share: row.share,
    name: row.name,
    itemStyle: row.itemStyle,
  }));

  if (incompleteValue > 0) {
    pieData.push({
      value: incompleteValue,
      rawValue: incompleteValue,
      targetValue: totalTarget,
      completion,
      share: incompleteShare,
      name: '未完成',
      isIncomplete: true,
      itemStyle: {
        color: INCOMPLETE_STRUCTURE_STYLE.color,
        opacity: .42,
        borderColor: 'rgba(255,255,255,.08)',
        borderWidth: 1,
      },
    });
  }

  return {
    completion,
    totalRecovered,
    totalTarget,
    isOverTarget,
    incompleteShare,
    rows: channelItems,
    pieData,
  };
}

function channelStructureTooltipPosition(point, params, dom, rect, size) {
  const gap = 14;
  const contentWidth = size.contentSize[0];
  const contentHeight = size.contentSize[1];
  const viewWidth = size.viewSize[0];
  const viewHeight = size.viewSize[1];
  let left = point[0] + gap;
  let top = point[1] + gap;

  if (left + contentWidth + gap > viewWidth) {
    left = point[0] - contentWidth - gap;
  }

  if (top + contentHeight + gap > viewHeight) {
    top = point[1] - contentHeight - gap;
  }

  left = Math.max(gap, Math.min(left, viewWidth - contentWidth - gap));
  top = Math.max(gap, Math.min(top, viewHeight - contentHeight - gap));

  void params;
  void dom;
  void rect;

  return [left, top];
}

function channelStructureOption(structure, periodMeta, tokens) {
  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      position: channelStructureTooltipPosition,
      textStyle: {
        color: tokens.chartText,
        fontSize: 12,
        lineHeight: 16,
      },
      formatter: (params) => {
        const value = Number(params.data?.rawValue ?? params.value) || 0;
        const share = Number(params.data?.share ?? params.percent ?? 0).toFixed(1);
        const isIncomplete = params.data?.isIncomplete;
        const valueLabel = isIncomplete ? '未完成缺口' : periodMeta.recoveredLabel;

        return `
          <div class="op-channel-tooltip" aria-label="${params.name}${valueLabel}${value}万">
            <div class="op-channel-tooltip__name">${periodMeta.chartName} · ${params.name}</div>
            <div class="op-channel-tooltip__value">${valueLabel} <strong>${formatWan(value)}</strong> 万</div>
            <div class="op-channel-tooltip__meta">目标内占比 <strong>${share}%</strong> · 整体完成率 ${formatPct(structure.completion)}</div>
          </div>
        `;
      },
      extraCssText: 'padding:0;border:0;background:transparent;box-shadow:none;pointer-events:none;',
    },
    animationDuration: 720,
    animationEasing: 'cubicOut',
    series: [
      {
        type: 'pie',
        name: periodMeta.chartName,
        radius: ['50%', '72%'],
        center: ['50%', '74%'],
        startAngle: 180,
        endAngle: 360,
        padAngle: 3,
        minShowLabelAngle: 1,
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderRadius: 7,
          borderColor: 'rgba(255,255,255,.085)',
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(184,156,255,.10)',
        },
        emphasis: {
          scale: false,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(228,184,215,.18)',
            borderColor: 'rgba(255,255,255,.16)',
          },
        },
        data: structure.pieData,
      },
    ],
  };
}

function ChannelStructurePanel() {
  const [period, setPeriod] = useState('month');
  const tokens = useThemeTokens();
  const rows = getChannelCompletionRows(period);
  const periodMeta = CHANNEL_PERIOD_META[period];
  const structure = useMemo(() => buildChannelStructure(rows), [rows]);
  const option = useMemo(() => channelStructureOption(structure, periodMeta, tokens), [structure, periodMeta, tokens]);
  const delta = +(structure.completion - 100).toFixed(1);
  const statusText = delta >= 0 ? `超额完成 ${formatPct(delta)}` : `未完成 ${formatPct(Math.abs(delta))}`;

  return (
    <section className="op-panel op-panel--channel">
      <header className="op-section-head op-channel-head">
        <div>
          <h2>渠道目标完成结构</h2>
          <span className="op-channel-unit">单位：万元</span>
        </div>
        <Segmented options={CHANNEL_PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </header>

      <div className="op-channel-body">
        <div
          className="op-channel-chart-wrap"
          aria-label={`${periodMeta.centerLabel} ${formatPct(structure.completion)}，${statusText}`}
        >
          <EChart className="op-channel-chart" option={option} style={{ height: '100%' }} />
          <div className="op-channel-center" aria-hidden="true">
            <b>{formatPct(structure.completion)}</b>
            <span>{periodMeta.centerLabel}</span>
          </div>
        </div>

        <div className="op-channel-side">
          <div className={`op-channel-status${delta < 0 ? ' op-channel-status--risk' : ''}`}>
            <span>{periodMeta.recoveredLabel} {formatWan(structure.totalRecovered)}万</span>
            <b>{statusText}</b>
          </div>

          <div className="op-channel-list">
            {structure.rows.map((row) => {
              return (
                <div className={`op-channel-item${row.risk ? ' op-channel-item--warn' : ''}`} key={row.key}>
                  <span
                    className="op-channel-swatch"
                    style={{ background: row.swatch, boxShadow: `0 0 12px ${row.swatch}55` }}
                    aria-hidden="true"
                  />
                  <div className="op-channel-item-copy">
                    <span className="op-channel-name">{row.name}</span>
                    <span className="op-channel-meta">
                      贡献 {formatPct(row.share)} · 完成率 {formatPct(row.completion)}
                    </span>
                  </div>
                  {row.risk && <span className="op-channel-risk">风险</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OperatingOverview({ searchTerm = '', monthKpiCard, yearKpiCard, onOpenKpi }) {
  const progressTitle = `${META.monthLabel}经营进度`;
  const progressKeywords = [progressTitle, ...PROGRESS_KEYWORDS_BASE];
  const overviewMetrics = getOperatingOverviewMetrics();
  const monthChannelRows = getChannelCompletionRows('month');
  const riskChannelRows = monthChannelRows.filter((row) => row.warn);
  const riskChannel = [...(riskChannelRows.length ? riskChannelRows : monthChannelRows)]
    .sort((a, b) => a.completion - b.completion)[0];
  const progressWidth = `${Math.min(KPI_DERIVED.monthCompletion, 100)}%`;
  const annualCapsuleWidth = `${Math.min(KPI_DERIVED.yearCompletion, 100)}%`;

  return (
    <div className="op-overview">
      <SearchResultBorder active={matchesSearchTerm(progressKeywords, searchTerm)} className="op-search-result op-search-result--progress">
        <section className="op-panel op-panel--progress" data-anim>
          <header className="op-progress-head">
            <div>
              <h1>{progressTitle}</h1>
            </div>
            <button
              type="button"
              className="op-detail-button"
              disabled={!monthKpiCard || !onOpenKpi}
              onClick={() => onOpenKpi(monthKpiCard)}
            >
              查看近期明细
            </button>
          </header>

          <div className="op-summary-grid">
            <div className="op-summary-cell op-summary-cell--hero">
              <span className="op-summary-label">本月回款</span>
              <b>{formatWan(KPI.monthRecovered)}万</b>
              <span className="op-summary-sub">月度目标 {formatWan(KPI.monthTarget)}万</span>
            </div>
            <div className="op-summary-cell">
              <span className="op-summary-label">月目标完成率</span>
              <b>{formatPct(KPI_DERIVED.monthCompletion)}</b>
              <span className="op-summary-sub">
                时间进度 {formatPct(overviewMetrics.monthTimeProgress)} · {formatPaceLead(overviewMetrics.monthPaceDelta)}
              </span>
              <div className="op-progress-track" aria-label={`月度完成率 ${KPI_DERIVED.monthCompletion}%`}>
                <span style={{ width: progressWidth }} />
              </div>
            </div>
            <div className="op-summary-cell">
              <span className="op-summary-label">目标缺口</span>
              <b>{formatWan(KPI_DERIVED.monthGap)}万</b>
              <span className="op-summary-sub">距离月度目标</span>
            </div>
            <div className="op-summary-cell op-summary-cell--warn">
              <span className="op-summary-label">风险渠道</span>
              <b>{riskChannel?.name ?? '暂无'}</b>
              <span className="op-summary-sub">完成率 {formatPct(riskChannel?.completion ?? 0)}</span>
            </div>
          </div>
        </section>
      </SearchResultBorder>

      <SearchResultBorder active={matchesSearchTerm(ANNUAL_KEYWORDS, searchTerm)} className="op-search-result op-search-result--annual">
        <section className="op-panel op-panel--annual" data-anim>
          <header className="op-section-head">
            <div>
              <h2>年度节奏</h2>
            </div>
            <button
              type="button"
              className="op-detail-button"
              disabled={!yearKpiCard || !onOpenKpi}
              onClick={() => onOpenKpi(yearKpiCard)}
            >
              查看年度拆解
            </button>
          </header>

          <div className="op-annual-grid">
            <div className="op-metric">
              <span>年度累计回款</span>
              <b>{formatWan(KPI.yearRecovered)}万</b>
            </div>
            <div className="op-metric">
              <span>年度目标</span>
              <b>{formatWan(KPI.yearTarget)}万</b>
            </div>
            <div className="op-metric">
              <span>年度完成率</span>
              <b>{formatPct(KPI_DERIVED.yearCompletion)}</b>
            </div>
            <div className="op-metric">
              <span>时间进度</span>
              <b>{formatPct(overviewMetrics.annualTimeProgress)}</b>
            </div>
          </div>

          <div className="op-annual-capsule" aria-label={`年度完成率 ${formatPct(KPI_DERIVED.yearCompletion)}，剩余 ${formatPct(overviewMetrics.annualRemainingRate)}`}>
            <span className="op-annual-fill" style={{ width: annualCapsuleWidth }} />
            <div className="op-annual-capsule-labels">
              <span>已完成 {formatPct(KPI_DERIVED.yearCompletion)}</span>
              <span>剩余 {formatPct(overviewMetrics.annualRemainingRate)}</span>
            </div>
          </div>

          <p className="op-annual-note">
            下半年月均需完成 {formatWan(overviewMetrics.remainingMonthlyRequired)} 万。
          </p>
        </section>
      </SearchResultBorder>

      <SearchResultBorder active={matchesSearchTerm(CHANNEL_KEYWORDS, searchTerm)} className="op-search-result op-search-result--channel">
        <div className="op-channel-wrap" data-anim>
          <ChannelStructurePanel />
        </div>
      </SearchResultBorder>
    </div>
  );
}
