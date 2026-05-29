import { motion } from 'framer-motion'

interface SideBetCirclesProps {
  ppBet: number
  t3Bet: number
  onPpClick?: () => void
  onT3Click?: () => void
}

function SmallBetCircle({
  label,
  bet,
  onClick,
}: {
  label: string
  bet: number
  onClick?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        w-10 h-10 rounded-full flex items-center justify-center
        text-[10px] font-semibold tracking-wide
        transition-all duration-200
        ${bet > 0
          ? 'shadow-nm-inset text-gold border border-gold/40'
          : 'shadow-nm-flat text-gold/40 border border-gold/10 hover:text-gold/70'
        }
      `}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
    >
      {bet > 0 ? bet : label}
    </motion.button>
  )
}

export function SideBetCircles({ ppBet, t3Bet, onPpClick, onT3Click }: SideBetCirclesProps) {
  return (
    <div className="flex gap-2">
      <SmallBetCircle label="PP"   bet={ppBet} onClick={onPpClick} />
      <SmallBetCircle label="21+3" bet={t3Bet} onClick={onT3Click} />
    </div>
  )
}
