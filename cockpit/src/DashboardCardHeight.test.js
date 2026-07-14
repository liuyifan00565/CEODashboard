/*
 更新时间: 2026-07-14 11:20:00 CST
 更新内容: 行高下限断言从 146px 同步为 140px，匹配 dashboard.css 修复四张小卡边缘裁切时的调整。
*/
/*
 更新时间: 2026-07-13 23:00:00 CST
 更新内容: 低有效高度桌面档开户数行/投入行栏高回归断言从 .82fr/1.08fr 改为等分 minmax(146px,1fr) x2，
          延续开户数小卡不再被系统性挤扁的修复（与此前独立提交互不冲突，只是没同步这份新增测试文件）。
*/
/*
 更新时间: 2026-07-13 19:54:35 CST
 更新内容: 回归锁定版本情况洞察上移并裁掉截图白线以下的桌面端空白区域。
*/
/*
 更新时间: 2026-07-13 19:46:24 CST
 更新内容: 截图红线回归锁定保留当前内容尺寸，只移除底部区域并在新底边恢复圆角卡片形式。
*/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const dashboardCss = readFileSync(new URL('./dashboard.css', import.meta.url), 'utf8');
const overviewCss = readFileSync(new URL('./components/OperatingOverview.css', import.meta.url), 'utf8');

test('removes the annotated bottom strip without scaling content or changing columns', () => {
  assert.match(overviewCss, /\.op-month-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(330px, 1\.02fr\) minmax\(340px, \.8fr\) minmax\(330px, 1\.08fr\);/);
  assert.match(overviewCss, /\.op-recovery-structure\s*\{[\s\S]*?grid-template-rows:\s*auto 200px;/);
  assert.match(overviewCss, /@media \(min-width: 1181px\) and \(max-height: 1071px\) \{[\s\S]*?grid-template-rows:\s*auto 190px;[\s\S]*?height:\s*190px;/);

  assert.match(dashboardCss, /\.dash-secondary-grid\{[\s\S]*?--dash-secondary-content-height:clamp\(336px,34\.5vh,372px\);[\s\S]*?grid-template-columns:minmax\(0,1\.6fr\) minmax\(0,1fr\);[\s\S]*?grid-template-rows:calc\(var\(--dash-secondary-content-height\) - 14px\);/);
  assert.match(dashboardCss, /@media \(min-width:1181px\) and \(max-height:1071px\)\{[\s\S]*?--dash-secondary-content-height:clamp\(306px,32\.5vh,336px\);[\s\S]*?grid-template-rows:calc\(var\(--dash-secondary-content-height\) - 14px\);/);
  assert.match(dashboardCss, /grid-template-rows:repeat\(2,minmax\(140px,1fr\)\);/);
  assert.match(dashboardCss, /@media \(min-width:1181px\)\{[\s\S]*?\.dash-secondary-cell\{[\s\S]*?overflow:hidden;[\s\S]*?border-radius:0 0 16px 16px;/);
  assert.match(dashboardCss, /\.dash-secondary-cell::after\{[\s\S]*?border:1px solid var\(--dashboard-card-border\);[\s\S]*?border-radius:0 0 16px 16px;/);
  assert.match(dashboardCss, /\.dash-secondary-cell--trend \.mt-panel\{[\s\S]*?height:var\(--dash-secondary-content-height\);/);
  assert.match(dashboardCss, /\.dash-secondary-cell--finance \.dash-finance-kpis\{[\s\S]*?height:100%;/);
  assert.match(dashboardCss, /@media \(min-width:2200px\) and \(min-height:1300px\)\{[\s\S]*?--dash-secondary-content-height:396px;[\s\S]*?grid-template-rows:382px;/);
});

test('moves the version insight up and crops the annotated bottom strip', () => {
  assert.match(dashboardCss, /\.dash-version-row \.vf-insight\{[\s\S]*?left:22px;[\s\S]*?bottom:10px;/);
  assert.match(dashboardCss, /@media \(min-width:1181px\)\{[\s\S]*?\.dash-version-row \.vf-panel\{[\s\S]*?height:262px;[\s\S]*?min-height:262px;[\s\S]*?overflow:hidden;/);
});
