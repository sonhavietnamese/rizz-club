'use client'

import {
  ChartPanel,
  MarketList,
  OrderBookPanel,
  PositionSummary,
  SelectedMarketHeader,
  StatusPanel,
  TradeTicket,
  TradingHeader,
  formatNumber,
  ohlcvToCandle,
  type Outcome,
  type TradingStatus,
} from './components'
import { createDreamDexExchange } from '@/lib/dreamdex'
import { type Candle, type Timeframe } from '@/lib/dreamdex-feed'
import {
  isBinaryMarket,
  type UnifiedBalances,
  type UnifiedMarket,
  type UnifiedOrder,
  type UnifiedOrderBook,
} from '@somnia-chain/markets-sdk'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { Hex } from 'viem'
import { useWalletClient } from 'wagmi'

const chartRefreshMs = 15_000

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export default function TradingPage() {
  const router = useRouter()
  const { ready, authenticated, user } = usePrivy()
  const { data: walletClient } = useWalletClient()
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
  const [status, setStatus] = useState<TradingStatus>({
    tone: 'neutral',
    message: 'Load an event market, then buy YES or NO with your connected wallet.',
  })
  const selectedMarket = markets.find((market) => market.symbol === selectedSymbol) ?? null
  const selectedTradable = selectedMarket?.outcomes?.find((outcome) => outcome.label === selectedOutcome)?.symbol
  const selectedChartSymbol = selectedTradable ?? selectedMarket?.symbol
  const bestAsk = orderBook?.asks[0]?.[0]
  const activeBalances = walletClient ? balances : null
  const selectedPosition = selectedTradable ? (activeBalances?.[selectedTradable]?.total ?? 0) : 0
  const outcomePositions =
    selectedMarket?.outcomes?.map((outcome) => ({
      label: outcome.label,
      symbol: outcome.symbol,
      total: activeBalances?.[outcome.symbol]?.total ?? 0,
    })) ?? []
  const collateralBalance = selectedMarket ? activeBalances?.[selectedMarket.quote]?.total : undefined
  const walletAddress = walletClient?.account?.address ?? user?.wallet?.address

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
    if (walletClient) {
      exchange.setSigner({ walletClient })
    } else {
      exchange.setSigner({})
    }
  }, [exchange, walletClient])

  useEffect(() => {
    if (!walletClient) {
      return
    }

    let canceled = false

    async function loadBalances() {
      try {
        setIsLoadingBalances(true)
        exchange.setSigner({ walletClient })
        const nextBalances = await exchange.fetchBalance()
        if (canceled) return

        setBalances(nextBalances)
      } catch {
        if (!canceled) {
          setBalances(null)
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
  }, [exchange, walletClient])

  async function refreshBalances({ silent = false }: { silent?: boolean } = {}) {
    if (!walletClient) {
      setBalances(null)
      return
    }

    try {
      setIsLoadingBalances(true)
      exchange.setSigner({ walletClient })
      const nextBalances = await exchange.fetchBalance()
      setBalances(nextBalances)
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

  async function refreshBook({ silent = false }: { silent?: boolean } = {}) {
    if (!selectedTradable) return

    try {
      setIsLoadingBook(true)
      const book = await exchange.fetchOrderBook(selectedTradable, 5)
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
    if (!walletClient) {
      setStatus({ tone: 'error', message: 'Connect a wallet before trading.' })
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

    try {
      setIsTrading(true)
      setStatus({ tone: 'neutral', message: 'Checking live market status...' })

      const onchain = await exchange.client.getMarketOnchain(selectedMarket.info.marketId as Hex)
      if (onchain.status !== 1) {
        setStatus({ tone: 'error', message: 'This market is not trading on-chain anymore.' })
        return
      }

      setStatus({ tone: 'neutral', message: `Taking ${selectedOutcome} position...` })
      const slippage = numericSlippagePercent / 100
      const order: UnifiedOrder = await exchange.createOrder(
        selectedTradable,
        'market',
        'buy',
        numericAmount,
        undefined,
        { slippage }
      )

      const hash = order.txHash
      setStatus({
        tone: 'success',
        message: `${selectedOutcome} position ${order.status}. Filled ${formatNumber(order.filled)} of ${formatNumber(
          order.amount
        )}.`,
        hash,
      })
      await Promise.all([refreshBook({ silent: true }), refreshBalances({ silent: true })])
    } catch (error) {
      setStatus({ tone: 'error', message: `Position failed: ${errorMessage(error)}` })
    } finally {
      setIsTrading(false)
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
            <TradeTicket
              selectedOutcome={selectedOutcome}
              amount={amount}
              slippagePercent={slippagePercent}
              bestAsk={bestAsk}
              canTrade={Boolean(walletClient && selectedTradable)}
              canRefreshBook={Boolean(selectedTradable)}
              canRefreshBalances={Boolean(walletClient)}
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
