import { isBinaryMarket, SomniaMarkets, type UnifiedMarket } from '@somnia-chain/markets-sdk'
import { targetAsset, targetIntervalSeconds } from '../config.ts'
import type { Outcome } from '../types.ts'

export function binaryMarketIntervalSeconds(market: UnifiedMarket) {
  if (!isBinaryMarket(market.info)) return null

  const intervalSeconds = market.info.intervalSec ? Number(market.info.intervalSec) : Number.NaN
  if (Number.isFinite(intervalSeconds) && intervalSeconds > 0) return intervalSeconds

  const tradingStart = Number(market.info.tradingStart)
  const expiry = Number(market.info.expiry)
  if (!Number.isFinite(tradingStart) || !Number.isFinite(expiry)) return null

  return expiry - tradingStart
}

export function isLiveBtcMarket(market: UnifiedMarket, nowSeconds: number) {
  if (!market.active || !isBinaryMarket(market.info) || !market.outcomes?.length) return false
  if (binaryMarketIntervalSeconds(market) !== targetIntervalSeconds) return false
  if (!market.base.toUpperCase().startsWith(`${targetAsset}-`)) return false

  const tradingStart = Number(market.info.tradingStart)
  const expiry = Number(market.info.expiry)

  return Number.isFinite(tradingStart) && Number.isFinite(expiry) && tradingStart <= nowSeconds && nowSeconds < expiry
}

export function compareLiveMarkets(left: UnifiedMarket, right: UnifiedMarket) {
  if (!isBinaryMarket(left.info) || !isBinaryMarket(right.info)) return 0

  const expiryDelta = Number(left.info.expiry) - Number(right.info.expiry)
  if (expiryDelta !== 0) return expiryDelta

  const startDelta = Number(right.info.tradingStart) - Number(left.info.tradingStart)
  if (startDelta !== 0) return startDelta

  return left.symbol.localeCompare(right.symbol)
}

export async function findCurrentLiveBtcMarket(exchange: SomniaMarkets) {
  const registry = await exchange.loadMarkets(true)
  const nowSeconds = Math.floor(Date.now() / 1000)

  return (
    Object.values(registry)
      .filter((market) => isLiveBtcMarket(market, nowSeconds))
      .sort(compareLiveMarkets)[0] ?? null
  )
}

export function pickTradable(market: UnifiedMarket, outcome: Outcome) {
  return market.outcomes?.find((item) => item.label === outcome)?.symbol ?? null
}
