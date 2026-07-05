/*
 更新时间: 2026-07-06 00:00:23 CST
 更新内容: 搜索命中组件改为始终保留稳定外壳，并支持传入布局类名避免搜索时改变卡片排布。
*/
/*
 更新时间: 2026-07-04 00:23:37 CST
 更新内容: 搜索命中反馈改为一次性柔光高亮，移除持续电流边框动画。
*/
/*
 更新时间: 2026-07-03 15:37:00 CST
 更新内容: 搜索命中边框主色改为低饱和品牌紫，避免高饱和电竞紫。
*/
/*
 更新时间: 2026-07-03 10:59:56 CST
 更新内容: 抽出顶部搜索命中边框组件，供首页 KPI 卡和开户数卡片复用原定位效果。
*/
/*
 更新时间: 2026-07-03 18:19:59 CST
 更新内容: 搜索命中边框同步为黑曜石月光紫主品牌色。
*/

export default function SearchResultBorder({ active, children, className = '' }) {
  const wrapperClassName = ['search-result-border', className].filter(Boolean).join(' ');

  return (
    <div
      data-search-match={active ? 'true' : undefined}
      data-search-current={active ? 'false' : undefined}
      aria-label={active ? '搜索命中结果' : undefined}
      className={wrapperClassName}
    >
      <div className="search-result-border__content">{children}</div>
    </div>
  );
}
