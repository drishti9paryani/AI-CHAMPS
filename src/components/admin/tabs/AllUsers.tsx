'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { AdminUsersSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import UserDashboard from '@/components/dashboard/UserDashboard'
import { toast } from '@/lib/toast'

const TOTAL_WEEKS = 4

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

const ARCHETYPES = [
  'The Prompt Wizard',
  'The Workflow Architect',
  'The Curious Hacker',
  'The Automation Monk',
  'The AI Explorer',
  'The Agent Builder',
]

// Week 1 = just started = 0% done. Week 2 = finished Week 1 = 25%. etc.
function completion(week: number | null) {
  return Math.min(Math.max(0, Math.round(((week ?? 1) - 1) / TOTAL_WEEKS * 100)), 100)
}

// All email domains are accepted — WRM uses Google SSO including personal accounts
function isNonWrmEmail(_email: string) { return false }

function exportCSV(rows: User[]) {
  const headers = ['Name', 'Email', 'Department', 'AI Score', 'Archetype', 'Week', 'Completion %', 'Status', 'Risk', 'Last Active', 'Joined']
  const lines = rows.map(u => [
    u.name ?? '',
    u.email ?? '',
    u.department ?? '',
    u.ai_score ?? '',
    u.tarot_card_type ?? '',
    u.onboarding_complete ? (u.current_week ?? 1) : '',
    u.onboarding_complete ? completion(u.current_week) + '%' : '',
    u.onboarding_complete ? 'Active' : 'Incomplete',
    u.risk_flag ?? 'green',
    u.last_active ? new Date(u.last_active).toLocaleDateString() : '',
    new Date(u.created_at).toLocaleDateString(),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `ai-champs-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

const SECTIONS: { id: Section; label: string; icon: string; desc: string }[] = [
  { id: 'all',        label: 'All Users',      icon: '👥', desc: 'Everyone who signed up' },
  { id: 'active',     label: 'Active Champs',  icon: '⚡', desc: 'Completed onboarding' },
  { id: 'incomplete', label: 'Incomplete',     icon: '⏳', desc: "Haven't finished onboarding" },
  { id: 'admins',     label: 'Admins',         icon: '🛡️', desc: 'Admin-role accounts' },
]

// ─── Edit panel ───────────────────────────────────────────────────────────────
interface EditState {
  name: string
  department: string
  ai_score: string
  current_week: string
  tarot_card_type: string
  risk_flag: string
  role: string
}

interface FormEdit {
  id: string
  current_project: string
  biggest_challenge: string
  support_needed: string
}

function EditPanel({
  user,
  forms,
  onSaved,
}: {
  user: User
  forms: FormEntry[]
  onSaved: (updated: Partial<User>) => void
}) {
  const [fields, setFields] = useState<EditState>({
    name: user.name ?? '',
    department: user.department ?? '',
    ai_score: String(user.ai_score ?? ''),
    current_week: String(user.current_week ?? 1),
    tarot_card_type: user.tarot_card_type ?? '',
    risk_flag: user.risk_flag ?? 'green',
    role: user.role ?? 'user',
  })

  const latestForm = forms[0]
  const [formEdit, setFormEdit] = useState<FormEdit>({
    id: latestForm?.id ?? '',
    current_project: latestForm?.current_project ?? '',
    biggest_challenge: latestForm?.biggest_challenge ?? '',
    support_needed: latestForm?.support_needed ?? '',
  })

  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const updates: Record<string, unknown> = {
      name: fields.name,
      department: fields.department,
      ai_score: fields.ai_score !== '' ? Number(fields.ai_score) : null,
      current_week: Number(fields.current_week),
      tarot_card_type: fields.tarot_card_type || null,
      risk_flag: fields.risk_flag,
      role: fields.role,
    }

    const { error } = await supabase.from('users').update(updates).eq('id', user.id)
    if (error) { toast.error('User save failed: ' + error.message); setSaving(false); return }

    // Save form if it exists
    if (formEdit.id) {
      const { error: fErr } = await supabase.from('champ_forms').update({
        current_project: formEdit.current_project,
        biggest_challenge: formEdit.biggest_challenge,
        support_needed: formEdit.support_needed,
      }).eq('id', formEdit.id)
      if (fErr) { toast.error('Form save failed: ' + fErr.message); setSaving(false); return }
    }

    toast.success(`${fields.name}'s profile updated ✅`)
    setSaving(false)
    onSaved(updates as Partial<User>)
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition'
  const selectCls = 'w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition'
  const labelCls = 'block text-xs text-slate-400 mb-1 font-medium'

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">Changes save directly to the database. All fields are optional except name.</p>

      {/* Profile fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Name</label>
          <input className={inputCls} value={fields.name} onChange={e => setFields(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>Department</label>
          <input className={inputCls} value={fields.department} onChange={e => setFields(p => ({ ...p, department: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>AI Score (0–5)</label>
          <input type="number" min={0} max={5} step={0.1} className={inputCls} value={fields.ai_score}
            onChange={e => setFields(p => ({ ...p, ai_score: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>Roadmap Week (1–4)</label>
          <input type="number" min={1} max={4} className={inputCls} value={fields.current_week}
            onChange={e => setFields(p => ({ ...p, current_week: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>Archetype</label>
          <select className={selectCls} value={fields.tarot_card_type} onChange={e => setFields(p => ({ ...p, tarot_card_type: e.target.value }))}>
            <option value="">— none —</option>
            {ARCHETYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Risk Flag</label>
          <select className={selectCls} value={fields.risk_flag} onChange={e => setFields(p => ({ ...p, risk_flag: e.target.value }))}>
            <option value="green">🟢 Green</option>
            <option value="amber">🟠 Amber</option>
            <option value="red">🔴 Red</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Role</label>
          <select className={selectCls} value={fields.role} onChange={e => setFields(p => ({ ...p, role: e.target.value }))}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Form answers */}
      {formEdit.id && (
        <div className="border-t border-white/10 pt-4 space-y-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Latest Check-in Answers</p>
          <div>
            <label className={labelCls}>Support Needed</label>
            <textarea rows={2} className={inputCls + ' resize-none'} value={formEdit.support_needed}
              onChange={e => setFormEdit(p => ({ ...p, support_needed: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Current AI Initiative</label>
            <textarea rows={2} className={inputCls + ' resize-none'} value={formEdit.current_project}
              onChange={e => setFormEdit(p => ({ ...p, current_project: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Biggest Challenge</label>
            <textarea rows={2} className={inputCls + ' resize-none'} value={formEdit.biggest_challenge}
              onChange={e => setFormEdit(p => ({ ...p, biggest_challenge: e.target.value }))} />
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600
          hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all disabled:opacity-50 text-sm"
      >
        {saving ? 'Saving…' : 'Save Changes →'}
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [depts, setDepts] = useState<string[]>([])
  const [section, setSection] = useState<Section>('all')

  // Detail modal state
  const [selected, setSelected] = useState<User | null>(null)
  const [forms, setForms] = useState<FormEntry[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailTab, setDetailTab] = useState<'view' | 'edit' | 'dashboard'>('view')

  // Full-screen dashboard preview
  const [dashboardUser, setDashboardUser] = useState<string | null>(null)

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
    setDetailTab('view')
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

  function handleUserSaved(updated: Partial<User>) {
    if (!selected) return
    const merged = { ...selected, ...updated } as User
    setSelected(merged)
    setUsers(prev => prev.map(u => u.id === merged.id ? merged : u))
  }

  function filterBySection(list: User[]): User[] {
    switch (section) {
      case 'active':     return list.filter(u => u.onboarding_complete)
      case 'incomplete': return list.filter(u => !u.onboarding_complete)
      case 'admins':     return list.filter(u => u.role === 'admin')
      default:           return list
    }
  }

  const filtered = filterBySection(users).filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q) || (u.department ?? '').toLowerCase().includes(q)
    const matchDept = !deptFilter || u.department === deptFilter
    return matchSearch && matchDept
  })

  const counts = {
    all:        users.length,
    active:     users.filter(u => u.onboarding_complete).length,
    incomplete: users.filter(u => !u.onboarding_complete).length,
    admins:     users.filter(u => u.role === 'admin').length,
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
              section === s.id ? 'bg-purple-500/20 border-purple-500/40' : 'glass border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg">{s.icon}</span>
              <span className={`text-xl font-bold ${section === s.id ? 'text-purple-300' : 'text-white'}`}>{counts[s.id]}</span>
            </div>
            <div className={`text-sm font-medium ${section === s.id ? 'text-purple-200' : 'text-white'}`}>{s.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Filters + Export */}
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
        <button
          onClick={() => exportCSV(filtered)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['Name', 'Email', 'Team', 'Score', 'Archetype', 'Week', 'Progress', 'Last Active', 'Status', 'Risk', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 py-3 text-slate-400 font-medium whitespace-nowrap text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const comp = completion(u.current_week)
              const flag = u.risk_flag ?? 'green'
              const suspicious = isNonWrmEmail(u.email)
              const hasArchetypeButIncomplete = !!u.tarot_card_type && !u.onboarding_complete
              return (
                <tr
                  key={u.id}
                  className={`border-b border-white/5 hover:bg-purple-500/10 cursor-pointer transition
                    ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}
                    ${suspicious ? 'border-l-2 border-l-amber-500/50' : ''}`}
                  onClick={() => openUser(u)}
                >
                  {/* Name */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white font-medium text-sm">{u.name ?? '—'}</span>
                      {u.role === 'admin' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Admin</span>
                      )}
                      {suspicious && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Non-WRM email">⚠️ External</span>
                      )}
                    </div>
                  </td>

                  {/* Email — separate column */}
                  <td className="px-3 py-3">
                    <a
                      href={`mailto:${u.email}`}
                      onClick={e => e.stopPropagation()}
                      className="text-purple-400 hover:text-purple-300 text-xs transition truncate block max-w-[160px]"
                    >
                      {u.email}
                    </a>
                  </td>

                  <td className="px-3 py-3 text-slate-300 text-xs whitespace-nowrap">{u.department ?? '—'}</td>

                  <td className="px-3 py-3">
                    {u.ai_score != null
                      ? <span className="text-purple-300 font-semibold">{u.ai_score}/5</span>
                      : <span className="text-slate-600">—</span>}
                  </td>

                  <td className="px-3 py-3 text-slate-400 text-xs max-w-[90px] truncate">
                    {u.tarot_card_type || '—'}
                  </td>

                  <td className="px-3 py-3 text-slate-300 text-xs">
                    {u.onboarding_complete ? `Wk ${u.current_week ?? 1}` : <span className="text-slate-600">—</span>}
                  </td>

                  <td className="px-3 py-3">
                    {u.onboarding_complete ? (
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 bg-white/10 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: comp === 0 ? '4px' : `${comp}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs w-8 text-right">{comp}%</span>
                      </div>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>

                  <td className="px-3 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {u.last_active ? timeAgo(u.last_active) : '—'}
                  </td>

                  <td className="px-3 py-3">
                    {u.onboarding_complete
                      ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 whitespace-nowrap">✓ Active</span>
                      : <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 whitespace-nowrap">Incomplete</span>}
                  </td>

                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border capitalize ${FLAG_COLORS[flag]}`}>{flag}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { openUser(u); setDetailTab('edit') }}
                        className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/15 border border-purple-500/25
                          text-purple-300 hover:bg-purple-500/25 transition whitespace-nowrap font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDashboardUser(u.id)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20
                          text-blue-300 hover:bg-blue-500/20 transition whitespace-nowrap font-medium"
                      >
                        👁 View
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail / Edit modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="p-6 border-b border-white/10 flex items-start justify-between sticky top-0 bg-[#110a22]/95 backdrop-blur-md z-10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-white">{selected.name ?? 'Unknown'}</h3>
                    {selected.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Admin</span>
                    )}
                    {selected.onboarding_complete
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Active</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">Incomplete</span>}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{selected.department ?? 'No dept'} · {selected.email}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-2xl leading-none ml-4 p-1">×</button>
              </div>

              {/* Tab bar */}
              <div className="flex border-b border-white/10 px-6">
                {[
                  { id: 'view', label: '📋 Details' },
                  { id: 'edit', label: '✏️ Edit' },
                  { id: 'dashboard', label: '👁 Dashboard' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id as typeof detailTab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${
                      detailTab === t.id
                        ? 'border-purple-500 text-purple-300'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* ── VIEW tab ── */}
                {detailTab === 'view' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'AI Score',      value: selected.ai_score != null ? `${selected.ai_score}/5` : '—', color: 'text-purple-300' },
                        { label: 'Roadmap Week',  value: selected.onboarding_complete ? `Week ${selected.current_week ?? 1}` : '—', color: 'text-blue-300' },
                        { label: 'Completion',    value: selected.onboarding_complete ? `${completion(selected.current_week)}%` : '—', color: 'text-green-300' },
                        { label: 'Risk',          value: selected.risk_flag ?? 'none', color: 'text-slate-300' },
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
                                  {f.support_needed && (
                                    <div className="bg-black/20 rounded-xl p-3">
                                      <p className="text-xs text-slate-500 mb-1">Support Needed</p>
                                      <p className="text-slate-200 text-sm">{f.support_needed}</p>
                                    </div>
                                  )}
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
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── EDIT tab ── */}
                {detailTab === 'edit' && (
                  <EditPanel user={selected} forms={forms} onSaved={handleUserSaved} />
                )}

                {/* ── DASHBOARD preview tab ── */}
                {detailTab === 'dashboard' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-sm">
                        Previewing <span className="text-white font-medium">{selected.name}</span>'s dashboard as they see it.
                      </p>
                      <button
                        onClick={() => setDashboardUser(selected.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition"
                      >
                        ↗ Full Screen
                      </button>
                    </div>
                    {/* Scaled-down iframe-like embed */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 relative" style={{ height: 480 }}>
                      <div
                        className="origin-top-left absolute inset-0"
                        style={{ transform: 'scale(0.6)', width: '166.6%', height: '166.6%', pointerEvents: 'none' }}
                      >
                        <UserDashboard userId={selected.id} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-screen dashboard preview ──────────────────────────────────── */}
      <AnimatePresence>
        {dashboardUser && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] overflow-y-auto"
            style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #0d0d1a 60%)' }}
          >
            {/* Close bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3
              bg-black/60 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-purple-400 text-sm font-semibold">Admin Preview</span>
                <span className="text-slate-500 text-xs">— viewing as {users.find(u => u.id === dashboardUser)?.name ?? 'user'}</span>
              </div>
              <button
                onClick={() => setDashboardUser(null)}
                className="px-4 py-1.5 rounded-xl text-sm font-medium bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
              >
                ✕ Exit Preview
              </button>
            </div>
            <UserDashboard userId={dashboardUser} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
