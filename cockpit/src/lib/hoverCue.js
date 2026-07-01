/*
 更新时间: 2026-07-01 12:30:19 CST
 更新内容: 普通悬浮文字不再显示默认读字气泡话术，仅保留命中业务关键词的即时提示。
*/
export const MAX_HOVER_CUE_TEXT_LENGTH = 160;
export const MIN_HOVER_CUE_TEXT_LENGTH = 2;

const INSTANT_HOVER_CUES = [
  {
    pattern: /\broi\b|投入|预算|投放/i,
    cue: '先看 ROI 与目标完成率，判断这处投入是否值得加码。',
  },
  {
    pattern: /续费|流失|留存|复购/,
    cue: '这处续费信号建议先看流失风险和可挽回金额。',
  },
  {
    pattern: /目标|完成率|达成|回款/,
    cue: '这处目标信号要先看缺口，再找最能补量的渠道。',
  },
  {
    pattern: /成本|费比|费用|毛利/,
    cue: '这处成本信号建议和回款效率一起判断。',
  },
  {
    pattern: /销售|渠道|代理|线索/,
    cue: '这处销售维度可以先看贡献、转化和拖后腿项。',
  },
  {
    pattern: /交付|实施|工单|知识库/,
    cue: '这处交付数据要结合人效、单价和目标完成看。',
  },
];

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

export function buildInstantHoverCue(text = '') {
  const normalizedText = normalizeHoverCueText(text);
  const matchedRule = INSTANT_HOVER_CUES.find((rule) => rule.pattern.test(normalizedText));

  return matchedRule?.cue || '';
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
