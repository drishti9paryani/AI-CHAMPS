'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { AdminOverviewSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
// weekLabel imported for future heatmap drill-downs
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts'

const TOTAL_WEEKS = 4
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
  // ── New metrics ────────────────────────────────────────────────────────────
  /** % of enrolled users who completed each programme week */
  weekCompletion: { week: string; pct: number; count: number }[]
  /** Top performers ranked by roadmap progress then AI score */
  topPerformers: { name: string; dept: string; score: number; week: number; completion: number }[]
  /** The programme week where the most users are currently stuck */
  dropOffWeek: number
  /** Last active date per participant — displayed in AllUsers; also used for avg below */
  lastActiveMap: Record<string, string>
  /** Team readiness heatmap: one row per department */
  heatmapRows: HeatmapRow[]
}

interface HeatmapRow {
  team: string
  count: number
  aiScore: number      // 0-100
  onboarding: number   // 0-100
  activityRate: number // 0-100, % active last 7 days
  riskFree: number     // 0-100, % NOT red/amber
  challenges: number   // 0-100, % with any challenge completion
}

function getTooltipStyle() {
  const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light-mode')
  return {
    contentStyle: {
      background: isLight ? '#ffffff' : '#1e1b4b',
      border: isLight ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.1)' : undefined,
    },
    labelStyle: { color: isLight ? '#1e1b4b' : '#e2e8f0' },
    itemStyle: { color: '#7c3aed' },
  }
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: users }, { data: forms }, { data: completions }] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, department, ai_score, risk_flag, tarot_card_type, current_week, onboarding_complete, created_at'),
        supabase
          .from('champ_forms')
          .select('user_id, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('challenge_completions')
          .select('user_id'),
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

      // ── New metric: last active per user ──────────────────────────────────
      const lastActiveMap: Record<string, string> = {}
      ;(forms ?? []).forEach(f => {
        if (!lastActiveMap[f.user_id]) lastActiveMap[f.user_id] = f.created_at
      })

      // ── New metric: completion rate per programme week ────────────────────
      // Count how many enrolled users have reached or passed each week
      const enrolled = users.filter(u => u.onboarding_complete)
      const weekCompletion = [1, 2, 3, 4].map(w => {
        const count = enrolled.filter(u => (u.current_week ?? 1) >= w).length
        return {
          week: `Week ${w}`,
          count,
          pct: enrolled.length ? Math.round((count / enrolled.length) * 100) : 0,
        }
      })

      // ── New metric: drop-off week (where most users are stuck) ────────────
      // The programme week with the highest concentration of users NOT yet past it
      const weekCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
      enrolled.forEach(u => {
        const w = Math.min(u.current_week ?? 1, 4) as 1 | 2 | 3 | 4
        weekCounts[w] = (weekCounts[w] || 0) + 1
      })
      const dropOffWeek = Object.entries(weekCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 1

      // ── New metric: top performers ────────────────────────────────────────
      const topPerformers = enrolled
        .map(u => ({
          name: (u as unknown as { name: string }).name ?? '—',
          dept: u.department ?? 'Unknown',
          score: u.ai_score ?? 0,
          week: u.current_week ?? 1,
          completion: Math.round(((u.current_week ?? 1) / TOTAL_WEEKS) * 100),
        }))
        .sort((a, b) => b.completion - a.completion || b.score - a.score)
        .slice(0, 5)

      // ── Heatmap: one row per department ─────────────────────────────────────
      const champSet = new Set((completions ?? []).map(c => c.user_id))
      const heatmapRows: HeatmapRow[] = Object.entries(deptMap).map(([team, d]) => {
        const teamUsers = users.filter(u => (u.department || 'Unknown') === team)
        const count = teamUsers.length
        const withScore = teamUsers.filter(u => u.ai_score != null)
        const avgAI = withScore.length ? withScore.reduce((s, u) => s + u.ai_score!, 0) / withScore.length : 0
        const onboarded = teamUsers.filter(u => u.onboarding_complete).length
        const active = teamUsers.filter(u => activeSet.has(u.id)).length
        const atRiskUsers = teamUsers.filter(u => u.risk_flag === 'red' || u.risk_flag === 'amber').length
        const withChallenge = teamUsers.filter(u => champSet.has(u.id)).length
        return {
          team,
          count,
          aiScore: Math.round((avgAI / 5) * 100),
          onboarding: count ? Math.round((onboarded / count) * 100) : 0,
          activityRate: count ? Math.round((active / count) * 100) : 0,
          riskFree: count ? Math.round(((count - atRiskUsers) / count) * 100) : 100,
          challenges: count ? Math.round((withChallenge / count) * 100) : 0,
        }
      }).sort((a, b) => b.aiScore - a.aiScore)

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
        weekCompletion,
        topPerformers,
        dropOffWeek: Number(dropOffWeek),
        lastActiveMap,
        heatmapRows,
      })
    }
    load()
  }, [])

  if (!stats) return <AdminOverviewSkeleton />

  const statCards = [
    { label: 'Total Signed Up',     value: stats.totalChamps,              icon: '👥', color: 'text-purple-300', border: 'border-l-purple-500',  bg: 'from-purple-500/10' },
    { label: 'Active This Week',    value: stats.activeThisWeek,           icon: '⚡', color: 'text-blue-300',   border: 'border-l-blue-500',    bg: 'from-blue-500/10' },
    { label: 'Avg AI Score',        value: `${stats.avgScore}/5`,          icon: '⭐', color: 'text-yellow-300', border: 'border-l-yellow-500',  bg: 'from-yellow-500/10' },
    { label: 'Roadmap Completion',  value: `${stats.roadmapCompletion}%`,  icon: '🗺️', color: 'text-green-300',  border: 'border-l-green-500',   bg: 'from-green-500/10' },
    { label: 'Projects Submitted',  value: stats.projectsSubmitted,        icon: '🚀', color: 'text-teal-300',   border: 'border-l-teal-500',    bg: 'from-teal-500/10' },
    { label: 'Teams Participating', value: stats.teamsCount,               icon: '🏢', color: 'text-indigo-300', border: 'border-l-indigo-500',  bg: 'from-indigo-500/10' },
    { label: 'At-Risk Users',       value: stats.atRiskCount,              icon: '⚠️', color: 'text-red-300',    border: 'border-l-red-500',     bg: 'from-red-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label}
            className={`glass rounded-2xl p-4 border-l-4 ${s.border} bg-gradient-to-r ${s.bg} to-transparent`}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
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
              <Tooltip {...getTooltipStyle()} />
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
                <Tooltip {...getTooltipStyle()} />
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


      {/* ── New: Top Performers ─────────────────────────────────────────── */}
      <GlassCard>
        <h3 className="text-base font-semibold text-white mb-1">Top Performers</h3>
        <p className="text-slate-500 text-xs mb-4">Ranked by roadmap completion % then AI score</p>
        {stats.topPerformers.length === 0 ? (
          <p className="text-slate-500 text-sm">No data yet</p>
        ) : (
          <div className="space-y-3">
            {stats.topPerformers.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-base w-7 flex-shrink-0 text-center">
                  {['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium truncate">{p.name}</span>
                    <span className="text-slate-400 text-xs ml-2 flex-shrink-0">
                      Week {p.week} · {p.score}/5 · {p.completion}%
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs">{p.dept}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ── Team Readiness Heatmap ─────────────────────────────────────────── */}
      <GlassCard>
        <h3 className="text-base font-semibold text-white mb-1">Team Readiness Heatmap</h3>
        <p className="text-slate-500 text-xs mb-4">
          5 dimensions across every team. <span className="text-green-400">Green ≥70</span> ·{' '}
          <span className="text-amber-400">Amber 40–70</span> ·{' '}
          <span className="text-red-400">Red &lt;40</span>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-slate-500 font-medium py-2 pr-4 w-44">Team</th>
                {[
                  { label: '🌟 AI Score',    title: 'Average self-reported AI score' },
                  { label: '✅ Onboarded',   title: '% with onboarding complete' },
                  { label: '⚡ Active',      title: '% with a form submission this week' },
                  { label: '🛡 Risk-Free',   title: '% with no red/amber risk flag' },
                  { label: '🏆 Challenges',  title: '% who completed at least one challenge' },
                ].map(h => (
                  <th key={h.label} title={h.title}
                    className="text-slate-500 font-medium py-2 px-2 text-center cursor-help">
                    {h.label}
                  </th>
                ))}
                <th className="text-slate-500 font-medium py-2 pl-4 text-right">Members</th>
              </tr>
            </thead>
            <tbody>
              {stats.heatmapRows.map((row, i) => (
                <motion.tr
                  key={row.team}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-2.5 pr-4 text-slate-300 font-medium truncate max-w-[11rem]">{row.team}</td>
                  {[row.aiScore, row.onboarding, row.activityRate, row.riskFree, row.challenges].map((v, ci) => (
                    <td key={ci} className="py-2.5 px-2 text-center">
                      <HeatCell value={v} />
                    </td>
                  ))}
                  <td className="py-2.5 pl-4 text-right text-slate-500">{row.count}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

// ── Heatmap cell ────────────────────────────────────────────────────────────────
function HeatCell({ value }: { value: number }) {
  const color =
    value >= 70 ? { bg: 'rgba(52,211,153,0.15)', text: '#34d399', border: 'rgba(52,211,153,0.3)' }
    : value >= 40 ? { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' }
    : value > 0   ? { bg: 'rgba(248,113,113,0.15)', text: '#f87171', border: 'rgba(248,113,113,0.3)' }
    :               { bg: 'rgba(255,255,255,0.04)', text: '#475569', border: 'rgba(255,255,255,0.08)' }

  return (
    <div
      className="inline-flex items-center justify-center w-14 h-8 rounded-lg text-xs font-bold"
      style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
    >
      {value > 0 ? `${value}%` : '—'}
    </div>
  )
}
