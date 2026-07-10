/*
 更新时间: 2026-07-10 15:46:00 CST
 更新内容: 光标柔光回归测试改为要求入口不再挂载全局 GlassCursor，避免视口底部裁切出闪烁线光。
*/
/*
 更新时间: 2026-07-06 11:23:48 CST
 更新内容: 光标效果回归测试改为要求低存在感银紫玫瑰柔光，并限制为透明环境光层。
*/
/*
 更新时间: 2026-07-05 23:55:52 CST
 更新内容: 光标效果回归测试改为要求移除光标附近紫色光晕和全屏覆盖层。
*/
/*
 Update time: 2026-07-03 16:24:00 CST
 Update content: Guard that the purple diffused glow stays compact near the cursor instead of flooding the panel.
*/
/*
 Update time: 2026-07-03 16:22:00 CST
 Update content: Guard that the cursor glow uses a large saturated purple light field like the latest reference.
*/
/*
 Update time: 2026-07-03 16:18:43 CST
 Update content: Guard that the cursor effect is a direct purple diffused glow without a glass ball or white foreground core.
*/
/*
 Update time: 2026-07-03 16:11:57 CST
 Update content: Guard that the cursor halo is a soft diffused glow without a hard circular edge.
*/
/*
 Update time: 2026-07-03 16:09:10 CST
 Update content: Guard that the native cursor stays visible and the purple halo surrounds it without the dark glass ball.
*/
/*
 Update time: 2026-07-03 16:05:19 CST
 Update content: Add guard coverage for mounting the glass cursor and restoring its small purple offset halo.
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('./main.jsx', import.meta.url), 'utf8');
const cursorSource = readFileSync(new URL('./components/GlassCursor.jsx', import.meta.url), 'utf8');
const cursorCss = readFileSync(new URL('./components/GlassCursor.css', import.meta.url), 'utf8');

test('does not mount a global cursor ambient light over the dashboard', () => {
  assert.doesNotMatch(appSource, /GlassCursor/);
  assert.doesNotMatch(mainSource, /import GlassCursor from '\.\/components\/GlassCursor';?/);
  assert.doesNotMatch(mainSource, /<GlassCursor\s*\/>/);
});

test('tracks the native pointer with a passive non-interactive halo', () => {
  assert.match(cursorSource, /import \{ useEffect, useRef \} from 'react';/);
  assert.match(cursorSource, /import '\.\/GlassCursor\.css';/);
  assert.match(cursorSource, /const haloRef = useRef\(null\);/);
  assert.match(cursorSource, /window\.addEventListener\('pointermove', handlePointerMove, \{ passive: true \}\);/);
  assert.match(cursorSource, /style\.setProperty\('--glass-cursor-x', `\$\{event\.clientX\}px`\);/);
  assert.match(cursorSource, /style\.setProperty\('--glass-cursor-y', `\$\{event\.clientY\}px`\);/);
  assert.match(cursorSource, /classList\.add\('is-active'\);/);
  assert.match(cursorSource, /window\.removeEventListener\('pointermove', handlePointerMove\);/);
  assert.match(cursorSource, /<div ref=\{haloRef\} className="glass-cursor-halo" aria-hidden="true" \/>/);
  assert.doesNotMatch(cursorSource, /<Canvas/);
  assert.doesNotMatch(cursorSource, /cursor:\s*'none'|cursor\s*=\s*['"]none/);
});

test('uses only the restrained silver violet rose radial light', () => {
  assert.match(cursorCss, /\.glass-cursor-halo\s*\{/);
  assert.match(cursorCss, /position:\s*fixed;/);
  assert.match(cursorCss, /inset:\s*0;/);
  assert.match(cursorCss, /pointer-events:\s*none;/);
  assert.match(cursorCss, /z-index:\s*30;/);
  assert.match(cursorCss, /radial-gradient\(\s*420px circle at var\(--glass-cursor-x\) var\(--glass-cursor-y\),\s*rgba\(184,\s*156,\s*255,\s*0\.10\),\s*rgba\(228,\s*184,\s*215,\s*0\.045\) 32%,\s*transparent 68%\s*\)/);
  assert.match(cursorCss, /\.glass-cursor-halo\.is-active\s*\{[\s\S]*?opacity:\s*1;/);
  assert.match(cursorCss, /@media \(pointer:\s*coarse\), \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(cursorCss, /display:\s*none;/);

  assert.doesNotMatch(cursorCss, /glass-cursor-fixed/);
  assert.doesNotMatch(cursorCss, /box-shadow|filter:\s*blur|saturate\(/);
  assert.doesNotMatch(cursorCss, /z-index:\s*2147483647/);
  assert.doesNotMatch(cursorCss, /cursor:\s*none/);
});
