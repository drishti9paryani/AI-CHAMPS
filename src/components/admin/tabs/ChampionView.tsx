'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import { AdminChampionSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { FLAG_STYLES } from '@/lib/admin'

interface Champion {
  id: string
  name: string
  email: string
  department: string
  ai_score: number
  tarot_card_type: string | null
  risk_flag: 'red' | 'amber' | 'green'
  current_week: number | null
  created_at: string
  updated_at: string | null
}

interface Submission {
  current_project: string
  challenge: string
  support_needed: string
  created_at: string
}

interface SearchResult {
  id: string
  name: string
  email: string
  department: string
}

export default function ChampionView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Champion | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('users')
      .select('id, name, email, department')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%,department.ilike.%${q}%`)
      .limit(8)
    setResults(data ?? [])
    setSearching(false)
  }

  async function selectChampion(r: SearchResult) {
    setResults([])
    setQuery(r.name)
    setLoadingProfile(true)
    const [{ data: user }, { data: sub }] = await Promise.all([
      supabase
        .from('users')
        .select('id, name, email, department, ai_score, tarot_card_type, risk_flag, current_week, created_at, updated_at')
        .eq('id', r.id)
        .single(),
      supabase
        .from('champ_forms')
        .select('current_project, biggest_challenge, support_needed, created_at')
        .eq('user_id', r.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])
    setSelected(user as Champion)
    setSubmission(sub ? {
      current_project: sub.current_project,
      challenge: sub.biggest_challenge,
      support_needed: sub.support_needed,
      created_at: sub.created_at,
    } : null)
    setLoadingProfile(false)
  }

  const completionPct = selected?.current_week
    ? Math.round((selected.current_week / 4) * 100)
    : 0

  const lastActive = selected?.updated_at ?? selected?.created_at ?? null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Champion View</h2>
        <p className="text-slate-400 text-sm">Search any AI Champ to see their full profile and activity.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <input
          type="search"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name, email, or department..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-10"
        />
        {searching && (
          <div className="absolute right-3 top-3.5 w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        )}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl">
            {results.map(r => (
              <button
                key={r.id}
                onClick={() => selectChampion(r)}
                className="w-full text-left px-4 py-3 hover:bg-white/10 transition flex items-center justify-between"
              >
                <span className="text-white font-medium">{r.name}</span>
                <span className="text-slate-400 text-sm">{r.department}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selected && !loadingProfile && (
        <EmptyState
          icon="🔍"
          title="Search for a Champion"
          description="Type a name, email, or department above to pull up a full profile."
        />
      )}

      {loadingProfile && <AdminChampionSkeleton />}

      {selected && !loadingProfile && (
        <div className="space-y-4">
          <GlassCard>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                <p className="text-slate-400 text-sm">{selected.department} · {selected.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs border capitalize self-start ${FLAG_STYLES[selected.risk_flag].badge}`}>
                {selected.risk_flag} risk
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { label: 'AI Score', value: `${selected.ai_score}/10`, color: 'text-purple-300' },
                { label: 'Archetype', value: selected.tarot_card_type ?? '—', color: 'text-blue-300' },
                { label: 'Roadmap Week', value: selected.current_week ? `Week ${selected.current_week}` : 'Not started', color: 'text-white' },
                { label: 'Completion', value: `${completionPct}%`, color: completionPct >= 75 ? 'text-green-300' : completionPct >= 40 ? 'text-amber-300' : 'text-red-300' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                  <p className={`font-semibold text-sm ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Joined</p>
                <p className="text-white text-sm">{new Date(selected.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">Last Active</p>
                <p className="text-white text-sm">{lastActive ? new Date(lastActive).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Roadmap Progress</span>
                <span>{completionPct}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {submission ? (
            <GlassCard>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Project & Responses</h4>
              <div className="space-y-3">
                {[
                  { label: 'Current Project', value: submission.current_project, icon: '🚀' },
                  { label: 'Biggest Challenge', value: submission.challenge, icon: '⚡' },
                  { label: 'Support Needed', value: submission.support_needed, icon: '🤝' },
                ].map(f => (
                  <div key={f.label} className="bg-white/5 rounded-xl p-4 flex gap-3">
                    <span className="text-lg flex-shrink-0">{f.icon}</span>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">{f.label}</p>
                      <p className="text-slate-200 text-sm leading-relaxed">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-3">
                Submitted {new Date(submission.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </GlassCard>
          ) : (
            <EmptyState
              icon="📝"
              title="No submission on file"
              description="This champion hasn't completed their onboarding form yet."
            />
          )}
        </div>
      )}
    </div>
  )
}
