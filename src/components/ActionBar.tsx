import { motion, AnimatePresence } from 'framer-motion'
import { BlackjackAction, GamePhase } from '../domain/models/gameState'
import { ActionButton } from './ActionButton'
import { useGameStore } from '../store/useGameStore'

const ACTIONS: BlackjackAction[] = [
  BlackjackAction.DOUBLE,
  BlackjackAction.HIT,
  BlackjackAction.STAND,
  BlackjackAction.SPLIT,
]

export function ActionBar() {
  const { isHumanTurn, canStartRound, humanPlayerChose, startNewRound, tableState } =
    useGameStore()

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-2">
      <AnimatePresence mode="wait">
        {canStartRound ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={startNewRound}
              className="
                px-12 py-4 rounded-2xl
                bg-gold text-black
                font-casino font-bold text-lg tracking-widest
                shadow-action border border-gold-light
                hover:bg-gold-light active:shadow-action-press
              "
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {tableState.phase === GamePhase.IDLE ? '▶ NOUVELLE PARTIE' : '▶ NOUVELLE MANCHE'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-center gap-3"
          >
            {ACTIONS.map(action => (
              <ActionButton
                key={action}
                action={action}
                disabled={!isHumanTurn}
                onClick={() => humanPlayerChose(action)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
