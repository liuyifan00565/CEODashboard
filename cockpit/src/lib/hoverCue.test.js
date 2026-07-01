/*
 更新时间: 2026-07-01 11:35:33 CST
 更新内容: 新增即时悬浮气泡测试，约束鼠标停留文字时先快速显示本地提示再等待千问精修。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildInstantHoverCue,
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

test('builds an instant local cue so the mascot responds before Qwen returns', () => {
  assert.equal(
    buildInstantHoverCue('ROI 5.06 目标完成率 83.8%'),
    '先看 ROI 与目标完成率，判断这处投入是否值得加码。'
  );
  assert.equal(
    buildInstantHoverCue('续费率 70%'),
    '这处续费信号建议先看流失风险和可挽回金额。'
  );
  assert.equal(
    buildInstantHoverCue('随机说明文字'),
    '我先看这处文字，正在结合当前经营数据判断。'
  );
});
