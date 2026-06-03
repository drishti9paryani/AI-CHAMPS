'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { AdminOverviewSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Stats {
  totalUsers: number
  avgScore: number
  deptBreakdown: { dept: string; count: number }[]
  mostActiveDepts: { dept: string; count: number }[]
  recentSubmissions: {
    id: string
    created_at: string
    current_project: string
    user: { name: string; department: string } | null
  }[]
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: users }, { data: subs }] = await Promise.all([
        supabase.from('users').select('department, ai_score'),
        supabase.from('submissions').select('id, created_at, current_project, users(name, department)').order('created_at', { ascending: false }).limit(10),
      ])
      if (!users) return

      const deptMap: Record<string, number> = {}
      let scoreSum = 0
      users.forEach(u => {
        deptMap[u.department] = (deptMap[u.department] || 0) + 1
        scoreSum += u.ai_score
      })

      const deptBreakdown = Object.entries(deptMap).map(([dept, count]) => ({ dept, count }))
      const mostActiveDepts = [...deptBreakdown].sort((a, b) => b.count - a.count).slice(0, 3)

      setStats({
        totalUsers: users.length,
        avgScore: users.length ? Math.round((scoreSum / users.length) * 10) / 10 : 0,
        deptBreakdown,
        mostActiveDepts,
        recentSubmissions: (subs ?? []).map(s => ({
          id: s.id,
          created_at: s.created_at,
          current_project: s.current_project,
          user: s.users as unknown as { name: string; department: string } | null,
        })),
      })
    }
    load()
  }, [])

  if (!stats) return <AdminOverviewSkeleton />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total AI Champs', value: stats.totalUsers, icon: '👥' },
          { label: 'Average AI Score', value: `${stats.avgScore}/10`, icon: '⭐' },
          { label: 'Departments', value: stats.deptBreakdown.length, icon: '🏢' },
        ].map(s => (
          <GlassCard key={s.label} className="text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold gradient-text">{s.value}</div>
            <div className="text-slate-400 text-sm mt-1">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Department Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.deptBreakdown} margin={{ left: -10 }}>
              <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#a78bfa' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.deptBreakdown.map((_, i) => (
                  <Cell key={i} fill={`hsl(${260 + i * 20}, 70%, 60%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Most Active Departments</h3>
          <div className="space-y-3">
            {stats.mostActiveDepts.map((d, i) => (
              <div key={d.dept} className="flex items-center gap-3">
                <span className="text-2xl">{['🥇', '🥈', '🥉'][i]}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-medium">{d.dept}</span>
                    <span className="text-purple-300">{d.count} champs</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${(d.count / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {stats.mostActiveDepts.length === 0 && (
              <p className="text-slate-500 text-sm">No department data yet</p>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Submissions</h3>
        {stats.recentSubmissions.length === 0 ? (
          <p className="text-slate-500 text-sm">No submissions yet</p>
        ) : (
          <div className="space-y-3">
            {stats.recentSubmissions.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/5 rounded-xl p-4 border border-white/5">
                <div>
                  <p className="text-white font-medium">{s.user?.name ?? 'Unknown'}</p>
                  <p className="text-slate-400 text-xs">{s.user?.department ?? '—'}</p>
                  <p className="text-slate-300 text-sm mt-1 line-clamp-2">{s.current_project}</p>
                </div>
                <span className="text-slate-500 text-xs flex-shrink-0">
                  {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
