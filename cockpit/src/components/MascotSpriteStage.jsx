/*
 Update time: 2026-07-08 15:24:00 CST
 Update content: Mount an optional Live2D renderer above the Fu Xiaoke sprite sheets while keeping sprite fallback active.
*/
/*
 Update time: 2026-07-08 11:47:40 CST
 Update content: Keep maintenance-page idle on full mascot frames instead of forcing the laptop action.
*/
/*
 Update time: 2026-07-07 18:12:09 CST
 Update content: Preload every generated mascot action sheet to avoid blank frames when switching into laptop, guide or wave states.
*/
/*
 Update time: 2026-07-07 16:59:41 CST
 Update content: Make idle variant switching visible after each completed loop so the live mascot does not look unchanged.
*/
/*
 更新时间: 2026-07-07 16:26:47 CST
 更新内容: 接入真实动作帧 sprite sheet 播放，按 fps 驱动 AI 小人并在待机循环边界切换四种 idle。
*/
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
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  MASCOT_ACTION_SHEETS,
  getMascotAnimation,
  getMascotIdleVariant,
  getMascotSheet,
} from '../lib/mascotAnimationManifest.js';
import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import Live2DMascotStage from './Live2DMascotStage';
import './MascotSpriteStage.css';

const DEFAULT_LABEL = '福小客 AI 经营助手';
const IDLE_LOOPS_BEFORE_VARIANT = 1;
const preloadedMascotSheets = new Set();

function preloadMascotActionSheets() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;

  Object.values(MASCOT_ACTION_SHEETS).forEach((sheet) => {
    if (preloadedMascotSheets.has(sheet.src)) return;
    preloadedMascotSheets.add(sheet.src);

    const image = new Image();
    image.decoding = 'async';
    image.src = sheet.src;
  });
}

function getFramePosition(currentFrame, sheet) {
  return {
    x: Math.floor(currentFrame % sheet.columns),
    y: Math.floor(currentFrame / sheet.columns),
  };
}

function getBackgroundPercent(index, total) {
  if (total <= 1) return '0%';
  return `${(index / (total - 1)) * 100}%`;
}

export default function MascotSpriteStage({
  action = MASCOT_ACTIONS.idle,
  analysisActive = false,
  label = DEFAULT_LABEL,
}) {
  const [frameCursor, setFrameCursor] = useState(0);
  const [idleVariantIndex, setIdleVariantIndex] = useState(0);
  const [live2dStatus, setLive2dStatus] = useState('idle');
  const animationFrameRef = useRef(0);
  const idleLoopCountRef = useRef(0);
  const lastLoopRef = useRef(0);
  const idleVariant = getMascotIdleVariant(idleVariantIndex);
  const animation = useMemo(
    () => getMascotAnimation(action, { idleVariant: idleVariant.key }),
    [action, idleVariant.key],
  );
  const sheet = getMascotSheet(animation.sheetKey);
  const currentFrame = animation.frames[frameCursor] ?? animation.frames[0] ?? 0;
  const framePosition = getFramePosition(currentFrame, sheet);
  const stageStyle = {
    '--mascot-sheet-url': `url("${sheet.src}")`,
    '--mascot-sheet-columns': sheet.columns,
    '--mascot-sheet-width': `${sheet.columns * 100}%`,
    '--mascot-bg-x': getBackgroundPercent(framePosition.x, sheet.columns),
    '--mascot-bg-y': getBackgroundPercent(framePosition.y, sheet.rows),
    '--mascot-frame-width': `${sheet.frameWidth}px`,
    '--mascot-frame-height': `${sheet.frameHeight}px`,
  };

  useEffect(() => {
    preloadMascotActionSheets();
  }, []);

  useEffect(() => {
    setFrameCursor(0);
    lastLoopRef.current = 0;
    if (animation.key !== MASCOT_ACTIONS.idle) {
      idleLoopCountRef.current = 0;
    }
  }, [animation.key, animation.sheetKey, animation.idleVariant]);

  useEffect(() => {
    if (typeof window === 'undefined' || animation.frames.length <= 1) return undefined;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const startedAt = performance.now();
    const frameDuration = 1000 / animation.fps;

    function tick(now) {
      const elapsed = now - startedAt;
      const rawFrameCursor = Math.floor(elapsed / frameDuration);
      const loopCount = Math.floor(rawFrameCursor / animation.frames.length);
      const nextFrameCursor = animation.loop
        ? rawFrameCursor % animation.frames.length
        : Math.min(rawFrameCursor, animation.frames.length - 1);

      setFrameCursor(nextFrameCursor);

      if (animation.loop && loopCount > lastLoopRef.current) {
        lastLoopRef.current = loopCount;
        if (animation.key === MASCOT_ACTIONS.idle) {
          idleLoopCountRef.current += 1;
          if (idleLoopCountRef.current >= IDLE_LOOPS_BEFORE_VARIANT) {
            idleLoopCountRef.current = 0;
            setIdleVariantIndex((index) => index + 1);
          }
        }
      }

      if (!animation.loop && nextFrameCursor >= animation.frames.length - 1) return;
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animation]);

  return (
    <span
      className={[
        'mascot-sprite-stage',
        `mascot-sprite-stage--${animation.intensity}`,
        live2dStatus === 'ready' ? 'mascot-sprite-stage--live2d-ready' : '',
        analysisActive ? 'mascot-sprite-stage--active' : '',
      ].filter(Boolean).join(' ')}
      role="img"
      aria-label={label}
      data-action={animation.key}
      data-idle-variant={animation.idleVariant ?? ''}
      data-live2d-state={live2dStatus}
      style={stageStyle}
    >
      <span className="mascot-sprite-stage__sheet" aria-hidden="true" />
      <Live2DMascotStage
        action={animation.key}
        label={label}
        onLoadStateChange={setLive2dStatus}
      />
    </span>
  );
}
