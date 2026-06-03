const RED_KEYWORDS = ['stuck', 'blocked', 'urgent', "can't", 'cannot', 'frustrated']
const AMBER_KEYWORDS = ['confused', 'need help', 'unsure', 'struggling']

export function computeRiskFlag(text: string): 'red' | 'amber' | 'green' {
  const lower = text.toLowerCase()
  if (RED_KEYWORDS.some((kw) => lower.includes(kw))) return 'red'
  if (AMBER_KEYWORDS.some((kw) => lower.includes(kw))) return 'amber'
  return 'green'
}

export function worstFlag(flags: ('red' | 'amber' | 'green')[]): 'red' | 'amber' | 'green' {
  if (flags.includes('red')) return 'red'
  if (flags.includes('amber')) return 'amber'
  return 'green'
}
