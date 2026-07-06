/*
 更新时间: 2026-07-06 11:02:20 CST
 更新内容: 将单张参考图升级为 imagegen 透明图切层骨骼 rig，支持头身四肢独立动作。
*/
/*
 更新时间: 2026-07-06 10:49:22 CST
 更新内容: 改为使用 imagegen/参考透明 PNG 作为 AI 小人主体，避免手写 SVG 外观偏离参考图。
*/
import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Mascot3DStage.css';

const DEFAULT_POINTER = { x: 0, y: 0, active: false };
const MASCOT_RIG_LAYERS = [
  { id: 'left-leg', src: '/mascot-rig/left-leg.png', alt: '' },
  { id: 'right-leg', src: '/mascot-rig/right-leg.png', alt: '' },
  { id: 'body', src: '/mascot-rig/body.png', alt: '' },
  { id: 'left-arm', src: '/mascot-rig/left-arm.png', alt: '' },
  { id: 'right-arm', src: '/mascot-rig/right-arm.png', alt: '' },
  { id: 'head', src: '/mascot-rig/head.png', alt: '' },
];
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
    'mascot-3d-stage--rigged',
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
      <span className="mascot-rig-root" aria-hidden="true">
        {MASCOT_RIG_LAYERS.map((layer) => (
          <img
            key={layer.id}
            className={`mascot-rig-layer mascot-rig-layer--${layer.id}`}
            src={layer.src}
            alt={layer.alt}
            draggable="false"
          />
        ))}
      </span>
    </span>
  );
}
