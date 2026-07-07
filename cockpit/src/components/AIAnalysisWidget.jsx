/*
 更新时间: 2026-07-07 17:45:31 CST
 更新内容: 首次挂载 AI 小人后自动播放约 1 秒挥手动作，并避免覆盖用户点击后的 guide 指引。
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
  KPI,
  KPI_DERIVED,
  META,
  MONTHLY_TREND,
  RENEWAL_OVERVIEW,
  VERSIONS,
} from '../data/mock';
import {
  MASCOT_ACTIONS,
  getIdleCompanionCue,
  getSpeechAction,
} from '../lib/mascotCompanion';
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

const QUICK_PROMPTS = [
  '本月经营最需要 CEO 关注的三个问题是什么？',
  '哪个销售维度拖后腿，应该怎么处理？',
  '从 ROI 和目标完成率看，下个月预算怎么调？',
];
const HOVER_CUE_DELAY = 900;
const HOVER_CUE_DURATION = 4200;
const HOVER_BUBBLE_COOLDOWN = 6000;
const DEFAULT_BUBBLE_INTERVAL = 10000;
const DEFAULT_BUBBLE_DURATION = 4000;
const GREETING_WAVE_DELAY = 240;
const GREETING_WAVE_DURATION = 920;
const BUBBLE_EXIT_DURATION = 360;
const fallbackCue = '这处信息建议结合目标完成率、ROI 和续费一起看。';

function makeId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildDashboardSnapshot(activeMenu, dim, channelKey) {
  return {
    meta: META,
    currentView: { activeMenu, dim, channelKey },
    kpi: KPI,
    derived: KPI_DERIVED,
    channels: CHANNELS,
    channelRoi: CHANNEL_ROI,
    versions: VERSIONS,
    renewal: RENEWAL_OVERVIEW,
    trend: MONTHLY_TREND,
  };
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

export default function AIAnalysisWidget({ activeMenu, dim, channelKey = 'all', companionCue, context = 'dashboard' }) {
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
  const bubbleFrameRef = useRef(null);
  const hoverCueTimerRef = useRef(null);
  const hoverCueAbortRef = useRef(null);
  const hoverCueCacheRef = useRef(new Map());
  const hoverCueActiveKeyRef = useRef('');
  const hoverCueRequestIdRef = useRef(0);
  const idlePromptIndexRef = useRef(0);
  const lastBubbleShownAtRef = useRef(0);
  const openStateRef = useRef(false);

  const snapshot = useMemo(() => buildDashboardSnapshot(activeMenu, dim, channelKey), [activeMenu, dim, channelKey]);

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
    clearTimeout(hoverCueTimerRef.current);
    if (bubbleFrameRef.current) {
      window.cancelAnimationFrame(bubbleFrameRef.current);
    }
  }, []);

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
    if (open) return undefined;

    const idleTimer = window.setInterval(() => {
      if (hoverCueActiveKeyRef.current) return;
      idlePromptIndexRef.current += 1;
      showCompanionCue(getIdleCompanionCue(idlePromptIndexRef.current), {
        openDialog: false,
        duration: DEFAULT_BUBBLE_DURATION,
        respectCooldown: true,
      });
    }, DEFAULT_BUBBLE_INTERVAL);

    return () => window.clearInterval(idleTimer);
  }, [open]);

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

  function handleMascotClick() {
    const nextOpen = !open;
    showCompanionCue({
      action: nextOpen ? MASCOT_ACTIONS.guide : MASCOT_ACTIONS.talk,
      text: nextOpen ? '我把 AI 经营分析窗口打开了，您可以直接问经营问题。' : '我先收起来，有需要再点我。',
    }, { openDialog: false, duration: 3800 });

    if (nextOpen) {
      playMascotAction(MASCOT_ACTIONS.guide, 1000, true);
      openAiDialog();
      return;
    }

    playMascotAction(MASCOT_ACTIONS.click, 860, false);
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
        throw new Error(text || `AI 分析接口返回 ${response.status}`);
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
        setMessages((current) => current.map((item) => (
          item.id === assistantId && !item.content ? { ...item, content: message } : item
        )));
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
      <div className="ai-status-copy" aria-hidden="true">
        <span>AI 助手</span>
        <b>经营分析</b>
      </div>

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

              <div className="ai-quick-list" aria-label="快捷问题">
                {QUICK_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => submit(prompt)} disabled={loading}>
                    {prompt}
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
