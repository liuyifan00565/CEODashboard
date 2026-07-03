/*
 更新时间: 2026-07-03 17:51:20 CST
 更新内容: 补充四区域渠道完成进度条不挂红色 warning fill class 的回归测试，避免统一紫色时残留红色外发光。
 更新时间: 2026-07-03 17:50:16 CST
 更新内容: 回退四区域渠道完成进度条分色和红色预警规则，要求统一使用主题紫色渐变。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLOR } from './format.js';
import {
  channelCompletionBarBackground,
  shouldUseChannelCompletionWarnFill,
} from './channelCompletionBar.js';

test('uses the unified theme purple gradient for the four regional channel rows', () => {
  assert.equal(
    channelCompletionBarBackground({ key: 'online', completion: 87.5 }, '#E7E2FF'),
    COLOR.goodGradient
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'south', completion: 80 }, '#E7E2FF'),
    COLOR.goodGradient
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'east', completion: 70 }, '#E7E2FF'),
    COLOR.goodGradient
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'agent', completion: 55 }, '#E7E2FF'),
    COLOR.goodGradient
  );
});

test('keeps non-four-region rows on the original progress gradient rule', () => {
  assert.equal(
    channelCompletionBarBackground({ key: 'online-01', completion: 70 }, '#E7E2FF'),
    '#E7E2FF'
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'delivery-01', completion: 56 }, '#E7E2FF'),
    COLOR.warnGradient
  );
});

test('does not keep the red warning fill class on four regional channel bars', () => {
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'east', warn: true }), false);
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'delivery-01', warn: true }), true);
});
