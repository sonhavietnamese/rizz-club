import { isBinaryMarket, type LiveFill, type UnifiedMarket } from '@somnia-chain/markets-sdk'
import { dashboardFillLimit, defaultQuoteDecimals } from '../config.ts'
import { pickTradable } from '../extract/discovery.ts'
import type { MarketValue } from '../extract/values.ts'
import { rawToHuman, rawToProbability } from '../lib/units.ts'
import type { DashboardFill, WatcherSnapshot } from '../types.ts'

function fillTimestampMs(timestamp: string | undefined) {
  if (!timestamp) return undefined
  const seconds = Number(timestamp)
  if (!Number.isFinite(seconds)) return undefined
  return seconds * 1000
}

export function toDashboardFills(fills: LiveFill[], quoteDecimals: number, baseDecimals: number): DashboardFill[] {
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

export function marketMeta(market: UnifiedMarket) {
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

export function snapshotFromValue(market: UnifiedMarket, value: MarketValue): WatcherSnapshot {
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

export function switchingSnapshot(previous: UnifiedMarket | undefined, message: string): WatcherSnapshot {
  return {
    phase: 'connecting',
    message,
    ...(previous ? marketMeta(previous) : {}),
    fillCount: 0,
    fills: [],
    updatedAt: Date.now(),
  }
}
