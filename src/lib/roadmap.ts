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
  { week: 4, title: 'Showcase & Graduation', subtitle: 'Present your work and graduate as an AI Champ', icon: '🎓' },
]
