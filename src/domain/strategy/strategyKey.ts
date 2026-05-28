import { Rank, rankBjValue } from '../models/card'
import { Hand } from '../models/hand'
import { Card } from '../models/card'

export type StrategyKey =
  | { type: 'pair';  playerRank: Rank;  dealerValue: number }
  | { type: 'soft';  total: number;     dealerValue: number }
  | { type: 'hard';  total: number;     dealerValue: number }

// Stable string key for Map<string, BlackjackAction> lookup
export function strategyKeyToString(key: StrategyKey): string {
  switch (key.type) {
    case 'pair': return `pair|${key.playerRank}|${key.dealerValue}`
    case 'soft': return `soft|${key.total}|${key.dealerValue}`
    case 'hard': return `hard|${key.total}|${key.dealerValue}`
  }
}

// Priority: pair > soft > hard (pair of Aces is isPair AND isSoft — pair wins)
export function strategyKeyFromHand(hand: Hand, dealerUpCard: Card): StrategyKey {
  const dealerValue = Math.max(...rankBjValue(dealerUpCard.rank))
  if (hand.isPair) {
    return { type: 'pair', playerRank: hand.cards[0]!.rank, dealerValue }
  }
  if (hand.isSoft) {
    return { type: 'soft', total: hand.bestScore, dealerValue }
  }
  return { type: 'hard', total: hand.hardTotal, dealerValue }
}
