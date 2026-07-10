/*
 更新时间: 2026-07-10 12:09:00 CST
 更新内容: 新增福小客非匀速时间线、减少动态代表帧与单层动作衔接的测试。
*/
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildMascotMotionBridge,
  getMascotReducedMotionFrame,
  getMascotTimelineDuration,
  resolveMascotTimeline,
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
