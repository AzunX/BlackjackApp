import Foundation

// MARK: – European Blackjack Basic Strategy — Full Matrix
//
// Sources: Wizard of Odds European Blackjack table (no surrender, no hole card,
// dealer stands on all 17s, DAS allowed, re-split Aces not allowed).
//
// Dealer values 2-9 map directly; 10 covers 10/J/Q/K; 11 = Ace.

typealias StrategyTable = [StrategyKey: BlackjackAction]

enum BasicStrategyData {

    static let table: StrategyTable = pairTable
        .merging(softTable) { current, _ in current }
        .merging(hardTable) { current, _ in current }

    // MARK: – Pair Table (always checked first)

    static let pairTable: StrategyTable = {
        var t = StrategyTable()

        // Pairs of Aces — always split (dealer 2-11)
        for d in 2...11 { t[.pair(playerRank: .ace, dealerValue: d)] = .split }

        // Pairs of 2s — split vs 2-7, hit otherwise
        for d in 2...7 { t[.pair(playerRank: .two, dealerValue: d)] = .split }
        for d in [8, 9, 10, 11] { t[.pair(playerRank: .two, dealerValue: d)] = .hit }

        // Pairs of 3s — split vs 2-7, hit otherwise
        for d in 2...7 { t[.pair(playerRank: .three, dealerValue: d)] = .split }
        for d in [8, 9, 10, 11] { t[.pair(playerRank: .three, dealerValue: d)] = .hit }

        // Pairs of 4s — hit always (no split, no double in pair table)
        for d in 2...11 { t[.pair(playerRank: .four, dealerValue: d)] = .hit }

        // Pairs of 5s — treated as Hard 10: double vs 2-9, hit vs 10-11
        for d in 2...9  { t[.pair(playerRank: .five, dealerValue: d)] = .double }
        for d in [10, 11] { t[.pair(playerRank: .five, dealerValue: d)] = .hit }

        // Pairs of 6s — split vs 2-6, hit otherwise
        for d in 2...6 { t[.pair(playerRank: .six, dealerValue: d)] = .split }
        for d in 7...11 { t[.pair(playerRank: .six, dealerValue: d)] = .hit }

        // Pairs of 7s — split vs 2-7, hit otherwise
        for d in 2...7 { t[.pair(playerRank: .seven, dealerValue: d)] = .split }
        for d in [8, 9, 10, 11] { t[.pair(playerRank: .seven, dealerValue: d)] = .hit }

        // Pairs of 8s — always split
        for d in 2...11 { t[.pair(playerRank: .eight, dealerValue: d)] = .split }

        // Pairs of 9s — split vs 2-9 except 7, stand vs 7/10/A
        for d in 2...6 { t[.pair(playerRank: .nine, dealerValue: d)] = .split }
        t[.pair(playerRank: .nine, dealerValue: 7)] = .stand
        for d in [8, 9] { t[.pair(playerRank: .nine, dealerValue: d)] = .split }
        for d in [10, 11] { t[.pair(playerRank: .nine, dealerValue: d)] = .stand }

        // Pairs of 10s (10/J/Q/K) — always stand
        for rank in [Rank.ten, .jack, .queen, .king] {
            for d in 2...11 { t[.pair(playerRank: rank, dealerValue: d)] = .stand }
        }

        return t
    }()

    // MARK: – Soft Hand Table (A + x)

    static let softTable: StrategyTable = {
        var t = StrategyTable()

        // Soft 13 (A+2) — double vs 5-6, hit otherwise
        for d in 5...6  { t[.soft(total: 13, dealerValue: d)] = .double }
        for d in [2,3,4,7,8,9,10,11] { t[.soft(total: 13, dealerValue: d)] = .hit }

        // Soft 14 (A+3) — double vs 5-6, hit otherwise
        for d in 5...6  { t[.soft(total: 14, dealerValue: d)] = .double }
        for d in [2,3,4,7,8,9,10,11] { t[.soft(total: 14, dealerValue: d)] = .hit }

        // Soft 15 (A+4) — double vs 4-6, hit otherwise
        for d in 4...6  { t[.soft(total: 15, dealerValue: d)] = .double }
        for d in [2,3,7,8,9,10,11] { t[.soft(total: 15, dealerValue: d)] = .hit }

        // Soft 16 (A+5) — double vs 4-6, hit otherwise
        for d in 4...6  { t[.soft(total: 16, dealerValue: d)] = .double }
        for d in [2,3,7,8,9,10,11] { t[.soft(total: 16, dealerValue: d)] = .hit }

        // Soft 17 (A+6) — double vs 3-6, hit otherwise
        for d in 3...6  { t[.soft(total: 17, dealerValue: d)] = .double }
        for d in [2,7,8,9,10,11] { t[.soft(total: 17, dealerValue: d)] = .hit }

        // Soft 18 (A+7) — double vs 3-6, stand vs 7-8, hit vs 2/9/10/A
        for d in 3...6  { t[.soft(total: 18, dealerValue: d)] = .double }
        for d in [7, 8]  { t[.soft(total: 18, dealerValue: d)] = .stand }
        for d in [2,9,10,11] { t[.soft(total: 18, dealerValue: d)] = .hit }

        // Soft 19 (A+8) — stand always
        for d in 2...11 { t[.soft(total: 19, dealerValue: d)] = .stand }

        // Soft 20 (A+9) — stand always
        for d in 2...11 { t[.soft(total: 20, dealerValue: d)] = .stand }

        // Soft 21 is Blackjack — handled separately; stand as fallback
        for d in 2...11 { t[.soft(total: 21, dealerValue: d)] = .stand }

        return t
    }()

    // MARK: – Hard Hand Table

    static let hardTable: StrategyTable = {
        var t = StrategyTable()

        // Hard 5-8 — hit always
        for total in 5...8 {
            for d in 2...11 { t[.hard(total: total, dealerValue: d)] = .hit }
        }

        // Hard 9 — double vs 3-6, hit otherwise
        for d in 3...6  { t[.hard(total: 9, dealerValue: d)] = .double }
        for d in [2,7,8,9,10,11] { t[.hard(total: 9, dealerValue: d)] = .hit }

        // Hard 10 — double vs 2-9, hit vs 10-A
        for d in 2...9  { t[.hard(total: 10, dealerValue: d)] = .double }
        for d in [10,11] { t[.hard(total: 10, dealerValue: d)] = .hit }

        // Hard 11 — double vs 2-10, hit vs A
        for d in 2...10 { t[.hard(total: 11, dealerValue: d)] = .double }
        t[.hard(total: 11, dealerValue: 11)] = .hit

        // Hard 12 — stand vs 4-6, hit otherwise
        for d in 4...6  { t[.hard(total: 12, dealerValue: d)] = .stand }
        for d in [2,3,7,8,9,10,11] { t[.hard(total: 12, dealerValue: d)] = .hit }

        // Hard 13 — stand vs 2-6, hit otherwise
        for d in 2...6  { t[.hard(total: 13, dealerValue: d)] = .stand }
        for d in 7...11 { t[.hard(total: 13, dealerValue: d)] = .hit }

        // Hard 14 — stand vs 2-6, hit otherwise
        for d in 2...6  { t[.hard(total: 14, dealerValue: d)] = .stand }
        for d in 7...11 { t[.hard(total: 14, dealerValue: d)] = .hit }

        // Hard 15 — stand vs 2-6, hit otherwise
        for d in 2...6  { t[.hard(total: 15, dealerValue: d)] = .stand }
        for d in 7...11 { t[.hard(total: 15, dealerValue: d)] = .hit }

        // Hard 16 — stand vs 2-6, hit otherwise
        for d in 2...6  { t[.hard(total: 16, dealerValue: d)] = .stand }
        for d in 7...11 { t[.hard(total: 16, dealerValue: d)] = .hit }

        // Hard 17+ — stand always
        for total in 17...21 {
            for d in 2...11 { t[.hard(total: total, dealerValue: d)] = .stand }
        }

        return t
    }()
}
