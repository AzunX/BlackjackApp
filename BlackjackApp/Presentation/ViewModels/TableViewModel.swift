import Foundation
import Observation

@Observable
@MainActor
final class TableViewModel {

    // MARK: – State (drives all SwiftUI views)

    var gameState: GameState = GameState()

    // Pending human action: set by UI buttons (Hit / Stand / Double / Split).
    // All TableViewModel methods run on @MainActor, so concurrent access is impossible;
    // humanPlayerChose(_:) is always serialised after the continuation is set.
    private var pendingActionContinuation: CheckedContinuation<BlackjackAction, Never>?

    // Strategy errors keyed by hand index, accumulated during the human player's turn.
    private var currentRoundErrorsByHand: [Int: [StrategyError]] = [:]

    // MARK: – Public action input (called by future View layer)

    /// Called by UI when the human player taps Hit / Stand / Double / Split.
    func humanPlayerChose(_ action: BlackjackAction) {
        pendingActionContinuation?.resume(returning: action)
        pendingActionContinuation = nil
    }

    // MARK: – Main Game Loop

    /// Entry point for a new round. Orchestrates the full lifecycle sequentially.
    func startNewRound() async {
        guard canStartRound() else { return }

        // Safety: resume any stale continuation from a forcibly-abandoned round
        pendingActionContinuation?.resume(returning: .stand)
        pendingActionContinuation = nil
        currentRoundErrorsByHand = [:]

        // ── 1. BETTING PHASE ────────────────────────────────────────────────
        gameState.phase = .betting
        // [ANIMATION HOOK] Fade-in bet chips, activate bet circles for each seat.
        await placeBotBets()
        // Suspend here until human confirms bet (future: await humanBetConfirmed())

        // ── 2. INITIAL DEALING ──────────────────────────────────────────────
        gameState.phase = .dealing
        try? await dealInitialCards()
        // [ANIMATION HOOK] Card-deal animation: alternate player/dealer, 2 rounds.

        // ── 3. SIDE BET EVALUATION ──────────────────────────────────────────
        gameState.phase = .sideBetEvaluation
        evaluateSideBets()
        // [ANIMATION HOOK] Flash side-bet result badges.

        // ── 4. PLAYER TURNS ─────────────────────────────────────────────────
        for player in gameState.players {
            guard player.bet > 0 else { continue }

            if player.type == .bot {
                gameState.phase = .botTurn(seatIndex: player.seatIndex)
                await playBotTurn(for: player)
            } else {
                gameState.phase = .playerTurn(seatIndex: player.seatIndex)
                await playHumanTurn(for: player)
            }
            // [ANIMATION HOOK] Seat spotlight moves to next active seat.
        }

        // ── 5. DEALER TURN ──────────────────────────────────────────────────
        gameState.phase = .dealerTurn
        // [ANIMATION HOOK] Flip dealer hole card.
        await playDealerTurn()

        // ── 6. EVALUATION & PAYOUTS ─────────────────────────────────────────
        gameState.phase = .evaluation
        let results = evaluateRound()
        gameState.lastRoundResults = results
        applyPayoutsAndXP(results: results)
        // [ANIMATION HOOK] Chip animations for wins/losses, XP bar fill.

        gameState.phase = .roundOver
        // [ANIMATION HOOK] Show Bilan screen / results overlay.

        // ── 7. SHOE PENETRATION CHECK ───────────────────────────────────────
        await checkAndReshoeIfNeeded()
    }

    // MARK: – Phase Implementations

    private func canStartRound() -> Bool {
        gameState.phase == .idle || gameState.phase == .roundOver
    }

    private func placeBotBets() async {
        for player in gameState.players where player.type == .bot {
            let minBet: Double = 10
            guard player.bankroll >= minBet else { continue }
            player.bet = minBet
        }
    }

    private func dealInitialCards() async throws {
        for player in gameState.players { player.resetForNewRound() }
        gameState.dealer.resetForNewRound()

        // Round 1 — players first, then dealer face-up
        for player in gameState.players where player.bet > 0 {
            let card = try await gameState.shoe.deal()
            player.currentHand.add(card)
            // [ANIMATION HOOK] await animateCardFly(to: player.seatIndex)
        }
        let dealerCard1 = try await gameState.shoe.deal()
        gameState.dealer.currentHand.add(dealerCard1)

        // Round 2 — players, then dealer face-down (European BJ: no peek)
        for player in gameState.players where player.bet > 0 {
            let card = try await gameState.shoe.deal()
            player.currentHand.add(card)
        }
        let dealerCard2 = try await gameState.shoe.deal()
        gameState.dealer.currentHand.add(dealerCard2)
        // [ANIMATION HOOK] Dealer face-down card placement.
    }

    private func evaluateSideBets() {
        guard let dealerUpCard = gameState.dealer.currentHand.cards.first else { return }

        for player in gameState.players {
            guard let wager = player.sideBetWager,
                  player.currentHand.cards.count == 2 else { continue }

            let c1 = player.currentHand.cards[0]
            let c2 = player.currentHand.cards[1]

            switch wager.type {
            case .perfectPairs:
                let ppResult = HandEvaluator.perfectPairResult(card1: c1, card2: c2)
                let sbResult = SideBetResult(wager: wager, perfectPair: ppResult, twentyOnePlusThree: nil)
                player.bankroll += sbResult.netPayout + wager.amount

            case .twentyOnePlusThree:
                let t3Result = HandEvaluator.twentyOnePlusThreeResult(
                    playerCard1: c1, playerCard2: c2, dealerUp: dealerUpCard)
                let sbResult = SideBetResult(wager: wager, perfectPair: nil, twentyOnePlusThree: t3Result)
                player.bankroll += sbResult.netPayout + wager.amount
            }
        }
    }

    private func playBotTurn(for player: Player) async {
        guard let dealerUp = gameState.dealer.currentHand.cards.first else { return }

        for handIndex in player.hands.indices {
            player.activeHandIndex = handIndex
            var hand = player.hands[handIndex]

            // Label the while loop so .stand and .double can break it without exiting
            // the outer for-loop (which would skip remaining split hands).
            handLoop: while !hand.isTerminal {
                let action = StrategyMatrix.shared.getOptimalAction(for: hand, dealerUpCard: dealerUp)
                // [ANIMATION HOOK] await Task.sleep(nanoseconds: 600_000_000)

                switch action {
                case .hit:
                    guard let card = try? await gameState.shoe.deal() else { break handLoop }
                    hand.add(card)

                case .stand:
                    player.hands[handIndex] = hand
                    break handLoop

                case .double:
                    guard let card = try? await gameState.shoe.deal() else { break handLoop }
                    hand.add(card)
                    player.bankroll -= player.bet
                    player.bet     *= 2
                    player.hands[handIndex] = hand
                    break handLoop

                case .split:
                    guard hand.isPair, player.hands.count < 4 else {
                        player.hands[handIndex] = hand
                        break handLoop
                    }
                    var hand1 = Hand(); hand1.add(hand.cards[0])
                    var hand2 = Hand(); hand2.add(hand.cards[1])
                    if let extra = try? await gameState.shoe.deal() { hand1.add(extra) }
                    if let extra = try? await gameState.shoe.deal() { hand2.add(extra) }
                    player.hands[handIndex] = hand1
                    player.hands.insert(hand2, at: handIndex + 1)
                    player.bankroll -= player.bet
                    hand = player.hands[handIndex]
                    continue
                }

                player.hands[handIndex] = hand
            }
        }
    }

    private func playHumanTurn(for player: Player) async {
        guard let dealerUp = gameState.dealer.currentHand.cards.first else { return }

        for handIndex in player.hands.indices {
            player.activeHandIndex = handIndex

            while !player.hands[handIndex].isTerminal {
                // Suspend until UI calls humanPlayerChose(_:)
                let action = await withCheckedContinuation { continuation in
                    self.pendingActionContinuation = continuation
                }

                // Record strategy error per hand index — shown in Bilan at round end
                let optimal = StrategyMatrix.shared.getOptimalAction(
                    for: player.hands[handIndex], dealerUpCard: dealerUp)
                if action != optimal {
                    currentRoundErrorsByHand[handIndex, default: []].append(StrategyError(
                        playerAction:    action,
                        optimalAction:   optimal,
                        handDescription: describeHand(player.hands[handIndex]),
                        dealerUpCard:    dealerUp.shortDescription
                    ))
                }

                switch action {
                case .hit:
                    guard let card = try? await gameState.shoe.deal() else { return }
                    player.hands[handIndex].add(card)

                case .stand:
                    break

                case .double:
                    guard let card = try? await gameState.shoe.deal() else { return }
                    player.hands[handIndex].add(card)
                    player.bankroll -= player.bet
                    player.bet     *= 2
                    break

                case .split:
                    guard player.hands[handIndex].isPair, player.hands.count < 4 else { break }
                    let original = player.hands[handIndex]
                    var hand1 = Hand(); hand1.add(original.cards[0])
                    var hand2 = Hand(); hand2.add(original.cards[1])
                    if let c1 = try? await gameState.shoe.deal() { hand1.add(c1) }
                    if let c2 = try? await gameState.shoe.deal() { hand2.add(c2) }
                    player.hands[handIndex] = hand1
                    player.hands.insert(hand2, at: handIndex + 1)
                    player.bankroll -= player.bet
                    continue
                }

                if action == .stand || action == .double { break }
            }
        }
    }

    private func playDealerTurn() async {
        // European Blackjack: dealer stands on all 17s (hard and soft)
        while !gameState.dealer.currentHand.isBust
                && gameState.dealer.currentHand.bestScore < 17 {
            guard let card = try? await gameState.shoe.deal() else { break }
            gameState.dealer.currentHand.add(card)
            // [ANIMATION HOOK] await Task.sleep(nanoseconds: 500_000_000)
        }
    }

    private func evaluateRound() -> [RoundResult] {
        var results: [RoundResult] = []
        let dealerHand = gameState.dealer.currentHand

        for player in gameState.players {
            guard player.bet > 0 else { continue }

            for (idx, hand) in player.hands.enumerated() {
                let eval   = HandEvaluator.outcome(player: hand, dealer: dealerHand)
                // Errors are tracked per hand index so split hands get independent feedback
                let errors = player.type == .human ? (currentRoundErrorsByHand[idx] ?? []) : []
                let xp     = player.type == .human
                    ? HandEvaluator.xpEarned(strategyErrors: errors, outcome: eval.outcome)
                    : 0

                results.append(RoundResult(
                    playerID:       player.id,
                    handIndex:      idx,
                    outcome:        eval.outcome,
                    netPayout:      player.bet * eval.payoutMultiplier,
                    sideBetResults: [],
                    strategyErrors: errors,
                    xpEarned:       xp
                ))
            }
        }
        return results
    }

    private func applyPayoutsAndXP(results: [RoundResult]) {
        for result in results {
            guard let player = gameState.players.first(where: { $0.id == result.playerID })
            else { continue }

            player.bankroll += result.netPayout
            // Return original bet stake on non-loss outcomes.
            // Note: full per-hand bet tracking (required for correct split/double accounting)
            // will be implemented when the bet-placement flow is added (humanBetConfirmed).
            if result.outcome != .loss && result.outcome != .bust {
                player.bankroll += player.bet
            }

            if player.type == .human {
                player.xp += result.xpEarned
            }
        }
    }

    private func checkAndReshoeIfNeeded() async {
        let penetration = await gameState.shoe.penetration
        if penetration >= Shoe.reshufflePct {
            await gameState.shoe.reshuffle()
            gameState.shoeReshuffled = true
            // [ANIMATION HOOK] Shuffle animation sequence
        } else {
            gameState.shoeReshuffled = false
        }
    }

    // MARK: – Helpers

    private func describeHand(_ hand: Hand) -> String {
        if hand.isPair  { return "Pair of \(hand.cards[0].rank.shortName)s" }
        if hand.isSoft  { return "Soft \(hand.bestScore)" }
        return "Hard \(hand.hardTotal)"
    }
}
