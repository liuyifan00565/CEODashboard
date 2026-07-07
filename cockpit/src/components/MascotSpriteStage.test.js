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
  assert.match(componentCode, /MASCOT_SPRITE_SHEET/);
  assert.match(componentCode, /export default function MascotSpriteStage/);
  assert.match(componentCode, /data-action=\{animation\.key\}/);
  assert.match(componentCode, /data-idle-variant=\{animation\.idleVariant \?\? ''\}/);
  assert.match(componentCode, /style=\{stageStyle\}/);
  assert.match(componentCode, /--mascot-frame-x/);
  assert.match(componentCode, /--mascot-frame-y/);
  assert.match(componentCode, /--mascot-bg-x/);
  assert.match(componentCode, /--mascot-bg-y/);
  assert.doesNotMatch(componentCode, /@react-three|three|useGLTF|Canvas|MASCOT_GLB_SOURCE|\.glb/);
});

test('uses requestAnimationFrame with integer frame indexes', () => {
  assert.match(componentCode, /requestAnimationFrame\(tick\)/);
  assert.match(componentCode, /setFrameIndex\(\(index\) => \{/);
  assert.match(componentCode, /const nextIndex = index \+ 1;/);
  assert.match(componentCode, /animation\.frames\[frameIndex % animation\.frames\.length\]/);
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
  assert.doesNotMatch(cssCode, /var\(--mascot-frame-x\)\s*\*\s*-100%/);
  assert.match(cssCode, /image-rendering:\s*auto;/);
  assert.match(cssCode, /\.mascot-sprite-stage--overlay-laptop/);
  assert.doesNotMatch(cssCode, /mascot-3d-stage|canvas/);
});

test('includes a reduced-motion static-frame fallback', () => {
  assert.match(cssCode, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(cssCode, /animation:\s*none;/);
  assert.match(cssCode, /transition:\s*none;/);
});
