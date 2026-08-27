import { createPublicClient, http } from 'viem'
import { somniaTestnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
})
