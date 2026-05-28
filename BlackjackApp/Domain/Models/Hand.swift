import Foundation

struct Hand: Sendable {
    private(set) var cards: [Card] = []

    // MARK: – Mutation

    mutating func add(_ card: Card) {
        cards.append(card)
    }

    mutating func clear() {
        cards.removeAll()
    }

    // MARK: – Score computation

    /// All possible totals (before pruning busts)
    private var allScores: [Int] {
        cards.reduce([0]) { totals, card in
            card.rank.bjValue.flatMap { value in
                totals.map { $0 + value }
            }
        }
    }

    /// Best non-bust score; if all options bust, returns lowest possible total.
    var bestScore: Int {
        let valid = allScores.filter { $0 <= 21 }
        return valid.max() ?? allScores.min() ?? 0
    }

    /// Hard total: treating every Ace as 1 only.
    var hardTotal: Int {
        cards.reduce(0) { $0 + ($1.rank == .ace ? 1 : $1.rank.bjValue[0]) }
    }

    /// True when the best non-bust score uses an Ace counted as 11.
    var isSoft: Bool {
        guard cards.contains(where: { $0.rank == .ace }) else { return false }
        let score = bestScore
        return score <= 21 && score != hardTotal
    }

    var isBust: Bool { bestScore > 21 }

    var isBlackjack: Bool { cards.count == 2 && bestScore == 21 }

    /// True when the initial two cards share the same rank (split candidate).
    var isPair: Bool { cards.count == 2 && cards[0].rank == cards[1].rank }

    /// Convenience: is this hand done (bust, 21, or blackjack)?
    var isTerminal: Bool { isBust || bestScore == 21 }
}
