'use client'

import { formatDateTime } from './formatters'
import { isBinaryMarket, type UnifiedMarket } from '@somnia-chain/markets-sdk'

function MarketButton({
  market,
  selected,
  onClick,
}: {
  market: UnifiedMarket
  selected: boolean
  onClick: () => void
}) {
  const info = market.info
  const binary = isBinaryMarket(info) ? info : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-3 text-left shadow-[0_3px_0_#B87545] transition active:translate-y-1 active:shadow-none ${
        selected ? 'bg-[#389591] text-white' : 'bg-[#F7E0B8] text-[#3C1F11]'
      }`}
    >
      <span className="block text-sm font-black">{market.symbol}</span>
      <span className="mt-1 block text-xs font-semibold opacity-75">
        {binary ? `Expires ${formatDateTime(binary.expiry)}` : market.quote}
      </span>
    </button>
  )
}

export function MarketList({
  markets,
  selectedSymbol,
  isLoadingMarkets,
  onReload,
  onSelectMarket,
}: {
  markets: UnifiedMarket[]
  selectedSymbol: string | null
  isLoadingMarkets: boolean
  onReload: () => void
  onSelectMarket: (symbol: string) => void
}) {
  return (
    <section className="rounded-md bg-[#ECD19C] p-5 shadow-[0_8px_0_#673818]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Markets</p>
          <h2 className="text-2xl font-black">Live 5m Events</h2>
        </div>
        <button
          type="button"
          onClick={onReload}
          disabled={isLoadingMarkets}
          className="h-10 rounded-md bg-[#90B64F] px-4 text-xs font-black uppercase tracking-wide text-white shadow-[0_3px_0_#5F7F35] transition active:translate-y-1 active:shadow-none"
        >
          {isLoadingMarkets ? 'Loading' : 'Reload'}
        </button>
      </div>

      <div className="grid max-h-[640px] gap-3 overflow-y-auto pr-1">
        {isLoadingMarkets ? (
          <p className="rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">Loading markets...</p>
        ) : markets.length > 0 ? (
          markets.map((market) => (
            <MarketButton
              key={market.id}
              market={market}
              selected={market.symbol === selectedSymbol}
              onClick={() => onSelectMarket(market.symbol)}
            />
          ))
        ) : (
          <p className="rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">No live 5m event markets.</p>
        )}
      </div>
    </section>
  )
}
