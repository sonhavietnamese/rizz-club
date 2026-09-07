import { SOMNIA_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk'
import { somniaShannon } from '@somnia-chain/markets-sdk/chains'
import { createPublicClient, createWalletClient, http, parseAbi, type Account } from 'viem'

export const chain = somniaShannon

export const tusdcAddress = (SOMNIA_TESTNET_ADDRESSES.testUsdc ??
  '0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E') as `0x${string}`

export const tusdcAbi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function faucet(uint256 amount)',
  'function transfer(address to, uint256 amount) returns (bool)',
])

export const publicClient = createPublicClient({
  chain,
  transport: http(),
})

export function createSignerClient(account: Account) {
  return createWalletClient({
    account,
    chain,
    transport: http(),
  })
}
