/*
 更新时间: 2026-07-03 16:02:00 CST
 更新内容: 提高 ReactBits Color Bends 的亮度、饱和感与带状存在感，回应参考组件需要更明显可感知的要求。
*/
/*
 更新时间: 2026-07-03 15:31:00 CST
 更新内容: 将全屏背景从 ReactBits Silk 切换为低速冷紫 Color Bends 环境光层，并保留深色遮罩保证数据可读性。
*/
/*
 更新时间: 2026-07-03 13:42:00 CST
 更新内容: 移除 DotField 紫色点阵背景，背景改为深海蓝黑渐变 + 多层径向光 + SVG 噪点（详见 index.css）。
*/
/*
 更新时间: 2026-07-03 10:59:56 CST
 更新内容: 顶部搜索支持定位首页开户数卡片，并复用原搜索命中边框效果。
*/
/*
 更新时间: 2026-07-03 10:47:37 CST
 更新内容: 去除顶部数据维护/返回主界面按钮左侧图标，并收窄按钮玻璃宽度。
*/
/*
 更新时间: 2026-07-03 09:48:16 CST
 更新内容: 收窄顶部品牌玻璃胶囊宽度，减少右侧留白。
*/
/*
 Update time: 2026-07-02 18:49:46 CST
 Update content: Move the data maintenance switch into the right toolbar before search and match the expanded search pill radius.
*/
/*
 更新时间: 2026-07-02 18:10:27 CST
 更新内容: 合并 GitHub 数据维护页面与本地品牌、搜索和顶部栏改动。
*/
/*
 Update time: 2026-07-02 17:18:50 CST
 Update content: Add Word-style search result counting, Enter cycling, and current hit marking.
*/
/*
 Update time: 2026-07-02 17:13:39 CST
 Update content: Change the top brand title to 福客经营驾驶舱 and the overview subtitle to CEO视角.
*/
/*
 Update time: 2026-07-02 16:43:06 CST
 Update content: Remove the top toolbar date, dimension, and theme controls while keeping search.
*/
/*
 Update time: 2026-07-02 15:53:58 CST
 Update content: Use MetallicPaint with the black PNG logo in the top brand area.
*/
/*
 更新时间: 2026-07-02 15:13:35 CST
 更新内容: 首页右侧财务卡片区移除续费率，将开户数上移到原总投入位置，总投入下移到原续费率位置。
*/
/*
 更新时间: 2026-07-02 16:25:57 CST
 更新内容: 数据维护模式接入目标、成本、组织、渠道四个独立维护界面。
*/
/*
 Update time: 2026-07-02 18:16:13 CST
 Update content: Restore DotField to solid purple background dots.
*/
import { useMemo, useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

import AIAnalysisWidget from './components/AIAnalysisWidget';
import ColorBends from './components/ColorBends/ColorBends';
import GlassSurface from './components/GlassSurface/GlassSurface';
import Sidebar from './components/Sidebar';
import ExpandableSearch from './components/ExpandableSearch';
import SearchResultBorder from './components/SearchResultBorder';
import MetallicPaint from './components/MetallicPaint/MetallicPaint';
import KpiCard from './components/KpiCard';
import KpiModal from './components/KpiModal';
import MonthlyTrend from './components/MonthlyTrend';
import ChannelPanel from './components/ChannelPanel';
import VersionFinancePanel from './components/VersionFinancePanel';
import DeliveryPanel from './components/DeliveryPanel';
import ComputeUsagePage from './components/ComputeUsagePage';
import OpeningMetricCards from './components/OpeningMetricCards';
import MaintenancePage from './components/MaintenancePage';

import { META, MENU, MAINTENANCE_MENU, getDashboardChannelKey, getDashboardMenuLabel } from './data/mock';
import { DEFAULT_FILTER_RANGE, getFilteredKpiCards } from './lib/filterKpiCards';
import { buildCardCompanionCue } from './lib/mascotCompanion';
import { matchesSearchTerm } from './lib/searchMatch';
import { useThemeTokens } from './lib/theme';
import './dashboard.css';

const DEFAULT_MAINTENANCE_MENU = MAINTENANCE_MENU[0]?.key ?? 'target-maintenance';

// 各主体面板的搜索关键字
const PANEL_KEYWORDS = {
  trend: ['趋势', '月度', '回款', '目标', '完成率'],
  sales: ['销售', '线上', '线下', '代理', '战区', '华南', '华东'],
  version: ['版本', '启航', '卓越', '至尊', '财务', '健康', '应收', '广告', '缺口', '续费'],
  delivery: ['交付', '实施', '配置', '知识库', '人效'],
};

function recoveryChannelTitle(card) {
  return card.key === 'year' ? '本年渠道完成情况' : '本月渠道完成情况';
}

function makeCompanionCueId(card) {
  return `${card?.key ?? 'card'}-${Date.now()}`;
}

export default function App() {
  const { theme } = useThemeTokens();
  const [activeMenu, setActiveMenu] = useState('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [activeMaintenanceMenu, setActiveMaintenanceMenu] = useState(DEFAULT_MAINTENANCE_MENU);
  const dim = 'month';
  const dateRange = DEFAULT_FILTER_RANGE;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStats, setSearchStats] = useState({ current: 0, total: 0 });
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [openCard, setOpenCard] = useState(null);
  const [companionCue, setCompanionCue] = useState(null);

  const gridRef = useRef(null);
  const pendingMenuScrollRef = useRef(false);
  const pendingSearchScrollRef = useRef(false);
  const isMaintenancePage = maintenanceMode;
  const isComputePage = activeMenu === 'compute';
  const showOpeningMetrics = activeMenu === 'overview';
  const activeChannelKey = getDashboardChannelKey(activeMenu);
  const activeMenuLabel = getDashboardMenuLabel(activeMenu);
  const activeContextLabel = maintenanceMode
    ? '数据维护'
    : activeMenu === 'overview' ? 'CEO视角' : activeMenuLabel;
  const sidebarItems = maintenanceMode ? MAINTENANCE_MENU : MENU;
  const sidebarActive = maintenanceMode ? activeMaintenanceMenu : activeMenu;
  const contentKey = maintenanceMode ? activeMaintenanceMenu : activeMenu;
  const gridClassName = activeMenu === 'overview'
    ? 'dash-grid dash-grid--overview'
    : `dash-grid dash-grid--overview dash-grid--${activeMenu}`;
  const filteredKpiCards = useMemo(
    () => getFilteredKpiCards({ dim, dateRange, channel: activeChannelKey }),
    [dim, dateRange, activeChannelKey]
  );
  const recoveryKpiCards = filteredKpiCards.filter((card) => ['month', 'year'].includes(card.key));
  const financeKpiCards = filteredKpiCards.filter((card) => card.key === 'cost');
  const openCardData = useMemo(
    () => filteredKpiCards.find((card) => card.key === openCard?.key) ?? openCard ?? null,
    [filteredKpiCards, openCard]
  );

  function scrollDashboardIntoView() {
    pendingMenuScrollRef.current = false;
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleMenuChange(nextMenu) {
    pendingMenuScrollRef.current = true;
    setActiveMenu(nextMenu);

    if (nextMenu === activeMenu) {
      requestAnimationFrame(scrollDashboardIntoView);
    }
  }

  function handleSidebarChange(nextMenu) {
    if (maintenanceMode) {
      setActiveMaintenanceMenu(nextMenu);
      return;
    }

    handleMenuChange(nextMenu);
  }

  function handleMaintenanceBack() {
    setMaintenanceMode(false);
    setActiveMenu('overview');
    setActiveMaintenanceMenu(DEFAULT_MAINTENANCE_MENU);
  }

  function handleMaintenanceModeToggle() {
    if (maintenanceMode) {
      setMaintenanceMode(false);
      setActiveMenu('overview');
      setActiveMaintenanceMenu(DEFAULT_MAINTENANCE_MENU);
      return;
    }

    setMaintenanceMode(true);
    setActiveMaintenanceMenu(DEFAULT_MAINTENANCE_MENU);
  }

  function handleOpenCard(card) {
    setOpenCard(card);
    setCompanionCue({
      ...buildCardCompanionCue(card),
      id: makeCompanionCueId(card),
    });
  }

  function jumpToNextSearchResult() {
    if (!searchStats.total) return;
    pendingSearchScrollRef.current = true;
    setActiveSearchIndex((index) => (index + 1) % Math.max(searchStats.total, 1));
  }

  useLayoutEffect(() => {
    pendingSearchScrollRef.current = Boolean(searchTerm.trim());
    setActiveSearchIndex(0);
  }, [searchTerm, contentKey]);

  useLayoutEffect(() => {
    const root = gridRef.current;
    if (!root) return;

    root.querySelectorAll('[data-search-current]').forEach((node) => {
      node.removeAttribute('data-search-current');
    });

    if (!searchTerm.trim()) {
      pendingSearchScrollRef.current = false;
      setSearchStats((stats) => (stats.current === 0 && stats.total === 0 ? stats : { current: 0, total: 0 }));
      return;
    }

    const matches = Array.from(root.querySelectorAll('[data-search-match="true"]'));
    const total = matches.length;
    const currentIndex = total ? activeSearchIndex % total : -1;

    matches.forEach((node, index) => {
      node.dataset.searchCurrent = index === currentIndex ? 'true' : 'false';
    });

    setSearchStats((stats) => {
      const next = { current: total ? currentIndex + 1 : 0, total };
      return stats.current === next.current && stats.total === next.total ? stats : next;
    });

    if (total && pendingSearchScrollRef.current) {
      matches[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
    pendingSearchScrollRef.current = false;
  }, [searchTerm, activeSearchIndex, contentKey, isComputePage, filteredKpiCards]);

  // GSAP 入场：KPI 卡 + 面板 stagger fade-up（菜单切换时重放）
  useLayoutEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    let scrollFrame = 0;
    if (pendingMenuScrollRef.current) {
      scrollFrame = requestAnimationFrame(scrollDashboardIntoView);
    }
    const targets = root.querySelectorAll('[data-anim]');
    if (!targets.length) {
      return () => {
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
      };
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }
      );
    }, root);
    return () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      ctx.revert();
    };
  }, [contentKey]);

  return (
    <div className="app">
      <div className="bg">
        {/* ReactBits Color Bends 只做 Vision Pro 风格环境光层，前景可读性由遮罩控制 */}
        {theme === 'dark' && (
          <>
            <ColorBends
              colors={['#4C2BBF', '#7C6CFF', '#A855F7', '#E7E2FF']}
              speed={0.055}
              transparent={false}
              rotation={92}
              autoRotate={0.24}
              scale={0.88}
              frequency={1.05}
              warpStrength={1.02}
              mouseInfluence={0.04}
              parallax={0.08}
              noise={0.06}
              iterations={3}
              intensity={1.75}
              bandWidth={7}
              className="color-bends-layer"
            />
            <div className="bg-shade" aria-hidden="true" />
          </>
        )}
      </div>

      <div className="dash-shell">
        <aside className="dash-aside">
          <Sidebar items={sidebarItems} active={sidebarActive} onChange={handleSidebarChange} />
          <AIAnalysisWidget activeMenu={activeMenu} dim={dim} channelKey={activeChannelKey} companionCue={companionCue} />
        </aside>

        <div className="dash-main">
          <header className="dash-topbar">
            <GlassSurface
              width={240}
              height={52}
              borderRadius={16}
              brightness={58}
              blur={12}
              displace={1}
              backgroundOpacity={0.06}
              distortionScale={-130}
              className="brand-glass"
            >
              <div className="brand">
                <span className="brand-logo-paint" aria-hidden="true">
                  <MetallicPaint
                    imageSrc="/logo-black.png"
                    seed={64}
                    scale={3.6}
                    refraction={0.018}
                    blur={0.014}
                    liquid={0.68}
                    speed={0.28}
                    brightness={1.75}
                    contrast={0.8}
                    fresnel={1.2}
                    lightColor="#ffffff"
                    darkColor="#050505"
                    tintColor="#d7fbff"
                    chromaticSpread={1.8}
                    distortion={0.75}
                    contour={0.28}
                  />
                </span>
                <div className="brand-copy">
                  <b>福客经营驾驶舱</b>
                  <small>{META.monthLabel}｜{activeContextLabel}</small>
                </div>
              </div>
            </GlassSurface>
            <div className="dash-tools">
              <GlassSurface
                width={126}
                height={54}
                borderRadius={27}
                brightness={58}
                blur={12}
                displace={1}
                backgroundOpacity={0.06}
                distortionScale={-130}
                className="maintenance-glass"
              >
                <button
                  type="button"
                  className={`dash-maintenance-switch${maintenanceMode ? ' dash-maintenance-switch--active' : ''}`}
                  onClick={handleMaintenanceModeToggle}
                  aria-pressed={maintenanceMode}
                >
                  <span>{maintenanceMode ? '返回主界面' : '数据维护'}</span>
                </button>
              </GlassSurface>
              <ExpandableSearch
                onChange={setSearchTerm}
                currentIndex={searchStats.current}
                totalResults={searchStats.total}
                onNext={jumpToNextSearchResult}
              />
            </div>
          </header>

          <div className="dash-content" ref={gridRef} key={contentKey}>
            {isMaintenancePage ? (
              <MaintenancePage activePage={activeMaintenanceMenu} onBack={handleMaintenanceBack} />
            ) : isComputePage ? (
              <ComputeUsagePage searchTerm={searchTerm} dim={dim} dateRange={dateRange} />
            ) : (
              <>
                <div className="dash-kpis">
                  {recoveryKpiCards.map((card) => (
                    <div className="dash-kpi-item" data-anim data-kpi-key={card.key} key={card.key}>
                      <SearchResultBorder active={matchesSearchTerm(card.keywords, searchTerm)}>
                        <KpiCard
                          card={card}
                          onOpen={handleOpenCard}
                          sidePanel={<ChannelPanel channelKey={activeChannelKey} title={recoveryChannelTitle(card)} />}
                        />
                      </SearchResultBorder>
                    </div>
                  ))}
                </div>

                <div className={gridClassName}>
                  <div className="dash-cell dash-cell--trend" data-anim>
                    <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.trend, searchTerm)}>
                      <MonthlyTrend channelKey={activeChannelKey} />
                    </SearchResultBorder>
                  </div>
                  <div className="dash-cell dash-cell--finance-kpis" data-anim>
                    <div className="dash-finance-kpis">
                      {showOpeningMetrics && (
                        <div className="dash-finance-kpi-item dash-finance-kpi-item--openings" data-kpi-key="openings">
                          <OpeningMetricCards searchTerm={searchTerm} onOpenSecondary={handleOpenCard} />
                        </div>
                      )}
                      {financeKpiCards.map((card) => (
                        <div className="dash-finance-kpi-item" data-kpi-key={card.key} key={card.key}>
                          <SearchResultBorder active={matchesSearchTerm(card.keywords, searchTerm)}>
                            <KpiCard card={card} onOpen={handleOpenCard} />
                          </SearchResultBorder>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="dash-cell dash-cell--version" data-anim>
                    <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.version, searchTerm)}>
                      <VersionFinancePanel channelKey={activeChannelKey} />
                    </SearchResultBorder>
                  </div>
                </div>

                <div className="dash-delivery-row" data-anim>
                  <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.delivery, searchTerm)}>
                    <DeliveryPanel />
                  </SearchResultBorder>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {openCardData && <KpiModal card={openCardData} onClose={() => setOpenCard(null)} />}
    </div>
  );
}
