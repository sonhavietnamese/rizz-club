import { database, tradersRef } from '@/firebase'
import { botSessionId, PRESENCE_HEARTBEAT_MS, TRADERS_PATH, traderKey, toTrader, type TraderStatus } from '@/traders'
import type { BotWallet } from '@/wallets'
import { onDisconnect, ref, update } from 'firebase/database'

let heartbeat: ReturnType<typeof setInterval> | undefined
let heartbeatRoster: Pick<BotWallet, 'index' | 'address'>[] = []

function traderPayload(wallet: Pick<BotWallet, 'index' | 'address'>, status: TraderStatus, now: number) {
  const trader = toTrader(wallet, status, now)
  if (status !== 'online') return trader
  return { ...trader, sessions: { [botSessionId()]: now } }
}

export async function publishTraders(
  roster: Pick<BotWallet, 'index' | 'address'>[],
  status: TraderStatus,
  options: { dryRun?: boolean } = {},
) {
  const now = Date.now()
  const updates = Object.fromEntries(
    roster.map((wallet) => [traderKey(wallet.address), traderPayload(wallet, status, now)]),
  )
  if (options.dryRun) return { updates, written: false }

  await update(tradersRef, updates)
  return { updates, written: true }
}

export async function setTradersOnline(
  roster: Pick<BotWallet, 'index' | 'address'>[],
  options: { dryRun?: boolean } = {},
) {
  const result = await publishTraders(roster, 'online', options)
  if (!options.dryRun) {
    const session = botSessionId()
    await Promise.all(
      roster.map((wallet) =>
        onDisconnect(ref(database, `${TRADERS_PATH}/${traderKey(wallet.address)}/sessions/${session}`)).remove(),
      ),
    )
    heartbeatRoster = roster
    heartbeat ??= setInterval(() => {
      void publishTraders(heartbeatRoster, 'online', options).catch((error) => {
        console.error('Failed to refresh bot trader presence:', error)
      })
    }, PRESENCE_HEARTBEAT_MS)
  }
  return result
}

export async function setTradersOffline(
  roster: Pick<BotWallet, 'index' | 'address'>[],
  options: { dryRun?: boolean } = {},
) {
  if (heartbeat) {
    clearInterval(heartbeat)
    heartbeat = undefined
  }
  heartbeatRoster = []
  return publishTraders(roster, 'offline', options)
}
