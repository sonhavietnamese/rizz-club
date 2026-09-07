'use client'

import { createDreamDexExchange } from '@/lib/dreamdex'
import { Liveline } from '@/lib/liveline'
import {
  formatChange,
  formatChartTime,
  formatUsd,
  livePriceToPoint,
  normalizePricePoints,
  priceStatusLabel,
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
import { useMemo } from 'react'

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
  const priceStatus = useWatchPrice(btcPriceAsset)
  const btcPrice = useLivePrice(btcPriceAsset)
  const feedInfo = useLivePriceFeedInfo(btcPriceAsset)
  const btcPriceTicks = useLivePriceTicks(btcPriceAsset, maxBtcPriceTicks)
  const btcPricePoints = useMemo(() => {
    const points = btcPriceTicks.map(tickToLivelinePoint)
    if (btcPrice) points.push(livePriceToPoint(btcPrice))
    return normalizePricePoints(points)
  }, [btcPrice, btcPriceTicks])
  const lastBtcPriceUpdate = feedInfo?.updatedAtMs ?? (btcPrice ? btcPrice.blockTimestamp * 1000 : undefined)
  const isLoadingBtcPrice = priceStatus === 'hydrating' && btcPricePoints.length === 0
  const first = btcPricePoints.at(0)
  const latestValue = btcPrice?.price ?? btcPricePoints.at(-1)?.value
  const change = first && latestValue !== undefined ? latestValue - first.value : undefined
  const changePercent = change !== undefined && first && first.value !== 0 ? change / first.value : undefined
  const isLive = priceStatus === 'live'
  const changeTone = change === undefined ? 'text-[#6A7374]' : change >= 0 ? 'text-[#2DD530]' : 'text-[#F87171]'

  return (
    <section className="section-panel flex min-h-0 flex-col overflow-hidden p-3">
      <header className="mb-2 flex flex-none items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="font-abc-gravity-italic text-[28px] leading-none text-white">BTC</p>
          <p
            className={cn(
              'mt-2 font-sans text-sm',
              isLive ? 'text-[#74CC92]' : 'text-[#6A7374]',
              isLive &&
                "before:mr-2 before:inline-block before:h-2.5 before:w-2.5 before:rounded-full before:bg-[#74CC92] before:content-['']",
            )}
          >
            {priceStatusLabel(priceStatus, lastBtcPriceUpdate)}
          </p>
        </div>

        <div className="text-right">
          <p className="font-sans text-[28px] font-medium tabular-nums tracking-tight text-white">
            {formatUsd(latestValue)}
          </p>
          <p
            className={cn(
              'mt-2 font-sans text-sm tabular-nums transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]',
              changeTone,
            )}
          >
            {formatChange(change, changePercent)}
          </p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 grid grid-rows-[auto_minmax(0,1fr)]">
          <Liveline
            className="min-h-0"
            data={btcPricePoints}
            value={latestValue ?? 0}
            color={btcOrange}
            theme="dark"
            window={btcPriceWindows[0].secs}
            windows={btcPriceWindows}
            windowStyle="rounded"
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
