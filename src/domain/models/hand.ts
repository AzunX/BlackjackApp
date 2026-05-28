import { Card, Rank, rankBjValue } from './card'

export class Hand {
  private _cards: Card[] = []

  get cards(): readonly Card[] { return this._cards }

  add(card: Card): void { this._cards.push(card) }
  clear(): void { this._cards = [] }

  // Generates every possible score combination for all Ace variants via reduce+flatMap
  private get allScores(): number[] {
    return this._cards.reduce<number[]>((totals, card) => {
      const values = rankBjValue(card.rank)
      return values.flatMap(v => totals.map(t => t + v))
    }, [0])
  }

  get bestScore(): number {
    const valid = this.allScores.filter(s => s <= 21)
    if (valid.length > 0) return Math.max(...valid)
    const all = this.allScores
    return all.length > 0 ? Math.min(...all) : 0
  }

  // Hard total: every Ace counts as 1
  get hardTotal(): number {
    return this._cards.reduce((sum, card) => {
      return sum + (card.rank === Rank.ACE ? 1 : rankBjValue(card.rank)[0])
    }, 0)
  }

  get isSoft(): boolean {
    if (!this._cards.some(c => c.rank === Rank.ACE)) return false
    return this.bestScore <= 21 && this.bestScore !== this.hardTotal
  }

  get isBust(): boolean { return this.bestScore > 21 }

  get isBlackjack(): boolean {
    return this._cards.length === 2 && this.bestScore === 21
  }

  get isPair(): boolean {
    return this._cards.length === 2 && this._cards[0]!.rank === this._cards[1]!.rank
  }

  get isTerminal(): boolean { return this.isBust || this.bestScore === 21 }
}
