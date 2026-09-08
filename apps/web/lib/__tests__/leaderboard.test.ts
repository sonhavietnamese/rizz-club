import { describe, expect, test } from 'bun:test'
import {
  advanceLeaderboardHold,
  formatCents,
  formatShares,
  toLeaderboardItems,
  withTraderData,
  type LeaderboardHold,
  type LeaderboardItem,
} from '../leaderboard'
import type { MarketTrade } from '../market-trades'
import type { Trader } from '../traders'

function trade(overrides: Partial<MarketTrade> = {}): MarketTrade {
  return {
    id: '1',
    t: 1,
    taker: '0x1111111111111111111111111111111111111111',
    outcome: 'YES',
    side: 'BUY_YES',
    amount: 100,
    price: 0.4,
    cost: 40,
    ...overrides,
  }
}

function byId(items: LeaderboardItem[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}

describe('toLeaderboardItems', () => {
  test('averages same-direction fills as one DCA position', () => {
    const items = toLeaderboardItems(
      [
        trade({ id: 'a', t: 1, amount: 100, price: 0.4, cost: 40 }),
        trade({ id: 'b', t: 2, amount: 100, price: 0.6, cost: 60 }),
      ],
      { yes: 0.7 },
    )

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      shares: 200,
      avgPrice: 0.5,
      side: 'up',
      profit: 40,
    })
  })

  test('splits YES and NO for the same trader into two rows', () => {
    const items = toLeaderboardItems(
      [
        trade({ id: 'yes', outcome: 'YES', side: 'BUY_YES', amount: 50, price: 0.4, cost: 20 }),
        trade({
          id: 'no',
          t: 2,
          outcome: 'NO',
          side: 'BUY_NO',
          amount: 80,
          price: 0.3,
          cost: 24,
        }),
      ],
      { yes: 0.55, no: 0.45 },
    )

    expect(items.map((item) => item.side).sort()).toEqual(['down', 'up'])
    expect(items).toHaveLength(2)
  })

  test('sells reduce the DCA stack and keep the average', () => {
    const [item] = toLeaderboardItems(
      [
        trade({ id: 'buy-1', t: 1, amount: 100, price: 0.4, cost: 40 }),
        trade({ id: 'buy-2', t: 2, amount: 100, price: 0.6, cost: 60 }),
        trade({ id: 'sell', t: 3, side: 'SELL_YES', amount: 50, price: 0.8, cost: 40 }),
      ],
      { yes: 0.7 },
    )

    expect(item?.shares).toBe(150)
    expect(item?.avgPrice).toBeCloseTo(0.5)
    expect(item?.profit).toBeCloseTo(30)
  })

  test('drops a position that is fully sold', () => {
    const items = toLeaderboardItems(
      [
        trade({ id: 'buy', t: 1, amount: 40, price: 0.25, cost: 10 }),
        trade({ id: 'sell', t: 2, side: 'SELL_YES', amount: 40, price: 0.4, cost: 16 }),
      ],
      { yes: 0.5 },
    )

    expect(items).toEqual([])
  })

  test('sorts by floating profit, highest first', () => {
    const items = toLeaderboardItems(
      [
        trade({
          id: 'loser',
          t: 1,
          taker: '0x2222222222222222222222222222222222222222',
          amount: 100,
          price: 0.8,
          cost: 80,
        }),
        trade({
          id: 'winner',
          t: 2,
          taker: '0x3333333333333333333333333333333333333333',
          amount: 100,
          price: 0.2,
          cost: 20,
        }),
      ],
      { yes: 0.5 },
    )

    expect(items.map((item) => item.trader)).toEqual([
      '0x3333333333333333333333333333333333333333',
      '0x2222222222222222222222222222222222222222',
    ])
    expect(items[0]?.profit).toBeGreaterThan(items[1]?.profit ?? 0)
  })

  test('ignores fills without a taker or outcome', () => {
    const items = toLeaderboardItems(
      [trade({ taker: null }), trade({ outcome: null, side: null, kind: null }), trade({ id: 'kept' })],
      { yes: 0.5 },
    )

    expect(Object.keys(byId(items))).toEqual(['0x1111111111111111111111111111111111111111:YES'])
  })
})

describe('withTraderData', () => {
  const now = 1_000_000
  const address = '0x1111111111111111111111111111111111111111'

  function roster(overrides: Partial<Trader> = {}): Trader {
    return {
      address,
      name: 'nova',
      status: 'online',
      ...overrides,
    }
  }

  test('overlays the roster name and a live heart rate', () => {
    const [row] = toLeaderboardItems([trade()], { yes: 0.5 })
    const [item] = withTraderData([row!], [roster({ heartRate: 84, heartRateAt: now - 1_000 })], now)

    expect(item).toMatchObject({
      trader: address,
      name: 'nova',
      heartRate: 84,
    })
  })

  test('matches mixed-case wallet addresses', () => {
    const [row] = toLeaderboardItems([trade()], { yes: 0.5 })
    const [item] = withTraderData(
      [row!],
      [roster({ address: '0x1111111111111111111111111111111111111111'.toUpperCase(), name: 'kira' })],
      now,
    )

    expect(item?.name).toBe('kira')
  })

  test('keeps the truncated address when the trader is unknown', () => {
    const items = toLeaderboardItems([trade()], { yes: 0.5 })
    const next = withTraderData(items, [roster({ address: '0x2222222222222222222222222222222222222222' })], now)

    expect(next).toBe(items)
    expect(next[0]?.name).toBe('0x1111...1111')
    expect(next[0]?.heartRate).toBeUndefined()
  })

  test('drops a stale heart rate and still uses the roster name', () => {
    const [row] = toLeaderboardItems([trade()], { yes: 0.5 })
    const [item] = withTraderData([row!], [roster({ heartRate: 90, heartRateAt: now - 120_000 })], now)

    expect(item?.name).toBe('nova')
    expect(item?.heartRate).toBeUndefined()
  })
})

describe('leaderboard formatters', () => {
  test('formats share size and entry cents', () => {
    expect(formatShares(100)).toBe('100')
    expect(formatShares(12.34)).toBe('12.3')
    expect(formatCents(0.123)).toBe('12.3¢')
  })
})

function item(id: string): LeaderboardItem {
  return {
    id,
    trader: id,
    name: id,
    avatar: '',
    outcome: 'YES',
    side: 'up',
    shares: 10,
    avgPrice: 0.4,
    profit: 1,
  }
}

describe('advanceLeaderboardHold', () => {
  const first: LeaderboardHold = {
    marketKey: 'm1',
    items: [item('alice')],
    epoch: 0,
  }

  test('keeps the last board when the market ends', () => {
    expect(advanceLeaderboardHold(first, '', [])).toEqual({ hold: first, frozen: true })
  })

  test('keeps the last board until the next market has a trade', () => {
    expect(advanceLeaderboardHold(first, 'm2', [])).toEqual({ hold: first, frozen: true })
  })

  test('hands off and bumps epoch when the next market trades', () => {
    const nextItems = [item('bob')]
    expect(advanceLeaderboardHold(first, 'm2', nextItems)).toEqual({
      hold: { marketKey: 'm2', items: nextItems, epoch: 1 },
      frozen: false,
    })
  })

  test('updates in place on the same market', () => {
    const nextItems = [item('alice'), item('bob')]
    expect(advanceLeaderboardHold(first, 'm1', nextItems)).toEqual({
      hold: { marketKey: 'm1', items: nextItems, epoch: 0 },
      frozen: false,
    })
  })

  test('clears when the live market has no positions left', () => {
    expect(advanceLeaderboardHold(first, 'm1', [])).toEqual({
      hold: { marketKey: 'm1', items: [], epoch: 0 },
      frozen: false,
    })
  })

  test('reuses the empty hold instead of allocating another', () => {
    const empty: LeaderboardHold = { marketKey: '', items: [], epoch: 0 }
    const firstPass = advanceLeaderboardHold(empty, '', [])
    const secondPass = advanceLeaderboardHold(firstPass.hold, '', [])

    expect(firstPass).toEqual({ hold: empty, frozen: false })
    expect(secondPass.hold).toBe(firstPass.hold)
  })
})
