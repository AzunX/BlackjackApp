import XCTest
@testable import BlackjackApp

final class HandEvaluatorTests: XCTestCase {

    private func card(_ rank: Rank, _ suit: Suit = .spades) -> Card { Card(suit: suit, rank: rank) }

    // MARK: – Hand outcomes

    func test_playerBlackjack_vs_dealerNonBJ_wins_payout1_5() {
        var player = Hand(); player.add(card(.ace)); player.add(card(.king))
        var dealer = Hand(); dealer.add(card(.ten)); dealer.add(card(.seven))
        let result = HandEvaluator.outcome(player: player, dealer: dealer)
        XCTAssertEqual(result.outcome, .blackjack)
        XCTAssertEqual(result.payoutMultiplier, 1.5)
    }

    func test_bothBlackjack_push() {
        var player = Hand(); player.add(card(.ace)); player.add(card(.king))
        var dealer = Hand(); dealer.add(card(.ace)); dealer.add(card(.queen))
        let result = HandEvaluator.outcome(player: player, dealer: dealer)
        XCTAssertEqual(result.outcome, .push)
        XCTAssertEqual(result.payoutMultiplier, 0)
    }

    func test_playerBust_loss() {
        var player = Hand(); player.add(card(.ten)); player.add(card(.ten)); player.add(card(.five))
        var dealer = Hand(); dealer.add(card(.ten)); dealer.add(card(.seven))
        let result = HandEvaluator.outcome(player: player, dealer: dealer)
        XCTAssertEqual(result.outcome, .bust)
        XCTAssertEqual(result.payoutMultiplier, -1)
    }

    func test_dealerBust_playerWins() {
        var player = Hand(); player.add(card(.ten)); player.add(card(.eight))
        var dealer = Hand(); dealer.add(card(.ten)); dealer.add(card(.ten)); dealer.add(card(.five))
        let result = HandEvaluator.outcome(player: player, dealer: dealer)
        XCTAssertEqual(result.outcome, .win)
        XCTAssertEqual(result.payoutMultiplier, 1)
    }

    func test_playerHigher_wins() {
        var player = Hand(); player.add(card(.ten)); player.add(card(.nine))
        var dealer = Hand(); dealer.add(card(.ten)); dealer.add(card(.seven))
        let result = HandEvaluator.outcome(player: player, dealer: dealer)
        XCTAssertEqual(result.outcome, .win)
    }

    func test_dealerHigher_loss() {
        var player = Hand(); player.add(card(.ten)); player.add(card(.six))
        var dealer = Hand(); dealer.add(card(.ten)); dealer.add(card(.nine))
        let result = HandEvaluator.outcome(player: player, dealer: dealer)
        XCTAssertEqual(result.outcome, .loss)
        XCTAssertEqual(result.payoutMultiplier, -1)
    }

    func test_equalScores_push() {
        var player = Hand(); player.add(card(.ten)); player.add(card(.eight))
        var dealer = Hand(); dealer.add(card(.ten)); dealer.add(card(.eight))
        let result = HandEvaluator.outcome(player: player, dealer: dealer)
        XCTAssertEqual(result.outcome, .push)
        XCTAssertEqual(result.payoutMultiplier, 0)
    }

    // MARK: – Perfect Pairs

    func test_perfectPair_sameRankSameSuit() {
        let c1 = Card(suit: .hearts, rank: .eight)
        let c2 = Card(suit: .hearts, rank: .eight)
        let result = HandEvaluator.perfectPairResult(card1: c1, card2: c2)
        XCTAssertEqual(result, .perfectPair)
    }

    func test_colouredPair_sameRankSameColour() {
        let c1 = Card(suit: .hearts, rank: .eight)   // red
        let c2 = Card(suit: .diamonds, rank: .eight) // red
        let result = HandEvaluator.perfectPairResult(card1: c1, card2: c2)
        XCTAssertEqual(result, .colouredPair)
    }

    func test_mixedPair_sameRankDifferentColour() {
        let c1 = Card(suit: .hearts, rank: .eight)  // red
        let c2 = Card(suit: .spades, rank: .eight)  // black
        let result = HandEvaluator.perfectPairResult(card1: c1, card2: c2)
        XCTAssertEqual(result, .mixedPair)
    }

    func test_noPair_differentRanks() {
        let c1 = Card(suit: .hearts, rank: .eight)
        let c2 = Card(suit: .hearts, rank: .seven)
        let result = HandEvaluator.perfectPairResult(card1: c1, card2: c2)
        XCTAssertEqual(result, .none)
    }

    // MARK: – XP

    func test_xpEarned_exactBaseValues() {
        XCTAssertEqual(HandEvaluator.xpEarned(strategyErrors: [], outcome: .blackjack), 50)
        XCTAssertEqual(HandEvaluator.xpEarned(strategyErrors: [], outcome: .win),       20)
        XCTAssertEqual(HandEvaluator.xpEarned(strategyErrors: [], outcome: .push),      10)
        XCTAssertEqual(HandEvaluator.xpEarned(strategyErrors: [], outcome: .loss),       5)
        XCTAssertEqual(HandEvaluator.xpEarned(strategyErrors: [], outcome: .bust),       2)
    }

    func test_xpEarned_penaltyPerError() {
        let error = StrategyError(playerAction: .hit, optimalAction: .stand,
                                  handDescription: "Hard 16", dealerUpCard: "6")
        // win base=20 minus 1 error×8 = 12
        XCTAssertEqual(HandEvaluator.xpEarned(strategyErrors: [error], outcome: .win), 12)
        // 3 errors: 20 - 24 = clamped to 0
        XCTAssertEqual(HandEvaluator.xpEarned(strategyErrors: [error, error, error], outcome: .win), 0)
    }

    // MARK: – 21+3

    private func c(_ rank: Rank, _ suit: Suit) -> Card { Card(suit: suit, rank: rank) }

    func test_21plus3_suitedTrips() {
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.eight, .hearts), playerCard2: c(.eight, .hearts), dealerUp: c(.eight, .hearts))
        XCTAssertEqual(result, .suitedTrips)
    }

    func test_21plus3_threeOfAKind() {
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.eight, .hearts), playerCard2: c(.eight, .clubs), dealerUp: c(.eight, .spades))
        XCTAssertEqual(result, .threeOfAKind)
    }

    func test_21plus3_straightFlush() {
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.seven, .diamonds), playerCard2: c(.eight, .diamonds), dealerUp: c(.nine, .diamonds))
        XCTAssertEqual(result, .straightFlush)
    }

    func test_21plus3_straight_mixedSuits() {
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.seven, .hearts), playerCard2: c(.eight, .clubs), dealerUp: c(.nine, .spades))
        XCTAssertEqual(result, .straight)
    }

    func test_21plus3_flush_notSequential() {
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.two, .spades), playerCard2: c(.five, .spades), dealerUp: c(.king, .spades))
        XCTAssertEqual(result, .flush)
    }

    func test_21plus3_none() {
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.two, .hearts), playerCard2: c(.seven, .clubs), dealerUp: c(.king, .spades))
        XCTAssertEqual(result, .none)
    }

    func test_21plus3_aceHighStraight_QKA() {
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.queen, .hearts), playerCard2: c(.king, .clubs), dealerUp: c(.ace, .spades))
        XCTAssertEqual(result, .straight)
    }

    func test_21plus3_aceLowStraight_A23() {
        // Ace.rawValue=14 sorts last; special-case [2,3,14] must be detected
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.ace, .hearts), playerCard2: c(.two, .clubs), dealerUp: c(.three, .spades))
        XCTAssertEqual(result, .straight)
    }

    func test_21plus3_aceLowStraightFlush_A23sameSuit() {
        let result = HandEvaluator.twentyOnePlusThreeResult(
            playerCard1: c(.ace, .clubs), playerCard2: c(.two, .clubs), dealerUp: c(.three, .clubs))
        XCTAssertEqual(result, .straightFlush)
    }
}
