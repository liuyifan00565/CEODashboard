/*
 更新时间: 2026-07-09 12:09:25 CST
 更新内容: 验收模型检测和 ready 期间冻结 sprite 帧播放，只有 fallback 兜底时才启用 sprite 动画与过渡层。
*/
/*
 更新时间: 2026-07-09 10:52:44 CST
 更新内容: 验收福客帧图具备 translate-only 内层生命感动效，同时继续禁止缩放、旋转和外层尺寸动画。
*/
/*
 更新时间: 2026-07-08 18:02:17 CST
 更新内容: 验收小人外层不再使用 rotate/translate 动效，避免动作切换时边界框变化造成视觉大小跳变。
*/
/*
 更新时间: 2026-07-08 17:45:00 CST
 更新内容: 验收福客动作恢复为稳定独立帧，并禁止状态动效使用 scale 造成小人忽大忽小。
*/
/*
 更新时间: 2026-07-08 17:04:41 CST
 更新内容: 验收默认待机使用 imagegen 福客 AI 富帧循环，避免左下角入口继续退回旧小帧待机。
*/
/*
 Update time: 2026-07-08 15:24:00 CST
 Update content: Require the sprite mascot stage to mount Live2D as an optional layer without removing the Fu Xiaoke fallback.
*/
/*
 Update time: 2026-07-08 11:47:40 CST
 Update content: Guard against maintenance-page idle being remapped to laptop frames that look incomplete at sidebar size.
*/
/*
 Update time: 2026-07-07 18:12:09 CST
 Update content: Require mascot action sheets to preload so switching to laptop, guide or wave never flashes a blank sprite.
*/
/*
 Update time: 2026-07-07 18:12:09 CST
 Update content: Require a fixed transparent runtime guard around every mascot sprite sheet so scaled actions never clip.
*/
/*
 Update time: 2026-07-07 16:59:41 CST
 Update content: Add visibility regression tests so frame mascot changes are obvious on the live sidebar launcher.
*/
/*
 更新时间: 2026-07-07 16:26:47 CST
 更新内容: 将 AI 小人组件验收改为真实帧动画播放，要求按 manifest 帧表、fps 和待机变体播放。
*/
/*
 更新时间: 2026-07-07 15:06:40 CST
 更新内容: 增加 guide 右向箭头光束测试，避免点击指引退化成不明显细线。
*/
/*
 更新时间: 2026-07-07 14:59:16 CST
 更新内容: 增加 AI 小人动作姿态回归测试，确保 guide/talk/think 等状态不再共用同一张站姿图。
*/
/*
 更新时间: 2026-07-07 14:47:15 CST
 更新内容: 增加静态高清图上的丝滑 CSS 动效回归测试，要求有生命感但禁止重新翻帧抽动。
*/
/*
 更新时间: 2026-07-07 14:40:16 CST
 更新内容: 增加 AI 小人常驻状态禁止连续翻帧的回归测试，避免入口出现持续抽动。
*/
/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 新增 2D Sprite AI 小人舞台验收，约束 manifest 驱动、CSS 帧变量和降级动画策略。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const componentSource = readFileSync(new URL('./MascotSpriteStage.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('./MascotSpriteStage.css', import.meta.url), 'utf8');
const componentCode = stripSourceComments(componentSource);
const cssCode = stripSourceComments(cssSource);

function stripSourceComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

test('renders a manifest-driven generated mascot sprite stage', () => {
  assert.match(componentCode, /from\s+['"]\.\.\/lib\/mascotAnimationManifest\.js['"]/);
  assert.match(componentCode, /from\s+['"]\.\/Live2DMascotStage['"]/);
  assert.match(componentCode, /MASCOT_ACTION_SHEETS/);
  assert.match(componentCode, /getMascotAnimation/);
  assert.match(componentCode, /getMascotSheet/);
  assert.match(componentCode, /getMascotIdleVariant/);
  assert.match(componentCode, /export default function MascotSpriteStage/);
  assert.match(componentCode, /data-action=\{animation\.key\}/);
  assert.match(componentCode, /data-idle-variant=\{animation\.idleVariant \?\? ''\}/);
  assert.match(componentCode, /data-live2d-state=\{live2dStatus\}/);
  assert.match(componentCode, /style=\{stageStyle\}/);
  assert.match(componentCode, /--mascot-sheet-url/);
  assert.match(componentCode, /--mascot-bg-x/);
  assert.match(componentCode, /--mascot-bg-y/);
  assert.match(componentCode, /--mascot-frame-width/);
  assert.match(componentCode, /--mascot-frame-height/);
  assert.match(componentCode, /--mascot-sheet-width/);
  assert.match(componentCode, /<Live2DMascotStage/);
  assert.match(componentCode, /onLoadStateChange=\{setLive2dStatus\}/);
  assert.doesNotMatch(componentCode, /@react-three|three|useGLTF|Canvas|MASCOT_GLB_SOURCE|\.glb/);
});

test('keeps the generated Fu Xiaoke sprite visible until the Live2D model is ready', () => {
  assert.match(componentCode, /const \[live2dStatus,\s*setLive2dStatus\] = useState\('checking'\);/);
  assert.match(componentCode, /live2dStatus === 'ready' \? 'mascot-sprite-stage--live2d-ready' : ''/);
  assert.match(componentCode, /<span className="mascot-sprite-stage__sheet" aria-hidden="true" \/>/);
  assert.match(componentCode, /<Live2DMascotStage[\s\S]*?action=\{animation\.key\}[\s\S]*?label=\{label\}[\s\S]*?onLoadStateChange=\{setLive2dStatus\}/);
});

test('freezes the sprite layer while the local rig is checking or ready', () => {
  assert.match(componentCode, /const spriteFallbackActive = live2dStatus === 'fallback';/);
  assert.match(componentCode, /if \(!spriteFallbackActive\) \{\s*setFrameCursor\(0\);\s*return undefined;\s*\}/);
  assert.match(componentCode, /live2dStatus === 'checking' \|\| live2dStatus === 'loading' \? 'mascot-sprite-stage--model-pending' : ''/);
  assert.match(cssCode, /\.mascot-sprite-stage--model-pending \.mascot-sprite-stage__sheet\s*\{[\s\S]*animation:\s*none !important;[\s\S]*transform:\s*translate3d\(0, 0, 0\);/);
  assert.match(cssCode, /\.mascot-sprite-stage--live2d-ready \.mascot-sprite-stage__blend-layer\s*\{[\s\S]*display:\s*none;/);
});

test('preloads all generated action sheets before action switches need them', () => {
  assert.match(componentCode, /const preloadedMascotSheets = new Set\(\);/);
  assert.match(componentCode, /function preloadMascotActionSheets\(\)/);
  assert.match(componentCode, /Object\.values\(MASCOT_ACTION_SHEETS\)\.forEach/);
  assert.match(componentCode, /const image = new Image\(\);/);
  assert.match(componentCode, /image\.decoding = 'async';/);
  assert.match(componentCode, /image\.src = sheet\.src;/);
  assert.match(componentCode, /preloadMascotActionSheets\(\);/);
});

test('plays authored frames with requestAnimationFrame and elapsed fps timing', () => {
  assert.match(componentCode, /const \[frameCursor,\s*setFrameCursor\] = useState\(0\);/);
  assert.match(componentCode, /requestAnimationFrame\(tick\)/);
  assert.match(componentCode, /cancelAnimationFrame\(animationFrameRef\.current\)/);
  assert.match(componentCode, /const frameDuration = 1000 \/ animation\.fps;/);
  assert.match(componentCode, /Math\.floor\(elapsed \/ frameDuration\)/);
  assert.match(componentCode, /animation\.loop/);
  assert.match(componentCode, /setFrameCursor\(nextFrameCursor\);/);
  assert.match(componentCode, /const currentFrame = animation\.frames\[frameCursor\] \?\? animation\.frames\[0\] \?\? 0;/);
  assert.doesNotMatch(componentCode, /const currentFrame = animation\.frames\[0\] \?\? 0;/);
  assert.doesNotMatch(componentCode, /replacementSrc|mascot-sprite-stage__replacement/);
});

test('crossfades sprite action changes instead of hard-cutting sheets', () => {
  assert.match(componentCode, /const MASCOT_ACTION_BLEND_MS = 260;/);
  assert.match(componentCode, /const \[transitionGhost,\s*setTransitionGhost\] = useState\(null\);/);
  assert.match(componentCode, /const transitionTimeoutRef = useRef\(0\);/);
  assert.match(componentCode, /const lastActionSignatureRef = useRef\(''\);/);
  assert.match(componentCode, /const latestPresentationRef = useRef\(null\);/);
  assert.match(componentCode, /previousSignature !== actionSignature/);
  assert.match(componentCode, /spriteFallbackActive && actionChanged && previousPresentation/);
  assert.match(componentCode, /setTransitionGhost\(\{/);
  assert.match(componentCode, /window\.setTimeout\(\(\) => \{\s*setTransitionGhost\(null\);/);
  assert.match(componentCode, /\{spriteFallbackActive && transitionGhost \? \(/);
  assert.match(componentCode, /mascot-sprite-stage__blend-layer/);
  assert.match(componentCode, /mascot-sprite-stage__sheet--ghost/);
});

test('keeps idle playback on a real rich Fu Xiaoke frame loop', () => {
  assert.match(componentCode, /const \[idleVariantIndex,\s*setIdleVariantIndex\] = useState\(0\);/);
  assert.match(componentCode, /const IDLE_LOOPS_BEFORE_VARIANT = 1;/);
  assert.match(componentCode, /getMascotIdleVariant\(idleVariantIndex\)/);
  assert.match(componentCode, /setIdleVariantIndex\(\(index\) => index \+ 1\);/);
  assert.match(componentCode, /animation\.key === MASCOT_ACTIONS\.idle/);
  assert.doesNotMatch(componentCode, /setInterval|clearInterval|IDLE_ROTATION_MS/);
});

test('keeps maintenance-page idle on full mascot frames instead of laptop frames', () => {
  assert.match(componentCode, /getMascotAnimation\(action,\s*\{\s*idleVariant:\s*idleVariant\.key\s*\}\)/);
  assert.doesNotMatch(componentCode, /context\s*===\s*['"]maintenance['"][\s\S]*MASCOT_ACTIONS\.idle[\s\S]*\?\s*['"]maintenance['"]/);
});

test('styles generated action sheets crisply inside the existing sidebar card', () => {
  assert.match(cssCode, /\.mascot-sprite-stage\s*\{/);
  assert.match(cssCode, /--mascot-visible-width:\s*128px;/);
  assert.match(cssCode, /--mascot-visible-height:\s*171\.43px;/);
  assert.match(cssCode, /--mascot-stage-guard:\s*12px;/);
  assert.match(cssCode, /width:\s*calc\(var\(--mascot-visible-width\) \+ var\(--mascot-stage-guard\) \* 2\);/);
  assert.match(cssCode, /height:\s*calc\(var\(--mascot-visible-height\) \+ var\(--mascot-stage-guard\) \* 2\);/);
  assert.match(cssCode, /\.mascot-sprite-stage__sheet\s*\{[\s\S]*inset:\s*var\(--mascot-stage-guard\);[\s\S]*background-image:\s*var\(--mascot-sheet-url\);/);
  assert.match(cssCode, /background-size:\s*var\(--mascot-sheet-width\) 100%;/);
  assert.match(cssCode, /background-position:\s*var\(--mascot-bg-x\) var\(--mascot-bg-y\);/);
  assert.match(cssCode, /image-rendering:\s*auto;/);
  assert.doesNotMatch(cssCode, /url\('\/ai-mascot-sprite\.png'\)|mascot-sprite-stage--overlay-laptop|mascot-sprite-stage__replacement/);
  assert.doesNotMatch(cssCode, /mascot-3d-stage|canvas/);
});

test('uses authored action frames without text-based fake effects or outer size-changing motion', () => {
  assert.doesNotMatch(cssCode, /@keyframes mascot-guide-lean/);
  assert.doesNotMatch(cssCode, /@keyframes mascot-live-presence/);
  assert.doesNotMatch(cssCode, /\.mascot-sprite-stage--guide\s*\{[\s\S]*animation:/);
  assert.doesNotMatch(cssCode, /\.mascot-sprite-stage--speech,\s*[\s\S]*?\.mascot-sprite-stage--focus\s*\{[\s\S]*animation:/);
  assert.doesNotMatch(cssCode, /scale\(/);
  assert.doesNotMatch(cssCode, /rotate\(/);
  assert.doesNotMatch(cssCode, /content:\s*['"][^'"]+[A-Za-z\u4e00-\u9fff][^'"]*['"]/);
  assert.doesNotMatch(cssCode, /mascot-guide-ray|mascot-smart-pulse|ai-widget-guide-beam/);
});

test('adds translate-only inner life motion to keep the mascot from feeling static', () => {
  assert.match(cssCode, /\.mascot-sprite-stage--idle\s+\.mascot-sprite-stage__sheet,\s*[\s\S]*?\.mascot-sprite-stage--maintenance\s+\.mascot-sprite-stage__sheet\s*\{[\s\S]*animation:\s*mascot-sheet-idle-life 5\.8s/);
  assert.match(cssCode, /\.mascot-sprite-stage--greeting\s+\.mascot-sprite-stage__sheet\s*\{[\s\S]*animation:\s*mascot-sheet-greeting-life 1\.25s/);
  assert.match(cssCode, /\.mascot-sprite-stage--guide\s+\.mascot-sprite-stage__sheet,\s*[\s\S]*?\.mascot-sprite-stage--click\s+\.mascot-sprite-stage__sheet\s*\{[\s\S]*animation:\s*mascot-sheet-guide-life 1\.1s/);
  assert.match(cssCode, /\.mascot-sprite-stage--speech\s+\.mascot-sprite-stage__sheet\s*\{[\s\S]*animation:\s*mascot-sheet-talk-life 3\.2s/);
  assert.match(cssCode, /\.mascot-sprite-stage--focus\s+\.mascot-sprite-stage__sheet,\s*[\s\S]*?\.mascot-sprite-stage--alert\s+\.mascot-sprite-stage__sheet,\s*[\s\S]*?\.mascot-sprite-stage--maintenance-review\s+\.mascot-sprite-stage__sheet\s*\{[\s\S]*animation:\s*mascot-sheet-focus-life 3\.8s/);
  assert.match(cssCode, /\.mascot-sprite-stage--celebrate\s+\.mascot-sprite-stage__sheet,\s*[\s\S]*?\.mascot-sprite-stage--maintenance-save\s+\.mascot-sprite-stage__sheet\s*\{[\s\S]*animation:\s*mascot-sheet-celebrate-life 1\.25s/);
  assert.match(cssCode, /@keyframes mascot-sheet-idle-life/);
  assert.match(cssCode, /@keyframes mascot-sheet-greeting-life/);
  assert.match(cssCode, /@keyframes mascot-sheet-talk-life/);
  assert.doesNotMatch(cssCode, /transform:\s*[^;]*(?:scale|rotate)/);
});

test('uses a no-scale no-rotate crossfade to soften action changes', () => {
  assert.match(cssCode, /\.mascot-sprite-stage__blend-layer\s*\{[\s\S]*position:\s*absolute;[\s\S]*inset:\s*0;[\s\S]*pointer-events:\s*none;/);
  assert.match(cssCode, /\.mascot-sprite-stage__sheet--ghost\s*\{[\s\S]*animation:\s*mascot-action-crossfade-out \.26s cubic-bezier\(\.2, \.82, \.2, 1\) both !important;/);
  assert.match(cssCode, /@keyframes mascot-action-crossfade-out\s*\{[\s\S]*opacity:\s*\.96;[\s\S]*transform:\s*translate3d\(0, 0, 0\);[\s\S]*opacity:\s*0;[\s\S]*transform:\s*translate3d\(0, -1px, 0\);/);
  assert.doesNotMatch(cssCode, /mascot-action-crossfade-out[\s\S]*?(?:scale|rotate)/);
});

test('includes a reduced-motion static-frame fallback', () => {
  assert.match(cssCode, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(cssCode, /\.mascot-sprite-stage,\s*[\s\S]*?\.mascot-sprite-stage__sheet\s*\{[\s\S]*animation:\s*none;/);
  assert.match(cssCode, /transition:\s*none;/);
  assert.match(cssCode, /\.mascot-sprite-stage__blend-layer\s*\{[\s\S]*display:\s*none;/);
});
