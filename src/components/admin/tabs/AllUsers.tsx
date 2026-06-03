'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AdminUsersSkeleton } from '@/components/ui/skeletons/AdminSkeletons'

interface User {
  id: string; name: string; email: string; department: string
  ai_score: number; tarot_card_type: string | null; risk_flag: 'red' | 'amber' | 'green'
}

interface Submission {
  current_project: string; challenge: string; support_needed: string; created_at: string
}

const FLAG_COLORS = {
  red: 'bg-red-500/20 text-red-300 border-red-500/40',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  green: 'bg-green-500/20 text-green-300 border-green-500/40',
}

export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [depts, setDepts] = useState<string[]>([])
  const [selected, setSelected] = useState<User | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    supabase.from('users').select('id,name,email,department,ai_score,tarot_card_type,risk_flag').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setUsers(data as User[])
          setDepts([...new Set(data.map(u => u.department))].sort())
        }
        setLoading(false)
      })
  }, [])

  if (loading) return <AdminUsersSkeleton />

  async function openUser(u: User) {
    setSelected(u)
    setLoadingDetail(true)
    const { data } = await supabase
      .from('submissions')
      .select('current_project, challenge, support_needed, created_at')
      .eq('user_id', u.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setSubmission(data)
    setLoadingDetail(false)
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q)
    return matchesSearch && (!dept || u.department === dept)
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, department..."
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <select value={dept} onChange={e => setDept(e.target.value)}
          className="bg-[#0d0d1a] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500">
          <option value="">All Departments</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="text-slate-400 text-sm self-center">{filtered.length} users</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['Name', 'Department', 'Email', 'AI Score', 'Tarot Type', 'Risk Flag'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u.id}
                onClick={() => openUser(u)}
                className={`border-b border-white/5 hover:bg-purple-500/10 cursor-pointer transition ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
              >
                <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                <td className="px-4 py-3 text-slate-300">{u.department}</td>
                <td className="px-4 py-3 text-slate-400 max-w-[140px] truncate">{u.email}</td>
                <td className="px-4 py-3"><span className="text-purple-300 font-semibold">{u.ai_score}/10</span></td>
                <td className="px-4 py-3 text-slate-300 text-xs">{u.tarot_card_type || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${FLAG_COLORS[u.risk_flag]}`}>{u.risk_flag}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="glass rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                <p className="text-slate-400 text-sm">{selected.department} · {selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-slate-500 text-xs">AI Score</p>
                  <p className="text-purple-300 font-bold">{selected.ai_score}/10</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-slate-500 text-xs">Tarot Type</p>
                  <p className="text-white text-sm">{selected.tarot_card_type || '—'}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 col-span-2">
                  <p className="text-slate-500 text-xs">Risk Flag</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs border capitalize ${FLAG_COLORS[selected.risk_flag]}`}>{selected.risk_flag}</span>
                </div>
              </div>

              {loadingDetail ? (
                <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : submission ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300">Form Responses</h4>
                  {[
                    { label: 'Current Project', value: submission.current_project },
                    { label: 'Biggest Challenge', value: submission.challenge },
                    { label: 'Support Needed', value: submission.support_needed },
                  ].map(f => (
                    <div key={f.label} className="bg-white/5 rounded-xl p-3">
                      <p className="text-slate-500 text-xs mb-1">{f.label}</p>
                      <p className="text-slate-200 text-sm">{f.value}</p>
                    </div>
                  ))}
                  <p className="text-slate-600 text-xs">Submitted {new Date(submission.created_at).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No submission on file</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
