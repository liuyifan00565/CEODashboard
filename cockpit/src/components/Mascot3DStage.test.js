/*
 更新时间: 2026-07-06 10:49:22 CST
 更新内容: 将 AI 小人验收改为 imagegen/参考透明 PNG 驱动，禁止再退回手写 SVG 或低保真 mesh。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const mascotTransparentUrl = new URL('../../public/ai-mascot-transparent.png', import.meta.url);
const stageCode = stripSourceComments(stageSource);
const stageCssCode = stripSourceComments(stageCss);

function stripSourceComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function countMatches(source, patterns) {
  return patterns.filter((pattern) => pattern.test(source)).length;
}

test('renders Fu Xiaoke from the reference transparent PNG instead of a hand-built SVG or mesh', () => {
  assert.match(stageCode, /REFERENCE_MASCOT_SOURCE\s*=\s*['"]\/ai-mascot-transparent\.png['"]/);
  assert.match(stageCode, /<img[\s\S]*className="mascot-imagegen-asset"[\s\S]*src=\{REFERENCE_MASCOT_SOURCE\}/);
  assert.match(stageCode, /draggable="false"/);
  assert.match(stageCode, /aria-hidden="true"/);
  assert.match(stageCssCode, /\.mascot-imagegen-asset\s*\{/);
  assert.match(stageCssCode, /object-fit:\s*contain/);
  assert.match(stageCssCode, /object-position:\s*center bottom/);

  assert.doesNotMatch(stageCode, /<svg\b|mascot-layered-rig|mascot-layer--|wing-logo/);
  assert.doesNotMatch(stageCode, /@react-three\/fiber|@react-three\/drei|new THREE|<Canvas\b|useFrame\s*\(/);
  assert.doesNotMatch(stageCode, /<mesh\b|sphereGeometry|capsuleGeometry|boxGeometry|meshStandardMaterial|TextureLoader|useTexture/);
  assert.doesNotMatch(stageCode, /MASCOT_ACTION_POSES|ceo-mascot-[\w-]+\.png|ai-mascot-frames|sprite/i);
});

test('ships the reference mascot as a transparent PNG asset', () => {
  assert.ok(existsSync(mascotTransparentUrl), 'reference transparent mascot asset should exist');

  const mascot = readFileSync(mascotTransparentUrl);
  assert.equal(mascot.toString('ascii', 1, 4), 'PNG');
  assert.equal(mascot.readUInt32BE(16), 1084);
  assert.equal(mascot.readUInt32BE(20), 1451);
  assert.ok([4, 6].includes(mascot[25]), 'PNG should include an alpha channel');
});

test('drives the generated-image mascot with action classes and pointer variables', () => {
  assert.match(stageCode, /MASCOT_ACTIONS\.(?:idle|wave|talk|think|alert|celebrate|click)/);
  assert.match(stageCode, /data-action=\{safeAction\}/);
  assert.match(stageCode, /style=\{stageStyle\}/);
  assert.match(stageCode, /--mascot-pointer-x/);
  assert.match(stageCode, /--mascot-pointer-y/);
  assert.match(stageCode, /--mascot-pointer-translate-x/);
  assert.match(stageCode, /--mascot-pointer-translate-y/);
  assert.match(stageCode, /Math\.max\(-1,\s*Math\.min\(1,/);

  const actionSignals = [
    /\.mascot-action--idle/,
    /\.mascot-action--wave/,
    /\.mascot-action--talk/,
    /\.mascot-action--think/,
    /\.mascot-action--alert/,
    /\.mascot-action--celebrate/,
    /\.mascot-action--click/,
    /@keyframes mascot-imagegen-idle/,
    /@keyframes mascot-imagegen-wave/,
    /@keyframes mascot-imagegen-talk/,
    /@keyframes mascot-imagegen-alert/,
    /@keyframes mascot-imagegen-celebrate/,
  ];

  assert.equal(countMatches(stageCssCode, actionSignals), actionSignals.length, 'all companion actions should map to high-frame CSS motion');
  assert.match(stageCssCode, /var\(--mascot-pointer-translate-x\)/);
  assert.match(stageCssCode, /var\(--mascot-pointer-translate-y\)/);
  assert.match(stageCssCode, /var\(--mascot-pointer-tilt\)/);
  assert.doesNotMatch(stageCode, /scaleX|scaleY/);
  assert.doesNotMatch(stageCssCode, /scaleX\(|scaleY\(/);
});

test('keeps the AI mascot compact while preserving the original launcher treatment', () => {
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{/);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*width:\s*112px;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1\.34;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*overflow:\s*visible;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*filter:\s*drop-shadow\(0 18px 30px rgba\(0, 0, 0, \.38\)\) drop-shadow\(0 0 30px rgba\(114, 77, 255, \.24\)\);/s);
  assert.match(stageCssCode, /\.mascot-3d-stage--default\s*\{[^}]*width:\s*96px;/s);
  assert.match(stageCssCode, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.mascot-3d-stage\s*\{[^}]*width:\s*96px;[\s\S]*?\.mascot-3d-stage--default\s*\{[^}]*width:\s*84px;/);
});
