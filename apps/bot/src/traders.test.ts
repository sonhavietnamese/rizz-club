import { describe, expect, test } from 'bun:test'
import { toTrader, traderKey, traderUpdates } from './traders'

const nova = {
  index: 0,
  address: '0x1111111111111111111111111111111111111111' as const,
}

const kira = {
  index: 1,
  address: '0x2222222222222222222222222222222222222222' as const,
}

describe('toTrader', () => {
  test('uses the wallet display name and requested status', () => {
    expect(toTrader(nova, 'online')).toEqual({
      address: nova.address,
      name: 'nova',
      status: 'online',
    })
    expect(toTrader(kira, 'offline')).toEqual({
      address: kira.address,
      name: 'kira',
      status: 'offline',
    })
  })
})

describe('traderUpdates', () => {
  test('keys each wallet under /traders by a safe address', () => {
    expect(traderUpdates([nova, kira], 'online')).toEqual({
      [traderKey(nova.address)]: {
        address: nova.address,
        name: 'nova',
        status: 'online',
      },
      [traderKey(kira.address)]: {
        address: kira.address,
        name: 'kira',
        status: 'online',
      },
    })
  })
})
