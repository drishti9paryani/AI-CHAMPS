'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import { useOnboardingUser } from '@/lib/useOnboardingUser'
import { OnboardingPageSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'

const WEEKS = [
  { week: 1, title: 'AI Landscape & Tool Discovery', tools: ['Gemini', 'ChatGPT', 'Perplexity'], icon: '🔭' },
  { week: 2, title: 'Workflow Design & Automation Thinking', tools: ['n8n', 'Apify'], icon: '⚙️' },
  { week: 3, title: 'Content Creation with AI', tools: ['Claude', 'ChatGPT', 'NotebookLM'], icon: '✍️' },
  { week: 4, title: 'AI Video Production', tools: ['Higgsfield', 'Midjourney'], icon: '🎬' },
  { week: 5, title: 'AI Agents & Assistants', tools: ['Claude', 'ChatGPT', 'n8n'], icon: '🤖' },
  { week: 6, title: 'Department-Specific Use Cases', tools: ['Gemini', 'Perplexity', 'NotebookLM'], icon: '🏢' },
  { week: 7, title: 'Building Internal Systems', tools: ['Apify', 'n8n', 'Claude'], icon: '🏗️' },
  { week: 8, title: 'Showcase & Graduation', tools: ['Suno', 'Midjourney', 'Higgsfield'], icon: '🎓' },
]

const TOOL_COLORS: Record<string, string> = {
  Gemini: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Claude: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  ChatGPT: 'bg-green-500/20 text-green-300 border-green-500/30',
  NotebookLM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Suno: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Higgsfield: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Midjourney: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Perplexity: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  n8n: 'bg-red-500/20 text-red-300 border-red-500/30',
  Apify: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

export default function Screen4Roadmap() {
  const router = useRouter()
  const { userId, loading: authLoading } = useOnboardingUser()
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    if (!authLoading && !userId) router.replace('/onboarding/register')
  }, [authLoading, userId, router])

  async function handleFinish() {
    if (!userId) return
    setFinishing(true)

    const { error } = await supabase
      .from('users')
      .update({ onboarding_complete: true })
      .eq('id', userId)

    if (error) {
      toast.error('Could not save progress. Please try again.')
      setFinishing(false)
      return
    }

    router.push('/dashboard')
  }

  if (authLoading || !userId) return <OnboardingPageSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center min-h-screen px-4 py-16 md:py-12"
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">The AI Champs Roadmap</h2>
          <p className="text-slate-400">Eight weeks of exploration, creation, and mastery</p>
        </div>

        {/* Desktop: horizontal scroll timeline */}
        <div className="hidden md:block mb-8 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max px-2">
            {WEEKS.map((w, idx) => (
              <motion.div
                key={w.week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="w-52 flex-shrink-0"
              >
                <GlassCard className="!p-4 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-sm font-bold text-purple-300">
                      {w.week}
                    </span>
                    <span className="text-xl">{w.icon}</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-2 leading-snug">
                    Week {w.week}: {w.title}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {w.tools.map(tool => (
                      <span
                        key={tool}
                        className={`text-xs px-2 py-0.5 rounded-full border ${TOOL_COLORS[tool] || 'bg-white/10 text-slate-300 border-white/20'}`}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-4 mb-8">
          {WEEKS.map((w, idx) => (
            <motion.div
              key={w.week}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-start gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 border-purple-500/50 bg-purple-500/20 text-purple-300 flex-shrink-0">
                  {w.week}
                </div>
                {idx < WEEKS.length - 1 && (
                  <div className="w-0.5 h-full min-h-8 mt-1 bg-purple-500/30" />
                )}
              </div>

              <GlassCard className="flex-1 !p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{w.icon}</span>
                  <h3 className="font-semibold text-white text-sm leading-snug break-words">
                    Week {w.week}: {w.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {w.tools.map(tool => (
                    <span
                      key={tool}
                      className={`text-xs px-2 py-0.5 rounded-full border ${TOOL_COLORS[tool] || 'bg-white/10 text-slate-300 border-white/20'}`}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <button
          onClick={handleFinish}
          disabled={finishing}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
        >
          {finishing ? 'Saving...' : 'Finish — Enter Dashboard →'}
        </button>
      </div>
    </motion.div>
  )
}
