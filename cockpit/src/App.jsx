/*
 更新时间: 2026-07-14 14:04:11 CST
 更新内容: 开户数、总投入与广告ROI四张卡上移为横向 KPI 区；趋势图右侧改为真实成交来源排行。
*/
/*
 更新时间: 2026-07-14 13:49:44 CST
 更新内容: 数据维护保存或导入后重新加载经营快照，使线上月度目标无需刷新浏览器即可更新。
*/
/*
 更新时间: 2026-07-14 15:25:00 CST
 更新内容: 临时禁用登录门禁但保留登录代码：应用启动直接进入已认证状态，不再请求 /api/auth/me 或展示 LoginPage；
          退出登录在禁用期内仅恢复免登录用户，后续重新打开门禁时可复用现有 auth/lib 与 LoginPage。
*/
/*
 更新时间: 2026-07-14 11:20:00 CST
 更新内容: 侧栏品牌区第二行由当前页面名(activeContextLabel)改为登录用户名，不再展示"我们在哪个页面"；
          移除随之无用的 activeContextLabel/activeMenuLabel/getDashboardMenuLabel；退出登录按钮从
          搜索框下方上移到 Sidebar 导航卡片正下方（原先紧跟搜索框，现在更靠上）。
*/
/*
 更新时间: 2026-07-14 11:00:00 CST
 更新内容: 新增登录门禁：挂载时查 /api/auth/me，未登录展示 LoginPage，登录后才拉取经营数据；
          侧边导航底部加登录用户名与退出登录入口。仅做前端门禁 + 登录接口，暂未把既有
          dashboard-data/maintenance 等业务接口挂 requireAuth（避免影响正在并行开发的交付看板/
          数据健康检查），后续接入按岗位权限时直接复用 server/auth.js 的 requireAuth。
*/
/*
 更新时间: 2026-07-14 10:00:00 CST
 更新内容: 版本情况(VersionFinancePanel)移回经营总览页（恢复到月度趋势/开户投入区块下方），
          侧边导航“版本与交付”入口改为纯“交付”页，只保留交付面板(DeliveryPanel)；
          handleAiInsightNavigation 的 target==='versions' 分支同步改回跳转经营总览。
*/
/*
 更新时间: 2026-07-13 22:20:00 CST
 更新内容: “版本与交付”标签页两个面板各加一行 .dash-section-eyebrow 小标签（销售侧·版本构成 /
          履约侧·交付产能），让合并展示更像有意的分组而不是随意拼接。
*/
/*
 更新时间: 2026-07-13 20:30:00 CST
 更新内容: 侧边导航在算力用量分析之后新增“版本与交付”入口，把经营总览页下方的版本情况(VersionFinancePanel)
          和交付面板(DeliveryPanel)移到独立标签页；handleAiInsightNavigation 的 target==='versions'
          分支同步改为跳转新标签页而不是经营总览。
*/
/*
 更新时间: 2026-07-13 18:10:00 CST
 更新内容: 首页总投入旁新增广告ROI 小卡（AdRoiCard），总投入·费比卡片区域从整行独占改为与广告ROI 小卡
          左右分栏，总投入随之变窄；点击广告ROI 小卡复用总投入的成本二级弹窗。
*/
/*
 更新时间: 2026-07-13 14:31:00 CST
 更新内容: 侧栏品牌副标题改为月份与当前视角分行展示，避免窄侧栏内信息被省略。
*/
/*
 更新时间: 2026-07-10 15:25:00 CST
 更新内容: 将真实算力加载状态传给福小客，防止接口失败时默认算力值进入 AI 经营报告。
*/
/*
 更新时间: 2026-07-10 16:35:00 CST
 更新内容: 合并 Jichuan 算力用量分析后台同步逻辑：dashboard 数据就绪后加载 token 总览，再分页同步客户明细；
          移除数据版本号强制重挂载，算力页接收同步状态展示进度。
*/
/*
 更新时间: 2026-07-10 10:51:28 CST
 更新内容: 将搜索入口移到左侧导航下方，并移除主内容独占的搜索顶栏，让经营总览整体上移释放首屏空间。
*/
/*
 更新时间: 2026-07-10 10:26:00 CST
 更新内容: 将月度经营趋势、开户数和总投入费比提升到年度总览下方，版本情况下移，优先保证首屏经营决策信息完整可见。
*/
/*
 更新时间: 2026-07-09 18:26:40 CST
 更新内容: 将福客品牌 logo 移入左侧导航上方，主内容顶部只保留搜索，并把版本情况提升到年度总览下方以压缩首屏信息距离。
*/
/*
 更新时间: 2026-07-09 13:13:45 CST
 更新内容: 为经营总览与数据维护之间的侧边导航切换传递模式标识，配合侧栏平滑换组动效。
*/
/*
 更新时间: 2026-07-08 16:57:24 CST
 更新内容: 移除顶部右侧“更新数据”按钮，维护入口仅保留左侧导航的数据维护菜单。
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
import Sidebar from './components/Sidebar';
import ExpandableSearch from './components/ExpandableSearch';
import SearchResultBorder from './components/SearchResultBorder';
import KpiCard from './components/KpiCard';
import KpiModal from './components/KpiModal';
import MonthlyTrend from './components/MonthlyTrend';
import VersionFinancePanel from './components/VersionFinancePanel';
import DeliveryPanel from './components/DeliveryPanel';
import ComputeUsagePage from './components/ComputeUsagePage';
import OpeningMetricCards from './components/OpeningMetricCards';
import AdRoiCard from './components/AdRoiCard';
import ChannelSourcePanel from './components/ChannelSourcePanel';
import MaintenancePage from './components/MaintenancePage';
import OperatingOverview from './components/OperatingOverview';

import {
  appendComputeCustomerRows,
  META,
  MENU,
  MAINTENANCE_MENU,
  getComputeOverview,
  getDashboardChannelKey,
} from './data/mock';
import { loadComputeCustomerPage, loadComputeData, loadDashboardData } from './data/liveData';
import { DEFAULT_FILTER_RANGE, getFilteredKpiCards } from './lib/filterKpiCards';
import { buildCardCompanionCue } from './lib/mascotCompanion';
import { matchesSearchTerm } from './lib/searchMatch';
import './dashboard.css';

const DEFAULT_MAINTENANCE_MENU = MAINTENANCE_MENU[0]?.key ?? 'target-maintenance';
const CUSTOMER_SYNC_PAGE_SIZE = 200;
const LOGIN_DISABLED_USER = {
  id: 'login-disabled',
  username: '免登录',
  displayName: '免登录模式',
  role: 'temporary',
};

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
  version: ['版本', '启航', '卓越', '至尊', '财务', '健康', '应收', '广告', '缺口', '续费'],
  delivery: ['交付', '实施', '配置', '知识库', '人效'],
};

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
  const [dashboardDataState, setDashboardDataState] = useState({ status: 'loading', error: '' });
  const [dashboardDataVersion, setDashboardDataVersion] = useState(0);
  const [computeDataState, setComputeDataState] = useState({ status: 'idle', error: '' });
  const [computeCustomerSyncState, setComputeCustomerSyncState] = useState({ status: 'idle', total: 0 });
  const [authState, setAuthState] = useState({ status: 'authenticated', user: LOGIN_DISABLED_USER });

  const gridRef = useRef(null);
  const pendingMenuScrollRef = useRef(false);
  const pendingSearchScrollRef = useRef(false);
  const pendingAiInsightRef = useRef(null);
  const aiInsightFocusTimerRef = useRef(null);
  const isMaintenancePage = maintenanceMode;
  const isComputePage = activeMenu === 'compute';
  const isDeliveryPage = activeMenu === 'delivery';
  const activeChannelKey = getDashboardChannelKey(activeMenu);
  const sidebarBrandMeta = `${META.monthLabel}\n${authState.user?.displayName || authState.user?.username || ''}`;
  const sidebarItems = maintenanceMode ? MAINTENANCE_SIDEBAR_ITEMS : DASHBOARD_SIDEBAR_ITEMS;
  const sidebarActive = maintenanceMode ? activeMaintenanceMenu : activeMenu;
  const sidebarTransitionKey = maintenanceMode ? 'maintenance' : 'dashboard';
  const contentKey = maintenanceMode ? activeMaintenanceMenu : activeMenu;
  const isDashboardDataReady = dashboardDataState.status === 'ready';
  const filteredKpiCards = getFilteredKpiCards({ dim, dateRange, channel: activeChannelKey });
  const monthKpiCard = filteredKpiCards.find((card) => card.key === 'month');
  const yearKpiCard = filteredKpiCards.find((card) => card.key === 'year');
  const financeKpiCards = filteredKpiCards.filter((card) => card.key === 'cost');
  const openCardData = useMemo(
    () => filteredKpiCards.find((card) => card.key === openCard?.key) ?? openCard ?? null,
    [filteredKpiCards, openCard]
  );

  useEffect(() => {
    if (authState.status !== 'authenticated') return undefined;
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
  }, [authState.status, dashboardDataVersion]);

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
    // This effect owns computeDataState.status transitions; including it would
    // cancel the same request when the status changes to "loading".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardDataState.status]);

  useEffect(() => {
    if (computeDataState.status !== 'ready' || computeCustomerSyncState.status !== 'idle') return undefined;
    let cancelled = false;

    async function syncAllComputeCustomers() {
      const overview = getComputeOverview();
      setComputeCustomerSyncState({ status: 'loading', total: overview.totalCustomers || 0 });

      let page = 1;
      for (;;) {
        if (cancelled) return;
        let payload;
        try {
          payload = await loadComputeCustomerPage({ page, pageSize: CUSTOMER_SYNC_PAGE_SIZE });
        } catch {
          if (!cancelled) setComputeCustomerSyncState((state) => ({ ...state, status: 'error' }));
          return;
        }
        if (cancelled) return;

        const loaded = appendComputeCustomerRows(payload.rows);
        setComputeCustomerSyncState({ status: 'loading', total: payload.total });

        if (!payload.rows.length || payload.rows.length < CUSTOMER_SYNC_PAGE_SIZE || loaded >= payload.total) break;
        page += 1;
      }

      if (!cancelled) setComputeCustomerSyncState((state) => ({ ...state, status: 'done' }));
    }

    syncAllComputeCustomers();

    return () => {
      cancelled = true;
    };
    // This effect owns computeCustomerSyncState.status transitions while paging.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeDataState.status]);

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

  function focusAiInsightTarget(target) {
    const root = gridRef.current;
    const targetNode = root?.querySelector(`[data-ai-insight-target="${target}"]`);
    if (!targetNode) return false;

    root.querySelectorAll('.ai-insight-focus').forEach((node) => {
      node.classList.remove('ai-insight-focus');
    });
    clearTimeout(aiInsightFocusTimerRef.current);
    targetNode.classList.add('ai-insight-focus');
    const focusBlock = target === 'compute' ? 'start' : 'center';
    targetNode.scrollIntoView({ behavior: 'smooth', block: focusBlock });
    aiInsightFocusTimerRef.current = window.setTimeout(() => {
      targetNode.classList.remove('ai-insight-focus');
    }, 2200);
    return true;
  }

  function handleAiInsightNavigation(target) {
    pendingAiInsightRef.current = target;
    pendingMenuScrollRef.current = false;
    setMaintenanceMode(false);

    const targetMenu = target === 'compute' ? 'compute' : 'overview';

    if (activeMenu === targetMenu) {
      requestAnimationFrame(() => {
        focusAiInsightTarget(target);
        pendingAiInsightRef.current = null;
      });
    } else {
      setActiveMenu(targetMenu);
    }
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

  useLayoutEffect(() => {
    const target = pendingAiInsightRef.current;
    if (!target) return undefined;

    const focusFrame = requestAnimationFrame(() => {
      focusAiInsightTarget(target);
      pendingAiInsightRef.current = null;
    });
    return () => cancelAnimationFrame(focusFrame);
  }, [contentKey, computeDataState.status]);

  useEffect(() => () => {
    clearTimeout(aiInsightFocusTimerRef.current);
  }, []);

  function handleLogout() {
    setAuthState({ status: 'authenticated', user: LOGIN_DISABLED_USER });
  }

  if (authState.status === 'loading') {
    return (
      <div className="app">
        <div className="bg" aria-hidden="true" />
        <main className="dash-data-state" role="status">
          <b>正在确认登录状态</b>
        </main>
      </div>
    );
  }

  if (!isDashboardDataReady) {
    return (
      <div className="app">
        <div className="bg" aria-hidden="true" />
        <main className="dash-data-state" role={dashboardDataState.status === 'error' ? 'alert' : 'status'}>
          <b>{dashboardDataState.status === 'loading' ? '正在加载数据库数据' : '真实数据库数据加载失败'}</b>
          <span>
            {dashboardDataState.status === 'loading'
              ? '正在从 ceo_dashboard 读取经营、渠道、算力和交付数据。'
              : dashboardDataState.error}
          </span>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="bg" aria-hidden="true" />

      <div className="dash-shell">
        <aside className="dash-aside">
          <Sidebar
            items={sidebarItems}
            active={sidebarActive}
            onChange={handleSidebarChange}
            transitionKey={sidebarTransitionKey}
            brandTitle="福客经营驾驶舱"
            brandMeta={sidebarBrandMeta}
          />
          <div className="dash-sidebar-account">
            <button type="button" className="dash-sidebar-account__logout" onClick={handleLogout}>退出登录</button>
          </div>
          <div className="dash-sidebar-search">
            <ExpandableSearch
              placement="sidebar"
              onChange={setSearchTerm}
              currentIndex={searchStats.current}
              totalResults={searchStats.total}
              onNext={jumpToNextSearchResult}
            />
          </div>
          <AIAnalysisWidget
            activeMenu={activeMenu}
            dim={dim}
            channelKey={activeChannelKey}
            companionCue={companionCue}
            context={maintenanceMode ? 'maintenance' : 'dashboard'}
            computeDataState={computeDataState}
            onNavigateInsight={handleAiInsightNavigation}
          />
        </aside>

        <div className="dash-main">
          <div className="dash-content" ref={gridRef} key={contentKey}>
            {isMaintenancePage ? (
              <MaintenancePage
                activePage={activeMaintenanceMenu}
                onBack={handleMaintenanceBack}
                onDataChanged={() => setDashboardDataVersion((version) => version + 1)}
              />
            ) : isComputePage ? (
              <ComputeUsagePage
                searchTerm={searchTerm}
                dim="day"
                dateRange={[]}
                computeDataState={computeDataState}
                customerSyncState={computeCustomerSyncState}
              />
            ) : isDeliveryPage ? (
              <div className="dash-secondary-delivery" data-anim>
                <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.delivery, searchTerm)}>
                  <DeliveryPanel />
                </SearchResultBorder>
              </div>
            ) : (
              <>
                <OperatingOverview
                  searchTerm={searchTerm}
                  monthKpiCard={monthKpiCard}
                  yearKpiCard={yearKpiCard}
                  onOpenKpi={handleOpenCard}
                />

                <div className="dash-overview-kpis" data-anim>
                  <OpeningMetricCards searchTerm={searchTerm} onOpenSecondary={handleOpenCard} />
                  {financeKpiCards.map((card) => (
                    <SearchResultBorder active={matchesSearchTerm(card.keywords, searchTerm)} key={card.key}>
                      <KpiCard card={card} onOpen={handleOpenCard} />
                    </SearchResultBorder>
                  ))}
                  {financeKpiCards.map((card) => (
                    <AdRoiCard searchTerm={searchTerm} onOpen={handleOpenCard} costCard={card} key={`${card.key}-roi`} />
                  ))}
                </div>

                <div className="dash-secondary-grid">
                  <div className="dash-secondary-cell dash-secondary-cell--trend" data-ai-insight-target="trend" data-anim>
                    <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.trend, searchTerm)}>
                      <MonthlyTrend channelKey={activeChannelKey} />
                    </SearchResultBorder>
                  </div>

                  <div className="dash-source-cell" data-anim>
                    <ChannelSourcePanel channelKey={activeChannelKey} />
                  </div>
                </div>

                <div className="dash-version-row" data-ai-insight-target="versions" data-anim>
                  <SearchResultBorder active={matchesSearchTerm(PANEL_KEYWORDS.version, searchTerm)}>
                    <VersionFinancePanel channelKey={activeChannelKey} />
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
