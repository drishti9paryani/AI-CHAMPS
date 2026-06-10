'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import { useOnboardingUser } from '@/lib/useOnboardingUser'
import { OnboardingPageSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'
import { PAIN_POINTS, painPointsToCardIds } from '@/lib/painPoints'

// ─── Fixed June 2026 Milestones ───────────────────────────────────────────────

const JUNE_WEEKS = [
  {
    week: 1,
    title: "Anything You'd Like",
    description: 'Open ChatGPT voice mode and talk through whatever AI tool has been living rent-free in your head.',
    icon: '🌱',
    color: 'from-emerald-600 to-teal-900',
  },
  {
    week: 2,
    title: 'Script and Image Generation',
    description: 'Claude, Gemini, ChatGPT. Refine your ideas into polished scripts and stunning visuals.',
    icon: '🎨',
    color: 'from-blue-600 to-indigo-900',
  },
  {
    week: 3,
    title: 'AI Influencer / Avatar and Music',
    description: 'Build a digital persona. HeyGen, Synthesia, ElevenLabs, Suno. Your AI twin is clocking in.',
    icon: '🤖',
    color: 'from-purple-600 to-violet-900',
  },
  {
    week: 4,
    title: 'Direct 2-Minute Movie',
    description: 'Script it, generate it, cut it. Ship a 2-minute AI film by end of week.',
    icon: '🎬',
    color: 'from-rose-600 to-pink-900',
  },
]

// ─── Markdown renderer ─────────────────────────────────────────────────────────

function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-2 text-sm">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return (
          <h3 key={i} className="text-white font-bold text-base mt-4 mb-1 first:mt-0">{line.slice(3)}</h3>
        )
        if (line.startsWith('# ')) return (
          <h2 key={i} className="text-white font-extrabold text-lg gradient-text">{line.slice(2)}</h2>
        )
        if (line.startsWith('**') && line.endsWith('**')) return (
          <p key={i} className="text-purple-300 font-semibold">{line.slice(2, -2)}</p>
        )
        if (line.startsWith('---')) return <hr key={i} className="border-white/10 my-3" />
        if (line.trim() === '') return <div key={i} className="h-1" />
        if (line.startsWith('*') && line.endsWith('*')) return (
          <p key={i} className="text-slate-500 text-xs italic">{line.slice(1, -1)}</p>
        )
        return <p key={i} className="text-slate-400 leading-relaxed">{line}</p>
      })}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Screen4Roadmap() {
  const router = useRouter()
  const { userId, loading: authLoading } = useOnboardingUser()
  const [finishing, setFinishing] = useState(false)
  const [mode, setMode] = useState<'fixed' | 'build' | 'guide'>('fixed')
  const [guideContent, setGuideContent] = useState<string | null>(null)
  const [department, setDepartment] = useState<string | null>(null)

  // Pain point selection state (replaces old card picker)
  const [selectedPainPoints, setSelectedPainPoints] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch('/content/programme-guide.md')
      .then(r => r.text())
      .then(setGuideContent)
      .catch(() => setGuideContent(null))
  }, [])

  useEffect(() => {
    if (!authLoading && !userId) router.replace('/onboarding/register')
    if (userId) {
      supabase.from('users').select('department').eq('id', userId).single()
        .then(({ data }) => setDepartment(data?.department ?? null))
    }
  }, [authLoading, userId, router])

  function togglePainPoint(idx: number) {
    setSelectedPainPoints(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  async function handleFinish() {
    if (!userId) return
    if (mode === 'build' && selectedPainPoints.size === 0) {
      toast.error('Select at least one challenge to build your path.')
      return
    }
    setFinishing(true)

    // Derive unique card IDs from the selected pain points
    const cardIds = (mode === 'build' && department)
      ? painPointsToCardIds(department, selectedPainPoints)
      : []

    const updatePayload: Record<string, unknown> = {
      onboarding_complete: true,
      roadmap_mode: mode === 'build' ? 'custom' : 'fixed',
      ...(mode === 'build' && { chosen_roadmap_path: cardIds }),
    }

    const { error } = await supabase.from('users').update(updatePayload).eq('id', userId)
    if (error) { toast.error(`Save failed: ${error.message}`); setFinishing(false); return }

    toast.success("You're in. Welcome to the champs. 🏆")
    router.push('/dashboard')
  }

  // Pain points for the user's team
  const teamPainPoints = department ? (PAIN_POINTS[department] ?? []) : []

  // Derived card count for CTA label
  const derivedCardCount = department
    ? painPointsToCardIds(department, selectedPainPoints).length
    : 0

  if (authLoading || !userId) return <OnboardingPageSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center min-h-screen px-4 py-16 md:py-12"
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-extrabold gradient-text mb-2 tracking-tight"
          >
            Pick your path. 🗺️
          </motion.h2>
          <p className="text-slate-400 text-sm">
            Follow the WRM roadmap, build your own, or read the full guide.
          </p>
        </div>

        {/* 3-tab switcher */}
        <div className="flex gap-1.5 mb-6 p-1.5 bg-white/5 rounded-2xl border border-white/10">
          {[
            { id: 'fixed', label: '📅 WRM Roadmap' },
            { id: 'build', label: '🎯 Build Your Own' },
            { id: 'guide', label: '📄 Full Guide' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setMode(t.id as typeof mode)}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === t.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── WRM ROADMAP — 3D week cards ──────────────────────────────── */}
          {mode === 'fixed' && (
            <motion.div
              key="fixed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 mb-8"
              style={{ perspective: 1000 }}
            >
              {JUNE_WEEKS.map((w, idx) => (
                <motion.div
                  key={w.week}
                  initial={{ opacity: 0, x: -24, rotateY: -8 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: idx * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                  whileHover={{ scale: 1.02, rotateY: 2, z: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="flex items-stretch gap-0 rounded-2xl overflow-hidden cursor-default
                    shadow-lg shadow-black/30 hover:shadow-purple-900/30 transition-shadow duration-300"
                >
                  {/* Coloured left strip with icon */}
                  <div
                    className={`w-16 flex-shrink-0 bg-gradient-to-b ${w.color} flex flex-col items-center justify-center gap-1 py-5`}
                    style={{ boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.3)' }}
                  >
                    <span className="text-2xl">{w.icon}</span>
                    <span
                      className="text-white/60 text-[10px] font-bold uppercase tracking-widest"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      Wk {w.week}
                    </span>
                  </div>
                  {/* Card body */}
                  <div
                    className="flex-1 bg-white/5 border border-white/10 border-l-0 px-5 py-4 backdrop-blur-sm"
                    style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-purple-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Week {w.week}</p>
                    <h3 className="font-bold text-white text-sm mb-1.5">{w.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{w.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── BUILD YOUR OWN — pain point selection ────────────────────── */}
          {mode === 'build' && (
            <motion.div
              key="build"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mb-8"
            >
              {/* Section header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                  <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">
                    {department ?? 'Your team'}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base leading-snug">
                  What are you trying to improve?
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Select all that apply — we&apos;ll map them to your personalised AI path.
                </p>
              </div>

              {/* Pain point checklist */}
              {teamPainPoints.length > 0 ? (
                <div className="space-y-2" style={{ perspective: 800 }}>
                  {teamPainPoints.map((pp, idx) => {
                    const isSelected = selectedPainPoints.has(idx)
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => togglePainPoint(idx)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, type: 'spring', stiffness: 260, damping: 22 }}
                        whileHover={{ x: 5, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border
                          text-left transition-all duration-200 group
                          ${isSelected
                            ? 'bg-violet-500/15 border-violet-500/45 shadow-md shadow-violet-900/20'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                          }`}
                      >
                        {/* Custom checkbox */}
                        <motion.div
                          animate={isSelected
                            ? { backgroundColor: 'rgb(139 92 246)', borderColor: 'rgb(139 92 246)', scale: 1 }
                            : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.2)', scale: 1 }
                          }
                          transition={{ duration: 0.15 }}
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.12 }}
                                className="text-white text-[11px] font-black leading-none select-none"
                              >
                                ✓
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <span className={`text-sm leading-snug transition-colors duration-150
                          ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'}`}>
                          {pp.text}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No challenges configured for your team yet.
                </div>
              )}

              {/* Selection summary pill */}
              <AnimatePresence>
                {selectedPainPoints.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="mt-5 flex justify-center"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full
                      bg-violet-500/20 border border-violet-500/35
                      shadow-md shadow-violet-900/20"
                    >
                      <span className="text-violet-300 text-xs font-semibold">
                        {selectedPainPoints.size} challenge{selectedPainPoints.size > 1 ? 's' : ''} selected
                      </span>
                      <span className="text-violet-500 text-xs">·</span>
                      <span className="text-violet-400 text-xs font-bold">
                        {derivedCardCount} AI solution{derivedCardCount !== 1 ? 's' : ''} unlocked
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── FULL GUIDE — markdown ─────────────────────────────────────── */}
          {mode === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mb-8"
            >
              <GlassCard>
                {guideContent ? (
                  <SimpleMarkdown content={guideContent} />
                ) : (
                  <div className="space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

        </AnimatePresence>

        {/* CTA button */}
        <motion.button
          onClick={handleFinish}
          disabled={finishing || (mode === 'build' && selectedPainPoints.size === 0)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl font-bold text-white text-base
            bg-gradient-to-r from-purple-600 to-blue-600
            hover:from-purple-500 hover:to-blue-500
            shadow-lg shadow-purple-900/40
            transition-all disabled:opacity-40 disabled:cursor-not-allowed
            disabled:shadow-none"
        >
          {finishing
            ? 'Almost there…'
            : mode === 'build' && selectedPainPoints.size === 0
              ? 'Select at least one challenge →'
              : mode === 'build'
                ? `Build my path — ${derivedCardCount} AI solution${derivedCardCount !== 1 ? 's' : ''} →`
                : "I'm in — Enter Dashboard →"}
        </motion.button>
      </div>
    </motion.div>
  )
}
