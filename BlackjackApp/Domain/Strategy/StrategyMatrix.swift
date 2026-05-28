final class StrategyMatrix: Sendable {
    static let shared = StrategyMatrix()
    private let table: StrategyTable

    private init() {
        table = BasicStrategyData.table
    }

    /// Returns the optimal Basic Strategy action for the given hand and dealer upcard.
    /// Falls back to a score-based heuristic for any key not in the table.
    func getOptimalAction(for hand: Hand, dealerUpCard: Card) -> BlackjackAction {
        // Busted or Blackjack — no action needed, return stand as sentinel
        guard !hand.isBust && !hand.isBlackjack else { return .stand }

        let key = StrategyKey.from(hand: hand, dealerUpCard: dealerUpCard)
        return table[key] ?? defaultAction(for: hand)
    }

    // MARK: – Private fallback

    private func defaultAction(for hand: Hand) -> BlackjackAction {
        // Use hardTotal (Ace=1) so soft hands don't incorrectly stand at soft 17
        hand.hardTotal >= 17 ? .stand : .hit
    }
}
