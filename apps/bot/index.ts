import { CHAT_LIMIT, simulateChat } from '@/chat'
import { env } from '@/env'
import { closeFirebase } from '@/firebase'
import { type IntervalOption } from '@/market'
import { simulateTrades } from '@/trade'
import { minTradeCost } from '@/trade/types'
import { setTradersOffline, setTradersOnline } from '@/traders-store'
import { wallets } from '@/wallets'

const DRY_RUN = false

const CHAT = {
  intervalMs: 1_500,
  count: undefined as number | undefined,
}

const TRADE = {
  intervalMs: 200,
  window: '5m' satisfies IntervalOption,
  limit: 8,
  batch: 2,
  count: undefined as number | undefined,
}

const controller = new AbortController()
let failure: unknown

process.on('SIGINT', () => controller.abort())
process.on('SIGTERM', () => controller.abort())

const roster = wallets()

console.log(
  `Orchestra · ${env.WALLET_COUNT} wallets${DRY_RUN ? ' [dry-run]' : ''}\n` +
    `  traders ${roster.length} → /traders\n` +
    `  chat   every ~${CHAT.intervalMs}ms → /chat (limit ${CHAT_LIMIT})\n` +
    `  trade  BTC ${TRADE.window} · cost ${minTradeCost}–${TRADE.limit} · batch 1–${TRADE.batch} · pace ${TRADE.intervalMs}ms`,
)

async function part(work: () => Promise<void>) {
  try {
    await work()
  } catch (error) {
    if (controller.signal.aborted) return
    failure ??= error
    controller.abort()
  }
}

try {
  await setTradersOnline(roster, { dryRun: DRY_RUN })
  console.log(`Traders online ${roster.length}`)

  await Promise.all([
    part(async () => {
      const sent = await simulateChat({
        count: CHAT.count,
        intervalMs: CHAT.intervalMs,
        dryRun: DRY_RUN,
        signal: controller.signal,
      })
      console.log(`Sent ${sent} messages`)
    }),
    part(async () => {
      const placed = await simulateTrades({
        count: TRADE.count,
        intervalMs: TRADE.intervalMs,
        dryRun: DRY_RUN,
        window: TRADE.window as IntervalOption,
        cost: { limit: TRADE.limit },
        batch: TRADE.batch,
        signal: controller.signal,
      })
      console.log(`Placed ${placed} trades`)
    }),
  ])

  if (failure) throw failure
  if (controller.signal.aborted) console.log('Stopped')
} finally {
  await setTradersOffline(roster, { dryRun: DRY_RUN })
  await closeFirebase()
}
