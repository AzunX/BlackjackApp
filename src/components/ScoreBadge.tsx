import { motion, AnimatePresence } from 'framer-motion'
import { Hand } from '../domain/models/hand'

interface ScoreBadgeProps {
  hand: Hand
}

export function ScoreBadge({ hand }: ScoreBadgeProps) {
  if (hand.cards.length === 0) return null

  let label: string
  let colorClass: string

  if (hand.isBlackjack) {
    label = 'BJ'
    colorClass = 'bg-gold text-black border-gold-dark'
  } else if (hand.isBust) {
    label = 'Bust'
    colorClass = 'bg-red-700 text-white border-red-900'
  } else if (hand.isSoft) {
    label = `Soft ${hand.bestScore}`
    colorClass = 'bg-gray-800/90 text-amber-300 border-amber-700/50'
  } else {
    label = String(hand.bestScore)
    colorClass = 'bg-gray-900/90 text-white border-gray-600/50'
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={label}
        initial={{ opacity: 0, scale: 0.7, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.7, y: -4 }}
        transition={{ duration: 0.2 }}
        className={`
          inline-flex items-center justify-center
          px-2 py-0.5 rounded-full border
          text-xs font-bold tracking-wide
          shadow-nm-flat
          ${colorClass}
        `}
      >
        {label}
      </motion.div>
    </AnimatePresence>
  )
}
