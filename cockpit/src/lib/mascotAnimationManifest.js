/*
 更新时间: 2026-07-09 11:29:54 CST
 更新内容: 将默认待机扩展为 16 帧慢呼吸、短弧线慢眨眼和胸口轻脉冲循环，并修正闭眼眼区补色，让 idle 本体更有生命感且保持尺寸稳定。
*/
/*
 更新时间: 2026-07-08 18:16:34 CST
 更新内容: 将非待机动作切换为可明显区分的正式福客姿态图，并同步新的稳定性审计数值。
*/
/*
 更新时间: 2026-07-08 17:45:00 CST
 更新内容: 逐个接回稳定完整的福客动作帧，每个动作同源同尺寸并保留独立节奏，避免旧素材裁切、跳变和符号残留。
*/
/*
 更新时间: 2026-07-08 17:33:51 CST
 更新内容: 统一所有运行态小人动作到同一套完整稳定福客帧，避免动作切换时出现人物裁切、大小跳变或无意义符号。
*/
/*
 更新时间: 2026-07-08 17:20:26 CST
 更新内容: 将福客 AI 待机帧改为同源稳定慢呼吸，降低 fps 并移除快速眨眼，避免左下角小人忽大忽小和鬼畜感。
*/
/*
 更新时间: 2026-07-08 17:04:41 CST
 更新内容: 接入 imagegen 生成的福客 AI 富待机帧作为默认待机循环，避免左下角入口继续显示旧小帧待机效果。
*/
/*
 更新时间: 2026-07-08 13:07:28 CST
 更新内容: 将维护场景动作从 laptop 残缺感帧切回完整小人动作，避免左下角入口再显示抱电脑小人。
*/
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
const IDLE_FRAMES = Object.freeze(Array.from({ length: 16 }, (_, index) => index));
const TWELVE_FRAMES = Object.freeze(Array.from({ length: 12 }, (_, index) => index));

export const MASCOT_ACTION_SHEETS = Object.freeze({
  idleFukeRich: sheetSpec('/mascot-actions/mascot-idle-fuke-rich.png', 16),
  wave: sheetSpec('/mascot-actions/mascot-wave.png'),
  guide: sheetSpec('/mascot-actions/mascot-guide.png'),
  talk: sheetSpec('/mascot-actions/mascot-talk.png'),
  think: sheetSpec('/mascot-actions/mascot-think.png'),
  alert: sheetSpec('/mascot-actions/mascot-alert.png'),
  celebrate: sheetSpec('/mascot-actions/mascot-celebrate.png'),
  click: sheetSpec('/mascot-actions/mascot-click.png'),
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
  idleFukeRich: auditSpec(16, 1, 1, 19),
  wave: auditSpec(12, 3.16, 3, 29),
  guide: auditSpec(12, 2.24, 1, 27),
  talk: auditSpec(12, 1, 1, 32),
  think: auditSpec(12, 1.41, 1, 24),
  alert: auditSpec(12, 1, 0, 24),
  celebrate: auditSpec(12, 3.16, 3, 24),
  click: auditSpec(12, 2.24, 1, 27),
});

export const MASCOT_IDLE_VARIANTS = Object.freeze([
  idleVariant('fukeRich', 'idleFukeRich', 6, IDLE_FRAMES),
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

function idleVariant(key, sheetKey, fps, frames = TWELVE_FRAMES) {
  return Object.freeze({
    key,
    sheetKey,
    frames,
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
  [MASCOT_ACTIONS.wave]: actionSpec(MASCOT_ACTIONS.wave, 'wave', 8, {
    durationMs: 1200,
    loop: false,
    intensity: 'greeting',
  }),
  [MASCOT_ACTIONS.guide]: actionSpec(MASCOT_ACTIONS.guide, 'guide', 8, {
    durationMs: 1200,
    loop: false,
    intensity: 'guide',
  }),
  [MASCOT_ACTIONS.talk]: actionSpec(MASCOT_ACTIONS.talk, 'talk', 6, {
    intensity: 'speech',
  }),
  [MASCOT_ACTIONS.think]: actionSpec(MASCOT_ACTIONS.think, 'think', 6, {
    intensity: 'focus',
  }),
  [MASCOT_ACTIONS.alert]: actionSpec(MASCOT_ACTIONS.alert, 'alert', 8, {
    intensity: 'alert',
  }),
  [MASCOT_ACTIONS.celebrate]: actionSpec(MASCOT_ACTIONS.celebrate, 'celebrate', 8, {
    durationMs: 1200,
    loop: false,
    intensity: 'celebrate',
  }),
  [MASCOT_ACTIONS.click]: actionSpec(MASCOT_ACTIONS.click, 'click', 8, {
    durationMs: 900,
    loop: false,
    intensity: 'click',
  }),
  maintenance: actionSpec('maintenance', defaultIdle.sheetKey, defaultIdle.fps, {
    intensity: 'maintenance',
  }),
  maintenanceSave: actionSpec('maintenanceSave', 'celebrate', 8, {
    durationMs: 1200,
    loop: false,
    intensity: 'maintenance-save',
  }),
  maintenanceReview: actionSpec('maintenanceReview', 'think', 6, {
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
