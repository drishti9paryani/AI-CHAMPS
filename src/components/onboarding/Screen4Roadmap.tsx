'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import GlassCard from '@/components/ui/GlassCard'
import { useOnboardingUser } from '@/lib/useOnboardingUser'
import { OnboardingPageSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'

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

// ─── Team Cards ───────────────────────────────────────────────────────────────

const TEAM_CARDS: Record<string, { id: string; emoji: string; title: string; description: string }[]> = {
  'Video Production': [
    { id: 'vp1', emoji: '🗓️', title: 'AI Pre-Production', description: 'Use AI to generate call sheets, shot lists and production schedules in minutes.' },
    { id: 'vp2', emoji: '🔤', title: 'Auto Transcription', description: 'Whisper-powered transcription and subtitle generation — no more manual time-coding.' },
    { id: 'vp3', emoji: '✂️', title: 'Rough Cut Automation', description: 'Let AI assemble your first cut based on transcript highlights.' },
    { id: 'vp4', emoji: '🎵', title: 'AI Music & SFX', description: 'Generate original background scores and sound effects with Suno and ElevenLabs.' },
    { id: 'vp5', emoji: '🎨', title: 'AI Color Grading Assist', description: 'Use AI tools to match grades across scenes and apply reference looks automatically.' },
    { id: 'vp6', emoji: '📦', title: 'Asset Organisation', description: 'AI-powered tagging and organisation of raw footage libraries.' },
  ],
  'Design': [
    { id: 'd1', emoji: '🖼️', title: 'Midjourney Mastery', description: 'Go from "generic output" to stunning, on-brand visuals with advanced prompting.' },
    { id: 'd2', emoji: '🎨', title: 'AI Moodboarding', description: 'Generate full client moodboards in 10 minutes, not 2 days.' },
    { id: 'd3', emoji: '✏️', title: 'Concept Ideation at 10x', description: 'Use generative tools to explore 20 directions before settling on one.' },
    { id: 'd4', emoji: '🔄', title: 'Style Transfer', description: 'Apply a brand\'s visual DNA to any AI-generated asset seamlessly.' },
    { id: 'd5', emoji: '🏗️', title: 'AI Design Systems', description: 'Build component libraries and design tokens with AI-assisted documentation.' },
    { id: 'd6', emoji: '👤', title: 'AI UX Research', description: 'Synthesize user interviews and generate personas using Claude.' },
  ],
  'Copy & Content': [
    { id: 'cc1', emoji: '📚', title: 'Prompt Library', description: 'Build a team-wide library of battle-tested prompts for every content type you write.' },
    { id: 'cc2', emoji: '🔄', title: 'Content Repurposing', description: 'Turn one long-form piece into 15 formats — threads, captions, emails, blogs — in one go.' },
    { id: 'cc3', emoji: '🗣️', title: 'Brand Voice Training', description: 'Teach an AI your brand\'s tone so every output sounds like you wrote it.' },
    { id: 'cc4', emoji: '📧', title: 'Newsletter Automation', description: 'From research to draft to send — build an AI pipeline for weekly newsletters.' },
    { id: 'cc5', emoji: '🔍', title: 'AI SEO Writing', description: 'Combine keyword strategy with AI drafting for content that ranks and reads well.' },
    { id: 'cc6', emoji: '📊', title: 'Content Analytics Summaries', description: 'Use AI to digest performance data and surface actionable content insights.' },
  ],
  'Digital Media': [
    { id: 'dm1', emoji: '📈', title: 'AI Performance Reports', description: 'Automate weekly performance summaries across platforms with AI interpretation.' },
    { id: 'dm2', emoji: '🎯', title: 'Audience Segmentation', description: 'Use AI tools to discover micro-audiences you didn\'t know existed.' },
    { id: 'dm3', emoji: '💡', title: 'Creative Testing Frameworks', description: 'Build AI-assisted systems to test 10 ad variants without 10x the effort.' },
    { id: 'dm4', emoji: '⚠️', title: 'Anomaly Detection', description: 'Catch campaign drops before they become disasters using AI monitoring.' },
    { id: 'dm5', emoji: '💬', title: 'AI Ad Copy Generation', description: 'Generate high-converting copy variations at scale for every placement and format.' },
    { id: 'dm6', emoji: '🤖', title: 'Automated Bid Strategy', description: 'Use AI-assisted tools to optimise spend allocation in real time.' },
  ],
  'SEO': [
    { id: 'seo1', emoji: '🔍', title: 'AI Keyword Clustering', description: 'Group thousands of keywords by intent in minutes — not hours — using AI.' },
    { id: 'seo2', emoji: '📝', title: 'Content Brief Generator', description: 'Build detailed briefs with headings, angle and competitor gaps — all AI-assisted.' },
    { id: 'seo3', emoji: '🏗️', title: 'Technical Audit Automation', description: 'Use AI to interpret crawl data and prioritise fixes by business impact.' },
    { id: 'seo4', emoji: '🔗', title: 'AI Link Building Research', description: 'Find and qualify link prospects at 5x normal speed.' },
    { id: 'seo5', emoji: '📊', title: 'Rank Tracking Summaries', description: 'Auto-generate weekly ranking updates with AI-written analysis.' },
    { id: 'seo6', emoji: '🌐', title: 'Schema Markup Generator', description: 'Let AI write and validate structured data for every content template.' },
  ],
  'Strategy': [
    { id: 'st1', emoji: '🔭', title: 'Competitive Intelligence', description: 'Automate research on competitors using AI — scrapers, summaries and gap analysis.' },
    { id: 'st2', emoji: '🗺️', title: 'Audience Mapping', description: 'Build rich audience personas from research using AI synthesis.' },
    { id: 'st3', emoji: '📋', title: 'Strategy Deck Assist', description: 'Use Claude to stress-test your strategy and sharpen your narrative before presenting.' },
    { id: 'st4', emoji: '📰', title: 'Trend Intelligence', description: 'Build an AI-powered trend radar that surfaces signals before they become obvious.' },
    { id: 'st5', emoji: '📣', title: 'Campaign Concept Generation', description: 'Use AI to generate and pressure-test 10 campaign territories from a brief.' },
    { id: 'st6', emoji: '🔄', title: 'Insight Synthesis', description: 'Dump raw research into Claude and get a clean strategic narrative back.' },
  ],
  'Influencer Marketing': [
    { id: 'im1', emoji: '🔎', title: 'AI Creator Discovery', description: 'Use AI-powered tools to find creators who actually match a brief — not just high follower counts.' },
    { id: 'im2', emoji: '📊', title: 'ROI Tracking Automation', description: 'Build an AI-assisted dashboard that tracks influencer performance without manual pulls.' },
    { id: 'im3', emoji: '📝', title: 'Brief Generation', description: 'Create detailed, on-brand creator briefs using AI in minutes.' },
    { id: 'im4', emoji: '🤝', title: 'Outreach Automation', description: 'Build personalised outreach sequences at scale without sounding like a bot.' },
    { id: 'im5', emoji: '🛡️', title: 'Fake Follower Detection', description: 'Use AI tools to vet creator authenticity before committing budget.' },
    { id: 'im6', emoji: '💬', title: 'Content Repurposing', description: 'Use AI to reshare and adapt creator content across owned channels.' },
  ],
  'Business Development': [
    { id: 'bd1', emoji: '🔍', title: 'Lead Research Automation', description: 'Use AI to research prospects, surface insights and prioritise outreach.' },
    { id: 'bd2', emoji: '✉️', title: 'Pitch Personalisation', description: 'Generate hyper-personalised pitch decks and emails at scale.' },
    { id: 'bd3', emoji: '📞', title: 'Meeting Prep', description: 'Use AI to brief yourself on any prospect in 5 minutes.' },
    { id: 'bd4', emoji: '📊', title: 'Pipeline Insights', description: 'AI-assisted CRM summaries and deal health monitoring.' },
    { id: 'bd5', emoji: '🤝', title: 'Proposal Generation', description: 'First-draft proposals using AI that you tune — not write from scratch.' },
    { id: 'bd6', emoji: '📰', title: 'Market Scanning', description: 'Automate news and signal monitoring for target industries.' },
  ],
  'Client Servicing - Brands': [
    { id: 'csb1', emoji: '📋', title: 'Status Update Automation', description: 'Generate client-ready status updates from your internal notes using AI.' },
    { id: 'csb2', emoji: '📊', title: 'Report Generation', description: 'Turn raw data into polished monthly reports with AI-written commentary.' },
    { id: 'csb3', emoji: '✍️', title: 'Brief Interpretation', description: 'Use Claude to unpack ambiguous client briefs and write back smart clarifying questions.' },
    { id: 'csb4', emoji: '💬', title: 'Response Drafting', description: 'Draft faster client communication without losing your voice.' },
    { id: 'csb5', emoji: '🔍', title: 'Competitive Tracking', description: 'Automate brand monitoring for your clients across channels.' },
    { id: 'csb6', emoji: '🎯', title: 'Campaign Summary Decks', description: 'AI-assisted end-of-campaign presentations with narrative arc built in.' },
  ],
  'Client Servicing - Entertainment': [
    { id: 'cse1', emoji: '🎭', title: 'Concept Development', description: 'Use AI to rapidly generate and iterate entertainment campaign concepts from a brief.' },
    { id: 'cse2', emoji: '🎬', title: 'Script Assist', description: 'Draft, punch up and adapt scripts for entertainment assets using Claude.' },
    { id: 'cse3', emoji: '📊', title: 'Audience Insight Reports', description: 'AI-powered audience analysis for entertainment properties and campaigns.' },
    { id: 'cse4', emoji: '🎵', title: 'Content Versioning', description: 'Use AI to create format variations of entertainment content for different platforms.' },
    { id: 'cse5', emoji: '📋', title: 'Brief Synthesis', description: 'Digest complex entertainment briefs and extract the strategic kernel fast.' },
    { id: 'cse6', emoji: '💡', title: 'Trend Spotting', description: 'Build an AI trend radar specific to entertainment culture and fandoms.' },
  ],
  'Planning': [
    { id: 'pl1', emoji: '🗺️', title: 'Scenario Planning', description: 'Use AI to stress-test strategies against multiple market scenarios.' },
    { id: 'pl2', emoji: '🔍', title: 'Competitive Research', description: 'Automate deep-dive research on competitors with AI summarisation.' },
    { id: 'pl3', emoji: '📋', title: 'Insight Mining', description: 'Feed raw consumer data into Claude and surface clean, actionable insights.' },
    { id: 'pl4', emoji: '📣', title: 'Brief Writing', description: 'Generate tighter, clearer briefs faster using AI as a thinking partner.' },
    { id: 'pl5', emoji: '📊', title: 'Category Analysis', description: 'AI-assisted category mapping and whitespace identification.' },
    { id: 'pl6', emoji: '🌐', title: 'Cultural Listening', description: 'Use AI to monitor cultural conversations and surface strategic implications.' },
  ],
  'Finance': [
    { id: 'fi1', emoji: '📊', title: 'Data Analysis Acceleration', description: 'Use AI to run analysis on financial data and surface anomalies faster.' },
    { id: 'fi2', emoji: '📝', title: 'Report Automation', description: 'Generate weekly and monthly finance reports with AI-written narrative.' },
    { id: 'fi3', emoji: '🔮', title: 'Forecasting Assist', description: 'Use AI to model scenarios and pressure-test financial projections.' },
    { id: 'fi4', emoji: '🔍', title: 'Anomaly Detection', description: 'Build AI-assisted monitoring for unusual spend or revenue patterns.' },
    { id: 'fi5', emoji: '💬', title: 'Stakeholder Summaries', description: 'Translate complex financial data into plain-language summaries for leadership.' },
    { id: 'fi6', emoji: '⚡', title: 'Process Automation', description: 'Identify and automate repetitive finance workflows using n8n + AI.' },
  ],
  "Founder's Office": [
    { id: 'fo1', emoji: '📋', title: 'Executive Briefing Bot', description: 'AI-powered daily briefings that save leadership 30 minutes of reading every morning.' },
    { id: 'fo2', emoji: '📊', title: 'Strategy Dashboard', description: 'Build an AI-assisted dashboard that surfaces the metrics that matter.' },
    { id: 'fo3', emoji: '✍️', title: 'Communication at Scale', description: 'Use AI to draft leadership communications, announcements and thought pieces.' },
    { id: 'fo4', emoji: '🔍', title: 'Market Intelligence', description: 'Automated competitive and industry monitoring with AI digest.' },
    { id: 'fo5', emoji: '🗂️', title: 'Meeting Intelligence', description: 'AI-powered meeting transcription, summary and action-item extraction.' },
    { id: 'fo6', emoji: '🤝', title: 'Investor Narrative', description: 'Use AI to research, draft and sharpen investor-facing materials.' },
  ],
  'People & Culture': [
    { id: 'pc1', emoji: '🧲', title: 'AI-Assisted Hiring', description: 'Streamline JD writing, CV screening and interview prep with AI.' },
    { id: 'pc2', emoji: '🎓', title: 'Learning & Development', description: 'Build AI-powered L&D programs that adapt to individual team needs.' },
    { id: 'pc3', emoji: '❤️', title: 'Engagement Surveys', description: 'Use AI to analyse survey results and identify culture health signals.' },
    { id: 'pc4', emoji: '🚀', title: 'Onboarding Automation', description: 'Build a smarter onboarding journey using AI-powered tools.' },
    { id: 'pc5', emoji: '📊', title: 'HR Reporting', description: 'Automate people metrics dashboards and monthly HR reports.' },
    { id: 'pc6', emoji: '💬', title: 'Internal Comms', description: 'Use AI to draft internal announcements, policies and culture docs faster.' },
  ],
  'Corporate Communications': [
    { id: 'corp1', emoji: '📰', title: 'Press Release Drafting', description: 'Use AI to generate first-draft press releases that sound like you wrote them.' },
    { id: 'corp2', emoji: '📡', title: 'Media Monitoring', description: 'Automate brand and industry news monitoring with AI-powered alerts.' },
    { id: 'corp3', emoji: '💬', title: 'Crisis Communication', description: 'Build AI-assisted response frameworks for rapid, on-brand crisis comms.' },
    { id: 'corp4', emoji: '🤝', title: 'Spokesperson Prep', description: 'Use Claude to prepare Q&A briefs and talking point decks for media interactions.' },
    { id: 'corp5', emoji: '📊', title: 'Coverage Reports', description: 'AI-powered media coverage analysis and sentiment reporting.' },
    { id: 'corp6', emoji: '✍️', title: 'Thought Leadership', description: 'Use AI to research, draft and refine bylines and opinion pieces.' },
  ],
  'Partnerships': [
    { id: 'par1', emoji: '🔍', title: 'Partner Discovery', description: 'Use AI to identify and qualify partnership opportunities at speed.' },
    { id: 'par2', emoji: '📝', title: 'Proposal Automation', description: 'Generate custom partnership proposals faster using AI templates.' },
    { id: 'par3', emoji: '📊', title: 'Deal Evaluation', description: 'Use AI to model partnership value and identify red flags early.' },
    { id: 'par4', emoji: '🤝', title: 'Outreach Personalisation', description: 'Craft personalised partnership pitches at scale without losing quality.' },
    { id: 'par5', emoji: '📡', title: 'Industry Monitoring', description: 'AI-powered tracking of partnership activity across your competitive landscape.' },
    { id: 'par6', emoji: '📋', title: 'Contract Summarisation', description: 'Use AI to extract key terms and flags from partnership agreements faster.' },
  ],
  'Management': [
    { id: 'mg1', emoji: '📊', title: 'Team Performance Insights', description: 'Use AI to synthesise team data and surface what needs attention.' },
    { id: 'mg2', emoji: '🗂️', title: 'Meeting Intelligence', description: 'AI transcription, summarisation and action-item tracking for every meeting.' },
    { id: 'mg3', emoji: '📋', title: 'Goal Tracking', description: 'Build AI-assisted OKR dashboards that keep teams focused.' },
    { id: 'mg4', emoji: '✍️', title: 'Communication Assist', description: 'Use AI to draft clear, concise internal and client communications.' },
    { id: 'mg5', emoji: '🚧', title: 'Bottleneck Finder', description: 'Use AI to analyse workflow data and identify where work is getting stuck.' },
    { id: 'mg6', emoji: '🤖', title: 'AI Tool Adoption', description: 'Build a strategy to embed AI tools into your team\'s daily workflows.' },
  ],
  'Admin & Support': [
    { id: 'as1', emoji: '⚡', title: 'Email Automation', description: 'Use AI to draft, sort and respond to routine emails at significantly less effort.' },
    { id: 'as2', emoji: '📅', title: 'Scheduling Intelligence', description: 'Build AI-assisted scheduling workflows that reduce back-and-forth.' },
    { id: 'as3', emoji: '📝', title: 'Document Generation', description: 'Auto-generate reports, letters and internal documents from templates.' },
    { id: 'as4', emoji: '🗂️', title: 'Request Triage', description: 'Use AI to categorise and route support requests faster.' },
    { id: 'as5', emoji: '📊', title: 'Data Entry Automation', description: 'Build AI-powered data capture and entry workflows to eliminate manual effort.' },
    { id: 'as6', emoji: '🔔', title: 'Proactive Reminders', description: 'Set up AI-assisted systems that surface follow-ups and deadlines before they slip.' },
  ],
  'Capital Z': [
    { id: 'cz1', emoji: '📱', title: 'Gen Z Trend Radar', description: 'Build an AI-powered monitor for the cultural signals Gen Z cares about — before they go mainstream.' },
    { id: 'cz2', emoji: '🎨', title: 'AI-Native Content', description: 'Create content formats that are inherently AI-enhanced and Gen Z-coded.' },
    { id: 'cz3', emoji: '🤖', title: 'AI Persona Building', description: 'Design digital personas and AI-native brand characters for Gen Z audiences.' },
    { id: 'cz4', emoji: '🎬', title: 'Short-form AI Video', description: 'Use AI tools to produce Reels, TikToks and Shorts faster and with more creative range.' },
    { id: 'cz5', emoji: '💬', title: 'Community Listening', description: 'Use AI to monitor Gen Z communities and extract strategic cultural insights.' },
    { id: 'cz6', emoji: '🚀', title: 'AI-First Campaign Ideation', description: 'Use generative tools to brainstorm campaign concepts specifically for Gen Z resonance.' },
  ],
  'Web & Tech': [
    { id: 'wt1', emoji: '🤖', title: 'AI Code Assistance', description: 'Use Copilot, Cursor or Claude to ship code faster without the bugs.' },
    { id: 'wt2', emoji: '⚙️', title: 'Workflow Automation', description: 'Build no-code/low-code AI automation pipelines using n8n or Make.' },
    { id: 'wt3', emoji: '🧠', title: 'LLM Integration', description: 'Embed Claude or GPT into internal tools to make them smarter.' },
    { id: 'wt4', emoji: '🔍', title: 'AI Testing', description: 'Use AI to generate test cases and find edge cases you\'d normally miss.' },
    { id: 'wt5', emoji: '📊', title: 'Data Pipeline AI', description: 'Build intelligent data pipelines that surface insights automatically.' },
    { id: 'wt6', emoji: '🚀', title: 'Side Project with AI', description: 'Build something you\'ve been meaning to make — and use AI as your co-founder.' },
  ],
}

// ─── Main Component ────────────────────────────────────────────────────────────

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

// ── Fallback cards for departments not in TEAM_CARDS ──────────────────────────
const FALLBACK_CARDS = [
  { id: 'fb1', emoji: '🧠', title: 'Learn Prompting', description: 'Master the art of talking to AI — the skill that multiplies every other skill you have.' },
  { id: 'fb2', emoji: '⚡', title: 'Automate Something', description: 'Pick one repetitive task and eliminate it with automation this week.' },
  { id: 'fb3', emoji: '🎨', title: 'Create with AI', description: 'Make something visual — AI image, video, or design. Just ship something.' },
  { id: 'fb4', emoji: '📊', title: 'Analyse with AI', description: 'Take a dataset or report and use Claude to extract insights you\'d normally miss.' },
  { id: 'fb5', emoji: '🤝', title: 'Teach Your Team', description: 'Share one AI workflow with a colleague. Teaching is the fastest way to master.' },
  { id: 'fb6', emoji: '🔬', title: 'Run an Experiment', description: 'Try one AI tool you\'ve never used before. Document what surprised you.' },
]

export default function Screen4Roadmap() {
  const router = useRouter()
  const { userId, loading: authLoading } = useOnboardingUser()
  const [finishing, setFinishing] = useState(false)
  const [mode, setMode] = useState<'fixed' | 'build' | 'guide'>('fixed')
  const [guideContent, setGuideContent] = useState<string | null>(null)
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [department, setDepartment] = useState<string | null>(null)

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

  function toggleCard(id: string) {
    setSelectedCards(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleFinish() {
    if (!userId) return
    if (mode === 'build' && selectedCards.size === 0) {
      toast.error('Pick at least one skill card to build your path.')
      return
    }
    setFinishing(true)

    const updatePayload: Record<string, unknown> = {
      onboarding_complete: true,
      roadmap_mode: mode === 'build' ? 'custom' : 'fixed',
      ...(mode === 'build' && { chosen_roadmap_path: [...selectedCards] }),
    }

    const { error } = await supabase.from('users').update(updatePayload).eq('id', userId)
    if (error) { toast.error(`Save failed: ${error.message}`); setFinishing(false); return }

    toast.success("You're in. Welcome to the champs. 🏆")
    router.push('/dashboard')
  }

  const deptCards = department && TEAM_CARDS[department] ? TEAM_CARDS[department] : FALLBACK_CARDS

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
                  <div className={`w-16 flex-shrink-0 bg-gradient-to-b ${w.color} flex flex-col items-center justify-center gap-1 py-5`}
                    style={{ boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.3)' }}
                  >
                    <span className="text-2xl">{w.icon}</span>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      Wk {w.week}
                    </span>
                  </div>
                  {/* Card body */}
                  <div className="flex-1 bg-white/5 border border-white/10 border-l-0 px-5 py-4
                    backdrop-blur-sm"
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

          {/* ── BUILD YOUR OWN — 3D skill card picker ────────────────────── */}
          {mode === 'build' && (
            <motion.div
              key="build"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">
                    {department ? `${department} skills` : 'Skill cards for you'}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Pick the AI skills you want to focus on. Choose at least 1.
                  </p>
                </div>
                {selectedCards.size > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold"
                  >
                    {selectedCards.size} selected
                  </motion.span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3" style={{ perspective: 1000 }}>
                {deptCards.map((card, idx) => {
                  const isSelected = selectedCards.has(card.id)
                  return (
                    <motion.button
                      key={card.id}
                      initial={{ opacity: 0, y: 20, rotateX: 10 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 220, damping: 22 }}
                      whileHover={{ scale: 1.04, rotateY: 3, z: 30, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleCard(card.id)}
                      style={{ transformStyle: 'preserve-3d' }}
                      className={`relative text-left p-4 rounded-2xl border transition-all duration-200
                        ${isSelected
                          ? 'bg-purple-500/20 border-purple-500/60 shadow-lg shadow-purple-900/40'
                          : 'bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/10'
                        }`}
                    >
                      {/* Glow layer when selected */}
                      {isSelected && (
                        <motion.div
                          layoutId={`glow-${card.id}`}
                          className="absolute inset-0 rounded-2xl bg-purple-500/10 blur-sm -z-10"
                        />
                      )}
                      {/* Check badge */}
                      <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                        ${isSelected
                          ? 'bg-purple-500 text-white scale-100'
                          : 'bg-white/10 text-transparent scale-75'
                        }`}
                      >
                        ✓
                      </div>

                      <span className="text-2xl mb-2 block"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(168,85,247,0.6))' : 'none' }}>
                        {card.emoji}
                      </span>
                      <p className={`font-semibold text-sm mb-1 transition-colors ${isSelected ? 'text-purple-200' : 'text-white'}`}>
                        {card.title}
                      </p>
                      <p className="text-slate-500 text-xs leading-relaxed">{card.description}</p>
                    </motion.button>
                  )
                })}
              </div>
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
          disabled={finishing || (mode === 'build' && selectedCards.size === 0)}
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
            : mode === 'build' && selectedCards.size === 0
              ? 'Select at least one skill →'
              : mode === 'build'
                ? `Lock in ${selectedCards.size} skill${selectedCards.size > 1 ? 's' : ''} — Enter Dashboard →`
                : "I'm in — Enter Dashboard →"}
        </motion.button>
      </div>
    </motion.div>
  )
}
