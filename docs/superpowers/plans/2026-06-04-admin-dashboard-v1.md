# Admin Dashboard V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new tabs (Champion View, Team View, Projects, Risk Centre) to the existing admin dashboard, enrich AI Insights, and restrict access to 5 specific email addresses.

**Architecture:** All new tabs are client components under `src/components/admin/tabs/`, fetching directly from Supabase using the existing `supabase` proxy from `@/lib/supabase`. The admin page `src/app/admin/page.tsx` owns the tab registry and renders the active tab. Access restriction lives in `src/app/admin/layout.tsx` which server-side checks the session email against a hardcoded allowlist.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase JS client, Recharts (already installed), Framer Motion (already installed)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/app/admin/layout.tsx` | Add email-based access restriction |
| Modify | `src/app/admin/page.tsx` | Register 4 new tabs + switch cases |
| Modify | `src/components/ui/skeletons/AdminSkeletons.tsx` | Add 4 new skeleton exports |
| Create | `src/components/admin/tabs/ChampionView.tsx` | Search + employee profile deep-dive |
| Create | `src/components/admin/tabs/TeamView.tsx` | Department health + leaderboard |
| Create | `src/components/admin/tabs/Projects.tsx` | Company-wide AI project tracker |
| Create | `src/components/admin/tabs/RiskCentre.tsx` | Auto-flagged users + quick actions |
| Modify | `src/components/admin/tabs/AIInsights.tsx` | Prepend executive summary block |

---

## Task 1: Access Restriction

**Files:**
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: Replace layout with email-allowlist guard**

Replace the entire contents of `src/app/admin/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin',
  description: 'AI Champs admin analytics, user management, insights, and roadmap editor.',
}

const ADMIN_EMAILS = [
  's@wrd.co.in',
  'mitchelle@wrd.co.in',
  'siddhantsethi@wrd.co.in',
  'yashvigotecha@wrd.co.in',
  'drishtiparyani@wrd.co.in',
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
```

- [ ] **Step 2: Verify the server runs without error**

```bash
npm run dev
```

Visit `/admin` while logged in as a non-admin email — should redirect to `/dashboard`. Visit as one of the 5 allowed emails — should load normally.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/layout.tsx
git commit -m "feat: restrict admin to allowlisted emails"
```

---

## Task 2: Add Skeletons for New Tabs

**Files:**
- Modify: `src/components/ui/skeletons/AdminSkeletons.tsx`

- [ ] **Step 1: Append 4 new skeleton exports to the bottom of AdminSkeletons.tsx**

```tsx
export function AdminChampionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-md" />
      <GlassCard className="space-y-4">
        <div className="flex gap-4 items-start">
          <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </GlassCard>
      <GlassCard className="space-y-3">
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </GlassCard>
    </div>
  )
}

export function AdminTeamSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </GlassCard>
        ))}
      </div>
      <GlassCard>
        <Skeleton className="h-5 w-40 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-2" />
        ))}
      </GlassCard>
    </div>
  )
}

export function AdminProjectsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Skeleton className="h-10 flex-1 min-w-[200px]" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}

export function AdminRiskCentreSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-10" />
          </GlassCard>
        ))}
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/skeletons/AdminSkeletons.tsx
git commit -m "feat: add skeletons for Champion, Team, Projects, RiskCentre tabs"
```

---

## Task 3: Champion View Tab

**Files:**
- Create: `src/components/admin/tabs/ChampionView.tsx`

- [ ] **Step 1: Create the file**

```tsx
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
        .from('submissions')
        .select('current_project, challenge, support_needed, created_at')
        .eq('user_id', r.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])
    setSelected(user as Champion)
    setSubmission(sub)
    setLoadingProfile(false)
  }

  const completionPct = selected?.current_week
    ? Math.round((selected.current_week / 8) * 100)
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

      {/* No selection yet */}
      {!selected && !loadingProfile && (
        <EmptyState
          icon="🔍"
          title="Search for a Champion"
          description="Type a name, email, or department above to pull up a full profile."
        />
      )}

      {loadingProfile && <AdminChampionSkeleton />}

      {/* Profile */}
      {selected && !loadingProfile && (
        <div className="space-y-4">
          {/* Header card */}
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

            {/* Completion bar */}
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

          {/* Submission detail */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/tabs/ChampionView.tsx
git commit -m "feat: add Champion View tab"
```

---

## Task 4: Team View Tab

**Files:**
- Create: `src/components/admin/tabs/TeamView.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import { AdminTeamSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TeamStats {
  department: string
  totalChamps: number
  avgScore: number
  completionPct: number
  activeUsers: number
  atRisk: number
}

interface RawUser {
  department: string
  ai_score: number
  current_week: number | null
  risk_flag: string
  updated_at: string | null
  created_at: string
}

function isActiveRecently(u: RawUser): boolean {
  const ref = u.updated_at ?? u.created_at
  if (!ref) return false
  return (Date.now() - new Date(ref).getTime()) < 14 * 24 * 60 * 60 * 1000
}

export default function TeamView() {
  const [teams, setTeams] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('department, ai_score, current_week, risk_flag, updated_at, created_at')

      if (!data) { setLoading(false); return }

      const map: Record<string, RawUser[]> = {}
      ;(data as RawUser[]).forEach(u => {
        if (!map[u.department]) map[u.department] = []
        map[u.department].push(u)
      })

      const stats: TeamStats[] = Object.entries(map).map(([dept, users]) => {
        const totalChamps = users.length
        const avgScore = totalChamps
          ? Math.round((users.reduce((s, u) => s + u.ai_score, 0) / totalChamps) * 10) / 10
          : 0
        const completionPct = totalChamps
          ? Math.round(users.reduce((s, u) => s + (u.current_week ? (u.current_week / 8) * 100 : 0), 0) / totalChamps)
          : 0
        const activeUsers = users.filter(isActiveRecently).length
        const atRisk = users.filter(u => u.risk_flag === 'red').length
        return { department: dept, totalChamps, avgScore, completionPct, activeUsers, atRisk }
      })

      setTeams(stats.sort((a, b) => b.avgScore - a.avgScore))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <AdminTeamSkeleton />

  if (teams.length === 0) {
    return (
      <EmptyState
        icon="🏢"
        title="No team data yet"
        description="Once users complete onboarding with department info, team stats will appear here."
      />
    )
  }

  const strongest = teams[0]
  const needsSupport = [...teams].sort((a, b) => a.avgScore - b.avgScore)[0]
  const totalChamps = teams.reduce((s, t) => s + t.totalChamps, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Team View</h2>
        <p className="text-slate-400 text-sm">Department-level AI adoption health across White Rivers Media.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-slate-400 text-xs mb-1">Strongest Team</p>
          <p className="text-white font-bold">{strongest.department}</p>
          <p className="text-purple-300 text-sm">{strongest.avgScore}/10 avg score</p>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">🆘</div>
          <p className="text-slate-400 text-xs mb-1">Needs Support</p>
          <p className="text-white font-bold">{needsSupport.department}</p>
          <p className="text-amber-300 text-sm">{needsSupport.avgScore}/10 avg score</p>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-slate-400 text-xs mb-1">Total Champs</p>
          <p className="text-white font-bold text-3xl">{totalChamps}</p>
          <p className="text-slate-400 text-sm">{teams.length} departments</p>
        </GlassCard>
      </div>

      {/* Chart */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Champs per Department</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={teams} margin={{ left: -10 }}>
            <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#a78bfa' }}
            />
            <Bar dataKey="totalChamps" name="Champs" radius={[6, 6, 0, 0]}>
              {teams.map((_, i) => (
                <Cell key={i} fill={`hsl(${260 + i * 18}, 70%, 60%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Team table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Department Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['Department', 'Champs', 'Avg AI Score', 'Completion', 'Active (14d)', 'At Risk'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={t.department} className={`border-b border-white/5 hover:bg-purple-500/10 transition ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                  <td className="px-5 py-3 text-white font-medium">{t.department}</td>
                  <td className="px-5 py-3 text-slate-300">{t.totalChamps}</td>
                  <td className="px-5 py-3">
                    <span className="text-purple-300 font-semibold">{t.avgScore}/10</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/10 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${t.completionPct}%` }}
                        />
                      </div>
                      <span className="text-slate-300 text-xs">{t.completionPct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-green-300">{t.activeUsers}</td>
                  <td className="px-5 py-3">
                    {t.atRisk > 0 ? (
                      <span className="text-red-300 font-semibold">{t.atRisk}</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/tabs/TeamView.tsx
git commit -m "feat: add Team View tab"
```

---

## Task 5: Projects Tab

**Files:**
- Create: `src/components/admin/tabs/Projects.tsx`

- [ ] **Step 1: Create the file**

```tsx
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
  'Completed': 'bg-green-500/20 text-green-300 border-green-500/40',
  'Idea': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
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
      .from('submissions')
      .select('id, current_project, challenge, support_needed, created_at, users(name, department)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data ?? []).map((s: any) => ({
          ...s,
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

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {STATUS_OPTIONS.map(s => (
          <GlassCard key={s} className="text-center py-4 cursor-pointer hover:border-purple-500/40 transition"
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}>
            <p className="text-2xl font-bold text-white">{counts[s]}</p>
            <p className="text-slate-400 text-xs mt-1">{s}</p>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
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
              <GlassCard key={p.id} className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1">
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
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/tabs/Projects.tsx
git commit -m "feat: add Projects tab with CSV export"
```

---

## Task 6: Risk Centre Tab

**Files:**
- Create: `src/components/admin/tabs/RiskCentre.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import { AdminRiskCentreSkeleton } from '@/components/ui/skeletons/AdminSkeletons'

type FlagType = 'Incomplete Onboarding' | 'Inactive 14+ Days' | 'Low Engagement' | 'Roadmap Stalled'

interface RiskyUser {
  id: string
  name: string
  email: string
  department: string
  ai_score: number
  current_week: number | null
  risk_flag: string
  created_at: string
  updated_at: string | null
  flags: FlagType[]
  daysSinceActive: number
  reviewed: boolean
}

const FLAG_STYLES: Record<FlagType, string> = {
  'Incomplete Onboarding': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  'Inactive 14+ Days':     'bg-red-500/20 text-red-300 border-red-500/40',
  'Low Engagement':        'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Roadmap Stalled':       'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
}

const ALL_FLAGS: FlagType[] = ['Incomplete Onboarding', 'Inactive 14+ Days', 'Low Engagement', 'Roadmap Stalled']

function computeFlags(u: {
  ai_score: number
  current_week: number | null
  risk_flag: string
  updated_at: string | null
  created_at: string
}): { flags: FlagType[]; daysSinceActive: number } {
  const ref = u.updated_at ?? u.created_at
  const daysSinceActive = Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24))
  const flags: FlagType[] = []
  if (!u.current_week) flags.push('Incomplete Onboarding')
  if (daysSinceActive >= 14) flags.push('Inactive 14+ Days')
  if (u.ai_score < 4) flags.push('Low Engagement')
  if (u.risk_flag === 'red' && u.current_week && u.current_week < 4) flags.push('Roadmap Stalled')
  return { flags, daysSinceActive }
}

export default function RiskCentre() {
  const [users, setUsers] = useState<RiskyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FlagType | ''>('')
  const [reviewed, setReviewed] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase
      .from('users')
      .select('id, name, email, department, ai_score, current_week, risk_flag, created_at, updated_at')
      .then(({ data }) => {
        if (!data) { setLoading(false); return }
        const risky: RiskyUser[] = (data as any[]).map(u => {
          const { flags, daysSinceActive } = computeFlags(u)
          return { ...u, flags, daysSinceActive, reviewed: false }
        }).filter(u => u.flags.length > 0)
        setUsers(risky.sort((a, b) => b.flags.length - a.flags.length))
        setLoading(false)
      })
  }, [])

  if (loading) return <AdminRiskCentreSkeleton />

  const visible = users.filter(u => !reviewed.has(u.id))
  const filtered = activeFilter ? visible.filter(u => u.flags.includes(activeFilter)) : visible

  const flagCounts = ALL_FLAGS.reduce((acc, f) => {
    acc[f] = visible.filter(u => u.flags.includes(f)).length
    return acc
  }, {} as Record<FlagType, number>)

  if (visible.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-1">Risk Centre</h2>
          <p className="text-slate-400 text-sm">Automatically surfaced users who need attention.</p>
        </div>
        <EmptyState
          icon="✅"
          title="No users at risk"
          description="Great work! No one is flagged for incomplete onboarding, inactivity, or low engagement right now."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Risk Centre</h2>
        <p className="text-slate-400 text-sm">Automatically surfaced users who need attention.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ALL_FLAGS.map(f => (
          <GlassCard
            key={f}
            className={`cursor-pointer transition ${activeFilter === f ? 'ring-1 ring-purple-500' : 'hover:border-white/20'}`}
            onClick={() => setActiveFilter(activeFilter === f ? '' : f)}
          >
            <p className="text-2xl font-bold text-white">{flagCounts[f]}</p>
            <p className="text-slate-400 text-xs mt-1 leading-tight">{f}</p>
          </GlassCard>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter('')}
          className={`px-4 py-1.5 rounded-full text-sm border transition ${!activeFilter ? 'bg-purple-600/80 border-purple-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/30'}`}
        >
          All ({visible.length})
        </button>
        {ALL_FLAGS.filter(f => flagCounts[f] > 0).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(activeFilter === f ? '' : f)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${activeFilter === f ? 'bg-purple-600/80 border-purple-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/30'}`}
          >
            {f} ({flagCounts[f]})
          </button>
        ))}
      </div>

      {/* User cards */}
      <div className="space-y-3">
        {filtered.map(u => (
          <GlassCard key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-white font-semibold">{u.name}</p>
                  <p className="text-slate-400 text-xs">{u.department} · AI Score: {u.ai_score}/10</p>
                </div>
                <span className="text-slate-500 text-xs flex-shrink-0">{u.daysSinceActive}d inactive</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {u.flags.map(f => (
                  <span key={f} className={`px-2 py-0.5 rounded-full text-xs border ${FLAG_STYLES[f]}`}>{f}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
              <a
                href={`mailto:${u.email}?subject=AI Champs Check-in&body=Hi ${u.name.split(' ')[0]},%0D%0A%0D%0AJust checking in on your AI Champs journey — would love to hear how it's going and if there's anything we can help with.%0D%0A%0D%0ACheers`}
                className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition text-xs"
              >
                Send Reminder
              </a>
              <button
                onClick={() => setReviewed(prev => new Set([...prev, u.id]))}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition text-xs"
              >
                Mark Reviewed
              </button>
              <a
                href={`mailto:${u.email}?subject=AI Champs Support Session&body=Hi ${u.name.split(' ')[0]},%0D%0A%0D%0AWe'd like to schedule a short support session to help you with the AI Champs program. Would you be available for a quick call this week?%0D%0A%0D%0ACheers`}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition text-xs"
              >
                Schedule Support
              </a>
            </div>
          </GlassCard>
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">No users match this filter.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/tabs/RiskCentre.tsx
git commit -m "feat: add Risk Centre tab with auto-flagging and quick actions"
```

---

## Task 7: Enrich AI Insights Tab

**Files:**
- Modify: `src/components/admin/tabs/AIInsights.tsx`

- [ ] **Step 1: Read the current file**

Read `src/components/admin/tabs/AIInsights.tsx` in full before editing.

- [ ] **Step 2: Add an executive summary block at the top**

After the existing imports, add a new `ExecutiveSummary` component and render it above the existing content. The existing tab content must remain unchanged below it.

Find the `return (` statement in `AIInsights` and prepend the summary card:

```tsx
// Add these imports at top of file (after existing imports):
import GlassCard from '@/components/ui/GlassCard'

// Add this component definition before the main export:
function ExecutiveSummary({ insights }: { insights: string | null }) {
  if (!insights) return null
  // Parse bullet points from insight text — split on newlines starting with - or •
  const lines = insights.split('\n').map(l => l.trim()).filter(l => l.startsWith('-') || l.startsWith('•'))
  if (lines.length === 0) return null
  return (
    <GlassCard className="mb-6 border-purple-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📊</span>
        <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
      </div>
      <ul className="space-y-2">
        {lines.slice(0, 6).map((line, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-300">
            <span className="text-purple-400 flex-shrink-0 mt-0.5">→</span>
            <span>{line.replace(/^[-•]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}
```

Then inside the AIInsights component JSX, before the existing first element, render:
```tsx
<ExecutiveSummary insights={/* pass the insights string your component already fetches */} />
```

> Note: The exact variable name holding the insights text depends on what's already in AIInsights.tsx. Read it first and use the correct variable name.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/tabs/AIInsights.tsx
git commit -m "feat: add executive summary block to AI Insights tab"
```

---

## Task 8: Wire New Tabs into Admin Page

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Add imports for the 4 new tabs**

At the top of `src/app/admin/page.tsx`, after the existing tab imports, add:

```tsx
import ChampionView from '@/components/admin/tabs/ChampionView'
import TeamView from '@/components/admin/tabs/TeamView'
import Projects from '@/components/admin/tabs/Projects'
import RiskCentre from '@/components/admin/tabs/RiskCentre'
```

- [ ] **Step 2: Add 4 new entries to the TABS array**

Find:
```tsx
const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'users', label: 'All Users', icon: '👥' },
  { id: 'insights', label: 'AI Insights', icon: '🤖' },
  { id: 'risk', label: 'Risk Flags', icon: '🚨' },
  { id: 'export', label: 'Export', icon: '📤' },
  { id: 'roadmap', label: 'Roadmap Editor', icon: '🗺️' },
]
```

Replace with:
```tsx
const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'users', label: 'All Users', icon: '👥' },
  { id: 'champion', label: 'Champion View', icon: '🏅' },
  { id: 'teams', label: 'Team View', icon: '🏢' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'riskcentre', label: 'Risk Centre', icon: '🆘' },
  { id: 'insights', label: 'AI Insights', icon: '🤖' },
  { id: 'risk', label: 'Risk Flags', icon: '🚨' },
  { id: 'export', label: 'Export', icon: '📤' },
  { id: 'roadmap', label: 'Roadmap Editor', icon: '🗺️' },
]
```

- [ ] **Step 3: Add 4 new cases to the TabContent switch**

Find the `switch (activeTab)` block and add before the `default`:

```tsx
case 'champion': return <ChampionView />
case 'teams': return <TeamView />
case 'projects': return <Projects />
case 'riskcentre': return <RiskCentre />
```

- [ ] **Step 4: Verify the build is clean**

```bash
npm run build
```

Expected: no TypeScript errors, no import errors. Fix any that appear.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: wire Champion View, Team View, Projects, Risk Centre into admin dashboard"
```

---

## Task 9: Final Smoke Test

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test access restriction**

- Log in as a non-allowlisted email → confirm redirect to `/dashboard`
- Log in as one of the 5 allowed emails → confirm `/admin` loads

- [ ] **Step 3: Test each new tab**

Navigate to each new tab and confirm:
- Champion View: search field renders, searching a name shows dropdown, selecting shows profile card
- Team View: table renders with department rows, chart renders, summary cards show Strongest/Needs Support
- Projects: cards render with status badges, filters work, Export CSV downloads a file
- Risk Centre: flagged users show with correct badges, Mark Reviewed removes a user from the list, Send Reminder and Schedule Support open mailto links

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: admin dashboard V1 complete"
```
