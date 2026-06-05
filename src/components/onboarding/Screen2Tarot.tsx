'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useOnboardingUser } from '@/lib/useOnboardingUser'
import { toast } from '@/lib/toast'
import { OnboardingPageSkeleton, TarotCardSkeleton } from '@/components/ui/skeletons/AdminSkeletons'

export interface TarotCard {
  card_type: string
  title: string
  description: string
  strength: string
  growth_area: string
  prediction: string
}

const CARD_COLORS: Record<string, string> = {
  'The Prompt Wizard': 'from-violet-600 to-purple-900',
  'The Workflow Architect': 'from-blue-600 to-cyan-900',
  'The Curious Hacker': 'from-green-600 to-teal-900',
  'The Automation Monk': 'from-orange-600 to-amber-900',
  'The AI Explorer': 'from-pink-600 to-rose-900',
  'The Agent Builder': 'from-indigo-600 to-blue-900',
}

const CARD_EMOJIS: Record<string, string> = {
  'The Prompt Wizard': '🧙‍♂️',
  'The Workflow Architect': '🏗️',
  'The Curious Hacker': '🔍',
  'The Automation Monk': '🧘',
  'The AI Explorer': '🚀',
  'The Agent Builder': '🤖',
}

type DeptProfile = {
  strength: string
  growth_area: string
  prediction: string
}

const DEPT_PROFILES: Record<string, DeptProfile> = {
  'Admin & Support': {
    strength: 'Automating repetitive admin tasks and communication flows',
    growth_area: 'Using AI to triage requests and generate responses faster',
    prediction: 'You will discover an AI tool that eliminates your most dreaded weekly task.',
  },
  'Business Development': {
    strength: 'Using AI to research prospects and craft winning pitches',
    growth_area: 'Automating lead research and outreach personalization',
    prediction: 'An AI-assisted pitch you prepare this month will open a door you didn\'t expect.',
  },
  'Capital Z': {
    strength: 'Spotting AI-native trends before they go mainstream',
    growth_area: 'Building AI workflows that resonate with Gen Z audiences',
    prediction: 'An AI experiment you run will become a case study your peers reference.',
  },
  'Client Servicing - Brands': {
    strength: 'Using AI to generate faster, sharper client-ready content',
    growth_area: 'Automating reporting and status updates with AI summaries',
    prediction: 'A client will ask "how did you turn this around so fast?" — and AI will be the answer.',
  },
  'Client Servicing - Entertainment': {
    strength: 'Crafting AI-powered entertainment briefs and concepts at speed',
    growth_area: 'Using AI to map audience insights to campaign ideas',
    prediction: 'An AI-generated concept you present this month will genuinely excite a client.',
  },
  'Copy & Content': {
    strength: 'Drafting, repurposing and scaling content with AI',
    growth_area: 'Building prompt libraries for consistent brand voice',
    prediction: 'You will produce more quality content this month than the previous three combined.',
  },
  'Corporate Communications': {
    strength: 'Using AI to craft crisp, on-brand messaging at scale',
    growth_area: 'Automating press release drafts and media monitoring',
    prediction: 'A comms piece you draft with AI will be quoted somewhere you didn\'t plan for.',
  },
  'Design': {
    strength: 'Using generative tools to 10x your ideation speed',
    growth_area: 'Building AI-augmented design systems',
    prediction: 'Your next moodboard will be half AI-generated and nobody will be able to tell.',
  },
  'Digital Media': {
    strength: 'Optimising campaigns in real time using AI-driven insights',
    growth_area: 'Automating performance reports and budget recommendations',
    prediction: 'An AI insight will help you catch a campaign issue before it becomes a problem.',
  },
  'Finance': {
    strength: 'Using AI for data analysis and pattern recognition',
    growth_area: 'Automating report generation and anomaly detection',
    prediction: 'A data insight you surface with AI will change how leadership makes a key decision.',
  },
  "Founder's Office": {
    strength: 'Turning AI into a force multiplier for strategic decisions',
    growth_area: 'Building AI-powered dashboards and executive briefings',
    prediction: 'An AI summary you prepare will save a leadership meeting 30 minutes — and earn you respect.',
  },
  'Influencer Marketing': {
    strength: 'Using AI to discover, vet and brief creators at scale',
    growth_area: 'Automating influencer reporting and ROI tracking',
    prediction: 'An AI-matched creator collaboration you pitch this month will outperform expectations.',
  },
  'Management': {
    strength: 'Using AI to synthesize team insights and make faster decisions',
    growth_area: 'Embedding AI tools into team workflows and goal tracking',
    prediction: 'You will unblock a team bottleneck this month using an AI tool nobody expected.',
  },
  'Partnerships': {
    strength: 'Using AI to identify and qualify partnership opportunities faster',
    growth_area: 'Automating partnership proposals and follow-up sequences',
    prediction: 'An AI-researched partnership idea you bring up will surprise the room.',
  },
  'People & Culture': {
    strength: 'Streamlining hiring and onboarding workflows with AI',
    growth_area: 'Building AI tools for L&D, engagement and culture programs',
    prediction: 'You will find an AI tool that saves your team 3 hours every week — and never go back.',
  },
  'Planning': {
    strength: 'Using AI to stress-test strategies and scenario-plan faster',
    growth_area: 'Automating competitive research and audience mapping',
    prediction: 'A planning deck you build with AI assistance will be the sharpest one in the room.',
  },
  'SEO': {
    strength: 'Using AI to surface keyword opportunities and content gaps at scale',
    growth_area: 'Automating technical audits and content brief generation',
    prediction: 'An AI-optimised content piece you ship this month will rank faster than anything before it.',
  },
  'Strategy': {
    strength: 'Using AI to synthesize research and sharpen strategic narratives',
    growth_area: 'Building AI-powered competitive intelligence workflows',
    prediction: 'A strategy recommendation you make using AI will become a case study.',
  },
  'Video': {
    strength: 'Using AI for scriptwriting, storyboarding and concept development',
    growth_area: 'Exploring AI-assisted editing and post-production workflows',
    prediction: 'A video concept you ideate with AI this month will get greenlighted faster than usual.',
  },
  'Video Production': {
    strength: 'Using AI to accelerate pre-production planning and scheduling',
    growth_area: 'Automating transcription, subtitles and rough-cut workflows',
    prediction: 'An AI tool will cut your post-production turnaround time in half this month.',
  },
  'Web & Tech': {
    strength: 'Integrating AI tools into existing systems and workflows',
    growth_area: 'Exploring LLM-based automation and code assistance',
    prediction: 'A side project you build with AI will impress people way outside your team.',
  },
}

const SCORE_TO_CARD: [number, string][] = [
  [1, 'The AI Explorer'],
  [2, 'The Curious Hacker'],
  [3, 'The Prompt Wizard'],
  [4, 'The Workflow Architect'],
  [4.5, 'The Automation Monk'],
  [5, 'The Agent Builder'],
]

const SCORE_TITLES: Record<string, string[]> = {
  'The AI Explorer': ['First Steps into the Future', 'The Spark of Curiosity', 'Born to Discover'],
  'The Curious Hacker': ['Breaking Things to Build Better', 'The Relentless Tinkerer', 'Chaos with a Plan'],
  'The Prompt Wizard': ['Master of the Magic Words', 'The Language Alchemist', 'Words that Compute'],
  'The Workflow Architect': ['Blueprinting the Future', 'The System Whisperer', 'Order from Complexity'],
  'The Automation Monk': ['The Path of Zero Repetition', 'Silent. Efficient. Unstoppable.', 'Flow State Achieved'],
  'The Agent Builder': ['Deploying Digital Minds', 'The Architect of Autonomy', 'Beyond Human Speed'],
}

function generateLocalCard(userData: { name: string; department: string; ai_score: number }): TarotCard {
  const { name, department, ai_score } = userData

  const card_type = SCORE_TO_CARD.find(([max]) => ai_score <= max)?.[1] ?? 'The Agent Builder'

  const titles = SCORE_TITLES[card_type]
  // pick a title deterministically based on name length
  const title = titles[name.length % titles.length]

  const dept = DEPT_PROFILES[department] ?? {
    strength: 'Applying AI creatively across every challenge',
    growth_area: 'Finding the right AI tool for the right problem',
    prediction: 'You will surprise yourself with what AI helps you accomplish this month.',
  }

  const descriptions: Record<string, string> = {
    'The AI Explorer': `${name} is at the exciting beginning of an AI journey, full of curiosity and untapped potential. Every tool you touch from here becomes a superpower in the making.`,
    'The Curious Hacker': `${name} learns by doing — breaking problems apart and rebuilding them smarter with AI. Your instinct to experiment is your greatest edge.`,
    'The Prompt Wizard': `${name} has unlocked the art of talking to machines in their own language. You know that the right prompt is worth a thousand keystrokes.`,
    'The Workflow Architect': `${name} sees inefficiency and instinctively designs AI-powered systems to eliminate it. You don't just use AI — you build with it.`,
    'The Automation Monk': `${name} has achieved a rare discipline: letting AI handle the noise so you can focus on what truly matters. You are one with the workflow.`,
    'The Agent Builder': `${name} operates at the frontier — designing autonomous AI systems that work while you sleep. You are what the future of work looks like.`,
  }

  return {
    card_type,
    title,
    description: descriptions[card_type],
    strength: dept.strength,
    growth_area: dept.growth_area,
    prediction: dept.prediction,
  }
}

export default function Screen2Tarot() {
  const router = useRouter()
  const { userId, loading: authLoading } = useOnboardingUser()
  const [card, setCard] = useState<TarotCard | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [userData, setUserData] = useState<{ name: string; department: string; ai_score: number } | null>(null)

  useEffect(() => {
    if (!authLoading && !userId) router.replace('/onboarding/register')
  }, [authLoading, userId, router])

  useEffect(() => {
    if (!userId) return
    supabase.from('users').select('name, department, ai_score, tarot_card_data').eq('id', userId).single()
      .then(({ data }) => {
        if (data) {
          setUserData(data)
          if (data.tarot_card_data && typeof data.tarot_card_data === 'object') {
            setCard(data.tarot_card_data as TarotCard)
            setFlipped(true)
          }
        }
      })
  }, [userId])

  function revealCard(data: { name: string; department: string; ai_score: number }) {
    const generated = generateLocalCard(data)
    setCard(generated)
    setTimeout(() => setFlipped(true), 300)
  }

  useEffect(() => {
    if (userData && !card) revealCard(userData)
  }, [userData]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveAndContinue() {
    if (!card || !userId) return
    setSaving(true)
    await supabase.from('users').update({
      tarot_card_type: card.card_type,
      tarot_card_data: card,
    }).eq('id', userId)
    toast.success('Profile saved!')
    setSaving(false)
    router.push('/onboarding/form')
  }

  async function downloadCard() {
    if (!cardRef.current) return
    const { default: html2canvas } = await import('html2canvas')

    // Clone the card into an off-screen div with no flip transform
    const clone = cardRef.current.cloneNode(true) as HTMLElement
    clone.style.position = 'fixed'
    clone.style.top = '-9999px'
    clone.style.left = '-9999px'
    clone.style.transform = 'none'
    clone.style.width = cardRef.current.offsetWidth + 'px'
    clone.style.height = cardRef.current.offsetHeight + 'px'
    document.body.appendChild(clone)

    const canvas = await html2canvas(clone, { backgroundColor: null, scale: 2 })
    document.body.removeChild(clone)

    const link = document.createElement('a')
    link.download = `ai-archetype-${card?.card_type?.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const gradientClass = card
    ? (CARD_COLORS[card.card_type] || 'from-purple-600 to-blue-900')
    : 'from-purple-600 to-blue-900'

  const emoji = card ? (CARD_EMOJIS[card.card_type] || '✨') : '✨'

  if (authLoading || !userId) return <OnboardingPageSkeleton />
  if (!userData) return <TarotCardSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Your AI Archetype</h2>
          <p className="text-slate-400">Based on your personality & AI score</p>
        </div>

        <div
          className="flip-card w-full aspect-[2/3] mb-6 cursor-pointer"
          onClick={() => card && flipped && setShowDetails(prev => !prev)}
        >
          <div className={`flip-card-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}>
            {/* Mystery back (before reveal) */}
            <div className="flip-card-front absolute inset-0">
              <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center border border-white/20`}>
                <div className="text-center p-6">
                  <div className="text-6xl mb-4 animate-pulse">🔮</div>
                  <p className="text-white/60 text-sm">Calculating your archetype...</p>
                </div>
              </div>
            </div>

            {/* Revealed card */}
            <div className="flip-card-back absolute inset-0" ref={cardRef}>
              {card && (
                <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${gradientClass} p-5 border border-white/20 flex flex-col justify-between overflow-hidden`}>
                  {!showDetails ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <p className="text-white/50 text-xs uppercase tracking-widest mb-3">AI Archetype</p>
                      <div className="text-5xl mb-4">{emoji}</div>
                      <p className="text-white/70 text-sm uppercase tracking-wide mb-2">{card.card_type}</p>
                      <h3 className="text-2xl font-bold text-white leading-tight">{card.title}</h3>
                      <p className="text-white/50 text-xs mt-6">Tap to see your full profile</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{emoji}</span>
                          <p className="text-white/50 text-xs uppercase tracking-widest">{card.card_type}</p>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                        <p className="text-white/80 text-sm leading-relaxed mb-4">{card.description}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white/10 rounded-xl p-3">
                          <p className="text-white/50 text-xs">⚡ Superpower</p>
                          <p className="text-white text-sm font-medium">{card.strength}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3">
                          <p className="text-white/50 text-xs">🎯 Next Quest</p>
                          <p className="text-white text-sm font-medium">{card.growth_area}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3">
                          <p className="text-white/50 text-xs">🔮 30-Day Prophecy</p>
                          <p className="text-white text-sm italic">{card.prediction}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {card && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => userData && revealCard(userData)}
                className="flex-1 py-3 rounded-xl font-medium text-white border border-white/20 hover:bg-white/10 transition"
              >
                Regenerate
              </button>
              <button
                onClick={downloadCard}
                className="flex-1 py-3 rounded-xl font-medium text-white border border-white/20 hover:bg-white/10 transition"
              >
                Download
              </button>
            </div>
            <button
              onClick={saveAndContinue}
              disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
