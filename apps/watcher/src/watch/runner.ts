import { SomniaMarkets, type UnifiedMarket } from '@somnia-chain/markets-sdk'
import { dreamDexConfig, marketRefreshMs, reconnectDelayMs, targetAsset } from '../config.ts'
import { findCurrentLiveBtcMarket } from '../extract/discovery.ts'
import { errorMessage, sleep } from '../lib/async.ts'
import { switchingSnapshot } from '../transform/snapshot.ts'
import type { SnapshotListener } from '../types.ts'
import { watchMarket } from './market.ts'

export async function startWatcher(onSnapshot: SnapshotListener, signal: AbortSignal) {
  onSnapshot({
    phase: 'connecting',
    message: 'Connecting to DreamDex',
    fillCount: 0,
    fills: [],
  })

  while (!signal.aborted) {
    const exchange = new SomniaMarkets(dreamDexConfig)
    let previousMarket: UnifiedMarket | undefined

    try {
      while (!signal.aborted) {
        const market = await findCurrentLiveBtcMarket(exchange)
        if (signal.aborted) return

        if (!market) {
          onSnapshot({
            phase: 'waiting',
            message: previousMarket
              ? `${previousMarket.symbol} expired · waiting for the next ${targetAsset} 5m`
              : `Waiting for a live ${targetAsset} 5m market`,
            retryAt: Date.now() + marketRefreshMs,
            fillCount: 0,
            fills: [],
          })
          previousMarket = undefined
          await sleep(marketRefreshMs, signal)
          continue
        }

        if (previousMarket && previousMarket.id !== market.id) {
          onSnapshot(switchingSnapshot(market, `Switched to ${market.symbol}`))
        }

        const result = await watchMarket(exchange, market, onSnapshot, signal)
        if (signal.aborted) return

        previousMarket = market

        if (result?.event === 'market_changed') {
          onSnapshot(switchingSnapshot(result.market, `${market.symbol} rolled · switching`))
          continue
        }

        onSnapshot(switchingSnapshot(market, `${market.symbol} expired · switching`))
      }
    } catch (error) {
      if (signal.aborted) return

      onSnapshot({
        phase: 'error',
        message: errorMessage(error),
        retryAt: Date.now() + reconnectDelayMs,
        fillCount: 0,
        fills: [],
      })
      await sleep(reconnectDelayMs, signal)
    } finally {
      await exchange.close()
    }
  }
}
