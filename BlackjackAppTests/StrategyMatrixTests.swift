import XCTest
@testable import BlackjackApp

final class StrategyMatrixTests: XCTestCase {

    let matrix = StrategyMatrix.shared

    // --- Pair table ---

    func test_pair8_vs_any_split() {
        // Pairs of 8 always split against any dealer card
        for dealerValue in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] {
            var hand = Hand()
            hand.add(Card(suit: .hearts, rank: .eight))
            hand.add(Card(suit: .spades, rank: .eight))
            let dealerCard = Card(suit: .clubs, rank: dealerRank(for: dealerValue))
            XCTAssertEqual(
                matrix.getOptimalAction(for: hand, dealerUpCard: dealerCard),
                .split,
                "Pairs of 8 vs \(dealerValue) should split"
            )
        }
    }

    func test_pairAce_vs_any_split() {
        for dealerValue in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] {
            var hand = Hand()
            hand.add(Card(suit: .hearts, rank: .ace))
            hand.add(Card(suit: .spades, rank: .ace))
            let dealerCard = Card(suit: .clubs, rank: dealerRank(for: dealerValue))
            XCTAssertEqual(
                matrix.getOptimalAction(for: hand, dealerUpCard: dealerCard),
                .split,
                "Pairs of A vs \(dealerValue) should split"
            )
        }
    }

    // --- Hard table ---

    func test_hard16_vs_6_stand() {
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .ten))
        hand.add(Card(suit: .spades, rank: .six))
        let dealer = Card(suit: .clubs, rank: .six)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .stand)
    }

    func test_hard16_vs_7_hit() {
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .ten))
        hand.add(Card(suit: .spades, rank: .six))
        let dealer = Card(suit: .clubs, rank: .seven)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .hit)
    }

    func test_hard11_vs_10_double() {
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .six))
        hand.add(Card(suit: .spades, rank: .five))
        let dealer = Card(suit: .clubs, rank: .ten)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .double)
    }

    func test_hard8_vs_5_hit() {
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .three))
        hand.add(Card(suit: .spades, rank: .five))
        let dealer = Card(suit: .clubs, rank: .five)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .hit)
    }

    // --- Soft table ---

    func test_soft18_vs_ace_hit() {
        // Soft 18 (A+7) vs dealer Ace: Hit in European BJ
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .ace))
        hand.add(Card(suit: .spades, rank: .seven))
        let dealer = Card(suit: .clubs, rank: .ace)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .hit)
    }

    func test_soft18_vs_6_double() {
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .ace))
        hand.add(Card(suit: .spades, rank: .seven))
        let dealer = Card(suit: .clubs, rank: .six)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .double)
    }

    func test_soft19_vs_any_stand() {
        for dealerValue in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] {
            var hand = Hand()
            hand.add(Card(suit: .hearts, rank: .ace))
            hand.add(Card(suit: .spades, rank: .eight))
            let dealer = Card(suit: .clubs, rank: dealerRank(for: dealerValue))
            XCTAssertEqual(
                matrix.getOptimalAction(for: hand, dealerUpCard: dealer),
                .stand,
                "Soft 19 vs \(dealerValue) should stand"
            )
        }
    }

    // --- Boundary cells: range edges most likely to contain off-by-one bugs ---

    func test_hard9_vs_2_hit() {
        // Hard 9 doubles only vs 3-6; vs 2 should hit
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .four))
        hand.add(Card(suit: .spades, rank: .five))
        let dealer = Card(suit: .clubs, rank: .two)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .hit)
    }

    func test_hard10_vs_5_double() {
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .six))
        hand.add(Card(suit: .spades, rank: .four))
        let dealer = Card(suit: .clubs, rank: .five)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .double)
    }

    func test_soft17_vs_2_hit() {
        // Soft 17 doubles only vs 3-6; vs 2 should hit
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .ace))
        hand.add(Card(suit: .spades, rank: .six))
        let dealer = Card(suit: .clubs, rank: .two)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .hit)
    }

    func test_soft13_vs_5_double() {
        // Smallest soft double range (A+2 vs 5-6 only)
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .ace))
        hand.add(Card(suit: .spades, rank: .two))
        let dealer = Card(suit: .clubs, rank: .five)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .double)
    }

    func test_soft13_vs_4_hit() {
        // A+2 vs 4: NOT in the double range (doubles start at 5)
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .ace))
        hand.add(Card(suit: .spades, rank: .two))
        let dealer = Card(suit: .clubs, rank: .four)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .hit)
    }

    func test_pair6_vs_7_hit() {
        // Pair of 6s splits only vs 2-6; vs 7 should hit
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .six))
        hand.add(Card(suit: .spades, rank: .six))
        let dealer = Card(suit: .clubs, rank: .seven)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .hit)
    }

    func test_pair6_vs_6_split() {
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .six))
        hand.add(Card(suit: .spades, rank: .six))
        let dealer = Card(suit: .clubs, rank: .six)
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .split)
    }

    func test_dealer_king_treated_as_value10() {
        // Face cards must produce dealerValue=10, same lookup path as ten
        var hand = Hand()
        hand.add(Card(suit: .hearts, rank: .ten))
        hand.add(Card(suit: .spades, rank: .six))
        let dealer = Card(suit: .clubs, rank: .king)  // K → dealerValue=10
        XCTAssertEqual(matrix.getOptimalAction(for: hand, dealerUpCard: dealer), .hit)
    }

    // MARK: – Helper

    private func dealerRank(for value: Int) -> Rank {
        switch value {
        case 11: return .ace
        case 10: return .ten
        default: return Rank(rawValue: value)!
        }
    }
}
