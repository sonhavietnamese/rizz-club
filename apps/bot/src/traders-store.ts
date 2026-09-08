import { database, tradersRef } from '@/firebase'
import { TRADERS_PATH, traderKey, traderUpdates, type TraderStatus } from '@/traders'
import type { BotWallet } from '@/wallets'
import { onDisconnect, ref, update } from 'firebase/database'

export async function publishTraders(
  roster: Pick<BotWallet, 'index' | 'address'>[],
  status: TraderStatus,
  options: { dryRun?: boolean } = {},
) {
  const updates = traderUpdates(roster, status)
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
    await Promise.all(
      roster.map((wallet) =>
        onDisconnect(ref(database, `${TRADERS_PATH}/${traderKey(wallet.address)}`)).update({
          status: 'offline',
        }),
      ),
    )
  }
  return result
}

export async function setTradersOffline(
  roster: Pick<BotWallet, 'index' | 'address'>[],
  options: { dryRun?: boolean } = {},
) {
  return publishTraders(roster, 'offline', options)
}
