export function TableFelt() {
  return (
    <div className="absolute inset-0 felt-texture rounded-[48px_48px_0_0] overflow-hidden pointer-events-none">
      {/* Gold border along top arc */}
      <div className="absolute inset-0 rounded-[48px_48px_0_0] border-t-2 border-x-2 border-gold/20" />

      {/* Centre inscriptions */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-30 select-none">
        <p className="font-casino text-gold text-sm font-bold tracking-[0.3em] uppercase">
          Blackjack Pays 3 To 2
        </p>
        <p className="font-casino text-gold/70 text-[10px] tracking-wider">
          Dealer must draw to 16 and stand on all 17&apos;s
        </p>
        <p className="font-casino text-gold/50 text-[10px] tracking-widest">
          Insurance Pays 2 To 1
        </p>
      </div>

      {/* Decorative arc lines */}
      <svg
        className="absolute bottom-0 left-0 w-full h-40 text-gold/10"
        viewBox="0 0 800 160"
        preserveAspectRatio="none"
      >
        <path d="M 0 160 Q 400 0 800 160"  fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M 20 160 Q 400 20 780 160" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  )
}
