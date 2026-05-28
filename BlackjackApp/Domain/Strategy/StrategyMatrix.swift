import Foundation

final class StrategyMatrix: Sendable {
    static let shared = StrategyMatrix()
    private let table: StrategyTable

    private init() {
        table = BasicStrategyData.table
    }

    /// Returns the optimal Basic Strategy action for the given hand and dealer upcard.
    /// Falls back to .stand for any edge case not in the table (e.g. score > 21).
    func getOptimalAction(for hand: Hand, dealerUpCard: Card) -> BlackjackAction {
        // Busted or Blackjack — no action needed, return stand as sentinel
        guard !hand.isBust && !hand.isBlackjack else { return .stand }

        let key = StrategyKey.from(hand: hand, dealerUpCard: dealerUpCard)
        return table[key] ?? defaultAction(for: hand)
    }

    // MARK: – Private fallback

    private func defaultAction(for hand: Hand) -> BlackjackAction {
        // Sensible default if a key is somehow missing from the table
        hand.bestScore >= 17 ? .stand : .hit
    }
}
