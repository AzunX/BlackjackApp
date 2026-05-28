import { describe, it, expect } from 'vitest'
import { Hand } from '../domain/models/hand'
import { createCard, Rank, Suit } from '../domain/models/card'

const c = (rank: Rank, suit: Suit = Suit.SPADES) => createCard(suit, rank)

describe('Hand scoring', () => {
  it('empty hand scores 0', () => {
    const h = new Hand()
    expect(h.bestScore).toBe(0)
    expect(h.isBust).toBe(false)
  })

  it('hard hand with no ace', () => {
    const h = new Hand()
    h.add(c(Rank.TEN)); h.add(c(Rank.SIX))
    expect(h.bestScore).toBe(16)
    expect(h.isSoft).toBe(false)
  })

  it('soft hand — ace counts as 11', () => {
    const h = new Hand()
    h.add(c(Rank.ACE)); h.add(c(Rank.SIX))
    expect(h.bestScore).toBe(17)
    expect(h.isSoft).toBe(true)
  })

  it('ace downgrades to 1 when bust otherwise', () => {
    const h = new Hand()
    h.add(c(Rank.ACE)); h.add(c(Rank.TEN)); h.add(c(Rank.FIVE))
    expect(h.bestScore).toBe(16)
    expect(h.isBust).toBe(false)
    expect(h.isSoft).toBe(false)
  })

  it('two aces: one counts 11, one counts 1', () => {
    const h = new Hand()
    h.add(c(Rank.ACE)); h.add(c(Rank.ACE))
    expect(h.bestScore).toBe(12)
    expect(h.isSoft).toBe(true)
  })

  it('three aces: soft 13', () => {
    const h = new Hand()
    h.add(c(Rank.ACE)); h.add(c(Rank.ACE)); h.add(c(Rank.ACE))
    expect(h.bestScore).toBe(13)
    expect(h.isSoft).toBe(true)
  })

  it('all bust — returns lowest total', () => {
    const h = new Hand()
    h.add(c(Rank.KING)); h.add(c(Rank.KING)); h.add(c(Rank.KING))
    expect(h.bestScore).toBe(30)
    expect(h.isBust).toBe(true)
  })

  it('hardTotal always treats ace as 1', () => {
    const h = new Hand()
    h.add(c(Rank.ACE)); h.add(c(Rank.TEN)); h.add(c(Rank.FIVE))
    expect(h.hardTotal).toBe(16)
  })
})

describe('Hand detection', () => {
  it('blackjack: 2 cards totalling 21', () => {
    const h = new Hand()
    h.add(c(Rank.ACE)); h.add(c(Rank.KING))
    expect(h.isBlackjack).toBe(true)
    expect(h.bestScore).toBe(21)
  })

  it('21 with 3 cards is NOT blackjack', () => {
    const h = new Hand()
    h.add(c(Rank.SEVEN)); h.add(c(Rank.SEVEN)); h.add(c(Rank.SEVEN))
    expect(h.isBlackjack).toBe(false)
    expect(h.bestScore).toBe(21)
  })

  it('bust', () => {
    const h = new Hand()
    h.add(c(Rank.TEN)); h.add(c(Rank.TEN)); h.add(c(Rank.FIVE))
    expect(h.isBust).toBe(true)
  })

  it('isPair when same rank', () => {
    const h = new Hand()
    h.add(c(Rank.EIGHT, Suit.HEARTS))
    h.add(c(Rank.EIGHT, Suit.CLUBS))
    expect(h.isPair).toBe(true)
  })
})
