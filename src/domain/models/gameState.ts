import { SideBetResult } from './sideBet'

export enum BlackjackAction {
  HIT    = 'Hit',
  STAND  = 'Stand',
  DOUBLE = 'Double',
  SPLIT  = 'Split',
}

export enum GamePhase {
  IDLE                = 'idle',
  BETTING             = 'betting',
  DEALING             = 'dealing',
  SIDE_BET_EVALUATION = 'sideBetEvaluation',
  PLAYER_TURN         = 'playerTurn',
  BOT_TURN            = 'botTurn',
  DEALER_TURN         = 'dealerTurn',
  EVALUATION          = 'evaluation',
  ROUND_OVER          = 'roundOver',
}

export enum HandOutcome {
  BLACKJACK = 'blackjack',
  WIN       = 'win',
  PUSH      = 'push',
  LOSS      = 'loss',
  BUST      = 'bust',
}

export interface StrategyError {
  readonly playerAction: BlackjackAction
  readonly optimalAction: BlackjackAction
  readonly handDescription: string
  readonly dealerUpCard: string
}

export interface RoundResult {
  readonly playerId: string
  readonly handIndex: number
  readonly outcome: HandOutcome
  readonly netPayout: number
  readonly sideBetResults: SideBetResult[]
  readonly strategyErrors: StrategyError[]
  readonly xpEarned: number
}
