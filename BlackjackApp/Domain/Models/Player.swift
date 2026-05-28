import Foundation

enum PlayerType: Sendable {
    case human
    case bot
}

// XP Rank thresholds (cumulative XP)
enum PlayerRank: String, CaseIterable, Sendable {
    case beginner  = "Débutant"
    case initiate  = "Initié"
    case pro       = "Pro"
    case legend    = "Légende"

    static func rank(for xp: Int) -> PlayerRank {
        switch xp {
        case 0..<500:    return .beginner
        case 500..<2000: return .initiate
        case 2000..<5000: return .pro
        default:          return .legend
        }
    }
}

@Observable
final class Player: Identifiable {
    let id: UUID        = UUID()
    let type: PlayerType
    var name: String
    var bankroll: Double

    // Up to 4 hands after splits (European BJ max split depth)
    var hands: [Hand]   = [Hand()]
    var activeHandIndex: Int = 0

    // Side bet placed this round
    var sideBetWager: SideBetWager?

    // XP / pedagogy (human player only)
    var xp: Int         = 0
    var playerRank: PlayerRank { PlayerRank.rank(for: xp) }

    // Seat position at the table (0-4)
    let seatIndex: Int

    var currentHand: Hand {
        get { hands[activeHandIndex] }
        set { hands[activeHandIndex] = newValue }
    }

    var bet: Double     = 0

    init(type: PlayerType, name: String, bankroll: Double, seatIndex: Int) {
        self.type      = type
        self.name      = name
        self.bankroll  = bankroll
        self.seatIndex = seatIndex
    }

    func resetForNewRound() {
        hands           = [Hand()]
        activeHandIndex = 0
        bet             = 0
        sideBetWager    = nil
    }
}
