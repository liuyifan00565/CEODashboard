/*
 更新时间: 2026-07-15 11:01:42 CST
 更新内容: 回归锁定广告 ROI 主数字组上移，保证 8.09 与费比大卡 25.2% 对齐。
*/
/*
 更新时间: 2026-07-15 11:32:00 CST
 更新内容: 回归锁定广告 ROI 与费比大卡主数字行使用相同高度比例。
*/
/*
 更新时间: 2026-07-15 11:28:00 CST
 更新内容: 回归同步 ROI 左置后更紧凑的三列宽度。
*/
/*
 更新时间: 2026-07-15 11:24:00 CST
 更新内容: 回归锁定广告 ROI 位于费比大卡左侧，并检查 ROI 竖卡专属样式。
*/
/*
 更新时间: 2026-07-15 11:20:00 CST
 更新内容: 回归同步广告 ROI 恢复后的三列宽度和费比卡内部紧凑列宽。
*/
/*
 更新时间: 2026-07-15 11:16:00 CST
 更新内容: 回归恢复广告 ROI 卡片，并同步 KPI 区三列布局。
*/
/*
 更新时间: 2026-07-15 11:12:00 CST
 更新内容: 回归同步右侧渠道百分数字再次收小后的字号。
*/
/*
 更新时间: 2026-07-15 11:04:00 CST
 更新内容: 回归同步右侧渠道百分数字收小后的字号。
*/
/*
 更新时间: 2026-07-15 10:59:00 CST
 更新内容: 回归同步右侧渠道标题与百分比居中对齐和标题字号。
*/
/*
 更新时间: 2026-07-15 10:56:00 CST
 更新内容: 回归锁定总投入费比标题左上角，以及渠道标题与百分比放大同排。
*/
/*
 更新时间: 2026-07-15 10:42:00 CST
 更新内容: 回归锁定费比大卡不再显示展开提示，并要求渠道百分比与渠道标题同排。
*/
/*
 更新时间: 2026-07-15 10:36:00 CST
 更新内容: 同步费比大卡左扩后的列宽断言。
*/
/*
 更新时间: 2026-07-15 10:32:00 CST
 更新内容: 回归锁定开户数上下堆叠、费比大卡右侧宽栏布局。
*/
/*
 更新时间: 2026-07-15 10:20:00 CST
 更新内容: 增加费比大卡布局回归，锁定总投入费比左栏、渠道费比右栏和中间竖线分隔。
*/
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const componentSource = readFileSync(new URL('./ChannelExpenseRatioCards.jsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('./ChannelExpenseRatioCards.css', import.meta.url), 'utf8');
const openingMetricCss = readFileSync(new URL('./OpeningMetricCards.css', import.meta.url), 'utf8');
const channelSourceCss = readFileSync(new URL('./ChannelSourcePanel.css', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');

test('renders channel expense ratios inside one large split card with a divider', () => {
  assert.match(componentSource, /channel-cost-card--combined/);
  assert.match(componentSource, /channel-cost-summary/);
  assert.match(componentSource, /channel-cost-divider/);
  assert.match(componentSource, /channel-cost-channel-grid/);
  assert.match(componentSource, /channel-cost-channel__head/);
  assert.match(componentSource, /channel-cost-channel__ratio/);
  assert.doesNotMatch(componentSource, /<div className="channel-cost-card__roi">点击展开二级/);

  assert.match(cssSource, /\.channel-cost-card--combined\s*{[^}]*grid-template-columns:\s*minmax\(140px,\s*\.72fr\)\s+1px\s+minmax\(0,\s*1\.68fr\)/s);
  assert.match(cssSource, /\.channel-cost-divider\s*{[^}]*width:\s*1px/s);
  assert.match(cssSource, /\.channel-cost-channel-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(cssSource, /\.channel-cost-channel__head\s*{[^}]*justify-content:\s*space-between/s);
  assert.match(cssSource, /\.channel-cost-channel__head\s*{[^}]*align-items:\s*center/s);
  assert.match(cssSource, /\.channel-cost-summary\s*{[^}]*grid-template-rows:\s*auto\s+1\.45fr\s+auto/s);
  assert.match(cssSource, /\.channel-cost-summary\s+\.channel-cost-card__title\s*{[^}]*justify-self:\s*start/s);
  assert.match(cssSource, /\.channel-cost-channel__head\s+\.channel-cost-card__title\s*{[^}]*font-size:\s*clamp\(15px,\s*1\.15vw,\s*17px\)/s);
  assert.match(cssSource, /\.channel-cost-channel__ratio\s+\.channel-cost-card__value\s*{[^}]*font-size:\s*clamp\(22px,\s*1\.8vw,\s*28px\)/s);
  assert.match(cssSource, /\.channel-cost-summary\s+\.channel-cost-card__value\s*{[^}]*font-size:\s*clamp\(38px,\s*3\.5vw,\s*52px\)/s);
});

test('keeps the cost card with channel ratios and restores the separate ad ROI tile', () => {
  assert.match(appSource, /<ChannelExpenseRatioCards[^>]*costCard={card}/);
  assert.match(appSource, /<AdRoiCard[^>]*costCard={card}/);
  assert.ok(appSource.indexOf('<AdRoiCard') < appSource.indexOf('<ChannelExpenseRatioCards'));
  assert.match(openingMetricCss, /\.opening-metric-card--roi\s*{[^}]*grid-template-rows:\s*auto\s+1\.45fr\s+auto/s);
  assert.match(openingMetricCss, /\.opening-metric-card--roi\s+\.opening-metric-card__main\s*{[^}]*transform:\s*translateY\(-15px\)/s);
  assert.match(openingMetricCss, /\.opening-metric-card--roi\s+\.opening-metric-card__trend\s*{[^}]*flex-direction:\s*row/s);
});

test('stacks opening metric cards vertically beside fee ratio and ad ROI columns', () => {
  assert.match(channelSourceCss, /\.dash-overview-kpis\s*{[^}]*grid-template-columns:\s*minmax\(188px,\s*\.38fr\)\s+minmax\(132px,\s*\.3fr\)\s+minmax\(0,\s*1\.32fr\)/s);
  assert.match(channelSourceCss, /\.dash-overview-kpis\s*>\s*\.opening-metric-cards\s*{[^}]*grid-template-columns:\s*1fr[^}]*grid-template-rows:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
});
