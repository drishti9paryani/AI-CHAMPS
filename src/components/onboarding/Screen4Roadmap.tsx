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

const FALLBACK_CARDS = [
  { id: 'fb1', emoji: '🧠', title: 'Learn Prompting', description: 'Master the art of talking to AI — the skill that multiplies every other skill you have.' },
  { id: 'fb2', emoji: '⚡', title: 'Automate Something', description: 'Pick one repetitive task and kill it with automation this week.' },
  { id: 'fb3', emoji: '🎨', title: 'Create with AI', description: 'Make something visual. AI image, video, or design — just ship something.' },
  { id: 'fb4', emoji: '📊', title: 'Analyse with AI', description: 'Take a dataset or report and use Claude to extract insights you\'d normally miss.' },
  { id: 'fb5', emoji: '🤝', title: 'Teach Your Team', description: 'Share one AI workflow with a colleague. Teaching is the fastest way to master.' },
  { id: 'fb6', emoji: '🔬', title: 'Run an Experiment', description: 'Try one AI tool you\'ve never used before. Document what surprised you.' },
]

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Screen4Roadmap() {
  const router = useRouter()
  const { userId, loading: authLoading } = useOnboardingUser()
  const [finishing, setFinishing] = useState(false)
  const [mode, setMode] = useState<'fixed' | 'custom'>('fixed')

  useEffect(() => {
    if (!authLoading && !userId) router.replace('/onboarding/register')
  }, [authLoading, userId, router])

  async function handleFinish() {
    if (!userId) return
    setFinishing(true)

    const updatePayload: Record<string, unknown> = {
      onboarding_complete: true,
      roadmap_mode: mode === 'custom' ? 'fixed' : mode,
    }

    const { error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)

    if (error) {
      toast.error(`Save failed: ${error.message}`)
      console.error('Roadmap save error:', error)
      setFinishing(false)
      return
    }

    toast.success('You\'re in. Welcome to the champs. 🏆')
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
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold gradient-text mb-2 tracking-tight">
            Pick your path. 🗺️
          </h2>
          <p className="text-slate-400 text-sm">
            Follow the WRM roadmap, or build your own. Either way, you're going somewhere interesting.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 p-1.5 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setMode('fixed')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'fixed'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📅 WRM Roadmap — June 2026
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'custom'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📄 Full Guide
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'fixed' ? (
            <motion.div
              key="fixed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 mb-8"
            >
              {JUNE_WEEKS.map((w, idx) => (
                <motion.div
                  key={w.week}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-gradient-to-br ${w.color} shadow-lg`}>
                      {w.icon}
                    </div>
                    {idx < JUNE_WEEKS.length - 1 && (
                      <div className="w-0.5 h-6 mt-1 bg-purple-500/20" />
                    )}
                  </div>
                  <GlassCard className="flex-1 !p-4">
                    <p className="text-purple-400 text-xs uppercase tracking-wider mb-0.5">Week {w.week}</p>
                    <h3 className="font-bold text-white text-sm mb-1">{w.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{w.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mb-8"
            >
              <GlassCard>
                <h3 className="text-white font-bold mb-1">📄 AI Champs — Full Programme Guide</h3>
                <p className="text-slate-400 text-xs mb-5">
                  Everything you need to know about the 4-week programme. Read through, then pick your path above.
                </p>
                <div className="space-y-5">
                  {JUNE_WEEKS.map(w => (
                    <div key={w.week} className="border-l-2 border-purple-500/30 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{w.icon}</span>
                        <p className="text-white text-sm font-bold">Week {w.week} — {w.title}</p>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{w.description}</p>
                    </div>
                  ))}
                  <div className="border-l-2 border-dashed border-slate-700 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">📊</span>
                      <p className="text-slate-500 text-sm font-bold">Admin Dashboard <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-500 border border-slate-700/60 uppercase tracking-wide ml-1">Coming Soon</span></p>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">Automated progress tracking and reporting — so admins can monitor learner progress without manual effort.</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleFinish}
          disabled={finishing}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {finishing ? 'Almost there...' : 'I\'m in — Enter Dashboard →'}
        </button>
      </div>
    </motion.div>
  )
}
