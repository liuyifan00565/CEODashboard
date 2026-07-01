/*
 更新时间: 2026-07-01 14:11:25 CST
 更新内容: 删除悬浮气泡本地即时话术测试，约束截图中的目标信号句不再出现。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildHoverCueCacheKey,
  normalizeHoverCueText,
  shouldRequestHoverCue,
} from './hoverCue.js';

test('normalizes hovered text for compact AI bubble context', () => {
  const raw = '  本月\\n销售额   目标完成率 83.8%  ROI 5.06  ';

  assert.equal(normalizeHoverCueText(raw), '本月 销售额 目标完成率 83.8% ROI 5.06');
});

test('rejects empty and overly short hover text', () => {
  assert.equal(shouldRequestHoverCue(''), false);
  assert.equal(shouldRequestHoverCue('  '), false);
  assert.equal(shouldRequestHoverCue('A'), false);
  assert.equal(shouldRequestHoverCue('目标完成率'), true);
});

test('limits hover cue text so one noisy container cannot flood the model', () => {
  const longText = '销售维度'.repeat(80);

  assert.equal(normalizeHoverCueText(longText).length, 160);
});

test('builds a stable cache key per page context and hovered text', () => {
  const key = buildHoverCueCacheKey({
    activeMenu: 'overview',
    dim: 'month',
    channelKey: 'all',
    text: '目标完成率 83.8%',
  });

  assert.equal(key, 'overview|month|all|目标完成率 83.8%');
});

test('does not ship local instant hover bubble copy', () => {
  const source = readFileSync(new URL('./hoverCue.js', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /buildInstantHoverCue/);
  assert.doesNotMatch(source, /这处目标信号要先看缺口，再找最能补量的渠道。/);
  assert.doesNotMatch(source, /我先看这处文字|正在结合当前经营数据判断/);
});
