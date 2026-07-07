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

test('renders a manifest-driven 2D mascot sprite stage', () => {
  assert.match(componentCode, /from\s+['"]\.\.\/lib\/mascotAnimationManifest\.js['"]/);
  assert.match(componentCode, /getMascotAnimation/);
  assert.match(componentCode, /getMascotFrameAnchor/);
  assert.match(componentCode, /MASCOT_SPRITE_SHEET/);
  assert.match(componentCode, /export default function MascotSpriteStage/);
  assert.match(componentCode, /data-action=\{animation\.key\}/);
  assert.match(componentCode, /data-idle-variant=\{animation\.idleVariant \?\? ''\}/);
  assert.match(componentCode, /style=\{stageStyle\}/);
  assert.match(componentCode, /--mascot-frame-x/);
  assert.match(componentCode, /--mascot-frame-y/);
  assert.match(componentCode, /--mascot-bg-x/);
  assert.match(componentCode, /--mascot-bg-y/);
  assert.match(componentCode, /--mascot-frame-offset-x/);
  assert.match(componentCode, /--mascot-frame-offset-y/);
  assert.doesNotMatch(componentCode, /@react-three|three|useGLTF|Canvas|MASCOT_GLB_SOURCE|\.glb/);
});

test('keeps the launcher static instead of continuously flipping sprite frames', () => {
  assert.doesNotMatch(componentCode, /requestAnimationFrame|cancelAnimationFrame|setFrameIndex|frameIndex/);
  assert.doesNotMatch(componentCode, /setInterval|clearInterval|IDLE_ROTATION_MS|idleVariantIndex/);
  assert.match(componentCode, /const currentFrame = animation\.frames\[0\] \?\? 0;/);
  assert.match(componentCode, /Math\.floor\(currentFrame % MASCOT_SPRITE_SHEET\.columns\)/);
  assert.match(componentCode, /Math\.floor\(currentFrame \/ MASCOT_SPRITE_SHEET\.columns\)/);
});

test('styles the sprite sheet crisply inside the existing sidebar card', () => {
  assert.match(cssCode, /\.mascot-sprite-stage\s*\{/);
  assert.match(cssCode, /width:\s*112px;/);
  assert.match(cssCode, /aspect-ratio:\s*224\s*\/\s*300;/);
  assert.match(cssCode, /\.mascot-sprite-stage__sheet\s*\{[\s\S]*background-image:\s*url\('\/ai-mascot-sprite\.png'\);/);
  assert.match(cssCode, /background-size:\s*1200%\s*400%;/);
  assert.match(cssCode, /background-position:\s*var\(--mascot-bg-x\) var\(--mascot-bg-y\);/);
  assert.match(cssCode, /transform:\s*translate\(var\(--mascot-frame-offset-x\),\s*var\(--mascot-frame-offset-y\)\);/);
  assert.doesNotMatch(cssCode, /var\(--mascot-frame-x\)\s*\*\s*-100%/);
  assert.match(cssCode, /image-rendering:\s*auto;/);
  assert.doesNotMatch(cssCode, /mascot-sprite-stage--overlay-laptop/);
  assert.doesNotMatch(cssCode, /mascot-3d-stage|canvas/);
});

test('uses the laptop mascot as a replacement image instead of a full-body overlay', () => {
  assert.match(componentCode, /replacementSrc/);
  assert.match(componentCode, /mascot-sprite-stage__replacement/);
  assert.match(cssCode, /\.mascot-sprite-stage--replacement \.mascot-sprite-stage__sheet\s*\{/);
  assert.match(cssCode, /\.mascot-sprite-stage__replacement\s*\{/);
  assert.doesNotMatch(componentCode, /mascot-sprite-stage__overlay/);
});

test('uses approved high-resolution still images for persistent mascot states', () => {
  assert.match(componentCode, /animation\.replacementAsset === 'transparent'/);
  assert.match(componentCode, /MASCOT_APPROVED_ASSETS\.transparent/);
  assert.match(componentCode, /animation\.replacementAsset === 'analysisLaptop'/);
  assert.match(componentCode, /MASCOT_APPROVED_ASSETS\.analysisLaptop/);
});

test('adds silky transform-only mascot motion without sprite-frame twitching', () => {
  assert.match(cssCode, /@keyframes mascot-silk-idle/);
  assert.match(cssCode, /@keyframes mascot-silk-guide/);
  assert.match(cssCode, /@keyframes mascot-silk-maintenance/);
  assert.match(cssCode, /\.mascot-sprite-stage--idle \.mascot-sprite-stage__replacement\s*\{[\s\S]*animation:\s*mascot-silk-idle 5\.8s cubic-bezier\(\.45, 0, \.2, 1\) infinite;/);
  assert.match(cssCode, /\.mascot-sprite-stage--guide \.mascot-sprite-stage__replacement\s*\{[\s\S]*animation:\s*mascot-silk-guide 1s cubic-bezier\(\.2, \.82, \.2, 1\) both;/);
  assert.match(cssCode, /\.mascot-sprite-stage--maintenance \.mascot-sprite-stage__replacement\s*\{[\s\S]*animation:\s*mascot-silk-maintenance 6\.4s cubic-bezier\(\.45, 0, \.2, 1\) infinite;/);
  assert.match(cssCode, /will-change:\s*transform;/);
  assert.doesNotMatch(cssCode, /steps\(|background-position[^;]*animation|filter\s+.*animation/);
});

test('includes a reduced-motion static-frame fallback', () => {
  assert.match(cssCode, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(cssCode, /animation:\s*none;/);
  assert.match(cssCode, /transition:\s*none;/);
});
