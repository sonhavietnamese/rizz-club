import { describe, expect, test } from 'bun:test'
import {
  formatTraderCount,
  onlineTraderCount,
  parseTraders,
  traderIdentity,
  traderKey,
  type Trader,
} from './traders'

function trader(overrides: Partial<Trader> = {}): Trader {
  return {
    address: '0x1111111111111111111111111111111111111111',
    name: 'nova',
    status: 'online',
    ...overrides,
  }
}

describe('traderKey', () => {
  test('lowercases and strips firebase-forbidden characters', () => {
    expect(traderKey('0xAbC.def#1$[x]/Y')).toBe('0xabc_def_1__x__y')
  })
})

describe('parseTraders', () => {
  test('reads roster entries and the anonymous counter', () => {
    const snapshot = parseTraders({
      '0x1111111111111111111111111111111111111111': trader(),
      '0x2222222222222222222222222222222222222222': trader({
        address: '0x2222222222222222222222222222222222222222',
        name: 'kira',
        status: 'offline',
      }),
      anonymous: 4,
    })

    expect(snapshot.anonymous).toBe(4)
    expect(snapshot.traders).toEqual([
      trader(),
      trader({
        address: '0x2222222222222222222222222222222222222222',
        name: 'kira',
        status: 'offline',
      }),
    ])
  })

  test('drops invalid rows and clamps a negative anonymous count', () => {
    expect(
      parseTraders({
        anonymous: -3.8,
        bad: { address: '0x1', name: 'x' },
        empty: null,
        ok: trader({ name: 'jax' }),
      }),
    ).toEqual({
      traders: [trader({ name: 'jax' })],
      anonymous: 0,
    })
  })

  test('treats a missing tree as empty', () => {
    expect(parseTraders(null)).toEqual({ traders: [], anonymous: 0 })
    expect(parseTraders(undefined)).toEqual({ traders: [], anonymous: 0 })
  })
})

describe('onlineTraderCount', () => {
  test('sums online roster traders with the anonymous counter', () => {
    expect(
      onlineTraderCount({
        traders: [
          trader(),
          trader({ address: '0x2', name: 'kira', status: 'offline' }),
          trader({ address: '0x3', name: 'jax', status: 'online' }),
        ],
        anonymous: 5,
      }),
    ).toBe(7)
  })
})

describe('formatTraderCount', () => {
  test('uses a singular label for one trader', () => {
    expect(formatTraderCount(0)).toBe('0 traders')
    expect(formatTraderCount(1)).toBe('1 trader')
    expect(formatTraderCount(12)).toBe('12 traders')
  })
})

describe('traderIdentity', () => {
  test('prefers a social name and falls back to the wallet', () => {
    expect(
      traderIdentity({
        id: 'did:privy:1',
        wallet: { address: '0x1111111111111111111111111111111111111111' },
        google: { name: 'Nova' },
      }),
    ).toEqual({
      address: '0x1111111111111111111111111111111111111111',
      name: 'Nova',
    })

    expect(
      traderIdentity({
        id: 'did:privy:2',
        wallet: { address: '0x2222222222222222222222222222222222222222' },
      }),
    ).toEqual({
      address: '0x2222222222222222222222222222222222222222',
      name: '0x2222...2222',
    })
  })
})
