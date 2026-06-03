import type { Metadata } from 'next'
import Screen2Tarot from '@/components/onboarding/Screen2Tarot'

export const metadata: Metadata = {
  title: 'Your Tarot Card',
  description: 'Discover your AI personality tarot card.',
}

export default function TarotPage() {
  return <Screen2Tarot />
}
