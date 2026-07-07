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

test('shows default Fu Xiaoke bubbles every 10 seconds only when no readable text is hovered', () => {
  assert.match(componentSource, /const DEFAULT_BUBBLE_INTERVAL = 10000;/);
  assert.match(componentSource, /const DEFAULT_BUBBLE_DURATION = 4000;/);
  assert.match(componentSource, /const \[bubbleCue,\s*setBubbleCue\] = useState\(null\);/);
  assert.match(componentSource, /const \[bubbleVisible,\s*setBubbleVisible\] = useState\(false\);/);
  assert.match(componentSource, /const idlePromptIndexRef = useRef\(0\);/);
  assert.match(componentSource, /if \(hoverCueActiveKeyRef\.current\) return;/);
  assert.match(componentSource, /idlePromptIndexRef\.current \+= 1;/);
  assert.match(componentSource, /showCompanionCue\(getIdleCompanionCue\(idlePromptIndexRef\.current\), \{\s*openDialog: false,\s*duration: DEFAULT_BUBBLE_DURATION,\s*respectCooldown: true,\s*\}\);/s);
  assert.match(componentSource, /\}, DEFAULT_BUBBLE_INTERVAL\);/);
  assert.match(componentSource, /className=\{`ai-bubble\$\{bubbleVisible \? ' ai-bubble--visible' : ''\}`\}/);
  assert.doesNotMatch(componentSource, /ai-bubble-name/);
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

test('plays a one-second guide motion only when opening the AI dialog from the mascot', () => {
  assert.match(componentSource, /if \(nextOpen\) \{\s*playMascotAction\(MASCOT_ACTIONS\.guide,\s*1000,\s*true\);[\s\S]*?openAiDialog\(\);[\s\S]*?return;\s*\}/);
  assert.match(componentSource, /playMascotAction\(MASCOT_ACTIONS\.click,\s*860,\s*false\);/);
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
  assert.match(componentSource, /本月经营最需要 CEO 关注的三个问题是什么？/);
  assert.match(componentSource, /哪个销售维度拖后腿，应该怎么处理？/);
  assert.match(componentSource, /从 ROI 和目标完成率看，下个月预算怎么调？/);
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

test('styles the launcher as a sidebar status card with a transparent 2D sprite mascot and speech bubble', () => {
  assert.match(componentSource, /<div className="ai-status-copy" aria-hidden="true">[\s\S]*?<span>AI 助手<\/span>[\s\S]*?<b>经营分析<\/b>/);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*min-height:\s*132px;/s);
  assert.match(componentCss, /\.ai-widget\s*\{[^}]*background:\s*rgba\(255,\s*255,\s*255,\s*\.04\);/s);
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*width:\s*96px;/s);
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*height:\s*124px;/s);
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*background:\s*transparent;/s);
  assert.match(componentCss, /\.ai-orb \.mascot-sprite-stage\s*\{[^}]*width:\s*92px;/s);
  assert.match(componentCss, /\.ai-orb--guide \.mascot-sprite-stage\s*\{[^}]*drop-shadow\(/s);
  assert.doesNotMatch(componentCss, /\.ai-orb \.mascot-sprite-stage\[data-action="idle"\]/);
  assert.match(componentCss, /\.ai-status-copy\s*\{[^}]*display:\s*grid;/s);
  assert.match(componentCss, /\.ai-orb--wave \.mascot-sprite-stage\s*\{[^}]*filter:\s*drop-shadow\(/s);
  assert.match(componentCss, /\.ai-orb--think \.mascot-sprite-stage,[\s\S]*?\.ai-orb--talk \.mascot-sprite-stage,[\s\S]*?\.ai-orb--click \.mascot-sprite-stage\s*\{[^}]*drop-shadow\(/s);
  assert.doesNotMatch(componentCss, /brightness\(\.92\)|saturate\(\.82\)/);
  assert.match(componentCss, /\.ai-bubble\s*\{/);
  assert.match(componentCss, /\.ai-bubble\s*\{[^}]*bottom:\s*146px;/s);
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
  assert.match(componentCss, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.ai-orb\s*\{[^}]*width:\s*98px;[\s\S]*?height:\s*128px;/);
  assert.match(componentCss, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.ai-bubble\s*\{[^}]*bottom:\s*178px;/);
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
