import { describe, expect, test } from 'bun:test'
import { parseEther, parseUnits } from 'viem'
import {
  failedTradeSetupStatus,
  faucetErrorMessage,
  faucetNeeds,
  formatBalanceLine,
  formatTokenAmount,
  hasAssignedSigner,
  idleTradeSetupStatus,
  isBusyTradeSetup,
  runTradeSetup,
  shortAddress,
  tradeSetupProgress,
  tradeSetupStatus,
  tradeWallet,
  type TradeSetupDeps,
  type TradeSetupStatus,
  type TradeSetupUser,
} from './trade-setup'

const address = '0x1111111111111111111111111111111111111111'

function userWithWallet(overrides: Partial<TradeSetupUser['wallet']> = {}): TradeSetupUser {
  return {
    wallet: { address, id: null, ...overrides },
    linkedAccounts: [
      {
        type: 'wallet',
        chainType: 'ethereum',
        walletClientType: 'privy',
        address,
        id: overrides?.id ?? null,
        delegated: overrides?.delegated ?? null,
      },
    ],
  }
}

function deps(overrides: Partial<TradeSetupDeps> = {}): TradeSetupDeps & { calls: string[] } {
  const calls: string[] = []
  let currentUser: TradeSetupUser | null = null

  return {
    calls,
    getUser: () => currentUser,
    connect: async () => {
      calls.push('connect')
      currentUser = { linkedAccounts: [] }
      return currentUser
    },
    createWallet: async () => {
      calls.push('createWallet')
      currentUser = userWithWallet()
      return { address, id: null }
    },
    assignSigner: async () => {
      calls.push('assignSigner')
      currentUser = userWithWallet({ id: 'wallet_1' })
    },
    refreshUser: async () => {
      calls.push('refreshUser')
    },
    getBalances: async () => {
      calls.push('getBalances')
      return { stt: parseEther('3'), tusdc: parseUnits('80', 6) }
    },
    faucet: async (asset, _amount, fundedAddress) => {
      calls.push(`faucet:${asset}:${fundedAddress}`)
    },
    ...overrides,
    getUser: overrides.getUser
      ? overrides.getUser
      : () => currentUser,
  }
}

async function collect(run: (onStatus: (status: TradeSetupStatus) => void) => Promise<unknown>) {
  const statuses: TradeSetupStatus[] = []
  const result = await run((status) => statuses.push(status))
  return { result, statuses, steps: statuses.map((status) => status.step) }
}

describe('tradeWallet', () => {
  test('prefers the embedded Privy Ethereum wallet', () => {
    expect(
      tradeWallet({
        wallet: { address: '0x2222222222222222222222222222222222222222' },
        linkedAccounts: [
          { type: 'email' },
          {
            type: 'wallet',
            chainType: 'ethereum',
            walletClientType: 'privy',
            address,
            id: 'wallet_1',
          },
        ],
      }),
    ).toEqual({ address, id: 'wallet_1', delegated: null })
  })

  test('falls back to the primary wallet address', () => {
    expect(tradeWallet({ wallet: { address, id: 'wallet_9' } })).toEqual({
      address,
      id: 'wallet_9',
      delegated: null,
    })
  })
})

describe('hasAssignedSigner', () => {
  test('treats a wallet id or delegated flag as assigned', () => {
    expect(hasAssignedSigner({ address })).toBe(false)
    expect(hasAssignedSigner({ address, id: 'wallet_1' })).toBe(true)
    expect(hasAssignedSigner({ address, delegated: true })).toBe(true)
  })
})

describe('faucetNeeds', () => {
  test('faucets only the assets below the trading minimums', () => {
    expect(faucetNeeds({ stt: parseEther('1.99'), tusdc: parseUnits('50', 6) })).toEqual({
      stt: true,
      tusdc: false,
    })
    expect(faucetNeeds({ stt: parseEther('2'), tusdc: parseUnits('49.999999', 6) })).toEqual({
      stt: false,
      tusdc: true,
    })
    expect(faucetNeeds({ stt: parseEther('2'), tusdc: parseUnits('50', 6) })).toEqual({
      stt: false,
      tusdc: false,
    })
  })
})

describe('status copy', () => {
  test('names each setup step for the player', () => {
    expect(tradeSetupStatus('connecting').detail).toBe('Open Privy to sign in. We will create a wallet next.')
    expect(tradeSetupStatus('creating_wallet').title).toBe('CREATING WALLET')
    expect(tradeSetupStatus('assigning_signer').detail).toBe('Authorizing the app to sign trades for this wallet.')
    expect(
      tradeSetupStatus('funding_stt', { balances: { stt: parseEther('0.4'), tusdc: 0n } }).detail,
    ).toBe('0.4 STT is below 2 STT. Sending 2 STT from the faucet.')
    expect(
      tradeSetupStatus('funding_tusdc', { balances: { stt: 0n, tusdc: parseUnits('12.5', 6) } }).detail,
    ).toBe('12.5 tUSDC is below 50 tUSDC. Sending 50 tUSDC from the faucet.')
    expect(
      tradeSetupStatus('ready', { address, balances: { stt: parseEther('2.5'), tusdc: parseUnits('80', 6) } }).detail,
    ).toBe('0x1111...1111 · 2.5 STT · 80 tUSDC')
  })

  test('formats idle and error states', () => {
    expect(idleTradeSetupStatus.title).toBe('START TRADING')
    expect(failedTradeSetupStatus(new Error('Sign-in was cancelled.')).detail).toBe('Sign-in was cancelled.')
    expect(isBusyTradeSetup('funding_stt')).toBe(true)
    expect(isBusyTradeSetup('ready')).toBe(false)
    expect(tradeSetupProgress('assigning_signer')).toBe(3)
    expect(tradeSetupProgress('ready')).toBe(5)
  })

  test('formats token amounts and faucet errors', () => {
    expect(formatTokenAmount(parseEther('2.5000'), 18)).toBe('2.5')
    expect(formatBalanceLine({ stt: parseEther('3'), tusdc: parseUnits('80.12', 6) })).toBe('3 STT · 80.12 tUSDC')
    expect(shortAddress(address)).toBe('0x1111...1111')
    expect(faucetErrorMessage({ details: ['Requester address must be a valid EVM address'] })).toBe(
      'Requester address must be a valid EVM address',
    )
  })
})

describe('runTradeSetup', () => {
  test('connects, creates a wallet, assigns a signer, and skips faucets when funded', async () => {
    const setup = deps()
    const { result, steps } = await collect((onStatus) => runTradeSetup(setup, onStatus))

    expect(result).toEqual({
      address,
      stt: parseEther('3'),
      tusdc: parseUnits('80', 6),
    })
    expect(setup.calls.filter((call) => !call.startsWith('refreshUser'))).toEqual([
      'connect',
      'createWallet',
      'assignSigner',
      'getBalances',
    ])
    expect(steps).toEqual([
      'connecting',
      'creating_wallet',
      'assigning_signer',
      'checking_balances',
      'checking_balances',
      'ready',
    ])
  })

  test('reuses an existing signed-in wallet and only faucets the low asset', async () => {
    const current = userWithWallet({ id: 'wallet_1' })
    const setup = deps({
      getUser: () => current,
      connect: async () => {
        throw new Error('should not connect')
      },
      createWallet: async () => {
        throw new Error('should not create')
      },
      assignSigner: async () => {
        throw new Error('should not assign')
      },
      getBalances: async () => ({ stt: parseEther('0.5'), tusdc: parseUnits('80', 6) }),
    })

    const { steps } = await collect((onStatus) => runTradeSetup(setup, onStatus))

    expect(setup.calls.filter((call) => call === 'connect' || call === 'createWallet' || call === 'assignSigner')).toEqual(
      [],
    )
    expect(setup.calls.filter((call) => call.startsWith('faucet'))).toEqual([`faucet:STT:${address}`])
    expect(steps).toContain('funding_stt')
    expect(steps).not.toContain('funding_tusdc')
  })

  test('faucets 50 tUSDC when the balance is below 50', async () => {
    const setup = deps({
      getBalances: async () => ({ stt: parseEther('4'), tusdc: parseUnits('12', 6) }),
    })

    await collect((onStatus) => runTradeSetup(setup, onStatus))

    expect(setup.calls.filter((call) => call.startsWith('faucet'))).toEqual([`faucet:tUSDC:${address}`])
  })

  test('faucets both assets when both balances are low', async () => {
    const setup = deps({
      getBalances: async () => ({ stt: 0n, tusdc: 0n }),
    })

    const { statuses } = await collect((onStatus) => runTradeSetup(setup, onStatus))

    expect(setup.calls.filter((call) => call.startsWith('faucet'))).toEqual([
      `faucet:STT:${address}`,
      `faucet:tUSDC:${address}`,
    ])
    expect(statuses.find((status) => status.step === 'funding_stt')?.detail).toBe(
      '0 STT is below 2 STT. Sending 2 STT from the faucet.',
    )
  })

  test('surfaces a connect failure without creating a wallet', async () => {
    const setup = deps({
      connect: async () => {
        throw new Error('Sign-in was cancelled.')
      },
    })

    await expect(runTradeSetup(setup, () => {})).rejects.toThrow('Could not connect to Privy. Sign-in was cancelled.')
    expect(setup.calls).toEqual([])
  })
})
