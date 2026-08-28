import privy, { authorizationContext } from '@/lib/privy'
import { createDreamDexExchange } from '@/lib/dreamdex'
import { requirePrivyEthereumWallet, TradingApiError } from '@/app/api/privy-auth'
import { createViemAccount } from '@privy-io/node/viem'
import { ORDER_TYPE, quoteBinaryStakeOverBook, type BinaryBuySide, type PlaceOrderResult } from '@somnia-chain/markets-sdk'
import { formatUnits, parseUnits, type Hex } from 'viem'
import { z } from 'zod'

export const runtime = 'nodejs'

const placePositionBodySchema = z.object({
  wallet_id: z.string().min(1),
  market_id: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  market_symbol: z.string().min(1).optional(),
  tradable: z.string().min(1).optional(),
  outcome: z.enum(['YES', 'NO']),
  amount: z.coerce.number().positive(),
  slippage_percent: z.coerce.number().min(0).max(50).default(2),
})

function createPositionDebugTimer() {
  const id = Math.random().toString(36).slice(2, 10)
  const startedAt = Date.now()
  const steps: { step: number; label: string; durationMs: number; elapsedMs: number }[] = []
  let step = 0

  async function wait<T>(label: string, promise: Promise<T>) {
    const currentStep = ++step
    const stepStartedAt = Date.now()
    const elapsedMs = stepStartedAt - startedAt

    console.info(`[trade-position-api:${id}] #${currentStep} ${label} start`, {
      elapsedMs,
    })

    try {
      const value = await promise
      const durationMs = Date.now() - stepStartedAt
      const totalElapsedMs = Date.now() - startedAt

      steps.push({ step: currentStep, label, durationMs, elapsedMs: totalElapsedMs })
      console.info(`[trade-position-api:${id}] #${currentStep} ${label} done`, {
        durationMs,
        elapsedMs: totalElapsedMs,
      })

      return value
    } catch (error) {
      const durationMs = Date.now() - stepStartedAt
      const totalElapsedMs = Date.now() - startedAt

      console.error(`[trade-position-api:${id}] #${currentStep} ${label} failed`, {
        durationMs,
        elapsedMs: totalElapsedMs,
        error: errorMessage(error),
      })
      throw error
    }
  }

  function summary() {
    return {
      id,
      elapsedMs: Date.now() - startedAt,
      steps,
    }
  }

  return { wait, summary }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

function binarySideForOutcome(outcome: 'YES' | 'NO'): BinaryBuySide {
  return outcome === 'YES' ? 'BUY_YES' : 'BUY_NO'
}

function humanAmount(raw: bigint, decimals: number) {
  return Number(formatUnits(raw, decimals))
}

function orderResponse(order: PlaceOrderResult, quantity: bigint, decimals: number, symbol: string, price: number) {
  const filledRaw = order.fills.reduce((total, fill) => total + fill.quantityFilled, BigInt(0))
  const filled = humanAmount(filledRaw, decimals)
  const amount = humanAmount(quantity, decimals)
  const remaining = Math.max(0, amount - filled)

  return {
    id: order.orderId?.toString(),
    symbol,
    type: 'market',
    side: 'buy',
    price,
    amount,
    filled,
    remaining,
    status: filled > 0 ? 'closed' : 'canceled',
    txHash: order.hash,
    timestamp: Date.now(),
    datetime: new Date().toISOString(),
  } as const
}

export async function POST(request: Request) {
  const timer = createPositionDebugTimer()
  const body = await timer.wait('request.json', request.json().catch(() => null))
  const parseResult = placePositionBodySchema.safeParse(body)

  if (!parseResult.success) {
    console.info(`[trade-position-api:${timer.summary().id}] validation failed`, timer.summary())
    return Response.json(
      {
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
        debug: timer.summary(),
      },
      { status: 400 }
    )
  }

  const {
    wallet_id: walletId,
    market_id: marketId,
    market_symbol: marketSymbol,
    tradable,
    outcome,
    amount,
    slippage_percent: slippagePercent,
  } = parseResult.data

  let exchange: ReturnType<typeof createDreamDexExchange> | null = null

  try {
    exchange = createDreamDexExchange()
    const authPromise = timer.wait('requirePrivyEthereumWallet', requirePrivyEthereumWallet(request, walletId))
    const onchainPromise = timer.wait(
      'exchange.client.getMarketOnchain',
      exchange.client.getMarketOnchain(marketId as Hex)
    )
    const [{ wallet }, onchain] = await Promise.all([authPromise, onchainPromise])

    const account = createViemAccount(privy, {
      walletId,
      address: wallet.address as `0x${string}`,
      authorizationContext,
    })

    exchange.setSigner({ account })

    if (onchain.status !== 1) {
      console.info(`[trade-position-api:${timer.summary().id}] market not trading`, {
        marketId,
        marketSymbol,
        onchainStatus: onchain.status,
        ...timer.summary(),
      })
      return Response.json(
        {
          error: 'This market is not trading on-chain anymore',
          marketId,
          marketSymbol,
          onchainStatus: onchain.status,
          debug: timer.summary(),
        },
        { status: 400 }
      )
    }

    const bookPromise = timer.wait(
      'exchange.client.getBinaryOrderBook',
      exchange.client.getBinaryOrderBook(onchain.pool, { depth: 10, decimals: onchain.decimals })
    )
    const bookParamsPromise = timer.wait(
      'exchange.client.getBinaryBookParams',
      exchange.client.getBinaryBookParams(onchain.pool)
    )
    const [book, bookParams] = await Promise.all([bookPromise, bookParamsPromise])

    const binarySide = binarySideForOutcome(outcome)
    const stake = parseUnits(String(amount), onchain.decimals)
    const slippageBps = BigInt(Math.round(slippagePercent * 100))
    const oneCollateral = BigInt(10) ** BigInt(onchain.decimals)
    const quote = quoteBinaryStakeOverBook(book, binarySide, stake, oneCollateral, {
      ...bookParams,
      slippageBps,
    })

    if (!quote) {
      console.info(`[trade-position-api:${timer.summary().id}] no fillable quote`, {
        marketId,
        marketSymbol,
        outcome,
        ...timer.summary(),
      })
      return Response.json(
        {
          error: `No fillable ${outcome} ask liquidity is available for this amount`,
          marketId,
          marketSymbol,
          tradable,
          debug: timer.summary(),
        },
        { status: 400 }
      )
    }

    const order = await timer.wait(
      'exchange.trader.placeOrder',
      exchange.trader.placeOrder({
        pool: onchain.pool,
        side: quote.side,
        price: quote.yesPrice,
        quantity: quote.quantity,
        outcomeToken: onchain.outcomeToken,
        yesId: onchain.yesId,
        noId: onchain.noId,
        collateral: onchain.collateral,
        expireTimestampNs: onchain.expiry * BigInt(1_000_000_000),
        orderType: ORDER_TYPE.MARKET,
      })
    )

    console.info(`[trade-position-api:${timer.summary().id}] complete`, timer.summary())

    return Response.json({
      walletId,
      address: wallet.address,
      marketId,
      marketSymbol,
      outcome,
      tradable,
      bestAsk: humanAmount(outcome === 'YES' ? (book.yesAsks[0]?.price ?? BigInt(0)) : (book.noAsks[0]?.price ?? BigInt(0)), onchain.decimals),
      slippage: slippagePercent / 100,
      quote: {
        limitPrice: formatUnits(quote.limitPrice, onchain.decimals),
        quantity: formatUnits(quote.quantity, onchain.decimals),
        escrow: formatUnits(quote.escrow, onchain.decimals),
      },
      order: orderResponse(
        order,
        quote.quantity,
        onchain.decimals,
        tradable ?? `${marketId}#${outcome}`,
        humanAmount(quote.limitPrice, onchain.decimals)
      ),
      debug: timer.summary(),
    })
  } catch (error) {
    console.error('Place DreamDex position failed:', {
      error,
      debug: timer.summary(),
    })

    if (error instanceof TradingApiError) {
      return Response.json(
        {
          error: error.message,
          ...error.context,
          marketSymbol,
          outcome,
          debug: timer.summary(),
        },
        { status: error.status }
      )
    }

    return Response.json(
      {
        error: 'Place DreamDex position failed',
        details: errorMessage(error),
        walletId,
        marketSymbol,
        outcome,
        debug: timer.summary(),
      },
      { status: 500 }
    )
  } finally {
    if (exchange) {
      await timer.wait('exchange.close', exchange.close())
    }
  }
}
