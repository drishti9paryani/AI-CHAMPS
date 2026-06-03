'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import TarotFlipCard from '@/components/shared/TarotFlipCard'
import GlassCard from '@/components/ui/GlassCard'
import EmptyState from '@/components/ui/EmptyState'
import type { TarotCardData } from '@/lib/tarotConstants'

interface TarotSectionProps {
  card: TarotCardData | null
  cardType?: string | null
}

export default function TarotSection({ card, cardType }: TarotSectionProps) {
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (card) {
      const timer = setTimeout(() => setFlipped(true), 400)
      return () => clearTimeout(timer)
    }
  }, [card])

  async function downloadCard() {
    if (!cardRef.current || !card) return
    const { default: html2canvas } = await import('html2canvas')

    // Clone the card back face into an off-screen element with no CSS transform
    const clone = cardRef.current.cloneNode(true) as HTMLElement
    clone.style.position = 'fixed'
    clone.style.top = '-9999px'
    clone.style.left = '-9999px'
    clone.style.transform = 'none'
    clone.style.width = '280px'
    clone.style.height = '420px'
    clone.style.borderRadius = '16px'
    clone.style.overflow = 'hidden'
    document.body.appendChild(clone)

    const canvas = await html2canvas(clone, { backgroundColor: null, scale: 2, useCORS: true })
    document.body.removeChild(clone)

    const link = document.createElement('a')
    link.download = `ai-archetype-${card.title.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!card) {
    return (
      <motion.div id="tarot" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <EmptyState
          icon="✨"
          title="No tarot card yet"
          description="Complete the onboarding tarot step to reveal your AI personality archetype."
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      id="tarot"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <GlassCard>
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-48 flex-shrink-0 mx-auto md:mx-0">
            <TarotFlipCard card={card} flipped={flipped} cardRef={cardRef} />
          </div>
          <div className="flex-1">
            <p className="text-purple-400 text-xs uppercase tracking-widest mb-1">Your AI Archetype</p>
            <h3 className="text-2xl font-bold text-white mb-2">{cardType || card.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">{card.description}</p>
            <button
              onClick={downloadCard}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white border border-white/20 hover:bg-white/10 transition"
            >
              Download Card
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
