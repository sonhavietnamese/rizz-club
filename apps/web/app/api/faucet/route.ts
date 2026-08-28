import { env } from '@/env'
import { publicClient } from '@/lib/viem'
import { somniaShannon } from '@somnia-chain/markets-sdk/chains'
import { createWalletClient, http, isAddress, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { z } from 'zod'

export const runtime = 'nodejs'

const faucetAmount = parseEther('1')

const faucetBodySchema = z
  .object({
    address: z.string().optional(),
    requester: z.string().optional(),
    requesterAddress: z.string().optional(),
  })
  .transform((body) => body.address ?? body.requester ?? body.requesterAddress)
  .pipe(
    z.string().refine((address) => isAddress(address), {
      message: 'Requester address must be a valid EVM address',
    })
  )

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parseResult = faucetBodySchema.safeParse(body)

  if (!parseResult.success) {
    return Response.json(
      {
        error: 'Validation failed',
        details: parseResult.error.flatten().formErrors,
      },
      { status: 400 }
    )
  }

  const requester = parseResult.data
  const admin = privateKeyToAccount(env.SOMNIA_PRIVATE_KEY as `0x${string}`)
  const walletClient = createWalletClient({
    account: admin,
    chain: somniaShannon,
    transport: http(),
  })

  try {
    const hash = await walletClient.sendTransaction({
      to: requester,
      value: faucetAmount,
    })
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    return Response.json({
      hash,
      requester,
      amount: '1',
      symbol: 'STT',
      chainId: somniaShannon.id,
      status: receipt.status,
    })
  } catch (error) {
    console.error('Faucet transfer failed:', error)

    return Response.json(
      {
        error: 'Faucet transfer failed',
        details: errorMessage(error),
        requester,
      },
      { status: 500 }
    )
  }
}
