'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TarotCardData } from '@/lib/tarotConstants'

const FUN_LINERS: Record<string, string> = {
  'The Prompt Wizard': "Has seventeen tabs of prompts open. Some of them are genuinely alarming.",
  'The Workflow Architect': "Already automated three things before breakfast. None of which needed automating.",
  'The Curious Hacker': "Probably broke something productive today. Intentionally.",
  'The Automation Monk': "If it happened twice, it's been automated. Silently. Without telling anyone.",
  'The AI Explorer': "Has 47 browser tabs open, all AI tools, most of them free trials.",
  'The Agent Builder': "Building agents to build agents. The recursion is intentional.",
}

interface Props {
  card: TarotCardData | null
  cardType: string | null
}

export default function ArchetypeDrawer({ card, cardType }: Props) {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const title = cardType || card?.title || null
  const funLine = title ? (FUN_LINERS[title] ?? "Defying categorisation since day one.") : null

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  if (!title) return null

  return (
    <>
      {/* Fixed badge — top right */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-xl
          bg-purple-900/80 border border-purple-500/40 text-purple-200 text-xs font-semibold
          hover:bg-purple-800/90 hover:border-purple-400/60 transition backdrop-blur-md shadow-lg
          shadow-purple-900/40"
        title="Your AI archetype"
      >
        <span>✦</span>
        <span className="hidden sm:inline">{title}</span>
        <span className="sm:hidden">{title.split(' ').slice(-1)[0]}</span>
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full z-50 w-full max-w-sm
              bg-[#110a22] border-l border-purple-500/20 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/10">
              <div>
                <p className="text-purple-400 text-[10px] uppercase tracking-widest mb-1">Your AI Archetype</p>
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition text-2xl leading-none mt-0.5 p-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Sections */}
            <div className="p-6 space-y-6">
              {/* Fun one-liner */}
              {funLine && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                  <p className="text-purple-200 text-sm italic leading-relaxed">"{funLine}"</p>
                </div>
              )}

              {/* Description */}
              {card?.description && (
                <div>
                  <p className="text-purple-400 text-[10px] uppercase tracking-widest mb-2 font-semibold">About This Archetype</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{card.description}</p>
                </div>
              )}

              {/* Strength */}
              {card?.strength && (
                <div>
                  <p className="text-green-400 text-[10px] uppercase tracking-widest mb-2 font-semibold">Your Strength</p>
                  <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                    <span className="text-green-400 text-lg flex-shrink-0">⚡</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{card.strength}</p>
                  </div>
                </div>
              )}

              {/* Growth area */}
              {card?.growth_area && (
                <div>
                  <p className="text-amber-400 text-[10px] uppercase tracking-widest mb-2 font-semibold">Growth Area</p>
                  <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                    <span className="text-amber-400 text-lg flex-shrink-0">🌱</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{card.growth_area}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
