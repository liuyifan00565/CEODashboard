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
import { useMemo, useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

import AIAnalysisWidget from './components/AIAnalysisWidget';
import DotField from './components/DotField/DotField';
import FluidGlass from './components/FluidGlass/FluidGlass';
import GlassSurface from './components/GlassSurface/GlassSurface';
import Sidebar from './components/Sidebar';
import ExpandableSearch from './components/ExpandableSearch';
import ElectricBorder from './components/ElectricBorder/ElectricBorder';
import MetallicPaint from './components/MetallicPaint/MetallicPaint';
import KpiCard from './components/KpiCard';
import KpiModal from './components/KpiModal';
import MonthlyTrend from './components/MonthlyTrend';
import ChannelPanel from './components/ChannelPanel';
import VersionFinancePanel from './components/VersionFinancePanel';
import DeliveryPanel from './components/DeliveryPanel';
import ComputeUsagePage from './components/ComputeUsagePage';
import OpeningMetricCards from './components/OpeningMetricCards';

import { META, MENU, getDashboardChannelKey, getDashboardMenuLabel } from './data/mock';
import { DEFAULT_FILTER_RANGE, getFilteredKpiCards } from './lib/filterKpiCards';
import { buildCardCompanionCue } from './lib/mascotCompanion';
import './dashboard.css';

// 各主体面板的搜索关键字
const PANEL_KEYWORDS = {
  trend: ['趋势', '月度', '回款', '目标', '完成率'],
  sales: ['销售', '线上', '线下', '代理', '战区', '华南', '华东'],
  version: ['版本', '启航', '卓越', '至尊', '财务', '健康', '应收', '广告', '缺口', '续费'],
  delivery: ['交付', '实施', '配置', '知识库', '人效'],
};

function hit(keywords, term) {
  if (!term) return false;
  const normalized = term.trim().toLowerCase();
  if (!normalized) return false;
  return keywords.some((keyword) => String(keyword).toLowerCase().includes(normalized));
}

function SearchResultBorder({ active, children }) {
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

function recoveryChannelTitle(card) {
  return card.key === 'year' ? '本年渠道完成情况' : '本月渠道完成情况';
}

function makeCompanionCueId(card) {
  return `${card?.key ?? 'card'}-${Date.now()}`;
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState('overview');
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
  const isComputePage = activeMenu === 'compute';
  const showOpeningMetrics = activeMenu === 'overview';
  const activeChannelKey = getDashboardChannelKey(activeMenu);
  const activeMenuLabel = getDashboardMenuLabel(activeMenu);
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
  }, [searchTerm, activeMenu]);

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
  }, [searchTerm, activeSearchIndex, activeMenu, isComputePage, filteredKpiCards]);

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
  }, [activeMenu]);

  return (
    <div className="app">
      <div className="bg">
        <DotField
          dotRadius={2.5}
          dotSpacing={14}
          bulgeStrength={150}
          glowRadius={300}
          sparkle={false}
          waveAmplitude={3}
          cursorRadius={300}
          cursorForce={0.15}
          bulgeOnly={false}
          gradientFrom="#6000FF"
          gradientTo="#ffffff"
          glowColor="#6000FF"
        />
        <div className="fluid-glass-layer" aria-hidden="true">
          <FluidGlass
            mode="bar"
            scale={0.15}
            ior={1.15}
            thickness={10}
            transmission={1}
            roughness={0}
            chromaticAberration={0.05}
            anisotropy={0.01}
            navItems={[]}
          />
        </div>
      </div>

      <div className="dash-shell">
        <aside className="dash-aside">
          <Sidebar items={MENU} active={activeMenu} onChange={handleMenuChange} />
          <AIAnalysisWidget activeMenu={activeMenu} dim={dim} channelKey={activeChannelKey} companionCue={companionCue} />
        </aside>

        <div className="dash-main">
          <header className="dash-topbar">
            <GlassSurface
              width={286}
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
                  <small>{META.monthLabel}｜{activeMenu === 'overview' ? 'CEO视角' : activeMenuLabel}</small>
                </div>
              </div>
            </GlassSurface>
            <div className="dash-tools">
              <ExpandableSearch
                onChange={setSearchTerm}
                currentIndex={searchStats.current}
                totalResults={searchStats.total}
                onNext={jumpToNextSearchResult}
              />
            </div>
          </header>

          <div className="dash-content" ref={gridRef} key={activeMenu}>
            {isComputePage ? (
              <ComputeUsagePage searchTerm={searchTerm} dim={dim} dateRange={dateRange} />
            ) : (
              <>
                <div className="dash-kpis">
                  {recoveryKpiCards.map((card) => (
                    <div className="dash-kpi-item" data-anim data-kpi-key={card.key} key={card.key}>
                      <SearchResultBorder active={hit(card.keywords, searchTerm)}>
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
                    <SearchResultBorder active={hit(PANEL_KEYWORDS.trend, searchTerm)}>
                      <MonthlyTrend channelKey={activeChannelKey} />
                    </SearchResultBorder>
                  </div>
                  <div className="dash-cell dash-cell--finance-kpis" data-anim>
                    <div className="dash-finance-kpis">
                      {showOpeningMetrics && (
                        <div className="dash-finance-kpi-item dash-finance-kpi-item--openings" data-kpi-key="openings">
                          <OpeningMetricCards onOpenSecondary={handleOpenCard} />
                        </div>
                      )}
                      {financeKpiCards.map((card) => (
                        <div className="dash-finance-kpi-item" data-kpi-key={card.key} key={card.key}>
                          <SearchResultBorder active={hit(card.keywords, searchTerm)}>
                            <KpiCard card={card} onOpen={handleOpenCard} />
                          </SearchResultBorder>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="dash-cell dash-cell--version" data-anim>
                    <SearchResultBorder active={hit(PANEL_KEYWORDS.version, searchTerm)}>
                      <VersionFinancePanel channelKey={activeChannelKey} />
                    </SearchResultBorder>
                  </div>
                </div>

                <div className="dash-delivery-row" data-anim>
                  <SearchResultBorder active={hit(PANEL_KEYWORDS.delivery, searchTerm)}>
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
