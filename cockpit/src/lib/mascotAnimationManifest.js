/*
 更新时间: 2026-07-07 14:59:16 CST
 更新内容: 恢复 AI 小人非待机动作的独立静态姿态，避免所有交互状态共用同一张站姿显得呆板。
*/
/*
 更新时间: 2026-07-07 14:40:16 CST
 更新内容: 将 AI 小人常驻动作改为静态高清图策略，停止 sprite 连续翻帧导致的抽动。
*/
/*
 更新时间: 2026-07-07 14:28:41 CST
 更新内容: 修复 2D 小人抖动根因：为 sprite 每帧增加脚底/中心锚点，并将维护电脑图改为整图替换而非叠层。
*/
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

export const MASCOT_FRAME_ANCHORS = Object.freeze([
  [0.5, 0],
  [1, 3],
  [1.5, 5],
  [1.5, 6],
  [1.5, 5],
  [0.5, 3],
  [0, 0],
  [-0.5, -1],
  [-1, -2],
  [-1, -3],
  [-1, -2],
  [0, -1],
  [0, 0],
  [-3, 7],
  [1.5, 6],
  [-5.5, 11],
  [1.5, 6],
  [-2.5, 6],
  [1.5, 2],
  [0, 1],
  [1.5, -1],
  [2, -2],
  [1, -1],
  [1, -1],
  [0.5, 0],
  [1, 9],
  [1.5, 14],
  [2, 18],
  [1.5, 12],
  [0.5, 5],
  [0.5, -3],
  [0, 2],
  [-1, 4],
  [-1, 3],
  [-0.5, 2],
  [0, 2],
  [0.5, 0],
  [0.5, 2],
  [1, 4],
  [1, 5],
  [1, 4],
  [0.5, 2],
  [0.5, 0],
  [0, -1],
  [-0.5, -1],
  [-0.5, -2],
  [-0.5, -1],
  [0, -1],
].map(([offsetX, offsetY]) => Object.freeze({ offsetX, offsetY })));

export const MASCOT_IDLE_VARIANTS = Object.freeze([
  Object.freeze({ key: 'breathe', frames: Object.freeze([0]), fps: 14, playback: 'static', replacementAsset: 'transparent' }),
  Object.freeze({ key: 'look', frames: Object.freeze([12]), fps: 16, playback: 'static', replacementAsset: 'transparent' }),
  Object.freeze({ key: 'bounce', frames: Object.freeze([24]), fps: 18, playback: 'static', replacementAsset: 'transparent' }),
  Object.freeze({ key: 'patrol', frames: Object.freeze([36]), fps: 16, playback: 'static', replacementAsset: 'transparent' }),
]);

const idleByKey = new Map(MASCOT_IDLE_VARIANTS.map((variant) => [variant.key, variant]));
const defaultIdle = MASCOT_IDLE_VARIANTS[0];

function actionSpec(key, frames, fps, extra = {}) {
  return Object.freeze({
    key,
    frames: Object.freeze(frames),
    fps,
    playback: extra.playback ?? 'static',
    loop: extra.loop ?? true,
    durationMs: extra.durationMs ?? 0,
    overlay: extra.overlay ?? '',
    replacementAsset: extra.replacementAsset ?? '',
    intensity: extra.intensity ?? 'calm',
  });
}

export const MASCOT_ANIMATIONS = Object.freeze({
  [MASCOT_ACTIONS.idle]: actionSpec(MASCOT_ACTIONS.idle, defaultIdle.frames, defaultIdle.fps, {
    replacementAsset: 'transparent',
    intensity: 'idle',
  }),
  [MASCOT_ACTIONS.wave]: actionSpec(MASCOT_ACTIONS.wave, [7], 24, {
    durationMs: 920,
    intensity: 'greeting',
  }),
  [MASCOT_ACTIONS.guide]: actionSpec(MASCOT_ACTIONS.guide, [18], 24, {
    durationMs: 1000,
    intensity: 'guide',
  }),
  [MASCOT_ACTIONS.talk]: actionSpec(MASCOT_ACTIONS.talk, [13], 24, {
    intensity: 'speech',
  }),
  [MASCOT_ACTIONS.think]: actionSpec(MASCOT_ACTIONS.think, [27], 18, {
    intensity: 'focus',
  }),
  [MASCOT_ACTIONS.alert]: actionSpec(MASCOT_ACTIONS.alert, [42], 24, {
    intensity: 'alert',
  }),
  [MASCOT_ACTIONS.celebrate]: actionSpec(MASCOT_ACTIONS.celebrate, [31], 24, {
    durationMs: 960,
    intensity: 'celebrate',
  }),
  [MASCOT_ACTIONS.click]: actionSpec(MASCOT_ACTIONS.click, [3], 24, {
    durationMs: 860,
    intensity: 'click',
  }),
  maintenance: actionSpec('maintenance', [24], 16, {
    replacementAsset: 'analysisLaptop',
    intensity: 'maintenance',
  }),
  maintenanceSave: actionSpec('maintenanceSave', [30], 24, {
    replacementAsset: 'analysisLaptop',
    durationMs: 960,
    intensity: 'maintenance-save',
  }),
  maintenanceReview: actionSpec('maintenanceReview', [18], 20, {
    replacementAsset: 'analysisLaptop',
    intensity: 'maintenance-review',
  }),
});

export function getMascotFrameAnchor(frameIndex = 0) {
  return MASCOT_FRAME_ANCHORS[frameIndex] ?? Object.freeze({ offsetX: 0, offsetY: 0 });
}

export function getMascotAnimation(action = MASCOT_ACTIONS.idle, { idleVariant = '' } = {}) {
  if (action === MASCOT_ACTIONS.idle) {
    const variant = idleByKey.get(idleVariant) ?? defaultIdle;
    return Object.freeze({
      ...MASCOT_ANIMATIONS[MASCOT_ACTIONS.idle],
      frames: variant.frames,
      fps: variant.fps,
      playback: variant.playback,
      replacementAsset: variant.replacementAsset,
      idleVariant: variant.key,
    });
  }

  return MASCOT_ANIMATIONS[action] ?? MASCOT_ANIMATIONS[MASCOT_ACTIONS.idle];
}
