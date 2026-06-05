'use client'

import { motion } from 'framer-motion'

const WEEK_ACTIONS: Record<number, { cta: string; url: string; tool: string; emoji: string }> = {
  1: {
    emoji: '🧠',
    tool: 'NotebookLM',
    cta: 'Upload a doc and build your AI brain',
    url: 'https://notebooklm.google.com',
  },
  2: {
    emoji: '🎨',
    tool: 'Midjourney',
    cta: 'Generate your first campaign visual with a prompt',
    url: 'https://midjourney.com',
  },
  3: {
    emoji: '🎭',
    tool: 'HeyGen',
    cta: 'Create an AI avatar version of yourself',
    url: 'https://heygen.com',
  },
  4: {
    emoji: '🎬',
    tool: 'Runway',
    cta: 'Generate your first AI video clip',
    url: 'https://runwayml.com',
  },
}

interface NextStepProps {
  currentWeek: number
  name: string
}

export default function NextStep({ currentWeek, name }: NextStepProps) {
  const week = Math.min(Math.max(currentWeek, 1), 4)
  const action = WEEK_ACTIONS[week]
  const first = name.split(' ')[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 60%)',
              'radial-gradient(ellipse at 60% 80%, rgba(168,85,247,0.35) 0%, transparent 60%), radial-gradient(ellipse at 20% 30%, rgba(59,130,246,0.3) 0%, transparent 60%)',
              'radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 60%)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[#0d0d1a]/60 backdrop-blur-sm" />
        {/* Shimmer border */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-[1px] rounded-2xl opacity-60"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, #a855f7 25%, transparent 50%, #3b82f6 75%, transparent 100%)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
      </div>

      <div className="relative z-10 p-5">
        {/* Greeting */}
        <p className="text-slate-400 text-xs mb-1 font-medium">
          {greeting}, {first} 👋
        </p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold mb-1">
              Your next move — Week {week}
            </p>
            <h3 className="text-white font-bold text-base leading-snug mb-3">
              {action.emoji} {action.cta}
            </h3>
            <a
              href={action.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-purple-600 to-blue-600
                hover:from-purple-500 hover:to-blue-500
                shadow-lg shadow-purple-900/30
                transition-all hover:scale-[1.03] active:scale-95"
            >
              Open {action.tool} →
            </a>
          </div>

          {/* Floating emoji */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl flex-shrink-0 select-none hidden sm:block"
            style={{ filter: 'drop-shadow(0 0 16px rgba(168,85,247,0.5))' }}
          >
            {action.emoji}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
