/*
 更新时间: 2026-06-26 10:34:00
 更新内容: 新增版本卡片只保留版本明细并展示续费金额字段的回归测试。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { VERSIONS } from '../data/mock.js';

const source = readFileSync(new URL('./VersionFinancePanel.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./VersionFinancePanel.css', import.meta.url), 'utf8');

test('keeps VersionFinancePanel focused on version details only', () => {
  assert.doesNotMatch(source, /vf-finance/);
  assert.doesNotMatch(source, /vf-health/);
  assert.doesNotMatch(source, /createFinanceHealthOption/);
  assert.doesNotMatch(source, /import EChart/);
  assert.doesNotMatch(css, /\.vf-finance/);
  assert.doesNotMatch(css, /\.vf-health/);
});

test('shows six version rows with current renewal amount fields', () => {
  assert.deepEqual(
    VERSIONS.map((version) => version.name),
    ['启航版', '卓越版', '至尊版', '定制版', '试用版', '增购包']
  );

  for (const version of VERSIONS) {
    assert.equal(typeof version.currentRenewalDue, 'number', `${version.name} should have current due renewal amount`);
    assert.equal(typeof version.currentRenewalPaid, 'number', `${version.name} should have current paid renewal amount`);
    assert.equal(
      version.currentRenewalRate,
      version.currentRenewalDue ? +(version.currentRenewalPaid / version.currentRenewalDue * 100).toFixed(1) : 0
    );
  }

  assert.match(source, /当期应续费金额/);
  assert.match(source, /当期已续费金额/);
  assert.match(source, /当期续费率/);
});
