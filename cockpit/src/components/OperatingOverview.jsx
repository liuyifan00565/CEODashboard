/* 更新时间: 2026-07-15 11:14:29 CST  更新内容: 月度与年度回款卡左侧信息重排，退款和目标同排展示，完成率胶囊下移。 */
/* 更新时间: 2026-07-15 11:06:32 CST  更新内容: 月度经营卡标题改为“本月回款总览”并移除半环上方“本月回款结构”可见标题。 */
/* 更新时间: 2026-07-14 19:06:34 CST  更新内容: 特殊渠道作为 total 内部展示项时按比例从四渠道图形份额中扣回，半环合计和完成率不再重复叠加。 */
/* 更新时间: 2026-07-14 17:50:49 CST  更新内容: 回款半环纳入特殊渠道展示扇区，但不将其列入经营渠道和人员下钻。 */
/* 更新时间: 2026-07-14 16:52:12 CST  更新内容: 收短回款结构半环外部标签引导折线，保留所有有值渠道标签但避免线条拉得过长。 */
/* 更新时间: 2026-07-14 16:49:06 CST  更新内容: 回款结构半环所有有值真实渠道均显示外部标签，小渠道使用更近的边距避免“其他”等标签被漏显。 */
/* 更新时间: 2026-07-14 15:20:00 CST  更新内容: 月度半环区域恢复“本月回款结构”标题，不恢复单位文字且不增加主卡高度。 */
/* 更新时间: 2026-07-14 15:14:00 CST  更新内容: 半环接入 ECharts 空白画布事件，空白区显式打开月度/年度明细，渠道扇区保留人员下钻。 */
/* 更新时间: 2026-07-14 15:09:00 CST  更新内容: 半环空白区域恢复整卡下钻，仅在点击实际渠道扇区时阻止冒泡并打开人员明细。 */
/* 更新时间: 2026-07-14 14:36:00 CST  更新内容: 删除回款结构标题、单位和点击提示；月度/年度整卡可点击下钻，渠道行与半环扇区保留独立人员下钻。 */
/* 更新时间: 2026-07-14 13:40:09 CST  更新内容: 月度与年度渠道行及半环扇区支持点击打开真实人员级回款明细。 */
/* 更新时间: 2026-07-13 19:26:40 CST  更新内容: 年度折叠条保持原宽度，加粗常驻进度条并在右侧显示年度完成百分比。 */
/* 更新时间: 2026-07-13 19:23:27 CST  更新内容: 年度回款总览与月度经营进度互换位置，年度总览默认收起为标题、进度条和展开箭头。 */
/* 更新时间: 2026-07-13 16:40:31 CST  更新内容: 选择性合并数据维护代码，恢复拉取前的经营总览界面实现。 */
/* 更新时间: 2026-07-13 14:50:37 CST  更新内容: 缩小主界面本月与年度回款结构半环图外围渠道名称和占比字号。 */
/* 更新时间: 2026-07-10 15:36:50 CST  更新内容: 将月度与年度下钻入口移到回款结构半环图右下方，并保留透明大点击热区。 */
/* 更新时间: 2026-07-10 15:16:00 CST  更新内容: 合并远端经营布局，保留月度业绩和渠道经营区的福小客洞察定位标识。 */
/* 更新时间: 2026-07-10 13:12:05 CST  更新内容: 临时预览回款半环左侧主标签向内收缩，缩短标签到半环的引导距离。 */
/* 更新时间: 2026-07-10 11:55:10 CST  更新内容: 回款半环未完成外部标签向内收缩，让文字更靠近半环。 */
/* 更新时间: 2026-07-10 11:10:16 CST  更新内容: 回款半环保留版本情况同款 radius/center，最终显示尺寸由 CSS 对齐首页版本情况实际图高。 */
/* 更新时间: 2026-07-10 11:03:44 CST  更新内容: 删除年度累计回款大数字上方的小标签，并将年度拆解入口移到年度回款结构标题右上方。 */
/* 更新时间: 2026-07-10 10:54:38 CST  更新内容: 将“点击查看近期明细”从月度卡总标题右侧移到本月回款结构半环图标题右上方。 */
/* 更新时间: 2026-07-10 10:53:56 CST  更新内容: 删除月度回款大数字上方重复的“本月回款”小标签，进一步收敛数字区层级。 */
/* 更新时间: 2026-07-10 10:51:28 CST  更新内容: 年度目标进度条移除累计/目标文字和外围胶囊，只保留进度条与完成率百分比。 */
/* 更新时间: 2026-07-09 17:39:04 CST  更新内容: 年度目标进度条改为内嵌在年度左侧事实区两个胶囊下方，避免 grid 位移导致被卡片裁切消失。 */
/* 更新时间: 2026-07-09 17:28:41 CST  更新内容: 回款半环 tooltip 加入扇区色标识并传入当前扇区色，避免悬浮信息像临时调试弹窗。 */
/* 更新时间: 2026-07-09 17:16:09 CST  更新内容: 年度目标进度 footer 删除可见标题文字，并让进度条向左贴近累计/目标数字。 */
/* 更新时间: 2026-07-09 17:12:32 CST  更新内容: 年度目标进度条下方移除时间进度、线性进度差和后续月均需完成三项辅助数据。 */
/* 更新时间: 2026-07-09 16:28:48 CST  更新内容: 经营总览回款数字按扣退款后净额展示，文案保留“回款”，月度和年度主卡右侧下角均显示退款金额。 */
/* 更新时间: 2026-07-09 15:24:22 CST  更新内容: 配合经营总览分界线左移，半环中心点小幅右移并约束外部标签边距，避免年度结构左侧标签被裁切。 */
/* 更新时间: 2026-07-09 15:24:00 CST  更新内容: 回款半环按当前 258px 图区换算为与版本情况约 248px 外径一致，radius 调整为 57%/96%，避免机械照抄百分比导致视觉过小。 */
/* 更新时间: 2026-07-09 15:18:00 CST  更新内容: 回款半环饼图尺寸重新对齐版本情况半环，radius/center 恢复为 45%/76% 与 49.5%/68%，只保留标签防省略。 */
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
import { useMemo, useState } from 'react';
import SearchResultBorder from './SearchResultBorder';
import EChart from './EChart';
import { ChannelMemberModal } from './ChannelPanel';
import {
  KPI,
  KPI_DERIVED,
  REVENUE_STRUCTURE,
  getChannelCompletionRows,
} from '../data/mock';
import { matchesSearchTerm } from '../lib/searchMatch';
import { useThemeTokens } from '../lib/theme';
import './OperatingOverview.css';

const PROGRESS_KEYWORDS_BASE = [
  '本月回款总览',
  '本月回款',
  '退款',
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
  '退款',
  '年度目标',
  '年度完成率',
  '年度目标进度',
  '剩余目标',
  '经营情况',
  '未完成',
  '风险',
];
const MONTH_STRUCTURE_META = {
  seriesName: '回款结构',
  recoveredLabel: '实际回款',
  targetLabel: '目标回款',
  centerLabel: '月目标完成率',
};
const ANNUAL_STRUCTURE_META = {
  seriesName: '回款结构',
  recoveredLabel: '年度回款',
  targetLabel: '年度目标',
  centerLabel: '年目标完成率',
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
  special: {
    color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#8797A8' }, { offset: 1, color: '#D8DDE5' }] },
    swatch: '#AEB8C4',
  },
};
const INCOMPLETE_STRUCTURE_STYLE = {
  color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,255,255,.075)' }, { offset: 1, color: 'rgba(255,255,255,.035)' }] },
  swatch: 'rgba(255,255,255,.28)',
};
const CHANNEL_LABEL_EDGE_DISTANCE = '20%';
const MINOR_LABEL_EDGE_DISTANCE = '18%';
const INCOMPLETE_LABEL_EDGE_DISTANCE = '24%';
function formatWan(value) {
  return Number(value).toLocaleString('zh-CN');
}

function formatPct(value) {
  return `${Number(value).toFixed(1)}%`;
}

function safeRatioPercent(value, total) {
  return total ? +((Number(value) || 0) / total * 100).toFixed(1) : 0;
}

function channelStyle(key) {
  return CHANNEL_STRUCTURE_STYLES[key] ?? CHANNEL_STRUCTURE_STYLES.online;
}

function buildChannelStructure(rows, structureRows = []) {
  const totalRecovered = rows.reduce((sum, row) => sum + (Number(row.recovered) || 0), 0);
  const rawStructureRecovered = structureRows.reduce((sum, row) => sum + Math.max(0, Number(row.recovered) || 0), 0);
  const structureRecovered = Math.min(rawStructureRecovered, Math.max(0, totalRecovered));
  const channelDisplayScale = totalRecovered > 0 ? (totalRecovered - structureRecovered) / totalRecovered : 0;
  const structureDisplayScale = rawStructureRecovered > 0 ? structureRecovered / rawStructureRecovered : 0;
  const totalTarget = rows.reduce((sum, row) => sum + (Number(row.target) || 0), 0);
  const completion = totalTarget ? +((totalRecovered / totalTarget) * 100).toFixed(1) : 0;
  const riskBaseline = Math.min(100, completion);
  const incompleteGap = Math.max(0, totalTarget - totalRecovered);
  const structureTotal = totalRecovered + incompleteGap;
  const channelItems = rows.map((row) => {
    const style = channelStyle(row.key);
    const recovered = Number(row.recovered) || 0;
    const pieRecovered = Math.max(0, recovered * channelDisplayScale);
    const rowCompletion = Number(row.completion) || 0;
    const target = Number(row.target) || 0;

    return {
      ...row,
      recovered,
      pieRecovered,
      target,
      completion: rowCompletion,
      risk: row.warn || rowCompletion < riskBaseline,
      gap: Math.max(0, target - recovered),
      share: safeRatioPercent(pieRecovered, Math.max(structureTotal, 1)),
      swatch: style.swatch,
      itemStyle: { color: style.color },
    };
  });
  const structureItems = structureRows.map((row) => {
    const style = channelStyle(row.key);
    const recovered = Number(row.recovered) || 0;
    const pieRecovered = Math.max(0, recovered * structureDisplayScale);
    return {
      ...row,
      recovered,
      pieRecovered,
      target: 0,
      completion: 0,
      share: safeRatioPercent(pieRecovered, Math.max(structureTotal, 1)),
      swatch: style.swatch,
      itemStyle: { color: style.color },
      isStructureOnly: true,
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
      swatch: INCOMPLETE_STRUCTURE_STYLE.swatch,
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
        key: row.key,
        value: row.pieRecovered,
        rawValue: row.recovered,
        targetValue: row.target,
        completion: row.completion,
        share: row.share,
        name: row.name,
        swatch: row.swatch,
        itemStyle: row.itemStyle,
      })),
      ...structureItems.map((row) => ({
        key: row.key,
        value: row.pieRecovered,
        rawValue: row.recovered,
        targetValue: 0,
        completion: 0,
        share: row.share,
        name: row.name,
        swatch: row.swatch,
        itemStyle: row.itemStyle,
        isStructureOnly: true,
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
      swatch: INCOMPLETE_STRUCTURE_STYLE.swatch,
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
        const isStructureOnly = Boolean(params.data?.isStructureOnly);
        const valueLabel = isIncomplete ? '目标缺口' : periodMeta.recoveredLabel;
        const swatch = params.data?.swatch ?? INCOMPLETE_STRUCTURE_STYLE.swatch;

        return `
          <div class="op-channel-tooltip" style="--op-channel-tooltip-accent: ${swatch};" aria-label="${params.name}${periodMeta.recoveredLabel}${value}万">
            <div class="op-channel-tooltip__head">
              <span class="op-channel-tooltip__marker"></span>
              <div class="op-channel-tooltip__name">${periodMeta.seriesName} · ${params.name}</div>
            </div>
            <div class="op-channel-tooltip__value">${valueLabel} <strong>${formatWan(value)}</strong> 万</div>
            <div class="op-channel-tooltip__meta">${isStructureOnly ? `图上占比 <strong>${share}%</strong>` : `图上占比 <strong>${share}%</strong> · 目标 ${formatWan(target)} 万 · 完成率 ${formatPct(completion)}`}</div>
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
        name: periodMeta.seriesName,
        radius: ['45%', '76%'],
        center: ['49.5%', '68%'],
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
          alignTo: 'edge',
          edgeDistance: 8,
          formatter: (params) => `{name|${params.name}}\n{percent|${params.percent}%}`,
          bleedMargin: 0,
          distanceToLabelLine: 0,
          overflow: 'none',
          color: tokens.chartText,
          rich: {
            name: {
              color: tokens.chartText,
              fontSize: 11,
              fontWeight: 850,
              lineHeight: 17,
              align: 'center',
              textShadowColor: 'rgba(0,0,0,.36)',
              textShadowBlur: 7,
            },
            percent: {
              color: tokens.chartText,
              fontSize: 10,
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
          length2: 8,
        },
        labelLayout: (params) => {
          if (params.labelRect?.x < 8) {
            return { x: 8 };
          }

          return {};
        },
        data: structure.pieData.map((item, index) => {
          const isChannelLabel = !item.isIncomplete && !item.isEmpty && Number(item.value) > 0;
          const isMinorLabel = isChannelLabel && index >= 2;
          const isIncompleteLabel = item.isIncomplete && Number(item.value) > 0;
          return {
            ...item,
            label: {
              show: isChannelLabel || isIncompleteLabel,
              ...(isChannelLabel ? { edgeDistance: isMinorLabel ? MINOR_LABEL_EDGE_DISTANCE : CHANNEL_LABEL_EDGE_DISTANCE } : {}),
              ...(isIncompleteLabel ? { edgeDistance: INCOMPLETE_LABEL_EDGE_DISTANCE } : {}),
            },
            labelLine: {
              show: isChannelLabel || isIncompleteLabel,
            },
          };
        }),
      },
    ],
  };
}

function RecoveryStructure({ structure, option, periodMeta, chartEvents, onBlankClick, title = '' }) {
  return (
    <div className="op-recovery-structure">
      {title && <h2 className="op-structure-title">{title}</h2>}
      <div
        className="op-channel-chart-wrap"
        aria-label={`${periodMeta.centerLabel} ${formatPct(structure.completion)}，${periodMeta.recoveredLabel} ${formatWan(structure.totalRecovered)} 万`}
      >
        <EChart
          className="op-channel-chart"
          option={option}
          onEvents={chartEvents}
          onBlankClick={onBlankClick}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}

function MonthlyRecoveryStructure({ structure, option, chartEvents, onBlankClick }) {
  return (
    <RecoveryStructure
      structure={structure}
      option={option}
      periodMeta={MONTH_STRUCTURE_META}
      chartEvents={chartEvents}
      onBlankClick={onBlankClick}
    />
  );
}

function AnnualRecoveryStructure({ structure, option, chartEvents, onBlankClick }) {
  return (
    <RecoveryStructure
      structure={structure}
      option={option}
      periodMeta={ANNUAL_STRUCTURE_META}
      chartEvents={chartEvents}
      onBlankClick={onBlankClick}
    />
  );
}

function OperatingSituation({ structure, subLabel = '实际回款 / 目标回款', insightTarget, onChannelClick }) {
  return (
    <aside className="op-operating-side" data-ai-insight-target={insightTarget}>
      <div className="op-operating-head">
        <div>
          <h2>经营情况</h2>
          <span>{subLabel}</span>
        </div>
      </div>

      <div className="op-channel-list">
        {structure.rows.map((row) => (
          <button
            type="button"
            className={`op-channel-item${row.risk ? ' op-channel-item--warn' : ''}`}
            key={row.key}
            onClick={(event) => {
              event.stopPropagation();
              onChannelClick(row.key);
            }}
            title={`查看${row.name}人员明细`}
          >
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
          </button>
        ))}
      </div>
    </aside>
  );
}

export default function OperatingOverview({ searchTerm = '', monthKpiCard, yearKpiCard, onOpenKpi }) {
  const tokens = useThemeTokens();
  const [annualExpanded, setAnnualExpanded] = useState(false);
  const [personDrilldown, setPersonDrilldown] = useState(null);
  const progressTitle = '本月回款总览';
  const progressKeywords = [progressTitle, ...PROGRESS_KEYWORDS_BASE];
  const monthChannelRows = getChannelCompletionRows('month');
  const annualChannelRows = getChannelCompletionRows('year');
  const monthlyStructure = useMemo(() => buildChannelStructure(monthChannelRows, REVENUE_STRUCTURE.month), [monthChannelRows]);
  const annualStructure = useMemo(() => buildChannelStructure(annualChannelRows, REVENUE_STRUCTURE.year), [annualChannelRows]);
  const monthlyStructureOption = useMemo(() => channelStructureOption(monthlyStructure, MONTH_STRUCTURE_META, tokens), [monthlyStructure, tokens]);
  const annualStructureOption = useMemo(() => channelStructureOption(annualStructure, ANNUAL_STRUCTURE_META, tokens), [annualStructure, tokens]);
  const monthlyChartEvents = useMemo(() => ({
    click: (params) => {
      if (params?.data?.key && !params.data.isIncomplete && !params.data.isEmpty && !params.data.isStructureOnly) {
        params.event?.event?.stopPropagation?.();
        setPersonDrilldown({ channelKey: params.data.key, period: 'month' });
      }
    },
  }), []);
  const annualChartEvents = useMemo(() => ({
    click: (params) => {
      if (params?.data?.key && !params.data.isIncomplete && !params.data.isEmpty && !params.data.isStructureOnly) {
        params.event?.event?.stopPropagation?.();
        setPersonDrilldown({ channelKey: params.data.key, period: 'year' });
      }
    },
  }), []);
  const annualCapsuleWidth = `${Math.min(KPI_DERIVED.yearCompletion, 100)}%`;
  const annualRemainingTarget = Math.max(0, KPI.yearTarget - KPI.yearRecovered);
  const annualTargetOver = Math.max(0, KPI.yearRecovered - KPI.yearTarget);
  const annualTargetStatusRisk = annualRemainingTarget > 0;
  const annualTargetStatusLabel = annualTargetStatusRisk ? '剩余目标' : '超额完成';
  const annualTargetStatusValue = annualTargetStatusRisk ? annualRemainingTarget : annualTargetOver;
  const monthTargetGap = Math.max(0, KPI.monthTarget - KPI.monthRecovered);
  const monthTargetOver = Math.max(0, KPI.monthRecovered - KPI.monthTarget);
  const targetStatusRisk = monthTargetGap > 0;
  const targetStatusLabel = targetStatusRisk ? '剩余目标' : '超额完成';
  const targetStatusValue = targetStatusRisk ? monthTargetGap : monthTargetOver;

  return (
    <div className="op-overview">
      <SearchResultBorder active={matchesSearchTerm(ANNUAL_KEYWORDS, searchTerm)} className="op-search-result op-search-result--annual">
        <section
          className={`op-panel op-panel--annual op-panel--clickable${annualExpanded ? ' is-expanded' : ''}`}
          data-anim
          role="button"
          tabIndex={0}
          aria-label="打开年度回款明细"
          onClick={() => {
            if (yearKpiCard) onOpenKpi?.(yearKpiCard);
          }}
          onKeyDown={(event) => {
            if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              if (yearKpiCard) onOpenKpi?.(yearKpiCard);
            }
          }}
        >
          <header className="op-annual-summary">
            <h2>年度回款总览</h2>
            <div
              className="op-annual-summary-progress"
              role="progressbar"
              aria-label="年度目标完成进度"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.min(Math.max(Math.round(KPI_DERIVED.yearCompletion), 0), 100)}
              aria-valuetext={formatPct(KPI_DERIVED.yearCompletion)}
            >
              <div className="op-annual-progress-track">
                <span className="op-annual-fill" style={{ width: annualCapsuleWidth }} />
              </div>
              <strong>{formatPct(KPI_DERIVED.yearCompletion)}</strong>
            </div>
            <button
              type="button"
              className="op-annual-toggle"
              aria-expanded={annualExpanded}
              aria-controls="annual-overview-details"
              aria-label={annualExpanded ? '收起年度回款总览' : '展开年度回款总览'}
              onClick={(event) => {
                event.stopPropagation();
                setAnnualExpanded((expanded) => !expanded);
              }}
            >
              <span className="op-annual-toggle-icon" aria-hidden="true" />
            </button>
          </header>

          <div
            id="annual-overview-details"
            className="op-annual-details"
            aria-hidden={!annualExpanded}
            inert={!annualExpanded}
          >
            <div className="op-annual-details-inner">
              <div className="op-annual-grid">
                <div className="op-annual-primary">
                  <div className="op-month-primary-value-row op-annual-primary-value-row">
                    <b>{formatWan(KPI.yearRecovered)}万</b>
                  </div>
                  <div className="op-month-primary-meta-row">
                    <span className="op-summary-sub op-month-refund-note">退款{formatWan(KPI.yearRefund ?? 0)}万</span>
                    <span className="op-summary-sub">年度目标 {formatWan(KPI.yearTarget)}万</span>
                  </div>
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
                  chartEvents={annualChartEvents}
                  onBlankClick={() => {
                    if (yearKpiCard) onOpenKpi?.(yearKpiCard);
                  }}
                />

                <OperatingSituation
                  structure={annualStructure}
                  subLabel="年度回款 / 年度目标"
                  onChannelClick={(channelKey) => setPersonDrilldown({ channelKey, period: 'year' })}
                />
              </div>
            </div>
          </div>
        </section>
      </SearchResultBorder>

      <SearchResultBorder active={matchesSearchTerm(progressKeywords, searchTerm)} className="op-search-result op-search-result--progress">
        <section
          className="op-panel op-panel--progress op-panel--clickable"
          data-ai-insight-target="performance"
          data-anim
          role="button"
          tabIndex={0}
          aria-label="打开本月回款明细"
          onClick={() => {
            if (monthKpiCard) onOpenKpi?.(monthKpiCard);
          }}
          onKeyDown={(event) => {
            if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              if (monthKpiCard) onOpenKpi?.(monthKpiCard);
            }
          }}
        >
          <header className="op-progress-head">
            <div>
              <h2>{progressTitle}</h2>
            </div>
          </header>

          <div className="op-month-grid">
            <div className="op-month-primary">
              <div className="op-month-primary-value-row">
                <b>{formatWan(KPI.monthRecovered)}万</b>
              </div>
              <div className="op-month-primary-meta-row">
                <span className="op-summary-sub op-month-refund-note">退款{formatWan(KPI.monthRefund ?? 0)}万</span>
                <span className="op-summary-sub">月度目标 {formatWan(KPI.monthTarget)}万</span>
              </div>
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
              chartEvents={monthlyChartEvents}
              onBlankClick={() => {
                if (monthKpiCard) onOpenKpi?.(monthKpiCard);
              }}
            />

            <OperatingSituation
              structure={monthlyStructure}
              insightTarget="channels"
              onChannelClick={(channelKey) => setPersonDrilldown({ channelKey, period: 'month' })}
            />
          </div>
        </section>
      </SearchResultBorder>
      {personDrilldown && (
        <ChannelMemberModal
          channelKey={personDrilldown.channelKey}
          period={personDrilldown.period}
          onClose={() => setPersonDrilldown(null)}
        />
      )}
    </div>
  );
}
