'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const RESOURCES = [
  // Week 1 — Anything You'd Like
  { name: 'ChatGPT', description: 'Start here. Voice mode, GPT-4o, everything.', url: 'https://chat.openai.com', icon: '💬', week: 1 },
  { name: 'Claude', description: 'Best for writing, analysis and long documents.', url: 'https://claude.ai', icon: '🧠', week: 1 },
  { name: 'Gemini', description: "Google's multimodal AI. Great for research.", url: 'https://gemini.google.com', icon: '💎', week: 1 },
  { name: 'Perplexity', description: 'AI search with sources. No more Googling.', url: 'https://perplexity.ai', icon: '🔍', week: 1 },
  // Week 2 — Script and Image Generation
  { name: 'Midjourney', description: 'Best AI image generation. Period.', url: 'https://midjourney.com', icon: '🎨', week: 2 },
  { name: 'Adobe Firefly', description: "Adobe's generative AI. Safe for commercial use.", url: 'https://firefly.adobe.com', icon: '🔥', week: 2 },
  { name: 'DALL·E', description: "OpenAI's image gen. Right inside ChatGPT.", url: 'https://openai.com/dall-e-3', icon: '🖼️', week: 2 },
  { name: 'Ideogram', description: 'AI image gen that actually handles text in images.', url: 'https://ideogram.ai', icon: '✏️', week: 2 },
  // Week 3 — AI Influencer / Avatar and Music
  { name: 'HeyGen', description: 'Create AI avatars and talking head videos.', url: 'https://heygen.com', icon: '🎭', week: 3 },
  { name: 'Synthesia', description: 'AI video with realistic presenters.', url: 'https://synthesia.io', icon: '📹', week: 3 },
  { name: 'ElevenLabs', description: 'Voice cloning and AI audio. Scary good.', url: 'https://elevenlabs.io', icon: '🎙️', week: 3 },
  { name: 'Suno', description: 'Type a prompt. Get a full song. Seriously.', url: 'https://suno.com', icon: '🎵', week: 3 },
  // Week 4 — 2-Minute Movie
  { name: 'Runway', description: 'AI video generation and editing platform.', url: 'https://runwayml.com', icon: '🎬', week: 4 },
  { name: 'Kling AI', description: 'High-quality AI video generation from text.', url: 'https://klingai.com', icon: '🎥', week: 4 },
  { name: 'Descript', description: 'Edit video by editing the transcript. Magic.', url: 'https://descript.com', icon: '✂️', week: 4 },
  { name: 'Higgsfield', description: 'AI video with cinematic motion control.', url: 'https://higgsfield.ai', icon: '🚀', week: 4 },
]

const WEEK_LABELS: Record<number, string> = {
  1: "Week 1 — Anything You'd Like",
  2: 'Week 2 — Script & Image Generation',
  3: 'Week 3 — AI Influencer / Avatar & Music',
  4: 'Week 4: Direct 2-Minute Movie',
}

const WEEK_COLORS: Record<number, string> = {
  1: 'text-emerald-400',
  2: 'text-blue-400',
  3: 'text-purple-400',
  4: 'text-rose-400',
}

export default function LearningResources() {
  const weeks = [1, 2, 3, 4]

  return (
    <motion.div
      id="resources"
      initial={{ opacity: 0, y: 24, rotateX: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  rotateX: 0, scale: 1   }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-1">Tools & Resources</h3>
        <p className="text-slate-400 text-sm mb-6">Every tool you need, week by week.</p>

        <div className="space-y-6">
          {weeks.map(week => (
            <div key={week}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${WEEK_COLORS[week]}`}>
                {WEEK_LABELS[week]}
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {RESOURCES.filter(r => r.week === week).map(r => (
                  <a
                    key={r.name}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/10 hover:border-purple-500/30 transition"
                  >
                    <span className="text-xl flex-shrink-0">{r.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-medium text-sm group-hover:text-purple-200 transition">{r.name}</span>
                        <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition text-xs">↗</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{r.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}
