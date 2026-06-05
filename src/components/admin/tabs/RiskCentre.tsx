'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import { AdminRiskCentreSkeleton } from '@/components/ui/skeletons/AdminSkeletons'

type FlagType = 'Incomplete Onboarding' | 'Inactive 14+ Days' | 'Low Engagement' | 'Roadmap Stalled'

interface RiskyUser {
  id: string
  name: string
  email: string
  department: string
  ai_score: number
  current_week: number | null
  risk_flag: string
  created_at: string
  updated_at: string | null
  flags: FlagType[]
  daysSinceActive: number
}

const FLAG_STYLES: Record<FlagType, string> = {
  'Incomplete Onboarding': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  'Inactive 14+ Days':     'bg-red-500/20 text-red-300 border-red-500/40',
  'Low Engagement':        'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Roadmap Stalled':       'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
}

const ALL_FLAGS: FlagType[] = ['Incomplete Onboarding', 'Inactive 14+ Days', 'Low Engagement', 'Roadmap Stalled']

function computeFlags(u: {
  ai_score: number
  current_week: number | null
  risk_flag: string
  updated_at: string | null
  created_at: string
}): { flags: FlagType[]; daysSinceActive: number } {
  const ref = u.updated_at ?? u.created_at
  const daysSinceActive = Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24))
  const flags: FlagType[] = []
  if (!u.current_week) flags.push('Incomplete Onboarding')
  if (daysSinceActive >= 14) flags.push('Inactive 14+ Days')
  if (u.ai_score < 4) flags.push('Low Engagement')
  if (u.risk_flag === 'red' && u.current_week && u.current_week < 4) flags.push('Roadmap Stalled')
  return { flags, daysSinceActive }
}

export default function RiskCentre() {
  const [users, setUsers] = useState<RiskyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FlagType | ''>('')
  const [reviewed, setReviewed] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase
      .from('users')
      .select('id, name, email, department, ai_score, current_week, risk_flag, created_at, updated_at')
      .then(({ data }) => {
        if (!data) { setLoading(false); return }
        const risky: RiskyUser[] = (data as any[]).map(u => {
          const { flags, daysSinceActive } = computeFlags(u)
          return { ...u, flags, daysSinceActive }
        }).filter(u => u.flags.length > 0)
        setUsers(risky.sort((a, b) => b.flags.length - a.flags.length))
        setLoading(false)
      })
  }, [])

  if (loading) return <AdminRiskCentreSkeleton />

  const visible = users.filter(u => !reviewed.has(u.id))
  const filtered = activeFilter ? visible.filter(u => u.flags.includes(activeFilter)) : visible

  const flagCounts = ALL_FLAGS.reduce((acc, f) => {
    acc[f] = visible.filter(u => u.flags.includes(f)).length
    return acc
  }, {} as Record<FlagType, number>)

  if (visible.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-1">Risk Centre</h2>
          <p className="text-slate-400 text-sm">Automatically surfaced users who need attention.</p>
        </div>
        <EmptyState
          icon="✅"
          title="No users at risk"
          description="Great work! No one is flagged for incomplete onboarding, inactivity, or low engagement right now."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Risk Centre</h2>
        <p className="text-slate-400 text-sm">Automatically surfaced users who need attention.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ALL_FLAGS.map(f => (
          <div
            key={f}
            className={`glass rounded-2xl p-6 cursor-pointer transition ${activeFilter === f ? 'ring-1 ring-purple-500' : 'hover:border-white/20'}`}
            onClick={() => setActiveFilter(activeFilter === f ? '' : f)}
          >
            <p className="text-2xl font-bold text-white">{flagCounts[f]}</p>
            <p className="text-slate-400 text-xs mt-1 leading-tight">{f}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter('')}
          className={`px-4 py-1.5 rounded-full text-sm border transition ${!activeFilter ? 'bg-purple-600/80 border-purple-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/30'}`}
        >
          All ({visible.length})
        </button>
        {ALL_FLAGS.filter(f => flagCounts[f] > 0).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(activeFilter === f ? '' : f)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${activeFilter === f ? 'bg-purple-600/80 border-purple-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/30'}`}
          >
            {f} ({flagCounts[f]})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(u => (
          <GlassCard key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-white font-semibold">{u.name}</p>
                  <p className="text-slate-400 text-xs">{u.department} · AI Score: {u.ai_score}/10</p>
                </div>
                <span className="text-slate-500 text-xs flex-shrink-0">{u.daysSinceActive}d inactive</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {u.flags.map(f => (
                  <span key={f} className={`px-2 py-0.5 rounded-full text-xs border ${FLAG_STYLES[f]}`}>{f}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
              <a
                href={`mailto:${u.email}?subject=AI Champs Check-in&body=Hi ${u.name.split(' ')[0]},%0D%0A%0D%0AJust checking in on your AI Champs journey — would love to hear how it's going and if there's anything we can help with.%0D%0A%0D%0ACheers`}
                className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition text-xs"
              >
                Send Reminder
              </a>
              <button
                onClick={() => setReviewed(prev => new Set([...prev, u.id]))}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition text-xs"
              >
                Mark Reviewed
              </button>
              <a
                href={`mailto:${u.email}?subject=AI Champs Support Session&body=Hi ${u.name.split(' ')[0]},%0D%0A%0D%0AWe'd like to schedule a short support session to help you with the AI Champs program. Would you be available for a quick call this week?%0D%0A%0D%0ACheers`}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition text-xs"
              >
                Schedule Support
              </a>
            </div>
          </GlassCard>
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">No users match this filter.</p>
        )}
      </div>
    </div>
  )
}
