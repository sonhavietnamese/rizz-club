import {
  isBinaryMarket,
  SOMNIA_TESTNET_ADDRESSES,
  SOMNIA_TESTNET_PRICE_FEED,
  SomniaMarkets,
  toHuman,
  type LiveFill,
  type SomniaMarketsConfig,
  type UnifiedMarket,
} from '@somnia-chain/markets-sdk'
import { somniaShannon } from '@somnia-chain/markets-sdk/chains'

const marketRefreshMs = 5_000
const reconnectDelayMs = 5_000
const targetAsset = 'BTC'
const targetIntervalSeconds = 15 * 60
const marketFillLimit = 400
const dashboardFillLimit = 10
const defaultQuoteDecimals = 6

const dreamDexConfig = {
  indexerUrl: 'https://dev.smk.somnia.host/v1/graphql',
  chain: somniaShannon,
  wsRpcUrl: somniaShannon.rpcUrls.default.webSocket[0],
  addresses: SOMNIA_TESTNET_ADDRESSES,
  priceFeed: SOMNIA_TESTNET_PRICE_FEED,
} satisfies SomniaMarketsConfig

type Outcome = 'YES' | 'NO'
type WatchResult =
  { event: 'market_expired' } | { event: 'market_changed'; market: UnifiedMarket } | { event: 'market_unavailable' }

export type MarketValueSource = 'book' | 'fill' | 'last_price' | 'default'
export type WatcherPhase = 'connecting' | 'waiting' | 'watching' | 'error'

export type DashboardFill = {
  id: string
  timestamp?: number
  side?: string
  kind?: string
  price?: number
  amount?: number
  cost?: number
}

export type WatcherSnapshot = {
  phase: WatcherPhase
  message?: string
  retryAt?: number
  marketSymbol?: string
  marketId?: string
  yesSymbol?: string
  noSymbol?: string
  expirySeconds?: number
  tradingStartSeconds?: number
  yes?: number
  no?: number
  source?: MarketValueSource
  bookYes?: number
  lastFillYes?: number
  fallbackYes?: number
  fillCount: number
  fills: DashboardFill[]
  updatedAt?: number
}

export type SnapshotListener = (snapshot: WatcherSnapshot) => void

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve()
      return
    }

    const timeout = setTimeout(done, ms)

    function done() {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }

    function onAbort() {
      clearTimeout(timeout)
      done()
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
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

function isLiveBtcMarket(market: UnifiedMarket, nowSeconds: number) {
  if (!market.active || !isBinaryMarket(market.info) || !market.outcomes?.length) return false
  if (binaryMarketIntervalSeconds(market) !== targetIntervalSeconds) return false
  if (!market.base.toUpperCase().startsWith(`${targetAsset}-`)) return false

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

async function findCurrentLiveBtcMarket(exchange: SomniaMarkets) {
  const registry = await exchange.loadMarkets(true)
  const nowSeconds = Math.floor(Date.now() / 1000)

  return (
    Object.values(registry)
      .filter((market) => isLiveBtcMarket(market, nowSeconds))
      .sort(compareLiveMarkets)[0] ?? null
  )
}

function pickTradable(market: UnifiedMarket, outcome: Outcome) {
  return market.outcomes?.find((item) => item.label === outcome)?.symbol ?? null
}

function rawToHuman(value: string | null | undefined, decimals: number) {
  if (value == null) return undefined

  try {
    const amount = toHuman(value, decimals)
    return Number.isFinite(amount) ? amount : undefined
  } catch {
    return undefined
  }
}

function rawToProbability(value: string | null | undefined, decimals: number) {
  const probability = rawToHuman(value, decimals)
  if (probability === undefined) return undefined
  return Math.max(0, Math.min(1, probability))
}

function bigintToProbability(value: bigint | undefined, decimals: number) {
  if (value === undefined) return undefined

  try {
    const probability = toHuman(value, decimals)
    if (!Number.isFinite(probability)) return undefined
    return Math.max(0, Math.min(1, probability))
  } catch {
    return undefined
  }
}

function fillSortValue(fill: LiveFill) {
  return fill.blockNumber * 1_000_000 + fill.logIndex
}

function waitUntilAborted(signal: AbortSignal) {
  if (signal.aborted) return Promise.resolve()

  return new Promise<void>((resolve) => {
    signal.addEventListener('abort', () => resolve(), { once: true })
  })
}

function fillTimestampMs(timestamp: string | undefined) {
  if (!timestamp) return undefined
  const seconds = Number(timestamp)
  if (!Number.isFinite(seconds)) return undefined
  return seconds * 1000
}

function toDashboardFills(fills: LiveFill[], quoteDecimals: number, baseDecimals: number): DashboardFill[] {
  return fills
    .slice(-dashboardFillLimit)
    .reverse()
    .map((fill) => ({
      id: fill.id,
      timestamp: fillTimestampMs(fill.timestamp),
      side: fill.takerSide,
      kind: fill.kind,
      price: rawToProbability(fill.fillPrice, quoteDecimals),
      amount: rawToHuman(fill.quantity, baseDecimals),
      cost: rawToHuman(fill.quoteQuantity, quoteDecimals),
    }))
}

function marketMeta(market: UnifiedMarket) {
  const expirySeconds = isBinaryMarket(market.info) ? Number(market.info.expiry) : undefined
  const tradingStartSeconds = isBinaryMarket(market.info) ? Number(market.info.tradingStart) : undefined

  return {
    marketSymbol: market.symbol,
    marketId: market.id,
    yesSymbol: pickTradable(market, 'YES') ?? undefined,
    noSymbol: pickTradable(market, 'NO') ?? undefined,
    expirySeconds: Number.isFinite(expirySeconds) ? expirySeconds : undefined,
    tradingStartSeconds: Number.isFinite(tradingStartSeconds) ? tradingStartSeconds : undefined,
  }
}

type MarketValue = {
  yesValue: number
  noValue: number
  source: MarketValueSource
  bookYes?: number
  lastFillYes?: number
  fallbackYes?: number
  fillCount: number
  fills: LiveFill[]
}

function marketValues(exchange: SomniaMarkets, market: UnifiedMarket): MarketValue | null {
  if (!isBinaryMarket(market.info)) return null

  const decimals = market.info.quoteDecimals ?? defaultQuoteDecimals
  const marketId = market.info.marketId.toLowerCase()
  const liveMarket = exchange.client.getLiveMarketByPool(market.info.poolAddress)
  const binaryMarket = liveMarket && isBinaryMarket(liveMarket) ? liveMarket : market.info
  const book = exchange.client.getLiveBinaryOrderBook(market.info.poolAddress, {
    depth: 5,
  })
  const fills = exchange.client
    .getLiveFills(market.info.poolAddress, { limit: marketFillLimit })
    .filter((fill) => fill.market_id.toLowerCase() === marketId)
    .sort((left, right) => fillSortValue(left) - fillSortValue(right))

  const fallbackYes = rawToProbability(binaryMarket.lastPrice, decimals)
  const bookBid = bigintToProbability(book.yesBids[0]?.price, decimals)
  const bookAsk = bigintToProbability(book.yesAsks[0]?.price, decimals)
  const bookYes = bookBid !== undefined && bookAsk !== undefined ? (bookBid + bookAsk) / 2 : (bookBid ?? bookAsk)
  const lastFillYes = rawToProbability(fills.at(-1)?.fillPrice, decimals)
  const yesValue = bookYes ?? lastFillYes ?? fallbackYes ?? 0.5
  const source: MarketValueSource =
    bookYes !== undefined
      ? 'book'
      : lastFillYes !== undefined
        ? 'fill'
        : fallbackYes !== undefined
          ? 'last_price'
          : 'default'

  return {
    yesValue,
    noValue: 1 - yesValue,
    source,
    bookYes,
    lastFillYes,
    fallbackYes,
    fillCount: fills.length,
    fills,
  }
}

function snapshotFromValue(market: UnifiedMarket, value: MarketValue): WatcherSnapshot {
  const decimals = isBinaryMarket(market.info)
    ? (market.info.quoteDecimals ?? defaultQuoteDecimals)
    : defaultQuoteDecimals
  const baseDecimals = isBinaryMarket(market.info) ? market.info.baseDecimals : defaultQuoteDecimals

  return {
    phase: 'watching',
    ...marketMeta(market),
    yes: value.yesValue,
    no: value.noValue,
    source: value.source,
    bookYes: value.bookYes,
    lastFillYes: value.lastFillYes,
    fallbackYes: value.fallbackYes,
    fillCount: value.fillCount,
    fills: toDashboardFills(value.fills, decimals, baseDecimals),
    updatedAt: Date.now(),
  }
}

async function watchMarketValue(
  exchange: SomniaMarkets,
  market: UnifiedMarket,
  onSnapshot: SnapshotListener,
  signal: AbortSignal,
) {
  if (!isBinaryMarket(market.info)) {
    throw new Error(`Market ${market.symbol} is not a binary market`)
  }

  const handle = await exchange.client.watchMarket(market.info.poolAddress)
  let previousYes: number | undefined
  let hydrated = false

  const publish = () => {
    if (signal.aborted) return
    if (isMarketExpired(market)) return

    const value = marketValues(exchange, market)
    if (!value) return

    if (!hydrated) {
      hydrated = true
      previousYes = value.yesValue
      onSnapshot(snapshotFromValue(market, value))
      return
    }

    if (value.source === 'default' && previousYes !== undefined) return

    previousYes = value.yesValue
    onSnapshot(snapshotFromValue(market, value))
  }

  const unsubscribe = exchange.client.subscribeLive(publish)

  try {
    publish()
    await waitUntilAborted(signal)
  } finally {
    unsubscribe()
    handle.stop()
  }
}

function marketExpiryMs(market: UnifiedMarket) {
  if (!isBinaryMarket(market.info)) return Number.NaN
  const expiryMs = Number(market.info.expiry) * 1000
  return Number.isFinite(expiryMs) ? expiryMs : Number.NaN
}

function isMarketExpired(market: UnifiedMarket, nowMs = Date.now()) {
  const expiryMs = marketExpiryMs(market)
  return Number.isFinite(expiryMs) && nowMs >= expiryMs
}

function millisecondsUntilMarketExpiry(market: UnifiedMarket) {
  const expiryMs = marketExpiryMs(market)
  if (!Number.isFinite(expiryMs)) return marketRefreshMs
  return Math.max(0, expiryMs - Date.now())
}

function successorPollMs(market: UnifiedMarket) {
  const remainingMs = millisecondsUntilMarketExpiry(market)
  if (remainingMs <= 15_000) return 1_000
  return 3_000
}

async function waitUntilMarketExpiry(market: UnifiedMarket, signal: AbortSignal): Promise<WatchResult | void> {
  await sleep(millisecondsUntilMarketExpiry(market), signal)
  if (signal.aborted) return
  return { event: 'market_expired' }
}

async function waitForMarketSwitch(
  exchange: SomniaMarkets,
  currentMarket: UnifiedMarket,
  signal: AbortSignal,
): Promise<WatchResult | void> {
  while (!signal.aborted) {
    await sleep(successorPollMs(currentMarket), signal)
    if (signal.aborted) return

    if (isMarketExpired(currentMarket)) {
      return { event: 'market_expired' }
    }

    const nextMarket = await findCurrentLiveBtcMarket(exchange)
    if (signal.aborted) return

    if (nextMarket && nextMarket.id !== currentMarket.id) {
      return { event: 'market_changed', market: nextMarket }
    }
  }
}

async function watchMarket(
  exchange: SomniaMarkets,
  market: UnifiedMarket,
  onSnapshot: SnapshotListener,
  signal: AbortSignal,
) {
  const yesSymbol = pickTradable(market, 'YES')
  const noSymbol = pickTradable(market, 'NO')

  if (!yesSymbol || !noSymbol) {
    throw new Error(`Market ${market.symbol} does not expose both YES and NO outcomes`)
  }

  onSnapshot({
    phase: 'watching',
    message: 'Hydrating live book',
    ...marketMeta(market),
    fillCount: 0,
    fills: [],
    updatedAt: Date.now(),
  })

  const controller = new AbortController()
  const stop = () => controller.abort()
  signal.addEventListener('abort', stop, { once: true })

  try {
    return await Promise.race<WatchResult | void>([
      watchMarketValue(exchange, market, onSnapshot, controller.signal),
      waitForMarketSwitch(exchange, market, controller.signal),
      waitUntilMarketExpiry(market, controller.signal),
    ])
  } finally {
    signal.removeEventListener('abort', stop)
    controller.abort()
  }
}

function switchingSnapshot(previous: UnifiedMarket | undefined, message: string): WatcherSnapshot {
  return {
    phase: 'connecting',
    message,
    ...(previous ? marketMeta(previous) : {}),
    fillCount: 0,
    fills: [],
    updatedAt: Date.now(),
  }
}

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
              ? `${previousMarket.symbol} expired · waiting for the next ${targetAsset} 15m`
              : `Waiting for a live ${targetAsset} 15m market`,
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
