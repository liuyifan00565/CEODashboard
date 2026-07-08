/*
 更新时间: 2026-07-08 16:57:24 CST
 更新内容: 顶部工具栏断言同步删除“更新数据”按钮，继续确认主题切换不在顶栏渲染。
*/
/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: 亮色主题回归测试同步银紫玫瑰 fallback、高级果味语义色与图表用途 token。
*/
/*
 更新时间: 2026-07-06 00:00:13 CST
 更新内容: 亮色主题金色守卫改为更灰、更低饱和的高级哑金。
*/
/*
 更新时间: 2026-07-05 15:29:01 CST
 更新内容: 主题回归测试同步低饱和风险色与更轻玻璃卡片 token。
*/
/*
 Update time: 2026-07-03 18:54:17 CST
 Update content: Require light theme progress tokens to expose purple mid-tier and gold target-tier colors.
*/
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
  assert.match(appSource, /<div className="dash-tools">\s*<ExpandableSearch[\s\S]*?onChange=\{setSearchTerm\}[\s\S]*?currentIndex=\{searchStats\.current\}[\s\S]*?totalResults=\{searchStats\.total\}[\s\S]*?onNext=\{jumpToNextSearchResult\}[\s\S]*?\/>\s*<\/div>/);
  assert.doesNotMatch(appSource, /aria-label="更新数据"/);
  assert.doesNotMatch(appSource, /<span>更新数据<\/span>/);
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

test('keeps silver-rose fruit accents aligned in light theme', () => {
  const block = lightThemeBlock();

  assert.match(block, /--accent-start:#8E86FF;/);
  assert.match(block, /--accent-mid:#B89CFF;/);
  assert.match(block, /--accent-end:#E4B8D7;/);
  assert.match(block, /--accent-line:#D9D1FF;/);
  assert.match(block, /--semantic-risk:#F06A8B;/);
  assert.match(block, /--semantic-goal:#C9A96B;/);
  assert.match(block, /--semantic-capacity:#7EA7FF;/);
  assert.match(block, /--chart-actual-bar-top:#B89CFF;/);
  assert.match(block, /--chart-target-bar:rgba\(31,42,68,\.13\);/);
  assert.match(block, /--brand-purple:#8E86FF;/);
  assert.match(block, /--brand-purple-2:#B89CFF;/);
  assert.match(block, /--brand-purple-3:#E4B8D7;/);
  assert.match(block, /--brand-lavender:#D9D1FF;/);
  assert.match(block, /--brand-mist:#F7F8FC;/);
  assert.match(block, /--brand-ice:#7EA7FF;/);
  assert.match(block, /--accent-gold:#9E7E42;/);
  assert.match(block, /--up:#8E86FF;/);
  assert.match(block, /--down:#D85476;/);
  assert.match(block, /--good:#7468E8;/);
  assert.match(block, /--warn:#D85476;/);
  assert.match(block, /--up-rgb:142,134,255;/);
  assert.match(block, /--down-rgb:216,84,118;/);
  assert.match(block, /--good-rgb:116,104,232;/);
  assert.match(block, /--warn-rgb:216,84,118;/);
  assert.match(block, /--bar-good:linear-gradient\(90deg,#7468E8 0%,#9C82F0 48%,#D7AFCF 100%\);/);
  assert.match(block, /--bar-warn:linear-gradient\(90deg,#B84E68 0%,#D85476 58%,#F19AAA 100%\);/);
  assert.match(block, /--bar-gold:linear-gradient\(90deg,#7D6233 0%,#9E7E42 58%,#C9A96B 100%\);/);
  assert.match(block, /--progress-mid:#7468E8;/);
  assert.match(block, /--progress-gold:#9E7E42;/);
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
