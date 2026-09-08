'use client'

import { useCurrentMarket } from '@/hooks/use-current-market'
import { useMarketTimeseries, type MarketTimeseriesPoint } from '@/hooks/use-market-timeseries'
import { useMarketTrades } from '@/hooks/use-market-trades'
import { Liveline, type LivelinePoint, type LivelineSeries, type WindowOption } from '@/lib/liveline'
import { toTradeMarkers } from '@/lib/market-trades'
import { ensureDrawablePoints, formatChartTime, formatPercent, holdLastValue, normalizePoints } from '@/lib/utils'
import { isBinaryMarket, type UnifiedMarket } from '@somnia-chain/markets-sdk'
import { useEffect, useMemo, useState } from 'react'

const defaultMarketWindowSeconds = 5 * 60
const yesColor = '#2DD530'
const noColor = '#F87171'

const currentWindows: WindowOption[] = [
  { label: '5m', secs: defaultMarketWindowSeconds },
  { label: '1m', secs: 60 },
]

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

function toYesPoints(points: MarketTimeseriesPoint[], nowSeconds: number, fallbackYes?: number, fromTime?: number) {
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

function MarketValueFeed() {
  const { market: selectedMarket, isLoading: isLoadingMarkets } = useCurrentMarket()
  const [nowSeconds, setNowSeconds] = useState(0)
  const binaryMarket = selectedMarket && isBinaryMarket(selectedMarket.info) ? selectedMarket.info : null
  const marketIds = useMemo(() => selectedMarketIds(selectedMarket), [selectedMarket])
  const { points, status } = useMarketTimeseries(marketIds)
  const { trades } = useMarketTrades(marketIds)
  const windowSeconds = marketWindowSeconds(selectedMarket)
  const chartWindows = currentWindows.filter((option) => option.secs <= windowSeconds)

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

  return (
    <section className="section-panel relative flex min-h-0 flex-col overflow-hidden p-3">
      <header className="absolute top-3 right-3 flex flex-none items-start justify-between gap-4 px-1">
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
            key={`${binaryMarket?.marketId ?? 'empty'}`}
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
