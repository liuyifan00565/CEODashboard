/*
 更新时间: 2026-07-03 18:54:17 CST
 更新内容: 补充渠道完成进度条 80 以下红色、80-99 紫色、100 及以上金色三档断言。
*/
/*
 更新时间: 2026-07-03 18:31:29 CST
 更新内容: 渠道完成进度条统一改为 80% 以下风险色，不再豁免四个区域行。
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

test('uses red below 80, purple from 80 to 99, and gold at 100 percent or above', () => {
  assert.equal(
    channelCompletionBarBackground({ key: 'online', completion: 112 }, '#E7E2FF'),
    COLOR.goldGradient
  );
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
    COLOR.warnGradient
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'agent', completion: 55 }, '#E7E2FF'),
    COLOR.warnGradient
  );
});

test('keeps non-four-region rows on the original progress gradient rule', () => {
  assert.equal(
    channelCompletionBarBackground({ key: 'online-01', completion: 70 }, '#E7E2FF'),
    COLOR.warnGradient
  );
  assert.equal(
    channelCompletionBarBackground({ key: 'delivery-01', completion: 56 }, '#E7E2FF'),
    COLOR.warnGradient
  );
});

test('uses the red warning fill class whenever a channel row is under target', () => {
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'online', completion: 100 }), false);
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'south', completion: 80 }), false);
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'east', completion: 70 }), true);
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'east', warn: true }), true);
  assert.equal(shouldUseChannelCompletionWarnFill({ key: 'delivery-01', warn: true }), true);
});
