import { describe, expect, test } from 'bun:test'
import { oppositeOutcome, pickCost, pickIntent, tradeSide, walletBias } from '../intent.ts'
import { maxTradeCost, minTradeCost, resolveCostBounds, type BookPrices, type WalletPositions } from '../types.ts'

const yesWallet = '0x0000000000000000000000000000000000000000'
const noWallet = '0x0000000000000000000000000000000000000001'

const funded: WalletPositions = { yes: 0, no: 0, collateral: 40 }
const longYes: WalletPositions = { yes: 30, no: 0, collateral: 40 }
const prices: BookPrices = { yesBid: 0.6, noBid: 0.4 }

function sequence(values: number[]) {
  let index = 0
  return () => {
    const value = values[index] ?? 0
    index += 1
    return value
  }
}

describe('walletBias', () => {
  test('is sticky per address', () => {
    expect(walletBias(yesWallet)).toBe('YES')
    expect(walletBias(noWallet)).toBe('NO')
    expect(walletBias(yesWallet)).toBe('YES')
  })
})

describe('tradeSide', () => {
  test('covers every binary side', () => {
    expect(tradeSide('YES', 'buy')).toBe('BUY_YES')
    expect(tradeSide('NO', 'buy')).toBe('BUY_NO')
    expect(tradeSide('YES', 'sell')).toBe('SELL_YES')
    expect(tradeSide('NO', 'sell')).toBe('SELL_NO')
    expect(oppositeOutcome('YES')).toBe('NO')
  })
})

describe('pickCost', () => {
  test('stays between the floor and the limit', () => {
    expect(pickCost(5)).toBeNull()
    expect(pickCost(5.01, () => 0)).toBeCloseTo(5.01, 8)
    expect(pickCost(12, () => 0)).toBeGreaterThan(minTradeCost)
    expect(pickCost(12, () => 1)).toBe(12)
    expect(pickCost(100, () => 1)).toBe(maxTradeCost)
    expect(pickCost(40, () => 1, { min: 5, limit: 8 })).toBe(8)
  })
})

describe('resolveCostBounds', () => {
  test('rejects a limit that is not above the floor', () => {
    expect(() => resolveCostBounds({ limit: 5 })).toThrow('limit cost must be greater than 5')
    expect(resolveCostBounds({ limit: 20 })).toEqual({ min: 5, limit: 20 })
  })
})

describe('pickIntent', () => {
  test('buys the wallet bias when it has no position', () => {
    const intent = pickIntent(yesWallet, funded, prices, sequence([0.1, 0.9, 0.5]))
    expect(intent?.side).toBe('BUY_YES')
    expect(intent?.cost).toBeGreaterThan(minTradeCost)
  })

  test('can flip away from the wallet bias', () => {
    const intent = pickIntent(yesWallet, funded, prices, sequence([0.99, 0.9, 0.5]))
    expect(intent?.side).toBe('BUY_NO')
  })

  test('sells the biased outcome when the position is large enough', () => {
    const intent = pickIntent(yesWallet, longYes, prices, sequence([0.1, 0.1, 0.5]))
    expect(intent?.side).toBe('SELL_YES')
    expect(intent?.cost).toBeGreaterThan(minTradeCost)
    expect(intent?.cost).toBeLessThanOrEqual(30 * 0.6)
  })

  test('sells NO when that wallet is biased NO and funded on that side', () => {
    const intent = pickIntent(noWallet, { yes: 0, no: 40, collateral: 40 }, prices, sequence([0.1, 0.1, 0.5]))
    expect(intent?.side).toBe('SELL_NO')
    expect(intent?.cost).toBeGreaterThan(minTradeCost)
  })

  test('skips when the wallet cannot fund a trade above 5', () => {
    expect(pickIntent(yesWallet, { yes: 0, no: 0, collateral: 4 }, prices, () => 0.1)).toBeNull()
  })

  test('caps each trade at the limit cost', () => {
    const intent = pickIntent(yesWallet, funded, prices, sequence([0.1, 0.9, 1]), { limit: 7 })
    expect(intent?.cost).toBeGreaterThan(minTradeCost)
    expect(intent?.cost).toBeLessThanOrEqual(7)
  })
})
