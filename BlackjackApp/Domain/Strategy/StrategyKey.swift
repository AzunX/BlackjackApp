import Foundation

/// Encodes the hand situation + dealer upcard into a single Hashable key.
/// Three distinct key types cover all strategy table cells:
///   - pair:   playerRank vs dealerValue  (split table)
///   - soft:   softTotal vs dealerValue   (soft hands table)
///   - hard:   hardTotal vs dealerValue   (hard hands table)
enum StrategyKey: Hashable, Sendable {
    /// Pair hands — key on the paired rank (e.g. .eight)
    case pair(playerRank: Rank, dealerValue: Int)

    /// Soft totals — key on soft total (13…21)
    case soft(total: Int, dealerValue: Int)

    /// Hard totals — key on hard total (5…21)
    case hard(total: Int, dealerValue: Int)
}

extension StrategyKey {
    /// Builds the correct key from a Hand and dealer upcard.
    /// Priority: pair > soft > hard.
    static func from(hand: Hand, dealerUpCard: Card) -> StrategyKey {
        let dealerValue = dealerUpCard.rank.bjValue.max()! // Use 11 for Ace for table lookup
        if hand.isPair {
            return .pair(playerRank: hand.cards[0].rank, dealerValue: dealerValue)
        } else if hand.isSoft {
            return .soft(total: hand.bestScore, dealerValue: dealerValue)
        } else {
            return .hard(total: hand.hardTotal, dealerValue: dealerValue)
        }
    }
}
