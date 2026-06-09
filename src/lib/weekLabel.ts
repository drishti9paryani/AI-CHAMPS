/** Convert any Date to its ISO year-week string, e.g. "2026-W24" */
function dateToWeekLabel(d: Date): string {
  // Work in UTC to avoid tz surprises
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayOfWeek = date.getUTCDay() || 7 // Mon=1 … Sun=7
  // Move to nearest Thursday — the ISO-week anchor
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${weekNum.toString().padStart(2, '0')}`
}

/** The current ISO year-week, e.g. "2026-W24" */
export function getCurrentWeekLabel(): string {
  return dateToWeekLabel(new Date())
}

/** ISO week label for N weeks ago (0 = this week, 1 = last week, …) */
export function getWeekLabelOffset(weeksAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - weeksAgo * 7)
  return dateToWeekLabel(d)
}

/** ISO week N weeks from now (0 = this week, 1 = next week, …) */
export function getWeekLabelAhead(weeksAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + weeksAhead * 7)
  return dateToWeekLabel(d)
}

/** Convert a stored ISO date string to its ISO week label */
export function dateStringToWeekLabel(dateStr: string): string {
  return dateToWeekLabel(new Date(dateStr))
}

/** Human-friendly label: "Week of 9 Jun" */
export function weekLabelToDisplay(label: string): string {
  const [yearStr, wStr] = label.split('-W')
  const year = parseInt(yearStr)
  const week = parseInt(wStr)
  // Jan 4 is always in Week 1 of its year
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7)
  return `Week of ${monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
}
