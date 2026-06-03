export interface RoadmapWeek {
  week: number
  title: string
  subtitle: string
  icon: string
  tools?: string[]
}

export const ROADMAP_WEEKS: RoadmapWeek[] = [
  { week: 1, title: 'AI Landscape & Tool Discovery', subtitle: 'Explore the AI ecosystem and find your tools', icon: '🌐' },
  { week: 2, title: 'Workflow Design & Automation Thinking', subtitle: 'Map processes and identify automation opportunities', icon: '⚙️' },
  { week: 3, title: 'Content Creation with AI', subtitle: 'Write, design, and produce with AI assistance', icon: '✍️' },
  { week: 4, title: 'AI Video Production', subtitle: 'Create compelling video content using AI', icon: '🎬' },
  { week: 5, title: 'AI Agents & Assistants', subtitle: 'Build and deploy intelligent agents', icon: '🤖' },
  { week: 6, title: 'Department-Specific Use Cases', subtitle: 'Apply AI to your team\'s unique challenges', icon: '🏢' },
  { week: 7, title: 'Building Internal Systems', subtitle: 'Integrate AI into internal workflows', icon: '🔧' },
  { week: 8, title: 'Showcase & Graduation', subtitle: 'Present your work and graduate as an AI Champ', icon: '🎓' },
]
