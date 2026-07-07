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
  'idleBreathe',
  'idleLook',
  'idleBounce',
  'idlePatrol',
  'wave',
  'guide',
  'talk',
  'think',
  'alert',
  'celebrate',
  'click',
  'laptop',
];

function publicAssetExists(src) {
  assert.match(src, /^\/mascot-actions\/mascot-[a-z-]+\.png$/);
  return existsSync(new URL(`../../public${src}`, import.meta.url));
}

test('declares generated per-action mascot sprite sheets', () => {
  assert.deepEqual(Object.keys(MASCOT_ACTION_SHEETS).sort(), requiredSheetKeys.sort());
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
});

test('defines at least four first-class idle variants as real frame loops', () => {
  assert.equal(MASCOT_IDLE_VARIANTS.length, 4);
  assert.deepEqual(MASCOT_IDLE_VARIANTS.map((item) => item.key), ['breathe', 'look', 'bounce', 'patrol']);
  for (const variant of MASCOT_IDLE_VARIANTS) {
    assert.ok(Array.isArray(variant.frames), `${variant.key} should declare frame indexes`);
    assert.equal(variant.playback, 'frames', `${variant.key} should be a real idle frame sequence`);
    assert.ok(variant.frames.length >= 8, `${variant.key} should have enough frames to loop smoothly`);
    assert.ok(variant.sheetKey.startsWith('idle'), `${variant.key} should point to an idle sheet`);
  }
});

test('maps product actions to explicit frame animation specs', () => {
  for (const action of requiredActions) {
    const animation = MASCOT_ANIMATIONS[action];
    assert.ok(animation, `${action} should have an animation spec`);
    assert.ok(Array.isArray(animation.frames), `${action} should declare frames`);
    assert.ok(animation.fps >= 12, `${action} should be at least 12fps`);
    assert.equal(animation.playback, 'frames', `${action} should play actual authored frames`);
    assert.ok(animation.frames.length >= 8, `${action} should have enough frames for smooth motion`);
    assert.ok(MASCOT_ACTION_SHEETS[animation.sheetKey], `${action} should reference a generated sheet`);
    assert.ok(animation.frames.every((frame) => frame >= 0 && frame < MASCOT_ACTION_SHEETS[animation.sheetKey].frameCount));
  }
  assert.equal(MASCOT_ANIMATIONS.guide.durationMs, 1000);
  assert.equal(MASCOT_ANIMATIONS.guide.loop, false);
  assert.equal(MASCOT_ANIMATIONS.wave.loop, false);
  assert.equal(MASCOT_ANIMATIONS.click.loop, false);
  assert.equal(MASCOT_ANIMATIONS.talk.loop, true);
  assert.equal(MASCOT_ANIMATIONS.maintenance.sheetKey, 'laptop');
  assert.equal(MASCOT_ANIMATIONS.maintenanceSave.sheetKey, 'laptop');
  assert.equal(MASCOT_ANIMATIONS.maintenanceReview.sheetKey, 'laptop');
});

test('records self-audit results for smoothness and reasonableness', () => {
  const auditUrl = new URL('../../public/mascot-actions/mascot-action-audit.json', import.meta.url);
  assert.ok(existsSync(auditUrl), 'mascot action audit should be generated beside assets');
  const auditJson = JSON.parse(readFileSync(auditUrl, 'utf8'));
  assert.deepEqual(Object.keys(MASCOT_ACTION_AUDIT).sort(), requiredSheetKeys.sort());
  assert.deepEqual(Object.keys(auditJson.actions).sort(), requiredSheetKeys.sort());
  for (const key of requiredSheetKeys) {
    const result = MASCOT_ACTION_AUDIT[key];
    assert.equal(result.smooth, true, `${key} should pass smoothness audit`);
    assert.equal(result.reasonable, true, `${key} should pass semantic audit`);
    assert.ok(result.frameCount >= 8, `${key} should keep enough frames`);
    assert.ok(result.maxFootJitterPx <= 3, `${key} foot jitter should stay stable`);
    assert.ok(result.maxCenterJitterPx <= 12, `${key} center jitter should stay controlled`);
    assert.ok(result.minTransparentMarginPx >= 18, `${key} should keep at least 18px transparent safety margin`);
    assert.ok(auditJson.actions[key].minTransparentMarginPx >= 18, `${key} generated audit should keep transparent safety margin`);
  }
});

test('resolves idle variants and unknown actions deterministically', () => {
  assert.equal(getMascotAnimation('not-real').key, MASCOT_ACTIONS.idle);
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).idleVariant, 'look');
  assert.deepEqual(
    getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).frames,
    MASCOT_IDLE_VARIANTS.find((variant) => variant.key === 'look').frames,
  );
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).playback, 'frames');
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).sheetKey, 'idleLook');
  assert.equal(getMascotAnimation('maintenanceSave').sheetKey, 'laptop');
});
