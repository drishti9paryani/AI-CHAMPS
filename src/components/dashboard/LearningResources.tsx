'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const RESOURCES = [
  { name: 'Gemini', description: 'Google\'s multimodal AI for research and content', url: 'https://gemini.google.com', icon: '💎' },
  { name: 'Claude', description: 'Anthropic\'s assistant for writing and analysis', url: 'https://claude.ai', icon: '🧠' },
  { name: 'ChatGPT', description: 'OpenAI\'s conversational AI platform', url: 'https://chat.openai.com', icon: '💬' },
  { name: 'NotebookLM', description: 'AI notebook for document research', url: 'https://notebooklm.google.com', icon: '📓' },
  { name: 'Perplexity', description: 'AI-powered search with citations', url: 'https://perplexity.ai', icon: '🔍' },
  { name: 'n8n', description: 'Workflow automation and AI agent builder', url: 'https://n8n.io', icon: '🔗' },
  { name: 'Midjourney', description: 'AI image generation for creative work', url: 'https://midjourney.com', icon: '🎨' },
  { name: 'Higgsfield', description: 'AI video and image creation platform', url: 'https://higgsfield.ai', icon: '🎥' },
]

export default function LearningResources() {
  return (
    <motion.div
      id="resources"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-1">Learning Resources</h3>
        <p className="text-slate-400 text-sm mb-5">Curated AI tools to explore this program</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {RESOURCES.map(r => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition"
            >
              <span className="text-2xl flex-shrink-0">{r.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm group-hover:text-purple-200 transition">{r.name}</span>
                  <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition text-xs">↗</span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{r.description}</p>
              </div>
            </a>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}
