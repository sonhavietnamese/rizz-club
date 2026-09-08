import { etlDebounceMs, etlHeartbeatMs } from '@/config'
import { pointKey, snapshotMarketId, toMarketPoint } from '@/transform/point'
import { tradeKey, unpublishedTrades } from '@/transform/trade'
import type { WatcherSnapshot } from '@/types'
import { push, remove, update } from 'firebase/database'
import { marketRef, tradesRef } from './firebase'

let pending: WatcherSnapshot | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let heartbeat: ReturnType<typeof setTimeout> | undefined
let lastIdentity = ''
let lastMarketId = ''
let lastPointKey = ''
let lastPublishedAt = 0
let publishedTradeIds = new Set<string>()
let writing: Promise<void> = Promise.resolve()

function identityOf(snapshot: WatcherSnapshot) {
  return `${snapshot.phase}:${snapshot.marketId ?? ''}`
}

async function writeNewTrades(snapshot: WatcherSnapshot) {
  const fresh = unpublishedTrades(snapshot.trades ?? [], publishedTradeIds)
  if (fresh.length === 0) return

  const updates: Record<string, (typeof fresh)[number]> = {}
  for (const trade of fresh) {
    updates[tradeKey(trade.id)] = trade
  }

  await update(tradesRef, updates)
  for (const trade of fresh) {
    publishedTradeIds.add(trade.id)
  }
}

async function flush() {
  timer = undefined
  const snapshot = pending
  if (!snapshot) return

  const marketId = snapshotMarketId(snapshot)
  if (lastMarketId && marketId && marketId !== lastMarketId) {
    await Promise.all([remove(marketRef), remove(tradesRef)])
    lastPointKey = ''
    publishedTradeIds = new Set()
  }
  if (marketId) lastMarketId = marketId

  await writeNewTrades(snapshot)

  const point = toMarketPoint(snapshot)
  if (!point) return

  const key = pointKey(snapshot)
  const stale = Date.now() - lastPublishedAt >= etlHeartbeatMs
  if (key === lastPointKey && !stale) return
  lastPointKey = key
  lastPublishedAt = Date.now()

  await push(marketRef, point)
  scheduleHeartbeat()
}

function scheduleHeartbeat() {
  clearTimeout(heartbeat)
  heartbeat = setTimeout(() => {
    writing = writing.then(flush, flush)
  }, etlHeartbeatMs)
}

export function publishMarket(snapshot: WatcherSnapshot) {
  pending = snapshot
  const identity = identityOf(snapshot)
  const marketId = snapshotMarketId(snapshot)
  const marketChanged = Boolean(lastMarketId && marketId && marketId !== lastMarketId)
  const immediate = identity !== lastIdentity || marketChanged
  lastIdentity = identity

  if (immediate) lastPointKey = ''

  if (!immediate) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      writing = writing.then(flush, flush)
    }, etlDebounceMs)
    return writing
  }

  clearTimeout(timer)
  writing = writing.then(flush, flush)
  return writing
}
