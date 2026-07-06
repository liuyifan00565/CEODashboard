/*
 更新时间: 2026-07-06 10:49:22 CST
 更新内容: 改为使用 imagegen/参考透明 PNG 作为 AI 小人主体，避免手写 SVG 外观偏离参考图。
*/
import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Mascot3DStage.css';

const DEFAULT_POINTER = { x: 0, y: 0, active: false };
const REFERENCE_MASCOT_SOURCE = '/ai-mascot-transparent.png';
const VALID_ACTIONS = new Set(Object.values(MASCOT_ACTIONS));

function clampUnit(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(-1, Math.min(1, number));
}

function getSafeAction(action) {
  return VALID_ACTIONS.has(action) ? action : MASCOT_ACTIONS.idle;
}

function getStagePointer(pointer) {
  if (!pointer) return DEFAULT_POINTER;

  return {
    x: pointer.active ? clampUnit(pointer.x) : 0,
    y: pointer.active ? clampUnit(pointer.y) : 0,
    active: Boolean(pointer.active),
  };
}

export default function Mascot3DStage({
  action = MASCOT_ACTIONS.idle,
  pointer = DEFAULT_POINTER,
  analysisActive = false,
  label = '福小客 AI 经营助手',
}) {
  const safeAction = getSafeAction(action);
  const stagePointer = getStagePointer(pointer);
  const defaultIdle = safeAction === MASCOT_ACTIONS.idle && !analysisActive;
  const stageClassName = [
    'mascot-3d-stage',
    'mascot-3d-stage--imagegen',
    `mascot-action--${safeAction}`,
    defaultIdle ? 'mascot-3d-stage--default' : '',
    analysisActive ? 'mascot-3d-stage--active' : '',
    stagePointer.active ? 'mascot-3d-stage--tracking' : '',
  ].filter(Boolean).join(' ');
  const stageStyle = {
    '--mascot-pointer-x': stagePointer.x,
    '--mascot-pointer-y': stagePointer.y,
    '--mascot-pointer-translate-x': `${stagePointer.x * 4}px`,
    '--mascot-pointer-translate-y': `${stagePointer.y * -4}px`,
    '--mascot-pointer-tilt': `${stagePointer.x * -2.5}deg`,
  };

  return (
    <span className={stageClassName} role="img" aria-label={label} data-action={safeAction} style={stageStyle}>
      <img
        className="mascot-imagegen-asset"
        src={REFERENCE_MASCOT_SOURCE}
        alt=""
        draggable="false"
        aria-hidden="true"
      />
    </span>
  );
}
