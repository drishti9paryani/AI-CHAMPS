'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { AdminRiskSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { toast } from '@/lib/toast'

interface FlaggedUser {
  id: string; name: string; department: string; email: string
  flag_color: 'red' | 'amber' | 'green'
  reason: string
  challenge?: string
  support_needed?: string
}

const FLAG_STYLE = {
  red: { border: 'border-red-500/40 bg-red-500/10', badge: 'bg-red-500/20 text-red-300 border-red-500/40', icon: '🔴' },
  amber: { border: 'border-amber-500/40 bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🟠' },
  green: { border: 'border-green-500/40 bg-green-500/10', badge: 'bg-green-500/20 text-green-300 border-green-500/40', icon: '🟢' },
}

export default function RiskFlags() {
  const [flagged, setFlagged] = useState<FlaggedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: flags } = await supabase
      .from('risk_flags')
      .select('user_id, flag_color, reason, users(id, name, department, email)')
      .order('flag_color')

    if (!flags?.length) {
      const { data: users } = await supabase
        .from('users')
        .select('id, name, department, email, risk_flag')
        .in('risk_flag', ['red', 'amber'])
      if (users) {
        const enriched = await Promise.all(users.map(async u => {
          const { data: sub } = await supabase.from('submissions').select('challenge, support_needed').eq('user_id', u.id).limit(1).maybeSingle()
          return {
            id: u.id, name: u.name, department: u.department, email: u.email,
            flag_color: u.risk_flag as 'red' | 'amber', reason: 'Keyword-based flag from submission',
            challenge: sub?.challenge, support_needed: sub?.support_needed,
          }
        }))
        setFlagged(enriched)
      } else {
        setFlagged([])
      }
      setLoading(false)
      return
    }

    const enriched = await Promise.all(flags.map(async f => {
      const u = f.users as unknown as { id: string; name: string; department: string; email: string }
      const { data: sub } = await supabase.from('submissions').select('challenge, support_needed').eq('user_id', f.user_id).limit(1).maybeSingle()
      return {
        id: u.id, name: u.name, department: u.department, email: u.email,
        flag_color: f.flag_color as 'red' | 'amber' | 'green', reason: f.reason,
        challenge: sub?.challenge, support_needed: sub?.support_needed,
      }
    }))
    setFlagged(enriched)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function runAnalysis() {
    setAnalyzing(true)
    setError('')
    const res = await fetch('/api/risk-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    if (!res.ok) {
      const msg = 'Risk analysis failed. Check ANTHROPIC_API_KEY and Supabase config.'
      setError(msg)
      toast.error(msg)
      setAnalyzing(false)
      return
    }
    await load()
    toast.success('Risk analysis complete')
    setAnalyzing(false)
  }

  const red = flagged.filter(u => u.flag_color === 'red')
  const amber = flagged.filter(u => u.flag_color === 'amber')
  const green = flagged.filter(u => u.flag_color === 'green')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition disabled:opacity-50"
        >
          {analyzing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Running Risk Analysis...
            </span>
          ) : 'Run Risk Analysis'}
        </button>
        <p className="text-slate-500 text-sm">Analyzes all submissions with Claude and saves to risk_flags</p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {loading ? (
        <AdminRiskSkeleton />
      ) : (
        <>
          <div className="flex gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">🔴 {red.length} Critical</div>
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">🟠 {amber.length} Needs Attention</div>
            <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm">🟢 {green.length} On Track</div>
          </div>

          {flagged.length === 0 ? (
            <GlassCard className="text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-slate-400">No risk flags yet. Run analysis to evaluate all AI Champs.</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {[...red, ...amber, ...green].map(u => {
                const style = FLAG_STYLE[u.flag_color]
                return (
                  <div key={u.id} className={`rounded-2xl p-5 border ${style.border}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-white">{u.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${style.badge}`}>
                            {style.icon} {u.flag_color}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">{u.department} · {u.email}</p>
                        <p className="text-slate-300 text-sm mt-2 italic">&ldquo;{u.reason}&rdquo;</p>
                      </div>
                    </div>
                    {(u.challenge || u.support_needed) && (
                      <div className="grid sm:grid-cols-2 gap-2">
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
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
