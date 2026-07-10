/*
 更新时间: 2026-07-10 10:59:53 CST
 更新内容: 光标柔光回归测试改为要求彻底停用全局覆盖层，只保留系统原生光标，避免 Canvas 合成闪烁。
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

test('does not mount a cursor ambient layer outside the dashboard shell', () => {
  assert.doesNotMatch(appSource, /GlassCursor/);
  assert.doesNotMatch(mainSource, /import GlassCursor from '\.\/components\/GlassCursor';?/);
  assert.doesNotMatch(mainSource, /<GlassCursor\s*\/>/);
});

test('keeps the cursor helper inert so the native cursor has no surrounding layer', () => {
  assert.match(cursorSource, /export default function GlassCursor\(\) \{\s*return null;\s*\}/);
  assert.doesNotMatch(cursorSource, /useState|useRef|useEffect/);
  assert.doesNotMatch(cursorSource, /GlassCursor\.css/);
  assert.doesNotMatch(cursorSource, /addEventListener\('pointermove'|addEventListener\('mousemove'/);
  assert.doesNotMatch(cursorSource, /glass-cursor-halo|glass-cursor-fixed|is-active/);
  assert.doesNotMatch(cursorSource, /<Canvas/);
  assert.doesNotMatch(cursorSource, /cursor:\s*'none'|cursor\s*=\s*['"]none/);
});

test('ships no cursor glow CSS that can create a composited overlay', () => {
  assert.doesNotMatch(cursorCss, /\.glass-cursor-halo|\.glass-cursor-fixed/);
  assert.doesNotMatch(cursorCss, /radial-gradient|box-shadow|filter:\s*blur|saturate\(/);
  assert.doesNotMatch(cursorCss, /position:\s*fixed|inset:\s*0|will-change:/);
  assert.doesNotMatch(cursorCss, /z-index:/);
  assert.doesNotMatch(cursorCss, /cursor:\s*none/);
});
