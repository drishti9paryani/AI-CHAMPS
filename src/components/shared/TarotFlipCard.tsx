'use client'

import { useRef } from 'react'
import { getCardGradient, type TarotCardData } from '@/lib/tarotConstants'

interface TarotFlipCardProps {
  card: TarotCardData | null
  flipped?: boolean
  loading?: boolean
  onFlip?: () => void
  className?: string
  cardRef?: React.RefObject<HTMLDivElement>
}

export default function TarotFlipCard({
  card,
  flipped = true,
  loading = false,
  onFlip,
  className = '',
  cardRef: externalRef,
}: TarotFlipCardProps) {
  const internalRef = useRef<HTMLDivElement>(null)
  const cardRef = externalRef ?? internalRef
  const gradientClass = getCardGradient(card?.title)

  return (
    <div
      className={`flip-card w-full aspect-[2/3] ${onFlip ? 'cursor-pointer' : ''} ${className}`}
      onClick={onFlip && !flipped && !loading ? onFlip : undefined}
      role={onFlip ? 'button' : undefined}
      tabIndex={onFlip ? 0 : undefined}
      onKeyDown={onFlip ? (e) => { if (e.key === 'Enter' || e.key === ' ') onFlip() } : undefined}
    >
      <div className={`flip-card-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}>
        <div className="flip-card-front absolute inset-0">
          <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center border border-white/20`}>
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white/70 text-sm">Consulting the oracle...</p>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-white/60 text-sm">{onFlip ? 'Tap to reveal' : 'Your AI Tarot'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flip-card-back absolute inset-0" ref={cardRef}>
          {card && (
            <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${gradientClass} p-5 border border-white/20 flex flex-col justify-between overflow-y-auto`}>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">AI Tarot</p>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4">{card.description}</p>
              </div>
              <div className="space-y-2">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/50 text-xs">Strength</p>
                  <p className="text-white text-sm font-medium">{card.strength}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/50 text-xs">Growth Area</p>
                  <p className="text-white text-sm font-medium">{card.growth_area}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/50 text-xs">Prediction</p>
                  <p className="text-white text-sm italic">{card.prediction}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
