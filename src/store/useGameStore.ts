import { create } from 'zustand'
import { TableEngine, TableState } from '../domain/engine/tableEngine'
import { BlackjackAction, GamePhase } from '../domain/models/gameState'
import { PlayerType } from '../domain/models/player'

interface GameStore {
  engine: TableEngine
  tableState: TableState
  isHumanTurn: boolean
  canStartRound: boolean
  startNewRound: () => void
  humanPlayerChose: (action: BlackjackAction) => void
}

const engine = new TableEngine('Joueur', 1000)

export const useGameStore = create<GameStore>((set, get) => {
  engine.onStateChange = (state: TableState) => {
    set({
      tableState: { ...state },
      isHumanTurn: state.phase === GamePhase.PLAYER_TURN,
      canStartRound:
        state.phase === GamePhase.IDLE ||
        state.phase === GamePhase.ROUND_OVER,
    })
  }

  return {
    engine,
    tableState: { ...engine.state },
    isHumanTurn: false,
    canStartRound: true,

    startNewRound: () => {
      void get().engine.startNewRound()
    },

    humanPlayerChose: (action: BlackjackAction) => {
      get().engine.humanPlayerChose(action)
    },
  }
})

export function useHumanPlayer() {
  return useGameStore(s =>
    s.tableState.players.find(p => p.type === PlayerType.HUMAN) ?? null
  )
}
