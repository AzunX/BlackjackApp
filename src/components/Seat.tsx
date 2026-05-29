import { motion } from 'framer-motion'
import { Player, PlayerType, xpToPlayerRank } from '../domain/models/player'
import { GamePhase } from '../domain/models/gameState'
import { HandCards } from './HandCards'
import { BetCircle } from './BetCircle'
import { SideBetCircles } from './SideBetCircles'

interface SeatProps {
  player: Player
  currentPhase: GamePhase
}

export function Seat({ player, currentPhase }: SeatProps) {
  const isHuman = player.type === PlayerType.HUMAN
  const isActive = currentPhase === GamePhase.PLAYER_TURN && isHuman

  return (
    <motion.div
      className="relative flex flex-col items-center gap-2"
      animate={{ scale: isActive ? 1.04 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cards */}
      <div className="flex gap-2">
        {player.hands.map((hand, hi) => (
          <HandCards
            key={hi}
            hand={hand}
            handIndex={hi}
            hideSecondCard={false}
          />
        ))}
      </div>

      {/* Bet area */}
      <div className="flex flex-col items-center gap-1.5">
        <SideBetCircles ppBet={0} t3Bet={0} />
        <BetCircle bet={player.bet} occupied={player.bet > 0} />
        <div className="text-center">
          <p className={`text-xs font-semibold ${isHuman ? 'text-gold' : 'text-white/50'}`}>
            {isHuman ? player.name : 'Bot'}
          </p>
          {isHuman && (
            <p className="text-[10px] text-gold/60">
              {xpToPlayerRank(player.xp)} · ${player.bankroll.toFixed(0)}
            </p>
          )}
        </div>
      </div>

      {/* Active ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl border border-gold/60 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </motion.div>
  )
}
