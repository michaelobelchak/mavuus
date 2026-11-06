// Sample data for the chart stories, shaped like /api/admin/stats/growth ({ week, start, count }).
export const weeklySignups = [
  ['2026-08-16', 14],
  ['2026-08-23', 9],
  ['2026-08-30', 21],
  ['2026-09-06', 17],
  ['2026-09-13', 26],
  ['2026-09-20', 19],
  ['2026-09-27', 31],
  ['2026-10-04', 24],
  ['2026-10-11', 38],
  ['2026-10-18', 29],
  ['2026-10-25', 42],
  ['2026-11-01', 35],
].map(([start, count], index) => ({ week: index + 1, start, count, invites: Math.round(count * 0.6) }))

export const formatWeek = (start) =>
  new Date(`${start}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
