/*
 更新时间: 2026-07-06 10:33:11 CST
 更新内容: 补充关键帧内鼠标跟随变量断言，防止分层动画覆盖桌宠式移动。
*/
/*
 更新时间: 2026-07-06 10:31:00 CST
 更新内容: 将 AI 小人验收从低保真 Three.js 拼装改为参考图风格 2.5D 分层骨骼与动作驱动断言。
*/
/*
 更新时间: 2026-07-06 00:44:00 CST
 更新内容: 补充 DOM 兜底加载态与 WebGL context 事件断言，避免 R3F fallback 图片常态覆盖 3D canvas。
*/
/*
 更新时间: 2026-07-03 19:08:26 CST
 更新内容: 收紧 AI 小人身份配色与骨骼姿态实际应用红灯断言，避免泛化机器人或空 pose 调用通过。
*/
/*
 更新时间: 2026-07-03 18:34:39 CST
 更新内容: 加强 AI 小人真实 3D 可识别细节红灯覆盖，保持实现命名与公式无关。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const stageSource = readFileSync(new URL('./Mascot3DStage.jsx', import.meta.url), 'utf8');
const stageCss = readFileSync(new URL('./Mascot3DStage.css', import.meta.url), 'utf8');
const stageCode = stripSourceComments(stageSource);
const stageCssCode = stripSourceComments(stageCss);

function stripSourceComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function countMatches(source, patterns) {
  return patterns.filter((pattern) => pattern.test(source)).length;
}

function uniqueStringLiterals(source) {
  const literals = [];
  const stringPattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;

  while ((match = stringPattern.exec(source)) !== null) {
    literals.push(match[2]);
  }

  return [...new Set(literals)];
}

test('renders Fu Xiaoke as a reference-like 2.5D layered mascot instead of a low-fidelity mesh', () => {
  const pngLiterals = uniqueStringLiterals(stageCode).filter((literal) => /\.(?:png|webp|jpg|jpeg)$/i.test(literal));

  assert.deepEqual(pngLiterals, [], 'visible mascot should not be a full-character image or sprite frame');
  assert.match(stageCode, /<svg\b[\s\S]*viewBox=/);
  assert.match(stageCode, /mascot-layered-rig/);
  assert.match(stageCode, /<defs>[\s\S]*(?:helmetGlassGradient|helmetShellGradient|faceGradient|suitGradient|cyanGlowGradient|softShadow)/);

  const referenceSignals = [
    /mascot-layer--helmet-glass|helmet-glass/i,
    /mascot-layer--helmet-shell|helmet-shell/i,
    /helmet-forehead-wave|forehead-wave/i,
    /mascot-layer--helmet-logo|wing-logo/i,
    /mascot-layer--headset|earcup|headset/i,
    /mascot-layer--microphone|microphone-boom|mic-tip/i,
    /mascot-layer--face|face-panel/i,
    /mascot-layer--eye|left-eye|right-eye/i,
    /mascot-layer--cheek|blush|cheek/i,
    /mascot-layer--smile|smile-mouth/i,
    /mascot-layer--body|suit-body/i,
    /mascot-layer--ai-badge|AI-badge|>\s*AI\s*</i,
    /mascot-layer--suit-lines|suit-line|panel-line/i,
    /mascot-layer--left-arm|left-arm/i,
    /mascot-layer--right-arm|right-arm/i,
    /mascot-layer--left-leg|left-leg/i,
    /mascot-layer--right-leg|right-leg/i,
  ];

  assert.equal(countMatches(stageCode, referenceSignals), referenceSignals.length, 'mascot should expose all key reference-image identity parts');
  assert.match(stageCode, /purple|violet|#(?:724dff|6f43ff|7c5cff|4b2ad8|397cff)/i);
  assert.match(stageCode, /cyan|ice|#(?:66d9ff|8be9ff|a7f3ff|56dfff)/i);
  assert.match(stageCode, /white|pearl|#(?:fff|ffffff|f8f7ff|eef6ff|eaf2ff)/i);
  assert.match(stageCode, /filter="url\(#softShadow\)"|filter:.*drop-shadow|feGaussianBlur/);
  assert.doesNotMatch(stageCode, /@react-three\/fiber|@react-three\/drei|new THREE|useFrame\s*\(|<Canvas\b/);
  assert.doesNotMatch(stageCode, /<mesh\b|sphereGeometry|capsuleGeometry|boxGeometry|meshStandardMaterial|TextureLoader|useTexture/);
});

test('drives the layered mascot with action classes, CSS bones, and pointer variables', () => {
  assert.match(stageCode, /MASCOT_ACTIONS\.(?:idle|wave|talk|think|alert|celebrate|click)/);
  assert.match(stageCode, /data-action=\{(?:safeAction|actionToken|mascotAction)\}/);
  assert.match(stageCode, /style=\{(?:stageStyle|mascotStyle)\}/);
  assert.match(stageCode, /--mascot-pointer-x/);
  assert.match(stageCode, /--mascot-pointer-y/);
  assert.match(stageCode, /--mascot-pointer-translate-x/);
  assert.match(stageCode, /--mascot-pointer-head-x/);
  assert.match(stageCode, /Math\.max\(-1,\s*Math\.min\(1,/);

  const boneSignals = [
    /\.mascot-bone--root/,
    /\.mascot-bone--head/,
    /\.mascot-bone--body/,
    /\.mascot-bone--left-arm/,
    /\.mascot-bone--right-arm/,
    /\.mascot-bone--left-leg/,
    /\.mascot-bone--right-leg/,
    /\.mascot-bone--mouth/,
    /\.mascot-bone--eyes/,
  ];

  assert.equal(countMatches(stageCssCode, boneSignals), boneSignals.length, 'CSS should define independent movable bones/layers');
  assert.match(stageCssCode, /transform-origin:/);
  assert.match(stageCssCode, /will-change:\s*transform/);
  assert.match(stageCssCode, /--mascot-pointer-x:\s*0;/);
  assert.match(stageCssCode, /--mascot-pointer-y:\s*0;/);
  assert.match(stageCssCode, /@keyframes mascot-float[\s\S]*var\(--mascot-pointer-translate-x\)[\s\S]*var\(--mascot-pointer-translate-y\)/);
  assert.match(stageCssCode, /@keyframes mascot-head-idle[\s\S]*var\(--mascot-pointer-head-x\)[\s\S]*var\(--mascot-pointer-head-y\)/);

  const actionSignals = [
    /\.mascot-action--idle/,
    /\.mascot-action--wave/,
    /\.mascot-action--talk/,
    /\.mascot-action--think/,
    /\.mascot-action--alert/,
    /\.mascot-action--celebrate/,
    /\.mascot-action--click/,
    /@keyframes mascot-float/,
    /@keyframes mascot-wave-arm/,
    /@keyframes mascot-talk-mouth/,
    /@keyframes mascot-alert-pulse/,
  ];

  assert.equal(countMatches(stageCssCode, actionSignals), actionSignals.length, 'all companion actions should map to high-frame CSS motion');
  assert.doesNotMatch(stageCode, /MASCOT_ACTION_POSES|ceo-mascot-[\w-]+\.png|ai-mascot-frames|sprite/i);
});

test('keeps the AI mascot compact while preserving reference proportions and gloss', () => {
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{/);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*width:\s*112px;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1\.36;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*overflow:\s*visible;/s);
  assert.match(stageCssCode, /\.mascot-3d-stage\s*\{[^}]*filter:\s*drop-shadow\(0 18px 30px rgba\(0, 0, 0, \.38\)\) drop-shadow\(0 0 30px rgba\(114, 77, 255, \.24\)\);/s);
  assert.match(stageCssCode, /\.mascot-3d-stage--default\s*\{[^}]*width:\s*96px;/s);
  assert.match(stageCssCode, /\.mascot-layered-rig\s*\{[^}]*width:\s*100%;[\s\S]*height:\s*100%;/s);
  assert.match(stageCssCode, /\.mascot-layer--helmet-glass[\s\S]*opacity:/);
  assert.match(stageCssCode, /\.mascot-layer--helmet-highlight[\s\S]*mix-blend-mode:\s*screen/);
  assert.doesNotMatch(stageCssCode, /\.mascot-image-stack|\.mascot-pose-image|canvas\s*\{/);
  assert.doesNotMatch(stageCssCode, /brightness\(\.84\)|saturate\(\.68\)/);
  assert.match(stageCssCode, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.mascot-3d-stage\s*\{[^}]*width:\s*96px;[\s\S]*?\.mascot-3d-stage--default\s*\{[^}]*width:\s*84px;/);
});

test('preserves desktop-pet pointer behavior without distorting proportions', () => {
  assert.match(stageCode, /pointer\.(?:active|x|y)/);
  assert.match(stageCode, /--mascot-pointer-x/);
  assert.match(stageCode, /--mascot-pointer-y/);
  assert.match(stageCssCode, /translate3d\([^)]*var\(--mascot-pointer-translate-x\)[\s\S]*var\(--mascot-pointer-translate-y\)/);
  assert.match(stageCssCode, /rotate\(calc\(var\(--mascot-pointer-root-tilt\)/);
  assert.match(stageCssCode, /translate3d\([^)]*var\(--mascot-pointer-head-x\)[\s\S]*var\(--mascot-pointer-head-y\)/);
  assert.match(stageCssCode, /rotate\(calc\(var\(--mascot-pointer-head-tilt\)/);
  assert.doesNotMatch(stageCode, /scale:\s*isAnalyzing/);
  assert.doesNotMatch(stageCode, /motion\.scale\s*=/);
  assert.doesNotMatch(stageCode, /scaleX|scaleY/);
  assert.doesNotMatch(stageCssCode, /scaleX\(|scaleY\(/);
});
