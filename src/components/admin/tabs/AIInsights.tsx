'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/lib/toast'

interface InsightsData {
  summary: string
  challenges: string[]
  trainingSessions: string[]
  interventions: string[]
}

export default function AIInsights() {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">AI Insights Hub</h2>
        <p className="text-slate-400 text-sm">Claude-powered analysis of all AI Champs submissions — executive summaries, blockers, and recommended actions.</p>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={generate}
          disabled={loading}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing submissions...
            </span>
          ) : 'Generate Insights'}
        </button>
        {insights && (
          <button onClick={() => setInsights(null)} className="text-slate-400 hover:text-white text-sm transition">
            Clear
          </button>
        )}
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {insights && (
        <div className="space-y-4">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-2">Executive Summary</h3>
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
              <h3 className="text-sm font-semibold text-teal-300 mb-3">Suggested Interventions</h3>
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
      )}

      {!insights && !loading && (
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-slate-400">Click &quot;Generate Insights&quot; to analyze all submissions with Claude</p>
        </GlassCard>
      )}
    </div>
  )
}
