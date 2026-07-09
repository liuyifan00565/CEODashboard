/*
 更新时间: 2026-07-09 22:30:00 CST
 更新内容: 经营总览页在 dashboard-data 未就绪前改为渲染骨架屏，不再显示 mock.js 本地示例经营数据；彻底移除
          dashboardDataVersion（两个用途都已不需要强制重挂载），contentRenderKey 直接等于 contentKey。
*/
/*
 更新时间: 2026-07-09 22:05:00 CST
 更新内容: 算力数据就绪后不再触发 dashboardDataVersion 自增，避免算力页同步条消失时整块内容区被 key 变化强制
          重挂载（表现为"刷新了一下"）；搜索命中扫描改为直接监听 computeDataState.status，保持算力页数据
          就绪后搜索高亮仍会刷新。
*/
/*
 更新时间: 2026-07-09 21:15:00 CST
 更新内容: 移除数据库加载全屏阻塞占位，改为顶栏轻量同步提示条，所有页面用本地快照立即渲染；
          修复算力后台同步状态因 effect 依赖自身状态被提前取消、"正在同步 token 用量数据"永不消失的问题；
          算力客户列表改为分页后台全量同步，客户表随分页到达增量刷新。
*/
/*
 更新时间: 2026-07-09 19:52:00 CST
 更新内容: 首页数据就绪后后台同步 token 数据；算力页仅在后台同步未完成或失败时显示状态条。
*/
/*
 更新时间: 2026-07-09 19:32:00 CST
 更新内容: 算力页改为进入页面后按需加载外部 token 数据，并使用日维度默认趋势，避免首页等待和月维度单点趋势。
*/
/*
 更新时间: 2026-07-09 16:15:00 CST
 更新内容: 移除经营判断轴（预览后决定不保留）；渠道 ROI 分析从二级网格移到月度经营进度卡下方，
          让 KPI 速览条+年度进度条+月度主卡+渠道 ROI 尽量落在一屏内。
*/
/*
 更新时间: 2026-07-09 16:05:00 CST
 更新内容: KPI 速览条下方新增经营判断轴（探索性预览，用户要求先看效果再决定是否保留）。
*/
/*
 更新时间: 2026-07-09 15:50:00 CST
 更新内容: 经营总览下方新增"渠道 ROI 分析"面板（月度经营趋势下方、版本情况上方），落地需求文档里此前未实现的模块。
*/
/*
 更新时间: 2026-07-09 13:13:45 CST
 更新内容: 为经营总览与数据维护之间的侧边导航切换传递模式标识，配合侧栏平滑换组动效。
*/
/*
 更新时间: 2026-07-09 14:20:00 CST
 更新内容: 经营总览页顶部新增薄 KPI 速览条，汇总月度/年度完成率、续费率、广告 ROI、费比和本月开户数。
*/
/*
 更新时间: 2026-07-08 16:57:24 CST
 更新内容: 移除顶部右侧”更新数据”按钮，维护入口仅保留左侧导航的数据维护菜单。
*/
/*
 更新时间: 2026-07-08 14:46:29 CST
 更新内容: 维护模式左侧返回入口改为导航分组里的“经营总览”，移除独立大按钮。
*/
/*
 更新时间: 2026-07-08 14:11:07 CST
 更新内容: 主界面侧边导航移除搜索占位入口，维护页继续保留左侧全局返回入口。
*/
/*
 更新时间: 2026-07-08 14:08:42 CST
 更新内容: 为顶部品牌胶囊滚动折叠增加滞回阈值，并避免搜索命中标记随无关渲染重复刷新导致抖动。
*/
/*
 更新时间: 2026-07-08 14:00:14 CST
 更新内容: 主界面侧边导航移除“渠道分析”和“客户转化”禁用入口，仅保留当前有效页面。
*/
/*
 更新时间: 2026-07-08 11:47:38 CST
 更新内容: 将维护模式“返回主界面”从右上角工具栏移到左侧导航栏下方。
*/
/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 向 AI 小人入口传递 dashboard/maintenance 场景 context，用于 2D 帧动画切换维护状态。
*/
/*
 更新时间: 2026-07-06 18:50:20 CST
 更新内容: KPI 卡片改为每次渲染读取当前运行时数据，消除真实数据版本号在 useMemo 中的多余依赖。
*/
/*
 更新时间: 2026-07-06 18:37:58 CST
 更新内容: 应用启动时先加载真实 MySQL dashboard 数据，成功覆盖运行时数据后再渲染看板。
*/
/*
 更新时间: 2026-07-06 10:49:52 CST
 更新内容: 顶部福客品牌胶囊滚动后折叠为一行 sticky 身份标识，并在深滚动时弱化为极简版本。
*/
/*
 更新时间: 2026-07-05 19:10:30 CST
 更新内容: 经营总览顶部接入本月和年度 KPI 明细入口，复用现有 KPI 二级弹窗。
*/
/*
 更新时间: 2026-07-05 18:46:00 CST
 更新内容: 在经营总览三段融合故事流下方恢复月度趋势、开户投入、版本情况和交付面板，并保留 KPI 下钻联动。
*/
/*
 更新时间: 2026-07-05 18:20:00 CST
 更新内容: 经营总览首页切换为经营进度总览、年度节奏、渠道完成情况三段融合结构，并将顶部按钮改为更新数据。
*/
/*
 更新时间: 2026-07-05 16:12:00 CST
 更新内容: 首页恢复图文管理侧栏与顶部福客品牌胶囊，并移除年度风险预测侧栏变体。
*/
/*
 更新时间: 2026-07-03 23:39:28 CST
 更新内容: 降低顶部船舶信息卡与数据维护按钮的 GlassSurface 高光、模糊和折射强度。
*/
/*
 更新时间: 2026-07-03 18:24:14 CST
 更新内容: 移除全屏 Color Bends 动态背景，改由 CSS 静态深石墨网格/点阵/噪声背景承载驾驶舱。
*/
/*
 更新时间: 2026-07-03 18:19:59 CST
 更新内容: 将 Color Bends 与品牌 logo 高光同步为黑曜石月光紫配色，配合全站高级配色落地。
*/
/*
 更新时间: 2026-07-03 17:55:10 CST
 更新内容: 将 Color Bends 配色从强紫光束改为中性深色带加少量低饱和靛紫强调，落实紫色面积不超过 15% 的规则。
*/
/*
 更新时间: 2026-07-03 17:52:15 CST
 更新内容: 将 Color Bends 背景改为更快、更暗的弱紫环境漂移，配合深黑蓝网格噪声背景。
*/
/*
 更新时间: 2026-07-03 16:58:00 CST
 更新内容: 按反馈略微加快 Color Bends 流动速度，并收细紫色带宽。
*/
/*
 更新时间: 2026-07-03 16:42:00 CST
 更新内容: 将 Color Bends 从雾状紫光调回 ReactBits 官方参考的连续弯曲丝带形态，同时保持页面穿透和亮度受控。
*/
/*
 更新时间: 2026-07-03 16:30:00 CST
 更新内容: 按最新反馈取消数据区遮挡，让 Color Bends 穿透页面，同时降低亮度避免白紫光束过曝。
*/
/*
 更新时间: 2026-07-03 16:18:00 CST
 更新内容: 收回 Color Bends 穿透数据卡片的刺眼白紫光束，新增数据区背景保护层，让流光停留在背景与空区。
*/
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
import { useMemo, useState, useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';

import AIAnalysisWidget from './components/AIAnalysisWidget';
import GlassSurface from './components/GlassSurface/GlassSurface';
import Sidebar from './components/Sidebar';
import ExpandableSearch from './components/ExpandableSearch';
import SearchResultBorder from './components/SearchResultBorder';
import MetallicPaint from './components/MetallicPaint/MetallicPaint';
import KpiCard from './components/KpiCard';
import KpiModal from './components/KpiModal';
import MonthlyTrend from './components/MonthlyTrend';
import ChannelRoiPanel from './components/ChannelRoiPanel';
import VersionFinancePanel from './components/VersionFinancePanel';
import DeliveryPanel from './components/DeliveryPanel';
import ComputeUsagePage from './components/ComputeUsagePage';
import OpeningMetricCards from './components/OpeningMetricCards';
import MaintenancePage from './components/MaintenancePage';
import OperatingOverview from './components/OperatingOverview';
import TopKpiStrip from './components/TopKpiStrip';

import { META, MENU, MAINTENANCE_MENU, getDashboardChannelKey, getDashboardMenuLabel } from './data/mock';
import { loadComputeData, loadDashboardData } from './data/liveData';
import { DEFAULT_FILTER_RANGE, getFilteredKpiCards } from './lib/filterKpiCards';
import { buildCardCompanionCue } from './lib/mascotCompanion';
import { matchesSearchTerm } from './lib/searchMatch';
import './dashboard.css';

const DEFAULT_MAINTENANCE_MENU = MAINTENANCE_MENU[0]?.key ?? 'target-maintenance';
const BRAND_FULL_ENTER_SCROLL = 56;
const BRAND_FULL_EXIT_SCROLL = 104;
const DASHBOARD_LOADING_DELAY_MS = 450;

const DASHBOARD_SIDEBAR_ITEMS = [
  ...MENU.map((item) => ({ ...item, section: '导航', icon: item.icon ?? item.key })),
  { key: 'data-maintenance', name: '数据维护', icon: 'target', section: '系统' },
];

const MAINTENANCE_HOME_ITEM = { key: 'dashboard-home', name: '经营总览', icon: 'return', section: '导航' };
const MAINTENANCE_SIDEBAR_ITEMS = [
  MAINTENANCE_HOME_ITEM,
  ...MAINTENANCE_MENU.map((item) => ({ ...item, section: '数据维护' })),
];

const PANEL_KEYWORDS = {
  trend: ['趋势', '月度', '回款', '目标', '完成率'],
  roi: ['渠道 ROI', '渠道ROI', 'ROI', '投入产出', '费比', '线上', '线下华南', '线下华东', '代理'],
  version: ['版本', '启航', '卓越', '至尊', '财务', '健康', '应收', '广告', '缺口', '续费'],
  delivery: ['交付', '实施', '配置', '知识库', '人效'],
};

function formatCompactMonthLabel(label) {
  const match = String(label).match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
  return match ? `${match[1]}.${match[2].padStart(2, '0')}` : label;
}

function makeCompanionCueId(card) {
  return `${card?.key ?? 'card'}-${Date.now()}`;
}

export default function App() {
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
  const [brandMode, setBrandMode] = useState('full');
  const [dashboardDataState, setDashboardDataState] = useState({ status: 'loading', error: '' });
  const [showDashboardLoading, setShowDashboardLoading] = useState(false);
  const [computeDataState, setComputeDataState] = useState({ status: 'idle', error: '' });

  const gridRef = useRef(null);
  const secondaryGridRef = useRef(null);
  const pendingMenuScrollRef = useRef(false);
  const pendingSearchScrollRef = useRef(false);
  const isMaintenancePage = maintenanceMode;
  const isComputePage = activeMenu === 'compute';
  const activeChannelKey = getDashboardChannelKey(activeMenu);
  const activeMenuLabel = getDashboardMenuLabel(activeMenu);
  const activeContextLabel = maintenanceMode
    ? '数据维护'
    : activeMenu === 'overview' ? 'CEO视角' : activeMenuLabel;
  const compactMonthLabel = formatCompactMonthLabel(META.monthLabel);
  const compactContextLabel = activeContextLabel === 'CEO视角' ? 'CEO' : activeContextLabel;
  const brandIdentityText = brandMode === 'minimal'
    ? '经营驾驶舱'
    : `福客经营驾驶舱 · ${compactMonthLabel} · ${compactContextLabel}`;
  const sidebarItems = maintenanceMode ? MAINTENANCE_SIDEBAR_ITEMS : DASHBOARD_SIDEBAR_ITEMS;
  const sidebarActive = maintenanceMode ? activeMaintenanceMenu : activeMenu;
  const sidebarTransitionKey = maintenanceMode ? 'maintenance' : 'dashboard';
  const contentKey = maintenanceMode ? activeMaintenanceMenu : activeMenu;
  const isDashboardDataLoading = dashboardDataState.status === 'loading';
  const filteredKpiCards = getFilteredKpiCards({ dim, dateRange, channel: activeChannelKey });
  const monthKpiCard = filteredKpiCards.find((card) => card.key === 'month');
  const yearKpiCard = filteredKpiCards.find((card) => card.key === 'year');
  const financeKpiCards = filteredKpiCards.filter((card) => card.key === 'cost');
  const openCardData = useMemo(
    () => filteredKpiCards.find((card) => card.key === openCard?.key) ?? openCard ?? null,
    [filteredKpiCards, openCard]
  );

  useEffect(() => {
    let cancelled = false;

    loadDashboardData()
      .then(() => {
        if (cancelled) return;
        setDashboardDataState({ status: 'ready', error: '' });
      })
      .catch((err) => {
        if (cancelled) return;
        setDashboardDataState({ status: 'error', error: err.message || '真实数据库数据加载失败' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (dashboardDataState.status !== 'loading') {
      setShowDashboardLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowDashboardLoading(true);
    }, DASHBOARD_LOADING_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [dashboardDataState.status]);

  useEffect(() => {
    if (dashboardDataState.status !== 'ready' || computeDataState.status !== 'idle') return undefined;
    let cancelled = false;

    setComputeDataState({ status: 'loading', error: '' });
    loadComputeData()
      .then(() => {
        if (cancelled) return;
        setComputeDataState({ status: 'ready', error: '' });
      })
      .catch((err) => {
        if (cancelled) return;
        setComputeDataState({ status: 'error', error: err.message || '算力数据加载失败' });
      });

    return () => {
      cancelled = true;
    };
    // computeDataState.status is intentionally omitted: this effect sets that
    // status itself, and including it retriggers/cancels this same effect
    // before loadComputeData() resolves, leaving status stuck at 'loading'.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardDataState.status]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let animationFrame = 0;

    function resolveBrandMode(currentMode) {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const fullThreshold = currentMode === 'full' ? BRAND_FULL_EXIT_SCROLL : BRAND_FULL_ENTER_SCROLL;
      if (scrollTop <= fullThreshold) {
        return 'full';
      }

      const secondaryTop = secondaryGridRef.current?.getBoundingClientRect().top;
      const deepScroll = Number.isFinite(secondaryTop) ? secondaryTop <= 112 : scrollTop > 520;
      return deepScroll ? 'minimal' : 'compact';
    }

    function updateBrandMode() {
      setBrandMode((currentMode) => {
        const nextMode = resolveBrandMode(currentMode);
        return currentMode === nextMode ? currentMode : nextMode;
      });
    }

    function requestBrandMode() {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateBrandMode();
      });
    }

    updateBrandMode();
    window.addEventListener('scroll', requestBrandMode, { passive: true });
    window.addEventListener('resize', requestBrandMode);
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', requestBrandMode);
      window.removeEventListener('resize', requestBrandMode);
    };
  }, [contentKey]);

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
    if (nextMenu === 'data-maintenance') {
      setMaintenanceMode(true);
      setActiveMaintenanceMenu(DEFAULT_MAINTENANCE_MENU);
      return;
    }

    if (nextMenu === 'dashboard-home') {
      handleMaintenanceBack();
      return;
    }

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
  }, [searchTerm, activeSearchIndex, contentKey, isComputePage, dashboardDataState.status, computeDataState.status]);

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
      <div className="bg" aria-hidden="true" />

      <div className="dash-shell">
        <aside className="dash-aside">
          <Sidebar items={sidebarItems} active={sidebarActive} onChange={handleSidebarChange} transitionKey={sidebarTransitionKey} />
          <AIAnalysisWidget
            activeMenu={activeMenu}
            dim={dim}
            channelKey={activeChannelKey}
            companionCue={companionCue}
            context={maintenanceMode ? 'maintenance' : 'dashboard'}
          />
        </aside>

        <div className="dash-main">
          <header className="dash-topbar">
            <GlassSurface
              width={brandMode === 'full' ? 320 : brandMode === 'compact' ? 248 : 180}
              height={brandMode === 'full' ? 62 : brandMode === 'compact' ? 40 : 38}
              borderRadius={brandMode === 'full' ? 22 : 16}
              brightness={brandMode === 'full' ? 46 : 38}
              blur={7}
              displace={brandMode === 'full' ? 0.32 : 0.2}
              backgroundOpacity={brandMode === 'full' ? 0.045 : brandMode === 'compact' ? 0.03 : 0.018}
              distortionScale={brandMode === 'full' ? -54 : -42}
              className={`brand-glass brand-glass--${brandMode}`}
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
                    lightColor="#ffffff"
                    darkColor="#050505"
                    tintColor="#f0d99a"
                    chromaticSpread={1.8}
                    distortion={0.75}
                    contour={0.28}
                  />
                </span>
                <div className="brand-copy">
                  <span className="brand-copy-full">
                    <b>福客经营驾驶舱</b>
                    <small>{META.monthLabel} / {activeContextLabel}</small>
                  </span>
                  <span className="brand-copy-inline">{brandIdentityText}</span>
                </div>
              </div>
            </GlassSurface>
            {dashboardDataState.status === 'error' ? (
              <div className="dash-sync-pill dash-sync-pill--error" role="alert">
                <span className="dash-sync-pill-dot" aria-hidden="true" />
                <span>真实数据同步失败，当前显示本地快照</span>
              </div>
            ) : showDashboardLoading ? (
              <div className="dash-sync-pill dash-sync-pill--loading" role="status">
                <span className="dash-sync-pill-dot" aria-hidden="true" />
                <span>正在同步真实数据…</span>
              </div>
            ) : null}
            <div className="dash-tools">
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
              <ComputeUsagePage searchTerm={searchTerm} dim="day" dateRange={[]} computeDataState={computeDataState} />
            ) : isDashboardDataLoading ? (
              <>
                <div className="dash-skeleton-strip" data-anim />
                <div className="dash-skeleton-block dash-skeleton-block--overview" data-anim />
                <div className="dash-secondary-roi" data-anim>
                  <div className="dash-skeleton-block" />
                </div>
                <div className="dash-secondary-grid">
                  <div className="dash-secondary-cell dash-secondary-cell--trend" data-anim>
                    <div className="dash-skeleton-block" />
                  </div>
                  <div className="dash-secondary-cell dash-secondary-cell--finance" data-anim>
                    <div className="dash-skeleton-block" />
                  </div>
                  <div className="dash-secondary-cell dash-secondary-cell--version" data-anim>
                    <div className="dash-skeleton-block" />
                  </div>
                </div>
                <div className="dash-secondary-delivery" data-anim>
                  <div className="dash-skeleton-block" />
                </div>
              </>
            ) : (
              <>
                <TopKpiStrip />

                <OperatingOverview
                  searchTerm={searchTerm}
                  monthKpiCard={monthKpiCard}
                  yearKpiCard={yearKpiCard}
                  onOpenKpi={handleOpenCard}
                />

                <div className="dash-secondary-roi" data-anim>
                  <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.roi, searchTerm)}>
                    <ChannelRoiPanel />
                  </SearchResultBorder>
                </div>

                <div className="dash-secondary-grid" ref={secondaryGridRef}>
                  <div className="dash-secondary-cell dash-secondary-cell--trend" data-anim>
                    <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.trend, searchTerm)}>
                      <MonthlyTrend channelKey={activeChannelKey} />
                    </SearchResultBorder>
                  </div>

                  <div className="dash-secondary-cell dash-secondary-cell--finance" data-anim>
                    <div className="dash-finance-kpis">
                      <div className="dash-finance-kpi-item dash-finance-kpi-item--openings" data-kpi-key="openings">
                        <OpeningMetricCards searchTerm={searchTerm} onOpenSecondary={handleOpenCard} />
                      </div>
                      {financeKpiCards.map((card) => (
                        <div className="dash-finance-kpi-item" data-kpi-key={card.key} key={card.key}>
                          <SearchResultBorder active={matchesSearchTerm(card.keywords, searchTerm)}>
                            <KpiCard card={card} onOpen={handleOpenCard} />
                          </SearchResultBorder>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dash-secondary-cell dash-secondary-cell--version" data-anim>
                    <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.version, searchTerm)}>
                      <VersionFinancePanel channelKey={activeChannelKey} />
                    </SearchResultBorder>
                  </div>
                </div>

                <div className="dash-secondary-delivery" data-anim>
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
