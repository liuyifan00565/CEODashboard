/*
 更新时间: 2026-07-07 18:12:09 CST
 更新内容: 同步 AI 小人动作帧 20px 级安全边距审计结果，配合前端护栏彻底避免图片显示残缺。
*/
/*
 更新时间: 2026-07-07 17:45:31 CST
 更新内容: 同步 AI 小人动作帧安全边距审计结果，确保挥手、指引和维护帧不会贴边残缺。
*/
/*
 更新时间: 2026-07-07 16:26:47 CST
 更新内容: 将 AI 小人动作切换为真实帧图 sprite sheet，接入动作自审结果并移除单帧替换策略。
*/
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

const FRAME_WIDTH = 224;
const FRAME_HEIGHT = 300;
const TWELVE_FRAMES = Object.freeze(Array.from({ length: 12 }, (_, index) => index));

export const MASCOT_ACTION_SHEETS = Object.freeze({
  idleBreathe: sheetSpec('/mascot-actions/mascot-idle-breathe.png'),
  idleLook: sheetSpec('/mascot-actions/mascot-idle-look.png'),
  idleBounce: sheetSpec('/mascot-actions/mascot-idle-bounce.png'),
  idlePatrol: sheetSpec('/mascot-actions/mascot-idle-patrol.png'),
  wave: sheetSpec('/mascot-actions/mascot-wave.png'),
  guide: sheetSpec('/mascot-actions/mascot-guide.png'),
  talk: sheetSpec('/mascot-actions/mascot-talk.png'),
  think: sheetSpec('/mascot-actions/mascot-think.png'),
  alert: sheetSpec('/mascot-actions/mascot-alert.png'),
  celebrate: sheetSpec('/mascot-actions/mascot-celebrate.png'),
  click: sheetSpec('/mascot-actions/mascot-click.png'),
  laptop: sheetSpec('/mascot-actions/mascot-laptop.png'),
});

export const MASCOT_APPROVED_ASSETS = Object.freeze({
  sheets: Object.freeze(Object.fromEntries(
    Object.entries(MASCOT_ACTION_SHEETS).map(([key, sheet]) => [key, sheet.src]),
  )),
  audit: '/mascot-actions/mascot-action-audit.json',
  favicon: '/favicon.svg',
  icons: '/icons.svg',
  logoBlack: '/logo-black.png',
});

export const MASCOT_ACTION_AUDIT = Object.freeze({
  idleBreathe: auditSpec(12, 1, 0, 21),
  idleLook: auditSpec(12, 1, 0, 21),
  idleBounce: auditSpec(12, 0, 0, 21),
  idlePatrol: auditSpec(12, 1, 0, 21),
  wave: auditSpec(12, 1, 0, 20),
  guide: auditSpec(12, 1, 0, 20),
  talk: auditSpec(12, 0, 0, 21),
  think: auditSpec(12, 0.5, 0, 21),
  alert: auditSpec(12, 0.5, 0, 21),
  celebrate: auditSpec(12, 1, 0, 21),
  click: auditSpec(12, 0.5, 0, 21),
  laptop: auditSpec(12, 1, 0, 20),
});

export const MASCOT_IDLE_VARIANTS = Object.freeze([
  idleVariant('breathe', 'idleBreathe', 12),
  idleVariant('look', 'idleLook', 12),
  idleVariant('bounce', 'idleBounce', 12),
  idleVariant('patrol', 'idlePatrol', 12),
]);

const idleByKey = new Map(MASCOT_IDLE_VARIANTS.map((variant) => [variant.key, variant]));
const defaultIdle = MASCOT_IDLE_VARIANTS[0];

function sheetSpec(src, columns = 12) {
  return Object.freeze({
    src,
    columns,
    rows: 1,
    frameCount: columns,
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
  });
}

function auditSpec(frameCount, maxCenterJitterPx, maxFootJitterPx, minTransparentMarginPx) {
  return Object.freeze({
    frameCount,
    maxCenterJitterPx,
    maxFootJitterPx,
    minTransparentMarginPx,
    smooth: true,
    reasonable: true,
  });
}

function idleVariant(key, sheetKey, fps) {
  return Object.freeze({
    key,
    sheetKey,
    frames: TWELVE_FRAMES,
    fps,
    playback: 'frames',
    loop: true,
  });
}

function actionSpec(key, sheetKey, fps, extra = {}) {
  return Object.freeze({
    key,
    sheetKey,
    frames: extra.frames ?? TWELVE_FRAMES,
    fps,
    playback: 'frames',
    loop: extra.loop ?? true,
    durationMs: extra.durationMs ?? 0,
    intensity: extra.intensity ?? 'calm',
  });
}

export const MASCOT_ANIMATIONS = Object.freeze({
  [MASCOT_ACTIONS.idle]: actionSpec(MASCOT_ACTIONS.idle, defaultIdle.sheetKey, defaultIdle.fps, {
    intensity: 'idle',
  }),
  [MASCOT_ACTIONS.wave]: actionSpec(MASCOT_ACTIONS.wave, 'wave', 14, {
    durationMs: 920,
    loop: false,
    intensity: 'greeting',
  }),
  [MASCOT_ACTIONS.guide]: actionSpec(MASCOT_ACTIONS.guide, 'guide', 12, {
    durationMs: 1000,
    loop: false,
    intensity: 'guide',
  }),
  [MASCOT_ACTIONS.talk]: actionSpec(MASCOT_ACTIONS.talk, 'talk', 12, {
    intensity: 'speech',
  }),
  [MASCOT_ACTIONS.think]: actionSpec(MASCOT_ACTIONS.think, 'think', 12, {
    intensity: 'focus',
  }),
  [MASCOT_ACTIONS.alert]: actionSpec(MASCOT_ACTIONS.alert, 'alert', 12, {
    intensity: 'alert',
  }),
  [MASCOT_ACTIONS.celebrate]: actionSpec(MASCOT_ACTIONS.celebrate, 'celebrate', 14, {
    durationMs: 960,
    loop: false,
    intensity: 'celebrate',
  }),
  [MASCOT_ACTIONS.click]: actionSpec(MASCOT_ACTIONS.click, 'click', 16, {
    durationMs: 860,
    loop: false,
    intensity: 'click',
  }),
  maintenance: actionSpec('maintenance', 'laptop', 12, {
    intensity: 'maintenance',
  }),
  maintenanceSave: actionSpec('maintenanceSave', 'laptop', 14, {
    durationMs: 960,
    loop: false,
    intensity: 'maintenance-save',
  }),
  maintenanceReview: actionSpec('maintenanceReview', 'laptop', 12, {
    intensity: 'maintenance-review',
  }),
});

export function getMascotSheet(sheetKey = defaultIdle.sheetKey) {
  return MASCOT_ACTION_SHEETS[sheetKey] ?? MASCOT_ACTION_SHEETS[defaultIdle.sheetKey];
}

export function getMascotIdleVariant(indexOrKey = 0) {
  if (typeof indexOrKey === 'string') {
    return idleByKey.get(indexOrKey) ?? defaultIdle;
  }
  const index = Math.abs(Number(indexOrKey) || 0) % MASCOT_IDLE_VARIANTS.length;
  return MASCOT_IDLE_VARIANTS[index];
}

export function getMascotAnimation(action = MASCOT_ACTIONS.idle, { idleVariant = '' } = {}) {
  if (action === MASCOT_ACTIONS.idle) {
    const variant = getMascotIdleVariant(idleVariant || defaultIdle.key);
    return Object.freeze({
      ...MASCOT_ANIMATIONS[MASCOT_ACTIONS.idle],
      sheetKey: variant.sheetKey,
      frames: variant.frames,
      fps: variant.fps,
      playback: variant.playback,
      loop: variant.loop,
      idleVariant: variant.key,
    });
  }

  return MASCOT_ANIMATIONS[action] ?? MASCOT_ANIMATIONS[MASCOT_ACTIONS.idle];
}
