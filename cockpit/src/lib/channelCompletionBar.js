/*
 更新时间: 2026-07-03 16:57:57 CST
 更新内容: 新增四区域渠道完成进度条背景选择函数，达标沿用半环图渠道色，低于 80% 切换红色预警。
*/
import { COLOR, progressGradient } from './format.js';

export const CHANNEL_COMPLETION_BAR_GRADIENTS = {
  online: 'linear-gradient(90deg,#7C6CFF 0%,#A79CFF 55%,#D7D2FF 100%)',
  south: 'linear-gradient(90deg,#6ECFFF 0%,#9EDCFF 58%,#C9C2FF 100%)',
  east: 'linear-gradient(90deg,#5F78FF 0%,#8F86FF 58%,#B7AEFF 100%)',
  agent: 'linear-gradient(90deg,#6D28D9 0%,#8B5CF6 56%,#C084FC 100%)',
};

const FOUR_REGION_CHANNEL_KEYS = new Set(['online', 'south', 'east', 'agent']);

export function isFourRegionChannel(channelKey) {
  return FOUR_REGION_CHANNEL_KEYS.has(channelKey);
}

export function channelCompletionBarBackground(row, midColor) {
  const pct = Number(row?.completion) || 0;

  if (isFourRegionChannel(row?.key)) {
    return pct < 80 ? COLOR.warnGradient : CHANNEL_COMPLETION_BAR_GRADIENTS[row.key];
  }

  return progressGradient(pct, midColor);
}
