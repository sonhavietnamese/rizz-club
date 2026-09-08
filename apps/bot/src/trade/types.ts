import type { BinarySide } from '@somnia-chain/markets-sdk'

export type Outcome = 'YES' | 'NO'
export type TradeAction = 'buy' | 'sell'
export type TradeSide = BinarySide

export type WalletPositions = {
  yes: number
  no: number
  collateral: number
}

export type BookPrices = {
  yesBid?: number
  noBid?: number
}

export type TradeIntent = {
  side: TradeSide
  outcome: Outcome
  action: TradeAction
  cost: number
}

export type TradeResult = {
  wallet: `0x${string}`
  marketId: string
  symbol: string
  side: TradeSide
  cost: number
  quantity: number
  price: number
  filled: number
  txHash?: `0x${string}`
  dryRun: boolean
}

export type CostBounds = {
  min: number
  limit: number
}

export const minTradeCost = 5
export const maxTradeCost = 12
export const defaultCostBounds: CostBounds = {
  min: minTradeCost,
  limit: maxTradeCost,
}
export const stickiness = 0.85
export const sellChance = 0.35
export const defaultSlippagePercent = 2

export function resolveCostBounds(bounds?: Partial<CostBounds>): CostBounds {
  const min = bounds?.min ?? minTradeCost
  const limit = bounds?.limit ?? maxTradeCost
  if (!(min > 0) || !Number.isFinite(min)) {
    throw new Error(`min trade cost must be a positive number, got: ${bounds?.min}`)
  }
  if (!(limit > min) || !Number.isFinite(limit)) {
    throw new Error(`limit cost must be greater than ${min}, got: ${bounds?.limit}`)
  }
  return { min, limit }
}
