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
import { useEffect, useRef } from 'react';

import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Live2DMascotStage.css';

export const MASCOT_LIVE2D_MODEL_SOURCE = '/live2d/fuxiaoke/fuxiaoke.model3.json';
export const MASCOT_LIVE2D_CORE_SOURCE = '/live2d/live2dcubismcore.min.js';

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

async function isLive2DAssetReachable(src, kind) {
  if (!src) return false;
  if (typeof fetch !== 'function' || !isSameOriginAsset(src)) return true;

  try {
    const response = await fetch(src, { method: 'HEAD', cache: 'no-store' });
    if (response.ok) return hasExpectedContentType(response, kind);
    if (response.status !== 405 && response.status !== 501) return false;

    const fallbackResponse = await fetch(src, { method: 'GET', cache: 'no-store' });
    return fallbackResponse.ok && hasExpectedContentType(fallbackResponse, kind);
  } catch {
    return false;
  }
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

function fitModel(model, app) {
  const width = model.width || 1;
  const height = model.height || 1;
  const scale = Math.min(app.screen.width / width, app.screen.height / height) * 0.98;

  model.anchor?.set?.(0.5, 0.5);
  model.scale.set(scale);
  model.position.set(app.screen.width / 2, app.screen.height * 0.92);
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

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

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
          app.destroy(true);
          return;
        }

        app.stage.addChild(model);
        fitModel(model, app);
        modelRef.current = model;
        appRef.current = app;
        playFirstAvailableMotion(model, actionRef.current);
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
        if (!cancelled) onLoadStateChange?.('fallback');
      }
    }

    mountLive2D();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      modelRef.current = null;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
    };
  }, [coreSource, modelSource, onLoadStateChange]);

  useEffect(() => {
    if (!modelRef.current || action === lastActionRef.current) return;
    playFirstAvailableMotion(modelRef.current, action);
    lastActionRef.current = action;
  }, [action]);

  return (
    <span className="mascot-live2d-stage" ref={containerRef} role="img" aria-label={label}>
      <canvas className="mascot-live2d-stage__canvas" ref={canvasRef} aria-hidden="true" />
    </span>
  );
}
