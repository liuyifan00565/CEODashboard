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
 Update time: 2026-07-08 19:31:00 CST
 Update content: Use an official Live2D sample model in development when the local Fu Xiaoke model is not installed, making the Live2D pipeline visibly verifiable.
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
import { useEffect, useRef } from 'react';

import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Live2DMascotStage.css';

export const MASCOT_LIVE2D_MODEL_SOURCE = '/live2d/fuxiaoke/fuxiaoke.model3.json';
export const MASCOT_LIVE2D_CORE_SOURCE = '/live2d/live2dcubismcore.min.js';
export const MASCOT_LIVE2D_SAMPLE_MODEL_SOURCE = 'https://cdn.jsdelivr.net/gh/Live2D/CubismWebSamples@develop/Samples/Resources/Haru/Haru.model3.json';
export const MASCOT_LIVE2D_SAMPLE_CORE_SOURCE = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js';

const LIVE2D_SAMPLE_FALLBACK_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_MASCOT_LIVE2D_SAMPLE_FALLBACK !== 'false';

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

async function canUseLive2DAssets(coreSource, modelSource) {
  const [coreAvailable, modelAvailable] = await Promise.all([
    isLive2DAssetReachable(coreSource, 'core'),
    isLive2DAssetReachable(modelSource, 'model'),
  ]);
  return coreAvailable && modelAvailable;
}

async function resolveLive2DAssetPair({
  coreSource,
  modelSource,
  sampleCoreSource,
  sampleModelSource,
  sampleFallbackEnabled,
}) {
  if (await canUseLive2DAssets(coreSource, modelSource)) {
    return { coreSource, modelSource, sourceType: 'local' };
  }

  if (sampleFallbackEnabled && await canUseLive2DAssets(sampleCoreSource, sampleModelSource)) {
    return { coreSource: sampleCoreSource, modelSource: sampleModelSource, sourceType: 'sample' };
  }

  return null;
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

export default function Live2DMascotStage({
  action = MASCOT_ACTIONS.idle,
  label = 'Fu Xiaoke Live2D mascot',
  modelSource = MASCOT_LIVE2D_MODEL_SOURCE,
  coreSource = MASCOT_LIVE2D_CORE_SOURCE,
  sampleModelSource = MASCOT_LIVE2D_SAMPLE_MODEL_SOURCE,
  sampleCoreSource = MASCOT_LIVE2D_SAMPLE_CORE_SOURCE,
  sampleFallbackEnabled = LIVE2D_SAMPLE_FALLBACK_ENABLED,
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
        const assetPair = await resolveLive2DAssetPair({
          coreSource,
          modelSource,
          sampleCoreSource,
          sampleModelSource,
          sampleFallbackEnabled,
        });
        if (!assetPair) {
          onLoadStateChange?.('fallback');
          return;
        }

        onLoadStateChange?.(assetPair.sourceType === 'sample' ? 'sample-loading' : 'loading');
        await loadScriptOnce(assetPair.coreSource);
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
        const model = await Live2DModel.from(assetPair.modelSource);
        if (cancelled) {
          model.destroy?.();
          app.destroy(false);
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
      appRef.current?.destroy(false, { children: true });
      appRef.current = null;
    };
  }, [coreSource, modelSource, onLoadStateChange, sampleCoreSource, sampleFallbackEnabled, sampleModelSource]);

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
