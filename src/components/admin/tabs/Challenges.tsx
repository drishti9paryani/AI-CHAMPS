'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { getCurrentWeekLabel, getWeekLabelAhead, weekLabelToDisplay } from '@/lib/weekLabel'

const TEAMS = [
  'Brand & Marketing', 'Communications', 'Content (Media)',
  'Content (Scripting & Copy)', 'Creative (Design)', 'Data & Analytics',
  'Digital Strategy', 'Event & Activation', 'Finance',
  'Influencer Marketing', 'Media Planning & Buying', 'PR & Communications',
  'Performance Marketing', 'Photo & Video Production', 'Product & Tech',
  'Project Management', 'SEO & Growth', 'Social Media',
  'Strategy & Planning', 'Training & Development', 'UX & CX',
]

const WEEK_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const label = i === 0 ? getCurrentWeekLabel() : getWeekLabelAhead(i)
  const suffix = i === 0 ? ' (this week)' : i === 1 ? ' (next week)' : ''
  return { value: label, display: weekLabelToDisplay(label) + suffix }
})

interface Challenge {
  id: string
  team: string
  week_label: string
  title: string
  description: string
  tool_hint: string | null
  created_at: string
  completionCount: number
}

const emptyForm = {
  team: TEAMS[0],
  week_label: WEEK_OPTIONS[0].value,
  title: '',
  description: '',
  tool_hint: '',
}

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [weekFilter, setWeekFilter] = useState(getCurrentWeekLabel())
  const [form, setForm] = useState(emptyForm)

  async function load() {
    const { data } = await supabase
      .from('weekly_challenges')
      .select('*, challenge_completions(id)')
      .order('week_label', { ascending: false })
      .order('team', { ascending: true })
      .limit(200)

    if (data) {
      setChallenges(
        (data as any[]).map(c => ({
          ...c,
          completionCount: (c.challenge_completions ?? []).length,
          challenge_completions: undefined,
        }))
      )
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    const { error } = await supabase.from('weekly_challenges').upsert(
      {
        team: form.team,
        week_label: form.week_label,
        title: form.title.trim(),
        description: form.description.trim(),
        tool_hint: form.tool_hint.trim() || null,
      },
      { onConflict: 'team,week_label' }
    )
    setSaving(false)
    if (!error) {
      setCreating(false)
      setForm(emptyForm)
      load()
    }
  }

  async function remove(id: string) {
    await supabase.from('weekly_challenges').delete().eq('id', id)
    setChallenges(prev => prev.filter(c => c.id !== id))
  }

  const thisWeek = getCurrentWeekLabel()
  const filtered = weekFilter
    ? challenges.filter(c => c.week_label === weekFilter)
    : challenges

  const coverage = TEAMS.filter(t => filtered.some(c => c.team === t)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl">Weekly Challenges ⚡</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Set team-specific AI challenges. Champions complete them, earn streaks, and build habits.
          </p>
          {weekFilter && (
            <p className="text-slate-400 text-xs mt-1.5">
              Coverage this week: <span className="text-white font-semibold">{coverage}</span> / {TEAMS.length} teams
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCreating(c => !c)}
          className="shrink-0 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
          style={{
            background: creating
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #7c3aed, #2563eb)',
            boxShadow: creating ? 'none' : '0 4px 20px rgba(124,58,237,0.3)',
            border: creating ? '1px solid rgba(255,255,255,0.1)' : 'none',
            color: creating ? '#94a3b8' : '#fff',
          }}
        >
          {creating ? '✕ Cancel' : '+ New Challenge'}
        </motion.button>
      </div>

      {/* Create / edit form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            key="form"
            initial={{ opacity: 0, rotateX: -14, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, rotateX: 10, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{ perspective: '900px', transformStyle: 'preserve-3d' }}
            className="relative rounded-2xl overflow-hidden"
          >
            {/* Gradient border */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ padding: '1px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', opacity: 0.65 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-[#0d0d1a]" />
            </div>

            <div className="relative z-10 p-6 space-y-4">
              <h3 className="text-white font-semibold">Create Challenge</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1.5 block">Team</label>
                  <select
                    value={form.team}
                    onChange={e => setForm(p => ({ ...p, team: e.target.value }))}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1.5 block">Week</label>
                  <select
                    value={form.week_label}
                    onChange={e => setForm(p => ({ ...p, week_label: e.target.value }))}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    {WEEK_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.display}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Challenge Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Auto-summarise your last 5 client reports using AI"
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">
                  Description <span className="text-slate-600">(what to do + expected outcome)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Give clear instructions. What should the champion do, and what does success look like?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">
                  Suggested Tool <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  value={form.tool_hint}
                  onChange={e => setForm(p => ({ ...p, tool_hint: e.target.value }))}
                  placeholder="e.g. Claude, ChatGPT, Notion AI, Zapier"
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              <button
                onClick={save}
                disabled={saving || !form.title.trim() || !form.description.trim()}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                {saving ? 'Saving…' : '✓ Save Challenge'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week filter pills */}
      <div className="flex gap-2 flex-wrap">
        {WEEK_OPTIONS.map(w => (
          <button
            key={w.value}
            onClick={() => setWeekFilter(w.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              weekFilter === w.value
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/8'
            }`}
          >
            {w.value === thisWeek ? '⚡ ' : ''}{w.display}
          </button>
        ))}
        <button
          onClick={() => setWeekFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            !weekFilter
              ? 'bg-violet-600 text-white'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/8'
          }`}
        >
          All weeks
        </button>
      </div>

      {/* Challenges grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="text-center py-14">
          <div className="text-5xl mb-4">⚡</div>
          <p className="text-slate-400 text-sm">No challenges for this period. Create one to activate your teams!</p>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((ch, i) => (
            <div key={ch.id} style={{ perspective: '800px' }}>
              <motion.div
                initial={{ opacity: 0, y: 14, rotateX: 8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4), type: 'spring', stiffness: 260, damping: 22 }}
                whileHover={{ rotateX: -4, rotateY: 5, scale: 1.02 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative rounded-2xl overflow-hidden group"
              >
                {/* Subtle border glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ padding: '1px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-[#0d0d1a]" />
                </div>

                <div className="relative z-10 p-5 rounded-2xl border border-white/8 bg-white/[0.025] group-hover:border-transparent transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                        {ch.team}
                      </span>
                      <h4 className="text-white font-semibold text-sm mt-0.5 leading-snug">{ch.title}</h4>
                    </div>
                    <button
                      onClick={() => remove(ch.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1 shrink-0 text-xs"
                      title="Delete challenge"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{ch.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {ch.tool_hint && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/12 text-blue-300 border border-blue-500/25">
                        🛠 {ch.tool_hint}
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        ch.completionCount > 0
                          ? 'bg-green-500/12 text-green-300 border-green-500/25'
                          : 'bg-white/5 text-slate-500 border-white/10'
                      }`}
                    >
                      ✅ {ch.completionCount} completed
                    </span>
                    <span className="text-slate-600 text-[10px] ml-auto">{weekLabelToDisplay(ch.week_label)}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
