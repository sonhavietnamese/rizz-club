'use client'

import { formatNumber, formatPercent, formatUpdateTime } from './formatters'
import { type UnifiedOrderBook } from '@somnia-chain/markets-sdk'

function BookSide({ title, levels }: { title: string; levels: [number, number][] }) {
  const rows = Array.from({ length: 5 }, (_, index) => levels[index])

  return (
    <div className="min-h-[188px] rounded-md bg-[#F7E0B8] p-4 text-[#3C1F11]">
      <div className="flex h-5 items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wider opacity-70">{title}</p>
        {levels.length === 0 && <p className="text-xs font-black uppercase tracking-wider opacity-55">Empty</p>}
      </div>
      <div className="mt-3 grid gap-2">
        {rows.map((level, index) => (
          <div
            key={index}
            className="grid h-6 grid-cols-[minmax(5rem,1fr)_minmax(5rem,1fr)] items-center gap-3 text-sm font-semibold tabular-nums"
          >
            <span>{level ? formatPercent(level[0]) : '--'}</span>
            <span className="text-right">{level ? formatNumber(level[1]) : '--'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrderBookPanel({
  orderBook,
  isLoadingBook,
  lastBookUpdate,
}: {
  orderBook: UnifiedOrderBook | null
  isLoadingBook: boolean
  lastBookUpdate?: number
}) {
  return (
    <>
      <div className="mt-5 flex min-h-5 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-black uppercase tracking-wider opacity-70">Order Book</p>
        <p className="min-w-[7.5rem] text-left text-xs font-black uppercase tracking-wider opacity-70 tabular-nums sm:text-right">
          {isLoadingBook ? 'Syncing' : `Live ${formatUpdateTime(lastBookUpdate)}`}
        </p>
      </div>
      <div className="mt-2 grid auto-rows-fr gap-4 md:grid-cols-2">
        <BookSide title="Bids" levels={orderBook?.bids ?? []} />
        <BookSide title="Asks" levels={orderBook?.asks ?? []} />
      </div>
    </>
  )
}
