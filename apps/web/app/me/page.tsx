'use client'

import {
  usePrivy,
  useSigners,
  useUser,
  type LinkedAccountWithMetadata,
  type User,
  type WalletWithMetadata,
} from '@privy-io/react-auth'
import { env } from '@/env'
import { SOMNIA_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { formatUnits, isAddress, parseAbi, zeroAddress } from 'viem'
import { useBalance, useReadContract } from 'wagmi'

type FaucetAsset = 'STT' | 'tUSDC'

type SignTestResult = {
  walletId: string
  address?: string
  message?: string
  signature?: string
  verified?: boolean
  serverSignEnabled: boolean
  error?: string
  details?: string
}

type FaucetResult = {
  hash?: string
  mintHash?: string
  requester?: string
  token?: string
  amount?: string
  symbol?: string
  status?: string
  error?: string
  details?: string | string[]
}

function valueFrom(account: LinkedAccountWithMetadata, key: string) {
  const value = (account as unknown as Record<string, unknown>)[key]

  return typeof value === 'string' && value.length > 0 ? value : null
}

function formatAddress(address?: string | null) {
  if (!address) return 'Not connected'

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(value: User['createdAt']) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatTokenAmount(value?: string) {
  if (!value) return '0'

  const [whole, fraction = ''] = value.split('.')
  const trimmedFraction = fraction.slice(0, 4).replace(/0+$/, '')

  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole
}

function faucetErrorMessage(result: FaucetResult) {
  if (Array.isArray(result.details) && result.details.length > 0) {
    return result.details.join(', ')
  }

  if (typeof result.details === 'string') {
    return result.details
  }

  return result.error ?? 'Faucet request failed'
}

const testUsdcAddress = SOMNIA_TESTNET_ADDRESSES.testUsdc as Address
const erc20BalanceAbi = parseAbi(['function balanceOf(address account) view returns (uint256)'])

function getDisplayName(user: User) {
  return (
    user.google?.name ??
    user.discord?.username ??
    user.email?.address ??
    formatAddress(user.wallet?.address) ??
    'Player'
  )
}

function getAccountTitle(account: LinkedAccountWithMetadata) {
  return account.type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getAccountDetail(account: LinkedAccountWithMetadata) {
  return (
    valueFrom(account, 'address') ??
    valueFrom(account, 'email') ??
    valueFrom(account, 'username') ??
    valueFrom(account, 'name') ??
    valueFrom(account, 'number') ??
    valueFrom(account, 'subject') ??
    'Linked'
  )
}

function isServerSignableWallet(account: LinkedAccountWithMetadata): account is WalletWithMetadata {
  return (
    account.type === 'wallet' &&
    account.chainType === 'ethereum' &&
    (account.walletClientType === 'privy' || account.walletClientType === 'privy-v2')
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md bg-[#F7E0B8] px-4 py-3 text-[#3C1F11]">
      <dt className="text-xs uppercase tracking-wider opacity-70">{label}</dt>
      <dd className="break-all text-sm font-semibold">{value}</dd>
    </div>
  )
}

export default function MePage() {
  const router = useRouter()
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy()
  const { refreshUser } = useUser()
  const { addSigners } = useSigners()
  const primaryWalletAddress =
    user?.wallet?.address && isAddress(user.wallet.address) ? (user.wallet.address as Address) : undefined
  const {
    data: balance,
    isLoading: isBalanceLoading,
    isFetching: isBalanceFetching,
    refetch: refetchBalance,
  } = useBalance({
    address: primaryWalletAddress,
    query: {
      enabled: Boolean(primaryWalletAddress),
    },
  })
  const {
    data: tusdcBalance,
    isLoading: isTusdcBalanceLoading,
    isFetching: isTusdcBalanceFetching,
    refetch: refetchTusdcBalance,
  } = useReadContract({
    address: testUsdcAddress,
    abi: erc20BalanceAbi,
    functionName: 'balanceOf',
    args: [primaryWalletAddress ?? zeroAddress],
    query: {
      enabled: Boolean(primaryWalletAddress),
    },
  })
  const [isSigning, setIsSigning] = useState(false)
  const [signResult, setSignResult] = useState<SignTestResult | null>(null)
  const [signError, setSignError] = useState<string | null>(null)
  const [claimingFaucetAsset, setClaimingFaucetAsset] = useState<FaucetAsset | null>(null)
  const [faucetResult, setFaucetResult] = useState<FaucetResult | null>(null)
  const [faucetError, setFaucetError] = useState<string | null>(null)
  const [delegateMessage, setDelegateMessage] = useState<string | null>(null)
  const [delegateError, setDelegateError] = useState<string | null>(null)

  console.log(user)

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace('/')
    }
  }, [authenticated, ready, router])

  if (!ready || !authenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#87B9D6] px-6 text-[#3C1F11]">
        <p className="rounded-md bg-[#F7E0B8] px-5 py-4 text-sm font-semibold shadow-[0_6px_0_#673818]">
          Loading player profile...
        </p>
      </main>
    )
  }

  const linkedAccounts = user.linkedAccounts ?? []
  const userId = user.id
  const primaryWallet = user.wallet?.address
  const serverWalletId = user.wallet?.id ?? null
  const embeddedWallet = linkedAccounts.find(isServerSignableWallet)
  const hasServerSigner = Boolean(serverWalletId)
  const balanceLabel = primaryWalletAddress
    ? balance
      ? `${formatTokenAmount(formatUnits(balance.value, balance.decimals))} ${balance.symbol}`
      : isBalanceLoading
        ? 'Loading...'
        : 'Unavailable'
    : 'No wallet'
  const tusdcBalanceLabel = primaryWalletAddress
    ? typeof tusdcBalance === 'bigint'
      ? `${formatTokenAmount(formatUnits(tusdcBalance, 6))} tUSDC`
      : isTusdcBalanceLoading
        ? 'Loading...'
        : 'Unavailable'
    : 'No wallet'

  async function handleDelegateWallet() {
    if (!embeddedWallet) {
      setDelegateMessage(null)
      setDelegateError('No Privy embedded Ethereum wallet found for server signing.')
      return
    }

    try {
      setDelegateError(null)
      setDelegateMessage(null)

      await addSigners({
        address: embeddedWallet.address,
        signers: [{ signerId: env.NEXT_PUBLIC_AUTHORIZATION_ID }],
      })
      await refreshUser()

      setSignResult(null)
      setSignError(null)
      setDelegateMessage('Server signer provisioned successfully. Server signing is ready to test.')
    } catch (error) {
      setDelegateError(error instanceof Error ? error.message : 'Failed to provision server signer.')
    }
  }

  async function handleFaucetClaim(asset: FaucetAsset) {
    if (!primaryWalletAddress) {
      setFaucetResult(null)
      setFaucetError('No valid wallet address found.')
      return
    }

    try {
      setClaimingFaucetAsset(asset)
      setFaucetError(null)
      setFaucetResult(null)

      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: primaryWalletAddress,
          asset,
        }),
      })
      const result = (await response.json().catch(() => ({}))) as FaucetResult

      if (!response.ok) {
        throw new Error(faucetErrorMessage(result))
      }

      setFaucetResult(result)
      if (asset === 'STT') {
        await refetchBalance()
      } else {
        await refetchTusdcBalance()
      }
    } catch (error) {
      setFaucetError(error instanceof Error ? error.message : 'Faucet request failed')
    } finally {
      setClaimingFaucetAsset(null)
    }
  }

  async function handleServerSignTest() {
    if (!serverWalletId) {
      setSignResult(null)
      setSignError('No server wallet id found for this wallet.')
      return
    }

    try {
      setIsSigning(true)
      setSignError(null)
      setSignResult(null)
      const accessToken = await getAccessToken()

      if (!accessToken) {
        throw new Error('Privy session expired. Please sign in again.')
      }

      const response = await fetch('/api/wallet/sign', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_id: serverWalletId,
          message: `Rizz Club server-sign test for ${userId}`,
        }),
      })

      const result = (await response.json()) as SignTestResult

      if (!response.ok) {
        throw new Error(result.details ?? result.error ?? 'Server sign test failed')
      }

      setSignResult(result)
    } catch (error) {
      setSignError(error instanceof Error ? error.message : 'Server sign test failed')
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#87B9D6] px-5 py-8 text-[#3C1F11]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-md bg-[#ECD19C] p-5 shadow-[0_8px_0_#673818] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-[#90B64F] text-3xl font-black text-white shadow-[0_4px_0_#3C1F11]">
              {getDisplayName(user).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Player Profile</p>
              <h1 className="text-3xl font-black">{getDisplayName(user)}</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push('/trading')}
              className="h-11 rounded-md bg-[#389591] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#236461] transition active:translate-y-1 active:shadow-none"
            >
              Trading
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="h-11 rounded-md bg-[#D6503C] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#8A2D25] transition active:translate-y-1 active:shadow-none"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          <DetailRow label="Privy ID" value={user.id} />
          <DetailRow label="Primary Wallet" value={formatAddress(primaryWallet)} />
          <DetailRow label="STT Balance" value={balanceLabel} />
          <DetailRow label="tUSDC Balance" value={tusdcBalanceLabel} />
          <DetailRow label="Joined" value={formatDate(user.createdAt)} />
        </section>

        <section className="rounded-md bg-[#ECD19C] p-5 shadow-[0_8px_0_#673818]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Wallet</p>
              <h2 className="text-2xl font-black">Server Sign Test</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold opacity-75">
                {serverWalletId
                  ? `Server wallet id: ${serverWalletId}`
                  : 'This wallet does not expose a server wallet id in the current session.'}
              </p>
              <p className="mt-1 max-w-2xl text-sm font-semibold opacity-75">
                Server signer status:{' '}
                {embeddedWallet ? (hasServerSigner ? 'Provisioned' : 'Not provisioned') : 'No embedded wallet'}
              </p>
              <p className="mt-1 max-w-2xl text-sm font-semibold opacity-75">
                STT balance: {balanceLabel}
                {isBalanceFetching && !isBalanceLoading ? ' (refreshing...)' : ''}
              </p>
              <p className="mt-1 max-w-2xl text-sm font-semibold opacity-75">
                tUSDC balance: {tusdcBalanceLabel}
                {isTusdcBalanceFetching && !isTusdcBalanceLoading ? ' (refreshing...)' : ''}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void handleFaucetClaim('STT')}
                disabled={!primaryWalletAddress || Boolean(claimingFaucetAsset)}
                className="h-11 rounded-md bg-[#D9903D] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#9B5A21] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
              >
                {claimingFaucetAsset === 'STT' ? 'Claiming...' : 'Faucet STT'}
              </button>

              <button
                type="button"
                onClick={() => void handleFaucetClaim('tUSDC')}
                disabled={!primaryWalletAddress || Boolean(claimingFaucetAsset)}
                className="h-11 rounded-md bg-[#D9903D] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#9B5A21] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
              >
                {claimingFaucetAsset === 'tUSDC' ? 'Claiming...' : 'Faucet tUSDC'}
              </button>

              <button
                type="button"
                onClick={() => void handleDelegateWallet()}
                className="h-11 rounded-md bg-[#90B64F] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#5F7F35] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
              >
                Delegate
              </button>

              <button
                type="button"
                onClick={() => void handleServerSignTest()}
                disabled={!serverWalletId || isSigning}
                className="h-11 rounded-md bg-[#389591] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#236461] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSigning ? 'Signing...' : 'Test Server Sign'}
              </button>
            </div>
          </div>

          {delegateMessage && (
            <p className="mt-4 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold text-[#3C1F11]">
              {delegateMessage}
            </p>
          )}

          {delegateError && (
            <p className="mt-4 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold text-[#8A2D25]">
              {delegateError}
            </p>
          )}

          {faucetError && (
            <p className="mt-4 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold text-[#8A2D25]">
              {faucetError}
            </p>
          )}

          {faucetResult?.hash && (
            <div className="mt-4 grid gap-3 rounded-md bg-[#F7E0B8] p-4 text-sm">
              <DetailRow
                label="Faucet"
                value={`Sent ${faucetResult.amount ?? '1'} ${faucetResult.symbol ?? 'STT'}`}
              />
              <DetailRow label="Transaction" value={faucetResult.hash} />
              {faucetResult.mintHash && <DetailRow label="Mint Transaction" value={faucetResult.mintHash} />}
              <DetailRow label="Status" value={faucetResult.status ?? 'Submitted'} />
            </div>
          )}

          {signError && (
            <p className="mt-4 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold text-[#8A2D25]">{signError}</p>
          )}

          {signResult && (
            <div className="mt-4 grid gap-3 rounded-md bg-[#F7E0B8] p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black">Status:</span>
                <span
                  className={
                    signResult.serverSignEnabled
                      ? 'rounded-md bg-[#90B64F] px-2 py-1 font-black text-white'
                      : 'rounded-md bg-[#D6503C] px-2 py-1 font-black text-white'
                  }
                >
                  {signResult.serverSignEnabled ? 'Enabled' : 'Failed'}
                </span>
              </div>
              {signResult.address && <DetailRow label="Signed Address" value={signResult.address} />}
              {signResult.message && <DetailRow label="Message" value={signResult.message} />}
              {signResult.signature && <DetailRow label="Signature" value={signResult.signature} />}
              <DetailRow label="Verified" value={signResult.verified ? 'Yes' : 'No'} />
            </div>
          )}
        </section>

        <section className="rounded-md bg-[#ECD19C] p-5 shadow-[0_8px_0_#673818]">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-70">Accounts</p>
              <h2 className="text-2xl font-black">Linked Login Methods</h2>
            </div>
            <span className="rounded-md bg-[#389591] px-3 py-1 text-sm font-black text-white">
              {linkedAccounts.length}
            </span>
          </div>

          {linkedAccounts.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {linkedAccounts.map((account, index) => (
                <li
                  key={`${account.type}-${index}`}
                  className="rounded-md bg-[#F7E0B8] px-4 py-3 shadow-[0_3px_0_#B87545]"
                >
                  <p className="text-sm font-black">{getAccountTitle(account)}</p>
                  <p className="mt-1 break-all text-sm opacity-75">{getAccountDetail(account)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold">
              No linked accounts found for this session.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
