import { AnimatePresence } from 'framer-motion'
import { Card } from './Card'
import { ScoreBadge } from './ScoreBadge'
import { Hand } from '../domain/models/hand'

interface HandCardsProps {
  hand: Hand
  handIndex?: number
  hideSecondCard?: boolean
}

export function HandCards({ hand, handIndex = 0, hideSecondCard = false }: HandCardsProps) {
  if (hand.cards.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-1">
      {!hideSecondCard && <ScoreBadge hand={hand} />}
      <div className="flex items-end">
        <AnimatePresence>
          {hand.cards.map((card, i) => {
            const isFaceDown = hideSecondCard && i === 1
            return (
              <div key={card.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                <Card
                  card={card}
                  faceDown={isFaceDown}
                  dealDelay={handIndex * 0.3 + i * 0.15}
                />
              </div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
