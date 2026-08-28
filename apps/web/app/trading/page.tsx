'use client'

import {
  ChartPanel,
  MarketList,
  OrderBookPanel,
  PositionSummary,
  RewardClaimPanel,
  SelectedMarketHeader,
  StatusPanel,
  TradeTicket,
  TradingHeader,
  formatNumber,
  ohlcvToCandle,
  type Candle,
  type Outcome,
  type RewardClaimResult,
  type Timeframe,
  type TradingStatus,
} from './components'
import { createDreamDexExchange } from '@/lib/dreamdex'
import {
  isBinaryMarket,
  type UnifiedBalances,
  type UnifiedMarket,
  type UnifiedOrderBook,
} from '@somnia-chain/markets-sdk'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

const chartRefreshMs = 15_000

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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

function apiErrorMessage(result: unknown, fallback: string) {
  if (!result || typeof result !== 'object') return fallback

  const response = result as ApiErrorResponse
  if (typeof response.details === 'string') return response.details
  return response.error ?? fallback
}

function createClientPositionDebugTimer({
  marketSymbol,
  outcome,
  amount,
  slippagePercent,
}: {
  marketSymbol: string
  outcome: Outcome
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
  const [timeframe, setTimeframe] = useState<Timeframe>('1m')
  const [orderBook, setOrderBook] = useState<UnifiedOrderBook | null>(null)
  const [candles, setCandles] = useState<Candle[]>([])
  const [chartError, setChartError] = useState<string | null>(null)
  const [lastChartUpdate, setLastChartUpdate] = useState<number | undefined>()
  const [lastBookUpdate, setLastBookUpdate] = useState<number | undefined>()
  const [balances, setBalances] = useState<UnifiedBalances | null>(null)
  const [amount, setAmount] = useState('5')
  const [slippagePercent, setSlippagePercent] = useState('2')
  const [marketReloadKey, setMarketReloadKey] = useState(0)
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true)
  const [isLoadingBook, setIsLoadingBook] = useState(false)
  const [isLoadingCandles, setIsLoadingCandles] = useState(false)
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
  const selectedChartSymbol = selectedTradable ?? selectedMarket?.symbol
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

    async function loadMarkets() {
      try {
        setIsLoadingMarkets(true)
        setStatus({ tone: 'neutral', message: 'Loading DreamDex event markets...' })
        const registry = await exchange.loadMarkets(true)
        const binaryMarkets = Object.values(registry)
          .filter((market) => market.active && isBinaryMarket(market.info) && market.outcomes?.length)
          .sort((left, right) => {
            const leftInfo = left.info
            const rightInfo = right.info
            if (!isBinaryMarket(leftInfo) || !isBinaryMarket(rightInfo)) return 0

            return Number(leftInfo.expiry) - Number(rightInfo.expiry)
          })

        if (canceled) return

        setMarkets(binaryMarkets)
        setSelectedSymbol((current) => current ?? binaryMarkets[0]?.symbol ?? null)
        setStatus({
          tone: 'neutral',
          message:
            binaryMarkets.length > 0
              ? 'Pick a market and buy the touch with IOC.'
              : 'No active DreamDex event markets were returned.',
        })
      } catch (error) {
        if (!canceled) {
          setStatus({ tone: 'error', message: `Could not load markets: ${errorMessage(error)}` })
        }
      } finally {
        if (!canceled) {
          setIsLoadingMarkets(false)
        }
      }
    }

    void loadMarkets()

    return () => {
      canceled = true
    }
  }, [exchange, marketReloadKey])

  useEffect(() => {
    if (!selectedTradable) return

    let canceled = false
    const tradable = selectedTradable
    const selectedTimeframe = timeframe

    async function loadCandles() {
      try {
        setIsLoadingCandles(true)
        setChartError(null)
        const rows = await exchange.fetchOHLCV(tradable, selectedTimeframe, undefined, 80)
        if (canceled) return

        setCandles(rows.map(ohlcvToCandle))
        setLastChartUpdate(rows.at(-1)?.[0])
      } catch (error) {
        if (!canceled) {
          setCandles([])
          setChartError(`Could not load candles: ${errorMessage(error)}`)
        }
      } finally {
        if (!canceled) {
          setIsLoadingCandles(false)
        }
      }
    }

    void loadCandles()
    const refreshTimer = window.setInterval(loadCandles, chartRefreshMs)

    return () => {
      canceled = true
      window.clearInterval(refreshTimer)
    }
  }, [exchange, selectedTradable, timeframe])

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

  async function placePosition() {
    if (!serverWalletId) {
      setStatus({ tone: 'error', message: 'No Privy server-signing wallet is available.' })
      return
    }

    if (!selectedMarket || !selectedTradable || !isBinaryMarket(selectedMarket.info)) {
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

    if (bestAsk === undefined) {
      setStatus({ tone: 'error', message: `No ${selectedOutcome} ask liquidity is available yet.` })
      return
    }

    const timer = createClientPositionDebugTimer({
      marketSymbol: selectedMarket.symbol,
      outcome: selectedOutcome,
      amount: numericAmount,
      slippagePercent: numericSlippagePercent,
    })

    try {
      setIsTrading(true)
      setStatus({ tone: 'neutral', message: `Taking ${selectedOutcome} position with server signer...` })
      const response = await tradingApiFetch(
        '/api/trading/position',
        {
          wallet_id: serverWalletId,
          market_id: selectedMarket.info.marketId,
          market_symbol: selectedMarket.symbol,
          tradable: selectedTradable,
          outcome: selectedOutcome,
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
        message: `${selectedOutcome} position ${order.status}. Filled ${formatNumber(order.filled)} of ${formatNumber(
          order.amount
        )}.`,
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
    <main className="min-h-screen bg-[#87B9D6] px-5 py-8 text-[#3C1F11]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <TradingHeader walletAddress={walletAddress} onProfileClick={() => router.push('/me')} />

        <div className="grid gap-6 lg:grid-cols-[minmax(260px,360px)_1fr]">
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
            <ChartPanel
              selectedChartSymbol={selectedChartSymbol}
              isLoadingCandles={isLoadingCandles}
              lastChartUpdate={lastChartUpdate}
              chartError={chartError}
              timeframe={timeframe}
              candles={candles}
              onSelectTimeframe={setTimeframe}
            />
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
              onPlacePosition={() => void placePosition()}
              onRefreshBook={() => void refreshBook()}
              onRefreshBalances={() => void refreshBalances()}
            />
            <StatusPanel status={status} />
          </section>
        </div>
      </div>
    </main>
  )
}
