import { v4 as uuidv4 } from 'uuid'

export enum Suit {
  HEARTS   = '♥',
  DIAMONDS = '♦',
  CLUBS    = '♣',
  SPADES   = '♠',
}

export enum CardColor { RED = 'red', BLACK = 'black' }

export enum Rank {
  TWO = 2, THREE = 3, FOUR = 4, FIVE = 5, SIX = 6,
  SEVEN = 7, EIGHT = 8, NINE = 9, TEN = 10,
  JACK = 11, QUEEN = 12, KING = 13, ACE = 14,
}

export interface Card {
  readonly id: string
  readonly suit: Suit
  readonly rank: Rank
}

export const ALL_SUITS: Suit[] = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
export const ALL_RANKS: Rank[] = [
  Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX,
  Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
  Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE,
]

export function rankBjValue(rank: Rank): number[] {
  if (rank === Rank.ACE) return [1, 11]
  if (rank >= Rank.TEN) return [10]
  return [rank as number]
}

export function rankShortName(rank: Rank): string {
  switch (rank) {
    case Rank.ACE:   return 'A'
    case Rank.KING:  return 'K'
    case Rank.QUEEN: return 'Q'
    case Rank.JACK:  return 'J'
    default:         return String(rank as number)
  }
}

export function suitColor(suit: Suit): CardColor {
  return suit === Suit.HEARTS || suit === Suit.DIAMONDS
    ? CardColor.RED
    : CardColor.BLACK
}

export function createCard(suit: Suit, rank: Rank): Card {
  return { id: uuidv4(), suit, rank }
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank
}

export function cardShortDescription(card: Card): string {
  return `${rankShortName(card.rank)}${card.suit}`
}
