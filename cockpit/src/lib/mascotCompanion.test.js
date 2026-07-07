/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 增加 AI 小人 guide 指引动作枚举测试，约束点击打开对话框时使用独立动作语义。
*/
/*
 更新时间: 2026-07-01 10:03:00
 更新内容: 新增福小客桌宠对话与动作策略测试，约束随机问候和卡片点击反馈。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MASCOT_ACTIONS,
  buildCardCompanionCue,
  getIdleCompanionCue,
  getSpeechAction,
} from './mascotCompanion.js';

test('defines a dedicated guide action for pointing users to the AI dialog', () => {
  assert.equal(MASCOT_ACTIONS.guide, 'guide');
});

test('cycles through friendly idle prompts for Fu Xiaoke', () => {
  assert.equal(getIdleCompanionCue(0).text, '您好，我是福小客，有什么可以帮助您的吗？');
  assert.equal(getIdleCompanionCue(1).text, '我在旁边看着经营数据，有异常会提醒您。');
  assert.equal(getIdleCompanionCue(4).text, '您好，我是福小客，有什么可以帮助您的吗？');
  assert.equal(getIdleCompanionCue(0).action, MASCOT_ACTIONS.wave);
});

test('uses alert motion and gap language for weak completion KPI cards', () => {
  const cue = buildCardCompanionCue({
    title: '本月目标完成情况',
    key: 'month',
    value: 486,
    unit: '万',
    progress: 83.8,
    gap: 94,
  });

  assert.equal(cue.action, MASCOT_ACTIONS.alert);
  assert.equal(cue.text, '本月目标完成情况完成率 83.8%，还差 94 万。我建议先看拖后腿的渠道。');
});

test('uses think motion for high cost ratio cards', () => {
  const cue = buildCardCompanionCue({
    title: '总投入 · 费比',
    key: 'cost',
    displayValue: 32.1,
    displayUnit: '%',
    progress: 32.1,
  });

  assert.equal(cue.action, MASCOT_ACTIONS.think);
  assert.equal(cue.text, '总投入 · 费比现在是 32.1%，我建议顺手看看 ROI 和投放结构。');
});

test('uses celebration motion when KPI progress is healthy', () => {
  const cue = buildCardCompanionCue({
    title: '当期续费率',
    key: 'renewal',
    displayValue: 88.8,
    displayUnit: '%',
    progress: 88.8,
  });

  assert.equal(cue.action, MASCOT_ACTIONS.celebrate);
  assert.equal(cue.text, '当期续费率表现不错，当前 88.8%。我可以继续帮您拆解明细。');
});

test('maps speech text to a companion action', () => {
  assert.equal(getSpeechAction('这个指标有落后预警，需要关注。'), MASCOT_ACTIONS.alert);
  assert.equal(getSpeechAction('这个表现不错，可以庆祝一下。'), MASCOT_ACTIONS.celebrate);
  assert.equal(getSpeechAction('我建议先看费用结构。'), MASCOT_ACTIONS.think);
  assert.equal(getSpeechAction('普通经营提示'), MASCOT_ACTIONS.talk);
});
