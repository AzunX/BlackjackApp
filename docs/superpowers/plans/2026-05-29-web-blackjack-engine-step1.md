# Web Blackjack Engine — Step 1: Core Engine, Models & Strategy Logic (TypeScript)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the European Blackjack backend engine in TypeScript — same architecture, same rules, same test coverage as the Swift version — with zero UI code.

**Architecture:** Clean layered architecture mirroring the Swift original: `Domain` (models + engine + strategy), `Data` (strategy tables), `Engine` (game loop as a plain class). No React/Zustand yet — those are Step 2. State is managed by a `TableEngine` class with Promise-based human action suspension (equivalent of Swift's `CheckedContinuation`).

**Tech Stack:** TypeScript 5, Vite 6, Vitest 2, `uuid` for card IDs. React/Tailwind/Framer Motion/Zustand installed but unused until Step 2.

---

## File Map

```
src/
  domain/
    models/
      card.ts          # Suit, Rank, Card, CardColor + helper functions
      hand.ts          # Hand class — scoring, soft/hard, bust, BJ
      shoe.ts          # Shoe class — 6-deck, 75% penetration reshuffle
      player.ts        # Player interface, PlayerType, PlayerRank
      sideBet.ts       # PerfectPairResult, TwentyOnePlusThreeResult, SideBetType, SideBetWager, SideBetResult
      gameState.ts     # GamePhase, GameState, RoundResult, HandOutcome, StrategyError
    strategy/
      blackjackAction.ts  # BlackjackAction enum
      strategyKey.ts      # StrategyKey type + strategyKeyToString() for Map lookups
      strategyMatrix.ts   # StrategyMatrix singleton + getOptimalAction()
    engine/
      handEvaluator.ts    # EvaluationResult, outcome(), perfectPairResult(), twentyOnePlusThreeResult(), xpEarned()
      tableEngine.ts      # TableEngine class — async game loop, Promise-based human suspension
  data/
    basicStrategyData.ts  # Full European BJ strategy Map (pair / soft / hard)

src/__tests__/
  card.test.ts
  hand.test.ts
  shoe.test.ts
  strategyMatrix.test.ts
  handEvaluator.test.ts
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Initialize Vite + React + TypeScript project**

  In PowerShell from `c:\Users\fabie\Documents\Projets\BJ`:
  ```powershell
  npm create vite@latest . -- --template react-ts
  ```
  When prompted "Current directory is not empty. Remove existing files and continue?" → type `y` (this will reset non-tracked files; git history is safe).

- [ ] **Step 2: Install all dependencies**

  ```powershell
  npm install
  npm install uuid
  npm install --save-dev @types/uuid vitest @vitest/coverage-v8
  npm install framer-motion zustand
  npm install -D tailwindcss @tailwindcss/vite
  ```

- [ ] **Step 3: Configure Vite with Vitest**

  Replace `vite.config.ts` entirely:
  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'node',
      globals: true,
      include: ['src/__tests__/**/*.test.ts'],
    },
  })
  ```

- [ ] **Step 4: Add test script to package.json**

  In `package.json`, ensure the `scripts` section contains:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage"
  }
  ```

- [ ] **Step 5: Create the source folder structure**

  ```powershell
  mkdir -p src/domain/models, src/domain/strategy, src/domain/engine, src/data, src/__tests__
  ```

- [ ] **Step 6: Verify the project builds**

  ```powershell
  npm run build
  ```
  Expected: build succeeds (may show React template warnings, that's fine).

- [ ] **Step 7: Commit**

  ```powershell
  git add .
  git commit -m "feat: initialize Vite + React + TypeScript project with Vitest"
  ```

---

## Task 2: Card Model

**Files:**
- Create: `src/domain/models/card.ts`
- Create: `src/__tests__/card.test.ts`

- [ ] **Step 1: Write the failing tests**

  Create `src/__tests__/card.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest'
  import {
    Suit, Rank, CardColor,
    rankBjValue, rankShortName, suitColor, cardShortDescription,
    createCard, cardsEqual,
  } from '../domain/models/card'

  describe('Rank bjValue', () => {
    it('number cards return their face value', () => {
      expect(rankBjValue(Rank.TWO)).toEqual([2])
      expect(rankBjValue(Rank.NINE)).toEqual([9])
    })

    it('ten and face cards return [10]', () => {
      expect(rankBjValue(Rank.TEN)).toEqual([10])
      expect(rankBjValue(Rank.JACK)).toEqual([10])
      expect(rankBjValue(Rank.QUEEN)).toEqual([10])
      expect(rankBjValue(Rank.KING)).toEqual([10])
    })

    it('ace returns [1, 11]', () => {
      expect(rankBjValue(Rank.ACE)).toEqual([1, 11])
    })
  })

  describe('Card', () => {
    it('each card has a unique id', () => {
      const c1 = createCard(Suit.HEARTS, Rank.ACE)
      const c2 = createCard(Suit.HEARTS, Rank.ACE)
      expect(c1.id).not.toBe(c2.id)
    })

    it('equality ignores id', () => {
      const c1 = createCard(Suit.SPADES, Rank.KING)
      const c2 = createCard(Suit.SPADES, Rank.KING)
      expect(cardsEqual(c1, c2)).toBe(true)
    })

    it('shortDescription formats correctly', () => {
      const card = createCard(Suit.DIAMONDS, Rank.ACE)
      expect(cardShortDescription(card)).toBe('A♦')
    })
  })

  describe('Suit color', () => {
    it('hearts and diamonds are red', () => {
      expect(suitColor(Suit.HEARTS)).toBe(CardColor.RED)
      expect(suitColor(Suit.DIAMONDS)).toBe(CardColor.RED)
    })

    it('clubs and spades are black', () => {
      expect(suitColor(Suit.CLUBS)).toBe(CardColor.BLACK)
      expect(suitColor(Suit.SPADES)).toBe(CardColor.BLACK)
    })
  })
  ```

- [ ] **Step 2: Run tests — verify they FAIL**

  ```powershell
  npm test
  ```
  Expected: `Error: Cannot find module '../domain/models/card'`

- [ ] **Step 3: Implement card.ts**

  Create `src/domain/models/card.ts`:
  ```typescript
  import { v4 as uuidv4 } from 'uuid'

  export enum Suit {
    HEARTS   = '♥',
    DIAMONDS = '♦',
    CLUBS    = '♣',
    SPADES   = '♠',
  }

  export enum CardColor { RED = 'red', BLACK = 'black' }

  // Numeric enum: rawValue maps directly to Blackjack strategy table keys
  export enum Rank {
    TWO = 2, THREE = 3, FOUR = 4, FIVE = 5, SIX = 6,
    SEVEN = 7, EIGHT = 8, NINE = 9, TEN = 10,
    JACK = 11, QUEEN = 12, KING = 13, ACE = 14,
  }

  export interface Card {
    readonly id: string
    readonly suit: Suit
    readonly rank: Rank
  }

  // All enum members as ordered arrays (numeric enums pollute Object.values with string keys)
  export const ALL_SUITS: Suit[] = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  export const ALL_RANKS: Rank[] = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX,
    Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN,
    Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE,
  ]

  // --- Helper functions ---

  export function rankBjValue(rank: Rank): number[] {
    if (rank === Rank.ACE) return [1, 11]
    if (rank >= Rank.TEN) return [10]  // TEN, JACK, QUEEN, KING
    return [rank as number]
  }

  export function rankShortName(rank: Rank): string {
    switch (rank) {
      case Rank.ACE:   return 'A'
      case Rank.KING:  return 'K'
      case Rank.QUEEN: return 'Q'
      case Rank.JACK:  return 'J'
      default:         return String(rank as number)
    }
  }

  export function suitColor(suit: Suit): CardColor {
    return suit === Suit.HEARTS || suit === Suit.DIAMONDS
      ? CardColor.RED
      : CardColor.BLACK
  }

  export function createCard(suit: Suit, rank: Rank): Card {
    return { id: uuidv4(), suit, rank }
  }

  export function cardsEqual(a: Card, b: Card): boolean {
    return a.suit === b.suit && a.rank === b.rank
  }

  export function cardShortDescription(card: Card): string {
    return `${rankShortName(card.rank)}${card.suit}`
  }
  ```

- [ ] **Step 4: Run tests — verify they PASS**

  ```powershell
  npm test
  ```
  Expected: `card.test.ts — 7 tests passed`

- [ ] **Step 5: Commit**

  ```powershell
  git add src/domain/models/card.ts src/__tests__/card.test.ts
  git commit -m "feat: add Card model (Suit, Rank, CardColor, helpers)"
  ```

---

## Task 3: Hand Model

**Files:**
- Create: `src/domain/models/hand.ts`
- Create: `src/__tests__/hand.test.ts`

- [ ] **Step 1: Write the failing tests**

  Create `src/__tests__/hand.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest'
  import { Hand } from '../domain/models/hand'
  import { createCard, Rank, Suit } from '../domain/models/card'

  const c = (rank: Rank, suit: Suit = Suit.SPADES) => createCard(suit, rank)

  describe('Hand scoring', () => {
    it('empty hand scores 0', () => {
      const h = new Hand()
      expect(h.bestScore).toBe(0)
      expect(h.isBust).toBe(false)
    })

    it('hard hand with no ace', () => {
      const h = new Hand()
      h.add(c(Rank.TEN)); h.add(c(Rank.SIX))
      expect(h.bestScore).toBe(16)
      expect(h.isSoft).toBe(false)
    })

    it('soft hand — ace counts as 11', () => {
      const h = new Hand()
      h.add(c(Rank.ACE)); h.add(c(Rank.SIX))
      expect(h.bestScore).toBe(17)
      expect(h.isSoft).toBe(true)
    })

    it('ace downgrades to 1 when bust otherwise', () => {
      const h = new Hand()
      h.add(c(Rank.ACE)); h.add(c(Rank.TEN)); h.add(c(Rank.FIVE))
      expect(h.bestScore).toBe(16)
      expect(h.isBust).toBe(false)
      expect(h.isSoft).toBe(false)
    })

    it('two aces: one counts 11, one counts 1', () => {
      const h = new Hand()
      h.add(c(Rank.ACE)); h.add(c(Rank.ACE))
      expect(h.bestScore).toBe(12)
      expect(h.isSoft).toBe(true)
    })

    it('three aces: soft 13', () => {
      const h = new Hand()
      h.add(c(Rank.ACE)); h.add(c(Rank.ACE)); h.add(c(Rank.ACE))
      expect(h.bestScore).toBe(13)
      expect(h.isSoft).toBe(true)
    })

    it('all bust — returns lowest total', () => {
      const h = new Hand()
      h.add(c(Rank.KING)); h.add(c(Rank.KING)); h.add(c(Rank.KING))
      expect(h.bestScore).toBe(30)
      expect(h.isBust).toBe(true)
    })

    it('hardTotal always treats ace as 1', () => {
      const h = new Hand()
      h.add(c(Rank.ACE)); h.add(c(Rank.TEN)); h.add(c(Rank.FIVE))
      expect(h.hardTotal).toBe(16)
    })
  })

  describe('Hand detection', () => {
    it('blackjack: 2 cards totalling 21', () => {
      const h = new Hand()
      h.add(c(Rank.ACE)); h.add(c(Rank.KING))
      expect(h.isBlackjack).toBe(true)
      expect(h.bestScore).toBe(21)
    })

    it('21 with 3 cards is NOT blackjack', () => {
      const h = new Hand()
      h.add(c(Rank.SEVEN)); h.add(c(Rank.SEVEN)); h.add(c(Rank.SEVEN))
      expect(h.isBlackjack).toBe(false)
      expect(h.bestScore).toBe(21)
    })

    it('bust', () => {
      const h = new Hand()
      h.add(c(Rank.TEN)); h.add(c(Rank.TEN)); h.add(c(Rank.FIVE))
      expect(h.isBust).toBe(true)
    })

    it('isPair when same rank', () => {
      const h = new Hand()
      h.add(c(Rank.EIGHT, Suit.HEARTS))
      h.add(c(Rank.EIGHT, Suit.CLUBS))
      expect(h.isPair).toBe(true)
    })
  })
  ```

- [ ] **Step 2: Run tests — verify they FAIL**

  ```powershell
  npm test
  ```
  Expected: `Cannot find module '../domain/models/hand'`

- [ ] **Step 3: Implement hand.ts**

  Create `src/domain/models/hand.ts`:
  ```typescript
  import { Card, Rank, rankBjValue } from './card'

  export class Hand {
    private _cards: Card[] = []

    get cards(): readonly Card[] { return this._cards }

    add(card: Card): void { this._cards.push(card) }
    clear(): void { this._cards = [] }

    // Generates every possible score combination for all Ace variants
    private get allScores(): number[] {
      return this._cards.reduce<number[]>((totals, card) => {
        const values = rankBjValue(card.rank)
        return values.flatMap(v => totals.map(t => t + v))
      }, [0])
    }

    get bestScore(): number {
      const valid = this.allScores.filter(s => s <= 21)
      if (valid.length > 0) return Math.max(...valid)
      const all = this.allScores
      return all.length > 0 ? Math.min(...all) : 0
    }

    // Hard total: every Ace counts as 1
    get hardTotal(): number {
      return this._cards.reduce((sum, card) => {
        return sum + (card.rank === Rank.ACE ? 1 : rankBjValue(card.rank)[0])
      }, 0)
    }

    get isSoft(): boolean {
      if (!this._cards.some(c => c.rank === Rank.ACE)) return false
      return this.bestScore <= 21 && this.bestScore !== this.hardTotal
    }

    get isBust(): boolean { return this.bestScore > 21 }

    get isBlackjack(): boolean {
      return this._cards.length === 2 && this.bestScore === 21
    }

    get isPair(): boolean {
      return this._cards.length === 2 && this._cards[0].rank === this._cards[1].rank
    }

    get isTerminal(): boolean { return this.isBust || this.bestScore === 21 }
  }
  ```

- [ ] **Step 4: Run tests — verify they PASS**

  ```powershell
  npm test
  ```
  Expected: `hand.test.ts — 12 tests passed`

- [ ] **Step 5: Commit**

  ```powershell
  git add src/domain/models/hand.ts src/__tests__/hand.test.ts
  git commit -m "feat: add Hand class with soft/hard scoring and BJ detection"
  ```

---

## Task 4: Shoe

**Files:**
- Create: `src/domain/models/shoe.ts`
- Create: `src/__tests__/shoe.test.ts`

- [ ] **Step 1: Write the failing tests**

  Create `src/__tests__/shoe.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest'
  import { Shoe } from '../domain/models/shoe'

  describe('Shoe', () => {
    it('starts with 312 cards (6 × 52)', () => {
      const shoe = new Shoe()
      expect(shoe.remainingCount).toBe(312)
    })

    it('deal removes one card', () => {
      const shoe = new Shoe()
      const card = shoe.deal()
      expect(card).toBeDefined()
      expect(shoe.remainingCount).toBe(311)
    })

    it('penetration is 0 at start', () => {
      const shoe = new Shoe()
      expect(shoe.penetration).toBeCloseTo(0)
    })

    it('penetration reaches 75% after 234 deals, reshuffle on 235th', () => {
      const shoe = new Shoe()
      for (let i = 0; i < 234; i++) shoe.deal()
      expect(shoe.remainingCount).toBe(78)  // no reshuffle yet
      shoe.deal()                            // triggers reshuffle then deals
      expect(shoe.remainingCount).toBe(311)
    })

    it('second reshuffle cycle works correctly', () => {
      const shoe = new Shoe()
      // Trigger first reshuffle at deal 235
      for (let i = 0; i < 235; i++) shoe.deal()
      expect(shoe.remainingCount).toBe(311)
      // From 311, need 311-78=233 more deals to reach 75% threshold again
      for (let i = 0; i < 233; i++) shoe.deal()
      expect(shoe.remainingCount).toBe(78)
      shoe.deal()  // triggers second reshuffle
      expect(shoe.remainingCount).toBe(311)
    })

    it('reshuffle() resets to 312', () => {
      const shoe = new Shoe()
      shoe.deal(); shoe.deal()
      shoe.reshuffle()
      expect(shoe.remainingCount).toBe(312)
    })
  })
  ```

- [ ] **Step 2: Run tests — verify they FAIL**

  ```powershell
  npm test
  ```
  Expected: `Cannot find module '../domain/models/shoe'`

- [ ] **Step 3: Implement shoe.ts**

  Create `src/domain/models/shoe.ts`:
  ```typescript
  import { Card, Suit, Rank, ALL_SUITS, ALL_RANKS, createCard } from './card'

  export class Shoe {
    static readonly DECK_COUNT   = 6
    static readonly RESHUFFLE_PCT = 0.75
    static readonly TOTAL_CARDS  = Shoe.DECK_COUNT * 52  // 312

    private cards: Card[] = []

    constructor() { this.cards = Shoe.buildAndShuffle() }

    get remainingCount(): number { return this.cards.length }

    get penetration(): number {
      return 1 - this.cards.length / Shoe.TOTAL_CARDS
    }

    // Reshuffles automatically when penetration >= 75%, then deals one card.
    deal(): Card {
      if (this.penetration >= Shoe.RESHUFFLE_PCT) {
        this.cards = Shoe.buildAndShuffle()
      }
      const card = this.cards.pop()
      if (!card) throw new Error('Shoe is empty')
      return card
    }

    reshuffle(): void { this.cards = Shoe.buildAndShuffle() }

    private static buildAndShuffle(): Card[] {
      const deck: Card[] = []
      for (let d = 0; d < Shoe.DECK_COUNT; d++) {
        for (const suit of ALL_SUITS) {
          for (const rank of ALL_RANKS) {
            deck.push(createCard(suit, rank))
          }
        }
      }
      // Fisher-Yates shuffle
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j]!, deck[i]!]
      }
      return deck
    }
  }
  ```

- [ ] **Step 4: Run tests — verify they PASS**

  ```powershell
  npm test
  ```
  Expected: `shoe.test.ts — 6 tests passed`

- [ ] **Step 5: Commit**

  ```powershell
  git add src/domain/models/shoe.ts src/__tests__/shoe.test.ts
  git commit -m "feat: add Shoe class with 6-deck build and 75% penetration reshuffle"
  ```

---

## Task 5: SideBet Model

**Files:**
- Create: `src/domain/models/sideBet.ts`

*(No dedicated test file — netPayout logic is tested via HandEvaluator in Task 9.)*

- [ ] **Step 1: Implement sideBet.ts**

  Create `src/domain/models/sideBet.ts`:
  ```typescript
  export enum PerfectPairResult {
    NONE          = 'none',
    MIXED_PAIR    = 'mixedPair',    // same rank, different colours  — payout 5:1
    COLOURED_PAIR = 'colouredPair', // same rank, same colour        — payout 10:1
    PERFECT_PAIR  = 'perfectPair',  // same rank, identical suit     — payout 25:1
  }

  export enum TwentyOnePlusThreeResult {
    NONE          = 'none',
    FLUSH         = 'flush',         // same suit, no sequence        — payout 5:1
    STRAIGHT      = 'straight',      // sequential ranks, mixed suits — payout 10:1
    THREE_OF_KIND = 'threeOfAKind',  // same rank, different suits   — payout 30:1
    STRAIGHT_FLUSH = 'straightFlush',// sequential ranks, same suit  — payout 40:1
    SUITED_TRIPS  = 'suitedTrips',   // same rank AND same suit      — payout 100:1
  }

  export enum SideBetType {
    PERFECT_PAIRS          = 'perfectPairs',
    TWENTY_ONE_PLUS_THREE  = 'twentyOnePlusThree',
  }

  export interface SideBetWager {
    readonly id: string
    readonly type: SideBetType
    readonly amount: number
  }

  export interface SideBetResult {
    readonly id: string
    readonly wager: SideBetWager
    // Invariant: exactly one of these is non-null, matching wager.type
    readonly perfectPair:        PerfectPairResult | null
    readonly twentyOnePlusThree: TwentyOnePlusThreeResult | null
  }

  // Net payout (positive = win, negative = loss). Does NOT include stake return.
  export function sideBetNetPayout(result: SideBetResult): number {
    const stake = result.wager.amount
    if (result.wager.type === SideBetType.PERFECT_PAIRS) {
      switch (result.perfectPair ?? PerfectPairResult.NONE) {
        case PerfectPairResult.MIXED_PAIR:    return stake * 5
        case PerfectPairResult.COLOURED_PAIR: return stake * 10
        case PerfectPairResult.PERFECT_PAIR:  return stake * 25
        default:                              return -stake
      }
    } else {
      switch (result.twentyOnePlusThree ?? TwentyOnePlusThreeResult.NONE) {
        case TwentyOnePlusThreeResult.FLUSH:          return stake * 5
        case TwentyOnePlusThreeResult.STRAIGHT:       return stake * 10
        case TwentyOnePlusThreeResult.THREE_OF_KIND:  return stake * 30
        case TwentyOnePlusThreeResult.STRAIGHT_FLUSH: return stake * 40
        case TwentyOnePlusThreeResult.SUITED_TRIPS:   return stake * 100
        default:                                       return -stake
      }
    }
  }
  ```

- [ ] **Step 2: Verify it compiles**

  ```powershell
  npm run build
  ```
  Expected: Build succeeds (no TypeScript errors).

- [ ] **Step 3: Commit**

  ```powershell
  git add src/domain/models/sideBet.ts
  git commit -m "feat: add SideBet model (PerfectPairs, 21+3 types and payouts)"
  ```

---

## Task 6: Player & GameState Types

**Files:**
- Create: `src/domain/models/player.ts`
- Create: `src/domain/models/gameState.ts`

- [ ] **Step 1: Implement player.ts**

  Create `src/domain/models/player.ts`:
  ```typescript
  import { v4 as uuidv4 } from 'uuid'
  import { Hand } from './hand'
  import { SideBetWager } from './sideBet'

  export enum PlayerType { HUMAN = 'human', BOT = 'bot' }

  export enum PlayerRank {
    BEGINNER = 'Débutant',
    INITIATE = 'Initié',
    PRO      = 'Pro',
    LEGEND   = 'Légende',
  }

  export function xpToPlayerRank(xp: number): PlayerRank {
    if (xp < 500)  return PlayerRank.BEGINNER
    if (xp < 2000) return PlayerRank.INITIATE
    if (xp < 5000) return PlayerRank.PRO
    return PlayerRank.LEGEND
  }

  export interface Player {
    readonly id: string
    readonly type: PlayerType
    readonly seatIndex: number  // 0-4 for seats; -1 for dealer
    name: string
    bankroll: number
    hands: Hand[]
    activeHandIndex: number
    sideBetWager: SideBetWager | null
    xp: number
    bet: number
  }

  export function createPlayer(
    type: PlayerType, name: string, bankroll: number, seatIndex: number
  ): Player {
    return {
      id: uuidv4(),
      type,
      name,
      bankroll,
      seatIndex,
      hands: [new Hand()],
      activeHandIndex: 0,
      sideBetWager: null,
      xp: 0,
      bet: 0,
    }
  }

  export function currentHand(player: Player): Hand {
    const hand = player.hands[player.activeHandIndex]
    if (!hand) throw new Error(`activeHandIndex ${player.activeHandIndex} out of range`)
    return hand
  }

  export function resetPlayerForNewRound(player: Player): void {
    player.hands = [new Hand()]
    player.activeHandIndex = 0
    player.bet = 0
    player.sideBetWager = null
  }

  export function createDealer(): Player {
    return createPlayer(PlayerType.BOT, 'Dealer', Infinity, -1)
  }
  ```

- [ ] **Step 2: Implement gameState.ts**

  Create `src/domain/models/gameState.ts`:
  ```typescript
  import { SideBetResult } from './sideBet'

  // Imported in Task 7 — forward declare to allow GameState to compile
  export enum BlackjackAction {
    HIT    = 'Hit',
    STAND  = 'Stand',
    DOUBLE = 'Double',
    SPLIT  = 'Split',
  }

  export enum GamePhase {
    IDLE                = 'idle',
    BETTING             = 'betting',
    DEALING             = 'dealing',
    SIDE_BET_EVALUATION = 'sideBetEvaluation',
    PLAYER_TURN         = 'playerTurn',
    BOT_TURN            = 'botTurn',
    DEALER_TURN         = 'dealerTurn',
    EVALUATION          = 'evaluation',
    ROUND_OVER          = 'roundOver',
  }

  export enum HandOutcome {
    BLACKJACK = 'blackjack', // 3:2
    WIN       = 'win',       // 1:1
    PUSH      = 'push',      // 0
    LOSS      = 'loss',      // -bet
    BUST      = 'bust',      // -bet (player busted)
  }

  export interface StrategyError {
    readonly playerAction: BlackjackAction
    readonly optimalAction: BlackjackAction
    readonly handDescription: string  // e.g. "Hard 16"
    readonly dealerUpCard: string     // e.g. "6♣"
  }

  export interface RoundResult {
    readonly playerId: string
    readonly handIndex: number
    readonly outcome: HandOutcome
    readonly netPayout: number
    readonly sideBetResults: SideBetResult[]
    readonly strategyErrors: StrategyError[]
    readonly xpEarned: number
  }
  ```

- [ ] **Step 3: Verify compilation**

  ```powershell
  npm run build
  ```
  Expected: Build succeeds.

- [ ] **Step 4: Commit**

  ```powershell
  git add src/domain/models/player.ts src/domain/models/gameState.ts
  git commit -m "feat: add Player and GameState models"
  ```

---

## Task 7: BlackjackAction & StrategyKey

**Files:**
- Create: `src/domain/strategy/blackjackAction.ts`
- Create: `src/domain/strategy/strategyKey.ts`

*(Note: `BlackjackAction` is forward-declared in `gameState.ts` for compilation order. `blackjackAction.ts` re-exports the canonical definition.)*

- [ ] **Step 1: Implement blackjackAction.ts**

  Create `src/domain/strategy/blackjackAction.ts`:
  ```typescript
  // Re-export from gameState to avoid circular deps; canonical definition stays in gameState.ts
  export { BlackjackAction } from '../models/gameState'
  ```

- [ ] **Step 2: Implement strategyKey.ts**

  Create `src/domain/strategy/strategyKey.ts`:
  ```typescript
  import { Rank } from '../models/card'
  import { Hand } from '../models/hand'
  import { Card, rankBjValue } from '../models/card'

  export type StrategyKey =
    | { type: 'pair';  playerRank: Rank;  dealerValue: number }
    | { type: 'soft';  total: number;     dealerValue: number }
    | { type: 'hard';  total: number;     dealerValue: number }

  // Stable string key for Map<string, BlackjackAction> lookup
  export function strategyKeyToString(key: StrategyKey): string {
    switch (key.type) {
      case 'pair': return `pair|${key.playerRank}|${key.dealerValue}`
      case 'soft': return `soft|${key.total}|${key.dealerValue}`
      case 'hard': return `hard|${key.total}|${key.dealerValue}`
    }
  }

  // Priority: pair > soft > hard (pair of Aces is isPair AND isSoft — pair wins)
  export function strategyKeyFromHand(hand: Hand, dealerUpCard: Card): StrategyKey {
    // Ace dealer upcard uses value 11 for table lookup
    const dealerValue = Math.max(...rankBjValue(dealerUpCard.rank))
    if (hand.isPair) {
      return { type: 'pair', playerRank: hand.cards[0]!.rank, dealerValue }
    }
    if (hand.isSoft) {
      return { type: 'soft', total: hand.bestScore, dealerValue }
    }
    return { type: 'hard', total: hand.hardTotal, dealerValue }
  }
  ```

- [ ] **Step 3: Verify compilation**

  ```powershell
  npm run build
  ```
  Expected: Build succeeds.

- [ ] **Step 4: Commit**

  ```powershell
  git add src/domain/strategy/blackjackAction.ts src/domain/strategy/strategyKey.ts
  git commit -m "feat: add BlackjackAction and StrategyKey for matrix lookup"
  ```

---

## Task 8: Strategy Matrix

**Files:**
- Create: `src/data/basicStrategyData.ts`
- Create: `src/domain/strategy/strategyMatrix.ts`
- Create: `src/__tests__/strategyMatrix.test.ts`

- [ ] **Step 1: Write the failing tests**

  Create `src/__tests__/strategyMatrix.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest'
  import { StrategyMatrix } from '../domain/strategy/strategyMatrix'
  import { Hand } from '../domain/models/hand'
  import { createCard, Rank, Suit } from '../domain/models/card'
  import { BlackjackAction } from '../domain/models/gameState'

  const matrix = StrategyMatrix.shared
  const c  = (r: Rank, s: Suit = Suit.CLUBS) => createCard(s, r)
  const h2 = (r1: Rank, r2: Rank) => { const h = new Hand(); h.add(c(r1)); h.add(c(r2)); return h }

  describe('Pair table', () => {
    it('pairs of 8 always split', () => {
      const dealerRanks = [Rank.TWO,Rank.THREE,Rank.FOUR,Rank.FIVE,Rank.SIX,
                           Rank.SEVEN,Rank.EIGHT,Rank.NINE,Rank.TEN,Rank.ACE]
      for (const dr of dealerRanks) {
        const hand = h2(Rank.EIGHT, Rank.EIGHT)
        expect(matrix.getOptimalAction(hand, c(dr))).toBe(BlackjackAction.SPLIT)
      }
    })

    it('pairs of Aces always split', () => {
      const hand = h2(Rank.ACE, Rank.ACE)
      expect(matrix.getOptimalAction(hand, c(Rank.FIVE))).toBe(BlackjackAction.SPLIT)
      expect(matrix.getOptimalAction(hand, c(Rank.TEN))).toBe(BlackjackAction.SPLIT)
    })

    it('pairs of 6 split vs 2-6, hit vs 7+', () => {
      const splitHand = h2(Rank.SIX, Rank.SIX)
      expect(matrix.getOptimalAction(splitHand, c(Rank.SIX))).toBe(BlackjackAction.SPLIT)
      expect(matrix.getOptimalAction(splitHand, c(Rank.SEVEN))).toBe(BlackjackAction.HIT)
    })
  })

  describe('Hard table', () => {
    it('hard 16 vs 6 → stand', () => {
      expect(matrix.getOptimalAction(h2(Rank.TEN, Rank.SIX), c(Rank.SIX))).toBe(BlackjackAction.STAND)
    })

    it('hard 16 vs 7 → hit', () => {
      expect(matrix.getOptimalAction(h2(Rank.TEN, Rank.SIX), c(Rank.SEVEN))).toBe(BlackjackAction.HIT)
    })

    it('hard 11 vs 10 → double', () => {
      expect(matrix.getOptimalAction(h2(Rank.SIX, Rank.FIVE), c(Rank.TEN))).toBe(BlackjackAction.DOUBLE)
    })

    it('hard 11 vs Ace → hit (European BJ)', () => {
      expect(matrix.getOptimalAction(h2(Rank.SIX, Rank.FIVE), c(Rank.ACE))).toBe(BlackjackAction.HIT)
    })

    it('hard 9 vs 2 → hit (NOT double)', () => {
      expect(matrix.getOptimalAction(h2(Rank.FOUR, Rank.FIVE), c(Rank.TWO))).toBe(BlackjackAction.HIT)
    })

    it('hard 10 vs 5 → double', () => {
      expect(matrix.getOptimalAction(h2(Rank.SIX, Rank.FOUR), c(Rank.FIVE))).toBe(BlackjackAction.DOUBLE)
    })

    it('hard 8 vs 5 → hit', () => {
      expect(matrix.getOptimalAction(h2(Rank.THREE, Rank.FIVE), c(Rank.FIVE))).toBe(BlackjackAction.HIT)
    })

    it('king dealer upcard treated as value 10', () => {
      expect(matrix.getOptimalAction(h2(Rank.TEN, Rank.SIX), c(Rank.KING))).toBe(BlackjackAction.HIT)
    })
  })

  describe('Soft table', () => {
    it('soft 18 (A+7) vs Ace → hit', () => {
      expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.SEVEN), c(Rank.ACE))).toBe(BlackjackAction.HIT)
    })

    it('soft 18 (A+7) vs 6 → double', () => {
      expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.SEVEN), c(Rank.SIX))).toBe(BlackjackAction.DOUBLE)
    })

    it('soft 19 (A+8) vs any → stand', () => {
      for (const dr of [Rank.TWO,Rank.FIVE,Rank.TEN,Rank.ACE]) {
        expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.EIGHT), c(dr))).toBe(BlackjackAction.STAND)
      }
    })

    it('soft 17 (A+6) vs 2 → hit', () => {
      expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.SIX), c(Rank.TWO))).toBe(BlackjackAction.HIT)
    })

    it('soft 13 (A+2) vs 5 → double', () => {
      expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.TWO), c(Rank.FIVE))).toBe(BlackjackAction.DOUBLE)
    })

    it('soft 13 (A+2) vs 4 → hit (NOT double)', () => {
      expect(matrix.getOptimalAction(h2(Rank.ACE, Rank.TWO), c(Rank.FOUR))).toBe(BlackjackAction.HIT)
    })
  })
  ```

- [ ] **Step 2: Run tests — verify they FAIL**

  ```powershell
  npm test
  ```
  Expected: `Cannot find module '../domain/strategy/strategyMatrix'`

- [ ] **Step 3: Implement basicStrategyData.ts**

  Create `src/data/basicStrategyData.ts`:
  ```typescript
  import { Rank } from '../domain/models/card'
  import { BlackjackAction } from '../domain/models/gameState'
  import { StrategyKey, strategyKeyToString } from '../domain/strategy/strategyKey'

  type StrategyTable = Map<string, BlackjackAction>

  function entry(key: StrategyKey, action: BlackjackAction): [string, BlackjackAction] {
    return [strategyKeyToString(key), action]
  }

  function buildPairTable(): StrategyTable {
    const t = new Map<string, BlackjackAction>()
    const set = (r: Rank, d: number, a: BlackjackAction) =>
      t.set(strategyKeyToString({ type: 'pair', playerRank: r, dealerValue: d }), a)

    // Aces — always split
    for (let d = 2; d <= 11; d++) set(Rank.ACE, d, BlackjackAction.SPLIT)
    // 2s & 3s — split vs 2-7, hit otherwise
    for (const r of [Rank.TWO, Rank.THREE]) {
      for (let d = 2; d <= 7; d++)  set(r, d, BlackjackAction.SPLIT)
      for (const d of [8,9,10,11])  set(r, d, BlackjackAction.HIT)
    }
    // 4s — always hit
    for (let d = 2; d <= 11; d++) set(Rank.FOUR, d, BlackjackAction.HIT)
    // 5s — treat as hard 10: double vs 2-9, hit vs 10-11
    for (let d = 2; d <= 9; d++)  set(Rank.FIVE, d, BlackjackAction.DOUBLE)
    for (const d of [10,11])      set(Rank.FIVE, d, BlackjackAction.HIT)
    // 6s — split vs 2-6, hit otherwise
    for (let d = 2; d <= 6; d++)  set(Rank.SIX, d, BlackjackAction.SPLIT)
    for (let d = 7; d <= 11; d++) set(Rank.SIX, d, BlackjackAction.HIT)
    // 7s — split vs 2-7, hit otherwise
    for (let d = 2; d <= 7; d++)  set(Rank.SEVEN, d, BlackjackAction.SPLIT)
    for (const d of [8,9,10,11])  set(Rank.SEVEN, d, BlackjackAction.HIT)
    // 8s — always split
    for (let d = 2; d <= 11; d++) set(Rank.EIGHT, d, BlackjackAction.SPLIT)
    // 9s — split vs 2-9 except 7; stand vs 7, 10, A
    for (let d = 2; d <= 6; d++)  set(Rank.NINE, d, BlackjackAction.SPLIT)
    set(Rank.NINE, 7, BlackjackAction.STAND)
    for (const d of [8,9])        set(Rank.NINE, d, BlackjackAction.SPLIT)
    for (const d of [10,11])      set(Rank.NINE, d, BlackjackAction.STAND)
    // 10/J/Q/K — always stand
    for (const r of [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING]) {
      for (let d = 2; d <= 11; d++) set(r, d, BlackjackAction.STAND)
    }
    return t
  }

  function buildSoftTable(): StrategyTable {
    const t = new Map<string, BlackjackAction>()
    const set = (total: number, d: number, a: BlackjackAction) =>
      t.set(strategyKeyToString({ type: 'soft', total, dealerValue: d }), a)

    // Soft 13-14 (A+2, A+3): double vs 5-6, hit otherwise
    for (const total of [13, 14]) {
      for (const d of [5,6])                  set(total, d, BlackjackAction.DOUBLE)
      for (const d of [2,3,4,7,8,9,10,11])   set(total, d, BlackjackAction.HIT)
    }
    // Soft 15-16 (A+4, A+5): double vs 4-6, hit otherwise
    for (const total of [15, 16]) {
      for (const d of [4,5,6])               set(total, d, BlackjackAction.DOUBLE)
      for (const d of [2,3,7,8,9,10,11])    set(total, d, BlackjackAction.HIT)
    }
    // Soft 17 (A+6): double vs 3-6, hit otherwise
    for (const d of [3,4,5,6])               set(17, d, BlackjackAction.DOUBLE)
    for (const d of [2,7,8,9,10,11])         set(17, d, BlackjackAction.HIT)
    // Soft 18 (A+7): double vs 3-6, stand vs 7-8, hit vs 2/9/10/A
    for (const d of [3,4,5,6])               set(18, d, BlackjackAction.DOUBLE)
    for (const d of [7,8])                   set(18, d, BlackjackAction.STAND)
    for (const d of [2,9,10,11])             set(18, d, BlackjackAction.HIT)
    // Soft 19-21: always stand
    for (const total of [19, 20, 21]) {
      for (let d = 2; d <= 11; d++)          set(total, d, BlackjackAction.STAND)
    }
    return t
  }

  function buildHardTable(): StrategyTable {
    const t = new Map<string, BlackjackAction>()
    const set = (total: number, d: number, a: BlackjackAction) =>
      t.set(strategyKeyToString({ type: 'hard', total, dealerValue: d }), a)

    // Hard 5-8: always hit
    for (let total = 5; total <= 8; total++)
      for (let d = 2; d <= 11; d++) set(total, d, BlackjackAction.HIT)
    // Hard 9: double vs 3-6, hit otherwise
    for (const d of [3,4,5,6])           set(9, d, BlackjackAction.DOUBLE)
    for (const d of [2,7,8,9,10,11])    set(9, d, BlackjackAction.HIT)
    // Hard 10: double vs 2-9, hit vs 10-A
    for (let d = 2; d <= 9; d++)         set(10, d, BlackjackAction.DOUBLE)
    for (const d of [10,11])             set(10, d, BlackjackAction.HIT)
    // Hard 11: double vs 2-10, hit vs A
    for (let d = 2; d <= 10; d++)        set(11, d, BlackjackAction.DOUBLE)
    set(11, 11, BlackjackAction.HIT)
    // Hard 12: stand vs 4-6, hit otherwise
    for (const d of [4,5,6])             set(12, d, BlackjackAction.STAND)
    for (const d of [2,3,7,8,9,10,11]) set(12, d, BlackjackAction.HIT)
    // Hard 13-16: stand vs 2-6, hit otherwise
    for (let total = 13; total <= 16; total++) {
      for (let d = 2; d <= 6; d++)       set(total, d, BlackjackAction.STAND)
      for (let d = 7; d <= 11; d++)      set(total, d, BlackjackAction.HIT)
    }
    // Hard 17+: always stand
    for (let total = 17; total <= 21; total++)
      for (let d = 2; d <= 11; d++) set(total, d, BlackjackAction.STAND)

    return t
  }

  // Merge: pair wins over soft, soft wins over hard
  export function buildStrategyTable(): StrategyTable {
    const table = new Map<string, BlackjackAction>()
    for (const [k, v] of buildHardTable())  table.set(k, v)
    for (const [k, v] of buildSoftTable())  table.set(k, v)
    for (const [k, v] of buildPairTable())  table.set(k, v)
    return table
  }
  ```

- [ ] **Step 4: Implement strategyMatrix.ts**

  Create `src/domain/strategy/strategyMatrix.ts`:
  ```typescript
  import { Hand } from '../models/hand'
  import { Card } from '../models/card'
  import { BlackjackAction } from '../models/gameState'
  import { strategyKeyFromHand } from './strategyKey'
  import { buildStrategyTable } from '../../data/basicStrategyData'

  export class StrategyMatrix {
    private static _shared: StrategyMatrix | null = null
    private readonly table: Map<string, BlackjackAction>

    private constructor() {
      this.table = buildStrategyTable()
    }

    static get shared(): StrategyMatrix {
      if (!StrategyMatrix._shared) {
        StrategyMatrix._shared = new StrategyMatrix()
      }
      return StrategyMatrix._shared
    }

    getOptimalAction(hand: Hand, dealerUpCard: Card): BlackjackAction {
      if (hand.isBust || hand.isBlackjack) return BlackjackAction.STAND
      const key = strategyKeyFromHand(hand, dealerUpCard)
      const keyStr = `${key.type}|${'playerRank' in key ? key.playerRank : key.total}|${key.dealerValue}`
      return this.table.get(keyStr) ?? (hand.hardTotal >= 17 ? BlackjackAction.STAND : BlackjackAction.HIT)
    }
  }
  ```

  > Note: `getOptimalAction` reconstructs the key string manually here to avoid a circular import issue between `strategyKey.ts` and `basicStrategyData.ts`. The string format `type|value|dealerValue` must match `strategyKeyToString`.

- [ ] **Step 5: Run tests — verify they PASS**

  ```powershell
  npm test
  ```
  Expected: `strategyMatrix.test.ts — 17 tests passed`

- [ ] **Step 6: Commit**

  ```powershell
  git add src/data/basicStrategyData.ts src/domain/strategy/strategyMatrix.ts src/__tests__/strategyMatrix.test.ts
  git commit -m "feat: full European BJ basic strategy matrix with TypeScript Map lookup"
  ```

---

## Task 9: Hand Evaluator

**Files:**
- Create: `src/domain/engine/handEvaluator.ts`
- Create: `src/__tests__/handEvaluator.test.ts`

- [ ] **Step 1: Write the failing tests**

  Create `src/__tests__/handEvaluator.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest'
  import { HandEvaluator } from '../domain/engine/handEvaluator'
  import { Hand } from '../domain/models/hand'
  import { createCard, Rank, Suit } from '../domain/models/card'
  import { HandOutcome } from '../domain/models/gameState'
  import { PerfectPairResult, TwentyOnePlusThreeResult } from '../domain/models/sideBet'

  const c = (r: Rank, s: Suit = Suit.SPADES) => createCard(s, r)
  function makeHand(...cards: ReturnType<typeof c>[]): Hand {
    const h = new Hand(); cards.forEach(card => h.add(card)); return h
  }

  describe('Hand outcomes', () => {
    it('player blackjack vs non-BJ dealer → blackjack 1.5x', () => {
      const result = HandEvaluator.outcome(
        makeHand(c(Rank.ACE), c(Rank.KING)),
        makeHand(c(Rank.TEN), c(Rank.SEVEN))
      )
      expect(result.outcome).toBe(HandOutcome.BLACKJACK)
      expect(result.payoutMultiplier).toBe(1.5)
    })

    it('both blackjack → push 0x', () => {
      const result = HandEvaluator.outcome(
        makeHand(c(Rank.ACE), c(Rank.KING)),
        makeHand(c(Rank.ACE), c(Rank.QUEEN))
      )
      expect(result.outcome).toBe(HandOutcome.PUSH)
      expect(result.payoutMultiplier).toBe(0)
    })

    it('player bust → bust -1x', () => {
      const result = HandEvaluator.outcome(
        makeHand(c(Rank.TEN), c(Rank.TEN), c(Rank.FIVE)),
        makeHand(c(Rank.TEN), c(Rank.SEVEN))
      )
      expect(result.outcome).toBe(HandOutcome.BUST)
      expect(result.payoutMultiplier).toBe(-1)
    })

    it('dealer bust → player wins 1x', () => {
      const result = HandEvaluator.outcome(
        makeHand(c(Rank.TEN), c(Rank.EIGHT)),
        makeHand(c(Rank.TEN), c(Rank.TEN), c(Rank.FIVE))
      )
      expect(result.outcome).toBe(HandOutcome.WIN)
      expect(result.payoutMultiplier).toBe(1)
    })

    it('player higher → win 1x', () => {
      const result = HandEvaluator.outcome(
        makeHand(c(Rank.TEN), c(Rank.NINE)),
        makeHand(c(Rank.TEN), c(Rank.SEVEN))
      )
      expect(result.outcome).toBe(HandOutcome.WIN)
    })

    it('dealer higher → loss -1x', () => {
      const result = HandEvaluator.outcome(
        makeHand(c(Rank.TEN), c(Rank.SIX)),
        makeHand(c(Rank.TEN), c(Rank.NINE))
      )
      expect(result.outcome).toBe(HandOutcome.LOSS)
      expect(result.payoutMultiplier).toBe(-1)
    })

    it('equal scores → push 0x', () => {
      const result = HandEvaluator.outcome(
        makeHand(c(Rank.TEN), c(Rank.EIGHT)),
        makeHand(c(Rank.TEN), c(Rank.EIGHT))
      )
      expect(result.outcome).toBe(HandOutcome.PUSH)
      expect(result.payoutMultiplier).toBe(0)
    })
  })

  describe('Perfect Pairs', () => {
    it('same rank + same suit → perfectPair', () => {
      expect(HandEvaluator.perfectPairResult(c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.HEARTS)))
        .toBe(PerfectPairResult.PERFECT_PAIR)
    })
    it('same rank + same colour → colouredPair', () => {
      expect(HandEvaluator.perfectPairResult(c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.DIAMONDS)))
        .toBe(PerfectPairResult.COLOURED_PAIR)
    })
    it('same rank + different colour → mixedPair', () => {
      expect(HandEvaluator.perfectPairResult(c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.SPADES)))
        .toBe(PerfectPairResult.MIXED_PAIR)
    })
    it('different ranks → none', () => {
      expect(HandEvaluator.perfectPairResult(c(Rank.EIGHT, Suit.HEARTS), c(Rank.SEVEN, Suit.HEARTS)))
        .toBe(PerfectPairResult.NONE)
    })
  })

  describe('21+3', () => {
    it('same rank + same suit → suitedTrips', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.HEARTS)
      )).toBe(TwentyOnePlusThreeResult.SUITED_TRIPS)
    })
    it('same rank, different suits → threeOfAKind', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.EIGHT, Suit.HEARTS), c(Rank.EIGHT, Suit.CLUBS), c(Rank.EIGHT, Suit.SPADES)
      )).toBe(TwentyOnePlusThreeResult.THREE_OF_KIND)
    })
    it('sequential + same suit → straightFlush', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.SEVEN, Suit.DIAMONDS), c(Rank.EIGHT, Suit.DIAMONDS), c(Rank.NINE, Suit.DIAMONDS)
      )).toBe(TwentyOnePlusThreeResult.STRAIGHT_FLUSH)
    })
    it('sequential + mixed suits → straight', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.SEVEN, Suit.HEARTS), c(Rank.EIGHT, Suit.CLUBS), c(Rank.NINE, Suit.SPADES)
      )).toBe(TwentyOnePlusThreeResult.STRAIGHT)
    })
    it('same suit, not sequential → flush', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.TWO, Suit.SPADES), c(Rank.FIVE, Suit.SPADES), c(Rank.KING, Suit.SPADES)
      )).toBe(TwentyOnePlusThreeResult.FLUSH)
    })
    it('A-2-3 low straight', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.ACE, Suit.HEARTS), c(Rank.TWO, Suit.CLUBS), c(Rank.THREE, Suit.SPADES)
      )).toBe(TwentyOnePlusThreeResult.STRAIGHT)
    })
    it('Q-K-A high straight', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.QUEEN, Suit.HEARTS), c(Rank.KING, Suit.CLUBS), c(Rank.ACE, Suit.SPADES)
      )).toBe(TwentyOnePlusThreeResult.STRAIGHT)
    })
    it('A-2-3 suited → straightFlush', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.ACE, Suit.CLUBS), c(Rank.TWO, Suit.CLUBS), c(Rank.THREE, Suit.CLUBS)
      )).toBe(TwentyOnePlusThreeResult.STRAIGHT_FLUSH)
    })
    it('no match → none', () => {
      expect(HandEvaluator.twentyOnePlusThreeResult(
        c(Rank.TWO, Suit.HEARTS), c(Rank.SEVEN, Suit.CLUBS), c(Rank.KING, Suit.SPADES)
      )).toBe(TwentyOnePlusThreeResult.NONE)
    })
  })

  describe('XP calculation', () => {
    it('exact base values', () => {
      expect(HandEvaluator.xpEarned([], HandOutcome.BLACKJACK)).toBe(50)
      expect(HandEvaluator.xpEarned([], HandOutcome.WIN)).toBe(20)
      expect(HandEvaluator.xpEarned([], HandOutcome.PUSH)).toBe(10)
      expect(HandEvaluator.xpEarned([], HandOutcome.LOSS)).toBe(5)
      expect(HandEvaluator.xpEarned([], HandOutcome.BUST)).toBe(2)
    })

    it('8 XP penalty per error, clamped to 0', () => {
      const err = { playerAction: 'Hit' as any, optimalAction: 'Stand' as any,
                    handDescription: 'Hard 16', dealerUpCard: '6♣' }
      expect(HandEvaluator.xpEarned([err], HandOutcome.WIN)).toBe(12)       // 20-8
      expect(HandEvaluator.xpEarned([err, err, err], HandOutcome.WIN)).toBe(0) // 20-24 clamped
    })
  })
  ```

- [ ] **Step 2: Run tests — verify they FAIL**

  ```powershell
  npm test
  ```
  Expected: `Cannot find module '../domain/engine/handEvaluator'`

- [ ] **Step 3: Implement handEvaluator.ts**

  Create `src/domain/engine/handEvaluator.ts`:
  ```typescript
  import { Hand } from '../models/hand'
  import { Card, suitColor } from '../models/card'
  import { HandOutcome, StrategyError } from '../models/gameState'
  import { PerfectPairResult, TwentyOnePlusThreeResult } from '../models/sideBet'

  export interface EvaluationResult {
    readonly outcome: HandOutcome
    readonly payoutMultiplier: number  // 1.5=BJ, 1=win, 0=push, -1=loss/bust
  }

  export const HandEvaluator = {
    outcome(player: Hand, dealer: Hand): EvaluationResult {
      if (player.isBust)
        return { outcome: HandOutcome.BUST, payoutMultiplier: -1 }
      if (player.isBlackjack && dealer.isBlackjack)
        return { outcome: HandOutcome.PUSH, payoutMultiplier: 0 }
      if (player.isBlackjack)
        return { outcome: HandOutcome.BLACKJACK, payoutMultiplier: 1.5 }
      if (dealer.isBlackjack)
        return { outcome: HandOutcome.LOSS, payoutMultiplier: -1 }
      if (dealer.isBust)
        return { outcome: HandOutcome.WIN, payoutMultiplier: 1 }
      const ps = player.bestScore, ds = dealer.bestScore
      if (ps > ds) return { outcome: HandOutcome.WIN,  payoutMultiplier:  1 }
      if (ps < ds) return { outcome: HandOutcome.LOSS, payoutMultiplier: -1 }
      return { outcome: HandOutcome.PUSH, payoutMultiplier: 0 }
    },

    perfectPairResult(card1: Card, card2: Card): PerfectPairResult {
      if (card1.rank !== card2.rank) return PerfectPairResult.NONE
      if (card1.suit === card2.suit)             return PerfectPairResult.PERFECT_PAIR
      if (suitColor(card1.suit) === suitColor(card2.suit)) return PerfectPairResult.COLOURED_PAIR
      return PerfectPairResult.MIXED_PAIR
    },

    twentyOnePlusThreeResult(p1: Card, p2: Card, dealer: Card): TwentyOnePlusThreeResult {
      const cards = [p1, p2, dealer]
      const suits = cards.map(c => c.suit)
      const values = cards.map(c => c.rank as number).sort((a, b) => a - b)

      const allSameSuit = new Set(suits).size === 1
      const allSameRank = new Set(values).size === 1
      const isSequential =
        (values[2]! - values[1]! === 1 && values[1]! - values[0]! === 1) ||
        // Ace-low: A=14 sorts last, so A-2-3 → [2, 3, 14]
        (values[0] === 2 && values[1] === 3 && values[2] === 14)

      if (allSameRank && allSameSuit) return TwentyOnePlusThreeResult.SUITED_TRIPS
      if (allSameRank)                return TwentyOnePlusThreeResult.THREE_OF_KIND
      if (isSequential && allSameSuit) return TwentyOnePlusThreeResult.STRAIGHT_FLUSH
      if (isSequential)               return TwentyOnePlusThreeResult.STRAIGHT
      if (allSameSuit)                return TwentyOnePlusThreeResult.FLUSH
      return TwentyOnePlusThreeResult.NONE
    },

    xpEarned(errors: StrategyError[], outcome: HandOutcome): number {
      const base: Record<HandOutcome, number> = {
        [HandOutcome.BLACKJACK]: 50,
        [HandOutcome.WIN]:       20,
        [HandOutcome.PUSH]:      10,
        [HandOutcome.LOSS]:       5,
        [HandOutcome.BUST]:       2,
      }
      return Math.max(0, base[outcome] - errors.length * 8)
    },
  }
  ```

- [ ] **Step 4: Run tests — verify they PASS**

  ```powershell
  npm test
  ```
  Expected: `handEvaluator.test.ts — 22 tests passed`

- [ ] **Step 5: Commit**

  ```powershell
  git add src/domain/engine/handEvaluator.ts src/__tests__/handEvaluator.test.ts
  git commit -m "feat: add HandEvaluator (outcomes, PerfectPairs, 21+3 with A-2-3 low, XP)"
  ```

---

## Task 10: TableEngine — Async Game Loop

**Files:**
- Create: `src/domain/engine/tableEngine.ts`

*(No unit tests — the async game loop integrates all prior components and requires integration/E2E testing in Step 2.)*

- [ ] **Step 1: Implement tableEngine.ts**

  Create `src/domain/engine/tableEngine.ts`:
  ```typescript
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
  import { v4 as uuidv4 } from 'uuid'

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

    // Promise-based human action suspension (equivalent of Swift CheckedContinuation)
    private pendingActionResolve: ((action: BlackjackAction) => void) | null = null
    // Per-hand strategy errors for the current round
    private roundErrorsByHand: Map<number, StrategyError[]> = new Map()

    // Called by UI to notify the engine of a state change
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

    // ── MAIN GAME LOOP ────────────────────────────────────────────────────────

    async startNewRound(): Promise<void> {
      if (this.state.phase !== GamePhase.IDLE && this.state.phase !== GamePhase.ROUND_OVER) return

      // Safety: discard any stale continuation
      this.pendingActionResolve?.call(null, BlackjackAction.STAND)
      this.pendingActionResolve = null
      this.roundErrorsByHand.clear()

      // ── 1. BETTING PHASE ──────────────────────────────────────────────────
      this.setPhase(GamePhase.BETTING)
      // [ANIMATION HOOK] fade-in bet chips
      this.placeBotBets()
      // Future: await this.waitForHumanBet()

      // ── 2. INITIAL DEALING ─────────────────────────────────────────────────
      this.setPhase(GamePhase.DEALING)
      this.dealInitialCards()
      // [ANIMATION HOOK] animated card deal

      // ── 3. SIDE BET EVALUATION ─────────────────────────────────────────────
      this.setPhase(GamePhase.SIDE_BET_EVALUATION)
      this.evaluateSideBets()
      // [ANIMATION HOOK] flash side-bet badges

      // ── 4. PLAYER TURNS ────────────────────────────────────────────────────
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
        // [ANIMATION HOOK] move seat spotlight
      }
      this.state.activeSeatIndex = null

      // ── 5. DEALER TURN ─────────────────────────────────────────────────────
      this.setPhase(GamePhase.DEALER_TURN)
      // [ANIMATION HOOK] flip dealer hole card
      this.playDealerTurn()

      // ── 6. EVALUATION & PAYOUTS ────────────────────────────────────────────
      this.setPhase(GamePhase.EVALUATION)
      const results = this.evaluateRound()
      this.state.lastRoundResults = results
      this.applyPayoutsAndXP(results)
      // [ANIMATION HOOK] chip win/loss animations, XP bar fill

      this.setPhase(GamePhase.ROUND_OVER)
      // [ANIMATION HOOK] show bilan screen

      // ── 7. SHOE PENETRATION CHECK ──────────────────────────────────────────
      if (this.state.shoe.penetration >= Shoe.RESHUFFLE_PCT) {
        this.state.shoe.reshuffle()
        this.state.shoeReshuffled = true
        // [ANIMATION HOOK] shuffle animation
      } else {
        this.state.shoeReshuffled = false
      }
      this.notify()
    }

    // ── PHASE IMPLEMENTATIONS ────────────────────────────────────────────────

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

      // Round 1 — players then dealer face-up
      for (const p of this.state.players) {
        if (p.bet > 0) currentHand(p).add(this.state.shoe.deal())
      }
      this.state.dealer.hands[0]!.add(this.state.shoe.deal())
      // [ANIMATION HOOK] reveal dealer face-up card

      // Round 2 — players then dealer face-down (European BJ: no peek)
      for (const p of this.state.players) {
        if (p.bet > 0) currentHand(p).add(this.state.shoe.deal())
      }
      this.state.dealer.hands[0]!.add(this.state.shoe.deal())
      // [ANIMATION HOOK] dealer card placed face-down
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

        handLoop: while (!hand.isTerminal) {
          const action = StrategyMatrix.shared.getOptimalAction(hand, dealerUp)
          // [ANIMATION HOOK] await delay(600) for bot thinking

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
              break  // continue outer for-loop from new hi
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

          // Record strategy error silently (shown in bilan at round end)
          const optimal = StrategyMatrix.shared.getOptimalAction(hand, dealerUp)
          if (action !== optimal) {
            const errors = this.roundErrorsByHand.get(hi) ?? []
            errors.push({
              playerAction: action,
              optimalAction: optimal,
              handDescription: this.describeHand(hand),
              dealerUpCard: cardShortDescription(dealerUp),
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
              const h1 = new Hand(); h1.add(hand.cards[0]!)
              const h2 = new Hand(); h2.add(hand.cards[1]!)
              if (true) { h1.add(this.state.shoe.deal()); h2.add(this.state.shoe.deal()) }
              player.hands.splice(hi, 1, h1, h2)
              player.bankroll -= player.bet
              continue
          }

          if (action === BlackjackAction.STAND || action === BlackjackAction.DOUBLE) break
        }
      }
    }

    private playDealerTurn(): void {
      const hand = this.state.dealer.hands[0]!
      // European BJ: dealer stands on ALL 17s (hard and soft)
      while (!hand.isBust && hand.bestScore < 17) {
        hand.add(this.state.shoe.deal())
        // [ANIMATION HOOK] reveal dealer card
      }
    }

    private evaluateRound(): RoundResult[] {
      const results: RoundResult[] = []
      const dealerHand = this.state.dealer.hands[0]!

      for (const player of this.state.players) {
        if (player.bet <= 0) continue

        for (let hi = 0; hi < player.hands.length; hi++) {
          const eval_ = HandEvaluator.outcome(player.hands[hi]!, dealerHand)
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
      if (hand.isSoft) return `Soft ${hand.bestScore}`
      return `Hard ${hand.hardTotal}`
    }
  }
  ```

- [ ] **Step 2: Verify compilation**

  ```powershell
  npm run build
  ```
  Expected: Build succeeds.

- [ ] **Step 3: Commit**

  ```powershell
  git add src/domain/engine/tableEngine.ts
  git commit -m "feat: add TableEngine async game loop with Promise-based human suspension"
  ```

---

## Task 11: Final Integration — Full Test Run + CI Update

- [ ] **Step 1: Run the complete test suite**

  ```powershell
  npm test
  ```
  Expected output:
  ```
  ✓ src/__tests__/card.test.ts           (7 tests)
  ✓ src/__tests__/hand.test.ts           (12 tests)
  ✓ src/__tests__/shoe.test.ts           (6 tests)
  ✓ src/__tests__/strategyMatrix.test.ts (17 tests)
  ✓ src/__tests__/handEvaluator.test.ts  (22 tests)
  Test Files  5 passed (5)
  Tests       64 passed (64)
  ```

- [ ] **Step 2: Update GitHub Actions CI**

  Replace `.github/workflows/test.yml`:
  ```yaml
  name: Tests

  on:
    push:
      branches: ["*"]
    pull_request:
      branches: ["*"]

  jobs:
    test-web:
      name: TypeScript Engine (Node.js)
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'
        - run: npm ci
        - run: npm test
  ```

- [ ] **Step 3: Final commit and push**

  ```powershell
  git add .
  git commit -m "feat: Step 1 web complete — TypeScript Blackjack engine, 64 tests, CI updated"
  git push
  ```

---

## Self-Review Checklist

### Spec Coverage

| Requirement | Task |
|-------------|------|
| Suit, Rank, Card avec bjValue et Ace duality | Task 2 |
| Shoe 6 jeux, 75% penetration reshuffle | Task 4 |
| SideBetType/Wager/Result + payouts | Task 5 |
| Hand : Hard/Soft scoring, Bust, BJ | Task 3 |
| Player, PlayerType, bankroll, split hands | Task 6 |
| GamePhase, GameState, HandOutcome, StrategyError | Task 6 |
| BlackjackAction enum | Task 7 |
| StrategyKey (pair/soft/hard) avec Map lookup | Tasks 7 & 8 |
| getOptimalAction() | Task 8 |
| Exemples concrets : pairs of 8, hard 16 vs 6, soft 18 vs A | Task 8 tests |
| Bot joue stratégie de base | Task 10 |
| Human suspension via Promise | Task 10 |
| Croupier s'arrête à tous les 17 (hard ET soft) | Task 10 |
| Détection erreurs stratégie (a posteriori, par main) | Task 10 |
| XP system + rangs (Débutant→Légende) | Tasks 6 & 9 |
| Vérification pénétration sabot | Task 10 |
| Side bets PerfectPairs + 21+3 évalués | Tasks 5 & 9 |
| Table 5 places | Tasks 6 & 10 |
| Règles BJ Européen (pas de hole card, dealer s17) | Tasks 8 & 10 |
| A-2-3 low straight détecté | Task 9 |
| CI GitHub Actions (Node.js, gratuit, sans Mac) | Task 11 |

Toutes les exigences sont couvertes.
