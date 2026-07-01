/*
 更新时间: 2026-07-01 11:19:49 CST
 更新内容: 新增页面文字悬浮 AI 气泡工具，负责文本清洗、触发判断和缓存键生成。
*/
export const MAX_HOVER_CUE_TEXT_LENGTH = 160;
export const MIN_HOVER_CUE_TEXT_LENGTH = 2;

export function normalizeHoverCueText(value = '') {
  return String(value)
    .replace(/\\[nr]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_HOVER_CUE_TEXT_LENGTH);
}

export function shouldRequestHoverCue(value = '') {
  return normalizeHoverCueText(value).length >= MIN_HOVER_CUE_TEXT_LENGTH;
}

export function buildHoverCueCacheKey({ activeMenu = '', dim = '', channelKey = '', text = '' } = {}) {
  return [
    activeMenu,
    dim,
    channelKey,
    normalizeHoverCueText(text),
  ].join('|');
}

export function getHoverCueTextFromElement(target) {
  if (!target || typeof target.closest !== 'function') return '';
  if (target.closest('.ai-widget')) return '';
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return '';

  const source = target.closest('[data-hover-cue-text]') || target;
  const explicitText = typeof source.getAttribute === 'function'
    ? source.getAttribute('data-hover-cue-text') || source.getAttribute('aria-label') || source.getAttribute('title')
    : '';

  return normalizeHoverCueText(explicitText || source.textContent || '');
}
