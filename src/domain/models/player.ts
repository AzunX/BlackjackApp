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
