import {
  marketTradeAction,
  marketTradeOutcome,
  traderAvatar,
  type MarketTrade,
} from '@/lib/market-trades'
import { formatAddress, formatCents, formatShares } from '@/lib/format'
import { liveTraderHeartRate, traderKey, type Trader } from '@/lib/traders'

const closedShares = 1e-8

export type LeaderboardSide = 'up' | 'down'

export type LeaderboardPrices = {
  yes?: number
  no?: number
}

export type LeaderboardItem = {
  id: string
  trader: string
  name: string
  avatar: string
  outcome: 'YES' | 'NO'
  side: LeaderboardSide
  shares: number
  avgPrice: number
  profit: number
  heartRate?: number
}

type OpenPosition = {
  trader: string
  displayTrader: string
  outcome: 'YES' | 'NO'
  shares: number
  cost: number
}

function tradeSize(trade: MarketTrade) {
  if (Number.isFinite(trade.amount) && (trade.amount ?? 0) > 0) return trade.amount as number

  const cost = trade.cost
  const price = trade.price
  if (Number.isFinite(cost) && Number.isFinite(price) && (price ?? 0) > 0) {
    return (cost as number) / (price as number)
  }

  return null
}

function tradeCost(trade: MarketTrade, amount: number) {
  if (Number.isFinite(trade.cost) && (trade.cost ?? 0) >= 0) return trade.cost as number
  if (Number.isFinite(trade.price)) return amount * (trade.price as number)
  return null
}

function positionKey(trader: string, outcome: 'YES' | 'NO') {
  return `${trader}:${outcome}`
}

function applyFill(position: OpenPosition | undefined, trade: MarketTrade, trader: string, outcome: 'YES' | 'NO') {
  const amount = tradeSize(trade)
  if (amount == null) return position

  const action = marketTradeAction(trade) ?? 'buy'
  const current = position ?? {
    trader,
    displayTrader: trade.taker ?? trader,
    outcome,
    shares: 0,
    cost: 0,
  }

  if (action === 'buy') {
    const cost = tradeCost(trade, amount)
    if (cost == null) return position
    return {
      ...current,
      shares: current.shares + amount,
      cost: current.cost + cost,
    }
  }

  if (current.shares <= closedShares) return current.shares > 0 ? current : undefined

  const sold = Math.min(amount, current.shares)
  const avgPrice = current.cost / current.shares
  const nextShares = current.shares - sold
  if (nextShares <= closedShares) return undefined

  return {
    ...current,
    shares: nextShares,
    cost: current.cost - avgPrice * sold,
  }
}

function markPrice(outcome: 'YES' | 'NO', prices: LeaderboardPrices) {
  return outcome === 'YES' ? prices.yes : prices.no
}

function toItem(position: OpenPosition, prices: LeaderboardPrices): LeaderboardItem | null {
  if (position.shares <= closedShares) return null

  const avgPrice = position.cost / position.shares
  if (!Number.isFinite(avgPrice)) return null

  const mark = markPrice(position.outcome, prices)
  const rawProfit = mark == null ? 0 : (mark - avgPrice) * position.shares
  const profit = Math.round(rawProfit * 100) / 100

  return {
    id: positionKey(position.trader, position.outcome),
    trader: position.trader,
    name: formatAddress(position.displayTrader),
    avatar: traderAvatar(position.displayTrader),
    outcome: position.outcome,
    side: position.outcome === 'YES' ? 'up' : 'down',
    shares: position.shares,
    avgPrice,
    profit,
  }
}

export function toLeaderboardItems(trades: MarketTrade[], prices: LeaderboardPrices): LeaderboardItem[] {
  const positions = new Map<string, OpenPosition>()
  const ordered = [...trades].sort((left, right) => left.t - right.t || left.id.localeCompare(right.id))

  for (const trade of ordered) {
    const trader = trade.taker?.toLowerCase()
    const outcome = marketTradeOutcome(trade)
    if (!trader || !outcome) continue

    const key = positionKey(trader, outcome)
    const next = applyFill(positions.get(key), trade, trader, outcome)
    if (next) positions.set(key, next)
    else positions.delete(key)
  }

  return [...positions.values()]
    .flatMap((position) => {
      const item = toItem(position, prices)
      return item ? [item] : []
    })
    .sort((left, right) => right.profit - left.profit || right.shares - left.shares || left.id.localeCompare(right.id))
}

export function withTraderData(items: LeaderboardItem[], traders: readonly Trader[], now = Date.now()): LeaderboardItem[] {
  if (items.length === 0 || traders.length === 0) return items

  const byKey = new Map<string, Trader>()
  for (const trader of traders) {
    byKey.set(traderKey(trader.address), trader)
  }

  let changed = false
  const next = items.map((item) => {
    const trader = byKey.get(traderKey(item.trader))
    if (!trader) return item

    const name = trader.name || item.name
    const heartRate = liveTraderHeartRate(trader, now)
    if (name === item.name && heartRate === item.heartRate) return item

    changed = true
    return { ...item, name, heartRate }
  })

  return changed ? next : items
}

export { formatCents, formatShares }

export const LEADERBOARD_FADE_S = 0.2
export const LEADERBOARD_STAGGER_S = 0.05

export type LeaderboardHold = {
  marketKey: string
  items: LeaderboardItem[]
  epoch: number
}

export function leaderboardStaggerDelay(index: number, reduceMotion: boolean) {
  return reduceMotion ? 0 : index * LEADERBOARD_STAGGER_S
}

export function leaderboardExitDuration(count: number, reduceMotion: boolean) {
  if (reduceMotion) return LEADERBOARD_FADE_S
  return LEADERBOARD_FADE_S + Math.max(0, count - 1) * LEADERBOARD_STAGGER_S
}

function reuseHold(
  current: LeaderboardHold | null,
  next: LeaderboardHold,
  frozen: boolean,
): { hold: LeaderboardHold; frozen: boolean } {
  if (
    current &&
    current.marketKey === next.marketKey &&
    current.epoch === next.epoch &&
    (current.items === next.items || (current.items.length === 0 && next.items.length === 0))
  ) {
    return { hold: current, frozen }
  }

  return { hold: next, frozen }
}

export function advanceLeaderboardHold(
  current: LeaderboardHold | null,
  marketKey: string,
  liveItems: LeaderboardItem[],
): { hold: LeaderboardHold; frozen: boolean } {
  if (liveItems.length > 0 && marketKey) {
    const handedOff = Boolean(current?.marketKey && current.marketKey !== marketKey && current.items.length > 0)
    return reuseHold(
      current,
      {
        marketKey,
        items: liveItems,
        epoch: (current?.epoch ?? 0) + (handedOff ? 1 : 0),
      },
      false,
    )
  }

  const betweenMarkets = !marketKey || Boolean(current && current.marketKey !== marketKey)
  if (betweenMarkets && current?.items.length) {
    return { hold: current, frozen: true }
  }

  return reuseHold(
    current,
    {
      marketKey,
      items: liveItems,
      epoch: current?.epoch ?? 0,
    },
    false,
  )
}
