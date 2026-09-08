import type { BotWallet } from '@/wallets'

export const TRADERS_PATH = 'traders'
export const PRESENCE_HEARTBEAT_MS = 15_000

export type TraderStatus = 'online' | 'offline'

export type Trader = {
  address: string
  name: string
  status: TraderStatus
  lastSeen?: number
}

const NAMES = [
  'nova',
  'kira',
  'jax',
  'mira',
  'leo',
  'sage',
  'rex',
  'nina',
  'otto',
  'ivy',
  'zed',
  'aria',
  'kai',
  'lux',
  'rio',
] as const

const firebaseKeyForbidden = new Set(['.', '#', '$', '[', ']', '/'])

export function traderKey(id: string) {
  return [...id.toLowerCase()].map((char) => (firebaseKeyForbidden.has(char) ? '_' : char)).join('')
}

export function displayName(wallet: Pick<BotWallet, 'index' | 'address'>) {
  return NAMES[wallet.index % NAMES.length] ?? wallet.address.slice(0, 6)
}

export function toTrader(wallet: Pick<BotWallet, 'index' | 'address'>, status: TraderStatus, now = Date.now()): Trader {
  return {
    address: wallet.address,
    name: displayName(wallet),
    status,
    lastSeen: now,
  }
}

export function traderUpdates(
  roster: Pick<BotWallet, 'index' | 'address'>[],
  status: TraderStatus,
  now = Date.now(),
) {
  return Object.fromEntries(roster.map((wallet) => [traderKey(wallet.address), toTrader(wallet, status, now)]))
}

export function botSessionId() {
  return `bot-${process.pid}`
}
