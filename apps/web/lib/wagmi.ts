import { createConfig } from '@privy-io/wagmi'
import { somniaTestnet } from 'viem/chains'
import { http } from 'wagmi'

export const config = createConfig({
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http(),
  },
})
