'use client'

import {
  ChartPanel,
  FilledOrdersPanel,
  MarketList,
  MarketValueChartPanel,
  OrderBookPanel,
  PositionSummary,
  RewardClaimPanel,
  SelectedMarketHeader,
  StatusPanel,
  TradeTicket,
  TradingHeader,
  formatNumber,
  type Outcome,
  type RewardClaimResult,
  type TradeSide,
  type TradingStatus,
} from './components'
import { createDreamDexExchange } from '@/lib/dreamdex'
import { errorMessage } from '@/lib/error'
import {
  isBinaryMarket,
  type UnifiedBalances,
  type UnifiedMarket,
  type UnifiedOrderBook,
} from '@somnia-chain/markets-sdk'
import { SomniaMarketsProvider } from '@somnia-chain/markets-sdk/react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

const liveMarketRefreshMs = 15_000
const targetMarketIntervalSeconds = 5 * 60

type PlacePositionApiResponse = {
  order: {
    status: string
    filled: number
    amount: number
    txHash?: string
  }
  balances?: UnifiedBalances
  debug?: TradePositionDebugSummary
}

type BalancesApiResponse = {
  balances: UnifiedBalances
}

type ClaimRewardsApiResponse = RewardClaimResult & {
  balances: UnifiedBalances | null
}

type ApiErrorResponse = {
  error?: string
  details?: unknown
  debug?: TradePositionDebugSummary
}

type TradePositionDebugSummary = {
  id: string
  elapsedMs: number
  steps: { step: number; label: string; durationMs: number; elapsedMs: number }[]
}

type AsyncDebugTimer = {
  wait<T>(label: string, promise: Promise<T>): Promise<T>
  summary(): TradePositionDebugSummary
}

function apiErrorMessage(result: unknown, fallback: string) {
  if (!result || typeof result !== 'object') return fallback

  const response = result as ApiErrorResponse
  if (typeof response.details === 'string') return response.details
  return response.error ?? fallback
}

function binaryMarketIntervalSeconds(market: UnifiedMarket) {
  if (!isBinaryMarket(market.info)) return null

  const intervalSeconds = market.info.intervalSec ? Number(market.info.intervalSec) : Number.NaN
  if (Number.isFinite(intervalSeconds) && intervalSeconds > 0) return intervalSeconds

  const tradingStart = Number(market.info.tradingStart)
  const expiry = Number(market.info.expiry)
  if (!Number.isFinite(tradingStart) || !Number.isFinite(expiry)) return null

  return expiry - tradingStart
}

function isLiveTargetMarket(market: UnifiedMarket, nowSeconds: number) {
  if (!market.active || !isBinaryMarket(market.info) || !market.outcomes?.length) return false
  if (binaryMarketIntervalSeconds(market) !== targetMarketIntervalSeconds) return false

  const tradingStart = Number(market.info.tradingStart)
  const expiry = Number(market.info.expiry)

  return Number.isFinite(tradingStart) && Number.isFinite(expiry) && tradingStart <= nowSeconds && nowSeconds < expiry
}

function compareLiveMarkets(left: UnifiedMarket, right: UnifiedMarket) {
  if (!isBinaryMarket(left.info) || !isBinaryMarket(right.info)) return 0

  const expiryDelta = Number(left.info.expiry) - Number(right.info.expiry)
  if (expiryDelta !== 0) return expiryDelta

  const startDelta = Number(right.info.tradingStart) - Number(left.info.tradingStart)
  if (startDelta !== 0) return startDelta

  return left.symbol.localeCompare(right.symbol)
}

function createClientPositionDebugTimer({
  marketSymbol,
  outcome,
  side,
  amount,
  slippagePercent,
}: {
  marketSymbol: string
  outcome: Outcome
  side: TradeSide
  amount: number
  slippagePercent: number
}): AsyncDebugTimer {
  const id = Math.random().toString(36).slice(2, 10)
  const startedAt = performance.now()
  const steps: TradePositionDebugSummary['steps'] = []
  let step = 0

  async function wait<T>(label: string, promise: Promise<T>) {
    const currentStep = ++step
    const stepStartedAt = performance.now()
    const elapsedMs = stepStartedAt - startedAt

    console.info(`[trade-position-client:${id}] #${currentStep} ${label} start`, {
      marketSymbol,
      outcome,
      side,
      amount,
      slippagePercent,
      elapsedMs: Math.round(elapsedMs),
    })

    try {
      const value = await promise
      const durationMs = performance.now() - stepStartedAt
      const totalElapsedMs = performance.now() - startedAt

      steps.push({
        step: currentStep,
        label,
        durationMs: Math.round(durationMs),
        elapsedMs: Math.round(totalElapsedMs),
      })
      console.info(`[trade-position-client:${id}] #${currentStep} ${label} done`, {
        durationMs: Math.round(durationMs),
        elapsedMs: Math.round(totalElapsedMs),
      })

      return value
    } catch (error) {
      const durationMs = performance.now() - stepStartedAt
      const totalElapsedMs = performance.now() - startedAt

      console.error(`[trade-position-client:${id}] #${currentStep} ${label} failed`, {
        durationMs: Math.round(durationMs),
        elapsedMs: Math.round(totalElapsedMs),
        error: errorMessage(error),
      })
      throw error
    }
  }

  function summary() {
    return {
      id,
      elapsedMs: Math.round(performance.now() - startedAt),
      steps,
    }
  }

  return { wait, summary }
}

export default function TradingPage() {
  const router = useRouter()
  const { ready, authenticated, user, getAccessToken } = usePrivy()
  const exchange = useMemo(() => createDreamDexExchange(), [])
  const [markets, setMarkets] = useState<UnifiedMarket[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome>('YES')
  const [orderBook, setOrderBook] = useState<UnifiedOrderBook | null>(null)
  const [lastBookUpdate, setLastBookUpdate] = useState<number | undefined>()
  const [balances, setBalances] = useState<UnifiedBalances | null>(null)
  const [amount, setAmount] = useState('5')
  const [slippagePercent, setSlippagePercent] = useState('5')
  const [marketReloadKey, setMarketReloadKey] = useState(0)
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true)
  const [isLoadingBook, setIsLoadingBook] = useState(false)
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [isTrading, setIsTrading] = useState(false)
  const [isClaimingRewards, setIsClaimingRewards] = useState(false)
  const [rewardClaimResult, setRewardClaimResult] = useState<RewardClaimResult | null>(null)
  const [status, setStatus] = useState<TradingStatus>({
    tone: 'neutral',
    message: 'Load an event market, then buy YES or NO with your Privy server signer.',
  })
  const selectedMarket = markets.find((market) => market.symbol === selectedSymbol) ?? null
  const selectedTradable = selectedMarket?.outcomes?.find((outcome) => outcome.label === selectedOutcome)?.symbol
  const selectedMarketId = selectedMarket && isBinaryMarket(selectedMarket.info) ? selectedMarket.info.marketId : null
  const bestAsk = orderBook?.asks[0]?.[0]
  const serverWalletId = user?.wallet?.id ?? null
  const activeBalances = serverWalletId ? balances : null
  const selectedPosition = selectedTradable ? (activeBalances?.[selectedTradable]?.total ?? 0) : 0
  const outcomePositions =
    selectedMarket?.outcomes?.map((outcome) => ({
      label: outcome.label,
      symbol: outcome.symbol,
      total: activeBalances?.[outcome.symbol]?.total ?? 0,
    })) ?? []
  const collateralBalance = selectedMarket ? activeBalances?.[selectedMarket.quote]?.total : undefined
  const walletAddress = user?.wallet?.address

  const tradingApiFetch = useCallback(async (url: string, body: unknown, timer?: AsyncDebugTimer) => {
    const accessToken = timer
      ? await timer.wait(`getAccessToken ${url}`, getAccessToken())
      : await getAccessToken()
    if (!accessToken) {
      throw new Error('Privy session expired. Please sign in again.')
    }

    const request = fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return timer ? timer.wait(`fetch ${url}`, request) : request
  }, [getAccessToken])

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace('/')
    }
  }, [authenticated, ready, router])

  useEffect(() => {
    return () => {
      void exchange.close()
    }
  }, [exchange])

  useEffect(() => {
    let canceled = false
    let loading = false
    let hasLoadedOnce = false

    async function loadMarkets() {
      if (loading) return
      loading = true

      try {
        if (!hasLoadedOnce) {
          setIsLoadingMarkets(true)
          setStatus({ tone: 'neutral', message: 'Loading DreamDex 5m live markets...' })
        }

        const registry = await exchange.loadMarkets(true)
        const nowSeconds = Math.floor(Date.now() / 1000)
        const binaryMarkets = Object.values(registry)
          .filter((market) => isLiveTargetMarket(market, nowSeconds))
          .sort(compareLiveMarkets)

        if (canceled) return

        setMarkets(binaryMarkets)
        setSelectedSymbol((current) => {
          if (current && binaryMarkets.some((market) => market.symbol === current)) return current

          return binaryMarkets[0]?.symbol ?? null
        })
        if (!hasLoadedOnce || binaryMarkets.length === 0) {
          setStatus({
            tone: 'neutral',
            message:
              binaryMarkets.length > 0
                ? 'Auto-selected the live 5m DreamDex market.'
                : 'No live 5m DreamDex event markets were returned.',
          })
        }
        hasLoadedOnce = true
      } catch (error) {
        if (!canceled) {
          setStatus({ tone: 'error', message: `Could not load markets: ${errorMessage(error)}` })
        }
      } finally {
        loading = false
        if (!canceled) {
          setIsLoadingMarkets(false)
        }
      }
    }

    void loadMarkets()
    const refreshTimer = window.setInterval(loadMarkets, liveMarketRefreshMs)

    return () => {
      canceled = true
      window.clearInterval(refreshTimer)
    }
  }, [exchange, marketReloadKey])

  useEffect(() => {
    if (!selectedTradable) return

    let canceled = false
    const tradable = selectedTradable

    async function streamBook() {
      try {
        setIsLoadingBook(true)

        while (!canceled) {
          const book = await exchange.watchOrderBook(tradable, 5)
          if (canceled) return

          setOrderBook(book)
          setLastBookUpdate(book.timestamp)
          setIsLoadingBook(false)
        }
      } catch (error) {
        if (!canceled) {
          setOrderBook(null)
          setStatus({ tone: 'error', message: `Could not stream order book: ${errorMessage(error)}` })
          setIsLoadingBook(false)
        }
      }
    }

    void streamBook()

    return () => {
      canceled = true
    }
  }, [exchange, selectedTradable])

  useEffect(() => {
    if (!selectedMarketId) return

    const controller = new AbortController()

    async function prefetchSelectedMarket() {
      try {
        const response = await fetch('/api/trading/market-prefetch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ market_id: selectedMarketId }),
          signal: controller.signal,
        })
        const result = (await response.json().catch(() => null)) as { cached?: boolean; status?: number } | null

        if (!response.ok) {
          throw new Error(apiErrorMessage(result, 'Failed to prefetch market'))
        }

        console.info('[trade-position-client] selected market prefetched', {
          marketId: selectedMarketId,
          cached: result?.cached,
          status: result?.status,
        })
      } catch (error) {
        if (!controller.signal.aborted) {
          console.info('[trade-position-client] selected market prefetch skipped', {
            marketId: selectedMarketId,
            error: errorMessage(error),
          })
        }
      }
    }

    void prefetchSelectedMarket()

    return () => {
      controller.abort()
    }
  }, [selectedMarketId])

  useEffect(() => {
    if (!serverWalletId) {
      return
    }

    let canceled = false

    async function loadBalances() {
      try {
        setIsLoadingBalances(true)
        const response = await tradingApiFetch('/api/trading/balances', { wallet_id: serverWalletId })
        const result = (await response.json().catch(() => null)) as BalancesApiResponse | ApiErrorResponse | null

        if (!response.ok) {
          throw new Error(apiErrorMessage(result, 'Failed to load positions'))
        }

        if (canceled) return

        setBalances((result as BalancesApiResponse).balances)
      } catch (error) {
        if (!canceled) {
          setBalances(null)
          setStatus({ tone: 'error', message: `Could not load positions: ${errorMessage(error)}` })
        }
      } finally {
        if (!canceled) {
          setIsLoadingBalances(false)
        }
      }
    }

    void loadBalances()

    return () => {
      canceled = true
    }
  }, [serverWalletId, tradingApiFetch])

  async function refreshBalances({ silent = false }: { silent?: boolean } = {}) {
    if (!serverWalletId) {
      setBalances(null)
      return
    }

    try {
      setIsLoadingBalances(true)
      const response = await tradingApiFetch('/api/trading/balances', { wallet_id: serverWalletId })
      const result = (await response.json().catch(() => null)) as BalancesApiResponse | ApiErrorResponse | null

      if (!response.ok) {
        throw new Error(apiErrorMessage(result, 'Failed to load positions'))
      }

      setBalances((result as BalancesApiResponse).balances)
      if (!silent) {
        setStatus({ tone: 'neutral', message: 'Position balances refreshed.' })
      }
    } catch (error) {
      setBalances(null)
      if (!silent) {
        setStatus({ tone: 'error', message: `Could not load positions: ${errorMessage(error)}` })
      }
    } finally {
      setIsLoadingBalances(false)
    }
  }

  async function refreshBook({ silent = false, timer }: { silent?: boolean; timer?: AsyncDebugTimer } = {}) {
    if (!selectedTradable) return

    try {
      setIsLoadingBook(true)
      const book = timer
        ? await timer.wait('exchange.fetchOrderBook refresh', exchange.fetchOrderBook(selectedTradable, 5))
        : await exchange.fetchOrderBook(selectedTradable, 5)
      setOrderBook(book)
      setLastBookUpdate(book.timestamp)
      if (!silent) {
        setStatus({ tone: 'neutral', message: 'Order book refreshed.' })
      }
    } catch (error) {
      if (!silent) {
        setStatus({ tone: 'error', message: `Could not refresh book: ${errorMessage(error)}` })
      }
    } finally {
      setIsLoadingBook(false)
    }
  }

  async function placePosition(side: TradeSide, outcome: Outcome = selectedOutcome) {
    if (!serverWalletId) {
      setStatus({ tone: 'error', message: 'No Privy server-signing wallet is available.' })
      return
    }

    const targetTradable = selectedMarket?.outcomes?.find((marketOutcome) => marketOutcome.label === outcome)?.symbol

    if (!selectedMarket || !targetTradable || !isBinaryMarket(selectedMarket.info)) {
      setStatus({ tone: 'error', message: 'Select an event market before trading.' })
      return
    }

    const numericAmount = Number(amount)
    const numericSlippagePercent = Number(slippagePercent)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setStatus({ tone: 'error', message: 'Amount must be greater than 0.' })
      return
    }

    if (!Number.isFinite(numericSlippagePercent) || numericSlippagePercent < 0 || numericSlippagePercent > 50) {
      setStatus({ tone: 'error', message: 'Slippage must be between 0% and 50%.' })
      return
    }

    const targetPosition = outcomePositions.find((position) => position.label === outcome)?.total ?? 0
    if (side === 'sell' && numericAmount > targetPosition) {
      setStatus({
        tone: 'error',
        message: `You only have ${formatNumber(targetPosition)} ${outcome} to sell.`,
      })
      return
    }

    if (side === 'buy' && outcome === selectedOutcome && bestAsk === undefined) {
      setStatus({ tone: 'error', message: `No ${selectedOutcome} ask liquidity is available yet.` })
      return
    }

    const timer = createClientPositionDebugTimer({
      marketSymbol: selectedMarket.symbol,
      outcome,
      side,
      amount: numericAmount,
      slippagePercent: numericSlippagePercent,
    })

    try {
      setIsTrading(true)
      setStatus({ tone: 'neutral', message: `${side === 'buy' ? 'Buying' : 'Selling'} ${outcome} with server signer...` })
      const response = await tradingApiFetch(
        '/api/trading/position',
        {
          wallet_id: serverWalletId,
          market_id: selectedMarket.info.marketId,
          market_symbol: selectedMarket.symbol,
          tradable: targetTradable,
          outcome,
          side,
          amount: numericAmount,
          slippage_percent: numericSlippagePercent,
        },
        timer
      )
      const result = (await timer.wait('response.json /api/trading/position', response.json().catch(() => null))) as
        | PlacePositionApiResponse
        | ApiErrorResponse
        | null

      if (result?.debug) {
        console.info(`[trade-position-client:${timer.summary().id}] server timing`, result.debug)
      }

      if (!response.ok) {
        throw new Error(apiErrorMessage(result, 'Failed to place position'))
      }

      const { order, balances: nextBalances } = result as PlacePositionApiResponse
      if (nextBalances) {
        setBalances(nextBalances)
      }
      setStatus({
        tone: 'success',
        message: `${side === 'buy' ? 'Buy' : 'Sell'} ${outcome} ${order.status}. Filled ${formatNumber(
          order.filled
        )} of ${formatNumber(order.amount)}.`,
        hash: order.txHash,
      })
      void refreshBook({ silent: true, timer })
      void refreshBalances({ silent: true })
      console.info(`[trade-position-client:${timer.summary().id}] complete`, timer.summary())
    } catch (error) {
      console.error(`[trade-position-client:${timer.summary().id}] failed`, timer.summary())
      setStatus({ tone: 'error', message: `Position failed: ${errorMessage(error)}` })
    } finally {
      setIsTrading(false)
    }
  }

  async function claimClosedRewards() {
    if (!serverWalletId) {
      setStatus({ tone: 'error', message: 'No Privy server-signing wallet is available.' })
      return
    }

    if (!selectedMarketId) {
      setStatus({ tone: 'error', message: 'Select an event market before claiming rewards.' })
      return
    }

    try {
      setIsClaimingRewards(true)
      setStatus({ tone: 'neutral', message: 'Checking the selected market for claimable rewards...' })
      const response = await tradingApiFetch('/api/trading/rewards', {
        wallet_id: serverWalletId,
        market_ids: [selectedMarketId],
      })
      const result = (await response.json().catch(() => null)) as
        | ClaimRewardsApiResponse
        | ApiErrorResponse
        | null

      if (!response.ok) {
        throw new Error(apiErrorMessage(result, 'Failed to claim rewards'))
      }

      const claimResult = result as ClaimRewardsApiResponse
      setRewardClaimResult({
        scanned: claimResult.scanned,
        claimed: claimResult.claimed,
        skipped: claimResult.skipped,
      })

      if (claimResult.balances) {
        setBalances(claimResult.balances)
      }

      const firstHash = claimResult.claimed[0]?.hash
      setStatus({
        tone: 'success',
        message:
          claimResult.claimed.length > 0
            ? `Claimed ${claimResult.claimed.length} closed-market reward(s).`
            : 'No settled rewards found to claim yet.',
        hash: firstHash,
      })
    } catch (error) {
      setStatus({ tone: 'error', message: `Claim rewards failed: ${errorMessage(error)}` })
    } finally {
      setIsClaimingRewards(false)
    }
  }

  if (!ready || !authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#87B9D6] px-6 text-[#3C1F11]">
        <p className="rounded-md bg-[#F7E0B8] px-5 py-4 text-sm font-semibold shadow-[0_6px_0_#673818]">
          Loading trading...
        </p>
      </main>
    )
  }

  return (
    <SomniaMarketsProvider client={exchange.client}>
      <main className="min-h-screen bg-[#87B9D6] px-5 py-8 text-[#3C1F11]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <TradingHeader walletAddress={walletAddress} onProfileClick={() => router.push('/me')} />

          <div className="grid gap-6 lg:grid-cols-[minmax(260px,360px)_1fr] xl:grid-cols-[minmax(250px,320px)_minmax(0,1fr)_minmax(300px,360px)]">
            <MarketList
              markets={markets}
              selectedSymbol={selectedSymbol}
              isLoadingMarkets={isLoadingMarkets}
              onReload={() => setMarketReloadKey((current) => current + 1)}
              onSelectMarket={setSelectedSymbol}
            />

            <section className="rounded-md bg-[#ECD19C] p-5 shadow-[0_8px_0_#673818]">
              <SelectedMarketHeader
                selectedMarket={selectedMarket}
                selectedOutcome={selectedOutcome}
                onSelectOutcome={setSelectedOutcome}
              />
              <ChartPanel />
              <MarketValueChartPanel selectedMarket={selectedMarket} />
              <OrderBookPanel orderBook={orderBook} isLoadingBook={isLoadingBook} lastBookUpdate={lastBookUpdate} />
              <PositionSummary
                selectedPosition={selectedPosition}
                selectedOutcome={selectedOutcome}
                outcomePositions={outcomePositions}
                collateralSymbol={selectedMarket?.quote ?? 'Collateral'}
                collateralBalance={collateralBalance}
              />
              <RewardClaimPanel
                canClaim={Boolean(serverWalletId && selectedMarketId)}
                isClaimingRewards={isClaimingRewards}
                result={rewardClaimResult}
                onClaimRewards={() => void claimClosedRewards()}
              />
              <TradeTicket
                selectedOutcome={selectedOutcome}
                outcomePositions={outcomePositions}
                amount={amount}
                slippagePercent={slippagePercent}
                bestAsk={bestAsk}
                canTrade={Boolean(serverWalletId && selectedTradable)}
                canRefreshBook={Boolean(selectedTradable)}
                canRefreshBalances={Boolean(serverWalletId)}
                isTrading={isTrading}
                isLoadingBook={isLoadingBook}
                isLoadingBalances={isLoadingBalances}
                onAmountChange={setAmount}
                onSlippagePercentChange={setSlippagePercent}
                onBuyPosition={() => void placePosition('buy')}
                onSellPosition={(outcome) => void placePosition('sell', outcome)}
                onRefreshBook={() => void refreshBook()}
                onRefreshBalances={() => void refreshBalances()}
              />
              <StatusPanel status={status} />
            </section>

            <FilledOrdersPanel selectedMarket={selectedMarket} />
          </div>
        </div>
      </main>
    </SomniaMarketsProvider>
  )
}
