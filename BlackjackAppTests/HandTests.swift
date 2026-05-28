import XCTest
@testable import BlackjackApp

final class HandTests: XCTestCase {

    // Helpers
    private func card(_ rank: Rank, _ suit: Suit = .spades) -> Card { Card(suit: suit, rank: rank) }

    func test_emptyHand_score0() {
        let hand = Hand()
        XCTAssertEqual(hand.bestScore, 0)
        XCTAssertFalse(hand.isBust)
    }

    func test_hardHand_noAce() {
        var hand = Hand()
        hand.add(card(.ten))
        hand.add(card(.six))
        XCTAssertEqual(hand.bestScore, 16)
        XCTAssertEqual(hand.isSoft, false)
    }

    func test_softHand_aceCountsAs11() {
        var hand = Hand()
        hand.add(card(.ace))
        hand.add(card(.six))
        XCTAssertEqual(hand.bestScore, 17)  // soft 17
        XCTAssertTrue(hand.isSoft)
    }

    func test_aceDowngradesTo1_whenBustWithout() {
        var hand = Hand()
        hand.add(card(.ace))
        hand.add(card(.ten))
        hand.add(card(.five))
        // Ace as 11 → 26 (bust), as 1 → 16
        XCTAssertEqual(hand.bestScore, 16)
        XCTAssertFalse(hand.isBust)
        XCTAssertFalse(hand.isSoft)
    }

    func test_twoAces_oneCounts11_oneCounts1() {
        var hand = Hand()
        hand.add(card(.ace))
        hand.add(card(.ace))
        XCTAssertEqual(hand.bestScore, 12) // 11+1
        XCTAssertTrue(hand.isSoft)
    }

    func test_blackjack_detectedWith2Cards() {
        var hand = Hand()
        hand.add(card(.ace))
        hand.add(card(.king))
        XCTAssertTrue(hand.isBlackjack)
        XCTAssertEqual(hand.bestScore, 21)
    }

    func test_21with3cards_notBlackjack() {
        var hand = Hand()
        hand.add(card(.seven))
        hand.add(card(.seven))
        hand.add(card(.seven))
        XCTAssertEqual(hand.bestScore, 21)
        XCTAssertFalse(hand.isBlackjack)
    }

    func test_bust() {
        var hand = Hand()
        hand.add(card(.ten))
        hand.add(card(.ten))
        hand.add(card(.five))
        XCTAssertEqual(hand.bestScore, 25)
        XCTAssertTrue(hand.isBust)
    }

    func test_isPair_sameRank() {
        var hand = Hand()
        hand.add(card(.eight, .hearts))
        hand.add(card(.eight, .clubs))
        XCTAssertTrue(hand.isPair)
    }

    func test_hardTotal_forStrategy() {
        // Hard 16: 10+6
        var hand = Hand()
        hand.add(card(.ten))
        hand.add(card(.six))
        XCTAssertEqual(hand.hardTotal, 16)
    }
}
