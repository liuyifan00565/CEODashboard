/*
 更新时间: 2026-07-14 14:04:11 CST
 更新内容: 新增真实成交来源聚合，支持按经营渠道筛选后计算净回款、成交数、客户数与贡献占比。
*/

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildChannelSourceBreakdown(rows, channelKey = 'all') {
  const grouped = new Map();

  (rows ?? [])
    .filter((row) => channelKey === 'all' || row.channelKey === channelKey)
    .forEach((row) => {
      const name = String(row.sourceName || '未标注').trim() || '未标注';
      const current = grouped.get(name) ?? {
        key: String(row.sourceKey || name),
        name,
        recovered: 0,
        dealCount: 0,
        customerCount: 0,
        periodStart: '',
        periodEnd: '',
      };
      current.recovered += numberValue(row.recovered);
      current.dealCount += numberValue(row.dealCount);
      current.customerCount += numberValue(row.customerCount);
      if (row.periodStart && (!current.periodStart || row.periodStart < current.periodStart)) current.periodStart = row.periodStart;
      if (row.periodEnd && (!current.periodEnd || row.periodEnd > current.periodEnd)) current.periodEnd = row.periodEnd;
      grouped.set(name, current);
    });

  const items = [...grouped.values()].sort((a, b) => b.recovered - a.recovered || b.dealCount - a.dealCount);
  const totalRecovered = items.reduce((sum, row) => sum + row.recovered, 0);
  return items.map((row) => ({
    ...row,
    recovered: Math.round(row.recovered * 100) / 100,
    share: totalRecovered > 0 ? Math.round((row.recovered / totalRecovered) * 1000) / 10 : 0,
  }));
}

export function channelSourcePeriodLabel(rows) {
  const starts = rows.map((row) => row.periodStart).filter(Boolean).sort();
  const ends = rows.map((row) => row.periodEnd).filter(Boolean).sort();
  if (!starts.length || !ends.length) return '暂无成交日期';
  const [startYear, startMonth] = starts[0].slice(0, 7).split('-').map(Number);
  const [endYear, endMonth] = ends.at(-1).slice(0, 7).split('-').map(Number);
  if (startYear === endYear && startMonth === endMonth) return `${startYear}年${startMonth}月`;
  if (startYear === endYear) return `${startYear}年${startMonth}月-${endMonth}月`;
  return `${startYear}年${startMonth}月-${endYear}年${endMonth}月`;
}
