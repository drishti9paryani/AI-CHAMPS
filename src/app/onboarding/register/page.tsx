import type { Metadata } from 'next'
import Screen1Registration from '@/components/onboarding/Screen1Registration'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your AI Champs profile and join the program.',
}

export default function RegisterPage() {
  return <Screen1Registration />
}
