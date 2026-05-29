import { motion } from 'framer-motion'
import { Card as CardModel, CardColor, rankShortName, suitColor } from '../domain/models/card'

interface CardProps {
  card: CardModel
  faceDown?: boolean
  dealDelay?: number
  from?: { x: number; y: number }
}

const DEFAULT_FROM = { x: 320, y: -220 }

export function Card({
  card,
  faceDown = false,
  dealDelay = 0,
  from = DEFAULT_FROM,
}: CardProps) {
  const isRed = suitColor(card.suit) === CardColor.RED
  const tilt = ((parseInt(card.id.slice(0, 4), 16) % 700) - 350) / 100

  return (
    <motion.div
      key={card.id}
      className="relative"
      style={{ width: 56, height: 80, transformStyle: 'preserve-3d' }}
      initial={{ x: from.x, y: from.y, opacity: 0, scale: 0.6, rotate: 0 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: tilt }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 28,
        delay: dealDelay,
      }}
    >
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: faceDown ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Face */}
        <div
          className="card-face absolute inset-0 flex flex-col p-1 select-none"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`flex flex-col items-start leading-none ${isRed ? 'text-card-red' : 'text-card-black'}`}>
            <span className="text-base font-bold">{rankShortName(card.rank)}</span>
            <span className="text-xs">{card.suit}</span>
          </div>
          <div className={`flex-1 flex items-center justify-center text-2xl ${isRed ? 'text-card-red' : 'text-card-black'}`}>
            {card.suit}
          </div>
          <div className={`flex flex-col items-end leading-none rotate-180 ${isRed ? 'text-card-red' : 'text-card-black'}`}>
            <span className="text-base font-bold">{rankShortName(card.rank)}</span>
            <span className="text-xs">{card.suit}</span>
          </div>
        </div>

        {/* Back */}
        <div
          className="card-back absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-10 h-14 border border-blue-400/40 rounded-sm" />
        </div>
      </motion.div>
    </motion.div>
  )
}
