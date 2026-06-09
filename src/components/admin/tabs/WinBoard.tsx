'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'

interface Win {
  id: string
  content: string
  tool_used: string | null
  time_saved_minutes: number
  created_at: string
  userName: string
  userDept: string
  reactionCount: number
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0] ?? '').join('').slice(0, 2).toUpperCase()
}

export default function WinBoard() {
  const [wins, setWins] = useState<Win[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [teams, setTeams] = useState<string[]>([])
  const [stats, setStats] = useState({ total: 0, totalMinutes: 0, topTool: '—', uniqueContributors: 0 })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('ai_wins')
        .select('*, users(name, department), win_reactions(id)')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!data) { setLoading(false); return }

      const mapped: Win[] = (data as any[]).map(w => ({
        id: w.id,
        content: w.content,
        tool_used: w.tool_used,
        time_saved_minutes: w.time_saved_minutes ?? 0,
        created_at: w.created_at,
        userName: (w.users as any)?.name ?? '—',
        userDept: (w.users as any)?.department ?? '—',
        reactionCount: (w.win_reactions ?? []).length,
      }))

      const allTeams = [...new Set(mapped.map(w => w.userDept).filter(d => d !== '—'))].sort()
      const totalMinutes = mapped.reduce((s, w) => s + w.time_saved_minutes, 0)
      const uniqueContributors = new Set(mapped.map(w => w.userName)).size

      const toolMap: Record<string, number> = {}
      mapped.forEach(w => { if (w.tool_used) toolMap[w.tool_used] = (toolMap[w.tool_used] || 0) + 1 })
      const topTool = Object.entries(toolMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

      setWins(mapped)
      setTeams(allTeams)
      setStats({ total: mapped.length, totalMinutes, topTool, uniqueContributors })
      setLoading(false)
    }
    load()
  }, [])

  const filtered = wins.filter(w => {
    const q = search.toLowerCase()
    const matchQ = !q
      || w.content.toLowerCase().includes(q)
      || w.userName.toLowerCase().includes(q)
      || (w.tool_used?.toLowerCase().includes(q) ?? false)
    const matchTeam = !teamFilter || w.userDept === teamFilter
    return matchQ && matchTeam
  })

  const statCards = [
    { label: 'Total Wins',        value: stats.total,                                   icon: '🏆', from: '#f59e0b', to: '#fbbf24', border: 'border-yellow-500' },
    { label: 'Hours Saved',       value: `${Math.round(stats.totalMinutes / 60)}h`,     icon: '⏱',  from: '#34d399', to: '#06b6d4', border: 'border-teal-500'   },
    { label: 'Contributors',      value: stats.uniqueContributors,                       icon: '👥',  from: '#a78bfa', to: '#60a5fa', border: 'border-purple-500' },
    { label: 'Top Tool',          value: stats.topTool,                                  icon: '🛠️', from: '#f87171', to: '#fb923c', border: 'border-red-500'    },
  ]

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl p-5 animate-pulse h-28" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat cards — 3D hover */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <div key={s.label} style={{ perspective: '700px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
              whileHover={{ rotateX: -6, rotateY: 8, scale: 1.04 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative rounded-2xl overflow-hidden"
            >
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ padding: '1px', background: `linear-gradient(135deg, ${s.from}, ${s.to})`, opacity: 0.5 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-[#0d0d1a]" />
              </div>
              <div
                className="relative z-10 p-5 rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${s.from}15, transparent)` }}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black text-white truncate">{s.value}</div>
                <div className="text-slate-500 text-xs mt-1">{s.label}</div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search wins, names, tools…"
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
        />
        <select
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          className="bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500"
        >
          <option value="">All Teams</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-slate-500 text-sm">{filtered.length} wins</span>
      </div>

      {/* Wins */}
      {filtered.length === 0 ? (
        <GlassCard className="text-center py-14">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-slate-400">No wins yet. Encourage your team to share their AI moments!</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((win, i) => (
            <div key={win.id} style={{ perspective: '800px' }}>
              <motion.div
                initial={{ opacity: 0, y: 16, rotateX: 6 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4), type: 'spring', stiffness: 260, damping: 22 }}
                whileHover={{ rotateX: -3, rotateY: 4, scale: 1.01 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="rounded-2xl border border-white/8 bg-white/[0.025] hover:border-white/15 transition-colors p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      boxShadow: '0 0 12px rgba(124,58,237,0.4)',
                    }}
                  >
                    {initials(win.userName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold text-sm">{win.userName}</span>
                      <span className="text-slate-500 text-xs">{win.userDept}</span>
                      <span className="text-slate-600 text-xs ml-auto shrink-0">{timeAgo(win.created_at)}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">{win.content}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {win.tool_used && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/12 text-blue-300 border border-blue-500/25">
                          🛠 {win.tool_used}
                        </span>
                      )}
                      {win.time_saved_minutes > 0 && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/12 text-teal-300 border border-teal-500/25">
                          ⏱ {win.time_saved_minutes >= 60
                            ? `${Math.round(win.time_saved_minutes / 60)}h`
                            : `${win.time_saved_minutes}min`} saved
                        </span>
                      )}
                      {win.reactionCount > 0 && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/12 text-yellow-300 border border-yellow-500/25">
                          ✨ {win.reactionCount} {win.reactionCount === 1 ? 'reaction' : 'reactions'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
