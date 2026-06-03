'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { fetchRoadmapWeeks } from '@/lib/admin'
import type { RoadmapWeek } from '@/lib/roadmap'
import { ROADMAP_WEEKS } from '@/lib/roadmap'

interface RoadmapProgressProps {
  currentWeek: number
}

export default function RoadmapProgress({ currentWeek }: RoadmapProgressProps) {
  const [weeks, setWeeks] = useState<RoadmapWeek[]>(ROADMAP_WEEKS)

  useEffect(() => {
    fetchRoadmapWeeks().then(setWeeks)
  }, [])

  return (
    <motion.div
      id="roadmap"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white">Roadmap Progress</h3>
            <p className="text-slate-400 text-sm">8-week AI Champs journey</p>
          </div>
          <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Week {currentWeek} of 8
          </span>
        </div>

        <div className="space-y-3">
          {weeks.map((w, idx) => {
            const isActive = w.week === currentWeek
            const isPast = w.week < currentWeek
            return (
              <div key={w.week} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2
                      ${isActive
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        : isPast
                          ? 'border-green-500/60 bg-green-500/10 text-green-400'
                          : 'border-white/15 bg-white/5 text-slate-500'
                      }`}
                  >
                    {isPast ? '✓' : w.week}
                  </div>
                  {idx < weeks.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${isPast ? 'bg-green-500/40' : 'bg-white/10'}`} />
                  )}
                </div>

                <div
                  className={`flex-1 rounded-xl p-3 border transition-all
                    ${isActive
                      ? 'border-purple-500/40 bg-purple-500/10'
                      : isPast
                        ? 'border-white/5 bg-white/[0.02] opacity-70'
                        : 'border-white/10 bg-white/5'
                    }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{w.icon}</span>
                    <h4 className={`font-medium text-sm ${isActive ? 'text-purple-200' : 'text-white'}`}>
                      Week {w.week}: {w.title}
                    </h4>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/40 uppercase tracking-wide">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1 ml-7">{w.subtitle}</p>
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>
    </motion.div>
  )
}
