'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import OnboardingProgress from '@/components/onboarding/OnboardingProgress'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      className="min-h-screen page-bg"
      style={{ perspective: '1400px', perspectiveOrigin: '50% 40%' }}
    >
      <OnboardingProgress />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, rotateY: -18, scale: 0.94, z: -80 }}
          animate={{ opacity: 1, rotateY: 0,  scale: 1,    z: 0   }}
          exit={{    opacity: 0, rotateY:  18, scale: 0.94, z: -80 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'center 40%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
