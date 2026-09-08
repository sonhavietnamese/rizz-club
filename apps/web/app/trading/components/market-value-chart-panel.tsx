'use client'

import { currentMarketIds, marketWindowSeconds } from '@/hooks/use-current-market'
import { formatChartTime, formatNumber, formatPercent } from '@/lib/format'
import { Liveline, type LivelineSeries, type WindowOption } from '@/lib/liveline'
import { ensureDrawablePoints, holdLastValue, normalizePoints } from '@/lib/utils'
import { useMarketTimeseries } from '@/hooks/use-market-timeseries'
import { isBinaryMarket, type UnifiedMarket } from '@somnia-chain/markets-sdk'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

const defaultMarketWindowSeconds = 5 * 60
const yesColor = '#90B64F'
const noColor = '#D6503C'

type MarketValueMode = 'current' | 'overview'

const currentWindows: WindowOption[] = [
  { label: '1m', secs: 60 },
  { label: '5m', secs: defaultMarketWindowSeconds },
]

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
  const marketIds = useMemo(() => currentMarketIds(selectedMarket), [selectedMarket])
  const { points, status } = useMarketTimeseries(marketIds)
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
  const fallbackYes = latest?.yes

  const yesPoints = useMemo(() => {
    if (!binaryMarket) return []

    const historyPoints = normalizePoints(
      points.flatMap((point) => {
        const time = point.t / 1000
        if (!Number.isFinite(time) || !Number.isFinite(point.yes)) return []
        return [{ time, value: point.yes }]
      }),
    )
    const liveValue = historyPoints.at(-1)?.value ?? fallbackYes
    return ensureDrawablePoints(holdLastValue(historyPoints, nowSeconds), liveValue, nowSeconds)
  }, [binaryMarket, fallbackYes, nowSeconds, points])

  const noPoints = useMemo(() => {
    const history = yesPoints.map((point) => ({ time: point.time, value: 1 - point.value }))
    const fallbackNo = fallbackYes === undefined ? undefined : 1 - fallbackYes
    return ensureDrawablePoints(history, fallbackNo, nowSeconds)
  }, [fallbackYes, nowSeconds, yesPoints])

  const yesValue = yesPoints.at(-1)?.value ?? fallbackYes ?? 0.5
  const noValue = noPoints.at(-1)?.value ?? (fallbackYes === undefined ? 0.5 : 1 - fallbackYes)
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
          <p className="text-xs font-black uppercase tracking-wider opacity-70">Points</p>
          <p className="mt-1 text-base font-black tabular-nums">{formatNumber(points.length)}</p>
        </div>
      </div>

      <div className="h-[400px] rounded-md bg-white px-2 py-3">
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
          loading={Boolean(binaryMarket) && status === 'loading'}
          emptyText={
            binaryMarket
              ? status === 'error'
                ? 'Could not load market series.'
                : 'Waiting for live market data...'
              : 'Select an event market.'
          }
          referenceLine={{ value: 0.5, label: '50%' }}
          yDomain={[-0.5, 1.5]}
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
