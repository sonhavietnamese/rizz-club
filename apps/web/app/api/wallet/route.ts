import privy from '@/lib/privy'
import { AuthorizationContext } from '@privy-io/node'

import { somniaTestnet } from 'viem/chains'

export async function POST(request: Request) {
  const { wallet_id } = await request.json()

  const wallet = await privy.wallets().get(wallet_id)

  if (!wallet) {
    return new Response('Wallet not found', { status: 404 })
  }

  const authorizationContext: AuthorizationContext = {
    authorization_private_keys: [process.env.AUTHORIZATION_PRIVATE_KEY!],
  }
  const caip2 = `eip155:${somniaTestnet.id}`
  const response = await privy
    .wallets()
    .ethereum()
    .sendTransaction(wallet_id, {
      caip2,
      params: {
        transaction: {
          to: '0x06f662De250608D954b3bf0Dcf8D15dd74a6E1b3',
          value: '0x100000000000000',
          chain_id: somniaTestnet.id,
        },
      },
      authorization_context: authorizationContext,
    })

  return new Response(response.hash, { status: 200 })
}
