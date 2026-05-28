import { describe, it, expect } from 'vitest'
import { StrategyMatrix } from '../domain/strategy/strategyMatrix'
import { Hand } from '../domain/models/hand'
import { createCard, Rank, Suit } from '../domain/models/card'
import { BlackjackAction } from '../domain/models/gameState'

const matrix = StrategyMatrix.shared
const c  = (r: Rank, s: Suit = Suit.CLUBS) => createCard(s, r)
const h2 = (r1: Rank, r2: Rank) => {
  const h = new Hand(); h.add(c(r1)); h.add(c(r2)); return h
}

describe('Pair table', () => {
  it('pairs of 8 always split', () => {
    const dealerRanks = [Rank.TWO,Rank.THREE,Rank.FOUR,Rank.FIVE,Rank.SIX,
                         Rank.SEVEN,Rank.EIGHT,Rank.NINE,Rank.TEN,Rank.ACE]
    for (const dr of dealerRanks) {
      const hand = h2(Rank.EIGHT, Rank.EIGHT)
      expect(matrix.getOptimalAction(hand, c(dr))).toBe(BlackjackAction.SPLIT)
    }
  })

  it('pairs of Aces always split', () => {
    const hand = h2(Rank.ACE, Rank.ACE)
    expect(matrix.getOptimalAction(hand, c(Rank.FIVE))).toBe(BlackjackAction.SPLIT)
    expect(matrix.getOptimalAction(hand, c(Rank.TEN))).toBe(BlackjackAction.SPLIT)
  })

  it('pairs of 6 split vs 2-6, hit vs 7+', () => {
    const hand = h2(Rank.SIX, Rank.SIX)
    expect(matrix.getOptimalAction(hand, c(Rank.SIX))).toBe(BlackjackAction.SPLIT)
    expect(matrix.getOptimalAction(hand, c(Rank.SEVEN))).toBe(BlackjackAction.HIT)
  })
})

describe('Hard table', () => {
  it('hard 16 vs 6 → stand', () => {
    expect(matrix.getOptimalAction(h2(Rank.TEN, Rank.SIX), c(Rank.SIX))).toBe(BlackjackAction.STAND)
  })
  it('hard 16 vs 7 → hit', () => {
    expect(matrix.getOptimalAction(h2(Rank.TEN, Rank.SIX), c(Rank.SEVEN))).toBe(BlackjackAction.HIT)
  })
  it('hard 11 vs 10 → double', () => {
    expect(matrix.getOptimalAction(h2(Rank.SIX, Rank.FIVE), c(Rank.TEN))).toBe(BlackjackAction.DOUBLE)
  })
  it('hard 11 vs Ace → hit (European BJ)', () => {
    expect(matrix.getOptimalAction(h2(Rank.SIX, Rank.FIVE), c(Rank.ACE))).toBe(BlackjackAction.HIT)
  })
  it('hard 9 vs 2 → hit (NOT double)', () => {
    expect(matrix.getOptimalAction(h2(Rank.FOUR, Rank.FIVE), c(Rank.TWO))).toBe(BlackjackAction.HIT)
  })
  it('hard 10 vs 5 → double', () => {
    expect(matrix.getOptimalAction(h2(Rank.SIX, Rank.FOUR), c(Rank.FIVE))).toBe(BlackjackAction.DOUBLE)
  })
  it('hard 8 vs 5 → hit', () => {
    expect(matrix.getOptimalAction(h2(Rank.THREE, Rank.FIVE), c(Rank.FIVE))).toBe(BlackjackAction.HIT)
  })
  it('king dealer upcard treated as value 10', () => {
    expect(matrix.getOptimalAction(h2(Rank.TEN, Rank.SIX), c(Rank.KING))).toBe(BlackjackAction.HIT)
  })
})

describe('Soft table', () => {
  it('soft 18 (A+7) vs Ace → hit', () => {
    expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.SEVEN), c(Rank.ACE))).toBe(BlackjackAction.HIT)
  })
  it('soft 18 (A+7) vs 6 → double', () => {
    expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.SEVEN), c(Rank.SIX))).toBe(BlackjackAction.DOUBLE)
  })
  it('soft 19 (A+8) vs any → stand', () => {
    for (const dr of [Rank.TWO, Rank.FIVE, Rank.TEN, Rank.ACE]) {
      expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.EIGHT), c(dr))).toBe(BlackjackAction.STAND)
    }
  })
  it('soft 17 (A+6) vs 2 → hit', () => {
    expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.SIX), c(Rank.TWO))).toBe(BlackjackAction.HIT)
  })
  it('soft 13 (A+2) vs 5 → double', () => {
    expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.TWO), c(Rank.FIVE))).toBe(BlackjackAction.DOUBLE)
  })
  it('soft 13 (A+2) vs 4 → hit (NOT double)', () => {
    expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.TWO), c(Rank.FOUR))).toBe(BlackjackAction.HIT)
  })
})
