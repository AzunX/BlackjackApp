import { v4 as uuidv4 } from 'uuid'
import { Shoe } from '../models/shoe'
import { Hand } from '../models/hand'
import {
  Player, PlayerType, createPlayer, createDealer,
  resetPlayerForNewRound, currentHand,
} from '../models/player'
import {
  GamePhase, HandOutcome, RoundResult, StrategyError, BlackjackAction,
} from '../models/gameState'
import { SideBetType, SideBetResult, sideBetNetPayout } from '../models/sideBet'
import { HandEvaluator } from './handEvaluator'
import { StrategyMatrix } from '../strategy/strategyMatrix'
import { cardShortDescription } from '../models/card'

export interface TableState {
  phase: GamePhase
  players: Player[]
  dealer: Player
  shoe: Shoe
  lastRoundResults: RoundResult[]
  shoeReshuffled: boolean
  activeSeatIndex: number | null
}

export class TableEngine {
  state: TableState

  // Promise-based human action suspension (equivalent of Swift's CheckedContinuation)
  private pendingActionResolve: ((action: BlackjackAction) => void) | null = null
  // Per-hand strategy errors for the current round, keyed by hand index
  private roundErrorsByHand: Map<number, StrategyError[]> = new Map()

  // Callback invoked after every state mutation — UI subscribes here
  onStateChange?: (state: TableState) => void

  constructor(humanName = 'Joueur', startingBankroll = 1000) {
    const human = createPlayer(PlayerType.HUMAN, humanName, startingBankroll, 0)
    const bots  = [1, 2, 3, 4].map(i =>
      createPlayer(PlayerType.BOT, `Bot ${i}`, 500, i)
    )
    this.state = {
      phase: GamePhase.IDLE,
      players: [human, ...bots],
      dealer: createDealer(),
      shoe: new Shoe(),
      lastRoundResults: [],
      shoeReshuffled: false,
      activeSeatIndex: null,
    }
  }

  // Called by UI buttons (Hit / Stand / Double / Split)
  humanPlayerChose(action: BlackjackAction): void {
    this.pendingActionResolve?.(action)
    this.pendingActionResolve = null
  }

  private notify(): void { this.onStateChange?.(this.state) }

  private setPhase(phase: GamePhase): void {
    this.state.phase = phase
    this.notify()
  }

  // ── MAIN GAME LOOP ──────────────────────────────────────────────────────────

  async startNewRound(): Promise<void> {
    if (this.state.phase !== GamePhase.IDLE && this.state.phase !== GamePhase.ROUND_OVER) return

    // Safety: discard any stale continuation from a forcibly-abandoned round
    this.pendingActionResolve?.call(null, BlackjackAction.STAND)
    this.pendingActionResolve = null
    this.roundErrorsByHand.clear()

    // ── 1. BETTING PHASE ──────────────────────────────────────────────────────
    this.setPhase(GamePhase.BETTING)
    // [ANIMATION HOOK] fade-in bet chips, activate bet circles
    this.placeBotBets()
    // Future: await this.waitForHumanBet()

    // ── 2. INITIAL DEALING ────────────────────────────────────────────────────
    this.setPhase(GamePhase.DEALING)
    this.dealInitialCards()
    // [ANIMATION HOOK] animated card deal (alternating: players round 1, dealer face-up, players round 2, dealer face-down)

    // ── 3. SIDE BET EVALUATION ────────────────────────────────────────────────
    this.setPhase(GamePhase.SIDE_BET_EVALUATION)
    this.evaluateSideBets()
    // [ANIMATION HOOK] flash side-bet result badges

    // ── 4. PLAYER TURNS ───────────────────────────────────────────────────────
    for (const player of this.state.players) {
      if (player.bet <= 0) continue
      this.state.activeSeatIndex = player.seatIndex

      if (player.type === PlayerType.BOT) {
        this.setPhase(GamePhase.BOT_TURN)
        await this.playBotTurn(player)
      } else {
        this.setPhase(GamePhase.PLAYER_TURN)
        await this.playHumanTurn(player)
      }
      // [ANIMATION HOOK] move seat spotlight to next active seat
    }
    this.state.activeSeatIndex = null

    // ── 5. DEALER TURN ────────────────────────────────────────────────────────
    this.setPhase(GamePhase.DEALER_TURN)
    // [ANIMATION HOOK] flip dealer hole card (European BJ: no peek during player turns)
    this.playDealerTurn()

    // ── 6. EVALUATION & PAYOUTS ───────────────────────────────────────────────
    this.setPhase(GamePhase.EVALUATION)
    const results = this.evaluateRound()
    this.state.lastRoundResults = results
    this.applyPayoutsAndXP(results)
    // [ANIMATION HOOK] chip win/loss animations, XP bar fill

    this.setPhase(GamePhase.ROUND_OVER)
    // [ANIMATION HOOK] show bilan screen with strategy errors

    // ── 7. SHOE PENETRATION CHECK ─────────────────────────────────────────────
    if (this.state.shoe.penetration >= Shoe.RESHUFFLE_PCT) {
      this.state.shoe.reshuffle()
      this.state.shoeReshuffled = true
      // [ANIMATION HOOK] shuffle animation sequence
    } else {
      this.state.shoeReshuffled = false
    }
    this.notify()
  }

  // ── PHASE IMPLEMENTATIONS ────────────────────────────────────────────────────

  private placeBotBets(): void {
    const MIN_BET = 10
    for (const player of this.state.players) {
      if (player.type === PlayerType.BOT && player.bankroll >= MIN_BET) {
        player.bet = MIN_BET
      }
    }
  }

  private dealInitialCards(): void {
    for (const p of this.state.players) resetPlayerForNewRound(p)
    resetPlayerForNewRound(this.state.dealer)

    // Round 1 — players first, then dealer face-up
    for (const p of this.state.players) {
      if (p.bet > 0) currentHand(p).add(this.state.shoe.deal())
    }
    this.state.dealer.hands[0]!.add(this.state.shoe.deal())
    // [ANIMATION HOOK] reveal dealer face-up card

    // Round 2 — players first, then dealer face-down (European BJ: no hole card peek)
    for (const p of this.state.players) {
      if (p.bet > 0) currentHand(p).add(this.state.shoe.deal())
    }
    this.state.dealer.hands[0]!.add(this.state.shoe.deal())
    // [ANIMATION HOOK] dealer second card placed face-down
  }

  private evaluateSideBets(): void {
    const dealerUp = this.state.dealer.hands[0]!.cards[0]
    if (!dealerUp) return

    for (const player of this.state.players) {
      const wager = player.sideBetWager
      if (!wager || currentHand(player).cards.length !== 2) continue
      const [c1, c2] = currentHand(player).cards

      if (wager.type === SideBetType.PERFECT_PAIRS) {
        const ppResult = HandEvaluator.perfectPairResult(c1!, c2!)
        const sbResult: SideBetResult = {
          id: uuidv4(), wager, perfectPair: ppResult, twentyOnePlusThree: null,
        }
        player.bankroll += sideBetNetPayout(sbResult) + wager.amount
      } else {
        const t3Result = HandEvaluator.twentyOnePlusThreeResult(c1!, c2!, dealerUp)
        const sbResult: SideBetResult = {
          id: uuidv4(), wager, perfectPair: null, twentyOnePlusThree: t3Result,
        }
        player.bankroll += sideBetNetPayout(sbResult) + wager.amount
      }
    }
  }

  private async playBotTurn(player: Player): Promise<void> {
    const dealerUp = this.state.dealer.hands[0]!.cards[0]
    if (!dealerUp) return

    for (let hi = 0; hi < player.hands.length; hi++) {
      player.activeHandIndex = hi
      const hand = player.hands[hi]!

      // Labelled loop so .stand and .double can break it without exiting the outer for-loop
      // (which would skip remaining split hands)
      handLoop: while (!hand.isTerminal) {
        const action = StrategyMatrix.shared.getOptimalAction(hand, dealerUp)
        // [ANIMATION HOOK] await delay(600) for bot thinking visual

        switch (action) {
          case BlackjackAction.HIT:
            hand.add(this.state.shoe.deal())
            break

          case BlackjackAction.STAND:
            break handLoop

          case BlackjackAction.DOUBLE:
            hand.add(this.state.shoe.deal())
            player.bankroll -= player.bet
            player.bet *= 2
            break handLoop

          case BlackjackAction.SPLIT:
            if (!hand.isPair || player.hands.length >= 4) break handLoop
            const h1 = new Hand(); h1.add(hand.cards[0]!)
            const h2 = new Hand(); h2.add(hand.cards[1]!)
            h1.add(this.state.shoe.deal())
            h2.add(this.state.shoe.deal())
            player.hands.splice(hi, 1, h1, h2)
            player.bankroll -= player.bet
            break handLoop
        }
        this.notify()
      }
    }
  }

  private async playHumanTurn(player: Player): Promise<void> {
    const dealerUp = this.state.dealer.hands[0]!.cards[0]
    if (!dealerUp) return

    for (let hi = 0; hi < player.hands.length; hi++) {
      player.activeHandIndex = hi
      const hand = player.hands[hi]!

      while (!hand.isTerminal) {
        this.notify()
        // Suspend until UI calls humanPlayerChose()
        const action = await new Promise<BlackjackAction>(resolve => {
          this.pendingActionResolve = resolve
        })

        // Record strategy error per hand index — shown in bilan at round end (a posteriori)
        const optimal = StrategyMatrix.shared.getOptimalAction(hand, dealerUp)
        if (action !== optimal) {
          const errors = this.roundErrorsByHand.get(hi) ?? []
          errors.push({
            playerAction:    action,
            optimalAction:   optimal,
            handDescription: this.describeHand(hand),
            dealerUpCard:    cardShortDescription(dealerUp),
          })
          this.roundErrorsByHand.set(hi, errors)
        }

        switch (action) {
          case BlackjackAction.HIT:
            hand.add(this.state.shoe.deal())
            break

          case BlackjackAction.STAND:
            break

          case BlackjackAction.DOUBLE:
            hand.add(this.state.shoe.deal())
            player.bankroll -= player.bet
            player.bet *= 2
            break

          case BlackjackAction.SPLIT:
            if (!hand.isPair || player.hands.length >= 4) break
            const original = hand
            const s1 = new Hand(); s1.add(original.cards[0]!)
            const s2 = new Hand(); s2.add(original.cards[1]!)
            s1.add(this.state.shoe.deal())
            s2.add(this.state.shoe.deal())
            player.hands.splice(hi, 1, s1, s2)
            player.bankroll -= player.bet
            continue
        }

        if (action === BlackjackAction.STAND || action === BlackjackAction.DOUBLE) break
      }
    }
  }

  private playDealerTurn(): void {
    const hand = this.state.dealer.hands[0]!
    // European BJ: dealer stands on ALL 17s (hard AND soft)
    while (!hand.isBust && hand.bestScore < 17) {
      hand.add(this.state.shoe.deal())
      // [ANIMATION HOOK] reveal each dealer card drawn
    }
  }

  private evaluateRound(): RoundResult[] {
    const results: RoundResult[] = []
    const dealerHand = this.state.dealer.hands[0]!

    for (const player of this.state.players) {
      if (player.bet <= 0) continue

      for (let hi = 0; hi < player.hands.length; hi++) {
        const eval_ = HandEvaluator.outcome(player.hands[hi]!, dealerHand)
        // Errors per hand index to avoid inflating XP penalty across split hands
        const errors = player.type === PlayerType.HUMAN
          ? (this.roundErrorsByHand.get(hi) ?? [])
          : []
        const xp = player.type === PlayerType.HUMAN
          ? HandEvaluator.xpEarned(errors, eval_.outcome)
          : 0

        results.push({
          playerId: player.id,
          handIndex: hi,
          outcome: eval_.outcome,
          netPayout: player.bet * eval_.payoutMultiplier,
          sideBetResults: [],
          strategyErrors: errors,
          xpEarned: xp,
        })
      }
    }
    return results
  }

  private applyPayoutsAndXP(results: RoundResult[]): void {
    for (const result of results) {
      const player = this.state.players.find(p => p.id === result.playerId)
      if (!player) continue

      player.bankroll += result.netPayout
      // Return original bet stake on non-loss outcomes
      // Note: per-hand bet tracking (for correct split/double accounting) added in Step 2
      if (result.outcome !== HandOutcome.LOSS && result.outcome !== HandOutcome.BUST) {
        player.bankroll += player.bet
      }
      if (player.type === PlayerType.HUMAN) {
        player.xp += result.xpEarned
      }
    }
  }

  private describeHand(hand: Hand): string {
    if (hand.isPair) return `Pair of ${hand.cards[0]!.rank}s`
    if (hand.isSoft)  return `Soft ${hand.bestScore}`
    return `Hard ${hand.hardTotal}`
  }
}
