import { motion } from 'framer-motion'
import { BlackjackAction } from '../domain/models/gameState'

interface ActionButtonConfig {
  label: string
  icon: string
  color: string
  hoverColor: string
  borderColor: string
}

const CONFIG: Record<BlackjackAction, ActionButtonConfig> = {
  [BlackjackAction.DOUBLE]: {
    label: 'DOUBLE', icon: '2×',
    color: 'bg-orange-600', hoverColor: 'hover:bg-orange-500', borderColor: 'border-orange-400',
  },
  [BlackjackAction.HIT]: {
    label: 'HIT', icon: '+',
    color: 'bg-emerald-600', hoverColor: 'hover:bg-emerald-500', borderColor: 'border-emerald-400',
  },
  [BlackjackAction.STAND]: {
    label: 'STAND', icon: '−',
    color: 'bg-red-700', hoverColor: 'hover:bg-red-600', borderColor: 'border-red-500',
  },
  [BlackjackAction.SPLIT]: {
    label: 'SPLIT', icon: '⟨⟩',
    color: 'bg-blue-700', hoverColor: 'hover:bg-blue-600', borderColor: 'border-blue-500',
  },
}

interface ActionButtonProps {
  action: BlackjackAction
  disabled: boolean
  onClick: () => void
}

export function ActionButton({ action, disabled, onClick }: ActionButtonProps) {
  const cfg = CONFIG[action]

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center
        w-20 h-16 rounded-2xl border font-casino font-bold
        transition-all duration-200 select-none
        ${cfg.color} ${cfg.hoverColor} ${cfg.borderColor}
        ${disabled
          ? 'opacity-35 cursor-not-allowed grayscale'
          : 'shadow-action cursor-pointer active:shadow-action-press'
        }
      `}
      whileHover={!disabled ? { y: -2, scale: 1.04 } : undefined}
      whileTap={!disabled ? { y: 1, scale: 0.96 } : undefined}
    >
      <span className="text-xl leading-none text-white font-bold">{cfg.icon}</span>
      <span className="text-[10px] tracking-widest text-white/90 mt-0.5">{cfg.label}</span>
      {!disabled && (
        <motion.div
          className={`absolute inset-0 rounded-2xl border ${cfg.borderColor} pointer-events-none`}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0.4, 0], scale: [1, 1.1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  )
}
