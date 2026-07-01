/*
 更新时间: 2026-06-29 10:45:53
 更新内容: 续费率聚合工具支持多选销售维度筛选，兼容原单维度筛选调用。
*/

function round1(value) {
  return Math.round(value * 10) / 10;
}

function emptySummary() {
  return {
    due: 0,
    renewed: 0,
    revenue: 0,
    prevDue: 0,
    prevRenewed: 0,
    rate: 0,
    prevRate: 0,
    delta: 0,
  };
}

function summarize(rows, period) {
  const total = rows.reduce((acc, row) => {
    const data = row.periods?.[period] ?? row.periods?.month;
    if (!data) return acc;
    acc.due += data.due ?? 0;
    acc.renewed += data.renewed ?? 0;
    acc.revenue += data.revenue ?? 0;
    acc.prevDue += data.prevDue ?? 0;
    acc.prevRenewed += data.prevRenewed ?? 0;
    return acc;
  }, emptySummary());

  total.rate = total.due ? round1((total.renewed / total.due) * 100) : 0;
  total.prevRate = total.prevDue ? round1((total.prevRenewed / total.prevDue) * 100) : 0;
  total.delta = round1(total.rate - total.prevRate);
  return total;
}

function filterRows(rows, { version = 'all', channel = 'all' } = {}) {
  const channelSet = Array.isArray(channel) ? new Set(channel) : null;
  return rows.filter((row) => {
    const versionMatched = !version || version === 'all' || row.version === version;
    const channelMatched = channelSet
      ? channelSet.size === 0 || channelSet.has(row.channel)
      : !channel || channel === 'all' || row.channel === channel;
    return versionMatched && channelMatched;
  });
}

export function calculateRenewalOverview(rows, { version = 'all', period = 'month', channel = 'all' } = {}) {
  return summarize(filterRows(rows, { version, channel }), period);
}

export function getRenewalChannelBreakdown(rows, { version = 'all', period = 'month', channel = 'all' } = {}) {
  const grouped = new Map();
  filterRows(rows, { version, channel }).forEach((row) => {
    const key = row.channel;
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        name: row.channelName,
        rows: [],
      });
    }
    grouped.get(key).rows.push(row);
  });

  return Array.from(grouped.values()).map((group) => ({
    key: group.key,
    name: group.name,
    ...summarize(group.rows, period),
  }));
}
