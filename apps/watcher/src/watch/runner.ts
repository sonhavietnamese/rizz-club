import { SomniaMarkets, type UnifiedMarket } from '@somnia-chain/markets-sdk'
import { dreamDexConfig, marketRefreshMs, reconnectDelayMs, targetAsset } from '../config.ts'
import { discoverTargetMarkets } from '../extract/discovery.ts'
import { errorMessage, sleep } from '../lib/async.ts'
import { switchingSnapshot } from '../transform/snapshot.ts'
import type { DashboardMarket, SnapshotListener, WatcherSnapshot } from '../types.ts'
import { watchMarket } from './market.ts'

function withMarkets(snapshot: WatcherSnapshot, markets: DashboardMarket[]): WatcherSnapshot {
  return { ...snapshot, markets }
}

export async function startWatcher(onSnapshot: SnapshotListener, signal: AbortSignal) {
  let markets: DashboardMarket[] = []
  let last: WatcherSnapshot = {
    phase: 'connecting',
    message: 'Connecting to DreamDex',
    fillCount: 0,
    fills: [],
    markets,
  }

  const emit: SnapshotListener = (snapshot) => {
    last = withMarkets(snapshot, markets)
    onSnapshot(last)
  }

  const setMarkets = (next: DashboardMarket[]) => {
    markets = next
    emit(last)
  }

  emit({
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
        const discovery = await discoverTargetMarkets(exchange)
        if (signal.aborted) return

        setMarkets(discovery.markets)
        const market = discovery.current

        if (!market) {
          emit({
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
          emit(switchingSnapshot(market, `Switched to ${market.symbol}`))
        }

        const result = await watchMarket(exchange, market, emit, signal, (next) => {
          setMarkets(next.markets)
        })
        if (signal.aborted) return

        previousMarket = market

        if (result?.event === 'market_changed') {
          emit(switchingSnapshot(result.market, `${market.symbol} rolled · switching`))
          continue
        }

        emit(switchingSnapshot(market, `${market.symbol} expired · switching`))
      }
    } catch (error) {
      if (signal.aborted) return

      emit({
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
