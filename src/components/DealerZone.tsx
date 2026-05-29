import { motion, AnimatePresence } from 'framer-motion'
import { Player } from '../domain/models/player'
import { GamePhase } from '../domain/models/gameState'
import { HandCards } from './HandCards'

interface DealerZoneProps {
  dealer: Player
  phase: GamePhase
}

function phaseLabel(phase: GamePhase): string {
  switch (phase) {
    case GamePhase.IDLE:                return 'Prêt à jouer'
    case GamePhase.BETTING:             return 'Les mises sont ouvertes...'
    case GamePhase.DEALING:             return 'Distribution en cours...'
    case GamePhase.SIDE_BET_EVALUATION: return 'Vérification des side bets...'
    case GamePhase.PLAYER_TURN:         return 'À votre tour'
    case GamePhase.BOT_TURN:            return 'Les bots jouent...'
    case GamePhase.DEALER_TURN:         return 'Le croupier joue...'
    case GamePhase.EVALUATION:          return 'Calcul des gains...'
    case GamePhase.ROUND_OVER:          return 'Manche terminée'
    default:                            return ''
  }
}

export function DealerZone({ dealer, phase }: DealerZoneProps) {
  const hideHoleCard =
    phase !== GamePhase.DEALER_TURN &&
    phase !== GamePhase.EVALUATION &&
    phase !== GamePhase.ROUND_OVER

  const dealerHand = dealer.hands[0]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative">
        <div className="
          w-16 h-16 rounded-full
          bg-felt-dark border-2 border-gold/40
          shadow-nm flex items-center justify-center
        ">
          <span className="text-2xl">🎰</span>
        </div>
        <AnimatePresence>
          {phase === GamePhase.DEALER_TURN && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-gold"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.25 }}
          className="text-xs text-gold/80 font-casino tracking-wider text-center"
        >
          {phaseLabel(phase)}
        </motion.p>
      </AnimatePresence>

      {/* Dealer cards */}
      {dealerHand && dealerHand.cards.length > 0 && (
        <HandCards
          hand={dealerHand}
          handIndex={0}
          hideSecondCard={hideHoleCard}
        />
      )}
    </div>
  )
}
