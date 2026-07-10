/*
 更新时间: 2026-07-10 15:15:00 CST
 更新内容: 覆盖月度业绩、渠道排名、核心版本、局部缺数独立降级及零目标渠道排除。
*/
import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBusinessBrief } from './businessBrief.js';

const snapshot = {
  meta: { monthLabel: '2026年6月' },
  kpi: {
    monthRecovered: 441,
    monthTarget: 580,
  },
  derived: {
    monthCompletion: 76,
  },
  channels: [
    { key: 'online', name: '线上', recovered: 171, target: 240, completion: 71.3 },
    { key: 'south', name: '华南线下', recovered: 119, target: 110, completion: 108.2 },
    { key: 'east', name: '华东线下', recovered: 97, target: 120, completion: 80.8 },
    { key: 'agent', name: '代理', recovered: 54, target: 110, completion: 49.1 },
  ],
  versions: [
    { key: 'zhuoyue', name: '卓越版', price: 39800, units: 27 },
    { key: 'qihang', name: '启航版', price: 16800, units: 36 },
    { key: 'zhizun', name: '至尊版', price: 99800, units: 14 },
    { key: 'custom', name: '定制版', price: 188000, units: 8 },
    { key: 'addon', name: '增购包', price: 6800, units: 31 },
    { key: 'trial', name: '试用版', price: 0, units: 44 },
  ],
};

test('builds a factual CEO brief from monthly performance, channels, and core versions', () => {
  const brief = buildBusinessBrief(snapshot);

  assert.equal(
    brief.text,
    '本月回款 441 万，目标完成率 76%；线上回款最高，启航版客户数量最多。',
  );
  assert.equal(brief.primaryAction, 'performance');
  assert.deepEqual(
    brief.facts.map((fact) => ({ id: fact.id, target: fact.target })),
    [
      { id: 'performance', target: 'performance' },
      { id: 'channels', target: 'channels' },
      { id: 'versions', target: 'versions' },
    ],
  );
  assert.equal(brief.facts[0].text, '本月回款 441 万，目标 580 万，完成率 76%。');
  assert.equal(brief.facts[1].text, '线上回款最高 171 万；代理完成率最低 49.1%。');
  assert.equal(brief.facts[2].text, '启航版客户数量最多，共 36 套，占核心版本 42.4%。');
});

test('ignores trial and add-on rows when identifying the dominant core version', () => {
  const brief = buildBusinessBrief(snapshot);

  assert.match(brief.text, /启航版客户数量最多/);
  assert.doesNotMatch(brief.text, /试用版|增购包/);
});

test('falls back without inventing facts when the snapshot is incomplete', () => {
  assert.deepEqual(buildBusinessBrief({}), {
    text: '当前页面数据已加载，可点击查看经营分析。',
    facts: [],
    primaryAction: 'performance',
  });
});

test('keeps valid channel and version facts when performance fields are missing', () => {
  const brief = buildBusinessBrief({
    channels: snapshot.channels,
    versions: snapshot.versions,
  });

  assert.equal(brief.text, '线上回款最高，启航版客户数量最多。');
  assert.equal(brief.primaryAction, 'channels');
  assert.deepEqual(brief.facts.map((fact) => fact.id), ['channels', 'versions']);
});

test('excludes channels without a positive target from completion ranking', () => {
  const brief = buildBusinessBrief({
    ...snapshot,
    channels: [
      { key: 'untargeted', name: '未设目标', recovered: 200, target: 0, completion: 0 },
      ...snapshot.channels,
    ],
  });

  assert.equal(brief.facts[1].text, '未设目标回款最高 200 万；代理完成率最低 49.1%。');
  assert.doesNotMatch(brief.facts[1].text, /未设目标完成率最低/);
});
