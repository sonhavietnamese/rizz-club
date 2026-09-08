'use client'

import { formatNumber } from './formatters'
import {
  formatChange,
  formatChartTime,
  formatUsd,
  livePriceToPoint,
  normalizePricePoints,
  priceStatusLabel,
  tickToLivelinePoint,
} from '@/lib/utils'
import { Liveline, type LivelinePoint } from '@/lib/liveline'
import { type LivePrice } from '@somnia-chain/markets-sdk'
import {
  useLivePrice,
  useLivePriceFeedInfo,
  useLivePriceTicks,
  useWatchPrice,
} from '@somnia-chain/markets-sdk/react'
import { useMemo } from 'react'

const btcPriceAsset = 'BTC'
const maxBtcPriceTicks = 1_000

const btcPriceWindows = [
  { label: '1m', secs: 60 },
  { label: '5m', secs: 300 },
  { label: '15m', secs: 900 },
  { label: '1h', secs: 3_600 },
]

function BtcLivelineChart({
  points,
  livePrice,
  isLoading,
}: {
  points: LivelinePoint[]
  livePrice: LivePrice | null
  isLoading: boolean
}) {
  const fallbackValue = points.at(-1)?.value ?? 0
  const value = livePrice?.price ?? fallbackValue

  return (
    <div className="h-[280px] rounded-md bg-white px-2 py-3">
      <Liveline
        data={points}
        value={value}
        color="#F7931A"
        theme="light"
        window={btcPriceWindows[0].secs}
        windows={btcPriceWindows}
        windowStyle="rounded"
        loading={isLoading}
        emptyText="Waiting for BTC price..."
        formatValue={formatUsd}
        formatTime={formatChartTime}
        showValue
        valueMomentumColor
        exaggerate
        badgeVariant="minimal"
        lineWidth={3}
      />
    </div>
  )
}

export function ChartPanel() {
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

  return (
    <div className="mt-5 rounded-md bg-[#F7E0B8] p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider opacity-70">BTC Market Price</p>
          <p className="break-all text-sm font-semibold">
            BTC · {priceStatusLabel(priceStatus, lastBtcPriceUpdate)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm font-semibold sm:min-w-[22rem]">
          <div className="rounded-md bg-[#ECD19C] px-3 py-2">
            <p className="text-xs font-black uppercase tracking-wider opacity-70">Spot</p>
            <p className="mt-1 text-base font-black tabular-nums">{formatUsd(latestValue)}</p>
          </div>
          <div className="rounded-md bg-[#ECD19C] px-3 py-2">
            <p className="text-xs font-black uppercase tracking-wider opacity-70">EMA</p>
            <p className="mt-1 text-base font-black tabular-nums">{formatUsd(btcPrice?.ema)}</p>
          </div>
          <div className="rounded-md bg-[#ECD19C] px-3 py-2">
            <p className="text-xs font-black uppercase tracking-wider opacity-70">Move</p>
            <p className="mt-1 text-base font-black tabular-nums">{formatChange(change, changePercent)}</p>
          </div>
        </div>
      </div>
      <BtcLivelineChart
        points={btcPricePoints}
        livePrice={btcPrice}
        isLoading={isLoadingBtcPrice && btcPricePoints.length === 0}
      />
      <p className="mt-3 text-xs font-black uppercase tracking-wider opacity-70">
        Oracle updates: {formatNumber(btcPricePoints.length)}
      </p>
    </div>
  )
}
