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
import SearchResultBorder from './SearchResultBorder';
import ChannelPanel from './ChannelPanel';
import {
  KPI,
  KPI_DERIVED,
  getChannelCompletionRows,
  getOperatingOverviewMetrics,
} from '../data/mock';
import { matchesSearchTerm } from '../lib/searchMatch';
import './OperatingOverview.css';

const PROGRESS_KEYWORDS = [
  '2026年6月经营进度',
  '本月回款',
  '月度完成率',
  '时间进度',
  '领先 7.1%',
  '目标缺口',
  '影响月度缺口 36万',
  '风险渠道',
  '线下华东',
  '本月整体进度正常，但线下华东低于目标节奏，预计影响月度缺口 36万。',
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
  '当前领先时间进度',
  '线下华东连续低于目标节奏',
  '当前领先时间进度 3.8%，但线下华东连续低于目标节奏。',
];
const CHANNEL_KEYWORDS = ['渠道完成情况', '本月', '年度', '线上', '线下华南', '线下华东', '代理', '缺口', '需关注'];

function formatWan(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatPct(value) {
  return `${Number(value).toFixed(1)}%`;
}

function formatPaceLead(value) {
  const number = Number(value);
  return `${number >= 0 ? '领先' : '落后'} ${Math.abs(number).toFixed(1)}%`;
}

export default function OperatingOverview({ searchTerm = '', monthKpiCard, yearKpiCard, onOpenKpi }) {
  const overviewMetrics = getOperatingOverviewMetrics();
  const monthChannelRows = getChannelCompletionRows('month');
  const riskChannelRows = monthChannelRows.filter((row) => row.warn);
  const riskChannel = [...(riskChannelRows.length ? riskChannelRows : monthChannelRows)]
    .sort((a, b) => a.completion - b.completion)[0];
  const progressWidth = `${Math.min(KPI_DERIVED.monthCompletion, 100)}%`;
  const annualCapsuleWidth = `${Math.min(KPI_DERIVED.yearCompletion, 100)}%`;

  return (
    <div className="op-overview">
      <SearchResultBorder active={matchesSearchTerm(PROGRESS_KEYWORDS, searchTerm)} className="op-search-result op-search-result--progress">
        <section className="op-panel op-panel--progress" data-anim>
          <header className="op-progress-head">
            <div>
              <h1>2026年6月经营进度</h1>
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

          <p className="op-judgement op-judgement--progress">{overviewMetrics.monthJudgement}</p>
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
              明细 &gt;
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

          <p className="op-judgement">{overviewMetrics.annualJudgement}</p>
          <p className="op-annual-note">
            下半年月均需完成 {formatWan(overviewMetrics.remainingMonthlyRequired)} 万。
          </p>
        </section>
      </SearchResultBorder>

      <SearchResultBorder active={matchesSearchTerm(CHANNEL_KEYWORDS, searchTerm)} className="op-search-result op-search-result--channel">
        <div className="op-channel-wrap" data-anim>
          <ChannelPanel title="渠道完成情况" showPeriodSwitch />
        </div>
      </SearchResultBorder>
    </div>
  );
}
