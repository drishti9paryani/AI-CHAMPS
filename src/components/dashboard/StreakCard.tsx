'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getCurrentWeekLabel, getWeekLabelOffset, dateStringToWeekLabel } from '@/lib/weekLabel'

interface StreakData {
  current: number
  longest: number
  thisWeekDone: boolean
  totalWins: number
}

export default function StreakCard({ userId }: { userId: string }) {
  const [data, setData] = useState<StreakData | null>(null)
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    async function load() {
      const [{ data: completions }, { data: forms }, { data: wins }] = await Promise.all([
        supabase.from('challenge_completions').select('completed_at').eq('user_id', userId),
        supabase.from('champ_forms').select('created_at').eq('user_id', userId),
        supabase.from('ai_wins').select('created_at').eq('user_id', userId),
      ])

      const activeWeeks = new Set<string>()
      ;(completions ?? []).forEach(c => activeWeeks.add(dateStringToWeekLabel(c.completed_at)))
      ;(forms ?? []).forEach(f => activeWeeks.add(dateStringToWeekLabel(f.created_at)))
      ;(wins ?? []).forEach(w => activeWeeks.add(dateStringToWeekLabel(w.created_at)))

      const thisWeekDone = activeWeeks.has(getCurrentWeekLabel())

      // Count consecutive weeks backward from now
      let current = 0
      const startOffset = thisWeekDone ? 0 : 1
      for (let i = startOffset; ; i++) {
        if (activeWeeks.has(getWeekLabelOffset(i))) current++
        else break
        if (i > 200) break // safety guard
      }

      // Longest run
      const sorted = [...activeWeeks].sort()
      let longest = Math.max(current, sorted.length > 0 ? 1 : 0)
      let run = 1
      for (let j = 1; j < sorted.length; j++) {
        const [py, pw] = sorted[j - 1].split('-W').map(Number)
        const [cy, cw] = sorted[j].split('-W').map(Number)
        const diff = (cy - py) * 53 + (cw - pw)
        if (diff === 1) { run++; if (run > longest) longest = run }
        else run = 1
      }

      setData({ current, longest, thisWeekDone, totalWins: (wins ?? []).length })
    }
    load()
  }, [userId])

  // Animate the number on mount
  useEffect(() => {
    if (!data) return
    let raf: number
    const target = data.current
    const startTime = performance.now()
    const duration = 900
    const tick = (t: number) => {
      const p = Math.min((t - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4) // ease-out quart
      setDisplayCount(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [data?.current])

  const done = data?.thisWeekDone ?? false

  return (
    <div style={{ perspective: '900px' }}>
      <motion.div
        whileHover={{ rotateX: -5, rotateY: 7, scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* Gradient border */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            padding: '1px',
            background: done
              ? 'linear-gradient(135deg, #fb923c, #f59e0b, #fbbf24)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-[#0d0d1a]" />
        </div>

        {/* Glow when streak active */}
        {done && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: '0 0 60px rgba(251,146,60,0.2) inset, 0 0 40px rgba(251,146,60,0.1)' }}
          />
        )}

        <div
          className="relative z-10 p-6 rounded-2xl"
          style={{
            background: done
              ? 'linear-gradient(135deg, rgba(251,146,60,0.08), rgba(245,158,11,0.04), transparent)'
              : 'rgba(255,255,255,0.02)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest mb-1">
                Learning Streak
              </p>
              <div className="flex items-end gap-2">
                <span
                  className="text-5xl font-black text-white leading-none"
                  style={{
                    textShadow: done
                      ? '0 0 40px rgba(251,146,60,0.9), 0 0 80px rgba(251,146,60,0.4)'
                      : 'none',
                  }}
                >
                  {displayCount}
                </span>
                <span className="text-slate-500 text-sm font-medium mb-1">weeks</span>
              </div>
            </div>

            {/* Animated flame / sleep */}
            <motion.div
              animate={done ? {
                scale: [1, 1.2, 0.95, 1.12, 1],
                rotate: [-4, 5, -3, 4, 0],
                y: [0, -4, 1, -2, 0],
              } : {}}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl select-none leading-none"
              style={{
                filter: done
                  ? 'drop-shadow(0 0 18px rgba(251,146,60,1)) drop-shadow(0 0 36px rgba(251,146,60,0.5))'
                  : 'grayscale(1) opacity(0.35)',
              }}
            >
              🔥
            </motion.div>
          </div>

          {/* Mini stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🏆</span>
              <span className="text-slate-500 text-xs">
                Best: <span className="text-white font-semibold">{data?.longest ?? 0}w</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">✨</span>
              <span className="text-slate-500 text-xs">
                Wins: <span className="text-white font-semibold">{data?.totalWins ?? 0}</span>
              </span>
            </div>
          </div>

          {/* This-week badge */}
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
              done
                ? 'bg-green-500/15 text-green-300 border-green-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            <span>{done ? '✅' : '⏳'}</span>
            <span>{done ? 'This week: complete!' : 'This week: pending'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
