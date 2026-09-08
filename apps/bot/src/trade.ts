import { createDreamDexExchange } from '@/dreamdex'
import { errorMessage, sleep } from '@/lib/async'
import { defaultInterval, discoverCurrentMarket, type IntervalOption } from '@/market'
import { pickIntent } from '@/trade/intent'
import { createPace, defaultPaceMs, nextBeat } from '@/trade/pace'
import { bookPrices, placeTrade, walletPositions } from '@/trade/place'
import { defaultCostBounds, resolveCostBounds, type CostBounds, type TradeResult } from '@/trade/types'
import { wallets, type BotWallet } from '@/wallets'
import { isBinaryMarket, type SomniaMarkets, type UnifiedMarket } from '@somnia-chain/markets-sdk'

export type SimulateTradesOptions = {
  count?: number
  intervalMs?: number
  dryRun?: boolean
  window?: IntervalOption
  cost?: Partial<CostBounds>
  signal?: AbortSignal
}

function pick<T>(items: readonly T[]) {
  const item = items[Math.floor(Math.random() * items.length)]
  if (item === undefined) throw new Error('Cannot pick from an empty list')
  return item
}

function formatTrade(result: TradeResult) {
  const verb = result.dryRun ? 'dry' : result.txHash ? result.txHash.slice(0, 10) : 'sent'
  return `  ${result.side.padEnd(8, ' ')}  ${result.cost.toFixed(2).padStart(6, ' ')}  ${result.wallet}  ${result.symbol}  ${verb}`
}

function formatWait(kind: string, waitMs: number) {
  return `  ${kind.padEnd(8, ' ')}  ${(waitMs / 1000).toFixed(1)}s`
}

export async function simulateTrades({
  count,
  intervalMs = defaultPaceMs,
  dryRun = false,
  window = defaultInterval,
  cost,
  signal,
}: SimulateTradesOptions = {}) {
  const costBounds = resolveCostBounds(cost)
  const roster = wallets()
  if (roster.length === 0) {
    throw new Error('No generated wallets. Run `bun run generate-wallets` first.')
  }

  const exchange = createDreamDexExchange()
  const pace = createPace()
  let placed = 0
  let lastWallet: BotWallet | undefined

  try {
    while (count === undefined || placed < count) {
      if (signal?.aborted) break

      const beat = nextBeat(pace, intervalMs)
      if (beat.waitMs > 0) {
        if (!beat.act) console.log(formatWait(beat.kind, beat.waitMs))
        await sleep(beat.waitMs, signal)
      }
      if (signal?.aborted) break
      if (!beat.act) continue

      const market = await discoverCurrentMarket(exchange, window)
      if (!market || !isBinaryMarket(market.info)) {
        console.log(`  waiting for a live BTC ${window} market`)
        continue
      }

      const wallet = beat.reuseWallet && lastWallet ? lastWallet : pick(roster)
      const attempt = await tradeOnce(exchange, wallet, market, dryRun, costBounds)
      if (attempt) {
        lastWallet = wallet
        console.log(formatTrade(attempt))
        placed += 1
      }
    }

    return placed
  } finally {
    await exchange.close()
  }
}

async function tradeOnce(
  exchange: SomniaMarkets,
  wallet: BotWallet,
  market: UnifiedMarket,
  dryRun: boolean,
  costBounds: CostBounds = defaultCostBounds,
): Promise<TradeResult | undefined> {
  if (!isBinaryMarket(market.info)) return undefined

  try {
    const onchain = await exchange.client.getMarketOnchain(market.info.marketId)
    const [book, positions] = await Promise.all([
      exchange.client.getBinaryOrderBook(onchain.pool, { depth: 10, decimals: onchain.decimals }),
      walletPositions(exchange, wallet.address, market.info.marketId, onchain.decimals),
    ])
    const intent = pickIntent(wallet.address, positions, bookPrices(book, onchain.decimals), Math.random, costBounds)
    if (!intent) {
      console.log(
        `  skip    ${wallet.address}  collateral ${positions.collateral.toFixed(2)}  need > ${costBounds.min} and ≤ ${costBounds.limit}`,
      )
      return undefined
    }

    return await placeTrade(exchange, wallet, market, intent, { dryRun, cost: costBounds })
  } catch (error) {
    console.error(`  fail    ${wallet.address}  ${errorMessage(error)}`)
    return undefined
  }
}
