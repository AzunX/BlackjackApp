import { describe, it, expect } from 'vitest'
import { HandEvaluator } from '../domain/engine/handEvaluator'
import { Hand } from '../domain/models/hand'
import { createCard, Rank, Suit } from '../domain/models/card'
import { HandOutcome } from '../domain/models/gameState'
import { PerfectPairResult, TwentyOnePlusThreeResult } from '../domain/models/sideBet'

const c = (r: Rank, s: Suit = Suit.SPADES) => createCard(s, r)
function makeHand(...cards: ReturnType<typeof c>[]): Hand {
  const h = new Hand(); cards.forEach(card => h.add(card)); return h
}

describe('Hand outcomes', () => {
  it('player blackjack vs non-BJ dealer → blackjack 1.5x', () => {
    const result = HandEvaluator.outcome(
      makeHand(c(Rank.ACE), c(Rank.KING)),
      makeHand(c(Rank.TEN), c(Rank.SEVEN))
    )
    expect(result.outcome).toBe(HandOutcome.BLACKJACK)
    expect(result.payoutMultiplier).toBe(1.5)
  })

  it('both blackjack → push 0x', () => {
    const result = HandEvaluator.outcome(
      makeHand(c(Rank.ACE), c(Rank.KING)),
      makeHand(c(Rank.ACE), c(Rank.QUEEN))
    )
    expect(result.outcome).toBe(HandOutcome.PUSH)
    expect(result.payoutMultiplier).toBe(0)
  })

  it('player bust → bust -1x', () => {
    const result = HandEvaluator.outcome(
      makeHand(c(Rank.TEN), c(Rank.TEN), c(Rank.FIVE)),
      makeHand(c(Rank.TEN), c(Rank.SEVEN))
    )
    expect(result.outcome).toBe(HandOutcome.BUST)
    expect(result.payoutMultiplier).toBe(-1)
  })

  it('dealer bust → player wins 1x', () => {
    const result = HandEvaluator.outcome(
      makeHand(c(Rank.TEN), c(Rank.EIGHT)),
      makeHand(c(Rank.TEN), c(Rank.TEN), c(Rank.FIVE))
    )
    expect(result.outcome).toBe(HandOutcome.WIN)
    expect(result.payoutMultiplier).toBe(1)
  })

  it('player higher → win 1x', () => {
    const result = HandEvaluator.outcome(
      makeHand(c(Rank.TEN), c(Rank.NINE)),
      makeHand(c(Rank.TEN), c(Rank.SEVEN))
    )
    expect(result.outcome).toBe(HandOutcome.WIN)
  })

  it('dealer higher → loss -1x', () => {
    const result = HandEvaluator.outcome(
      makeHand(c(Rank.TEN), c(Rank.SIX)),
      makeHand(c(Rank.TEN), c(Rank.NINE))
    )
    expect(result.outcome).toBe(HandOutcome.LOSS)
    expect(result.payoutMultiplier).toBe(-1)
  })

  it('equal scores → push 0x', () => {
    const result = HandEvaluator.outcome(
      makeHand(c(Rank.TEN), c(Rank.EIGHT)),
      makeHand(c(Rank.TEN), c(Rank.EIGHT))
    )
    expect(result.outcome).toBe(HandOutcome.PUSH)
    expect(result.payoutMultiplier).toBe(0)
  })
})

describe('Perfect Pairs', () => {
  it('same rank + same suit → perfectPair', () => {
    expect(HandEvaluator.perfectPairResult(c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.HEARTS)))
      .toBe(PerfectPairResult.PERFECT_PAIR)
  })
  it('same rank + same colour → colouredPair', () => {
    expect(HandEvaluator.perfectPairResult(c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.DIAMONDS)))
      .toBe(PerfectPairResult.COLOURED_PAIR)
  })
  it('same rank + different colour → mixedPair', () => {
    expect(HandEvaluator.perfectPairResult(c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.SPADES)))
      .toBe(PerfectPairResult.MIXED_PAIR)
  })
  it('different ranks → none', () => {
    expect(HandEvaluator.perfectPairResult(c(Rank.EIGHT, Suit.HEARTS), c(Rank.SEVEN, Suit.HEARTS)))
      .toBe(PerfectPairResult.NONE)
  })
})

describe('21+3', () => {
  it('same rank + same suit → suitedTrips', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.HEARTS)
    )).toBe(TwentyOnePlusThreeResult.SUITED_TRIPS)
  })
  it('same rank, different suits → threeOfAKind', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.CLUBS), c(Rank.EIGHT, Suit.SPADES)
    )).toBe(TwentyOnePlusThreeResult.THREE_OF_KIND)
  })
  it('sequential + same suit → straightFlush', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.SEVEN, Suit.DIAMONDS), c(Rank.EIGHT, Suit.DIAMONDS), c(Rank.NINE, Suit.DIAMONDS)
    )).toBe(TwentyOnePlusThreeResult.STRAIGHT_FLUSH)
  })
  it('sequential + mixed suits → straight', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.SEVEN, Suit.HEARTS), c(Rank.EIGHT, Suit.CLUBS), c(Rank.NINE, Suit.SPADES)
    )).toBe(TwentyOnePlusThreeResult.STRAIGHT)
  })
  it('same suit, not sequential → flush', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.TWO, Suit.SPADES), c(Rank.FIVE, Suit.SPADES), c(Rank.KING, Suit.SPADES)
    )).toBe(TwentyOnePlusThreeResult.FLUSH)
  })
  it('A-2-3 low straight', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.ACE, Suit.HEARTS), c(Rank.TWO, Suit.CLUBS), c(Rank.THREE, Suit.SPADES)
    )).toBe(TwentyOnePlusThreeResult.STRAIGHT)
  })
  it('Q-K-A high straight', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.QUEEN, Suit.HEARTS), c(Rank.KING, Suit.CLUBS), c(Rank.ACE, Suit.SPADES)
    )).toBe(TwentyOnePlusThreeResult.STRAIGHT)
  })
  it('A-2-3 suited → straightFlush', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.ACE, Suit.CLUBS), c(Rank.TWO, Suit.CLUBS), c(Rank.THREE, Suit.CLUBS)
    )).toBe(TwentyOnePlusThreeResult.STRAIGHT_FLUSH)
  })
  it('no match → none', () => {
    expect(HandEvaluator.twentyOnePlusThreeResult(
      c(Rank.TWO, Suit.HEARTS), c(Rank.SEVEN, Suit.CLUBS), c(Rank.KING, Suit.SPADES)
    )).toBe(TwentyOnePlusThreeResult.NONE)
  })
})

describe('XP calculation', () => {
  it('exact base values', () => {
    expect(HandEvaluator.xpEarned([], HandOutcome.BLACKJACK)).toBe(50)
    expect(HandEvaluator.xpEarned([], HandOutcome.WIN)).toBe(20)
    expect(HandEvaluator.xpEarned([], HandOutcome.PUSH)).toBe(10)
    expect(HandEvaluator.xpEarned([], HandOutcome.LOSS)).toBe(5)
    expect(HandEvaluator.xpEarned([], HandOutcome.BUST)).toBe(2)
  })

  it('8 XP penalty per error, clamped to 0', () => {
    const err = { playerAction: 'Hit' as any, optimalAction: 'Stand' as any,
                  handDescription: 'Hard 16', dealerUpCard: '6♣' }
    expect(HandEvaluator.xpEarned([err], HandOutcome.WIN)).toBe(12)
    expect(HandEvaluator.xpEarned([err, err, err], HandOutcome.WIN)).toBe(0)
  })
})
