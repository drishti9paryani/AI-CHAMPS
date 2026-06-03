'use client'

import GlassCard from '@/components/ui/GlassCard'

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
}

export default function RouteError({ error, reset, title = 'Something went wrong' }: RouteErrorProps) {
  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #0d0d1a 60%)' }}
    >
      <GlassCard className="max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-slate-400 text-sm mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition"
        >
          Try again
        </button>
      </GlassCard>
    </div>
  )
}
