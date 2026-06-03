'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { ALL_CARDS_MAP } from '@/lib/teamCards'

const JUNE_WEEKS = [
  {
    week: 1,
    title: "Anything You'd Like",
    subtitle: 'Open ChatGPT voice mode and talk through whatever AI tool has been living rent-free in your head.',
    icon: '🌱',
  },
  {
    week: 2,
    title: 'Script and Image Generation',
    subtitle: 'Claude, Gemini, ChatGPT. Refine your ideas into polished scripts and stunning visuals.',
    icon: '🎨',
  },
  {
    week: 3,
    title: 'AI Influencer / Avatar and Music',
    subtitle: 'Build a digital persona. HeyGen, Synthesia, ElevenLabs, Suno. Your AI twin is clocking in.',
    icon: '🤖',
  },
  {
    week: 4,
    title: 'Direct 2-Minute Movie',
    subtitle: 'Script it, generate it, cut it. Ship a 2-minute AI film by end of week.',
    icon: '🎬',
  },
]


interface RoadmapProgressProps {
  currentWeek: number
  roadmapMode?: string | null
  chosenPath?: string[] | null
}

export default function RoadmapProgress({ currentWeek, roadmapMode, chosenPath }: RoadmapProgressProps) {
  const isCustom = roadmapMode === 'custom' && chosenPath && chosenPath.length > 0

  const chosenCards = isCustom
    ? chosenPath.map(id => ALL_CARDS_MAP[id]).filter(Boolean)
    : []

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
            <h3 className="text-lg font-bold text-white">
              {isCustom ? 'Your Custom Path ✨' : 'WRM Roadmap — June 2026 📅'}
            </h3>
            <p className="text-slate-400 text-sm">
              {isCustom
                ? `${chosenCards.length} skill${chosenCards.length !== 1 ? 's' : ''} you're working towards`
                : '4-week AI Champs journey'}
            </p>
          </div>
          {!isCustom && (
            <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Week {currentWeek} of 4
            </span>
          )}
        </div>

        {isCustom ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chosenCards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-2xl flex-shrink-0">{card.emoji}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{card.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {JUNE_WEEKS.map((w, idx) => {
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
                    {idx < JUNE_WEEKS.length - 1 && (
                      <div className={`w-0.5 h-6 mt-1 ${isPast ? 'bg-green-500/40' : 'bg-white/10'}`} />
                    )}
                  </div>

                  <div
                    className={`flex-1 rounded-xl p-3 border transition-all
                      ${isActive
                        ? 'border-purple-500/40 bg-purple-500/10'
                        : isPast
                          ? 'border-white/5 bg-white/[0.02] opacity-60'
                          : 'border-white/10 bg-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg">{w.icon}</span>
                      <h4 className={`font-semibold text-sm ${isActive ? 'text-purple-200' : 'text-white'}`}>
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
        )}
      </GlassCard>
    </motion.div>
  )
}
