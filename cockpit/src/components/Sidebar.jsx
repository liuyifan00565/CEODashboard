/* 更新时间: 2026-07-05 16:12:00 CST  更新内容: 侧边导航恢复 220px 图标加文字分组结构，兼顾管理识别效率与轻玻璃质感。 */
/* 更新时间: 2026-07-03 23:39:28 CST  更新内容: 降低左侧导航玻璃容器的高光、模糊和折射强度。 */
/* 更新时间: 2026-07-02 16:28:00 CST  更新内容: 侧边导航改用统一 AppIcon 线性图标体系，移除字符占位图标。 */
import GlassSurface from './GlassSurface/GlassSurface'
import AppIcon from './AppIcon';
import './Sidebar.css'

function groupItemsBySection(items) {
  return items.reduce((sections, item) => {
    const title = item.section ?? '导航';
    let section = sections.find((candidate) => candidate.title === title);
    if (!section) {
      section = { title, items: [] };
      sections.push(section);
    }
    section.items.push(item);
    return sections;
  }, []);
}

export default function Sidebar({ items = [], active, onChange }) {
  const sections = groupItemsBySection(items);

  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={24}
      brightness={46}
      blur={12}
      displace={0.22}
      backgroundOpacity={0.052}
      distortionScale={-44}
      className="sb-glass"
    >
      <nav className="sb-root" aria-label="主导航">
        {sections.map((section) => (
          <section className="sb-section" key={section.title}>
            <span className="sb-section-title">{section.title}</span>
            <ul className="sb-list">
              {section.items.map((item) => (
                <li key={item.key} className="sb-list-item">
                  <button
                    type="button"
                    className={`sb-item${item.key === active ? ' sb-item--active' : ''}`}
                    onClick={() => onChange && onChange(item.key)}
                    aria-label={item.name}
                    title={item.name}
                    disabled={Boolean(item.disabled)}
                  >
                    <AppIcon name={item.icon ?? item.key} className="sb-icon" size={16} />
                    <span className="sb-name">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </GlassSurface>
  )
}
