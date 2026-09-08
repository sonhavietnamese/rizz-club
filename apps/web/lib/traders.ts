import { formatAddress } from '@/lib/utils'

export const TRADERS_PATH = 'traders'
export const ANONYMOUS_FIELD = 'anonymous'

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

export function parseTraders(raw: unknown): TradersSnapshot {
  if (!raw || typeof raw !== 'object') return { traders: [], anonymous: 0 }

  const record = raw as Record<string, unknown>
  const anonymousValue = record[ANONYMOUS_FIELD]
  const anonymous =
    typeof anonymousValue === 'number' && Number.isFinite(anonymousValue) ? Math.max(0, Math.floor(anonymousValue)) : 0

  const traders = Object.entries(record).flatMap(([key, value]) => {
    if (key === ANONYMOUS_FIELD) return []
    if (!isTrader(value)) return []
    return [value]
  })

  traders.sort((left, right) => left.address.localeCompare(right.address) || left.name.localeCompare(right.name))
  return { traders, anonymous }
}

export function onlineTraderCount(snapshot: TradersSnapshot) {
  const online = snapshot.traders.filter((trader) => trader.status === 'online').length
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
