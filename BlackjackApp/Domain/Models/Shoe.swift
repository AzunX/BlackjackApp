import Foundation

/// Thread-safe 6-deck shoe using Swift concurrency.
/// Auto-reshuffles when penetration reaches or exceeds 75%.
actor Shoe {

    static let deckCount        = 6
    static let reshufflePct     = 0.75
    private let totalCards      = deckCount * 52

    private var cards: [Card] = []

    init() {
        cards = Self.buildAndShuffle()
    }

    // MARK: – Public interface

    var remainingCount: Int { cards.count }

    var penetration: Double {
        1.0 - Double(cards.count) / Double(totalCards)
    }

    /// Deals one card. Reshuffles automatically if penetration >= 75% before dealing.
    func deal() throws -> Card {
        if penetration >= Self.reshufflePct {
            cards = Self.buildAndShuffle()
        }
        guard !cards.isEmpty else {
            throw ShoeError.empty
        }
        return cards.removeLast()
    }

    /// Forces an immediate reshuffle (e.g., on user request or game reset).
    func reshuffle() {
        cards = Self.buildAndShuffle()
    }

    // MARK: – Private

    private static func buildAndShuffle() -> [Card] {
        var deck: [Card] = []
        deck.reserveCapacity(deckCount * 52)
        for _ in 0..<deckCount {
            for suit in Suit.allCases {
                for rank in Rank.allCases {
                    deck.append(Card(suit: suit, rank: rank))
                }
            }
        }
        deck.shuffle()
        return deck
    }
}

enum ShoeError: Error { case empty }
