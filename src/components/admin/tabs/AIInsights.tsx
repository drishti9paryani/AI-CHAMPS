'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/lib/toast'

interface InsightsData {
  summary: string
  challenges: string[]
  trainingSessions: string[]
  interventions: string[]
}

interface Snapshot {
  topTeam: string
  topChamp: string
  commonChallenge: string
  atRiskCount: number
  activePercent: number
}

export default function AIInsights() {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(true)

  useEffect(() => {
    async function loadSnapshot() {
      const [{ data: users }, { data: forms }] = await Promise.all([
        supabase.from('users').select('id, name, department, ai_score, risk_flag'),
        supabase.from('champ_forms').select('user_id, biggest_challenge, created_at'),
      ])
      if (!users) { setSnapshotLoading(false); return }

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const activeSet = new Set((forms ?? []).filter(f => new Date(f.created_at) >= weekAgo).map(f => f.user_id))

      // Top team by avg score
      const deptScores: Record<string, number[]> = {}
      users.forEach(u => {
        const d = u.department || 'Unknown'
        if (!deptScores[d]) deptScores[d] = []
        deptScores[d].push(u.ai_score ?? 0)
      })
      const topTeam = Object.entries(deptScores)
        .map(([d, scores]) => ({ d, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
        .sort((a, b) => b.avg - a.avg)[0]?.d ?? '—'

      // Top champion by score
      const topChamp = [...users].sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0))[0]?.name ?? '—'

      // Most common challenge keyword
      const words: Record<string, number> = {}
      const stopWords = new Set(['i', 'the', 'a', 'to', 'and', 'is', 'in', 'of', 'my', 'with', 'for', 'am', 'it', 'not', 'are', 'have', 'that', 'this'])
      ;(forms ?? []).forEach(f => {
        if (!f.biggest_challenge) return
        f.biggest_challenge.toLowerCase().split(/\W+/).forEach((w: string) => {
          if (w.length > 3 && !stopWords.has(w)) words[w] = (words[w] || 0) + 1
        })
      })
      const commonChallenge = Object.entries(words).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

      const atRiskCount = users.filter(u => u.risk_flag === 'red' || u.risk_flag === 'amber').length
      const activePercent = users.length ? Math.round((activeSet.size / users.length) * 100) : 0

      setSnapshot({ topTeam, topChamp, commonChallenge, atRiskCount, activePercent })
      setSnapshotLoading(false)
    }
    loadSnapshot()
  }, [])

  async function generate() {
    setLoading(true)
    setError('')

    const { data: subs } = await supabase
      .from('champ_forms')
      .select('current_project, biggest_challenge, support_needed, users(name, department)')

    if (!subs || subs.length === 0) {
      const msg = 'No submissions found.'
      setError(msg)
      toast.error(msg)
      setLoading(false)
      return
    }

    const submissions = subs.map(s => {
      const u = s.users as unknown as { name: string; department: string } | null
      return {
        name: u?.name || 'Unknown',
        department: u?.department || 'Unknown',
        current_project: s.current_project,
        challenge: s.biggest_challenge,
        support_needed: s.support_needed,
      }
    })

    const res = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissions }),
    })

    if (!res.ok) {
      const msg = 'Failed to generate insights.'
      setError(msg)
      toast.error(msg)
      setLoading(false)
      return
    }
    const data = await res.json()
    setInsights(data.insights)
    toast.success('Insights generated')
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Quick data snapshot — always visible */}
      {!snapshotLoading && snapshot && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Top Team', value: snapshot.topTeam, icon: '🏆', color: 'text-yellow-300' },
            { label: 'Top Champion', value: snapshot.topChamp, icon: '⭐', color: 'text-purple-300' },
            { label: 'Common Blocker', value: snapshot.commonChallenge, icon: '⚠️', color: 'text-orange-300' },
            { label: 'At-Risk Users', value: snapshot.atRiskCount, icon: '🚨', color: 'text-red-300' },
            { label: 'Weekly Active', value: `${snapshot.activePercent}%`, icon: '⚡', color: 'text-green-300' },
          ].map(s => (
            <GlassCard key={s.label} className="!p-4 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-sm font-semibold ${s.color} truncate`}>{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* AI generation section */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={generate}
          disabled={loading}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing…
            </>
          ) : (
            <>🤖 Generate AI Insights</>
          )}
        </button>
        {insights && (
          <button onClick={() => setInsights(null)} className="text-slate-400 hover:text-white text-sm transition">
            Clear
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {insights ? (
        <div className="space-y-4">
          <GlassCard>
            <h3 className="text-base font-semibold text-white mb-3">Executive Summary</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{insights.summary}</p>
          </GlassCard>

          <div className="grid md:grid-cols-3 gap-4">
            <GlassCard>
              <div className="text-2xl mb-2">⚠️</div>
              <h3 className="text-sm font-semibold text-purple-300 mb-3">Common Challenges</h3>
              <ul className="space-y-2">
                {insights.challenges.map((c, i) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-2">
                    <span className="text-purple-400 flex-shrink-0">{i + 1}.</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard>
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="text-sm font-semibold text-blue-300 mb-3">Suggested Training</h3>
              <ul className="space-y-2">
                {insights.trainingSessions.map((t, i) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-2">
                    <span className="text-blue-400 flex-shrink-0">{i + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard>
              <div className="text-2xl mb-2">🛠️</div>
              <h3 className="text-sm font-semibold text-teal-300 mb-3">Recommended Actions</h3>
              <ul className="space-y-2">
                {insights.interventions.map((t, i) => (
                  <li key={i} className="text-slate-300 text-sm flex gap-2">
                    <span className="text-teal-400 flex-shrink-0">{i + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      ) : !loading && (
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-slate-300 font-medium mb-2">AI-Powered Leadership Insights</p>
          <p className="text-slate-500 text-sm">Click Generate to analyze all submissions with Claude and get executive-ready recommendations</p>
        </GlassCard>
      )}
    </div>
  )
}
