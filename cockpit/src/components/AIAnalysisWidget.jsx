/*
 更新时间: 2026-07-14 16:47:26 CST
 更新内容: 移除侧栏 AI 小人入口旁的助手文案，仅保留小人入口用于居中展示。
*/
/*
 Update time: 2026-07-10 16:08:00 CST
 Update content: Use local business brief for daily brief requests and hide raw DashScope error JSON from chat bubbles.
*/
/*
 更新时间: 2026-07-10 15:25:00 CST
 更新内容: 接入真实算力加载状态，外部算力接口未就绪时只向 Qwen 暴露数据缺口，不传默认数值。
*/
/*
 更新时间: 2026-07-09 13:18:11 CST
 更新内容: 对齐福客帧级 motion bridge 后的 wave/guide/click 时长，避免动作未播完就被切回 resting 状态。
*/
/*
 更新时间: 2026-07-07 15:09:26 CST
 更新内容: 为 AI 小人入口外层增加当前动作类，支持点击 guide 时显示右侧对话框指引光束。
*/
/*
 更新时间: 2026-07-07 14:03:53 CST
 更新内容: 将 AI 小人入口从 3D GLB 切换为 2D Sprite 帧动画舞台，并接收页面 context。
*/
/*
 更新时间: 2026-07-07 13:22:15 CST
 更新内容: 固定 AI 小人入口指针并移除悬停挥手/跟随逻辑，避免待机和鼠标经过时乱跑。
*/
/*
 更新时间: 2026-07-07 12:00:52 CST
 更新内容: 为 guide 指引动作增加 1 秒动作锁，避免气泡、悬停或旧计时器提前覆盖。
*/
/*
 更新时间: 2026-07-07 11:59:22 CST
 更新内容: 防止鼠标悬停和离开事件打断点击打开对话框时的 guide 指引动作。
*/
/*
 更新时间: 2026-07-07 11:49:34 CST
 更新内容: 点击打开 AI 对话框时播放约 1 秒 guide 指引动作，点击关闭时保留轻量点击反馈。
*/
/*
 更新时间: 2026-07-06 10:48:16 CST
 更新内容: AI 助手流光边框改为银紫玫瑰与香槟点缀，移除默认硬蓝主视觉。
*/
/*
 更新时间: 2026-07-06 00:00:13 CST
 更新内容: AI 分析弹窗边缘流光金色改为高级哑金。
*/
/*
 更新时间: 2026-07-05 16:12:00 CST
 更新内容: 左侧 AI 入口增加轻量状态文案，融入 220px 管理侧栏底部卡片。
*/
/*
 更新时间: 2026-07-03 18:19:59 CST
 更新内容: AI 分析弹窗边缘流光同步为月光紫、香槟金与冷蓝配色，移除粉紫/天蓝霓虹感。
*/
/*
 更新时间: 2026-07-02 16:52:00 CST
 更新内容: AI 分析弹窗关闭按钮改用统一 AppIcon 线性图标。
*/
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

import AppIcon from './AppIcon';
import BorderGlow from './BorderGlow/BorderGlow';
import MascotSpriteStage from './MascotSpriteStage';
import ShinyText from './ShinyText/ShinyText';
import {
  CHANNEL_ROI,
  CHANNELS,
  COMPUTE_OVERVIEW,
  COMPUTE_USAGE_TREND,
  KPI,
  KPI_DERIVED,
  META,
  MONTHLY_TREND,
  OPERATING_OVERVIEW_METRICS,
  VERSIONS,
  getRenewalModalData,
} from '../data/mock';
import {
  MASCOT_ACTIONS,
  getSpeechAction,
} from '../lib/mascotCompanion';
import { buildBusinessBrief } from '../lib/businessBrief';
import {
  buildHoverCueCacheKey,
  getHoverCueTextFromElement,
  normalizeHoverCueText,
  shouldRequestHoverCue,
} from '../lib/hoverCue';
import './AIAnalysisWidget.css';

const INITIAL_MESSAGE = {
  id: 'intro',
  role: 'assistant',
  content: '我会基于当前页面的经营数据做分析。你可以直接问目标差距、销售维度问题、ROI、续费或下一步动作。',
};

const DAILY_BRIEF_PROMPT = '请生成今日经营简报。若当前快照没有单独的今日销售额，请明确说明没有单独的今日销售额，以下结论基于截至当前页面的本月累计数据，不要把累计值写成当日值。';
const AI_KEY_MISSING_MESSAGE = 'AI 深度分析未启用，请在服务端配置 DASHSCOPE_API_KEY。基础经营简报可先使用当前页面数据生成。';

const QUICK_PROMPTS = [
  {
    id: 'daily-brief',
    label: '今日简报',
    prompt: DAILY_BRIEF_PROMPT,
  },
  {
    id: 'monthly-report',
    label: '本月报告',
    prompt: '请生成本月经营报告，按业绩、渠道、版本、算力、续费观察和下一步动作分段，并严格区分事实、可能原因、数据缺口和下一步动作。',
  },
  {
    id: 'channel-version',
    label: '渠道与版本',
    prompt: '请分析渠道完成率与核心版本构成：先列事实，再说明可能原因、数据缺口和建议；试用版与增购包不要作为核心版本。',
  },
  {
    id: 'revenue-compute',
    label: '业绩与算力',
    prompt: '请对照业绩回款与算力新增、消耗、余额和使用趋势，判断两者是否同步；只描述数据支持的事实，原因必须标注为可能原因。',
  },
];
const INSIGHT_ACTIONS = [
  { target: 'performance', label: '业绩', icon: 'target' },
  { target: 'channels', label: '渠道', icon: 'channel' },
  { target: 'trend', label: '趋势', icon: 'calendar' },
  { target: 'versions', label: '版本', icon: 'overview' },
  { target: 'compute', label: '算力', icon: 'compute' },
];
const HOVER_CUE_DELAY = 900;
const HOVER_CUE_DURATION = 4200;
const HOVER_BUBBLE_COOLDOWN = 6000;
const BUSINESS_BRIEF_DELAY = 1800;
const BUSINESS_BRIEF_DURATION = 7200;
const BUSINESS_BRIEF_STORAGE_PREFIX = 'ceo-dashboard:business-brief';
const GREETING_WAVE_DELAY = 240;
const GREETING_WAVE_DURATION = 1200;
const GUIDE_MOTION_DURATION = 1200;
const CLICK_MOTION_DURATION = 900;
const BUBBLE_EXIT_DURATION = 360;
const fallbackCue = '这处信息建议结合目标完成率、ROI 和续费一起看。';

function makeId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildDashboardSnapshot(activeMenu, dim, channelKey, computeDataState) {
  const computeReady = computeDataState?.status === 'ready';

  return {
    meta: META,
    currentView: { activeMenu, dim, channelKey },
    kpi: KPI,
    derived: KPI_DERIVED,
    channels: CHANNELS,
    channelRoi: CHANNEL_ROI,
    versions: VERSIONS,
    renewal: getRenewalModalData('all', 'month', 'all').overview,
    trend: MONTHLY_TREND,
    operating: OPERATING_OVERVIEW_METRICS,
    compute: computeReady
      ? {
        status: 'ready',
        overview: COMPUTE_OVERVIEW,
        usageTrend: COMPUTE_USAGE_TREND,
      }
      : {
        status: computeDataState?.status || 'idle',
        dataGap: computeDataState?.error || '外部算力数据尚未就绪',
      },
  };
}

function isDailyBriefPrompt(question) {
  return question === DAILY_BRIEF_PROMPT;
}

function buildLocalDailyBriefReply(businessBrief) {
  return `当前快照没有单独今日销售额，以下基于截至当前页面的本月累计数据：${businessBrief.text}`;
}

function readAiErrorMessage(text, status) {
  let detail = text;

  try {
    const payload = JSON.parse(text);
    detail = payload?.error || payload?.message || text;
  } catch {
    detail = text;
  }

  if (/DASHSCOPE_API_KEY|ALIBABA_API_KEY/.test(detail)) {
    return AI_KEY_MISSING_MESSAGE;
  }

  return detail || `AI 分析接口返回 ${status}`;
}

async function readStream(response, onChunk, signal) {
  if (!response.body) {
    const text = await response.text();
    onChunk(text);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    if (signal?.aborted) break;
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onChunk(chunk);
  }

  const tail = decoder.decode();
  if (tail) onChunk(tail);
}

export default function AIAnalysisWidget({
  activeMenu,
  dim,
  channelKey = 'all',
  companionCue,
  context = 'dashboard',
  computeDataState = { status: 'idle', error: '' },
  onNavigateInsight,
}) {
  const [open, setOpen] = useState(false);
  const [mascotAction, setMascotActionState] = useState(MASCOT_ACTIONS.idle);
  const [bubbleCue, setBubbleCue] = useState(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [renderCard, setRenderCard] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const widgetRef = useRef(null);
  const cardWrapRef = useRef(null);
  const listRef = useRef(null);
  const abortRef = useRef(null);
  const mascotTimerRef = useRef(null);
  const guideLockUntilRef = useRef(0);
  const bubbleTimerRef = useRef(null);
  const bubbleExitTimerRef = useRef(null);
  const greetingWaveTimerRef = useRef(null);
  const businessBriefTimerRef = useRef(null);
  const businessBriefShownRef = useRef(new Set());
  const showCompanionCueRef = useRef(null);
  const bubbleFrameRef = useRef(null);
  const hoverCueTimerRef = useRef(null);
  const hoverCueAbortRef = useRef(null);
  const hoverCueCacheRef = useRef(new Map());
  const hoverCueActiveKeyRef = useRef('');
  const hoverCueRequestIdRef = useRef(0);
  const lastBubbleShownAtRef = useRef(0);
  const openStateRef = useRef(false);

  const snapshot = useMemo(
    () => buildDashboardSnapshot(activeMenu, dim, channelKey, computeDataState),
    [activeMenu, dim, channelKey, computeDataState],
  );
  const businessBrief = useMemo(() => buildBusinessBrief(snapshot), [snapshot]);
  showCompanionCueRef.current = showCompanionCue;

  useEffect(() => {
    openStateRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (!renderCard || !cardWrapRef.current) return undefined;

    const ctx = gsap.context(() => {
      const cardWrap = cardWrapRef.current;
      if (!cardWrap) return;

      const card = cardWrap.querySelector('.ai-card');
      const shell = cardWrap.querySelector('.border-glow-inner');
      const content = cardWrap.querySelector('.ai-card-inner');
      const animatedNodes = [cardWrap, card, shell, content].filter(Boolean);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const clearAnimatedNodes = () => {
        gsap.set(animatedNodes, { clearProps: 'willChange' });
      };

      gsap.set(cardWrap, {
        transformOrigin: mobile ? 'right bottom' : 'left bottom',
        willChange: 'transform, opacity',
      });
      gsap.set(animatedNodes, { willChange: 'transform, opacity' });

      if (reduceMotion) {
        if (open) {
          gsap.fromTo(
            cardWrap,
            { autoAlpha: 0, scale: 0.98 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.18,
              ease: 'power1.out',
              clearProps: 'transform,opacity,visibility,willChange',
              onComplete: clearAnimatedNodes,
            },
          );
          return;
        }

        gsap.to(cardWrap, {
          autoAlpha: 0,
          scale: 0.98,
          duration: 0.16,
          ease: 'power1.in',
          clearProps: 'transform,opacity,visibility,willChange',
          onComplete: () => {
            clearAnimatedNodes();
            setRenderCard(false);
          },
        });
        return;
      }

      if (open) {
        gsap.timeline({
          defaults: { overwrite: 'auto' },
          onComplete: clearAnimatedNodes,
        })
          .fromTo(
            cardWrap,
            { autoAlpha: 0, scale: 0.22, y: 34, rotation: mobile ? 2 : -2 },
            { autoAlpha: 1, scale: 1.05, y: -4, rotation: 0, duration: 0.34, ease: 'power3.out' },
            0,
          )
          .to(cardWrap, { scale: 1, y: 0, duration: 0.58, ease: 'elastic.out(0.72, 0.44)' }, 0.2)
          .fromTo(
            shell,
            { borderRadius: 999, scaleX: 0.82, scaleY: 0.76 },
            { borderRadius: 24, scaleX: 1, scaleY: 1, duration: 0.62, ease: 'elastic.out(0.76, 0.5)' },
            0,
          )
          .fromTo(
            content,
            { autoAlpha: 0, scale: 0.96, y: 14 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.28, ease: 'power2.out' },
            0.2,
          );
        return;
      }

      gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          clearAnimatedNodes();
          setRenderCard(false);
        },
      })
        .to(content, { autoAlpha: 0, scale: 0.96, y: 10, duration: 0.14, ease: 'power1.in' }, 0)
        .to(
          shell,
          { borderRadius: 999, scaleX: 0.78, scaleY: 0.72, duration: 0.32, ease: 'back.in(1.4)' },
          0,
        )
        .to(
          cardWrap,
          { autoAlpha: 0, scale: 0.22, y: 34, rotation: mobile ? 2 : -2, duration: 0.34, ease: 'power2.in' },
          0.08,
        );
    }, widgetRef);

    return () => ctx.revert();
  }, [open, renderCard]);

  useEffect(() => () => {
    abortRef.current?.abort();
    hoverCueAbortRef.current?.abort();
    clearTimeout(mascotTimerRef.current);
    clearTimeout(bubbleTimerRef.current);
    clearTimeout(bubbleExitTimerRef.current);
    clearTimeout(greetingWaveTimerRef.current);
    clearTimeout(businessBriefTimerRef.current);
    clearTimeout(hoverCueTimerRef.current);
    if (bubbleFrameRef.current) {
      window.cancelAnimationFrame(bubbleFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (context !== 'dashboard') return undefined;

    const businessMonth = snapshot.meta?.monthLabel || 'current';
    const storageKey = `${BUSINESS_BRIEF_STORAGE_PREFIX}:${businessMonth}`;
    if (businessBriefShownRef.current.has(storageKey)) return undefined;
    try {
      if (window.sessionStorage.getItem(storageKey) === 'shown') {
        businessBriefShownRef.current.add(storageKey);
        return undefined;
      }
    } catch {
      // The brief still works when storage is unavailable (for example, strict privacy mode).
    }

    businessBriefTimerRef.current = window.setTimeout(() => {
      const shown = showCompanionCueRef.current?.(
        { text: businessBrief.text, action: MASCOT_ACTIONS.talk },
        {
          openDialog: false,
          duration: BUSINESS_BRIEF_DURATION,
        },
      );
      if (!shown) return;
      businessBriefShownRef.current.add(storageKey);

      try {
        window.sessionStorage.setItem(storageKey, 'shown');
      } catch {
        // Avoid blocking the dashboard when storage is unavailable.
      }
    }, BUSINESS_BRIEF_DELAY);

    return () => clearTimeout(businessBriefTimerRef.current);
  }, [businessBrief, context, snapshot.meta?.monthLabel]);

  useEffect(() => {
    greetingWaveTimerRef.current = window.setTimeout(() => {
      if (openStateRef.current || hoverCueActiveKeyRef.current || Date.now() < guideLockUntilRef.current) return;
      playMascotAction(MASCOT_ACTIONS.wave, GREETING_WAVE_DURATION, false);
    }, GREETING_WAVE_DELAY);

    return () => clearTimeout(greetingWaveTimerRef.current);
  }, []);

  useEffect(() => {
    async function requestHoverCue(text, cacheKey) {
      if (hoverCueActiveKeyRef.current !== cacheKey) return;

      const cachedCue = hoverCueCacheRef.current.get(cacheKey);
      if (cachedCue) {
        showCompanionCue(
          { text: cachedCue, action: MASCOT_ACTIONS.talk },
          { openDialog: false, duration: HOVER_CUE_DURATION, respectCooldown: true },
        );
        return;
      }

      hoverCueAbortRef.current?.abort();
      const controller = new AbortController();
      hoverCueAbortRef.current = controller;
      const requestId = hoverCueRequestIdRef.current + 1;
      hoverCueRequestIdRef.current = requestId;
      setMascotAction(MASCOT_ACTIONS.think);

      try {
        const response = await fetch('/api/ai/hover-cue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, snapshot }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`AI 悬浮气泡接口返回 ${response.status}`);
        }

        const payload = await response.json();
        const cue = normalizeHoverCueText(payload.cue);
        if (!cue || hoverCueRequestIdRef.current !== requestId || hoverCueActiveKeyRef.current !== cacheKey) return;

        hoverCueCacheRef.current.set(cacheKey, cue);
        showCompanionCue({ text: cue, action: MASCOT_ACTIONS.talk }, { openDialog: false, duration: HOVER_CUE_DURATION, respectCooldown: true });
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (hoverCueActiveKeyRef.current !== cacheKey) return;
        showCompanionCue({ text: fallbackCue, action: MASCOT_ACTIONS.think }, { openDialog: false, duration: 3200, respectCooldown: true });
      } finally {
        if (hoverCueAbortRef.current === controller) {
          hoverCueAbortRef.current = null;
        }
      }
    }

    function handleTextPointerOver(event) {
      clearTimeout(hoverCueTimerRef.current);
      const text = getHoverCueTextFromElement(event.target);
      if (!shouldRequestHoverCue(text)) {
        hoverCueActiveKeyRef.current = '';
        hoverCueAbortRef.current?.abort();
        hoverCueAbortRef.current = null;
        return;
      }

      const normalizedText = normalizeHoverCueText(text);
      const cacheKey = buildHoverCueCacheKey({
        activeMenu,
        dim,
        channelKey,
        text: normalizedText,
      });
      if (hoverCueActiveKeyRef.current === cacheKey) return;

      hoverCueActiveKeyRef.current = cacheKey;
      hoverCueAbortRef.current?.abort();
      hoverCueAbortRef.current = null;

      hoverCueTimerRef.current = window.setTimeout(() => {
        requestHoverCue(normalizedText, cacheKey);
      }, HOVER_CUE_DELAY);
    }

    document.addEventListener('pointerover', handleTextPointerOver);
    return () => {
      document.removeEventListener('pointerover', handleTextPointerOver);
      clearTimeout(hoverCueTimerRef.current);
    };
  }, [activeMenu, dim, channelKey, snapshot]);

  useEffect(() => {
    if (!companionCue) return;
    showCompanionCue(companionCue, { openDialog: false });
  }, [companionCue]);

  useEffect(() => {
    setMascotAction((current) => (
      current === MASCOT_ACTIONS.click || current === MASCOT_ACTIONS.guide ? current : getRestingMascotAction(open)
    ));
  }, [open]);

  function getRestingMascotAction(nextOpen = open) {
    return nextOpen ? MASCOT_ACTIONS.talk : MASCOT_ACTIONS.idle;
  }

  function setMascotAction(nextAction, { force = false } = {}) {
    setMascotActionState((current) => {
      const resolvedAction = typeof nextAction === 'function' ? nextAction(current) : nextAction;
      if (!force && resolvedAction !== MASCOT_ACTIONS.guide && Date.now() < guideLockUntilRef.current) {
        return current;
      }
      return resolvedAction;
    });
  }

  function playMascotAction(action, duration = 0, nextOpen = open) {
    clearTimeout(mascotTimerRef.current);
    if (action === MASCOT_ACTIONS.guide && duration) {
      guideLockUntilRef.current = Date.now() + duration;
    } else {
      guideLockUntilRef.current = 0;
    }
    setMascotAction(action, { force: action === MASCOT_ACTIONS.guide || action === MASCOT_ACTIONS.click });
    if (!duration) return;

    mascotTimerRef.current = setTimeout(() => {
      if (action === MASCOT_ACTIONS.guide) {
        guideLockUntilRef.current = 0;
      }
      setMascotAction(getRestingMascotAction(nextOpen), { force: true });
    }, duration);
  }

  function showCompanionCue(cue, { openDialog = false, duration = 5600, respectCooldown = false } = {}) {
    if (!cue?.text) return false;
    const now = Date.now();
    if (respectCooldown && now - lastBubbleShownAtRef.current < HOVER_BUBBLE_COOLDOWN) {
      return false;
    }
    lastBubbleShownAtRef.current = now;

    clearTimeout(bubbleTimerRef.current);
    clearTimeout(bubbleExitTimerRef.current);
    if (bubbleFrameRef.current) {
      window.cancelAnimationFrame(bubbleFrameRef.current);
    }
    setBubbleVisible(false);
    setBubbleCue(cue);
    setMascotAction(cue.action ?? getSpeechAction(cue.text));
    bubbleFrameRef.current = window.requestAnimationFrame(() => {
      bubbleFrameRef.current = null;
      setBubbleVisible(true);
    });

    if (openDialog) {
      openAiDialog();
    }

    bubbleTimerRef.current = setTimeout(() => {
      setBubbleVisible(false);
      bubbleExitTimerRef.current = setTimeout(() => {
        setBubbleCue(null);
        setMascotAction(getRestingMascotAction(openDialog || open));
      }, BUBBLE_EXIT_DURATION);
    }, duration);
    return true;
  }

  function openAiDialog() {
    setRenderCard(true);
    setOpen(true);
  }

  function closeAiDialog() {
    setOpen(false);
  }

  function handleInsightAction(target) {
    onNavigateInsight?.(target);
    closeAiDialog();
  }

  function handleMascotClick() {
    const nextOpen = !open;
    showCompanionCue({
      action: nextOpen ? MASCOT_ACTIONS.guide : MASCOT_ACTIONS.talk,
      text: nextOpen ? '我把 AI 经营分析窗口打开了，您可以直接问经营问题。' : '我先收起来，有需要再点我。',
    }, { openDialog: false, duration: 3800 });

    if (nextOpen) {
      playMascotAction(MASCOT_ACTIONS.guide, GUIDE_MOTION_DURATION, true);
      openAiDialog();
      return;
    }

    playMascotAction(MASCOT_ACTIONS.click, CLICK_MOTION_DURATION, false);
    closeAiDialog();
  }

  async function submit(nextPrompt = draft) {
    const question = nextPrompt.trim();
    if (!question || loading) return;

    const userMessage = { id: makeId('user'), role: 'user', content: question };
    const assistantId = makeId('assistant');
    const assistantMessage = { id: assistantId, role: 'assistant', content: '' };
    const controller = new AbortController();
    abortRef.current = controller;

    openAiDialog();
    showCompanionCue({ text: '收到，我正在结合当前页面经营数据分析。', action: MASCOT_ACTIONS.think }, { duration: 3600 });
    setDraft('');
    setError('');

    if (isDailyBriefPrompt(question)) {
      setMessages((current) => [
        ...current,
        userMessage,
        { ...assistantMessage, content: buildLocalDailyBriefReply(businessBrief) },
      ]);
      showCompanionCue({ text: '今日简报已按当前页面数据生成。', action: MASCOT_ACTIONS.talk }, { duration: 4200 });
      playMascotAction(MASCOT_ACTIONS.talk, 1800, false);
      return;
    }

    setLoading(true);
    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, snapshot }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(readAiErrorMessage(text, response.status));
      }

      playMascotAction(MASCOT_ACTIONS.talk, 0, true);
      await readStream(response, (chunk) => {
        setMessages((current) => current.map((item) => (
          item.id === assistantId ? { ...item, content: `${item.content}${chunk}` } : item
        )));
      }, controller.signal);
    } catch (err) {
      if (err.name !== 'AbortError') {
        const message = err.message || 'AI 分析失败，请稍后重试。';
        setError(message);
        showCompanionCue({ text: message, action: MASCOT_ACTIONS.alert }, { duration: 5200 });
        setMessages((current) => (
          current.some((item) => item.id === assistantId && !item.content)
            ? current.filter((messageItem) => messageItem.id !== assistantId)
            : current
        ));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
      setMascotAction(getRestingMascotAction(true));
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    setLoading(false);
    setMascotAction(getRestingMascotAction(true));
  }

  return (
    <div className={`ai-widget ai-widget--${mascotAction}${open ? ' ai-widget--open' : ''}${bubbleCue && bubbleVisible ? ' ai-widget--speaking' : ''}`} ref={widgetRef}>
      {bubbleCue && (
        <div className={`ai-bubble${bubbleVisible ? ' ai-bubble--visible' : ''}`} role="status" aria-live="polite">
          <span>{bubbleCue.text}</span>
        </div>
      )}

      <button
        className={`ai-orb ai-orb--${mascotAction}`}
        type="button"
        aria-label={open ? '收起 AI 分析工具' : '打开 AI 分析工具'}
        aria-expanded={open}
        onClick={handleMascotClick}
      >
        <MascotSpriteStage
          action={mascotAction}
          analysisActive={open || loading}
          context={context}
          label="福小客 AI 经营助手"
        />
      </button>

      {renderCard && (
        <div className="ai-card-wrap" ref={cardWrapRef}>
          <BorderGlow
            className="ai-card"
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="var(--ai-card-bg)"
            borderRadius={24}
            glowRadius={34}
            glowIntensity={2.2}
            coneSpread={25}
            animated
            colors={['#8E86FF', '#E4B8D7', '#C9A96B']}
          >
            <section className="ai-card-inner" aria-label="AI 分析对话框">
              <header className="ai-card-head">
                <div>
                  <h2>AI 经营分析</h2>
                  <p>通义 Qwen3.7 Max · 当前页面数据</p>
                </div>
                <button className="ai-close" type="button" aria-label="关闭 AI 分析工具" onClick={closeAiDialog}>
                  <AppIcon name="close" size={17} />
                </button>
              </header>

              <div className="ai-insight-actions" aria-label="定位看板指标">
                {INSIGHT_ACTIONS.map((action) => (
                  <button
                    key={action.target}
                    type="button"
                    title={`定位到${action.label}数据`}
                    onClick={() => handleInsightAction(action.target)}
                  >
                    <AppIcon name={action.icon} size={15} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              <div className="ai-quick-list" aria-label="快捷问题">
                {QUICK_PROMPTS.map((item) => (
                  <button key={item.id} type="button" onClick={() => submit(item.prompt)} disabled={loading}>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="ai-message-list" ref={listRef}>
                {messages.map((message) => (
                  <div className={`ai-message ai-message--${message.role}`} key={message.id}>
                    <span className="ai-message-role">{message.role === 'user' ? '你' : 'AI'}</span>
                    <div className="ai-message-body">
                      {message.content || (
                        <ShinyText
                          text="正在分析页面经营数据..."
                          speed={2}
                          delay={0}
                          color="#B9C2D4"
                          shineColor="#ffffff"
                          spread={120}
                          direction="left"
                          yoyo={false}
                          pauseOnHover={false}
                          disabled={false}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {error && <div className="ai-error">{error}</div>}

              <form
                className="ai-compose"
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
              >
                <textarea
                  value={draft}
                  rows={2}
                  placeholder="问一下当前经营数据..."
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      submit();
                    }
                  }}
                />
                {loading ? (
                  <button className="ai-send" type="button" onClick={stopStreaming}>
                    停止
                  </button>
                ) : (
                  <button className="ai-send" type="submit" disabled={!draft.trim()}>
                    发送
                  </button>
                )}
              </form>
            </section>
          </BorderGlow>
        </div>
      )}
    </div>
  );
}
