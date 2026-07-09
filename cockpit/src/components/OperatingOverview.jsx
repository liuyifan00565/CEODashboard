/* 更新时间: 2026-07-09 15:04:00 CST  更新内容: 去除半环外部标签深色底和边框，恢复纯文字标签并禁止省略，解决窄列下出现黑框与"..."的问题。 */
/* 更新时间: 2026-07-09 14:58:00 CST  更新内容: 经营进度主卡按反馈收紧结构，半环饼图中心上移至 62% 并略放大环形，配合左宽中窄的卡片布局。 */
/* 更新时间: 2026-07-09 15:10:00 CST  更新内容: 年度回款总览与月度经营进度的目标状态文案统一为"超额完成/剩余目标"，超额用约定金色 var(--accent-gold)、剩余用约定红色 var(--warn)；年度新增超额/剩余条件判断(原为写死"剩余目标"无色)，月度"目标缺口"改为"剩余目标"保持一致。 */
/* 更新时间: 2026-07-09 15:00:00 CST  更新内容: 回款半环直接对齐版本情况饼图参数——radius 62/88%→45/76%、center 50/56%→49.5/68%(与 VersionFinancePanel 完全一致)；图区高度月度/年度/窄屏统一→326px；图表列最小宽度→420/430 接近版本饼图容器宽 clamp(430,34vw,560)。 */
/* 更新时间: 2026-07-09 14:55:00 CST  更新内容: 回款半环继续缩小并瘦身(上一版仍偏大且有"下巴")——radius 58/92%→62/88%(环厚34%→26%变薄)、center 54%→56%(=1-0.88/2 去下方空荡)；图区高度月度370→280、年度378→288、窄屏362→272；图表列最小宽度350→300/360→310，饼图直径≈0.88×280≈246px。 */
/* 更新时间: 2026-07-09 14:50:00 CST  更新内容: 回款半环回调到合理尺寸(上一版430px太大)——radius 60/96%→58/92%、center 52%→54%(=1-0.92/2)；图区高度月度430→370、年度438→378、窄屏420→362；图表列最小宽度400→350/410→360，饼图直径≈0.92×350≈322px。 */
/* 更新时间: 2026-07-09 14:35:00 CST  更新内容: 按截图红框目标再放大回款半环——radius 58/94%→60/96%、center 53%→52%(=1-0.96/2 贴底不裁)；图区高度月度320→430、年度328→438、窄屏316→420；图表列最小宽度加至400/410并提升占比，使宽度不再是瓶颈，半径仍用%保持正圆不拉伸。 */
/* 更新时间: 2026-07-09 14:20:00 CST  更新内容: 修复回款半环被底部裁切导致视觉偏小——radius 52/88%→58/94%、center 72%→53%(=1-外半径/2 贴底不裁)，图区高度月度→320px/年度→328px，使半环填满容器并接近版本情况饼图尺寸。 */
/* 更新时间: 2026-07-09 13:14:23 CST  更新内容: 放大月度/年度半环并恢复未完成占位，年度进度条只跨左侧信息区，明细入口改为文字箭头链接。 */
/* 更新时间: 2026-07-09 12:19:47 CST  更新内容: 年度节奏升级为年度回款总览三栏卡，并新增横跨全卡的年度目标进度 footer。 */
/* 更新时间: 2026-07-09 12:12:08 CST  更新内容: 移除半环图中心完成率数字，并收窄月度主卡中间图表列。 */
/* 更新时间: 2026-07-09 12:02:57 CST  更新内容: 将超额/缺口并入本月回款主事实行，并删除右侧独立风险渠道提醒卡。 */
/* 更新时间: 2026-07-09 11:58:00 CST  更新内容: 月度回款主卡移除时间进度和月目标进度条，并压紧主卡高度。 */
/* 更新时间: 2026-07-09 11:43:19 CST  更新内容: 将渠道半环降级并入月度回款主卡，右侧经营情况改为各渠道实际/目标/完成率。 */
/* 更新时间: 2026-07-09 11:15:17 CST  更新内容: 渠道目标完成结构半环同步版本情况饼图的银紫玫瑰色板、环形参数和悬浮样式。 */
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
import { useMemo } from 'react';
import SearchResultBorder from './SearchResultBorder';
import EChart from './EChart';
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
  '本月回款结构',
  '月度完成率',
  '目标缺口',
  '超额完成',
  '未完成',
  '实际',
  '目标',
  '风险',
  '线下华东',
];
const ANNUAL_KEYWORDS = [
  '年度回款总览',
  '年度回款结构',
  '年度累计',
  '年度目标',
  '年度完成率',
  '年度目标进度',
  '剩余目标',
  '时间进度',
  '线性进度',
  '后续月均需完成',
  '经营情况',
  '未完成',
  '风险',
];
const MONTH_STRUCTURE_META = {
  recoveredLabel: '实际回款',
  targetLabel: '目标回款',
  centerLabel: '月目标完成率',
  chartName: '本月回款结构',
};
const ANNUAL_STRUCTURE_META = {
  recoveredLabel: '年度回款',
  targetLabel: '年度目标',
  centerLabel: '年目标完成率',
  chartName: '年度回款结构',
};
const CHANNEL_STRUCTURE_STYLES = {
  online: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#8E86FF' }, { offset: 1, color: '#E4B8D7' }] },
    swatch: '#8E86FF',
  },
  south: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#B89CFF' }, { offset: 1, color: '#D9D1FF' }] },
    swatch: '#B89CFF',
  },
  east: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#9B6FAD' }, { offset: 1, color: '#E4B8D7' }] },
    swatch: '#E4B8D7',
  },
  agent: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#C9A96B' }, { offset: 1, color: '#E3D2A4' }] },
    swatch: '#C9A96B',
  },
};
const INCOMPLETE_STRUCTURE_STYLE = {
  color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,255,255,.075)' }, { offset: 1, color: 'rgba(255,255,255,.035)' }] },
  swatch: 'rgba(255,255,255,.28)',
};
const DETAIL_ARROW = '›';

function formatWan(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatPct(value) {
  return `${Number(value).toFixed(1)}%`;
}

function formatPp(value) {
  return `${Math.abs(Number(value)).toFixed(1)}pp`;
}

function safeRatioPercent(value, total) {
  return total ? +((Number(value) || 0) / total * 100).toFixed(1) : 0;
}

function channelStyle(key) {
  return CHANNEL_STRUCTURE_STYLES[key] ?? CHANNEL_STRUCTURE_STYLES.online;
}

function buildChannelStructure(rows) {
  const totalRecovered = rows.reduce((sum, row) => sum + (Number(row.recovered) || 0), 0);
  const totalTarget = rows.reduce((sum, row) => sum + (Number(row.target) || 0), 0);
  const completion = totalTarget ? +((totalRecovered / totalTarget) * 100).toFixed(1) : 0;
  const riskBaseline = Math.min(100, completion);
  const incompleteGap = Math.max(0, totalTarget - totalRecovered);
  const structureTotal = totalRecovered + incompleteGap;
  const channelItems = rows.map((row) => {
    const style = channelStyle(row.key);
    const recovered = Number(row.recovered) || 0;
    const rowCompletion = Number(row.completion) || 0;
    const target = Number(row.target) || 0;

    return {
      ...row,
      recovered,
      target,
      completion: rowCompletion,
      risk: row.warn || rowCompletion < riskBaseline,
      gap: Math.max(0, target - recovered),
      share: safeRatioPercent(recovered, Math.max(structureTotal, 1)),
      swatch: style.swatch,
      itemStyle: { color: style.color },
    };
  });
  const incompleteSlice = incompleteGap > 0
    ? {
      value: incompleteGap,
      rawValue: incompleteGap,
      targetValue: totalTarget,
      completion,
      share: safeRatioPercent(incompleteGap, Math.max(structureTotal, 1)),
      name: '未完成',
      isIncomplete: true,
      itemStyle: {
        color: INCOMPLETE_STRUCTURE_STYLE.color,
        opacity: .34,
        borderColor: 'rgba(255,255,255,.08)',
        borderWidth: 1,
        shadowBlur: 0,
      },
    }
    : null;
  const pieData = structureTotal
    ? [
      ...channelItems.map((row) => ({
        value: row.recovered,
        rawValue: row.recovered,
        targetValue: row.target,
        completion: row.completion,
        share: row.share,
        name: row.name,
        itemStyle: row.itemStyle,
      })),
      ...(incompleteSlice ? [incompleteSlice] : []),
    ]
    : [{
      value: 1,
      rawValue: 0,
      targetValue: totalTarget,
      completion,
      share: 0,
      name: '暂无回款',
      isEmpty: true,
      itemStyle: {
        color: INCOMPLETE_STRUCTURE_STYLE.color,
        opacity: .42,
        borderColor: 'rgba(255,255,255,.08)',
        borderWidth: 1,
      },
    }];

  return {
    completion,
    totalRecovered,
    totalTarget,
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
    color: Object.values(CHANNEL_STRUCTURE_STYLES).map((style) => style.color),
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
        const target = Number(params.data?.targetValue ?? 0) || 0;
        const completion = Number(params.data?.completion ?? 0) || 0;
        const isIncomplete = Boolean(params.data?.isIncomplete);
        const valueLabel = isIncomplete ? '目标缺口' : periodMeta.recoveredLabel;

        return `
          <div class="op-channel-tooltip" aria-label="${params.name}${periodMeta.recoveredLabel}${value}万">
            <div class="op-channel-tooltip__name">${periodMeta.chartName} · ${params.name}</div>
            <div class="op-channel-tooltip__value">${valueLabel} <strong>${formatWan(value)}</strong> 万</div>
            <div class="op-channel-tooltip__meta">图上占比 <strong>${share}%</strong> · 目标 ${formatWan(target)} 万 · 完成率 ${formatPct(completion)}</div>
          </div>
        `;
      },
      extraCssText: 'padding:0;border:0;background:transparent;box-shadow:none;pointer-events:none;',
    },
    animationDuration: 900,
    animationEasing: 'cubicOut',
    series: [
      {
        type: 'pie',
        name: periodMeta.chartName,
        radius: ['48%', '82%'],
        center: ['49.5%', '62%'],
        startAngle: 180,
        endAngle: 360,
        padAngle: 3,
        minShowLabelAngle: 1,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(255, 255, 255, .11)',
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(184, 156, 255, .08)',
        },
        label: {
          show: false,
          position: 'outside',
          formatter: (params) => `{name|${params.name}}\n{percent|${params.percent}%}`,
          bleedMargin: 0,
          distanceToLabelLine: 0,
          overflow: 'none',
          color: tokens.chartText,
          rich: {
            name: {
              color: tokens.chartText,
              fontSize: 13,
              fontWeight: 850,
              lineHeight: 17,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.36)',
              textShadowBlur: 7,
            },
            percent: {
              color: tokens.chartText,
              fontSize: 12,
              fontWeight: 850,
              lineHeight: 15,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.38)',
              textShadowBlur: 7,
            },
          },
        },
        labelLine: {
          show: false,
          lineStyle: {
            color: tokens.chartText,
            opacity: 0.58,
            width: 1.5,
          },
          smooth: 0.18,
          length: 10,
          length2: 16,
        },
        data: structure.pieData.map((item, index) => {
          const isMajorLabel = index < 2 && !item.isEmpty && Number(item.value) > 0;
          const isIncompleteLabel = item.isIncomplete && Number(item.value) > 0;
          return {
            ...item,
            label: {
              show: isMajorLabel || isIncompleteLabel,
            },
            labelLine: {
              show: isMajorLabel || isIncompleteLabel,
            },
          };
        }),
      },
    ],
  };
}

function RecoveryStructure({ structure, option, periodMeta }) {
  return (
    <div className="op-recovery-structure">
      <div className="op-structure-head">
        <div>
          <h2>{periodMeta.chartName}</h2>
          <span>单位：万元</span>
        </div>
      </div>

      <div
        className="op-channel-chart-wrap"
        aria-label={`${periodMeta.centerLabel} ${formatPct(structure.completion)}，${periodMeta.recoveredLabel} ${formatWan(structure.totalRecovered)} 万`}
      >
        <EChart className="op-channel-chart" option={option} style={{ height: '100%' }} />
      </div>
    </div>
  );
}

function MonthlyRecoveryStructure({ structure, option }) {
  return (
    <RecoveryStructure
      structure={structure}
      option={option}
      periodMeta={MONTH_STRUCTURE_META}
    />
  );
}

function AnnualRecoveryStructure({ structure, option }) {
  return (
    <RecoveryStructure
      structure={structure}
      option={option}
      periodMeta={ANNUAL_STRUCTURE_META}
    />
  );
}

function OperatingSituation({ structure, subLabel = '实际回款 / 目标回款' }) {
  return (
    <aside className="op-operating-side">
      <div className="op-operating-head">
        <div>
          <h2>经营情况</h2>
          <span>{subLabel}</span>
        </div>
      </div>

      <div className="op-channel-list">
        {structure.rows.map((row) => (
          <div className={`op-channel-item${row.risk ? ' op-channel-item--warn' : ''}`} key={row.key}>
            <span
              className="op-channel-swatch"
              style={{ background: row.swatch, boxShadow: `0 0 12px ${row.swatch}55` }}
              aria-hidden="true"
            />
            <div className="op-channel-item-copy">
              <span className="op-channel-name">{row.name}</span>
              <span className="op-channel-meta">
                实际 {formatWan(row.recovered)}万 / 目标 {formatWan(row.target)}万
              </span>
            </div>
            <div className="op-channel-result">
              <b>{formatPct(row.completion)}</b>
              {row.gap > 0 && <span>缺口 {formatWan(row.gap)}万</span>}
            </div>
            {row.risk && <span className="op-channel-risk">风险</span>}
          </div>
        ))}
      </div>
    </aside>
  );
}

function DetailLink({ disabled, onClick, children }) {
  return (
    <button
      type="button"
      className="op-detail-link"
      disabled={disabled}
      onClick={onClick}
    >
      <span>{children}</span>
      <span className="op-detail-link-arrow" aria-hidden="true">{DETAIL_ARROW}</span>
    </button>
  );
}

export default function OperatingOverview({ searchTerm = '', monthKpiCard, yearKpiCard, onOpenKpi }) {
  const tokens = useThemeTokens();
  const progressTitle = `${META.monthLabel}经营进度`;
  const progressKeywords = [progressTitle, ...PROGRESS_KEYWORDS_BASE];
  const overviewMetrics = getOperatingOverviewMetrics();
  const monthChannelRows = getChannelCompletionRows('month');
  const annualChannelRows = getChannelCompletionRows('year');
  const monthlyStructure = useMemo(() => buildChannelStructure(monthChannelRows), [monthChannelRows]);
  const annualStructure = useMemo(() => buildChannelStructure(annualChannelRows), [annualChannelRows]);
  const monthlyStructureOption = useMemo(() => channelStructureOption(monthlyStructure, MONTH_STRUCTURE_META, tokens), [monthlyStructure, tokens]);
  const annualStructureOption = useMemo(() => channelStructureOption(annualStructure, ANNUAL_STRUCTURE_META, tokens), [annualStructure, tokens]);
  const annualCapsuleWidth = `${Math.min(KPI_DERIVED.yearCompletion, 100)}%`;
  const annualRemainingTarget = Math.max(0, KPI.yearTarget - KPI.yearRecovered);
  const annualTargetOver = Math.max(0, KPI.yearRecovered - KPI.yearTarget);
  const annualTargetStatusRisk = annualRemainingTarget > 0;
  const annualTargetStatusLabel = annualTargetStatusRisk ? '剩余目标' : '超额完成';
  const annualTargetStatusValue = annualTargetStatusRisk ? annualRemainingTarget : annualTargetOver;
  const annualPaceDelta = +(KPI_DERIVED.yearCompletion - overviewMetrics.annualTimeProgress).toFixed(1);
  const annualPaceLabel = `${annualPaceDelta < 0 ? '低于' : '高于'}线性进度 ${formatPp(annualPaceDelta)}`;
  const monthTargetGap = Math.max(0, KPI.monthTarget - KPI.monthRecovered);
  const monthTargetOver = Math.max(0, KPI.monthRecovered - KPI.monthTarget);
  const targetStatusRisk = monthTargetGap > 0;
  const targetStatusLabel = targetStatusRisk ? '剩余目标' : '超额完成';
  const targetStatusValue = targetStatusRisk ? monthTargetGap : monthTargetOver;

  return (
    <div className="op-overview">
      <SearchResultBorder active={matchesSearchTerm(progressKeywords, searchTerm)} className="op-search-result op-search-result--progress">
        <section className="op-panel op-panel--progress" data-anim>
          <header className="op-progress-head">
            <div>
              <h1>{progressTitle}</h1>
            </div>
            <DetailLink
              disabled={!monthKpiCard || !onOpenKpi}
              onClick={() => onOpenKpi(monthKpiCard)}
            >
              点击查看近期明细
            </DetailLink>
          </header>

          <div className="op-month-grid">
            <div className="op-month-primary">
              <span className="op-summary-label">本月回款</span>
              <b>{formatWan(KPI.monthRecovered)}万</b>
              <span className="op-summary-sub">月度目标 {formatWan(KPI.monthTarget)}万</span>
              <div className="op-month-primary-facts">
                <span>月目标完成率 {formatPct(KPI_DERIVED.monthCompletion)}</span>
                <span className={targetStatusRisk ? 'op-month-primary-fact--risk' : 'op-month-primary-fact--over'}>
                  {targetStatusLabel} {formatWan(targetStatusValue)}万
                </span>
              </div>
            </div>

            <MonthlyRecoveryStructure
              structure={monthlyStructure}
              option={monthlyStructureOption}
            />

            <OperatingSituation
              structure={monthlyStructure}
            />
          </div>
        </section>
      </SearchResultBorder>

      <SearchResultBorder active={matchesSearchTerm(ANNUAL_KEYWORDS, searchTerm)} className="op-search-result op-search-result--annual">
        <section className="op-panel op-panel--annual" data-anim>
          <header className="op-section-head">
            <div>
              <h2>年度回款总览</h2>
            </div>
            <DetailLink
              disabled={!yearKpiCard || !onOpenKpi}
              onClick={() => onOpenKpi(yearKpiCard)}
            >
              点击查看年度拆解
            </DetailLink>
          </header>

          <div className="op-annual-grid">
            <div className="op-annual-primary">
              <span className="op-summary-label">年度累计回款</span>
              <b>{formatWan(KPI.yearRecovered)}万</b>
              <span className="op-summary-sub">年度目标 {formatWan(KPI.yearTarget)}万</span>
              <div className="op-month-primary-facts op-annual-primary-facts">
                <span>年目标完成率 {formatPct(KPI_DERIVED.yearCompletion)}</span>
                <span className={annualTargetStatusRisk ? 'op-month-primary-fact--risk' : 'op-month-primary-fact--over'}>
                  {annualTargetStatusLabel} {formatWan(annualTargetStatusValue)}万
                </span>
              </div>
            </div>

            <AnnualRecoveryStructure
              structure={annualStructure}
              option={annualStructureOption}
            />

            <OperatingSituation
              structure={annualStructure}
              subLabel="年度回款 / 年度目标"
            />

            <div
              className="op-annual-progress-footer"
              aria-label={`年度目标进度 ${formatWan(KPI.yearRecovered)} 万 / ${formatWan(KPI.yearTarget)} 万，完成率 ${formatPct(KPI_DERIVED.yearCompletion)}，时间进度 ${formatPct(overviewMetrics.annualTimeProgress)}，${annualPaceLabel}`}
            >
              <div className="op-annual-progress-main">
                <span>年度目标进度</span>
                <b>{formatWan(KPI.yearRecovered)}万 / {formatWan(KPI.yearTarget)}万</b>
                <div className="op-annual-progress-track">
                  <span className="op-annual-fill" style={{ width: annualCapsuleWidth }} />
                </div>
                <strong>{formatPct(KPI_DERIVED.yearCompletion)}</strong>
              </div>
              <div className="op-annual-progress-meta">
                <span>时间进度 {formatPct(overviewMetrics.annualTimeProgress)}</span>
                <span className={annualPaceDelta < 0 ? 'op-annual-progress-meta--risk' : 'op-annual-progress-meta--ahead'}>
                  {annualPaceLabel}
                </span>
                <span>后续月均需完成 {formatWan(overviewMetrics.remainingMonthlyRequired)}万</span>
              </div>
            </div>
          </div>
        </section>
      </SearchResultBorder>
    </div>
  );
}
