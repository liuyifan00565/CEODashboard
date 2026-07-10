/*
 更新时间: 2026-07-10 13:12:00 CST
 更新内容: bridge 改为墙钟追帧并支持当前帧快速重定向，真实 Cubism 路径同步遵守减少动态偏好。
*/
/*
 更新时间: 2026-07-09 13:18:11 CST
 更新内容: 本地福小客 rig 改为离散帧 motion bridge，移除旧帧透明 ghost 淡出，让动作衔接更接近 Live2D motion fade 的帧级过渡。
*/
/*
 Update time: 2026-07-08 20:29:00 CST
 Update content: Remove external sample-character fallback so the sidebar always shows Fu Xiaoke assets unless a local Fu Xiaoke Live2D model is installed.
*/
/*
 Update time: 2026-07-08 20:02:00 CST
 Update content: Fit Live2D models by local bounds so full-body sample models stay visible inside the compact sidebar mascot stage.
*/
/*
 Update time: 2026-07-08 19:51:00 CST
 Update content: Preserve the React-owned Live2D canvas during Pixi cleanup so development remounts do not leave a ready state with an empty stage.
*/
/*
 Update time: 2026-07-08 19:43:00 CST
 Update content: Recheck same-origin Live2D assets with GET when HEAD lacks a content type so Vite HTML fallbacks are not mistaken for model files.
*/
/*
 Update time: 2026-07-08 18:55:00 CST
 Update content: Check local Live2D model and Cubism Core assets before loading Pixi so missing files fall back quietly.
*/
/*
 Update time: 2026-07-08 15:48:00 CST
 Update content: Guard Live2D resize handling so older browsers without ResizeObserver keep the loaded mascot visible.
*/
/*
 Update time: 2026-07-08 15:39:00 CST
 Update content: Keep the latest mascot action in a ref so Live2D setup does not remount on every action change.
*/
/*
 Update time: 2026-07-08 15:32:00 CST
 Update content: Lazy-load Pixi and the Live2D renderer so the dashboard keeps the Fu Xiaoke sprite fallback out of the main bundle.
*/
/*
 Update time: 2026-07-08 15:24:00 CST
 Update content: Add a Pixi Live2D mascot renderer that can load a Fu Xiaoke model while preserving the sprite fallback.
*/
import { useEffect, useMemo, useRef, useState } from 'react';

import { getMascotAnimation, getMascotSheet } from '../lib/mascotAnimationManifest.js';
import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import {
  buildMascotMotionBridge,
  getMascotReducedMotionFrame,
  retargetMascotMotionBridge,
  resolveMascotTimeline,
  resolveMascotTimelineFromStart,
} from '../lib/mascotMotionTimeline.js';
import './Live2DMascotStage.css';

export const MASCOT_LIVE2D_MODEL_SOURCE = '/live2d/fuxiaoke/fuxiaoke.model3.json';
export const MASCOT_LIVE2D_CORE_SOURCE = '/live2d/live2dcubismcore.min.js';

const LOCAL_FU_XIAOKE_RIG_FORMAT = 'fuxiaoke-local-rig-v1';
const LIVE2D_ACTION_MOTION_GROUPS = Object.freeze({
  [MASCOT_ACTIONS.idle]: ['Idle', 'idle'],
  [MASCOT_ACTIONS.wave]: ['Wave', 'Tap', 'tap_body'],
  [MASCOT_ACTIONS.guide]: ['Guide', 'Point', 'Tap'],
  [MASCOT_ACTIONS.talk]: ['Talk', 'Tap', 'idle'],
  [MASCOT_ACTIONS.think]: ['Think', 'Idle'],
  [MASCOT_ACTIONS.alert]: ['Alert', 'Surprised', 'Tap'],
  [MASCOT_ACTIONS.celebrate]: ['Celebrate', 'Happy', 'Tap'],
  [MASCOT_ACTIONS.click]: ['Tap', 'tap_body'],
});

const LIVE2D_ASSET_CONTENT_TYPES = Object.freeze({
  core: ['javascript', 'ecmascript', 'octet-stream', 'text/plain'],
  model: ['json', 'octet-stream', 'text/plain'],
});

const scriptLoaders = new Map();

function isSameOriginAsset(src) {
  if (typeof window === 'undefined') return true;
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return true;
  }
}

function hasExpectedContentType(response, kind) {
  const contentType = response.headers?.get?.('content-type')?.toLowerCase() ?? '';
  if (!contentType) return true;
  if (contentType.includes('text/html')) return false;
  return LIVE2D_ASSET_CONTENT_TYPES[kind].some((token) => contentType.includes(token));
}

function hasContentType(response) {
  return Boolean(response.headers?.get?.('content-type'));
}

async function isLive2DAssetReachable(src, kind) {
  if (!src) return false;
  if (typeof fetch !== 'function' || !isSameOriginAsset(src)) return true;

  try {
    const response = await fetch(src, { method: 'HEAD', cache: 'no-store' });
    if (response.ok && hasContentType(response)) return hasExpectedContentType(response, kind);
    if (!response.ok && response.status !== 405 && response.status !== 501) return false;

    const fallbackResponse = await fetch(src, { method: 'GET', cache: 'no-store' });
    return fallbackResponse.ok && hasExpectedContentType(fallbackResponse, kind);
  } catch {
    return false;
  }
}

function resolveLive2DAssetPath(modelSource, assetPath) {
  if (!assetPath) return '';
  if (typeof window !== 'undefined') {
    try {
      return new URL(assetPath, new URL(modelSource, window.location.href)).pathname;
    } catch {
      // Fall through to a path-only join for tests and older browsers.
    }
  }
  const basePath = modelSource.split('/').slice(0, -1).join('/');
  return `${basePath}/${assetPath}`.replace(/\/+/g, '/');
}

async function readJsonAsset(src) {
  const response = await fetch(src, { method: 'GET', cache: 'no-store' });
  if (!response.ok || !hasExpectedContentType(response, 'model')) return null;
  return response.json();
}

async function readTextAsset(src) {
  const response = await fetch(src, { method: 'GET', cache: 'no-store' });
  if (!response.ok) return '';
  return response.text();
}

async function loadLocalFuXiaokeRigAssets(modelSource) {
  if (typeof fetch !== 'function' || !isSameOriginAsset(modelSource)) return null;
  const model = await readJsonAsset(modelSource);
  if (model?.Meta?.LocalRenderer !== LOCAL_FU_XIAOKE_RIG_FORMAT) return null;

  const mocSource = resolveLive2DAssetPath(modelSource, model.FileReferences?.Moc);
  const mocPayload = await readTextAsset(mocSource);
  if (!mocPayload.includes(LOCAL_FU_XIAOKE_RIG_FORMAT)) return null;

  const motionGroups = model.FileReferences?.Motions ?? {};
  const motionFiles = Object.values(motionGroups)
    .flat()
    .map((motion) => resolveLive2DAssetPath(modelSource, motion.File))
    .filter(Boolean);
  const motionChecks = await Promise.all(motionFiles.map((src) => isLive2DAssetReachable(src, 'model')));
  if (motionChecks.some((available) => !available)) return null;

  return model;
}

async function canUseLive2DAssets(coreSource, modelSource) {
  const [coreAvailable, modelAvailable] = await Promise.all([
    isLive2DAssetReachable(coreSource, 'core'),
    isLive2DAssetReachable(modelSource, 'model'),
  ]);
  return coreAvailable && modelAvailable;
}

function loadScriptOnce(src) {
  if (!src) return Promise.reject(new Error('Missing Live2D Cubism Core source'));
  if (scriptLoaders.has(src)) return scriptLoaders.get(src);

  const loader = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-live2d-core="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.live2dCore = src;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)), { once: true });
    document.head.append(script);
  });

  scriptLoaders.set(src, loader);
  return loader;
}

function getStageSize(container) {
  const rect = container?.getBoundingClientRect();
  return {
    width: Math.max(1, Math.round(rect?.width || 128)),
    height: Math.max(1, Math.round(rect?.height || 172)),
  };
}

function getModelBounds(model) {
  const bounds = model.getLocalBounds?.();
  const width = Math.abs(bounds?.width || 0) || model.width || 1;
  const height = Math.abs(bounds?.height || 0) || model.height || 1;
  return {
    x: Number.isFinite(bounds?.x) ? bounds.x : 0,
    y: Number.isFinite(bounds?.y) ? bounds.y : 0,
    width,
    height,
  };
}

function fitModel(model, app) {
  const bounds = getModelBounds(model);
  const scale = Math.min(app.screen.width / bounds.width, app.screen.height / bounds.height) * 0.94;

  model.scale.set(scale);
  model.position.set(
    app.screen.width / 2 - (bounds.x + bounds.width / 2) * scale,
    app.screen.height / 2 - (bounds.y + bounds.height / 2) * scale,
  );
}

function playFirstAvailableMotion(model, action) {
  const groups = LIVE2D_ACTION_MOTION_GROUPS[action] ?? LIVE2D_ACTION_MOTION_GROUPS[MASCOT_ACTIONS.idle];
  for (const group of groups) {
    try {
      const motion = model.motion?.(group);
      if (motion) return true;
    } catch {
      // Some models omit optional motion groups; silently keep the current idle pose.
    }
  }
  return false;
}

function stopLive2DMotions(model) {
  model?.internalModel?.motionManager?.stopAllMotions?.();
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

function getLocalRigSheetStyle(sheet, framePosition) {
  return {
    '--fuxiaoke-rig-sheet-url': `url("${sheet.src}")`,
    '--fuxiaoke-rig-sheet-width': `${sheet.columns * 100}%`,
    '--fuxiaoke-rig-bg-x': getBackgroundPercent(framePosition.x, sheet.columns),
    '--fuxiaoke-rig-bg-y': getBackgroundPercent(framePosition.y, sheet.rows),
  };
}

function createLocalRigFrame(animation, frame) {
  return {
    actionKey: animation.key,
    intensity: animation.intensity,
    sheetKey: animation.sheetKey,
    frame,
  };
}

function FuxiaokeLocalRigStage({ action }) {
  const [displayedAction, setDisplayedAction] = useState(action);
  const [frameCursor, setFrameCursor] = useState(0);
  const [motionBridge, setMotionBridge] = useState(null);
  const [bridgeCursor, setBridgeCursor] = useState(0);
  const animationFrameRef = useRef(0);
  const bridgeFrameRef = useRef(0);
  const actionStartedAtRef = useRef(0);
  const animation = useMemo(() => getMascotAnimation(displayedAction), [displayedAction]);
  const currentLocalRigFrame = motionBridge?.timeline[bridgeCursor] ?? createLocalRigFrame(
    animation,
    animation.timeline[frameCursor]?.frame ?? animation.timeline[0]?.frame ?? 0,
  );
  const sheet = getMascotSheet(currentLocalRigFrame.sheetKey);
  const framePosition = getFramePosition(currentLocalRigFrame.frame, sheet);
  const sheetStyle = getLocalRigSheetStyle(sheet, framePosition);

  useEffect(() => () => {
    cancelAnimationFrame(animationFrameRef.current);
    cancelAnimationFrame(bridgeFrameRef.current);
  }, []);

  useEffect(() => {
    actionStartedAtRef.current = performance.now();
  }, [action]);

  useEffect(() => {
    if (!motionBridge && action === displayedAction) return;
    if (motionBridge?.targetAction === action) return;

    const nextAnimation = getMascotAnimation(action);
    const reduceMotion = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      const reducedFrame = getMascotReducedMotionFrame(nextAnimation);
      const reducedCursor = nextAnimation.timeline.findIndex((entry) => entry.frame === reducedFrame);
      setDisplayedAction(action);
      setFrameCursor(reducedCursor < 0 ? 0 : reducedCursor);
      setMotionBridge(null);
      return;
    }

    const bridge = motionBridge
      ? retargetMascotMotionBridge(motionBridge, bridgeCursor, nextAnimation)
      : buildMascotMotionBridge(animation, frameCursor, nextAnimation);
    if (!bridge) {
      setDisplayedAction(action);
      setFrameCursor(0);
      setMotionBridge(null);
      return;
    }

    setMotionBridge(bridge);
    setBridgeCursor(0);
  }, [action, animation, bridgeCursor, displayedAction, frameCursor, motionBridge]);

  useEffect(() => {
    if (!motionBridge) return undefined;
    if (typeof window === 'undefined' || motionBridge.timeline.length <= 1) {
      setDisplayedAction(motionBridge.targetAction);
      setFrameCursor(motionBridge.targetCursor);
      setMotionBridge(null);
      return undefined;
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      const targetAnimation = getMascotAnimation(motionBridge.targetAction);
      const reducedFrame = getMascotReducedMotionFrame(targetAnimation);
      const reducedCursor = targetAnimation.timeline.findIndex((entry) => entry.frame === reducedFrame);
      setDisplayedAction(motionBridge.targetAction);
      setFrameCursor(reducedCursor < 0 ? 0 : reducedCursor);
      setMotionBridge(null);
      return undefined;
    }

    const startedAt = performance.now();
    const bridgeAnimation = { timeline: motionBridge.timeline, loop: false };

    function tick(now) {
      const elapsed = now - startedAt;
      const bridgeMotion = resolveMascotTimeline(bridgeAnimation, elapsed);
      setBridgeCursor(bridgeMotion.cursor);

      if (bridgeMotion.finished) {
        setDisplayedAction(motionBridge.targetAction);
        setFrameCursor(motionBridge.targetCursor);
        setMotionBridge(null);
        return;
      }
      bridgeFrameRef.current = requestAnimationFrame(tick);
    }

    bridgeFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(bridgeFrameRef.current);
    };
  }, [motionBridge]);

  useEffect(() => {
    if (motionBridge) return undefined;
    if (typeof window === 'undefined' || animation.timeline.length <= 1) return undefined;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      const reducedFrame = getMascotReducedMotionFrame(animation);
      const reducedCursor = animation.timeline.findIndex((entry) => entry.frame === reducedFrame);
      setFrameCursor(reducedCursor < 0 ? 0 : reducedCursor);
      return undefined;
    }

    function tick(now) {
      const motion = resolveMascotTimelineFromStart(
        animation,
        actionStartedAtRef.current,
        now,
      );
      setFrameCursor(motion.cursor);

      if (motion.finished) return;
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animation, motionBridge]);

  return (
    <span
      className={[
        'mascot-local-live2d-rig',
        `mascot-local-live2d-rig--${currentLocalRigFrame.intensity}`,
      ].filter(Boolean).join(' ')}
      data-local-rig-action={currentLocalRigFrame.actionKey}
    >
      <span className="mascot-local-live2d-rig__sheet" style={sheetStyle} aria-hidden="true" />
    </span>
  );
}

export default function Live2DMascotStage({
  action = MASCOT_ACTIONS.idle,
  label = 'Fu Xiaoke Live2D mascot',
  modelSource = MASCOT_LIVE2D_MODEL_SOURCE,
  coreSource = MASCOT_LIVE2D_CORE_SOURCE,
  onLoadStateChange,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const appRef = useRef(null);
  const actionRef = useRef(action);
  const lastActionRef = useRef('');
  const reducedMotionRef = useRef(false);
  const [localRigReady, setLocalRigReady] = useState(false);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    function syncReducedMotion(event = reducedMotionQuery) {
      reducedMotionRef.current = Boolean(event.matches);
      if (reducedMotionRef.current) {
        stopLive2DMotions(modelRef.current);
      } else if (modelRef.current) {
        playFirstAvailableMotion(modelRef.current, actionRef.current);
        lastActionRef.current = actionRef.current;
      }
    }

    syncReducedMotion();
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', syncReducedMotion);
    } else {
      reducedMotionQuery.addListener?.(syncReducedMotion);
    }

    return () => {
      if (reducedMotionQuery.removeEventListener) {
        reducedMotionQuery.removeEventListener('change', syncReducedMotion);
      } else {
        reducedMotionQuery.removeListener?.(syncReducedMotion);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver;

    async function mountLive2D() {
      if (!canvasRef.current || !containerRef.current || !modelSource) {
        onLoadStateChange?.('fallback');
        return;
      }

      try {
        onLoadStateChange?.('checking');
        const localRigModel = await loadLocalFuXiaokeRigAssets(modelSource);
        if (localRigModel) {
          if (cancelled) return;
          setLocalRigReady(true);
          onLoadStateChange?.('ready');
          return;
        }

        setLocalRigReady(false);
        const assetsAvailable = await canUseLive2DAssets(coreSource, modelSource);
        if (!assetsAvailable) {
          onLoadStateChange?.('fallback');
          return;
        }

        onLoadStateChange?.('loading');
        await loadScriptOnce(coreSource);
        if (!window.Live2DCubismCore) {
          throw new Error('Live2D Cubism Core did not initialize');
        }
        const [PIXI, { Live2DModel }] = await Promise.all([
          import('pixi.js'),
          import('pixi-live2d-display/cubism4'),
        ]);
        window.PIXI = PIXI;

        const stageSize = getStageSize(containerRef.current);
        const app = new PIXI.Application({
          view: canvasRef.current,
          width: stageSize.width,
          height: stageSize.height,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
        });
        const model = await Live2DModel.from(modelSource);
        if (cancelled) {
          model.destroy?.();
          app.destroy(false);
          return;
        }

        app.stage.addChild(model);
        fitModel(model, app);
        modelRef.current = model;
        appRef.current = app;
        if (!reducedMotionRef.current) {
          playFirstAvailableMotion(model, actionRef.current);
        }
        lastActionRef.current = actionRef.current;
        onLoadStateChange?.('ready');

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            if (!containerRef.current || !appRef.current || !modelRef.current) return;
            const nextSize = getStageSize(containerRef.current);
            appRef.current.renderer.resize(nextSize.width, nextSize.height);
            fitModel(modelRef.current, appRef.current);
          });
          resizeObserver.observe(containerRef.current);
        }
      } catch {
        if (!cancelled) {
          setLocalRigReady(false);
          onLoadStateChange?.('fallback');
        }
      }
    }

    mountLive2D();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      modelRef.current = null;
      appRef.current?.destroy(false, { children: true });
      appRef.current = null;
    };
  }, [coreSource, modelSource, onLoadStateChange]);

  useEffect(() => {
    if (!modelRef.current || action === lastActionRef.current) return;
    if (reducedMotionRef.current) {
      stopLive2DMotions(modelRef.current);
      lastActionRef.current = action;
      return;
    }
    playFirstAvailableMotion(modelRef.current, action);
    lastActionRef.current = action;
  }, [action]);

  return (
    <span className="mascot-live2d-stage" ref={containerRef} role="img" aria-label={label}>
      <canvas className="mascot-live2d-stage__canvas" ref={canvasRef} aria-hidden="true" />
      {localRigReady ? <FuxiaokeLocalRigStage action={action} /> : null}
    </span>
  );
}
