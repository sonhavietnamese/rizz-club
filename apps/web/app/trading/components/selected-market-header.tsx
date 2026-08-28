'use client'

import { type Outcome } from './types'
import { isBinaryMarket, type UnifiedMarket } from '@somnia-chain/markets-sdk'

export function SelectedMarketHeader({
  selectedMarket,
  selectedOutcome,
  onSelectOutcome,
}: {
  selectedMarket: UnifiedMarket | null
  selectedOutcome: Outcome
  onSelectOutcome: (outcome: Outcome) => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Selected Market</p>
        <h2 className="break-words text-2xl font-black">{selectedMarket?.symbol ?? 'No market selected'}</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold opacity-75">
          {selectedMarket && isBinaryMarket(selectedMarket.info)
            ? selectedMarket.info.question
            : 'Choose an event market from the list.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-md bg-[#F7E0B8] p-1">
        {(['YES', 'NO'] as const).map((outcome) => (
          <button
            key={outcome}
            type="button"
            onClick={() => onSelectOutcome(outcome)}
            className={`h-10 rounded-md px-4 text-sm font-black transition ${
              selectedOutcome === outcome ? 'bg-[#D9903D] text-white' : 'text-[#3C1F11]'
            }`}
          >
            {outcome}
          </button>
        ))}
      </div>
    </div>
  )
}
