import XCTest
@testable import BlackjackApp

final class CardTests: XCTestCase {

    // Rank values
    func test_rankValue_numberCards() {
        XCTAssertEqual(Rank.two.bjValue, [2])
        XCTAssertEqual(Rank.nine.bjValue, [9])
        XCTAssertEqual(Rank.ten.bjValue, [10])
    }

    func test_rankValue_faceCards_worth10() {
        XCTAssertEqual(Rank.jack.bjValue, [10])
        XCTAssertEqual(Rank.queen.bjValue, [10])
        XCTAssertEqual(Rank.king.bjValue, [10])
    }

    func test_rankValue_ace_worth1and11() {
        XCTAssertEqual(Rank.ace.bjValue, [1, 11])
    }

    // Card identity
    func test_card_isIdentifiable() {
        let c1 = Card(suit: .hearts, rank: .ace)
        let c2 = Card(suit: .hearts, rank: .ace)
        XCTAssertNotEqual(c1.id, c2.id) // each instance is unique
    }

    func test_card_isEquatable_byRankAndSuit() {
        let c1 = Card(suit: .spades, rank: .king)
        let c2 = Card(suit: .spades, rank: .king)
        XCTAssertEqual(c1, c2)
    }

    func test_card_shortDescription() {
        let card = Card(suit: .diamonds, rank: .ace)
        XCTAssertEqual(card.shortDescription, "A♦")
    }
}
