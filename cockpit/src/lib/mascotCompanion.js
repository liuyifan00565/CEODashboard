/*
 更新时间: 2026-07-01 10:06:00
 更新内容: 新增福小客桌宠对话与动作策略，支持随机问候和 KPI 点击反馈。
*/
export const MASCOT_ACTIONS = Object.freeze({
  idle: 'idle',
  wave: 'wave',
  talk: 'talk',
  think: 'think',
  alert: 'alert',
  celebrate: 'celebrate',
  click: 'click',
});

const IDLE_CUES = [
  { text: '您好，我是福小客，有什么可以帮助您的吗？', action: MASCOT_ACTIONS.wave },
  { text: '我在旁边看着经营数据，有异常会提醒您。', action: MASCOT_ACTIONS.talk },
  { text: '可以点我，我会把当前页面数据整理成经营分析。', action: MASCOT_ACTIONS.think },
  { text: '今天也一起把目标缺口盯紧一点。', action: MASCOT_ACTIONS.talk },
];

function valueLabel(card) {
  const value = card.displayValue ?? card.value;
  const unit = card.displayUnit ?? card.unit ?? '';
  return `${value}${unit === '%' || unit === 'x' ? unit : unit ? ` ${unit}` : ''}`;
}

function progressLabel(card) {
  if (card.progress == null) return valueLabel(card);
  return `${card.progress}%`;
}

export function getIdleCompanionCue(index = 0) {
  const normalizedIndex = Math.abs(Number(index) || 0) % IDLE_CUES.length;
  return IDLE_CUES[normalizedIndex];
}

export function getSpeechAction(text = '') {
  if (/预警|落后|缺口|还差|异常/.test(text)) return MASCOT_ACTIONS.alert;
  if (/不错|庆祝|完成|达成|领先/.test(text)) return MASCOT_ACTIONS.celebrate;
  if (/建议|分析|看看|拆解|结构/.test(text)) return MASCOT_ACTIONS.think;
  return MASCOT_ACTIONS.talk;
}

export function buildCardCompanionCue(card) {
  if (!card) {
    return getIdleCompanionCue(0);
  }

  if (card.key === 'cost') {
    return {
      action: MASCOT_ACTIONS.think,
      text: `${card.title}现在是 ${valueLabel(card)}，我建议顺手看看 ROI 和投放结构。`,
    };
  }

  if (card.progress != null && card.progress < 85 && card.gap != null) {
    return {
      action: MASCOT_ACTIONS.alert,
      text: `${card.title}完成率 ${progressLabel(card)}，还差 ${card.gap} 万。我建议先看拖后腿的渠道。`,
    };
  }

  if (card.progress != null && card.progress >= 85) {
    return {
      action: MASCOT_ACTIONS.celebrate,
      text: `${card.title}表现不错，当前 ${progressLabel(card)}。我可以继续帮您拆解明细。`,
    };
  }

  return {
    action: MASCOT_ACTIONS.think,
    text: `您正在查看${card.title}，当前是 ${valueLabel(card)}。需要的话我可以继续分析原因。`,
  };
}
