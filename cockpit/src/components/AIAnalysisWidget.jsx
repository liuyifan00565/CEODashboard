/*
 更新时间: 2026-07-01 11:19:49 CST
 更新内容: AI 分析入口增加页面文字悬浮千问短气泡，鼠标停留在经营文字上时福小客即时提示。
*/
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

import BorderGlow from './BorderGlow/BorderGlow';
import Mascot3DStage from './Mascot3DStage';
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
const HOVER_CUE_DELAY = 650;
const HOVER_CUE_DURATION = 4200;
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

export default function AIAnalysisWidget({ activeMenu, dim, channelKey = 'all', companionCue }) {
  const [open, setOpen] = useState(false);
  const [mascotAction, setMascotAction] = useState(MASCOT_ACTIONS.idle);
  const [mascotPointer, setMascotPointer] = useState({ x: 0, y: 0, active: false });
  const [bubbleCue, setBubbleCue] = useState(() => getIdleCompanionCue(0));
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
  const bubbleTimerRef = useRef(null);
  const hoverCueTimerRef = useRef(null);
  const hoverCueAbortRef = useRef(null);
  const hoverCueCacheRef = useRef(new Map());
  const hoverCueRequestIdRef = useRef(0);
  const idlePromptIndexRef = useRef(0);

  const snapshot = useMemo(() => buildDashboardSnapshot(activeMenu, dim, channelKey), [activeMenu, dim, channelKey]);

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
    clearTimeout(hoverCueTimerRef.current);
  }, []);

  useEffect(() => {
    async function requestHoverCue(text, cacheKey) {
      const cachedCue = hoverCueCacheRef.current.get(cacheKey);
      if (cachedCue) {
        showCompanionCue({ text: cachedCue, action: MASCOT_ACTIONS.talk }, { openDialog: false, duration: HOVER_CUE_DURATION });
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
        if (!cue || hoverCueRequestIdRef.current !== requestId) return;

        hoverCueCacheRef.current.set(cacheKey, cue);
        showCompanionCue({ text: cue, action: MASCOT_ACTIONS.talk }, { openDialog: false, duration: HOVER_CUE_DURATION });
      } catch (err) {
        if (err.name === 'AbortError') return;
        showCompanionCue({ text: fallbackCue, action: MASCOT_ACTIONS.think }, { openDialog: false, duration: 3200 });
      } finally {
        if (hoverCueAbortRef.current === controller) {
          hoverCueAbortRef.current = null;
        }
      }
    }

    function handleTextPointerOver(event) {
      clearTimeout(hoverCueTimerRef.current);
      const text = getHoverCueTextFromElement(event.target);
      if (!shouldRequestHoverCue(text)) return;

      const normalizedText = normalizeHoverCueText(text);
      const cacheKey = buildHoverCueCacheKey({
        activeMenu,
        dim,
        channelKey,
        text: normalizedText,
      });

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
    if (open) return undefined;
    const idleTimer = window.setInterval(() => {
      idlePromptIndexRef.current += 1;
      showCompanionCue(getIdleCompanionCue(idlePromptIndexRef.current), { openDialog: false });
    }, 12000);

    return () => window.clearInterval(idleTimer);
  }, [open]);

  useEffect(() => {
    if (!companionCue) return;
    showCompanionCue(companionCue, { openDialog: false });
  }, [companionCue]);

  useEffect(() => {
    setMascotAction((current) => (
      current === MASCOT_ACTIONS.click ? current : getRestingMascotAction(open)
    ));
  }, [open]);

  function getRestingMascotAction(nextOpen = open) {
    return nextOpen ? MASCOT_ACTIONS.talk : MASCOT_ACTIONS.idle;
  }

  function playMascotAction(action, duration = 0, nextOpen = open) {
    clearTimeout(mascotTimerRef.current);
    setMascotAction(action);
    if (!duration) return;

    mascotTimerRef.current = setTimeout(() => {
      setMascotAction(getRestingMascotAction(nextOpen));
    }, duration);
  }

  function showCompanionCue(cue, { openDialog = false, duration = 5600 } = {}) {
    if (!cue?.text) return;
    clearTimeout(bubbleTimerRef.current);
    setBubbleCue(cue);
    setMascotAction(cue.action ?? getSpeechAction(cue.text));

    if (openDialog) {
      openAiDialog();
    }

    bubbleTimerRef.current = setTimeout(() => {
      setBubbleCue(null);
      setMascotAction(getRestingMascotAction(openDialog || open));
    }, duration);
  }

  function openAiDialog() {
    setRenderCard(true);
    setOpen(true);
  }

  function closeAiDialog() {
    setOpen(false);
  }

  function handleMascotPointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setMascotPointer({
      x: Math.max(-1, Math.min(1, (event.clientX - centerX) / (rect.width / 2))),
      y: Math.max(-1, Math.min(1, (event.clientY - centerY) / (rect.height / 2))),
      active: true,
    });
  }

  function handleMascotEnter() {
    if (mascotAction === MASCOT_ACTIONS.click) return;
    setMascotAction(MASCOT_ACTIONS.wave);
  }

  function handleMascotLeave() {
    setMascotPointer({ x: 0, y: 0, active: false });
    if (mascotAction === MASCOT_ACTIONS.click) return;
    setMascotAction(getRestingMascotAction());
  }

  function handleMascotClick() {
    const nextOpen = !open;
    playMascotAction(MASCOT_ACTIONS.click, 860, nextOpen);
    showCompanionCue({
      action: MASCOT_ACTIONS.talk,
      text: nextOpen ? '我把 AI 经营分析窗口打开了，您可以直接问经营问题。' : '我先收起来，有需要再点我。',
    }, { openDialog: false, duration: 3800 });

    if (nextOpen) {
      openAiDialog();
      return;
    }
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
    <div className={`ai-widget${open ? ' ai-widget--open' : ''}${bubbleCue ? ' ai-widget--speaking' : ''}`} ref={widgetRef}>
      {bubbleCue && (
        <div className="ai-bubble" role="status" aria-live="polite">
          <span className="ai-bubble-name">福小客</span>
          <span>{bubbleCue.text}</span>
        </div>
      )}

      <button
        className={`ai-orb ai-orb--${mascotAction}`}
        type="button"
        aria-label={open ? '收起 AI 分析工具' : '打开 AI 分析工具'}
        aria-expanded={open}
        onPointerMove={handleMascotPointerMove}
        onMouseEnter={handleMascotEnter}
        onMouseLeave={handleMascotLeave}
        onClick={handleMascotClick}
      >
        <Mascot3DStage
          action={mascotAction}
          pointer={mascotPointer}
          analysisActive={open || loading}
          label="福小客 3D 经营助手"
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
            colors={['#c084fc', '#f472b6', '#38bdf8']}
          >
            <section className="ai-card-inner" aria-label="AI 分析对话框">
              <header className="ai-card-head">
                <div>
                  <h2>AI 经营分析</h2>
                  <p>通义 Qwen3.7 Max · 当前页面数据</p>
                </div>
                <button className="ai-close" type="button" aria-label="关闭 AI 分析工具" onClick={closeAiDialog}>
                  ×
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
                          color="#8a8892"
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
