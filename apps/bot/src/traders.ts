import type { BotWallet } from '@/wallets'

export const TRADERS_PATH = 'traders'

export type TraderStatus = 'online' | 'offline'

export type Trader = {
  address: string
  name: string
  status: TraderStatus
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

export function toTrader(wallet: Pick<BotWallet, 'index' | 'address'>, status: TraderStatus): Trader {
  return {
    address: wallet.address,
    name: displayName(wallet),
    status,
  }
}

export function traderUpdates(roster: Pick<BotWallet, 'index' | 'address'>[], status: TraderStatus) {
  return Object.fromEntries(roster.map((wallet) => [traderKey(wallet.address), toTrader(wallet, status)]))
}
