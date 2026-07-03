/*
 更新时间: 2026-07-03 11:09:47 CST
 更新内容: 抽出顶部搜索关键词匹配工具，供首页卡片复用。
*/
export function matchesSearchTerm(keywords, term) {
  if (!term) return false;
  const normalized = term.trim().toLowerCase();
  if (!normalized) return false;
  return keywords.some((keyword) => String(keyword).toLowerCase().includes(normalized));
}
