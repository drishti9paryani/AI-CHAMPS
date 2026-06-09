'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface ImpactData {
  personalMinutes: number
  personalWins: number
  teamMinutes: number
  teamWins: number
}

function useCountUp(target: number, duration = 1100): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) { setValue(0); return }
    let raf: number
    const startTime = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setValue(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function GradientNumber({
  value,
  suffix = '',
  from,
  to,
  glow,
}: {
  value: number
  suffix?: string
  from: string
  to: string
  glow: string
}) {
  return (
    <span
      className="text-4xl font-black leading-none"
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: `drop-shadow(0 0 14px ${glow})`,
      }}
    >
      {value}{suffix}
    </span>
  )
}

export default function ImpactCounter({ userId, team }: { userId: string; team: string }) {
  const [data, setData] = useState<ImpactData>({
    personalMinutes: 0, personalWins: 0, teamMinutes: 0, teamWins: 0,
  })

  useEffect(() => {
    async function load() {
      const [{ data: myWins }, { data: myComps }, { data: teamUsers }] = await Promise.all([
        supabase.from('ai_wins').select('time_saved_minutes').eq('user_id', userId),
        supabase.from('challenge_completions').select('time_saved_minutes').eq('user_id', userId),
        supabase.from('users').select('id').eq('department', team),
      ])

      const personalMinutes =
        (myWins ?? []).reduce((s, w) => s + (w.time_saved_minutes ?? 0), 0) +
        (myComps ?? []).reduce((s, c) => s + (c.time_saved_minutes ?? 0), 0)
      const personalWins = (myWins ?? []).length

      const teamIds = (teamUsers ?? []).map(u => u.id)
      let teamMinutes = personalMinutes
      let teamWins = personalWins

      if (teamIds.length > 1) {
        const [{ data: tWins }, { data: tComps }] = await Promise.all([
          supabase.from('ai_wins').select('time_saved_minutes').in('user_id', teamIds),
          supabase.from('challenge_completions').select('time_saved_minutes').in('user_id', teamIds),
        ])
        teamMinutes =
          (tWins ?? []).reduce((s, w) => s + (w.time_saved_minutes ?? 0), 0) +
          (tComps ?? []).reduce((s, c) => s + (c.time_saved_minutes ?? 0), 0)
        teamWins = (tWins ?? []).length
      }

      setData({ personalMinutes, personalWins, teamMinutes, teamWins })
    }
    load()
  }, [userId, team])

  const personalHours = useCountUp(Math.round(data.personalMinutes / 60))
  const winsCount = useCountUp(data.personalWins)
  const teamHours = useCountUp(Math.round(data.teamMinutes / 60))

  const cols = [
    {
      label: 'My time saved',
      display: <GradientNumber value={personalHours} suffix="h" from="#34d399" to="#06b6d4" glow="rgba(52,211,153,0.5)" />,
      icon: '⏱',
    },
    {
      label: 'Wins shared',
      display: <GradientNumber value={winsCount} from="#a78bfa" to="#60a5fa" glow="rgba(167,139,250,0.5)" />,
      icon: '✨',
    },
    {
      label: 'Team saved',
      display: <GradientNumber value={teamHours} suffix="h" from="#f59e0b" to="#f87171" glow="rgba(245,158,11,0.5)" />,
      icon: '🌍',
    },
  ]

  return (
    <div style={{ perspective: '900px' }}>
      <motion.div
        whileHover={{ rotateX: -4, rotateY: -6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* Gradient border */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            padding: '1px',
            background: 'linear-gradient(135deg, rgba(52,211,153,0.5), rgba(6,182,212,0.3), rgba(96,165,250,0.5))',
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-[#0d0d1a]" />
        </div>

        <div
          className="relative z-10 p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(6,182,212,0.04), transparent)',
          }}
        >
          <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest mb-5">
            Your Impact 🌍
          </p>

          <div className="grid grid-cols-3 gap-3">
            {cols.map((col, i) => (
              <div key={i} className={`text-center ${i === 1 ? 'border-x border-white/8' : ''}`}>
                <div className="flex justify-center mb-2">{col.display}</div>
                <p className="text-slate-500 text-[11px] mt-1 leading-snug">{col.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/8 text-center">
            <p className="text-slate-600 text-[11px]">
              Every hour saved = one hour invested in creativity 🚀
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
