import type { LivelinePoint } from '@/lib/liveline'
import type { PriceFeedStatus, PricePoint, LivePrice } from '@somnia-chain/markets-sdk'

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function normalizePoints(points: LivelinePoint[]) {
  return points
    .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value))
    .sort((left, right) => left.time - right.time)
    .filter((point, index, sorted) => index === sorted.length - 1 || point.time !== sorted[index + 1]?.time)
}

/**
 * Liveline only keeps points inside `[leftEdge - 2s, now]`.
 * Watcher samples are last-value (no write while YES/NO is unchanged), so a 1m
 * window often has no point near the left edge — the stroke starts mid-chart
 * and then “continues”. Hold the last known value on a 1s grid through `now`.
 */
export function holdLastValue(points: LivelinePoint[], nowSeconds: number, stepSeconds = 1): LivelinePoint[] {
  const sorted = normalizePoints(points)
  if (sorted.length === 0 || nowSeconds === 0) return sorted

  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  if (!first || !last) return sorted

  const end = Math.max(nowSeconds, last.time)
  const held: LivelinePoint[] = []
  let index = 0
  let value = first.value

  for (let time = first.time; time < end; time += stepSeconds) {
    while (index + 1 < sorted.length && (sorted[index + 1]?.time ?? Number.POSITIVE_INFINITY) <= time) {
      index += 1
      value = sorted[index]?.value ?? value
    }
    held.push({ time, value })
  }

  held.push(...sorted)
  held.push({ time: end, value: last.value })

  return normalizePoints(held)
}

export function ensureDrawablePoints(points: LivelinePoint[], fallbackValue: number | undefined, nowSeconds: number) {
  if (points.length >= 2) return points

  const value = points.at(-1)?.value ?? fallbackValue
  if (value === undefined || nowSeconds === 0) return points

  const firstTime = points.at(-1)?.time ?? nowSeconds
  return normalizePoints([
    { time: firstTime - 1, value },
    { time: firstTime, value },
  ])
}

export function tickToLivelinePoint(tick: PricePoint): LivelinePoint {
  return {
    time: Math.floor(tick.blockTimestamp),
    value: tick.price,
  }
}

export function livePriceToPoint(price: LivePrice): LivelinePoint {
  return {
    time: Math.floor(price.blockTimestamp),
    value: price.price,
  }
}

const MAX_PRICE_TICKS = 1_000

export function normalizePricePoints(points: LivelinePoint[]) {
  return points
    .filter((point) => Number.isFinite(point.value) && point.value > 0)
    .sort((left, right) => left.time - right.time)
    .filter((point, index, sorted) => index === sorted.length - 1 || point.time !== sorted[index + 1].time)
    .slice(-MAX_PRICE_TICKS)
}

export const usdFormatter = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function formatUsd(value?: number) {
  if (value === undefined) return '--'

  return usdFormatter.format(value)
}

export function formatChange(value?: number, percent?: number) {
  if (value === undefined || percent === undefined) return '--'

  const sign = value >= 0 ? '+' : ''

  return `${sign}${formatUsd(value)} (${sign}${(percent * 100).toFixed(2)}%)`
}

export function formatChartTime(seconds: number) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(seconds * 1000))
}

export function formatUpdateTime(value?: number) {
  if (value === undefined) return 'Waiting'

  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export function priceStatusLabel(status: PriceFeedStatus, lastUpdateMs?: number) {
  if (status === 'live') return `Live ${formatUpdateTime(lastUpdateMs)}`
  if (status === 'hydrating') return 'Syncing'
  return 'Waiting'
}
