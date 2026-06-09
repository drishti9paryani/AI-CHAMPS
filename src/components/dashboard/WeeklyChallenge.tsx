'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getCurrentWeekLabel } from '@/lib/weekLabel'

interface Challenge {
  id: string
  title: string
  description: string
  tool_hint: string | null
}

type CardState = 'idle' | 'completing' | 'done'

export default function WeeklyChallenge({ userId, team }: { userId: string; team: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [cardState, setCardState] = useState<CardState>('idle')
  const [proof, setProof] = useState('')
  const [timeSaved, setTimeSaved] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [celebrated, setCelebrated] = useState(false)

  useEffect(() => {
    async function load() {
      const weekLabel = getCurrentWeekLabel()

      const { data: ch } = await supabase
        .from('weekly_challenges')
        .select('id, title, description, tool_hint')
        .eq('team', team)
        .eq('week_label', weekLabel)
        .maybeSingle()

      if (!ch) { setLoading(false); return }

      const { data: existing } = await supabase
        .from('challenge_completions')
        .select('id')
        .eq('challenge_id', ch.id)
        .eq('user_id', userId)
        .maybeSingle()

      setChallenge(ch)
      if (existing) setCardState('done')
      setLoading(false)
    }
    load()
  }, [userId, team])

  async function handleSubmit() {
    if (!challenge || !proof.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('challenge_completions').insert({
      challenge_id: challenge.id,
      user_id: userId,
      proof_text: proof.trim(),
      time_saved_minutes: timeSaved,
    })
    setSubmitting(false)
    if (!error) {
      setCardState('done')
      setCelebrated(true)
      setTimeout(() => setCelebrated(false), 3500)
    }
  }

  if (loading) {
    return <div className="rounded-2xl bg-white/5 border border-white/8 p-6 animate-pulse h-44" />
  }

  if (!challenge) {
    return (
      <div style={{ perspective: '900px' }}>
        <motion.div
          whileHover={{ rotateX: -3, rotateY: 5, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest mb-3">
            Weekly Challenge ⚡
          </p>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="text-2xl">⏳</span>
            <p className="text-sm">No challenge set for your team this week — check back soon!</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ perspective: '900px' }}>
      <motion.div
        whileHover={cardState !== 'completing' ? { rotateX: -4, rotateY: 6, scale: 1.02 } : {}}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* Gradient border */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            padding: '1px',
            background:
              cardState === 'done'
                ? 'linear-gradient(135deg, #34d399, #10b981)'
                : 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
            opacity: cardState === 'done' ? 0.7 : 0.6,
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-[#0d0d1a]" />
        </div>

        <div
          className="relative z-10 p-6 rounded-2xl"
          style={{
            background:
              cardState === 'done'
                ? 'linear-gradient(135deg, rgba(52,211,153,0.07), rgba(16,185,129,0.04), transparent)'
                : 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(59,130,246,0.04), transparent)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
              Weekly Challenge ⚡
            </p>
            {cardState === 'done' && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                ✅ Complete
              </span>
            )}
          </div>

          <h3 className="text-white font-bold text-base leading-snug mb-2">{challenge.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">{challenge.description}</p>

          {challenge.tool_hint && (
            <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-blue-500/12 text-blue-300 border border-blue-500/25 mb-4">
              <span>🛠️</span>
              <span>Try: {challenge.tool_hint}</span>
            </div>
          )}

          {/* Celebration burst */}
          <AnimatePresence>
            {celebrated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 p-3 rounded-xl bg-green-500/12 border border-green-500/30 text-center"
              >
                <span className="text-2xl">🎉</span>
                <p className="text-green-300 text-sm font-semibold mt-1">
                  Challenge complete! Your streak is growing 🔥
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA area */}
          <AnimatePresence mode="wait">
            {cardState === 'idle' && (
              <motion.button
                key="cta"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={() => setCardState('completing')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                }}
              >
                Mark Complete ⚡
              </motion.button>
            )}

            {cardState === 'completing' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, rotateX: -18, scale: 0.96 }}
                animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="space-y-3"
              >
                <textarea
                  value={proof}
                  onChange={e => setProof(e.target.value)}
                  placeholder="What did you do? What did you learn or build? (brief is fine!)"
                  rows={3}
                  autoFocus
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm resize-none"
                />
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs shrink-0">⏱ Time saved:</span>
                  <input
                    type="number"
                    min="0"
                    max="480"
                    value={timeSaved}
                    onChange={e => setTimeSaved(Number(e.target.value))}
                    className="w-20 bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-violet-500 text-center"
                  />
                  <span className="text-slate-500 text-xs">min</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCardState('idle')}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !proof.trim()}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                  >
                    {submitting ? 'Saving…' : 'Submit ✓'}
                  </button>
                </div>
              </motion.div>
            )}

            {cardState === 'done' && !celebrated && (
              <motion.p
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-slate-500 text-sm py-2"
              >
                Great work this week! 🌟 See you next week.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
