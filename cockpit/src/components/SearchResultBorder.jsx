/*
 更新时间: 2026-07-03 10:59:56 CST
 更新内容: 抽出顶部搜索命中边框组件，供首页 KPI 卡和开户数卡片复用原定位效果。
*/
import ElectricBorder from './ElectricBorder/ElectricBorder';

export default function SearchResultBorder({ active, children }) {
  if (!active) return children;
  return (
    <ElectricBorder
      data-search-match="true"
      data-search-current="false"
      aria-label="搜索命中结果"
      color="#6000FF"
      speed={1}
      chaos={0.12}
      thickness={2}
      borderRadius={16}
      className="search-result-border"
      style={{ borderRadius: 16 }}
    >
      {children}
    </ElectricBorder>
  );
}
