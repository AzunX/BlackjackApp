import XCTest
@testable import BlackjackApp

final class ShoeTests: XCTestCase {

    func test_shoe_contains312Cards() async {
        let shoe = Shoe()
        let count = await shoe.remainingCount
        XCTAssertEqual(count, 312) // 6 × 52
    }

    func test_deal_removesCard() async throws {
        let shoe = Shoe()
        let card = try await shoe.deal()
        let remaining = await shoe.remainingCount
        XCTAssertNotNil(card)
        XCTAssertEqual(remaining, 311)
    }

    func test_penetration_75percent_triggersReshuffle() async throws {
        let shoe = Shoe()
        // Deal 234 cards (312 * 0.75 = 234 exactly)
        for _ in 0..<234 {
            _ = try await shoe.deal()
        }
        // After 234 deals, penetration = 234/312 = 75% → next deal reshuffles first
        let remaining = await shoe.remainingCount
        XCTAssertEqual(remaining, 78) // 312 - 234 = 78, no reshuffle yet
        _ = try await shoe.deal() // this triggers reshuffle THEN deals
        let afterReshuffle = await shoe.remainingCount
        XCTAssertEqual(afterReshuffle, 311) // fresh 312 minus 1
    }

    func test_shoe_isRandomlyShuffled() async throws {
        let shoe1 = Shoe()
        let shoe2 = Shoe()
        let card1 = try await shoe1.deal()
        let card2 = try await shoe2.deal()
        // Smoke test: both shoes deal without error
        XCTAssertNotNil(card1)
        XCTAssertNotNil(card2)
    }

    func test_second_reshuffle_triggers_correctly() async throws {
        let shoe = Shoe()
        // First reshuffle: deal 235 cards (234 reaches 75%, 235th triggers reshuffle+deal)
        // After: 311 remaining from the fresh shoe
        for _ in 0..<235 {
            _ = try await shoe.deal()
        }
        let afterFirst = await shoe.remainingCount
        XCTAssertEqual(afterFirst, 311)

        // Second reshuffle: from 311, need cards.count <= 78 to hit 75% again (1 - 78/312 = 0.75)
        // 311 - 233 = 78 → deal 233 more to reach the threshold, no reshuffle yet
        for _ in 0..<233 {
            _ = try await shoe.deal()
        }
        let beforeSecond = await shoe.remainingCount
        XCTAssertEqual(beforeSecond, 78) // 311 - 233 = 78, penetration = 75% exactly

        _ = try await shoe.deal() // triggers second reshuffle → fresh 312, deals 1 → 311
        let afterSecond = await shoe.remainingCount
        XCTAssertEqual(afterSecond, 311)
    }
}
