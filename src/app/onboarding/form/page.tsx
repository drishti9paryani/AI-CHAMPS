import type { Metadata } from 'next'
import Screen3Form from '@/components/onboarding/Screen3Form'

export const metadata: Metadata = {
  title: 'Champ Form',
  description: 'Tell us about your AI journey, challenges, and support needs.',
}

export default function FormPage() {
  return <Screen3Form />
}
