/*
 Update time: 2026-07-10 14:48:00 CST
 Update content: Cover bridge retargets that return to the currently visible action without a frame-zero jump.
*/
/*
 更新时间: 2026-07-10 13:01:00 CST
 更新内容: 增加 bridge 墙钟计时与快速重定向测试，防止一次性动作被截断或跨动作直跳。
*/
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildMascotMotionBridge,
  getMascotReducedMotionFrame,
  getMascotTimelineDuration,
  retargetMascotMotionBridge,
  resolveMascotTimeline,
  resolveMascotTimelineFromStart,
} from './mascotMotionTimeline.js';

const loopAnimation = Object.freeze({
  key: 'talk',
  sheetKey: 'talk',
  intensity: 'speech',
  loop: true,
  leadInFrameCount: 2,
  settleFrameCount: 2,
  reducedMotionFrame: 1,
  timeline: Object.freeze([
    Object.freeze({ frame: 0, durationMs: 100 }),
    Object.freeze({ frame: 1, durationMs: 200 }),
    Object.freeze({ frame: 2, durationMs: 100 }),
  ]),
});

test('resolves variable frame durations and loop counts', () => {
  assert.equal(getMascotTimelineDuration(loopAnimation.timeline), 400);
  assert.deepEqual(resolveMascotTimeline(loopAnimation, 250), {
    cursor: 1,
    frame: 1,
    loopCount: 0,
    finished: false,
    durationMs: 400,
  });
  assert.equal(resolveMascotTimeline(loopAnimation, 450).frame, 0);
  assert.equal(resolveMascotTimeline(loopAnimation, 450).loopCount, 1);
});

test('clamps one-shot timelines at the final frame', () => {
  const oneShot = { ...loopAnimation, loop: false };
  assert.deepEqual(resolveMascotTimeline(oneShot, 999), {
    cursor: 2,
    frame: 2,
    loopCount: 0,
    finished: true,
    durationMs: 400,
  });
});

test('uses a declared reduced-motion frame and falls back to the first frame', () => {
  assert.equal(getMascotReducedMotionFrame(loopAnimation), 1);
  assert.equal(getMascotReducedMotionFrame({ ...loopAnimation, reducedMotionFrame: 99 }), 0);
  assert.equal(getMascotReducedMotionFrame({ timeline: [] }), 0);
});

test('builds one-layer settle and lead-in bridge entries', () => {
  const nextAnimation = {
    ...loopAnimation,
    key: 'think',
    sheetKey: 'think',
    intensity: 'focus',
  };
  const bridge = buildMascotMotionBridge(loopAnimation, 2, nextAnimation);

  assert.deepEqual(bridge.timeline.map((entry) => entry.frame), [2, 1, 0, 1]);
  assert.equal(bridge.timeline[0].sheetKey, 'talk');
  assert.equal(bridge.timeline[0].actionKey, 'talk');
  assert.equal(bridge.timeline.at(-1).sheetKey, 'think');
  assert.equal(bridge.timeline.at(-1).actionKey, 'think');
  assert.equal(bridge.targetAction, 'think');
  assert.equal(bridge.targetCursor, 2);
  assert.ok(bridge.timeline.every((entry) => entry.durationMs >= 60 && entry.durationMs <= 120));
});

test('returns an empty bridge when the action and sheet are unchanged', () => {
  assert.equal(buildMascotMotionBridge(loopAnimation, 1, loopAnimation), null);
});

test('keeps a one-shot target on its original wall clock while a bridge plays', () => {
  const clickAnimation = {
    ...loopAnimation,
    key: 'click',
    sheetKey: 'click',
    loop: false,
    timeline: Object.freeze([
      Object.freeze({ frame: 0, durationMs: 200 }),
      Object.freeze({ frame: 1, durationMs: 300 }),
      Object.freeze({ frame: 2, durationMs: 400 }),
    ]),
  };
  const bridge = buildMascotMotionBridge(loopAnimation, 2, clickAnimation);
  const actionStartedAt = 1_000;
  const bridgeEndedAt = actionStartedAt + getMascotTimelineDuration(bridge.timeline);
  const caughtUp = resolveMascotTimelineFromStart(clickAnimation, actionStartedAt, bridgeEndedAt);

  assert.deepEqual(
    caughtUp,
    resolveMascotTimeline(clickAnimation, getMascotTimelineDuration(bridge.timeline)),
  );
  assert.equal(resolveMascotTimelineFromStart(clickAnimation, actionStartedAt, 1_900).finished, true);
});

test('retargets an active bridge from its current visible frame', () => {
  const thinkAnimation = {
    ...loopAnimation,
    key: 'think',
    sheetKey: 'think',
    intensity: 'focus',
  };
  const alertAnimation = {
    ...loopAnimation,
    key: 'alert',
    sheetKey: 'alert',
    intensity: 'alert',
  };
  const firstBridge = buildMascotMotionBridge(loopAnimation, 2, thinkAnimation);
  const currentCursor = 2;
  const currentFrame = firstBridge.timeline[currentCursor];
  const retargeted = retargetMascotMotionBridge(firstBridge, currentCursor, alertAnimation);

  assert.deepEqual(retargeted.timeline[0], currentFrame);
  assert.equal(retargeted.targetAction, 'alert');
  assert.ok(retargeted.timeline.slice(1).every((entry) => entry.actionKey === 'alert'));
});

test('retargets back to the currently visible action without returning null', () => {
  const thinkAnimation = {
    ...loopAnimation,
    key: 'think',
    sheetKey: 'think',
    intensity: 'focus',
  };
  const firstBridge = buildMascotMotionBridge(loopAnimation, 2, thinkAnimation);
  const currentCursor = 0;
  const currentFrame = firstBridge.timeline[currentCursor];
  const retargeted = retargetMascotMotionBridge(firstBridge, currentCursor, loopAnimation);

  assert.ok(retargeted);
  assert.deepEqual(retargeted.timeline[0], currentFrame);
  assert.equal(retargeted.targetAction, 'talk');
  assert.ok(retargeted.timeline.slice(1).every((entry) => entry.actionKey === 'talk'));
});
