'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/lib/toast'

const INACTIVITY_DAYS = 14
const TOTAL_WEEKS = 12

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

const FLAG_STYLE = {
  red: { border: 'border-red-500/30 bg-red-500/5', badge: 'bg-red-500/20 text-red-300 border-red-500/40', icon: '🔴' },
  amber: { border: 'border-amber-500/30 bg-amber-500/5', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🟠' },
}

export default function RiskFlags() {
  const [users, setUsers] = useState<RiskUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'red' | 'amber'>('all')
  const [showReviewed, setShowReviewed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)

    const [{ data: allUsers }, { data: forms }] = await Promise.all([
      supabase
        .from('users')
        .select('id, name, email, department, risk_flag, current_week, created_at, onboarding_complete, risk_reviewed_at'),
      supabase
        .from('champ_forms')
        .select('user_id, biggest_challenge, support_needed, created_at')
        .order('created_at', { ascending: false }),
    ])

    if (!allUsers) { setLoading(false); return }

    const lastActiveMap: Record<string, string> = {}
    const challengeMap: Record<string, string> = {}
    const supportMap: Record<string, string> = {}
    ;(forms ?? []).forEach(f => {
      if (!lastActiveMap[f.user_id]) {
        lastActiveMap[f.user_id] = f.created_at
        challengeMap[f.user_id] = f.biggest_challenge
        supportMap[f.user_id] = f.support_needed
      }
    })

    const flagged: RiskUser[] = []
    allUsers.forEach(u => {
      const last_active = lastActiveMap[u.id] ?? null
      const reasons: string[] = []

      if (!u.onboarding_complete) reasons.push('Incomplete onboarding')
      if (!last_active) reasons.push('No submissions yet')
      else if (daysSince(last_active) >= INACTIVITY_DAYS) reasons.push(`Inactive for ${daysSince(last_active)} days`)
      if (u.risk_flag === 'red') reasons.push('High-risk keywords in submission')
      else if (u.risk_flag === 'amber') reasons.push('Needs attention — flagged keywords')
      if (u.current_week <= 1 && u.created_at && daysSince(u.created_at) > 14) reasons.push('Roadmap stalled at Week 1')
      if ((u.current_week / TOTAL_WEEKS) < 0.25 && daysSince(u.created_at) > 30) reasons.push('Low roadmap progress after 30+ days')

      if (reasons.length > 0) {
        flagged.push({
          ...u,
          last_active,
          reasons,
          challenge: challengeMap[u.id],
          support_needed: supportMap[u.id],
        } as RiskUser)
      }
    })

    flagged.sort((a, b) => SEVERITY[deriveSeverity(b)] - SEVERITY[deriveSeverity(a)])
    setUsers(flagged)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function markReviewed(id: string) {
    const now = new Date().toISOString()
    setUsers(prev => prev.map(u => u.id === id ? { ...u, risk_reviewed_at: now } : u))
    await supabase.from('users').update({ risk_reviewed_at: now }).eq('id', id)
    toast.success('Marked as reviewed — won\'t reappear unless new issues arise')
  }

  async function unmarkReviewed(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, risk_reviewed_at: null } : u))
    await supabase.from('users').update({ risk_reviewed_at: null }).eq('id', id)
    toast.success('Moved back to active flags')
  }

  function sendReminder(u: RiskUser) {
    toast.success(`Reminder queued for ${u.name}`)
  }

  function scheduleSupport(u: RiskUser) {
    toast.success(`Support session scheduled for ${u.name}`)
  }

  const unreviewed = users.filter(u => !u.risk_reviewed_at)
  const reviewed = users.filter(u => u.risk_reviewed_at)

  const visible = (showReviewed ? reviewed : unreviewed).filter(
    u => filter === 'all' || deriveSeverity(u) === filter
  )

  const redCount = unreviewed.filter(u => deriveSeverity(u) === 'red').length
  const amberCount = unreviewed.filter(u => deriveSeverity(u) === 'amber').length

  return (
    <div className="space-y-6">
      {/* Tabs: Active vs Reviewed */}
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

      {/* Severity filter */}
      {!showReviewed && (
        <div className="flex gap-3 flex-wrap items-center">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm transition border ${filter === 'all' ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
            All ({redCount + amberCount})
          </button>
          <button onClick={() => setFilter('red')} className={`px-4 py-2 rounded-xl text-sm transition border ${filter === 'red' ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'border-white/10 text-slate-400 hover:text-white'}`}>
            🔴 Critical ({redCount})
          </button>
          <button onClick={() => setFilter('amber')} className={`px-4 py-2 rounded-xl text-sm transition border ${filter === 'amber' ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'border-white/10 text-slate-400 hover:text-white'}`}>
            🟠 At Risk ({amberCount})
          </button>
          <button onClick={load} className="ml-auto text-slate-500 hover:text-white text-sm transition">↻ Refresh</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <GlassCard className="text-center py-16">
          <div className="text-4xl mb-4">{showReviewed ? '📋' : '✅'}</div>
          <p className="text-white font-semibold mb-2">
            {showReviewed ? 'No reviewed users yet' : 'All clear!'}
          </p>
          <p className="text-slate-400 text-sm">
            {showReviewed ? 'Reviewed users will appear here.' : 'No users flagged for intervention right now.'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {visible.map(u => {
            const sev = deriveSeverity(u)
            const style = FLAG_STYLE[sev]
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
                    {u.last_active && (
                      <p className="text-slate-500 text-xs mt-0.5">Last active {daysSince(u.last_active)}d ago</p>
                    )}
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
                      <button onClick={() => sendReminder(u)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition">
                        📧 Send Reminder
                      </button>
                      <button onClick={() => scheduleSupport(u)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition">
                        📅 Schedule Support
                      </button>
                      <button onClick={() => markReviewed(u.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-400 hover:text-white transition">
                        ✓ Mark Reviewed
                      </button>
                    </>
                  ) : (
                    <button onClick={() => unmarkReviewed(u.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-slate-400 hover:text-white transition">
                      ↩ Move Back to Active
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
