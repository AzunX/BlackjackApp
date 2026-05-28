import Foundation

enum Suit: String, CaseIterable, Sendable {
    case hearts   = "♥"
    case diamonds = "♦"
    case clubs    = "♣"
    case spades   = "♠"

    /// Whether two cards share the same colour (for Perfect Pairs side bet)
    var color: CardColor {
        switch self {
        case .hearts, .diamonds: return .red
        case .clubs, .spades:    return .black
        }
    }
}

enum CardColor: CaseIterable, Sendable { case red, black }

enum Rank: Int, CaseIterable, Sendable {
    case two = 2, three, four, five, six, seven, eight, nine, ten
    case jack = 11, queen = 12, king = 13, ace = 14

    /// Returns all possible Blackjack point values for this rank.
    /// Ace returns [1, 11]; face cards and ten return [10].
    var bjValue: [Int] {
        switch self {
        case .ace:               return [1, 11]
        case .jack, .queen, .king, .ten: return [10]
        default:                 return [rawValue]
        }
    }

    var shortName: String {
        switch self {
        case .ace:   return "A"
        case .king:  return "K"
        case .queen: return "Q"
        case .jack:  return "J"
        default:     return "\(rawValue)"
        }
    }
}

struct Card: Identifiable, Equatable, Sendable {
    let id: UUID
    let suit: Suit
    let rank: Rank

    init(suit: Suit, rank: Rank) {
        self.id   = UUID()
        self.suit = suit
        self.rank = rank
    }

    var shortDescription: String { "\(rank.shortName)\(suit.rawValue)" }

    // Equatable ignores UUID — two cards are "equal" if they have same suit+rank
    static func == (lhs: Card, rhs: Card) -> Bool {
        lhs.suit == rhs.suit && lhs.rank == rhs.rank
    }
}
