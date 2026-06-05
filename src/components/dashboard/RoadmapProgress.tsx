'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { ALL_CARDS_MAP } from '@/lib/teamCards'

interface AITool {
  emoji: string
  name: string
  tagline: string
  url: string
  isFav?: boolean
  more: string[]
}

interface Week {
  week: number
  title: string
  subtitle: string
  icon: string
  tools?: AITool[]
  outcomes?: string[]
  resources?: { label: string; tool: string }[]
  actions?: string[]
  isPending?: boolean
}

// ── Week 1 tool cards ────────────────────────────────────────────────────────
const WEEK1_TOOLS: AITool[] = [
  {
    emoji: '🧠',
    name: 'NotebookLM',
    tagline: 'Upload any PDF, lecture, or podcast → build your own AI brain and chat with it like a mate. It also auto-generates a full podcast episode from your docs.',
    url: 'https://notebooklm.google.com',
    isFav: true,
    more: [
      'Go to notebooklm.google.com → New Notebook → add any PDF, Google Doc, YouTube link, or audio file as a Source',
      'Hit "Audio Overview" in the top right → two AI hosts will discuss your uploaded content as a podcast. Takes ~2 min.',
      'Use the chat panel on the right to ask questions directly from the source: "Summarise the key brief points" / "What did the client say about budget?"',
      'Works with lecture recordings, client briefs, competitor reports, research papers — anything you need to absorb fast',
    ],
  },
  {
    emoji: '🔍',
    name: 'ChatGPT Deep Research',
    tagline: 'Type a topic → 10-page analyst-grade report in minutes. Like having a junior researcher on call.',
    url: 'https://chatgpt.com',
    more: [
      'Open chatgpt.com → New chat → click the "Deep Research" button (next to the attach icon)',
      'Give it a specific question, not a vague topic. "What are the top 5 AI tools agencies are using for client reporting in 2025?" > "AI tools for agencies"',
      'It browses 20–50 sources, synthesises, and gives you a cited, structured report — not a summary',
      'Best for: competitor research, industry trends, tool comparisons, anything you\'d normally spend 3 hours Googling',
    ],
  },
  {
    emoji: '🔗',
    name: 'ChatGPT Connectors',
    tagline: 'Link your Slack, Google Drive, or Notion. Ask questions across your actual work files — not random internet data.',
    url: 'https://chatgpt.com',
    more: [
      'Go to chatgpt.com → click your profile → Settings → Connectors → connect Google Drive, Slack, or Notion',
      'Once connected, start a new chat and ask: "Summarise the last 3 client briefs in my Drive" or "What did my team discuss about the campaign last week in Slack?"',
      'It searches only your connected tools — not the public web',
      'Game changer for: onboarding, catching up after leave, finding that document you know exists but can\'t locate',
    ],
  },
  {
    emoji: '🎨',
    name: 'ChatGPT Canvas',
    tagline: 'A live document you build WITH AI side-by-side. Not a chat — a real collaborative workspace.',
    url: 'https://chatgpt.com',
    more: [
      'Open chatgpt.com → New chat → click "Canvas" from the menu (or ask Claude: "Open this in Canvas")',
      'The document appears on the right; the chat is on the left. Edit any part of the doc directly or ask AI to rewrite sections',
      'Best for: writing strategies, drafting emails, building presentations, refining copy with a client in the room',
      'You can export the final version as plain text or copy it directly into any tool',
    ],
  },
  {
    emoji: '✦',
    name: 'Claude Artifacts + Cowork',
    tagline: 'Claude builds live, interactive things as you chat — code, charts, documents. Cowork lets your whole team collaborate in the same Claude session simultaneously.',
    url: 'https://claude.ai',
    more: [
      'Open claude.ai → start a chat → ask Claude to "build" something: a dashboard, a calculator, a branded email template, a chart from your data',
      'Artifacts appear live on the right panel — fully interactive, editable, and shareable',
      'For Cowork: start a Claude session → click Share → invite teammates to join the same session. Everyone sees the same context and can prompt simultaneously',
      'Best for: live client workshops, team brainstorms, building something together in a meeting without endless email threads',
    ],
  },
  {
    emoji: '☄️',
    name: 'Perplexity Comet',
    tagline: "Don't search the web yourself. Comet is an AI agent that browses, reads, fills forms, and completes multi-step tasks for you — while you do something else.",
    url: 'https://www.perplexity.ai/comet',
    more: [
      'Comet is Perplexity\'s autonomous browser agent — it doesn\'t just answer questions, it acts',
      'Examples: "Research the top 10 influencers in the beauty space and compile their stats in a table" / "Find all open RFPs on this website and summarise them"',
      'It browses in real-time, clicks through pages, fills in forms, and returns a finished result — not links',
      'Think of it as: you describe the task, Comet does the internet legwork, you get the output. No more 47 tabs.',
    ],
  },
]

const JUNE_WEEKS: Week[] = [
  {
    week: 1,
    title: "Anything You'd Like",
    subtitle: "You think you know how to use GPT? Think again. Most people use 5% of what AI can do. Below are the features that will actually change how you work — pick one you've never tried and go deep this week.",
    icon: '🌱',
    tools: WEEK1_TOOLS,
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


// ── Tool card with expandable "Show more" ─────────────────────────────────────
function ToolCard({ tool }: { tool: AITool }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-2xl border transition-all duration-200
      ${tool.isFav
        ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-900/20'
        : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 p-3">
        <span className="text-2xl flex-shrink-0 mt-0.5"
          style={{ filter: tool.isFav ? 'drop-shadow(0 0 8px rgba(168,85,247,0.7))' : 'none' }}>
          {tool.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold text-sm hover:underline ${tool.isFav ? 'text-purple-200' : 'text-white'}`}
            >
              {tool.name} ↗
            </a>
            {tool.isFav && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-semibold uppercase tracking-wide">
                ⭐ My Fav
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{tool.tagline}</p>
        </div>
      </div>

      {/* Show more toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-1.5 px-3 py-2 border-t border-white/10
          text-[10px] font-semibold uppercase tracking-wider text-slate-500
          hover:text-purple-300 transition text-left"
      >
        <span className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▶</span>
        {open ? 'Show less' : 'How to use this →'}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ol className="px-3 pb-3 space-y-2">
              {tool.more.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="text-purple-400 font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ToolCards({ tools }: { tools: AITool[] }) {
  // fav first, rest after
  const sorted = [...tools].sort((a, b) => (b.isFav ? 1 : 0) - (a.isFav ? 1 : 0))
  return (
    <div className="space-y-2">
      {sorted.map(t => <ToolCard key={t.name} tool={t} />)}
    </div>
  )
}

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
              Week {Math.min(currentWeek, 4)} of 4
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
                          <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-3">
                            <p className="text-slate-400 text-xs leading-relaxed">{w.subtitle}</p>

                            {/* ── Tool cards (Week 1) ── */}
                            {w.tools && <ToolCards tools={w.tools} />}

                            {/* ── Generic outcomes / resources / actions ── */}
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
