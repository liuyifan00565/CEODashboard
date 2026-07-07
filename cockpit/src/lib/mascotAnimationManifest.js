/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 新增 AI 小人 2D 帧动画 manifest，统一 48 帧 sprite、四种待机和维护场景动作。
*/
import { MASCOT_ACTIONS } from './mascotCompanion.js';

export const MASCOT_SPRITE_SHEET = Object.freeze({
  src: '/ai-mascot-sprite.png',
  columns: 12,
  rows: 4,
  frameCount: 48,
  frameWidth: 224,
  frameHeight: 300,
});

export const MASCOT_APPROVED_ASSETS = Object.freeze({
  sprite: '/ai-mascot-sprite.png',
  transparent: '/ai-mascot-transparent.png',
  analysisLaptop: '/ai-mascot-analysis-laptop.png',
  favicon: '/favicon.svg',
  icons: '/icons.svg',
  logoBlack: '/logo-black.png',
});

function range(start, endInclusive) {
  return Array.from({ length: endInclusive - start + 1 }, (_, index) => start + index);
}

export const MASCOT_IDLE_VARIANTS = Object.freeze([
  Object.freeze({ key: 'breathe', frames: Object.freeze(range(0, 11)), fps: 14 }),
  Object.freeze({ key: 'look', frames: Object.freeze(range(12, 23)), fps: 16 }),
  Object.freeze({ key: 'bounce', frames: Object.freeze(range(24, 35)), fps: 18 }),
  Object.freeze({ key: 'patrol', frames: Object.freeze(range(36, 47)), fps: 16 }),
]);

const idleByKey = new Map(MASCOT_IDLE_VARIANTS.map((variant) => [variant.key, variant]));
const defaultIdle = MASCOT_IDLE_VARIANTS[0];

function actionSpec(key, frames, fps, extra = {}) {
  return Object.freeze({
    key,
    frames: Object.freeze(frames),
    fps,
    loop: extra.loop ?? true,
    durationMs: extra.durationMs ?? 0,
    overlay: extra.overlay ?? '',
    intensity: extra.intensity ?? 'calm',
  });
}

export const MASCOT_ANIMATIONS = Object.freeze({
  [MASCOT_ACTIONS.idle]: actionSpec(MASCOT_ACTIONS.idle, defaultIdle.frames, defaultIdle.fps, {
    intensity: 'idle',
  }),
  [MASCOT_ACTIONS.wave]: actionSpec(MASCOT_ACTIONS.wave, [6, 7, 8, 9, 10, 11, 10, 9, 8, 7], 24, {
    durationMs: 920,
    intensity: 'greeting',
  }),
  [MASCOT_ACTIONS.guide]: actionSpec(MASCOT_ACTIONS.guide, [18, 19, 20, 21, 22, 23, 22, 21, 20, 19], 24, {
    durationMs: 1000,
    intensity: 'guide',
  }),
  [MASCOT_ACTIONS.talk]: actionSpec(MASCOT_ACTIONS.talk, [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 24, {
    intensity: 'speech',
  }),
  [MASCOT_ACTIONS.think]: actionSpec(MASCOT_ACTIONS.think, [24, 25, 26, 27, 28, 29, 30, 29, 28, 27, 26, 25], 18, {
    overlay: 'analysisLaptop',
    intensity: 'focus',
  }),
  [MASCOT_ACTIONS.alert]: actionSpec(MASCOT_ACTIONS.alert, [36, 37, 38, 39, 40, 41, 42, 43, 42, 41, 40, 39], 24, {
    intensity: 'alert',
  }),
  [MASCOT_ACTIONS.celebrate]: actionSpec(MASCOT_ACTIONS.celebrate, [30, 31, 32, 33, 34, 35, 34, 33, 32, 31], 24, {
    durationMs: 960,
    intensity: 'celebrate',
  }),
  [MASCOT_ACTIONS.click]: actionSpec(MASCOT_ACTIONS.click, [0, 1, 2, 3, 4, 5, 4, 3], 24, {
    durationMs: 860,
    intensity: 'click',
  }),
  maintenance: actionSpec('maintenance', [24, 25, 26, 27, 28, 29, 30, 31, 30, 29, 28, 27], 16, {
    overlay: 'analysisLaptop',
    intensity: 'maintenance',
  }),
  maintenanceSave: actionSpec('maintenanceSave', [30, 31, 32, 33, 34, 35, 34, 33, 32, 31, 30, 29], 24, {
    overlay: 'analysisLaptop',
    durationMs: 960,
    intensity: 'maintenance-save',
  }),
  maintenanceReview: actionSpec('maintenanceReview', [18, 19, 20, 21, 22, 23, 24, 25, 24, 23, 22, 21], 20, {
    overlay: 'analysisLaptop',
    intensity: 'maintenance-review',
  }),
});

export function getMascotAnimation(action = MASCOT_ACTIONS.idle, { idleVariant = '' } = {}) {
  if (action === MASCOT_ACTIONS.idle) {
    const variant = idleByKey.get(idleVariant) ?? defaultIdle;
    return Object.freeze({
      ...MASCOT_ANIMATIONS[MASCOT_ACTIONS.idle],
      frames: variant.frames,
      fps: variant.fps,
      idleVariant: variant.key,
    });
  }

  return MASCOT_ANIMATIONS[action] ?? MASCOT_ANIMATIONS[MASCOT_ACTIONS.idle];
}
