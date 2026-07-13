/*
 更新时间: 2026-07-13 20:30:00 CST
 更新内容: 新增 delivery 图标（版本与交付侧边导航入口），线性开箱轮廓，呼应现有描边图标风格。
*/
/*
 更新时间: 2026-07-08 13:28:16 CST
 更新内容: 将渠道图标改为来源节点汇入中心渠道节点的线性图形，提升渠道维护入口语义辨识度。
*/
/*
 更新时间: 2026-07-02 17:02:00 CST
 更新内容: 将图标名称列表改为组件静态属性，避免 Fast Refresh 命名导出提示。
*/
const ICON_PATHS = {
  overview: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.4" />
      <rect x="13" y="4" width="7" height="4.8" rx="1.4" />
      <rect x="4" y="13" width="7" height="7" rx="1.4" />
      <rect x="13" y="11.8" width="7" height="8.2" rx="1.4" />
    </>
  ),
  compute: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <rect x="9" y="9" width="6" height="6" rx="1.2" />
      <path d="M9 2.8v2.2M15 2.8v2.2M9 19v2.2M15 19v2.2M2.8 9h2.2M2.8 15h2.2M19 9h2.2M19 15h2.2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3" />
    </>
  ),
  cost: (
    <>
      <path d="M12 3v18" />
      <path d="M16.4 7.4c-.9-1.1-2.3-1.7-4.1-1.7-2.3 0-4 .9-4 2.6 0 4 8.1 2 8.1 6.4 0 1.8-1.7 3-4.2 3-2.1 0-3.8-.8-4.9-2.1" />
    </>
  ),
  organization: (
    <>
      <rect x="9" y="3.5" width="6" height="5" rx="1.2" />
      <rect x="4" y="15.5" width="6" height="5" rx="1.2" />
      <rect x="14" y="15.5" width="6" height="5" rx="1.2" />
      <path d="M12 8.5v3.4M7 15.5v-2.4h10v2.4" />
    </>
  ),
  channel: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="5.2" cy="6" r="2.1" />
      <circle cx="5.2" cy="18" r="2.1" />
      <circle cx="18.8" cy="12" r="2.1" />
      <path d="M7.1 7.1 9.3 9.2M7.1 16.9l2.2-2.1M15.2 12h1.5" />
    </>
  ),
  delivery: (
    <>
      <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" />
      <path d="M4 8l8 4.5L20 8M12 12.5V21" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.4" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 2.8v2.3M12 18.9v2.3M2.8 12h2.3M18.9 12h2.3M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6" />
    </>
  ),
  moon: (
    <path d="M19 15.2A7.6 7.6 0 0 1 8.8 5a7.7 7.7 0 1 0 10.2 10.2Z" />
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="5.8" />
      <path d="M15.2 15.2 20 20" />
    </>
  ),
  return: (
    <>
      <path d="M9 7 4 12l5 5" />
      <path d="M5 12h10.2c2.8 0 4.8 1.8 4.8 4.5V18" />
    </>
  ),
  close: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  send: (
    <>
      <path d="M20 4 10.7 20l-1.6-7.1L3 10.1 20 4Z" />
      <path d="M9.1 12.9 20 4" />
    </>
  ),
  stop: <rect x="7" y="7" width="10" height="10" rx="2" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m7 9 5 5 5-5" />,
  sortAsc: <path d="m8 14 4-4 4 4" />,
  sortDesc: <path d="m8 10 4 4 4-4" />,
  filter: (
    <>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </>
  ),
};

const APP_ICON_NAMES = Object.freeze(Object.keys(ICON_PATHS));

function AppIcon({
  name = 'overview',
  size = 18,
  strokeWidth = 1.8,
  title,
  decorative = true,
  className,
  ...props
}) {
  const icon = ICON_PATHS[name] ?? ICON_PATHS.overview;
  const ariaProps = title && !decorative
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': 'true' };

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...ariaProps}
      {...props}
    >
      {title && !decorative ? <title>{title}</title> : null}
      {icon}
    </svg>
  );
}

AppIcon.names = APP_ICON_NAMES;

export default AppIcon;
