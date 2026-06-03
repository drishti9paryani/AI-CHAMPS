'use client'

import OnboardingProgress from '@/components/onboarding/OnboardingProgress'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #0d0d1a 60%)' }}
    >
      <OnboardingProgress />
      {children}
    </div>
  )
}
