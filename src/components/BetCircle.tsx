import { motion } from 'framer-motion'

interface BetCircleProps {
  bet: number
  occupied?: boolean
  onClick?: () => void
}

export function BetCircle({ bet, occupied = false, onClick }: BetCircleProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative w-20 h-20 rounded-full
        flex items-center justify-center
        transition-shadow duration-300
        ${occupied
          ? 'shadow-nm-inset border border-gold/20'
          : 'shadow-nm border border-gold/10 hover:border-gold/30'
        }
      `}
      whileHover={!occupied ? { scale: 1.05 } : undefined}
      whileTap={!occupied ? { scale: 0.97 } : undefined}
    >
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center
        ${occupied ? 'bg-felt-dark/60' : 'bg-felt-dark/30'}
      `}>
        {bet > 0 ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 shadow-chip
                            flex items-center justify-center
                            border-2 border-amber-300 text-black font-bold text-sm">
              {bet}
            </div>
          </motion.div>
        ) : (
          <span className="text-gold/30 text-xs text-center leading-tight">
            Mise
          </span>
        )}
      </div>
    </motion.button>
  )
}
