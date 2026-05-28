export enum PerfectPairResult {
  NONE          = 'none',
  MIXED_PAIR    = 'mixedPair',    // same rank, different colours  — payout 5:1
  COLOURED_PAIR = 'colouredPair', // same rank, same colour        — payout 10:1
  PERFECT_PAIR  = 'perfectPair',  // same rank, identical suit     — payout 25:1
}

export enum TwentyOnePlusThreeResult {
  NONE           = 'none',
  FLUSH          = 'flush',         // same suit, no sequence        — payout 5:1
  STRAIGHT       = 'straight',      // sequential ranks, mixed suits — payout 10:1
  THREE_OF_KIND  = 'threeOfAKind',  // same rank, different suits   — payout 30:1
  STRAIGHT_FLUSH = 'straightFlush', // sequential ranks, same suit  — payout 40:1
  SUITED_TRIPS   = 'suitedTrips',   // same rank AND same suit      — payout 100:1
}

export enum SideBetType {
  PERFECT_PAIRS         = 'perfectPairs',
  TWENTY_ONE_PLUS_THREE = 'twentyOnePlusThree',
}

export interface SideBetWager {
  readonly id: string
  readonly type: SideBetType
  readonly amount: number
}

export interface SideBetResult {
  readonly id: string
  readonly wager: SideBetWager
  // Invariant: exactly one is non-null, matching wager.type
  readonly perfectPair:        PerfectPairResult | null
  readonly twentyOnePlusThree: TwentyOnePlusThreeResult | null
}

// Net payout (positive = win, negative = loss). Does NOT include stake return.
export function sideBetNetPayout(result: SideBetResult): number {
  const stake = result.wager.amount
  if (result.wager.type === SideBetType.PERFECT_PAIRS) {
    switch (result.perfectPair ?? PerfectPairResult.NONE) {
      case PerfectPairResult.MIXED_PAIR:    return stake * 5
      case PerfectPairResult.COLOURED_PAIR: return stake * 10
      case PerfectPairResult.PERFECT_PAIR:  return stake * 25
      default:                              return -stake
    }
  } else {
    switch (result.twentyOnePlusThree ?? TwentyOnePlusThreeResult.NONE) {
      case TwentyOnePlusThreeResult.FLUSH:          return stake * 5
      case TwentyOnePlusThreeResult.STRAIGHT:       return stake * 10
      case TwentyOnePlusThreeResult.THREE_OF_KIND:  return stake * 30
      case TwentyOnePlusThreeResult.STRAIGHT_FLUSH: return stake * 40
      case TwentyOnePlusThreeResult.SUITED_TRIPS:   return stake * 100
      default:                                       return -stake
    }
  }
}
