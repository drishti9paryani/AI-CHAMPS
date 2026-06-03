'use client'

interface GradientBadgeProps {
  children: React.ReactNode
  className?: string
}

export default function GradientBadge({ children, className = '' }: GradientBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white
        bg-gradient-to-r from-purple-500 to-blue-500 ${className}`}
    >
      {children}
    </span>
  )
}
