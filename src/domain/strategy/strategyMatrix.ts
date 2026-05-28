import { Hand } from '../models/hand'
import { Card } from '../models/card'
import { BlackjackAction } from '../models/gameState'
import { strategyKeyFromHand, strategyKeyToString } from './strategyKey'
import { buildStrategyTable, StrategyTable } from '../../data/basicStrategyData'

export class StrategyMatrix {
  private static _shared: StrategyMatrix | null = null
  private readonly table: StrategyTable

  private constructor() {
    this.table = buildStrategyTable()
  }

  static get shared(): StrategyMatrix {
    if (!StrategyMatrix._shared) {
      StrategyMatrix._shared = new StrategyMatrix()
    }
    return StrategyMatrix._shared
  }

  getOptimalAction(hand: Hand, dealerUpCard: Card): BlackjackAction {
    if (hand.isBust || hand.isBlackjack) return BlackjackAction.STAND

    const key = strategyKeyFromHand(hand, dealerUpCard)
    const keyStr = strategyKeyToString(key)
    return this.table.get(keyStr) ?? (hand.hardTotal >= 17 ? BlackjackAction.STAND : BlackjackAction.HIT)
  }
}
