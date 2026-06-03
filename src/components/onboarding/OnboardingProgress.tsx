'use client'

import { usePathname } from 'next/navigation'

const STEPS = [
  { path: '/onboarding/register', step: 1 },
  { path: '/onboarding/tarot', step: 2 },
  { path: '/onboarding/form', step: 3 },
  { path: '/onboarding/roadmap', step: 4 },
]

export default function OnboardingProgress() {
  const pathname = usePathname()
  const current = STEPS.find(s => pathname.startsWith(s.path))?.step ?? 1

  return (
    <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 px-4">
      {STEPS.map(({ step }) => (
        <div
          key={step}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            step === current
              ? 'w-8 bg-purple-500'
              : step < current
                ? 'w-3 bg-purple-500/50'
                : 'w-3 bg-white/20'
          }`}
        />
      ))}
    </div>
  )
}
