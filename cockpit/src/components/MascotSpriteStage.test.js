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
  assert.match(componentCode, /MASCOT_ACTION_SHEETS/);
  assert.match(componentCode, /getMascotAnimation/);
  assert.match(componentCode, /getMascotSheet/);
  assert.match(componentCode, /getMascotIdleVariant/);
  assert.match(componentCode, /export default function MascotSpriteStage/);
  assert.match(componentCode, /data-action=\{animation\.key\}/);
  assert.match(componentCode, /data-idle-variant=\{animation\.idleVariant \?\? ''\}/);
  assert.match(componentCode, /style=\{stageStyle\}/);
  assert.match(componentCode, /--mascot-sheet-url/);
  assert.match(componentCode, /--mascot-bg-x/);
  assert.match(componentCode, /--mascot-bg-y/);
  assert.match(componentCode, /--mascot-frame-width/);
  assert.match(componentCode, /--mascot-frame-height/);
  assert.match(componentCode, /--mascot-sheet-width/);
  assert.doesNotMatch(componentCode, /@react-three|three|useGLTF|Canvas|MASCOT_GLB_SOURCE|\.glb/);
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

test('rotates four idle variants only at loop boundaries', () => {
  assert.match(componentCode, /const \[idleVariantIndex,\s*setIdleVariantIndex\] = useState\(0\);/);
  assert.match(componentCode, /const IDLE_LOOPS_BEFORE_VARIANT = 1;/);
  assert.match(componentCode, /getMascotIdleVariant\(idleVariantIndex\)/);
  assert.match(componentCode, /setIdleVariantIndex\(\(index\) => index \+ 1\);/);
  assert.match(componentCode, /animation\.key === MASCOT_ACTIONS\.idle/);
  assert.doesNotMatch(componentCode, /setInterval|clearInterval|IDLE_ROTATION_MS/);
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

test('uses semantic frame motion cues without text-based fake effects', () => {
  assert.match(cssCode, /\.mascot-sprite-stage--guide\s*\{[\s\S]*animation:\s*mascot-guide-lean 1s cubic-bezier\(\.2, \.82, \.2, 1\) both;/);
  assert.match(cssCode, /\.mascot-sprite-stage--speech,\s*[\s\S]*?\.mascot-sprite-stage--focus\s*\{[\s\S]*animation:\s*mascot-live-presence 4\.8s cubic-bezier\(\.45, 0, \.2, 1\) infinite;/);
  assert.match(cssCode, /@keyframes mascot-guide-lean/);
  assert.match(cssCode, /translate3d\(4px,\s*-2px,\s*0\) rotate\(-1\.5deg\) scale\(1\.025\)/);
  assert.match(cssCode, /translate3d\(2px,\s*0,\s*0\) rotate\(-1deg\) scale\(1\.015\)/);
  assert.doesNotMatch(cssCode, /scale\(1\.(?:1[0-9]|2[0-9])\)/);
  assert.match(cssCode, /@keyframes mascot-live-presence/);
  assert.doesNotMatch(cssCode, /content:\s*['"][^'"]+[A-Za-z\u4e00-\u9fff][^'"]*['"]/);
  assert.doesNotMatch(cssCode, /mascot-guide-ray|mascot-smart-pulse|ai-widget-guide-beam/);
});

test('includes a reduced-motion static-frame fallback', () => {
  assert.match(cssCode, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(cssCode, /animation:\s*none;/);
  assert.match(cssCode, /transition:\s*none;/);
});
