'use client'

import { formatNumber, formatPrice, formatUpdateTime } from './formatters'
import { TIMEFRAMES, type UnifiedOHLCV } from '@somnia-chain/markets-sdk'

const chartWidth = 720
const chartHeight = 220
const chartPadding = 18
const tradingTimeframes = ['1m', '5m', '15m', '1h', '4h', '1d'] as const
const timeframes = tradingTimeframes.filter((timeframe) => timeframe in TIMEFRAMES)

export type Timeframe = (typeof tradingTimeframes)[number]

export type Candle = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function ohlcvToCandle([timestamp, open, high, low, close, volume]: UnifiedOHLCV): Candle {
  return {
    timestamp,
    open,
    high,
    low,
    close,
    volume,
  }
}

function chartPath(candles: Candle[]) {
  if (candles.length === 0) return ''
  if (candles.length === 1) {
    const y = chartHeight / 2

    return `M ${chartPadding} ${y} L ${chartWidth - chartPadding} ${y}`
  }

  const closes = candles.map((candle) => candle.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min || 1
  const drawableWidth = chartWidth - chartPadding * 2
  const drawableHeight = chartHeight - chartPadding * 2

  return candles
    .map((candle, index) => {
      const x = chartPadding + (index / Math.max(candles.length - 1, 1)) * drawableWidth
      const y = chartPadding + (1 - (candle.close - min) / range) * drawableHeight

      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function chartAreaPath(path: string) {
  if (!path) return ''

  return `${path} L ${chartWidth - chartPadding} ${chartHeight - chartPadding} L ${chartPadding} ${
    chartHeight - chartPadding
  } Z`
}

function MiniOhlcvChart({ candles }: { candles: Candle[] }) {
  const latest = candles.at(-1)
  const path = chartPath(candles)
  const area = chartAreaPath(path)
  const closes = candles.map((candle) => candle.close)
  const min = closes.length > 0 ? Math.min(...closes) : undefined
  const max = closes.length > 0 ? Math.max(...closes) : undefined

  return (
    <div className="rounded-md bg-[#F7E0B8] p-4 text-[#3C1F11]">
      <div className="mb-3 grid gap-3 text-sm font-semibold sm:grid-cols-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider opacity-70">Close</p>
          <p className="text-lg font-black">{formatPrice(latest?.close)}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider opacity-70">High</p>
          <p className="text-lg font-black">{formatPrice(max)}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider opacity-70">Low</p>
          <p className="text-lg font-black">{formatPrice(min)}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider opacity-70">Volume</p>
          <p className="text-lg font-black">{formatNumber(latest?.volume)}</p>
        </div>
      </div>

      <div className="h-[220px] rounded-md bg-white">
        {candles.length > 0 ? (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full" role="img">
            <title>Live OHLCV close-price chart</title>
            <path d={area} fill="#EBC06F" opacity="0.45" />
            <path d={path} fill="none" stroke="#389591" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {candles.length === 1 && <circle cx={chartWidth / 2} cy={chartHeight / 2} r="7" fill="#389591" />}
            <line
              x1={chartPadding}
              x2={chartWidth - chartPadding}
              y1={chartHeight - chartPadding}
              y2={chartHeight - chartPadding}
              stroke="#ECD19C"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center text-sm font-semibold opacity-70">
            Waiting for candle data...
          </div>
        )}
      </div>
    </div>
  )
}

export function ChartPanel({
  selectedChartSymbol,
  isLoadingCandles,
  lastChartUpdate,
  chartError,
  timeframe,
  candles,
  onSelectTimeframe,
}: {
  selectedChartSymbol?: string
  isLoadingCandles: boolean
  lastChartUpdate?: number
  chartError: string | null
  timeframe: Timeframe
  candles: Candle[]
  onSelectTimeframe: (timeframe: Timeframe) => void
}) {
  return (
    <div className="mt-5 rounded-md bg-[#F7E0B8] p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider opacity-70">OHLCV Chart</p>
          <p className="break-all text-sm font-semibold">
            {selectedChartSymbol ?? 'No symbol'} · {isLoadingCandles ? 'Loading' : formatUpdateTime(lastChartUpdate)}
          </p>
          {chartError && <p className="mt-1 text-sm font-semibold text-[#8A2D25]">{chartError}</p>}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {timeframes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelectTimeframe(option)}
              className={`h-9 rounded-md px-3 text-xs font-black transition ${
                timeframe === option ? 'bg-[#389591] text-white' : 'bg-[#ECD19C] text-[#3C1F11]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <MiniOhlcvChart candles={candles} />
    </div>
  )
}
