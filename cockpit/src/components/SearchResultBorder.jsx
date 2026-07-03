/*
 更新时间: 2026-07-03 15:37:00 CST
 更新内容: 搜索命中边框主色改为低饱和品牌紫，避免高饱和电竞紫。
*/
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
      color="#7C6CFF"
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
