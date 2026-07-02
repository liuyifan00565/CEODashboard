/*
 Update time: 2026-07-02 17:50:46 CST
 Update content: Require recovery cards to keep a neutral dark glass base with only restrained accent edges.
*/
/*
 Update time: 2026-07-02 17:39:14 CST
 Update content: Require recovery card washes to follow completion accent colors instead of fixed lime.
*/
/*
 Update time: 2026-07-02 17:29:43 CST
 Update content: Guard recovery cards against local pie-only glow and require a subtle full-card lime wash.
*/
/*
 Update time: 2026-07-02 17:09:15 CST
 Update content: Tune KPI palette assertions for the refined lower-glow neon pass.
*/
/*
 更新时间: 2026-07-01 18:37:59 CST
 更新内容: KPI 二级弹窗回归测试改为要求深色无紫色光晕背景。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const componentSource = readFileSync(new URL('./KpiCard.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('./KpiCard.css', import.meta.url), 'utf8');
const modalCssSource = readFileSync(new URL('./KpiModal.css', import.meta.url), 'utf8');

test('uses optional display fields for the large KPI number', () => {
  assert.match(componentSource, /const displayValue = card\.displayValue \?\? card\.value;/);
  assert.match(componentSource, /const displayUnit = card\.displayUnit \?\? card\.unit;/);
  assert.match(componentSource, /const displayDecimals = card\.displayDecimals \?\? card\.decimals;/);
  assert.match(componentSource, /<NumberRoll value=\{displayValue\} suffix=\{suffix\} decimals=\{decimals\} \/>/);
});

test('renders month and year recovery cards with the ECharts half-donut layout', () => {
  assert.match(componentSource, /const isRecoveryCard = card\.key === 'month' \|\| card\.key === 'year';/);
  assert.match(componentSource, /function recoveryPieOption\(card, tokens, accentColor\)/);
  assert.match(componentSource, /className=\{`kpi-card\$\{isRecoveryCard \? ' kpi-card--recovery' : ''\}\$\{sidePanel \? ' kpi-card--with-side' : ''\}`\}/);
  assert.match(componentSource, /<div className="kpi-card__pie" aria-hidden="true">/);
  assert.match(componentSource, /<EChart option=\{recoveryPieOption\(card, tokens, recoveryAccent\)\}/);
  assert.match(componentSource, /function recoveryPieTooltipPosition\(point, params, dom, rect, size\) \{[\s\S]*?const gap = 14;[\s\S]*?const contentWidth = size\.contentSize\[0\];[\s\S]*?const viewWidth = size\.viewSize\[0\];[\s\S]*?return \[left, top\];[\s\S]*?\}/);
  assert.match(componentSource, /tooltip:\s*\{[\s\S]*?trigger:\s*'item'[\s\S]*?position:\s*recoveryPieTooltipPosition[\s\S]*?formatter:\s*\(params\) => \{[\s\S]*?const value = params\.data\?\.rawValue \?\? params\.value;[\s\S]*?const isIncomplete = params\.data\?\.isIncomplete;[\s\S]*?return `[\s\S]*?kpi-pie-tooltip__name[\s\S]*?\$\{params\.seriesName\} · \$\{params\.name\}[\s\S]*?kpi-pie-tooltip__value[\s\S]*?\$\{isIncomplete \? '缺口' : '回款'\} <strong>\$\{value\}<\/strong> 万[\s\S]*?kpi-pie-tooltip__meta[\s\S]*?目标 \$\{params\.data\?\.targetValue \?\? '-'\} 万[\s\S]*?占比 <strong>\$\{params\.percent\}%<\/strong>[\s\S]*?`/);
  assert.match(componentSource, /extraCssText:\s*'padding:0;border:0;background:transparent;box-shadow:none;pointer-events:none;'/);
  assert.doesNotMatch(componentSource, /position:\s*\['58%',\s*'2%'\]/);
  assert.match(componentSource, /legend:\s*\{\s*top:\s*'5%',\s*left:\s*'center'/);
  assert.match(componentSource, /radius:\s*\['40%',\s*'70%'\]/);
  assert.match(componentSource, /center:\s*\['46%',\s*'70%'\]/);
  assert.match(componentSource, /startAngle:\s*180/);
  assert.match(componentSource, /endAngle:\s*360/);
  assert.match(componentSource, /padAngle:\s*3/);
  assert.doesNotMatch(componentSource, /roseType:/);
  assert.match(componentSource, /\.sort\(\(a, b\) => a\.value - b\.value\)/);
  assert.doesNotMatch(componentSource, /function recoveryPieLabelNameLines/);
  assert.match(componentSource, /function recoveryPieLabelFormatter\(params\) \{[\s\S]*?return `\{name\|\$\{params\.name\}\}\\n\{\$\{recoveryPiePercentRichKey\(params\)\}\|\$\{params\.percent\}%\}`;[\s\S]*?\}/);
  assert.doesNotMatch(componentSource, /label\.startsWith\('线下'\)/);
  assert.match(componentSource, /const CHANNEL_PERCENT_COLORS = \['#ffffff', '#ffffff', '#ffffff', '#ffffff'\];/);
  assert.match(componentSource, /const INCOMPLETE_PERCENT_COLOR = '#ffffff';/);
  assert.match(componentSource, /function recoveryPiePercentRichKey\(params\) \{[\s\S]*?if \(name\.includes\('华东'\)\) return 'percentEast';[\s\S]*?if \(name\.includes\('华南'\)\) return 'percentSouth';[\s\S]*?if \(name\.includes\('代理'\)\) return 'percentAgent';[\s\S]*?if \(name\.includes\('未完成'\)\) return 'percentIncomplete';[\s\S]*?return 'percentOnline';[\s\S]*?\}/);
  assert.doesNotMatch(componentSource, /function recoveryPiePercentLabelFormatter/);
  assert.match(componentSource, /const RECOVERY_YEAR_LABEL_SLOTS = \{[\s\S]*?'线上': \{ y: 78 \},[\s\S]*?'代理': \{ y: 118 \},[\s\S]*?'线下华南': \{ y: 158 \},[\s\S]*?'线下华东': \{ y: 198 \},[\s\S]*?'未完成': \{ y: 156 \},[\s\S]*?\};/);
  assert.match(componentSource, /function recoveryPieLabelSlot\(params\) \{[\s\S]*?if \(text\.includes\('华东'\)\) return RECOVERY_YEAR_LABEL_SLOTS\['线下华东'\];[\s\S]*?if \(text\.includes\('华南'\)\) return RECOVERY_YEAR_LABEL_SLOTS\['线下华南'\];[\s\S]*?if \(text\.includes\('代理'\)\) return RECOVERY_YEAR_LABEL_SLOTS\['代理'\];[\s\S]*?if \(text\.includes\('未完成'\)\) return RECOVERY_YEAR_LABEL_SLOTS\['未完成'\];[\s\S]*?if \(text\.includes\('线上'\)\) return RECOVERY_YEAR_LABEL_SLOTS\['线上'\];[\s\S]*?\}/);
  assert.match(componentSource, /function recoveryPieLabelLayout\(params, cardKey\) \{[\s\S]*?if \(cardKey !== 'year'\) return undefined;[\s\S]*?const slot = recoveryPieLabelSlot\(params\);[\s\S]*?return \{[\s\S]*?y: slot\.y,[\s\S]*?hideOverlap: false,[\s\S]*?\};[\s\S]*?\}/);
  assert.match(componentSource, /label:\s*\{[\s\S]*?position:\s*'outside'[\s\S]*?distanceToLabelLine:\s*0/);
  assert.match(componentSource, /rich:\s*\{[\s\S]*?name:\s*\{[\s\S]*?fontSize:\s*15[\s\S]*?fontWeight:\s*900[\s\S]*?lineHeight:\s*19[\s\S]*?percentOnline:\s*\{[\s\S]*?color:\s*'#ffffff'[\s\S]*?fontSize:\s*13[\s\S]*?fontWeight:\s*900[\s\S]*?percentSouth:\s*\{[\s\S]*?color:\s*'#ffffff'[\s\S]*?fontSize:\s*13[\s\S]*?fontWeight:\s*900[\s\S]*?percentEast:\s*\{[\s\S]*?color:\s*'#ffffff'[\s\S]*?fontSize:\s*13[\s\S]*?fontWeight:\s*900[\s\S]*?percentAgent:\s*\{[\s\S]*?color:\s*'#ffffff'[\s\S]*?fontSize:\s*13[\s\S]*?fontWeight:\s*900[\s\S]*?percentIncomplete:\s*\{[\s\S]*?color:\s*'#ffffff'[\s\S]*?fontSize:\s*13[\s\S]*?fontWeight:\s*900/);
  assert.doesNotMatch(componentSource, /name:\s*`\$\{card\.title\}占比`/);
  assert.doesNotMatch(componentSource, /position:\s*'inside'/);
  assert.doesNotMatch(componentSource, /color:\s*'rgba\(0, 0, 0, 0\)'/);
  assert.match(componentSource, /labelLine:\s*\{[\s\S]*?show:\s*true[\s\S]*?lineStyle:\s*\{[\s\S]*?color:\s*'rgba\(239,251,255,\.74\)'[\s\S]*?width:\s*2[\s\S]*?\}[\s\S]*?smooth:\s*0\.18[\s\S]*?length:\s*12[\s\S]*?length2:\s*20/);
  assert.match(componentSource, /labelLayout:\s*\(params\) => recoveryPieLabelLayout\(params, card\.key\)/);
  assert.match(componentSource, /borderRadius:\s*8/);
  assert.match(componentSource, /shadowBlur:\s*22/);
  assert.match(componentSource, /animationType:\s*'scale'/);
  assert.match(componentSource, /animationEasing:\s*'elasticOut'/);
});

test('uses four sales source slices in the recovery half-donut chart', () => {
  assert.match(componentSource, /import \{ CHANNELS \} from '\.\.\/data\/mock';/);
  assert.match(componentSource, /const CHANNEL_PIE_LABELS = \{ south: '线下华南', east: '线下华东' \};/);
  assert.match(componentSource, /function channelPieName\(channel\) \{[\s\S]*?return CHANNEL_PIE_LABELS\[channel\.key\] \?\? channel\.name;[\s\S]*?\}/);
  assert.match(componentSource, /function recoveryPieData\(card\)/);
  assert.match(componentSource, /CHANNELS\.map\(\(channel, index\) =>/);
  assert.match(componentSource, /rawValue:\s*value/);
  assert.match(componentSource, /name:\s*channelPieName\(channel\)/);
  assert.doesNotMatch(componentSource, /name:\s*'已回款'/);
  assert.doesNotMatch(componentSource, /name:\s*'缺口'/);
});

test('shows target completion title and target amount at the upper-left of the recovery half-donut', () => {
  assert.match(componentSource, /function recoveryPieHeading\(card\) \{[\s\S]*?return card\.key === 'year' \? '本年目标完成情况' : '本月目标完成情况';[\s\S]*?\}/);
  assert.match(componentSource, /function recoveryTargetLabel\(card\) \{[\s\S]*?return card\.key === 'year' \? '年目标' : '月目标';[\s\S]*?\}/);
  assert.match(componentSource, /function recoveryCompletedLabel\(card\) \{[\s\S]*?return card\.key === 'year' \? '年完成' : '月完成';[\s\S]*?\}/);
  assert.match(componentSource, /function recoveryCompletedValue\(card\) \{[\s\S]*?return Math\.max\(Number\(card\.value\) \|\| 0, 0\);[\s\S]*?\}/);
  assert.match(componentSource, /function recoveryTargetValue\(card\) \{[\s\S]*?return recoveryCompletedValue\(card\) \+ \(Number\(card\.gap\) \|\| 0\);[\s\S]*?\}/);
  assert.match(componentSource, /<div className="kpi-card__pie-head">[\s\S]*?<div className="kpi-card__pie-title">\{recoveryPieHeading\(card\)\}<\/div>[\s\S]*?<div className="kpi-card__pie-sub">[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<EChart option=\{recoveryPieOption\(card, tokens, recoveryAccent\)\}/);
  assert.match(componentSource, /\{recoveryTargetLabel\(card\)\} <span className="kpi-card__pie-sub-value">\{recoveryTargetValue\(card\)\}<\/span> 万 · \{recoveryCompletedLabel\(card\)\} <span className="kpi-card__pie-sub-value">\{recoveryCompletedValue\(card\)\}<\/span> 万/);
  assert.match(cssSource, /\.kpi-card__pie-head\s*\{[\s\S]*?align-self:\s*flex-start;[\s\S]*?width:\s*auto;[\s\S]*?text-align:\s*left;[\s\S]*?z-index:\s*2;[\s\S]*?margin-top:\s*14px;[\s\S]*?margin-bottom:\s*-24px;[\s\S]*?margin-left:\s*54px;[\s\S]*?transform:\s*none;/);
  assert.match(cssSource, /\.kpi-card__pie-head\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;[\s\S]*?-webkit-user-select:\s*none;[\s\S]*?user-select:\s*none;/);
  assert.match(cssSource, /\.kpi-card__pie-title\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;[\s\S]*?font-size:\s*18px;[\s\S]*?font-weight:\s*800;/);
  assert.match(cssSource, /\.kpi-card__pie-sub\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;[\s\S]*?font-size:\s*15px;[\s\S]*?font-weight:\s*650;[\s\S]*?font-variant-numeric:\s*tabular-nums;/);
  assert.match(cssSource, /\.kpi-card__pie-sub-value\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;[\s\S]*?font-size:\s*17px;[\s\S]*?font-weight:\s*850;/);
});

test('adds a transparent unfinished slice at the right edge of the recovery half-donut', () => {
  assert.match(componentSource, /const INCOMPLETE_PIE_COLOR = 'rgba\(230, 251, 255, \.12\)';/);
  assert.match(componentSource, /const targetValue = recoveryTargetValue\(card\);/);
  assert.match(componentSource, /const incompleteValue = Math\.max\(0, targetValue - cardTotal\);/);
  assert.match(componentSource, /const incompleteSlice = \{[\s\S]*?rawValue:\s*incompleteValue[\s\S]*?targetValue[\s\S]*?name:\s*'未完成'[\s\S]*?isIncomplete:\s*true[\s\S]*?itemStyle:\s*\{[\s\S]*?color:\s*INCOMPLETE_PIE_COLOR[\s\S]*?opacity:\s*\.38[\s\S]*?borderColor:\s*'rgba\(230, 251, 255, \.2\)'/);
  assert.match(componentSource, /percentColor:\s*CHANNEL_PERCENT_COLORS\[index\]/);
  assert.match(componentSource, /percentColor:\s*INCOMPLETE_PERCENT_COLOR/);
  assert.match(componentSource, /return \[[\s\S]*?\.\.\.channelData\.sort\(\(a, b\) => a\.value - b\.value\),[\s\S]*?incompleteSlice,[\s\S]*?\];/);
  assert.match(componentSource, /const isIncomplete = params\.data\?\.isIncomplete;/);
  assert.match(componentSource, /\$\{isIncomplete \? '缺口' : '回款'\} \$\{value\} 万/);
  assert.match(componentSource, /目标 \$\{params\.data\?\.targetValue \?\? '-'\} 万 · 完成率 \$\{card\.progress \?\? params\.percent\}%/);
});

test('uses a bright premium tech palette instead of dull silver or candy pie colors', () => {
  assert.match(componentSource, /const CHANNEL_PIE_COLORS = \['#e6fbff', '#9eeeff', '#6ea8ff', '#b8ffd9'\];/);
  assert.doesNotMatch(componentSource, /const CHANNEL_PIE_COLORS = \['#d6ccb2', '#a9b3b8', '#808b93', '#5f6975'\];/);
  assert.doesNotMatch(componentSource, /const CHANNEL_PIE_COLORS = \['#dfff00', '#79f7ff', '#ff4fd8', '#a78bfa'\];/);
  assert.doesNotMatch(componentSource, /const CHANNEL_PIE_COLORS = \['#c8c7a7', '#7fa0a6', '#b98da2', '#8d88a8'\];/);
});

test('removes the bottom recovery legend so the half-donut can use the full visual area', () => {
  assert.doesNotMatch(componentSource, /const recoverySlices = isRecoveryCard \? recoveryPieData\(card\) : \[\];/);
  assert.doesNotMatch(componentSource, /className="kpi-card__pie-legend"/);
  assert.doesNotMatch(componentSource, /className="kpi-card__pie-chip"/);
  assert.doesNotMatch(cssSource, /\.kpi-card__pie-legend/);
  assert.doesNotMatch(cssSource, /\.kpi-card__pie-chip/);
});

test('uses a neutral dark glass base with only restrained completion accent at the edges', () => {
  assert.match(cssSource, /\.kpi-card--recovery\s*\{[\s\S]*?background:[\s\S]*?linear-gradient\(112deg, color-mix\(in srgb, var\(--kpi-accent\) 4%, transparent\) 0%, color-mix\(in srgb, var\(--kpi-accent\) 2%, transparent\) 30%, transparent 62%\)/);
  assert.match(cssSource, /\.kpi-card--recovery\s*\{[\s\S]*?linear-gradient\(180deg, rgba\(255,\s*255,\s*255,\s*\.026\), rgba\(255,\s*255,\s*255,\s*\.006\)\),[\s\S]*?rgba\(4,\s*5,\s*7,\s*\.18\);/);
  assert.doesNotMatch(cssSource, /var\(--kpi-accent\) (?:13|8\.5|7|4\.5)%, transparent/);
  assert.doesNotMatch(cssSource, /radial-gradient\(circle at 20% 48%/);
  assert.doesNotMatch(cssSource, /\.kpi-card--recovery::before\s*\{[\s\S]*?width:\s*330px/);
  assert.match(cssSource, /\.kpi-card--recovery::before\s*\{[\s\S]*?inset:\s*0;[\s\S]*?width:\s*auto;[\s\S]*?border-radius:\s*inherit;[\s\S]*?linear-gradient\(90deg, color-mix\(in srgb, var\(--kpi-accent\) 6%, transparent\) 0%, transparent 18%, transparent 82%, color-mix\(in srgb, var\(--kpi-accent\) 4%, transparent\) 100%\)/);
  assert.match(cssSource, /\.kpi-card--recovery::before\s*\{[\s\S]*?mix-blend-mode:\s*screen;[\s\S]*?opacity:\s*\.48;/);
  assert.match(cssSource, /filter:\s*drop-shadow\(0 0 10px color-mix\(in srgb, var\(--kpi-accent\) 12%, transparent\)\)/);
  assert.match(componentSource, /<EChart option=\{progressOption\(card\.progress, tokens\)\} className="kpi-card__progress-chart" style=\{\{ height: 12 \}\} \/>/);
  assert.match(cssSource, /\.kpi-card--recovery \.kpi-card__progress-chart\s*\{[\s\S]*?opacity:\s*\.82;[\s\S]*?filter:\s*saturate\(\.82\);/);
  assert.match(cssSource, /\.kpi-card__side-panel \.ch-bar-fill\s*\{[\s\S]*?opacity:\s*\.82;[\s\S]*?filter:\s*saturate\(\.82\);/);
});

test('keeps recovery half-donut labels readable in the elongated card', () => {
  assert.match(componentSource, /<EChart option=\{recoveryPieOption\(card, tokens, recoveryAccent\)\} className="kpi-card__pie-chart" style=\{\{ height: 326 \}\} \/>/);
  assert.match(componentSource, /minShowLabelAngle:\s*1/);
  assert.match(componentSource, /formatter:\s*recoveryPieLabelFormatter/);
  assert.match(componentSource, /position:\s*'outside'/);
  assert.match(componentSource, /labelLayout:\s*\(params\) => recoveryPieLabelLayout\(params, card\.key\)/);
  assert.doesNotMatch(componentSource, /avoidLabelOverlap:\s*false/);
  assert.match(cssSource, /grid-template-columns:\s*minmax\(340px,\s*460px\) minmax\(0,\s*1fr\)/);
  assert.match(cssSource, /width:\s*clamp\(430px,\s*34vw,\s*560px\)/);
  assert.match(cssSource, /justify-self:\s*start;/);
  assert.match(cssSource, /margin-left:\s*-18px;/);
  assert.match(cssSource, /min-height:\s*342px/);
  assert.match(cssSource, /@media \(max-width:760px\) \{[\s\S]*?\.kpi-card__pie\s*\{[\s\S]*?justify-self:\s*center;[\s\S]*?margin-left:\s*0;[\s\S]*?\}[\s\S]*?\.kpi-card__pie-head\s*\{[\s\S]*?transform:\s*none;/);
});

test('allows the month recovery card to host the sales completion panel in the same card', () => {
  assert.match(componentSource, /export default function KpiCard\(\{ card, onOpen, sidePanel \}\)/);
  assert.match(componentSource, /className=\{`kpi-card\$\{isRecoveryCard \? ' kpi-card--recovery' : ''\}\$\{sidePanel \? ' kpi-card--with-side' : ''\}`\}/);
  assert.match(componentSource, /sidePanel && \(/);
  assert.match(componentSource, /className="kpi-card__side-panel"/);
  assert.match(cssSource, /\.kpi-card--with-side\s*\{[\s\S]*?grid-template-columns:\s*minmax\(400px,\s*500px\) minmax\(270px,\.86fr\) minmax\(340px,\.95fr\);[\s\S]*?gap:\s*12px;[\s\S]*?min-height:\s*342px;/);
  assert.match(cssSource, /\.kpi-card__side-panel\s*\{/);
});

test('makes the recovery metric block larger and shifts it left inside the long card', () => {
  assert.match(cssSource, /\.kpi-card--with-side \.kpi-card__body\s*\{[\s\S]*?margin-left:\s*-24px;[\s\S]*?gap:\s*8px;/);
  assert.match(cssSource, /\.kpi-card--with-side \.kpi-card__title\s*\{[\s\S]*?font-size:\s*15px;[\s\S]*?font-weight:\s*600;/);
  assert.match(cssSource, /\.kpi-card--with-side \.kpi-card__value\s*\{[\s\S]*?font-size:\s*clamp\(38px,\s*3\.2vw,\s*46px\);/);
  assert.match(cssSource, /\.kpi-card--with-side \.kpi-card__sub,[\s\S]*?\.kpi-card--with-side \.kpi-card__progress-head,[\s\S]*?\.kpi-card--with-side \.kpi-card__hint\s*\{[\s\S]*?font-size:\s*15px;/);
  assert.match(cssSource, /\.kpi-card--with-side \.kpi-card__progress-pct\s*\{[\s\S]*?font-size:\s*16px;/);
});

test('formats recovery pie hover text as name over number instead of inline rows', () => {
  assert.match(componentSource, /class="kpi-pie-tooltip"/);
  assert.match(componentSource, /<div class="kpi-pie-tooltip__name">\$\{params\.seriesName\} · \$\{params\.name\}<\/div>/);
  assert.match(componentSource, /<div class="kpi-pie-tooltip__value">\$\{isIncomplete \? '缺口' : '回款'\} <strong>\$\{value\}<\/strong> 万<\/div>/);
  assert.match(componentSource, /<div class="kpi-pie-tooltip__meta">目标 \$\{params\.data\?\.targetValue \?\? '-'\} 万 · 完成率 \$\{card\.progress \?\? params\.percent\}%<\/div>/);
  assert.match(componentSource, /<div class="kpi-pie-tooltip__meta">占比 <strong>\$\{params\.percent\}%<\/strong><\/div>/);
  assert.doesNotMatch(componentSource, /word-break:break-all/);
  assert.doesNotMatch(componentSource, /formatter:\s*'\{b\|{b}\}\\n\{d\|{d}%\}'/);
  assert.doesNotMatch(componentSource, /formatter:\s*\(params\) => `\{name\|\$\{params\.name\}\}\\n\{percent\|\$\{params\.percent\}%\}`/);
});

test('styles the recovery pie mini tooltip with the modal glass frame and a darker readable fill', () => {
  assert.match(modalCssSource, /\.km-card\s*\{[\s\S]*?linear-gradient\(90deg, rgba\(9,\s*9,\s*13,\s*0\.96\), rgba\(5,\s*5,\s*8,\s*0\.96\) 52%, rgba\(3,\s*3,\s*6,\s*0\.98\)\)[\s\S]*?rgba\(4,\s*4,\s*7,\s*0\.96\);[\s\S]*?border:\s*1px solid var\(--line-2\);[\s\S]*?backdrop-filter:\s*blur\(26px\) saturate\(145%\);[\s\S]*?box-shadow:\s*0 34px 110px rgba\(0,\s*0,\s*0,\s*0\.72\), inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.16\);/);
  assert.match(modalCssSource, /\.km-mask\s*\{[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.82\);[\s\S]*?backdrop-filter:\s*blur\(14px\) saturate\(120%\);/);
  assert.doesNotMatch(modalCssSource, /\.km-card\s*\{[\s\S]*?background:\s*transparent;/);
  assert.doesNotMatch(modalCssSource, /\.km-card\s*\{[\s\S]*?radial-gradient\(circle at 20% 42%, rgba\(255, 79, 216/);
  assert.doesNotMatch(modalCssSource, /\.km-card\s*\{[\s\S]*?radial-gradient\(circle at 4% 86%, rgba\(96, 0, 255/);
  assert.match(cssSource, /\.kpi-pie-tooltip\s*\{[\s\S]*?position:\s*relative;[\s\S]*?overflow:\s*hidden;[\s\S]*?border:\s*1px solid var\(--line-2\);[\s\S]*?background:\s*rgba\(5,\s*6,\s*9,\s*\.74\);[\s\S]*?backdrop-filter:\s*var\(--glass-blur\);[\s\S]*?box-shadow:\s*0 22px 70px rgba\(0,\s*0,\s*0,\s*0\.56\), inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.16\);/);
  assert.match(cssSource, /\.kpi-pie-tooltip::after\s*\{[\s\S]*?animation:\s*kpiTooltipSweep 2\.8s linear infinite;/);
  assert.match(cssSource, /@keyframes kpiTooltipSweep\s*\{[\s\S]*?from\s*\{[\s\S]*?translateX\(-150%\)[\s\S]*?to\s*\{[\s\S]*?translateX\(260%\)/);
  assert.match(cssSource, /@keyframes kpiTooltipPulse\s*\{[\s\S]*?box-shadow:[\s\S]*?rgba\(0,\s*0,\s*0,\s*\.6\)/);
  assert.doesNotMatch(componentSource, /kpi-pie-tooltip--success/);
  assert.doesNotMatch(cssSource, /kpi-pie-tooltip--success/);
  assert.doesNotMatch(cssSource, /\.km-card/);
});
