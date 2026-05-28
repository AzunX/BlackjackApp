import { describe, it, expect } from 'vitest'
import {
  Suit, Rank, CardColor,
  rankBjValue, rankShortName, suitColor, cardShortDescription,
  createCard, cardsEqual,
} from '../domain/models/card'

describe('Rank bjValue', () => {
  it('number cards return their face value', () => {
    expect(rankBjValue(Rank.TWO)).toEqual([2])
    expect(rankBjValue(Rank.NINE)).toEqual([9])
  })

  it('ten and face cards return [10]', () => {
    expect(rankBjValue(Rank.TEN)).toEqual([10])
    expect(rankBjValue(Rank.JACK)).toEqual([10])
    expect(rankBjValue(Rank.QUEEN)).toEqual([10])
    expect(rankBjValue(Rank.KING)).toEqual([10])
  })

  it('ace returns [1, 11]', () => {
    expect(rankBjValue(Rank.ACE)).toEqual([1, 11])
  })
})

describe('Card', () => {
  it('each card has a unique id', () => {
    const c1 = createCard(Suit.HEARTS, Rank.ACE)
    const c2 = createCard(Suit.HEARTS, Rank.ACE)
    expect(c1.id).not.toBe(c2.id)
  })

  it('equality ignores id', () => {
    const c1 = createCard(Suit.SPADES, Rank.KING)
    const c2 = createCard(Suit.SPADES, Rank.KING)
    expect(cardsEqual(c1, c2)).toBe(true)
  })

  it('shortDescription formats correctly', () => {
    const card = createCard(Suit.DIAMONDS, Rank.ACE)
    expect(cardShortDescription(card)).toBe('A♦')
  })
})

describe('Suit color', () => {
  it('hearts and diamonds are red', () => {
    expect(suitColor(Suit.HEARTS)).toBe(CardColor.RED)
    expect(suitColor(Suit.DIAMONDS)).toBe(CardColor.RED)
  })

  it('clubs and spades are black', () => {
    expect(suitColor(Suit.CLUBS)).toBe(CardColor.BLACK)
    expect(suitColor(Suit.SPADES)).toBe(CardColor.BLACK)
  })
})
