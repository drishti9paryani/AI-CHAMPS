export interface TarotCardData {
  title: string
  description: string
  strength: string
  growth_area: string
  prediction: string
}

export const CARD_COLORS: Record<string, string> = {
  'The Prompt Wizard': 'from-violet-600 to-purple-900',
  'The Workflow Architect': 'from-blue-600 to-cyan-900',
  'The Curious Hacker': 'from-green-600 to-teal-900',
  'The Automation Monk': 'from-orange-600 to-amber-900',
  'The AI Explorer': 'from-pink-600 to-rose-900',
  'The Agent Builder': 'from-indigo-600 to-blue-900',
}

export function getCardGradient(title?: string | null): string {
  if (!title) return 'from-purple-600 to-blue-900'
  return CARD_COLORS[title] || 'from-purple-600 to-blue-900'
}
