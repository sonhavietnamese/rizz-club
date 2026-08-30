import type { MarketValueSource, WatcherSnapshot } from '../types.ts'

export const yesColor = '#90B64F'
export const noColor = '#D6503C'
export const cream = '#F7E0B8'
export const muted = '#A89B7A'

export function formatPercent(value: number | undefined) {
  if (value === undefined) return '—'
  return `${(value * 100).toFixed(2)}%`
}

export function formatNumber(value: number | undefined) {
  if (value === undefined) return '—'
  return value.toLocaleString('en', { maximumFractionDigits: 2 })
}

export function formatClock(timestamp: number | undefined) {
  if (timestamp === undefined || !Number.isFinite(timestamp)) return '—'
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))
}

export function formatRemaining(expirySeconds: number | undefined, now: number) {
  if (expirySeconds === undefined) return undefined
  const remaining = Math.max(0, expirySeconds * 1000 - now)
  const totalSeconds = Math.ceil(remaining / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (totalSeconds <= 0) return 'expired · switching'
  if (minutes <= 0) return `${seconds}s left`
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s left`
}

export function formatRetry(retryAt: number | undefined, now: number) {
  if (retryAt === undefined) return undefined
  const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000))
  return remaining === 0 ? 'retrying' : `retry in ${remaining}s`
}

export function formatSource(source: MarketValueSource | undefined) {
  if (source === 'last_price') return 'last price'
  return source ?? '—'
}

export function formatSide(side: string | undefined) {
  if (!side) return '—'
  return side.replaceAll('_', ' ')
}

export function sideColor(side: string | undefined) {
  if (!side) return muted
  if (side.includes('YES')) return yesColor
  if (side.includes('NO')) return noColor
  return cream
}

export function phaseColor(phase: WatcherSnapshot['phase']) {
  if (phase === 'watching') return yesColor
  if (phase === 'error') return noColor
  return '#E4B04A'
}

export function phaseLabel(phase: WatcherSnapshot['phase']) {
  if (phase === 'watching') return 'LIVE'
  if (phase === 'waiting') return 'WAIT'
  if (phase === 'error') return 'ERR'
  return 'SYNC'
}
