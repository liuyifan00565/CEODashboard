/*
 更新时间: 2026-07-07 14:40:16 CST
 更新内容: 移除 AI 小人常驻 requestAnimationFrame 翻帧和待机自动轮换，改用稳定静态图避免持续抽动。
*/
/*
 更新时间: 2026-07-07 14:28:41 CST
 更新内容: 修复 2D 小人乱抖：接入逐帧稳定锚点，并将维护电脑图改为替换渲染以避免整图重影。
*/
/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 新增 manifest 驱动的 2D AI 小人 Sprite 舞台，替代入口 3D GLB 渲染。
*/
import { useMemo } from 'react';

import {
  MASCOT_APPROVED_ASSETS,
  MASCOT_SPRITE_SHEET,
  getMascotAnimation,
  getMascotFrameAnchor,
} from '../lib/mascotAnimationManifest.js';
import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './MascotSpriteStage.css';

const DEFAULT_LABEL = '福小客 AI 经营助手';

function getFramePosition(currentFrame) {
  return {
    x: Math.floor(currentFrame % MASCOT_SPRITE_SHEET.columns),
    y: Math.floor(currentFrame / MASCOT_SPRITE_SHEET.columns),
  };
}

function getBackgroundPercent(index, total) {
  if (total <= 1) return '0%';
  return `${(index / (total - 1)) * 100}%`;
}

function getFrameOffsetPercent(offset, frameSize) {
  if (!offset || !frameSize) return '0%';
  return `${(offset / frameSize) * 100}%`;
}

export default function MascotSpriteStage({
  action = MASCOT_ACTIONS.idle,
  analysisActive = false,
  context = 'dashboard',
  label = DEFAULT_LABEL,
}) {
  const idleVariant = 'breathe';
  const resolvedAction = context === 'maintenance' && action === MASCOT_ACTIONS.idle ? 'maintenance' : action;
  const animation = useMemo(
    () => getMascotAnimation(resolvedAction, { idleVariant }),
    [resolvedAction, idleVariant],
  );
  const currentFrame = animation.frames[0] ?? 0;
  const framePosition = getFramePosition(currentFrame);
  const frameAnchor = getMascotFrameAnchor(currentFrame);
  const replacementSrc = animation.replacementAsset === 'transparent'
    ? MASCOT_APPROVED_ASSETS.transparent
    : animation.replacementAsset === 'analysisLaptop'
      ? MASCOT_APPROVED_ASSETS.analysisLaptop
      : '';
  const stageStyle = {
    '--mascot-frame-x': framePosition.x,
    '--mascot-frame-y': framePosition.y,
    '--mascot-bg-x': getBackgroundPercent(framePosition.x, MASCOT_SPRITE_SHEET.columns),
    '--mascot-bg-y': getBackgroundPercent(framePosition.y, MASCOT_SPRITE_SHEET.rows),
    '--mascot-frame-offset-x': getFrameOffsetPercent(frameAnchor.offsetX, MASCOT_SPRITE_SHEET.frameWidth),
    '--mascot-frame-offset-y': getFrameOffsetPercent(frameAnchor.offsetY, MASCOT_SPRITE_SHEET.frameHeight),
    '--mascot-frame-width': `${MASCOT_SPRITE_SHEET.frameWidth}px`,
    '--mascot-frame-height': `${MASCOT_SPRITE_SHEET.frameHeight}px`,
  };

  return (
    <span
      className={[
        'mascot-sprite-stage',
        `mascot-sprite-stage--${animation.intensity}`,
        replacementSrc ? 'mascot-sprite-stage--replacement' : '',
        analysisActive ? 'mascot-sprite-stage--active' : '',
      ].filter(Boolean).join(' ')}
      role="img"
      aria-label={label}
      data-action={animation.key}
      data-idle-variant={animation.idleVariant ?? ''}
      style={stageStyle}
    >
      <span className="mascot-sprite-stage__sheet" aria-hidden="true" />
      {replacementSrc && (
        <img
          className="mascot-sprite-stage__replacement"
          src={replacementSrc}
          alt=""
          draggable="false"
          aria-hidden="true"
        />
      )}
      <img
        className="mascot-sprite-stage__fallback"
        src={MASCOT_APPROVED_ASSETS.transparent}
        alt=""
        draggable="false"
        aria-hidden="true"
      />
    </span>
  );
}
