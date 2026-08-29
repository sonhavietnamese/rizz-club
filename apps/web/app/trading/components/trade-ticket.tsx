'use client'

import { formatNumber, formatPercent } from './formatters'
import { type Outcome, type OutcomePosition } from './types'

function outcomePosition(outcomePositions: OutcomePosition[], outcome: Outcome) {
  return outcomePositions.find((position) => position.label === outcome)?.total ?? 0
}

export function TradeTicket({
  selectedOutcome,
  outcomePositions,
  amount,
  slippagePercent,
  bestAsk,
  canTrade,
  canRefreshBook,
  canRefreshBalances,
  isTrading,
  isLoadingBook,
  isLoadingBalances,
  onAmountChange,
  onSlippagePercentChange,
  onBuyPosition,
  onSellPosition,
  onRefreshBook,
  onRefreshBalances,
}: {
  selectedOutcome: Outcome
  outcomePositions: OutcomePosition[]
  amount: string
  slippagePercent: string
  bestAsk?: number
  canTrade: boolean
  canRefreshBook: boolean
  canRefreshBalances: boolean
  isTrading: boolean
  isLoadingBook: boolean
  isLoadingBalances: boolean
  onAmountChange: (value: string) => void
  onSlippagePercentChange: (value: string) => void
  onBuyPosition: () => void
  onSellPosition: (outcome: Outcome) => void
  onRefreshBook: () => void
  onRefreshBalances: () => void
}) {
  const numericAmount = Number(amount)
  const sellAmountIsValid = Number.isFinite(numericAmount) && numericAmount > 0
  const yesPosition = outcomePosition(outcomePositions, 'YES')
  const noPosition = outcomePosition(outcomePositions, 'NO')
  const canSellYes = canTrade && sellAmountIsValid && yesPosition >= numericAmount
  const canSellNo = canTrade && sellAmountIsValid && noPosition >= numericAmount

  return (
    <>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-2 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">
          Outcome
          <span className="text-xl font-black">{selectedOutcome}</span>
        </label>
        <label className="flex flex-col gap-2 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">
          Amount
          <input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            inputMode="decimal"
            className="h-10 rounded-md border-2 border-[#B87545] bg-white px-3 font-black outline-none focus:border-[#389591]"
          />
        </label>
        <label className="flex flex-col gap-2 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">
          Slippage %
          <input
            value={slippagePercent}
            onChange={(event) => onSlippagePercentChange(event.target.value)}
            inputMode="decimal"
            className="h-10 rounded-md border-2 border-[#B87545] bg-white px-3 font-black outline-none focus:border-[#389591]"
          />
        </label>
        <div className="flex flex-col gap-2 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">
          Best Ask
          <span className="flex h-10 items-center rounded-md bg-white px-3 font-black tabular-nums">
            {formatPercent(bestAsk)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBuyPosition}
          disabled={!canTrade || isTrading}
          className="h-12 rounded-md bg-[#D9903D] px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#9B5A21] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isTrading ? 'Trading...' : `Buy ${selectedOutcome}`}
        </button>
        <button
          type="button"
          onClick={() => onSellPosition('YES')}
          disabled={!canSellYes || isTrading}
          className="h-12 rounded-md bg-[#D6503C] px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#8A2D25] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
          title={`YES position: ${formatNumber(yesPosition)}`}
        >
          {isTrading ? 'Trading...' : 'Sell YES'}
        </button>
        <button
          type="button"
          onClick={() => onSellPosition('NO')}
          disabled={!canSellNo || isTrading}
          className="h-12 rounded-md bg-[#D6503C] px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#8A2D25] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
          title={`NO position: ${formatNumber(noPosition)}`}
        >
          {isTrading ? 'Trading...' : 'Sell NO'}
        </button>
        <button
          type="button"
          onClick={onRefreshBook}
          disabled={!canRefreshBook || isLoadingBook}
          className="h-12 rounded-md bg-[#90B64F] px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#5F7F35] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isLoadingBook ? 'Refreshing...' : 'Refresh Book'}
        </button>
        <button
          type="button"
          onClick={onRefreshBalances}
          disabled={!canRefreshBalances || isLoadingBalances}
          className="h-12 rounded-md bg-[#389591] px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#236461] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isLoadingBalances ? 'Refreshing...' : 'Refresh Positions'}
        </button>
      </div>
    </>
  )
}
