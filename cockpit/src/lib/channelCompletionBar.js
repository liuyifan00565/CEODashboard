/*
 更新时间: 2026-07-08 17:28:57 CST
 更新内容: 渠道完成进度条改为 120% 及以上才使用金色超额态，100%-119.9% 保持普通完成色。
*/
/*
 更新时间: 2026-07-03 18:19:59 CST
 更新内容: 四区域渠道进度条恢复 80% 以下风险色规则，所有渠道与交付进度统一语义。
*/
/*
 更新时间: 2026-07-03 17:51:36 CST
 更新内容: 新增四区域渠道进度条 warning fill class 判断，统一紫色时移除红色外发光。
 更新时间: 2026-07-03 17:50:36 CST
 更新内容: 回退四区域渠道完成进度条分色和低于 80% 红色预警规则，统一使用主题紫色渐变。
*/
import { progressGradient, isRiskCompletion } from './format.js';

const FOUR_REGION_CHANNEL_KEYS = new Set(['online', 'south', 'east', 'agent']);

export function isFourRegionChannel(channelKey) {
  return FOUR_REGION_CHANNEL_KEYS.has(channelKey);
}

export function channelCompletionBarBackground(row, midColor) {
  const pct = Number(row?.completion) || 0;
  const visualPct = pct >= 120 ? pct : Math.min(pct, 99.9);

  return progressGradient(visualPct, midColor);
}

export function shouldUseChannelCompletionWarnFill(row) {
  const pct = Number(row?.completion);
  return Boolean(row?.warn) || (Number.isFinite(pct) && isRiskCompletion(pct));
}
