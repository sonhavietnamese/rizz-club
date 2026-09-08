'use client'

import { formatAddress, formatChartTime, formatNumber, formatPercent } from '@/lib/format'
import { isBinaryMarket, toHuman, type LiveFill, type UnifiedMarket } from '@somnia-chain/markets-sdk'
import { useLiveFills } from '@somnia-chain/markets-sdk/react'
import { useMemo } from 'react'

const filledOrderLimit = 80

function rawToNumber(value: string, decimals: number) {
  try {
    return toHuman(value, decimals)
  } catch {
    return undefined
  }
}

function formatRawAmount(value: string, decimals: number) {
  return formatNumber(rawToNumber(value, decimals))
}

function formatRawPercent(value: string, decimals: number) {
  const formatted = rawToNumber(value, decimals)
  return formatted === undefined ? '--' : formatPercent(formatted)
}

function formatFillTime(value: string) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds)) return '--'
  return formatChartTime(seconds)
}

function fillSideLabel(fill: LiveFill) {
  const side = fill.takerSide ?? fill.makerSide
  if (side) return side.replace('_', ' ')
  if (fill.takerIsBid !== undefined) return fill.takerIsBid ? 'BUY' : 'SELL'
  return fill.kind?.replaceAll('_', ' ') ?? 'FILLED'
}

function fillSideClass(label: string) {
  if (label.includes('BUY')) return 'bg-[#90B64F] text-white'
  if (label.includes('SELL')) return 'bg-[#D6503C] text-white'
  return 'bg-[#D9903D] text-white'
}

function traderLabel(value?: string) {
  return value ? formatAddress(value) : 'Pending'
}

function FillRow({
  fill,
  baseDecimals,
  quoteDecimals,
}: {
  fill: LiveFill
  baseDecimals: number
  quoteDecimals: number
}) {
  const sideLabel = fillSideLabel(fill)
  const price = formatRawPercent(fill.fillPrice, quoteDecimals)
  const amount = formatRawAmount(fill.quantity, baseDecimals)
  const notional = formatRawAmount(fill.quoteQuantity, quoteDecimals)

  return (
    <div className="rounded-md bg-[#F7E0B8] p-3 text-sm font-semibold text-[#3C1F11]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-black ${fillSideClass(sideLabel)}`}>
            {sideLabel}
          </span>
          <p className="mt-2 text-xs font-black uppercase tracking-wider opacity-70">{formatFillTime(fill.timestamp)}</p>
        </div>
        <div className="text-right tabular-nums">
          <p className="text-base font-black">{price}</p>
          <p className="text-xs uppercase tracking-wider opacity-70">{notional} quote</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs tabular-nums">
        <div>
          <p className="font-black uppercase tracking-wider opacity-70">Amount</p>
          <p className="mt-1 break-all">{amount}</p>
        </div>
        <div>
          <p className="font-black uppercase tracking-wider opacity-70">Tx</p>
          <p className="mt-1 break-all">{formatAddress(fill.txHash)}</p>
        </div>
        <div>
          <p className="font-black uppercase tracking-wider opacity-70">Taker</p>
          <p className="mt-1 break-all">{traderLabel(fill.taker)}</p>
        </div>
        <div>
          <p className="font-black uppercase tracking-wider opacity-70">Maker</p>
          <p className="mt-1 break-all">{traderLabel(fill.maker)}</p>
        </div>
      </div>
    </div>
  )
}

export function FilledOrdersPanel({ selectedMarket }: { selectedMarket: UnifiedMarket | null }) {
  const binaryMarket = selectedMarket && isBinaryMarket(selectedMarket.info) ? selectedMarket.info : null
  const fills = useLiveFills(binaryMarket?.poolAddress, filledOrderLimit)
  const marketFills = useMemo(() => {
    const marketId = binaryMarket?.marketId.toLowerCase()
    if (!marketId) return []

    return fills.filter((fill) => fill.market_id.toLowerCase() === marketId)
  }, [binaryMarket?.marketId, fills])
  const quoteVolume = marketFills.reduce(
    (total, fill) => total + (rawToNumber(fill.quoteQuantity, binaryMarket?.quoteDecimals ?? 6) ?? 0),
    0
  )

  return (
    <aside className="rounded-md bg-[#ECD19C] p-5 shadow-[0_8px_0_#673818] lg:col-span-2 xl:col-span-1 xl:max-h-[calc(100vh-4rem)] xl:overflow-hidden">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Filled Orders</p>
          <h2 className="text-2xl font-black">Market Tape</h2>
        </div>
        <div className="rounded-md bg-[#F7E0B8] px-3 py-2 text-right text-xs font-black uppercase tracking-wider">
          <p>{formatNumber(marketFills.length)}</p>
          <p className="opacity-70">fills</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-sm font-semibold">
        <div className="rounded-md bg-[#F7E0B8] px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wider opacity-70">Market</p>
          <p className="mt-1 break-words font-black">{selectedMarket?.symbol ?? '--'}</p>
        </div>
        <div className="rounded-md bg-[#F7E0B8] px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wider opacity-70">Quote Vol</p>
          <p className="mt-1 font-black tabular-nums">{formatNumber(quoteVolume)}</p>
        </div>
      </div>

      <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1 xl:max-h-[calc(100vh-15rem)]">
        {!binaryMarket ? (
          <p className="rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">Select an event market.</p>
        ) : marketFills.length > 0 ? (
          marketFills.map((fill) => (
            <FillRow
              key={fill.id}
              fill={fill}
              baseDecimals={binaryMarket.baseDecimals}
              quoteDecimals={binaryMarket.quoteDecimals}
            />
          ))
        ) : (
          <p className="rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">
            Waiting for filled orders in this market...
          </p>
        )}
      </div>
    </aside>
  )
}
