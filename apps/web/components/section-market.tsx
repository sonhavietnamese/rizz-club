'use client'

import { useCurrentMarket } from '@/hooks/use-current-market'
import { useMarketTrades } from '@/hooks/use-market-trades'
import { toTradeMarkers } from '@/lib/market-trades'
import { useMarketTimeseries, type MarketTimeseriesPoint } from '@/hooks/use-market-timeseries'
import { Liveline, type LivelinePoint, type LivelineSeries, type WindowOption } from '@/lib/liveline'
import {
  ensureDrawablePoints,
  formatChartTime,
  formatPercent,
  formatUpdateTime,
  holdLastValue,
  normalizePoints,
} from '@/lib/utils'
import { isBinaryMarket, type UnifiedMarket } from '@somnia-chain/markets-sdk'
import { cn } from 'cn'
import { useEffect, useMemo, useState } from 'react'

const defaultMarketWindowSeconds = 5 * 60
const yesColor = '#2DD530'
const noColor = '#F87171'

const currentWindows: WindowOption[] = [
  { label: '5m', secs: defaultMarketWindowSeconds },
  { label: '1m', secs: 60 },
]

type MarketValueMode = 'current' | 'overview'

function marketWindowSeconds(market: UnifiedMarket | null) {
  if (!market || !isBinaryMarket(market.info)) return defaultMarketWindowSeconds

  const intervalSeconds = market.info.intervalSec ? Number(market.info.intervalSec) : Number.NaN
  if (Number.isFinite(intervalSeconds) && intervalSeconds > 0) return intervalSeconds

  const tradingStart = Number(market.info.tradingStart)
  const expiry = Number(market.info.expiry)
  if (!Number.isFinite(tradingStart) || !Number.isFinite(expiry)) return defaultMarketWindowSeconds

  return Math.max(60, expiry - tradingStart)
}

function selectedMarketIds(market: UnifiedMarket | null) {
  if (!market) return []

  const ids = [market.id]
  if (isBinaryMarket(market.info)) ids.push(market.info.marketId)
  return [...new Set(ids.map((id) => id.toLowerCase()))]
}

function toYesPoints(
  points: MarketTimeseriesPoint[],
  nowSeconds: number,
  fallbackYes?: number,
  fromTime?: number,
) {
  const historyPoints = normalizePoints(
    points.flatMap((point) => {
      const time = point.t / 1000
      if (!Number.isFinite(time) || !Number.isFinite(point.yes)) return []
      return [{ time, value: point.yes }]
    }),
  )
  const liveValue = historyPoints.at(-1)?.value ?? fallbackYes
  return ensureDrawablePoints(holdLastValue(historyPoints, nowSeconds, 1, fromTime), liveValue, nowSeconds)
}

function toNoPoints(yesPoints: LivelinePoint[], nowSeconds: number, fallbackYes?: number) {
  const history = yesPoints.map((point) => ({ time: point.time, value: 1 - point.value }))
  const fallbackNo = fallbackYes === undefined ? undefined : 1 - fallbackYes
  return ensureDrawablePoints(history, fallbackNo, nowSeconds)
}

function marketStatusLabel(status: 'loading' | 'live' | 'error' | 'empty', lastUpdateMs?: number) {
  if (status === 'live') return lastUpdateMs ? `Live ${formatUpdateTime(lastUpdateMs)}` : 'Live'
  if (status === 'loading') return 'Syncing'
  if (status === 'error') return 'Could not load'
  return 'Waiting'
}

function ModeButton({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-[11px] font-medium transition-[color,transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]',
        isActive
          ? 'bg-white/[0.06] text-white/70'
          : 'text-white/25 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white/40',
      )}
    >
      {children}
    </button>
  )
}

function MarketValueFeed() {
  const { market: selectedMarket, isLoading: isLoadingMarkets } = useCurrentMarket()
  const [mode, setMode] = useState<MarketValueMode>('current')
  const [nowSeconds, setNowSeconds] = useState(0)
  const binaryMarket = selectedMarket && isBinaryMarket(selectedMarket.info) ? selectedMarket.info : null
  const marketIds = useMemo(() => selectedMarketIds(selectedMarket), [selectedMarket])
  const { points, status } = useMarketTimeseries(marketIds)
  const { trades } = useMarketTrades(marketIds)
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

  const latest = points.at(-1)
  const fallbackYes = latest == null ? undefined : latest.yes
  const tradingStart = binaryMarket ? Number(binaryMarket.tradingStart) : Number.NaN
  const chartOrigin = Number.isFinite(tradingStart) ? tradingStart : undefined
  const yesPoints = binaryMarket ? toYesPoints(points, nowSeconds, fallbackYes, chartOrigin) : []
  const noPoints = toNoPoints(yesPoints, nowSeconds, fallbackYes)

  const yesValue = yesPoints.at(-1)?.value ?? fallbackYes
  const noValue = noPoints.at(-1)?.value ?? (fallbackYes === undefined ? undefined : 1 - fallbackYes)
  const series: LivelineSeries[] = [
    { id: 'yes', label: 'YES', data: yesPoints, value: yesValue ?? 0.5, color: yesColor },
    { id: 'no', label: 'NO', data: noPoints, value: noValue ?? 0.5, color: noColor },
  ]
  const tradeMarkers = useMemo(() => toTradeMarkers(trades), [trades])
  const lastUpdateMs = latest?.t
  const feedStatus = isLoadingMarkets
    ? 'loading'
    : status === 'error'
      ? 'error'
      : binaryMarket && status === 'live'
        ? 'live'
        : binaryMarket && status === 'loading'
          ? 'loading'
          : 'empty'
  const isLive = feedStatus === 'live'

  return (
    <section className="section-panel flex min-h-0 flex-col overflow-hidden p-3">
      <header className="mb-2 flex flex-none items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="font-abc-gravity-italic text-[28px] leading-none text-white">YES / NO</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p
              className={cn(
                'font-sans text-sm',
                isLive ? 'text-[#74CC92]' : 'text-[#6A7374]',
                isLive &&
                  "before:mr-2 before:inline-block before:h-2.5 before:w-2.5 before:rounded-full before:bg-[#74CC92] before:content-['']",
              )}
            >
              {marketStatusLabel(feedStatus, lastUpdateMs)}
            </p>
            <div className="flex items-center gap-1">
              <ModeButton isActive={mode === 'current'} onClick={() => setMode('current')}>
                Current
              </ModeButton>
              <ModeButton isActive={mode === 'overview'} onClick={() => setMode('overview')}>
                Overview
              </ModeButton>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-6 text-right">
          <div>
            <p className="font-sans text-sm text-[#2DD530]">YES</p>
            <p className="mt-2 font-sans text-[28px] font-medium tabular-nums tracking-tight text-[#2DD530]">
              {formatPercent(yesValue)}
            </p>
          </div>
          <div>
            <p className="font-sans text-sm text-[#F87171]">NO</p>
            <p className="mt-2 font-sans text-[28px] font-medium tabular-nums tracking-tight text-[#F87171]">
              {formatPercent(noValue)}
            </p>
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 grid grid-rows-[auto_minmax(0,1fr)]">
          <Liveline
            key={`${binaryMarket?.marketId ?? 'empty'}-${mode}`}
            className="min-h-0"
            data={yesPoints}
            value={yesValue ?? 0.5}
            series={binaryMarket ? series : []}
            color={yesColor}
            theme="dark"
            window={chartWindows[0]?.secs ?? defaultMarketWindowSeconds}
            origin={chartOrigin}
            markers={tradeMarkers}
            windows={chartWindows}
            windowStyle="rounded"
            loading={Boolean(binaryMarket) && (isLoadingMarkets || status === 'loading')}
            emptyText={
              binaryMarket
                ? status === 'error'
                  ? 'Could not load market series.'
                  : 'Waiting for live market data...'
                : isLoadingMarkets
                  ? 'Loading live market...'
                  : 'No live 5m market yet.'
            }
            referenceLine={{ value: 0.5, label: '50%' }}
            yDomain={[-0.5, 1.5]}
            formatValue={formatPercent}
            formatTime={formatChartTime}
            lineWidth={3}
            smoothCurve={false}
            pulse={mode === 'current'}
            badgeVariant="minimal"
          />
        </div>
      </div>
    </section>
  )
}

export default function SectionMarket() {
  return <MarketValueFeed />
}
