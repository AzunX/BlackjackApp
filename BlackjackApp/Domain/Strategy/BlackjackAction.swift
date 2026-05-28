import Foundation

enum BlackjackAction: String, CaseIterable, Sendable {
    case hit    = "Hit"
    case stand  = "Stand"
    case double = "Double"
    case split  = "Split"
    // Surrender is NOT in European Blackjack — omitted intentionally
}
