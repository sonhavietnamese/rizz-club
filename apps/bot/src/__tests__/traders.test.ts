import { describe, expect, test } from 'bun:test'
import { toTrader, traderKey, traderUpdates } from '../traders'

const nova = {
  index: 0,
  address: '0x1111111111111111111111111111111111111111' as const,
}

const kira = {
  index: 1,
  address: '0x2222222222222222222222222222222222222222' as const,
}

describe('toTrader', () => {
  test('uses the wallet display name, requested status, and lastSeen', () => {
    expect(toTrader(nova, 'online', 1_000)).toEqual({
      address: nova.address,
      name: 'nova',
      status: 'online',
      lastSeen: 1_000,
    })
    expect(toTrader(kira, 'offline', 2_000)).toEqual({
      address: kira.address,
      name: 'kira',
      status: 'offline',
      lastSeen: 2_000,
    })
  })
})

describe('traderUpdates', () => {
  test('keys each wallet under /traders by a safe address', () => {
    expect(traderUpdates([nova, kira], 'online', 1_000)).toEqual({
      [traderKey(nova.address)]: {
        address: nova.address,
        name: 'nova',
        status: 'online',
        lastSeen: 1_000,
      },
      [traderKey(kira.address)]: {
        address: kira.address,
        name: 'kira',
        status: 'online',
        lastSeen: 1_000,
      },
    })
  })
})
