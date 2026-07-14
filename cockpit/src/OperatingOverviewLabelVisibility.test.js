/* 更新时间: 2026-07-14 16:52:12 CST  更新内容: 回归测试锁定回款结构半环所有有值真实渠道均显示外部标签，且引导折线保持短线段。 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const sourcePath = fileURLToPath(new URL('./components/OperatingOverview.jsx', import.meta.url));
const source = readFileSync(sourcePath, 'utf8');

test('shows labels for every valued recovery channel slice', () => {
  assert.match(source, /const CHANNEL_LABEL_EDGE_DISTANCE = '20%';/);
  assert.match(source, /const MINOR_LABEL_EDGE_DISTANCE = '18%';/);
  assert.match(source, /const INCOMPLETE_LABEL_EDGE_DISTANCE = '24%';/);
  assert.match(source, /length2:\s*8,/);
  assert.match(source, /const isChannelLabel = !item\.isIncomplete && !item\.isEmpty && Number\(item\.value\) > 0;/);
  assert.match(source, /const isMinorLabel = isChannelLabel && index >= 2;/);
  assert.match(source, /show: isChannelLabel \|\| isIncompleteLabel,/);
  assert.match(source, /\.\.\.\(isChannelLabel \? \{ edgeDistance: isMinorLabel \? MINOR_LABEL_EDGE_DISTANCE : CHANNEL_LABEL_EDGE_DISTANCE \} : \{\}\),/);
});
