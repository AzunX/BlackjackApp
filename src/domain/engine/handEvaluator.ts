import { Hand } from '../models/hand'
import { Card, suitColor } from '../models/card'
import { HandOutcome, StrategyError } from '../models/gameState'
import { PerfectPairResult, TwentyOnePlusThreeResult } from '../models/sideBet'

export interface EvaluationResult {
  readonly outcome: HandOutcome
  readonly payoutMultiplier: number  // 1.5=BJ, 1=win, 0=push, -1=loss/bust
}

export const HandEvaluator = {
  outcome(player: Hand, dealer: Hand): EvaluationResult {
    if (player.isBust)
      return { outcome: HandOutcome.BUST, payoutMultiplier: -1 }
    if (player.isBlackjack && dealer.isBlackjack)
      return { outcome: HandOutcome.PUSH, payoutMultiplier: 0 }
    if (player.isBlackjack)
      return { outcome: HandOutcome.BLACKJACK, payoutMultiplier: 1.5 }
    if (dealer.isBlackjack)
      return { outcome: HandOutcome.LOSS, payoutMultiplier: -1 }
    if (dealer.isBust)
      return { outcome: HandOutcome.WIN, payoutMultiplier: 1 }
    const ps = player.bestScore, ds = dealer.bestScore
    if (ps > ds) return { outcome: HandOutcome.WIN,  payoutMultiplier:  1 }
    if (ps < ds) return { outcome: HandOutcome.LOSS, payoutMultiplier: -1 }
    return { outcome: HandOutcome.PUSH, payoutMultiplier: 0 }
  },

  perfectPairResult(card1: Card, card2: Card): PerfectPairResult {
    if (card1.rank !== card2.rank) return PerfectPairResult.NONE
    if (card1.suit === card2.suit)                           return PerfectPairResult.PERFECT_PAIR
    if (suitColor(card1.suit) === suitColor(card2.suit))     return PerfectPairResult.COLOURED_PAIR
    return PerfectPairResult.MIXED_PAIR
  },

  twentyOnePlusThreeResult(p1: Card, p2: Card, dealer: Card): TwentyOnePlusThreeResult {
    const cards  = [p1, p2, dealer]
    const suits  = cards.map(c => c.suit)
    const values = cards.map(c => c.rank as number).sort((a, b) => a - b)

    const allSameSuit = new Set(suits).size === 1
    const allSameRank = new Set(values).size === 1
    const isSequential =
      (values[2]! - values[1]! === 1 && values[1]! - values[0]! === 1) ||
      // Ace-low: ACE.rawValue=14 sorts last, so A-2-3 becomes [2, 3, 14]
      (values[0] === 2 && values[1] === 3 && values[2] === 14)

    if (allSameRank && allSameSuit) return TwentyOnePlusThreeResult.SUITED_TRIPS
    if (allSameRank)                return TwentyOnePlusThreeResult.THREE_OF_KIND
    if (isSequential && allSameSuit) return TwentyOnePlusThreeResult.STRAIGHT_FLUSH
    if (isSequential)               return TwentyOnePlusThreeResult.STRAIGHT
    if (allSameSuit)                return TwentyOnePlusThreeResult.FLUSH
    return TwentyOnePlusThreeResult.NONE
  },

  xpEarned(errors: StrategyError[], outcome: HandOutcome): number {
    const base: Record<HandOutcome, number> = {
      [HandOutcome.BLACKJACK]: 50,
      [HandOutcome.WIN]:       20,
      [HandOutcome.PUSH]:      10,
      [HandOutcome.LOSS]:       5,
      [HandOutcome.BUST]:       2,
    }
    return Math.max(0, base[outcome] - errors.length * 8)
  },
}
