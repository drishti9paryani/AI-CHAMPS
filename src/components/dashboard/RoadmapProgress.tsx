'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { ALL_CARDS_MAP } from '@/lib/teamCards'

interface Week {
  week: number
  title: string
  subtitle: string
  icon: string
  outcomes?: string[]
  resources?: { label: string; tool: string }[]
  actions?: string[]
  isPending?: boolean
}

const JUNE_WEEKS: Week[] = [
  {
    week: 1,
    title: "Anything You'd Like",
    subtitle: 'Your foundation week. Explore ChatGPT, Claude, and Gemini and discover how each one can change the way you work. No deliverables — just open a tool and have a real conversation about something on your plate. Your learning outcome: leave with at least one concrete idea or workflow you couldn\'t have reached without AI.',
    icon: '🌱',
    outcomes: [
      'Get comfortable talking to an AI out loud — no typing required',
      'Identify one real work task you could hand off to AI this week',
      'Understand the difference between ChatGPT, Claude, and Gemini at a basic level',
      'Build the habit of opening an AI tool before Google',
    ],
    resources: [
      { label: 'Start here', tool: 'ChatGPT Voice Mode (app or browser)' },
      { label: 'Alternative', tool: 'Claude.ai — great for longer thinking tasks' },
      { label: 'Explore', tool: 'Gemini — best for Google Workspace users' },
      { label: 'Reference', tool: 'AI Champs Notion Hub — links & guides' },
    ],
    actions: [
      'Open ChatGPT Voice and describe your current biggest work challenge',
      'Ask it to suggest 3 ways AI could help you with that challenge',
      'Try one suggestion before the week ends',
      'Share your experience in the AI Champs Slack channel',
    ],
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
  {
    week: 5,
    title: 'Admin Dashboard',
    subtitle: 'Coming soon — automated progress tracking and reporting so admins can monitor learner progress without manual effort.',
    icon: '📊',
    isPending: true,
  },
]


interface RoadmapProgressProps {
  currentWeek: number
  roadmapMode?: string | null
  chosenPath?: string[] | null
}

export default function RoadmapProgress({ currentWeek, roadmapMode, chosenPath }: RoadmapProgressProps) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]))
  const isCustom = roadmapMode === 'custom' && chosenPath && chosenPath.length > 0

  function toggleWeek(week: number) {
    setOpenWeeks(prev => {
      const next = new Set(prev)
      next.has(week) ? next.delete(week) : next.add(week)
      return next
    })
  }

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
          <div className="space-y-2">
            {JUNE_WEEKS.map((w, idx) => {
              const isActive = w.week === currentWeek
              const isPast = w.week < currentWeek
              const isOpen = openWeeks.has(w.week)
              const isPending = w.isPending
              return (
                <div key={w.week} className="flex items-start gap-3">
                  {/* Timeline dot + connector */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2
                        ${isPending
                          ? 'border-dashed border-slate-600 bg-slate-800/50 text-slate-600'
                          : isActive
                            ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                            : isPast
                              ? 'border-green-500/60 bg-green-500/10 text-green-400'
                              : 'border-white/15 bg-white/5 text-slate-500'
                        }`}
                    >
                      {isPast ? '✓' : w.week}
                    </div>
                    {idx < JUNE_WEEKS.length - 1 && (
                      <div className={`w-0.5 mt-1 transition-all duration-300 ${isOpen ? 'h-full min-h-[2rem]' : 'h-6'} ${isPast ? 'bg-green-500/40' : 'bg-white/10'}`} />
                    )}
                  </div>

                  {/* Week card */}
                  <div className={`flex-1 rounded-xl border transition-all mb-2
                    ${isPending
                      ? 'border-dashed border-slate-700/60 bg-slate-900/30 opacity-60'
                      : isActive
                        ? 'border-purple-500/40 bg-purple-500/10'
                        : isPast
                          ? 'border-white/5 bg-white/[0.02]'
                          : 'border-white/10 bg-white/5'}`}
                  >
                    {/* Clickable header */}
                    <button
                      onClick={() => !isPending && toggleWeek(w.week)}
                      disabled={isPending}
                      className={`w-full flex items-center justify-between p-3 text-left ${isPending ? 'cursor-default' : ''}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{w.icon}</span>
                        <h4 className={`font-semibold text-sm ${isPending ? 'text-slate-600' : isActive ? 'text-purple-200' : isPast ? 'text-slate-400' : 'text-white'}`}>
                          {isPending ? w.title : `Week ${w.week}: ${w.title}`}
                        </h4>
                        {isPending && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-500 border border-slate-700/60 uppercase tracking-wide">
                            Coming Soon
                          </span>
                        )}
                        {isActive && !isPending && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/40 uppercase tracking-wide">
                            Current
                          </span>
                        )}
                        {w.week === 1 && !isPending && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wide">
                            Start Here
                          </span>
                        )}
                      </div>
                      {!isPending && <span className={`text-slate-400 text-base flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>⌄</span>}
                    </button>

                    {/* Pending item description */}
                    {isPending && (
                      <p className="px-3 pb-3 text-xs text-slate-600 leading-relaxed">{w.subtitle}</p>
                    )}

                    {/* Expandable content */}
                    <AnimatePresence initial={false}>
                      {isOpen && !isPending && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-4">
                            <p className="text-slate-400 text-xs leading-relaxed">{w.subtitle}</p>

                            {w.outcomes && (
                              <div>
                                <p className="text-purple-400 text-[10px] uppercase tracking-wider mb-2 font-semibold">What You'll Learn</p>
                                <ul className="space-y-1.5">
                                  {w.outcomes.map((o, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-slate-300">
                                      <span className="text-purple-400 flex-shrink-0">→</span>
                                      <span>{o}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {w.resources && (
                              <div>
                                <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-2 font-semibold">Tools & Resources</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {w.resources.map((r, i) => (
                                    <div key={i} className="flex gap-2 text-xs bg-white/5 rounded-lg px-3 py-2">
                                      <span className="text-slate-500 flex-shrink-0">{r.label}:</span>
                                      <span className="text-white font-medium">{r.tool}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {w.actions && (
                              <div>
                                <p className="text-green-400 text-[10px] uppercase tracking-wider mb-2 font-semibold">Your Action Items</p>
                                <ol className="space-y-1.5">
                                  {w.actions.map((a, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-slate-300">
                                      <span className="text-green-400 font-bold flex-shrink-0">{i + 1}.</span>
                                      <span>{a}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
