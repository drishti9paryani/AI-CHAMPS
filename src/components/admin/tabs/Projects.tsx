'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import { AdminProjectsSkeleton } from '@/components/ui/skeletons/AdminSkeletons'

interface Project {
  id: string
  current_project: string
  challenge: string
  support_needed: string
  created_at: string
  user: { name: string; department: string } | null
}

const STATUS_OPTIONS = ['In Progress', 'Completed', 'Idea'] as const
type Status = typeof STATUS_OPTIONS[number]

const STATUS_STYLES: Record<Status, string> = {
  'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Completed':   'bg-green-500/20 text-green-300 border-green-500/40',
  'Idea':        'bg-amber-500/20 text-amber-300 border-amber-500/40',
}

function deriveStatus(p: Project): Status {
  const text = (p.current_project + ' ' + p.challenge).toLowerCase()
  if (text.includes('complet') || text.includes('done') || text.includes('finished')) return 'Completed'
  if (text.includes('idea') || text.includes('planning') || text.includes('thinking')) return 'Idea'
  return 'In Progress'
}

function downloadCSV(projects: Project[]) {
  const rows = [
    ['Name', 'Department', 'Project', 'Status', 'Challenge', 'Support Needed', 'Submitted'],
    ...projects.map(p => [
      p.user?.name ?? '',
      p.user?.department ?? '',
      p.current_project,
      deriveStatus(p),
      p.challenge,
      p.support_needed,
      new Date(p.created_at).toLocaleDateString(),
    ]),
  ]
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-champs-projects-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | ''>('')
  const [depts, setDepts] = useState<string[]>([])

  useEffect(() => {
    supabase
      .from('champ_forms')
      .select('id, current_project, biggest_challenge, support_needed, created_at, users(name, department)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data ?? []).map((s: any) => ({
          id: s.id,
          current_project: s.current_project,
          challenge: s.biggest_challenge,
          support_needed: s.support_needed,
          created_at: s.created_at,
          user: s.users as { name: string; department: string } | null,
        }))
        setProjects(mapped)
        setDepts([...new Set(mapped.map((p: Project) => p.user?.department ?? '').filter(Boolean))].sort() as string[])
        setLoading(false)
      })
  }, [])

  if (loading) return <AdminProjectsSkeleton />

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.current_project.toLowerCase().includes(q) ||
      (p.user?.name ?? '').toLowerCase().includes(q) ||
      (p.user?.department ?? '').toLowerCase().includes(q)
    const matchDept = !deptFilter || p.user?.department === deptFilter
    const matchStatus = !statusFilter || deriveStatus(p) === statusFilter
    return matchSearch && matchDept && matchStatus
  })

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = projects.filter(p => deriveStatus(p) === s).length
    return acc
  }, {} as Record<Status, number>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-1">Projects</h2>
          <p className="text-slate-400 text-sm">AI projects being built across White Rivers Media.</p>
        </div>
        <button
          onClick={() => downloadCSV(filtered)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition text-sm"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {STATUS_OPTIONS.map(s => (
          <div
            key={s}
            className={`glass rounded-2xl p-6 text-center py-4 cursor-pointer transition ${statusFilter === s ? 'ring-1 ring-purple-500' : 'hover:border-white/20'}`}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
          >
            <p className="text-2xl font-bold text-white">{counts[s]}</p>
            <p className="text-slate-400 text-xs mt-1">{s}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search project, name, team..."
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
        />
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="bg-[#0d0d1a] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 text-sm">
          <option value="">All Teams</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Status | '')}
          className="bg-[#0d0d1a] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 text-sm">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-slate-400 text-sm self-center">{filtered.length} projects</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🚀"
          title="No projects found"
          description="No AI projects match your current filters."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const status = deriveStatus(p)
            return (
              <GlassCard key={p.id}>
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{p.current_project}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {p.user?.name ?? 'Unknown'} · {p.user?.department ?? '—'} · {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs border ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                </div>
                {p.challenge && (
                  <p className="text-slate-400 text-sm line-clamp-2">
                    <span className="text-slate-500">Challenge: </span>{p.challenge}
                  </p>
                )}
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
