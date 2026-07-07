/*
 更新时间: 2026-07-07 14:40:16 CST
 更新内容: 增加常驻 AI 小人使用静态高清图的回归测试，避免 sprite 连续翻帧造成抽动。
*/
/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 新增 2D AI 小人帧动画 manifest 验收，约束 48 帧 sprite、四种待机和维护场景动作。
*/
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MASCOT_ANIMATIONS,
  MASCOT_APPROVED_ASSETS,
  MASCOT_FRAME_ANCHORS,
  MASCOT_IDLE_VARIANTS,
  MASCOT_SPRITE_SHEET,
  getMascotFrameAnchor,
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

test('declares the approved 48-frame mascot sprite sheet geometry', () => {
  assert.equal(MASCOT_SPRITE_SHEET.src, '/ai-mascot-sprite.png');
  assert.equal(MASCOT_SPRITE_SHEET.columns, 12);
  assert.equal(MASCOT_SPRITE_SHEET.rows, 4);
  assert.equal(MASCOT_SPRITE_SHEET.frameCount, 48);
  assert.equal(MASCOT_SPRITE_SHEET.frameWidth, 224);
  assert.equal(MASCOT_SPRITE_SHEET.frameHeight, 300);
  assert.ok(existsSync(new URL('../../public/ai-mascot-sprite.png', import.meta.url)));
});

test('limits the 2D mascot runtime to approved project assets', () => {
  assert.deepEqual(Object.keys(MASCOT_APPROVED_ASSETS).sort(), [
    'analysisLaptop',
    'favicon',
    'icons',
    'logoBlack',
    'sprite',
    'transparent',
  ]);
  assert.equal(MASCOT_APPROVED_ASSETS.transparent, '/ai-mascot-transparent.png');
  assert.equal(MASCOT_APPROVED_ASSETS.analysisLaptop, '/ai-mascot-analysis-laptop.png');
  assert.equal(MASCOT_APPROVED_ASSETS.logoBlack, '/logo-black.png');
});

test('defines at least four first-class idle variants', () => {
  assert.equal(MASCOT_IDLE_VARIANTS.length, 4);
  assert.deepEqual(MASCOT_IDLE_VARIANTS.map((item) => item.key), ['breathe', 'look', 'bounce', 'patrol']);
  for (const variant of MASCOT_IDLE_VARIANTS) {
    assert.ok(Array.isArray(variant.frames), `${variant.key} should declare frame indexes`);
    assert.equal(variant.playback, 'static', `${variant.key} should not continuously animate in the sidebar`);
    assert.equal(variant.replacementAsset, 'transparent', `${variant.key} should use the stable transparent mascot still`);
    assert.equal(variant.frames.length, 1, `${variant.key} should hold one stable pose`);
    assert.ok(variant.frames.every((frame) => frame >= 0 && frame < MASCOT_SPRITE_SHEET.frameCount));
  }
});

test('maps product actions to explicit frame animation specs', () => {
  for (const action of requiredActions) {
    assert.ok(MASCOT_ANIMATIONS[action], `${action} should have an animation spec`);
    assert.ok(Array.isArray(MASCOT_ANIMATIONS[action].frames), `${action} should declare frames`);
    assert.ok(MASCOT_ANIMATIONS[action].fps >= 12, `${action} should be at least 12fps`);
    assert.equal(MASCOT_ANIMATIONS[action].playback, 'static', `${action} should not continuously flip frames`);
    assert.ok(MASCOT_ANIMATIONS[action].frames.every((frame) => frame >= 0 && frame < MASCOT_SPRITE_SHEET.frameCount));
  }
  assert.equal(MASCOT_ANIMATIONS.guide.durationMs, 1000);
  assert.equal(MASCOT_ANIMATIONS.idle.replacementAsset, 'transparent');
  assert.equal(MASCOT_ANIMATIONS.talk.replacementAsset, 'transparent');
  assert.equal(MASCOT_ANIMATIONS.think.replacementAsset, 'transparent');
  assert.equal(MASCOT_ANIMATIONS.think.overlay, '');
  assert.equal(MASCOT_ANIMATIONS.maintenance.replacementAsset, 'analysisLaptop');
  assert.equal(MASCOT_ANIMATIONS.maintenance.overlay, '');
});

test('declares per-frame anchors to cancel source sprite foot drift', () => {
  assert.equal(MASCOT_FRAME_ANCHORS.length, MASCOT_SPRITE_SHEET.frameCount);
  assert.deepEqual(getMascotFrameAnchor(0), { offsetX: 0.5, offsetY: 0 });
  assert.deepEqual(getMascotFrameAnchor(27), { offsetX: 2, offsetY: 18 });
  assert.deepEqual(getMascotFrameAnchor(30), { offsetX: 0.5, offsetY: -3 });
  assert.deepEqual(getMascotFrameAnchor(99), { offsetX: 0, offsetY: 0 });
});

test('resolves idle variants and unknown actions deterministically', () => {
  assert.equal(getMascotAnimation('not-real').key, MASCOT_ACTIONS.idle);
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).idleVariant, 'look');
  assert.deepEqual(
    getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).frames,
    MASCOT_IDLE_VARIANTS.find((variant) => variant.key === 'look').frames,
  );
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).playback, 'static');
  assert.equal(getMascotAnimation(MASCOT_ACTIONS.idle, { idleVariant: 'look' }).replacementAsset, 'transparent');
  assert.equal(getMascotAnimation('maintenanceSave').replacementAsset, 'analysisLaptop');
});
