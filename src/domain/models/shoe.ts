import { Card, ALL_SUITS, ALL_RANKS, createCard } from './card'

export class Shoe {
  static readonly DECK_COUNT    = 6
  static readonly RESHUFFLE_PCT = 0.75
  static readonly TOTAL_CARDS   = Shoe.DECK_COUNT * 52  // 312

  private cards: Card[] = []

  constructor() { this.cards = Shoe.buildAndShuffle() }

  get remainingCount(): number { return this.cards.length }

  get penetration(): number {
    return 1 - this.cards.length / Shoe.TOTAL_CARDS
  }

  // Reshuffles automatically when penetration >= 75%, then deals one card.
  deal(): Card {
    if (this.penetration >= Shoe.RESHUFFLE_PCT) {
      this.cards = Shoe.buildAndShuffle()
    }
    const card = this.cards.pop()
    if (!card) throw new Error('Shoe is empty')
    return card
  }

  reshuffle(): void { this.cards = Shoe.buildAndShuffle() }

  private static buildAndShuffle(): Card[] {
    const deck: Card[] = []
    for (let d = 0; d < Shoe.DECK_COUNT; d++) {
      for (const suit of ALL_SUITS) {
        for (const rank of ALL_RANKS) {
          deck.push(createCard(suit, rank))
        }
      }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j]!, deck[i]!]
    }
    return deck
  }
}
