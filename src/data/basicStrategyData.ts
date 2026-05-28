import { Rank } from '../domain/models/card'
import { BlackjackAction } from '../domain/models/gameState'
import { StrategyKey, strategyKeyToString } from '../domain/strategy/strategyKey'

export type StrategyTable = Map<string, BlackjackAction>

function buildPairTable(): StrategyTable {
  const t = new Map<string, BlackjackAction>()
  const set = (r: Rank, d: number, a: BlackjackAction) =>
    t.set(strategyKeyToString({ type: 'pair', playerRank: r, dealerValue: d }), a)

  // Aces — always split
  for (let d = 2; d <= 11; d++) set(Rank.ACE, d, BlackjackAction.SPLIT)
  // 2s & 3s — split vs 2-7, hit otherwise
  for (const r of [Rank.TWO, Rank.THREE]) {
    for (let d = 2; d <= 7; d++)       set(r, d, BlackjackAction.SPLIT)
    for (const d of [8,9,10,11])       set(r, d, BlackjackAction.HIT)
  }
  // 4s — always hit
  for (let d = 2; d <= 11; d++) set(Rank.FOUR, d, BlackjackAction.HIT)
  // 5s — treat as hard 10: double vs 2-9, hit vs 10-11
  for (let d = 2; d <= 9; d++)  set(Rank.FIVE, d, BlackjackAction.DOUBLE)
  for (const d of [10,11])      set(Rank.FIVE, d, BlackjackAction.HIT)
  // 6s — split vs 2-6, hit otherwise
  for (let d = 2; d <= 6; d++)  set(Rank.SIX, d, BlackjackAction.SPLIT)
  for (let d = 7; d <= 11; d++) set(Rank.SIX, d, BlackjackAction.HIT)
  // 7s — split vs 2-7, hit otherwise
  for (let d = 2; d <= 7; d++)  set(Rank.SEVEN, d, BlackjackAction.SPLIT)
  for (const d of [8,9,10,11]) set(Rank.SEVEN, d, BlackjackAction.HIT)
  // 8s — always split
  for (let d = 2; d <= 11; d++) set(Rank.EIGHT, d, BlackjackAction.SPLIT)
  // 9s — split vs 2-9 except 7; stand vs 7, 10, A
  for (let d = 2; d <= 6; d++)  set(Rank.NINE, d, BlackjackAction.SPLIT)
  set(Rank.NINE, 7, BlackjackAction.STAND)
  for (const d of [8,9])        set(Rank.NINE, d, BlackjackAction.SPLIT)
  for (const d of [10,11])      set(Rank.NINE, d, BlackjackAction.STAND)
  // 10/J/Q/K — always stand
  for (const r of [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING]) {
    for (let d = 2; d <= 11; d++) set(r, d, BlackjackAction.STAND)
  }
  return t
}

function buildSoftTable(): StrategyTable {
  const t = new Map<string, BlackjackAction>()
  const set = (total: number, d: number, a: BlackjackAction) =>
    t.set(strategyKeyToString({ type: 'soft', total, dealerValue: d }), a)

  // Soft 13-14 (A+2, A+3): double vs 5-6, hit otherwise
  for (const total of [13, 14]) {
    for (const d of [5,6])                set(total, d, BlackjackAction.DOUBLE)
    for (const d of [2,3,4,7,8,9,10,11]) set(total, d, BlackjackAction.HIT)
  }
  // Soft 15-16 (A+4, A+5): double vs 4-6, hit otherwise
  for (const total of [15, 16]) {
    for (const d of [4,5,6])              set(total, d, BlackjackAction.DOUBLE)
    for (const d of [2,3,7,8,9,10,11])   set(total, d, BlackjackAction.HIT)
  }
  // Soft 17 (A+6): double vs 3-6, hit otherwise
  for (const d of [3,4,5,6])             set(17, d, BlackjackAction.DOUBLE)
  for (const d of [2,7,8,9,10,11])       set(17, d, BlackjackAction.HIT)
  // Soft 18 (A+7): double vs 3-6, stand vs 7-8, hit vs 2/9/10/A
  for (const d of [3,4,5,6])             set(18, d, BlackjackAction.DOUBLE)
  for (const d of [7,8])                 set(18, d, BlackjackAction.STAND)
  for (const d of [2,9,10,11])           set(18, d, BlackjackAction.HIT)
  // Soft 19-21: always stand
  for (const total of [19, 20, 21]) {
    for (let d = 2; d <= 11; d++)        set(total, d, BlackjackAction.STAND)
  }
  return t
}

function buildHardTable(): StrategyTable {
  const t = new Map<string, BlackjackAction>()
  const set = (total: number, d: number, a: BlackjackAction) =>
    t.set(strategyKeyToString({ type: 'hard', total, dealerValue: d }), a)

  // Hard 5-8: always hit
  for (let total = 5; total <= 8; total++)
    for (let d = 2; d <= 11; d++) set(total, d, BlackjackAction.HIT)
  // Hard 9: double vs 3-6, hit otherwise
  for (const d of [3,4,5,6])           set(9, d, BlackjackAction.DOUBLE)
  for (const d of [2,7,8,9,10,11])    set(9, d, BlackjackAction.HIT)
  // Hard 10: double vs 2-9, hit vs 10-A
  for (let d = 2; d <= 9; d++)         set(10, d, BlackjackAction.DOUBLE)
  for (const d of [10,11])             set(10, d, BlackjackAction.HIT)
  // Hard 11: double vs 2-10, hit vs A
  for (let d = 2; d <= 10; d++)        set(11, d, BlackjackAction.DOUBLE)
  set(11, 11, BlackjackAction.HIT)
  // Hard 12: stand vs 4-6, hit otherwise
  for (const d of [4,5,6])             set(12, d, BlackjackAction.STAND)
  for (const d of [2,3,7,8,9,10,11]) set(12, d, BlackjackAction.HIT)
  // Hard 13-16: stand vs 2-6, hit otherwise
  for (let total = 13; total <= 16; total++) {
    for (let d = 2; d <= 6; d++)       set(total, d, BlackjackAction.STAND)
    for (let d = 7; d <= 11; d++)      set(total, d, BlackjackAction.HIT)
  }
  // Hard 17+: always stand
  for (let total = 17; total <= 21; total++)
    for (let d = 2; d <= 11; d++) set(total, d, BlackjackAction.STAND)

  return t
}

// Merge: hard first (lowest priority), then soft, then pair (highest priority)
export function buildStrategyTable(): StrategyTable {
  const table = new Map<string, BlackjackAction>()
  for (const [k, v] of buildHardTable())  table.set(k, v)
  for (const [k, v] of buildSoftTable())  table.set(k, v)
  for (const [k, v] of buildPairTable())  table.set(k, v)
  return table
}
