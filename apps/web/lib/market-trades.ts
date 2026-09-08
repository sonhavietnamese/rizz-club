import type { LivelineMarker } from '@/lib/liveline'
import { formatAddress } from '@/lib/format'

const traderAvatars = [
  'https://i.pinimg.com/1200x/6c/50/e8/6c50e8fc7cc13cfc7bc4abb312282f15.jpg',
  'https://i.pinimg.com/1200x/a5/65/6c/a5656c180fedac78f1f913abc7253015.jpg',
  'https://i.pinimg.com/736x/d8/bd/f8/d8bdf86d816411cc2501754d2e202afe.jpg',
] as const

export type MarketTrade = {
  id: string
  t: number
  marketId?: string | null
  symbol?: string | null
  side?: string | null
  kind?: string | null
  outcome?: 'YES' | 'NO' | null
  price?: number | null
  amount?: number | null
  cost?: number | null
  taker?: string | null
}

export function traderAvatar(seed: string) {
  let hash = 0
  for (const character of seed) {
    hash = (hash + character.charCodeAt(0)) % traderAvatars.length
  }
  return traderAvatars[hash] ?? traderAvatars[0]
}

function tradeTimeSeconds(t: number) {
  return t > 1e12 ? t / 1000 : t
}

export function marketTradeOutcome(trade: Pick<MarketTrade, 'outcome' | 'side' | 'kind'>): 'YES' | 'NO' | null {
  if (trade.outcome === 'YES' || trade.outcome === 'NO') return trade.outcome
  const token = `${trade.side ?? ''} ${trade.kind ?? ''}`
  if (token.includes('YES')) return 'YES'
  if (token.includes('NO')) return 'NO'
  return null
}

export function marketTradeAction(trade: Pick<MarketTrade, 'side' | 'kind'>): 'buy' | 'sell' | null {
  const token = `${trade.side ?? ''} ${trade.kind ?? ''}`
  if (token.includes('SELL')) return 'sell'
  if (token.includes('BUY')) return 'buy'
  return null
}

function tradeSeriesId(trade: MarketTrade): 'yes' | 'no' | null {
  const outcome = marketTradeOutcome(trade)
  if (outcome === 'YES') return 'yes'
  if (outcome === 'NO') return 'no'
  return null
}

export function isMarketTrade(id: string, value: unknown): value is Omit<MarketTrade, 'id'> {
  if (!value || typeof value !== 'object') return false
  const trade = value as MarketTrade
  return Boolean(id) && Number.isFinite(trade.t)
}

export function toTradeMarkers(trades: MarketTrade[]): LivelineMarker[] {
  return trades.flatMap((trade) => {
    const time = tradeTimeSeconds(trade.t)
    const seriesId = tradeSeriesId(trade)
    if (!Number.isFinite(time) || !seriesId) return []

    const seed = trade.taker || trade.id
    return [
      {
        id: trade.id,
        time,
        seriesId,
        avatar: traderAvatar(seed),
        name: trade.taker ? formatAddress(trade.taker) : undefined,
      },
    ]
  })
}
