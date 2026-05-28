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

    func test_xpEarned_correctDecision() {
        let xp = HandEvaluator.xpEarned(strategyErrors: [], outcome: .win)
        XCTAssertGreaterThan(xp, 0)
    }

    func test_xpEarned_errorReducesXp() {
        let noError  = HandEvaluator.xpEarned(strategyErrors: [], outcome: .win)
        let withError = HandEvaluator.xpEarned(strategyErrors: [
            StrategyError(playerAction: .hit, optimalAction: .stand,
                          handDescription: "Hard 16", dealerUpCard: "6")
        ], outcome: .win)
        XCTAssertGreaterThan(noError, withError)
    }
}
