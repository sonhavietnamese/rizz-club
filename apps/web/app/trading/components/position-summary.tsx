'use client'

import { formatNumber } from './formatters'
import { type OutcomePosition, type Outcome } from './types'

export function PositionSummary({
  selectedPosition,
  selectedOutcome,
  outcomePositions,
  collateralSymbol,
  collateralBalance,
}: {
  selectedPosition: number
  selectedOutcome: Outcome
  outcomePositions: OutcomePosition[]
  collateralSymbol: string
  collateralBalance?: number
}) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-4">
      <div className="flex min-h-[92px] flex-col justify-between rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">
        <span>Selected Position</span>
        <span className="text-xl font-black tabular-nums">
          {formatNumber(selectedPosition)} {selectedOutcome}
        </span>
      </div>
      {outcomePositions.slice(0, 2).map((position) => (
        <div
          key={position.symbol}
          className="flex min-h-[92px] flex-col justify-between rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold"
        >
          <span>{position.label} Shares</span>
          <span className="text-xl font-black tabular-nums">{formatNumber(position.total)}</span>
        </div>
      ))}
      <div className="flex min-h-[92px] flex-col justify-between rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">
        <span>{collateralSymbol}</span>
        <span className="text-xl font-black tabular-nums">{formatNumber(collateralBalance)}</span>
      </div>
    </div>
  )
}
