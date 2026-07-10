/*
 更新时间: 2026-07-10 12:11:00 CST
 更新内容: 新增福小客毫秒级非匀速时间线解析、减少动态代表帧与单层动作 bridge 构建。
*/

function getEntryDuration(entry) {
  return Math.max(1, Number(entry?.durationMs) || 0);
}

export function getMascotTimelineDuration(timeline = []) {
  return timeline.reduce((total, entry) => total + getEntryDuration(entry), 0);
}

export function resolveMascotTimeline(animation, elapsedMs = 0) {
  const timeline = animation?.timeline ?? [];
  const durationMs = getMascotTimelineDuration(timeline);
  if (!timeline.length || durationMs <= 0) {
    return {
      cursor: 0,
      frame: 0,
      loopCount: 0,
      finished: true,
      durationMs: 0,
    };
  }

  const safeElapsed = Math.max(0, Number(elapsedMs) || 0);
  const loopCount = animation.loop ? Math.floor(safeElapsed / durationMs) : 0;
  const cycleElapsed = animation.loop
    ? safeElapsed % durationMs
    : Math.min(safeElapsed, durationMs - 1);
  let accumulated = 0;
  let cursor = timeline.length - 1;

  for (let index = 0; index < timeline.length; index += 1) {
    accumulated += getEntryDuration(timeline[index]);
    if (cycleElapsed < accumulated) {
      cursor = index;
      break;
    }
  }

  return {
    cursor,
    frame: timeline[cursor].frame,
    loopCount,
    finished: !animation.loop && safeElapsed >= durationMs,
    durationMs,
  };
}

export function getMascotReducedMotionFrame(animation) {
  const timeline = animation?.timeline ?? [];
  const preferred = Number(animation?.reducedMotionFrame);
  if (Number.isInteger(preferred) && timeline.some((entry) => entry.frame === preferred)) {
    return preferred;
  }
  return timeline[0]?.frame ?? 0;
}

function createBridgeEntry(animation, entry) {
  return Object.freeze({
    actionKey: animation.key,
    intensity: animation.intensity,
    sheetKey: animation.sheetKey,
    frame: entry.frame,
    durationMs: Math.min(120, Math.max(60, getEntryDuration(entry))),
  });
}

export function buildMascotMotionBridge(fromAnimation, fromCursor, toAnimation) {
  if (
    fromAnimation.key === toAnimation.key
    && fromAnimation.sheetKey === toAnimation.sheetKey
  ) {
    return null;
  }

  const safeFromCursor = Math.max(
    0,
    Math.min(Number(fromCursor) || 0, fromAnimation.timeline.length - 1),
  );
  const settleCount = Math.max(0, Number(fromAnimation.settleFrameCount) || 0);
  const leadInCount = Math.max(0, Number(toAnimation.leadInFrameCount) || 0);
  const outgoing = fromAnimation.timeline
    .slice(Math.max(0, safeFromCursor - settleCount + 1), safeFromCursor + 1)
    .reverse()
    .map((entry) => createBridgeEntry(fromAnimation, entry));
  const incoming = toAnimation.timeline
    .slice(0, leadInCount)
    .map((entry) => createBridgeEntry(toAnimation, entry));
  const timeline = Object.freeze([...outgoing, ...incoming]);

  if (!timeline.length) return null;

  return Object.freeze({
    timeline,
    targetAction: toAnimation.key,
    targetCursor: incoming.length,
  });
}
