'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/lib/toast'

// ─── System-flag constants ───────────────────────────────────────────────────
const INACTIVITY_DAYS = 14
const TOTAL_WEEKS = 4

interface RiskUser {
  id: string
  name: string
  email: string
  department: string
  risk_flag: 'red' | 'amber' | 'green' | null
  current_week: number
  created_at: string
  last_active: string | null
  onboarding_complete: boolean
  risk_reviewed_at: string | null
  reasons: string[]
  challenge?: string
  support_needed?: string
}

const SEVERITY: Record<string, number> = { red: 2, amber: 1, green: 0 }

function deriveSeverity(user: RiskUser): 'red' | 'amber' {
  if (
    user.risk_flag === 'red' ||
    !user.onboarding_complete ||
    (user.last_active && daysSince(user.last_active) >= INACTIVITY_DAYS)
  ) return 'red'
  return 'amber'
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
}

const SYS_FLAG_STYLE = {
  red:   { border: 'border-red-500/30 bg-red-500/5',   badge: 'bg-red-500/20 text-red-300 border-red-500/40',   icon: '🔴' },
  amber: { border: 'border-amber-500/30 bg-amber-500/5', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🟠' },
}

// ─── Champ-flag constants ─────────────────────────────────────────────────────
type Urgency      = 'critical' | 'high' | 'medium' | 'low'
type ProblemStatus = 'open' | 'in_progress' | 'resolved'

const URGENCY_ORDER: Record<Urgency, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const URGENCY_STYLE: Record<Urgency, { icon: string; label: string; border: string; badge: string }> = {
  critical: { icon: '🔴', label: 'Critical', border: 'border-red-500/30 bg-red-500/5',     badge: 'bg-red-500/20 text-red-300 border-red-500/40'       },
  high:     { icon: '🟠', label: 'High',     border: 'border-orange-500/30 bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  medium:   { icon: '🟡', label: 'Medium',   border: 'border-yellow-500/30 bg-yellow-500/5', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  low:      { icon: '🟢', label: 'Low',      border: 'border-green-500/30 bg-green-500/5',  badge: 'bg-green-500/20 text-green-300 border-green-500/40'   },
}

const STATUS_STYLE: Record<ProblemStatus, { label: string; badge: string }> = {
  open:        { label: 'Open',        badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  in_progress: { label: 'In Progress', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'   },
  resolved:    { label: 'Resolved',    badge: 'bg-green-500/20 text-green-300 border-green-500/30' },
}

const STATUS_TRANSITIONS: Record<ProblemStatus, { next: ProblemStatus; label: string }[]> = {
  open:        [{ next: 'in_progress', label: '▶ Mark In Progress' }],
  in_progress: [{ next: 'resolved', label: '✓ Mark Resolved' }, { next: 'open', label: '↩ Back to Open' }],
  resolved:    [{ next: 'open', label: '↩ Reopen' }],
}

interface ChampFlag {
  id: string
  user_id: string
  biggest_challenge: string | null
  support_needed: string | null
  current_project: string | null
  urgency: Urgency
  problem_status: ProblemStatus
  status_updated_at: string | null
  created_at: string
  users: { name: string; email: string; department: string } | null
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RiskFlags() {
  const [mode, setMode] = useState<'system' | 'champ'>('system')

  // System flags state
  const [sysUsers, setSysUsers]           = useState<RiskUser[]>([])
  const [sysLoading, setSysLoading]       = useState(true)
  const [sysFilter, setSysFilter]         = useState<'all' | 'red' | 'amber'>('all')
  const [showReviewed, setShowReviewed]   = useState(false)

  // Champ flags state
  const [champFlags, setChampFlags]       = useState<ChampFlag[]>([])
  const [champLoading, setChampLoading]   = useState(true)
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | Urgency>('all')
  const [statusFilter, setStatusFilter]   = useState<'all' | ProblemStatus>('open')

  // ── System flags loader ───────────────────────────────────────────────────
  const loadSystem = useCallback(async () => {
    setSysLoading(true)
    const [{ data: allUsers }, { data: forms }] = await Promise.all([
      supabase
        .from('users')
        .select('id, name, email, department, risk_flag, current_week, created_at, onboarding_complete, risk_reviewed_at'),
      supabase
        .from('champ_forms')
        .select('user_id, biggest_challenge, support_needed, created_at')
        .order('created_at', { ascending: false }),
    ])

    if (!allUsers) { setSysLoading(false); return }

    const lastActiveMap: Record<string, string> = {}
    const challengeMap: Record<string, string>  = {}
    const supportMap:   Record<string, string>  = {}
    ;(forms ?? []).forEach(f => {
      if (!lastActiveMap[f.user_id]) {
        lastActiveMap[f.user_id] = f.created_at
        challengeMap[f.user_id]  = f.biggest_challenge
        supportMap[f.user_id]    = f.support_needed
      }
    })

    const flagged: RiskUser[] = []
    allUsers.forEach(u => {
      const last_active = lastActiveMap[u.id] ?? null
      const reasons: string[] = []

      if (!u.onboarding_complete) reasons.push('Incomplete onboarding')
      if (!last_active) reasons.push('No submissions yet')
      else if (daysSince(last_active) >= INACTIVITY_DAYS) reasons.push(`Inactive for ${daysSince(last_active)} days`)
      if (u.risk_flag === 'red')   reasons.push('High-risk keywords in submission')
      else if (u.risk_flag === 'amber') reasons.push('Needs attention — flagged keywords')
      if (u.current_week <= 1 && u.created_at && daysSince(u.created_at) > 14) reasons.push('Roadmap stalled at Week 1')
      if ((u.current_week / TOTAL_WEEKS) < 0.25 && daysSince(u.created_at) > 30) reasons.push('Low roadmap progress after 30+ days')

      if (reasons.length > 0) {
        flagged.push({ ...u, last_active, reasons, challenge: challengeMap[u.id], support_needed: supportMap[u.id] } as RiskUser)
      }
    })

    flagged.sort((a, b) => SEVERITY[deriveSeverity(b)] - SEVERITY[deriveSeverity(a)])
    setSysUsers(flagged)
    setSysLoading(false)
  }, [])

  // ── Champ flags loader ────────────────────────────────────────────────────
  const loadChamp = useCallback(async () => {
    setChampLoading(true)
    const { data, error } = await supabase
      .from('champ_forms')
      .select('id, user_id, biggest_challenge, support_needed, current_project, urgency, problem_status, status_updated_at, created_at, users(name, email, department)')
      .not('urgency', 'is', null)
      .order('created_at', { ascending: false })

    if (error || !data) { setChampLoading(false); return }

    // Keep only the most recent submission per user
    const seen = new Set<string>()
    const unique: ChampFlag[] = []
    for (const row of data) {
      if (!seen.has(row.user_id)) {
        seen.add(row.user_id)
        unique.push(row as unknown as ChampFlag)
      }
    }
    unique.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency])
    setChampFlags(unique)
    setChampLoading(false)
  }, [])

  useEffect(() => { loadSystem() }, [loadSystem])
  useEffect(() => { loadChamp()  }, [loadChamp])

  // ── System flag actions ───────────────────────────────────────────────────
  async function markReviewed(id: string) {
    const now = new Date().toISOString()
    setSysUsers(prev => prev.map(u => u.id === id ? { ...u, risk_reviewed_at: now } : u))
    await supabase.from('users').update({ risk_reviewed_at: now }).eq('id', id)
    toast.success("Marked as reviewed — won't reappear unless new issues arise")
  }

  async function unmarkReviewed(id: string) {
    setSysUsers(prev => prev.map(u => u.id === id ? { ...u, risk_reviewed_at: null } : u))
    await supabase.from('users').update({ risk_reviewed_at: null }).eq('id', id)
    toast.success('Moved back to active flags')
  }

  function sendReminder(u: RiskUser) {
    const subject = encodeURIComponent('AI Champs Programme — Quick Check-in')
    const body    = encodeURIComponent(`Hi ${u.name.split(' ')[0]},\n\nJust checking in on your AI Champs journey. We noticed you haven't been active recently and wanted to see if there's anything we can do to support you.\n\nFeel free to reply to this email or book a session below.\n\nBest,\nAI Champs Team`)
    window.open(`mailto:${u.email}?subject=${subject}&body=${body}`, '_blank')
  }

  function scheduleSupport(u: RiskUser) {
    const subject = encodeURIComponent('AI Champs — Support Session')
    const body    = encodeURIComponent(`Hi ${u.name.split(' ')[0]},\n\nI'd love to schedule a support session to help you with your AI journey${u.challenge ? ` — especially around: "${u.challenge}"` : ''}.\n\nCould you share your availability this week?\n\nBest,\nAI Champs Team`)
    window.open(`mailto:${u.email}?subject=${subject}&body=${body}`, '_blank')
  }

  // ── Champ flag actions ────────────────────────────────────────────────────
  async function updateStatus(id: string, next: ProblemStatus) {
    const now = new Date().toISOString()
    setChampFlags(prev => prev.map(f => f.id === id ? { ...f, problem_status: next, status_updated_at: now } : f))
    const { error } = await supabase
      .from('champ_forms')
      .update({ problem_status: next, status_updated_at: now })
      .eq('id', id)
    if (error) { toast.error('Failed to update status'); return }
    toast.success(`Status updated to "${STATUS_STYLE[next].label}"`)
  }

  // ── Derived views ──────────────────────────────────────────────────────────
  const unreviewed = sysUsers.filter(u => !u.risk_reviewed_at)
  const reviewed   = sysUsers.filter(u =>  u.risk_reviewed_at)
  const visibleSys = (showReviewed ? reviewed : unreviewed).filter(
    u => sysFilter === 'all' || deriveSeverity(u) === sysFilter
  )
  const redCount   = unreviewed.filter(u => deriveSeverity(u) === 'red').length
  const amberCount = unreviewed.filter(u => deriveSeverity(u) === 'amber').length

  const visibleChamp = champFlags.filter(f => {
    if (urgencyFilter !== 'all' && f.urgency !== urgencyFilter) return false
    if (statusFilter  !== 'all' && f.problem_status !== statusFilter) return false
    return true
  })

  const champCounts = {
    open:        champFlags.filter(f => f.problem_status === 'open').length,
    in_progress: champFlags.filter(f => f.problem_status === 'in_progress').length,
    resolved:    champFlags.filter(f => f.problem_status === 'resolved').length,
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setMode('system')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'system'
              ? 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🤖 System Flags
        </button>
        <button
          onClick={() => setMode('champ')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'champ'
              ? 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🚩 Champ Self-Flags
          {champCounts.open + champCounts.in_progress > 0 && (
            <span className="ml-2 text-xs bg-red-500/30 text-red-300 border border-red-500/40 rounded-full px-1.5 py-0.5">
              {champCounts.open + champCounts.in_progress}
            </span>
          )}
        </button>
      </div>

      {/* ── SYSTEM FLAGS ── */}
      {mode === 'system' && (
        <div className="space-y-6">
          {/* Active vs Reviewed */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <button
              onClick={() => setShowReviewed(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                !showReviewed ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Active Flags ({unreviewed.length})
            </button>
            <button
              onClick={() => setShowReviewed(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                showReviewed ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Reviewed ({reviewed.length})
            </button>
          </div>

          {!showReviewed && (
            <div className="flex gap-3 flex-wrap items-center">
              <button onClick={() => setSysFilter('all')}   className={`px-4 py-2 rounded-xl text-sm transition border ${sysFilter === 'all'   ? 'bg-white/10 border-white/20 text-white'                            : 'border-white/10 text-slate-400 hover:text-white'}`}>All ({redCount + amberCount})</button>
              <button onClick={() => setSysFilter('red')}   className={`px-4 py-2 rounded-xl text-sm transition border ${sysFilter === 'red'   ? 'bg-red-500/20 border-red-500/30 text-red-300'                     : 'border-white/10 text-slate-400 hover:text-white'}`}>🔴 Critical ({redCount})</button>
              <button onClick={() => setSysFilter('amber')} className={`px-4 py-2 rounded-xl text-sm transition border ${sysFilter === 'amber' ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'               : 'border-white/10 text-slate-400 hover:text-white'}`}>🟠 At Risk ({amberCount})</button>
              <button onClick={loadSystem} className="ml-auto text-slate-500 hover:text-white text-sm transition">↻ Refresh</button>
            </div>
          )}

          {sysLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="glass rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : visibleSys.length === 0 ? (
            <GlassCard className="text-center py-16">
              <div className="text-4xl mb-4">{showReviewed ? '📋' : '✅'}</div>
              <p className="text-white font-semibold mb-2">{showReviewed ? 'No reviewed users yet' : 'All clear!'}</p>
              <p className="text-slate-400 text-sm">{showReviewed ? 'Reviewed users will appear here.' : 'No users flagged for intervention right now.'}</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {visibleSys.map(u => {
                const sev   = deriveSeverity(u)
                const style = SYS_FLAG_STYLE[sev]
                return (
                  <div key={u.id} className={`rounded-2xl p-5 border ${showReviewed ? 'border-white/10 bg-white/5' : style.border}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-white">{u.name}</h4>
                          {!showReviewed && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${style.badge}`}>
                              {style.icon} {sev === 'red' ? 'Critical' : 'At Risk'}
                            </span>
                          )}
                          {showReviewed && (
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-500/20 text-slate-400 border-slate-500/30">
                              ✓ Reviewed {u.risk_reviewed_at ? new Date(u.risk_reviewed_at).toLocaleDateString() : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">{u.department} · {u.email}</p>
                        {u.last_active && <p className="text-slate-500 text-xs mt-0.5">Last active {daysSince(u.last_active)}d ago</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {u.reasons.map((r, i) => (
                        <span key={i} className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-300">{r}</span>
                      ))}
                    </div>

                    {(u.challenge || u.support_needed) && (
                      <div className="grid sm:grid-cols-2 gap-2 mb-4">
                        {u.challenge && (
                          <div className="bg-black/20 rounded-xl p-3">
                            <p className="text-xs text-slate-500 mb-1">Challenge</p>
                            <p className="text-slate-300 text-sm">{u.challenge}</p>
                          </div>
                        )}
                        {u.support_needed && (
                          <div className="bg-black/20 rounded-xl p-3">
                            <p className="text-xs text-slate-500 mb-1">Support Needed</p>
                            <p className="text-slate-300 text-sm">{u.support_needed}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {!showReviewed ? (
                        <>
                          <button onClick={() => sendReminder(u)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition">📧 Email Reminder</button>
                          <button onClick={() => scheduleSupport(u)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition">📅 Email for Support</button>
                          <button onClick={() => markReviewed(u.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-400 hover:text-white transition">✓ Mark Reviewed</button>
                        </>
                      ) : (
                        <button onClick={() => unmarkReviewed(u.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-400 hover:text-white transition">↩ Move Back to Active</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CHAMP SELF-FLAGS ── */}
      {mode === 'champ' && (
        <div className="space-y-6">
          {/* Status filter */}
          <div className="flex flex-wrap gap-2 items-center">
            {(['open', 'in_progress', 'resolved', 'all'] as const).map(s => {
              const styles: Record<string, string> = {
                open:        statusFilter === 'open'        ? 'bg-slate-500/20 border-slate-400/40 text-white'                  : 'border-white/10 text-slate-400 hover:text-white',
                in_progress: statusFilter === 'in_progress' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'                 : 'border-white/10 text-slate-400 hover:text-white',
                resolved:    statusFilter === 'resolved'    ? 'bg-green-500/20 border-green-500/30 text-green-300'              : 'border-white/10 text-slate-400 hover:text-white',
                all:         statusFilter === 'all'         ? 'bg-white/10 border-white/20 text-white'                         : 'border-white/10 text-slate-400 hover:text-white',
              }
              const labels: Record<string, string> = {
                open: `Open (${champCounts.open})`,
                in_progress: `In Progress (${champCounts.in_progress})`,
                resolved: `Resolved (${champCounts.resolved})`,
                all: `All (${champFlags.length})`,
              }
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-sm transition border ${styles[s]}`}>
                  {labels[s]}
                </button>
              )
            })}
            <button onClick={loadChamp} className="ml-auto text-slate-500 hover:text-white text-sm transition">↻ Refresh</button>
          </div>

          {/* Urgency filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500">Filter urgency:</span>
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map(u => (
              <button key={u} onClick={() => setUrgencyFilter(u)}
                className={`px-3 py-1.5 rounded-xl text-xs transition border ${
                  urgencyFilter === u
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'border-white/10 text-slate-400 hover:text-white'
                }`}>
                {u === 'all' ? 'All' : `${URGENCY_STYLE[u].icon} ${URGENCY_STYLE[u].label}`}
              </button>
            ))}
          </div>

          {champLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="glass rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : visibleChamp.length === 0 ? (
            <GlassCard className="text-center py-16">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-white font-semibold mb-2">No flags matching this filter</p>
              <p className="text-slate-400 text-sm">Try a different status or urgency filter.</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {visibleChamp.map(f => {
                const ug     = URGENCY_STYLE[f.urgency]
                const st     = STATUS_STYLE[f.problem_status]
                const transitions = STATUS_TRANSITIONS[f.problem_status]
                const user   = f.users
                return (
                  <div key={f.id} className={`rounded-2xl p-5 border ${ug.border}`}>
                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-white">{user?.name ?? 'Unknown'}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${ug.badge}`}>
                            {ug.icon} {ug.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${st.badge}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">{user?.department} · {user?.email}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Submitted {new Date(f.created_at).toLocaleDateString()}
                          {f.status_updated_at && ` · Updated ${new Date(f.status_updated_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-2 mb-4">
                      {f.biggest_challenge && (
                        <div className="bg-black/20 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1">Biggest Challenge</p>
                          <p className="text-slate-300 text-sm">{f.biggest_challenge}</p>
                        </div>
                      )}
                      {f.support_needed && (
                        <div className="bg-black/20 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1">Support Needed</p>
                          <p className="text-slate-300 text-sm">{f.support_needed}</p>
                        </div>
                      )}
                      {f.current_project && (
                        <div className="bg-black/20 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1">Current Project</p>
                          <p className="text-slate-300 text-sm">{f.current_project}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {transitions.map(t => (
                        <button
                          key={t.next}
                          onClick={() => updateStatus(f.id, t.next)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
                        >
                          {t.label}
                        </button>
                      ))}
                      {user?.email && (
                        <button
                          onClick={() => {
                            const subject = encodeURIComponent('AI Champs — Following up on your flag')
                            const body = encodeURIComponent(`Hi ${user.name?.split(' ')[0] ?? ''},\n\nWe wanted to follow up on the challenge you flagged:\n\n"${f.biggest_challenge ?? f.support_needed ?? ''}"\n\nHas this been resolved, or is there anything we can do to help?\n\nBest,\nAI Champs Team`)
                            window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, '_blank')
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition"
                        >
                          📧 Follow Up
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
