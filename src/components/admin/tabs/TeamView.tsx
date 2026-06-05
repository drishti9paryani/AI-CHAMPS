'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import { AdminTeamSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TeamStats {
  department: string
  totalChamps: number
  avgScore: number
  completionPct: number
  activeUsers: number
  atRisk: number
}

interface RawUser {
  department: string
  ai_score: number
  current_week: number | null
  risk_flag: string
  updated_at: string | null
  created_at: string
}

function isActiveRecently(u: RawUser): boolean {
  const ref = u.updated_at ?? u.created_at
  if (!ref) return false
  return (Date.now() - new Date(ref).getTime()) < 14 * 24 * 60 * 60 * 1000
}

export default function TeamView() {
  const [teams, setTeams] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('department, ai_score, current_week, risk_flag, updated_at, created_at')

      if (!data) { setLoading(false); return }

      const map: Record<string, RawUser[]> = {}
      ;(data as RawUser[]).forEach(u => {
        if (!map[u.department]) map[u.department] = []
        map[u.department].push(u)
      })

      const stats: TeamStats[] = Object.entries(map).map(([dept, users]) => {
        const totalChamps = users.length
        const avgScore = totalChamps
          ? Math.round((users.reduce((s, u) => s + u.ai_score, 0) / totalChamps) * 10) / 10
          : 0
        const completionPct = totalChamps
          ? Math.round(users.reduce((s, u) => s + (u.current_week ? (u.current_week / 4) * 100 : 0), 0) / totalChamps)
          : 0
        const activeUsers = users.filter(isActiveRecently).length
        const atRisk = users.filter(u => u.risk_flag === 'red').length
        return { department: dept, totalChamps, avgScore, completionPct, activeUsers, atRisk }
      })

      setTeams(stats.sort((a, b) => b.avgScore - a.avgScore))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <AdminTeamSkeleton />

  if (teams.length === 0) {
    return (
      <EmptyState
        icon="🏢"
        title="No team data yet"
        description="Once users complete onboarding with department info, team stats will appear here."
      />
    )
  }

  const strongest = teams[0]
  const needsSupport = [...teams].sort((a, b) => a.avgScore - b.avgScore)[0]
  const totalChamps = teams.reduce((s, t) => s + t.totalChamps, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Team View</h2>
        <p className="text-slate-400 text-sm">Department-level AI adoption health across White Rivers Media.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-slate-400 text-xs mb-1">Strongest Team</p>
          <p className="text-white font-bold">{strongest.department}</p>
          <p className="text-purple-300 text-sm">{strongest.avgScore}/10 avg score</p>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">🆘</div>
          <p className="text-slate-400 text-xs mb-1">Needs Support</p>
          <p className="text-white font-bold">{needsSupport.department}</p>
          <p className="text-amber-300 text-sm">{needsSupport.avgScore}/10 avg score</p>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-slate-400 text-xs mb-1">Total Champs</p>
          <p className="text-white font-bold text-3xl">{totalChamps}</p>
          <p className="text-slate-400 text-sm">{teams.length} departments</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Champs per Department</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={teams} margin={{ left: -10 }}>
            <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#a78bfa' }}
            />
            <Bar dataKey="totalChamps" name="Champs" radius={[6, 6, 0, 0]}>
              {teams.map((_, i) => (
                <Cell key={i} fill={`hsl(${260 + i * 18}, 70%, 60%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Department Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['Department', 'Champs', 'Avg AI Score', 'Completion', 'Active (14d)', 'At Risk'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={t.department} className={`border-b border-white/5 hover:bg-purple-500/10 transition ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                  <td className="px-5 py-3 text-white font-medium">{t.department}</td>
                  <td className="px-5 py-3 text-slate-300">{t.totalChamps}</td>
                  <td className="px-5 py-3">
                    <span className="text-purple-300 font-semibold">{t.avgScore}/10</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/10 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${t.completionPct}%` }}
                        />
                      </div>
                      <span className="text-slate-300 text-xs">{t.completionPct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-green-300">{t.activeUsers}</td>
                  <td className="px-5 py-3">
                    {t.atRisk > 0 ? (
                      <span className="text-red-300 font-semibold">{t.atRisk}</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
