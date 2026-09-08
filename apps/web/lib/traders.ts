import { formatAddress } from '@/lib/utils'

export const TRADERS_PATH = 'traders'
export const ANONYMOUS_FIELD = 'anonymous'
export const PRESENCE_TTL_MS = 45_000
export const PRESENCE_HEARTBEAT_MS = 15_000

export type TraderIdentityInput = {
  id?: string | null
  wallet?: { address?: string | null } | null
  google?: { name?: string | null } | null
  discord?: { username?: string | null } | null
  email?: { address?: string | null } | null
}

export type TraderStatus = 'online' | 'offline'

export type Trader = {
  address: string
  name: string
  status: TraderStatus
  lastSeen?: number
  sessions?: Record<string, number>
}

export type TradersSnapshot = {
  traders: Trader[]
  anonymous: number
}

const firebaseKeyForbidden = new Set(['.', '#', '$', '[', ']', '/'])

export function traderKey(id: string) {
  return [...id.toLowerCase()].map((char) => (firebaseKeyForbidden.has(char) ? '_' : char)).join('')
}

export function isTraderStatus(value: unknown): value is TraderStatus {
  return value === 'online' || value === 'offline'
}

export function isFreshPresence(at: unknown, now: number, ttl = PRESENCE_TTL_MS) {
  return typeof at === 'number' && Number.isFinite(at) && now - at < ttl
}

export function parseSessions(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const sessions: Record<string, number> = {}
  for (const [id, at] of Object.entries(value as Record<string, unknown>)) {
    if (typeof at === 'number' && Number.isFinite(at)) sessions[id] = at
  }

  return Object.keys(sessions).length > 0 ? sessions : undefined
}

export function isTrader(value: unknown): value is Trader {
  if (!value || typeof value !== 'object') return false

  const trader = value as { address?: unknown; name?: unknown; status?: unknown }
  return (
    typeof trader.address === 'string' &&
    trader.address.length > 0 &&
    typeof trader.name === 'string' &&
    trader.name.length > 0 &&
    isTraderStatus(trader.status)
  )
}

function parseAnonymous(value: unknown, now: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.floor(value))
  if (!value || typeof value !== 'object') return 0

  return Object.values(value as Record<string, unknown>).filter((at) => isFreshPresence(at, now)).length
}

function parseTrader(value: Trader): Trader {
  const record = value as Trader & { lastSeen?: unknown; sessions?: unknown }
  const lastSeen = typeof record.lastSeen === 'number' && Number.isFinite(record.lastSeen) ? record.lastSeen : undefined
  const sessions = parseSessions(record.sessions)

  return {
    address: value.address,
    name: value.name,
    status: value.status,
    ...(lastSeen != null ? { lastSeen } : {}),
    ...(sessions ? { sessions } : {}),
  }
}

export function parseTraders(raw: unknown, now = Date.now()): TradersSnapshot {
  if (!raw || typeof raw !== 'object') return { traders: [], anonymous: 0 }

  const record = raw as Record<string, unknown>
  const anonymous = parseAnonymous(record[ANONYMOUS_FIELD], now)

  const traders = Object.entries(record).flatMap(([key, value]) => {
    if (key === ANONYMOUS_FIELD) return []
    if (!isTrader(value)) return []
    return [parseTrader(value)]
  })

  traders.sort((left, right) => left.address.localeCompare(right.address) || left.name.localeCompare(right.name))
  return { traders, anonymous }
}

export function isTraderOnline(trader: Trader, now = Date.now(), ttl = PRESENCE_TTL_MS) {
  if (Object.values(trader.sessions ?? {}).some((at) => isFreshPresence(at, now, ttl))) return true
  if (isFreshPresence(trader.lastSeen, now, ttl)) return true
  if (trader.lastSeen != null || (trader.sessions && Object.keys(trader.sessions).length > 0)) return false
  return trader.status === 'online'
}

export function onlineTraderCount(snapshot: TradersSnapshot, now = Date.now()) {
  const online = snapshot.traders.filter((trader) => isTraderOnline(trader, now)).length
  return online + snapshot.anonymous
}

export function formatTraderCount(count: number) {
  return `${count} ${count === 1 ? 'trader' : 'traders'}`
}

export function traderIdentity(user: TraderIdentityInput) {
  const address = user.wallet?.address || user.id || ''
  const name =
    user.google?.name ??
    user.discord?.username ??
    user.email?.address ??
    (address ? formatAddress(address) : 'trader')

  return { address, name }
}
