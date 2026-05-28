import Foundation

// MARK: – Perfect Pairs

enum PerfectPairResult: String, Sendable {
    case none
    case mixedPair    // same rank, different suit colours       — payout 5:1
    case colouredPair // same rank, same colour, different suits — payout 10:1
    case perfectPair  // same rank, identical suit               — payout 25:1
}

// MARK: – 21+3 (player's 2 cards + dealer upcard)

enum TwentyOnePlusThreeResult: String, Sendable {
    case none
    case flush         // same suit, no sequence              — payout 5:1
    case straight      // sequential ranks, mixed suits       — payout 10:1
    case threeOfAKind  // same rank, different suits          — payout 30:1
    case straightFlush // sequential ranks, same suit         — payout 40:1
    case suitedTrips   // same rank AND same suit             — payout 100:1
}

// MARK: – Generic containers

enum SideBetType: String, CaseIterable, Sendable {
    case perfectPairs
    case twentyOnePlusThree
}

struct SideBetWager: Identifiable, Equatable, Sendable {
    let id: UUID        = UUID()
    let type: SideBetType
    let amount: Double
}

struct SideBetResult: Identifiable, Equatable, Sendable {
    let id: UUID          = UUID()
    let wager: SideBetWager
    // Invariant: exactly one of these is non-nil, matching wager.type
    let perfectPair:        PerfectPairResult?
    let twentyOnePlusThree: TwentyOnePlusThreeResult?

    /// Net payout (positive = win, negative = loss). Does not include return of stake.
    var netPayout: Double {
        let stake = wager.amount
        switch wager.type {
        case .perfectPairs:
            // Unwrap optional first to avoid ambiguity between PerfectPairResult.none and Optional.none
            switch perfectPair ?? .none {
            case .mixedPair:    return stake * 5
            case .colouredPair: return stake * 10
            case .perfectPair:  return stake * 25
            case .none:         return -stake
            }
        case .twentyOnePlusThree:
            switch twentyOnePlusThree ?? .none {
            case .flush:         return stake * 5
            case .straight:      return stake * 10
            case .threeOfAKind:  return stake * 30
            case .straightFlush: return stake * 40
            case .suitedTrips:   return stake * 100
            case .none:          return -stake
            }
        }
    }
}
