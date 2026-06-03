import type { Metadata } from 'next'
import Screen4Roadmap from '@/components/onboarding/Screen4Roadmap'

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'Explore the 8-week AI Champs program roadmap.',
}

export default function RoadmapPage() {
  return <Screen4Roadmap />
}
