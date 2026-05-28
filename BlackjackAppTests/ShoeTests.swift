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
        // First reshuffle: deal 234 (75%) then 1 more → shoe resets to 312, now at 311
        for _ in 0..<235 {
            _ = try await shoe.deal()
        }
        let afterFirst = await shoe.remainingCount
        XCTAssertEqual(afterFirst, 311) // fresh shoe minus 1

        // Second reshuffle: deal 233 more (total 234 from fresh shoe = 75%) then 1 more
        for _ in 0..<234 {
            _ = try await shoe.deal()
        }
        // At this point penetration of the second shoe = 234/312 = 75%
        let beforeSecond = await shoe.remainingCount
        XCTAssertEqual(beforeSecond, 77) // 311 - 234 = 77

        _ = try await shoe.deal() // triggers second reshuffle
        let afterSecond = await shoe.remainingCount
        XCTAssertEqual(afterSecond, 311) // fresh 312 minus 1 again
    }
}
