'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AdminUsersSkeleton } from '@/components/ui/skeletons/AdminSkeletons'

const TOTAL_WEEKS = 12

interface User {
  id: string
  name: string
  email: string
  department: string | null
  ai_score: number | null
  tarot_card_type: string | null
  risk_flag: 'red' | 'amber' | 'green' | null
  current_week: number | null
  created_at: string
  last_active: string | null
  onboarding_complete: boolean
  role: string
}

interface FormEntry {
  id: string
  current_project: string
  biggest_challenge: string
  support_needed: string
  created_at: string
}

type Section = 'all' | 'active' | 'incomplete' | 'admins'

const FLAG_COLORS = {
  red: 'bg-red-500/20 text-red-300 border-red-500/40',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  green: 'bg-green-500/20 text-green-300 border-green-500/40',
}

function completion(week: number | null) {
  return Math.min(Math.round(((week ?? 1) / TOTAL_WEEKS) * 100), 100)
}

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

const SECTIONS: { id: Section; label: string; icon: string; desc: string }[] = [
  { id: 'all', label: 'All Users', icon: '👥', desc: 'Everyone who signed up' },
  { id: 'active', label: 'Active Champs', icon: '⚡', desc: 'Completed onboarding' },
  { id: 'incomplete', label: 'Incomplete', icon: '⏳', desc: 'Haven\'t finished onboarding' },
  { id: 'admins', label: 'Admins', icon: '🛡️', desc: 'Admin-role accounts' },
]

export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [depts, setDepts] = useState<string[]>([])
  const [section, setSection] = useState<Section>('all')
  const [selected, setSelected] = useState<User | null>(null)
  const [forms, setForms] = useState<FormEntry[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    supabase
      .from('users')
      .select('id, name, email, department, ai_score, tarot_card_type, risk_flag, current_week, created_at, onboarding_complete, role')
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return }

        const { data: latestForms } = await supabase
          .from('champ_forms')
          .select('user_id, created_at')
          .order('created_at', { ascending: false })

        const lastActiveMap: Record<string, string> = {}
        ;(latestForms ?? []).forEach(f => {
          if (!lastActiveMap[f.user_id]) lastActiveMap[f.user_id] = f.created_at
        })

        const enriched = data.map(u => ({ ...u, last_active: lastActiveMap[u.id] ?? null })) as User[]
        setUsers(enriched)
        setDepts([...new Set(data.map(u => u.department).filter(Boolean))].sort() as string[])
        setLoading(false)
      })
  }, [])

  async function openUser(u: User) {
    setSelected(u)
    setForms([])
    setLoadingDetail(true)
    const { data } = await supabase
      .from('champ_forms')
      .select('id, current_project, biggest_challenge, support_needed, created_at')
      .eq('user_id', u.id)
      .order('created_at', { ascending: false })
    setForms((data as FormEntry[]) ?? [])
    setLoadingDetail(false)
  }

  function filterBySection(list: User[]): User[] {
    switch (section) {
      case 'active': return list.filter(u => u.onboarding_complete)
      case 'incomplete': return list.filter(u => !u.onboarding_complete)
      case 'admins': return list.filter(u => u.role === 'admin')
      default: return list
    }
  }

  const filtered = filterBySection(users).filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q) || (u.department ?? '').toLowerCase().includes(q)
    const matchDept = !deptFilter || u.department === deptFilter
    return matchSearch && matchDept
  })

  const counts = {
    all: users.length,
    active: users.filter(u => u.onboarding_complete).length,
    incomplete: users.filter(u => !u.onboarding_complete).length,
    admins: users.filter(u => u.role === 'admin').length,
  }

  if (loading) return <AdminUsersSkeleton />

  return (
    <div className="space-y-5">
      {/* Section tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`rounded-2xl p-4 text-left transition border ${
              section === s.id
                ? 'bg-purple-500/20 border-purple-500/40'
                : 'glass border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg">{s.icon}</span>
              <span className={`text-xl font-bold ${section === s.id ? 'text-purple-300' : 'text-white'}`}>
                {counts[s.id]}
              </span>
            </div>
            <div className={`text-sm font-medium ${section === s.id ? 'text-purple-200' : 'text-white'}`}>{s.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, department…"
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
        />
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="">All Teams</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="text-slate-500 text-sm">{filtered.length} users</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['User', 'Team', 'AI Score', 'Archetype', 'Week', 'Completion', 'Last Active', 'Status', 'Risk'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const comp = completion(u.current_week)
              const flag = u.risk_flag ?? 'green'
              return (
                <tr
                  key={u.id}
                  onClick={() => openUser(u)}
                  className={`border-b border-white/5 hover:bg-purple-500/10 cursor-pointer transition ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-white font-medium">{u.name ?? '—'}</div>
                        <div className="text-slate-500 text-xs truncate max-w-[150px]">{u.email}</div>
                      </div>
                      {u.role === 'admin' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0">Admin</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.department ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.ai_score != null
                      ? <span className="text-purple-300 font-semibold">{u.ai_score}/5</span>
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-[100px] truncate">{u.tarot_card_type || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {u.onboarding_complete ? `Wk ${u.current_week ?? 1}` : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.onboarding_complete ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/10 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${comp}%` }} />
                        </div>
                        <span className="text-slate-400 text-xs">{comp}%</span>
                      </div>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {u.last_active ? timeAgo(u.last_active) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {u.onboarding_complete
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Active</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">Incomplete</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${FLAG_COLORS[flag]}`}>{flag}</span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white">{selected.name ?? 'Unknown'}</h3>
                  {selected.role === 'admin' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Admin</span>
                  )}
                  {selected.onboarding_complete
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Active</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">Incomplete Onboarding</span>}
                </div>
                <p className="text-slate-400 text-sm mt-1">{selected.department ?? 'No department'} · {selected.email}</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Joined {new Date(selected.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-2xl leading-none ml-4">×</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'AI Score', value: selected.ai_score != null ? `${selected.ai_score}/5` : '—', color: 'text-purple-300' },
                  { label: 'Roadmap Week', value: selected.onboarding_complete ? `Week ${selected.current_week ?? 1}` : '—', color: 'text-blue-300' },
                  { label: 'Completion', value: selected.onboarding_complete ? `${completion(selected.current_week)}%` : '—', color: 'text-green-300' },
                  { label: 'Risk', value: selected.risk_flag ?? 'none', color: 'text-slate-300' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                    <p className={`font-semibold capitalize ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {selected.tarot_card_type && (
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-1">Archetype</p>
                  <p className="text-white text-sm">{selected.tarot_card_type}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Activity Timeline</h4>
                {loadingDetail ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : forms.length === 0 ? (
                  <p className="text-slate-500 text-sm">No submissions on file</p>
                ) : (
                  <div className="space-y-3">
                    {forms.map((f, idx) => (
                      <div key={f.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${idx === 0 ? 'bg-purple-400' : 'bg-white/20'}`} />
                          {idx < forms.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                        </div>
                        <div className="pb-4 flex-1 min-w-0">
                          <p className="text-slate-400 text-xs mb-2">
                            {new Date(f.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <div className="space-y-2">
                            {f.current_project && (
                              <div className="bg-black/20 rounded-xl p-3">
                                <p className="text-xs text-slate-500 mb-1">Project</p>
                                <p className="text-slate-200 text-sm">{f.current_project}</p>
                              </div>
                            )}
                            {f.biggest_challenge && (
                              <div className="bg-black/20 rounded-xl p-3">
                                <p className="text-xs text-slate-500 mb-1">Challenge</p>
                                <p className="text-slate-200 text-sm">{f.biggest_challenge}</p>
                              </div>
                            )}
                            {f.support_needed && (
                              <div className="bg-black/20 rounded-xl p-3">
                                <p className="text-xs text-slate-500 mb-1">Support Needed</p>
                                <p className="text-slate-200 text-sm">{f.support_needed}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
