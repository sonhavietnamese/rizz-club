import { type TradingStatus } from './types'

export function formatAddress(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

export function formatDateTime(seconds: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(Number(seconds) * 1000))
}

export function formatNumber(value?: number) {
  if (value === undefined) return '--'

  return new Intl.NumberFormat('en', {
    maximumFractionDigits: 4,
  }).format(value)
}

export function formatPercent(value?: number) {
  if (value === undefined) return '--'

  return `${(value * 100).toFixed(1)}%`
}

export function formatPrice(value?: number) {
  if (value === undefined) return '--'

  return new Intl.NumberFormat('en', {
    maximumFractionDigits: 6,
  }).format(value)
}

export function formatUpdateTime(value?: number) {
  if (value === undefined) return 'Waiting'

  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export function statusClass(tone: TradingStatus['tone']) {
  if (tone === 'success') return 'bg-[#90B64F] text-white'
  if (tone === 'error') return 'bg-[#D6503C] text-white'

  return 'bg-[#F7E0B8] text-[#3C1F11]'
}
