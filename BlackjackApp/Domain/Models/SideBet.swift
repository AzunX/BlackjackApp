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
    case straightFlash // sequential ranks, same suit         — payout 40:1
    case suitedTrips   // same rank AND same suit             — payout 100:1
}

// MARK: – Generic containers

enum SideBetType: String, CaseIterable, Sendable {
    case perfectPairs
    case twentyOnePlusThree
}

struct SideBetWager: Identifiable, Sendable {
    let id: UUID        = UUID()
    let type: SideBetType
    let amount: Double
}

struct SideBetResult: Identifiable, Sendable {
    let id: UUID          = UUID()
    let wager: SideBetWager
    let perfectPair:        PerfectPairResult?
    let twentyOnePlusThree: TwentyOnePlusThreeResult?

    /// Net payout including return of wager (positive = win, 0 = push, negative = loss).
    var netPayout: Double {
        let stake = wager.amount
        switch wager.type {
        case .perfectPairs:
            switch perfectPair {
            case .mixedPair:    return stake * 5
            case .colouredPair: return stake * 10
            case .perfectPair:  return stake * 25
            default:            return -stake
            }
        case .twentyOnePlusThree:
            switch twentyOnePlusThree {
            case .flush:         return stake * 5
            case .straight:      return stake * 10
            case .threeOfAKind:  return stake * 30
            case .straightFlash: return stake * 40
            case .suitedTrips:   return stake * 100
            default:             return -stake
            }
        }
    }
}
