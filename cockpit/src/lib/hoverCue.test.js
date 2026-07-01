/*
 更新时间: 2026-07-01 11:19:49 CST
 更新内容: 新增鼠标悬浮 AI 气泡文本提取与缓存键测试，约束任意页面文字悬浮触发逻辑。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

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
