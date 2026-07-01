/*
 更新时间: 2026-07-01 12:26:32 CST
 更新内容: 约束鼠标悬浮文字气泡绕过自动提示冷却，保证用户主动悬浮立即响应。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const componentSource = readFileSync(new URL('./AIAnalysisWidget.jsx', import.meta.url), 'utf8');
const componentCss = readFileSync(new URL('./AIAnalysisWidget.css', import.meta.url), 'utf8');
const companionSource = readFileSync(new URL('../lib/mascotCompanion.js', import.meta.url), 'utf8');
const hoverCueSource = readFileSync(new URL('../lib/hoverCue.js', import.meta.url), 'utf8');
const indexCss = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const mascotTransparentUrl = new URL('../../public/ai-mascot-transparent.png', import.meta.url);

function themeBlock(theme) {
  const selector = theme === 'dark' ? ':root,\\s*\\n:root\\[data-theme="dark"\\]' : ':root\\[data-theme="light"\\]';
  const match = indexCss.match(new RegExp(`${selector}\\{(?<body>[\\s\\S]*?)\\n\\}`));
  assert.ok(match?.groups?.body, `${theme} theme block should exist`);
  return match.groups.body;
}

test('uses the 3D mascot stage for the AI launcher', () => {
  assert.match(componentSource, /import Mascot3DStage from '\.\/Mascot3DStage';/);
  assert.match(componentSource, /import \{\s*MASCOT_ACTIONS,\s*getIdleCompanionCue,\s*getSpeechAction,\s*\} from '\.\.\/lib\/mascotCompanion';/s);
  assert.match(componentSource, /export default function AIAnalysisWidget\(\{ activeMenu, dim, channelKey = 'all', companionCue \}\)/);
  assert.match(componentSource, /const \[mascotAction,\s*setMascotAction\] = useState\(MASCOT_ACTIONS\.idle\);/);
  assert.match(componentSource, /const \[mascotPointer,\s*setMascotPointer\] = useState\(\{ x: 0, y: 0, active: false \}\);/);
  assert.doesNotMatch(componentSource, /spinToken/);
  assert.doesNotMatch(componentSource, /setSpinToken/);
  assert.match(componentSource, /className=\{`ai-orb ai-orb--\$\{mascotAction\}`\}/);
  assert.match(componentSource, /<Mascot3DStage\s+action=\{mascotAction\}\s+pointer=\{mascotPointer\}\s+analysisActive=\{open \|\| loading\}\s+label="福小客 3D 经营助手"/s);
  assert.match(componentSource, /aria-label=\{open \? '收起 AI 分析工具' : '打开 AI 分析工具'\}/);
  assert.match(componentSource, /aria-expanded=\{open\}/);
  assert.match(componentSource, /onPointerMove=\{handleMascotPointerMove\}/);
  assert.match(componentSource, /onMouseEnter=\{handleMascotEnter\}/);
  assert.match(componentSource, /onMouseLeave=\{handleMascotLeave\}/);
  assert.match(componentSource, /onClick=\{handleMascotClick\}/);
  assert.doesNotMatch(componentSource, /ai-mascot-sprite/);
  assert.doesNotMatch(componentSource, /ai-mascot-stage/);
});

test('tracks pointer position for Codex-like desktop pet movement', () => {
  assert.match(componentSource, /function handleMascotPointerMove\(event\)\s*\{/);
  assert.match(componentSource, /const rect = event\.currentTarget\.getBoundingClientRect\(\);/);
  assert.match(componentSource, /const centerX = rect\.left \+ rect\.width \/ 2;/);
  assert.match(componentSource, /const centerY = rect\.top \+ rect\.height \/ 2;/);
  assert.match(componentSource, /setMascotPointer\(\{\s*x: Math\.max\(-1, Math\.min\(1, \(event\.clientX - centerX\) \/ \(rect\.width \/ 2\)\)\),\s*y: Math\.max\(-1, Math\.min\(1, \(event\.clientY - centerY\) \/ \(rect\.height \/ 2\)\)\),\s*active: true,\s*\}\);/s);
  assert.match(componentSource, /setMascotPointer\(\{ x: 0, y: 0, active: false \}\);/);
});

test('shows random Fu Xiaoke bubble prompts while the dialog is closed', () => {
  assert.match(componentSource, /const IDLE_BUBBLE_INTERVAL = 28000;/);
  assert.match(componentSource, /const \[bubbleCue,\s*setBubbleCue\] = useState\(null\);/);
  assert.match(componentSource, /const \[bubbleVisible,\s*setBubbleVisible\] = useState\(false\);/);
  assert.match(componentSource, /const idlePromptIndexRef = useRef\(0\);/);
  assert.match(componentSource, /window\.setInterval\(\(\) => \{/);
  assert.match(componentSource, /idlePromptIndexRef\.current \+= 1;/);
  assert.match(componentSource, /showCompanionCue\(getIdleCompanionCue\(idlePromptIndexRef\.current\), \{ openDialog: false, respectCooldown: true \}\);/);
  assert.match(componentSource, /\}, IDLE_BUBBLE_INTERVAL\);/);
  assert.match(componentSource, /className=\{`ai-bubble\$\{bubbleVisible \? ' ai-bubble--visible' : ''\}`\}/);
  assert.doesNotMatch(componentSource, /ai-bubble-name/);
  assert.match(companionSource, /您好，我是福小客，有什么可以帮助您的吗？/);
});

test('throttles passive idle bubbles without delaying user text hover cues', () => {
  assert.match(componentSource, /const PASSIVE_BUBBLE_COOLDOWN = 9000;/);
  assert.match(componentSource, /const lastBubbleShownAtRef = useRef\(0\);/);
  assert.match(componentSource, /function showCompanionCue\(cue, \{ openDialog = false, duration = 5600, respectCooldown = false \} = \{\}\)/);
  assert.match(componentSource, /const now = Date\.now\(\);/);
  assert.match(componentSource, /if \(respectCooldown && now - lastBubbleShownAtRef\.current < PASSIVE_BUBBLE_COOLDOWN\) \{\s*return false;\s*\}/s);
  assert.match(componentSource, /lastBubbleShownAtRef\.current = now;/);
  assert.match(componentSource, /return true;/);
  assert.match(componentSource, /showCompanionCue\(getIdleCompanionCue\(idlePromptIndexRef\.current\), \{ openDialog: false, respectCooldown: true \}\);/);
  assert.match(componentSource, /showCompanionCue\(\{\s*text: buildInstantHoverCue\(normalizedText\),\s*action: MASCOT_ACTIONS\.think,\s*\}, \{ openDialog: false, duration: HOVER_INSTANT_CUE_DURATION \}\);/s);
  assert.doesNotMatch(componentSource, /buildInstantHoverCue\(normalizedText\),\s*action: MASCOT_ACTIONS\.think,\s*\}, \{ openDialog: false, duration: HOVER_INSTANT_CUE_DURATION, respectCooldown: true \}/s);
});

test('responds to KPI card context with matching speech and motion', () => {
  assert.match(componentSource, /useEffect\(\(\) => \{\s*if \(!companionCue\) return;\s*showCompanionCue\(companionCue, \{ openDialog: false \}\);/s);
  assert.match(componentSource, /setMascotAction\(cue\.action \?\? getSpeechAction\(cue\.text\)\);/);
  assert.match(componentSource, /playMascotAction\(MASCOT_ACTIONS\.click, 860, nextOpen\);/);
});

test('requests Qwen hover bubble cues from readable page text', () => {
  assert.match(componentSource, /buildInstantHoverCue/);
  assert.match(componentSource, /normalizeHoverCueText/);
  assert.match(componentSource, /shouldRequestHoverCue/);
  assert.match(componentSource, /buildHoverCueCacheKey/);
  assert.match(componentSource, /getHoverCueTextFromElement/);
  assert.match(componentSource, /const HOVER_CUE_DELAY = 120;/);
  assert.match(componentSource, /const hoverCueTimerRef = useRef\(null\);/);
  assert.match(componentSource, /const hoverCueCacheRef = useRef\(new Map\(\)\);/);
  assert.match(componentSource, /const hoverCueActiveKeyRef = useRef\(''\);/);
  assert.match(componentSource, /document\.addEventListener\('pointerover', handleTextPointerOver\);/);
  assert.match(componentSource, /showCompanionCue\(\{\s*text: buildInstantHoverCue\(normalizedText\),\s*action: MASCOT_ACTIONS\.think,\s*\}/s);
  assert.match(componentSource, /hoverCueActiveKeyRef\.current !== cacheKey/);
  assert.match(componentSource, /fetch\('\/api\/ai\/hover-cue'/);
  assert.match(componentSource, /showCompanionCue\(\{ text: cue, action: MASCOT_ACTIONS\.talk \}/);
  assert.match(componentSource, /showCompanionCue\(\{ text: fallbackCue, action: MASCOT_ACTIONS\.think \}/);
  assert.match(hoverCueSource, /export function buildInstantHoverCue/);
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
  assert.match(darkBlock, /--ai-card-bg:#120F17;/);
  assert.match(lightBlock, /--ai-card-bg:/);
  assert.doesNotMatch(lightBlock, /--ai-card-bg:\s*#120F17;/);
});

test('styles the launcher as a transparent 3D mascot and speech bubble', () => {
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*width:\s*132px;/s);
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*height:\s*184px;/s);
  assert.match(componentCss, /\.ai-orb\s*\{[^}]*background:\s*transparent;/s);
  assert.match(componentCss, /\.ai-bubble\s*\{/);
  assert.match(componentCss, /\.ai-bubble\s*\{[^}]*bottom:\s*226px;/s);
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
  assert.doesNotMatch(componentCss, /--mascot-frame-count/);
  assert.doesNotMatch(componentCss, /ai-mascot-frames/);
  assert.doesNotMatch(componentCss, /ai-mascot-sprite/);
});

test('ships the transparent mascot image used by the 3D stage', () => {
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
