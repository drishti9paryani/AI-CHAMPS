'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'

const TOTAL_WEEKS = 12

interface TeamData {
  dept: string
  total: number
  avgScore: number
  avgCompletion: number
  activeCount: number
  atRisk: number
  healthScore: number
}

function healthColor(score: number) {
  if (score >= 70) return { text: 'text-green-300', bg: 'bg-green-500', badge: 'bg-green-500/20 text-green-300 border-green-500/30' }
  if (score >= 45) return { text: 'text-amber-300', bg: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
  return { text: 'text-red-300', bg: 'bg-red-500', badge: 'bg-red-500/20 text-red-300 border-red-500/30' }
}

function healthLabel(score: number) {
  if (score >= 70) return 'Strong'
  if (score >= 45) return 'Moderate'
  return 'Needs Support'
}

export default function TeamView() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: users }, { data: forms }] = await Promise.all([
        supabase
          .from('users')
          .select('id, department, ai_score, risk_flag, current_week, onboarding_complete'),
        supabase
          .from('champ_forms')
          .select('user_id, created_at'),
      ])

      if (!users) { setLoading(false); return }

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const activeSet = new Set(
        (forms ?? []).filter(f => new Date(f.created_at) >= weekAgo).map(f => f.user_id)
      )

      const map: Record<string, { ids: string[]; scoreSum: number; scoreCount: number; weekSum: number; weekCount: number; atRisk: number }> = {}
      users.forEach(u => {
        const d = u.department || 'Unknown'
        if (!map[d]) map[d] = { ids: [], scoreSum: 0, scoreCount: 0, weekSum: 0, weekCount: 0, atRisk: 0 }
        map[d].ids.push(u.id)
        if (u.ai_score != null) { map[d].scoreSum += u.ai_score; map[d].scoreCount++ }
        if (u.onboarding_complete) { map[d].weekSum += u.current_week ?? 1; map[d].weekCount++ }
        if (u.risk_flag === 'red' || u.risk_flag === 'amber') map[d].atRisk++
      })

      const result: TeamData[] = Object.entries(map).map(([dept, d]) => {
        const total = d.ids.length
        const avgScore = d.scoreCount ? Math.round((d.scoreSum / d.scoreCount) * 10) / 10 : 0
        const avgCompletion = d.weekCount ? Math.round(((d.weekSum / d.weekCount) / TOTAL_WEEKS) * 100) : 0
        const activeCount = d.ids.filter(id => activeSet.has(id)).length
        const atRisk = d.atRisk

        // Health score: 40% AI score (out of 5), 30% completion, 20% activity ratio, 10% safety
        const healthScore = Math.round(
          0.4 * (avgScore / 5) * 100 +
          0.3 * avgCompletion +
          0.2 * (activeCount / total) * 100 +
          0.1 * (1 - atRisk / total) * 100
        )

        return { dept, total, avgScore, avgCompletion, activeCount, atRisk, healthScore }
      }).sort((a, b) => b.healthScore - a.healthScore)

      setTeams(result)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(j => <div key={j} className="h-12 bg-white/5 rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <GlassCard className="text-center py-16">
        <div className="text-4xl mb-4">🏢</div>
        <p className="text-slate-400">No team data yet. Users need to complete onboarding first.</p>
      </GlassCard>
    )
  }

  const strongest = teams[0]
  const needsSupport = teams[teams.length - 1]

  return (
    <div className="space-y-6">
      {/* Summary banners */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 border border-green-500/20 bg-green-500/5">
          <p className="text-xs text-slate-400 mb-1">Strongest Team</p>
          <p className="text-white font-semibold">{strongest.dept}</p>
          <p className="text-green-300 text-sm">Health score {strongest.healthScore}/100</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-slate-400 mb-1">Team Needing Support</p>
          <p className="text-white font-semibold">{needsSupport.dept}</p>
          <p className="text-amber-300 text-sm">Health score {needsSupport.healthScore}/100</p>
        </div>
      </div>

      {/* Team cards */}
      <div className="space-y-4">
        {teams.map((team, i) => {
          const colors = healthColor(team.healthScore)
          return (
            <GlassCard key={team.dept} className="!p-5">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 text-sm font-medium">#{i + 1}</span>
                    <h3 className="text-white font-semibold">{team.dept}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.badge}`}>
                      {healthLabel(team.healthScore)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{team.total} champion{team.total !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-bold ${colors.text}`}>{team.healthScore}</div>
                  <div className="text-slate-500 text-xs">health score</div>
                </div>
              </div>

              {/* Health bar */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full ${colors.bg} transition-all`}
                  style={{ width: `${team.healthScore}%` }}
                />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-purple-300 font-semibold">{team.avgScore}/5</div>
                  <div className="text-slate-500 text-xs mt-0.5">Avg AI Score</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-blue-300 font-semibold">{team.avgCompletion}%</div>
                  <div className="text-slate-500 text-xs mt-0.5">Completion</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-green-300 font-semibold">{team.activeCount}</div>
                  <div className="text-slate-500 text-xs mt-0.5">Active This Week</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className={`font-semibold ${team.atRisk > 0 ? 'text-red-300' : 'text-slate-400'}`}>{team.atRisk}</div>
                  <div className="text-slate-500 text-xs mt-0.5">At Risk</div>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
