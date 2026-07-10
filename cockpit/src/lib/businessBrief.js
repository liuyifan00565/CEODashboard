/*
 * 更新时间: 2026-07-10 14:50:00 CST
 * 更新内容: 事实组改为独立降级，并排除未设正目标的渠道参与完成率排名。
 */

const CORE_VERSION_KEYS = new Set(['qihang', 'zhuoyue', 'zhizun', 'custom']);

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatNumber(value) {
  return String(Math.round(value * 10) / 10);
}

function buildPerformanceFact(snapshot) {
  const recovered = snapshot?.kpi?.monthRecovered;
  const target = snapshot?.kpi?.monthTarget;
  const suppliedCompletion = snapshot?.derived?.monthCompletion;

  if (!isFiniteNumber(recovered) || !isFiniteNumber(target) || target <= 0) return null;

  const completion = isFiniteNumber(suppliedCompletion)
    ? suppliedCompletion
    : (recovered / target) * 100;

  return {
    recovered,
    target,
    completion,
    text: `本月回款 ${formatNumber(recovered)} 万，目标 ${formatNumber(target)} 万，完成率 ${formatNumber(completion)}%。`,
  };
}

function buildChannelFact(channels) {
  const recoveryCandidates = Array.isArray(channels)
    ? channels.filter((channel) => (
        channel?.name
        && isFiniteNumber(channel.recovered)
      ))
    : [];

  if (!recoveryCandidates.length) return null;

  const leader = recoveryCandidates.reduce((best, channel) => (
    channel.recovered > best.recovered ? channel : best
  ));
  const completionCandidates = recoveryCandidates.filter((channel) => (
    isFiniteNumber(channel.target)
    && channel.target > 0
    && isFiniteNumber(channel.completion)
  ));
  const laggard = completionCandidates.length
    ? completionCandidates.reduce((worst, channel) => (
        channel.completion < worst.completion ? channel : worst
      ))
    : null;

  return {
    leader,
    laggard,
    text: laggard
      ? `${leader.name}回款最高 ${formatNumber(leader.recovered)} 万；${laggard.name}完成率最低 ${formatNumber(laggard.completion)}%。`
      : `${leader.name}回款最高 ${formatNumber(leader.recovered)} 万。`,
  };
}

function buildVersionFact(versions) {
  const coreVersions = Array.isArray(versions)
    ? versions.filter((version) => (
        CORE_VERSION_KEYS.has(version?.key)
        && version?.name
        && isFiniteNumber(version.units)
        && version.units >= 0
      ))
    : [];

  if (!coreVersions.length) return null;

  const totalUnits = coreVersions.reduce((sum, version) => sum + version.units, 0);
  if (totalUnits <= 0) return null;

  const leader = coreVersions.reduce((best, version) => (
    version.units > best.units ? version : best
  ));
  const share = (leader.units / totalUnits) * 100;

  return {
    leader,
    share,
    text: `${leader.name}客户数量最多，共 ${formatNumber(leader.units)} 套，占核心版本 ${formatNumber(share)}%。`,
  };
}

export function buildBusinessBrief(snapshot = {}) {
  const performance = buildPerformanceFact(snapshot);
  const channel = buildChannelFact(snapshot.channels);
  const version = buildVersionFact(snapshot.versions);
  const facts = [];
  const highlights = [];

  if (performance) {
    facts.push({ id: 'performance', target: 'performance', text: performance.text });
  }

  if (channel) {
    facts.push({ id: 'channels', target: 'channels', text: channel.text });
    highlights.push(`${channel.leader.name}回款最高`);
  }

  if (version) {
    facts.push({ id: 'versions', target: 'versions', text: version.text });
    highlights.push(`${version.leader.name}客户数量最多`);
  }

  if (!facts.length) {
    return {
      text: '当前页面数据已加载，可点击查看经营分析。',
      facts: [],
      primaryAction: 'performance',
    };
  }

  const performanceSummary = performance
    ? `本月回款 ${formatNumber(performance.recovered)} 万，目标完成率 ${formatNumber(performance.completion)}%`
    : '';
  const text = performanceSummary
    ? `${performanceSummary}${highlights.length ? `；${highlights.join('，')}` : ''}。`
    : `${highlights.join('，')}。`;

  return {
    text,
    facts,
    primaryAction: facts[0].target,
  };
}
