import type { UnifiedMarket } from '@somnia-chain/markets-sdk'

export type Outcome = 'YES' | 'NO'
export type MarketValueSource = 'book' | 'fill' | 'last_price' | 'default'
export type WatcherPhase = 'connecting' | 'waiting' | 'watching' | 'error'

export type WatchResult =
  | { event: 'market_expired' }
  | { event: 'market_changed'; market: UnifiedMarket }
  | { event: 'market_unavailable' }

export type DashboardFill = {
  id: string
  timestamp?: number
  side?: string
  kind?: string
  price?: number
  amount?: number
  cost?: number
}

export type WatcherSnapshot = {
  phase: WatcherPhase
  message?: string
  retryAt?: number
  marketSymbol?: string
  marketId?: string
  yesSymbol?: string
  noSymbol?: string
  expirySeconds?: number
  tradingStartSeconds?: number
  yes?: number
  no?: number
  source?: MarketValueSource
  bookYes?: number
  lastFillYes?: number
  fallbackYes?: number
  fillCount: number
  fills: DashboardFill[]
  updatedAt?: number
}

export type SnapshotListener = (snapshot: WatcherSnapshot) => void

export type MarketPoint = {
  t: number
  yes: number
  no: number
  source: MarketValueSource | null
  marketId: string | null
  symbol: string | null
  expirySeconds: number | null
}
