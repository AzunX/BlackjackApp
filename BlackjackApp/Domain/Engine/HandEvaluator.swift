import Foundation

struct EvaluationResult {
    let outcome: HandOutcome
    let payoutMultiplier: Double  // 1.5 = BJ, 1 = win, 0 = push, -1 = loss/bust
}

enum HandEvaluator {

    // MARK: – Win/Loss/Push

    static func outcome(player: Hand, dealer: Hand) -> EvaluationResult {
        // Player bust always loses regardless of dealer
        if player.isBust {
            return EvaluationResult(outcome: .bust, payoutMultiplier: -1)
        }

        // Both blackjack → push
        if player.isBlackjack && dealer.isBlackjack {
            return EvaluationResult(outcome: .push, payoutMultiplier: 0)
        }

        // Player blackjack only → 3:2
        if player.isBlackjack {
            return EvaluationResult(outcome: .blackjack, payoutMultiplier: 1.5)
        }

        // Dealer blackjack beats any non-BJ hand
        // (European no-hole-card: player loses original bet only; doubles/splits
        // that occurred before dealer BJ is revealed are lost at game-loop level)
        if dealer.isBlackjack {
            return EvaluationResult(outcome: .loss, payoutMultiplier: -1)
        }

        // Dealer bust → player wins
        if dealer.isBust {
            return EvaluationResult(outcome: .win, payoutMultiplier: 1)
        }

        let ps = player.bestScore
        let ds = dealer.bestScore
        if      ps > ds  { return EvaluationResult(outcome: .win,  payoutMultiplier:  1) }
        else if ps < ds  { return EvaluationResult(outcome: .loss, payoutMultiplier: -1) }
        else             { return EvaluationResult(outcome: .push, payoutMultiplier:  0) }
    }

    // MARK: – Perfect Pairs

    static func perfectPairResult(card1: Card, card2: Card) -> PerfectPairResult {
        guard card1.rank == card2.rank else { return .none }
        if card1.suit == card2.suit                   { return .perfectPair  }
        if card1.suit.color == card2.suit.color       { return .colouredPair }
        return .mixedPair
    }

    // MARK: – 21+3

    /// Evaluates 21+3 based on player's two cards + dealer upcard.
    static func twentyOnePlusThreeResult(playerCard1: Card, playerCard2: Card, dealerUp: Card) -> TwentyOnePlusThreeResult {
        let cards   = [playerCard1, playerCard2, dealerUp]
        let suits   = cards.map(\.suit)
        let ranks   = cards.map(\.rank).sorted(by: { $0.rawValue < $1.rawValue })

        let allSameSuit = Set(suits).count == 1
        let allSameRank = Set(ranks.map(\.rawValue)).count == 1
        let isSequential: Bool = {
            let values = ranks.map(\.rawValue)
            return values[2] - values[1] == 1 && values[1] - values[0] == 1
        }()

        if allSameRank && allSameSuit { return .suitedTrips   }
        if allSameRank                { return .threeOfAKind  }
        if isSequential && allSameSuit { return .straightFlush }
        if isSequential               { return .straight      }
        if allSameSuit                { return .flush         }
        return .none
    }

    // MARK: – XP Calculation

    /// XP earned for a hand: base points for outcome, penalised for each strategy error.
    static func xpEarned(strategyErrors: [StrategyError], outcome: HandOutcome) -> Int {
        let base: Int
        switch outcome {
        case .blackjack: base = 50
        case .win:       base = 20
        case .push:      base = 10
        case .loss:      base = 5
        case .bust:      base = 2
        }
        let penalty = strategyErrors.count * 8
        return max(0, base - penalty)
    }
}
