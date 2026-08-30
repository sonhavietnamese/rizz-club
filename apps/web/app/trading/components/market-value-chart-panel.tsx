'use client'

import { formatNumber, formatPercent } from './formatters'
import { Liveline, type LivelinePoint, type LivelineSeries, type WindowOption } from '@/lib/liveline'
import {
  isBinaryMarket,
  toHuman,
  type LiveFill,
  type UnifiedMarket,
} from '@somnia-chain/markets-sdk'
import { useLiveBinaryOrderBook, useLiveFills, useWatchMarket } from '@somnia-chain/markets-sdk/react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

// The SDK's live store retains roughly 400 fills per watched pool, which is
// the complete history available from the watch snapshot plus its live tail.
const marketFillLimit = 400
const defaultMarketWindowSeconds = 15 * 60
const yesColor = '#90B64F'
const noColor = '#D6503C'

type MarketValueMode = 'current' | 'overview'

const currentWindows: WindowOption[] = [
  { label: '1m', secs: 60 },
  { label: '5m', secs: 300 },
  { label: '15m', secs: defaultMarketWindowSeconds },
]

function rawToProbability(value: string | null | undefined, decimals: number) {
  if (value == null) return undefined

  try {
    const probability = toHuman(value, decimals)
    if (!Number.isFinite(probability)) return undefined
    return Math.max(0, Math.min(1, probability))
  } catch {
    return undefined
  }
}

function bigintToProbability(value: bigint | undefined, decimals: number) {
  if (value === undefined) return undefined

  try {
    const probability = toHuman(value, decimals)
    if (!Number.isFinite(probability)) return undefined
    return Math.max(0, Math.min(1, probability))
  } catch {
    return undefined
  }
}

function fillSortValue(fill: LiveFill) {
  return fill.blockNumber * 1_000_000 + fill.logIndex
}

function fillPointTime(timestamp: string, sequence: number) {
  const seconds = Number(timestamp)
  if (!Number.isFinite(seconds)) return undefined

  // Several fills can share a block timestamp. Keep their chain order without
  // changing the visible second-level time labels.
  return seconds + sequence / 1_000_000
}

function normalizePoints(points: LivelinePoint[]) {
  return points
    .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value))
    .sort((left, right) => left.time - right.time)
    .filter((point, index, sorted) => index === sorted.length - 1 || point.time !== sorted[index + 1].time)
}

function marketWindowSeconds(market: UnifiedMarket | null) {
  if (!market || !isBinaryMarket(market.info)) return defaultMarketWindowSeconds

  const intervalSeconds = market.info.intervalSec ? Number(market.info.intervalSec) : Number.NaN
  if (Number.isFinite(intervalSeconds) && intervalSeconds > 0) return intervalSeconds

  const tradingStart = Number(market.info.tradingStart)
  const expiry = Number(market.info.expiry)
  if (!Number.isFinite(tradingStart) || !Number.isFinite(expiry)) return defaultMarketWindowSeconds

  return Math.max(60, expiry - tradingStart)
}

function formatChartTime(seconds: number) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(seconds * 1000))
}

function liveFillToPoint(fill: LiveFill, decimals: number, sequence: number): LivelinePoint | null {
  const value = rawToProbability(fill.fillPrice, decimals)
  const time = fillPointTime(fill.timestamp, sequence)
  if (value === undefined || time === undefined) return null

  return { time, value }
}

function ensureDrawablePoints(points: LivelinePoint[], fallbackValue: number | undefined, nowSeconds: number) {
  if (points.length >= 2) return points

  const value = points.at(-1)?.value ?? fallbackValue
  if (value === undefined || nowSeconds === 0) return points

  const firstTime = points.at(-1)?.time ?? nowSeconds
  const priorTime = firstTime - 1
  return normalizePoints([
    { time: priorTime, value },
    { time: firstTime, value },
  ])
}

function ModeButton({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-xs font-black uppercase tracking-wider transition ${
        isActive ? 'bg-[#3C1F11] text-[#F7E0B8]' : 'bg-[#ECD19C] text-[#3C1F11] opacity-75 hover:opacity-100'
      }`}
    >
      {children}
    </button>
  )
}

export function MarketValueChartPanel({ selectedMarket }: { selectedMarket: UnifiedMarket | null }) {
  const [mode, setMode] = useState<MarketValueMode>('current')
  const [nowSeconds, setNowSeconds] = useState(0)
  const binaryMarket = selectedMarket && isBinaryMarket(selectedMarket.info) ? selectedMarket.info : null
  const fills = useLiveFills(binaryMarket?.poolAddress, marketFillLimit)
  const book = useLiveBinaryOrderBook(binaryMarket?.poolAddress, 5)
  const watchStatus = useWatchMarket(binaryMarket?.poolAddress)
  const windowSeconds = marketWindowSeconds(selectedMarket)
  const chartWindows =
    mode === 'overview'
      ? [{ label: 'Window', secs: windowSeconds }]
      : currentWindows.filter((option) => option.secs <= windowSeconds)

  useEffect(() => {
    const updateNow = () => setNowSeconds(Math.floor(Date.now() / 1000))

    updateNow()
    const timer = window.setInterval(updateNow, 1_000)
    return () => window.clearInterval(timer)
  }, [])

  const marketFills = useMemo(() => {
    const marketId = binaryMarket?.marketId.toLowerCase()
    if (!marketId) return []

    return fills
      .filter((fill) => fill.market_id.toLowerCase() === marketId)
      .sort((left, right) => fillSortValue(left) - fillSortValue(right))
  }, [binaryMarket?.marketId, fills])

  const fallbackYes = rawToProbability(binaryMarket?.lastPrice, binaryMarket?.quoteDecimals ?? 6)
  const bookBid = bigintToProbability(book.yesBids[0]?.price, binaryMarket?.quoteDecimals ?? 6)
  const bookAsk = bigintToProbability(book.yesAsks[0]?.price, binaryMarket?.quoteDecimals ?? 6)
  const bookYes = bookBid !== undefined && bookAsk !== undefined ? (bookBid + bookAsk) / 2 : (bookBid ?? bookAsk)

  const yesPoints = useMemo(() => {
    if (!binaryMarket) return []

    const fillPoints = marketFills.flatMap((fill, index) => {
      const point = liveFillToPoint(fill, binaryMarket.quoteDecimals, index)
      return point ? [point] : []
    })

    const historyPoints = normalizePoints(fillPoints)
    const liveValue = bookYes ?? historyPoints.at(-1)?.value ?? fallbackYes
    const livePoints =
      liveValue === undefined || nowSeconds === 0
        ? []
        : [
            { time: nowSeconds - 1, value: liveValue },
            { time: nowSeconds, value: liveValue },
          ]

    return ensureDrawablePoints(normalizePoints([...historyPoints, ...livePoints]), liveValue, nowSeconds)
  }, [binaryMarket, bookYes, fallbackYes, marketFills, nowSeconds])

  const noPoints = useMemo(() => {
    const points = yesPoints.map((point) => ({ time: point.time, value: 1 - point.value }))
    const fallbackNo = fallbackYes === undefined ? undefined : 1 - fallbackYes
    return ensureDrawablePoints(points, fallbackNo, nowSeconds)
  }, [fallbackYes, nowSeconds, yesPoints])

  const yesValue = yesPoints.at(-1)?.value ?? fallbackYes ?? 0.5
  const noValue = noPoints.at(-1)?.value ?? (fallbackYes === undefined ? 0.5 : 1 - fallbackYes)
  const fillCount = marketFills.length
  const series: LivelineSeries[] = [
    { id: 'yes', label: 'YES', data: yesPoints, value: yesValue, color: yesColor },
    { id: 'no', label: 'NO', data: noPoints, value: noValue, color: noColor },
  ]

  return (
    <div className="mt-5 rounded-md bg-[#F7E0B8] p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider opacity-70">YES / NO Market Value</p>
          <p className="break-all text-sm font-semibold">{selectedMarket?.symbol ?? 'Select an event market'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ModeButton isActive={mode === 'current'} onClick={() => setMode('current')}>
            Current
          </ModeButton>
          <ModeButton isActive={mode === 'overview'} onClick={() => setMode('overview')}>
            Overview
          </ModeButton>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-sm font-semibold">
        <div className="rounded-md bg-[#ECD19C] px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wider opacity-70">YES</p>
          <p className="mt-1 text-base font-black tabular-nums text-[#4E7324]">{formatPercent(yesValue)}</p>
        </div>
        <div className="rounded-md bg-[#ECD19C] px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wider opacity-70">NO</p>
          <p className="mt-1 text-base font-black tabular-nums text-[#9F2E20]">{formatPercent(noValue)}</p>
        </div>
        <div className="rounded-md bg-[#ECD19C] px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wider opacity-70">Fills</p>
          <p className="mt-1 text-base font-black tabular-nums">{formatNumber(fillCount)}</p>
        </div>
      </div>

      <div className="h-[240px] rounded-md bg-white px-2 py-3">
        <Liveline
          key={`${binaryMarket?.marketId ?? 'empty'}-${mode}`}
          data={yesPoints}
          value={yesValue}
          series={binaryMarket ? series : []}
          color={yesColor}
          theme="light"
          window={chartWindows[0]?.secs ?? defaultMarketWindowSeconds}
          windows={chartWindows}
          windowStyle="rounded"
          loading={Boolean(binaryMarket) && watchStatus !== 'live' && yesPoints.length === 0}
          emptyText={binaryMarket ? 'Waiting for market fills...' : 'Select an event market.'}
          referenceLine={{ value: 0.5, label: '50%' }}
          yDomain={[0, 1]}
          formatValue={formatPercent}
          formatTime={formatChartTime}
          lineWidth={3}
          smoothCurve={false}
          pulse={mode === 'current'}
        />
      </div>
    </div>
  )
}
