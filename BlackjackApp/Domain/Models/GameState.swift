import Foundation

enum GamePhase: Equatable, Sendable {
    case idle               // Waiting for bets
    case betting            // Players placing bets + side bets
    case dealing            // Initial card distribution
    case sideBetEvaluation  // Checking side bets immediately after deal
    case playerTurn(seatIndex: Int) // Human input awaited
    case botTurn(seatIndex: Int)    // Bot auto-plays
    case dealerTurn         // Croupier reveals + draws
    case evaluation         // Settling wins/losses + XP
    case roundOver          // Bilan screen shown
}

@Observable
final class GameState {
    var phase: GamePhase       = .idle
    var players: [Player]      = []
    var dealer: Player         = Player(type: .bot, name: "Dealer", bankroll: .infinity, seatIndex: -1)
    var shoe: Shoe             = Shoe()

    // Holds the evaluation results of the last completed round
    var lastRoundResults: [RoundResult] = []

    // Whether the shoe was reshuffled at the end of the last round
    var shoeReshuffled: Bool   = false

    // Human player (seat 0 by convention)
    var humanPlayer: Player? { players.first(where: { $0.type == .human }) }
}

/// Per-player outcome for one round, used in the Bilan screen.
struct RoundResult: Identifiable, Sendable {
    let id: UUID               = UUID()
    let playerID: UUID
    let handIndex: Int
    let outcome: HandOutcome
    let netPayout: Double
    let sideBetResults: [SideBetResult]
    let strategyErrors: [StrategyError]
    let xpEarned: Int
}

enum HandOutcome: String, Sendable {
    case blackjack     // 3:2
    case win           // 1:1
    case push          // 0
    case loss          // -bet
    case bust          // -bet (player busted)
}

/// A single decision by the human player that deviated from optimal strategy.
struct StrategyError: Identifiable, Sendable {
    let id: UUID               = UUID()
    let playerAction: BlackjackAction
    let optimalAction: BlackjackAction
    let handDescription: String  // e.g. "Hard 16"
    let dealerUpCard: String     // e.g. "6"
}
