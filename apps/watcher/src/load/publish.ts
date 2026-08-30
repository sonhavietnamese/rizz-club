import { push, remove } from 'firebase/database'
import { etlDebounceMs } from '../config.ts'
import { pointKey, snapshotMarketId, toMarketPoint } from '../transform/point.ts'
import type { WatcherSnapshot } from '../types.ts'
import { marketRef } from './firebase.ts'

let pending: WatcherSnapshot | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let lastIdentity = ''
let lastMarketId = ''
let lastPointKey = ''
let writing: Promise<void> = Promise.resolve()

function identityOf(snapshot: WatcherSnapshot) {
  return `${snapshot.phase}:${snapshot.marketId ?? ''}`
}

async function flush() {
  timer = undefined
  const snapshot = pending
  if (!snapshot) return

  const marketId = snapshotMarketId(snapshot)
  if (lastMarketId && marketId && marketId !== lastMarketId) {
    await remove(marketRef)
    lastPointKey = ''
  }
  if (marketId) lastMarketId = marketId

  const point = toMarketPoint(snapshot)
  if (!point) return

  const key = pointKey(snapshot)
  if (key === lastPointKey) return
  lastPointKey = key

  await push(marketRef, point)
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
