/*
 更新时间: 2026-07-03 16:57:27 CST
 更新内容: 新增四区域渠道完成进度条颜色规则测试，要求达标沿用半环图渠道色、未达 80% 用红色、非四区域保持原色。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLOR } from './format.js';
import {
  CHANNEL_COMPLETION_BAR_GRADIENTS,
  channelCompletionBarBackground,
} from './channelCompletionBar.js';

test('uses recovery pie colors for the four regional channel rows once completion reaches 80 percent', () => {
  assert.equal(
    channelCompletionBarBackground({ key: 'online', completion: 87.5 }, '#E7E2FF'),
    CHANNEL_COMPLETION_BAR_GRADIENTS.online
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'south', completion: 80 }, '#E7E2FF'),
    CHANNEL_COMPLETION_BAR_GRADIENTS.south
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'agent', completion: 96 }, '#E7E2FF'),
    CHANNEL_COMPLETION_BAR_GRADIENTS.agent
  );
});

test('uses the warning red gradient only when a four-region channel row is below 80 percent', () => {
  assert.equal(
    channelCompletionBarBackground({ key: 'east', completion: 70 }, '#E7E2FF'),
    COLOR.warnGradient
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
