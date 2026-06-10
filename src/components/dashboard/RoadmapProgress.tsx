'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { ALL_CARDS_MAP } from '@/lib/teamCards'
import { PAIN_POINTS, painPointsToCardIds } from '@/lib/painPoints'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'

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
  const sorted = [...tools].sort((a, b) => (b.isFav ? 1 : 0) - (a.isFav ? 1 : 0))
  return (
    <div className="space-y-2">
      {sorted.map(t => <ToolCard key={t.name} tool={t} />)}
    </div>
  )
}

// ── Inline pain-point editor ──────────────────────────────────────────────────
interface PathEditorProps {
  department: string
  userId: string
  onSave: (cardIds: string[]) => void
  onCancel: () => void
}

function PathEditor({ department, userId, onSave, onCancel }: PathEditorProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const pts = PAIN_POINTS[department] ?? []

  function toggle(idx: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  async function save() {
    if (selected.size === 0) {
      toast.error('Select at least one challenge first.')
      return
    }
    setSaving(true)
    const cardIds = painPointsToCardIds(department, selected)
    const { error } = await supabase
      .from('users')
      .update({ roadmap_mode: 'custom', chosen_roadmap_path: cardIds })
      .eq('id', userId)
    if (error) {
      toast.error('Could not save your path. Try again.')
      setSaving(false)
      return
    }
    toast.success('Your AI path has been updated! ✨')
    onSave(cardIds)
  }

  const cardCount = painPointsToCardIds(department, selected).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Editor header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
          <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">
            {department}
          </span>
        </div>
        <p className="text-white font-bold text-sm">What are you trying to improve?</p>
        <p className="text-slate-500 text-xs mt-0.5">
          Select all that apply — we&apos;ll build your personalised AI path.
        </p>
      </div>

      {/* Pain point checkboxes */}
      {pts.length > 0 ? (
        <div className="space-y-2 mb-4" style={{ perspective: 700 }}>
          {pts.map((pp, idx) => {
            const isSelected = selected.has(idx)
            return (
              <motion.button
                key={idx}
                onClick={() => toggle(idx)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03, type: 'spring', stiffness: 260, damping: 22 }}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left
                  transition-all duration-200 group
                  ${isSelected
                    ? 'bg-violet-500/15 border-violet-500/45 shadow-sm shadow-violet-900/20'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
              >
                <motion.div
                  animate={isSelected
                    ? { backgroundColor: 'rgb(139 92 246)', borderColor: 'rgb(139 92 246)' }
                    : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }
                  }
                  transition={{ duration: 0.14 }}
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="text-white text-[11px] font-black leading-none select-none"
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={`text-xs leading-snug transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-slate-200'}`}>
                  {pp.text}
                </span>
              </motion.button>
            )
          })}
        </div>
      ) : (
        <p className="text-slate-500 text-sm text-center py-6">No challenges configured for your team yet.</p>
      )}

      {/* Live count pill */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex justify-center mb-4"
          >
            <span className="px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/35 text-violet-300 text-xs font-semibold">
              {selected.size} challenge{selected.size > 1 ? 's' : ''} · {cardCount} AI solution{cardCount !== 1 ? 's' : ''} unlocked
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-2">
        <motion.button
          onClick={save}
          disabled={saving || selected.size === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-xl font-bold text-white text-sm
            bg-gradient-to-r from-purple-600 to-blue-600
            hover:from-purple-500 hover:to-blue-500
            shadow-lg shadow-purple-900/30
            disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saving ? 'Saving…' : selected.size === 0 ? 'Select challenges first' : `Save my path →`}
        </motion.button>
        <button
          onClick={onCancel}
          className="px-4 py-3 rounded-xl text-slate-400 hover:text-white
            bg-white/5 hover:bg-white/10 border border-white/10
            text-sm transition-all"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface RoadmapProgressProps {
  currentWeek: number
  roadmapMode?: string | null
  chosenPath?: string[] | null
  userId: string
  department: string
}

export default function RoadmapProgress({
  currentWeek,
  roadmapMode,
  chosenPath,
  userId,
  department,
}: RoadmapProgressProps) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]))
  const [isEditing, setIsEditing] = useState(false)

  // Local state so path updates instantly without a full page reload
  const [localMode, setLocalMode] = useState(roadmapMode)
  const [localPath, setLocalPath] = useState(chosenPath)

  const isCustom = localMode === 'custom' && localPath && localPath.length > 0

  function toggleWeek(week: number) {
    setOpenWeeks(prev => {
      const next = new Set(prev)
      next.has(week) ? next.delete(week) : next.add(week)
      return next
    })
  }

  function handleSaved(cardIds: string[]) {
    setLocalMode('custom')
    setLocalPath(cardIds)
    setIsEditing(false)
  }

  const chosenCards = isCustom
    ? localPath!.map(id => ALL_CARDS_MAP[id]).filter(Boolean)
    : []

  return (
    <motion.div
      id="roadmap"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <GlassCard>
        {/* ── Header ── */}
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

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Week badge (fixed mode only) */}
            {!isCustom && !isEditing && (
              <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Week {Math.min(currentWeek, 4)} of 4
              </span>
            )}

            {/* Edit / Customise button */}
            {!isEditing && (
              <motion.button
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  bg-violet-500/15 border border-violet-500/35
                  text-violet-300 hover:text-violet-200 hover:bg-violet-500/25
                  text-xs font-semibold transition-all"
              >
                <span>{isCustom ? '✏️' : '🎯'}</span>
                <span className="hidden sm:inline">{isCustom ? 'Edit path' : 'Customise'}</span>
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Inline pain-point editor ── */}
          {isEditing && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <PathEditor
                department={department}
                userId={userId}
                onSave={handleSaved}
                onCancel={() => setIsEditing(false)}
              />
            </motion.div>
          )}

          {/* ── Custom path cards ── */}
          {!isEditing && isCustom && (
            <motion.div
              key="custom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {chosenCards.map((card, idx) => {
                const palette = [
                  { from: '#a78bfa', to: '#7c3aed', glow: 'rgba(167,139,250,0.25)', bg: 'rgba(167,139,250,0.07)' },
                  { from: '#60a5fa', to: '#2563eb', glow: 'rgba(96,165,250,0.25)',  bg: 'rgba(96,165,250,0.07)' },
                  { from: '#34d399', to: '#059669', glow: 'rgba(52,211,153,0.25)',  bg: 'rgba(52,211,153,0.07)' },
                  { from: '#fbbf24', to: '#d97706', glow: 'rgba(251,191,36,0.25)', bg: 'rgba(251,191,36,0.07)' },
                  { from: '#f472b6', to: '#db2777', glow: 'rgba(244,114,182,0.25)',bg: 'rgba(244,114,182,0.07)' },
                  { from: '#38bdf8', to: '#0284c7', glow: 'rgba(56,189,248,0.25)', bg: 'rgba(56,189,248,0.07)' },
                ]
                const p = palette[idx % palette.length]
                return (
                  <div key={card.id} style={{ perspective: '900px' }}>
                    <motion.div
                      initial={{ opacity: 0, y: 16, rotateX: 10 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: idx * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
                      whileHover={{ rotateX: -6, rotateY: 8, scale: 1.04, z: 20 }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="relative rounded-2xl overflow-hidden cursor-default"
                    >
                      {/* Gradient border */}
                      <div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          padding: '1px',
                          background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                          opacity: 0.55,
                        }}
                      >
                        <div className="absolute inset-0 rounded-2xl bg-[#0d0d1a]" />
                      </div>
                      {/* Hover glow */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        style={{ boxShadow: `0 0 40px ${p.glow}, 0 0 80px ${p.glow}` }}
                      />
                      {/* Content */}
                      <div
                        className="relative z-10 flex items-start gap-4 p-4 rounded-2xl"
                        style={{ background: p.bg }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotateZ: -8 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="text-3xl flex-shrink-0 leading-none mt-0.5 select-none"
                          style={{ filter: `drop-shadow(0 0 10px ${p.glow})` }}
                        >
                          {card.emoji}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-bold text-sm mb-1"
                            style={{
                              background: `linear-gradient(135deg, ${p.from}, white)`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {card.title}
                          </p>
                          <p className="text-slate-400 text-xs leading-relaxed">{card.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* ── WRM Roadmap weeks ── */}
          {!isEditing && !isCustom && (
            <motion.div
              key="fixed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {JUNE_WEEKS.map((w, idx) => {
                const isActive = w.week === currentWeek
                const isPast = w.week < currentWeek
                const isOpen = openWeeks.has(w.week)
                const isPending = w.isPending
                return (
                  <div key={w.week} className="flex items-start gap-3">
                    {/* Timeline dot */}
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
                        {!isPending && (
                          <span className={`text-slate-400 text-base flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
                        )}
                      </button>

                      {isPending && (
                        <p className="px-3 pb-3 text-xs text-slate-600 leading-relaxed">{w.subtitle}</p>
                      )}

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
                              {w.tools && <ToolCards tools={w.tools} />}
                              {w.outcomes && (
                                <div>
                                  <p className="text-purple-400 text-[10px] uppercase tracking-wider mb-2 font-semibold">What You&apos;ll Learn</p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}
