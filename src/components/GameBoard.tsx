import { useGameStore } from '../store/useGameStore'
import { TableFelt } from './TableFelt'
import { DealerZone } from './DealerZone'
import { Seat } from './Seat'
import { ActionBar } from './ActionBar'

// Display order: Bot2 · Bot1 · Human · Bot3 · Bot4 (left to right)
const SEAT_ORDER = [2, 1, 0, 3, 4]

export function GameBoard() {
  const { tableState } = useGameStore()
  const { players, dealer, phase } = tableState

  const orderedPlayers = SEAT_ORDER
    .map(seatIdx => players.find(p => p.seatIndex === seatIdx))
    .filter((p): p is NonNullable<typeof p> => p != null)

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-felt-edge">
      {/* TABLE SURFACE — 2.5D perspective */}
      <div
        className="flex-1 relative"
        style={{ perspective: '1100px', perspectiveOrigin: '50% 110%' }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotateX(8deg)',
            transformOrigin: 'bottom center',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Green felt + inscriptions */}
          <TableFelt />

          {/* Dealer (top centre) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <DealerZone dealer={dealer} phase={phase} />
          </div>

          {/* 5 player seats (bottom arc) */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-4 pb-6 px-4">
            {orderedPlayers.map((player, displayIdx) => {
              const isCentre = displayIdx === 2
              const offset = (displayIdx - 2) * 5
              const yLift = Math.abs(displayIdx - 2) * 8

              return (
                <div
                  key={player.id}
                  style={{
                    transform: `rotate(${offset}deg) translateY(-${yLift}px)`,
                    zIndex: isCentre ? 10 : 5 - Math.abs(displayIdx - 2),
                  }}
                >
                  <Seat player={player} currentPhase={phase} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ACTION BAR — outside perspective transform */}
      <ActionBar />
    </div>
  )
}
