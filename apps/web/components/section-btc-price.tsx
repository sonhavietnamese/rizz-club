'use client'

import { createDreamDexExchange } from '@/lib/dreamdex'
import { formatChange, formatChartTime, formatUsd, priceStatusLabel } from '@/lib/format'
import { Liveline } from '@/lib/liveline'
import { NO_COLOR, YES_COLOR } from '@/lib/outcome'
import {
  candleWidthForWindow,
  livePriceToPoint,
  normalizePricePoints,
  pointsToCandles,
  tickToLivelinePoint,
} from '@/lib/utils'
import {
  SomniaMarketsProvider,
  useLivePrice,
  useLivePriceFeedInfo,
  useLivePriceTicks,
  useWatchPrice,
} from '@somnia-chain/markets-sdk/react'
import { cn } from 'cn'
import { useMemo, useState } from 'react'

const btcPriceAsset = 'BTC'
const maxBtcPriceTicks = 1_000
const btcOrange = '#F7931A'

const btcPriceWindows = [
  { label: '1m', secs: 60 },
  { label: '5m', secs: 300 },
  { label: '15m', secs: 900 },
  { label: '1h', secs: 3_600 },
]

function BtcPriceFeed() {
  const [chartMode, setChartMode] = useState<'line' | 'candle'>('line')
  const [windowSecs, setWindowSecs] = useState(btcPriceWindows[0].secs)
  const priceStatus = useWatchPrice(btcPriceAsset)
  const btcPrice = useLivePrice(btcPriceAsset)
  const feedInfo = useLivePriceFeedInfo(btcPriceAsset)
  const btcPriceTicks = useLivePriceTicks(btcPriceAsset, maxBtcPriceTicks)
  const btcPricePoints = useMemo(() => {
    const points = btcPriceTicks.map(tickToLivelinePoint)
    if (btcPrice) points.push(livePriceToPoint(btcPrice))
    return normalizePricePoints(points)
  }, [btcPrice, btcPriceTicks])
  const candleWidth = candleWidthForWindow(windowSecs)
  const { candles, liveCandle } = useMemo(
    () => pointsToCandles(btcPricePoints, candleWidth),
    [btcPricePoints, candleWidth],
  )
  const lastBtcPriceUpdate = feedInfo?.updatedAtMs ?? (btcPrice ? btcPrice.blockTimestamp * 1000 : undefined)
  const isLoadingBtcPrice = priceStatus === 'hydrating' && btcPricePoints.length === 0
  const first = btcPricePoints.at(0)
  const latestValue = btcPrice?.price ?? btcPricePoints.at(-1)?.value
  const change = first && latestValue !== undefined ? latestValue - first.value : undefined
  const changePercent = change !== undefined && first && first.value !== 0 ? change / first.value : undefined
  const isLive = priceStatus === 'live'
  const changeTone = change === undefined ? '#6A7374' : change >= 0 ? YES_COLOR : NO_COLOR

  return (
    <section className="section-panel flex min-h-0 flex-col overflow-hidden p-2 px-0 relative">
      <header className="mb-2 flex flex-none items-start justify-between gap-4 absolute top-3 right-3">
        <div className="text-right">
          <p className="font-sans text-[28px] font-medium tabular-nums tracking-tight text-white">
            {formatUsd(latestValue)}
          </p>
          <p
            className="mt-2 font-sans text-sm tabular-nums transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ color: changeTone }}
          >
            {formatChange(change, changePercent)}
          </p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 ">
        <div className="absolute inset-0 grid w-full pr-2 grid-rows-[auto_minmax(0,1fr)]">
          <Liveline
            className="min-h-0"
            data={btcPricePoints}
            value={latestValue ?? 0}
            color={btcOrange}
            theme="dark"
            window={windowSecs}
            windows={btcPriceWindows}
            onWindowChange={setWindowSecs}
            windowStyle="rounded"
            mode="candle"
            lineMode={chartMode === 'line'}
            onModeChange={setChartMode}
            candles={candles}
            candleWidth={candleWidth}
            liveCandle={liveCandle}
            lineData={btcPricePoints}
            lineValue={latestValue}
            loading={isLoadingBtcPrice}
            emptyText="Waiting for BTC price..."
            formatValue={formatUsd}
            formatTime={formatChartTime}
            valueMomentumColor
            exaggerate
            badgeVariant="minimal"
            lineWidth={3}
          />
        </div>
      </div>
    </section>
  )
}

export default function SectionBtcPrice() {
  const exchange = useMemo(() => createDreamDexExchange(), [])

  return (
    <SomniaMarketsProvider client={exchange.client}>
      <BtcPriceFeed />
    </SomniaMarketsProvider>
  )
}
