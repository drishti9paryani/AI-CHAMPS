'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const STEPS = [
  { path: '/onboarding/register', label: 'You'      },
  { path: '/onboarding/tarot',    label: 'Archetype' },
  { path: '/onboarding/form',     label: 'Check-in'  },
  { path: '/onboarding/roadmap',  label: 'Path'      },
]

export default function OnboardingProgress() {
  const pathname = usePathname()
  const currentIdx = STEPS.findIndex(s => pathname.startsWith(s.path))
  const current = currentIdx === -1 ? 0 : currentIdx

  return (
    <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0 px-4">
      {STEPS.map((s, i) => {
        const done    = i < current
        const active  = i === current
        const future  = i > current

        return (
          <div key={s.path} className="flex items-center">
            {/* Connector line before each step except first */}
            {i > 0 && (
              <div className="relative w-8 sm:w-12 h-0.5 mx-0 overflow-hidden bg-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}

            {/* Step dot */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  scale: active ? 1.25 : 1,
                  boxShadow: active ? '0 0 12px rgba(168,85,247,0.8)' : 'none',
                }}
                transition={{ duration: 0.3 }}
                className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${
                  done   ? 'bg-purple-500 border-purple-500' :
                  active ? 'bg-purple-400 border-purple-400' :
                           'bg-transparent border-white/25'
                }`}
              >
                {done && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full rounded-full bg-purple-500"
                  />
                )}
              </motion.div>
              <span className={`text-[9px] font-medium whitespace-nowrap hidden sm:block transition-colors duration-300 ${
                active ? 'text-purple-300' : done ? 'text-purple-500' : 'text-white/25'
              }`}>
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
