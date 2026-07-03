/*
 更新时间: 2026-07-03 17:51:36 CST
 更新内容: 新增四区域渠道进度条 warning fill class 判断，统一紫色时移除红色外发光。
 更新时间: 2026-07-03 17:50:36 CST
 更新内容: 回退四区域渠道完成进度条分色和低于 80% 红色预警规则，统一使用主题紫色渐变。
*/
import { COLOR, progressGradient } from './format.js';

const FOUR_REGION_CHANNEL_KEYS = new Set(['online', 'south', 'east', 'agent']);

export function isFourRegionChannel(channelKey) {
  return FOUR_REGION_CHANNEL_KEYS.has(channelKey);
}

export function channelCompletionBarBackground(row, midColor) {
  const pct = Number(row?.completion) || 0;

  if (isFourRegionChannel(row?.key)) {
    return COLOR.goodGradient;
  }

  return progressGradient(pct, midColor);
}

export function shouldUseChannelCompletionWarnFill(row) {
  return Boolean(row?.warn) && !isFourRegionChannel(row?.key);
}
