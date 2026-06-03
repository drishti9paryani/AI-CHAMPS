import { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
export { ROADMAP_WEEKS } from '@/lib/roadmap'
import { ROADMAP_WEEKS, type RoadmapWeek } from '@/lib/roadmap'

export interface RoadmapConfigRow {
  id: string
  week_number: number
  title: string
  description: string
  tools: string[]
}

export function isAdminUser(user: { role?: string | null; is_admin?: boolean | null }): boolean {
  return user.role === 'admin' || user.is_admin === true
}

export async function fetchRoadmapWeeks(client: SupabaseClient = supabase): Promise<RoadmapWeek[]> {
  const { data } = await client
    .from('roadmap_config')
    .select('week_number, title, description, tools')
    .order('week_number')

  if (!data || data.length === 0) return ROADMAP_WEEKS

  return data.map((row) => {
    const fallback = ROADMAP_WEEKS.find(w => w.week === row.week_number)
    return {
      week: row.week_number,
      title: row.title,
      subtitle: row.description,
      icon: fallback?.icon ?? '📅',
      tools: row.tools ?? [],
    }
  })
}

export async function seedRoadmapIfEmpty(client: SupabaseClient = supabase): Promise<RoadmapConfigRow[]> {
  const { data: existing } = await client.from('roadmap_config').select('*').order('week_number')
  if (existing?.length) return existing

  const rows = ROADMAP_WEEKS.map(w => ({
    week_number: w.week,
    title: w.title,
    description: w.subtitle,
    tools: [] as string[],
  }))
  const { data } = await client.from('roadmap_config').insert(rows).select('*')
  return data ?? []
}

export const FLAG_STYLES = {
  red: { badge: 'bg-red-500/20 text-red-300 border-red-500/40', dot: '🔴' },
  amber: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', dot: '🟠' },
  green: { badge: 'bg-green-500/20 text-green-300 border-green-500/40', dot: '🟢' },
} as const

export type FlagColor = keyof typeof FLAG_STYLES
