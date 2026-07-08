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
  idleFukeRich: 'stabilized-from-official-fuke-ai-reference',
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
    assert.ok(variant.frames.length >= 8, `${variant.key} should have enough frames to loop smoothly`);
    assert.equal(variant.fps, 6, `${variant.key} should idle slowly enough to avoid frantic blinking`);
    assert.equal(variant.sheetKey, 'idleFukeRich', `${variant.key} should point to the rich Fu Xiaoke idle sheet`);
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
