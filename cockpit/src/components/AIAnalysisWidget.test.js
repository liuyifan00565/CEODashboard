/*
 更新时间: 2026-07-13 14:48:53 CST
 更新内容: 回归测试锁定桌面与移动端左下角 AI 小人入口均为无卡片容器的小人与两行助手文案。
*/
/*
 Update time: 2026-07-10 16:05:00 CST
 Update content: Require the AI assistant to fall back to local business briefs and hide raw DashScope error JSON.
*/
/*
 更新时间: 2026-07-10 15:24:00 CST
 更新内容: 覆盖短屏、简报去重、实时续费及算力接口未就绪时不向 Qwen 暴露默认算力值。
*/
/*
 更新时间: 2026-07-09 13:18:11 CST
 更新内容: 验收 AI 小人临时动作时长与福客帧级 motion bridge 对齐，避免 guide/click 未播完就切回 resting。
*/
/*
 Update time: 2026-07-07 18:12:09 CST
 Update content: Require the sidebar AI launcher to reserve enough guarded stage space so mascot images never appear clipped.
*/
/*
 Update time: 2026-07-07 17:45:31 CST
 Update content: Require the AI mascot launcher to play a visible greeting wave on first mount instead of hiding wave behind idle cues.
*/
/*
 Update time: 2026-07-07 16:59:41 CST
 Update content: Require the sidebar AI mascot launcher to show the frame mascot at a visibly larger production size.
*/
/*
 更新时间: 2026-07-07 16:26:47 CST
 更新内容: AI 小人 guide 改由真实动作帧图表达，移除外层伪指引光束断言。
*/
/*
 更新时间: 2026-07-07 15:09:26 CST
 更新内容: 增加 AI 小人 guide 外层指引光束测试，确保点击后明确导向右侧对话框。
*/
/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 将 AI 入口集成验收切换为 2D Sprite 小人舞台，并接收页面场景 context。
*/
/*
 更新时间: 2026-07-07 13:20:49 CST
 更新内容: 将 AI 小人入口测试改为固定指针与点击触发动作，防止鼠标悬停或移动导致小人乱跑。
*/
/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 约束点击打开 AI 对话框时播放约 1 秒 guide 指引动作，点击关闭不触发指引。
*/
/*
 更新时间: 2026-07-06 10:49:22 CST
 更新内容: 同步 AI 小人入口测试描述，明确透明参考图重新作为小人舞台资产。
*/
/*
 更新时间: 2026-07-06 10:37:27 CST
 更新内容: 同步 AI 小人入口测试描述，明确新分层小人不依赖透明 PNG 整图渲染。
*/
/*
 更新时间: 2026-07-05 16:12:00 CST
 更新内容: AI 入口测试同步 220px 侧栏状态卡尺寸和状态文案。
*/
/*
 更新时间: 2026-07-03 19:08:26 CST
 更新内容: 进一步放松 AI 小人入口集成断言的导入与事件命名绑定，保留状态归属和 mascot 资产隔离要求。
*/
/*
 更新时间: 2026-07-03 18:27:19 CST
 更新内容: 将 AI 小人入口资产隔离断言改为检查去注释源码，禁止直接 PNG 和 mascot 资产引用。
*/
/*
 更新时间: 2026-07-03 18:22:01 CST
 更新内容: 扩大 AI 弹窗入口测试覆盖，禁止直接引用任意 AI 小人或 mascot 图片资产。
*/
/*
 更新时间: 2026-07-03 18:06:34 CST
 更新内容: 补充 AI 弹窗入口不得直接引用 AI 小人 PNG 图片资产的集成断言。
*/
/*
 更新时间: 2026-07-03 15:45:00 CST
 更新内容: 同步 AI 弹窗卡片深色主题底色到冷紫深海蓝黑视觉体系。
*/
/*
 更新时间: 2026-07-02 16:25:43 CST
 更新内容: 约束左下角 AI 小人入口保持小尺寸，同时恢复原亮度与动作发光强度。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const componentSource = readFileSync(new URL('./AIAnalysisWidget.jsx', import.meta.url), 'utf8');
const componentCss = readFileSync(new URL('./AIAnalysisWidget.css', import.meta.url), 'utf8');
const hoverCueSource = readFileSync(new URL('../lib/hoverCue.js', import.meta.url), 'utf8');
const indexCss = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const mascotTransparentUrl = new URL('../../public/ai-mascot-transparent.png', import.meta.url);
const componentCode = stripSourceComments(componentSource);

function stripSourceComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function themeBlock(theme) {
  const selector = theme === 'dark' ? ':root,\\s*\\n:root\\[data-theme="dark"\\]' : ':root\\[data-theme="light"\\]';
  const match = indexCss.match(new RegExp(`${selector}\\{(?<body>[\\s\\S]*?)\\n\\}`));
  assert.ok(match?.groups?.body, `${theme} theme block should exist`);
  return match.groups.body;
}

test('uses the 2D mascot sprite stage for the AI launcher', () => {
  const stageInvocation = componentCode.match(/<MascotSpriteStage\b[\s\S]*?\/>/)?.[0] ?? '';
  const actionState = componentCode.match(/const\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*[A-Za-z_$][\w$]*\s*\]\s*=\s*useState\(\s*MASCOT_ACTIONS\.idle\s*\)/);

  assert.match(componentCode, /MascotSpriteStage/);
  assert.ok(stageInvocation, 'AI launcher should render MascotSpriteStage');
  assert.ok(actionState, 'AIAnalysisWidget should own the mascot action state');
  assert.doesNotMatch(componentCode, /spinToken/);
  assert.doesNotMatch(componentCode, /setSpinToken/);
  assert.match(componentCode, /ai-orb/);
  assert.match(stageInvocation, new RegExp(`\\b(?:action|mascotAction)=\\{\\s*${actionState[1]}\\s*\\}`));
  assert.match(stageInvocation, /\bcontext=\{context\}/);
  assert.match(stageInvocation, /\b(?:analysisActive|active|analyzing)=\{\s*(?:open\s*\|\|\s*loading|loading\s*\|\|\s*open)\s*\}/);
  assert.match(componentCode, /aria-label=\{[^}]*open[^}]*\}/);
  assert.match(componentCode, /aria-expanded=\{open\}/);
  assert.doesNotMatch(componentCode, /onPointerMove=/);
  assert.doesNotMatch(componentCode, /onMouseEnter=/);
  assert.doesNotMatch(componentCode, /onMouseLeave=/);
  assert.match(componentCode, /onClick=\{[^}]+\}/);
  assert.doesNotMatch(componentCode, /Mascot3DStage|mascot-3d-stage|\.glb|useGLTF|Canvas/);
  assert.doesNotMatch(componentCode, /\/assets\/mascot\//);
});

test('keeps the mascot anchored instead of tracking cursor movement', () => {
  assert.doesNotMatch(componentSource, /function handleMascotPointerMove/);
  assert.doesNotMatch(componentSource, /setMascotPointer/);
  assert.doesNotMatch(componentSource, /onPointerMove=/);
  assert.doesNotMatch(componentSource, /setMascotAction\(MASCOT_ACTIONS\.wave\);/);
});

test('plays a visible greeting wave shortly after the launcher first mounts', () => {
  assert.match(componentSource, /const GREETING_WAVE_DELAY = 240;/);
  assert.match(componentSource, /const GREETING_WAVE_DURATION = 1200;/);
  assert.match(componentSource, /const greetingWaveTimerRef = useRef\(null\);/);
  assert.match(componentSource, /clearTimeout\(greetingWaveTimerRef\.current\);/);
  assert.match(componentSource, /greetingWaveTimerRef\.current = window\.setTimeout\(\(\) => \{/);
  assert.match(componentSource, /playMascotAction\(MASCOT_ACTIONS\.wave,\s*GREETING_WAVE_DURATION,\s*false\);/);
  assert.doesNotMatch(componentSource, /onMouseEnter=\{[^}]*wave/);
});

test('shows one factual business brief per browser session and business month', () => {
  assert.match(componentSource, /import \{ buildBusinessBrief \} from '\.\.\/lib\/businessBrief';/);
  assert.match(componentSource, /const BUSINESS_BRIEF_DELAY = 1800;/);
  assert.match(componentSource, /const BUSINESS_BRIEF_DURATION = 7200;/);
  assert.match(componentSource, /const BUSINESS_BRIEF_STORAGE_PREFIX = 'ceo-dashboard:business-brief';/);
  assert.match(componentSource, /const \[bubbleCue,\s*setBubbleCue\] = useState\(null\);/);
  assert.match(componentSource, /const \[bubbleVisible,\s*setBubbleVisible\] = useState\(false\);/);
  assert.match(componentSource, /const businessBriefTimerRef = useRef\(null\);/);
  assert.match(componentSource, /const businessBriefShownRef = useRef\(new Set\(\)\);/);
  assert.match(componentSource, /const showCompanionCueRef = useRef\(null\);/);
  assert.match(componentSource, /buildBusinessBrief\(snapshot\)/);
  assert.match(componentSource, /window\.sessionStorage\.getItem\(storageKey\)/);
  assert.match(componentSource, /window\.sessionStorage\.setItem\(storageKey, 'shown'\)/);
  assert.match(componentSource, /businessBriefShownRef\.current\.has\(storageKey\)/);
  assert.match(componentSource, /businessBriefShownRef\.current\.add\(storageKey\)/);
  assert.match(componentSource, /showCompanionCueRef\.current\?\.\(\s*\{ text: businessBrief\.text, action: MASCOT_ACTIONS\.talk \},\s*\{\s*openDialog: false,\s*duration: BUSINESS_BRIEF_DURATION,\s*\},\s*\);/s);
  assert.match(componentSource, /className=\{`ai-bubble\$\{bubbleVisible \? ' ai-bubble--visible' : ''\}`\}/);
  assert.doesNotMatch(componentSource, /DEFAULT_BUBBLE_INTERVAL|getIdleCompanionCue|idlePromptIndexRef|window\.setInterval/);
  assert.doesNotMatch(componentSource, /ai-bubble-name/);
});

test('includes CEO quick analysis prompts and deterministic dashboard data in the AI snapshot', () => {
  assert.match(componentSource, /label: '今日简报'/);
  assert.match(componentSource, /label: '本月报告'/);
  assert.match(componentSource, /label: '渠道与版本'/);
  assert.match(componentSource, /label: '业绩与算力'/);
  assert.match(componentSource, /没有单独的今日销售额/);
  assert.match(componentSource, /事实、可能原因、数据缺口和下一步动作/);
  assert.match(componentSource, /续费观察/);
  assert.doesNotMatch(componentSource, /续费风险/);
  assert.match(componentSource, /OPERATING_OVERVIEW_METRICS/);
  assert.match(componentSource, /COMPUTE_OVERVIEW/);
  assert.match(componentSource, /COMPUTE_USAGE_TREND/);
  assert.match(componentSource, /getRenewalModalData/);
  assert.match(componentSource, /operating: OPERATING_OVERVIEW_METRICS/);
  assert.match(componentSource, /compute: computeReady/);
  assert.match(componentSource, /renewal: getRenewalModalData\('all', 'month', 'all'\)\.overview/);
  assert.doesNotMatch(componentSource, /RENEWAL_OVERVIEW/);
});

test('only exposes compute values to Qwen after external compute data is ready', () => {
  assert.match(componentSource, /function buildDashboardSnapshot\(activeMenu, dim, channelKey, computeDataState\)/);
  assert.match(componentSource, /const computeReady = computeDataState\?\.status === 'ready';/);
  assert.match(componentSource, /compute: computeReady\s*\?\s*\{\s*status: 'ready',\s*overview: COMPUTE_OVERVIEW,\s*usageTrend: COMPUTE_USAGE_TREND,\s*\}\s*:\s*\{/s);
  assert.match(componentSource, /status: computeDataState\?\.status \|\| 'idle'/);
  assert.match(componentSource, /dataGap: computeDataState\?\.error \|\| '外部算力数据尚未就绪'/);
  assert.match(componentSource, /buildDashboardSnapshot\(activeMenu, dim, channelKey, computeDataState\)/);
});

test('falls back to local business brief instead of showing raw DashScope error JSON', () => {
  assert.match(componentSource, /const DAILY_BRIEF_PROMPT = /);
  assert.match(componentSource, /prompt: DAILY_BRIEF_PROMPT/);
  assert.match(componentSource, /function isDailyBriefPrompt\(question\)/);
  assert.match(componentSource, /function buildLocalDailyBriefReply\(businessBrief\)/);
  assert.match(componentSource, /function readAiErrorMessage\(text, status\)/);
  assert.match(componentSource, /readAiErrorMessage\(text, response\.status\)/);
  assert.match(componentSource, /if \(isDailyBriefPrompt\(question\)\) \{/);
  assert.match(componentSource, /content: buildLocalDailyBriefReply\(businessBrief\)/);
  assert.match(componentSource, /throw new Error\(readAiErrorMessage\(text, response\.status\)\)/);
  assert.doesNotMatch(componentSource, /\{ \.\.\.item, content: message \}/);
  assert.match(componentSource, /current\.some\(\(item\) => item\.id === assistantId && !item\.content\)/);
  assert.match(componentSource, /current\.filter\(\(messageItem\) => messageItem\.id !== assistantId\)/);
});

test('offers compact controls for locating the relevant dashboard sections', () => {
  assert.match(componentSource, /onNavigateInsight/);
  assert.match(componentSource, /const INSIGHT_ACTIONS = \[/);
  assert.match(componentSource, /target: 'performance'/);
  assert.match(componentSource, /target: 'channels'/);
  assert.match(componentSource, /target: 'trend'/);
  assert.match(componentSource, /target: 'versions'/);
  assert.match(componentSource, /target: 'compute'/);
  assert.match(componentSource, /className="ai-insight-actions" aria-label="定位看板指标"/);
  assert.match(componentSource, /onNavigateInsight\?\.\(target\)/);
});

test('keeps the mobile AI dialog viewport-fixed while the launcher remains cardless', () => {
  const mobileBlock = componentCss.match(/@media \(max-width:\s*760px\)\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? '';

  assert.match(mobileBlock, /\.ai-widget\s*\{[\s\S]*?padding:\s*8px 0;/);
  assert.doesNotMatch(mobileBlock, /\.ai-widget::before\s*\{/);
  assert.match(mobileBlock, /\.ai-card-wrap\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?left:\s*12px;[\s\S]*?right:\s*12px;[\s\S]*?bottom:\s*12px;/);
  assert.match(mobileBlock, /\.ai-insight-actions\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(mobileBlock, /\.ai-card \.border-glow-inner\s*\{[\s\S]*?max-height:\s*calc\(100dvh - 24px\);/);
  assert.match(mobileBlock, /\.ai-card-inner\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?height:\s*min\(548px, calc\(100dvh - 24px\)\);[\s\S]*?overflow-y:\s*auto;/);
  assert.match(mobileBlock, /\.ai-message-list\s*\{[\s\S]*?min-height:\s*96px;/);
});

test('delays and throttles readable-text hover bubbles', () => {
  assert.match(componentSource, /const HOVER_CUE_DELAY = 900;/);
  assert.match(componentSource, /const HOVER_BUBBLE_COOLDOWN = 6000;/);
  assert.match(componentSource, /const lastBubbleShownAtRef = useRef\(0\);/);
  assert.match(componentSource, /function showCompanionCue\(cue, \{ openDialog = false, duration = 5600, respectCooldown = false \} = \{\}\)/);
  assert.match(componentSource, /const now = Date\.now\(\);/);
  assert.match(componentSource, /if \(respectCooldown && now - lastBubbleShownAtRef\.current < HOVER_BUBBLE_COOLDOWN\) \{\s*return false;\s*\}/s);
  assert.match(componentSource, /lastBubbleShownAtRef\.current = now;/);
  assert.match(componentSource, /return true;/);
  assert.doesNotMatch(componentSource, /HOVER_INSTANT_CUE_DURATION/);
  assert.doesNotMatch(componentSource, /buildInstantHoverCue\(normalizedText\)/);
  assert.match(componentSource, /showCompanionCue\(\{ text: cue, action: MASCOT_ACTIONS\.talk \}, \{ openDialog: false, duration: HOVER_CUE_DURATION, respectCooldown: true \}\);/);
  assert.match(componentSource, /showCompanionCue\(\{ text: fallbackCue, action: MASCOT_ACTIONS\.think \}, \{ openDialog: false, duration: 3200, respectCooldown: true \}\);/);
});

test('responds to KPI card context with matching speech and motion', () => {
  assert.match(componentSource, /useEffect\(\(\) => \{\s*if \(!companionCue\) return;\s*showCompanionCue\(companionCue, \{ openDialog: false \}\);/s);
  assert.match(componentSource, /setMascotAction\(cue\.action \?\? getSpeechAction\(cue\.text\)\);/);
  assert.match(componentSource, /showCompanionCue\(companionCue, \{ openDialog: false \}\);/);
});

test('plays the full guide motion only when opening the AI dialog from the mascot', () => {
  assert.match(componentSource, /const GUIDE_MOTION_DURATION = 1200;/);
  assert.match(componentSource, /const CLICK_MOTION_DURATION = 900;/);
  assert.match(componentSource, /if \(nextOpen\) \{\s*playMascotAction\(MASCOT_ACTIONS\.guide,\s*GUIDE_MOTION_DURATION,\s*true\);[\s\S]*?openAiDialog\(\);[\s\S]*?return;\s*\}/);
  assert.match(componentSource, /playMascotAction\(MASCOT_ACTIONS\.click,\s*CLICK_MOTION_DURATION,\s*false\);/);
  assert.doesNotMatch(componentSource, /playMascotAction\(MASCOT_ACTIONS\.guide,\s*1000,\s*false\)/);
});

test('keeps the widget action class while relying on real guide frames instead of a fake beam', () => {
  assert.match(componentSource, /className=\{`ai-widget ai-widget--\$\{mascotAction\}/);
  assert.doesNotMatch(componentCss, /\.ai-widget::after\s*\{/);
  assert.doesNotMatch(componentCss, /ai-widget-guide-beam/);
  assert.doesNotMatch(componentCss, /content:\s*['"][^'"]+[A-Za-z\u4e00-\u9fff][^'"]*['"]/);
});

test('keeps temporary guide motion while the opened dialog state settles', () => {
  assert.match(componentSource, /current === MASCOT_ACTIONS\.click \|\| current === MASCOT_ACTIONS\.guide/);
});

test('does not use mascot hover handlers that can interrupt temporary guide motion', () => {
  assert.doesNotMatch(componentSource, /function handleMascotEnter/);
  assert.doesNotMatch(componentSource, /function handleMascotLeave/);
  assert.doesNotMatch(componentSource, /onMouseEnter=/);
  assert.doesNotMatch(componentSource, /onMouseLeave=/);
});

test('locks guide motion against competing mascot action setters until its timer finishes', () => {
  assert.match(componentSource, /const guideLockUntilRef = useRef\(0\);/);
  assert.match(componentSource, /Date\.now\(\) < guideLockUntilRef\.current/);
  assert.match(componentSource, /guideLockUntilRef\.current = Date\.now\(\) \+ duration;/);
  assert.match(componentSource, /guideLockUntilRef\.current = 0;/);
});

test('requests Qwen hover bubble cues from readable page text', () => {
  assert.doesNotMatch(componentSource, /buildInstantHoverCue/);
  assert.match(componentSource, /normalizeHoverCueText/);
  assert.match(componentSource, /shouldRequestHoverCue/);
  assert.match(componentSource, /buildHoverCueCacheKey/);
  assert.match(componentSource, /getHoverCueTextFromElement/);
  assert.match(componentSource, /const HOVER_CUE_DELAY = 900;/);
  assert.match(componentSource, /const hoverCueTimerRef = useRef\(null\);/);
  assert.match(componentSource, /const hoverCueCacheRef = useRef\(new Map\(\)\);/);
  assert.match(componentSource, /const hoverCueActiveKeyRef = useRef\(''\);/);
  assert.match(componentSource, /document\.addEventListener\('pointerover', handleTextPointerOver\);/);
  assert.match(componentSource, /hoverCueActiveKeyRef\.current !== cacheKey/);
  assert.match(componentSource, /fetch\('\/api\/ai\/hover-cue'/);
  assert.match(componentSource, /showCompanionCue\(\{ text: cue, action: MASCOT_ACTIONS\.talk \}, \{ openDialog: false, duration: HOVER_CUE_DURATION, respectCooldown: true \}\);/);
  assert.match(componentSource, /showCompanionCue\(\{ text: fallbackCue, action: MASCOT_ACTIONS\.think \}, \{ openDialog: false, duration: 3200, respectCooldown: true \}\);/);
  assert.doesNotMatch(hoverCueSource, /export function buildInstantHoverCue/);
  assert.match(hoverCueSource, /export function getHoverCueTextFromElement/);
  assert.match(hoverCueSource, /\.closest\('\.ai-widget'\)/);
});

test('keeps the AI dialog content and behavior intact', () => {
  assert.match(componentSource, /const \[renderCard,\s*setRenderCard\] = useState\(false\);/);
  assert.match(componentSource, /function openAiDialog\(\)\s*\{[^}]*setRenderCard\(true\);[^}]*setOpen\(true\);/s);
  assert.match(componentSource, /function closeAiDialog\(\)\s*\{[^}]*setOpen\(false\);/s);
  assert.match(componentSource, /<section className="ai-card-inner" aria-label="AI 分析对话框">/);
  assert.match(componentSource, /<h2>AI 经营分析<\/h2>/);
  assert.match(componentSource, /<p>通义 Qwen3\.7 Max · 当前页面数据<\/p>/);
  assert.match(componentSource, /今日简报/);
  assert.match(componentSource, /本月报告/);
  assert.match(componentSource, /渠道与版本/);
  assert.match(componentSource, /业绩与算力/);
  assert.match(componentSource, /placeholder="问一下当前经营数据\.\.\."/);
  assert.match(componentSource, /fetch\('\/api\/ai\/analyze'/);
});

test('uses theme-specific AI dialog card backgrounds', () => {
  const darkBlock = themeBlock('dark');
  const lightBlock = themeBlock('light');

  assert.match(componentSource, /backgroundColor="var\(--ai-card-bg\)"/);
  assert.doesNotMatch(componentSource, /backgroundColor="#120F17"/);
  assert.match(darkBlock, /--ai-card-bg:#0B1020;/);
  assert.match(lightBlock, /--ai-card-bg:/);
  assert.doesNotMatch(lightBlock, /--ai-card-bg:\s*#120F17;/);
});

test('styles the launcher as a cardless 2D sprite mascot with assistant copy and speech bubble', () => {
  assert.match(componentSource, /<div className="ai-status-copy" aria-hidden="true">[\s\S]*?<span>AI 助手<\/span>[\s\S]*?<b>经营分析<\/b>/);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*min-height:\s*168px;/s);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*gap:\s*4px;/s);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*padding:\s*8px 0;/s);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*border:\s*0;/s);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*border-radius:\s*0;/s);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*background:\s*transparent;/s);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*backdrop-filter:\s*none;/s);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*box-shadow:\s*none;/s);
  assert.doesNotMatch(componentCss, /\.ai-widget::before\s*\{/);
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*width:\s*116px;/s);
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*height:\s*152px;/s);
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*background:\s*transparent;/s);
  assert.match(componentCss, /\.ai-orb \.mascot-sprite-stage\s*\{[^}]*--mascot-visible-width:\s*96px;/s);
  assert.match(componentCss, /\.ai-orb \.mascot-sprite-stage\s*\{[^}]*--mascot-visible-height:\s*128\.58px;/s);
  assert.match(componentCss, /\.ai-orb \.mascot-sprite-stage\s*\{[^}]*--mascot-stage-guard:\s*10px;/s);
  assert.match(componentCss, /\.ai-orb--guide \.mascot-sprite-stage\s*\{[^}]*drop-shadow\(/s);
  assert.doesNotMatch(componentCss, /\.ai-orb \.mascot-sprite-stage\[data-action="idle"\]/);
  assert.match(componentCss, /\.ai-status-copy\s*\{[^}]*display:\s*grid;/s);
  assert.match(componentCss, /\.ai-orb--wave \.mascot-sprite-stage\s*\{[^}]*filter:\s*drop-shadow\(/s);
  assert.match(componentCss, /\.ai-orb--think \.mascot-sprite-stage,[\s\S]*?\.ai-orb--talk \.mascot-sprite-stage,[\s\S]*?\.ai-orb--click \.mascot-sprite-stage\s*\{[^}]*drop-shadow\(/s);
  assert.doesNotMatch(componentCss, /brightness\(\.92\)|saturate\(\.82\)/);
  assert.match(componentCss, /\.ai-bubble\s*\{/);
  assert.match(componentCss, /\.ai-bubble\s*\{[^}]*bottom:\s*174px;/s);
  assert.match(componentCss, /\.ai-bubble\s*\{[^}]*left:\s*50%;/s);
  assert.match(componentCss, /\.ai-bubble\s*\{[^}]*width:\s*min\(186px, calc\(100vw - 32px\)\);/s);
  assert.match(componentCss, /\.ai-bubble\s*\{[^}]*opacity:\s*0;/s);
  assert.match(componentCss, /\.ai-bubble\s*\{[^}]*transform:\s*translateX\(-50%\) translateY\(10px\) scale\(\.96\);/s);
  assert.match(componentCss, /\.ai-bubble\s*\{[^}]*transition:\s*opacity \.42s cubic-bezier\(\.2, \.82, \.2, 1\),\s*transform \.42s cubic-bezier\(\.2, \.82, \.2, 1\),\s*filter \.42s ease;/s);
  assert.match(componentCss, /\.ai-bubble--visible\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translateX\(-50%\) translateY\(0\) scale\(1\);/s);
  assert.match(componentCss, /\.ai-bubble::after\s*\{[^}]*left:\s*50%;/s);
  assert.doesNotMatch(componentCss, /\.ai-bubble-name/);
  assert.match(componentCss, /\.ai-card-wrap\s*\{[^}]*z-index:\s*1000;/s);
  assert.match(componentCss, /\.ai-widget--speaking \.ai-bubble\.ai-bubble--visible/);
  assert.match(componentCss, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.ai-orb\s*\{[^}]*width:\s*122px;[\s\S]*?height:\s*158px;/);
  assert.match(componentCss, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.ai-orb \.mascot-sprite-stage\s*\{[^}]*--mascot-visible-width:\s*100px;[\s\S]*?--mascot-visible-height:\s*133\.93px;/);
  assert.match(componentCss, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.ai-bubble\s*\{[^}]*bottom:\s*190px;/);
  assert.doesNotMatch(componentCss, /mascot-3d-stage|canvas/);
});

test('keeps the reference transparent mascot asset available for the mascot stage', () => {
  assert.ok(existsSync(mascotTransparentUrl), 'transparent AI mascot asset should exist');
  const mascot = readFileSync(mascotTransparentUrl);
  assert.equal(mascot.toString('ascii', 1, 4), 'PNG');
  assert.equal(mascot.readUInt8(25), 6);
});

test('uses GSAP to pop open and close the AI dialog before unmounting', () => {
  assert.match(componentSource, /import gsap from 'gsap';/);
  assert.match(componentSource, /const widgetRef = useRef\(null\);/);
  assert.match(componentSource, /const cardWrapRef = useRef\(null\);/);
  assert.match(componentSource, /gsap\.context/);
  assert.match(componentSource, /gsap\.timeline/);
  assert.match(componentSource, /elastic\.out/);
  assert.match(componentSource, /autoAlpha:\s*0,\s*scale:\s*0\.22/s);
  assert.match(componentSource, /onComplete:\s*\(\)\s*=>\s*\{[^}]*setRenderCard\(false\);/s);
  assert.match(componentSource, /prefers-reduced-motion: reduce/);
  assert.match(componentSource, /ref=\{cardWrapRef\}/);
  assert.match(componentSource, /\{renderCard && \(/);
  assert.match(componentCss, /\.ai-card-wrap\s*\{[^}]*transform-origin:\s*left bottom;/s);
  assert.match(componentCss, /\.ai-card-wrap\s*\{[^}]*will-change:\s*transform,\s*opacity;/s);
});
