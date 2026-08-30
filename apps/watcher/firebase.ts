import { initializeApp } from 'firebase/app'
import { getDatabase, push, ref } from 'firebase/database'
import { env } from './env.ts'
import type { WatcherSnapshot } from './engine.ts'

const app = initializeApp({
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  databaseURL: env.FIREBASE_DATABASE_URL,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
})

const database = getDatabase(app)
const marketRef = ref(database, 'market')
const syncDebounceMs = 250

function asJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function toMarketPoint(snapshot: WatcherSnapshot) {
  if (snapshot.yes === undefined || snapshot.no === undefined) return null

  return asJson({
    t: snapshot.updatedAt ?? Date.now(),
    yes: snapshot.yes,
    no: snapshot.no,
    source: snapshot.source ?? null,
    marketId: snapshot.marketId ?? null,
    symbol: snapshot.marketSymbol ?? null,
    expirySeconds: snapshot.expirySeconds ?? null,
  })
}

let pending: WatcherSnapshot | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let lastIdentity = ''
let lastPointKey = ''
let writing: Promise<void> = Promise.resolve()

function identityOf(snapshot: WatcherSnapshot) {
  return `${snapshot.phase}:${snapshot.marketId ?? ''}`
}

function pointKey(snapshot: WatcherSnapshot) {
  return `${snapshot.marketId ?? ''}:${snapshot.yes}:${snapshot.no}:${snapshot.source ?? ''}`
}

async function flush() {
  timer = undefined
  const snapshot = pending
  if (!snapshot) return

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
  const immediate = identity !== lastIdentity
  lastIdentity = identity

  if (immediate) lastPointKey = ''

  if (!immediate) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      writing = writing.then(flush, flush)
    }, syncDebounceMs)
    return writing
  }

  clearTimeout(timer)
  writing = writing.then(flush, flush)
  return writing
}
