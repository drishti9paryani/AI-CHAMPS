export interface TeamCard {
  id: string
  emoji: string
  title: string
  description: string
}

export const TEAM_CARDS: Record<string, TeamCard[]> = {
  'Video': [
    { id: 'v1', emoji: '🎬', title: 'Master Sora', description: 'Generate cinematic video with OpenAI Sora. From prompt to final cut.' },
    { id: 'v2', emoji: '✂️', title: 'AI-Assisted Editing', description: 'Use Descript or Runway to cut, clean and caption videos in a fraction of the time.' },
    { id: 'v3', emoji: '🎙️', title: 'Voice Cloning', description: 'Clone a voice with ElevenLabs and dub content without a recording booth.' },
    { id: 'v4', emoji: '📝', title: 'AI Scriptwriting', description: 'Use Claude to write, punch up or adapt scripts for any format.' },
    { id: 'v5', emoji: '🎭', title: 'AI Storyboarding', description: 'Turn a brief into a full visual storyboard using Midjourney + prompting frameworks.' },
    { id: 'v6', emoji: '🌐', title: 'Multilingual Dubbing', description: 'Automatically translate and dub your videos into multiple languages at scale.' },
  ],
  'Video Production': [
    { id: 'vp1', emoji: '🗓️', title: 'AI Pre-Production', description: 'Use AI to generate call sheets, shot lists and production schedules in minutes.' },
    { id: 'vp2', emoji: '🔤', title: 'Auto Transcription', description: 'Whisper-powered transcription and subtitle generation.' },
    { id: 'vp3', emoji: '✂️', title: 'Rough Cut Automation', description: 'Let AI assemble your first cut based on transcript highlights.' },
    { id: 'vp4', emoji: '🎵', title: 'AI Music & SFX', description: 'Generate original background scores and sound effects with Suno and ElevenLabs.' },
    { id: 'vp5', emoji: '🎨', title: 'AI Color Grading', description: 'Use AI tools to match grades across scenes and apply reference looks automatically.' },
    { id: 'vp6', emoji: '📦', title: 'Asset Organisation', description: 'AI-powered tagging and organisation of raw footage libraries.' },
  ],
  'Design': [
    { id: 'd1', emoji: '🖼️', title: 'Midjourney Mastery', description: 'Go from "generic output" to stunning, on-brand visuals with advanced prompting.' },
    { id: 'd2', emoji: '🎨', title: 'AI Moodboarding', description: 'Generate full client moodboards in 10 minutes, not 2 days.' },
    { id: 'd3', emoji: '✏️', title: 'Concept Ideation at 10x', description: 'Use generative tools to explore 20 directions before settling on one.' },
    { id: 'd4', emoji: '🔄', title: 'Style Transfer', description: "Apply a brand's visual DNA to any AI-generated asset seamlessly." },
    { id: 'd5', emoji: '🏗️', title: 'AI Design Systems', description: 'Build component libraries and design tokens with AI-assisted documentation.' },
    { id: 'd6', emoji: '👤', title: 'AI UX Research', description: 'Synthesize user interviews and generate personas using Claude.' },
  ],
  'Copy & Content': [
    { id: 'cc1', emoji: '📚', title: 'Prompt Library', description: 'Build a team-wide library of battle-tested prompts for every content type you write.' },
    { id: 'cc2', emoji: '🔄', title: 'Content Repurposing', description: 'Turn one long-form piece into 15 formats in one go.' },
    { id: 'cc3', emoji: '🗣️', title: 'Brand Voice Training', description: "Teach an AI your brand's tone so every output sounds like you wrote it." },
    { id: 'cc4', emoji: '📧', title: 'Newsletter Automation', description: 'From research to draft to send — build an AI pipeline for weekly newsletters.' },
    { id: 'cc5', emoji: '🔍', title: 'AI SEO Writing', description: 'Combine keyword strategy with AI drafting for content that ranks and reads well.' },
    { id: 'cc6', emoji: '📊', title: 'Content Analytics', description: 'Use AI to digest performance data and surface actionable content insights.' },
  ],
  'Digital Media': [
    { id: 'dm1', emoji: '📈', title: 'AI Performance Reports', description: 'Automate weekly performance summaries across platforms with AI interpretation.' },
    { id: 'dm2', emoji: '🎯', title: 'Audience Segmentation', description: "Use AI tools to discover micro-audiences you didn't know existed." },
    { id: 'dm3', emoji: '💡', title: 'Creative Testing', description: 'Build AI-assisted systems to test 10 ad variants without 10x the effort.' },
    { id: 'dm4', emoji: '⚠️', title: 'Anomaly Detection', description: 'Catch campaign drops before they become disasters using AI monitoring.' },
    { id: 'dm5', emoji: '💬', title: 'AI Ad Copy', description: 'Generate high-converting copy variations at scale for every placement.' },
    { id: 'dm6', emoji: '🤖', title: 'Automated Bid Strategy', description: 'Use AI-assisted tools to optimise spend allocation in real time.' },
  ],
  'SEO': [
    { id: 'seo1', emoji: '🔍', title: 'AI Keyword Clustering', description: 'Group thousands of keywords by intent in minutes using AI.' },
    { id: 'seo2', emoji: '📝', title: 'Content Brief Generator', description: 'Build detailed briefs with headings, angle and competitor gaps.' },
    { id: 'seo3', emoji: '🏗️', title: 'Technical Audit Automation', description: 'Use AI to interpret crawl data and prioritise fixes by business impact.' },
    { id: 'seo4', emoji: '🔗', title: 'AI Link Building', description: 'Find and qualify link prospects at 5x normal speed.' },
    { id: 'seo5', emoji: '📊', title: 'Rank Tracking Summaries', description: 'Auto-generate weekly ranking updates with AI-written analysis.' },
    { id: 'seo6', emoji: '🌐', title: 'Schema Markup Generator', description: 'Let AI write and validate structured data for every content template.' },
  ],
  'Strategy': [
    { id: 'st1', emoji: '🔭', title: 'Competitive Intelligence', description: 'Automate research on competitors using AI scrapers, summaries and gap analysis.' },
    { id: 'st2', emoji: '🗺️', title: 'Audience Mapping', description: 'Build rich audience personas from research using AI synthesis.' },
    { id: 'st3', emoji: '📋', title: 'Strategy Deck Assist', description: 'Use Claude to stress-test your strategy and sharpen your narrative.' },
    { id: 'st4', emoji: '📰', title: 'Trend Intelligence', description: 'Build an AI-powered trend radar that surfaces signals before they go obvious.' },
    { id: 'st5', emoji: '📣', title: 'Campaign Concepts', description: 'Generate and pressure-test 10 campaign territories from a brief.' },
    { id: 'st6', emoji: '🔄', title: 'Insight Synthesis', description: 'Raw research in, clean strategic narrative out.' },
  ],
  'Influencer Marketing': [
    { id: 'im1', emoji: '🔎', title: 'AI Creator Discovery', description: 'Find creators that actually match a brief, not just high follower counts.' },
    { id: 'im2', emoji: '📊', title: 'ROI Tracking', description: 'AI-assisted influencer performance dashboard without manual pulls.' },
    { id: 'im3', emoji: '📝', title: 'Brief Generation', description: 'Create detailed, on-brand creator briefs using AI in minutes.' },
    { id: 'im4', emoji: '🤝', title: 'Outreach Automation', description: 'Build personalised outreach sequences at scale without sounding like a bot.' },
    { id: 'im5', emoji: '🛡️', title: 'Fake Follower Detection', description: 'Use AI tools to vet creator authenticity before committing budget.' },
    { id: 'im6', emoji: '💬', title: 'Content Repurposing', description: 'Reshare and adapt creator content across owned channels.' },
  ],
  'Business Development': [
    { id: 'bd1', emoji: '🔍', title: 'Lead Research', description: 'Research prospects, surface insights and prioritise outreach using AI.' },
    { id: 'bd2', emoji: '✉️', title: 'Pitch Personalisation', description: 'Generate hyper-personalised pitches at scale.' },
    { id: 'bd3', emoji: '📞', title: 'Meeting Prep', description: 'Brief yourself on any prospect in 5 minutes using AI.' },
    { id: 'bd4', emoji: '📊', title: 'Pipeline Insights', description: 'AI-assisted CRM summaries and deal health monitoring.' },
    { id: 'bd5', emoji: '🤝', title: 'Proposal Generation', description: 'First-draft proposals using AI that you tune, not write from scratch.' },
    { id: 'bd6', emoji: '📰', title: 'Market Scanning', description: 'Automate news and signal monitoring for target industries.' },
  ],
  'Client Servicing - Brands': [
    { id: 'csb1', emoji: '📋', title: 'Status Update Automation', description: 'Generate client-ready status updates from your internal notes using AI.' },
    { id: 'csb2', emoji: '📊', title: 'Report Generation', description: 'Turn raw data into polished monthly reports with AI-written commentary.' },
    { id: 'csb3', emoji: '✍️', title: 'Brief Interpretation', description: 'Use Claude to unpack ambiguous client briefs and write smart clarifying questions.' },
    { id: 'csb4', emoji: '💬', title: 'Response Drafting', description: 'Draft faster client communication without losing your voice.' },
    { id: 'csb5', emoji: '🔍', title: 'Competitive Tracking', description: 'Automate brand monitoring for your clients across channels.' },
    { id: 'csb6', emoji: '🎯', title: 'Campaign Summary Decks', description: 'AI-assisted end-of-campaign presentations with narrative arc built in.' },
  ],
  'Client Servicing - Entertainment': [
    { id: 'cse1', emoji: '🎭', title: 'Concept Development', description: 'Rapidly generate and iterate entertainment campaign concepts from a brief.' },
    { id: 'cse2', emoji: '🎬', title: 'Script Assist', description: 'Draft, punch up and adapt scripts for entertainment assets using Claude.' },
    { id: 'cse3', emoji: '📊', title: 'Audience Insight Reports', description: 'AI-powered audience analysis for entertainment properties and campaigns.' },
    { id: 'cse4', emoji: '🎵', title: 'Content Versioning', description: 'Create format variations of entertainment content for different platforms.' },
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
    { id: 'fi1', emoji: '📊', title: 'Data Analysis', description: 'Use AI to run analysis on financial data and surface anomalies faster.' },
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
    { id: 'corp4', emoji: '🤝', title: 'Spokesperson Prep', description: 'Use Claude to prepare Q&A briefs and talking point decks for media.' },
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
    { id: 'mg6', emoji: '🤖', title: 'AI Tool Adoption', description: "Build a strategy to embed AI tools into your team's daily workflows." },
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
    { id: 'cz1', emoji: '📱', title: 'Gen Z Trend Radar', description: 'Build an AI-powered monitor for cultural signals Gen Z cares about, before they go mainstream.' },
    { id: 'cz2', emoji: '🎨', title: 'AI-Native Content', description: 'Create content formats that are inherently AI-enhanced and Gen Z-coded.' },
    { id: 'cz3', emoji: '🤖', title: 'AI Persona Building', description: 'Design digital personas and AI-native brand characters for Gen Z audiences.' },
    { id: 'cz4', emoji: '🎬', title: 'Short-form AI Video', description: 'Use AI tools to produce Reels, TikToks and Shorts faster and with more creative range.' },
    { id: 'cz5', emoji: '💬', title: 'Community Listening', description: 'Use AI to monitor Gen Z communities and extract strategic cultural insights.' },
    { id: 'cz6', emoji: '🚀', title: 'AI-First Campaign Ideation', description: 'Use generative tools to brainstorm campaign concepts for Gen Z resonance.' },
  ],
  'Web & Tech': [
    { id: 'wt1', emoji: '🤖', title: 'AI Code Assistance', description: 'Use Copilot, Cursor or Claude to ship code faster without the bugs.' },
    { id: 'wt2', emoji: '⚙️', title: 'Workflow Automation', description: 'Build no-code/low-code AI automation pipelines using n8n or Make.' },
    { id: 'wt3', emoji: '🧠', title: 'LLM Integration', description: 'Embed Claude or GPT into internal tools to make them smarter.' },
    { id: 'wt4', emoji: '🔍', title: 'AI Testing', description: "Use AI to generate test cases and find edge cases you'd normally miss." },
    { id: 'wt5', emoji: '📊', title: 'Data Pipeline AI', description: 'Build intelligent data pipelines that surface insights automatically.' },
    { id: 'wt6', emoji: '🚀', title: 'Side Project with AI', description: "Build something you've been meaning to make and use AI as your co-founder." },
  ],
}

export const FALLBACK_CARDS: TeamCard[] = [
  { id: 'fb1', emoji: '🧠', title: 'Learn Prompting', description: 'Master the art of talking to AI — the skill that multiplies every other skill you have.' },
  { id: 'fb2', emoji: '⚡', title: 'Automate Something', description: 'Pick one repetitive task and kill it with automation this week.' },
  { id: 'fb3', emoji: '🎨', title: 'Create with AI', description: 'Make something visual. AI image, video, or design — just ship something.' },
  { id: 'fb4', emoji: '📊', title: 'Analyse with AI', description: 'Take a dataset or report and use Claude to extract insights you would normally miss.' },
  { id: 'fb5', emoji: '🤝', title: 'Teach Your Team', description: 'Share one AI workflow with a colleague. Teaching is the fastest way to master.' },
  { id: 'fb6', emoji: '🔬', title: 'Run an Experiment', description: 'Try one AI tool you have never used before. Document what surprised you.' },
]

// Flat lookup of all cards by ID
export const ALL_CARDS_MAP: Record<string, TeamCard> = Object.values(TEAM_CARDS)
  .flat()
  .concat(FALLBACK_CARDS)
  .reduce((acc, card) => ({ ...acc, [card.id]: card }), {})
