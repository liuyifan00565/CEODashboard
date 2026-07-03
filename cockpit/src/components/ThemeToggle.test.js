/*
 Update time: 2026-07-03 18:31:29 CST
 Update content: Align light theme guardrails with the graphite violet champagne palette and rose risk accents.
*/
/*
 Update time: 2026-07-03 16:51:07 CST
 Update content: Require light theme KPI warning accents to shift from light pink to deeper bright rose red.
*/
/*
 Update time: 2026-07-03 16:46:50 CST
 Update content: Require light theme KPI completion accents to use the brighter vivid progress tones.
*/
/*
 Update time: 2026-07-03 16:38:48 CST
 Update content: Require light theme KPI completion accents to use the brighter balanced progress tones.
*/
/*
 Update time: 2026-07-03 16:32:08 CST
 Update content: Require light theme KPI completion accents to use the deeper purple-blue and rose progress tones.
*/
/*
 Update time: 2026-07-03 15:42:00 CST
 Update content: Align light theme guardrails with the cold-purple Apple/Vision Pro brand palette.
*/
/*
 Update time: 2026-07-03 13:05:00 CST
 Update content: 亮色主题守卫断言改为冰蓝+粉紫新主题色。
*/
/*
 Update time: 2026-07-02 18:49:46 CST
 Update content: Expect the right toolbar to keep data maintenance immediately before expandable search.
*/
/*
 Update time: 2026-07-02 18:16:13 CST
 Update content: Align light theme assertions with the restored pink and fluorescent lime palette.
*/
/*
 Update time: 2026-07-02 17:18:50 CST
 Update content: Update toolbar search assertion for Word-style result navigation props.
*/
/*
 Update time: 2026-07-02 17:09:15 CST
 Update content: Align light theme accent assertions with the refined softer neon palette.
*/
/*
 Update time: 2026-07-02 16:43:57 CST
 Update content: Update top toolbar assertions after removing the visible theme toggle.
*/
/*
 更新时间: 2026-06-26 01:06:01
 更新内容: 将白天主题背景回归测试从 #D8F5D1 调整为更柔和的浅绿色 #E8FBE8。
*/
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const themeToggleUrl = new URL('./ThemeToggle.jsx', import.meta.url);
const appSource = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
const indexCss = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const kpiCardSource = readFileSync(new URL('./KpiCard.jsx', import.meta.url), 'utf8');
const kpiModalSource = readFileSync(new URL('./KpiModal.jsx', import.meta.url), 'utf8');
const monthlyTrendSource = readFileSync(new URL('./MonthlyTrend.jsx', import.meta.url), 'utf8');
const versionFinanceSource = readFileSync(new URL('./VersionFinancePanel.jsx', import.meta.url), 'utf8');

function lightThemeBlock() {
  const match = indexCss.match(/:root\[data-theme="light"\]\{(?<body>[\s\S]*?)\n\}/);
  assert.ok(match?.groups?.body, 'light theme block should exist');
  return match.groups.body;
}

test('defines a circular GlassSurface theme toggle with persistent theme state', () => {
  assert.ok(existsSync(themeToggleUrl), 'ThemeToggle.jsx should exist');

  const componentSource = readFileSync(themeToggleUrl, 'utf8');

  assert.match(componentSource, /export default function ThemeToggle/);
  assert.match(componentSource, /GlassSurface/);
  assert.match(componentSource, /width=\{54\}/);
  assert.match(componentSource, /height=\{54\}/);
  assert.match(componentSource, /borderRadius=\{27\}/);
  assert.match(componentSource, /localStorage/);
  assert.match(componentSource, /document\.documentElement\.dataset\.theme/);
  assert.match(componentSource, /aria-label=\{`切换到\$\{nextLabel\}主题`\}/);
});

test('does not render the theme toggle in the top toolbar', () => {
  assert.doesNotMatch(appSource, /import ThemeToggle from '\.\/components\/ThemeToggle';/);
  assert.doesNotMatch(appSource, /<ThemeToggle\s*\/>/);
  assert.match(appSource, /<div className="dash-tools">\s*<GlassSurface[\s\S]*?className="maintenance-glass"[\s\S]*?<\/GlassSurface>\s*<ExpandableSearch[\s\S]*?onChange=\{setSearchTerm\}[\s\S]*?currentIndex=\{searchStats\.current\}[\s\S]*?totalResults=\{searchStats\.total\}[\s\S]*?onNext=\{jumpToNextSearchResult\}[\s\S]*?\/>\s*<\/div>/);
});

test('provides dark and light theme variable contracts', () => {
  assert.match(indexCss, /:root\[data-theme="dark"\]/);
  assert.match(indexCss, /:root\[data-theme="light"\]/);
  assert.match(indexCss, /--theme-toggle-icon:/);
  assert.match(indexCss, /--theme-toggle-hover:/);
  assert.match(indexCss, /--color-scheme-value:/);
});

test('uses a fog white-blue light theme background with non-white text and chart variables', () => {
  const block = lightThemeBlock();

  assert.match(block, /--bg:#F3F6FA;/);
  assert.match(block, /--bg-noise-opacity:\.025;/);
  assert.match(block, /--chart-point-border:#F3F6FA;/);
  assert.doesNotMatch(block, /--txt:\s*#(?:fff|ffffff)\b/i);
  assert.doesNotMatch(block, /--muted:\s*#(?:fff|ffffff)\b/i);
  assert.doesNotMatch(block, /--faint:\s*#(?:fff|ffffff)\b/i);
  assert.match(block, /--chart-text:/);
  assert.match(block, /--chart-muted:/);
  assert.match(block, /--chart-grid:/);
  assert.match(block, /--chart-bar:/);
  assert.match(block, /--control-solid:/);
  assert.doesNotMatch(block, /--chart-(?:text|muted|grid|bar|bar-muted):\s*(?:#fff|#ffffff|rgba\(255,\s*255,\s*255)/i);
});

test('keeps graphite violet brand accents aligned in light theme', () => {
  const block = lightThemeBlock();

  assert.match(block, /--brand-purple:#8B7CFF;/);
  assert.match(block, /--brand-purple-2:#AFA6FF;/);
  assert.match(block, /--brand-purple-3:#D8D4FF;/);
  assert.match(block, /--brand-lavender:#D8D4FF;/);
  assert.match(block, /--brand-mist:#F7F8FC;/);
  assert.match(block, /--brand-ice:#8BD7FF;/);
  assert.match(block, /--accent-gold:#B78C32;/);
  assert.match(block, /--up:#6F62D8;/);
  assert.match(block, /--down:#D94D66;/);
  assert.match(block, /--good:#6F62D8;/);
  assert.match(block, /--warn:#D94D66;/);
  assert.match(block, /--up-rgb:111,98,216;/);
  assert.match(block, /--down-rgb:217,77,102;/);
  assert.match(block, /--good-rgb:111,98,216;/);
  assert.match(block, /--warn-rgb:217,77,102;/);
  assert.match(block, /--bar-good:linear-gradient\(90deg,#6F62D8 0%,#8B7CFF 56%,#C9C3FF 88%,#8BD7FF 100%\);/);
  assert.match(block, /--bar-warn:linear-gradient\(90deg,#AA2F45 0%,#D94D66 58%,#F07C8E 100%\);/);
});

test('charts and KPI progress bars read theme tokens instead of hard-coded white colors', () => {
  const chartSources = [kpiCardSource, kpiModalSource, monthlyTrendSource, versionFinanceSource].join('\n');

  assert.match(chartSources, /useThemeTokens/);
  assert.doesNotMatch(monthlyTrendSource, /const txt = '#ffffff'/);
  assert.doesNotMatch(monthlyTrendSource, /rgba\(255,255,255,\.(?:88|06|32|6)\)/);
  assert.doesNotMatch(versionFinanceSource, /textStyle:\s*\{\s*color:\s*'#fff'/);
  assert.doesNotMatch(kpiModalSource, /axisLabel:\s*\{\s*color:\s*'#ffffff'/);
  assert.doesNotMatch(kpiCardSource, /backgroundStyle:\s*\{\s*color:\s*'rgba\(255,255,255,.12\)'/);
});
