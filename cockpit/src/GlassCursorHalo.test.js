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

function cssRuleBody(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\n\\}`))?.groups.body ?? '';
}

test('mounts the glass cursor from the dashboard shell', () => {
  assert.doesNotMatch(appSource, /GlassCursor/);
  assert.match(mainSource, /import GlassCursor from '\.\/components\/GlassCursor';?/);
  assert.match(mainSource, /<GlassCursor\s*\/>/);
});

test('renders a purple halo around the visible native cursor without catching clicks', () => {
  const fixedBlock = cssRuleBody(cursorCss, '.glass-cursor-fixed');
  const haloBlock = cssRuleBody(cursorCss, '.glass-cursor-halo');
  const haloGlowBlock = cssRuleBody(cursorCss, '.glass-cursor-halo::before');
  const visibleBlock = cssRuleBody(cursorCss, '.glass-cursor-halo--visible');

  assert.match(cursorSource, /const haloClassName = haloVisible \? 'glass-cursor-halo glass-cursor-halo--visible' : 'glass-cursor-halo';/);
  assert.match(cursorSource, /<div ref=\{haloRef\} className=\{haloClassName\} aria-hidden="true"\s*\/>/);
  assert.match(cursorSource, /window\.addEventListener\('pointermove', onPointerMove, \{ passive: true \}\);/);
  assert.match(cursorSource, /window\.addEventListener\('mousemove', onPointerMove, \{ passive: true \}\);/);
  assert.doesNotMatch(cursorSource, /<Canvas/);
  assert.match(haloBlock, /position:\s*fixed;/);
  assert.match(fixedBlock, /z-index:\s*2147483647;/);
  assert.match(haloBlock, /width:\s*300px;/);
  assert.doesNotMatch(haloBlock, /filter:/);
  assert.match(haloGlowBlock, /background:\s*radial-gradient\(circle, rgba\(168,85,247,\.92\)/);
  assert.match(haloGlowBlock, /rgba\(124,108,255,0\) 100%\);/);
  assert.match(haloGlowBlock, /filter:\s*blur\(18px\) saturate\(1\.45\);/);
  assert.doesNotMatch(cursorCss, /\.glass-cursor-halo::after/);
  assert.doesNotMatch(cursorCss, /mix-blend-mode/);
  assert.match(haloBlock, /transform:\s*translate\(-50%,\s*-50%\);/);
  assert.match(haloBlock, /pointer-events:\s*none;/);
  assert.match(visibleBlock, /opacity:\s*1;/);
  assert.doesNotMatch(cursorCss, /rgba\(124,108,255,0\)\s+7[0-9]%/);
  assert.doesNotMatch(cursorCss, /cursor:\s*none/);
});
