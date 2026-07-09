/*
 更新时间: 2026-07-09 11:29:54 CST
 更新内容: 验收默认待机为 16 帧慢呼吸、短弧线慢眨眼和干净闭眼补色，避免 idle 本体退回静态站姿、横杠眼或眼区杂色。
*/
/*
 更新时间: 2026-07-08 18:16:34 CST
 更新内容: 增加非待机动作与待机关键帧的可见差异验收，避免动作图退化成同一站姿。
*/
/*
 更新时间: 2026-07-08 17:45:00 CST
 更新内容: 要求福客动作逐个恢复为独立稳定帧，所有动作保持同源同尺寸并禁止旧素材符号残留。
*/
/*
 更新时间: 2026-07-08 17:33:51 CST
 更新内容: 要求所有运行态动作共享同一套完整稳定福客帧，防止状态切换造成裁切、大小跳变或符号残留。
*/
/*
 更新时间: 2026-07-08 17:20:26 CST
 更新内容: 要求默认待机保持慢速同源帧循环，避免快速眨眼和跨帧尺寸漂移。
*/
/*
 更新时间: 2026-07-08 17:04:41 CST
 更新内容: 要求默认待机使用 imagegen 生成的福客 AI 富帧图，避免回退到旧小帧待机效果。
*/
/*
 Update time: 2026-07-08 13:07:28 CST
 Update content: Require maintenance mascot actions to use full-body frames instead of laptop frames.
*/
/*
 Update time: 2026-07-07 18:12:09 CST
 Update content: Raise mascot frame transparent margin regression checks so scaled sidebar sprites cannot appear clipped.
*/
/*
 Update time: 2026-07-07 17:45:31 CST
 Update content: Require mascot action audits to include transparent safety margins so no generated frame is clipped.
*/
/*
 更新时间: 2026-07-07 16:26:47 CST
 更新内容: 将 AI 小人验收改为真实动作帧图资产，要求动作先有独立 sprite sheet 和自审记录再接入前端。
*/
/*
 更新时间: 2026-07-07 14:59:16 CST
 更新内容: 增加 AI 小人动作语义回归测试，要求非待机动作使用独立单帧姿态而不是同一张站姿图。
*/
/*
 更新时间: 2026-07-07 14:40:16 CST
 更新内容: 增加常驻 AI 小人使用静态高清图的回归测试，避免 sprite 连续翻帧造成抽动。
*/
/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 新增 2D AI 小人帧动画 manifest 验收，约束 48 帧 sprite、四种待机和维护场景动作。
*/
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MASCOT_ACTION_AUDIT,
  MASCOT_ACTION_SHEETS,
  MASCOT_ANIMATIONS,
  MASCOT_APPROVED_ASSETS,
  MASCOT_IDLE_VARIANTS,
  getMascotAnimation,
} from './mascotAnimationManifest.js';
import { MASCOT_ACTIONS } from './mascotCompanion.js';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const requiredActions = [
  MASCOT_ACTIONS.idle,
  MASCOT_ACTIONS.wave,
  MASCOT_ACTIONS.guide,
  MASCOT_ACTIONS.talk,
  MASCOT_ACTIONS.think,
  MASCOT_ACTIONS.alert,
  MASCOT_ACTIONS.celebrate,
  MASCOT_ACTIONS.click,
  'maintenance',
  'maintenanceSave',
  'maintenanceReview',
];

const requiredSheetKeys = [
  'idleFukeRich',
  'wave',
  'guide',
  'talk',
  'think',
  'alert',
  'celebrate',
  'click',
];

const expectedSheetByAction = {
  [MASCOT_ACTIONS.idle]: 'idleFukeRich',
  [MASCOT_ACTIONS.wave]: 'wave',
  [MASCOT_ACTIONS.guide]: 'guide',
  [MASCOT_ACTIONS.talk]: 'talk',
  [MASCOT_ACTIONS.think]: 'think',
  [MASCOT_ACTIONS.alert]: 'alert',
  [MASCOT_ACTIONS.celebrate]: 'celebrate',
  [MASCOT_ACTIONS.click]: 'click',
  maintenance: 'idleFukeRich',
  maintenanceSave: 'celebrate',
  maintenanceReview: 'think',
};

const expectedSourceBySheet = {
  idleFukeRich: 'official-fuke-idle-with-slow-breath-and-blink',
  wave: 'official-fuke-target-achieved-pose-with-symbols-removed',
  guide: 'official-fuke-kpi-guide-pose',
  talk: 'official-fuke-report-presenter-pose',
  think: 'official-fuke-risk-analysis-pose-with-warning-removed',
  alert: 'official-fuke-risk-analysis-pose-with-warning-removed',
  celebrate: 'official-fuke-target-achieved-pose',
  click: 'official-fuke-kpi-guide-pose',
};

function publicAssetExists(src) {
  assert.match(src, /^\/mascot-actions\/mascot-[a-z-]+\.png$/);
  return existsSync(new URL(`../../public${src}`, import.meta.url));
}

function readMascotSheet(sheetKey) {
  const sheet = MASCOT_ACTION_SHEETS[sheetKey];
  return PNG.sync.read(readFileSync(new URL(`../../public${sheet.src}`, import.meta.url)));
}

function getVisibleDifferenceRatio(baseSheet, actionSheet, frameIndex = 6) {
  const frameWidth = 224;
  const frameHeight = 300;
  let changedPixels = 0;
  let visiblePixels = 0;
  for (let y = 0; y < frameHeight; y += 1) {
    for (let x = 0; x < frameWidth; x += 1) {
      const baseIndex = (baseSheet.width * y + frameIndex * frameWidth + x) * 4;
      const actionIndex = (actionSheet.width * y + frameIndex * frameWidth + x) * 4;
      const baseAlpha = baseSheet.data[baseIndex + 3];
      const actionAlpha = actionSheet.data[actionIndex + 3];
      if (baseAlpha > 0 || actionAlpha > 0) visiblePixels += 1;
      const alphaDelta = Math.abs(baseAlpha - actionAlpha);
      const rgbDelta = Math.abs(baseSheet.data[baseIndex] - actionSheet.data[actionIndex])
        + Math.abs(baseSheet.data[baseIndex + 1] - actionSheet.data[actionIndex + 1])
        + Math.abs(baseSheet.data[baseIndex + 2] - actionSheet.data[actionIndex + 2]);
      if (alphaDelta > 24 || rgbDelta > 60) changedPixels += 1;
    }
  }
  return changedPixels / visiblePixels;
}

function getSameSheetFrameDifferenceRatio(sheet, baseFrameIndex, actionFrameIndex) {
  const frameWidth = 224;
  const frameHeight = 300;
  let changedPixels = 0;
  let visiblePixels = 0;
  for (let y = 0; y < frameHeight; y += 1) {
    for (let x = 0; x < frameWidth; x += 1) {
      const baseIndex = (sheet.width * y + baseFrameIndex * frameWidth + x) * 4;
      const actionIndex = (sheet.width * y + actionFrameIndex * frameWidth + x) * 4;
      const baseAlpha = sheet.data[baseIndex + 3];
      const actionAlpha = sheet.data[actionIndex + 3];
      if (baseAlpha > 0 || actionAlpha > 0) visiblePixels += 1;
      const alphaDelta = Math.abs(baseAlpha - actionAlpha);
      const rgbDelta = Math.abs(sheet.data[baseIndex] - sheet.data[actionIndex])
        + Math.abs(sheet.data[baseIndex + 1] - sheet.data[actionIndex + 1])
        + Math.abs(sheet.data[baseIndex + 2] - sheet.data[actionIndex + 2]);
      if (alphaDelta > 20 || rgbDelta > 48) changedPixels += 1;
    }
  }
  return changedPixels / visiblePixels;
}

function getBlinkLineWidths(sheet, frameIndex) {
  const frameWidth = 224;
  const clusters = {
    left: { minX: Infinity, maxX: -Infinity },
    right: { minX: Infinity, maxX: -Infinity },
  };
  for (let y = 112; y <= 132; y += 1) {
    for (let x = 100; x <= 174; x += 1) {
      const index = (sheet.width * y + frameIndex * frameWidth + x) * 4;
      const r = sheet.data[index];
      const g = sheet.data[index + 1];
      const b = sheet.data[index + 2];
      const a = sheet.data[index + 3];
      const isEyelidPixel = a > 170 && r < 80 && g < 95 && b < 130;
      if (isEyelidPixel) {
        const key = x < 138 ? 'left' : 'right';
        clusters[key].minX = Math.min(clusters[key].minX, x);
        clusters[key].maxX = Math.max(clusters[key].maxX, x);
      }
    }
  }
  return Object.fromEntries(
    Object.entries(clusters).map(([key, cluster]) => [
      key,
      cluster.maxX >= cluster.minX ? cluster.maxX - cluster.minX + 1 : 0,
    ]),
  );
}

function countBlinkEyeNoisePixels(sheet, frameIndex) {
  const frameWidth = 224;
  const eyes = [
    { cx: 116, cy: 127, rx: 13.5, ry: 15.5 },
    { cx: 158, cy: 127, rx: 13.5, ry: 15.5 },
  ];
  let noisePixels = 0;
  for (const eye of eyes) {
    for (let y = Math.floor(eye.cy - eye.ry - 2); y <= Math.ceil(eye.cy + eye.ry + 2); y += 1) {
      for (let x = Math.floor(eye.cx - eye.rx - 2); x <= Math.ceil(eye.cx + eye.rx + 2); x += 1) {
        const nx = (x - eye.cx) / eye.rx;
        const ny = (y - eye.cy) / eye.ry;
        if (nx * nx + ny * ny > 1.15) continue;
        const index = (sheet.width * y + frameIndex * frameWidth + x) * 4;
        const r = sheet.data[index];
        const g = sheet.data[index + 1];
        const b = sheet.data[index + 2];
        const a = sheet.data[index + 3];
        const darkPixel = a > 170 && r < 100 && g < 110 && b < 150;
        const lineCurveY = eye.cy - 4 + 2 * ((x - eye.cx) / (eye.rx * 0.65)) ** 2;
        const expectedEyelid = Math.abs(y - lineCurveY) <= 4 && Math.abs(x - eye.cx) <= 12;
        if (darkPixel && !expectedEyelid) noisePixels += 1;
      }
    }
  }
  return noisePixels;
}

test('declares generated per-action mascot sprite sheets', () => {
  assert.deepEqual(Object.keys(MASCOT_ACTION_SHEETS).sort(), requiredSheetKeys.sort());
  assert.ok(!Object.hasOwn(MASCOT_ACTION_SHEETS, 'laptop'), 'runtime sheets should not preload the laptop mascot asset');
  for (const key of requiredSheetKeys) {
    const sheet = MASCOT_ACTION_SHEETS[key];
    assert.equal(sheet.frameWidth, 224, `${key} should use stable 224px frame width`);
    assert.equal(sheet.frameHeight, 300, `${key} should use stable 300px frame height`);
    assert.equal(sheet.rows, 1, `${key} should be a single-row playback sheet`);
    assert.ok(sheet.columns >= 8, `${key} should have enough frames for smooth motion`);
    assert.equal(sheet.frameCount, sheet.columns * sheet.rows);
    assert.ok(publicAssetExists(sheet.src), `${sheet.src} should exist`);
  }
});

test('limits the 2D mascot runtime to approved generated project assets', () => {
  assert.deepEqual(Object.keys(MASCOT_APPROVED_ASSETS).sort(), [
    'audit',
    'favicon',
    'icons',
    'logoBlack',
    'sheets',
  ]);
  assert.equal(MASCOT_APPROVED_ASSETS.audit, '/mascot-actions/mascot-action-audit.json');
  assert.equal(MASCOT_APPROVED_ASSETS.logoBlack, '/logo-black.png');
  for (const sheet of Object.values(MASCOT_APPROVED_ASSETS.sheets)) {
    assert.ok(publicAssetExists(sheet));
  }
  assert.ok(!Object.values(MASCOT_APPROVED_ASSETS.sheets).includes('/mascot-actions/mascot-laptop.png'));
  assert.deepEqual(Object.keys(MASCOT_APPROVED_ASSETS.sheets).sort(), requiredSheetKeys.sort());
});

test('uses the stabilized Fu Xiaoke slow idle sheet as the default real frame loop', () => {
  assert.equal(MASCOT_IDLE_VARIANTS.length, 1);
  assert.deepEqual(MASCOT_IDLE_VARIANTS.map((item) => item.key), ['fukeRich']);
  for (const variant of MASCOT_IDLE_VARIANTS) {
    assert.ok(Array.isArray(variant.frames), `${variant.key} should declare frame indexes`);
    assert.equal(variant.playback, 'frames', `${variant.key} should be a real idle frame sequence`);
    assert.equal(variant.frames.length, 16, `${variant.key} should use a longer idle loop for slow blink timing`);
    assert.equal(variant.fps, 6, `${variant.key} should idle slowly enough to avoid frantic blinking`);
    assert.equal(variant.sheetKey, 'idleFukeRich', `${variant.key} should point to the rich Fu Xiaoke idle sheet`);
  }
});

test('keeps the default idle loop visibly alive without relying on static standing frames', () => {
  const idleSheet = readMascotSheet('idleFukeRich');
  assert.equal(MASCOT_ACTION_SHEETS.idleFukeRich.columns, 16);
  assert.equal(MASCOT_ACTION_AUDIT.idleFukeRich.frameCount, 16);
  const blinkDifference = getSameSheetFrameDifferenceRatio(idleSheet, 0, 5);
  const breathingDifference = getSameSheetFrameDifferenceRatio(idleSheet, 0, 10);
  assert.ok(blinkDifference >= 0.04, `idle blink should be visible; got ${blinkDifference.toFixed(3)}`);
  assert.ok(breathingDifference >= 0.08, `idle breathing should be visible; got ${breathingDifference.toFixed(3)}`);
});

test('keeps the blink-return eyelids as short arcs instead of stretched bars', () => {
  const idleSheet = readMascotSheet('idleFukeRich');
  const closedWidths = getBlinkLineWidths(idleSheet, 5);
  const returnWidths = getBlinkLineWidths(idleSheet, 6);
  for (const [eye, width] of Object.entries(closedWidths)) {
    assert.ok(width > 0 && width <= 18, `${eye} closed eyelid arc should stay compact; got ${width}px`);
  }
  for (const [eye, width] of Object.entries(returnWidths)) {
    assert.ok(width > 0 && width <= 15, `${eye} blink-return eyelid arc should not become a long bar; got ${width}px`);
  }
});

test('keeps closed-eye recoloring clean around the goggles', () => {
  const idleSheet = readMascotSheet('idleFukeRich');
  for (const frameIndex of [4, 5, 6]) {
    const noisePixels = countBlinkEyeNoisePixels(idleSheet, frameIndex);
    assert.ok(noisePixels <= 4, `blink frame ${frameIndex} should not leave dark speckles around the eye fill; got ${noisePixels}`);
  }
});

test('maps product actions to explicit frame animation specs', () => {
  for (const action of requiredActions) {
    const animation = MASCOT_ANIMATIONS[action];
    assert.ok(animation, `${action} should have an animation spec`);
    assert.ok(Array.isArray(animation.frames), `${action} should declare frames`);
    assert.ok(animation.fps >= 6 && animation.fps <= 8, `${action} should use a calm stable frame rate`);
    assert.equal(animation.playback, 'frames', `${action} should play actual authored frames`);
    assert.ok(animation.frames.length >= 8, `${action} should have enough frames for smooth motion`);
    assert.equal(animation.sheetKey, expectedSheetByAction[action], `${action} should use its stabilized Fu Xiaoke sheet`);
    assert.ok(MASCOT_ACTION_SHEETS[animation.sheetKey], `${action} should reference the approved stable sheet`);
    assert.ok(animation.frames.every((frame) => frame >= 0 && frame < MASCOT_ACTION_SHEETS[animation.sheetKey].frameCount));
  }
  assert.equal(MASCOT_ANIMATIONS.guide.durationMs, 1200);
  assert.equal(MASCOT_ANIMATIONS.guide.loop, false);
  assert.equal(MASCOT_ANIMATIONS.wave.loop, false);
  assert.equal(MASCOT_ANIMATIONS.click.loop, false);
  assert.equal(MASCOT_ANIMATIONS.talk.loop, true);
  assert.equal(MASCOT_ANIMATIONS.maintenance.sheetKey, 'idleFukeRich');
  assert.equal(MASCOT_ANIMATIONS.maintenanceSave.sheetKey, 'celebrate');
  assert.equal(MASCOT_ANIMATIONS.maintenanceReview.sheetKey, 'think');
  assert.ok(
    Object.values(MASCOT_ANIMATIONS).every((animation) => animation.sheetKey !== 'laptop'),
    'runtime mascot animations should not display the laptop sheet in the sidebar launcher',
  );
});

test('records self-audit results for smoothness and reasonableness', () => {
  const auditUrl = new URL('../../public/mascot-actions/mascot-action-audit.json', import.meta.url);
  assert.ok(existsSync(auditUrl), 'mascot action audit should be generated beside assets');
  const auditJson = JSON.parse(readFileSync(auditUrl, 'utf8'));
  assert.deepEqual(Object.keys(MASCOT_ACTION_AUDIT).sort(), requiredSheetKeys.sort());
  assert.ok(!Object.hasOwn(MASCOT_ACTION_AUDIT, 'laptop'), 'runtime audit should not include unused laptop sheet');
  for (const key of requiredSheetKeys) {
    const result = MASCOT_ACTION_AUDIT[key];
    assert.equal(result.smooth, true, `${key} should pass smoothness audit`);
    assert.equal(result.reasonable, true, `${key} should pass semantic audit`);
    assert.ok(result.frameCount >= 8, `${key} should keep enough frames`);
    assert.ok(result.maxFootJitterPx <= 3, `${key} foot jitter should stay stable`);
    assert.ok(result.maxCenterJitterPx <= 4, `${key} center jitter should stay controlled`);
    assert.ok(result.minTransparentMarginPx >= 18, `${key} should keep at least 18px transparent safety margin`);
    assert.ok(auditJson.actions[key].minTransparentMarginPx >= 18, `${key} generated audit should keep transparent safety margin`);
    assert.equal(auditJson.actions[key].source, expectedSourceBySheet[key]);
  }
});

test('keeps non-idle action sheets visibly different from the idle standing loop', () => {
  const idleSheet = readMascotSheet('idleFukeRich');
  for (const key of requiredSheetKeys.filter((sheetKey) => sheetKey !== 'idleFukeRich')) {
    const actionSheet = readMascotSheet(key);
    const differenceRatio = getVisibleDifferenceRatio(idleSheet, actionSheet);
    assert.ok(
      differenceRatio >= 0.55,
      `${key} should be visibly different from idle at sidebar size; got ${differenceRatio.toFixed(3)}`,
    );
  }
});

test('resolves idle variants and unknown actions deterministically', () => {
  assert.equal(getMascotAnimation('not-real').key, MASCOT_ACTIONS.idle);
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).idleVariant, 'fukeRich');
  assert.deepEqual(
    getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).frames,
    MASCOT_IDLE_VARIANTS.find((variant) => variant.key === 'fukeRich').frames,
  );
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).playback, 'frames');
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).sheetKey, 'idleFukeRich');
  assert.equal(getMascotAnimation('maintenanceSave').sheetKey, 'celebrate');
  assert.notEqual(getMascotAnimation('maintenanceSave').sheetKey, 'laptop');
});
