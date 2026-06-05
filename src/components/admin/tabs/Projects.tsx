'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'

type Status = 'Idea' | 'In Progress' | 'Completed' | 'Blocked'

interface Project {
  id: string
  employee: string
  team: string
  project: string
  challenge: string
  support: string
  status: Status
  submitted: string
}

function deriveStatus(riskFlag: string | null, challenge: string | null): Status {
  if (riskFlag === 'red') return 'Blocked'
  const lower = (challenge ?? '').toLowerCase()
  if (lower.includes('complete') || lower.includes('done') || lower.includes('finish')) return 'Completed'
  if (riskFlag === 'amber') return 'In Progress'
  return 'In Progress'
}

const STATUS_STYLE: Record<Status, string> = {
  'Idea': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'In Progress': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Completed': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Blocked': 'bg-red-500/20 text-red-300 border-red-500/30',
}

const STATUS_ICON: Record<Status, string> = {
  'Idea': '💡',
  'In Progress': '⚡',
  'Completed': '✅',
  'Blocked': '🚫',
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [teams, setTeams] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('champ_forms')
        .select('id, current_project, biggest_challenge, support_needed, created_at, user_id, users(name, department, risk_flag)')
        .order('created_at', { ascending: false })

      if (!data) { setLoading(false); return }

      const mapped: Project[] = data
        .filter(f => f.current_project)
        .map(f => {
          const u = f.users as unknown as { name: string; department: string; risk_flag: string | null } | null
          return {
            id: f.id,
            employee: u?.name ?? 'Unknown',
            team: u?.department ?? 'Unknown',
            project: f.current_project,
            challenge: f.biggest_challenge ?? '',
            support: f.support_needed ?? '',
            status: deriveStatus(u?.risk_flag ?? null, f.biggest_challenge),
            submitted: f.created_at,
          }
        })

      setProjects(mapped)
      setTeams([...new Set(mapped.map(p => p.team))].sort())
      setLoading(false)
    }
    load()
  }, [])

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.project.toLowerCase().includes(q) || p.employee.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
    const matchTeam = !teamFilter || p.team === teamFilter
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchTeam && matchStatus
  })

  const statusCounts = (['Idea', 'In Progress', 'Completed', 'Blocked'] as Status[]).map(s => ({
    status: s,
    count: projects.filter(p => p.status === s).length,
  }))

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="glass rounded-2xl p-5 animate-pulse h-20" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusCounts.map(({ status, count }) => (
          <GlassCard key={status} className="!p-4 text-center cursor-pointer hover:bg-white/5 transition" >
            <div className="text-xl mb-1">{STATUS_ICON[status]}</div>
            <div className="text-xl font-bold text-white">{count}</div>
            <div className="text-slate-500 text-xs mt-0.5">{status}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search project, employee, team…"
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
        />
        <select
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          className="bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="">All Teams</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="">All Statuses</option>
          <option value="Idea">💡 Idea</option>
          <option value="In Progress">⚡ In Progress</option>
          <option value="Completed">✅ Completed</option>
          <option value="Blocked">🚫 Blocked</option>
        </select>
        <span className="text-slate-500 text-sm">{filtered.length} projects</span>
      </div>

      {/* Projects table */}
      {filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <div className="text-4xl mb-4">🚀</div>
          <p className="text-slate-400">No projects found. Champions need to submit their weekly forms first.</p>
        </GlassCard>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['Employee', 'Team', 'Project', 'Challenge', 'Status', 'Submitted'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{p.employee}</td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{p.team}</td>
                  <td className="px-4 py-3 text-slate-200 max-w-[200px]">
                    <p className="line-clamp-2">{p.project}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-[180px]">
                    <p className="line-clamp-2 text-xs">{p.challenge || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border whitespace-nowrap ${STATUS_STYLE[p.status]}`}>
                      {STATUS_ICON[p.status]} {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(p.submitted).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
