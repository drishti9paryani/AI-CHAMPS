'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { AdminOverviewSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts'

const TOTAL_WEEKS = 12
const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#f59e0b', '#f87171', '#c084fc', '#38bdf8']

interface Stats {
  totalChamps: number
  activeThisWeek: number
  avgScore: number
  roadmapCompletion: number
  projectsSubmitted: number
  teamsCount: number
  atRiskCount: number
  deptBreakdown: { dept: string; count: number }[]
  archetypes: { type: string; count: number }[]
  weeklyTrend: { label: string; submissions: number }[]
  teamLeaderboard: { dept: string; avgScore: number; count: number; completion: number }[]
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#a78bfa' },
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: users }, { data: forms }] = await Promise.all([
        supabase
          .from('users')
          .select('id, department, ai_score, risk_flag, tarot_card_type, current_week, onboarding_complete'),
        supabase
          .from('champ_forms')
          .select('user_id, created_at')
          .order('created_at', { ascending: false }),
      ])
      if (!users) return

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const activeSet = new Set(
        (forms ?? []).filter(f => new Date(f.created_at) >= weekAgo).map(f => f.user_id)
      )

      const deptMap: Record<string, { count: number; scoreSum: number; scoreCount: number; weekSum: number; weekCount: number }> = {}
      let scoreSum = 0, scoreCount = 0, weekSum = 0, weekCount = 0, atRisk = 0

      users.forEach(u => {
        const d = u.department || 'Unknown'
        if (!deptMap[d]) deptMap[d] = { count: 0, scoreSum: 0, scoreCount: 0, weekSum: 0, weekCount: 0 }
        deptMap[d].count++
        if (u.ai_score != null) { deptMap[d].scoreSum += u.ai_score; deptMap[d].scoreCount++ }
        if (u.onboarding_complete) { deptMap[d].weekSum += u.current_week ?? 1; deptMap[d].weekCount++ }
        if (u.ai_score != null) { scoreSum += u.ai_score; scoreCount++ }
        if (u.onboarding_complete) { weekSum += u.current_week ?? 1; weekCount++ }
        if (u.risk_flag === 'red' || u.risk_flag === 'amber') atRisk++
      })

      // Only count archetypes for users who completed onboarding
      const archetypeMap: Record<string, number> = {}
      users.filter(u => u.onboarding_complete && u.tarot_card_type).forEach(u => {
        const t = u.tarot_card_type!
        archetypeMap[t] = (archetypeMap[t] || 0) + 1
      })

      // Last 6 weeks buckets
      const weeklyBuckets: Record<string, number> = {}
      for (let i = 5; i >= 0; i--) weeklyBuckets[`W${6 - i}`] = 0
      ;(forms ?? []).forEach(f => {
        const age = Math.floor((now.getTime() - new Date(f.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (age < 6) weeklyBuckets[`W${6 - age}`] = (weeklyBuckets[`W${6 - age}`] || 0) + 1
      })

      const teamLeaderboard = Object.entries(deptMap)
        .map(([dept, d]) => ({
          dept,
          avgScore: d.scoreCount ? Math.round((d.scoreSum / d.scoreCount) * 10) / 10 : 0,
          count: d.count,
          completion: d.weekCount ? Math.round(((d.weekSum / d.weekCount) / TOTAL_WEEKS) * 100) : 0,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)

      setStats({
        totalChamps: users.length,
        activeThisWeek: activeSet.size,
        avgScore: scoreCount ? Math.round((scoreSum / scoreCount) * 10) / 10 : 0,
        roadmapCompletion: weekCount ? Math.round(((weekSum / weekCount) / TOTAL_WEEKS) * 100) : 0,
        projectsSubmitted: (forms ?? []).length,
        teamsCount: Object.keys(deptMap).length,
        atRiskCount: atRisk,
        deptBreakdown: Object.entries(deptMap).map(([dept, d]) => ({ dept, count: d.count })),
        archetypes: Object.entries(archetypeMap)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        weeklyTrend: Object.entries(weeklyBuckets).map(([label, submissions]) => ({ label, submissions })),
        teamLeaderboard,
      })
    }
    load()
  }, [])

  if (!stats) return <AdminOverviewSkeleton />

  const statCards = [
    { label: 'Total Signed Up', value: stats.totalChamps, icon: '👥', color: 'text-purple-300' },
    { label: 'Active This Week', value: stats.activeThisWeek, icon: '⚡', color: 'text-blue-300' },
    { label: 'Avg AI Score', value: `${stats.avgScore}/5`, icon: '⭐', color: 'text-yellow-300' },
    { label: 'Roadmap Completion', value: `${stats.roadmapCompletion}%`, icon: '🗺️', color: 'text-green-300' },
    { label: 'Projects Submitted', value: stats.projectsSubmitted, icon: '🚀', color: 'text-teal-300' },
    { label: 'Teams Participating', value: stats.teamsCount, icon: '🏢', color: 'text-indigo-300' },
    { label: 'At-Risk Users', value: stats.atRiskCount, icon: '⚠️', color: 'text-red-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map(s => (
          <GlassCard key={s.label} className="!p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-base font-semibold text-white mb-4">Weekly Submission Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.weeklyTrend} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="submissions" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="text-base font-semibold text-white mb-4">Archetype Distribution</h3>
          {stats.archetypes.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-slate-500 text-sm">No archetype data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.archetypes.slice(0, 6)} margin={{ left: -10 }}>
                <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={48} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.archetypes.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-base font-semibold text-white mb-4">Team Leaderboard</h3>
        {stats.teamLeaderboard.length === 0 ? (
          <p className="text-slate-500 text-sm">No team data yet</p>
        ) : (
          <div className="space-y-3">
            {stats.teamLeaderboard.slice(0, 5).map((team, i) => (
              <div key={team.dept} className="flex items-center gap-4">
                <span className="text-lg w-7 flex-shrink-0 text-center">
                  {['🥇', '🥈', '🥉', '4', '5'][i]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white text-sm font-medium truncate">{team.dept}</span>
                    <span className="text-slate-400 text-xs ml-2 flex-shrink-0">
                      {team.count} champs · {team.avgScore}/10 · {team.completion}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${(team.avgScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
